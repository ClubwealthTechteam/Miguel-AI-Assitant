
  /* ---------- Today: one home screen that pulls the live team data and the sales numbers together ---------- */
  var TD = { ver: -1, timer: null, started: false };
  function tdStart() {
    if (!TD.started) {
      TD.started = true;
      ofZoomSub(); ofTdLoad(); brkLoad(false); eodLoad(false);
      setInterval(function () { if (!document.hidden) ofTdLoad(); }, 180000);
    }
    if (!TD.timer) TD.timer = setInterval(function () {
      if ($('[data-view="today"]').hidden) { clearInterval(TD.timer); TD.timer = null; return; }
      var sig = [!!brkData, !!eodData, OF.zoom && OF.zoom.at, OF.td && OF.td.at, OF.slack && OF.slack.ts, OF.reports && OF.reports.at].join('|');
      if (sig !== TD.sig) { TD.sig = sig; ofBuild(); tdRender(); }
    }, 1200);
    ofBuild(); tdRender();
  }
  function tdHash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function tdRender() {
    var now = new Date(), h = ofHourPT();
    $('#td-date').textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'America/Los_Angeles' }) + ' · ' + ofPT(now) + ' PT';
    $('#td-hello').textContent = (h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening') + ', Tara';
    var P = OF.people || [], staff = P.filter(function (o) { return !o.p.boss; }), inNow = staff.filter(function (o) { return o.present; }).length;
    var work = P.filter(function (o) { return o.td && o.td.state === 'working'; }).length, idle = P.filter(function (o) { return o.td && o.td.state === 'idle' && o.present; }).length;
    var attn = P.filter(function (o) { return o.attn && o.attn.length; });
    var live = OF.zoomFresh || (OF.td && work > 0);
    $('#td-sum').textContent = !P.length ? 'Loading the team…' : (live ? inNow + ' of ' + staff.length + ' people are in right now' : 'Nobody is clocked in right now' + (OF.zoom ? ' · last Zoom day ' + ofDayLabel(OF.zoom.date) : '')) + (attn.length ? ' · ' + attn.length + ' need your attention.' : ' · nothing needs your attention.');
    var kp = function (label, val, sub, dot) { return '<div class="td-kpi"><span>' + (dot ? '<i class="dot" style="background:' + dot + '"></i>' : '') + esc(label) + '</span><b>' + esc(String(val)) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</div>'; };
    var SL = OF.slack;
    $('#td-kpis').innerHTML = kp(live ? 'In now' : 'In on ' + (OF.zoom ? ofDayLabel(OF.zoom.date) : 'last day'), inNow + '/' + staff.length, 'Help Desk Zoom + Time Doctor', '#46c37b') +
      kp('Working', OF.td ? work : '–', OF.td ? idle + ' idle · Time Doctor ' + ofPT(OF.td.at) : (OF.tdErr ? 'Time Doctor not connected' : 'loading Time Doctor'), '#36c3f0') +
      kp('Needs attention', attn.length, 'late, missed, Action, blockers, idle', attn.length ? '#ff6b5a' : '#9aa0b8') +
      kp('ISA calls', SL ? Number(SL.totalCalls).toLocaleString('en-US') : '–', SL ? 'end-of-shift report · ' + SL.dayLabel : 'report posts 3:30 PM PT') +
      kp('Half-day sign-ups', SL ? SL.totalSignups : '–', SL ? 'ISA report · ' + SL.dayLabel : '') +
      kp('Visitors', (OF.clients || []).length + (OF.applicants || []).length, (OF.clients || []).length + ' clients · ' + (OF.applicants || []).length + ' applicants');
    // needs attention
    var cols = ['#2346c8', '#0f86b0', '#7d5cf0', '#3e9a31', '#cb3200', '#b86e00', '#1d8a4e'];
    $('#td-attn-sub').textContent = attn.length ? attn.length + ' people' : '';
    $('#td-attn').innerHTML = attn.length ? attn.slice(0, 12).map(function (o) {
      var ini = o.p.name.split(/[\s.-]+/).filter(Boolean).map(function (x) { return x[0]; }).join('').slice(0, 2).toUpperCase();
      return '<li><button type="button" data-pid="' + o.p.id + '"><span class="td-av" style="background:' + cols[tdHash(o.p.full) % cols.length] + '">' + esc(ini) + '</span><span><b>' + esc(o.p.name) + ' <span style="color:var(--muted);font-weight:500">· ' + esc(o.p.dept) + '</span></b><small>' + o.attn.map(esc).join(' · ') + '</small></span><em>View →</em></button></li>';
    }).join('') : '<li class="td-empty">Nothing needs you right now.</li>';
    // team by department
    var groups = {}; P.forEach(function (o) { var k = o.p.group === 'isa' ? 'ISAs' : o.p.group === 'rm' ? 'RMs' : o.p.group === 'coach' ? 'ISA Coach' : o.p.group === 'reception' ? 'Client Care' : o.p.group === 'manager' ? 'Head Admin' : o.p.dept; (groups[k] = groups[k] || []).push(o); });
    $('#td-depts').innerHTML = Object.keys(groups).map(function (k) { var L = groups[k], n = L.filter(function (o) { return o.present; }).length; return '<li><span>' + esc(k) + '</span><b>' + n + '/' + L.length + '</b><div class="td-bar"><i style="width:' + Math.round(n / L.length * 100) + '%"></i></div></li>'; }).join('') || '<li class="td-empty">Loading…</li>';
    // sales (numbers this dashboard already computes)
    var mini = function (label, val, sub, full) { return '<div class="td-mini' + (full ? ' td-full' : '') + '"><span>' + esc(label) + '</span><b>' + esc(String(val)) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</div>'; };
    var rev = $('#h-rev') ? $('#h-rev').textContent : '—';
    $('#td-sales').innerHTML = mini('Coaching sales', T26.t, T26.g + ' Group · ' + T26.o + ' 1 on 1') + mini('Year-end projection', '≈' + PROJ, 'range ' + PROJ_LOW + '–' + PROJ) +
      mini('LABC 2026', $('#labc-n') ? $('#labc-n').textContent : '–', 'big-event sign-ups') + mini('BSM 2026', $('#bsm-n') ? $('#bsm-n').textContent : '–', 'big-event sign-ups') +
      mini('Revenue 2026', rev, KEAP ? 'from Keap' : 'waiting for Keap', true);
    // ISA floor
    var F = P.filter(function (o) { return o.p.group === 'isa' || o.p.group === 'rm'; });
    $('#td-isa').innerHTML = mini('At desks', F.filter(function (o) { return o.present; }).length + '/' + F.length, 'ISAs and RMs') + mini('On time to huddle', OF.zoom ? F.filter(function (o) { return o.huddle === 'on'; }).length : '–', OF.zoom ? '7:30 AM · ' + ofDayLabel(OF.zoom.date) : '') +
      mini('Break check · Action', brkData ? F.filter(function (o) { return o.brk && o.brk.st === 'Action'; }).length : '–', brkData ? 'last check ' + ofDayLabel(brkData.days[brkData.days.length - 1]) : 'loading') +
      mini('Calls · ' + (SL ? SL.dayLabel : 'last report'), SL ? Number(SL.totalCalls).toLocaleString('en-US') : '–', SL ? SL.totalSignups + ' half-day sign-ups' : '');
    // visitors
    var C = OF.clients || [], A = OF.applicants || [];
    var CB = C.filter(function (c) { return c.room === 'client'; }).length;
    $('#td-vis').innerHTML = mini('Clients', C.length, (C.slice(0, 3).map(function (c) { return c.n; }).join(', ') || 'none right now') + (CB ? ' · ' + CB + ' in a breakout room with the team' : ''), true) + mini('Applicants', A.length, A.slice(0, 3).map(function (a) { return a.n + (a.pos ? ' (' + a.pos + ')' : ''); }).join(', ') || 'none right now', true);
    // reports
    var R = OF.reports;
    $('#td-rep-sub').textContent = R ? 'from Slack · updated ' + ofPT(R.at) + ' PT' : 'from Slack';
    var RL = ofReps(); $('#td-reps').innerHTML = RL.length ? RL.slice(0, 7).map(function (x) { return '<li><b>' + esc(x.head) + '</b><time>' + ofAgo(x.posted) + '</time><small>' + esc(x.cat) + (x.sum ? ' · ' + esc(x.sum) : '') + '</small></li>'; }).join('') : (R ? '<li class="td-empty">No automation reports posted yet today.</li>' : '<li class="td-empty">Reports appear after the hourly refresh runs.</li>');
  }
  function tdOpenPerson(pid) {
    tab('office');
    var t = setInterval(function () { if (OF.started === 'ready') { clearInterval(t); ofSelect(pid, true); } }, 300);
    setTimeout(function () { clearInterval(t); }, 30000);
  }
  (function () {
    var v = $('[data-view="today"]'); if (!v) return;
    v.addEventListener('click', function (e) {
      var g = e.target.closest('[data-go]'); if (g) { tab(g.dataset.go); return; }
      var p = e.target.closest('[data-pid]'); if (p) tdOpenPerson(p.dataset.pid);
    });
  })();

  /* ---------- Voice mode: speak a question, Claude answers from this dashboard's live data and reads it aloud ---------- */
  var VC = { dict: null, turns: [], busy: false, mute: false, heard: '', tts: undefined };
  (function () {
    var el = document.createElement('div'); el.className = 'vc'; el.id = 'vc'; el.hidden = true; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Voice assistant');
    el.innerHTML = '<div class="vc-card"><div class="vc-top"><span><b>CW Voice</b><br><small>Answers from this dashboard’s live data · read-only · <span id="vc-voice">Voice: Kokoro · Heart</span></small></span><button type="button" class="vc-mute" id="vc-mute" aria-label="Mute the spoken answer" title="Mute">🔊</button><button type="button" id="vc-x" aria-label="Close">×</button></div>' +
      '<div class="vc-stage"><button type="button" class="vc-orb" id="vc-orb" aria-label="Talk"></button><div class="vc-state" id="vc-state">Tap the orb and ask a question</div></div>' +
      '<div class="vc-log" id="vc-log" aria-live="polite"></div>' +
      '<form class="vc-form" id="vc-form"><input id="vc-in" placeholder="Or type: who is idle right now?" autocomplete="off" aria-label="Question"><button type="submit">Ask</button></form>' +
      '<div class="vc-hint">Try “Who missed the huddle?”, “How many sign-ups yesterday?”, “Open Jowee’s EOD”, “Show me the ISA floor”.</div></div>';
    document.body.appendChild(el);
    var top = document.createElement('button'); top.type = 'button'; top.className = 'voice-top'; top.id = 'voice-top'; top.innerHTML = '<i aria-hidden="true"></i>Ask by voice';
    var bar = $('.topbar'); if (bar) bar.insertBefore(top, $('#live-read'));
    try { if (window.claude && claude.use) claude.use('dictation').then(function (d) { VC.dict = d; if (d) { d.onPartial(function (x) { vcState('“' + (VC.heard + ' ' + x.text).trim() + '”'); }); d.onFinal(function (x) { VC.heard = (VC.heard + ' ' + x.text).trim(); vcState('“' + VC.heard + '”'); });
      d.onState(function (x) { var L = x.state === 'listening'; $('#vc').classList.toggle('listening', L); if (!L && VC.heard) { var q = VC.heard; VC.heard = ''; vcAsk(q); } else if (!L && x.reason !== 'stopped' && x.reason !== 'viewer_stopped') vcState('Tap the orb and ask a question'); }); } }, function () {}); } catch (e) {}
  })();
  function vcState(t) { $('#vc-state').textContent = t; }
  function vcOpen(listen) {
    $('#vc').hidden = false;
    try { KK.ctx = KK.ctx || new (window.AudioContext || window.webkitAudioContext)(); KK.ctx.resume(); } catch (e) {}
    kkLoad();
    if (listen) vcListen(); else $('#vc-in').focus();
  }
  function vcListen() {
    vcHush();
    if (!VC.dict) { vcState('Voice input isn’t available in this app — type your question below.'); $('#vc-in').focus(); return; }
    if ($('#vc').classList.contains('listening')) { VC.dict.stop().catch(function () {}); return; }
    VC.heard = ''; vcState('Listening…');
    VC.dict.start().catch(function (e) { vcState(e && e.code === 'not_granted' ? 'Microphone not allowed — type your question below.' : 'Couldn’t start listening — type your question below.'); });
  }
  function vcSpeak(text) {
    if (VC.mute) return;
    vcHush();
    var clean = String(text).replace(/[*_#•]/g, '').replace(/\s+/g, ' ');
    kkSpeak(clean).then(function (ok) { if (!ok && !VC.mute) vcClaudeSpeak(clean); }, function () { if (!VC.mute) vcClaudeSpeak(clean); });
  }
  /* Claude's built-in voice (tts capability): used while Heart is still loading, or where it can't run */
  function vcClaudeSpeak(text) {
    var go = function (t) { VC.tts = t; if (!t) { vcBrowserSpeak(text); return; } t.speak(text.slice(0, 2000), { voice: 'airy' }).catch(function (e) { if (e && e.code === 'unavailable') { VC.tts = null; vcBrowserSpeak(text); } }); };
    if (VC.tts !== undefined) go(VC.tts); else (window.claude && claude.use ? claude.use('tts') : Promise.resolve(null)).then(go, function () { go(null); });
  }
  function vcHush() { kkStop(); try { if (VC.tts) VC.tts.stop(); } catch (e) {} try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {}
  }
  function vcBrowserSpeak(text) {
    if (!window.speechSynthesis) return;
    try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(text.replace(/[*_#•]/g, '').replace(/\s+/g, ' ')); var vs = speechSynthesis.getVoices(); var pick = vs.filter(function (v) { return /en-US/i.test(v.lang) && /Samantha|Google US English|Natural|Aria|Jenny/i.test(v.name); })[0] || vs.filter(function (v) { return /^en/i.test(v.lang); })[0]; if (pick) u.voice = pick; u.rate = 1.03; speechSynthesis.speak(u); } catch (e) {}
  }
  function vcLive() {
    ofBuild();
    var P = OF.people || [], line = function (o) { var b = [o.p.name + ' (' + o.p.dept + ')', o.present ? 'in' : 'not in'];
      if (o.z) b.push('Zoom ' + ofPT(o.z.j) + (o.z.l ? '–' + ofPT(o.z.l) : ' still in')); if (o.huddle) b.push('huddle ' + (o.huddle === 'late' ? o.late + ' min late' : o.huddle));
      if (o.td) b.push('Time Doctor ' + (o.td.state === 'idle' ? 'idle ' + o.td.mins + ' min' : o.td.state)); if (o.brk) b.push('break check ' + o.brk.st + ' ' + o.brk.d);
      if (o.eod) b.push('EOD ' + o.eod.date + (o.eod.blockers ? ' blocker: ' + o.eod.blockers.slice(0, 80) : '')); if (o.slack) b.push('calls ' + (o.slack.calls != null ? o.slack.calls : '?') + ', sign-ups ' + (o.slack.signups != null ? o.slack.signups : '?'));
      if (o.attn && o.attn.length) b.push('ATTENTION: ' + o.attn.join('; ')); return b.join(', '); };
    return '\nLIVE TEAM (' + (OF.zoom ? 'Zoom day ' + OF.zoom.date + (OF.zoomFresh ? ', live' : ', not live') : 'no Zoom data') + (OF.td ? '; Time Doctor as of ' + ofPT(OF.td.at) : '') + '):\n' + P.map(line).join('\n') +
      '\nVISITORS: clients ' + ((OF.clients || []).map(function (c) { return c.n; }).join(', ') || 'none') + '; applicants ' + ((OF.applicants || []).map(function (a) { return a.n + (a.pos ? ' (' + a.pos + ')' : ''); }).join(', ') || 'none') +
      (OF.slack ? '\nISA END-OF-SHIFT REPORT ' + OF.slack.day + ': total calls ' + OF.slack.totalCalls + ', half-day sign-ups ' + OF.slack.totalSignups : '') +
      (OF.reports ? '\nLATEST SLACK AUTOMATION REPORTS: ' + OF.reports.items.slice(0, 12).map(function (it) { return '#' + it.chName + ' ' + it.posted.slice(0, 10) + ' "' + ofPlain(it.title) + '": ' + ofPlain(it.text).slice(0, 220); }).join(' | ') : '') +
      '\nDASHBOARD PAGES you can open: ' + Object.keys(TITLES).map(function (k) { return k + ' = ' + TITLES[k][0]; }).join('; ');
  }
  function vcAdd(cls, html) { var d = document.createElement('div'); d.className = cls; d.innerHTML = html; $('#vc-log').appendChild(d); $('#vc-log').scrollTop = 1e6; return d; }
  async function vcAsk(q) {
    q = String(q || '').trim(); if (!q || VC.busy) return;
    vcAdd('vc-q', esc(q)); $('#vc-in').value = '';
    if (!sample) { vcAdd('vc-a', '<p>Asking Claude isn’t available in this view.</p>'); return; }
    VC.busy = true; $('#vc').classList.add('thinking'); vcState('Thinking…');
    var out = vcAdd('vc-a', '<p class="thinking">…</p>');
    VC.turns.push({ role: 'user', content: q });
    var sys = 'You are CW Voice, the voice assistant on Club Wealth’s monitoring dashboard, talking to Tara (admin). Your answer is read aloud, so: 1-3 short spoken sentences, plain words, numbers written as digits, no lists, no markdown. Answer only from the data below; if it isn’t there, say what’s missing. Do not rank or label people as good or bad performers; report facts. ' +
      'If the question asks to see, open or show something, end with one last line exactly like ACTION: open <page key> (e.g. ACTION: open eod) or ACTION: person <full name from LIVE TEAM> to fly to that person in the 3D office. Otherwise no ACTION line.\n\nDATA\n' + CONTEXT + keapCtx() + vcLive();
    var convo = VC.turns.slice(-6).map(function (t, i, a) { return i === a.length - 1 ? { role: 'user', content: sys + '\n\nQUESTION\n' + t.content } : t; });
    try {
      var res = await sample(convo, { modelTier: 'default', cache: false, onText: function (e) { out.innerHTML = render(e.text.replace(/\n?ACTION:.*$/s, '')); } });
      var text = res.text || '', m = text.match(/ACTION:\s*(open|person)\s+(.+)\s*$/im), say = text.replace(/\n?ACTION:.*$/s, '').trim();
      out.innerHTML = render(say); VC.turns.push({ role: 'assistant', content: text }); vcSpeak(say);
      if (m) {
        var kind = m[1].toLowerCase(), arg = m[2].trim().replace(/[."']+$/, '');
        if (kind === 'open' && TITLES[arg]) { out.insertAdjacentHTML('beforeend', '<span class="vc-act">→ Opening ' + esc(TITLES[arg][0]) + '</span>'); tab(arg); }
        if (kind === 'person') { var hit = (OF.people || []).filter(function (o) { return o.p.full.toLowerCase() === arg.toLowerCase() || o.p.name.toLowerCase() === arg.toLowerCase(); })[0]; if (hit) { out.insertAdjacentHTML('beforeend', '<span class="vc-act">→ Showing ' + esc(hit.p.name) + ' in the 3D office</span>'); tdOpenPerson(hit.p.id); } }
      }
      vcState('Tap the orb to ask another question');
    } catch (e) {
      VC.turns.pop(); out.innerHTML = '<p>' + (e && e.code === 'not_granted' ? 'Claude wasn’t allowed for this page.' : e && e.code === 'rate_limited' ? 'Too many questions at once — give it a minute.' : 'Something went wrong. Try again.') + '</p>'; vcState('');
    }
    VC.busy = false; $('#vc').classList.remove('thinking');
  }
  (function () {
    $('#voice-top').addEventListener('click', function () { vcOpen(!!VC.dict); });
    $('#td-voice').addEventListener('click', function () { vcOpen(!!VC.dict); });
    $('#vc-orb').addEventListener('click', vcListen);
    $('#vc-x').addEventListener('click', function () { $('#vc').hidden = true; vcHush(); if (VC.dict && $('#vc').classList.contains('listening')) VC.dict.stop().catch(function () {}); });
    $('#vc-mute').addEventListener('click', function () { VC.mute = !VC.mute; this.textContent = VC.mute ? '🔇' : '🔊'; if (VC.mute) vcHush(); });
    $('#vc-form').addEventListener('submit', function (e) { e.preventDefault(); vcAsk($('#vc-in').value); });
    $('#vc').addEventListener('click', function (e) { if (e.target.id === 'vc') $('#vc-x').click(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('#vc').hidden) $('#vc-x').click(); });
  })();
