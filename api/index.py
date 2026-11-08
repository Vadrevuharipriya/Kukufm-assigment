from pathlib import Path
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="StoryBridge API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ROOT = Path(__file__).resolve().parents[1]
EPISODE_DIR = ROOT / "original_assignment_files"

class Request(BaseModel):
    show_name: str = "Untitled show"
    previous_episode: str = Field(min_length=20, max_length=30000)
    next_episode: str = Field(min_length=20, max_length=30000)

class EpisodePairRequest(BaseModel):
    show_name: str = "KukuFM episode dataset"
    previous_episode_id: str
    next_episode_id: str

CONTRASTS = [
    (r"\b(alive|living|survived)\b", r"\b(dead|died|killed|murdered)\b", "Life status"),
    (r"\b(dead|died|killed|murdered)\b", r"\b(alive|living|survived)\b", "Life status"),
    (r"\b(married|husband|wife|wedding)\b", r"\b(single|unmarried|divorced)\b", "Relationship status"),
    (r"\b(single|unmarried|divorced)\b", r"\b(married|husband|wife|wedding)\b", "Relationship status"),
    (r"\b(owns|owner of|has the)\b", r"\b(sold|lost|stolen|gave away)\b", "Possession"),
    (r"\b(sold|lost|stolen|gave away)\b", r"\b(owns|owner of|has the)\b", "Possession"),
]
PLACES = ["hospital", "mansion", "office", "school", "airport", "hotel", "court", "prison", "farm", "restaurant", "warehouse", "church"]
STOP_NAMES = {"The", "Then", "When", "After", "Before", "Meanwhile", "Chapter", "Episode", "Scene", "But", "And", "She", "He", "They", "His", "Her"}

def episode_files():
    if not EPISODE_DIR.exists():
        return []
    return sorted(EPISODE_DIR.glob("episode-*.txt"), key=lambda p: p.name.lower())

def episode_id(path):
    return path.name

def get_episode_text(file_id):
    # Accept only an exact filename from the known dataset directory.
    if Path(file_id).name != file_id or not file_id.startswith("episode-") or not file_id.endswith(".txt"):
        raise HTTPException(status_code=400, detail="Invalid episode identifier")
    path = EPISODE_DIR / file_id
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Episode not found")
    return path.read_text(encoding="utf-8", errors="replace")

def names(text):
    words = re.findall(r"\b[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})?\b", text)
    return sorted({x for x in words if x not in STOP_NAMES})

def analyze(req):
    a, b = req.previous_episode, req.next_episode
    al, bl = a.lower(), b.lower()
    an, bn = set(names(a)), set(names(b))
    findings = []
    for left, right, label in CONTRASTS:
        x, y = re.search(left, al), re.search(right, bl)
        if x and y:
            findings.append({
                "severity": "high", "category": "Possible contradiction",
                "title": "Review " + label.lower() + " across episodes",
                "evidence": "Previous episode cue: " + x.group(0) + "; next episode cue: " + y.group(0) + ".",
                "recommendation": "Inspect context and timeline. This keyword flag is not proof of an error."
            })
    new, missing = sorted(bn - an), sorted(an - bn)
    if new:
        findings.append({"severity": "review", "category": "Character introduction", "title": "New named characters appear", "evidence": ", ".join(new[:10]), "recommendation": "Check whether each needs an introduction or relationship cue."})
    if missing:
        findings.append({"severity": "info", "category": "Character continuity", "title": "Previous episode names are absent", "evidence": ", ".join(missing[:10]), "recommendation": "Check whether an unresolved thread needs payoff or recap; absence may be intentional."})
    pa, pb = {p for p in PLACES if p in al}, {p for p in PLACES if p in bl}
    if pa and pb and pa.isdisjoint(pb):
        findings.append({"severity": "review", "category": "Setting transition", "title": "Episode setting appears to change", "evidence": "Previous: " + ", ".join(sorted(pa)) + "; next: " + ", ".join(sorted(pb)) + ".", "recommendation": "Check whether the transition is established visually or in dialogue."})
    if not findings:
        findings = [{"severity": "info", "category": "No obvious flags", "title": "No rule-based flags found", "evidence": "The MVP checks only limited surface signals.", "recommendation": "Manually review the pair; no flags does not prove continuity."}]
    return {
        "show_name": req.show_name,
        "summary": {"previous_chars": len(a), "next_chars": len(b), "recurring_names": sorted(an & bn)[:15], "new_names": new[:15], "flags": len(findings)},
        "findings": findings,
        "review_checklist": ["Confirm timeline and elapsed time", "Verify relationships and motivations", "Check props, injuries, and wardrobe", "Ensure the opening gives returning viewers context", "Confirm cliffhangers have a deliberate payoff"],
        "limitations": ["Transparent regex/keyword baseline, not a trained LLM.", "Name extraction is heuristic; aliases and nicknames may be missed.", "Flags are review prompts, not factual conclusions.", "No video, timestamp, or multilingual analysis."]
    }

@app.get("/")
def health():
    return {"status": "ok", "service": "StoryBridge"}

@app.get("/api/episodes")
def list_episodes():
    items = []
    for index, path in enumerate(episode_files(), start=1):
        content = path.read_text(encoding="utf-8", errors="replace")
        items.append({
            "id": episode_id(path),
            "number": index,
            "name": path.stem.replace("episode-", "Episode ", 1),
            "characters": len(content),
            "preview": re.sub(r"\s+", " ", content[:220]).strip()
        })
    return {"count": len(items), "episodes": items}

@app.post("/api/analyze")
def analyze_endpoint(req: Request):
    return analyze(req)

@app.post("/api/analyze-episodes")
def analyze_episode_pair(req: EpisodePairRequest):
    previous = get_episode_text(req.previous_episode_id)
    next_text = get_episode_text(req.next_episode_id)
    result = analyze(Request(show_name=req.show_name, previous_episode=previous, next_episode=next_text))
    result["source_episodes"] = [req.previous_episode_id, req.next_episode_id]
    return result

@app.get("/api/analyze-series")
def analyze_series():
    files = episode_files()
    pairs = []
    total_flags = 0
    for previous, following in zip(files, files[1:]):
        result = analyze(Request(
            show_name="KukuFM episode dataset",
            previous_episode=previous.read_text(encoding="utf-8", errors="replace"),
            next_episode=following.read_text(encoding="utf-8", errors="replace")
        ))
        total_flags += result["summary"]["flags"]
        pairs.append({
            "previous": previous.name,
            "next": following.name,
            "flags": result["summary"]["flags"],
            "recurring_names": result["summary"]["recurring_names"],
            "findings": result["findings"]
        })
    return {
        "episode_count": len(files),
        "pair_count": len(pairs),
        "total_flags": total_flags,
        "pairs": pairs,
        "note": "Automated keyword/name heuristics only. Review flags manually; no flags does not mean the story is error-free."
    }

handler = app
