---
name: subscription-audit
description: >-
  Audits a paid outside app that Club Wealth, Homexa or PFL subscribes to, before
  anyone decides to rebuild it in-house: what it costs, who uses it, which
  features they actually touch, what data lives in it, what it connects to, and
  what its terms allow. The first step of the cw-replica plugin. Use when
  someone says "can we replace X", "we pay too much for X", "build our own X",
  "replicate X", "do we still need X", or names a SaaS tool the team pays for
  and asks about cancelling or copying it.
---

# subscription-audit

Most paid tools are used for a fraction of what they do. This skill finds that
fraction, because it is the only part worth rebuilding. Write the audit before
any planning or building starts.

Output goes in the project:

```
replica/<app-slug>/audit.md      the audit (sections below)
replica/<app-slug>/features.csv  feature,used_by,how_often,must_keep,notes
```

## Rules

- Work only from what the team is allowed to see: the vendor's public pages,
  pricing and docs, our own account and admin screens, our invoices, and what
  teammates tell you. Never scrape behind someone else's login, never use the
  vendor's private APIs, never copy its code, copy, logos or content.
- Ask people, don't guess. Usage is a fact about our team, not about the app.
  If you can't find out who uses a feature, mark it `unknown`, not `no`.
- Money figures come from invoices or the billing page. If the person doesn't
  have them, leave the cell blank and say who would.

## Questions to answer

Ask the person for anything you can't read yourself. Keep it to what changes
the decision.

1. **The app.** Name, vendor, plan, what the team uses it for in one sentence.
2. **Cost.** Monthly and yearly spend, seats, renewal date, notice period,
   price rises announced. A renewal date inside 60 days changes the urgency:
   say so at the top of the audit.
3. **People.** Which departments and roughly how many people log in, and how
   often. Who is the owner who'd sign off on switching.
4. **Features used.** One row per feature in `features.csv`. `must_keep` is
   `yes` only when someone named would be blocked without it. Ten rows is
   typical; forty means the list needs grouping.
5. **Data.** What records live there (contacts, events, files, messages), about
   how many, whether any is sensitive (client financial details, personal
   data), and how it can be exported: format, completeness, history, files.
   No full export is a serious finding: lead with it.
6. **Connections.** What it talks to: Keap, Google Sheets, Slack, Zapier,
   Calendar, Gmail, webhooks. Each one is work in the rebuild.
7. **Terms.** Whether the plan's terms limit exporting data or building
   something comparable, and any minimum contract. Quote the clause and link
   it; don't interpret law. Flag it for the owner when it's unclear.

## The audit

`audit.md` has these sections, in this order:

1. **Verdict so far**: one paragraph. What we pay, what we use, and whether the
   used part looks small enough to rebuild. Not a decision; that is
   `replacement-plan`'s job.
2. **Cost** table.
3. **Who uses it.**
4. **Features we use**: the `must_keep: yes` rows, then a count of the rest.
5. **Data and export**.
6. **Connections**.
7. **Terms and risks**.
8. **Open questions**, each with the person who can answer it.

Finish by telling the person what's still unknown and suggesting the next step:
`replacement-plan` once the open questions that affect cost or must-keep
features are answered.
