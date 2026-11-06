# StoryBridge — Solution Document
Problem 3 · BUG BUSTERS · https://github.com/teambugbusters00/kuku-assignment-

## Problem
Microdramas serialize stories into short vertical episodes. Character status, relationships, props, and settings can shift across installments. Editors manually compare scripts to catch continuity risks and missing context. Indian Express describes rapid vertical storytelling (https://indianexpress.com/article/long-reads/hooked-in-a-minute-the-rise-microdrama-vertical-dramas-10206049/). Public app reviews mention episode/language/subtitle friction (https://apps.apple.com/us/app/micro-drama-short-drama-show/id6738779896?platform=iphone&see-all=reviews). These are anecdotal signals, not representative research.

## Solution
StoryBridge compares adjacent episode text and returns character-name signals, possible status/relationship/possession contradictions, setting changes, evidence, and an editor checklist. Flags are prompts, not verdicts. Assumptions: one editor, English text, text-only, adjacent episodes, authorized content. Demo is synthetic; Kuku's confidential pack is not included.

## Implementation and scale
React/Vite UI, FastAPI endpoint, Python regex rules, Vercel target. No database or external LLM. Future work: screenplay parsing/timestamps, character and prop state, aliases, multilingual models, editor feedback, and secure storage/access controls.

## Quality and limits
Name extraction is heuristic; rules may miss implicit contradictions or flag intentional twists. Video, wardrobe, blocking, and timestamps are not checked. No performance claims. Validate on 20 editor-reviewed pairs; measure precision, recall, false positives, editor dismissal, and minutes saved. Proposed pilot goal: 60%+ high-severity flags judged useful and measurable time savings. Not yet measured.

AI disclosure: ChatGPT assisted drafting; runtime is rule-based. Submitter must test and understand code.
