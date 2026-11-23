#!/usr/bin/env python3
"""Latest Slack automation reports for the 3D office's Report Wall (artifact db doc `reports/slack`).

Reads every channel the Club Wealth Assistant bot is in (token injected by the session proxy), keeps the bot's own
posts from the last 7 days, groups them by report (first line with dates/numbers removed) and keeps the newest of each.
Prints {at, items: [{ch, chName, ts, posted, title, text}]} newest first. Read-only.
Usage: python3 scripts/office3d/slack_reports_doc.py > reports.json
"""
import json, re, sys, time, urllib.request
from datetime import datetime, timezone

API = 'https://slack.com/api/'


def get(method, **q):
    url = API + method + '?' + '&'.join('%s=%s' % (k, v) for k, v in q.items())
    with urllib.request.urlopen(url) as r:
        d = json.load(r)
    if not d.get('ok'):
        raise SystemExit('slack %s: %s' % (method, d.get('error')))
    return d


def clean(t):
    t = t.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    t = re.sub(r'<!here>|<!channel>', '', t)
    t = re.sub(r'<@[A-Z0-9]+>', '@someone', t)
    t = re.sub(r'<#[A-Z0-9]+\|?([^>]*)>', lambda m: '#' + (m.group(1) or 'channel'), t)
    t = re.sub(r'<(https?://[^|>]+)\|([^>]+)>', r'\2', t)
    t = re.sub(r'<(https?://[^>]+)>', r'\1', t)
    return t.strip()


def key(title):
    t = re.sub(r':[a-z0-9_+-]+:', '', title.lower())
    t = re.sub(r'[*_`]', '', t)
    t = t.split(' — ')[0].split(' · ')[0]
    t = re.sub(r'\b(mon|tue|wed|thu|fri|sat|sun)[a-z]*\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b', '', t)
    t = re.sub(r'[\d/.,:–\-()·|]+', ' ', t)
    return ' '.join(t.split()[:5])


def main():
    me = get('auth.test')['bot_id']
    chans = get('users.conversations', types='public_channel,private_channel', limit=200)['channels']
    since = time.time() - 7 * 86400
    best = {}
    for c in chans:
        msgs, cur = [], ''
        while True:
            q = {'channel': c['id'], 'limit': 200, 'oldest': int(since)}
            if cur:
                q['cursor'] = cur
            h = get('conversations.history', **q)
            msgs += h.get('messages', [])
            cur = (h.get('response_metadata') or {}).get('next_cursor') or ''
            if not cur or not h.get('has_more'):
                break
        for m in msgs:
            if m.get('bot_id') != me or not m.get('text'):
                continue
            text = clean(m['text'])
            title = re.sub(r':[a-z0-9_+-]+:', '', text.split('\n')[0]).strip()[:140] or '(report)'
            k = c['id'] + '|' + key(title)
            if k not in best or float(m['ts']) > float(best[k]['ts']):
                best[k] = {'ch': c['id'], 'chName': c['name'], 'ts': m['ts'], 'title': re.sub(r'[*_]', '', title).strip(),
                           'posted': datetime.fromtimestamp(float(m['ts']), timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'), 'text': text[:3500]}
    items = sorted(best.values(), key=lambda x: -float(x['ts']))[:24]
    json.dump({'at': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'), 'items': items}, sys.stdout, ensure_ascii=False)
    print()


if __name__ == '__main__':
    main()
