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

  function addTask(flow, data) {
    const wrap = $(`[data-flow="${flow}"].flows`, form);
    const task = tpl('tpl-task');
    $('[data-field="title"]', task).value = data?.title || '';
    const stepData = data?.steps?.length ? data.steps : [{}];
    stepData.forEach((s) => addStep(task, s));
    wrap.appendChild(task);
    renumberTasks(wrap);
    return task;
  }

  // A main step carries its own YES/NO lanes plus the junction that follows it.
  function addStep(task, data = {}) {
    const steps = $('[data-steps]', task);
    const step = tpl('tpl-step');
    step.appendChild(tpl('tpl-junction'));
    const card = $('.step-card', step);
    $('[data-field="tool"]', card).value = data.tool || '';
    $('[data-field="description"]', card).value = data.description || '';
    $('[data-field="decision"]', card).value = data.decision || '';
    (data.yes || []).forEach((sub) => addSub(step, 'yes', sub));
    (data.no || []).forEach((sub) => addSub(step, 'no', sub));
    steps.appendChild(step);
    renumberSteps(steps);
    syncBranches(step);
    return step;
  }

  function addSub(step, branch, data = {}) {
    const lane = $(`[data-branch="${branch}"].lane-items`, step);
    const el = tpl('tpl-sub');
    $('[data-field="tool"]', el).value = data.tool || '';
    $('[data-field="description"]', el).value = data.description || '';
    lane.appendChild(el);
    syncBranches(step);
    return el;
  }

  // Show a lane only when it has sub steps; show the decision field once any branch exists.
  function syncBranches(step) {
    let any = false;
    ['yes', 'no'].forEach((b) => {
      const items = $$(`[data-branch="${b}"].lane-items > .sub-step`, step);
      items.forEach((it, i) => { $('[data-sub-num]', it).textContent = `${b.toUpperCase()} ${i + 1}`; });
      $(`[data-lane="${b}"]`, step).classList.toggle('has-items', items.length > 0);
      if (items.length) any = true;
    });
    $('[data-decision]', step).hidden = !any;
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

  function renumberSteps(steps) {
    const list = $$(':scope > .step', steps);
    list.forEach((s, i) => { $('[data-step-num]', s).textContent = String(i + 1).padStart(2, '0'); });
    // Never let a task drop below one step.
    list.forEach((s) => { $('.step-top [data-remove]', s).hidden = list.length <= 1; });
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
      else if (kind === 'step') created = addStep(add.closest('.task'));
      else if (kind === 'sub') created = addSub(add.closest('.step'), add.dataset.branch);
      else if (kind === 'row') created = addRow(add.dataset.table);
      created?.querySelector('input, textarea, select')?.focus();
      afterChange();
      return;
    }
    const rm = e.target.closest('[data-remove]');
    if (rm) {
      e.preventDefault();
      const item = rm.closest('.sub-step, .step, .task, .tool-item, .t-row');
      if (!item) return;
      const parent = item.parentElement;
      const owner = item.matches('.sub-step') ? item.closest('.step') : null;
      item.remove();
      if (owner) syncBranches(owner);
      else if (item.matches('.step')) renumberSteps(parent);
      else if (item.matches('.task')) renumberTasks(parent);
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
      steps: $$('.flow > .step', t).map((s) => {
        const card = $('.step-card', s);
        const branch = (b) => $$(`[data-branch="${b}"].lane-items > .sub-step`, s).map((el) => ({
          tool: clean($('[data-field="tool"]', el).value),
          description: clean($('[data-field="description"]', el).value),
        })).filter((x) => x.tool || x.description);
        return {
          tool: clean($('[data-field="tool"]', card).value),
          description: clean($('[data-field="description"]', card).value),
          decision: clean($('[data-field="decision"]', card).value),
          yes: branch('yes'),
          no: branch('no'),
        };
      }).filter((s) => s.tool || s.description || s.yes.length || s.no.length),
    })).filter((t) => t.title || t.steps.length);

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
    if (!data.q2.tasks.some((t) => t.steps.length)) {
      mark($('[data-flow="current"].flows', form), 'Map at least one step of your process in question 2.');
    }
    if (!data.platform.choice) mark(form.querySelector('input[name="platform"]'), 'Choose your preferred AI Task Hub option.');
    if (data.acknowledged.toUpperCase() !== 'ACKNOWLEDGED') mark(form.elements.acknowledged, 'Type ACKNOWLEDGED to confirm.');
    return problems;
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
      form.hidden = true;
      $('#doneRef').textContent = out.submissionId || '';
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

  $('#newResponse').addEventListener('click', () => {
    form.reset();
    render(null);
    doneState.hidden = true;
    form.hidden = false;
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

  const draft = loadDraft();
  render(draft);
  if (draft) $('#draftNote').textContent = 'We restored the answers you saved in this browser. Pick up where you left off.';
  updateBar();
})();
