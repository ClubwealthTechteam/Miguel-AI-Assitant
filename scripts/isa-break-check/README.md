# ISA break check (ProspectBoss vs Time Doctor)

Read-only. `pb_fetch.py` only calls `POST /api/login` and `GET /api/getAllReports` — never logout,
refreshToken, remove or disconnectUsers (the ISAs use these pond logins live).

- `pond_creds.json` (local only, git-ignored): `{"bpond01": "<password>", ...}` from the
  "LIST MAKING CHECKLIST" sheet, tab "Remove From PB". Never commit it.
- `python3 pb_fetch.py 2026-11-03` → `pb_2026-11-03.json` (contains lead data — keep local).
- Time Doctor data comes from the Time Doctor connector (worklog + time summary, America/New_York);
  `td_2026-11-03.py` holds the Nov 3 pull.
- Daily routine: see RUNBOOK.md (`isa_daily.py DAY` + `sheet_ranges.py DAY`). `build_report.py` built the first Nov 3 workbook.

Timezone: ProspectBoss shows each pond in its own tz setting and runs 1 h behind ET
('-5:00' ponds → ET = shown + 1 h; '-7:00' ponds → + 3 h). Verified against Time Doctor breaks.
