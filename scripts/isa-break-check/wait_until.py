"""Wait until a Pacific clock time, at most 8 minutes per call (tool calls time out at 10).
Usage: python3 wait_until.py 15:30   -> prints READY when the time has come, else WAITING (call again)."""
import sys, time, datetime as dt
from zoneinfo import ZoneInfo
PT = ZoneInfo("America/Los_Angeles")
h, m = map(int, sys.argv[1].split(":"))
now = dt.datetime.now(PT); target = now.replace(hour=h, minute=m, second=0, microsecond=0)
left = (target - now).total_seconds()
if left > 0:
    time.sleep(min(left, 480))
print("READY" if dt.datetime.now(PT) >= target else "WAITING", dt.datetime.now(PT).strftime("%H:%M:%S PT"))
