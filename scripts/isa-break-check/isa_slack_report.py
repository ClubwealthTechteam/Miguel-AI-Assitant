"""End-of-shift ISA report for Slack: calls per ISA (ProspectBoss, via that day's pond assignment) and
half-day sign-ups per ISA (Eventbrite sign-ups by sign-up date, credited by promo code prefix, as in the
ISA Masterfile). Read-only on every source.

Inputs in data/<DAY>/:
  pb_used.json   {"bpond01": 790, ...}  from pb_used.py: ProspectBoss "CALLS USED" today (preferred; what ISAs report)
  pb.json        from pb_fetch.py; call-log rows, used only if pb_used.json is missing
  mapping.json   {"bpond01": "Jeff", ...}  from the tracker's Daily Assignment Archive
  notes.json     ["Lily from bpond03 to bpond02 at 11:05 AM PT", ...]  the archive's Note column for DAY (optional);
                 any move note needs pb.json (pb_fetch.py DAY) so the pond's calls can be split by time
  roster.json    [{"name": "Rod Velasco", "promo": "CWRodV"}, ...]  ISA Masterfile 'Active ISAs' rows with Active = TRUE
  signups.json   [["2026-11-03", "CWJamDRE"], ...]  ISA Masterfile 'EB Cache' columns D:E (Sign-up date, Promo code)
  td.json        {"Jeff Napisa": 32860, ...}  Time Doctor tracked seconds for DAY (td_get_time_summary, ISA group,
                 groupBy user, timezone America/Los_Angeles). Optional: without it the TD part is left out.
Usage: python3 isa_slack_report.py DAY            -> prints the message
       python3 isa_slack_report.py DAY --post CHANNEL_ID   -> also posts it with the Slack bot (chat.postMessage)
"""
import json, sys, datetime as dt, urllib.request
import moves
from isa_daily import pb_to_utc
from pathlib import Path

HERE = Path(__file__).parent
CFG = json.load(open(HERE / "config.json"))


def first(n):
    return n.split()[0].lower()


def build(day):
    d = HERE / "data" / day
    pb = json.load(open(d / "pb.json")) if (d / "pb.json").exists() else {}
    mapping = json.load(open(d / "mapping.json"))
    roster = json.load(open(d / "roster.json"))
    signups = json.load(open(d / "signups.json"))
    alias = {k.lower(): v for k, v in CFG["name_alias"].items()}

    def who(first_name):
        f = (first_name or "").strip()
        if not f:
            return None
        if f.lower() in alias:
            return alias[f.lower()]
        hits = [r["name"] for r in roster if first(r["name"]) == f.lower()]
        return hits[0] if len(hits) == 1 else None

    usedf = d / "pb_used.json"
    used = json.load(open(usedf)) if usedf.exists() else None   # ProspectBoss "CALLS USED" (what the ISAs report)
    calls = {r["name"]: 0 for r in roster}
    unassigned = []
    # Pond moves from the archive's Note column (see moves.py); without notes every pond has one owner.
    notesf = d / "notes.json"
    mv = moves.parse(json.load(open(notesf)) if notesf.exists() else [], day)
    tl = moves.timelines(mapping, mv)
    moved = []
    for pond, v in (used.items() if used is not None else pb.items()):
        n = v if used is not None else len(v["calls"])
        if not n:
            continue
        segs = tl.get(pond, [(None, mapping.get(pond, ""))])
        if len(segs) > 1:
            ct = [pb_to_utc(dt.datetime.strptime(c["updated_on"], "%Y-%m-%d %I:%M:%S %p"), pb[pond]["tz"], None)
                  for c in pb.get(pond, {}).get("calls", [])] if pond in pb else []
            if not ct:
                raise SystemExit(f"{pond} has a move note but no call log in pb.json; run pb_fetch.py DAY first.")
            parts = moves.split(n, ct, segs)
            moved.append(pond)
        else:
            parts = [(segs[0][1], n)]
        for owner, k in parts:
            name = who(owner)
            if name in calls:
                calls[name] += k
            else:
                unassigned.append((pond, k, owner))

    codes = sorted(((r["promo"].lower(), r["name"]) for r in roster if r.get("promo")), key=lambda x: -len(x[0]))
    ups = {r["name"]: 0 for r in roster}
    for row in signups:
        if len(row) < 2 or row[0] != day:
            continue
        p = row[1].lower()
        for code, name in codes:
            if p.startswith(code):
                ups[name] += 1
                break

    tdf = d / "td.json"
    td = json.load(open(tdf)) if (tdf.exists() and "--with-td" in sys.argv) else None   # hours stay out of the public post

    def hm(sec):
        m = int(round(sec / 60))
        return f"{m // 60}h {m % 60:02d}m"

    def td_note(name, n):
        if td is None:
            return ""
        sec = td.get(name, 0) or 0
        if sec <= 0:
            return " · ⚠️ no Time Doctor time" if n else ""
        return f" · {hm(sec)} on Time Doctor"

    def ranked(counts, unit, units, with_td=False):
        items = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0].lower()))
        top = items[0][1] if items else 0
        out = []
        for name, n in items:
            mark = "🔥" if n and n == top else ("✅" if n else "⭕")
            label = name.upper() if mark == "🔥" else name
            out.append(f"{mark} {label} - {n:,} {unit if n == 1 else units}" + (td_note(name, n) if with_td else ""))
        return out

    nice = dt.date.fromisoformat(day).strftime("%A, %B %-d, %Y")
    lines = ["📋 *Daily ISA Report - Calls & Half-Day Sign-ups*", f"_{nice} | End of Shift_", "",
             "*Calls Made* (ranked highest to lowest)"]
    lines += ranked(calls, "call", "calls", with_td=True)
    lines += ["", f"Total ISA calls today: {sum(calls.values()):,}"]
    if unassigned:
        lines.append("_Pond time not assigned to anyone: " + ", ".join(f"{p} ({n:,} calls)" for p, n, _ in sorted(unassigned)) + "_")
    if mv:
        lines.append("_Pond moves today: " + "; ".join(f"{n} {f} → {t2} at {t.astimezone(moves.PT):%-I:%M %p} PT" for n, f, t2, t in mv) + " (calls split by time)_")
    lines += ["", "*Half-Day Sign-ups Today* (ranked highest to lowest)"]
    lines += ranked(ups, "sign-up", "sign-ups")
    lines += ["", f"Total half-day sign-ups today: {sum(ups.values()):,}",
              ("_Calls: ProspectBoss Calls Used for each ISA's assigned pond. Sign-ups:" if used is not None else "_Calls: ProspectBoss call logs for each ISA's assigned pond. Sign-ups:") + " Eventbrite sign-ups made today, credited by promo code, one per person per event (as in the ISA Masterfile)._"]
    return "\n".join(lines)


def post(channel, text):
    req = urllib.request.Request("https://slack.com/api/chat.postMessage",
                                 data=json.dumps({"channel": channel, "text": text, "unfurl_links": False}).encode(),
                                 headers={"Content-Type": "application/json; charset=utf-8", "Authorization": "Bearer xoxb-proxy-injected"})
    with urllib.request.urlopen(req, timeout=30) as f:
        r = json.load(f)
    if not r.get("ok"):
        raise SystemExit(f"Slack error: {r.get('error')}")
    return r.get("ts")


if __name__ == "__main__":
    day = sys.argv[1]
    text = build(day)
    if "--test" in sys.argv:
        text = "🧪 *TEST - partial day, numbers so far (not the end-of-shift report)*\n\n" + text
    print(text)
    if "--post" in sys.argv:
        print("posted ts", post(sys.argv[sys.argv.index("--post") + 1], text))
