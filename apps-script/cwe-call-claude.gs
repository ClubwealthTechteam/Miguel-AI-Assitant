// Club Wealth Explained sheet: when Joshua ticks "Call Claude?" (CWE Report!V2),
// start the CWE Call Attendance Summary routine right away instead of waiting
// for its hourly check. The routine itself reads the sheet and posts to #cw-team.
//
// Setup (once): paste this file into Extensions > Apps Script on the sheet, or into a new
// project at script.google.com (works the same, it finds the sheet by SHEET_ID), then
//   Project Settings > Script Properties > add ROUTINE_TOKEN = <the routine's API token>
//   and run setup() once (it asks for permission to run on edit and call the API).
// The account that runs setup() needs edit access to the sheet.

const ROUTINE_ID = 'trig_01SUmf3Uv5foFEXRvr73Czqk';
const SHEET_ID = '1YbMCRPFMysBzPO9M-0wdZ0Gz-VYLFsjFNK7Q7fSpdCs'; // Club Wealth Explained
const COOLDOWN_MS = 2 * 60 * 1000; // ignore a quick untick + retick

function onCallClaudeTick(e) {
  if (!e || !e.range) return;
  const range = e.range;
  if (range.getSheet().getName() !== 'CWE Report') return;
  // Only V2 (row 2, column 22), even if the edit covered more cells.
  if (range.getRow() > 2 || range.getLastRow() < 2 || range.getColumn() > 22 || range.getLastColumn() < 22) return;
  if (range.getSheet().getRange('V2').getValue() !== true) return;

  const props = PropertiesService.getScriptProperties();
  const last = Number(props.getProperty('LAST_FIRE') || 0);
  if (Date.now() - last < COOLDOWN_MS) return;
  props.setProperty('LAST_FIRE', String(Date.now()));

  const at = Utilities.formatDate(new Date(), 'America/Los_Angeles', 'MMM d, yyyy h:mm a');
  const res = UrlFetchApp.fetch(`https://api.anthropic.com/v1/claude_code/routines/${ROUTINE_ID}/fire`, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${props.getProperty('ROUTINE_TOKEN')}`,
      'anthropic-beta': 'experimental-cc-routine-2026-04-01',
      'anthropic-version': '2023-06-01',
    },
    payload: JSON.stringify({ text: `V2 ticked in CWE Report at ${at} PT. Run now.` }),
    muteHttpExceptions: true,
  });
  // The hourly check still catches it if this call fails.
  if (res.getResponseCode() >= 300) console.error(`routine fire failed: ${res.getResponseCode()} ${res.getContentText().slice(0, 200)}`);
}

function setup() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'onCallClaudeTick')
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('onCallClaudeTick').forSpreadsheet(ss).onEdit().create();
}
