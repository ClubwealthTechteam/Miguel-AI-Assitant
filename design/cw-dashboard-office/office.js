
  /* ---------- 3D office ----------
     A live floor plan of the Club Wealth office for Tara: Client Care at reception, the admin departments, the ISA floor,
     the Huddle Room, Tara's office and the café. Who is at their desk comes from Zoom (the all-day "Club Wealth Help Desk"
     room, first join = clock-in, last leave = clock-out), written by a Claude routine into this page's db doc zoom/attendance.
     The ring under each ISA is their last ISA break check (ISA Break Check Log); admins show their latest EOD report.
     Roster: the recruiting CRM's "Team (Onboarding)" tab (Club Wealth staff only), plus any ISA new to the break check log. */
  var OF_ROSTER = (function () {
    var out = [];
    function add(group, dept, name, full, o) { o = o || {}; out.push({ id: 'p' + out.length, group: group, dept: dept, name: name, full: full, alias: o.alias || [], eod: o.eod || '', brk: o.brk || '' }); }
    add('manager', 'Admin', 'Tara', 'Tara Hellickson', { alias: ['tara'] }); out[out.length - 1].boss = true;
    add('manager', 'Head Admin', 'Camille', 'Camille', { alias: ['camille'], eod: 'Camille' });
    add('reception', 'Client Care', 'Jowee', 'Jowelyn Masangya', { alias: ['jowee', 'jowelyn'], eod: 'Jowee (Jowelyn)' });
    add('reception', 'Client Care', 'Joshua', 'Joshua Ymmanuel M. Espulgar', { alias: ['joshua'], eod: 'Joshua' });
    add('reception', 'Client Care', 'Jizel', 'Jizel Verdida Cañada', { alias: ['jizel'], eod: 'Jizel' });
    add('admin', 'Admin & Events', 'Andrea', 'Andrea Uy', { eod: 'Andrea Uy' });
    add('admin', 'Admin & Events', 'Amrissa', 'Amrissa Marbella', { alias: ['am', 'amrissa'], eod: 'Amrissa' });
    add('admin', 'Admin & Events', 'Liz', 'Liz Sarreal', { alias: ['liz', 'capili'], eod: 'Liz Capili' });
    add('admin', 'AI & Tech', 'Ali-Ace', 'Ali-Ace Berico', { alias: ['ali', 'ali ace', 'aliace'], eod: 'Ali-Ace Berico' });
    add('admin', 'Admin & Events', 'Kathleen', 'Kathleen', { alias: ['kathleen'], eod: 'Kathleen' });
    add('admin', 'Marketing', 'Jay Mar', 'Jay Mar Avelino', { alias: ['jay', 'jay mar', 'jaymar'], eod: 'Jay Mar' });
    add('admin', 'Marketing', 'Randy', 'Randy Lopez', { eod: 'Randy Lopez' });
    add('admin', 'Marketing', 'Becky', 'Becky Namarome', { alias: ['becky'], eod: 'Becky Namarome' });
    add('rm', 'RM', 'Joe', 'Joe Aynndrian A. Leonidas', { alias: ['joe', 'leonidas'] });
    add('rm', 'RM', 'Vanessa', 'Maria Vanessa G. Sembrano', { alias: ['vanessa', 'sembrano'] });
    add('rm', 'RM', 'Andrew', 'Andrew Kuji Kimura', { alias: ['andrew'] });
    add('rm', 'RM', 'Beula', 'Beula Kryss Jambalos', { alias: ['beula'] });
    add('rm', 'RM', 'Ebi', 'Ebimo Dogubo', { alias: ['ebi', 'ebimo'] });
    add('rm', 'RM', 'Francis', 'Francis Narciso', { alias: ['francis'] });
    add('rm', 'RM', 'Marcia', 'Marcia', { alias: ['marcia'] });
    add('coach', 'ISA Coach', 'Ron', 'Ron Anderson', { alias: ['ron'] });
    add('admin', 'AI & Tech', 'Miguel', 'Krishan Miguel Ababon', { alias: ['miguel'], eod: 'Miguel Ababon' });
    add('admin', 'AI & Tech', 'Omerson', 'Omerson Cruz', { alias: ['omerson'], eod: 'Omerson Cruz' });
    [['Aaevah Akpan', 'Faith "Aaevah" Akpan', ['aaevah', 'faith']], ['Alleah Galam', 'Alleah Joy Galam', ['alleah']], 
      ['Brian Ceniza', 'Brian Ceniza', ['brian']], ['Christina Labadia', 'Ma. Christina Labadia', ['christina']],
      ['Clint Lequin', 'Clint Ivan Dominic Lequin', ['clint']], ['Dave Tamparong', 'Dave Tamparong', ['dave']], ['Dona Dionglay', 'Ma. Dona Dionglay', ['dona']],
      ['Ejay Melano', 'Epifanio Jhan Elvinze Melano', ['ejay']], ['Emie Esclamado', 'Emie Jane Esclamado', ['emie']],
      ['Gabriel Garin', 'Gabriel Garin', ['gabriel']], ['Hazel Bonayon', 'Hazel Bonayon', ['hazel']], ['Jam David', 'Gehaimy Jam David', ['jam']],
      ['Jeff Napisa', 'Jefferson Napisa', ['jeff', 'jefferson']], ['Jeriza Trasmil', 'Jeriza Trasmil', ['jeriza']], ['Jonalisa Caponpon', 'Jonalisa Arabiana Caponpon', ['jonalisa']],
      ['Katrina Buan', 'Katrina Buan', ['katrina']], ['L.A Patulan', 'L.A Patulan', ['l a', 'la', 'sam']], ['Lily Delantes', 'Lily Delantes', ['lily']],
      ['Lolita Esma', 'Lolita Mae Esma', ['lolita']], ['Mark Abarcar', 'Mark Jayson Abarcar', ['mark']], ['Mary Jane Llaban', 'Mary Jane Llaban', ['mary jane']],
      ['Melchan Portugal', 'Melchan Portugal', ['melchan']], ['RJ Torsiende', 'RJ Torsiende', ['rj']], ['Rod Velasco', 'Rod Velasco', ['rod']],
      ['Rome Flores', 'Jerome Flores', ['rome', 'jerome']], ['Ruth Lagahit', 'Ruth Ann L. Lagahit', ['ruth']], ['Shayne Balmes', 'Nilma Shayne Balmes', ['shayne']]
    ].forEach(function (r) { add('isa', 'ISA', r[0], r[1], { alias: r[2], brk: r[0] }); });
    return out;
  })();

  var OF_TD_CO = 'ZEmW6RI99WzV9fET';   // Time Doctor company: Club Wealth
  var OF = { applicants: [], reports: null, clients: [], td: null, tdMap: {}, slack: null, replay: null, started: false, three: null, people: [], zoom: null, view: 'now', viewAuto: true, eff: 'now', filter: 'all', q: '', sel: null, running: false };
  function ofNorm(s) { return String(s || '').split('_')[0].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z ]+/g, ' ').trim().split(/\s+/).filter(Boolean); }
  function ofPT(d) { return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' }); }
  function ofTodayPT() { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' }); }
  function ofHourPT() { var p = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Los_Angeles' }).split(':'); return +p[0] + p[1] / 60; }
  function ofDayLabel(d) { return new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }); }
  /* Huddle start for a PT day, as a UTC instant (handles PST/PDT). */
  function ofHuddleAt(day, hm) {
    var guess = Date.parse(day + 'T' + hm + ':00Z'), off = 0;
    for (var i = 0; i < 2; i++) { var s = new Date(guess + off).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Los_Angeles' }); var p = s.split(':'), want = hm.split(':'); var diff = (+want[0] * 60 + +want[1]) - (+p[0] * 60 + +p[1]); if (diff > 720) diff -= 1440; if (diff < -720) diff += 1440; off += diff * 60000; }
    return guess + off;
  }

  /* One matcher for every outside name (Zoom display names, Time Doctor users, Slack report lines). */
  function ofMatcher() {
    var R = OF_ROSTER.map(function (p) {
      var t = ofNorm(p.full), n = ofNorm(p.name);
      return { p: p, first: n.join(' '), firstTok: n[0], last: t[t.length - 1], full: t, alias: p.alias.map(function (a) { return ofNorm(a).join(' '); }) };
    });
    var uniq = function (list) { return list.length === 1 ? list[0] : null; };
    return function (name) {
      var t = ofNorm(name); if (!t.length) return null;
      var joined = t.join(' '), hit = uniq(R.filter(function (r) { return r.full.length > 1 && t.indexOf(r.firstTok) >= 0 && t.indexOf(r.last) >= 0; }));
      if (!hit) hit = uniq(R.filter(function (r) { return joined === r.first || r.alias.indexOf(joined) >= 0; }));
      if (!hit) hit = uniq(R.filter(function (r) { return [r.first].concat(r.alias).some(function (a) { return a && (joined + ' ').indexOf(a + ' ') === 0; }); }));
      if (!hit && t.length > 1) hit = uniq(R.filter(function (r) { return r.last === t[t.length - 1]; }));
      return hit ? hit.p : null;
    };
  }
  /* Time Doctor: the latest activity block per person today → working / idle N min / on break */
  function ofTdParse(rows) {
    var by = {}, now = Date.now(), who = ofMatcher(), out = {};
    rows.forEach(function (r) { var k = r.userName; if (!k) return; var e = Date.parse(r.end), st = Date.parse(r.start); var b = by[k] = by[k] || { first: st, last: 0, mode: '' }; if (st < b.first) b.first = st; if (e >= b.last) { b.last = e; b.mode = r.mode || ''; b.lastStart = st; } });
    Object.keys(by).forEach(function (k) {
      var b = by[k], p = who(k); if (!p) return;
      var mins = Math.max(0, Math.round((now - b.last) / 60000)), brk = /break/i.test(b.mode);
      out[p.id] = { name: k, first: b.first, last: b.last, mins: mins, state: brk && mins < 20 ? 'break' : mins <= 7 ? 'working' : 'idle', breakStart: brk ? b.lastStart : null };
    });
    return out;
  }
  function ofTdLoad() {
    if (OF.tdBusy || !(window.claude && claude.use)) return;
    OF.tdBusy = true;
    claude.use('mcp').then(function (mcp) {
      if (!mcp) throw { code: 'not_granted' };
      var day = ofTodayPT();
      return mcp.callTool('Time Doctor', 'td_get_worklog', { company: OF_TD_CO, from: day, to: day, timezone: 'America/Los_Angeles', detail: 'summary', fields: ['userName', 'start', 'end', 'mode'], limit: 500 }, { cache: { staleTime: 60000, refresh: true } });
    }).then(function (r) {
      var pl = r.payload; if (pl && typeof pl === 'string') { try { pl = JSON.parse(pl); } catch (x) {} }
      OF.tdBusy = false; OF.tdErr = null; OF.td = { at: r.cache ? r.cache.storedAt : Date.now() }; OF.tdMap = ofTdParse((pl && pl.data) || []);
      ofBuild(); ofApply();
    }).catch(function (e) { OF.tdBusy = false; OF.tdErr = (e && e.code) || 'error'; ofHud(); });
  }
  /* Slack #cw-isa end-of-shift report (copied into this page's db by the hourly routine) */
  function ofSlackFor(p) {
    var S = OF.slack; if (!S) return null;
    var key = ofNorm(p.brk || p.full).join(' '), first = ofNorm(p.name)[0], out = {};
    ['calls', 'signups'].forEach(function (f) { var m = S[f] || {}; Object.keys(m).forEach(function (n) { var t = ofNorm(n); if (t.join(' ') === key || (t.length === 1 && t[0] === first)) out[f] = m[n]; }); });
    return out.calls == null && out.signups == null ? null : out;
  }
  function ofSlackHtml(text) {
    var E = { ':clipboard:': '📋', ':fire:': '🔥', ':white_check_mark:': '✅', ':o:': '⭕', ':trophy:': '🏆', ':star:': '⭐', ':telephone_receiver:': '📞', ':calendar:': '📅' };
    return esc(text).replace(/:[a-z0-9_+-]+:/g, function (m) { return E[m] || ''; }).replace(/\*([^*\n]+)\*/g, '<b>$1</b>').replace(/(^|\s)_([^_\n]+)_/g, '$1<i>$2</i>').replace(/&amp;amp;/g, '&amp;').replace(/\n/g, '<br>');
  }

  /* Match the names people typed in Zoom to the roster. */
  function ofMatchZoom(doc) {
    var map = {}, other = [];
    if (!doc || !doc.people) return { map: map, other: other };
    var R = OF_ROSTER.map(function (p) {
      var t = ofNorm(p.full), n = ofNorm(p.name);
      return { p: p, first: n.join(' '), firstTok: n[0], last: t[t.length - 1], full: t, alias: p.alias.map(function (a) { return ofNorm(a).join(' '); }) };
    });
    var uniq = function (list) { return list.length === 1 ? list[0] : null; };
    doc.people.forEach(function (z) {
      var t = ofNorm(z.n); if (!t.length) return;
      var joined = t.join(' '), hit = null;
      hit = uniq(R.filter(function (r) { return r.full.length > 1 && t.indexOf(r.firstTok) >= 0 && t.indexOf(r.last) >= 0; }));
      if (!hit) hit = uniq(R.filter(function (r) { return joined === r.first || r.alias.indexOf(joined) >= 0; }));
      if (!hit) hit = uniq(R.filter(function (r) { return [r.first].concat(r.alias).some(function (a) { return a && (joined + ' ').indexOf(a + ' ') === 0; }); }));
      if (!hit && t.length > 1) hit = uniq(R.filter(function (r) { return r.last === t[t.length - 1]; }));
      if (!hit) { other.push(z); return; }
      var m = map[hit.p.id];
      var ss = z.s && z.s.length ? z.s : [[z.j, z.l]];
      var brk = String(z.n).match(/[-_ (]+\s*(break|lunch|rr|cr|restroom|bio)\b/i), openS = ss.filter(function (q) { return !q[1]; }).pop();
      if (!m) m = map[hit.p.id] = { j: z.j, l: z.l, open: !!z.open, m: z.m || 0, names: [z.n], s: ss.slice() };
      else { if (z.j < m.j) m.j = z.j; if (z.open) m.open = true; if (z.l && (!m.l || z.l > m.l)) m.l = z.l; m.m += z.m || 0; m.names.push(z.n); m.s = m.s.concat(ss); }
      if (brk && z.open && openS) { var k = brk[1].toLowerCase(); m.away = { kind: k === 'lunch' ? 'lunch' : k === 'break' ? 'break' : 'rr', since: Date.parse(openS[0]), name: z.n }; }
    });
    Object.keys(map).forEach(function (k) { if (map[k].open) map[k].l = null; });
    return { map: map, other: other };
  }

  /* Combine roster + Zoom + break check + EOD into one record per person. */
  function ofBuild() {
    var roster = OF_ROSTER.slice();
    if (brkData) {
      var since = brkData.days[Math.max(0, brkData.days.length - 10)];
      var known = {}; roster.forEach(function (p) { if (p.brk) known[p.brk] = 1; });
      Array.from(new Set(brkData.rows.filter(function (r) { return r.d >= since; }).map(function (r) { return r.isa; }))).sort().forEach(function (n) {
        if (n && n !== 'Unassigned' && !known[n]) roster.push({ id: 'x' + roster.length, group: 'isa', dept: 'ISA', name: n, full: n, alias: [], eod: '', brk: n });
      });
    }
    var Z = ofMatchZoom(OF.zoom), doc = OF.zoom, today = ofTodayPT();
    var fresh = doc && doc.date === today && (Date.now() - Date.parse(doc.at)) < 3 * 3600000;
    var hud = doc ? ofHuddleAt(doc.date, doc.huddle || '07:30') : 0;
    OF.zoomOther = Z.other; OF.zoomFresh = !!fresh;
    var internal = /club ?wealth|tech team|homexa|hellickson|iphone|ipad|android|galaxy|zoom user/i;
    var atT = OF.replay != null && doc ? ofHuddleAt(doc.date, ('0' + Math.floor(OF.replay / 60)).slice(-2) + ':' + ('0' + OF.replay % 60).slice(-2)) : null;
    var visiting = function (z) {
      if (atT != null) return (z.s && z.s.length ? z.s : [[z.j, z.l]]).some(function (q) { return Date.parse(q[0]) <= atT && (!q[1] || Date.parse(q[1]) >= atT); });
      return fresh ? !!z.open : true;
    };
    var guests = Z.other.filter(function (z) { return !internal.test(z.n) && visiting(z); });
    OF.applicants = guests.filter(function (z) { return /_/.test(z.n); }).map(function (z) { var bits = z.n.split('_'); return { n: bits[0].trim() || z.n, pos: bits.slice(1).join(' ').trim(), raw: z.n, j: z.j, l: z.l, open: !!z.open }; });
    OF.clients = guests.filter(function (z) { return !/_/.test(z.n); }).map(function (z) { return { n: z.n, j: z.j, l: z.l, open: !!z.open }; });
    var tdLive = Object.keys(OF.tdMap).some(function (k) { return OF.tdMap[k].state !== 'idle' || OF.tdMap[k].mins < 45; });
    OF.eff = OF.viewAuto ? (fresh || tdLive ? 'now' : 'day') : OF.view;
    $$('#of-view button').forEach(function (x) { x.setAttribute('aria-pressed', String(OF.replay != null ? x.dataset.v === 'replay' : x.dataset.v === OF.eff)); });
    OF.people = roster.map(function (p) {
      var o = { p: p, z: Z.map[p.id] || null };
      if (p.brk && brkData) { var rows = brkData.rows.filter(function (r) { return r.isa === p.brk; }); o.brk = rows.length ? rows.reduce(function (a, b) { return b.d > a.d ? b : a; }) : null; }
      if (p.eod && eodData) { var er = eodData.rows.filter(function (r) { return r.person === p.eod; }); o.eod = er.length ? er.reduce(function (a, b) { return (b.date + b.submitted) > (a.date + a.submitted) ? b : a; }) : null; }
      if (o.z) { var late = Math.round((Date.parse(o.z.j) - hud) / 60000); o.huddle = late <= 0 ? 'on' : 'late'; o.late = late; } else o.huddle = doc ? 'missed' : null;
      o.inNow = !!(fresh && o.z && o.z.open);
      o.td = OF.tdMap[p.id] || null;
      var tdHere = !!(o.td && (o.td.state !== 'idle' || o.td.mins < 45));
      if (OF.replay != null && doc) {
        var at = ofHuddleAt(doc.date, ('0' + Math.floor(OF.replay / 60)).slice(-2) + ':' + ('0' + OF.replay % 60).slice(-2));
        o.present = !!(o.z && o.z.s.some(function (q) { return Date.parse(q[0]) <= at && (!q[1] || Date.parse(q[1]) >= at); }));
      } else o.present = p.boss ? true : OF.eff === 'day' ? !!(o.z || o.td) : (o.inNow || tdHere);
      o.slack = ofSlackFor(p);
      o.away = null;
      if (OF.replay == null && o.present && !p.boss) {
        var aw = o.z && o.z.away && (fresh || OF.eff === 'now') ? o.z.away : o.td && o.td.state === 'break' ? { kind: 'break', since: o.td.breakStart || Date.now(), name: 'Time Doctor break' } : null;
        if (aw) {
          var minsAway = Math.max(0, Math.round((Date.now() - aw.since) / 60000)), room = aw.kind === 'lunch' ? 'pantry' : aw.kind === 'rr' ? 'rr' : 'lounge';
          if (/^miguel/i.test(p.name) && aw.kind !== 'rr') room = minsAway < 15 ? 'pantry' : 'smoke';   // Miguel: 15 min pantry, then the smoking area
          o.away = { kind: aw.kind, room: room, mins: minsAway, name: aw.name };
        }
      }
      if (p.group === 'isa') { var st = o.brk ? o.brk.st : ''; o.st = st === 'OK' ? 'ok' : st === 'Review' ? 'review' : st === 'Action' ? 'action' : 'none'; o.badge = st === 'OK' || st === 'Review' || st === 'Action' ? st : ''; }
      else if (o.eod) {
        var recent = (Date.parse(today) - Date.parse(o.eod.date)) / 86400000 <= 3;
        o.st = o.eod.date === today ? 'eod' : recent && o.eod.blockers && !/^(none|n\/a|no|-)$/i.test(o.eod.blockers.trim()) ? 'help' : 'none';
        o.badge = o.st === 'eod' ? 'EOD in' : o.st === 'help' ? 'Needs help' : '';
      } else { o.st = 'none'; o.badge = ''; }
      return o;
    });
    var today = ofTodayPT(), wk = [1, 2, 3, 4, 5].indexOf(new Date(today + 'T12:00:00Z').getUTCDay()) >= 0, hr = ofHourPT(), zToday = doc && doc.date === today;
    OF.people.forEach(function (o) {
      var R = [];
      if (o.p.boss) { o.attn = R; return; }
      if (zToday && o.huddle === 'late' && o.late > 5) R.push('Late to the 7:30 huddle (+' + o.late + ' min)');
      if (zToday && wk && hr >= 8 && o.huddle === 'missed' && !o.td) R.push('Not in Zoom or Time Doctor today');
      if (o.p.group === 'isa' && o.brk && o.brk.st === 'Action') R.push('Break check: Action (' + ofDayLabel(o.brk.d) + ')');
      if (o.st === 'help') R.push('Asked for help in their EOD');
      if (o.td && o.td.state === 'idle' && o.td.mins >= 20 && o.td.mins < 240 && wk && hr >= 6 && hr < 17) R.push('Idle ' + o.td.mins + ' min in Time Doctor');
      o.attn = R;
    });
  }

  /* ---- Scene ----
     Real downloaded models (CC0): furniture from Poly Haven, people from Quaternius' Ultimate Modular Men/Women. They are
     published next to the page under office3d/. Repeated pieces are drawn as GPU instances, every seated person shares one
     baked pose per outfit, plain walls/floors are merged per material, shadows are rendered once, and the scene only
     re-renders when something changes, so the tab stays light. */
  var OF_ASSETS = ['metal_office_desk', 'SchoolChair_01', 'mid_century_lounge_chair', 'modern_arm_chair_01', 'sofa_02', 'coffee_table_round_01',
    'modern_coffee_table_01', 'side_table_01', 'potted_plant_02', 'potted_plant_04', 'steel_frame_shelves_01', 'metal_stool_02', 'modern_ceiling_lamp_01',
    'outdoor_table_chair_set_01', 'CoffeeCart_01', 'wall_clock'];
  var OF_PEOPLE = ['M_Suit', 'W_Suit', 'M_Casual', 'W_Casual', 'M_Hoodie', 'W_Formal'];
  function ofScript(src) { return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
  function ofLoadThree() {
    var base = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/';
    return (window.THREE ? Promise.resolve() : ofScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'))
      .then(function () { return Promise.all([THREE.GLTFLoader ? 0 : ofScript(base + 'loaders/GLTFLoader.js'), THREE.RoomEnvironment ? 0 : ofScript(base + 'environments/RoomEnvironment.js')]); })
      .then(function () { return window.THREE; });
  }
  function ofLoadAssets(T, prog) {
    var L = new T.GLTFLoader(), all = OF_ASSETS.concat(OF_PEOPLE.map(function (n) { return 'person_' + n; })), done = 0, out = {};
    return Promise.all(all.map(function (n) {
      return new Promise(function (res) {
        var fail = function () { done++; prog(done, all.length); res(); };
        fetch('office3d/' + n + '.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
          var s = atob(j.glb), u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
          L.parse(u.buffer, 'office3d/', function (g) { out[n] = g; done++; prog(done, all.length); res(); }, fail);
        }).catch(fail);
      });
    })).then(function () { return out; });
  }
  function ofHash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function ofTextCanvas(lines, w, h, o) {
    o = o || {}; var c = document.createElement('canvas'); c.width = w; c.height = h; var g = c.getContext('2d');
    if (o.bg) { g.fillStyle = o.bg; g.fillRect(0, 0, w, h); }
    g.textAlign = o.align || 'center'; g.textBaseline = 'middle';
    lines.forEach(function (L) {
      g.fillStyle = L.color || '#fff'; g.font = L.font;
      var ls = L.ls ? parseFloat(L.ls) : 0, size = +(L.font.match(/(\d+)px/) || [0, 0])[1];
      var setLs = function (v) { try { g.letterSpacing = v + 'px'; } catch (e) {} };
      setLs(ls);
      for (var k = 0; k < 12 && size && g.measureText(L.text).width > w * .92; k++) { size = Math.floor(size * .9); ls = ls * .9; g.font = L.font.replace(/\d+px/, size + 'px'); setLs(ls); }
      g.fillText(L.text, L.x != null ? L.x : w / 2, L.y); setLs(0);
    });
    return c;
  }
  function ofMossCanvas() {
    var c = document.createElement('canvas'); c.width = c.height = 256; var g = c.getContext('2d'), r = 9;
    g.fillStyle = '#2f5a2c'; g.fillRect(0, 0, 256, 256);
    var cols = ['#3d6b35', '#4c7d3c', '#2a4f27', '#5d8d45', '#6f9c4f', '#355f30'];
    for (var i = 0; i < 1400; i++) { r = (r * 9301 + 49297) % 233280; var x = r / 233280 * 256; r = (r * 9301 + 49297) % 233280; var y = r / 233280 * 256; r = (r * 9301 + 49297) % 233280;
      g.fillStyle = cols[i % cols.length]; g.beginPath(); g.arc(x, y, 3 + (r / 233280) * 7, 0, Math.PI * 2); g.fill(); }
    return c;
  }

  /* Pose a downloaded character in the seated typing pose and bake it to one static, vertex-coloured mesh. */
  function ofBakePerson(T, g) {
    var o = g.scene, V3 = T.Vector3, Q = T.Quaternion;
    o.updateMatrixWorld(true);
    var b = {}, skinned = [];
    o.traverse(function (n) {
      if (n.isBone) b[n.name] = n;
      if (n.isSkinnedMesh) {
        var bb = n.geometry.boundingBox || (n.geometry.computeBoundingBox(), n.geometry.boundingBox), c = bb.getCenter(new V3()), s = bb.getSize(new V3());
        if (!(Math.abs(c.x) > .45 && s.y < .5)) skinned.push(n);            // the suit outfit carries a pistol in its hand: leave it out
      }
    });
    function P(n) { return new V3().setFromMatrixPosition(b[n].matrixWorld); }
    function aim(bone, child, dir) {
      bone.updateMatrixWorld(true); child.updateMatrixWorld(true);
      var cur = new V3().setFromMatrixPosition(child.matrixWorld).sub(new V3().setFromMatrixPosition(bone.matrixWorld)).normalize();
      var d = new Q().setFromUnitVectors(cur, dir.clone().normalize()), bw = bone.getWorldQuaternion(new Q()), pw = bone.parent.getWorldQuaternion(new Q());
      bone.quaternion.copy(pw.invert().multiply(d.multiply(bw))); bone.updateMatrixWorld(true);
    }
    ['L', 'R'].forEach(function (s) {
      var sx = s === 'L' ? 1 : -1;
      if (!b['UpperLeg' + s] || !b['Foot' + s]) return;
      var shin = P('LowerLeg' + s).distanceTo(P('Foot' + s)), toe = b['PT' + s] ? P('PT' + s).sub(P('Foot' + s)) : null;
      aim(b['UpperLeg' + s], b['LowerLeg' + s], new V3(0, -.08, 1));
      var foot = P('LowerLeg' + s).add(new V3(0, -1, .1).normalize().multiplyScalar(shin));
      var F = b['Foot' + s]; F.parent.updateMatrixWorld(true); F.position.copy(F.parent.worldToLocal(foot.clone())); F.updateMatrixWorld(true);
      if (toe) { var Tt = b['PT' + s]; Tt.parent.updateMatrixWorld(true); Tt.position.copy(Tt.parent.worldToLocal(foot.clone().add(toe))); Tt.updateMatrixWorld(true); }
      aim(b['LowerLeg' + s], F, new V3(0, -1, .1));
      if (b['UpperArm' + s]) { aim(b['UpperArm' + s], b['LowerArm' + s], new V3(.15 * sx, -.85, .45)); aim(b['LowerArm' + s], b['Wrist' + s], new V3(-.1 * sx, -.1, 1)); }
    });
    o.updateMatrixWorld(true);
    var norm = function (a) { var t = a.array; return !a.normalized ? 1 : t instanceof Int8Array ? 127 : t instanceof Uint8Array ? 255 : t instanceof Int16Array ? 32767 : t instanceof Uint16Array ? 65535 : 1; };
    var pos = [], col = [], v = new V3(), acc = new V3(), tmp = new V3(), M = new T.Matrix4();
    skinned.forEach(function (mesh) {
      var geo = mesh.geometry, idx = geo.index, pa = geo.attributes.position, si = geo.attributes.skinIndex, sw = geo.attributes.skinWeight;
      var pn = norm(pa), wn = norm(sw), sk = mesh.skeleton, c = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material).color;
      var bm = sk.bones.map(function (bn, j) { return new T.Matrix4().multiplyMatrices(bn.matrixWorld, sk.boneInverses[j]); });
      var cnt = idx ? idx.count : pa.count;
      for (var q = 0; q < cnt; q++) {
        var i = idx ? idx.getX(q) : q;
        v.set(pa.getX(i) / pn, pa.getY(i) / pn, pa.getZ(i) / pn).applyMatrix4(mesh.bindMatrix); acc.set(0, 0, 0);
        var w = [sw.getX(i) / wn, sw.getY(i) / wn, sw.getZ(i) / wn, sw.getW(i) / wn], ix = [si.getX(i), si.getY(i), si.getZ(i), si.getW(i)], ws = w[0] + w[1] + w[2] + w[3] || 1;
        for (var k = 0; k < 4; k++) if (w[k]) { tmp.copy(v).applyMatrix4(bm[ix[k]]); acc.addScaledVector(tmp, w[k] / ws); }
        acc.applyMatrix4(mesh.bindMatrixInverse).applyMatrix4(mesh.matrixWorld);
        pos.push(acc.x, acc.y, acc.z); col.push(c.r, c.g, c.b);
      }
    });
    var out = new T.BufferGeometry();
    out.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); out.setAttribute('color', new T.Float32BufferAttribute(col, 3));
    // stand-up height ~1.86 → a 1.72 m adult; drop the hips onto a 0.5 m seat
    var hip = P(b.UpperLegL ? 'UpperLegL' : 'Hips'), head = b.Head ? P('Head') : new V3(0, 1.6, 0), sc = 1.72 / 1.86;
    out.applyMatrix4(M.makeScale(sc, sc, sc)); out.translate(0, .5 - hip.y * sc, -hip.z * sc + .04);
    out.computeVertexNormals(); out.computeBoundingSphere();
    return { geo: out, headY: (head.y - hip.y) * sc + .5 + .18 };
  }

  function ofInit(AS) {
    var T = window.THREE, stage = $('#of-stage');
    var renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.outputEncoding = T.sRGBEncoding; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false;
    stage.insertBefore(renderer.domElement, stage.firstChild);
    var scene = new T.Scene();
    var pm = new T.PMREMGenerator(renderer); scene.environment = pm.fromScene(new T.RoomEnvironment(), .04).texture; pm.dispose();
    var cam = new T.OrthographicCamera(-10, 10, 10, -10, 1, 400);
    var S = OF.three = { T: T, renderer: renderer, scene: scene, cam: cam, mats: {}, persons: [], lamps: [], night: null, dirty: true, pick: [],
      theta: .72, phi: .6, zoom: .62, target: new T.Vector3(7, 0, 0), goal: null, size: [1, 1] };
    var hemi = new T.HemisphereLight(0xffffff, 0xd8d0c0, .35); scene.add(hemi);
    var sun = new T.DirectionalLight(0xfff3e2, 1.25); sun.position.set(35, 48, 24); sun.target.position.set(0, 0, 0); scene.add(sun.target); sun.castShadow = true;
    sun.shadow.mapSize.set(4096, 4096); var sc = sun.shadow.camera; sc.left = -60; sc.right = 60; sc.top = 40; sc.bottom = -40; sc.near = 1; sc.far = 140; sun.shadow.bias = -.0003; sun.shadow.normalBias = .03; sun.shadow.radius = 3;
    scene.add(sun); S.hemi = hemi; S.sun = sun;

    function mat(c, o) { var k = c + JSON.stringify(o || {}); if (!S.mats[k]) { var p = Object.assign({ roughness: .78, metalness: 0 }, o || {}); p.color = new T.Color(c).convertSRGBToLinear(); if (p.emissive) p.emissive = new T.Color(p.emissive).convertSRGBToLinear(); S.mats[k] = new T.MeshStandardMaterial(p); } return S.mats[k]; }
    function lampMat(c) { var m = new T.MeshStandardMaterial({ color: new T.Color(c).convertSRGBToLinear(), emissive: new T.Color('#ffd9a0').convertSRGBToLinear(), emissiveIntensity: 0 }); S.lamps.push(m); return m; }
    function box(w, h, d, c, x, y, z, par, o) { var m = new T.Mesh(new T.BoxGeometry(w, h, d), c.isMaterial ? c : mat(c, o)); m.position.set(x, y, z); m.castShadow = !(o && o.noShadow); m.receiveShadow = true; (par || scene).add(m); return m; }
    function cyl(rt, rb, h, c, x, y, z, par, seg) { var m = new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg || 20), c.isMaterial ? c : mat(c)); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; (par || scene).add(m); return m; }
    function plane(w, d, c, x, y, z, par) { var m = new T.Mesh(new T.PlaneGeometry(w, d), c.isMaterial ? c : mat(c)); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; (par || scene).add(m); return m; }
    function texMat(canvas, o) { var t = canvas.isTexture ? canvas : new T.CanvasTexture(canvas); t.encoding = T.sRGBEncoding; t.anisotropy = 8; return new T.MeshBasicMaterial(Object.assign({ map: t, transparent: true, toneMapped: false }, o || {})); }
    function decal(lines, w, d, x, z, rot, op) { var c = ofTextCanvas(lines, 1024, Math.round(1024 * d / w)); var m = new T.Mesh(new T.PlaneGeometry(w, d), texMat(c, { opacity: op || .9, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.rotation.z = rot || 0; m.position.set(x, .03, z); m.userData.keep = 1; scene.add(m); return m; }
    var glass = new T.MeshPhysicalMaterial({ color: new T.Color('#dfeff5').convertSRGBToLinear(), transparent: true, opacity: .16, roughness: .04, metalness: 0, depthWrite: false, envMapIntensity: 1.4 });
    var frameC = '#1c1e22';

    /* --- Instanced placement of downloaded models --- */
    var INST = {}, TPL = {};
    function tpl(n) { if (TPL[n]) return TPL[n]; var g = AS[n]; if (!g) return null; g.scene.updateMatrixWorld(true); var bx = new T.Box3().setFromObject(g.scene); return (TPL[n] = { g: g, box: bx, size: bx.getSize(new T.Vector3()), c: bx.getCenter(new T.Vector3()) }); }
    var _m = new T.Matrix4(), _q = new T.Quaternion(), _e = new T.Euler(), _p = new T.Vector3(), _s = new T.Vector3();
    function put(n, par, x, y, z, ry, fit, tint) {
      var t = tpl(n); if (!t) return false; fit = fit || {};
      var u = fit.w ? fit.w / t.size.x : fit.h ? fit.h / t.size.y : fit.d ? fit.d / t.size.z : (fit.s || 1);
      _s.set(fit.w ? fit.w / t.size.x : u, fit.h ? fit.h / t.size.y : u, fit.d ? fit.d / t.size.z : u);
      var local = new T.Matrix4().compose(_p.set(x, y, z), _q.setFromEuler(_e.set(0, ry || 0, 0)), _s).multiply(_m.makeTranslation(-t.c.x, -t.box.min.y, -t.c.z));
      if (par) { par.updateMatrixWorld(true); local.premultiply(par.matrixWorld); }
      var key = n + '|' + (tint || ''); (INST[key] = INST[key] || { n: n, tint: tint, list: [] }).list.push(local);
      return true;
    }
    function flushInst() {
      Object.keys(INST).forEach(function (key) {
        var it = INST[key], t = tpl(it.n);
        t.g.scene.traverse(function (mesh) {
          if (!mesh.isMesh) return;
          var mt = mesh.material; if (it.tint) { mt = mt.clone(); mt.color.multiply(new T.Color(it.tint).convertSRGBToLinear()); }
          var im = new T.InstancedMesh(mesh.geometry, mt, it.list.length);
          it.list.forEach(function (L, i) { im.setMatrixAt(i, _m.multiplyMatrices(L, mesh.matrixWorld)); });
          im.castShadow = true; im.receiveShadow = true; im.userData.keep = 1; scene.add(im);
        });
      });
    }
    /* Small procedural pieces repeated at every desk (monitor, keyboard, status ring) as instances too */
    var PB = {};
    function pinst(key, geo, material, M, color) { (PB[key] = PB[key] || { geo: geo, mat: material, list: [], cols: [] }).list.push(M.clone()); PB[key].cols.push(color || null); return PB[key].list.length - 1; }
    function flushPinst() {
      Object.keys(PB).forEach(function (k) {
        var p = PB[k], im = new T.InstancedMesh(p.geo, p.mat, p.list.length);
        p.list.forEach(function (M, i) { im.setMatrixAt(i, M); if (p.cols[i]) im.setColorAt(i, p.cols[i]); });
        if (im.instanceColor) im.instanceColor.needsUpdate = true;
        im.castShadow = k !== 'ring' && k !== 'screen'; im.receiveShadow = true; im.userData.keep = 1; scene.add(im); p.im = im;
      });
      S.pb = PB;
    }

    function plant(x, z, s) { if (!put('potted_plant_02', null, x, 0, z, (ofHash(x + ',' + z) % 628) / 100, { h: 1.05 * (s || 1) })) cyl(.26, .2, .5, '#e9e4da', x, .25, z); }
    var leafCols = ['#5f8f4e', '#4f7d43', '#6e9c55', '#3f6b3a', '#7aa860'], leafG = new T.IcosahedronGeometry(1, 1);
    function tree(x, z, s) {
      cyl(.12 * s, .16 * s, 1.6 * s, '#6d5039', x, .8 * s, z);
      [[0, 2.3, 0, 1], [.5, 2.0, .3, .75], [-.45, 2.1, -.25, .8], [0, 2.95, .1, .7]].forEach(function (q, i) { var m = new T.Mesh(leafG, mat(leafCols[(ofHash(x + ':' + z) + i) % leafCols.length], { flatShading: true, roughness: .9 })); m.position.set(x + q[0] * s, q[1] * s, z + q[2] * s); m.scale.setScalar(q[3] * s); m.castShadow = true; scene.add(m); });
    }
    /* Glass partition with a slim black frame (top, bottom, mullions every 1.5 m); gaps are doorways */
    function gwall(x1, z1, x2, z2, gaps) {
      var alongX = z1 === z2, a0 = alongX ? Math.min(x1, x2) : Math.min(z1, z2), a1 = alongX ? Math.max(x1, x2) : Math.max(z1, z2), segs = [], cur = a0;
      (gaps || []).slice().sort(function (p, q) { return p[0] - q[0]; }).forEach(function (gp) { if (gp[0] > cur) segs.push([cur, gp[0]]); cur = gp[1]; });
      if (cur < a1) segs.push([cur, a1]);
      var fixed = alongX ? z1 : x1, H = 2.85;
      function at(a, y) { return alongX ? [a, y, fixed] : [fixed, y, a]; }
      segs.forEach(function (sg) {
        var L = sg[1] - sg[0], mid = (sg[0] + sg[1]) / 2, p = at(mid, H / 2 + .02);
        var gm = new T.Mesh(new T.BoxGeometry(alongX ? L : .03, H, alongX ? .03 : L), glass); gm.position.set(p[0], p[1], p[2]); scene.add(gm);
        [[.02, .05], [H, .05]].forEach(function (yy) { var q = at(mid, yy[0]); box(alongX ? L : .06, yy[1], alongX ? .06 : L, frameC, q[0], q[1], q[2], null, { metalness: .4, roughness: .45 }); });
        var n = Math.max(1, Math.round(L / 1.5));
        for (var i = 0; i <= n; i++) { var q2 = at(sg[0] + L * i / n, H / 2); box(.05, H, .05, frameC, q2[0], q2[1], q2[2], null, { metalness: .4, roughness: .45 }); }
      });
      (gaps || []).forEach(function (gp) { var q3 = at((gp[0] + gp[1]) / 2, H - .02); box(alongX ? gp[1] - gp[0] : .06, .05, alongX ? .06 : gp[1] - gp[0], frameC, q3[0], q3[1], q3[2]); });
    }
    var mossT = new T.CanvasTexture(ofMossCanvas()); mossT.encoding = T.sRGBEncoding; mossT.wrapS = mossT.wrapT = T.RepeatWrapping;
    function moss(w, h, x, y, z, ry) { var t = mossT.clone(); t.needsUpdate = true; t.repeat.set(w / 1.2, h / 1.2); var m = new T.Mesh(new T.BoxGeometry(w, h, .12), new T.MeshStandardMaterial({ map: t, roughness: 1 })); m.position.set(x, y, z); m.rotation.y = ry || 0; m.castShadow = m.receiveShadow = true; m.userData.keep = 1; scene.add(m); box(w + .1, .1, .2, '#c9a77c', x, y - h / 2 - .05, z).rotation.y = ry || 0; }

    /* Ground: light paving with planted strips, the street and the parking lot */
    plane(200, 200, '#dedad2', 0, -.32, 0);
    box(160, .1, 9, '#3c4048', 0, -.27, 24.5, null, { noShadow: true });
    for (var dx = -70; dx < 70; dx += 5) box(2.2, .02, .16, '#ece6cc', dx, -.21, 24.5, null, { noShadow: true });
    box(160, .14, 4, '#e8e4dc', 0, -.24, 18);
    box(112, .16, 1.4, '#7f9a63', 4, -.23, 16.6);
    box(4, .14, 30, '#e8e4dc', 51, -.24, 0); box(1.2, .16, 30, '#7f9a63', 49.4, -.23, 0);
    for (var tx = -36; tx <= 52; tx += 8) if (Math.abs(tx) > 3) tree(tx, 18.7, 1);
    [-8, 0].forEach(function (tz) { tree(54.5, tz, 1.1); }); [-12, -4, 4, 12].forEach(function (tz) { tree(-48.5, tz, 1.1); });
    [-20, -12, 12, 20].forEach(function (lx) { cyl(.05, .07, 4, frameC, lx, 1.8, 17.1, null, 10); box(.9, .08, .22, frameC, lx, 3.8, 17.0); box(.7, .03, .16, lampMat('#fff2c4'), lx, 3.75, 17.0, null, { noShadow: true }); });
    [-6, 6].forEach(function (bx2) { box(2.2, .08, .55, '#b98d62', bx2, .2, 17.6); box(.08, .4, .5, frameC, bx2 - .9, 0, 17.6); box(.08, .4, .5, frameC, bx2 + .9, 0, 17.6); });
    box(18, .12, 30, '#8fab72', -35.5, -.25, -.2, null, { noShadow: true });
    [[-30, -11], [-34, -3], [-29.5, 5], [-36, 11], [-40, -9], [-41, 3]].forEach(function (q) { tree(q[0], q[1], 1.15); });

    /* Building shell: light floors, white walls, black-framed glass outside */
    box(63, .32, 30.6, '#f1eee8', 9.15, -.16, 0);
    [[-12.5, -5.5, 19, 19, '#ece9e3'], [12.75, -5.5, 18.9, 19, '#e2e4e7'], [0, 10, 14, 10, '#f5f2ed'], [-15, 10, 14, 10, '#c9a37a'], [15.2, 10, 14, 10, '#b98d62'], [0, -5.5, 6, 19, '#eeeae3']].forEach(function (f) { plane(f[2] - .1, f[3] - .1, f[4], f[0], .005, f[1]); });
    var wallC = '#f7f5f1';
    box(63, 3.4, .3, wallC, 9.15, 1.7, -15.15); box(.3, 3.4, 30.6, wallC, -22.15, 1.7, 0);
    for (var wx = -18; wx <= 37; wx += 5.5) { if (Math.abs(wx) < 3 || wx === -12.5 || wx === -7) continue; box(4.2, 1.8, .05, mat('#a9cde0', { roughness: .08, metalness: .3 }), wx, 1.9, -14.98); box(4.3, 1.9, .04, frameC, wx, 1.9, -15.0, null, { noShadow: true }); }
    for (var wz = -11; wz <= 11; wz += 6) box(.05, 1.8, 4.2, mat('#a9cde0', { roughness: .08, metalness: .3 }), -21.98, 1.9, wz);
    function curtain(x1, z1, x2, z2, gap) {
      var len = Math.hypot(x2 - x1, z2 - z1), alongX = x1 !== x2, segs = gap ? [[-len / 2, gap[0]], [gap[1], len / 2]] : [[-len / 2, len / 2]];
      segs.forEach(function (sg) {
        var c = (sg[0] + sg[1]) / 2, L = sg[1] - sg[0], cx = alongX ? (x1 + x2) / 2 + c : x1, cz = alongX ? z1 : (z1 + z2) / 2 + c;
        box(alongX ? L : .3, .4, alongX ? .3 : L, '#3a3632', cx, .2, cz);
        var gm = new T.Mesh(new T.BoxGeometry(alongX ? L : .04, 2.95, alongX ? .04 : L), glass); gm.position.set(cx, 1.9, cz); scene.add(gm);
        for (var t = sg[0]; t <= sg[1] + .01; t += 1.5) box(alongX ? .09 : .18, 3.0, alongX ? .18 : .09, frameC, alongX ? (x1 + x2) / 2 + t : x1, 1.9, alongX ? z1 : (z1 + z2) / 2 + t, null, { metalness: .3, roughness: .5 });
        box(alongX ? L : .32, .1, alongX ? .32 : L, frameC, cx, 3.4, cz);
      });
    }
    curtain(-22.3, 15.15, 40.6, 15.15, [-11.35, -6.95]); curtain(40.45, -15.3, 40.45, 15.3, [7.3, 10.3]);
    box(5.6, .12, 2.2, frameC, 0, 3.3, 16.1); plane(3.6, 1.6, '#3b3e48', 0, .012, 14.2);
    [[-3, -9], [-3, 3]].forEach(function (c) { box(.5, 3.4, .5, '#ebe7df', c[0], 1.7, c[1]); });

    /* Desks: real metal desk + black chair (instanced), procedural monitor/keyboard (instanced), status ring under the chair */
    var ringG = new T.RingGeometry(.5, .64, 40); ringG.rotateX(-Math.PI / 2);
    var ringM = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .9, depthWrite: false, toneMapped: false });
    var monG = new T.BoxGeometry(.64, .38, .03), standG = new T.BoxGeometry(.05, .26, .05), kbG = new T.BoxGeometry(.42, .015, .13), scrG = new T.PlaneGeometry(.58, .32); scrG.rotateY(Math.PI);
    var scrM = new T.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
    var dummy = new T.Object3D(); scene.add(dummy);
    function localM(par, x, y, z, ry) { dummy.position.set(x, y, z); dummy.rotation.set(0, ry || 0, 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); par.updateMatrixWorld(true); return new T.Matrix4().multiplyMatrices(par.matrixWorld, dummy.matrix); }
    var PEO = {};   // template -> list of {pid, M}
    function seat(x, z, rot, p, o) {
      o = o || {}; var u = new T.Group(); u.position.set(x, 0, z); u.rotation.y = rot; scene.add(u); u.updateMatrixWorld(true);
      var w = o.w || 1.44;
      if (o.top) { box(w, .05, .74, o.top, 0, .74, 0, u); box(.05, .72, .64, frameC, -w / 2 + .06, .36, 0, u); box(.05, .72, .64, frameC, w / 2 - .06, .36, 0, u); }
      else put('metal_office_desk', u, 0, 0, 0, Math.PI, { w: w, h: .75, d: .74 });
      pinst('stand', standG, mat('#2a2d33'), localM(u, 0, .88, .2)); pinst('mon', monG, mat('#141519', { roughness: .4 }), localM(u, 0, 1.13, .21));
      var si = pinst('screen', scrG, scrM, localM(u, 0, 1.13, .193), new T.Color(0x252836));
      pinst('kb', kbG, mat('#d9dbe2'), localM(u, 0, .775, -.1));
      if (ofHash(p ? p.full : x + ',' + z) % 3 === 0) put('potted_plant_04', u, w / 2 - .22, .75, .12, 0, { h: .26 });
      if (o.chair === 'lounge') put('mid_century_lounge_chair', u, 0, 0, -.72, 0, { h: 1.05 });
      else put('SchoolChair_01', u, 0, 0, -.68, 0, { h: .92 }, '#3a3a3c');
      var ri = pinst('ring', ringG, ringM, localM(u, 0, .02, -.62), new T.Color(0x9aa0b8));
      var rec = { pid: p ? p.id : null, screen: si, ring: ri, M: localM(u, 0, 0, -.66), pos: new T.Vector3(0, 0, -.62).applyMatrix4(u.matrixWorld) };
      if (p) { var tk = OF_PEOPLE[ofHash(p.full) % OF_PEOPLE.length]; if (!AS['person_' + tk]) tk = OF_PEOPLE.filter(function (n) { return AS['person_' + n]; })[0]; rec.tpl = tk; (PEO[tk] = PEO[tk] || []).push(rec); S.persons.push(rec); }
      return rec;
    }
    function bench(cx, cz, cols, list, o) {
      var w = 1.5; o = o || {};
      box(cols * w + .1, .55, .04, '#3f5a4e', cx, 1.04, cz, null, { roughness: 1 });
      for (var i = 0; i < cols * 2; i++) { var row = i < cols ? 0 : 1, col = i % cols, xx = cx + (col - (cols - 1) / 2) * w; seat(xx, row ? cz + .42 : cz - .42, row ? Math.PI : 0, list[i] || null, Object.assign({ w: w - .06 }, o)); }
    }
    function deptSign(text, x, z, col) { decal([{ text: text.toUpperCase(), font: '800 120px Inter, system-ui, sans-serif', color: col || '#6b6f8a', y: 90, ls: '14px' }], 6, 1.05, x, z, 0, .5); }
    function sofa(x, z, rot) { if (!put('sofa_02', null, x, 0, z, rot, { w: 2.0 })) box(2, .6, .9, '#20232a', x, .3, z); }
    function hChair(x, z, rot) { put('SchoolChair_01', null, x, 0, z, rot, { h: .9 }, '#3a3a3c'); }

    /* Reception: Client Care, walnut slat wall with the real Club Wealth logo, moss walls, front desk with the logo */
    var recp = OF_ROSTER.filter(function (p) { return p.group === 'reception'; });
    box(9.4, 3.3, .3, '#3e2a1d', 0, 1.65, 5.55);
    for (var sx = -4.55; sx <= 4.6; sx += .2) box(.09, 3.25, .06, '#5b3d29', sx, 1.65, 5.74, null, { noShadow: true });
    var tl = new T.TextureLoader(), logoW = tl.load('office3d/logo-white.png', function () { S.dirty = true; }), logoK = tl.load('office3d/logo-black.png', function () { S.dirty = true; });
    var lw = new T.Mesh(new T.PlaneGeometry(6.4, 1.745), texMat(logoW)); lw.position.set(0, 2.15, 5.8); lw.userData.keep = 1; scene.add(lw);
    moss(2.2, 3.0, -5.9, 1.6, 5.55); moss(2.2, 3.0, 5.9, 1.6, 5.55);
    recp.forEach(function (p, i) { seat((i - (recp.length - 1) / 2) * 1.75, 8.45, 0, p, { w: 1.5, top: '#e9e2d6' }); });
    box(6.6, .98, .42, '#f7f5f1', 0, .49, 9.25); box(6.9, .06, .72, '#d8cdbd', 0, 1.01, 9.15, null, { roughness: .3 });
    box(.42, .98, 1.6, '#f7f5f1', -3.3, .49, 8.6); box(.42, .98, 1.6, '#f7f5f1', 3.3, .49, 8.6);
    var ld = new T.Mesh(new T.PlaneGeometry(4.6, 1.255), texMat(logoK)); ld.position.set(0, .52, 9.465); ld.userData.keep = 1; scene.add(ld);
    sofa(-5.2, 12.4, Math.PI / 2); sofa(-1.2, 12.4, -Math.PI / 2);
    if (!put('modern_coffee_table_01', null, -3.2, 0, 12.4, Math.PI / 2, { w: 1.2 })) cyl(.55, .55, .06, '#c9a77c', -3.2, .42, 12.4);
    put('side_table_01', null, -5.2, 0, 13.9, 0, {});
    /* Client Room: a client who comes to the front desk is taken here and a Client Care rep assists them */
    gwall(3.4, 9.9, 8.2, 9.9, []); gwall(3.4, 9.9, 3.4, 15, [[11.3, 12.6]]);
    plane(4.7, 5, '#d9cdbb', 5.8, .013, 12.45);
    cyl(.6, .6, .05, '#efe9de', 6.0, .74, 12.6, null, 32); cyl(.06, .08, .72, frameC, 6.0, .37, 12.6, null, 12);
    var crChairs = [[6.0, 11.55, 0], [7.05, 12.6, -Math.PI / 2], [6.0, 13.65, Math.PI], [4.95, 12.6, Math.PI / 2]];
    crChairs.forEach(function (q) { put('modern_arm_chair_01', null, q[0], 0, q[1], q[2], { h: .95 }); });
    S.clientSeats = [[-5.05, 11.75, Math.PI / 2], [-5.05, 12.4, Math.PI / 2], [-5.05, 13.05, Math.PI / 2], [-1.35, 11.75, -Math.PI / 2], [-1.35, 12.4, -Math.PI / 2], [-1.35, 13.05, -Math.PI / 2]].concat(crChairs);
    var cTv = new T.Mesh(new T.PlaneGeometry(2.2, 1.24), new T.MeshBasicMaterial({ color: 0x0d2b86, toneMapped: false })); cTv.position.set(5.8, 1.7, 10.0); cTv.userData.keep = 1; cTv.userData.screen = 'client'; scene.add(cTv);
    box(2.3, 1.34, .06, '#111216', 5.8, 1.7, 9.95); plant(7.7, 14.5, .9);
    decal([{ text: 'CLIENT ROOM', font: '800 120px Inter, system-ui, sans-serif', color: '#7a6448', y: 80, ls: '14px' }], 3.2, .55, 5.8, 14.4, 0, .55);
    S.screenMeshes = [cTv];
    plant(-5.7, 7.3, 1.2); plant(5.7, 7.3, 1.2); plant(-2.9, 14.2, 1.1); plant(2.9, 14.2, 1.1);
    plane(5.4, 3.6, '#cfc6b6', 0, .012, 12.4);
    decal([{ text: 'RECEPTION · CLIENT CARE', font: '800 92px Inter, system-ui, sans-serif', color: '#8a8070', y: 70, ls: '10px' }], 6.4, .85, 0, 10.6, 0, .5);

    /* Huddle Room: round table cut like a pie (Admins slice, ISA & RM slice) facing the huddle screen */
    var hx = -15;
    gwall(-8.15, 4.8, -8.15, 15, [[5.2, 7.6]]); gwall(-22, 4.8, -8.15, 4.8, []);
    var pcx = hx, pcz = 10.15, rIn = 1.25, rOut = 3.55, rChair = 4.25, gap = 12 * Math.PI / 180, nSeats = 0;
    var nAdm = OF_ROSTER.filter(function (p) { return p.group === 'manager' || p.group === 'reception' || p.group === 'admin'; }).length + 2;
    var nIsa = OF_ROSTER.filter(function (p) { return p.group === 'isa' || p.group === 'rm'; }).length + 3;
    var span = Math.PI * 2 - 2 * gap, aAdm = span * nAdm / (nAdm + nIsa), aIsa = span - aAdm, a0 = Math.PI / 2 - aAdm / 2;
    function slice(from, len, col, label, seats) {
      var sh = new T.Shape(), n = 40;
      for (var i = 0; i <= n; i++) { var a = from + len * i / n; sh[i ? 'lineTo' : 'moveTo'](Math.sin(a) * rOut, Math.cos(a) * rOut); }
      for (var j = n; j >= 0; j--) { var bb = from + len * j / n; sh.lineTo(Math.sin(bb) * rIn, Math.cos(bb) * rIn); }
      var m = new T.Mesh(new T.ExtrudeGeometry(sh, { depth: .07, bevelEnabled: false, curveSegments: 4 }), mat(col, { roughness: .35 })); m.rotation.x = Math.PI / 2; m.position.set(pcx, .8, pcz); m.castShadow = m.receiveShadow = true; scene.add(m);
      for (var k = 0; k < 3; k++) { var la = from + len * (k + .5) / 3; cyl(.05, .05, .74, frameC, pcx + Math.sin(la) * 2.4, .37, pcz + Math.cos(la) * 2.4, null, 8); }
      for (var c = 0; c < seats; c++) { var ca = from + len * (c + .5) / seats, x = pcx + Math.sin(ca) * rChair, z = pcz + Math.cos(ca) * rChair; hChair(x, z, Math.atan2(pcx - x, pcz - z)); nSeats++; }
      var mid = from + len / 2, cv = ofTextCanvas([{ text: label, font: '800 110px Inter, system-ui, sans-serif', color: '#f6efe2', y: 75, ls: '12px' }], 1024, 150);
      var lm = new T.Mesh(new T.PlaneGeometry(2.6, .38), texMat(cv, { opacity: .95, depthWrite: false })); lm.rotation.x = -Math.PI / 2; lm.rotation.z = mid + (Math.sin(mid) < 0 ? Math.PI : 0);
      lm.position.set(pcx + Math.sin(mid) * 2.4, .885, pcz + Math.cos(mid) * 2.4); lm.userData.keep = 1; scene.add(lm);
    }
    slice(a0, aAdm, '#7a563a', 'ADMINS', nAdm); slice(a0 + aAdm + gap, aIsa, '#3e2b1f', 'ISA & RM', nIsa);
    cyl(.75, .85, .5, '#e9e4da', pcx, .25, pcz); plant(pcx, pcz, .8);
    S.huddleSeats = nSeats;
    var hudC = document.createElement('canvas'); hudC.width = 1024; hudC.height = 576;
    var hudT = new T.CanvasTexture(hudC); hudT.encoding = T.sRGBEncoding; S.hudCanvas = hudC; S.hudTex = hudT;
    box(5.4, 3.05, .1, '#111216', hx, 1.85, 5.3);
    var tv = new T.Mesh(new T.PlaneGeometry(5.2, 2.92), new T.MeshBasicMaterial({ map: hudT, toneMapped: false })); tv.position.set(hx, 1.85, 5.36); tv.userData.keep = 1; tv.userData.screen = 'huddle'; scene.add(tv); S.screenMeshes.push(tv);
    plant(-21.4, 14.4, 1.1); plant(-8.8, 14.4, 1.1);
    decal([{ text: 'HUDDLE ROOM', font: '800 120px Inter, system-ui, sans-serif', color: '#6b5a44', y: 80, ls: '14px' }], 3.6, .55, -6.4, 6.2, Math.PI / 2, .6);

    /* Indoor trees in big round planters */
    [[0, 1.6], [-5.6, 14.0]].forEach(function (q) {
      cyl(.75, .65, .6, '#ece8e1', q[0], .3, q[1], null, 28);
      cyl(.08, .12, 2.2, '#6d5039', q[0], 1.6, q[1], null, 10);
      [[0, 2.7, 0, .9], [.45, 2.4, .2, .65], [-.4, 2.5, -.2, .7], [.1, 3.2, -.1, .6]].forEach(function (k, i) { var m = new T.Mesh(leafG, mat(leafCols[(i + 1) % leafCols.length], { flatShading: true, roughness: .9 })); m.position.set(q[0] + k[0], k[1], q[1] + k[2]); m.scale.setScalar(k[3]); m.castShadow = true; scene.add(m); });
    });
    /* ISA Coach office: centre aisle, facing the ISA floor but apart from the agents */
    var coach = OF_ROSTER.filter(function (p) { return p.group === 'coach'; });
    if (coach.length) {
      gwall(-2.7, -8.2, 2.9, -8.2, []); gwall(-2.7, -1.8, 2.9, -1.8, [[-1.6, -.4]]); gwall(-2.7, -8.2, -2.7, -1.8, []);
      plane(5.5, 6.3, '#c6b49a', .1, .012, -5.0);
      coach.forEach(function (p, i) { seat(.2, -5.6 + i * 1.6, Math.PI / 2, p, { w: 1.6, top: '#3e2a1d', chair: 'lounge' }); });
      put('modern_arm_chair_01', null, -1.9, 0, -3.0, Math.PI / 4, { h: .95 }); plant(-2.1, -7.6, .9);
      decal([{ text: 'ISA COACH', font: '800 110px Inter, system-ui, sans-serif', color: '#6b5a44', y: 80, ls: '14px' }], 3.2, .55, 0, -2.4, 0, .6);
    }
    /* ISA & RM floor: glass all round so callers can focus */
    gwall(3.3, -15, 3.3, 4.2, [[-1.6, -.1]]); gwall(3.3, 4.2, 22.2, 4.2, [[11.6, 13.1]]); gwall(22.2, -15, 22.2, 4.2, [[-3.6, -2.1]]);
    var felt = mat('#3f5a4e', { roughness: 1 });
    [-8.5, -2.3].forEach(function (zr) { [[4.6, 11.6], [13.8, 20.8]].forEach(function (xr) { box(xr[1] - xr[0], 1.5, .08, felt, (xr[0] + xr[1]) / 2, .75, zr); box(xr[1] - xr[0], .05, .12, frameC, (xr[0] + xr[1]) / 2, 1.52, zr); }); });
    function booth(x, z, col) {
      box(1.5, .08, 1.5, frameC, x, 2.42, z); box(1.5, .06, 1.5, '#e9e4da', x, .03, z);
      box(.05, 2.4, 1.5, col, x - .73, 1.22, z); box(1.5, 2.4, .05, '#3f5a4e', x, 1.22, z - .73);
      var g1 = new T.Mesh(new T.BoxGeometry(.03, 2.3, 1.4), glass); g1.position.set(x + .73, 1.2, z); scene.add(g1);
      var g2 = new T.Mesh(new T.BoxGeometry(1.4, 2.3, .03), glass); g2.position.set(x, 1.2, z + .73); scene.add(g2);
      box(.6, .04, .3, '#c9a77c', x - .45, 1.0, z); put('metal_stool_02', null, x, 0, z, 0, { h: .6 });
      box(1.2, .03, .08, lampMat('#fff3da'), x, 2.36, z, null, { noShadow: true });
    }
    booth(4.3, -8.4, '#2346c8'); booth(4.3, -4.4, '#2f8f6a');
    S.isaArea = { slots: [[8.2, -11.6], [17.2, -11.6], [8.2, -5.4], [17.2, -5.4], [8.2, .8], [17.2, .8]] };
    decal([{ text: 'ISA FLOOR', font: '800 130px Inter, system-ui, sans-serif', color: '#5f6680', y: 85, ls: '22px' }], 5, .85, 12.7, -14.1, 0, .5);
    plant(4.2, -14.2, 1.2); plant(21.3, -14.2, 1.2); plant(21.3, 3.4, 1); plant(4.2, 3.4, 1);
    var isaC = document.createElement('canvas'); isaC.width = 1280; isaC.height = 640;
    var isaT = new T.CanvasTexture(isaC); isaT.encoding = T.sRGBEncoding; S.isaCanvas = isaC; S.isaTex = isaT;
    box(6.2, 3.2, .1, '#111216', 12.7, 1.85, -14.88);
    var isaTv = new T.Mesh(new T.PlaneGeometry(6.0, 3.0), new T.MeshBasicMaterial({ map: isaT, toneMapped: false })); isaTv.position.set(12.7, 1.85, -14.82); isaTv.userData.keep = 1; isaTv.userData.screen = 'isa'; scene.add(isaTv); S.screenMeshes.push(isaTv);
    moss(2.2, 2.6, 7.6, 1.5, -14.82); moss(2.2, 2.6, 17.8, 1.5, -14.82);

    /* Applicant Lounge (left) and Applicant Room (right), right next to reception and the entrance.
       Applicants rename themselves in Zoom as Name_Position. */
    gwall(8.2, 4.2, 8.2, 15, [[6.2, 7.7]]); gwall(22.2, 4.2, 22.2, 15, []); gwall(15.2, 4.2, 15.2, 15, [[11.6, 13.0]]);
    plane(6.9, 10.6, '#cdbba3', 11.7, .008, 9.65); plane(6.9, 10.6, '#d9d2c6', 18.7, .008, 9.65);
    sofa(10.0, 6.4, 0); sofa(13.4, 6.4, 0); sofa(10.0, 12.6, Math.PI); sofa(13.4, 12.6, Math.PI);
    put('coffee_table_round_01', null, 11.7, 0, 9.5, 0, { w: 1.2 });
    box(.6, 1.1, .6, '#e9edf2', 14.6, .55, 14.4); cyl(.16, .16, .45, mat('#bfe3f5', { roughness: .1, transparent: true, opacity: .7 }), 14.6, 1.33, 14.4, null, 16);
    plant(8.9, 14.4, 1.1); plant(14.6, 4.9, .9);
    decal([{ text: 'APPLICANT LOUNGE', font: '800 100px Inter, system-ui, sans-serif', color: '#7a6448', y: 75, ls: '10px' }], 5.6, .8, 11.7, 14.3, 0, .5);
    box(1.6, .06, 4.2, '#3e2a1d', 18.7, .76, 9.4, null, { roughness: .4 }); box(1.2, .72, .08, frameC, 18.7, .38, 7.6); box(1.2, .72, .08, frameC, 18.7, .38, 11.2);
    [[17.55, 8.2, Math.PI / 2], [17.55, 9.4, Math.PI / 2], [17.55, 10.6, Math.PI / 2], [19.85, 8.2, -Math.PI / 2], [19.85, 9.4, -Math.PI / 2], [19.85, 10.6, -Math.PI / 2]].forEach(function (q) { hChair(q[0], q[1], q[2]); });
    var aTv = new T.Mesh(new T.PlaneGeometry(2.6, 1.46), new T.MeshBasicMaterial({ color: 0x0d2b86, toneMapped: false })); aTv.position.set(18.7, 1.7, 4.36); aTv.userData.keep = 1; aTv.userData.screen = 'applicants'; scene.add(aTv); S.screenMeshes.push(aTv);
    box(2.7, 1.56, .06, '#111216', 18.7, 1.7, 4.3); plant(21.4, 14.4, 1);
    decal([{ text: 'APPLICANT ROOM', font: '800 100px Inter, system-ui, sans-serif', color: '#55607a', y: 75, ls: '10px' }], 5.2, .75, 18.7, 14.3, 0, .5);
    S.applicantSeats = [[9.4, 6.55, 0], [10.6, 6.55, 0], [12.8, 6.55, 0], [14.0, 6.55, 0], [9.4, 12.45, Math.PI], [10.6, 12.45, Math.PI], [12.8, 12.45, Math.PI], [14.0, 12.45, Math.PI],
      [17.55, 8.2, Math.PI / 2], [17.55, 9.4, Math.PI / 2], [17.55, 10.6, Math.PI / 2], [19.85, 8.2, -Math.PI / 2], [19.85, 9.4, -Math.PI / 2], [19.85, 10.6, -Math.PI / 2]];

    /* East wing: Pantry & Dining (back) and Game & Leisure (front), glass between them, Smoking Area outside */
    gwall(22.2, -2.4, 40.4, -2.4, [[30.4, 32.2]]);
    plane(18, 12.4, '#e9e1d4', 31.3, .006, -8.8);
    box(13, .92, .65, '#f4f2ee', 30.5, .46, -14.6); box(13.1, .05, .72, '#2c2f36', 30.5, .94, -14.58, null, { roughness: .3 });
    box(13, .7, .38, '#ebe6dc', 30.5, 2.3, -14.8);
    box(.95, 2.15, .75, '#c9cdd4', 38.2, 1.08, -14.5, null, { metalness: .6, roughness: .3 }); box(.95, 2.15, .75, '#c9cdd4', 39.2, 1.08, -14.5, null, { metalness: .6, roughness: .3 });
    put('CoffeeCart_01', null, 24.6, 0, -13.4, 0, { w: 1.8 });
    box(5, .92, 1.2, '#22252c', 30.5, .46, -11.6); box(5.2, .05, 1.4, '#efe9de', 30.5, .94, -11.6, null, { roughness: .25 });
    for (var st2 = 0; st2 < 5; st2++) put('metal_stool_02', null, 28.5 + st2, 0, -10.55, 0, { h: .66 });
    [[25.6, -7.2], [31.3, -7.2], [37, -7.2], [25.6, -4.1], [31.3, -4.1], [37, -4.1]].forEach(function (t) {
      box(2.3, .05, 1, '#c79d70', t[0], .76, t[1], null, { roughness: .45 }); box(.06, .72, .7, frameC, t[0] - .95, .38, t[1]); box(.06, .72, .7, frameC, t[0] + .95, .38, t[1]);
      for (var k = 0; k < 3; k++) { hChair(t[0] - .75 + k * .75, t[1] - .75, 0); hChair(t[0] - .75 + k * .75, t[1] + .75, Math.PI); }
      put('modern_ceiling_lamp_01', null, t[0], 2.35, t[1], 0, { h: .95 });
    });
    var neon = new T.Mesh(new T.PlaneGeometry(4.4, 1.2), texMat(ofTextCanvas([{ text: 'CLUB WEALTH', font: '800 150px Inter, system-ui, sans-serif', color: '#7ff3ff', y: 128, ls: '18px' }], 1024, 256), { opacity: 1 }));
    neon.position.set(30.5, 2.95, -14.6); neon.userData.keep = 1; scene.add(neon);
    var glow = new T.PointLight(0x5fe8ff, .6, 6); glow.position.set(30.5, 2.8, -13.8); scene.add(glow);
    put('wall_clock', null, 36.9, 2.55, -14.62, 0, { w: .42 });
    plant(23, -14.3, 1.1); plant(39.6, -9.5, 1.1); moss(3, 2.2, 23.3, 1.4, -8.8, Math.PI / 2);
    decal([{ text: 'PANTRY & DINING', font: '800 110px Inter, system-ui, sans-serif', color: '#7a6448', y: 80, ls: '12px' }], 6, .9, 31.3, -9.4, 0, .5);
    /* Game & Leisure: back half of the wing */
    plane(18, 8.6, '#dfe3e8', 31.3, .006, 1.9);
    box(2.7, .16, 1.5, '#2a1d14', 26.6, .82, .9); box(2.44, .02, 1.24, '#2f6e4a', 26.6, .91, .9);
    [[-1.15, -.6], [1.15, -.6], [-1.15, .6], [1.15, .6]].forEach(function (q) { box(.14, .74, .14, '#1d150f', 26.6 + q[0], .37, .9 + q[1]); });
    box(2.74, .05, 1.52, '#1f3f8f', 32.4, .76, .9); box(.03, .16, 1.6, '#f4f2ee', 32.4, .86, .9); [[-1.2, -.6], [1.2, -.6], [-1.2, .6], [1.2, .6]].forEach(function (q) { box(.05, .74, .05, frameC, 32.4 + q[0], .37, .9 + q[1]); });
    box(1.2, .25, .75, '#5a3f2c', 26.6, .82, 4.4); box(1.1, .02, .65, '#3e9a31', 26.6, .95, 4.4); [[-.5, -.3], [.5, -.3], [-.5, .3], [.5, .3]].forEach(function (q) { box(.08, .7, .08, '#2a1d14', 26.6 + q[0], .35, 4.4 + q[1]); });
    box(2.1, .2, 1.1, '#e9edf2', 30.2, .78, 4.4); box(1.9, .03, .9, '#2f6fbf', 30.2, .9, 4.4); [[-.85, -.4], [.85, -.4], [-.85, .4], [.85, .4]].forEach(function (q) { box(.08, .7, .08, frameC, 30.2 + q[0], .35, 4.4 + q[1]); });
    var arcade = lampMat('#7fd3ff'); arcade.emissiveIntensity = .4; arcade.emissive.set('#36c3f0');
    [0.4, 1.4, 2.4].forEach(function (z, i) { box(.8, 1.8, .7, ['#2b2f45', '#7a1f1f', '#20243a'][i], 39.4, .9, z); box(.04, .5, .5, arcade, 39.02, 1.35, z, null, { noShadow: true }); });
    box(1, 1.1, 2.2, '#d9534f', 38.9, .55, 4.6); box(1, 1.6, .08, '#16181d', 39.35, 1.9, 3.6);
    [[35.4, 4.4, '#ff8a5b'], [36.5, 4.9, '#36c3f0'], [35.0, 5.4, '#4caf7d']].forEach(function (q) { var bb = new T.Mesh(new T.SphereGeometry(.42, 18, 12), mat(q[2], { roughness: .95 })); bb.scale.set(1, .6, 1); bb.position.set(q[0], .25, q[1]); bb.castShadow = true; scene.add(bb); });
    var dart = new T.Mesh(new T.CylinderGeometry(.25, .25, .04, 24), mat('#16181d')); dart.rotation.z = Math.PI / 2; dart.position.set(36.2, 1.7, -2.3); dart.rotation.y = Math.PI / 2; scene.add(dart);
    var vend = lampMat('#eaf6ff'); vend.emissiveIntensity = .35;
    [23.2, 24.3].forEach(function (x2, i) { box(1, 1.95, .8, ['#20243a', '#7a1f1f'][i], x2, .98, -1.85); box(.7, 1.3, .03, vend, x2, 1.15, -1.44, null, { noShadow: true }); });
    put('steel_frame_shelves_01', null, 38.6, 0, -1.8, 0, { h: 2.0 });
    plant(39.6, 5.6, 1); plant(23, 5.6, 1);
    decal([{ text: 'GAME & LEISURE', font: '800 110px Inter, system-ui, sans-serif', color: '#55607a', y: 80, ls: '12px' }], 6, .9, 31.3, -1.4, 0, .5);

    /* Staff Lounge: front half of the east wing, off Game & Leisure */
    gwall(22.2, 6.4, 40.4, 6.4, [[23.4, 24.8], [36.6, 38.0]]);
    plane(17.8, 8.4, '#b98d62', 31.3, .008, 10.7); plane(9, 5.6, '#a99987', 31.3, .012, 10.7);
    sofa(31.3, 8.4, 0); sofa(31.3, 13.0, Math.PI);
    put('modern_arm_chair_01', null, 28.0, 0, 10.7, Math.PI / 2, { h: 1.0 }); put('modern_arm_chair_01', null, 34.6, 0, 10.7, -Math.PI / 2, { h: 1.0 });
    if (!put('coffee_table_round_01', null, 31.3, 0, 10.7, 0, { w: 1.3 })) box(1.3, .4, 1.3, '#d8d4cb', 31.3, .2, 10.7);
    put('side_table_01', null, 28.7, 0, 8.4, 0, {}); put('side_table_01', null, 33.9, 0, 13.0, 0, {});
    put('steel_frame_shelves_01', null, 24.0, 0, 7.0, 0, { h: 2.1 }); put('steel_frame_shelves_01', null, 38.6, 0, 7.0, 0, { h: 2.1 });
    box(.08, 1.25, 2.2, '#111216', 40.3, 1.65, 10.7);
    put('modern_ceiling_lamp_01', null, 31.3, 2.35, 10.7, 0, { h: .95 });
    sofa(38.3, 13.2, Math.PI); put('modern_coffee_table_01', null, 38.3, 0, 11.6, 0, { w: 1.1 });
    plant(23, 14.3, 1.2); plant(39.6, 14.3, 1.1); plant(26, 12.8, .9);
    decal([{ text: 'LOUNGE', font: '800 140px Inter, system-ui, sans-serif', color: '#7a6448', y: 85, ls: '20px' }], 3.6, .85, 31.3, 14.3, 0, .5);
    box(7, .1, 10, '#cdc8be', 44.3, -.22, 9);
    [[40.9, 9, .1, 10], [47.75, 9, .1, 10], [44.3, 4.05, 7, .1], [44.3, 13.95, 7, .1]].forEach(function (f) { box(f[2], .9, f[3], '#5b3d29', f[0], .4, f[1]); });
    put('outdoor_table_chair_set_01', null, 45.6, 0, 6.6, 0, {}); put('outdoor_table_chair_set_01', null, 45.6, 0, 11.4, 0, {});
    [[43.0, 6.2], [43.0, 11.6]].forEach(function (q) { cyl(.14, .14, .9, '#9aa0b8', q[0], .3, q[1], null, 14); cyl(.18, .18, .04, frameC, q[0], .77, q[1], null, 14); });
    plant(41.6, 13.3, 1); plant(47.1, 4.8, .9);
    decal([{ text: 'SMOKING AREA', font: '800 110px Inter, system-ui, sans-serif', color: '#4a4f62', y: 80, ls: '12px' }], 4.8, .8, 44.3, 9, 0, .7);

    /* Private office (back-left) */
    gwall(-22, -9, -15, -9, [[-16.6, -15.4]]); gwall(-15, -15, -15, -9, []);
    plane(6.8, 5.8, '#c6b49a', -18.5, .01, -12.05);
    seat(-18.5, -12.6, 0, null, { w: 1.9, top: '#3e2a1d', chair: 'lounge' });
    sofa(-21.2, -11.6, Math.PI / 2); plant(-15.8, -14.2, 1.2);
    decal([{ text: 'PRIVATE OFFICE', font: '800 110px Inter, system-ui, sans-serif', color: '#6b5a44', y: 90, ls: '12px' }], 4, .8, -18.5, -10.2, 0, .6);

    /* Head Admin office: Tara and Camille */
    var mgr = OF_ROSTER.filter(function (p) { return p.group === 'manager'; });
    plane(5.7, 5.6, '#c6b49a', 0, .012, -12.2);
    gwall(-2.9, -9.35, 2.9, -9.35, [[-.6, .6]]); gwall(-2.9, -15, -2.9, -9.35, []); gwall(2.9, -15, 2.9, -9.35, []);
    mgr.forEach(function (p, i) { seat((i - (mgr.length - 1) / 2) * 1.9, -12.4, 0, p, { w: 1.75, top: '#3e2a1d', chair: 'lounge' }); });
    sofa(-2.1, -14.0, Math.PI / 2); plant(2.4, -14.5, 1.1);
    put('wall_clock', null, 0, 2.55, -14.97, 0, { w: .4 });
    decal([{ text: 'HEAD ADMIN OFFICE', font: '800 96px Inter, system-ui, sans-serif', color: '#6b5a44', y: 70, ls: '10px' }], 4.6, .7, 0, -10.1, 0, .6);

    /* Admin departments (left wing). Admin & Events and Marketing stay open; every other department gets glass. */
    var depts = []; OF_ROSTER.forEach(function (p) { if (p.group === 'admin' && depts.indexOf(p.dept) < 0) depts.push(p.dept); });
    depts.sort(function (a, b) { return OF_ROSTER.filter(function (p) { return p.dept === b; }).length - OF_ROSTER.filter(function (p) { return p.dept === a; }).length; });
    /* Each admin department gets its own glass room with space around the desks */
    var ROOMS = {
      'Admin & Events': { c: [-9.2, -10.9], box: [-15, -14.95, -3.3, -6.9] },
      'Marketing': { c: [-9.2, -4.6], box: [-15, -6.5, -3.3, -2.4] },
      'AI & Tech': { c: [-18.5, -5.5], box: [-21.95, -8.6, -15.4, -2.4] }
    };
    var spare = [[-9.2, 1.2], [-18.5, 1.2]], slots = [];
    depts.forEach(function (d, i) {
      var R = ROOMS[d], list = OF_ROSTER.filter(function (p) { return p.dept === d; }), cols = Math.min(3, Math.max(1, Math.ceil(list.length / 2)));
      var c = R ? R.c : spare[i % spare.length]; slots.push(c);
      bench(c[0], c[1], cols, list, {});
      if (R) {
        var b = R.box, mid = (b[0] + b[2]) / 2;
        plane(b[2] - b[0] - .1, b[3] - b[1] - .1, '#e6e2da', mid, .007, (b[1] + b[3]) / 2);
        if (b[1] > -14.9) gwall(b[0], b[1], b[2], b[1], []);
        gwall(b[0], b[3], b[2], b[3], [[mid - .7, mid + .7]]);
        if (b[0] > -21.9) gwall(b[0], b[0] === -15 ? Math.max(b[1], -9) : b[1], b[0], b[3], []);
        gwall(b[2], b[1], b[2], b[3], []);
        deptSign(d, mid, b[3] - .55, '#6b6f8a');
      } else deptSign(d, c[0], c[1] - 2.25, '#6b6f8a');
    });
    plant(-4.2, -14.2, 1.2); plant(-12.6, 3.6, .9);
    var wallC2 = document.createElement('canvas'); wallC2.width = 1600; wallC2.height = 700;
    var wallT = new T.CanvasTexture(wallC2); wallT.encoding = T.sRGBEncoding; S.wallCanvas = wallC2; S.wallTex = wallT;
    box(7.4, 3.3, .1, '#111216', -9.75, 1.8, -14.9);
    var wallTv = new T.Mesh(new T.PlaneGeometry(7.2, 3.15), new T.MeshBasicMaterial({ map: wallT, toneMapped: false })); wallTv.position.set(-9.75, 1.8, -14.84); wallTv.userData.keep = 1; wallTv.userData.screen = 'wall'; scene.add(wallTv); S.screenMeshes.push(wallTv);
    decal([{ text: 'REPORT WALL', font: '800 120px Inter, system-ui, sans-serif', color: '#6b6f8a', y: 80, ls: '14px' }], 3.6, .55, -9.75, -13.9, 0, .5);

    /* Restrooms: Men and Women, 2 stalls each */
    function restroom(x0, label, accent) {
      var z0 = -1, W = 4, D = 5, wc = '#eceae4', H = 2.4;
      plane(W - .1, D - .1, '#dfe6ea', x0 + W / 2, .014, z0 + D / 2);
      box(W, 1, .14, wc, x0 + W / 2, .5, z0 + D);
      box(.14, H, D, wc, x0, H / 2, z0 + D / 2); box(.14, x0 + W > -15 ? 1 : H, D, wc, x0 + W, (x0 + W > -15 ? 1 : H) / 2, z0 + D / 2);
      box(W - 1.1, H, .14, wc, x0 + (W - 1.1) / 2, H / 2, z0);
      var door = box(.9, 2.05, .05, '#b98d62', x0 + W - .1, 1.03, z0 + .45); door.rotation.y = -1.1;
      [0, 1].forEach(function (k) {
        var sx2 = x0 + .25 + k * 1.75;
        box(.05, 1.9, 1.7, '#9fb0bd', sx2, 1.05, z0 + D - .95); if (k === 1) box(.05, 1.9, 1.7, '#9fb0bd', sx2 + 1.75, 1.05, z0 + D - .95);
        var sd = box(.8, 1.75, .04, accent, sx2 + .5, 1.0, z0 + D - 1.82); sd.rotation.y = -.6;
        var cx = sx2 + .87, cz = z0 + D - .45;
        box(.42, .45, .2, '#ffffff', cx, .62, cz + .2, null, { roughness: .2 }); cyl(.2, .17, .4, mat('#ffffff', { roughness: .2 }), cx, .22, cz - .1, null, 18);
      });
      box(.6, .85, 1.9, '#f4f2ee', x0 + .4, .42, z0 + 1.2); box(.64, .05, 1.95, '#2c2f36', x0 + .4, .86, z0 + 1.2, null, { roughness: .3 });
      [z0 + .75, z0 + 1.65].forEach(function (zz) { cyl(.18, .14, .1, mat('#ffffff', { roughness: .2 }), x0 + .42, .9, zz, null, 18); });
      box(.03, .9, 1.7, mat('#cfe3ee', { roughness: .03, metalness: .9 }), x0 + .09, 1.6, z0 + 1.2);
      var sg = new T.Mesh(new T.PlaneGeometry(.9, .22), texMat(ofTextCanvas([{ text: label, font: '800 64px Inter, system-ui, sans-serif', color: '#ffffff', y: 64, ls: '6px' }], 512, 128, { bg: accent }), { transparent: false })); sg.position.set(x0 + W - 1.6, 1.85, z0 - .08); sg.rotation.y = Math.PI; sg.userData.keep = 1; scene.add(sg);
      decal([{ text: label, font: '800 120px Inter, system-ui, sans-serif', color: '#5f6680', y: 80, ls: '14px' }], 2.6, .7, x0 + W - .6, z0 - .8, 0, .6);
    }
    restroom(-22, 'MEN', '#2346c8'); restroom(-18, 'WOMEN', '#c2416b');

    /* ISAs and RMs are seated from the live roster */
    var isaList = []; OF_ROSTER.forEach(function (p) { if (p.group === 'isa') isaList.push(p); });
    if (brkData) { var known = {}; isaList.forEach(function (p) { known[p.brk] = 1; }); OF.people.forEach(function (o) { if (o.p.group === 'isa' && !known[o.p.brk]) isaList.push(o.p); }); }
    var benches = Math.min(4, Math.max(1, Math.ceil(isaList.length / 8)));
    for (var bn = 0; bn < benches; bn++) { var sl = S.isaArea.slots[bn]; bench(sl[0], sl[1], 4, isaList.slice(bn * 8, bn * 8 + 8), {}); }
    var rms = OF_ROSTER.filter(function (p) { return p.group === 'rm'; }), front = S.isaArea.slots.slice(4);
    for (var rb = 0; rb * 8 < rms.length && rb < front.length; rb++) { var fs = front[rb]; bench(fs[0], fs[1], 4, rms.slice(rb * 8, rb * 8 + 8), {}); if (!rb) deptSign('RMs', fs[0], fs[1] + 2.15, '#3d5a9a'); }
    var pendant = lampMat('#fff7e0');
    S.isaArea.slots.concat(slots.slice(0, depts.length)).forEach(function (s) { box(3.6, .06, .16, pendant, s[0], 2.55, s[1], null, { noShadow: true }); box(3.7, .05, .2, frameC, s[0], 2.6, s[1], null, { noShadow: true }); });

    /* People: one baked seated mesh per outfit, drawn as instances */
    S.peo = {};
    Object.keys(PEO).forEach(function (tk) {
      var bake = ofBakePerson(T, AS['person_' + tk]), list = PEO[tk];
      var im = new T.InstancedMesh(bake.geo, new T.MeshStandardMaterial({ vertexColors: true, roughness: .7 }), list.length);
      list.forEach(function (r, i) { r.idx = i; r.headY = bake.headY; im.setMatrixAt(i, r.M); });
      im.castShadow = true; im.receiveShadow = true; im.userData.keep = 1; im.userData.tpl = tk; scene.add(im); S.peo[tk] = im; S.pick.push(im);
    });
    var ctk = AS['person_M_Casual'] ? 'M_Casual' : Object.keys(PEO)[0];
    if (ctk && S.clientSeats) {
      var cb = ofBakePerson(T, AS['person_' + ctk]);
      var cim = new T.InstancedMesh(cb.geo, new T.MeshStandardMaterial({ vertexColors: true, roughness: .7 }), S.clientSeats.length);
      S.clientSeats.forEach(function (q, i) { cim.setMatrixAt(i, new T.Matrix4().makeScale(0, 0, 0)); });
      cim.castShadow = true; cim.userData.keep = 1; scene.add(cim); S.clientIm = cim; S.clientHead = cb.headY;
    }
    var atk = AS['person_M_Hoodie'] ? 'M_Hoodie' : ctk;
    if (atk && S.applicantSeats) {
      var ab = ofBakePerson(T, AS['person_' + atk]);
      var aim2 = new T.InstancedMesh(ab.geo, new T.MeshStandardMaterial({ vertexColors: true, roughness: .7 }), S.applicantSeats.length);
      S.applicantSeats.forEach(function (q, i) { aim2.setMatrixAt(i, new T.Matrix4().makeScale(0, 0, 0)); });
      aim2.castShadow = true; aim2.userData.keep = 1; scene.add(aim2); S.applicantIm = aim2; S.applicantHead = ab.headY;
    }
    S.awaySeats = {
      pantry: [[24.85, -7.95, 0], [25.6, -7.95, 0], [26.35, -7.95, 0], [30.55, -7.95, 0], [31.3, -7.95, 0], [32.05, -7.95, 0], [24.85, -6.45, Math.PI], [25.6, -6.45, Math.PI], [30.55, -6.45, Math.PI], [31.3, -6.45, Math.PI], [36.25, -7.95, 0], [37, -7.95, 0]],
      lounge: [[30.65, 8.55, 0], [31.3, 8.55, 0], [31.95, 8.55, 0], [30.65, 12.85, Math.PI], [31.3, 12.85, Math.PI], [31.95, 12.85, Math.PI], [28.1, 10.7, Math.PI / 2], [34.5, 10.7, -Math.PI / 2], [37.7, 13.05, Math.PI], [38.9, 13.05, Math.PI]],
      smoke: [[45.6, 6.0, 0], [45.6, 7.2, Math.PI], [45.6, 10.8, 0], [45.6, 12.0, Math.PI], [43.6, 8.6, Math.PI / 2], [43.6, 9.4, Math.PI / 2]],
      rr: [[-21.0, -1.75, Math.PI], [-20.3, -1.75, Math.PI], [-19.6, -1.75, Math.PI], [-17.0, -1.75, Math.PI], [-16.3, -1.75, Math.PI]]
    };
    box(2.4, .08, .5, '#b98d62', -20.3, .45, -1.75); box(.06, .45, .45, frameC, -21.4, .22, -1.75); box(.06, .45, .45, frameC, -19.2, .22, -1.75);
    box(1.7, .08, .5, '#b98d62', -16.65, .45, -1.75); box(.06, .45, .45, frameC, -17.4, .22, -1.75); box(.06, .45, .45, frameC, -15.9, .22, -1.75);
    box(1.6, .08, .5, '#b98d62', 43.6, .45, 9); box(.06, .45, .45, frameC, 43.6, .22, 8.3); box(.06, .45, .45, frameC, 43.6, .22, 9.7);
    var awayCap = Object.keys(S.awaySeats).reduce(function (n, k) { return n + S.awaySeats[k].length; }, 0);
    S.awayIm = {};
    Object.keys(S.peo).forEach(function (tk) {
      var im = new T.InstancedMesh(S.peo[tk].geometry, S.peo[tk].material, awayCap);
      for (var i = 0; i < awayCap; i++) im.setMatrixAt(i, new T.Matrix4().makeScale(0, 0, 0));
      im.castShadow = true; im.userData.keep = 1; scene.add(im); S.awayIm[tk] = im;
    });
    flushInst(); flushPinst();
    S.sofaPut = put;

    /* Merge every plain procedural mesh per material: hundreds of walls/frames/boxes become a few draw calls */
    var groups = {}, kill = [];
    scene.updateMatrixWorld(true);
    scene.traverse(function (m) {
      if (!m.isMesh || m.isInstancedMesh || m.userData.keep || !m.material || Array.isArray(m.material) || m.material.map) return;
      var k = m.material.uuid + (m.castShadow ? 's' : 'n');
      (groups[k] = groups[k] || { mat: m.material, cast: m.castShadow, list: [] }).list.push(m); kill.push(m);
    });
    Object.keys(groups).forEach(function (k) {
      var G = groups[k], pos = [], nor = [];
      G.list.forEach(function (m) {
        var g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry, p = g.attributes.position, n = g.attributes.normal, nm = new T.Matrix3().getNormalMatrix(m.matrixWorld), v = new T.Vector3();
        for (var i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld); pos.push(v.x, v.y, v.z); v.fromBufferAttribute(n, i).applyMatrix3(nm).normalize(); nor.push(v.x, v.y, v.z); }
      });
      var geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new T.Float32BufferAttribute(nor, 3)); geo.computeBoundingSphere();
      var mm = new T.Mesh(geo, G.mat); mm.castShadow = G.cast; mm.receiveShadow = true; mm.userData.keep = 1; scene.add(mm);
    });
    kill.forEach(function (m) { m.parent.remove(m); if (m.geometry) m.geometry.dispose(); });
    renderer.shadowMap.needsUpdate = true;
  }

  function ofDrawHuddle() {
    var S = OF.three; if (!S) return;
    var c = S.hudCanvas, g = c.getContext('2d'), doc = OF.zoom;
    var gr = g.createLinearGradient(0, 0, 1024, 576); gr.addColorStop(0, '#0d2b86'); gr.addColorStop(1, '#070738'); g.fillStyle = gr; g.fillRect(0, 0, 1024, 576);
    g.fillStyle = '#36c3f0'; g.font = '700 34px Inter, system-ui, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    g.fillText('DAILY HUDDLE · 7:30 AM PT', 56, 84);
    g.fillStyle = '#fff'; g.font = '800 64px Inter, system-ui, sans-serif';
    if (!doc) { g.fillText('Waiting for Zoom', 56, 190); g.font = '500 30px Inter, system-ui, sans-serif'; g.fillStyle = '#c9cdea'; g.fillText('Help Desk room · clock-in data', 56, 250); }
    else {
      var P = OF.people, on = P.filter(function (o) { return o.huddle === 'on'; }).length, late = P.filter(function (o) { return o.huddle === 'late'; }).length, miss = P.filter(function (o) { return o.huddle === 'missed'; }).length;
      g.fillText(ofDayLabel(doc.date), 56, 168);
      [[on, 'on time', '#46c37b'], [late, 'late', '#ffb547'], [miss, 'not in Zoom', '#ff8a7a']].forEach(function (k, i) {
        var x = 56 + i * 310; g.fillStyle = k[2]; g.font = '800 120px Inter, system-ui, sans-serif'; g.fillText(String(k[0]), x, 330); g.fillStyle = '#c9cdea'; g.font = '600 30px Inter, system-ui, sans-serif'; g.fillText(k[1], x + 4, 376);
      });
      g.fillStyle = '#9aa0c4'; g.font = '500 26px Inter, system-ui, sans-serif'; g.fillText('Club Wealth Help Desk · Zoom as of ' + ofPT(doc.at) + ' PT · room seats ' + (S.huddleSeats || 70), 56, 500);
    }
    S.hudTex.needsUpdate = true;
  }

  function ofDrawIsa() {
    var S = OF.three; if (!S || !S.isaCanvas) return;
    var c = S.isaCanvas, g = c.getContext('2d'), P = OF.people.filter(function (o) { return o.p.group === 'isa' || o.p.group === 'rm'; }), SL = OF.slack;
    var gr = g.createLinearGradient(0, 0, 1280, 640); gr.addColorStop(0, '#0b1b3a'); gr.addColorStop(1, '#070738'); g.fillStyle = gr; g.fillRect(0, 0, 1280, 640);
    g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    g.fillStyle = '#36c3f0'; g.font = '700 38px Inter, system-ui, sans-serif'; g.fillText('ISA & RM FLOOR · TODAY', 60, 86);
    var inNow = P.filter(function (o) { return o.present; }).length, work = P.filter(function (o) { return o.td && o.td.state === 'working'; }).length, on = P.filter(function (o) { return o.huddle === 'on'; }).length;
    var tiles = [[inNow + '/' + P.length, 'at their desks', '#ffffff'], [OF.td ? String(work) : '–', 'working in Time Doctor', '#46c37b'], [OF.zoom ? on + '/' + P.length : '–', 'on time to huddle', '#ffb547']];
    if (SL) tiles = tiles.concat([[Number(SL.totalCalls || 0).toLocaleString('en-US'), 'calls · ' + (SL.dayLabel || ''), '#8fb8ff'], [String(SL.totalSignups || 0), 'half-day sign-ups', '#46c37b']]);
    tiles.forEach(function (t, i) { var x = 60 + (i % 3) * 400, y = 230 + Math.floor(i / 3) * 210; g.fillStyle = t[2]; g.font = '800 108px Inter, system-ui, sans-serif'; g.fillText(t[0], x, y); g.fillStyle = '#c9cdea'; g.font = '600 30px Inter, system-ui, sans-serif'; g.fillText(t[1], x + 4, y + 46); });
    g.fillStyle = '#8e94b8'; g.font = '500 24px Inter, system-ui, sans-serif'; g.fillText(SL ? 'Calls & sign-ups: end-of-shift ISA report in #cw-isa' : 'The end-of-shift ISA report shows here after 3:30 PM PT', 60, 610);
    S.isaTex.needsUpdate = true;
  }

  function ofAgo(iso) { var m = Math.round((Date.now() - Date.parse(iso)) / 60000); return m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m / 60) + ' h ago' : Math.round(m / 1440) + ' d ago'; }
  function ofWrap(g, text, x, y, maxW, lh, maxLines) {
    var words = String(text).replace(/\s+/g, ' ').split(' '), line = '', n = 0;
    for (var i = 0; i < words.length && n < maxLines; i++) { var t = line ? line + ' ' + words[i] : words[i]; if (g.measureText(t).width > maxW && line) { g.fillText(line, x, y + n * lh); n++; line = words[i]; } else line = t; }
    if (n < maxLines && line) g.fillText(line, x, y + n * lh);
  }
  function ofPlain(t) { return String(t || '').replace(/:[a-z0-9_+-]+:/g, '').replace(/[*_`]/g, '').replace(/\|/g, ' ').replace(/\s+/g, ' ').trim(); }
  /* Report wall: plain titles, grouped by area, duplicate @-notification posts dropped */
  var OF_REP_CAT = { 'cw-isa': 'ISA', 'cw-squad-leaders-isa': 'ISA', 'cw-squad-leaders-with-ali': 'ISA', 'cw-relationship-managers': 'RMs', 'cw-admin-va': 'RMs',
    'cw-halfday-event-forms-automation': 'Half-day events', 'cw-half-day-registration-forms-automation': 'Half-day events', 'cwhalfday-yappi-interested': 'Half-day events', 'cwhalfday-getpaid-interested': 'Half-day events',
    'cw-team': 'Team', 'cw-events': 'Team', 'cw-referrals': 'Team', 'cw-assistant': 'Alerts & system checks' };
  var OF_REP_ORDER = ['Alerts & system checks', 'ISA', 'RMs', 'Half-day events', 'Team', 'Other'];
  function ofRep(it) {
    var raw = ofPlain(it.title).replace(/@someone\s*/g, '').replace(/#channel/g, '').replace(/!\s*/, '').trim();
    var head = raw, sum = '';
    var c = raw.indexOf(': '); if (c > 0 && c < 90) { head = raw.slice(0, c); sum = raw.slice(c + 2); }
    head = head.replace(/\s*[—–-]\s*\d{1,2}[\/.]\d{1,2}[\/.]\d{2,4}\b/g, '').replace(/\s*[—–]\s*/g, ' · ').replace(/\s*·\s*(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,?\s+[A-Z][a-z]+\s+\d{1,2}(,?\s*\d{4})?/g, '').replace(/\s*·\s*\d{1,2}:\d{2}\s*[AP]M\s*PT/g, '').replace(/\s*\((week of[^)]*)\)/i, ' · $1').trim();
    if (!sum) { var body = ofPlain(it.text.split('\n').slice(1).join(' ')); sum = body; }
    if (head.length > 64) { var cutAt = head.slice(0, 64).lastIndexOf(' '); head = head.slice(0, cutAt > 30 ? cutAt : 64).replace(/[\s·(-]+$/, '') + '…'; }
    sum = sum.replace(/,?\s*CSV sent in\s*for[^.]*\.?/i, '').replace(/\s+/g, ' ').trim();
    if (sum.length > 150) sum = sum.slice(0, 147).replace(/\s+\S*$/, '') + '…';
    return { head: head || 'Report', sum: sum, cat: OF_REP_CAT[it.chName] || 'Other', ch: it.chName, posted: it.posted, text: it.text, alert: /stopped|failed|error|can.t/i.test(raw) };
  }
  function ofReps() {
    var R = OF.reports; if (!R || !R.items) return [];
    return R.items.filter(function (it) { return !/^@someone[^:]*from (yesterday|richmond|.*\(nov)/i.test(ofPlain(it.title)) && !/^Happy Weekend/i.test(ofPlain(it.title)); }).map(ofRep);
  }
  function ofDrawWall() {
    var S = OF.three; if (!S || !S.wallCanvas) return;
    var c = S.wallCanvas, g = c.getContext('2d'), R = OF.reports, items = ofReps().slice(0, 6);
    g.fillStyle = '#0b0f24'; g.fillRect(0, 0, 1600, 700);
    g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    g.fillStyle = '#36c3f0'; g.font = '700 34px Inter, system-ui, sans-serif'; g.fillText('REPORT WALL · SLACK AUTOMATIONS', 44, 62);
    g.fillStyle = '#8e94b8'; g.font = '500 24px Inter, system-ui, sans-serif'; g.fillText(R ? 'Updated ' + ofPT(R.at) + ' PT · click for every report' : 'Reports show here once the hourly refresh runs', 1556 - g.measureText(R ? 'Updated ' + ofPT(R.at) + ' PT · click for every report' : 'Reports show here once the hourly refresh runs').width, 62);
    items.forEach(function (it, i) {
      var x = 44 + (i % 3) * 512, y = 96 + Math.floor(i / 3) * 296, W = 488;
      g.fillStyle = '#151b3d'; g.fillRect(x, y, W, 276);
      g.fillStyle = '#36c3f0'; g.fillRect(x, y, 6, 276);
      g.fillStyle = it.alert ? '#ff8a7a' : '#9aa0c4'; g.font = '700 20px Inter, system-ui, sans-serif'; g.fillText(it.cat.toUpperCase() + ' · ' + ofAgo(it.posted), x + 24, y + 38);
      g.fillStyle = '#ffffff'; g.font = '700 28px Inter, system-ui, sans-serif'; ofWrap(g, it.head, x + 24, y + 82, W - 44, 34, 2);
      g.fillStyle = '#c6cae4'; g.font = '400 22px Inter, system-ui, sans-serif'; ofWrap(g, it.sum, x + 24, y + 162, W - 44, 29, 3);
    });
    S.wallTex.needsUpdate = true;
  }
  function ofWin(title, html) {
    var w = $('#of-win'); $('#of-win-t').textContent = title; $('#of-win-b').innerHTML = html; w.hidden = false; $('#of-win-b').scrollTop = 0;
  }
  function ofScreen(id) {
    var P = OF.people, doc = OF.zoom, rows = function (L) { return L.map(function (r) { return '<tr>' + r.map(function (c, i) { return '<td' + (i ? ' class="n"' : '') + '>' + c + '</td>'; }).join('') + '</tr>'; }).join(''); };
    var byName = function (a, b) { return a.p.name.localeCompare(b.p.name); };
    if (id === 'huddle') {
      if (!doc) return ofWin('Daily huddle', '<p>No Zoom clock-ins yet.</p>');
      var on = P.filter(function (o) { return o.huddle === 'on'; }).sort(byName), late = P.filter(function (o) { return o.huddle === 'late'; }).sort(byName), miss = P.filter(function (o) { return o.huddle === 'missed' && !o.p.boss; }).sort(byName);
      return ofWin('Daily huddle · 7:30 AM PT · ' + ofDayLabel(doc.date),
        '<div class="of-win-kpi"><span><b>' + on.length + '</b>on time</span><span><b>' + late.length + '</b>late</span><span><b>' + miss.length + '</b>not in Zoom</span></div>' +
        '<h4>Late</h4><table class="of-tbl">' + rows(late.map(function (o) { return [esc(o.p.name), esc(o.p.dept), '+' + o.late + ' min', ofPT(o.z.j)]; })) + '</table>' +
        '<h4>Not in Zoom</h4><p>' + (miss.map(function (o) { return esc(o.p.name); }).join(', ') || 'Everyone joined.') + '</p>' +
        '<h4>On time</h4><p>' + on.map(function (o) { return esc(o.p.name); }).join(', ') + '</p><p class="of-win-note">Joined the Club Wealth Help Desk Zoom by 7:30 AM PT. Zoom as of ' + ofPT(doc.at) + ' PT.</p>');
    }
    if (id === 'isa') {
      var L = P.filter(function (o) { return o.p.group === 'isa' || o.p.group === 'rm'; }).sort(byName), SL = OF.slack;
      return ofWin('ISA & RM floor · today',
        '<div class="of-win-kpi"><span><b>' + L.filter(function (o) { return o.present; }).length + '/' + L.length + '</b>at desks</span><span><b>' + (OF.td ? L.filter(function (o) { return o.td && o.td.state === 'working'; }).length : '–') + '</b>working (Time Doctor)</span>' + (SL ? '<span><b>' + Number(SL.totalCalls).toLocaleString('en-US') + '</b>calls · ' + esc(SL.dayLabel) + '</span><span><b>' + SL.totalSignups + '</b>half-day sign-ups</span>' : '') + '</div>' +
        '<table class="of-tbl"><thead><tr><th>Name</th><th class="n">Desk</th><th class="n">Time Doctor</th><th class="n">Huddle</th><th class="n">Calls</th><th class="n">Sign-ups</th><th class="n">Break check</th></tr></thead>' +
        rows(L.map(function (o) { return [esc(o.p.name) + (o.p.group === 'rm' ? ' <small>RM</small>' : ''), o.present ? 'in' : '–', o.td ? (o.td.state === 'idle' ? 'idle ' + o.td.mins + 'm' : o.td.state) : '–', o.huddle === 'on' ? 'on time' : o.huddle === 'late' ? '+' + o.late + 'm' : o.huddle ? 'missed' : '–', o.slack && o.slack.calls != null ? o.slack.calls : '–', o.slack && o.slack.signups != null ? o.slack.signups : '–', o.brk ? esc(o.brk.st) : '–']; })) + '</table>' +
        (SL ? '<h4>End-of-shift report · #cw-isa · ' + esc(SL.dayLabel) + '</h4><div class="of-win-rep">' + ofSlackHtml(SL.text) + '</div>' : '<p class="of-win-note">The end-of-shift ISA report shows here after 3:30 PM PT.</p>') +
        '<p class="of-win-note">Listed by name. Calls and sign-ups are from the #cw-isa end-of-shift report.</p>');
    }
    if (id === 'wall') {
      var R = OF.reports, L = ofReps();
      if (!R || !L.length) return ofWin('Report wall', '<p>Reports show here once the hourly refresh runs.</p>');
      var html = '<p class="of-win-note" style="margin:0 0 6px">Latest automated Slack reports · last 7 days · updated ' + ofPT(R.at) + ' PT</p>';
      OF_REP_ORDER.forEach(function (cat) {
        var G = L.filter(function (x) { return x.cat === cat; }); if (!G.length) return;
        html += '<h4>' + esc(cat) + '</h4><div class="of-rep-grid">' + G.map(function (x) {
          return '<details class="of-rep-card' + (x.alert ? ' alert' : '') + '"><summary><b>' + esc(x.head) + '</b>' + (x.sum ? '<span>' + esc(x.sum) + '</span>' : '') + '<small>' + ofAgo(x.posted) + ' · #' + esc(x.ch) + ' · <u>full report</u></small></summary><div class="of-win-rep">' + ofSlackHtml(x.text) + '</div></details>';
        }).join('') + '</div>';
      });
      return ofWin('Report wall', html);
    }
    if (id === 'applicants') {
      var A = OF.applicants || [];
      return ofWin('Applicants', (A.length ? '<table class="of-tbl"><thead><tr><th>Applicant</th><th>Position</th><th class="n">Joined</th><th class="n">Left</th></tr></thead>' + rows(A.map(function (a) { return [esc(a.n), esc(a.pos || '–'), ofPT(a.j), a.l ? ofPT(a.l) : 'still in']; })) + '</table>' : '<p>No applicants in the Help Desk room right now.</p>') +
        '<p class="of-win-note">Applicants rename themselves in Zoom as Name_Position (for example "Jay Compra_ISA"). Anyone named that way who is not on the staff list shows here.</p>');
    }
    if (id === 'client') {
      var cc = P.filter(function (o) { return o.p.group === 'reception' && o.present; }).map(function (o) { return esc(o.p.name); });
      return ofWin('Client Room', (OF.clients.length ? '<table class="of-tbl"><thead><tr><th>Client (Zoom name)</th><th class="n">Joined</th><th class="n">Left</th></tr></thead>' + rows(OF.clients.map(function (c) { return [esc(c.n), ofPT(c.j), c.l ? ofPT(c.l) : 'still in']; })) + '</table>' : '<p>No clients in the Help Desk room right now.</p>') +
        '<h4>Client Care on duty</h4><p>' + (cc.join(', ') || 'No one at the front desk right now.') + '</p><p class="of-win-note">Visitors are people in the Club Wealth Help Desk Zoom who are not on the staff list and not named Name_Position (those are applicants). They wait on the reception sofas; extra visitors sit in the Client Room. Zoom does not report breakout rooms.</p>');
    }
  }

  var OF_ZERO = null;
  function ofApply() {
    var S = OF.three; if (!S) return;
    var T = S.T; OF_ZERO = OF_ZERO || new T.Matrix4().makeScale(0, 0, 0);
    var byId = {}; OF.people.forEach(function (o) { byId[o.p.id] = o; });
    var C = { ok: 0x46c37b, review: 0xffb547, action: 0xff6b5a, eod: 0x46c37b, help: 0xffb547, none: 0x9aa0b8 }, col = new T.Color();
    var scr = S.pb.screen && S.pb.screen.im, ring = S.pb.ring && S.pb.ring.im;
    var used = {}, cnt = {}, AM2 = new T.Matrix4(), AQ2 = new T.Quaternion(), AE2 = new T.Euler(), ONE = new T.Vector3(1, 1, 1);
    Object.keys(S.awayIm || {}).forEach(function (k) { var im = S.awayIm[k]; for (var i = 0; i < im.count; i++) im.setMatrixAt(i, OF_ZERO); cnt[k] = 0; });
    S.persons.forEach(function (r) {
      var o = byId[r.pid]; if (!o) return;
      r.o = o; r.awayPos = null;
      var seat = null;
      if (o.away && S.awaySeats) { var list = S.awaySeats[o.away.room] || [], u = used[o.away.room] || 0; if (u < list.length) { seat = list[u]; used[o.away.room] = u + 1; } }
      if (seat && S.awayIm[r.tpl]) { S.awayIm[r.tpl].setMatrixAt(cnt[r.tpl]++, AM2.compose(new T.Vector3(seat[0], 0, seat[1]), AQ2.setFromEuler(AE2.set(0, seat[2], 0)), ONE)); r.awayPos = seat; }
      S.peo[r.tpl].setMatrixAt(r.idx, o.present && !seat ? r.M : OF_ZERO);
      if (scr) scr.setColorAt(r.screen, col.setHex(!o.present ? 0x252836 : o.td && o.td.state === 'idle' ? 0x8a6a2a : o.td && o.td.state === 'break' ? 0x3a3f55 : (S.isNight ? 0x8fb8ff : 0xcfe2ff)));
      if (ring) ring.setColorAt(r.ring, col.setHex(o.present ? (C[o.st] || C.none) : 0x5d6274));
    });
    Object.keys(S.peo).forEach(function (k) { S.peo[k].instanceMatrix.needsUpdate = true; });
    Object.keys(S.awayIm || {}).forEach(function (k) { S.awayIm[k].instanceMatrix.needsUpdate = true; });
    if (scr) scr.instanceColor.needsUpdate = true; if (ring) ring.instanceColor.needsUpdate = true;
    S.renderer.shadowMap.needsUpdate = true; S.dirty = true;
    if (S.clientIm) {
      var CM = new T.Matrix4(), CQ = new T.Quaternion(), CE = new T.Euler(), one = new T.Vector3(1, 1, 1);
      S.clientSeats.forEach(function (q, i) { var on = i < OF.clients.length; S.clientIm.setMatrixAt(i, on ? CM.compose(new T.Vector3(q[0], 0, q[1]).add(new T.Vector3(Math.sin(q[2]), 0, Math.cos(q[2])).multiplyScalar(-.05)), CQ.setFromEuler(CE.set(0, q[2], 0)), one) : OF_ZERO); });
      S.clientIm.instanceMatrix.needsUpdate = true;
    }
    if (S.applicantIm) {
      var AM = new T.Matrix4(), AQ = new T.Quaternion(), AE = new T.Euler(), one2 = new T.Vector3(1, 1, 1);
      S.applicantSeats.forEach(function (q, i) { S.applicantIm.setMatrixAt(i, i < OF.applicants.length ? AM.compose(new T.Vector3(q[0], 0, q[1]), AQ.setFromEuler(AE.set(0, q[2], 0)), one2) : OF_ZERO); });
      S.applicantIm.instanceMatrix.needsUpdate = true;
    }
    ofDrawHuddle(); ofDrawIsa(); ofDrawWall(); ofLabels(); ofList(); ofHud(); ofAttn(); ofReport();
    if (OF.sel) ofCard(OF.sel);
  }

  function ofSetNight(night) {
    var S = OF.three; if (!S || S.isNight === night) return;
    S.isNight = night; $('#of-stage').classList.toggle('night', night);
    S.hemi.intensity = night ? .25 : .35; S.hemi.color.setHex(night ? 0x8fa0ff : 0xffffff);
    S.sun.intensity = night ? .35 : 1.25; S.sun.color.setHex(night ? 0xaab8ff : 0xfff3e2);
    S.renderer.toneMappingExposure = night ? .62 : 1.05;
    S.lamps.forEach(function (m) { m.emissiveIntensity = night ? 2.2 : .1; });
    S.renderer.shadowMap.needsUpdate = true;
    if (S.persons.length) ofApply(); S.dirty = true;
  }

  /* Camera */
  function ofCam() {
    var S = OF.three, w = S.size[0], h = S.size[1], vh = 36 / S.zoom, a = w / h;
    S.cam.left = -vh * a / 2; S.cam.right = vh * a / 2; S.cam.top = vh / 2; S.cam.bottom = -vh / 2; S.cam.updateProjectionMatrix();
    var d = 90; S.cam.position.set(S.target.x + d * Math.sin(S.theta) * Math.cos(S.phi), S.target.y + d * Math.sin(S.phi), S.target.z + d * Math.cos(S.theta) * Math.cos(S.phi));
    S.cam.lookAt(S.target); S.dirty = true;
  }
  function ofResize() {
    var S = OF.three; if (!S) return; var st = $('#of-stage'), w = st.clientWidth, h = st.clientHeight; if (!w || !h) return;
    S.size = [w, h]; S.renderer.setSize(w, h, false); ofCam();
  }
  function ofControls() {
    var S = OF.three, el = S.renderer.domElement, pts = {}, start = null, last = null, pinch = 0, moved = 0;
    el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    el.addEventListener('mousedown', function (e) { if (e.button === 1) e.preventDefault(); });
    el.addEventListener('pointerdown', function (e) { if (e.button === 1) e.preventDefault(); el.setPointerCapture(e.pointerId); pts[e.pointerId] = [e.clientX, e.clientY]; start = last = [e.clientX, e.clientY]; moved = 0; S.goal = null; el.classList.add('drag'); S.panMode = !(e.button === 1 || e.button === 2 || e.shiftKey); });
    el.addEventListener('pointermove', function (e) {
      if (!pts[e.pointerId]) return; pts[e.pointerId] = [e.clientX, e.clientY];
      var ids = Object.keys(pts);
      if (ids.length === 2) { var a = pts[ids[0]], b = pts[ids[1]], dd = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch) { S.zoom = Math.max(.45, Math.min(4.5, S.zoom * dd / pinch)); ofCam(); } pinch = dd; moved = 99; return; }
      var dx = e.clientX - last[0], dy = e.clientY - last[1]; last = [e.clientX, e.clientY]; moved += Math.abs(dx) + Math.abs(dy);
      if (S.panMode) { var k = 36 / S.zoom / S.size[1], f = new S.T.Vector3(); S.cam.getWorldDirection(f); f.y = 0; f.normalize(); var r = new S.T.Vector3(f.z, 0, -f.x); S.target.addScaledVector(r, dx * k).addScaledVector(f, dy * k / Math.sin(S.phi)); clampT(); }
      else { S.theta -= dx * .006; S.phi = Math.max(.32, Math.min(1.35, S.phi + dy * .004)); }
      ofCam();
    });
    function up(e) { delete pts[e.pointerId]; pinch = 0; el.classList.remove('drag'); if (start && moved < 6 && e.type === 'pointerup') ofPick(e); start = null; }
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    /* Zoom gestures anywhere over the office (canvas, name tags, buttons) zoom the 3D view only, never the page.
       Trackpad pinch and Ctrl+scroll arrive as wheel events with ctrlKey; Safari sends gesture events. */
    var stage = $('#of-stage');
    stage.addEventListener('wheel', function (e) {
      if (e.target.closest('.of-win-b')) { if (!e.ctrlKey) return; }
      e.preventDefault(); S.goal = null;
      var k = e.ctrlKey ? .01 : .0015, dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      S.zoom = Math.max(.45, Math.min(4.5, S.zoom * Math.exp(-dy * k))); ofCam();
    }, { passive: false });
    var gz = 1;
    stage.addEventListener('gesturestart', function (e) { e.preventDefault(); gz = S.zoom; }, { passive: false });
    stage.addEventListener('gesturechange', function (e) { e.preventDefault(); S.zoom = Math.max(.45, Math.min(4.5, gz * e.scale)); ofCam(); }, { passive: false });
    stage.addEventListener('gestureend', function (e) { e.preventDefault(); }, { passive: false });
    function clampT() { S.target.x = Math.max(-30, Math.min(48, S.target.x)); S.target.z = Math.max(-18, Math.min(20, S.target.z)); }
  }
  function ofPick(e) {
    var S = OF.three, rc = new S.T.Raycaster(), r = S.renderer.domElement.getBoundingClientRect();
    rc.setFromCamera(new S.T.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1), S.cam);
    var sh = rc.intersectObjects(S.screenMeshes || [], false)[0], hit = rc.intersectObjects(S.pick, false)[0];
    if (sh && (!hit || sh.distance <= hit.distance)) { ofScreen(sh.object.userData.screen); return; }
    if (!hit || hit.instanceId == null) return;
    var tk = hit.object.userData.tpl, rec = S.persons.filter(function (p) { return p.tpl === tk && p.idx === hit.instanceId; })[0];
    if (rec) ofSelect(rec.pid, false);
  }
  function ofFocus(pid) {
    var S = OF.three, rec = S.persons.filter(function (p) { return p.pid === pid; })[0]; if (!rec) return;
    S.goal = { t: new S.T.Vector3(rec.pos.x, 0, rec.pos.z), z: Math.max(S.zoom, 2.3) };
  }

  /* Labels */
  function ofLabels() {
    var S = OF.three, box = $('#of-labels'); if (!S) return;
    var html = '';
    S.persons.forEach(function (r) {
      var o = r.o; if (!o) return;
      var show = OF.filter === 'all' || OF.filter === o.p.group || (OF.filter === 'admin' && o.p.group === 'manager') || (OF.filter === 'isa' && (o.p.group === 'rm' || o.p.group === 'coach')), qm = !OF.q || (o.p.name + ' ' + o.p.full + ' ' + o.p.dept).toLowerCase().indexOf(OF.q) >= 0;
      html += '<button type="button" class="of-chip' + (o.p.group === 'isa' ? ' isa' : o.p.group === 'manager' ? (o.p.boss ? ' boss' : ' mgr') : '') + ' st-' + o.st + (o.present ? '' : ' off') + (OF.sel === o.p.id ? ' sel' : '') + (o.attn && o.attn.length ? ' attn' : '') + (show && qm ? '' : ' dim') + '" data-pid="' + o.p.id + '" aria-label="' + esc(o.p.full) + '"><i></i>' + esc(o.p.name) + (o.badge && o.present ? '<em>' + esc(o.badge) + '</em>' : '') + (o.away ? '<em class="td-brk">' + ({ lunch: 'Lunch', break: 'Break', rr: 'RR' }[o.away.kind]) + ' ' + o.away.mins + 'm</em>' : o.present && o.td && o.td.state === 'idle' && o.td.mins >= 10 ? '<em class="td-idle">Idle ' + o.td.mins + 'm</em>' : o.present && o.td && o.td.state === 'break' ? '<em class="td-brk">Break</em>' : '') + '</button>';
    });
    (OF.clients || []).slice(0, (S.clientSeats || []).length).forEach(function (c, i) {
      html += '<button type="button" class="of-chip client" data-client="' + i + '" aria-label="Client ' + esc(c.n) + '"><i></i>' + esc(c.n.split(' ')[0]) + '<em>Client</em></button>';
    });
    (OF.applicants || []).slice(0, (S.applicantSeats || []).length).forEach(function (a, i) {
      html += '<button type="button" class="of-chip client appl" data-appl="' + i + '" aria-label="Applicant ' + esc(a.n) + '"><i></i>' + esc(a.n.split(' ')[0]) + '<em>' + esc(a.pos || 'Applicant') + '</em></button>';
    });
    box.innerHTML = html;
    S.chips = {}; $$('.of-chip', box).forEach(function (c) { S.chips[c.dataset.pid] = c; });
    S.dirty = true;
  }
  function ofPlaceLabels() {
    var S = OF.three; if (!S || !S.chips) return;
    var v = new S.T.Vector3(), w = S.size[0], h = S.size[1];
    $$('#of-labels .of-chip.client:not(.appl)').forEach(function (c) {
      var q = S.clientSeats[+c.dataset.client]; v.set(q[0], (S.clientHead || 1.3) + .3, q[1]).project(S.cam);
      c.style.transform = 'translate(' + ((v.x + 1) / 2 * w).toFixed(1) + 'px,' + ((1 - v.y) / 2 * h).toFixed(1) + 'px) translate(-50%,-100%)'; c.style.zIndex = '1600';
    });
    $$('#of-labels .of-chip.appl').forEach(function (c) {
      var q = S.applicantSeats[+c.dataset.appl]; v.set(q[0], (S.applicantHead || 1.3) + .3, q[1]).project(S.cam);
      c.style.transform = 'translate(' + ((v.x + 1) / 2 * w).toFixed(1) + 'px,' + ((1 - v.y) / 2 * h).toFixed(1) + 'px) translate(-50%,-100%)'; c.style.zIndex = '1600';
    });
    $('#of-labels').classList.toggle('mini', S.zoom < 1.7);
    S.persons.forEach(function (r) {
      var c = S.chips[r.pid]; if (!c) return;
      if (r.awayPos) v.set(r.awayPos[0], r.headY + .32, r.awayPos[1]).project(S.cam); else v.set(r.pos.x, (r.o && r.o.present ? r.headY : 1.0) + .32, r.pos.z).project(S.cam);
      var x = (v.x + 1) / 2 * w, y = (1 - v.y) / 2 * h;
      if (x < -60 || x > w + 60 || y < -20 || y > h + 40) { c.style.visibility = 'hidden'; return; }
      c.style.visibility = ''; c.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) translate(-50%,-100%)';
      c.style.zIndex = String(1000 + Math.round((1 - v.z) * 500));
    });
  }

  /* HUD + side list + card */
  function ofHud() {
    var P = OF.people, doc = OF.zoom, isa = P.filter(function (o) { return o.p.group === 'isa' || o.p.group === 'rm'; }), adm = P.filter(function (o) { return o.p.group !== 'isa' && o.p.group !== 'rm'; });
    var here = function (L) { return L.filter(function (o) { return o.present; }).length; };
    var cnt = function (st) { return isa.filter(function (o) { return o.st === st; }).length; };
    var when = OF.replay != null && doc ? 'Replay · ' + ofDayLabel(doc.date) + ' · ' + $('#of-rp-t').textContent : !doc && OF.td ? 'Live · Time Doctor as of ' + ofPT(OF.td.at) + ' PT' : !doc ? 'Zoom: no data yet' : OF.eff === 'day' ? (OF.zoomFresh ? 'Today' : 'Office closed · showing ' + ofDayLabel(doc.date)) + ' · everyone who clocked in' : OF.zoomFresh ? 'Live · Zoom as of ' + ofPT(doc.at) + ' PT' : 'Office closed · last Zoom day ' + ofDayLabel(doc.date);
    $('#of-hud-when').innerHTML = '<span class="lv" style="' + (OF.zoomFresh && OF.eff === 'now' ? '' : 'background:#9aa0b8;box-shadow:none') + '"></span>' + esc(when);
    var tdN = function (st) { return P.filter(function (o) { return o.td && o.td.state === st; }).length; };
    $('#of-hud-td').innerHTML = OF.td ? '<small>Time Doctor ' + esc(ofPT(OF.td.at)) + '</small> <i class="k" style="background:#46c37b"></i><b>' + tdN('working') + '</b> <small>working</small> <i class="k" style="background:#ffb547"></i><b>' + tdN('idle') + '</b> <small>idle</small> <i class="k" style="background:#9aa0b8"></i><b>' + tdN('break') + '</b> <small>break</small>'
      : OF.tdErr === 'not_granted' ? '<small>Time Doctor isn’t allowed for this page</small>' : OF.tdErr ? '<small>Time Doctor didn’t load</small> <button type="button" class="link" id="of-td-retry" style="color:#8fb8ff">Retry</button>' : '<small>Loading Time Doctor…</small>';
    var tr = $('#of-td-retry'); if (tr) tr.onclick = function () { OF.tdErr = null; ofTdLoad(); ofHud(); };
    $('#of-hud-n').innerHTML = '<b>' + here(adm) + '</b>/' + adm.length + ' <small>staff in</small> &nbsp; <b>' + here(isa) + '</b>/' + isa.length + ' <small>ISAs &amp; RMs in</small>';
    $('#of-hud-brk').innerHTML = brkData ? '<small>Last break check ' + esc(ofDayLabel(brkData.days[brkData.days.length - 1])) + '</small> <i class="k" style="background:#46c37b"></i><b>' + cnt('ok') + '</b> <i class="k" style="background:#ffb547"></i><b>' + cnt('review') + '</b> <i class="k" style="background:#ff6b5a"></i><b>' + cnt('action') + '</b>' : '<small>Loading break check…</small>';
  }
  function ofSub(o) {
    var z = o.z, bits = [];
    if (z) bits.push((o.inNow ? 'In since ' : 'In ') + ofPT(z.j) + (z.l ? ' – ' + ofPT(z.l) : o.inNow ? '' : ''));
    else bits.push(OF.zoom ? 'Not in Zoom' : 'No Zoom data');
    return bits.join(' · ');
  }
  function ofList() {
    var groups = [['manager', 'Head Admin office'], ['reception', 'Reception · Client Care'], ['admin', 'Staff'], ['isa', 'ISA floor'], ['rm', 'RMs · ISA floor'], ['coach', 'ISA Coach']], html = '';
    groups.forEach(function (g) {
      if (OF.filter !== 'all' && OF.filter !== g[0] && !(OF.filter === 'admin' && g[0] === 'manager') && !(OF.filter === 'isa' && (g[0] === 'rm' || g[0] === 'coach'))) return;
      var L = OF.people.filter(function (o) { return o.p.group === g[0] && (!OF.q || (o.p.name + ' ' + o.p.full + ' ' + o.p.dept).toLowerCase().indexOf(OF.q) >= 0); });
      if (!L.length) return;
      L.sort(function (a, b) { return (!!b.p.boss - !!a.p.boss) || (b.present - a.present) || a.p.name.localeCompare(b.p.name); });
      html += '<h6>' + esc(g[1]) + ' · ' + L.filter(function (o) { return o.present; }).length + '/' + L.length + '</h6>';
      L.forEach(function (o) {
        var h = ofHash(o.p.full), col = ['#2346c8', '#0f86b0', '#7d5cf0', '#3e9a31', '#cb3200', '#b86e00', '#1d8a4e'][h % 7];
        var ini = o.p.name.split(/[\s.-]+/).filter(Boolean).map(function (s) { return s[0]; }).join('').slice(0, 2).toUpperCase();
        html += '<li><button type="button" data-pid="' + o.p.id + '"' + (OF.sel === o.p.id ? ' aria-current="true"' : '') + '><span class="of-av" style="background:' + col + (o.present ? '' : ';opacity:.45') + '">' + esc(ini) + '</span><span><b>' + esc(o.p.name) + '</b><small>' + esc((g[0] === 'admin' || g[0] === 'manager' || g[0] === 'rm' || g[0] === 'coach' ? o.p.dept + ' · ' : '') + ofSub(o)) + '</small></span><span class="d st-' + o.st + '"></span></button></li>';
      });
    });
    if (OF.applicants && OF.applicants.length && OF.filter === 'all' && !OF.q) html += '<h6>Applicants · ' + OF.applicants.length + '</h6><li style="padding:2px 8px 8px;color:#c6cae4;font-size:12px">' + OF.applicants.map(function (a) { return esc(a.n) + (a.pos ? ' <span style="color:#8e94b8">(' + esc(a.pos) + ')</span>' : ''); }).join(', ') + '</li>';
    if (OF.clients && OF.clients.length && (OF.filter === 'all' || OF.filter === 'reception') && !OF.q) html += '<h6>Visitors at reception · ' + OF.clients.length + '</h6><li style="padding:2px 8px 8px;color:#c6cae4;font-size:12px">' + OF.clients.map(function (c) { return esc(c.n) + (c.open ? '' : ' <span style="color:#8e94b8">(' + ofPT(c.j) + ')</span>'); }).join(', ') + '</li>';
    if (false) html += '<h6>Also in Zoom (not on the roster)</h6><li style="padding:2px 8px 8px;color:#8e94b8;font-size:11.5px">' + OF.zoomOther.map(function (z) { return esc(z.n); }).join(', ') + '</li>';
    $('#of-list').innerHTML = html || '<li style="padding:12px;color:#8e94b8">No one matches.</li>';
  }
  function ofCard(pid) {
    var o = OF.people.filter(function (x) { return x.p.id === pid; })[0], el = $('#of-card'); if (!o) { el.hidden = true; return; }
    var rows = [['Department', o.p.dept]];
    if (o.z) { rows.push(['Zoom clock-in', ofPT(o.z.j)]); rows.push(['Zoom clock-out', o.z.l ? ofPT(o.z.l) : o.inNow ? 'still in' : '—']); rows.push(['Time in Zoom', Math.floor(o.z.m / 60) + 'h ' + (o.z.m % 60) + 'm']); }
    else rows.push(['Zoom', OF.zoom ? 'not in the Help Desk room on ' + ofDayLabel(OF.zoom.date) : 'no data yet']);
    if (o.huddle) rows.push(['7:30 huddle', o.huddle === 'on' ? 'on time' : o.huddle === 'late' ? o.late + ' min late' : 'not in Zoom']);
    if (o.away) rows.push(['Right now', ({ lunch: 'on lunch', break: 'on a break', rr: 'restroom' }[o.away.kind]) + ' · ' + o.away.mins + ' min · ' + ({ pantry: 'Pantry', lounge: 'Lounge', smoke: 'Smoking Area', rr: 'by the restrooms' }[o.away.room])]);
    if (o.td) { rows.push(['Time Doctor', o.td.state === 'working' ? 'working now' : o.td.state === 'break' ? 'on a break' : 'idle ' + o.td.mins + ' min']); rows.push(['First activity', ofPT(o.td.first)]); }
    else if (OF.td) rows.push(['Time Doctor', 'no activity today']);
    if (o.slack) { if (o.slack.calls != null) rows.push(['Calls (ISA report)', String(o.slack.calls)]); if (o.slack.signups != null) rows.push(['Half-day sign-ups', String(o.slack.signups)]); }
    var extraA = o.attn && o.attn.length ? '<p><span>Needs attention</span>' + o.attn.map(esc).join('<br>') + '</p>' : '';
    var extra = '', go = '';
    if (o.p.group === 'isa') {
      if (o.brk) { rows.push(['Break check', o.brk.st + ' · ' + ofDayLabel(o.brk.d)]); rows.push(['Calls', o.brk.calls == null ? '—' : String(o.brk.calls)]); rows.push(['Active calling', o.brk.actS || '—']); rows.push(['Extra break', o.brk.ex == null ? '—' : o.brk.ex + ' min']); rows.push(['Time Doctor', o.brk.td || '—']); if (o.brk.notes) extra += '<p><span>Notes</span>' + esc(o.brk.notes) + '</p>'; }
      else rows.push(['Break check', brkData ? 'no rows yet' : 'loading…']);
      go = '<button type="button" class="go" data-go="brk">Open in break check</button>';
    } else {
      if (o.eod) { rows.push(['Latest EOD', ofDayLabel(o.eod.date) + (o.eod.submitted ? ' · ' + o.eod.submitted.replace(/^.*?,\s*\d{4},\s*/, '') : '')]); if (o.eod.tasks != null) rows.push(['Tasks done', String(o.eod.tasks)]); if (o.eod.hours) rows.push(['Hours', String(o.eod.hours)]); if (o.eod.highlights) extra += '<p><span>Highlights</span>' + esc(o.eod.highlights) + '</p>'; if (o.eod.blockers) extra += '<p><span>Blockers / needs help</span>' + esc(o.eod.blockers) + '</p>'; }
      else rows.push(['Latest EOD', o.p.eod ? (eodData ? 'none yet' : 'loading…') : 'not on the EOD sheet']);
      if (o.p.eod) go = '<button type="button" class="go" data-go="eod">Open EOD reports</button>';
    }
    extra = extraA + extra;
    if (o.z && o.z.names.length) extra += '<p><span>Zoom name' + (o.z.names.length > 1 ? 's' : '') + '</span>' + esc(o.z.names.join(', ')) + '</p>';
    el.innerHTML = '<div class="of-card-h"><span><b>' + esc(o.p.full) + '</b><small>' + esc(o.p.group === 'reception' ? 'Reception · Client Care' : o.p.dept) + (o.present ? ' · at desk' : '') + '</small></span><button type="button" class="x" aria-label="Close">×</button></div><dl>' +
      rows.map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('') + '</dl>' + extra + go;
    el.hidden = false;
    $('.x', el).onclick = function () { OF.sel = null; el.hidden = true; ofLabels(); ofList(); };
    var b = $('.go', el); if (b) b.onclick = function () {
      if (b.dataset.go === 'brk') { tab('brk'); var t = setInterval(function () { if (brkData) { clearInterval(t); $('#f-brk-isa').value = o.p.brk; brkQuick('30'); brkRender(); } }, 300); setTimeout(function () { clearInterval(t); }, 20000); }
      else { tab('eod'); var t2 = setInterval(function () { if (eodData) { clearInterval(t2); $('#f-eod-who').value = o.p.eod; eodRender(); } }, 300); setTimeout(function () { clearInterval(t2); }, 20000); }
    };
  }
  function ofAttn() {
    var L = OF.people.filter(function (o) { return o.attn && o.attn.length; }), el = $('#of-attn');
    el.hidden = !L.length; $('#of-attn-n').textContent = L.length;
    $('#of-attn-list').innerHTML = L.map(function (o) { return '<li><button type="button" data-pid="' + o.p.id + '"><b>' + esc(o.p.name) + '</b> <small>' + o.attn.map(esc).join(' · ') + '</small></button></li>'; }).join('');
  }
  function ofReport() {
    var S = OF.slack, el = $('#of-rep'); el.hidden = !S;
    if (!S) return;
    $('#of-rep-day').textContent = '#cw-isa · ' + (S.dayLabel || '') + (S.posted ? ' · posted ' + ofPT(S.posted) : '');
    $('#of-rep-body').innerHTML = ofSlackHtml(S.text || '');
  }
  function ofSelect(pid, focus) { OF.sel = pid; ofLabels(); ofList(); ofCard(pid); if (focus !== false) ofFocus(pid); if (OF.three) OF.three.dirty = true; }

  /* Loop: only re-render when the camera, the data or the lighting changed */
  function ofLoop() {
    var S = OF.three; if (!OF.running || !S) return;
    requestAnimationFrame(ofLoop);
    if (S.goal) { S.target.lerp(S.goal.t, .14); S.zoom += (S.goal.z - S.zoom) * .14; if (S.target.distanceTo(S.goal.t) < .02 && Math.abs(S.goal.z - S.zoom) < .01) S.goal = null; ofCam(); }
    if (!S.dirty) return;
    S.dirty = false; S.renderer.render(S.scene, S.cam); ofPlaceLabels();
  }

  function ofZoomSub() {
    if (OF.zsub || !(window.claude && claude.use)) return;
    OF.zsub = true;
    claude.use('db').then(function (db) {
      if (!db) { $('#of-tip').textContent = 'Zoom clock-ins load when the dashboard is opened on claude.ai.'; return; }
      db.doc('zoom/attendance').onSnapshot(function (snap) { OF.zoom = snap.exists ? snap.data() : null; ofBuild(); if (OF.three) ofApply(); }, function () { $('#of-tip').textContent = 'Couldn’t read the Zoom clock-ins.'; });
      db.doc('reports/slack').onSnapshot(function (snap) { OF.reports = snap.exists ? snap.data() : null; if (OF.three) { ofDrawWall(); OF.three.dirty = true; } }, function () {});
      db.doc('isa/slack').onSnapshot(function (snap) { OF.slack = snap.exists ? snap.data() : null; ofBuild(); if (OF.three) ofApply(); }, function () {});
    }).catch(function () {});
  }

  function officeOpen() {
    if (!OF) { setTimeout(officeOpen, 0); return; }
    if ($('[data-view="office"]').hidden) return;
    var wasRunning = OF.running; OF.running = true;
    if (!OF.started) {
      OF.started = true;
      $('#of-load').hidden = false;
      var ld = $('#of-load p');
      ofLoadThree().then(function (T) {
        if (ld) ld.textContent = 'Loading the furniture and people…';
        return ofLoadAssets(T, function (d, n) { if (ld) ld.textContent = 'Loading the office · ' + Math.round(d / n * 100) + '%'; });
      }).then(function (AS) {
        ofBuild(); ofInit(AS); ofControls(); ofResize();
        if (window.ResizeObserver) new ResizeObserver(ofResize).observe($('#of-stage')); else window.addEventListener('resize', ofResize);
        ofApply(); OF.started = 'ready';
        var h = ofHourPT(); ofSetNight(OF.light === 'night' || (OF.light !== 'day' && (h < 6 || h >= 18.5)));
        $('#of-load').hidden = true;
        ofLoop();
      }).catch(function (e) { console.error(e); $('#of-load').innerHTML = '<p>The 3D office didn’t load. Check the connection and open this tab again.</p>'; OF.started = false; });
      ofZoomSub(); ofTdLoad();
      setInterval(function () { if (OF.running && !document.hidden) ofTdLoad(); }, 180000);
      brkLoad(false); eodLoad(false);
      var waited = 0, poll = setInterval(function () {
        waited += 1;
        if ((brkData && !OF.hadBrk) || (eodData && !OF.hadEod)) { OF.hadBrk = !!brkData; OF.hadEod = !!eodData; ofBuild(); if (OF.three) ofApply(); }
        if ((OF.hadBrk && OF.hadEod) || waited > 90) clearInterval(poll);
      }, 700);
      setInterval(function () { if (OF.started === 'ready' && OF.light === 'auto') { var h = ofHourPT(); ofSetNight(h < 6 || h >= 18.5); } if (OF.started === 'ready') { ofBuild(); ofApply(); } }, 120000);
    } else if (OF.started === 'ready' && !wasRunning) { ofResize(); OF.three.dirty = true; ofLoop(); }
  }
  function officeClose() { if (OF) OF.running = false; }
  OF.light = 'auto';
  (function () {
    var root = $('#of-root'); if (!root) return;
    function side(open) { root.classList.toggle('collapsed', !open); $('#of-expand').hidden = open; try { localStorage.setItem('of-side', open ? '1' : '0'); } catch (e) {} }
    var saved = '1'; try { saved = localStorage.getItem('of-side') || '1'; } catch (e) {}
    side(saved !== '0');
    $('#of-collapse').addEventListener('click', function () { side(false); });
    $('#of-expand').addEventListener('click', function () { side(true); });
    var rp = $('#of-rp'), rpT = $('#of-rp-t'), timer = null;
    function hm(m) { var h = Math.floor(m / 60), mm = m % 60; return ((h + 11) % 12 + 1) + ':' + ('0' + mm).slice(-2) + (h < 12 ? ' AM' : ' PM'); }
    function setReplay(m) { OF.replay = m; rp.value = m; rpT.textContent = hm(m); ofBuild(); if (OF.three) ofApply(); }
    function stopPlay() { if (timer) { clearInterval(timer); timer = null; $('#of-rp-play').textContent = '▶'; } }
    rp.addEventListener('input', function () { stopPlay(); setReplay(+rp.value); });
    $('#of-rp-play').addEventListener('click', function () { if (timer) return stopPlay(); if (+rp.value >= 1080) rp.value = 300; this.textContent = '❚❚'; timer = setInterval(function () { var v = Math.min(1080, +rp.value + 5); setReplay(v); if (v >= 1080) stopPlay(); }, 260); });
    $('#of-rp-x').addEventListener('click', function () { stopPlay(); OF.replay = null; $('#of-replay').hidden = true; ofBuild(); if (OF.three) ofApply(); });
    $$('#of-view button').forEach(function (b) { b.addEventListener('click', function () {
      if (b.dataset.v === 'replay') { if (!OF.zoom) { $('#of-tip').textContent = 'Replay needs the Zoom clock-ins.'; return; } $('#of-replay').hidden = false; setReplay(+rp.value); return; }
      stopPlay(); OF.replay = null; $('#of-replay').hidden = true;
      OF.view = b.dataset.v; OF.viewAuto = false; ofBuild(); ofApply(); }); });
    $('#of-win-x').addEventListener('click', function () { $('#of-win').hidden = true; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') $('#of-win').hidden = true; });
    $('#of-attn-list').addEventListener('click', function (e) { var b = e.target.closest('button[data-pid]'); if (b) ofSelect(b.dataset.pid, true); });
    $$('#of-light button').forEach(function (b) { b.addEventListener('click', function () { OF.light = b.dataset.l; $$('#of-light button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); var h = ofHourPT(); ofSetNight(OF.light === 'night' || (OF.light === 'auto' && (h < 6 || h >= 18.5))); }); });
    $$('#of-tabs button').forEach(function (b) { b.addEventListener('click', function () { OF.filter = b.dataset.f; $$('#of-tabs button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); ofLabels(); ofList(); }); });
    $('#of-q').addEventListener('input', function () { OF.q = this.value.trim().toLowerCase(); ofLabels(); ofList(); });
    $('#of-list').addEventListener('click', function (e) { var b = e.target.closest('button[data-pid]'); if (b) ofSelect(b.dataset.pid, true); });
    $('#of-labels').addEventListener('click', function (e) { var b = e.target.closest('.of-chip'); if (b) ofSelect(b.dataset.pid, true); });
    $('#of-zin').addEventListener('click', function () { var S = OF.three; if (!S) return; S.goal = null; S.zoom = Math.min(4.5, S.zoom * 1.25); ofCam(); });
    $('#of-zout').addEventListener('click', function () { var S = OF.three; if (!S) return; S.goal = null; S.zoom = Math.max(.55, S.zoom / 1.25); ofCam(); });
    $('#of-rot').addEventListener('click', function () { var S = OF.three; if (!S) return; S.theta += Math.PI / 2; ofCam(); });
    $('#of-reset').addEventListener('click', function () { var S = OF.three; if (!S) return; S.goal = { t: new S.T.Vector3(7, 0, 0), z: .62 }; S.theta = .72; S.phi = .6; ofCam(); });
  })();
