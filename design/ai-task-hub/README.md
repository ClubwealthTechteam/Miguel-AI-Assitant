# AI Task Hub: mockups

High-fidelity mockups of the centralized AI Task Hub, built from Miguel's wireframe. Example workspace: Client Care (Jizel's 10 automated tasks from the AI Audit). Names, clients and numbers are placeholders.

| Screen | File |
|---|---|
| Portal: all workspaces | `screens/01-portal-all.png` |
| Portal: single workspace (ISA) + floating assistant | `screens/02-portal-isa.png` |
| Portal: multiple workspaces (TECH / ADMIN / IT) | `screens/03-portal-multi.png` |
| Task chat (Client Communication Generator) | `screens/04-task-chat.png` |
| Dashboard | `screens/05-dashboard.png` |
| Tabbed task (Billing Response Assistant) | `screens/06-task-tabs.png` |
| Floating chatbots (stay open when minimized) | `screens/07-floating-chat.png` |
| Automation run log | `screens/08-run-log.png` |
| Option 1: app floating over Keap (no tab switching) | `screens/10-app-over-keap.png` |
| Option 2: CW University dashboard with the new AI Task Hub tab | `screens/11-cwu-dashboard.png` |
| Option 2: automated task inside CW University, Keap contact alongside | `screens/12-cwu-task.png` |
| Option 2: how automations run in Keap | `screens/13-cwu-keap-flow.png` |
| Option 2: switching between Keap and the University tab | `screens/14-cwu-tabs.png` |

The Q8 comparison popup on the form shows these as two visual guides (`public/compare/`): Option 1 uses screens 02, 04, 10, 06 and Option 2 uses 11, 12, 13, 14. Render a subset with `node design/ai-task-hub/build.mjs '^1[0-4]'`.

Regenerate: `node design/ai-task-hub/build.mjs` (needs Playwright + Chromium). It writes one HTML file per screen next to the script and PNGs to `out/`.
