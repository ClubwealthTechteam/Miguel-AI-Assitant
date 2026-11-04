import json,datetime as dt,sys
F="%Y-%m-%d %I:%M:%S %p"
def load(day):
    d=json.load(open(f"pb_{day}.json")); out={}
    for p,v in d.items():
        ts=sorted(dt.datetime.strptime(r["updated_on"],F) for r in v["calls"])
        out[p]=ts
    return out
def gaps(ts,mins=10):
    return [(a,b,(b-a).total_seconds()/60) for a,b in zip(ts,ts[1:]) if (b-a).total_seconds()>=mins*60]
if __name__=="__main__":
    for p,ts in load(sys.argv[1]).items():
        g=gaps(ts)
        print(p.ljust(9),len(ts),ts[0].strftime("%H:%M"),ts[-1].strftime("%H:%M"),"|"," ".join(f"{a:%H:%M}-{b:%H:%M}({m:.0f})" for a,b,m in g))
