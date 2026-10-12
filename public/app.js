(() => {
  'use strict';

  const STORAGE_KEY = 'cw-workflow-intake-draft-v1';
  const form = document.getElementById('intakeForm');
  const errorBox = document.getElementById('formError');
  const submitBtn = document.getElementById('submitBtn');
  const doneState = document.getElementById('doneState');

  const FLOWS = ['current', 'ideal'];

  const tpl = (id) => document.getElementById(id).content.firstElementChild.cloneNode(true);
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- builders ---------- */

  /* ---------- flow map (manual process / ideal automation) ----------
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
      const created = kind === 'task' ? addTask(add.dataset.flow) : null;
      created?.querySelector('input, textarea, select')?.focus();
      afterChange();
      return;
    }
    const rm = e.target.closest('[data-remove]');
    if (rm) {
      e.preventDefault();
      const item = rm.closest('.task');
      if (!item) return;
      if (item === fullTask) setFullscreen(item, false);
      const parent = item.parentElement;
      item.remove();
      renumberTasks(parent);
      afterChange();
    }
  });

  form.addEventListener('input', (e) => {
    if (e.target.closest('.invalid')) e.target.closest('.invalid').classList.remove('invalid');
    if (!errorBox.hidden && !$('.invalid', form)) showError('');
    afterChange();
  });
  form.addEventListener('change', afterChange);

  let saveTimer;
  function afterChange() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveDraft, 300);
  }

  /* ---------- serialize / restore ---------- */

  const val = (name) => (form.elements[name]?.value || '').trim();
  const clean = (s) => (s || '').trim();

  function collect() {
    const flow = (name) => $$(`[data-flow="${name}"] .task`, form).map((t) => ({
      title: clean($('[data-field="title"]', t).value),
      path: cleanPath(t._path),
    })).filter((t) => t.title || t.path);

    return {
      name: val('name'),
      email: val('email'),
      department: val('department'),
      date: val('date'),
      // The form asks three questions; they are sent in the original payload shape so the
      // Sheets relay keeps working: summary -> q2.overview, manual map -> q2.tasks,
      // "what slows you down" -> q6.overview, ideal automation -> q7.
      q2: { overview: val('q2_overview'), tasks: flow('current') },
      q6: { overview: val('q6_overview'), rows: [] },
      q7: { overview: val('q7_overview'), tasks: flow('ideal') },
      acknowledged: val('acknowledged'),
      website: val('website'),
    };
  }

  function render(data) {
    FLOWS.forEach((f) => {
      $(`[data-flow="${f}"].flows`, form).innerHTML = '';
      const key = f === 'current' ? 'q2' : 'q7';
      const tasks = data?.[key]?.tasks?.length ? data[key].tasks : [null];
      tasks.forEach((t) => addTask(f, t));
    });
    if (data) {
      ['name', 'email', 'department', 'date', 'acknowledged'].forEach((k) => { if (data[k]) form.elements[k].value = data[k]; });
      ['q2', 'q6', 'q7'].forEach((k) => {
        if (data[k]?.overview) form.elements[`${k}_overview`].value = data[k].overview;
      });
    }
    if (!form.elements.date.value) form.elements.date.value = today();
  }

  function saveDraft() {
    if (touring) return;
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
    if (!data.department) mark(form.elements.department, 'Enter your department, e.g. Events Department.');
    if (!data.date) mark(form.elements.date, 'Pick a date.');
    if (!data.q2.overview) mark(form.elements.q2_overview, 'Write a short process summary in question 1.');
    if (!$$('[data-flow="current"] .task', form).some((t) => countSteps(t._path) > 0)) {
      mark($('[data-flow="current"].flows', form), 'Map at least one step of your manual process in question 2.');
    }
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
    [['q2', 'current', 'Manual process (how it is done today)'], ['q7', 'ideal', 'Ideal automation']].forEach(([key, flow, flowLabel]) => {
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
    if (touring) return;
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

  /* ---------- guided tour ----------
   * Highlights the real form, types a worked example into it, and explains each part.
   * The person's own answers are snapshotted first and put back when the tour ends;
   * nothing typed by the tour is saved to the draft or submitted.
   */

  const TOUR_KEY = 'cw-workflow-tour-seen-v2';
  const spot = document.getElementById('tourSpot');
  const tip = document.getElementById('tourTip');
  const tipTitle = $('[data-tip-title]', tip);
  const tipText = $('[data-tip-text]', tip);
  const tipCount = $('[data-tip-count]', tip);
  const tipNext = $('[data-tip-next]', tip);
  let touring = false;
  let tourStep = 0;
  let tourSnapshot = null;
  let tourTarget = null;
  let busy = false;

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const firstFlow = () => $('[data-flow="current"] .task', form);
  const nodes = () => $$('[data-flow="current"] .task:first-child .node', form);

  async function type(el, text) {
    if (!el || !touring) return;
    el.focus({ preventScroll: true });
    el.value = '';
    const step = Math.max(1, Math.ceil(text.length / 70)); // long texts type in about the same time as short ones
    for (let k = 0; k < text.length && touring; k += step) {
      el.value = text.slice(0, k + step);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      await wait(14);
    }
    el.value = text;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.blur();
  }
  async function fillNode(n, tool, desc) {
    await type($('.node-tool', n), tool);
    await type($('.node-desc', n), desc);
  }
  const lastJunction = () => {
    const js = $$('[data-flow="current"] .task:first-child .junction', form);
    return js[js.length - 1];
  };

  const TOUR = [
    { title: 'Welcome! Let us show you how', text: 'This quick tour highlights each part of the form and fills in an example as you go. Click <b>Next</b> to move on. Your own answers are put back when the tour ends.' },
    { target: () => $('.card .grid-3', form), title: 'Your details',
      text: 'Your name, work email, the date, and your <b>department</b>, e.g. "Events Department".',
      run: async () => {
        await type(form.elements.name, 'Ali Berico');
        await type(form.elements.email, 'ali@clubwealth.com');
        await type(form.elements.department, 'Events Department');
      } },
    { target: () => form.elements.q2_overview, title: '01 · Process summary',
      text: 'Go through <b>all the tasks from your 10 bullet points</b>, numbered 1–10. For each: what it is, what starts it, how often, and how long it takes.',
      run: () => type(form.elements.q2_overview, '1. Daily Huddle report: every morning I pull yesterday\'s numbers into the huddle sheet. Daily, ~30 min.\n2. Remove from PB list: after events I remove registered people from the ProspectBoss call lists. 3x a week, ~45 min.\n3. Event stats updates: after every Half-Day event, Tara posts the sign-in sheet in Slack and I turn it into attendance stats. 3–4x a week, ~1 hour each.') },
    { target: () => $('.guide', form), title: 'The mapping guide',
      text: 'Open this any time for a full example and a checklist. Now let\'s map task 3 together.' },
    { target: () => $('.task-title', firstFlow()), title: '02 · One map per task',
      text: 'Give each map the <b>task title</b> from your summary. Use <b>+ Add another task</b> (below the map) for the next one.',
      run: () => type($('.task-title', firstFlow()), '3. Event stats updates') },
    { target: () => nodes()[0], title: 'Each box = one tool + what you do',
      text: '<b>Top box:</b> the tool <b>and exactly where</b> in it (here, the Slack channel). <b>Bottom box:</b> what you do there.',
      run: () => fillNode(nodes()[0], 'Slack #half-day-registration-forms', 'Open the Adobe Acrobat link Tara posts after each event') },
    { target: () => nodes()[1], title: 'Spreadsheets: link → tab → rows & columns',
      text: 'Click <b>Add another step</b> for the next thing you do. For a spreadsheet, always give the <b>link</b>, the <b>sheet tab</b>, and the <b>rows and columns</b> you read or change.',
      run: async () => {
        $('[data-act="add-step"]', lastJunction()).click();
        await wait(250);
        await fillNode(nodes()[1], 'Google Sheets – LIST MAKING CHECKLIST › Attendance Extracted', 'Type each signed attendee\'s name, phone and page into rows 2–40, columns A–C. Link: https://docs.google.com/spreadsheets/d/…');
      } },
    { target: () => nodes()[2], title: 'Keap: where in Keap + the automation name',
      text: '"Keap" alone isn\'t enough. Say <b>where in Keap</b> (Contacts, Campaign Builder, saved search, Broadcasts) and name the <b>automation, campaign or tag</b>. Do the same for every other tool.',
      run: async () => {
        $('[data-act="add-step"]', lastJunction()).click();
        await wait(250);
        await fillNode(nodes()[2], 'Keap › Contacts › contact record', 'Apply the tag "Attended – White Plains NY – 10-08-2026", which starts the automation "Post-event follow-up"');
      } },
    { target: () => $('.map-scroll', firstFlow()), title: 'Yes / No decisions',
      text: 'When the process splits on a question, use the plus <b>above</b> for YES and <b>below</b> for NO, and type the question in the <b>Decision</b> box.',
      run: async () => {
        $('[data-act="add-yes"]', lastJunction()).click();
        await wait(250);
        await type($('[data-bind="decision"]', firstFlow()), 'Contact found in Keap?');
        const yes = $('[data-flow="current"] .task:first-child .branch-yes .node', form);
        await fillNode(yes, 'Slack #half-day-registration-forms', 'Reply in Tara\'s thread with the Stat Sheet summary (attended, CWSocial25, opt-ins)');
      } },
    { target: () => $('[data-add="task"][data-flow="current"]', form), title: 'Next task',
      text: 'Click <b>+ Add another task</b> to start the map for your next task, until all your tasks are mapped.' },
    { target: () => form.elements.q6_overview, title: 'What slows you down? (optional)',
      text: 'One or two lines about the most time-consuming part.',
      run: () => type(form.elements.q6_overview, 'Reading handwriting on 13 pages and typing every phone number by hand.') },
    { target: () => $('[aria-labelledby="q3-title"]', form), title: '03 · Ideal automation (optional)',
      text: 'How you <b>wish</b> it worked. Write "Automatically" if you don\'t know the tool, and say where you\'d still check or approve. You can map it the same way.',
      run: () => type(form.elements.q7_overview, 'The sign-in sheet is read automatically and the rows appear in my sheet. I only check the flagged ones and click Finalize.') },
    { target: () => $('.ack', form), title: 'Finish and submit',
      text: 'Type <b>ACKNOWLEDGED</b> and click <b>Submit form</b>. You\'ll then be invited to Room 10 on the CW Helpdesk Zoom.' },
    { title: 'Your turn!', text: 'We\'ll clear the example now and put back anything you had typed. You can replay this tour any time with <b>Watch the tutorial</b> at the top.' },
  ];

  function place() {
    if (!touring) return;
    const pad = 8;
    if (!tourTarget) {
      spot.style.cssText = 'top:50%;left:50%;width:0;height:0;';
      tip.style.cssText = `top:${Math.max(16, innerHeight / 2 - tip.offsetHeight / 2)}px;left:${Math.max(16, innerWidth / 2 - tip.offsetWidth / 2)}px;`;
      return;
    }
    const r = tourTarget.getBoundingClientRect();
    spot.style.cssText = `top:${r.top - pad}px;left:${r.left - pad}px;width:${r.width + pad * 2}px;height:${r.height + pad * 2}px;`;
    const th = tip.offsetHeight;
    const tw = tip.offsetWidth;
    let top;
    if (r.bottom + pad + 14 + th < innerHeight) top = r.bottom + pad + 14;
    else if (r.top - pad - 14 - th > 0) top = r.top - pad - 14 - th;
    else top = innerHeight - th - 16;
    const left = Math.min(Math.max(16, r.left + r.width / 2 - tw / 2), innerWidth - tw - 16);
    tip.style.cssText = `top:${top}px;left:${left}px;`;
  }

  async function showTourStep(n) {
    tourStep = n;
    const st = TOUR[n];
    busy = true;
    tipNext.disabled = true;
    tipTitle.textContent = st.title;
    tipText.innerHTML = st.text;
    tipCount.textContent = `${n + 1} of ${TOUR.length}`;
    tipNext.textContent = n === TOUR.length - 1 ? 'Start filling it in' : 'Next';
    tourTarget = st.target ? st.target() : null;
    if (tourTarget) {
      tourTarget.scrollIntoView({ block: 'center', inline: 'center' });
      await wait(60);
    }
    place();
    if (st.run) {
      await st.run();
      // The step may have added nodes; re-resolve the target and follow it.
      if (st.target && touring) {
        tourTarget = st.target();
        tourTarget?.scrollIntoView({ block: 'center', inline: 'center' });
        await wait(60);
        place();
      }
    }
    busy = false;
    tipNext.disabled = false;
    if (touring) tipNext.focus({ preventScroll: true });
  }

  function openTour() {
    if (touring) return;
    if (fullTask) setFullscreen(fullTask, false);
    tourSnapshot = collect();
    touring = true;
    document.body.classList.add('touring');
    spot.hidden = false;
    tip.hidden = false;
    form.reset();
    render(null);
    showTourStep(0);
  }

  function endTour() {
    if (!touring) return;
    touring = false;
    document.body.classList.remove('touring');
    spot.hidden = true;
    tip.hidden = true;
    form.reset();
    render(tourSnapshot);
    tourSnapshot = null;
    clearTimeout(saveTimer);
    try { localStorage.setItem(TOUR_KEY, '1'); } catch { /* storage unavailable */ }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  tipNext.addEventListener('click', () => {
    if (busy) return;
    if (tourStep >= TOUR.length - 1) endTour();
    else showTourStep(tourStep + 1);
  });
  $('[data-tip-skip]', tip).addEventListener('click', endTour);
  document.addEventListener('keydown', (e) => { if (touring && e.key === 'Escape') endTour(); });
  window.addEventListener('resize', place);
  window.addEventListener('scroll', place, { passive: true });
  form.addEventListener('scroll', place, { capture: true, passive: true });
  $$('[data-open-tour]').forEach((btn) => btn.addEventListener('click', openTour));

  /* ---------- mapping guide pop-up ---------- */

  const guide = document.getElementById('guideDialog');
  let guideOpener = null;
  $$('[data-open-guide]').forEach((btn) => btn.addEventListener('click', () => {
    guideOpener = btn;
    guide.showModal();
    document.documentElement.classList.add('no-scroll');
    $('.guide-dialog-body', guide).scrollTop = 0;
  }));
  guide.addEventListener('click', (e) => {
    // Close on the X / footer button, or a click on the backdrop outside the panel.
    if (e.target.closest('[data-close-guide]') || e.target === guide) guide.close();
  });
  guide.addEventListener('close', () => {
    document.documentElement.classList.remove('no-scroll');
    guideOpener?.focus();
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

  // Run the guided tour on the first visit on a computer (phones see the device notice instead).
  let tourSeen = false;
  try { tourSeen = localStorage.getItem(TOUR_KEY) === '1'; } catch { /* storage unavailable */ }
  if (!tourSeen && matchMedia('(min-width: 641px) and (hover: hover)').matches) setTimeout(openTour, 600);
})();
