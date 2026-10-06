// Vercel serverless function: validates a workflow-intake submission and
// relays it to the Google Apps Script web app that writes it into Sheets.
// The Apps Script URL and shared secret stay server-side (env vars).

import { randomUUID } from 'node:crypto';

const MAX_BYTES = 200_000;
const MAX_TEXT = 5_000;
const MAX_ITEMS = 60;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const str = (v, max = MAX_TEXT) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const list = (v) => (Array.isArray(v) ? v.slice(0, MAX_ITEMS) : []);
const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

function cleanFlow(tasks) {
  return list(tasks).map((t) => ({
    title: str(obj(t).title, 300),
    steps: list(obj(t).steps).map((s) => ({
      tool: str(obj(s).tool, 300),
      description: str(obj(s).description),
      outcomes: list(obj(s).outcomes).map((o) => ({
        label: str(obj(o).label, 500),
        result: str(obj(o).result, 1000),
      })).filter((o) => o.label || o.result),
    })).filter((s) => s.tool || s.description || s.outcomes.length),
  })).filter((t) => t.title || t.steps.length);
}

function cleanRows(rows, keys) {
  return list(rows).map((r) => {
    const out = {};
    keys.forEach((k) => { out[k] = str(obj(r)[k], 2000); });
    return out;
  }).filter((r) => Object.values(r).some(Boolean));
}

export function normalize(body) {
  const b = obj(body);
  const section = (k) => obj(b[k]);
  const tools = obj(b.tools);
  return {
    name: str(b.name, 200),
    email: str(b.email, 320).toLowerCase(),
    date: str(b.date, 20),
    tools: {
      web: list(tools.web).map((t) => str(t, 200)).filter(Boolean),
      apps: list(tools.apps).map((t) => str(t, 200)).filter(Boolean),
      spreadsheets: list(tools.spreadsheets).map((t) => str(t, 200)).filter(Boolean),
    },
    q2: { overview: str(section('q2').overview), tasks: cleanFlow(section('q2').tasks) },
    q3: { overview: str(section('q3').overview), rows: cleanRows(section('q3').rows, ['task', 'info', 'source', 'required']) },
    q4: { overview: str(section('q4').overview), rows: cleanRows(section('q4').rows, ['task', 'step', 'frequency', 'time']) },
    q5: { overview: str(section('q5').overview), rows: cleanRows(section('q5').rows, ['task', 'decision', 'info', 'aiPrepare']) },
    q6: { overview: str(section('q6').overview), rows: cleanRows(section('q6').rows, ['task', 'bottleneck', 'workaround', 'impact']) },
    q7: { overview: str(section('q7').overview), tasks: cleanFlow(section('q7').tasks) },
    platform: { choice: str(section('platform').choice, 200), reason: str(section('platform').reason) },
    acknowledged: str(b.acknowledged, 40).toUpperCase(),
  };
}

export function validate(d) {
  const errors = [];
  if (!d.name) errors.push('Name is required.');
  if (!EMAIL_RE.test(d.email)) errors.push('A valid email is required.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) errors.push('Date is required.');
  if (!d.q2.overview) errors.push('Question 2 (process walkthrough) is required.');
  if (!d.q2.tasks.some((t) => t.steps.length)) errors.push('Map at least one process step in question 2.');
  if (!d.platform.choice) errors.push('Choose your preferred AI Task Hub option.');
  if (d.acknowledged !== 'ACKNOWLEDGED') errors.push('Type ACKNOWLEDGED to confirm.');
  return errors;
}

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

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const declared = Number(req.headers['content-length'] || 0);
  if (declared > MAX_BYTES) return res.status(413).json({ ok: false, error: 'Submission is too large.' });

  let body;
  try {
    body = await readBody(req);
  } catch (err) {
    const status = err.status || 400;
    return res.status(status).json({ ok: false, error: status === 413 ? 'Submission is too large.' : 'Invalid submission format.' });
  }

  // Honeypot: bots fill hidden fields. Pretend success, store nothing.
  if (str(obj(body).website)) return res.status(200).json({ ok: true, submissionId: randomUUID().slice(0, 8).toUpperCase() });

  const data = normalize(body);
  const errors = validate(data);
  if (errors.length) return res.status(422).json({ ok: false, error: errors[0], errors });

  const url = process.env.SHEETS_WEBHOOK_URL;
  const secret = process.env.SHEETS_WEBHOOK_SECRET;
  if (!url || !secret) {
    console.error('[submit] SHEETS_WEBHOOK_URL or SHEETS_WEBHOOK_SECRET is not set');
    return res.status(500).json({ ok: false, error: 'The form is not connected to its spreadsheet yet. Please let Miguel know.' });
  }

  const submissionId = `CW-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomUUID().slice(0, 6).toUpperCase()}`;
  const payload = {
    secret,
    submissionId,
    submittedAt: new Date().toISOString(),
    userAgent: str(req.headers['user-agent'], 300),
    data,
  };

  try {
    // Apps Script answers POST with a 302 to googleusercontent.com; fetch follows it.
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      signal: AbortSignal.timeout(25_000),
    });
    const text = await upstream.text();
    let out;
    try { out = JSON.parse(text); } catch { out = null; }
    if (!upstream.ok || !out || out.ok !== true) {
      console.error('[submit] Sheets relay failed', upstream.status, text.slice(0, 500));
      return res.status(502).json({ ok: false, error: 'We could not save your form right now. Please try again in a minute.' });
    }
    return res.status(200).json({ ok: true, submissionId });
  } catch (err) {
    console.error('[submit] Sheets relay error', err);
    return res.status(502).json({ ok: false, error: 'We could not reach the spreadsheet. Please try again in a minute.' });
  }
}
