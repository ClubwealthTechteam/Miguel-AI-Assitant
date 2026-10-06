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

Regenerate: `node design/ai-task-hub/build.mjs` (needs Playwright + Chromium). It writes one HTML file per screen next to the script and PNGs to `out/`.
