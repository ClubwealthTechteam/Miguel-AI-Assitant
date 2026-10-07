/**
 * Amrissa's Admin Tracker — Google Sheets + Apps Script
 *
 * Paste this whole file into Extensions → Apps Script of a NEW Google Sheet,
 * save, reload the sheet, then use the "CW Assistant" menu → "1. Set up tracker".
 *
 * What it does
 *  - Builds 4 tabs: Contractors, Candidates, Templates, Settings
 *  - Flags overdue contractor items (colors + "Days waiting")
 *  - Creates Gmail DRAFTS (never sends) for contractor follow-ups, grouped per contractor
 *  - Creates Gmail drafts for candidate messages from templates (invite, follow-up, rejection…)
 *  - Creates Google Calendar interview events for selected candidates
 *  - Emails Amrissa a daily summary every weekday morning
 *
 * Nothing is ever sent automatically to contractors or candidates. Amrissa reviews
 * each draft in Gmail and clicks Send.
 */

var TABS = { contractors: 'Contractors', candidates: 'Candidates', templates: 'Templates', settings: 'Settings' };

var CONTRACTOR_HEADERS = ['Property', 'Contractor', 'Contractor Email', 'Job', 'Waiting On',
  'Requested On', 'Due By', 'Status', 'Last Follow-Up', 'Days Waiting', 'Notes'];
var WAITING_ON = ['Quote', 'Appointment', 'Invoice', 'License', 'Insurance', 'Work completion', 'Other'];
var C_STATUS = ['Open', 'Waiting on contractor', 'Scheduled', 'Done', 'Cancelled'];

var CANDIDATE_HEADERS = ['Candidate', 'Email', 'Phone', 'Position', 'Stage', 'Interview Date/Time',
  'Interview Format', 'Link / Address', 'Interviewer', 'Last Contact', 'Next Step', 'Notes'];
var STAGES = ['Applied', 'Invite sent', 'Interview scheduled', 'Interviewed', 'Offer', 'Hired', 'Bench', 'Rejected'];
var FORMATS = ['Zoom', 'Phone', 'In person'];

var TEMPLATE_HEADERS = ['Template', 'Subject', 'Body'];
var DEFAULT_TEMPLATES = [
  ['Interview Invite', 'Interview invitation: {Position} at Club Wealth',
   'Hi {FirstName},\n\nThank you for applying for the {Position} role at Club Wealth. We would love to meet you!\n\n' +
   'Interview: {InterviewDateTime}\nFormat: {InterviewFormat}\nWhere / link: {LinkAddress}\nInterviewer: {Interviewer}\n\n' +
   'Please reply to confirm this time works for you, or let us know a better option.\n\nBest regards,\n{SignOff}'],
  ['Interview Follow-Up', 'Thank you for interviewing with Club Wealth',
   'Hi {FirstName},\n\nThank you for taking the time to interview for the {Position} role. ' +
   'We are reviewing all candidates and will update you on next steps soon.\n\nBest regards,\n{SignOff}'],
  ['No-Response Nudge', 'Following up: {Position} at Club Wealth',
   'Hi {FirstName},\n\nI wanted to follow up on my last message about the {Position} role. ' +
   'Are you still interested? Just reply to this email and we will take it from there.\n\nBest regards,\n{SignOff}'],
  ['Rejection', 'Your application for {Position} at Club Wealth',
   'Hi {FirstName},\n\nThank you for your interest in the {Position} role and for the time you spent with us. ' +
   'After careful consideration, we have decided to move forward with other candidates.\n\n' +
   'We truly appreciate your interest in Club Wealth and wish you the best.\n\nKind regards,\n{SignOff}'],
  ['Bench Notification', 'Staying in touch: {Position} at Club Wealth',
   'Hi {FirstName},\n\nThank you for your time with us. While we do not have an opening that fits right now, ' +
   'we were impressed and would like to keep your information on file for future roles.\n\n' +
   'We will reach out as soon as something comes up.\n\nBest regards,\n{SignOff}'],
  ['Onboarding Reminder', 'Getting ready for your first day at Club Wealth',
   'Hi {FirstName},\n\nWe are excited to have you join us as {Position}! Before your first day, please make sure to:\n\n' +
   '- {NextStep}\n\nIf you have any questions, just reply to this email.\n\nWelcome aboard,\n{SignOff}']
];

/* ---------------- Menu ---------------- */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('CW Assistant')
    .addItem('1. Set up tracker', 'setupTracker')
    .addSeparator()
    .addItem('Draft contractor follow-ups (overdue)', 'draftContractorFollowUps')
    .addItem('Draft candidate message (selected rows)…', 'draftCandidateMessage')
    .addItem('Create interview event (selected rows)', 'createInterviewEvents')
    .addSeparator()
    .addItem('Send me today\'s summary now', 'sendDailySummary')
    .addItem('Turn on daily summary (weekdays)', 'installDailyTrigger')
    .addItem('Turn off daily summary', 'removeDailyTrigger')
    .addToUi();
}

/* ---------------- Setup ---------------- */

function setupTracker() {
  var ss = SpreadsheetApp.getActive();
  var me = Session.getActiveUser().getEmail() || '';

  var settings = getOrCreate_(ss, TABS.settings);
  if (settings.getLastRow() < 2) {
    settings.getRange(1, 1, 6, 2).setValues([
      ['Setting', 'Value'],
      ['Your email (daily summary)', me],
      ['Sign-off name', 'Amrissa, Club Wealth'],
      ['Contractor overdue after (days)', 7],
      ['Candidate follow-up after (days)', 3],
      ['Interview length (minutes)', 30]
    ]);
    styleHeader_(settings, 2);
    settings.setColumnWidth(1, 260); settings.setColumnWidth(2, 260);
  }

  var c = getOrCreate_(ss, TABS.contractors);
  if (c.getLastRow() < 1) {
    c.getRange(1, 1, 1, CONTRACTOR_HEADERS.length).setValues([CONTRACTOR_HEADERS]);
    styleHeader_(c, CONTRACTOR_HEADERS.length);
    setList_(c, 5, WAITING_ON); setList_(c, 8, C_STATUS);
    setDate_(c, 6); setDate_(c, 7); setDate_(c, 9);
    // Days Waiting: from Requested On (or last follow-up) until today, blank when closed
    c.getRange('J2').setFormula(
      '=ARRAYFORMULA(IF((F2:F="")+(H2:H="Done")+(H2:H="Cancelled"),"",TODAY()-IF(I2:I<>"",I2:I,F2:F)))');
    c.getRange('J2:J').setNumberFormat('0');
    var red = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($J2<>"",$J2>=INDIRECT("Settings!B4"))')
      .setBackground('#fbe3e1').setRanges([c.getRange('A2:K')]).build();
    var past = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($G2<>"",$G2<TODAY(),$H2<>"Done",$H2<>"Cancelled")')
      .setFontColor('#a3322c').setRanges([c.getRange('G2:G')]).build();
    var done = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=OR($H2="Done",$H2="Cancelled")')
      .setFontColor('#8a8f98').setRanges([c.getRange('A2:K')]).build();
    c.setConditionalFormatRules([done, red, past]);
    sizeCols_(c, [170, 150, 200, 220, 130, 110, 110, 150, 110, 100, 260]);
  }

  var k = getOrCreate_(ss, TABS.candidates);
  if (k.getLastRow() < 1) {
    k.getRange(1, 1, 1, CANDIDATE_HEADERS.length).setValues([CANDIDATE_HEADERS]);
    styleHeader_(k, CANDIDATE_HEADERS.length);
    setList_(k, 5, STAGES); setList_(k, 7, FORMATS);
    k.getRange('F2:F').setNumberFormat('mm/dd/yyyy h:mm am/pm');
    setDate_(k, 10);
    var stale = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($J2<>"",TODAY()-$J2>=INDIRECT("Settings!B5"),OR($E2="Applied",$E2="Invite sent",$E2="Interviewed",$E2="Offer"))')
      .setBackground('#fbf1dc').setRanges([k.getRange('A2:L')]).build();
    k.setConditionalFormatRules([stale]);
    sizeCols_(k, [170, 210, 130, 160, 150, 170, 110, 220, 130, 110, 200, 240]);
  }

  var t = getOrCreate_(ss, TABS.templates);
  if (t.getLastRow() < 1) {
    t.getRange(1, 1, 1, 3).setValues([TEMPLATE_HEADERS]);
    t.getRange(2, 1, DEFAULT_TEMPLATES.length, 3).setValues(DEFAULT_TEMPLATES);
    styleHeader_(t, 3);
    t.setColumnWidth(1, 180); t.setColumnWidth(2, 320); t.setColumnWidth(3, 620);
    t.getRange('C2:C').setWrap(true);
    t.getRange(DEFAULT_TEMPLATES.length + 3, 1).setValue(
      'Placeholders: {FirstName} {Candidate} {Position} {InterviewDateTime} {InterviewFormat} {LinkAddress} {Interviewer} {NextStep} {SignOff}');
  }

  var blank = ss.getSheetByName('Sheet1');
  if (blank && blank.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(blank);
  ss.setActiveSheet(c);
  SpreadsheetApp.getUi().alert('Tracker is ready.\n\nNext: check the Settings tab, then use CW Assistant → "Turn on daily summary".');
}

/* ---------------- Contractor follow-ups ---------------- */

function draftContractorFollowUps() {
  var cfg = settings_();
  var rows = contractorRows_().filter(function (r) { return r.open && r.daysWaiting >= cfg.overdueDays; });
  if (!rows.length) { toast_('No overdue contractor items. Nothing to draft.'); return; }

  var groups = {};
  rows.forEach(function (r) {
    var key = (r.email || r.contractor).toLowerCase();
    (groups[key] = groups[key] || { contractor: r.contractor, email: r.email, items: [] }).items.push(r);
  });

  var made = 0, skipped = [];
  var sheet = SpreadsheetApp.getActive().getSheetByName(TABS.contractors);
  Object.keys(groups).forEach(function (k) {
    var g = groups[k];
    if (!g.email) { skipped.push(g.contractor); return; }
    var lines = g.items.map(function (r) {
      return '- ' + r.property + ': ' + r.job + ' (waiting on ' + (r.waitingOn || 'an update').toLowerCase() +
        ', requested ' + fmtDate_(r.requestedOn) + ')';
    }).join('\n');
    var body = 'Hi ' + firstName_(g.contractor) + ',\n\nI am following up on the items below. ' +
      'Could you please send an update or the missing items by ' + fmtDate_(addDays_(new Date(), 2)) + '?\n\n' +
      lines + '\n\nThank you,\n' + cfg.signOff;
    GmailApp.createDraft(g.email, 'Follow-up: ' + g.items.length + ' open item' + (g.items.length > 1 ? 's' : '') +
      ' for Club Wealth', body);
    g.items.forEach(function (r) { sheet.getRange(r.row, 9).setValue(new Date()); });
    made++;
  });

  var msg = made + ' follow-up draft' + (made === 1 ? '' : 's') + ' created in Gmail (Drafts). Review and send from there.';
  if (skipped.length) msg += '\n\nNo email address for: ' + skipped.join(', ') + '. Add it in column C.';
  SpreadsheetApp.getUi().alert(msg);
}

/* ---------------- Candidate messages ---------------- */

function draftCandidateMessage() {
  var ui = SpreadsheetApp.getUi();
  var sheet = SpreadsheetApp.getActiveSheet();
  if (sheet.getName() !== TABS.candidates) { ui.alert('Go to the Candidates tab and select the candidate row(s) first.'); return; }

  var templates = templates_();
  var names = Object.keys(templates);
  var resp = ui.prompt('Which message?', 'Type the number:\n' +
    names.map(function (n, i) { return (i + 1) + '. ' + n; }).join('\n'), ui.ButtonSet.OK_CANCEL);
  if (resp.getSelectedButton() !== ui.Button.OK) return;
  var pick = names[parseInt(resp.getResponseText(), 10) - 1];
  if (!pick) { ui.alert('Please type a number from the list.'); return; }

  var cfg = settings_(), made = 0, skipped = [];
  selectedRows_(sheet).forEach(function (rowNum) {
    var v = sheet.getRange(rowNum, 1, 1, CANDIDATE_HEADERS.length).getValues()[0];
    if (!v[0]) return;
    if (!v[1]) { skipped.push(v[0]); return; }
    var data = {
      FirstName: firstName_(v[0]), Candidate: v[0], Position: v[3] || '[Position]',
      InterviewDateTime: v[5] instanceof Date ? fmtDateTime_(v[5]) : (v[5] || '[Interview date/time]'),
      InterviewFormat: v[6] || '[Format]', LinkAddress: v[7] || '[Link or address]',
      Interviewer: v[8] || '[Interviewer]', NextStep: v[10] || '[Next step]', SignOff: cfg.signOff
    };
    var t = templates[pick];
    GmailApp.createDraft(v[1], fill_(t.subject, data), fill_(t.body, data));
    sheet.getRange(rowNum, 10).setValue(new Date());
    if (pick === 'Interview Invite' && (v[4] === 'Applied' || !v[4])) sheet.getRange(rowNum, 5).setValue('Invite sent');
    made++;
  });

  var msg = made + ' "' + pick + '" draft' + (made === 1 ? '' : 's') + ' created in Gmail (Drafts).';
  if (skipped.length) msg += '\n\nNo email for: ' + skipped.join(', ') + '.';
  msg += '\n\nCheck any [brackets] before sending.';
  ui.alert(msg);
}

/* ---------------- Interview events ---------------- */

function createInterviewEvents() {
  var ui = SpreadsheetApp.getUi();
  var sheet = SpreadsheetApp.getActiveSheet();
  if (sheet.getName() !== TABS.candidates) { ui.alert('Go to the Candidates tab and select the candidate row(s) first.'); return; }
  var cfg = settings_(), cal = CalendarApp.getDefaultCalendar(), made = 0, problems = [];

  selectedRows_(sheet).forEach(function (rowNum) {
    var v = sheet.getRange(rowNum, 1, 1, CANDIDATE_HEADERS.length).getValues()[0];
    if (!v[0]) return;
    if (!(v[5] instanceof Date)) { problems.push(v[0] + ' (no interview date/time)'); return; }
    var end = new Date(v[5].getTime() + cfg.interviewMinutes * 60000);
    var desc = 'Candidate: ' + v[0] + '\nPosition: ' + (v[3] || '') + '\nFormat: ' + (v[6] || '') +
      '\nLink / address: ' + (v[7] || '') + '\nInterviewer: ' + (v[8] || '') + '\nPhone: ' + (v[2] || '');
    // The candidate is not invited automatically: Amrissa sends the invite email from the draft.
    cal.createEvent('Interview: ' + v[0] + ' – ' + (v[3] || 'Club Wealth'), v[5], end,
      { description: desc, location: v[6] === 'In person' ? String(v[7] || '') : '' });
    if (v[4] === 'Applied' || v[4] === 'Invite sent' || !v[4]) sheet.getRange(rowNum, 5).setValue('Interview scheduled');
    made++;
  });

  var msg = made + ' interview event' + (made === 1 ? '' : 's') + ' added to your Google Calendar.';
  if (problems.length) msg += '\n\nSkipped: ' + problems.join(', ');
  ui.alert(msg);
}

/* ---------------- Daily summary ---------------- */

function sendDailySummary() {
  var cfg = settings_();
  if (!cfg.email) { toast_('Add your email in Settings first.'); return; }
  var today = startOfDay_(new Date()), tomorrow = addDays_(today, 1), dayAfter = addDays_(today, 2);

  var open = contractorRows_().filter(function (r) { return r.open; });
  var overdue = open.filter(function (r) { return r.daysWaiting >= cfg.overdueDays; })
    .sort(function (a, b) { return b.daysWaiting - a.daysWaiting; });
  var dueSoon = open.filter(function (r) { return r.dueBy instanceof Date && r.dueBy < dayAfter; });

  var cands = candidateRows_();
  var interviews = cands.filter(function (r) { return r.when instanceof Date && r.when >= today && r.when < dayAfter; })
    .sort(function (a, b) { return a.when - b.when; });
  var nudge = cands.filter(function (r) {
    return ['Applied', 'Invite sent', 'Interviewed', 'Offer'].indexOf(r.stage) > -1 &&
      r.lastContact instanceof Date && (today - startOfDay_(r.lastContact)) / 864e5 >= cfg.candidateDays;
  });

  var html = '<div style="font-family:Arial,sans-serif;font-size:14px;color:#151a24">' +
    '<h2 style="color:#0b1b3d;margin:0 0 4px">Good morning! Here is your day</h2>' +
    '<p style="color:#535a66;margin:0 0 16px">' + fmtDate_(today) + '</p>' +
    section_('Interviews today and tomorrow', interviews.map(function (r) {
      return '<b>' + esc_(fmtDateTime_(r.when)) + '</b>: ' + esc_(r.name) + ' (' + esc_(r.position) + ', ' + esc_(r.format) + ')';
    })) +
    section_('Overdue contractor items (' + cfg.overdueDays + '+ days)', overdue.map(function (r) {
      return '<b>' + r.daysWaiting + ' days</b>: ' + esc_(r.contractor) + ' · ' + esc_(r.property) + ' · ' +
        esc_(r.job) + ' (waiting on ' + esc_(String(r.waitingOn || 'update').toLowerCase()) + ')';
    })) +
    section_('Contractor items due by tomorrow', dueSoon.map(function (r) {
      return esc_(fmtDate_(r.dueBy)) + ': ' + esc_(r.contractor) + ' · ' + esc_(r.job);
    })) +
    section_('Candidates to follow up (' + cfg.candidateDays + '+ days since last contact)', nudge.map(function (r) {
      return esc_(r.name) + ' · ' + esc_(r.position) + ' · ' + esc_(r.stage) + ' · last contact ' + esc_(fmtDate_(r.lastContact));
    })) +
    '<p style="color:#535a66;font-size:12px;margin-top:20px">Tip: in the sheet, use CW Assistant → "Draft contractor follow-ups" ' +
    'or select candidates → "Draft candidate message". Drafts appear in Gmail for you to review and send.</p>' +
    '<p><a href="' + SpreadsheetApp.getActive().getUrl() + '">Open the tracker</a></p></div>';

  var total = interviews.length + overdue.length + dueSoon.length + nudge.length;
  MailApp.sendEmail({ to: cfg.email, subject: 'Daily admin summary: ' + total + ' item' + (total === 1 ? '' : 's') + ' need attention', htmlBody: html });
  toast_('Summary sent to ' + cfg.email);
}

function installDailyTrigger() {
  removeDailyTrigger(true);
  [ScriptApp.WeekDay.MONDAY, ScriptApp.WeekDay.TUESDAY, ScriptApp.WeekDay.WEDNESDAY,
   ScriptApp.WeekDay.THURSDAY, ScriptApp.WeekDay.FRIDAY].forEach(function (d) {
    ScriptApp.newTrigger('sendDailySummary').timeBased().onWeekDay(d).atHour(8).create();
  });
  SpreadsheetApp.getUi().alert('Daily summary is on. You will get it around 8 AM (sheet time zone) every weekday.');
}

function removeDailyTrigger(silent) {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'sendDailySummary') ScriptApp.deleteTrigger(t);
  });
  if (silent !== true) toast_('Daily summary turned off.');
}

/* ---------------- Data helpers ---------------- */

function contractorRows_() {
  var sh = SpreadsheetApp.getActive().getSheetByName(TABS.contractors);
  if (!sh || sh.getLastRow() < 2) return [];
  var today = startOfDay_(new Date());
  return sh.getRange(2, 1, sh.getLastRow() - 1, CONTRACTOR_HEADERS.length).getValues().map(function (v, i) {
    var status = String(v[7] || 'Open');
    var since = v[8] instanceof Date ? v[8] : v[5];
    return {
      row: i + 2, property: v[0], contractor: String(v[1] || ''), email: String(v[2] || '').trim(), job: v[3],
      waitingOn: v[4], requestedOn: v[5], dueBy: v[6], status: status,
      open: !!(v[1] || v[3]) && status !== 'Done' && status !== 'Cancelled',
      daysWaiting: since instanceof Date ? Math.round((today - startOfDay_(since)) / 864e5) : 0
    };
  });
}

function candidateRows_() {
  var sh = SpreadsheetApp.getActive().getSheetByName(TABS.candidates);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, CANDIDATE_HEADERS.length).getValues()
    .filter(function (v) { return v[0]; })
    .map(function (v) {
      return { name: v[0], position: v[3] || '', stage: v[4] || '', when: v[5], format: v[6] || '', lastContact: v[9] };
    });
}

function templates_() {
  var sh = SpreadsheetApp.getActive().getSheetByName(TABS.templates), out = {};
  if (!sh || sh.getLastRow() < 2) return out;
  sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues().forEach(function (v) {
    if (v[0] && v[2]) out[String(v[0])] = { subject: String(v[1] || v[0]), body: String(v[2]) };
  });
  return out;
}

function settings_() {
  var sh = SpreadsheetApp.getActive().getSheetByName(TABS.settings);
  var v = sh ? sh.getRange('B2:B6').getValues() : [[''], [''], [7], [3], [30]];
  return {
    email: String(v[0][0] || '').trim(), signOff: String(v[1][0] || 'Club Wealth'),
    overdueDays: Number(v[2][0]) || 7, candidateDays: Number(v[3][0]) || 3, interviewMinutes: Number(v[4][0]) || 30
  };
}

function selectedRows_(sheet) {
  var rows = {};
  sheet.getActiveRangeList().getRanges().forEach(function (r) {
    for (var i = r.getRow(); i < r.getRow() + r.getNumRows(); i++) if (i > 1) rows[i] = true;
  });
  return Object.keys(rows).map(Number).sort(function (a, b) { return a - b; });
}

/* ---------------- Small utilities ---------------- */

function getOrCreate_(ss, name) { return ss.getSheetByName(name) || ss.insertSheet(name); }
function styleHeader_(sh, n) {
  sh.getRange(1, 1, 1, n).setFontWeight('bold').setBackground('#0b1b3d').setFontColor('#ffffff');
  sh.setFrozenRows(1);
}
function setList_(sh, col, values) {
  sh.getRange(2, col, sh.getMaxRows() - 1, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(values, true).setAllowInvalid(false).build());
}
function setDate_(sh, col) {
  sh.getRange(2, col, sh.getMaxRows() - 1, 1).setNumberFormat('mm/dd/yyyy')
    .setDataValidation(SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(false).build());
}
function sizeCols_(sh, widths) { widths.forEach(function (w, i) { sh.setColumnWidth(i + 1, w); }); }
function fill_(text, data) { return String(text).replace(/\{(\w+)\}/g, function (m, k) { return k in data ? data[k] : m; }); }
function firstName_(name) { return String(name || '').trim().split(/\s+/)[0] || 'there'; }
function startOfDay_(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function addDays_(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
function tz_() { return SpreadsheetApp.getActive().getSpreadsheetTimeZone(); }
function fmtDate_(d) { return d instanceof Date ? Utilities.formatDate(d, tz_(), 'EEE, MMM d') : String(d || ''); }
function fmtDateTime_(d) { return d instanceof Date ? Utilities.formatDate(d, tz_(), 'EEE, MMM d · h:mm a z') : String(d || ''); }
function esc_(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function section_(title, items) {
  return '<h3 style="color:#a9843f;font-size:13px;letter-spacing:.06em;text-transform:uppercase;margin:18px 0 6px">' + esc_(title) + '</h3>' +
    (items.length ? '<ul style="margin:0;padding-left:18px">' + items.map(function (i) { return '<li style="margin:3px 0">' + i + '</li>'; }).join('') + '</ul>'
      : '<p style="margin:0;color:#2f6a3c">Nothing here. 👍</p>');
}
function toast_(msg) { SpreadsheetApp.getActive().toast(msg, 'CW Assistant', 6); }
