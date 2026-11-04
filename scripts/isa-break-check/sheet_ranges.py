"""Print the Google Sheets writes for one day's report as JSON:
{"clear": [...], "updates": [{"range","values"}], "append": {"range","values"}}
Daily routine: batch_clear_values(clear) -> update_values(each update) -> append_values(append).
Tab 'ISA Break Check' (dashboard; formatting fixed, only values change):
  A1 title · A2 subtitle · row 4 KPI labels / row 5 KPI values in A,C,E,G,I (merged pairs)
  row 8 table header · rows 9-48 one row per ISA (max 40) · A50:A53 how-to-read notes
Tab 'ISA Break Details': row 1 header, rows 2+ every ProspectBoss gap of 10+ min.
Tab 'ISA Break Check Log': one detailed row per ISA per day appended (column A = shift date)."""
import json, sys
from pathlib import Path
day = sys.argv[1]
P = json.load(open(Path(__file__).parent / "data" / day / "sheet_payload.json"))
D = P["dash"]; T = "'ISA Break Check'"; B = "'ISA Break Details'"
assert len(D["rows"]) <= 40 and len(P["breaks"]) <= 600
k = D["kpi"]
spread = lambda vals: [v for x in vals for v in (x, "")][:-1]   # A,C,E,G,I
out = {
    "clear": [f"{T}!A1:J5", f"{T}!A9:J48", f"{B}!A2:I700"],
    "updates": [
        {"range": f"{T}!A1:A2", "values": [[D["title"]], [D["subtitle"]]]},
        {"range": f"{T}!A4:I5", "values": [spread(k[0]), spread(k[1])]},
        {"range": f"{T}!A8:J8", "values": [D["header"]]},
        {"range": f"{T}!A9:J{8 + len(D['rows'])}", "values": D["rows"]},
        {"range": f"{B}!A1:I1", "values": [P["breaks_header"]]},
    ] + ([{"range": f"{B}!A2:I{1 + len(P['breaks'])}", "values": P["breaks"]}] if P["breaks"] else []),
    "append": {"range": "'ISA Break Check Log'!A1:T1", "values": P["log"]},
}
print(json.dumps(out, ensure_ascii=False))
