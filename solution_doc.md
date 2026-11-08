# StoryBridge — Solution Document
Problem 3 · BUG BUSTERS · https://github.com/teambugbusters00/kuku-assignment-

## Problem
Microdramas serialize stories into short vertical episodes. Character status, relationships, props, and settings can shift across installments. Editors manually compare scripts to catch continuity risks and missing context. Indian Express describes rapid vertical storytelling (https://indianexpress.com/article/long-reads/hooked-in-a-minute-the-rise-microdrama-vertical-dramas-10206049/). Public app reviews mention episode/language/subtitle friction (https://apps.apple.com/us/app/micro-drama-short-drama-show/id6738779896?platform=iphone&see-all=reviews). These are anecdotal signals, not representative research.

## Solution
StoryBridge compares adjacent episode text and returns character-name signals, possible status/relationship/possession contradictions, setting changes, evidence, and an editor checklist. Flags are prompts, not verdicts. Assumptions: one editor, English text, text-only, adjacent episodes, authorized content. Demo is synthetic; Kuku's confidential pack is not included.

## Implementation and scale
React/Vite UI, FastAPI endpoint, and Groq chat-completions for semantic continuity review. The configured `GROQ_MODEL` is used for each adjacent-episode comparison. Full-series scans call Groq once per adjacent pair. No database is required for the current demo. Future work: screenplay/video parsing and timestamps, character/prop state tracking, stronger alias resolution, multilingual evaluation, editor feedback, and secure storage/access controls.

## Quality and limits
Groq may miss implicit contradictions, misinterpret context, or flag intentional twists. Video, wardrobe, blocking, and timestamps are not checked. Groq API errors are surfaced; the service does not silently fall back to regex rules. No performance claims. Validate on 20 editor-reviewed pairs; measure precision, recall, false positives, editor dismissal, and minutes saved. Proposed pilot goal: 60%+ high-severity flags judged useful and measurable time savings. Not yet measured.

AI disclosure: ChatGPT assisted drafting; runtime PS3 analysis uses Groq. Submitter must test and understand code.

## Groq implementation and regression-test notes

All three problem statements (PS1, PS2, PS3) are intended to call Groq for text analysis. PS3 episode-pair comparisons and series scans use the Groq continuity-review helper; the service does not silently fall back to local regex analysis. Groq API errors should be surfaced clearly.

Voice preview uses Groq TTS. The backend reads the SDK's binary response through its byte/read/stream interface instead of assuming a `.content` attribute. Regression tests cover PS3 provider wiring, no silent fallback, and TTS binary response/empty response handling.

**Important:** Automated tests use mocked Groq responses and do not prove the live Groq API key, model access, TTS model availability, or Render deployment is working. Check GitHub Actions and perform a live Render smoke test before claiming production readiness.
