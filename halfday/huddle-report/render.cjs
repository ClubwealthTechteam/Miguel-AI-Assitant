// Draws the "Upcoming Half-Day Event Numbers" images in the style of the CWU Daily Huddle page.
// Usage: node render.cjs data.json outdir   (data shape: see README.md and example-data.json)
const fs = require('fs');
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const D = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const OUT = process.argv[3] || '.';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const CSS = `<link href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@600;700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box}body{margin:0;background:#fff;font-family:'Source Sans 3','Segoe UI',Arial,sans-serif;color:#1f2937}
.card{background:#fff;border:1px solid #e3e6ea;border-radius:10px;padding:22px 26px;margin:10px}
h2{font-family:'Barlow Semi Condensed','Arial Narrow',sans-serif;font-size:24px;margin:0 0 4px}.sub{color:#5b6472;font-size:15px;margin-bottom:14px}
.head{display:flex;justify-content:space-between;align-items:baseline;border-bottom:3px solid var(--c);padding-bottom:6px;margin-bottom:6px}
.head h3{font-family:'Barlow Semi Condensed','Arial Narrow',sans-serif;font-size:21px;margin:0}.head b{font-family:'Barlow Semi Condensed',sans-serif;font-size:22px}
table{width:100%;border-collapse:collapse;font-size:14px}th{font-size:12px;letter-spacing:.06em;color:#6b7280;text-align:left;font-weight:600;padding:8px 6px}
td{padding:7px 6px;border-top:1px solid #eef0f3}td.n,th.n{text-align:right;font-variant-numeric:tabular-nums}td.m{color:#6b7280}td.b{font-weight:700}
.note{color:#6b7280;font-size:12.5px;margin-top:8px}.dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;vertical-align:middle}
</style>`;
const HC = { good: '#2f7d4f', warn: '#8a6514', bad: '#b33a2c' };
const health = (s) => { const p = s.signUps / (s.goal || 300); return p >= 0.8 ? ['On track', 'good'] : p >= 0.5 ? ['Monitor', 'warn'] : ['Behind', 'bad']; };

function stopsChart(stops, W) {
  const H = 470, L = 70, R = W - 30, T = 30, B = 330;
  const max = Math.max(500, Math.ceil(Math.max(...stops.flatMap((s) => [s.signUps, s.prev || 0])) / 100) * 100);
  const y = (v) => B - (B - T) * v / max;
  const cw = (R - L) / stops.length, bw = 40;
  let s = '';
  for (let g = 0; g <= max; g += 100) s += `<line x1="${L}" x2="${R}" y1="${y(g)}" y2="${y(g)}" stroke="#eceff3"/><text x="${L - 14}" y="${y(g) + 4}" text-anchor="end" font-size="12" fill="#6b7280">${g}</text>`;
  s += `<line x1="${L}" x2="${R}" y1="${B}" y2="${B}" stroke="#c9ced6"/>`;
  stops.forEach((st, i) => {
    const cx = L + cw * i + cw / 2, goal = st.goal || 300;
    s += `<line x1="${L + cw * i + 12}" x2="${L + cw * (i + 1) - 12}" y1="${y(goal)}" y2="${y(goal)}" stroke="#374151" stroke-dasharray="7 5" stroke-width="1.5"/>`;
    const bars = st.prev != null ? [['#a9c8ee', st.prev, '#1f2937'], ['#d68a2f', st.prevShow, '#1f2937'], ['#2e63c7', st.signUps, '#1f2937']] : [['#2e63c7', st.signUps, '#1f2937']];
    const x0 = cx - (bars.length * bw + (bars.length - 1) * 4) / 2;
    bars.forEach((b, k) => { const x = x0 + k * (bw + 4); s += `<rect x="${x}" y="${y(b[1])}" width="${bw}" height="${B - y(b[1])}" rx="2" fill="${b[0]}"/><text x="${x + bw / 2}" y="${y(b[1]) - 7}" text-anchor="middle" font-size="13" font-weight="700" fill="${b[2]}">${b[1]}</text>`; });
    if (st.same != null) s += `<line x1="${x0 - 6}" x2="${x0 + bw + 6}" y1="${y(st.same)}" y2="${y(st.same)}" stroke="#111" stroke-width="3"/><text x="${x0 - 10}" y="${y(st.same) + 4}" text-anchor="end" font-size="11" fill="#4b5563">${st.same}</text>`;
    const [hl, hs] = st.health ? [st.health, st.h] : health(st);
    if (st.held) { s += `<text x="${cx}" y="${B + 26}" text-anchor="middle" font-size="15" font-weight="700" font-family="Barlow Semi Condensed,Arial Narrow,sans-serif">${esc(st.city)}, ${st.state}</text>
      <text x="${cx}" y="${B + 46}" text-anchor="middle" font-size="12.5" fill="#4b5563">${esc(st.label)}</text>
      <text x="${cx}" y="${B + 65}" text-anchor="middle" font-size="12.5" font-weight="700">${st.shownText ? esc(st.shownText) : st.shown != null ? `Showed: ${st.shown} scanned (${Math.round(100 * st.shown / st.signUps)}%)` : 'Showed: no scans recorded'}</text>
      <text x="${cx}" y="${B + 84}" text-anchor="middle" font-size="12.5" fill="#4b5563">Event held</text>`; return; }
    const expect = st.expect != null ? `Expect ${st.expect} to show · ${st.flat} at 21%` : `Expect ${st.flat} to show at 21%`;
    s += `<text x="${cx}" y="${B + 26}" text-anchor="middle" font-size="15" font-weight="700" font-family="Barlow Semi Condensed,Arial Narrow,sans-serif">${esc(st.city)}, ${st.state}</text>
      <text x="${cx}" y="${B + 46}" text-anchor="middle" font-size="12.5" fill="#4b5563">${esc(st.label)}</text>
      <text x="${cx}" y="${B + 65}" text-anchor="middle" font-size="12.5" fill="#4b5563">${expect}</text>
      <text x="${cx}" y="${B + 84}" text-anchor="middle" font-size="12.5" font-weight="700">Need ${st.need}/day · on this pace ${st.pace ?? '—'}</text>
      <circle cx="${cx - 34}" cy="${B + 99}" r="5" fill="${HC[hs]}"/><text x="${cx - 24}" y="${B + 103}" font-size="12.5" font-weight="600" fill="${HC[hs]}">${hl}</text>`;
  });
  return `<svg width="${W}" height="${H}" font-family="Source Sans 3,Segoe UI,Arial,sans-serif">${s}</svg>`;
}

function dailyChart(rows) {
  const W = 640, H = 300, L = 50, R = W - 20, T = 40, B = 250, max = 120, y = (v) => B - (B - T) * v / max;
  let s = '';
  for (let g = 0; g <= max; g += 20) s += `<line x1="${L}" x2="${R}" y1="${y(g)}" y2="${y(g)}" stroke="#eceff3"/><text x="${L - 10}" y="${y(g) + 4}" text-anchor="end" font-size="11" fill="#6b7280">${g}</text>`;
  s += `<line x1="${L}" x2="${R}" y1="${y(100)}" y2="${y(100)}" stroke="#374151" stroke-dasharray="7 5" stroke-width="1.5"/><text x="${R}" y="${y(100) - 6}" text-anchor="end" font-size="12" fill="#6b7280">daily goal 100</text>`;
  const cw = (R - L) / rows.length;
  rows.forEach(([n, v, star], i) => { const cx = L + cw * i + cw / 2; s += `<rect x="${cx - 21}" y="${y(v)}" width="42" height="${B - y(v)}" rx="2" fill="#469a85"/><text x="${cx}" y="${y(v) - 6}" text-anchor="middle" font-size="13" font-weight="700">${v}${star ? '*' : ''}</text><text x="${cx}" y="${B + 20}" text-anchor="middle" font-size="12">${esc(n)}</text>`; });
  return `<svg width="${W}" height="${H}">${s}</svg>`;
}

const table = (title, color, total, cols, rows, note = '') => `<div class="card" style="--c:${color};margin:0 0 18px"><div class="head"><h3>${title}</h3><b>${total}</b></div>
  <table><tr>${cols.map((c) => `<th class="${c[1] || ''}">${c[0]}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((v, i) => `<td class="${cols[i][1] || ''}">${esc(v)}</td>`).join('')}</tr>`).join('')}</table>${note}</div>`;

const pages = {};
function statChart(rows) {
  const W = 760, L = 190, R = W - 90, rowH = 64, T = 30, H = T + rows.length * rowH + 30, x = (v) => L + (R - L) * v / 100;
  let s = '';
  for (let g = 0; g <= 100; g += 25) s += `<line x1="${x(g)}" x2="${x(g)}" y1="${T - 10}" y2="${H - 30}" stroke="#eceff3"/><text x="${x(g)}" y="${H - 12}" text-anchor="middle" font-size="11" fill="#6b7280">${g}%</text>`;
  rows.forEach(([label, n, d], i) => { const p = 100 * n / d, yy = T + i * rowH;
    s += `<text x="${L - 14}" y="${yy + 22}" text-anchor="end" font-size="15" font-weight="700">${esc(label)}</text><text x="${L - 14}" y="${yy + 40}" text-anchor="end" font-size="12.5" fill="#4b5563">${n} of ${d}</text>
      <rect x="${L}" y="${yy + 8}" width="${R - L}" height="30" rx="3" fill="#eef2f7"/><rect x="${L}" y="${yy + 8}" width="${x(p) - L}" height="30" rx="3" fill="#2e63c7"/>
      <text x="${x(p) + 8}" y="${yy + 28}" font-size="14" font-weight="700">${p.toFixed(2)}%</text>`; });
  return `<svg width="${W}" height="${H}" font-family="Source Sans 3,Segoe UI,Arial,sans-serif">${s}</svg>`;
}
if (D.stat) pages['0-previous-day-event'] = `<div class="card" style="width:820px"><h2>Previous day's event: ${esc(D.stat.city)} · ${esc(D.stat.date)}</h2><div class="sub">From the Stat Sheet | Updated post in #cw-half-day-registration-forms-automation</div>${statChart(D.stat.rows)}<div class="note">Attended Tagged = people tagged attended in Keap out of registrations.</div></div>`;
pages['1-upcoming'] = `<div class="card" style="width:${D.full.length > 2 ? 1370 : 900}px"><h2>${esc(D.title || 'Previous vs upcoming Half-Day events')}</h2><div class="sub">Light blue: last visit's sign-ups · orange: last visit's show-ups · dark blue: sign-ups now · black line: last visit at the same days out · dashed: goal</div>${stopsChart(D.full, D.full.length > 2 ? 1320 : 850)}${D.note ? `<div class="note">${D.note}</div>` : ''}</div>`;
if (D.next) pages['2-next-tour'] = `<div class="card" style="width:1370px"><h2>${esc(D.nextTitle)}</h2><div class="sub">Light blue: last visit's sign-ups · orange: last visit's show-ups · dark blue: sign-ups now · dashed: goal</div>${stopsChart(D.next, 1320)}<div class="note">${D.nextNote || ''}</div></div>`;
pages['3-daily-sign-ups'] = `<div class="card" style="width:680px"><h2>${esc(D.dailyTitle || 'Daily sign-ups')}</h2><div class="sub">${esc(D.dailySub || 'Sign-ups in the last 24 hours, against the daily goal.')}</div>${dailyChart(D.daily)}<div class="note">${esc(D.dailyNote || '')}</div></div>`;
// Highest sign-ups first, ties by name: the same order as the CWU Daily Huddle page (Miguel, 2026-10-23).
const bySignUps = (n) => (a, b) => b[n] - a[n] || a[0].localeCompare(b[0]);
const isa = [...D.isa].sort(bySignUps(3));
pages['4-who-brought-them-in'] = `<div style="width:1130px;display:flex;gap:18px;padding:10px;align-items:flex-start">
 <div style="flex:1.15">${table('ISAs', '#2e63c7', D.totals.isa, [['OWNER'], ['SQUAD LEADER', 'm'], ['START DATE', 'm'], ['SIGN-UPS', 'n']], isa.map((r) => [r[0], r[1], r[2], r[3]]), '<div class="note">Highest sign-ups first, same order as the CWU Daily Huddle page.</div>')}</div>
 <div style="flex:1">${table('RMs', '#d68a2f', D.totals.rm, [['OWNER'], ['SIGN-UPS', 'n']], [...D.rm].sort(bySignUps(1)))}${table('Coaches / clients / vendors', '#7b4fc4', D.totals.ccv, [['OWNER'], ['SIGN-UPS', 'n']], D.ccv)}</div>
 <div style="flex:1">${D.noEventTotals ? table('Events', '#469a85', D.totals.events, [['OWNER'], ['SIGN-UPS', 'n']], D.events.map((r) => [r[0], r[1]])) : table('Events', '#469a85', D.totals.events, [['OWNER'], ['SIGN-UPS', 'n'], ['TOTAL', 'n']], D.events, '<div class="note">Every sign-up that owner\'s codes have brought to the stops on this chart so far, not just in the period.</div>')}${table('Codes nobody owns', '#c0394b', D.totals.unatt, [['OWNER'], ['SIGN-UPS', 'n']], D.unatt)}</div></div>`;
const code = (name, rows) => table(name, '#469a85', rows.reduce((a, r) => a + r[2], 0), [['LOCATION'], ['NEW', 'n'], ['TOTAL', 'n']], [...rows, ['All stops on the chart', rows.reduce((a, r) => a + (+r[1] || 0), 0), rows.reduce((a, r) => a + r[2], 0)]]);
pages['5-campaign-codes'] = `<div style="width:760px;display:flex;gap:18px;padding:10px">${Object.entries(D.codes).map(([k, v]) => `<div style="flex:1">${code(k, v)}</div>`).join('')}</div>`;
if (D.c27) pages['6-cwsocial27'] = `<div style="width:420px;padding:10px">${table('CWSocial27', '#469a85', D.c27.reduce((a, r) => a + r[3], 0), [['LOCATION'], ['NEW', 'n'], ['TOTAL', 'n']], D.c27.map((r) => [r[1] ? r[0] + ' — ' + r[1].replace(/\n/g, '; ') : r[0], r[2], r[3]]), '<div class="note">Keap tag "CWSocial27" (24174), applied by the clubwealth.com registration form. Not an Eventbrite code.</div>')}</div>`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ deviceScaleFactor: 2, viewport: { width: 1400, height: 900 } });
  for (const [name, html] of Object.entries(pages)) {
    await p.setContent(`<!doctype html><html><head><meta charset="utf-8">${CSS}</head><body><div id="r" style="display:inline-block">${html}</div></body></html>`, { waitUntil: 'networkidle' }).catch(() => {});
    await p.waitForTimeout(400);
    await (await p.$('#r')).screenshot({ path: `${OUT}/${name}.png` });
  }
  await b.close();
  console.log(Object.keys(pages).join('\n'));
})();
