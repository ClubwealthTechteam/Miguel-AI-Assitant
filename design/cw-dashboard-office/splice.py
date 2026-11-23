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
tcss = open(os.path.join(d, 'today.css')).read(); thtml = open(os.path.join(d, 'today.html')).read(); tjs = open(os.path.join(d, 'today.js')).read()
once('.tr-empty { background: var(--card); border: 1px dashed var(--line-2); border-radius: 12px; padding: 22px; text-align: center; color: var(--ink-2); }\n', '.tr-empty { background: var(--card); border: 1px dashed var(--line-2); border-radius: 12px; padding: 22px; text-align: center; color: var(--ink-2); }\n' + tcss)
import re as _re
i = s.index('      <button type="button" data-tab="main" aria-current="page">'); j = s.index('</button>', i) + len('</button>')
mainBtn = s[i:j]
s = s[:i] + '<button type="button" data-tab="today" aria-current="page"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></svg>Today</button>' + s[j:]
salesBtn = mainBtn.replace(' aria-current="page"', '').replace('Main dashboard', 'Sales overview')
once('      <p class="side-h">Sales</p>', '      <p class="side-h">Sales</p>\n      ' + salesBtn.strip())
once('<span class="m-current" id="m-current" aria-hidden="true">Main dashboard</span>', '<span class="m-current" id="m-current" aria-hidden="true">Today</span>')
once('<section class="view" data-view="main" aria-label="Main dashboard">', thtml + '    <section class="view" data-view="main" hidden aria-label="Sales overview">')
once("main: ['Main dashboard', 'Service sales at a glance']", "today: ['Today', 'Everything that needs you, live'], main: ['Sales overview', 'Service sales at a glance']")
once("if (id === 'office') officeOpen(); else officeClose();\n", "if (id === 'office') officeOpen(); else officeClose();\n    if (id === 'today') tdStart();\n")
once("  var start = (location.hash || '').slice(1); if (TITLES[start]) tab(start); else $('.range').hidden = false;", "  var start = (location.hash || '').slice(1); tab(TITLES[start] ? start : 'today');")
once('\n  }\n  liveLoad();\n})();', '\n' + tjs + '\n  }\n  liveLoad();\n})();')
# office view: hide the date range + keep the main padding
open(out, 'w').write(s)
print('spliced', len(s))
