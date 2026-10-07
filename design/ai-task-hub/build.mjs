// Generates the AI Task Hub mockup screens as standalone HTML files, then screenshots them.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import cwuScreens from './cwu-screens.mjs';

const dir = path.dirname(new URL(import.meta.url).pathname);
const require = createRequire(import.meta.url);
const { chromium } = require(execSync('npm root -g').toString().trim() + '/playwright');

const P = {
  chat: 'M4 5h16v11H8l-4 4z', mail: 'M3 6h18v12H3z M3 7l9 6 9-6', card: 'M3 6h18v12H3z M3 10h18', cal: 'M4 6h16v14H4z M4 10h16 M8 3v5 M16 3v5',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c1-4 4-6 8-6s7 2 8 6', flag: 'M5 21V4 M5 4h11l-2 4 2 4H5', book: 'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z M5 17a3 3 0 0 1 3-3h11',
  grid: 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z', table: 'M3 5h18v14H3z M3 10h18 M9 10v9', mega: 'M3 11v3l12 5V6L3 11z M15 8a4 4 0 0 1 0 8', spark: 'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z',
  home: 'M3 11l9-7 9 7 M5 10v10h14V10', bell: 'M6 16V11a6 6 0 1 1 12 0v5l2 2H4z M10 20h4', check: 'M4 12l5 5 11-11', help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14 M12 17h.01',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19 12l2-1-2-4-2 1-2-1-1-2h-4l-1 2-2 1-2-1-2 4 2 1v0l-2 1 2 4 2-1 2 1 1 2h4l1-2 2-1 2 1 2-4z',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M21 21l-5-5', send: 'M4 12l16-8-6 16-3-7z', plus: 'M12 5v14 M5 12h14', clip: 'M15 7l-7 7a3 3 0 0 0 4 4l8-8a5 5 0 0 0-7-7l-8 8',
  phone: 'M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2z', code: 'M8 8l-4 4 4 4 M16 8l4 4-4 4', users: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M3 20c.6-3 3-5 6-5s5.4 2 6 5 M17 11a3 3 0 1 0 0-6 M21 20c-.4-2.4-2-4.2-4-4.8',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18', server: 'M4 4h16v6H4z M4 14h16v6H4z M8 7h.01 M8 17h.01', target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 12h.01',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M9 12l2 2 4-4', brief: 'M4 8h16v11H4z M9 8V5h6v3', min: 'M5 12h14', x: 'M6 6l12 12 M18 6L6 18', arrow: 'M5 12h14 M13 6l6 6-6 6', play: 'M7 5l12 7-12 7z', clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
};
const ic = (name, s = 18, w = 1.7) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${P[name].split(' M').map((d, i) => `<path d="${i ? 'M' : ''}${d}"/>`).join('')}</svg>`;
const botIc = (s = 24) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 4.6L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.9z"/><path d="M18.5 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg>`;

const page = (body) => `<!doctype html><html><head><meta charset="utf-8"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Anton&family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet"><link rel="stylesheet" href="hub.css"></head><body><div class="stage">${body}</div></body></html>`;
const chrome = (title = 'CLUBWEALTH') => `<div class="chrome"><div class="dots"><i></i><i></i><i></i></div><div class="chrome-title">${title}</div></div>`;

/* ---------- portal screens ---------- */
const DEPTS = [
  ['ISA', 'Inside Sales', 'phone', 8], ['TECH', 'Technical', 'code', 10], ['CC', 'Client Care', 'chat', 10], ['RM', 'Relationship Mgmt', 'users', 7],
  ['Marketing', 'Campaigns & content', 'mega', 10], ['EVENTS', 'Event operations', 'cal', 10], ['SM', 'Social media', 'spark', 6], ['WEB', 'Website', 'globe', 5],
  ['IT', 'IT support', 'server', 6], ['AIM', 'AIM team', 'target', 4], ['AUDIT', 'Audits & reports', 'shield', 5], ['ADMIN', 'Administration', 'brief', 9],
];
const tile = ([code, name, icon, n], hl) => `<div class="tile${hl ? ' hl' : ''}"><span class="count">${n} tasks</span><div class="ic">${ic(icon, 20)}</div><div><b>${code}</b><span>${name}</span>${hl === 'enter' ? '<div class="enter">Open workspace ' + ic('arrow', 14) + '</div>' : ''}</div></div>`;
const portalTop = (name, role, ini) => `<div class="portal-top"><div class="brand"><span class="brand-mark">CLUBWEALTH</span><span class="brand-tag">AI TASK HUB · PORTAL</span></div><div class="user"><div style="text-align:right">${name}<small>${role}</small></div><div class="avatar">${ini}</div></div></div>`;
const fab = (label) => `<div class="fab-label"><b>Ask the Club Wealth Assistant</b><span>${label}</span></div><div class="fab">${botIc(30)}<span class="pip">2</span></div>`;

const screens = {};
screens['01-portal-all'] = `<div class="win">${chrome('CLUBWEALTH PORTAL')}<div class="portal">${portalTop('Miguel', 'AI Tech · All workspaces', 'M')}
  <div class="portal-body"><h1>You are assigned to</h1><p class="sub">12 department workspaces. Pick one to open its automated tasks.</p>
  <div class="tiles all">${DEPTS.map((d, i) => tile(d, i === 2)).join('')}</div></div></div></div>`;
screens['02-portal-isa'] = `<div class="win">${chrome('CLUBWEALTH PORTAL')}<div class="portal">${portalTop('Inside Sales Agent', 'ISA team', 'IS')}
  <div class="portal-body"><h1>You are assigned to</h1><p class="sub">Your workspace is ready. Open it to see your automated tasks.</p>
  <div class="tiles big">${tile(DEPTS[0], 'enter')}</div></div>${fab('Stays available even when the app is minimized')}</div></div>`;
screens['03-portal-multi'] = `<div class="win">${chrome('CLUBWEALTH PORTAL')}<div class="portal">${portalTop('Omerson', 'Technical · 3 workspaces', 'OC')}
  <div class="portal-body"><h1>You are assigned to</h1><p class="sub">Choose a workspace. You can switch any time from the sidebar.</p>
  <div class="tiles big">${tile(DEPTS[1], 'enter')}${tile(DEPTS[11], 'enter')}${tile(DEPTS[8], 'enter')}</div></div>${fab('Ask about Keap tags, access issues, deploys…')}</div></div>`;

/* ---------- app shell (Client Care workspace) ---------- */
const TASKS = [
  ['Dashboard', 'home'], null,
  ['Client Communication', 'chat', 3], ['Billing Assistant', 'card'], ['Coaching Follow-Up', 'cal', 2], ['Event Communications', 'mega'],
  ['Client Summary', 'user'], ['Follow-Up Manager', 'flag', 5], ['Client Care Knowledge', 'book'], ['Data & Trackers', 'table'],
  ['Internal Updates', 'grid'], ['Content Assistant', 'spark'],
];
const side = (active) => `<aside class="side"><div class="side-dept"><div class="badge">CC</div><div><b>Client Care</b><small>Jizel · AI Task Hub</small></div></div>
  ${TASKS.map((t) => t === null ? '<div class="side-h">AUTOMATED TASKS</div>' : `<div class="nav${t[0] === active ? ' on' : ''}">${ic(t[1], 17)}<span>${t[0]}</span>${t[2] ? `<span class="n">${t[2]}</span>` : ''}</div>`).join('')}
  <div class="side-foot"><span class="dot-ok"></span>Keap, Gmail & Sheets connected</div></aside>`;
const topbar = (title, sub) => `<div class="topbar"><div class="crumb">Client Care / <b>${title}</b>${sub ? ` <span class="pill p-navy" style="margin-left:8px">${sub}</span>` : ''}</div><div class="search">${ic('search', 15)}Search tasks, clients, drafts<span class="kbd">⌘K</span></div><div class="avatar">J</div></div>`;
const rail = (on = 0) => `<div class="rail">${['bell', 'check', 'clock', 'help', 'gear'].map((n, i) => `<i class="${i === on ? 'on' : ''}">${ic(n, 18)}${i === 0 ? '<span class="b"></span>' : ''}</i>`).join('')}</div>`;
const tabs = (list, on) => `<div class="tabs">${list.map((t, i) => `<div class="tab${i === on ? ' on' : ''}">${t}</div>`).join('')}</div>`;
const shell = (active, title, sub, inner, opts = {}) => `<div class="win">${chrome()}<div class="app">${side(active)}<div class="main">${topbar(title, sub)}${opts.tabs || ''}<div class="body">${inner}${rail(opts.rail ?? -1)}</div></div></div>${opts.overlay || ''}</div>`;

screens['04-task-chat'] = shell('Client Communication', 'Client Communication Generator', 'AI drafting', `
  <div class="hist"><div class="newbtn">${ic('plus', 15, 2)}New message</div><h4>TODAY</h4>
    <div class="hi on">Billing reminder: payment plan<small>Maria Santos · 2 min ago</small></div>
    <div class="hi">Coaching call reschedule<small>Daniel Reyes · 41 min ago</small></div>
    <div class="hi">BSM hotel block details<small>Group reply · 1 hr ago</small></div>
    <h4>YESTERDAY</h4><div class="hi">Zoom link not working<small>Karen Lee</small></div><div class="hi">Welcome to coaching program<small>New client onboarding</small></div><div class="hi">Past-due balance follow-up<small>Robert Cruz</small></div></div>
  <div class="chat"><div class="msgs">
    <div class="bot-hero"><div class="bot">${botIc(26)}</div><b>Client Communication Generator</b><span>Turns your notes into clear, caring client messages in your tone. You review before anything is sent.</span></div>
    <div class="m me">Maria asked to move to a 3-month payment plan for the coaching program, $1,500 left. Approved by billing. Keep it warm, mention her next coaching call is Thursday.</div>
    <div class="m ai"><span class="lab">DRAFT · EMAIL · FRIENDLY</span>Here's a draft for Maria:
      <div class="draft">Hi Maria,<br><br>Great news: your 3-month payment plan has been approved. Your remaining balance of $1,500 will be split into three payments of $500, starting next month. You'll receive a confirmation from billing shortly.<br><br>Looking forward to your coaching call on Thursday!<br><br>Warmly,<br>Jizel, Club Wealth Client Care</div>
      <div class="acts"><span class="btn pri">${ic('mail', 14)}Copy to Gmail</span><span class="btn">Shorter</span><span class="btn">More formal</span><span class="btn">${ic('flag', 14)}Add follow-up</span></div></div>
  </div>
  <div class="composer"><div class="ph">Paste notes or describe the message you need…</div><div class="row"><span class="chip">${ic('mail', 13)}Email</span><span class="chip">Tone: Friendly</span><span class="chip">${ic('user', 13)}Client: Maria Santos</span><span class="chip">${ic('clip', 13)}Attach</span><span class="send">${ic('send', 16)}</span></div></div></div>`);

const kpi = (t, v, d, pill) => `<div class="card kpi"><div class="t">${t}${pill || ''}</div><div class="v">${v}</div><div class="d">${d}</div></div>`;
const li = (who, tx, sub, right) => `<div class="li"><span class="who">${who}</span><div class="tx">${tx}<small>${sub}</small></div>${right}</div>`;
screens['05-dashboard'] = shell('Dashboard', 'Dashboard', 'This week', `<div class="content"><div class="dash">
  ${kpi('Tasks automated', '142', '▲ 23% vs last week')}${kpi('Time saved', '11.5 <small>hrs</small>', '▲ 2.4 hrs vs last week')}${kpi('Waiting for review', '6', '<span style="color:var(--warn)">3 due today</span>', '<span class="pill p-warn">Review</span>')}${kpi('Follow-ups due', '9', '<span style="color:var(--muted)">4 billing · 5 coaching</span>')}
  <div class="card" style="grid-row: 1 / span 3; grid-column: 5"><div class="ch"><b>Needs your review</b><span>Human approval</span></div><div class="list">
    ${li('MS', 'Payment plan email · Maria Santos', 'Billing Assistant · drafted 2 min ago', '<span class="pill p-warn">Review</span>')}
    ${li('DR', 'Coaching reschedule · Daniel Reyes', 'Coaching Follow-Up · 41 min ago', '<span class="pill p-warn">Review</span>')}
    ${li('BSM', 'BSM hotel reminder · 48 clients', 'Event Comms · 1 hr ago', '<span class="pill p-warn">Review</span>')}
    ${li('KL', 'Zoom troubleshooting reply', 'Knowledge · auto-sent', '<span class="pill p-ok">Sent</span>')}
    ${li('RC', 'Past-due balance follow-up', 'Follow-Up Manager · scheduled Fri', '<span class="pill p-navy">Scheduled</span>')}
</div></div>
  <div class="card" style="grid-column: 1 / span 2; grid-row: 2 / span 2"><div class="ch"><b>Upcoming follow-ups</b><span>From the Follow-Up Manager</span></div><div class="list">
    ${li('RC', 'Robert Cruz · past-due balance', 'Billing · due today', '<span class="pill p-bad">Overdue</span>')}
    ${li('AL', 'Ana Lim · book coaching call', 'Coaching · due today', '<span class="pill p-warn">Today</span>')}
    ${li('PV', 'Paolo Vega · LABC registration', 'Events · Thu', '<span class="pill p-navy">Thu</span>')}
    ${li('GT', 'Grace Tan · cancellation timeline', 'Billing · Fri', '<span class="pill p-navy">Fri</span>')}
    ${li('MO', 'Mark Ong · onboarding checklist', 'Onboarding · Mon', '<span class="pill p-navy">Mon</span>')}</div></div>
  <div class="card" style="grid-column: 3 / span 2"><div class="ch"><b>Automations run</b><span>Last 7 days</span></div><div class="bars">${[38, 52, 46, 61, 74, 30, 22].map((h, i) => `<div class="${i === 4 ? 'hi' : ''}" style="height:${h * 1.6}px"></div>`).join('')}</div><div class="bars-x">${['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'].map((d) => `<span>${d}</span>`).join('')}</div></div>
  <div class="card" style="grid-column: 3 / span 2"><div class="ch"><b>Most used tasks</b><span>This week</span></div><div class="list">
    ${li(ic('chat', 15), 'Client Communication', '48 drafts', '<b style="font-size:13px">34%</b>')}${li(ic('book', 15), 'Client Care Knowledge', '37 answers', '<b style="font-size:13px">26%</b>')}${li(ic('user', 15), 'Client Summary', '21 summaries', '<b style="font-size:13px">15%</b>')}</div></div>
  </div></div>`, { rail: 0 });

screens['06-task-tabs'] = shell('Billing Assistant', 'Billing Response Assistant', 'Human review on', `<div class="content" style="display:flex;gap:18px">
  <div class="records"><div class="search" style="width:auto;margin:0;background:#fff">${ic('search', 15)}Search clients</div>
    <div class="rec on"><div class="top"><b>Maria Santos</b><span class="pill p-warn">Plan request</span></div><small>Coaching program · $1,500 left</small></div>
    <div class="rec"><div class="top"><b>Robert Cruz</b><span class="pill p-bad">Past due</span></div><small>$420 · 18 days overdue</small></div>
    <div class="rec"><div class="top"><b>Grace Tan</b><span class="pill p-navy">Cancellation</span></div><small>Asked about timeline</small></div>
    <div class="rec"><div class="top"><b>Paolo Vega</b><span class="pill p-ok">Discount</span></div><small>Referral credit applied</small></div>
    <div class="rec"><div class="top"><b>Ana Lim</b><span class="pill p-navy">Question</span></div><small>Why was I charged twice?</small></div>
    <div class="rec"><div class="top"><b>James Sy</b><span class="pill p-ok">Paid</span></div><small>Receipt request</small></div></div>
  <div class="card panel"><div style="display:flex;justify-content:space-between;align-items:center"><div><b style="font-family:var(--head);font-size:18px">Maria Santos</b><div style="font-size:12.5px;color:var(--muted);margin-top:2px">Verified from Keap billing record · updated 3 min ago</div></div><span class="pill p-ok">${ic('check', 13, 2.2)}Source verified</span></div>
    <div class="fields"><div class="f"><small>Program</small><b>Coaching · 12 mo</b></div><div class="f"><small>Balance</small><b>$1,500.00</b></div><div class="f"><small>Requested</small><b>3-month plan</b></div><div class="f"><small>Approval</small><b>Billing ✓</b></div></div>
    <div class="out"><span class="pill p-navy" style="margin-bottom:10px">AI EXPLANATION · DRAFT</span><p>Hi Maria, thanks for reaching out about your balance. Your remaining <span class="hl-y">$1,500.00</span> can be split into <span class="hl-y">3 monthly payments of $500.00</span>, with the first payment on <span class="hl-y">November 1</span>.</p><p>There are no extra fees for the payment plan, and your coaching access continues as normal throughout. If anything changes, just reply to this email and we'll help.</p><p style="color:var(--faint);font-size:12.5px">Figures pulled from Keap. AI never guesses amounts; anything it can't verify is flagged for you.</p></div>
    <div class="composer" style="margin:14px 0 0"><div class="ph">Ask a follow-up or adjust the explanation…</div><div class="row"><span class="chip">Explain fees</span><span class="chip">Add cancellation policy</span><span class="chip">Translate</span><span class="btn pri" style="margin-left:auto">Approve & send</span></div></div></div></div>`,
  { tabs: tabs(['Respond', 'Payment plans', 'Past due', 'Templates', 'History', 'Settings'], 0), rail: 1 });

const ghostDash = screens['05-dashboard'];
screens['07-floating-chat'] = shell('Follow-Up Manager', 'Follow-Up Manager', '5 due', `<div class="content">
  <table class="card" style="border-radius:12px;overflow:hidden;display:table"><thead><tr><th>Client</th><th>Reason</th><th>Due</th><th>Next action</th><th>Status</th></tr></thead><tbody>
  <tr><td><b>Robert Cruz</b><small>Coaching program</small></td><td>Past-due balance ($420)</td><td>Today</td><td>Billing reminder #2</td><td><span class="pill p-bad">Overdue</span></td></tr>
  <tr><td><b>Ana Lim</b><small>New client</small></td><td>Book first coaching call</td><td>Today</td><td>Send booking link</td><td><span class="pill p-warn">Today</span></td></tr>
  <tr><td><b>Paolo Vega</b><small>LABC 2026</small></td><td>Registration incomplete</td><td>Thu</td><td>Event reminder</td><td><span class="pill p-navy">Scheduled</span></td></tr>
  <tr><td><b>Grace Tan</b><small>Coaching program</small></td><td>Cancellation timeline</td><td>Fri</td><td>Billing explanation</td><td><span class="pill p-navy">Scheduled</span></td></tr></tbody></table>
  <div class="mini" style="left:22px;bottom:96px;width:230px"><div class="mini-h"><div class="bot">${botIc(16)}</div><div><b>Client Summary</b><small>Minimized</small></div><div class="x">${ic('plus', 14)}${ic('x', 14)}</div></div></div>
  <div class="bubble" style="left:22px;bottom:22px">${botIc(26)}</div>
  <div class="mini" style="right:22px;bottom:96px"><div class="mini-h"><div class="bot">${botIc(16)}</div><div><b>Club Wealth Assistant</b><small>Floating · stays on top</small></div><div class="x">${ic('min', 14)}${ic('x', 14)}</div></div>
    <div class="mini-b"><div class="m me">What do I send Robert about his past-due balance?</div><div class="m ai">Robert is 18 days past due on $420. I drafted reminder #2 with a payment link and a friendly tone. Want to review it?</div><div style="display:flex;gap:6px"><span class="btn pri" style="height:28px;font-size:11.5px">Review draft</span><span class="btn" style="height:28px;font-size:11.5px">Snooze 2 days</span></div></div>
    <div class="mini-in">Ask anything…<span class="send" style="margin-left:auto">${ic('send', 13)}</span></div></div>
  <div class="bubble" style="right:22px;bottom:22px">${ic('x', 22, 2)}</div>
  <div class="note" style="left:270px;bottom:30px">Chat windows pop out and stay open even when the AI Task Hub is minimized.</div></div>`,
  { tabs: tabs(['Due today', 'This week', 'Billing', 'Coaching', 'Events', 'Done'], 0), rail: 0 });

screens['08-run-log'] = shell('Data & Trackers', 'Automation Runs', 'All tasks', `<div class="content" style="padding:0">
  <table style="background:#fff"><thead><tr><th>Run</th><th>Automation</th><th>Flow</th><th>Started</th><th>Result</th><th>Review</th></tr></thead><tbody>
  ${[
    ['#1842', 'Payment plan email', 'Keap → Claude → Gmail', '2:41 PM', 'p-warn', 'Waiting for review', 'Jizel'],
    ['#1841', 'Client summary · James Sy', 'Keap → Claude', '2:36 PM', 'p-ok', 'Completed', 'Auto'],
    ['#1840', 'BSM hotel reminder (48)', 'Sheets → Claude → Gmail', '1:58 PM', 'p-warn', 'Waiting for review', 'Jizel'],
    ['#1839', 'Tracker sync · Coaching', 'Gmail → Sheets', '1:30 PM', 'p-ok', 'Completed', 'Auto'],
    ['#1838', 'Zoom troubleshooting reply', 'Knowledge → Gmail', '1:12 PM', 'p-ok', 'Sent', 'Auto'],
    ['#1837', 'Past-due check (daily)', 'Keap → Follow-Up Manager', '12:00 PM', 'p-ok', '5 follow-ups created', 'Auto'],
    ['#1836', 'Weekly coach update', 'Notes → Claude → Slack', '11:45 AM', 'p-ok', 'Posted', 'Jizel'],
    ['#1835', 'Billing data refresh', 'Keap → Billing Assistant', '11:00 AM', 'p-bad', 'Failed · retrying', 'Alert sent'],
    ['#1834', 'Event registration sync', 'Form → Sheets → Keap', '10:30 AM', 'p-ok', 'Completed', 'Auto'],
  ].map(([id, name, flow, t, cls, res, who]) => `<tr><td style="font-family:var(--mono);font-size:12px;color:var(--faint)">${id}</td><td><b>${name}</b></td><td><span class="flow">${flow.split(' → ').map((x) => `<em>${x}</em>`).join(' → ')}</span></td><td>${t}</td><td><span class="pill ${cls}">${res}</span></td><td>${who}</td></tr>`).join('')}
  </tbody></table></div>`, { tabs: tabs(['All runs', 'Needs review', 'Failed', 'Scheduled', 'Connections'], 0), rail: 2 });

Object.assign(screens, cwuScreens({ ic, botIc }));
const only = process.argv[2] ? new RegExp(process.argv[2]) : null;
const outDir = path.join(dir, 'out');
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
for (const [name, body] of Object.entries(screens)) {
  if (only && !only.test(name)) continue;
  const file = path.join(dir, `${name}.html`);
  fs.writeFileSync(file, page(body));
  await pg.goto('file://' + file, { waitUntil: 'networkidle' });
  await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: path.join(outDir, `${name}.png`) });
  console.log('rendered', name);
}
await browser.close();
