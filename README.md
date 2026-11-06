# StoryBridge — Microdrama Continuity Review
Problem 3 · BUG BUSTERS

## Problem and evidence
Microdramas serialize stories into short vertical episodes. Character status, relationships, props, and settings can shift across installments; editors manually compare scripts to catch continuity risks and missing context.
Public evidence: Indian Express describes rapid vertical storytelling and short episode format (https://indianexpress.com/article/long-reads/hooked-in-a-minute-the-rise-microdrama-vertical-dramas-10206049/). Public app reviews mention episode/language/subtitle friction (https://apps.apple.com/us/app/micro-drama-short-drama-show/id6738779896?platform=iphone&see-all=reviews). These are signals, not representative research.

## Solution
StoryBridge compares two adjacent episode text excerpts and surfaces character-name signals, possible status/relationship/possession contradictions, setting changes, evidence, and a human checklist. Flags are editorial prompts, not verdicts.

## Scope and assumptions
One editor, adjacent episodes, English text, text-only. Demo is synthetic. Use only content you own, have permission to use, or public text. Do not upload/publish Kuku's confidential input pack.

## Stack and setup
React + Vite frontend, FastAPI backend, Python regex baseline, Vercel target. No database, external LLM, paid API, or runtime model.
Install: pip install -r requirements.txt
API: uvicorn api.index:app --reload
Frontend: cd frontend && npm install && npm run build
Use Vercel CLI (vercel dev) for integrated routing.

## Deployment
Import repo into Vercel at root. vercel.json routes /api to api/index.py and builds frontend. Multi-build Python/static support may vary; if Vercel rejects config, deploy API as a separate Vercel project and set frontend API URL. Deployment is not yet verified.

## Quality and limits
Input validation: 20–30,000 chars. Name extraction is heuristic; aliases, implicit conflicts, visual continuity, timestamps, and multilingual scripts are unsupported. False positives expected. No flags does not mean no error.

## Pilot evaluation
Run on 20 editor-reviewed episode pairs. Measure precision/recall, false positives, dismissal rate, and minutes saved. Suggested target: 60%+ of high-severity flags judged useful and measurable time savings. This is a proposed target, not a result.

## AI disclosure
ChatGPT assisted drafting. Runtime uses Python regex/rules, not a trained LLM. Submitter must test and understand code.
