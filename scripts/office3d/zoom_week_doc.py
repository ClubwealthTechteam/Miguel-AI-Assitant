#!/usr/bin/env python3
"""Help Desk Zoom clock-ins for the last 11 working days (today + 10 complete), for the dashboard's "Weekly patterns" view
(artifact db doc `zoom/week`). Per day and Zoom display name: first join, last leave, minutes in the room.
Names are left as typed; the dashboard matches them to the roster and shows team totals per day.

Usage:  python3 scripts/office3d/zoom_week_doc.py [days=11]
Needs:  ZOOM_ACCOUNT_ID (the proxy adds the Zoom app credentials), like scripts/zoom-helpdesk-attendance.py.
"""
import importlib.util, json, os, sys
from datetime import datetime, timedelta, timezone

here = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('za', os.path.join(here, '..', 'zoom-helpdesk-attendance.py'))
za = importlib.util.module_from_spec(spec); spec.loader.exec_module(za)


def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 11
    tok = za.token()
    today = datetime.now(za.PT).date()
    days, d = [], today
    while len(days) < n:
        if d.weekday() < 5:
            days.append(d.strftime('%Y-%m-%d'))
        d -= timedelta(days=1)
    want = set(days)
    by_day = {k: {} for k in days}
    notes = []
    inst = za.get(tok, '/past_meetings/%s/instances' % za.MEETING_ID).get('meetings', [])
    rows = []
    for i in inst:
        day = za.pt_date(i['start_time'])
        if day not in want:
            continue
        ps, err = za.pages(tok, '/past_meetings/%s/participants' % za.dbl(i['uuid']), 'participants')
        if err:
            notes.append('past %s: %s' % (i['start_time'], err.get('_error')))
        rows += [(day, p.get('name') or '', p.get('join_time'), p.get('leave_time')) for p in ps]
    ps, err = za.pages(tok, '/metrics/meetings/%s/participants' % za.MEETING_ID, 'participants', type='live')
    if not err:
        rows += [(za.pt_date(p['join_time']), p.get('user_name') or '', p.get('join_time'), p.get('leave_time') or None) for p in ps if p.get('join_time')]
    for day, name, j, l in rows:
        if day not in want or not j:
            continue
        # a session belongs to the day it started; ignore sessions that started on another day
        name = name.strip()
        p = by_day[day].setdefault(name, {'n': name, 'j': j, 'l': l, 'sec': 0})
        if j < p['j']: p['j'] = j
        if l and (p['l'] is None or l > p['l']): p['l'] = l
        if l:
            p['sec'] += max(0, (datetime.fromisoformat(l.replace('Z', '+00:00')) - datetime.fromisoformat(j.replace('Z', '+00:00'))).total_seconds())
    out = []
    for day in sorted(days):
        ppl = []
        for p in sorted(by_day[day].values(), key=lambda x: x['j']):
            ppl.append({'n': p['n'], 'j': p['j'][:16] + 'Z', 'l': (p['l'][:16] + 'Z') if p['l'] else None, 'm': round(p['sec'] / 60)})
        out.append({'date': day, 'people': ppl})
    doc = {'at': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'), 'huddle': za.HUDDLE_PT, 'days': out, 'notes': notes}
    json.dump(doc, sys.stdout, ensure_ascii=False, separators=(',', ':'))
    print()


if __name__ == '__main__':
    main()
