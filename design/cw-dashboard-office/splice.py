import sys, os
src, out = sys.argv[1], sys.argv[2]
d = os.path.dirname(os.path.abspath(__file__))
s = open(src).read()
css = open(os.path.join(d, 'office.css')).read()
sec = open(os.path.join(d, 'section.html')).read()
js = open(os.path.join(d, 'office.js')).read()

def once(a, b):
    global s
    assert s.count(a) == 1, (s.count(a), a[:90])
    s = s.replace(a, b)

# 1. styles: end of the main style block
once('.tr-empty { background: var(--card); border: 1px dashed var(--line-2); border-radius: 12px; padding: 22px; text-align: center; color: var(--ink-2); }\n</style>',
     '.tr-empty { background: var(--card); border: 1px dashed var(--line-2); border-radius: 12px; padding: 22px; text-align: center; color: var(--ink-2); }\n' + css + '</style>')
# 2. nav button under Home
navb = '<button type="button" data-tab="office"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/></svg>3D office</button>\n      <p class="side-h">Sales</p>'
once('<p class="side-h">Sales</p>', navb)
# 3. view section
once('    <section class="view" data-view="brk" hidden aria-label="ISA break check">', sec + '    <section class="view" data-view="brk" hidden aria-label="ISA break check">')
# 4. title
once('var TITLES = { main: [', "var TITLES = { office: ['3D office', 'Who is in, live from the Help Desk Zoom · break checks and EOD reports at each desk'], main: [")
# 5. tab hook
once("    if (id === 'eod') eodLoad(false);\n", "    if (id === 'eod') eodLoad(false);\n    $('#app').classList.toggle('of-full', id === 'office'); if (id === 'office') officeOpen(); else officeClose();\n")
# 6. office code before liveLoad();
once("  var start = (location.hash || '').slice(1);", js + "\n  var start = (location.hash || '').slice(1);")

# ===== Remodel: Today home, Sales overview under Sales, voice mode =====
tcss = open(os.path.join(d, 'today.css')).read(); thtml = open(os.path.join(d, 'today.html')).read(); tjs = open(os.path.join(d, 'kokoro.js')).read() + open(os.path.join(d, 'today.js')).read() + open(os.path.join(d, 'brief.js')).read() + open(os.path.join(d, 'week.js')).read()
tcss += open(os.path.join(d, 'week.css')).read(); thtml += open(os.path.join(d, 'week.html')).read()
once('.tr-empty { background: var(--card); border: 1px dashed var(--line-2); border-radius: 12px; padding: 22px; text-align: center; color: var(--ink-2); }\n', '.tr-empty { background: var(--card); border: 1px dashed var(--line-2); border-radius: 12px; padding: 22px; text-align: center; color: var(--ink-2); }\n' + tcss)
import re as _re
# Main dashboard stays the home page exactly as before; Today (live team) sits right under it
once('      <button type="button" data-tab="tara">', '      <button type="button" data-tab="today"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></svg>Today · live team</button>\n      <button type="button" data-tab="week"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>Weekly patterns</button>\n      <button type="button" data-tab="tara">')
once('<section class="view" data-view="main" aria-label="Main dashboard">', thtml + '    <section class="view" data-view="main" aria-label="Main dashboard">')
once("main: ['Main dashboard', 'Service sales at a glance']", "today: ['Today · live team', 'Everything that needs you, live'], week: ['Weekly patterns', 'Huddle, clock-ins and break checks over the last two weeks · team totals first'], main: ['Main dashboard', 'Service sales at a glance']")
once("if (id === 'office') officeOpen(); else officeClose();\n", "if (id === 'office') officeOpen(); else officeClose();\n    if (id === 'today') tdStart();\n    if (id === 'week') wkStart();\n")
once('\n  }\n  liveLoad();\n})();', '\n' + tjs + '\n  }\n  liveLoad();\n})();')
# office view: hide the date range + keep the main padding
# collapsible left menu (icons-only rail)
scss = open(os.path.join(d, 'side.css')).read(); sjs = open(os.path.join(d, 'side.js')).read()
once('.tr-empty { background: var(--card); border: 1px dashed var(--line-2); border-radius: 12px; padding: 22px; text-align: center; color: var(--ink-2); }\n', '.tr-empty { background: var(--card); border: 1px dashed var(--line-2); border-radius: 12px; padding: 22px; text-align: center; color: var(--ink-2); }\n' + scss)
once('\n  liveLoad();\n})();', '\n' + sjs + '\n  liveLoad();\n})();')
open(out, 'w').write(s)
print('spliced', len(s))
