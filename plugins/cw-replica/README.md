# cw-replica

A Claude Code plugin for replacing the outside apps Club Wealth, Homexa and PFL
pay for with in-house tools, when that's worth it.

It adds three skills, used in order:

| Skill | What it does | Writes |
|---|---|---|
| `subscription-audit` | Cost, users, the features we actually use, data and export, connections, terms | `replica/<app>/audit.md`, `features.csv` |
| `replacement-plan` | Keep, downgrade or rebuild, with the cost maths; the smallest useful version; how it maps onto our stack | `replica/<app>/plan.md` |
| `cutover` | Dates from the renewal, export and import, checks, side-by-side, cancel | `replica/<app>/cutover.md` |

The rebuild in between uses Jake Schincariol's
[Replica pack](https://github.com/Jakeschincariol/replica-skill) (MIT):
`replica-recon`, `replica-build`, `replica-test` and `replica-diff`. It's listed
in the same marketplace.

## Install

In Claude Code:

```
/plugin marketplace add clubwealthtechteam/miguel-ai-assitant
/plugin install cw-replica@clubwealth
/plugin install replica-skill@clubwealth
```

The repo is private, so your GitHub account needs access to it. Skills show up
namespaced, e.g. `/cw-replica:subscription-audit`, or just ask: "can we
replace <app>?"

## Ground rules

The skills enforce these:

- Rebuild what the app does for us, never what it owns: no copying its code,
  copy, logos or content, no scraping behind someone else's login, no private
  APIs.
- Read the vendor's terms before building, and flag anything unclear to the
  owner.
- Exports hold client data: they stay out of git (`replica/*/export/`).
- Nothing gets cancelled, deleted or announced by Claude; the owner does those
  steps from the checklist.

## Adding a skill

Make a folder in `skills/` with a `SKILL.md` (front matter `name` and a
`description` that says when to use it), then bump `version` in
`.claude-plugin/plugin.json` so installs pick up the change with
`/plugin marketplace update clubwealth`.
