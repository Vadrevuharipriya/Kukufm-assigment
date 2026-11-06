from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import re

app=FastAPI(title="StoryBridge API",version="0.1.0")
app.add_middleware(CORSMiddleware,allow_origins=["*"],allow_methods=["*"],allow_headers=["*"])

class Request(BaseModel):
    show_name:str="Untitled show"
    previous_episode:str=Field(min_length=20,max_length=30000)
    next_episode:str=Field(min_length=20,max_length=30000)

CONTRASTS=[
(r"\b(alive|living|survived)\b",r"\b(dead|died|killed|murdered)\b","Life status"),
(r"\b(dead|died|killed|murdered)\b",r"\b(alive|living|survived)\b","Life status"),
(r"\b(married|husband|wife|wedding)\b",r"\b(single|unmarried|divorced)\b","Relationship status"),
(r"\b(single|unmarried|divorced)\b",r"\b(married|husband|wife|wedding)\b","Relationship status"),
(r"\b(owns|owner of|has the)\b",r"\b(sold|lost|stolen|gave away)\b","Possession"),
(r"\b(sold|lost|stolen|gave away)\b",r"\b(owns|owner of|has the)\b","Possession")]
PLACES=["hospital","mansion","office","school","airport","hotel","court","prison","farm","restaurant","warehouse","church"]

def names(text):
    words=re.findall(r"\b[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})?\b",text)
    stop={"The","Then","When","After","Before","Meanwhile","Chapter","Episode","Scene","But","And","She","He","They","His","Her"}
    return sorted({x for x in words if x not in stop})

def analyze(req):
    a,b=req.previous_episode,req.next_episode
    al,bl=a.lower(),b.lower()
    an,bn=set(names(a)),set(names(b))
    findings=[]
    for left,right,label in CONTRASTS:
        x,y=re.search(left,al),re.search(right,bl)
        if x and y:
            findings.append({"severity":"high","category":"Possible contradiction","title":"Review "+label.lower()+" across episodes","evidence":"Previous episode cue: "+x.group(0)+"; next episode cue: "+y.group(0)+".","recommendation":"Inspect context and timeline. This keyword flag is not proof of an error."})
    new=sorted(bn-an); missing=sorted(an-bn)
    if new: findings.append({"severity":"review","category":"Character introduction","title":"New named characters appear","evidence":", ".join(new[:10]),"recommendation":"Check whether each needs an introduction or relationship cue."})
    if missing: findings.append({"severity":"info","category":"Character continuity","title":"Previous episode names are absent","evidence":", ".join(missing[:10]),"recommendation":"Check whether an unresolved thread needs payoff or recap; absence may be intentional."})
    pa={p for p in PLACES if p in al}; pb={p for p in PLACES if p in bl}
    if pa and pb and pa.isdisjoint(pb):
        findings.append({"severity":"review","category":"Setting transition","title":"Episode setting appears to change","evidence":"Previous: "+", ".join(sorted(pa))+"; next: "+", ".join(sorted(pb))+".","recommendation":"Check whether the transition is established visually or in dialogue."})
    if not findings: findings=[{"severity":"info","category":"No obvious flags","title":"No rule-based flags found","evidence":"The MVP checks only limited surface signals.","recommendation":"Manually review the pair; no flags does not prove continuity."}]
    return {"show_name":req.show_name,"summary":{"previous_chars":len(a),"next_chars":len(b),"recurring_names":sorted(an&bn)[:15],"new_names":new[:15],"flags":len(findings)},"findings":findings,"review_checklist":["Confirm timeline and elapsed time","Verify relationships and motivations","Check props, injuries, and wardrobe","Ensure the opening gives returning viewers context","Confirm cliffhangers have a deliberate payoff"],"limitations":["Transparent regex/keyword baseline, not a trained LLM.","Name extraction is heuristic; aliases and nicknames may be missed.","Flags are review prompts, not factual conclusions.","No video, timestamp, or multilingual analysis."]}

@app.get("/")
def health(): return {"status":"ok","service":"StoryBridge"}
@app.post("/api/analyze")
def analyze_endpoint(req:Request): return analyze(req)
handler=app
