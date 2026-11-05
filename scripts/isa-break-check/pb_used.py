"""Read ProspectBoss "CALLS USED" (Today's calling capacity) for every pond, for TODAY only.
Read-only: login + viewCallingGroups (one id) + getDiallingCount, the GETs the calling screen makes on load.
Never calls logout/refreshToken/remove/disconnectUsers.
Usage: python3 pb_used.py DAY   (DAY must be today in America/Los_Angeles) -> data/DAY/pb_used.json {"bpond01": 790, ...}"""
import json, os, sys, urllib.parse, datetime as dt, concurrent.futures as cf
from zoneinfo import ZoneInfo
import pb_fetch as P

def used(p):
    tok, _ = P.login(p)
    q = dict(menu="/contacts/my-campaigns", page=1, fromDate="", toDate="", count=1, field="id", value="desc", search="", status="", agents="")
    g = P.req(P.BASE + "/viewCallingGroups?" + urllib.parse.urlencode(q), token=tok)["data"]["data"]
    if not g:
        return 0
    d = P.req(P.BASE + f"/getDiallingCount/{g[0]['id']}", token=tok)["data"]
    return int(d.get("total_daily_usage") or 0)

if __name__ == "__main__":
    day = sys.argv[1]
    today = dt.datetime.now(ZoneInfo("America/Los_Angeles")).date().isoformat()
    if day != today:
        raise SystemExit(f"Calls used is only available for today ({today}), not {day}.")
    res = {}
    with cf.ThreadPoolExecutor(5) as ex:
        for p, n in zip(P.ponds(), ex.map(used, P.ponds())):
            res[p] = n
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", day)
    os.makedirs(out, exist_ok=True)
    json.dump(res, open(os.path.join(out, "pb_used.json"), "w"))
    print(res)
