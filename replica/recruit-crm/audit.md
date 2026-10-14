# Recruit CRM: subscription audit (draft)

Status: **draft, from public sources and this repo only.** Cost, seats and the
features we use are still unknown; see Open questions. Written 14 October 2026.

## 1. Verdict so far

Recruit CRM is built for recruitment *agencies* (clients, deals, placements,
multiposting). We use it for internal HR hiring, which is likely a small slice:
applications in, move people through stages, invite them to interviews. If
that's all, the used part looks small enough to rebuild, and the data exports
cleanly. Two things could still sink it: how much the team relies on resume
parsing and job-board posting, and where candidate personal data would be kept
(see Risks). Not a decision yet; `replacement-plan` makes it once the open
questions are answered.

## 2. Cost

| | |
|---|---|
| Plan | unknown |
| Seats | unknown |
| List price, annual billing | Pro $95, Business $135, Enterprise $215 per user per month (third-party, Sept 2026; confirm at recruitcrm.io/pricing) |
| List price, monthly billing | $109 / $159 / $259 per user per month (same source) |
| Add-ons billed separately | multiposting credits, workflow automation, analytics, LinkedIn messaging (same source) |
| Our yearly spend | unknown: from invoices |
| Renewal date | unknown |
| Notice period | none stated: cancel any time from Account Settings (Terms 10.3) |

Example only: 3 Pro seats on annual billing ≈ $3,420 a year at list price.

Terms that affect timing: subscriptions **auto-renew for the same length**
(9.3), there are **no refunds** for unused time (9.5), and cancelling early
means **paying out the rest of the term** (10.4). So the cutover should land
just before the renewal date, not mid-term.

## 3. Who uses it

Unknown. Probably HR / recruiting for Club Wealth, Homexa and PFL. Need names,
how many log in, how often, and the owner who'd sign off on switching.

## 4. Features we use

Draft list in `features.csv`, every row `unknown` until someone confirms it.
What this repo already shows about how it's used:

- Applications arrive by **Jotform email**, and someone copies the
  applicant's phone number into Recruit CRM by hand and moves them to
  **Screening** (`public/sop.html` worked example).
- A process step mapped in the intake form: **Recruit CRM (Check application)
  → Gmail (Send invite)**.

Both are manual hand-offs. Even if we keep Recruit CRM, these are worth
automating.

## 5. Data and export

Recruit CRM exports everything we'd need ([Exporting All Data](https://help.recruitcrm.io/en/articles/3591116-exporting-all-data-for-recruit-crm-account-owners)):

- **Account owner only**, paid plans only, and blocked when invoices are unpaid.
- **Data Export**: CSVs for candidates, contacts, jobs, companies, deals, plus
  notes, meetings, tasks and hotlists. Once a day.
- **Full Export**: the same plus attached files (resumes). **Once every 90
  days**, so don't spend it on a dry run: use the daily CSV export plus
  [bulk candidate file export](https://help.recruitcrm.io/en/articles/10779019-bulk-export-files-for-candidates-in-recruit-crm-new-ui)
  (1,000 candidates at a time) for testing, and save the Full Export for
  switch-over day.
- Download links expire after 3 days.
- After cancelling, data is kept **14 days**, then may be deleted (Terms 10.4).

Unknown: how many candidates and files we hold.

Sensitive: resumes, contact details, interview notes, possibly pay
expectations. This is personal data about people who aren't employees.

## 6. Connections

Known: Jotform (applications, by email, copied by hand), Gmail (invites).
To check: Google Calendar or Outlook sync, job boards, LinkedIn, Zapier,
Slack, the careers page on our websites, and anything downstream for new hires.

## 7. Terms and risks

- **Copying clause.** Terms 2.2 says customers may not "attempt to decipher,
  decompile, reverse engineer, disassemble, reproduce, or copy" the service.
  There's no clause against building a competing or similar product. Building
  our own simple hiring tracker from our own requirements, without copying
  their code, screens or text, shouldn't be "reproducing" the service, but
  "reproduce" isn't defined. **Owner should confirm** before the build, ideally
  with whoever handles contracts. ([Terms](https://recruitcrm.io/legal/terms), effective 11 Jan 2018.)
- **Candidate data on our side.** The default stack keeps records in Google
  Sheets. That's a weak home for resumes and interview notes: anyone with the
  sheet sees everything, there's no per-role access, and no automatic deletion
  of old applicants. If we rebuild, records need tighter access than a shared
  sheet, and a rule for how long we keep rejected applicants' data.
- **Things that are expensive to rebuild well**: resume parsing, job-board
  multiposting, two-way calendar sync, email tracking. If the team relies on
  them, Downgrade may beat Rebuild.

## 8. Open questions

| Question | Who can answer |
|---|---|
| Plan, seats, yearly spend, renewal date | Whoever pays the invoice / account owner |
| Who logs in, how often | HR lead |
| Which `features.csv` rows are must-keep | HR lead and the people who use it daily |
| Roughly how many candidates and files we hold | Account owner (count shows on the Candidates list) |
| Connected tools (calendar, job boards, Zapier, careers page) | Account owner (Settings → Integrations) |
| OK to build our own given Terms 2.2 | Owner / contracts |
| Where candidate data is allowed to live, and for how long | Owner / HR lead |
