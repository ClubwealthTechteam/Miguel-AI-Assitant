# Daily ISA break check — runbook (for the scheduled session)

Goal: every weekday morning (Mon–Fri) by 5:00 AM PT, report the PREVIOUS weekday's shift (Pacific; Monday reports Friday) into the ISA Masterfile
(`config.json` → `masterfile_id`). The dashboard tabs **ISA Break Check** and **ISA Break Details** are
formulas with a date filter — never write to them. The run only APPENDS rows to **ISA Break Check Log** and
**ISA Break Details Log** (hidden). Never change formatting, formulas or any other tab.

## Hard rules
- ProspectBoss is READ-ONLY. Only `pb_fetch.py` (login + getAllReports). Never call logout, refreshToken,
  remove, disconnectUsers; never edit or delete anything; no browser. ISAs use these logins live.
- Never print, log, commit or share pond passwords or tokens. Delete `pond_creds.json` when done.
- Time Doctor is read-only. No emails or phone numbers in any output.
- Do NOT post to Slack or anywhere else. Only write the two Masterfile tabs.
- Do not commit anything from `data/`.

## Steps (DAY = previous weekday in America/Los_Angeles, YYYY-MM-DD: Mon → last Fri, Tue–Fri → yesterday)
1. Skip if the tracker's 'Daily Assignment Archive' has no block for DAY
   or Time Doctor has no ISA time for DAY → end with a one-line note.
2. **Assignments**: Google Sheets `get_values` on `tracker_id`, `'Daily Assignment Archive'!A1:E400`.
   Find the row whose column A == DAY; the 25 rows under its header are pond (col D) → ISA first name (col B).
   Write `data/DAY/mapping.json` as `{"bpond01": "Jeff", ...}` ("" for blank).
3. **Pond logins**: `get_values` on `creds_sheet_id`, `'Remove From PB'!A6:B30`. Write `pond_creds.json`
   `{"bpond01": "<pw>", ...}` in this folder (git-ignored). Do not echo it.
4. `python3 pb_fetch.py DAY` → `data/DAY/pb.json`. Then delete `pond_creds.json`.
   Shift schedule: the script uses the official one in `config.json` when the team's Time Doctor day matches
   it, otherwise it reads that day's schedule from Time Doctor (shift moved between 5:30 and 7:30 AM PT in
   Sep–Oct 2026; Fridays are short).
5. **Time Doctor** (company `ZEmW6RI99WzV9fET`, call `td_whoami` first). Use the ISA user ids from
   `td_list_users` for the names in 'Active ISAs' (ISA Masterfile) with Active = TRUE.
   - Simplest: `tag: ["ZEw2v-rm687rx3KV"]` (group "ISA"); the script keeps only the roster in config.json.
   - `td_get_worklog` from=DAY to=DAY, timezone `America/Los_Angeles`, detail `full`, limit 500,
     fields `["userName","start","end","taskName","mode"]` (page the cursor until truncated=false).
     Save rows to `data/DAY/td_worklog.json` (start/end are UTC ISO).
   - (optional) `td_get_time_summary` same day/timezone, groupBy `user`, fields
     `["trackedSec","totalSec","idleMins","idleSec"]`. Save rows as
     `[{"userName","trackedSec","totalSec","idleMins","manualSec"}]` to `data/DAY/td_summary.json`.
6. `python3 isa_daily.py DAY` → prints a summary. The "Timezone check" line must start with OK (about 99–100%
   of calls inside Time Doctor work time). If it says WARNING, do not write anything; report it instead.
7. `python3 sheet_ranges.py DAY` → JSON. First `get_values` `'ISA Break Check Log'!A:A`; if DAY is already
   there, stop (already reported). Otherwise `append_values` each item in `append` (log first, then details).
8. Read back `'ISA Break Check'!A1:K12` to confirm the dashboard shows DAY (it defaults to the latest day). End with a 3–5 line summary (no names of leads,
   no phone numbers): date, rows written, the timezone check line, count of flagged ISAs.

---

# End-of-shift ISA Slack report (calls + half-day sign-ups)

Goal: Monday–Friday after the shift ends (3:00 PM PT), post today's ISA report to Slack #cw-isa (`C0AJSBDT9AA`).
Test channel: #cw-assistant (`C0C93SGG2FN`). The Slack bot token is injected by the proxy (no key needed).

DAY = today in America/Los_Angeles.
1. Assignments → `data/DAY/mapping.json` (same as step 2 above).
2. Pond logins → `pond_creds.json`, then `python3 pb_fetch.py DAY` → `data/DAY/pb.json`; delete `pond_creds.json`.
3. Roster: `get_values` ISA Masterfile `'Active ISAs'!A1:I60`; rows with Active = TRUE →
   `data/DAY/roster.json` as `[{"name": <Time Doctor column>, "promo": <PromoCode>}]`.
4. Sign-ups: `get_values` ISA Masterfile `'EB Cache'!D1:E25000` (Sign-up date, Promo code). The result is large and is
   saved to a file; keep only rows whose date == DAY → `data/DAY/signups.json` as `[["DAY", "<promo>"], ...]`.
5. `python3 isa_slack_report.py DAY` (check it), then `python3 isa_slack_report.py DAY --post C0AJSBDT9AA`.
   Post once per day only: if `conversations.history` for the channel already has today's report from the bot, skip.
Rules: read-only everywhere except that one Slack message. Do NOT add Time Doctor hours to the public post. Never post pond passwords, emails or phone numbers.
