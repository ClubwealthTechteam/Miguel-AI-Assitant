# Club Wealth Workflow Process Form

A self-hosted intake form where admins across Clubwealth, Homexa and PFL document one of their manual or repetitive processes. Submissions are saved to Google Sheets, ready for AI Task Hub planning.

- **Frontend:** static HTML/CSS/JS in `public/`. No build step. Answers auto-save in the browser while people type.
- **Backend:** one Vercel serverless function (`api/submit.js`). It validates the submission and relays it to Google Apps Script. The Sheets URL and secret stay server-side.
- **Storage:** Google Sheets through `google-apps-script/Code.gs`.

## Form sections

The form is kept short for non-technical staff: three questions and the acknowledgement.

| # | Section | Captured as |
|---|---|---|
| — | Name, CW/HX/PFL email, date | Required fields |
| 01 | Process summary | Free text, required (sent as `q2.overview`) |
| 02 | Manual process | Flow map per task on a draggable canvas: **Tool → What you do** steps that can split into YES / NO paths (sent as `q2.tasks`), plus an optional "What slows you down the most?" (sent as `q6.overview`). A mapping guide image (`public/sop/map-guide.png`) sits above the map |
| 03 | Ideal automation (optional) | Free text plus a flow map of the ideal process (sent as `q7`) |
| — | Room 10 Zoom acknowledgement | Must type `ACKNOWLEDGED` |

The payload keeps the original field names, so `api/submit.js` and the deployed Apps Script need no changes. The tools lists and the Q3–Q5 tables are no longer asked; their Sheet columns stay empty.

## SOP

`/sop/map-guide.png` is the one-page mapping guide linked from question 2. `/sop` (`public/sop.html`) is the older step-by-step guide written for the 8-question version of the form; it is no longer linked from the form: before you start, each section, how to use the process map, do's and don'ts, troubleshooting, and a full worked example ("New client welcome posts") with its map images in `public/sop/`. It prints cleanly to PDF. The form links to it from the "How to fill out this form" box under the Important note.

## Google Sheet layout

| Tab | One row per |
|---|---|
| `Submissions` | Submission: identity, tools, every overview answer, a one-line process map (`Task: Recruit CRM (Check application) > Gmail (Send invite)`), platform choice, raw JSON |
| `Process Steps` | Main-path step from Q2 (Current) and Q7 (Ideal); a YES/NO split is written into the Outcomes column of the step it follows, e.g. `Qualified? YES -> Gmail (Send invite) > Calendar` |
| `Q3 Information Needed`, `Q4 Manual Steps`, `Q5 Judgment & Approvals`, `Q6 Bottlenecks` | Table row |

**Map images:** on submit, the form draws every Q2 and Q7 map as a PNG (`public/map-image.js`). The Apps Script saves each one to the Drive folder **"AI Task Hub – Process Maps"** and puts the file links in the `Q2 Map Images` and `Q7 Map Images` columns at the end of `Submissions`. Files are named `<Submission ID> – <Name> – Task N – <Title> – Current|Ideal.png`. The folder is private to the script owner; share it with anyone who needs to open the images.

Every row carries the **Submission ID** (e.g. `CW-20261006-A1B2C3`), so the tabs join back to the submission.

## Setup

### 1. Google Sheet + Apps Script
1. Create a Google Sheet, e.g. "AI Task Hub — Workflow Intake".
2. Open **Extensions → Apps Script**, delete the sample code, and paste in `google-apps-script/Code.gs`.
3. Open **Project Settings (gear) → Script properties → Add property**. Name: `SHARED_SECRET`. Value: a long random string. You can generate one with `openssl rand -hex 32`.
4. In the editor, pick `setup` from the function dropdown and click **Run**. Approve the permissions; this creates the tabs and headers.
5. Click **Deploy → New deployment → Web app**. Set Execute as **Me** and Who has access **Anyone**. Then **Deploy** and copy the URL that ends in `/exec`.

> After editing `Code.gs` later, run `setup` once (it asks for any new permissions, such as Drive for map images), then use **Deploy → Manage deployments → Edit → Version: New version**. That keeps the same URL.

### 2. Vercel
1. Import this GitHub repo in Vercel (**Add New → Project**). Framework preset: **Other**. Leave the build settings empty, because `vercel.json` serves `public/`.
2. Under **Settings → Environment Variables**, add:
   - `SHEETS_WEBHOOK_URL`: the `/exec` URL
   - `SHEETS_WEBHOOK_SECRET`: the same value as `SHARED_SECRET`
3. Deploy, then share the production URL with admins.

### 3. Logo
The header draws the Club Wealth logo as an inline SVG. To use the original file instead, save it as `public/logo.png` and swap the `<svg>` inside `.logo` in `public/index.html` for the `<img>` shown in the comment there.

## Local development

```bash
npm run dev          # http://localhost:3000
```

If no `.env` is present, the dev server runs the real `Code.gs` against an in-memory fake spreadsheet and writes the result to `.dev-submissions/sheet.json`. That lets you check the sheet layout without touching Google. To test against the real sheet, copy `.env.example` to `.env` and fill it in.

`npm run check` syntax-checks the JavaScript.

## Safeguards
- Required fields are checked both in the browser and on the server.
- A hidden honeypot field silently drops bot submissions.
- Text is length-capped and the payload is limited to 200 KB.
- Apps Script rejects any request without the shared secret.
- Cells that start with `= + - @` are escaped, so text can't run as a spreadsheet formula.
