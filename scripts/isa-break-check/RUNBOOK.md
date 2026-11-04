# Daily ISA break check — runbook (for the scheduled session)

Goal: every morning by 5:00 AM PT, report the PREVIOUS shift day (Pacific) into the ISA Masterfile
(`config.json` → `masterfile_id`) tabs **ISA Break Check** (overwritten) and **ISA Break Check Log** (appended).

## Hard rules
- ProspectBoss is READ-ONLY. Only `pb_fetch.py` (login + getAllReports). Never call logout, refreshToken,
  remove, disconnectUsers; never edit or delete anything; no browser. ISAs use these logins live.
- Never print, log, commit or share pond passwords or tokens. Delete `pond_creds.json` when done.
- Time Doctor is read-only. No emails or phone numbers in any output.
- Do NOT post to Slack or anywhere else. Only write the two Masterfile tabs.
- Do not commit anything from `data/`.

## Steps (DAY = yesterday in America/Los_Angeles, YYYY-MM-DD)
1. Skip if DAY is Saturday or Sunday, or if the tracker's 'Daily Assignment Archive' has no block for DAY
   or Time Doctor has no ISA time for DAY → end with a one-line note.
2. **Assignments**: Google Sheets `get_values` on `tracker_id`, `'Daily Assignment Archive'!A1:E400`.
   Find the row whose column A == DAY; the 25 rows under its header are pond (col D) → ISA first name (col B).
   Write `data/DAY/mapping.json` as `{"bpond01": "Jeff", ...}` ("" for blank).
3. **Pond logins**: `get_values` on `creds_sheet_id`, `'Remove From PB'!A6:B30`. Write `pond_creds.json`
   `{"bpond01": "<pw>", ...}` in this folder (git-ignored). Do not echo it.
4. `python3 pb_fetch.py DAY` → `data/DAY/pb.json`. Then delete `pond_creds.json`.
5. **Time Doctor** (company `ZEmW6RI99WzV9fET`, call `td_whoami` first). Use the ISA user ids from
   `td_list_users` for the names in 'Active ISAs' (ISA Masterfile) with Active = TRUE.
   - `td_get_worklog` from=DAY to=DAY, timezone `America/Los_Angeles`, detail `full`, limit 500,
     fields `["userName","start","end","taskName","mode"]` (page the cursor until truncated=false).
     Save rows to `data/DAY/td_worklog.json` (start/end are UTC ISO).
   - `td_get_time_summary` same day/timezone, groupBy `user`, fields
     `["trackedSec","totalSec","idleMins","idleSec"]`. Save rows as
     `[{"userName","trackedSec","totalSec","idleMins","manualSec"}]` to `data/DAY/td_summary.json`.
6. `python3 isa_daily.py DAY` → prints a summary; check the "Timezone check" line: each pond-tz group
   should have only a small share of calls inside TD breaks (Nov 3: 66 of 14,049). If not, stop and report.
7. `python3 sheet_ranges.py DAY` → JSON. On the Masterfile: `batch_clear_values(clear)`, then
   `update_values` for every item in `updates`, then `append_values(append)`.
   Before appending, read `'ISA Break Check Log'!A:A`; if DAY is already there, skip the append.
8. Read back `'ISA Break Check'!A1:S8` to confirm. End with a 3–5 line summary (no names of leads,
   no phone numbers): date, rows written, the timezone check line, count of flagged ISAs.
