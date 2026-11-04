"""ISA break check for one shift day: ProspectBoss calls vs Time Doctor.

Inputs in data/<DAY>/ (see README):
  pb.json          from pb_fetch.py
  td_worklog.json  [{"userName","start","end","taskName"}]  start/end in UTC ISO (Time Doctor worklog)
  td_summary.json  [{"userName","trackedSec","totalSec","idleMins","manualSec"}]
  mapping.json     {"bpond01": "Jeff", ...}  from the tracker's Daily Assignment Archive (first names)
Outputs in data/<DAY>/: report.xlsx, sheet_payload.json, summary.txt
"""
import json, sys, re, datetime as dt
from zoneinfo import ZoneInfo
from pathlib import Path

HERE = Path(__file__).parent
CFG = json.load(open(HERE / "config.json"))
UTC = dt.timezone.utc
TZ = ZoneInfo(CFG["report_tz"])
F = "%Y-%m-%d %I:%M:%S %p"


def load(day):
    d = HERE / "data" / day
    return (d, json.load(open(d / "pb.json")), json.load(open(d / "td_worklog.json")),
            json.load(open(d / "td_summary.json")), json.load(open(d / "mapping.json")))


def utc(s):
    return dt.datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(UTC)


def local(day, hhmm):
    h, m = map(int, hhmm.split(":"))
    return dt.datetime.fromisoformat(day).replace(hour=h, minute=m, tzinfo=TZ).astimezone(UTC)


def overlap(a, b, c, d):
    return max(0.0, (min(b, d) - max(a, c)).total_seconds() / 60)


def fmt(t):
    return t.astimezone(TZ).strftime("%-I:%M %p") if t else ""


def hmm(minutes):
    if minutes in ("", None):
        return ""
    s = "-" if minutes < 0 else ""
    m = round(abs(minutes))
    return f"{s}{m // 60}:{m % 60:02d}"


def calibrate(pb, work, breaks):
    """PB shows times in the pond's tz setting, which can be off by an hour (labels look like summer
    offsets). Pick, per tz label, the hour shift that puts calls inside Time Doctor work time and
    outside Time Doctor breaks."""
    groups = {}
    for p, v in pb.items():
        groups.setdefault(v["tz"], []).extend(dt.datetime.strptime(r["updated_on"], F) for r in v["calls"])
    out = {}
    for tzlabel, shown in groups.items():
        best = None
        for k in range(-14, 15):
            ts = [(x + dt.timedelta(hours=k)).replace(tzinfo=UTC) for x in shown]
            inw = sum(1 for t in ts if any(a <= t < b for a, b in work))
            inb = sum(1 for t in ts if any(a <= t < b for a, b in breaks))
            score = inw - 10 * inb
            if best is None or score > best[0]:
                best = (score, k, inw, inb, len(ts))
        out[tzlabel] = dict(shift_h=best[1], in_work=best[2], in_break=best[3], calls=best[4])
    return out


def main(day):
    d, pbraw, wl, ts, mapping = load(day)
    S = CFG["schedule"]
    sh_start, sh_end = local(day, S["start"]), local(day, S["end"])
    WIN = [(w["name"], local(day, w["start"]), local(day, w["end"])) for w in CFG["windows"]]

    # ---- Time Doctor
    users = {}
    for r in wl:
        a, b = utc(r["start"]), utc(r["end"])
        if b < a + dt.timedelta(minutes=1):
            b = a + dt.timedelta(minutes=1) if (b - a).total_seconds() > 0 else b
        users.setdefault(r["userName"], []).append((a, b, "Break" if (r.get("taskName") or "").lower().startswith("break") or r.get("mode") in ("paidBreak", "unpaidBreak") else "Work"))
    summ = {r["userName"]: r for r in ts}
    work_union = [(a, b) for u in users.values() for a, b, k in u if k == "Work"]
    break_union = [(a, b) for u in users.values() for a, b, k in u if k == "Break"]

    cal = calibrate(pbraw, work_union, break_union)

    # ---- ProspectBoss per pond
    PB = {}
    for p, v in pbraw.items():
        k = cal[v["tz"]]["shift_h"]
        cs = sorted(v["calls"], key=lambda r: dt.datetime.strptime(r["updated_on"], F))
        t = [(dt.datetime.strptime(r["updated_on"], F) + dt.timedelta(hours=k)).replace(tzinfo=UTC) for r in cs]
        lo, hi = 0, len(t)
        for j in range(1, 4):  # stray calls: <=3 calls 2h+ away from the rest of the day
            if hi - j > 0 and (t[hi - j] - t[hi - j - 1]).total_seconds() >= 7200:
                hi -= j
                break
        for j in range(1, 4):
            if lo + j < hi and (t[lo + j] - t[lo + j - 1]).total_seconds() >= 7200:
                lo += j
                break
        main_ = t[lo:hi]
        gaps = []
        for a, b in zip(main_, main_[1:]):
            if (b - a).total_seconds() >= CFG["gap_min"] * 60:
                ov = {n: overlap(a, b, s, e) for n, s, e in WIN}
                sched = sum(ov.values())
                gaps.append(dict(start=a, end=b, mins=(b - a).total_seconds() / 60, sched=sched,
                                 unsched=(b - a).total_seconds() / 60 - sched,
                                 windows=", ".join(n for n, m in ov.items() if m > 0) or "—"))
        PB[p] = dict(main=main_, strays=t[:lo] + t[hi:], gaps=gaps, calls=len(main_),
                     inbound=sum(1 for r in cs[lo:hi] if r["call_type"] == "Inbound"))

    # ---- names: archive first name -> Time Doctor name
    def td_name(first):
        first = (first or "").strip()
        if not first:
            return ""
        if first in CFG["name_alias"]:
            return CFG["name_alias"][first]
        hits = [u for u in set(users) | set(summ) if u.split()[0].lower() == first.lower()]
        return hits[0] if len(hits) == 1 else first

    pond_of = {}
    rows = []
    for p in sorted(pbraw, key=lambda x: int(re.sub(r"\D", "", x))):
        name = td_name(mapping.get(p, ""))
        if name:
            pond_of.setdefault(name, []).append(p)
    everyone = sorted(set(users) | set(summ) | set(pond_of), key=str.lower)
    unassigned = [p for p in sorted(pbraw, key=lambda x: int(re.sub(r"\D", "", x)))
                  if not td_name(mapping.get(p, "")) and PB[p]["calls"]]

    def nocall_intervals(p):
        m = PB[p]["main"]
        if not m:
            return [(sh_start - dt.timedelta(hours=12), sh_end + dt.timedelta(hours=12))]
        iv = [(m[0] - dt.timedelta(hours=24), m[0])] + [(g["start"], g["end"]) for g in PB[p]["gaps"]] + [(m[-1], m[-1] + dt.timedelta(hours=24))]
        return iv

    def minus_windows(iv):
        out = []
        for a, b in iv:
            pieces = [(a, b)]
            for _, s, e in WIN:
                new = []
                for x, y in pieces:
                    if y <= s or x >= e:
                        new.append((x, y))
                    else:
                        if x < s: new.append((x, s))
                        if y > e: new.append((e, y))
                pieces = new
            out += pieces
        return out

    breaks_rows = []
    for u in everyone + [f"(unassigned) {p}" for p in unassigned]:
        if u.startswith("(unassigned)"):
            ponds = [u.split()[-1]]; tdu = None; label = "(not in assignment)"
        else:
            ponds = pond_of.get(u, []); tdu = u; label = u
        segs = sorted(users.get(tdu, []))
        sm = summ.get(tdu, {}) if tdu else {}
        r = dict(isa=label, pond=", ".join(ponds))
        flags = []
        if segs:
            r["td_first"], r["td_last"] = segs[0][0], max(b for a, b, k in segs)
            br = [(b - a).total_seconds() / 60 for a, b, k in segs if k == "Break"]
            gp = [(y[0] - x[1]).total_seconds() / 60 for x, y in zip(segs, segs[1:]) if y[0] > x[1]]
            r["td_break"], r["td_break_max"] = sum(br), max(br, default=0)
            r["td_gap_max"] = max(gp, default=0)
            late = (r["td_first"] - sh_start).total_seconds() / 60
            early = (sh_end - r["td_last"]).total_seconds() / 60
            if late > CFG["td_late_grace_min"]: flags.append(f"TD started {round(late)} min late")
            if early > CFG["td_early_grace_min"]: flags.append(f"TD stopped {round(early)} min early")
            if r["td_break_max"] > CFG["break_allowance_min"] + CFG["tolerance_min"]: flags.append(f"TD break {round(r['td_break_max'])} min")
            if r["td_gap_max"] > CFG["lunch_allowance_min"] + CFG["tolerance_min"]: flags.append(f"TD untracked gap {round(r['td_gap_max'])} min")
        elif tdu:
            flags.append("No Time Doctor time")
        r["tracked"] = sm.get("trackedSec", 0) / 60
        tot = sm.get("totalSec", 0)
        r["idle_pct"] = (sm.get("idleMins", 0) / (tot // 60)) if tot >= 60 else ""
        if sm.get("manualSec", 0) / 60 > r.get("td_break", 0) + 30:
            flags.append(f"{round(sm['manualSec'] / 60 - r.get('td_break', 0))} min manual work time")
        if ponds:
            mains = sorted(t for p in ponds for t in PB[p]["main"])
            if mains:
                r["pb_first"], r["pb_last"] = mains[0], mains[-1]
                r["calls"] = len(mains)
                r["pb_break"] = sum(g["mins"] for p in ponds for g in PB[p]["gaps"])
                r["pb_unsched"] = sum(g["unsched"] for p in ponds for g in PB[p]["gaps"])
                r["pb_active"] = sum(((PB[p]["main"][-1] - PB[p]["main"][0]).total_seconds() / 60 - sum(g["mins"] for g in PB[p]["gaps"])) for p in ponds if PB[p]["main"])
                late = (r["pb_first"] - sh_start).total_seconds() / 60
                early = (sh_end - r["pb_last"]).total_seconds() / 60
                if late > CFG["pb_late_grace_min"]: flags.append(f"First call {round(late)} min after shift start")
                if early > CFG["pb_early_grace_min"]: flags.append(f"Last call {round(early)} min before shift end")
                if r["pb_unsched"] >= CFG["flag_unscheduled_min"]: flags.append(f"{round(r['pb_unsched'])} min of unscheduled no-call breaks")
                if segs:
                    wk = [(a - dt.timedelta(minutes=1), b + dt.timedelta(minutes=1)) for a, b, k in segs if k == "Work"]
                    r["calls_off_td"] = sum(1 for t in mains if not any(a <= t < b for a, b in wk))
                    if r["calls_off_td"] >= 20: flags.append(f"{r['calls_off_td']} calls made while Time Doctor was not tracking")
                    nc = sum(overlap(a, b, x, y) for a, b, k in segs if k == "Work" for p in ponds for x, y in minus_windows(nocall_intervals(p)))
                    r["tracked_nocalls"] = nc
                    if nc >= CFG["flag_tracked_no_calls_min"]: flags.append(f"{round(nc)} min tracked in TD with no calls (outside schedule)")
                elif tdu is None:
                    flags.append("Pond used but not in the day's assignment")
                strays = [t for p in ponds for t in PB[p]["strays"]]
                if strays: flags.append("Stray call(s) left out: " + ", ".join(fmt(t) for t in strays))
                for p in ponds:
                    for g in PB[p]["gaps"]:
                        breaks_rows.append([label, p, fmt(g["start"]), fmt(g["end"]), round(g["mins"]), round(g["sched"]), round(g["unsched"]), g["windows"], "Check" if g["unsched"] >= CFG["gap_min"] else ""])
            else:
                flags.append("Assigned pond has no calls")
        elif tdu and segs:
            flags.append("No pond in the day's assignment")
        if ponds and r.get("pb_last") and (sh_end - r["pb_last"]).total_seconds() / 60 > CFG["pb_early_grace_min"]:
            for q in unassigned:
                if PB[q]["main"] and 0 <= (PB[q]["main"][0] - r["pb_last"]).total_seconds() / 60 <= 20:
                    flags.append(f"possible switch to unassigned {q} (starts {fmt(PB[q]['main'][0])})")
        r["flags"] = "; ".join(flags)
        rows.append(r)

    # ---- outputs
    header = ["ISA", "Pond", "TD start", "TD end", "TD tracked (h:mm)", "TD breaks logged (min)", "Longest TD break (min)",
              "Longest untracked gap (min)", "TD idle %", "PB first call", "PB last call", "PB calls", "PB break total (min)",
              "PB unscheduled break (min)", "PB active (h:mm)", "Tracked in TD, no calls (min)", "Calls while TD off", "TD tracked − PB active (h:mm)", "Flags"]
    table = []
    for r in rows:
        diff = (r["tracked"] - r["pb_active"]) if r.get("pb_active") is not None and r.get("tracked") else ""
        table.append([r["isa"], r["pond"], fmt(r.get("td_first")), fmt(r.get("td_last")), hmm(r["tracked"]) if r["tracked"] else "",
                      round(r["td_break"]) if "td_break" in r else "", round(r["td_break_max"]) if "td_break_max" in r else "",
                      round(r["td_gap_max"]) if "td_gap_max" in r else "", round(r["idle_pct"], 3) if r["idle_pct"] != "" else "",
                      fmt(r.get("pb_first")), fmt(r.get("pb_last")), r.get("calls", ""), round(r["pb_break"]) if "pb_break" in r else "",
                      round(r["pb_unsched"]) if "pb_unsched" in r else "", hmm(r.get("pb_active")) if r.get("pb_active") is not None else "",
                      round(r["tracked_nocalls"]) if "tracked_nocalls" in r else "", r.get("calls_off_td", ""), hmm(diff) if diff != "" else "", r["flags"]])
    cal_txt = "; ".join(f"pond tz '{k}': shown {'+' if v['shift_h'] >= 0 else ''}{v['shift_h']} h = UTC ({v['in_break']} of {v['calls']} calls in TD breaks)" for k, v in cal.items())
    wtxt = " · ".join(f"{n} {fmt(s)}–{fmt(e)}" for n, s, e in WIN)
    nice = dt.date.fromisoformat(day).strftime("%a %b %-d, %Y")
    head = [[f"ISA Break Check — {nice} (Pacific time)"],
            [f"ProspectBoss = when calls were made · Time Doctor = tracked time. Updated {dt.datetime.now(TZ).strftime('%b %-d %-I:%M %p')} PT, read-only pull. Ponds from the tracker's Daily Assignment Archive."],
            [f"Schedule: shift {fmt(sh_start)}–{fmt(sh_end)} · {wtxt}. Break = gap of {CFG['gap_min']}+ min between calls; 'unscheduled' = minutes outside those windows."],
            [f"Timezone check: {cal_txt}."]]
    dash = dashboard(rows, day, sh_start, sh_end)
    payload = dict(day=day, head=head, dash=dash, header=header, table=table,
                   breaks_header=["ISA", "Pond", "Gap start", "Gap end", "Gap (min)", "Scheduled (min)", "Unscheduled (min)", "Overlaps", "Check"],
                   breaks=breaks_rows,
                   log=[[day] + row for row in table])
    json.dump(payload, open(d / "sheet_payload.json", "w"), default=str, ensure_ascii=False)
    with open(d / "summary.txt", "w") as f:
        f.write(f"{day}: {len(rows)} rows, {len(breaks_rows)} PB breaks. {cal_txt}\n")
        for row in table:
            if row[-1]:
                f.write(f"- {row[0]} ({row[1]}): {row[-1]}\n")
    write_xlsx(d / f"ISA_Break_Check_{day}.xlsx", payload)
    print(open(d / "summary.txt").read())


def dashboard(rows, day, sh_start, sh_end):
    """Simple view: status + short plain-language note per ISA, plus headline numbers."""
    out = []
    for r in rows:
        has_td, has_pb = bool(r.get("td_first")), bool(r.get("pb_first"))
        notes, level = [], 0          # 0 OK, 1 Review, 2 Action
        if r["isa"] == "(not in assignment)":
            level, notes = 2, [f"Pond used but not assigned to anyone (calls {fmt(r['pb_first'])}–{fmt(r['pb_last'])})"]
        elif not has_td and not has_pb:
            level = -1; notes = ["No Time Doctor time and no pond"]
        else:
            off = r.get("calls_off_td", 0) or 0
            if has_td and off >= 100:
                level = 2; notes.append(f"Time Doctor off at {fmt(r['td_last'])} but calls until {fmt(r['pb_last'])} ({off} calls)")
            elif has_td and (sh_end - r["td_last"]).total_seconds() / 60 >= 60:
                level = 2; notes.append(f"Time Doctor stopped at {fmt(r['td_last'])}")
            if not has_td and has_pb:
                level = 2; notes.append("Calls made but no Time Doctor time")
            if has_td and has_pb and (r["td_last"] - r["pb_last"]).total_seconds() / 60 >= 60:
                level = max(level, 2); notes.append(f"Calls stopped {fmt(r['pb_last'])}, Time Doctor on until {fmt(r['td_last'])}")
            if has_td and not r.get("pond"):
                level = max(level, 1); notes.append("No pond in the day's assignment")
            ex = r.get("pb_unsched", 0) or 0
            if ex >= 60:
                level = max(level, 1); notes.append(f"{round(ex)} min of extra breaks")
            if has_pb and (r["pb_first"] - sh_start).total_seconds() / 60 > 15:
                level = max(level, 1); notes.append(f"First call {fmt(r['pb_first'])}")
            if has_td and (r["td_first"] - sh_start).total_seconds() / 60 > 5:
                level = max(level, 1); notes.append(f"Time Doctor started {fmt(r['td_first'])}")
            if "possible switch" in r["flags"]:
                q = r["flags"].split("possible switch to unassigned ")[1].split(" ")[0]
                notes.append(f"may have moved to {q}")
        status = {2: "Action", 1: "Review", 0: "OK", -1: "No shift"}[level]
        span = lambda a, b: f"{fmt(a)} – {fmt(b)}" if a else "—"
        out.append(dict(level=level, row=[
            "Unassigned" if r["isa"] == "(not in assignment)" else r["isa"], status, r["pond"] or "—",
            span(r.get("td_first"), r.get("td_last")), span(r.get("pb_first"), r.get("pb_last")),
            r.get("calls", "") or "", hmm(r["pb_active"]) if r.get("pb_active") else "",
            round(r["pb_unsched"]) if r.get("pb_unsched") is not None and has_pb else "",
            round(r["tracked_nocalls"]) if r.get("tracked_nocalls") is not None else "",
            "; ".join(notes[:3]) if notes else "On schedule"]))
    order = {2: 0, 1: 1, 0: 2, -1: 3}
    out.sort(key=lambda x: (order[x["level"]], x["row"][0].lower()))
    work = [x for x in rows if x.get("td_first") and x.get("pb_active")]
    kpi = [["ISAs on shift", "Action needed", "To review", "Avg active calling", "Avg extra break"],
           [sum(1 for x in rows if x.get("td_first")), sum(1 for x in out if x["level"] == 2),
            sum(1 for x in out if x["level"] == 1),
            hmm(sum(x["pb_active"] for x in work) / len(work)) if work else "",
            f"{round(sum(x.get('pb_unsched', 0) for x in work) / len(work))} min" if work else ""]]
    nice = dt.date.fromisoformat(day).strftime("%A, %B %-d, %Y")
    return dict(title="ISA Break Check", subtitle=f"{nice}  ·  Pacific time  ·  Shift {fmt(sh_start)} – {fmt(sh_end)}",
                kpi=kpi, header=["ISA", "Status", "Pond", "Time Doctor", "Calling (ProspectBoss)", "Calls",
                                 "Active calling", "Extra break (min)", "Tracked, no calls (min)", "Notes"],
                rows=[x["row"] for x in out])


def write_xlsx(path, P):
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment
    wb = Workbook(); ws = wb.active; ws.title = "ISA Break Check"
    H = Font(name="Arial", bold=True, color="FFFFFF"); HF = PatternFill("solid", fgColor="1F3864")
    for i, (t,) in enumerate(P["head"], 1):
        ws.cell(i, 1, t).font = Font(name="Arial", bold=(i == 1), size=14 if i == 1 else 10)
    r0 = len(P["head"]) + 2
    for j, h in enumerate(P["header"], 1):
        c = ws.cell(r0, j, h); c.font = H; c.fill = HF; c.alignment = Alignment(wrap_text=True)
    for i, row in enumerate(P["table"], r0 + 1):
        for j, v in enumerate(row, 1):
            c = ws.cell(i, j, v); c.font = Font(name="Arial")
            if j == 9 and v != "": c.number_format = "0.0%"
    b = wb.create_sheet("PB Breaks")
    for j, h in enumerate(P["breaks_header"], 1):
        c = b.cell(1, j, h); c.font = H; c.fill = HF
    for i, row in enumerate(P["breaks"], 2):
        for j, v in enumerate(row, 1): b.cell(i, j, v).font = Font(name="Arial")
    for w, col in zip([20, 16, 10, 10, 9, 9, 9, 10, 8, 10, 10, 8, 9, 10, 9, 10, 9, 10, 70], "ABCDEFGHIJKLMNOPQRS"):
        ws.column_dimensions[col].width = w
    wb.save(path)


if __name__ == "__main__":
    main(sys.argv[1])
