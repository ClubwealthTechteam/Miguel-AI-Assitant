#!/usr/bin/env python3
"""Zoom clock-in / clock-out for the staff's all-day "Club Wealth Help Desk" room.

Staff join the Help Desk Zoom (meeting 99195738734) for the 7:30 AM PT daily huddle and stay in it
for their shift, so for each Zoom display name:
  first join  = clock-in
  last leave  = clock-out (empty while they are still in the room)

Prints one JSON document for the CW Monitoring Dashboard's 3D office (artifact db doc `zoom/attendance`).
Names are left exactly as people typed them in Zoom; the dashboard matches them to the staff roster.

Usage:  python3 scripts/zoom-helpdesk-attendance.py [YYYY-MM-DD]   (default: today in Pacific time)
Needs:  ZOOM_ACCOUNT_ID in the environment; the session's proxy adds the Zoom app credentials.
Scopes: meeting:read:admin (past instances/participants), dashboard_meetings:read:admin (live room).
"""
import json, os, sys, urllib.error, urllib.parse, urllib.request
from datetime import datetime, timedelta, timezone

try:
    from zoneinfo import ZoneInfo
    PT = ZoneInfo('America/Los_Angeles')
except Exception:  # pragma: no cover
    PT = timezone(timedelta(hours=-8))

MEETING_ID = '99195738734'
HUDDLE_PT = '07:30'
API = 'https://api.zoom.us/v2'


def token():
    url = 'https://zoom.us/oauth/token?' + urllib.parse.urlencode({'grant_type': 'account_credentials', 'account_id': os.environ['ZOOM_ACCOUNT_ID']})
    with urllib.request.urlopen(urllib.request.Request(url, method='POST')) as r:
        return json.load(r)['access_token']


def get(tok, path, **q):
    url = API + path + ('?' + urllib.parse.urlencode(q) if q else '')
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={'Authorization': 'Bearer ' + tok})) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        return {'_error': e.code, '_body': e.read()[:300].decode('utf8', 'replace')}


def pages(tok, path, key, **q):
    out, nxt = [], ''
    while True:
        d = get(tok, path, page_size=300, next_page_token=nxt, **q)
        if '_error' in d:
            return out, d
        out += d.get(key, [])
        nxt = d.get('next_page_token') or ''
        if not nxt:
            return out, None


def dbl(uuid):
    return urllib.parse.quote(urllib.parse.quote(uuid, safe=''), safe='')


def pt_date(iso):
    return datetime.fromisoformat(iso.replace('Z', '+00:00')).astimezone(PT).strftime('%Y-%m-%d')


def main():
    day = sys.argv[1] if len(sys.argv) > 1 else datetime.now(PT).strftime('%Y-%m-%d')
    tok = token()
    sessions, notes = [], []

    # Ended instances that started on this Pacific day.
    inst = get(tok, '/past_meetings/%s/instances' % MEETING_ID).get('meetings', [])
    for i in inst:
        if pt_date(i['start_time']) != day:
            continue
        ps, err = pages(tok, '/past_meetings/%s/participants' % dbl(i['uuid']), 'participants')
        if err:
            notes.append('past %s: %s' % (i['start_time'], err.get('_error')))
        for p in ps:
            sessions.append((p.get('name') or '', p.get('join_time'), p.get('leave_time') or None))

    # The room that is open right now, if any (people still in it have no leave time).
    live = False
    ps, err = pages(tok, '/metrics/meetings/%s/participants' % MEETING_ID, 'participants', type='live')
    if not err and ps:
        live = True
        for p in ps:
            j = p.get('join_time')
            if j and pt_date(j) == day:
                sessions.append((p.get('user_name') or '', j, p.get('leave_time') or None))
    elif err and err.get('_error') not in (404,):
        # 3301-style "meeting not live" comes back as 404/400; anything else is worth noting.
        if 'not' not in err.get('_body', '').lower():
            notes.append('live: %s' % err.get('_error'))

    people = {}
    for name, j, l in sessions:
        if not j:
            continue
        p = people.setdefault(name.strip(), {'n': name.strip(), 'j': j, 'l': l, 'open': False, 'sec': 0, 'k': 0, 's': []})
        p['k'] += 1
        p['s'].append([j[:16] + 'Z', (l[:16] + 'Z') if l else None])
        if j < p['j']:
            p['j'] = j
        if l is None:
            p['open'] = True
        elif p['l'] is None or l > p['l']:
            p['l'] = l
        if l:
            p['sec'] += max(0, (datetime.fromisoformat(l.replace('Z', '+00:00')) - datetime.fromisoformat(j.replace('Z', '+00:00'))).total_seconds())
    for p in people.values():
        p['m'] = round(p.pop('sec') / 60)
        # merge overlapping/adjacent sessions (minute precision) for the dashboard's day replay
        ss = sorted(p['s'], key=lambda x: x[0]); merged = []
        for a, b in ss:
            if merged and (merged[-1][1] is None or a <= merged[-1][1]):
                if merged[-1][1] is not None and (b is None or b > merged[-1][1]): merged[-1][1] = b
            else:
                merged.append([a, b])
        p['s'] = merged
        if p['open']:
            p['l'] = None
    doc = {
        'date': day, 'at': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'), 'meetingId': MEETING_ID,
        'room': 'Club Wealth Help Desk', 'huddle': HUDDLE_PT, 'live': live,
        'people': sorted(people.values(), key=lambda x: x['j']), 'notes': notes,
    }
    json.dump(doc, sys.stdout, ensure_ascii=False, separators=(',', ':'))
    print()


if __name__ == '__main__':
    main()
