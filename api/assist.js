// Vercel serverless function: runs one AI Task Hub tool with Claude and streams the answer back.
// The browser sends { tool, text, files, code }. Prompts live server-side in _amrissa-tools.js,
// and the Anthropic API key stays in Vercel env vars (ANTHROPIC_API_KEY).

import Anthropic from '@anthropic-ai/sdk';
import { AMRISSA_TOOLS, TOOL_BY_ID } from './_amrissa-tools.js';

const MAX_BYTES = 4_300_000; // Vercel request body limit is 4.5 MB
const MAX_TEXT = 60_000;
const MAX_FILES = 5;
const FILE_TYPES = {
  'application/pdf': 'document',
  'image/png': 'image', 'image/jpeg': 'image', 'image/webp': 'image', 'image/gif': 'image',
  'text/plain': 'text', 'text/csv': 'text',
};

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

async function readBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') return JSON.parse(req.body);
    if (Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString('utf8'));
    return req.body;
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BYTES) throw Object.assign(new Error('too large'), { status: 413 });
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

// Turn uploaded files into Claude content blocks (PDF as document, images as image, text inline).
function fileBlocks(files) {
  const blocks = [];
  for (const f of (Array.isArray(files) ? files : []).slice(0, MAX_FILES)) {
    const type = FILE_TYPES[f && f.type];
    const data = typeof f?.data === 'string' ? f.data.replace(/\s/g, '') : '';
    if (!type || !data || !/^[A-Za-z0-9+/=]+$/.test(data)) continue;
    const name = str(f.name, 120) || 'file';
    if (type === 'document') {
      blocks.push({ type: 'document', title: name, source: { type: 'base64', media_type: 'application/pdf', data } });
    } else if (type === 'image') {
      blocks.push({ type: 'image', source: { type: 'base64', media_type: f.type, data } });
    } else {
      const text = Buffer.from(data, 'base64').toString('utf8').slice(0, MAX_TEXT);
      blocks.push({ type: 'text', text: `File "${name}":\n${text}` });
    }
  }
  return blocks;
}

const fail = (res, status, error) => res.status(status).json({ ok: false, error });

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  // GET lists the tools for the page (names and hints only, never the prompts).
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      needsCode: Boolean(process.env.HUB_ACCESS_CODE),
      connected: Boolean(process.env.ANTHROPIC_API_KEY),
      tools: AMRISSA_TOOLS.map(({ id, group, name, description, give, files }) => ({ id, group, name, description, give, files })),
    });
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return fail(res, 405, 'Method not allowed.');
  }
  if (Number(req.headers['content-length'] || 0) > MAX_BYTES) return fail(res, 413, 'Files are too large. Keep uploads under 3 MB in total.');

  let body;
  try {
    body = await readBody(req);
  } catch (err) {
    return fail(res, err.status || 400, err.status === 413 ? 'Files are too large. Keep uploads under 3 MB in total.' : 'Invalid request.');
  }

  // Simple shared access code so the public URL can't spend the company's AI budget.
  const code = process.env.HUB_ACCESS_CODE;
  if (code && str(body.code, 200) !== code) return fail(res, 401, 'Enter the team access code to use the AI tools.');

  const tool = TOOL_BY_ID[str(body.tool, 60)];
  if (!tool) return fail(res, 400, 'Unknown tool.');

  const text = str(body.text, MAX_TEXT);
  const files = fileBlocks(body.files);
  if (!text && !files.length) return fail(res, 422, 'Paste some details or attach a file first.');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[assist] ANTHROPIC_API_KEY is not set');
    return fail(res, 503, 'The AI is not connected yet. Ask Miguel to add the Anthropic API key in Vercel.');
  }

  const today = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date());

  const client = new Anthropic();
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' });

  try {
    const stream = client.beta.messages.stream({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      output_config: { effort: 'medium' },
      // On a safety decline, the API retries on a fallback model in the same call.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: [{ type: 'text', text: tool.system, cache_control: { type: 'ephemeral' } }],
      messages: [{
        role: 'user',
        content: [...files, { type: 'text', text: `Today's date: ${today} (Pacific Time).\n\n${text || '(See the attached files.)'}` }],
      }],
    });
    stream.on('text', (t) => res.write(t));
    const final = await stream.finalMessage();
    if (final.stop_reason === 'refusal') res.write('\n\n[The AI could not complete this request. Try rewording it or leaving out sensitive details.]');
    else if (final.stop_reason === 'max_tokens') res.write('\n\n[The answer was cut off because it was too long. Try a smaller input.]');
    res.end();
  } catch (err) {
    console.error('[assist] Claude request failed', err?.status, err?.message);
    let msg = 'Something went wrong. Please try again in a minute.';
    if (err instanceof Anthropic.RateLimitError) msg = 'The AI is busy right now. Please try again in a minute.';
    else if (err instanceof Anthropic.AuthenticationError) msg = 'The AI key is not valid. Please let Miguel know.';
    else if (err instanceof Anthropic.BadRequestError) msg = 'The AI could not read this input. Try a smaller file or plain text.';
    res.end(`\n\n[${msg}]`);
  }
}
