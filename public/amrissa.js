// Amrissa's AI Task Hub workspace: pick a tool, paste details or attach files,
// and stream Claude's answer from /api/assist. Prompts live on the server.
(function () {
  'use strict';

  var GROUPS = { rec: 'Recruiting', prop: 'Property & Contractors', data: 'Data & Tasks', proc: 'Process' };
  var MAX_FILES = 5, MAX_TOTAL = 3 * 1024 * 1024;
  var $ = function (id) { return document.getElementById(id); };
  var state = { tools: [], current: null, files: [], busy: false, raw: '' };

  function store(key, val) {
    try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; }
    return null;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  // Small markdown renderer: headings, bold, lists, tables, inline code.
  function render(md) {
    var lines = md.replace(/\r/g, '').split('\n'), out = [], i = 0;
    function inline(s) {
      return escapeHtml(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');
    }
    while (i < lines.length) {
      var l = lines[i];
      if (/^\s*\|.*\|\s*$/.test(l)) {
        var rows = [];
        while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) rows.push(lines[i++]);
        var cells = rows.filter(function (r) { return !/^\s*\|[\s:|-]+\|\s*$/.test(r); })
          .map(function (r) { return r.trim().replace(/^\||\|$/g, '').split('|').map(function (c) { return inline(c.trim()); }); });
        if (cells.length) {
          out.push('<div class="tbl"><table><thead><tr><th>' + cells[0].join('</th><th>') + '</th></tr></thead><tbody>' +
            cells.slice(1).map(function (c) { return '<tr><td>' + c.join('</td><td>') + '</td></tr>'; }).join('') + '</tbody></table></div>');
        }
        continue;
      }
      if (/^\s*([-*]|\d+[.)])\s+/.test(l)) {
        var ordered = /^\s*\d/.test(l), items = [];
        while (i < lines.length && /^\s*([-*]|\d+[.)])\s+/.test(lines[i])) items.push(inline(lines[i++].replace(/^\s*([-*]|\d+[.)])\s+/, '')));
        out.push((ordered ? '<ol>' : '<ul>') + '<li>' + items.join('</li><li>') + '</li>' + (ordered ? '</ol>' : '</ul>'));
        continue;
      }
      if (/^#{1,6}\s+/.test(l)) { out.push('<h4>' + inline(l.replace(/^#+\s+/, '')) + '</h4>'); i++; continue; }
      if (/^[A-Z][A-Z0-9 /&()'-]{2,}:/.test(l)) {
        var m = l.match(/^([^:]+):\s*(.*)$/);
        out.push('<h4>' + inline(m[1]) + '</h4>' + (m[2] ? '<p>' + inline(m[2]) + '</p>' : '')); i++; continue;
      }
      if (/^\[.*\]$/.test(l.trim())) { out.push('<p class="note">' + inline(l.trim().slice(1, -1)) + '</p>'); i++; continue; }
      if (!l.trim()) { i++; continue; }
      var para = [];
      while (i < lines.length && lines[i].trim() && !/^\s*(\||[-*]\s|\d+[.)]\s|#)/.test(lines[i])) para.push(inline(lines[i++]));
      if (para.length) out.push('<p>' + para.join('<br>') + '</p>'); else i++;
    }
    return out.join('');
  }

  function buildNav() {
    var nav = $('toolNav'), html = '', last = '', order = Object.keys(GROUPS);
    state.tools.sort(function (a, b) { return order.indexOf(a.group) - order.indexOf(b.group); });
    state.tools.forEach(function (t) {
      if (t.group !== last) { html += '<h3>' + escapeHtml(GROUPS[t.group] || t.group) + '</h3>'; last = t.group; }
      html += '<button type="button" data-id="' + t.id + '">' + escapeHtml(t.name) + '</button>';
    });
    nav.innerHTML = html;
    nav.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-id]');
      if (b) select(b.getAttribute('data-id'), true);
    });
  }

  function select(id, focus) {
    var t = state.tools.filter(function (x) { return x.id === id; })[0] || state.tools[0];
    if (!t) return;
    state.current = t;
    document.querySelectorAll('#toolNav button').forEach(function (b) { b.setAttribute('aria-current', String(b.getAttribute('data-id') === t.id)); });
    $('crumb').textContent = GROUPS[t.group] || '';
    $('toolName').textContent = t.name;
    $('toolDesc').textContent = t.description;
    $('give').innerHTML = '<strong>What to give it</strong><ul><li>' + t.give.map(escapeHtml).join('</li><li>') + '</li></ul>';
    $('fileZone').hidden = !t.files;
    if (!t.files) { state.files = []; renderFiles(); }
    $('input').placeholder = 'Paste the details here: ' + t.give.join('; ').toLowerCase() + '…';
    store('cw-amrissa-tool', t.id);
    if (location.hash.slice(1) !== t.id) history.replaceState(null, '', '#' + t.id);
    if (focus) $('input').focus();
  }

  function renderFiles() {
    $('fileList').innerHTML = state.files.map(function (f, i) {
      return '<li>' + escapeHtml(f.name) + ' <button type="button" aria-label="Remove ' + escapeHtml(f.name) + '" data-i="' + i + '">×</button></li>';
    }).join('');
  }

  function readFile(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve({ name: file.name, type: file.type || (/\.csv$/i.test(file.name) ? 'text/csv' : 'text/plain'), size: file.size, data: String(r.result).split(',')[1] || '' }); };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  function showError(msg) { var e = $('error'); e.textContent = msg; e.hidden = !msg; }

  function setStatus(connected) {
    var s = $('status');
    s.hidden = false;
    s.className = 'status ' + (connected ? 'on' : 'off');
    s.textContent = connected ? 'AI connected' : 'AI not connected yet';
  }

  async function run(e) {
    e.preventDefault();
    if (state.busy || !state.current) return;
    var text = $('input').value.trim();
    if (!text && !state.files.length) { showError('Paste some details or attach a file first.'); return; }
    showError('');
    var code = $('code').value.trim();
    if (code) store('cw-hub-code', code);

    state.busy = true; state.raw = '';
    $('runBtn').disabled = true; $('runBtn').textContent = 'Working…';
    $('resultPanel').hidden = false;
    var out = $('output');
    out.innerHTML = '<p class="typing">Thinking</p>';
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });

    try {
      var res = await fetch('/api/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: state.current.id, text: text, code: code, files: state.files.map(function (f) { return { name: f.name, type: f.type, data: f.data }; }) })
      });
      if (!res.ok) {
        var j = {};
        try { j = await res.json(); } catch (x) { /* not JSON */ }
        if (res.status === 401) { $('codeRow').hidden = false; $('code').focus(); }
        out.innerHTML = '';
        $('resultPanel').hidden = true;
        showError(j.error || 'Something went wrong. Please try again.');
        return;
      }
      var reader = res.body.getReader(), dec = new TextDecoder();
      for (;;) {
        var chunk = await reader.read();
        if (chunk.done) break;
        state.raw += dec.decode(chunk.value, { stream: true });
        out.innerHTML = render(state.raw);
        out.classList.add('typing');
      }
      out.innerHTML = render(state.raw);
    } catch (err) {
      showError('Connection problem. Check your internet and try again.');
    } finally {
      out.classList.remove('typing');
      state.busy = false;
      $('runBtn').disabled = false; $('runBtn').textContent = 'Run';
    }
  }

  function copyResult() {
    var btn = $('copyBtn');
    function done(m) { btn.textContent = m; setTimeout(function () { btn.textContent = 'Copy'; }, 1500); }
    function select() {
      var r = document.createRange(); r.selectNodeContents($('output'));
      var s = getSelection(); s.removeAllRanges(); s.addRange(r); done('Selected');
    }
    try { navigator.clipboard.writeText(state.raw).then(function () { done('Copied'); }, select); } catch (e) { select(); }
  }

  $('form').addEventListener('submit', run);
  $('clearBtn').addEventListener('click', function () {
    $('input').value = ''; state.files = []; renderFiles(); showError('');
    $('resultPanel').hidden = true; $('input').focus();
  });
  $('copyBtn').addEventListener('click', copyResult);
  $('fileInput').addEventListener('change', async function (e) {
    var picked = Array.prototype.slice.call(e.target.files || []);
    e.target.value = '';
    for (var i = 0; i < picked.length; i++) {
      if (state.files.length >= MAX_FILES) { showError('Up to 5 files at a time.'); break; }
      try { state.files.push(await readFile(picked[i])); } catch (x) { showError('Could not read ' + picked[i].name + '.'); }
    }
    var total = state.files.reduce(function (n, f) { return n + f.size; }, 0);
    if (total > MAX_TOTAL) { state.files.pop(); showError('Files are too large. Keep uploads under 3 MB in total.'); }
    renderFiles();
  });
  $('fileList').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-i]');
    if (b) { state.files.splice(Number(b.getAttribute('data-i')), 1); renderFiles(); }
  });

  var saved = store('cw-hub-code');
  if (saved) $('code').value = saved;

  fetch('/api/assist').then(function (r) { return r.json(); }).then(function (j) {
    state.tools = j.tools || [];
    buildNav();
    setStatus(j.connected);
    if (j.needsCode && !saved) $('codeRow').hidden = false;
    select(location.hash.slice(1) || store('cw-amrissa-tool') || (state.tools[0] && state.tools[0].id));
  }).catch(function () {
    $('toolName').textContent = 'Could not load tools';
    showError('Could not reach the AI Task Hub. Refresh the page to try again.');
  });
})();
