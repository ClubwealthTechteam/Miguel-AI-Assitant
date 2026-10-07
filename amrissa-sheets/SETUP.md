# Amrissa's Admin Tracker: setup (about 5 minutes)

A Google Sheet that tracks contractors and candidates, flags what's overdue, drafts follow-up emails in Gmail, adds interviews to Google Calendar, and emails a summary every weekday morning.

Nothing is sent to contractors or candidates automatically. Every message lands in **Gmail → Drafts** for Amrissa to review and send.

## 1. Create the sheet
1. Signed in as Amrissa's Google account, go to **sheets.new**.
2. Name it **Amrissa – Admin Tracker**.
3. Open **Extensions → Apps Script**.
4. Delete the sample code, paste all of `Code.gs`, and click **Save**.
5. Close the Apps Script tab and **reload the sheet**. A **CW Assistant** menu appears.

## 2. Run setup
1. Click **CW Assistant → 1. Set up tracker**.
2. Google asks for permission the first time. Click **Continue**, choose the account, then **Advanced → Go to project → Allow**.

   The permissions cover: the sheet itself, Gmail (create drafts only), Calendar (add interview events) and sending the summary email to Amrissa.
3. Four tabs are created: **Contractors, Candidates, Templates, Settings**.

## 3. Check Settings
| Setting | Default |
|---|---|
| Your email (daily summary) | the signed-in account |
| Sign-off name | Amrissa, Club Wealth |
| Contractor overdue after (days) | 7 |
| Candidate follow-up after (days) | 3 |
| Interview length (minutes) | 30 |

## 4. Turn on the daily summary
**CW Assistant → Turn on daily summary (weekdays)**. It arrives around 8 AM in the sheet's time zone (File → Settings → Time zone).

It lists:
- Interviews today and tomorrow
- Overdue contractor items
- Contractor items due by tomorrow
- Candidates who need a follow-up

## Daily use

**Contractors tab**
- Add one row per open item: property, contractor, email, job, what you're waiting on, and the date requested.
- **Days Waiting** fills in automatically. Overdue rows turn red. Set Status to **Done** to close an item.
- **CW Assistant → Draft contractor follow-ups**: one Gmail draft per contractor, listing all their overdue items. The Last Follow-Up date updates, so the counter restarts.

**Candidates tab**
- Add each candidate with position, stage, and interview date/time, format and link.
- Select one or more rows, then **CW Assistant → Draft candidate message**. Pick a template: invite, follow-up, nudge, rejection, bench or onboarding. Drafts are created in Gmail and Last Contact updates.
- Select rows, then **Create interview event** to add the interview to Amrissa's calendar.
- Rows turn yellow when a candidate hasn't been contacted in 3+ days.

**Templates tab**
Edit the wording any time. Placeholders: `{FirstName} {Candidate} {Position} {InterviewDateTime} {InterviewFormat} {LinkAddress} {Interviewer} {NextStep} {SignOff}`.

## Notes
- Moving her current data in: paste her existing contractor and candidate lists into the matching columns. Dates must be real dates, not text.
- To stop the morning email: **CW Assistant → Turn off daily summary**.
- AI features (summaries, quote comparison, email-to-tasks) come with the AI Task Hub workspace. This sheet covers the tracking and follow-up automation.
