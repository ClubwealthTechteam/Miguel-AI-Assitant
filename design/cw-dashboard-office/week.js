  /* ---------- Weekly patterns: team totals per day from the Help Desk Zoom (last 10 working days) + break-check Actions ---------- */
  var WK = { doc: null, sub: false };
  function wkStart() {
    ofLoadActive().then(function (l) { if (l) wkRender(); });
    ofZoomSub(); brkLoad(false);
    if (!WK.sub && window.claude && claude.use) {
      WK.sub = true;
      claude.use('db').then(function (db) {
        if (!db) { $('#wk-sub').textContent = 'Opens on claude.ai'; return; }
        db.doc('zoom/week').onSnapshot(function (s) { WK.doc = s.exists ? s.data() : null; wkRender(); }, function () { $('#wk-sub').textContent = 'Couldn’t read the weekly Zoom data'; });
      });
    }
    wkRender();
    if (!WK.t) WK.t = setInterval(function () { if ($('[data-view="week"]').hidden) { clearInterval(WK.t); WK.t = null; return; } if (!!brkData !== WK.hadBrk) wkRender(); }, 1500);
  }
  function wkRender() {
    WK.hadBrk = !!brkData;
    var D = WK.doc, today = ofTodayPT();
    if (!D || !D.days) { $('#wk-kpis').innerHTML = ''; $('#wk-chart').innerHTML = '<p class="wk-note">The weekly view fills in after the next hourly refresh.</p>'; return; }
    var staff = OF_ROSTER.filter(function (p) { return !p.boss; });
    var days = D.days.map(function (d) {
      var M = ofMatchZoom({ people: d.people.map(function (x) { return { n: x.n, j: x.j, l: x.l, m: x.m, open: !x.l }; }) }).map, hud = ofHuddleAt(d.date, D.huddle || '07:30');
      var per = {}; staff.forEach(function (p) { var z = M[p.id]; per[p.id] = z ? { late: Math.round((Date.parse(z.j) - hud) / 60000), j: z.j } : null; });
      var on = 0, late = 0; staff.forEach(function (p) { var x = per[p.id]; if (x) { if (x.late <= 0) on++; else late++; } });
      return { date: d.date, per: per, on: on, late: late, miss: staff.length - on - late, today: d.date === today };
    });
    /* compare the last 5 complete working days with the 5 before them (today is still in progress) */
    var done = days.filter(function (d) { return !d.today; }), thisDone = done.slice(-5), lastW = done.slice(-10, -5), thisW = thisDone;
    var rate = function (L) { var on = 0, n = 0; L.forEach(function (d) { on += d.on; n += d.on + d.late; }); return n ? Math.round(on / n * 100) : null; };
    var avgIn = function (L) { var t = 0; L.forEach(function (d) { t += d.on + d.late; }); return L.length ? Math.round(t / L.length) : null; };
    var acts = function (L) { if (!brkData) return null; var set = {}; L.forEach(function (d) { set[d.date] = 1; }); return brkData.rows.filter(function (r) { return set[r.d] && r.st === 'Action'; }).length; };
    var kp = function (label, val, sub) { return '<div class="td-kpi"><span>' + esc(label) + '</span><b>' + esc(String(val)) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</div>'; };
    var cmp = function (a, b, unit) { return a == null || b == null ? '' : (a === b ? 'same as' : a > b ? '+' + (a - b) + unit + ' vs' : '−' + (b - a) + unit + ' vs') + ' the 5 days before'; };
    var span = thisDone.length ? ofDayLabel(thisDone[0].date).split(',')[0] + '–' + ofDayLabel(thisDone[thisDone.length - 1].date).split(',')[0] : '';
    $('#wk-kpis').innerHTML = kp('On time to huddle · ' + span, rate(thisDone) == null ? '–' : rate(thisDone) + '%', cmp(rate(thisDone), rate(lastW), ' pts')) +
      kp('In Zoom per day · ' + span, avgIn(thisDone) == null ? '–' : avgIn(thisDone) + '/' + staff.length, cmp(avgIn(thisDone), avgIn(lastW), '')) +
      kp('Late arrivals · ' + span, thisDone.reduce(function (t, d) { return t + d.late; }, 0), 'the 5 days before: ' + lastW.reduce(function (t, d) { return t + d.late; }, 0)) +
      kp('Break-check Actions · ' + span, acts(thisW) == null ? '–' : acts(thisW), acts(lastW) == null ? 'loading break check' : 'the 5 days before: ' + acts(lastW));
    $('#wk-sub').textContent = 'Help Desk Zoom · last ' + days.length + ' working days · updated ' + ofPT(D.at) + ' PT';
    var max = staff.length;
    $('#wk-chart').innerHTML = days.map(function (d) {
      var h = function (n) { return (n / max * 100).toFixed(1) + '%'; };
      return '<div class="wk-col' + (d.today ? ' today' : '') + '" title="' + esc(ofDayLabel(d.date) + ': ' + d.on + ' on time, ' + d.late + ' late, ' + d.miss + ' not in Zoom') + '"><b>' + (d.on + d.late) + '</b><div class="wk-stack"><i style="height:' + h(d.on) + ';background:#2346c8"></i><i style="height:' + h(d.late) + ';background:#f0a83a"></i></div><small>' + esc(d.today ? 'Today' : ofDayLabel(d.date).replace(/,.*/, '').replace(' ', ' ')) + '</small></div>';
    }).join('');
    if (brkData) {
      var per = days.map(function (d) { var r = brkData.rows.filter(function (x) { return x.d === d.date; }); return { d: d, n: r.length, a: r.filter(function (x) { return x.st === 'Action'; }).length }; }), mx = Math.max(1, Math.max.apply(null, per.map(function (x) { return x.a; })));
      $('#wk-brk').innerHTML = per.map(function (x) { return '<div class="wk-col' + (x.d.today ? ' today' : '') + '" title="' + esc(ofDayLabel(x.d.date) + ': ' + (x.n ? x.a + ' Actions of ' + x.n + ' checked' : 'no break check')) + '"><b>' + (x.n ? x.a : '–') + '</b><div class="wk-stack"><i style="height:' + (x.a / mx * 100).toFixed(1) + '%;background:#ff6b5a"></i></div><small>' + esc(x.d.today ? 'Today' : ofDayLabel(x.d.date).split(',')[0]) + '</small></div>'; }).join('');
      $('#wk-brk-note').textContent = 'Number of ISAs whose break check said Action that day. “–” = no break check that day.';
    } else $('#wk-brk').innerHTML = '<p class="wk-note">Loading the break check…</p>';
    var G = {}; OF_ROSTER.forEach(function (p) { if (p.boss) return; var k = p.group === 'isa' ? 'ISAs' : p.group === 'rm' ? 'RMs' : p.group === 'coach' ? 'ISA Coach' : p.group === 'reception' ? 'Client Care' : p.group === 'manager' ? 'Head Admin' : p.dept; (G[k] = G[k] || []).push(p); });
    var head = '<thead><tr><th>Person</th>' + days.map(function (d) { return '<th>' + esc(d.today ? 'Today' : ofDayLabel(d.date)) + '</th>'; }).join('') + '<th>On time</th></tr></thead>';
    $('#wk-grid').innerHTML = head + '<tbody>' + Object.keys(G).map(function (k) {
      return '<tr class="wk-team"><td colspan="' + (days.length + 2) + '">' + esc(k) + '</td></tr>' + G[k].slice().sort(function (a, b) { return a.full.localeCompare(b.full); }).map(function (p) {
        var on = 0, n = 0;
        return '<tr><td>' + esc(p.name) + '</td>' + days.map(function (d) { var x = d.per[p.id]; if (!x) return '<td class="miss">—</td>'; n++; if (x.late <= 0) on++; return '<td class="' + (x.late <= 0 ? 'on' : 'late') + '">' + esc(ofPT(x.j)) + (x.late > 0 ? '<small>+' + x.late + ' min</small>' : '') + '</td>'; }).join('') + '<td>' + (n ? on + '/' + n : '–') + '</td></tr>';
      }).join('');
    }).join('') + '</tbody>';
  }
  function wkMon(day) { var d = new Date(day + 'T12:00:00Z'), k = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - k); return d.toISOString().slice(0, 10); }
  (function () { var v = $('[data-view="week"]'); if (v) v.addEventListener('click', function (e) { var g = e.target.closest('[data-go]'); if (g) tab(g.dataset.go); }); })();
