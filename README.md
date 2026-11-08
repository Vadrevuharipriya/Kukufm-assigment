# StoryBridge — Microdrama Continuity Review
**Problem 3 · BUG BUSTERS**

StoryBridge is a human-in-the-loop editorial assistant for checking continuity between microdrama episodes. It reads the 50 episode TXT files stored in original_assignment_files/ directly.

## What the app does
- **Episode library:** lists episode files, character count, and a short preview.
- **Pair comparison:** choose any two episode files and review rule-based character, status, relationship, possession, and setting signals.
- **Full-series scan:** checks adjacent episode pairs in filename order and gives a report with flags per pair.
- **Manual editor:** paste or edit text to compare without changing the original script files.
- **Export:** copy pair or series report as JSON.
- **Human review checklist:** prompts editors to check timeline, relationships, props, injuries, wardrobe, recap context, and cliffhanger payoff.

## Repository structure
- api/index.py — FastAPI API + rule-based analysis
- frontend/ — React + Vite web app
- original_assignment_files/ — episode TXT dataset (episode-001 through episode-050)
- tests/ — API tests
- solution_doc.md — solution and evaluation plan

## Run locally
From repository root:

    python -m pip install -r requirements.txt
    uvicorn api.index:app --reload

In another terminal:

    cd frontend
    npm install
    npm run dev

Open the Vite URL shown in the terminal. In local development, the frontend uses the backend at the same origin; set VITE_API_URL=http://localhost:8000 if frontend and backend use different ports.

## API endpoints
- GET / — health check
- GET /api/episodes — list the script dataset
- POST /api/analyze — compare manually supplied text
- POST /api/analyze-episodes — compare two dataset episode IDs
- GET /api/analyze-series — scan all adjacent pairs

## Deployment
The current Render backend is configured to start with:

    uvicorn api.index:app --host 0.0.0.0 --port $PORT

Frontend API URL can be configured with VITE_API_URL; production fallback is the existing Render backend URL. Confirm Render deployment status and test deployed endpoints before presenting the site as production-ready.

## Important data / privacy note
The episode files are included in this repository and may be visible to anyone if the repository is public. Only keep them here if you have permission to publish and process them. If the KukuFM assignment pack is confidential or intended only for evaluation, make the repository private or remove the source scripts before sharing publicly. Do not upload confidential scripts to third-party AI services.

## Detection approach and limitations
This is a transparent Python regex/keyword baseline—not a trained LLM. It can identify surface cues, named-character changes, and selected setting shifts. It cannot reliably understand aliases, implied contradictions, intentional twists, chronology, visual continuity, wardrobe, props, or multilingual dialogue. Flags are editorial prompts, not proof. No flags does not mean the story is error-free.

## Evaluation plan
Test on editor-labeled adjacent episode pairs. Track precision, recall, false-positive rate, dismissal rate, and minutes saved. The proposed pilot target in docs/validation_plan.md is a goal, not a measured result.

## AI disclosure
ChatGPT assisted with drafting and implementation. Runtime analysis is rule-based. The submitter should run tests, understand the code, verify deployment, and be able to explain design decisions before submission.
