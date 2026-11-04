"""Print the Google Sheets writes for one day's report, as JSON:
{"clear": [...ranges], "updates": [{"range", "values"}], "append": {"range", "values"}}
The daily routine runs: batch_clear_values(clear) -> update_values(each update) -> append_values(append).
Layout of tab 'ISA Break Check' (formatting is set once, only values change):
  A1:A4 title + notes · row 6 table header · rows 7-46 one row per ISA (max 40)
  A48 breaks title · row 49 breaks header · rows 50-450 ProspectBoss breaks
Tab 'ISA Break Check Log' gets one row per ISA per day appended (column A = shift date)."""
import json, sys
from pathlib import Path
day = sys.argv[1]
P = json.load(open(Path(__file__).parent / "data" / day / "sheet_payload.json"))
T = "'ISA Break Check'"
assert len(P["table"]) <= 40 and len(P["breaks"]) <= 401
out = {
    "clear": [f"{T}!A1:S460"],
    "updates": [
        {"range": f"{T}!A1:A4", "values": P["head"]},
        {"range": f"{T}!A6:S6", "values": [P["header"]]},
        {"range": f"{T}!A7:S{6 + len(P['table'])}", "values": P["table"]},
        {"range": f"{T}!A48:A48", "values": [["PROSPECTBOSS BREAKS — every gap of 10+ min between calls (times Pacific). 'Check' = 10+ unscheduled minutes."]]},
        {"range": f"{T}!A49:I49", "values": [P["breaks_header"]]},
    ] + ([{"range": f"{T}!A50:I{49 + len(P['breaks'])}", "values": P["breaks"]}] if P["breaks"] else []),
    "append": {"range": "'ISA Break Check Log'!A1:T1", "values": P["log"]},
}
print(json.dumps(out, ensure_ascii=False))
