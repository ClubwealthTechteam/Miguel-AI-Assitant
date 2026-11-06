# Read-only ProspectBoss fetch. Only login + getAllReports. Never logout/refreshToken/remove/disconnectUsers.
# Usage: python3 pb_fetch.py YYYY-MM-DD  -> data/YYYY-MM-DD/pb.json (time, duration, type, status only)
import json, os, re, sys, urllib.request, urllib.parse, concurrent.futures as cf
BASE="https://app1.prospectboss.com/api"
def ponds(): return ["bpond0%d"%i for i in range(1,26)]
def load_creds(path):
    # pond_creds.json (git-ignored, never commit) holds the logins exactly as the creds sheet's
    # 'Remove From PB'!A6:B30 get_values returns them: {"range":..,"values":[["bpond01","<pw>"],..]}.
    # A plain [[pond, pw], ..] list or a {"bpond01": "<pw>"} map also works.
    j=json.load(open(path))
    if isinstance(j,dict) and "values" in j: j=j["values"]
    if isinstance(j,list): j={r[0].strip():r[1] for r in j if len(r)>=2 and r[0].strip()}
    return j
CREDS=load_creds(os.environ.get("PB_POND_CREDS",os.path.join(os.path.dirname(os.path.abspath(__file__)),"pond_creds.json")))
def pw(p): return CREDS[p]
def req(url, data=None, token=None):
    h={"Content-Type":"application/json","Accept":"application/json"}
    if token: h["Authorization"]="Bearer "+token
    r=urllib.request.Request(url, data=json.dumps(data).encode() if data else None, headers=h, method="POST" if data else "GET")
    with urllib.request.urlopen(r, timeout=60) as f: return json.load(f)
def login(p):
    j=req(BASE+"/login",{"email":p,"password":pw(p)})
    return j["authorisation"]["token"], j["user"]
def calls(p, day):
    tok,user=login(p); out=[]; page=1
    while True:
        q=dict(menu="/reports/call-reports",sourceVal="",tagVal="",callTypeVal="",callGroupVal="",callStatus="",agentId=user["id"],fromDate=day,toDate=day,search="",page=page,count=500,field="id",value="asc",is_export=0,updatedAgentMail="")
        j=req(BASE+"/getAllReports?"+urllib.parse.urlencode(q),token=tok)
        d=j["data"]; out+=d["data"]
        if len(out)>=int(d["count"]) or not d["data"]: break
        page+=1
    return user,out
if __name__=="__main__":
    day=sys.argv[1]; which=sys.argv[2:] or ponds()
    res={}
    with cf.ThreadPoolExecutor(5) as ex:
        for p,(u,c) in zip(which, ex.map(lambda p: calls(p,day), which)):
            gs=u.get("general_settings"); gs=gs if isinstance(gs,str) else json.dumps(gs)
            m=re.search(r'"tz"\s*:\s*"([^"]*)"',gs or "")
            keep=("updated_on","duration","call_type","statusValue")   # no lead names / numbers / emails
            res[p]={"tz":m.group(1) if m else "?","calls":[{k:r.get(k) for k in keep} for r in c]}
    out=os.path.join(os.path.dirname(os.path.abspath(__file__)),"data",day); os.makedirs(out,exist_ok=True)
    json.dump(res,open(os.path.join(out,"pb.json"),"w"))
    print({p:len(v["calls"]) for p,v in res.items()})
