---
name: cutover
description: >-
  Moves the team off a paid outside app and onto the in-house replacement:
  export and import the data, check nothing was lost, run both side by side,
  switch people over, and cancel the subscription before it renews. The last
  step of the cw-replica plugin. Use when someone says "migrate off X",
  "switch everyone to our version", "cancel X", "move the data from X", or the
  replacement from replacement-plan is built and tested.
---

# cutover

Reads `replica/<app-slug>/audit.md` and `plan.md`. Output:
`replica/<app-slug>/cutover.md`, a checklist the owner ticks through.

Nothing in this skill cancels, deletes or emails anything by itself. It writes
the checklist and the scripts; a person runs the steps that touch the vendor
or tell the team.

## 1. Dates

Work backwards from the renewal date and notice period in the audit:

```
cancel by        renewal date - notice period - 7 days of slack
switch-over      cancel by - 14 days (two weeks of side-by-side)
final export     switch-over day, after people stop writing to the old app
```

If those dates have already passed, say so first and give the next renewal
instead.

## 2. Export and import

- Take a full export early as a dry run into `replica/<app-slug>/export/`, and
  keep it out of git: add `replica/*/export/` to `.gitignore` if it isn't
  there. Exports hold client data.
- Write the import as a script in the repo, never by hand, so it can be re-run
  on the final export. Map every exported column to where it lands, and list
  the ones we drop and why.
- Files and attachments: count them in the export and after the import.

## 3. Check nothing was lost

Before switch-over, compare old against new and write the result into
`cutover.md`:

- Record counts per type, old versus new. Any difference is explained or
  fixed, not rounded away.
- Ten records picked at random, checked field by field.
- Every connection from the audit (Keap, Sheets, Slack, Zapier...) fires once
  from the new tool.

## 4. Switch over

- Run both for two weeks. Say which one is the source of truth on each day.
- Tell people in their usual Slack channel: what changes, the date, the new
  link, who to ask. Draft the message for the owner to send.
- On switch-over day: final export, re-run the import, re-check counts, make
  the old app read-only if the plan allows it.

## 5. Cancel

- The owner cancels, after the checks pass. Record the confirmation number
  and date in `cutover.md`.
- Keep the final export somewhere the owner controls (Drive, not the repo) for
  as long as the company keeps that kind of record.
- Remove the old app's Zapier zaps, webhooks and API keys.
- Put the saving in the plan's cost table, so the next audit has a real
  number.
