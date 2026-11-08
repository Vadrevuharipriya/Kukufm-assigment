# StoryBridge — Solution Document
Problem 3 · BUG BUSTERS · https://github.com/teambugbusters00/kuku-assignment-

## Problem
Microdramas serialize stories into short vertical episodes. Character status, relationships, props, and settings can shift across installments. Editors manually compare scripts to catch continuity risks and missing context. Indian Express describes rapid vertical storytelling (https://indianexpress.com/article/long-reads/hooked-in-a-minute-the-rise-microdrama-vertical-dramas-10206049/). Public app reviews mention episode/language/subtitle friction (https://apps.apple.com/us/app/micro-drama-short-drama-show/id6738779896?platform=iphone&see-all=reviews). These are anecdotal signals, not representative research.

## Solution
StoryBridge compares adjacent episode text and returns character-name signals, possible status/relationship/possession contradictions, setting changes, evidence, and an editor checklist. Flags are prompts, not verdicts. Assumptions: one editor, English text, text-only, adjacent episodes, authorized content. Demo is synthetic; Kuku's confidential pack is not included.

## Implementation and scale
React/Vite UI, FastAPI endpoint, and Groq chat-completions for semantic continuity review. The configured `GROQ_MODEL` is used for each adjacent-episode comparison. Long PS3 episode transcripts are split into bounded text chunks and summarized before the final pair comparison to reduce single-request prompt size. This increases API calls and remains subject to Groq TPM/RPM limits. Full-series scans call this pipeline for each adjacent pair. No database is required for the current demo. Future work: screenplay/video parsing and timestamps, character/prop state tracking, stronger alias resolution, multilingual evaluation, editor feedback, and secure storage/access controls.

## Quality and limits
Groq may miss implicit contradictions, misinterpret context, or flag intentional twists. Video, wardrobe, blocking, and timestamps are not checked. Groq API errors are surfaced; the service does not silently fall back to regex rules. No performance claims. Validate on 20 editor-reviewed pairs; measure precision, recall, false positives, editor dismissal, and minutes saved. Proposed pilot goal: 60%+ high-severity flags judged useful and measurable time savings. Not yet measured.

AI disclosure: ChatGPT assisted drafting; runtime PS3 analysis uses Groq. Submitter must test and understand code.

## Groq implementation and regression-test notes

PS1 metadata tagging, PS2 personalized recommendations, and PS3 continuity analysis call Groq for text analysis. PS3 episode-pair comparisons and series scans use the Groq continuity-review helper; the service does not silently fall back to local regex analysis. Groq API errors should be surfaced clearly.

Voice preview uses Groq TTS. The Groq Python SDK returns a `BinaryAPIResponse`; the backend uses the documented `write_to_file(path)` method and then reads the WAV bytes, rather than accessing a nonexistent `.content` attribute. The default TTS model is `canopylabs/orpheus-v1-english` and default voice is `autumn` (confirm model/voice availability in the Groq account).

**Important:** Automated tests use mocked Groq responses and do not prove the live Groq API key, model access, TTS model availability, or Render deployment is working. Check GitHub Actions and perform a live Render smoke test before claiming production readiness.


## Automated test coverage

Run from the repository root:

```bash
python -m pip install -r requirements.txt
python -m pip install pytest
python -m pytest -q
```

Regression tests cover:
- PS1: Groq metadata/tagging provider and model fields.
- PS2: Groq recommendations and catalog reference preservation.
- PS3: Groq continuity response schema, checklist, provider metadata, and no heuristic fallback on API errors.
- Shared Groq client: provider exceptions become HTTP 502.
- TTS: binary SDK response is converted to WAV bytes; empty output is rejected.

All automated Groq calls are mocked. This is intentional: CI should not require or expose a real Groq API key. Mock tests validate integration code paths, not actual model quality, live Groq connectivity, or Render deployment. See [docs/validation_plan.md](docs/validation_plan.md) for the full test matrix and live smoke-test checklist.
