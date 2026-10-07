// Option 2 (Club Wealth University + Keap) screens and the Option 1 "floating over Keap" scene.
export default function cwuScreens({ ic, botIc }) {
  const S = {};
  const btab = (label, fav, color, on) => `<div class="btab${on ? ' on' : ''}"><span class="fav" style="background:${color}">${fav}</span>${label}</div>`;
  const browser = (tabsHtml, url) => `<div class="bt"><div class="dots"><i></i><i></i><i></i></div>${tabsHtml}</div><div class="url">${ic('arrow', 15)}<div class="bar">${ic('shield', 13)}${url}</div></div>`;
  const cwuTabs = (on = 'cwu') => btab('Keap · Contacts', 'K', '#2fa152', on === 'keap') + btab('Gmail · Inbox', 'G', '#d44638', on === 'gmail') + btab('Posting Calendar', 'S', '#1e8e3e', false) + btab('CW University · AI Task Hub', 'CW', '#0c3f7a', on === 'cwu');
  const nav = (dd) => `<div class="cwu-nav"><div class="cwu-logo"><b>CLUBWEALTH</b><span>UNIVERSITY</span></div>
    <div class="cwu-links"><span>My Stuff ▾</span><span>Courses</span><span>Coaching ▾</span><span>Teams</span><span>Boards ▾</span><span>Partners</span><span>Members Only ▾</span><span>Stat Tracker ▾</span><span>Calendar</span><span class="new">AI Task Hub ▾<em>NEW</em></span></div>
    <div class="cwu-icons">${ic('search', 20, 2.2)}${ic('bell', 19)}<div class="avatar">M</div></div>${dd || ''}</div>`;
  const hero = (title, sub) => `<div class="cwu-hero"><div class="mark"><b>CLUBWEALTH</b><span>UNIVERSITY</span></div><div class="t">${title}${sub ? `<small>${sub}</small>` : ''}</div></div>`;
  const cwuWin = (inner, tab = 'cwu', url = 'learning.clubwealth.com/ai-task-hub') => `<div class="win cwu">${browser(cwuTabs(tab), url)}${inner}</div>`;

  const TASKS = [['Client Communication', 'chat', 3], ['Billing Assistant', 'card'], ['Coaching Follow-Up', 'cal', 2], ['Event Communications', 'mega'], ['Client Summary', 'user'], ['Follow-Up Manager', 'flag', 5], ['Client Care Knowledge', 'book'], ['Data & Trackers', 'table'], ['Internal Updates', 'grid'], ['Content Assistant', 'spark']];
  const cwuSide = (active) => `<div class="cwu-side"><div class="h"><b>Client Care</b>AI Task Hub · Jizel</div>${TASKS.map(([n, i, c]) => `<div class="nav${n === active ? ' on' : ''}">${ic(i, 16)}<span>${n}</span>${c ? `<span class="n">${c}</span>` : ''}</div>`).join('')}<div style="margin-top:auto;padding:10px 8px 2px;font-size:12px;color:var(--muted)"><span class="keap-pill">Keap connected</span></div></div>`;

  // U1: CWU dashboard with the new AI Task Hub menu open
  const dd = `<div class="dd" style="left:1034px"><div class="di on">${ic('chat', 16)}Client Care<small>Your workspace</small></div><div class="di">${ic('phone', 16)}ISA<small>8 tasks</small></div><div class="di">${ic('cal', 16)}Events<small>10 tasks</small></div><div class="di">${ic('mega', 16)}Marketing<small>10 tasks</small></div><hr><div class="di">${ic('check', 16)}Needs my review<small>3</small></div><div class="di">${ic('clock', 16)}Automation runs<small>Keap</small></div></div>`;
  S['11-cwu-dashboard'] = cwuWin(`${nav(dd)}${hero("Miguel Ababon's Dashboard")}<div class="cwu-page"><div class="cwu-cards">
    <div class="cwu-card"><b>BUSINESS STRATEGY<br>MASTERMIND 2026</b><span>Dallas, TX</span></div>
    <div class="cwu-card"><b>Building Your AI Buyer<br>Agent Presentation</b><span>Course</span></div>
    <div class="cwu-card"><b>LISTING AGENT<br>BOOT CAMP 2026</b><span>Nashville, TN</span></div>
    <div class="cwu-card ai"><div class="h"><span class="bot">${botIc(18)}</span>AI Task Hub</div><div style="margin-top:12px;font-size:13.5px;color:var(--ink-2);line-height:1.5">3 drafts need your review<br>5 follow-ups due today</div><div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center"><span class="keap-pill">Synced with Keap</span><span class="btn pri">Open hub</span></div></div>
    <div class="cwu-card"><b>COACHING<br>CALENDAR</b><span>This week</span></div>
    <div class="cwu-card"><b>STAT<br>TRACKER</b><span>Half Day stats</span></div></div></div>`);

  // U2: AI task inside CWU with the Keap record beside it
  S['12-cwu-task'] = cwuWin(`${nav()}<div class="cwu-page">${cwuSide('Billing Assistant')}
    <div class="cwu-main"><div class="mh"><span class="bot" style="width:32px;height:32px;box-shadow:none;background:#0c3f7a">${botIc(17)}</span><b>Billing Response Assistant</b><span class="pill p-navy">Human review on</span></div>
      <div class="msgs" style="padding:20px 26px">
        <div class="m me" style="background:#0c3f7a">Maria Santos asked for a 3-month payment plan. Billing approved it.</div>
        <div class="m ai"><span class="lab">DRAFT · FROM KEAP RECORD</span>Hi Maria, your remaining <span class="hl-y">$1,500.00</span> can be split into <span class="hl-y">3 monthly payments of $500.00</span>, starting <span class="hl-y">November 1</span>. Your coaching access continues as normal.<div class="acts"><span class="btn pri" style="background:#0c3f7a;border-color:#0c3f7a">Approve: send via Keap</span><span class="btn">Edit</span><span class="btn">Shorter</span></div></div>
      </div>
      <div class="composer" style="margin:0 26px 20px"><div class="ph">Ask the assistant or adjust the draft…</div><div class="row"><span class="chip">Explain fees</span><span class="chip">Add cancellation policy</span><span class="send" style="background:#0c3f7a">${ic('send', 16)}</span></div></div></div>
    <div class="kp"><h5>KEAP CONTACT</h5><div style="display:flex;gap:10px;align-items:center"><div class="avatar" style="width:40px;height:40px">MS</div><div><b style="font-size:14px">Maria Santos</b><div style="font-size:12px;color:var(--muted)">Coaching · 12 months</div></div></div>
      <div><h5 style="margin-bottom:6px">TAGS</h5><span class="tag">Coaching Client</span><span class="tag">Billing: Plan Requested</span><span class="tag new">+ AI: Payment Plan Approved</span></div>
      <h5>WHEN YOU APPROVE, KEAP WILL</h5>
      <div class="kflow"><div class="kstep"><span class="k">1</span><div><b>Apply tag</b><small>AI: Payment Plan Approved</small></div></div><div class="kdown">↓</div>
      <div class="kstep"><span class="k">2</span><div><b>Run campaign</b><small>Payment Plan Confirmation</small></div></div><div class="kdown">↓</div>
      <div class="kstep"><span class="k">3</span><div><b>Send email + log note</b><small>On Maria's contact record</small></div></div></div></div></div>`);

  // U3: how the automations run in Keap
  const kb = (lab, title, text, cls = '') => `<div class="kbox ${cls}"><div class="lab">${lab}</div><b>${title}</b><p>${text}</p></div>`;
  const ka = `<div class="karrow">${ic('arrow', 26, 1.6)}</div>`;
  S['13-cwu-keap-flow'] = cwuWin(`${nav()}${hero('AI Task Hub', 'How your automations run in Keap')}<div class="cwu-page" style="flex-direction:column;padding:0;gap:0">
    <div class="km">${kb('1 · TRIGGER IN KEAP', 'Something happens', 'A tag is applied, a form is submitted, or a payment is missed in Keap.', 'keap')}${ka}${kb('2 · AI TASK HUB', 'AI prepares the work', 'Claude reads the Keap record and drafts the email, summary, or next step.')}${ka}${kb('3 · YOU, IN CW UNIVERSITY', 'You review & approve', 'The draft waits in the AI Task Hub tab until you approve or edit it.')}${ka}${kb('4 · ACTION IN KEAP', 'Keap does the rest', 'Keap applies the tag, runs the campaign, sends the email, and logs it on the contact.', 'keap')}</div>
    <div class="legend-note">Keap stays the single source of truth: contacts, tags, campaigns and history all live in Keap. The AI Task Hub only prepares and you approve.</div>
    <div style="padding:16px 22px 0"><table class="card" style="display:table;border-radius:12px;overflow:hidden"><thead><tr><th>Automation</th><th>Keap trigger</th><th>Keap campaign / action</th><th>Review</th></tr></thead><tbody>
      <tr><td><b>Payment plan confirmation</b></td><td><span class="tag">Billing: Plan Requested</span></td><td>Payment Plan Confirmation</td><td><span class="pill p-warn">You approve</span></td></tr>
      <tr><td><b>Past-due reminder</b></td><td><span class="tag">Payment Failed</span></td><td>Past-Due Sequence (#1–#3)</td><td><span class="pill p-warn">You approve</span></td></tr>
      <tr><td><b>New client welcome post</b></td><td><span class="tag">New Client</span></td><td>Welcome Post → Marketing queue</td><td><span class="pill p-warn">You approve</span></td></tr>
      <tr><td><b>Event reminder</b></td><td><span class="tag">LABC 2026 Registered</span></td><td>Event Reminder Sequence</td><td><span class="pill p-ok">Automatic</span></td></tr></tbody></table></div></div>`);

  // U4: working across tabs (Option 2's trade-off, shown neutrally)
  S['14-cwu-tabs'] = `<div class="win cwu">${browser(cwuTabs('keap'), 'keap.app/contacts/maria-santos')}
    <div class="crm"><div class="crm-side">${['users', 'mail', 'cal', 'table', 'gear'].map((n) => ic(n, 20)).join('')}</div><div class="crm-main">
      <div class="crm-h"><div class="avatar">MS</div><div><b>Maria Santos</b><small>Coaching client · Keap contact</small></div></div>
      <div class="crm-grid"><div class="crm-card"><h6>Details</h6><div class="crm-row"><span>Program</span>Coaching · 12 mo</div><div class="crm-row"><span>Balance</span>$1,500.00</div><div class="crm-row"><span>Coach</span>Tara</div><div class="crm-row"><span>Next call</span>Thursday</div></div>
      <div class="crm-card"><h6>Tags</h6><span class="tag">Coaching Client</span><span class="tag">Billing: Plan Requested</span><span class="tag">AI: Payment Plan Approved</span></div></div>
      <div class="crm-card"><h6>Activity</h6><div class="tl"><i></i>Email sent: Payment Plan Confirmation · campaign · 2:41 PM</div><div class="tl"><i></i>Tag applied: AI: Payment Plan Approved · via AI Task Hub</div><div class="tl"><i></i>Note: plan approved by billing</div></div></div></div>
    <div class="callout" style="left:130px;top:620px;max-width:360px"><b>Working in Keap?</b> The AI Task Hub is one tab over. Click the <b>CW University</b> tab to ask the assistant, then come back here.</div></div>`;

  // A1: Option 1 — the desktop app floating over Keap in the browser
  S['10-app-over-keap'] = `<div class="desk"><div class="menubar"><b>AI Task Hub</b><span>File</span><span>Edit</span><span>View</span><span>Window</span><span style="margin-left:auto">Tue 2:41 PM</span></div>
    <div class="browser">${browser(btab('Keap · Contacts', 'K', '#2fa152', true) + btab('Gmail · Inbox', 'G', '#d44638', false) + btab('Posting Calendar', 'S', '#1e8e3e', false), 'keap.app/contacts/maria-santos')}
      <div class="crm"><div class="crm-side">${['users', 'mail', 'cal', 'table', 'gear'].map((n) => ic(n, 20)).join('')}</div><div class="crm-main">
        <div class="crm-h"><div class="avatar">MS</div><div><b>Maria Santos</b><small>Coaching client · Keap contact</small></div></div>
        <div class="crm-grid"><div class="crm-card"><h6>Details</h6><div class="crm-row"><span>Program</span>Coaching · 12 mo</div><div class="crm-row"><span>Balance</span>$1,500.00</div><div class="crm-row"><span>Coach</span>Tara</div><div class="crm-row"><span>Next call</span>Thursday</div></div>
        <div class="crm-card"><h6>Tags</h6><span class="tag">Coaching Client</span><span class="tag">Billing: Plan Requested</span></div></div>
        <div class="crm-card"><h6>Activity</h6><div class="tl"><i></i>Note: payment plan requested</div><div class="tl"><i></i>Email received · 1:58 PM</div></div></div></div></div>
    <div class="float-app"><div class="mini-h"><div class="bot">${botIc(16)}</div><div><b>AI Task Hub · Client Care</b><small>Floating · always on top</small></div><div class="x">${ic('min', 14)}${ic('x', 14)}</div></div>
      <div class="tabs-s"><span class="on">Billing</span><span>Messages</span><span>Follow-ups</span><span>Summary</span></div>
      <div class="mini-b"><div style="font-size:11.5px;color:var(--muted)"><span class="keap-pill">Reading Maria Santos from Keap</span></div>
        <div class="m me">Draft her payment plan confirmation.</div>
        <div class="m ai"><span class="lab">DRAFT</span>Hi Maria, your remaining $1,500.00 can be split into 3 monthly payments of $500.00, starting November 1…</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap"><span class="btn pri" style="height:30px;font-size:12px">Approve: send via Keap</span><span class="btn" style="height:30px;font-size:12px">Edit</span></div></div>
      <div class="mini-in">Ask anything…<span class="send" style="margin-left:auto">${ic('send', 13)}</span></div></div>
    <div class="callout" style="left:640px;top:600px;max-width:300px"><b>No tab switching.</b> The app floats beside Keap, Gmail or Sheets while you work.</div>
    <div class="dock"><i style="background:#2b6cb0">${ic('globe', 20)}</i><i style="background:#d44638">${ic('mail', 20)}</i><i style="background:#1e8e3e">${ic('table', 20)}</i><i class="run" style="background:#0b1b3d;box-shadow:0 0 0 2px #b08d4a">${botIc(22)}</i></div></div>`;
  return S;
}
