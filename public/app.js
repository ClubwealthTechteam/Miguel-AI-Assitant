(() => {
  'use strict';

  const STORAGE_KEY = 'cw-workflow-intake-draft-v1';
  const form = document.getElementById('intakeForm');
  const errorBox = document.getElementById('formError');
  const submitBtn = document.getElementById('submitBtn');
  const doneState = document.getElementById('doneState');

  // Column definitions for the four repeating tables (Q3–Q6).
  const TABLES = {
    q3: [
      { key: 'task', label: 'Task title', placeholder: 'e.g. Applicant screening' },
      { key: 'info', label: 'Information / data needed', placeholder: 'e.g. Resume, phone, position applied for' },
      { key: 'source', label: 'Information source', placeholder: 'e.g. Jotform email, Recruit CRM' },
      { key: 'required', label: 'Required / optional', options: ['Required', 'Optional'] },
    ],
    q4: [
      { key: 'task', label: 'Task title', placeholder: 'e.g. Applicant screening' },
      { key: 'step', label: 'Repetitive step', placeholder: 'e.g. Copy details from email into the sheet' },
      { key: 'frequency', label: 'How often?', options: ['Several times a day', 'Daily', 'A few times a week', 'Weekly', 'Monthly', 'Per event / as needed'] },
      { key: 'time', label: 'Approx. time spent', placeholder: 'e.g. 5 min each, ~2 hrs/day' },
    ],
    q5: [
      { key: 'task', label: 'Task title', placeholder: 'e.g. Applicant screening' },
      { key: 'decision', label: 'Decision or approval', placeholder: 'e.g. Does the applicant qualify?' },
      { key: 'info', label: 'Info used for the decision', placeholder: 'e.g. Resume vs. role requirements' },
      { key: 'aiPrepare', label: 'Can AI prepare it?', options: ['Yes, fully', 'Partly, I review it', 'No, needs a person', 'Not sure'] },
    ],
    q6: [
      { key: 'task', label: 'Task title', placeholder: 'e.g. Interview scheduling' },
      { key: 'bottleneck', label: 'Bottleneck or delay', placeholder: 'e.g. Candidates don\'t reply to invites' },
      { key: 'workaround', label: 'Current workaround', placeholder: 'e.g. Separate chase sheet, re-send every 2 days' },
      { key: 'impact', label: 'Impact', placeholder: 'e.g. Delays hiring by ~1 week' },
    ],
  };
  const TOOL_GROUPS = ['web', 'apps', 'spreadsheets'];
  const FLOWS = ['current', 'ideal'];

  const tpl = (id) => document.getElementById(id).content.firstElementChild.cloneNode(true);
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- builders ---------- */

  function addTool(group, value = '') {
    const col = $(`[data-list="${group}"] [data-items]`, form);
    const el = tpl('tpl-tool');
    $('[data-field="value"]', el).value = value;
    col.appendChild(el);
    syncRemovable(col, '.tool-item');
    return el;
  }

  /* ---------- flow map (Q2 / Q7) ----------
   * Each task holds a tree: a path is a row of steps that ends either in a
   * junction (add step / start a YES or NO path) or in a split whose YES and
   * NO paths are themselves paths. The map is re-rendered from the tree after
   * every structural change; typing only updates the tree.
   */

  const MAX_DEPTH = 6;
  const newStep = (d = {}) => ({ tool: d.tool || '', description: d.description || '' });
  const newPath = (d = {}) => ({
    steps: (d.steps && d.steps.length ? d.steps : [{}]).map(newStep),
    decision: d.decision || '',
    yes: d.yes ? newPath(d.yes) : null,
    no: d.no ? newPath(d.no) : null,
  });

  // Drafts saved before the tree existed stored a flat list of steps.
  function pathFromTask(data) {
    if (data?.path) return newPath(data.path);
    if (data?.steps?.length) return newPath({ steps: data.steps });
    return newPath();
  }

  function addTask(flow, data) {
    const wrap = $(`[data-flow="${flow}"].flows`, form);
    const task = tpl('tpl-task');
    $('[data-field="title"]', task).value = data?.title || '';
    task._path = pathFromTask(data);
    wrap.appendChild(task);
    renderMap(task);
    renumberTasks(wrap);
    return task;
  }

  function renderMap(task, focus) {
    const map = $('[data-map]', task);
    const keepScroll = map.parentElement.scrollLeft;
    map.innerHTML = '';
    map.appendChild(renderPath(task, task._path, null, 0, focus));
    map.parentElement.scrollLeft = keepScroll;
    const target = focus && map.querySelector('[data-focus]');
    if (target) {
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
      target.removeAttribute('data-focus');
    }
  }

  // parent = { path, branch } when this path is a YES/NO path of a split.
  function renderPath(task, path, parent, depth, focus) {
    const el = tpl('tpl-path');
    const rerender = (f) => { renderMap(task, f); afterChange(); };

    path.steps.forEach((step, i) => {
      if (i > 0) el.appendChild(tpl('tpl-arrow'));
      const node = tpl('tpl-node');
      bind(node, step);
      const isLast = i === path.steps.length - 1;
      if (isLast && (path.yes || path.no)) {
        const dec = tpl('tpl-decision');
        bind(dec, path);
        node.appendChild(dec);
      }
      const rm = $('[data-act="remove-step"]', node);
      // The first path must keep one step; a YES/NO path disappears with its last step.
      rm.hidden = !parent && path.steps.length === 1;
      rm.addEventListener('click', () => {
        if (path.steps.length > 1) {
          path.steps.splice(i, 1);
        } else if (parent) {
          if ((path.yes || path.no) && !confirm('Remove this path and everything after it?')) return;
          parent.path[parent.branch] = null;
        }
        rerender();
      });
      if (focus === step) $('.node-tool', node).dataset.focus = '';
      el.appendChild(node);
    });

    if (path.yes || path.no) {
      const fork = tpl('tpl-fork');
      ['yes', 'no'].forEach((branch) => {
        const slot = $(`:scope > .fork-branches > .branch-${branch}`, fork); // :scope keeps nested splits from matching
        if (path[branch]) {
          slot.appendChild(renderPath(task, path[branch], { path, branch }, depth + 1, focus));
        } else {
          const empty = tpl('tpl-branch-empty');
          $('[data-label]', empty).textContent = `Add ${branch.toUpperCase()} path`;
          empty.addEventListener('click', () => {
            path[branch] = newPath();
            rerender(path[branch].steps[0]);
          });
          slot.classList.add('is-empty');
          slot.appendChild(empty);
        }
      });
      el.appendChild(fork);
    } else {
      el.appendChild(tpl('tpl-arrow'));
      const j = tpl('tpl-junction');
      $('[data-act="add-step"]', j).addEventListener('click', () => {
        const step = newStep();
        path.steps.push(step);
        rerender(step);
      });
      ['yes', 'no'].forEach((branch) => {
        const btn = $(`[data-act="add-${branch}"]`, j);
        if (depth >= MAX_DEPTH) { btn.hidden = true; return; }
        btn.addEventListener('click', () => {
          path[branch] = newPath();
          rerender(path[branch].steps[0]);
        });
      });
      el.appendChild(j);
    }
    return el;
  }

  // Inputs write straight into the tree object they belong to.
  function bind(root, obj) {
    $$('[data-bind]', root).forEach((input) => {
      const key = input.dataset.bind;
      input.value = obj[key] || '';
      input.addEventListener('input', () => { obj[key] = input.value; });
    });
  }

  /* ---------- map canvas: drag to pan + full screen ---------- */

  // Mouse drag on empty canvas pans it; touch devices keep native scrolling.
  form.addEventListener('pointerdown', (e) => {
    const scroller = e.target.closest('.map-scroll');
    if (!scroller || e.pointerType !== 'mouse' || e.button !== 0) return;
    if (e.target.closest('input, textarea, button, label, select')) return;
    e.preventDefault();
    const start = { x: e.clientX, y: e.clientY, left: scroller.scrollLeft, top: scroller.scrollTop };
    scroller.setPointerCapture(e.pointerId);
    scroller.classList.add('is-dragging');
    const move = (ev) => {
      scroller.scrollLeft = start.left - (ev.clientX - start.x);
      scroller.scrollTop = start.top - (ev.clientY - start.y);
    };
    const end = () => {
      scroller.classList.remove('is-dragging');
      scroller.removeEventListener('pointermove', move);
      scroller.removeEventListener('pointerup', end);
      scroller.removeEventListener('pointercancel', end);
    };
    scroller.addEventListener('pointermove', move);
    scroller.addEventListener('pointerup', end);
    scroller.addEventListener('pointercancel', end);
  });

  let fullTask = null;
  function setFullscreen(task, on) {
    if (on && fullTask && fullTask !== task) setFullscreen(fullTask, false);
    task.classList.toggle('is-full', on);
    const btn = $('[data-act="fullscreen"]', task);
    btn.setAttribute('aria-pressed', String(on));
    $('span', btn).textContent = on ? 'Exit full screen' : 'Full screen';
    document.documentElement.classList.toggle('no-scroll', on);
    $('.map-backdrop')?.remove();
    if (on) {
      const shade = document.createElement('div');
      shade.className = 'map-backdrop';
      shade.addEventListener('click', () => setFullscreen(task, false));
      document.body.appendChild(shade);
    }
    fullTask = on ? task : null;
  }
  form.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act="fullscreen"]');
    if (btn) setFullscreen(btn.closest('.task'), !btn.closest('.task').classList.contains('is-full'));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && fullTask) setFullscreen(fullTask, false);
  });

  const countSteps = (p) => (p ? p.steps.filter((s) => s.tool.trim() || s.description.trim()).length + countSteps(p.yes) + countSteps(p.no) : 0);

  // Trimmed copy of a path for saving/submitting; empty steps and empty paths are dropped.
  function cleanPath(p) {
    if (!p) return null;
    const out = {
      steps: p.steps.map((s) => ({ tool: s.tool.trim(), description: s.description.trim() })).filter((s) => s.tool || s.description),
      decision: p.decision.trim(),
      yes: cleanPath(p.yes),
      no: cleanPath(p.no),
    };
    return out.steps.length || out.yes || out.no ? out : null;
  }

  function addRow(table, data = {}) {
    const cols = TABLES[table];
    const body = $(`[data-table="${table}"] [data-items]`, form);
    const row = tpl('tpl-row');
    $$('.cell', row).forEach((cell, i) => {
      const col = cols[i];
      $('.cell-label', cell).textContent = col.label;
      let input = $('[data-field]', cell);
      if (col.options) {
        const select = document.createElement('select');
        select.innerHTML = '<option value="">Select…</option>' +
          col.options.map((o) => `<option>${escapeHtml(o)}</option>`).join('');
        input.replaceWith(select);
        input = select;
      } else {
        input.placeholder = col.placeholder || '';
      }
      input.dataset.field = col.key;
      input.value = data[col.key] || '';
    });
    body.appendChild(row);
    syncRemovable(body, '.t-row');
    return row;
  }

  /* ---------- numbering / remove visibility ---------- */

  function renumberTasks(wrap) {
    const tasks = $$('.task', wrap);
    tasks.forEach((t, i) => { $('[data-task-label]', t).textContent = `Task ${i + 1}`; });
    syncRemovable(wrap, '.task');
  }

  // The first item in each repeating group stays; extras get a remove button.
  function syncRemovable(container, itemSel) {
    const items = $$(`:scope > ${itemSel}`, container);
    items.forEach((it) => {
      const btn = it.querySelector(':scope > [data-remove], :scope > .task-head > [data-remove]');
      if (btn) btn.hidden = items.length <= 1;
    });
  }

  /* ---------- events ---------- */

  form.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]');
    if (add) {
      e.preventDefault();
      const kind = add.dataset.add;
      let created;
      if (kind === 'tool') created = addTool(add.dataset.group);
      else if (kind === 'task') created = addTask(add.dataset.flow);
      else if (kind === 'row') created = addRow(add.dataset.table);
      created?.querySelector('input, textarea, select')?.focus();
      afterChange();
      return;
    }
    const rm = e.target.closest('[data-remove]');
    if (rm) {
      e.preventDefault();
      const item = rm.closest('.task, .tool-item, .t-row');
      if (!item) return;
      if (item === fullTask) setFullscreen(item, false);
      const parent = item.parentElement;
      item.remove();
      if (item.matches('.task')) renumberTasks(parent);
      else if (item.matches('.tool-item')) syncRemovable(parent, '.tool-item');
      else if (item.matches('.t-row')) syncRemovable(parent, '.t-row');
      afterChange();
    }
  });

  form.addEventListener('input', (e) => {
    if (e.target.closest('.invalid')) e.target.closest('.invalid').classList.remove('invalid');
    if (!errorBox.hidden && !$('.invalid', form)) showError('');
    if (e.target.matches('.task-title')) refreshTaskTitles();
    afterChange();
  });
  form.addEventListener('change', afterChange);

  let saveTimer;
  function afterChange() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveDraft, 300);
  }

  // Task titles from Q2 become suggestions in the Q3–Q6 "Task title" cells.
  function refreshTaskTitles() {
    const titles = new Set($$('[data-flow="current"] .task-title', form).map((i) => i.value.trim()).filter(Boolean));
    $('#taskTitles').innerHTML = Array.from(titles).map((t) => `<option value="${escapeHtml(t)}"></option>`).join('');
  }

  /* ---------- serialize / restore ---------- */

  const val = (name) => (form.elements[name]?.value || '').trim();
  const clean = (s) => (s || '').trim();

  function collect() {
    const tools = {};
    TOOL_GROUPS.forEach((g) => {
      tools[g] = $$(`[data-list="${g}"] [data-field="value"]`, form).map((i) => clean(i.value)).filter(Boolean);
    });

    const flow = (name) => $$(`[data-flow="${name}"] .task`, form).map((t) => ({
      title: clean($('[data-field="title"]', t).value),
      path: cleanPath(t._path),
    })).filter((t) => t.title || t.path);

    const table = (name) => $$(`[data-table="${name}"] .t-row`, form).map((r) => {
      const obj = {};
      TABLES[name].forEach((c) => { obj[c.key] = clean($(`[data-field="${c.key}"]`, r).value); });
      return obj;
    }).filter((r) => Object.values(r).some(Boolean));

    const platform = form.querySelector('input[name="platform"]:checked');

    return {
      name: val('name'),
      email: val('email'),
      date: val('date'),
      tools,
      q2: { overview: val('q2_overview'), tasks: flow('current') },
      q3: { overview: val('q3_overview'), rows: table('q3') },
      q4: { overview: val('q4_overview'), rows: table('q4') },
      q5: { overview: val('q5_overview'), rows: table('q5') },
      q6: { overview: val('q6_overview'), rows: table('q6') },
      q7: { overview: val('q7_overview'), tasks: flow('ideal') },
      platform: { choice: platform ? platform.value : '', reason: val('platform_reason') },
      acknowledged: val('acknowledged'),
      website: val('website'),
    };
  }

  function render(data) {
    TOOL_GROUPS.forEach((g) => {
      $(`[data-list="${g}"] [data-items]`, form).innerHTML = '';
      const list = data?.tools?.[g]?.length ? data.tools[g] : [''];
      list.forEach((v) => addTool(g, v));
    });
    FLOWS.forEach((f) => {
      $(`[data-flow="${f}"].flows`, form).innerHTML = '';
      const key = f === 'current' ? 'q2' : 'q7';
      const tasks = data?.[key]?.tasks?.length ? data[key].tasks : [null];
      tasks.forEach((t) => addTask(f, t));
    });
    Object.keys(TABLES).forEach((t) => {
      $(`[data-table="${t}"] [data-items]`, form).innerHTML = '';
      const rows = data?.[t]?.rows?.length ? data[t].rows : [{}];
      rows.forEach((r) => addRow(t, r));
    });
    if (data) {
      ['name', 'email', 'date', 'acknowledged'].forEach((k) => { if (data[k]) form.elements[k].value = data[k]; });
      ['q2', 'q3', 'q4', 'q5', 'q6', 'q7'].forEach((k) => {
        if (data[k]?.overview) form.elements[`${k}_overview`].value = data[k].overview;
      });
      if (data.platform?.reason) form.elements.platform_reason.value = data.platform.reason;
      if (data.platform?.choice) {
        const r = form.querySelector(`input[name="platform"][value="${CSS.escape(data.platform.choice)}"]`);
        if (r) r.checked = true;
      }
    }
    if (!form.elements.date.value) form.elements.date.value = today();
    refreshTaskTitles();
  }

  function saveDraft() {
    try {
      const data = collect();
      delete data.website;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch { /* storage unavailable: drafts are a convenience only */ }
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function clearDraft() {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }

  /* ---------- validation + submit ---------- */

  function validate(data) {
    const problems = [];
    const mark = (el, msg) => {
      const host = el.closest('.field, .options, .flows') || el;
      host.classList.add('invalid');
      problems.push({ el, msg });
    };
    if (!data.name) mark(form.elements.name, 'Enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) mark(form.elements.email, 'Enter a valid email address.');
    if (!data.date) mark(form.elements.date, 'Pick a date.');
    if (!data.q2.overview) mark(form.elements.q2_overview, 'Walk us through the process in question 2.');
    if (!$$('[data-flow="current"] .task', form).some((t) => countSteps(t._path) > 0)) {
      mark($('[data-flow="current"].flows', form), 'Map at least one step of your process in question 2.');
    }
    if (!data.platform.choice) mark(form.querySelector('input[name="platform"]'), 'Choose your preferred AI Task Hub option.');
    if (data.acknowledged.toUpperCase() !== 'ACKNOWLEDGED') mark(form.elements.acknowledged, 'Type ACKNOWLEDGED to confirm.');
    return problems;
  }

  // PNG snapshots of every Q2/Q7 map, sent with the submission and saved to Drive.
  // A drawing failure never blocks the submission itself.
  const MAP_BUDGET = 3_200_000; // stays under Vercel's 4.5 MB request limit with the rest of the form
  async function buildMapImages(data) {
    if (typeof window.renderMapPNG !== 'function') return [];
    try { await document.fonts?.ready; } catch { /* fonts are a nicety */ }
    const maps = [];
    let used = 0;
    [['q2', 'current', 'Current process (the manual way)'], ['q7', 'ideal', 'Ideal automated process']].forEach(([key, flow, flowLabel]) => {
      data[key].tasks.forEach((t, i) => {
        if (!t.path) return;
        try {
          const title = t.title || `Task ${i + 1}`;
          const png = window.renderMapPNG(t.path, { title, flowLabel, name: data.name, date: data.date });
          if (!png || used + png.length > MAP_BUDGET) return;
          used += png.length;
          maps.push({ flow, task: i + 1, title, png });
        } catch (err) {
          console.warn('Map image skipped', err);
        }
      });
    });
    return maps;
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = !msg;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    $$('.invalid', form).forEach((el) => el.classList.remove('invalid'));
    const data = collect();
    const problems = validate(data);
    if (problems.length) {
      showError(problems.length === 1 ? problems[0].msg : `${problems[0].msg} (${problems.length - 1} more item${problems.length > 2 ? 's' : ''} to fix, highlighted above.)`);
      problems[0].el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (problems[0].el.focus) setTimeout(() => problems[0].el.focus({ preventScroll: true }), 350);
      return;
    }
    data.acknowledged = 'ACKNOWLEDGED';
    if (editingOf) data.editOf = editingOf;
    data.maps = await buildMapImages(data);

    showError('');
    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');
    $('.btn-label', submitBtn).textContent = 'Submitting…';
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.ok) throw new Error(out.error || `Submission failed (${res.status}).`);
      clearDraft();
      // Keep the submitted answers so "Edit my response" can reopen them.
      lastSubmitted = { ...data };
      delete lastSubmitted.maps;
      delete lastSubmitted.website;
      lastRef = out.submissionId || '';
      editingOf = '';
      $('#editBanner').hidden = true;
      form.hidden = true;
      $('#doneRef').textContent = lastRef;
      doneState.hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      doneState.focus({ preventScroll: true });
    } catch (err) {
      showError(`${err.message} Your answers are still saved here, so you can try again.`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
      $('.btn-label', submitBtn).textContent = 'Submit form';
    }
  });

  // Reopen the answers just submitted; resubmitting sends an updated copy tagged with the original reference.
  let lastSubmitted = null;
  let lastRef = '';
  let editingOf = '';
  $('#editResponse').addEventListener('click', () => {
    form.reset();
    render(lastSubmitted);
    editingOf = lastRef;
    const banner = $('#editBanner');
    banner.textContent = lastRef
      ? `You're editing your response ${lastRef}. Make your changes and submit again; we'll use your latest version.`
      : "You're editing your response. Make your changes and submit again; we'll use your latest version.";
    banner.hidden = false;
    doneState.hidden = true;
    form.hidden = false;
    saveDraft();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- comparison dialog (Q8) ---------- */

  const compare = document.getElementById('compareDialog');
  let compareOpener = null;
  document.querySelectorAll('[data-open-compare]').forEach((btn) => btn.addEventListener('click', () => {
    compareOpener = btn;
    compare.showModal();
    document.documentElement.classList.add('no-scroll');
    $('.compare-body', compare).scrollTop = 0;
  }));
  compare.addEventListener('click', (e) => {
    // Close on the X / footer button, or a click on the backdrop outside the panel.
    if (e.target.closest('[data-close-compare]') || e.target === compare) compare.close();
  });
  compare.addEventListener('close', () => {
    document.documentElement.classList.remove('no-scroll');
    compareOpener?.focus();
  });

  /* ---------- helpers + chrome ---------- */

  function today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // Scroll progress bar.
  const bar = document.getElementById('progressBar');
  let ticking = false;
  const updateBar = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateBar); ticking = true; }
  }, { passive: true });

  // Gentle reveal on scroll.
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  // Phone/tablet notice: show the link and let people copy it to open on a computer.
  const gateUrl = location.origin + location.pathname;
  $('#gateUrl').textContent = gateUrl;
  $('#copyLink').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    try {
      await navigator.clipboard.writeText(gateUrl);
      btn.textContent = 'Link copied';
    } catch {
      window.prompt('Copy this link:', gateUrl);
    }
  });

  const draft = loadDraft();
  render(draft);
  if (draft) $('#draftNote').textContent = 'We restored the answers you saved in this browser. Pick up where you left off.';
  updateBar();
})();
