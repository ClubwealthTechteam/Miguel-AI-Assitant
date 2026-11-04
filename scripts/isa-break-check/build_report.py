import json, datetime as dt, re, sys
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter as L
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.comments import Comment

DAY="2026-11-03"; D=dt.datetime(2026,11,3)
F="%Y-%m-%d %I:%M:%S %p"
exec(open("td_2026-11-03.py").read())
raw=json.load(open(f"pb_{DAY}.json"))
TZ={'bpond01':-7,'bpond021':-7}           # pond tz settings read from PB general_settings; all others -5:00
SQUAD={"Rod Velasco":"Breakout #6 – Shayne","Aaevah Akpan":"Breakout #3 – Aaevah","Christina Labadia":"Breakout #5 – Jeriza","Lily Delantes":"Breakout #5 – Jeriza","Ruth Lagahit":"Breakout #3 – Aaevah","Mark Abarcar":"Breakout #4 (Newbies) – Mark","Emie Esclamado":"Breakout #3 – Aaevah","Jam David":"Breakout #6 – Shayne","Jonalisa Caponpon":"Breakout #3 – Aaevah","Melchan Portugal":"Breakout #5 – Jeriza","Rome Flores":"Breakout #6 – Shayne","Hazel Bonayon":"Breakout #4 (Newbies) – Mark","Jeff Napisa":"Breakout #4 (Newbies) – Mark","Jeriza Trasmil":"Breakout #5 – Jeriza","Ejay Melano":"Breakout #4 (Newbies) – Mark","Katrina Buan":"Breakout #6 – Shayne","Lolita Esma":"Breakout #3 – Aaevah","Shayne Balmes":"Breakout #6 – Shayne","Dave Tamparong":"Breakout #5 – Jeriza","Alleah Galam":"Breakout #5 – Jeriza","Gabriel Garin":"Breakout #6 – Shayne","L.A Patulan":"Breakout #4 (Newbies) – Mark","RJ Torsiende":"Breakout #3 – Aaevah","Brian Ceniza":"Breakout #4 (Newbies) – Mark"}
def to_et(p,x): return x+dt.timedelta(hours=(-5-TZ.get(p,-5))+1)
def tm(x): return x.time()
def hm(s): h,m=map(int,s.split(":")); return D.replace(hour=h,minute=m)
STATUS_NOTE="statusValue is ProspectBoss's numeric call-status code (not decoded)."

# scheduled windows (ET) — defaults, inferred from TD worklogs + team-wide PB gaps
WIN=[("Huddle / team no-call block","10:20","11:20"),("Break 1","11:30","11:40"),("Lunch","13:30","14:00"),("Break 2","15:30","15:40")]

# ---------- PB per pond
ponds=[f"bpond0{i}" for i in range(1,26)]
PB={}
for p in ponds:
    cs=sorted(raw[p]["calls"],key=lambda r:dt.datetime.strptime(r["updated_on"],F))
    ts=[to_et(p,dt.datetime.strptime(r["updated_on"],F)) for r in cs]
    # stray calls: a cluster of <=3 calls separated from the rest by >=120 min at the start or end of the day
    lo,hi=0,len(ts)
    for k in range(1,4):
        if hi-k>0 and (ts[hi-k]-ts[hi-k-1]).total_seconds()>=7200: hi=hi-k; break
    for k in range(1,4):
        if lo+k<hi and (ts[lo+k]-ts[lo+k-1]).total_seconds()>=7200: lo=lo+k; break
    main=ts[lo:hi]; strays=ts[:lo]+ts[hi:]
    gaps=[(a,b) for a,b in zip(main,main[1:]) if (b-a).total_seconds()>=600]
    PB[p]=dict(calls=cs,ts=ts,main=main,strays=strays,gaps=gaps,inbound=sum(1 for r in cs[lo:hi] if r["call_type"]=="Inbound"))

# ---------- TD per ISA
ISAS=list(WL.keys())+["Jonalisa Caponpon"]
def segs(u,kind="work"):
    return [(hm(a),hm(b)) for a,b,k in WL.get(u,[]) if (k!="B")==(kind=="work")]
def inter(A,B):
    out=0
    for a1,a2 in A:
        for b1,b2 in B:
            out+=max(0,(min(a2,b2)-max(a1,b1)).total_seconds())
    return out/60
def nocall(p):
    m=PB[p]["main"]; lo=D.replace(hour=0); hi=D.replace(hour=23,minute=59)
    return [(lo,m[0])]+PB[p]["gaps"]+[(m[-1],hi)]
def minus_windows(iv):
    out=[]
    for a,b in iv:
        pieces=[(a,b)]
        for _,s,e in WIN:
            s,e=hm(s),hm(e); new=[]
            for x,y in pieces:
                if y<=s or x>=e: new.append((x,y))
                else:
                    if x<s: new.append((x,s))
                    if y>e: new.append((e,y))
            pieces=new
        out+=pieces
    return out

# ---------- workbook
wb=Workbook()
AR=Font(name="Arial",size=10); B=Font(name="Arial",size=10,bold=True); H=Font(name="Arial",size=10,bold=True,color="FFFFFF")
HF=PatternFill("solid",fgColor="1F3864"); YEL=PatternFill("solid",fgColor="FFFF00"); BLUE=Font(name="Arial",size=10,color="0000FF")
GRN=Font(name="Arial",size=10,color="008000"); TITLE=Font(name="Arial",size=14,bold=True)
TF="h:mm AM/PM"; MF="0"; HMF="[h]:mm"
def header(ws,row,cols,widths=None):
    for i,c in enumerate(cols,1):
        x=ws.cell(row,i,c); x.font=H; x.fill=HF; x.alignment=Alignment(wrap_text=True,vertical="center")
    ws.row_dimensions[row].height=42
    if widths:
        for i,w in enumerate(widths,1): ws.column_dimensions[L(i)].width=w
    ws.freeze_panes=ws.cell(row+1,2)
def fontall(ws):
    for r in ws.iter_rows():
        for c in r:
            if c.font is None or c.font.name!="Arial": c.font=Font(name="Arial",size=c.font.size or 10,bold=c.font.bold,color=c.font.color)

# Read Me
rm=wb.active; rm.title="Read Me"
# Settings
st=wb.create_sheet("Settings")
st["A1"]="Settings (yellow = edit me; flags on every sheet recalculate)"; st["A1"].font=TITLE
rows=[("Shift start (ET)",dt.time(8,30),TF,"Inferred: 22 of 24 ISAs start tracking 8:27–8:32 AM ET in Time Doctor. Confirm with Miguel."),
("Shift end (ET)",dt.time(18,0),TF,"Inferred: most ISAs stop tracking 6:00–6:03 PM ET. Confirm with Miguel."),
("PB late-start grace (min)",15,MF,"First call later than shift start + this is flagged. Allows for login / first dial."),
("PB early-end grace (min)",15,MF,"Last call earlier than shift end − this is flagged."),
("TD late-start grace (min)",5,MF,"First Time Doctor tracking later than shift start + this is flagged."),
("TD early-end grace (min)",5,MF,"Last Time Doctor tracking earlier than shift end − this is flagged."),
("Break allowance (min)",10,MF,"Time Doctor break type '10 Minute Break'. Each logged Break longer than allowance + tolerance is flagged."),
("Break tolerance (min)",1,MF,"Worklog is to the minute."),
("Lunch allowance (min)",30,MF,"Inferred from TD (1:30–2:00 PM ET untracked for nearly everyone). Confirm with Miguel."),
("Unscheduled no-call flag (min)",10,MF,"A ProspectBoss gap is flagged when its minutes OUTSIDE the scheduled windows below reach this."),
("Gap threshold for a 'break' (min)",10,MF,"Fixed in the data pull (Gary's method). Changing it here does NOT re-cut the gaps; rerun the script."),]
header(st,3,["Setting","Value","Note"],[34,14,110]); st.freeze_panes=None
for i,(a,v,fmt,n) in enumerate(rows,4):
    st.cell(i,1,a).font=AR; c=st.cell(i,2,v); c.font=BLUE; c.fill=YEL; c.number_format=fmt; st.cell(i,3,n).font=AR
S={k:f"Settings!$B${i}" for i,k in enumerate(["start","end","pblate","pbearly","tdlate","tdearly","brk","tol","lunch","unsched","gap"],4)}
r0=4+len(rows)+1
st.cell(r0,1,"Scheduled windows (ET)").font=B
header(st,r0+1,["Window","Start","End","Note"]); st.freeze_panes=None; st.column_dimensions["D"].width=90
WROW={}
notes={"Huddle / team no-call block":"Every pond stops calling ~10:20 and resumes ~11:20 ET while Time Doctor keeps tracking 'Work'. Probably the huddle. Confirm.",
"Break 1":"Time Doctor 'Break' task 11:30–11:40 ET for the whole team.","Lunch":"Untracked in Time Doctor 1:30–2:00 PM ET for the whole team.","Break 2":"Time Doctor 'Break' task 3:30–3:40 PM ET for the whole team."}
for i,(n,a,b) in enumerate(WIN,r0+2):
    st.cell(i,1,n).font=AR
    for j,v in ((2,a),(3,b)):
        c=st.cell(i,j,hm(v).time()); c.number_format=TF; c.font=BLUE; c.fill=YEL
    st.cell(i,4,notes[n]).font=AR; WROW[n]=i
st.cell(r0+7,1,"Note: the 'Tracked, no calls' matrices were cut in Python with these default windows; edit the windows and the pond-break and flag columns update, but rerun the script to refresh the matrices.").font=Font(name="Arial",size=9,italic=True)

# Pond Breaks
pbk=wb.create_sheet("PB Breaks")
cols=["Pond","Gap start (ET)","Gap end (ET)","Gap (min)"]+[f"In {n} (min)" for n,_,_ in WIN]+["Scheduled (min)","Unscheduled (min)","Flag"]
header(pbk,1,cols,[10,12,12,9,14,12,12,12,12,13,10])
r=2
for p in ponds:
    for a,b in PB[p]["gaps"]:
        pbk.cell(r,1,p); pbk.cell(r,2,a.time()).number_format=TF; pbk.cell(r,3,b.time()).number_format=TF
        pbk.cell(r,4,f"=ROUND((C{r}-B{r})*1440,1)").number_format="0.0"
        for j,(n,_,_) in enumerate(WIN):
            w=WROW[n]; pbk.cell(r,5+j,f"=ROUND(MAX(0,MIN(C{r},Settings!$C${w})-MAX(B{r},Settings!$B${w}))*1440,1)").number_format="0.0"
        pbk.cell(r,9,f"=SUM(E{r}:H{r})").number_format="0.0"
        pbk.cell(r,10,f"=D{r}-I{r}").number_format="0.0"
        pbk.cell(r,11,f'=IF(J{r}>={S["unsched"]},"Check","")')
        r+=1
NB=r-1; pbk.auto_filter.ref=f"A1:K{NB}"

# Pond Summary
ps=wb.create_sheet("PB by Pond",1)
cols=["Pond","PB timezone setting","First call (ET)","Last call (ET)","Calls","Inbound","Stray calls left out","Stray call times (ET)","Logged-in (min)","Breaks ≥10 min (#)","Total break (min)","…in scheduled windows (min)","…unscheduled (min)","Active (min)","Active (h:mm)","Late start (min)","Early end (min)","Flags"]
header(ps,1,cols,[10,10,11,11,7,8,9,14,10,9,10,11,11,9,9,9,9,46])
for i,p in enumerate(ponds,2):
    d=PB[p]
    ps.cell(i,1,p); ps.cell(i,2,"UTC%+d:00"%TZ.get(p,-5))
    ps.cell(i,3,d["main"][0].time()).number_format=TF; ps.cell(i,4,d["main"][-1].time()).number_format=TF
    ps.cell(i,5,len(d["main"])); ps.cell(i,6,d["inbound"]); ps.cell(i,7,len(d["strays"]))
    ps.cell(i,8,", ".join(x.strftime("%-I:%M %p") for x in d["strays"]))
    ps.cell(i,9,f"=ROUND((D{i}-C{i})*1440,1)").number_format="0.0"
    ps.cell(i,10,f"=COUNTIF('PB Breaks'!$A$2:$A${NB},A{i})")
    ps.cell(i,11,f"=SUMIF('PB Breaks'!$A$2:$A${NB},A{i},'PB Breaks'!$D$2:$D${NB})").number_format="0.0"
    ps.cell(i,12,f"=SUMIF('PB Breaks'!$A$2:$A${NB},A{i},'PB Breaks'!$I$2:$I${NB})").number_format="0.0"
    ps.cell(i,13,f"=SUMIF('PB Breaks'!$A$2:$A${NB},A{i},'PB Breaks'!$J$2:$J${NB})").number_format="0.0"
    ps.cell(i,14,f"=I{i}-K{i}").number_format="0.0"
    ps.cell(i,15,f"=N{i}/1440").number_format=HMF
    ps.cell(i,16,f"=ROUND(MAX(0,(C{i}-{S['start']})*1440),0)")
    ps.cell(i,17,f"=ROUND(MAX(0,({S['end']}-D{i})*1440),0)")
    ps.cell(i,18,f'=IF(P{i}>{S["pblate"]},"Late start; ","")&IF(Q{i}>{S["pbearly"]},"Early end; ","")'
                 f'&IF(COUNTIFS(\'PB Breaks\'!$A$2:$A${NB},A{i},\'PB Breaks\'!$K$2:$K${NB},"Check")>0,COUNTIFS(\'PB Breaks\'!$A$2:$A${NB},A{i},\'PB Breaks\'!$K$2:$K${NB},"Check")&" unscheduled gap(s); ","")'
                 f'&IF(G{i}>0,"Stray call(s) left out; ","")')
ps.cell(2,8).comment=Comment("Stray = up to 3 calls separated from the rest of the day by 2h+. Left out of first/last call and breaks so they don't create a fake multi-hour break.","Claude")

# TD by ISA
td=wb.create_sheet("TD by ISA",2)
cols=["ISA (Time Doctor)","Squad","First tracked (ET)","Last tracked (ET)","Tracked (h:mm)","Breaks logged (#)","Break time (min)","Longest break (min)","Untracked gaps in day (min)","Longest untracked gap (min)","Manual time (min)","Idle minutes","Idle % (TD Idle Minutes %)","Late start (min)","Early end (min)","Flags"]
header(td,1,cols,[20,24,11,11,9,8,9,9,10,10,9,8,10,8,8,52])
for i,u in enumerate(ISAS,2):
    w=WL.get(u,[]); tr,tot,idles,idlem,man=TS[u]
    td.cell(i,1,u); td.cell(i,2,SQUAD.get(u,""))
    if w:
        allseg=sorted((hm(a),hm(b),k) for a,b,k in w)
        td.cell(i,3,allseg[0][0].time()).number_format=TF; td.cell(i,4,max(s[1] for s in allseg).time()).number_format=TF
        br=[(b-a).total_seconds()/60 for a,b,k in allseg if k=="B"]
        gaps=[(b[0]-a[1]).total_seconds()/60 for a,b in zip(allseg,allseg[1:]) if b[0]>a[1]]
        td.cell(i,6,len(br)); td.cell(i,7,sum(br)); td.cell(i,8,max(br) if br else 0)
        td.cell(i,9,sum(gaps)); td.cell(i,10,max(gaps) if gaps else 0)
    td.cell(i,5,tr/86400).number_format=HMF
    td.cell(i,11,round(man/60)); td.cell(i,12,idlem)
    td.cell(i,13,(idlem/(tot//60)) if tot else None).number_format="0.0%"
    if w:
        td.cell(i,14,f"=ROUND(MAX(0,(C{i}-{S['start']})*1440),0)"); td.cell(i,15,f"=ROUND(MAX(0,({S['end']}-D{i})*1440),0)")
        td.cell(i,16,f'=IF(N{i}>{S["tdlate"]},"Late start; ","")&IF(O{i}>{S["tdearly"]},"Early end; ","")&IF(H{i}>{S["brk"]}+{S["tol"]},"Break over allowance; ","")'
                     f'&IF(J{i}>{S["lunch"]}+{S["tol"]},"Untracked gap over lunch allowance; ","")&IF(K{i}>G{i}+30,"Manual time beyond breaks; ","")')
    else:
        td.cell(i,16,"No time tracked on this day")
td.cell(1,13).comment=Comment("Idle minutes / computer minutes (Time Doctor Activity Summary 'Idle Minutes %'). Time on a dialer call with no keyboard/mouse use can count as idle, so treat it as a signal only.","Claude")
td.cell(1,11).comment=Comment("Manual time includes the Break entries (logged as manual). Large manual time beyond that means hand-added work time.","Claude")
NT=len(ISAS)+1

# TD segments
ts=wb.create_sheet("TD Worklog")
header(ts,1,["ISA","Start (ET)","End (ET)","Minutes","Task"],[20,11,11,9,10])
r=2
for u in WL:
    for a,b,k in WL[u]:
        ts.cell(r,1,u); ts.cell(r,2,hm(a).time()).number_format=TF; ts.cell(r,3,hm(b).time()).number_format=TF
        ts.cell(r,4,f"=ROUND((C{r}-B{r})*1440,0)"); ts.cell(r,5,{"W":"Work","B":"Break","M":"Work (manual entry)"}[k]); r+=1

# Matrices
def matrix(name,fn,note):
    m=wb.create_sheet(name)
    m.cell(1,1,note).font=Font(name="Arial",size=9,italic=True)
    m.cell(2,1,"Pond \\ ISA").font=H; m.cell(2,1).fill=HF
    tdu=[u for u in ISAS if u in WL]
    for j,u in enumerate(tdu,2):
        c=m.cell(2,j,u); c.font=H; c.fill=HF; c.alignment=Alignment(text_rotation=90); m.column_dimensions[L(j)].width=5
    m.row_dimensions[2].height=110; m.column_dimensions["A"].width=11
    for i,p in enumerate(ponds,3):
        m.cell(i,1,p).font=B
        for j,u in enumerate(tdu,2): m.cell(i,j,round(fn(p,u)))
    m.freeze_panes="B3"
    return len(tdu)+1
nc=matrix("NoCall All",lambda p,u: inter(segs(u),nocall(p)),"Minutes the ISA was tracking WORK in Time Doctor while this pond had no calls (before first call, gaps of 10+ min, after last call). Includes the huddle block and the wind-down around breaks/lunch.")
matrix("NoCall Unscheduled",lambda p,u: inter(segs(u),minus_windows(nocall(p))),"Same as 'NoCall All' but leaving out the scheduled windows on the Settings sheet (default windows; rerun to refresh).")

# Mapping
mp=wb.create_sheet("Pond to ISA",1)
mp["A1"]="Pond → ISA for "+DAY; mp["A1"].font=TITLE
mp["A2"]="Fill the yellow cells (pick from the list). ProspectBoss records only the pond, not the person, and the team's Time Doctor timelines are too alike to match automatically. Once filled, the 'Comparison' sheet fills itself."
mp["A2"].alignment=Alignment(wrap_text=True); mp.merge_cells("A2:D2"); mp.row_dimensions[2].height=44
header(mp,4,["Pond","ISA","Note (e.g. switched pond at 1 PM)","PB calls"],[11,24,48,9]); mp.freeze_panes="A5"
dv=DataValidation(type="list",formula1=f"='TD by ISA'!$A$2:$A${NT}",allow_blank=True); mp.add_data_validation(dv)
for i,p in enumerate(ponds,5):
    mp.cell(i,1,p); c=mp.cell(i,2); c.fill=YEL; c.font=BLUE; dv.add(c)
    mp.cell(i,4,f"=INDEX('PB by Pond'!$E$2:$E$26,MATCH(A{i},'PB by Pond'!$A$2:$A$26,0))")
    note={"bpond09":"Calls only from 11:09 AM ET","bpond011":"Calls only from 1:16 PM ET","bpond014":"Calls stop 12:50 PM ET","bpond016":"Calls stop 1:09 PM ET","bpond017":"Calls stop 2:48 PM ET","bpond021":"Calls stop 2:44 PM ET (+1 stray 7:49 PM)"}.get(p,"")
    mp.cell(i,3,note).font=Font(name="Arial",size=10,italic=True,color="808080")

# Comparison
cp=wb.create_sheet("Comparison",1)
cols=["Pond","ISA (from Pond to ISA)","PB first call","TD first tracked","Calls started after TD start (min)","PB last call","TD last tracked","TD kept tracking after last call (min)","PB active (h:mm)","TD tracked (h:mm)","TD tracked − PB active (h:mm)","Tracked, no calls — all (min)","Tracked, no calls — outside scheduled windows (min)","PB unscheduled break (min)","Flags"]
header(cp,1,cols,[10,20,10,10,11,10,10,11,9,9,10,10,12,11,50])
for i,p in enumerate(ponds,2):
    m=i+3
    cp.cell(i,1,p).font=AR
    cp.cell(i,2,f"=IF('Pond to ISA'!B{m}=\"\",\"\",'Pond to ISA'!B{m})").font=GRN
    pm=f"MATCH($A{i},'PB by Pond'!$A$2:$A$26,0)"; tm_=f"MATCH($B{i},'TD by ISA'!$A$2:$A${NT},0)"
    cp.cell(i,3,f"=INDEX('PB by Pond'!$C$2:$C$26,{pm})").number_format=TF
    cp.cell(i,6,f"=INDEX('PB by Pond'!$D$2:$D$26,{pm})").number_format=TF
    cp.cell(i,9,f"=INDEX('PB by Pond'!$O$2:$O$26,{pm})").number_format=HMF
    cp.cell(i,14,f"=INDEX('PB by Pond'!$M$2:$M$26,{pm})").number_format="0"
    cp.cell(i,4,f'=IF($B{i}="","",IFERROR(INDEX(\'TD by ISA\'!$C$2:$C${NT},{tm_})*1,"no TD time"))').number_format=TF
    cp.cell(i,7,f'=IF($B{i}="","",IFERROR(INDEX(\'TD by ISA\'!$D$2:$D${NT},{tm_})*1,"no TD time"))').number_format=TF
    cp.cell(i,10,f'=IF($B{i}="","",INDEX(\'TD by ISA\'!$E$2:$E${NT},{tm_}))').number_format=HMF
    cp.cell(i,5,f'=IF(ISNUMBER(D{i}),ROUND((C{i}-D{i})*1440,0),"")')
    cp.cell(i,8,f'=IF(ISNUMBER(G{i}),ROUND((G{i}-F{i})*1440,0),"")')
    cp.cell(i,11,f'=IF(ISNUMBER(J{i}),J{i}-I{i},"")').number_format=HMF
    for col,sh in ((12,"NoCall All"),(13,"NoCall Unscheduled")):
        cp.cell(i,col,f"=IF($B{i}=\"\",\"\",IFERROR(INDEX('{sh}'!$B$3:${L(nc)}$27,MATCH($A{i},'{sh}'!$A$3:$A$27,0),MATCH($B{i},'{sh}'!$B$2:${L(nc)}$2,0)),\"\"))")
    cp.cell(i,15,f'=IF($B{i}="","Map pond to ISA first",IF(ISNUMBER(E{i}),IF(E{i}>15,"Calls started "&E{i}&" min after TD start; ",""),"")&IF(ISNUMBER(H{i}),IF(H{i}>15,"TD tracked "&H{i}&" min after last call; ",""),"")&IF(ISNUMBER(M{i}),IF(M{i}>=30,M{i}&" min tracked with no calls outside schedule; ",""),"")&IF(N{i}>={S["unsched"]},"Unscheduled PB breaks; ",""))')
cp["A28"]="Thresholds in this sheet's Flags: 15 min start/end difference, 30 min tracked-without-calls outside the schedule, and the Settings 'Unscheduled no-call flag'."
cp["A28"].font=Font(name="Arial",size=9,italic=True)

# PB calls raw (no names/phones/emails)
pc=wb.create_sheet("PB Calls")
header(pc,1,["Pond","Time (ET)","Time as shown in ProspectBoss","Call type","statusValue","Duration (s)","Stray"],[10,11,22,10,10,10,7])
r=2
for p in ponds:
    sset=set(PB[p]["strays"])
    for rec,x in sorted(zip(PB[p]["calls"],PB[p]["ts"]),key=lambda z:z[1]):
        pc.cell(r,1,p); pc.cell(r,2,x.time()).number_format="h:mm:ss AM/PM"; pc.cell(r,3,rec["updated_on"])
        pc.cell(r,4,rec["call_type"]); pc.cell(r,5,rec["statusValue"]); pc.cell(r,6,int(rec["duration"]) if rec["duration"] else None)
        pc.cell(r,7,"yes" if x in sset else ""); r+=1
pc.auto_filter.ref=f"A1:G{r-1}"; pc.cell(1,5).comment=Comment(STATUS_NOTE,"Claude")

# Read Me text
lines=[("ISA break check — ProspectBoss calls vs Time Doctor, Tue "+DAY,TITLE),
("Read-only pull on 2026-11-04. Nothing was changed in ProspectBoss or Time Doctor. No names of leads, emails or phone numbers are included.",AR),
("",AR),("TIMEZONE",B),
("All times are US Eastern (ET, UTC−5 on Nov 3). Time Doctor was queried in America/New_York.",AR),
("ProspectBoss shows each pond's calls in that pond's own timezone setting: 23 ponds are set to '-5:00', bpond01 and bpond021 to '-7:00' (so they look 2 h earlier).",AR),
("Checked against Time Doctor: ProspectBoss '-5:00' times are 1 hour behind ET (effectively UTC−6). With +1 h, only 60 of 15,538 calls fall inside the team's Time Doctor break/lunch windows; with 0 h it is 1,750. So: ET = PB time + 1 h ('-5:00' ponds) or + 3 h ('-7:00' ponds).",AR),
("",AR),("METHOD (matches Gary's report, full version)",B),
("Calls per pond sorted by time. Logged-in = first call → last call. Break = any gap of 10+ min between two calls. Active = logged-in − breaks.",AR),
("Stray calls (≤3 calls 2h+ away from the rest of the day) are left out of first/last call and breaks: bpond08 (10:34 PM ET) and bpond021 (7:49 PM ET).",AR),
("Each break is split into minutes inside the scheduled windows (Settings) and unscheduled minutes. 'Check' = 10+ unscheduled minutes in one gap.",AR),
("Time Doctor: first/last tracked, tracked time, Breaks (logged as a 'Break' task, ~10 min at 11:30 AM and 3:30 PM), untracked gaps (lunch), idle minutes.",AR),
("",AR),("SHEETS",B),
("Comparison — one row per pond; fills in once 'Pond to ISA' is filled. Differences and flags per ISA.",AR),
("Pond to ISA — yellow cells to fill (ProspectBoss has no ISA name on calls).",AR),
("PB by Pond · PB Breaks · PB Calls — ProspectBoss side.   TD by ISA · TD Worklog — Time Doctor side.",AR),
("NoCall All / NoCall Unscheduled — pond × ISA minutes tracked in TD while the pond made no calls; used by Comparison.",AR),
("Settings — shift, allowances, grace periods and scheduled windows (yellow). Flags recalculate.",AR),
("",AR),("WHAT NOV 3 SHOWS (before mapping)",B),
("Team schedule in Time Doctor: start ~8:28 AM, Break 11:30–11:40, lunch 1:30–2:00 (untracked), Break 3:30–3:40, end ~6:00 PM ET.",AR),
("Every pond stops calling ~10:20–11:20 AM ET while Time Doctor tracks 'Work' (probably the huddle). Around the 10-min breaks, calling usually stops ~11:22 and restarts ~11:45, i.e. ~20–25 min without calls for a 10-min break; lunch gap is usually ~1:20–2:02 PM.",AR),
("Calling ends ~5:35–5:50 PM ET on most ponds, ~10–25 min before Time Doctor stops.",AR),
("Six ponds are used for only part of the day (bpond09, 011, 014, 016, 017, 021) — likely ISAs switching ponds; the mapping may need a time split for those.",AR),
("Time Doctor: Melchan Portugal tracked only 8:28–9:33 AM, Lolita Esma 8:32 AM–1:03 PM, Jonalisa Caponpon no time. Rod Velasco has 1h50m of manually entered work (11:40 AM–1:30 PM).",AR),
("Idle % in Time Doctor is high across the team; dialer calls without keyboard use count as idle, so it is a signal, not proof.",AR),
("",AR),("OPEN QUESTIONS FOR MIGUEL",B),
("1. Which ISA used which pond on Nov 3 (and does it change by day or mid-shift)?",AR),
("2. Official schedule: shift start/end, break and lunch times and allowed lengths; is 10:20–11:20 AM ET the huddle?",AR),
("3. Which timezone should the report use (ET as here, or Manila / Pacific)?",AR),
("4. Output: Excel per day, Slack post, or a daily routine? Nothing posted to Slack yet.",AR)]
for i,(t,f) in enumerate(lines,1):
    c=rm.cell(i,1,t); c.font=f; c.alignment=Alignment(wrap_text=True,vertical="top")
rm.column_dimensions["A"].width=150
for ws in wb.worksheets:
    for row in ws.iter_rows():
        for c in row:
            f=c.font
            if f.name!="Arial": c.font=Font(name="Arial",size=f.size or 10,bold=f.bold,italic=f.italic,color=f.color)
out=sys.argv[1]; wb.save(out); print("saved",out)
