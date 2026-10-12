// Vercel serverless function: Slack Events API endpoint for the Club Wealth Assistant bot.
// Slack calls this when someone @mentions the bot. We check the request really came from
// Slack (signing secret), then start the Claude routine that writes and posts the reply.
//
// Vercel env vars:
//   SLACK_SIGNING_SECRET   Slack app > Basic Information > App Credentials > Signing Secret
//   CLAUDE_ROUTINE_TOKEN   claude.ai routine "Club Wealth Assistant → replies to @mentions" > API token
//   CLAUDE_ROUTINE_ID      optional; defaults to that routine's id below
//   SLACK_ALLOWED_CHANNELS optional comma-separated channel ids; default: every channel the bot is in

import crypto from 'node:crypto';

const DEFAULT_ROUTINE_ID = 'trig_01NxEicTyZLjRL6bSNr9mF8Z';
const MAX_BYTES = 1_000_000;
const MAX_TEXT = 4000;

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

async function fireRoutine(text) {
  const id = process.env.CLAUDE_ROUTINE_ID || DEFAULT_ROUTINE_ID;
  const res = await fetch(`https://api.anthropic.com/v1/claude_code/routines/${id}/fire`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.CLAUDE_ROUTINE_TOKEN}`,
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
  // Slack only sends app_mention events from channels the bot was invited to.
  const channels = (process.env.SLACK_ALLOWED_CHANNELS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const relevant = body.type === 'event_callback' && ev.type === 'app_mention'
    && !ev.bot_id && ev.user && ev.channel && (!channels.length || channels.includes(ev.channel));
  if (!relevant) return res.status(200).json({ ok: true, skipped: 'ignored event' });

  try {
    await fireRoutine(eventText(ev));
  } catch (e) {
    console.error('slack-events:', e.message);
  }
  return res.status(200).json({ ok: true });
}
