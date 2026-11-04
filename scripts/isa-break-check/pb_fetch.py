# Read-only ProspectBoss fetch. Only login + getAllReports. Never logout/refresh/remove.
import json, os, sys, urllib.request, urllib.parse, concurrent.futures as cf
BASE="https://app1.prospectboss.com/api"
def ponds(): return ["bpond0%d"%i for i in range(1,26)]
CREDS=json.load(open(os.environ.get("PB_POND_CREDS","pond_creds.json")))  # {"bpond01":"<pw>",...}; never commit
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
            res[p]={"user":{k:u.get(k) for k in ("id","name","first_name","last_name","timezone")},"calls":c}
    json.dump(res,open(f"pb_{day}.json","w"))
    print({p:len(v["calls"]) for p,v in res.items()})
