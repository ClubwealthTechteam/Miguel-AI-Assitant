# Half Day Event: Attendance Extraction (Task 9)

Saved exactly as Miguel wrote it. The automation sends this prompt with every Half Day registration PDF.

## What to capture

| Column | What to capture |
|---|---|
| Extracted Name | Printed name on a signed row, or handwritten attendee name |
| Extracted Phone | Phone written on that same row; blank if missing or unreadable |
| Source Page | PDF page number |
| Source Type | Printed row + signature or Handwritten entry + signature |
| Notes | Unclear spelling, phone digits, duplicate entries, or anything requiring review |

## Claude prompt

```
Inspect the attached attendance PDF visually, page by page. This is an attendance-evidence task, not a transcription of everyone on the registration list.
Include only rows with clear attendance evidence:

A signature aligned with a printed attendee’s row.
A handwritten attendee entry aligned with its signature or other clear sign-in evidence.
Use the printed name from the signed row. For handwritten entries, transcribe only what is readable. Do not use a signature’s apparent spelling to replace a printed name.
Return a tab-separated list ready to paste into Google Sheets with these exact columns:
Extracted Name	Extracted Phone	Source Page	Source Type	Notes
For each included row:

Extracted Name: printed attendee name or readable handwritten name.
Extracted Phone: phone written on that same row, normalized to digits only. Leave blank if missing or uncertain.
Source Page: PDF page number, starting at 1.
Source Type: “Printed row + signature” or “Handwritten entry + signature.” Describe any other evidence accurately.
Notes: unclear spelling, corrected or unreadable phone numbers, duplicate names, shared phone numbers, or uncertain row alignment.
Do not count unsigned printed names, stray marks, or referral-source checkbox selections alone as attendance. Flag ambiguous attendance evidence separately for review rather than including it as confirmed.
If attendance is clear but identity is unreadable, include a uniquely labeled “Unclear handwritten name” entry and flag it for review. Do not invent names or phone digits.
Identify the event name and date from the printed page labels separately. Flag any conflict with the filename or between pages.
Inspect all pages. Text extraction or OCR may assist with printed text, but visually verify signatures, handwriting, and row alignment against the page images.
Report the number of evidence rows extracted and list review items separately. Distinguish evidence-row count from verified unique-attendee count; do not silently merge possible duplicates.
Do not infer email addresses, Contact IDs, opt-ins, or non-attendance. Those require registration or CRM matching afterward.
Give the processing start and end times in the chat, outside the paste-ready list.
```

## Decisions so far

- Trigger: Tara posts the Half Day form in Slack `#half-day-registration-forms` (C0C7UFD3DUJ).
- Output: a new tab per event in the spreadsheet Ali uses.
- Ali's "done" signal: a **checkbox** in the sheet.
- Summary source: a separate sheet in the Marketing Google Spreadsheet, at a fixed range that Ali fills in.
  Fields: Location, Date, Stat Sheet status, Attended Tagged (count | %), CWSocial25 (count | %), Opt-Ins (count | %).
- Summary is posted as a reply in Tara's original Slack thread.
