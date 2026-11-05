"""Pond moves during a shift, from the Daily Assignment Archive's Note column.
A note like "Lily from bpond03 to bpond02 at 11:05 AM PT" (also "Lily bpond3 to pond 2 11:05am") means Lily left
bpond03 and called on bpond02 from 11:05 AM Pacific. A pond's "Calls used" (one number for the whole day) is then
split between the people who held it, in proportion to that pond's call-log rows before and after each move.
Notes that don't read as a move are ignored."""
import re, datetime as dt
from zoneinfo import ZoneInfo

PT = ZoneInfo("America/Los_Angeles")
MOVE = re.compile(r"(?P<name>[A-Za-z][A-Za-z.\- ]*?)\s+(?:from\s+)?b?pond\s*0*(?P<frm>\d+)\s+to\s+b?pond\s*0*(?P<to>\d+)"
                  r"(?:\s+(?:at|@))?\s+(?P<h>\d{1,2})(?::(?P<m>\d{2}))?\s*(?P<ap>am|pm)?", re.I)


def pond_id(n):
    return f"bpond0{int(n)}"


def parse(notes, day):
    """notes: list of note strings for DAY. Returns [(name, from_pond, to_pond, datetime_utc)]."""
    out = []
    for text in notes:
        for m in MOVE.finditer(text or ""):
            h, mi = int(m["h"]), int(m["m"] or 0)
            ap = (m["ap"] or "").lower()
            if ap == "pm" and h < 12: h += 12
            if ap == "am" and h == 12: h = 0
            if not ap and h < 5: h += 12          # "1:30" during a 5:30 AM-3 PM shift means PM
            t = dt.datetime.fromisoformat(day).replace(hour=h, minute=mi, tzinfo=PT).astimezone(dt.timezone.utc)
            out.append((m["name"].strip(), pond_id(m["frm"]), pond_id(m["to"]), t))
    return sorted(out, key=lambda x: x[3])


def timelines(mapping, moves):
    """{pond: [(start_utc or None, owner_first_name or "")]} — owner changes at each move."""
    tl = {p: [(None, (n or "").strip())] for p, n in mapping.items()}
    for name, frm, to, t in moves:
        tl.setdefault(frm, [(None, "")]); tl.setdefault(to, [(None, "")])
        if tl[frm][-1][1].lower() == name.lower():
            tl[frm].append((t, ""))
        tl[to].append((t, name))
    return tl


def split(used, call_times, segments):
    """Split one pond's Calls used across owner segments by share of call-log rows. Returns [(owner, n)]."""
    if len(segments) == 1:
        return [(segments[0][1], used)]
    bounds = [s for s, _ in segments[1:]] + [None]
    counts = []
    for (start, owner), end in zip(segments, bounds):
        counts.append(sum(1 for t in call_times if (start is None or t >= start) and (end is None or t < end)))
    total = sum(counts)
    if not total:
        return [(segments[-1][1], used)]
    parts = [int(used * c / total) for c in counts]
    parts[max(range(len(parts)), key=lambda i: counts[i])] += used - sum(parts)
    return [(o, n) for (_, o), n in zip(segments, parts) if n]
