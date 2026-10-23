# Upcoming Half-Day Event Numbers (daily huddle report)

Replaces the screenshots Andrea used to take of the CWU Daily Huddle page. The routine
"Half-Day Huddle Report → Andrea (DM)" pulls the numbers from the Club Wealth Reports
connector, draws the images with `render.cjs`, packs them into a deck with `make_pptx.py` (first slide = `cover.png`, the Club Wealth cover),
and DMs Andrea both every weekday morning.

```
node render.cjs data.json out/                  # -> out/0-…png … out/6-…png
python3 make_pptx.py out/ "Half-Day Huddle YYYY-MM-DD.pptx" "<title>" "<subtitle>"
```

`render.cjs` needs Playwright (global npm) and Chromium at `/opt/pw-browsers/chromium`;
`make_pptx.py` needs `python-pptx` and Pillow.

## Which stops go on which image (Miguel, 2026-10-22)

- **Mon–Wed:** image 1 = every stop of the current tour week (Mon–Fri). Stops already held
  show their result instead of a forecast.
- **Thu and Fri of a tour week:** image 1 = ONLY that week's Thursday and Friday stops.
  Image 2 = the NEXT tour week's stops, on their own image.
- **The day after an event:** image 0 = "Previous day's event", ONLY the
  `N of M Attended Tagged | X%` line from the forms bot's "Stat Sheet | Updated" reply
  for that stop in #cw-half-day-registration-forms-automation.
- Never plot "no scans" as 0, no commentary on people. ISAs and RMs on image 4 are sorted by sign-ups, highest first, ties by name, the same order as the CWU Daily Huddle page (Miguel, 2026-10-23).

## data.json

See `example-data.json` (the approved Fri 10/23/2026 report: today's stop with last-visit bars and the same-days-out line, next tour with last-visit bars). Keys:

| key | what |
|---|---|
| `stat` | optional. `{city, date, rows: [["Attended Tagged", n, m]]}` → image 0 |
| `title`, `note` | image 1 heading and footnote |
| `full` | image 1 stops. Upcoming: `{city, state, label, goal, signUps, prev?, prevShow?, same?, expect?, flat, need, pace, health?, h?}`. Held: `{city, state, label, goal, signUps, prev?, prevShow?, held: true, shown? or shownText?}` (`shown: null` = no scans recorded) |
| `next`, `nextTitle`, `nextNote` | optional, Thu/Fri only → image 2, same stop shape |
| `daily`, `dailyNote` | image 3: `[[city, signUps, starred]]` |
| `isa` `[name, squad, MM/DD/YYYY, n]`, `rm`, `events` `[name, n, total]`, `ccv`, `unatt`, `totals` | image 4 |
| `noEventTotals` | optional, drops the Events TOTAL column |
| `codes` | image 5: `{CODE: [[location, new or "—", total]]}` |
| `c27` | optional → image 6: `[[location, via text, new, total]]` |

Health: sign-ups ≥ 80% of goal On track (`good`), ≥ 50% Monitor (`warn`), else Behind (`bad`).

## Campaign codes (images 5 and 6, Miguel, 2026-10-23)

Match the CWU Daily Huddle "Campaign codes by stop" cards: list EVERY stop on images 1 and 2
(held, today's and next tour), each with New (last 24 h, 5 AM to 5 AM) and Total. A stop the code
never reached shows 0 / 0, never "—". CWSocial27 is a Keap tag: show each stop's "via" tag text when
it has one. Totals come from a live huddle whose chart still lists those stops (see the routine).
