# CW Monitoring Dashboard: 3D office, Today home and voice mode

These files are spliced into the published CW Monitoring Dashboard artifact (claude.ai/artifact/8Htkk1ZRuj5DJVz4Ni2EJY):
`python3 splice.py <current artifact html> <output html>` (re-read the live artifact first and splice into that copy).

- office.js / office.css / section.html: the 3D office tab (three.js r128, CC0 models from `scripts/office3d`).
- today.js / today.css / today.html: the Today home screen and CW Voice (dictation + Claude answers read aloud).
- Data docs in the artifact db, written by the hourly routine "3D office refresh": zoom/attendance, isa/slack, reports/slack.

## Robot models (AI & Tech room)
- Claude: `RobotExpressive` by Tomás Laulhé (Quaternius), CC0 1.0, from the three.js examples (modifications by Don McCurdy). Recoloured gold.
- A.C.E: `Leela` from Quaternius' Animated Mech Pack, CC0. Recoloured white and Club Wealth cyan.
Both are published next to the page as `office3d/robot.json` and `office3d/ace.json` (base64 GLB).
