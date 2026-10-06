/**
 * Club Wealth Workflow Process Form -> Google Sheets receiver.
 *
 * Setup (see README.md for the full walkthrough):
 *   1. Open the target Google Sheet > Extensions > Apps Script, paste this file.
 *   2. Project Settings > Script properties > add SHARED_SECRET (same value as
 *      the Vercel env var SHEETS_WEBHOOK_SECRET).
 *   3. Run `setup` once from the editor to create the tabs and headers.
 *   4. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
 *      Copy the /exec URL into the Vercel env var SHEETS_WEBHOOK_URL.
 */

var TABS = {
  submissions: {
    name: 'Submissions',
    headers: ['Submitted At', 'Submission ID', 'Name', 'Email', 'Date',
      'Web Tools', 'Apps', 'Spreadsheets',
      'Q2 Process (Manual Way)', 'Q2 Process Map',
      'Q3 Information Needed', 'Q4 Manual / Repetitive Steps', 'Q5 Judgment / Approval',
      'Q6 Bottlenecks & Workarounds', 'Q7 Ideal Automated Version', 'Q7 Ideal Process Map',
      'Preferred Platform', 'Platform Reason', 'Acknowledged', 'Raw JSON']
  },
  steps: {
    name: 'Process Steps',
    headers: ['Submission ID', 'Name', 'Flow', 'Task #', 'Task Title', 'Step #', 'Tool Used', 'Task Description', 'Outcomes / Branches']
  },
  q3: {
    name: 'Q3 Information Needed',
    headers: ['Submission ID', 'Name', 'Task Title', 'Information / Data Needed', 'Information Source', 'Required / Optional'],
    keys: ['task', 'info', 'source', 'required']
  },
  q4: {
    name: 'Q4 Manual Steps',
    headers: ['Submission ID', 'Name', 'Task Title', 'Repetitive Step', 'How Often', 'Approx. Time Spent'],
    keys: ['task', 'step', 'frequency', 'time']
  },
  q5: {
    name: 'Q5 Judgment & Approvals',
    headers: ['Submission ID', 'Name', 'Task Title', 'Decision or Approval', 'Info Used for the Decision', 'Can AI Prepare It?'],
    keys: ['task', 'decision', 'info', 'aiPrepare']
  },
  q6: {
    name: 'Q6 Bottlenecks',
    headers: ['Submission ID', 'Name', 'Task Title', 'Bottleneck or Delay', 'Current Workaround', 'Impact'],
    keys: ['task', 'bottleneck', 'workaround', 'impact']
  }
};

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var expected = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
    if (!expected || body.secret !== expected) return json_({ ok: false, error: 'unauthorized' });

    lock.waitLock(20000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureTabs_(ss);
    writeSubmission_(ss, body);
    return json_({ ok: true, submissionId: body.submissionId });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: String(err && err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

function doGet() {
  return json_({ ok: true, service: 'cw-workflow-intake' });
}

/** Run once from the editor to create tabs + headers. */
function setup() {
  ensureTabs_(SpreadsheetApp.getActiveSpreadsheet());
}

function writeSubmission_(ss, body) {
  var d = body.data || {};
  var id = body.submissionId;
  var name = d.name || '';
  var at = body.submittedAt ? new Date(body.submittedAt) : new Date();

  append_(ss, TABS.submissions.name, [[
    at, id, name, d.email, d.date,
    (d.tools && d.tools.web || []).join(', '),
    (d.tools && d.tools.apps || []).join(', '),
    (d.tools && d.tools.spreadsheets || []).join(', '),
    d.q2 && d.q2.overview, flowText_(d.q2 && d.q2.tasks),
    d.q3 && d.q3.overview, d.q4 && d.q4.overview, d.q5 && d.q5.overview,
    d.q6 && d.q6.overview, d.q7 && d.q7.overview, flowText_(d.q7 && d.q7.tasks),
    d.platform && d.platform.choice, d.platform && d.platform.reason,
    d.acknowledged, JSON.stringify(d).slice(0, 49000)
  ]]);

  var stepRows = []
    .concat(flowRows_(id, name, 'Current (Manual)', d.q2 && d.q2.tasks))
    .concat(flowRows_(id, name, 'Ideal (Automated)', d.q7 && d.q7.tasks));
  append_(ss, TABS.steps.name, stepRows);

  ['q3', 'q4', 'q5', 'q6'].forEach(function (k) {
    var rows = (d[k] && d[k].rows || []).map(function (r) {
      return [id, name].concat(TABS[k].keys.map(function (key) { return r[key]; }));
    });
    append_(ss, TABS[k].name, rows);
  });
}

/** "Task: Recruit CRM (Check application) > Gmail (Send invite)" — one line per task. */
function flowText_(tasks) {
  return (tasks || []).map(function (t, i) {
    var steps = (t.steps || []).map(function (s) {
      var label = s.tool || 'Step';
      if (s.description) label += ' (' + s.description + ')';
      if (s.outcomes && s.outcomes.length) {
        label += ' [' + s.outcomes.map(function (o) { return o.label + ' -> ' + o.result; }).join('; ') + ']';
      }
      return label;
    });
    return (t.title || ('Task ' + (i + 1))) + ': ' + steps.join(' > ');
  }).join('\n');
}

function flowRows_(id, name, flow, tasks) {
  var rows = [];
  (tasks || []).forEach(function (t, ti) {
    (t.steps || []).forEach(function (s, si) {
      rows.push([id, name, flow, ti + 1, t.title, si + 1, s.tool, s.description,
        (s.outcomes || []).map(function (o) { return o.label + ' -> ' + o.result; }).join('\n')]);
    });
  });
  return rows;
}

function ensureTabs_(ss) {
  Object.keys(TABS).forEach(function (k) {
    var tab = TABS[k];
    var sh = ss.getSheetByName(tab.name) || ss.insertSheet(tab.name);
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, tab.headers.length).setValues([tab.headers])
        .setFontWeight('bold').setBackground('#0b1b3d').setFontColor('#ffffff');
      sh.setFrozenRows(1);
    }
  });
}

function append_(ss, tabName, rows) {
  if (!rows || !rows.length) return;
  var sh = ss.getSheetByName(tabName);
  var safe = rows.map(function (r) { return r.map(safeCell_); });
  sh.getRange(sh.getLastRow() + 1, 1, safe.length, safe[0].length).setValues(safe);
}

// Stop user text from being evaluated as a spreadsheet formula.
function safeCell_(v) {
  if (v === null || v === undefined) return '';
  if (v instanceof Date || typeof v === 'number') return v;
  var s = String(v);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
