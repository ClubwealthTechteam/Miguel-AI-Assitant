#!/usr/bin/env python3
"""Copy the latest end-of-shift ISA report from Slack #cw-isa into the 3D office's db doc `isa/slack`.

Reads the channel with the Club Wealth Assistant bot (token injected by the session proxy), finds the newest
"Daily ISA Report - Calls & Half-Day Sign-ups" post and prints one JSON document:
  {ts, posted, day, dayLabel, text, calls: {name: n}, signups: {name: n}, totalCalls, totalSignups}
Usage: python3 scripts/office3d/isa_slack_doc.py > isa_slack.json
"""
import json, re, sys, urllib.request
from datetime import datetime, timezone

CHANNEL = 'C0AJSBDT9AA'   # #cw-isa


def main():
    with urllib.request.urlopen('https://slack.com/api/conversations.history?channel=%s&limit=60' % CHANNEL) as r:
        d = json.load(r)
    if not d.get('ok'):
        sys.exit('slack: %s' % d.get('error'))
    msg = next((m for m in d.get('messages', []) if 'Daily ISA Report' in (m.get('text') or '')), None)
    if not msg:
        sys.exit('no ISA report found in the last 60 messages')
    text = msg['text'].replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    calls, signups, section = {}, {}, None
    for line in text.splitlines():
        if line.startswith('*Calls Made*'):
            section = calls
        elif line.startswith('*Half-Day Sign-ups'):
            section = signups
        m = re.match(r'^:[a-z_]+: (.+?) - ([\d,]+) (?:calls?|sign-ups?)\b', line)
        if m and section is not None:
            section[m.group(1).strip()] = int(m.group(2).replace(',', ''))
    tc = re.search(r'Total ISA calls today: ([\d,]+)', text)
    ts_ = re.search(r'Total half-day sign-ups today: ([\d,]+)', text)
    dl = re.search(r'_([A-Za-z]+, [A-Za-z]+ \d+, \d{4})', text)
    day = datetime.strptime(dl.group(1), '%A, %B %d, %Y').strftime('%Y-%m-%d') if dl else None
    posted = datetime.fromtimestamp(float(msg['ts']), timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    doc = {'ts': msg['ts'], 'posted': posted, 'day': day, 'dayLabel': datetime.strptime(day, '%Y-%m-%d').strftime('%a %b %-d') if day else '',
           'text': text, 'calls': calls, 'signups': signups,
           'totalCalls': int(tc.group(1).replace(',', '')) if tc else sum(calls.values()),
           'totalSignups': int(ts_.group(1).replace(',', '')) if ts_ else sum(signups.values())}
    json.dump(doc, sys.stdout, ensure_ascii=False)
    print()


if __name__ == '__main__':
    main()
