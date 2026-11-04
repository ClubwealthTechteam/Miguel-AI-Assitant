"""Print the Google Sheets writes for one day's report as JSON:
{"day": ..., "append": [{"range", "values"}, ...]}
The dashboard tabs ('ISA Break Check', 'ISA Break Details') are formulas over the two log tabs, so the
daily run only APPENDS. Before appending, read 'ISA Break Check Log'!A:A and skip if the day is already
there (no duplicates).
  'ISA Break Check Log'   A Shift date · B ISA · C Status · D Pond · E Time Doctor · F Calling · G Calls ·
                          H Active calling · I Extra break (min) · J Tracked, no calls (min) · K Notes · L Sort
  'ISA Break Details Log' A Shift date · B ISA · C Pond · D Gap start · E Gap end · F Gap · G Scheduled ·
                          H Unscheduled · I Overlaps · J Check
Usage: python3 sheet_ranges.py DAY [--log-only]"""
import json, sys
from pathlib import Path
day = sys.argv[1]
P = json.load(open(Path(__file__).parent / "data" / day / "sheet_payload.json"))
out = {"day": day, "append": [{"range": "'ISA Break Check Log'!A1:L1", "values": P["log"]}]}
if "--log-only" not in sys.argv and P.get("breaks_log"):
    out["append"].append({"range": "'ISA Break Details Log'!A1:J1", "values": P["breaks_log"]})
print(json.dumps(out, ensure_ascii=False))
