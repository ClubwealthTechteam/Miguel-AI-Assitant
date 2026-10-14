---
name: replacement-plan
description: >-
  Turns a subscription audit into a decision and a plan: keep paying, cut the
  plan down, or rebuild the used part in-house on Club Wealth's stack (static
  pages on Vercel, serverless functions, Google Sheets and Apps Script, Slack,
  Zapier). Includes the build-versus-keep cost maths, the smallest version worth
  building, and the hand-off to the Replica pack for the build. Use after
  subscription-audit, or when someone asks "is it worth rebuilding X", "what
  would it take to build our own X", "plan the replacement for X".
---

# replacement-plan

Reads `replica/<app-slug>/audit.md` and `features.csv`. If they don't exist,
run `subscription-audit` first; a plan without usage facts is a guess.

Output: `replica/<app-slug>/plan.md`.

## 1. Decide

Pick one and say why in two or three sentences at the top of the plan:

- **Keep**: the used part is large, the data can't be exported, or the app
  holds something we shouldn't host ourselves (payments, regulated records).
- **Downgrade**: a cheaper plan or fewer seats covers the `must_keep` rows.
  Often the right answer, and the fastest saving.
- **Rebuild**: the `must_keep` rows are few, the data exports cleanly, and
  the yearly saving clears the build and upkeep cost below.

### Cost maths

Show the working; never just the answer.

```
yearly subscription          from the audit
build estimate               days x day rate (ask the person for the rate)
yearly upkeep                hosting + fixes; assume 20% of build per year unless told otherwise
payback months               build / (yearly subscription - yearly upkeep) x 12
```

Payback over 12 months leans towards Keep or Downgrade. State the assumptions
the person gave you and which ones are yours.

## 2. Smallest useful version

Only for Rebuild. List the `must_keep` features and nothing else. Everything
else goes under **Later**, each with who asked for it. A replacement that tries
to match the whole app never ships.

## 3. Map it onto our stack

Prefer what this repo already runs, so the team maintains one kind of thing:

| Need | Default here |
|---|---|
| Screens and forms | Static HTML/CSS/JS in `public/`, no build step |
| Server logic, secrets | A Vercel serverless function in `api/` |
| Records and reporting | Google Sheets, written by Apps Script behind a shared secret |
| Files | Google Drive folder owned by the script |
| Notifications, approvals | Slack (the Club Wealth Assistant bot) |
| Glue to Keap, Gmail, Calendar | Zapier, or Apps Script for Google services |
| AI steps | `@anthropic-ai/sdk` from a serverless function |

Say plainly when a need doesn't fit (heavy concurrent editing, real-time
sync, large file storage, payments, logins for people outside the company)
and what it would take instead. That can flip the decision back to Keep.

## 4. Plan

`plan.md` sections:

1. **Decision** and the cost maths.
2. **Smallest useful version**, and **Later**.
3. **Stack mapping**, one row per `must_keep` feature.
4. **Data**: what moves, how it's exported, where it lands. Details go in
   `cutover`.
5. **Build steps**, each small enough to finish and check in a day.
6. **Risks**: export gaps, terms, people who will lose a feature.
7. **Sign-off**: the owner from the audit.

## 5. Hand off the build

The rebuild itself uses the Replica pack (`replica-skill` in the same
marketplace). Point the person to these, in order, with `plan.md` as the
scope so they rebuild only the smallest useful version:

- `replica-recon`: map the screens and flows of the features in scope
- `replica-build`: build them on the stack above
- `replica-test`: test it
- `replica-diff`: check it matches the flows the team relies on

Skip the Replica pack's `replica-entrepreneur`, `replica-brand` and
`replica-launch` skills: those are for selling a clone, and this is an
internal tool. When the build passes, run `cutover`.
