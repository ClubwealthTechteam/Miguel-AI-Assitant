
  /* ---------- Refresh now: runs the scheduled "3D office refresh" task on demand (Claude Code Remote connector) ---------- */
  var OF_TRIG = 'trig_016yRr4L8f6JqW3xFhhX2TZN';
  function ofRefreshNow(auto) {
    var bs = $$('.cw-refresh'), say = function (t, busy) { bs.forEach(function (b) { b.textContent = t; b.disabled = !!busy; }); };
    if (OF.refAt && Date.now() - OF.refAt < 150000) return;
    say('Starting refresh…', true);
    var before = OF.zoom && OF.zoom.at;
    (window.claude && claude.use ? claude.use('mcp') : Promise.resolve(null)).then(function (mcp) {
      if (!mcp) throw { code: 'not_granted' };
      return mcp.callTool('Claude Code Remote', 'fire_trigger', { trigger_id: OF_TRIG });
    }).then(function () {
      OF.refAt = Date.now(); say('Refreshing · about 1–2 min', true);
      var t = setInterval(function () {
        var done = OF.zoom && OF.zoom.at !== before;
        if (done || Date.now() - OF.refAt > 300000) { clearInterval(t); say(done ? 'Updated ' + ofPT(OF.zoom.at) + ' · Refresh' : 'Refresh now', false); }
      }, 3000);
    }, function (e) {
      var c = e && e.code;
      if (auto && c !== 'rate_limited' && c !== 'timeout') OF.autoOff = true;   // e.g. connector not allowed: stop trying on its own
      say(c === 'not_granted' || c === 'server_not_connected' ? 'Refresh needs the Claude Code connector' : c === 'blocked_by_policy' ? 'Refresh isn’t allowed here' : 'Couldn’t start a refresh · try again', false);
      setTimeout(function () { say('Refresh now', false); }, 6000);
    });
  }
  document.addEventListener('click', function (e) { if (e.target.closest('.cw-refresh')) { OF.autoOff = false; ofRefreshNow(); } });
  /* Auto-refresh every 10 minutes while the dashboard is open on screen (weekdays 5 AM–6 PM PT).
     Scheduled tasks can run at most hourly, so the open page starts the same refresh task itself; it skips
     when the Zoom data is already under 10 minutes old (e.g. someone else just refreshed). */
  var OF_AUTO_MS = 10 * 60000;
  setInterval(function () {
    if (OF.autoOff || document.hidden || !(window.claude && claude.use)) return;
    var now = new Date(), h = ofHourPT(), dow = new Date(ofTodayPT() + 'T12:00:00Z').getUTCDay();
    if (dow === 0 || dow === 6 || h < 5 || h >= 18) return;
    ofZoomSub();
    var age = OF.zoom && OF.zoom.at ? now - Date.parse(OF.zoom.at) : Infinity;
    if (age < OF_AUTO_MS || (OF.refAt && now - OF.refAt < OF_AUTO_MS)) return;
    ofRefreshNow(true);
  }, 60000);

  /* ---------- Morning brief: a ~20-second spoken summary, built from the live data on this page ---------- */
  function vcBriefText() {
    ofBuild();
    var P = OF.people || [], staff = P.filter(function (o) { return !o.p.boss; }), h = ofHourPT();
    var inNow = staff.filter(function (o) { return o.present; }).length, live = OF.zoomFresh;
    var names = function (L) { L = L.map(function (o) { return o.p.name; }); return L.length <= 1 ? L.join('') : L.length === 2 ? L.join(' and ') : L.slice(0, -1).join(', ') + ' and ' + L[L.length - 1]; };
    var out = [(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening') + ', Tara. It’s ' + ofPT(new Date()) + '.'];
    if (live) out.push(inNow + ' of ' + staff.length + ' people are in the Help Desk Zoom.');
    else out.push(OF.zoom ? 'The Help Desk Zoom isn’t live right now.' : 'There’s no Zoom data yet today.');
    if (OF.zoom && OF.zoom.date === ofTodayPT()) {
      var late = staff.filter(function (o) { return o.huddle === 'late'; }), missed = staff.filter(function (o) { return o.huddle === 'missed' && o.p.group !== 'coach'; });
      if (h >= 8) out.push(late.length ? late.length + (late.length === 1 ? ' person was' : ' people were') + ' late to the 7:30 huddle' + (late.length <= 4 ? ': ' + names(late) + '.' : '.') : 'Everyone who joined made the 7:30 huddle on time.');
      if (h >= 9 && missed.length && missed.length <= 5) out.push(names(missed) + (missed.length === 1 ? ' hasn’t' : ' haven’t') + ' joined Zoom yet.');
    }
    var away = staff.filter(function (o) { return o.away && o.away.kind !== 'client'; });
    if (away.length) out.push(away.length === 1 ? names(away) + ' is on a break.' : away.length + ' people are on a break.');
    var bo = (OF.breakouts || []).filter(function (r) { return r.clients.length; });
    if (bo.length) out.push(bo.length === 1 ? 'One client is with ' + (names(bo[0].staff.map(function (id) { return P.filter(function (o) { return o.p.id === id; })[0]; }).filter(Boolean)) || 'the team') + ' in a breakout room.' : bo.length + ' clients are in breakout rooms with the team.');
    else if ((OF.clients || []).length) out.push((OF.clients.length === 1 ? 'One client is' : OF.clients.length + ' clients are') + ' waiting at reception.');
    if ((OF.applicants || []).length) out.push((OF.applicants.length === 1 ? 'One applicant is' : OF.applicants.length + ' applicants are') + ' in the applicant lounge.');
    var attn = P.filter(function (o) { return o.attn && o.attn.length; });
    if (attn.length) out.push(attn.length + (attn.length === 1 ? ' person needs' : ' people need') + ' your attention; the list is on the Today page.');
    if (OF.slack) out.push('Last ISA report, ' + OF.slack.dayLabel + ': ' + Number(OF.slack.totalCalls).toLocaleString('en-US') + ' calls and ' + OF.slack.totalSignups + ' half-day sign-ups.');
    var R = ofReps(), al = R.filter(function (x) { return x.alert; });
    if (al.length) out.push('Heads up: ' + al[0].head + '.');
    else if (R.length) out.push(R.length + (R.length === 1 ? ' automation report has' : ' automation reports have') + ' posted today.');
    return out.join(' ');
  }
  function vcBrief() {
    try { localStorage.setItem('cw-brief', ofTodayPT()); } catch (e) {}
    var t = vcBriefText(); vcAdd('vc-q', 'Morning brief'); vcAdd('vc-a', '<p>' + esc(t) + '</p>'); vcSpeak(t); vcState('Tap the orb to ask a question');
  }
  (function () {
    var st = $('#vc .vc-stage'); if (st) { var b = document.createElement('button'); b.type = 'button'; b.className = 'vc-brief'; b.id = 'vc-brief'; b.textContent = '▶ Morning brief'; st.appendChild(b); b.addEventListener('click', vcBrief); }
    var hero = $('.td-hero-l'); if (hero) { var r = document.createElement('div'); r.className = 'td-acts'; r.innerHTML = '<button type="button" class="td-act" id="td-brief">▶ Play morning brief</button><button type="button" class="td-act cw-refresh">Refresh now</button>'; hero.appendChild(r); $('#td-brief').addEventListener('click', function () { vcOpen(false); if (!VC.briefed) vcBrief(); }); }
  })();
  /* the first time voice mode opens each day (from 6 AM), it starts with the brief */
  var vcOpenBase = vcOpen;
  vcOpen = function (listen) {
    var due = false; try { due = ofHourPT() >= 6 && localStorage.getItem('cw-brief') !== ofTodayPT(); } catch (e) {}
    VC.briefed = due; vcOpenBase(due ? false : listen); if (due) vcBrief();
  };
