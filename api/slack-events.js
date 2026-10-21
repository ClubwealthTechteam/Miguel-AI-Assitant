// Vercel serverless function: Slack Events API endpoint for the Club Wealth Assistant bot.
// Slack calls this when someone @mentions the bot, and for new posts in the forms channel
// (FORMS_CHANNEL). We check the request really came from Slack (signing secret), then
// start the Claude routine that handles it.
//
// Vercel env vars:
//   SLACK_SIGNING_SECRET   Slack app > Basic Information > App Credentials > Signing Secret
//   CLAUDE_ROUTINE_TOKEN   claude.ai routine "Club Wealth Assistant → replies to @mentions" > API token
//   CLAUDE_ROUTINE_ID      optional; defaults to that routine's id below
//   SLACK_ALLOWED_CHANNELS optional comma-separated channel ids; default: every channel the bot is in
//   FORMS_ROUTINE_TOKEN    claude.ai routine "Half-Day Event Forms → sheet + Keap check" > API token
//   FORMS_ROUTINE_ID       optional; defaults to that routine's id below

import crypto from 'node:crypto';

const DEFAULT_ROUTINE_ID = 'trig_01NxEicTyZLjRL6bSNr9mF8Z';
const MAX_BYTES = 1_000_000;
const MAX_TEXT = 4000;
const BOT_MENTION = '<@U0C8DNAJ82F>';
const ACROBAT = /acrobat\.adobe\.com\/(id\/urn:aaid|link\/)/i;
// #cw-halfday-event-forms-automation: a top-level forms PDF from Tara or Miguel starts the
// Half-Day Event Forms routine right away (its hourly run stays as the backup).
const FORMS_CHANNEL = { id: 'C0CAGLHJQAE', posters: ['U03JNPKQ2G2', 'U0C6BGGHY3C'] };
const DEFAULT_FORMS_ROUTINE_ID = 'trig_01FcH7xaGFM8euvCcku3ztta';
// Kathleen or Miguel saying "done" (a reply in a forms thread, or one new message covering
// several threads) starts the same routine's Keap check right away.
const DONE_SAYERS = ['U0AJFNKSSBY', 'U0C6BGGHY3C'];

async function readRaw(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BYTES) throw Object.assign(new Error('too large'), { status: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

// https://api.slack.com/authentication/verifying-requests-from-slack
export function validSignature(secret, timestamp, raw, signature) {
  if (!secret || !timestamp || !signature) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 60 * 5) return false; // replay guard
  const expected = 'v0=' + crypto.createHmac('sha256', secret).update(`v0:${timestamp}:${raw}`).digest('hex');
  const a = Buffer.from(expected), b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// The text handed to the routine. Slack text is user content: the routine treats it as data.
export function eventText(ev) {
  return [
    'Slack event (from the Club Wealth relay):',
    `channel: ${ev.channel}`,
    `message ts: ${ev.ts}`,
    `thread ts: ${ev.thread_ts || '(none: reply in a new thread under the message)'}`,
    `tagged by user: ${ev.user}`,
    'message text:',
    String(ev.text || '').slice(0, MAX_TEXT),
  ].join('\n');
}

const hasPdf = (ev) => (ev.files || []).some((f) => /pdf/i.test(`${f.mimetype || ''} ${f.filetype || ''}`));

// A new top-level post in the forms channel with an Acrobat link or a PDF, tagged or not.
export function isFormsChannelPost(ev) {
  return ev.type === 'message' && !ev.bot_id && ev.channel === FORMS_CHANNEL.id
    && FORMS_CHANNEL.posters.includes(ev.user) && (!ev.subtype || ev.subtype === 'file_share')
    && (!ev.thread_ts || ev.thread_ts === ev.ts) && (ACROBAT.test(String(ev.text || '')) || hasPdf(ev));
}

// "done" from Kathleen or Miguel: a thread reply that is just "done", or a top-level message containing it.
export function isFormsDone(ev) {
  if (ev.type !== 'message' || ev.bot_id || ev.subtype || ev.channel !== FORMS_CHANNEL.id || !DONE_SAYERS.includes(ev.user)) return false;
  const text = String(ev.text || '').trim();
  return ev.thread_ts && ev.thread_ts !== ev.ts ? /^done\W*$/i.test(text) : /\bdone\b/i.test(text);
}

async function fireRoutine(text, forms = false) {
  const id = forms ? process.env.FORMS_ROUTINE_ID || DEFAULT_FORMS_ROUTINE_ID : process.env.CLAUDE_ROUTINE_ID || DEFAULT_ROUTINE_ID;
  const token = forms ? process.env.FORMS_ROUTINE_TOKEN : process.env.CLAUDE_ROUTINE_TOKEN;
  if (!token) throw new Error(`no routine token for ${forms ? 'the forms routine' : 'the replies routine'}`);
  const res = await fetch(`https://api.anthropic.com/v1/claude_code/routines/${id}/fire`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'anthropic-beta': 'experimental-cc-routine-2026-04-01',
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ text }),
    signal: AbortSignal.timeout(2500), // Slack wants an answer within 3 seconds
  });
  if (!res.ok) throw new Error(`routine fire failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  let raw;
  try { raw = await readRaw(req); } catch (e) { return res.status(e.status || 400).json({ error: 'bad body' }); }

  const ok = validSignature(process.env.SLACK_SIGNING_SECRET, req.headers['x-slack-request-timestamp'], raw, req.headers['x-slack-signature']);
  if (!ok) return res.status(401).json({ error: 'bad signature' });

  let body;
  try { body = JSON.parse(raw); } catch { return res.status(400).json({ error: 'bad json' }); }

  // Slack's one-time check when the Request URL is saved.
  if (body.type === 'url_verification') return res.status(200).json({ challenge: body.challenge });

  // Slack re-sends events it thinks failed; the first delivery already started the routine.
  if (req.headers['x-slack-retry-num']) return res.status(200).json({ ok: true, skipped: 'retry' });

  const ev = body.event || {};
  // Forms PDF in the forms channel: the forms routine reads the channel itself, so it only
  // needs a nudge. A tag on the same post is left alone so the replies routine doesn't answer it.
  if (body.type === 'event_callback' && isFormsChannelPost(ev)) {
    try {
      await fireRoutine(`New forms post in #cw-halfday-event-forms-automation (message ts ${ev.ts}). Run now.`, true);
    } catch (e) {
      console.error('slack-events (forms channel):', e.message);
    }
    return res.status(200).json({ ok: true });
  }
  if (body.type === 'event_callback' && isFormsDone(ev)) {
    try {
      await fireRoutine(`Kathleen/Miguel said done in #cw-halfday-event-forms-automation (message ts ${ev.ts}${ev.thread_ts ? `, thread ${ev.thread_ts}` : ''}). Run now.`, true);
    } catch (e) {
      console.error('slack-events (forms done):', e.message);
    }
    return res.status(200).json({ ok: true });
  }
  if (body.type === 'event_callback' && ev.type === 'app_mention' && ev.channel === FORMS_CHANNEL.id
    && FORMS_CHANNEL.posters.includes(ev.user) && !ev.thread_ts && (ACROBAT.test(String(ev.text || '')) || hasPdf(ev))) {
    return res.status(200).json({ ok: true, skipped: 'forms post, handled by the message event' });
  }
  // Slack only sends app_mention events from channels the bot was invited to.
  const channels = (process.env.SLACK_ALLOWED_CHANNELS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const mention = body.type === 'event_callback' && ev.type === 'app_mention'
    && !ev.bot_id && ev.user && ev.channel && (!channels.length || channels.includes(ev.channel));
  if (!mention) return res.status(200).json({ ok: true, skipped: 'ignored event' });

  try {
    await fireRoutine(eventText(ev));
  } catch (e) {
    console.error('slack-events:', e.message);
  }
  return res.status(200).json({ ok: true });
}
