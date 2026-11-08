# KukuFM Assignment — AI-Powered Audio Intelligence Suite

A unified assignment workspace covering **three problem statements**:

1. **PS1 — AI Content Understanding & Tagging**
2. **PS2 — Personalized Audio Recommendation**
3. **PS3 — StoryBridge: Microdrama Episode Continuity**

The repository contains a React/Vite dashboard and a FastAPI backend. PS1 and PS2 have Groq-powered backend API routes. PS3 has an interactive frontend workflow and a transparent Python rule-based continuity analyzer.

> **Implementation status:** The dashboard displays all three PS cards. PS1 and PS2 backend endpoints are implemented, but their complete interactive frontend forms/workflows are not yet connected in the current UI. PS3 has the functional episode-library/manual-text frontend workflow. Do not describe all three as end-to-end complete until PS1/PS2 frontend integration and deployment tests are finished.

## Quick Links

| Resource | Link |
|---|---|
| **Live frontend** | [KukuFM Assignment Dashboard](https://kukufm-assignment-frontend-kwao.onrender.com) |
| **Live backend** | [FastAPI backend](https://kukufm-assignment-api.onrender.com) |
| **Backend health check** | [GET /](https://kukufm-assignment-api.onrender.com/) |
| **AI configuration status** | [GET /api/ai-status](https://kukufm-assignment-api.onrender.com/api/ai-status) |
| **Episode library** | [GET /api/episodes](https://kukufm-assignment-api.onrender.com/api/episodes) |
| **Full-series continuity scan** | [GET /api/analyze-series](https://kukufm-assignment-api.onrender.com/api/analyze-series) |
| **GitHub source repository** | [teambugbusters00/kuku-assignment-](https://github.com/teambugbusters00/kuku-assignment-) |
| **Assignment/collaboration repository** | [Vadrevuharipriya/Kukufm-assigment](https://github.com/Vadrevuharipriya/Kukufm-assigment) |
| **Frontend Render dashboard** | [Frontend service](https://dashboard.render.com/static/srv-dbmtv3vf3r2c73bkqa50) |
| **Backend Render dashboard** | [Backend service](https://dashboard.render.com/web/srv-dbmtu395efls738j9l7g) |
| **Solution document** | [solution_doc.md](https://github.com/teambugbusters00/kuku-assignment-/blob/main/solution_doc.md) |
| **Validation plan** | [docs/validation_plan.md](https://github.com/teambugbusters00/kuku-assignment-/blob/main/docs/validation_plan.md) |

Render free services may sleep when inactive. A link existing does not guarantee that the latest deployment is healthy; check the health endpoint and Render logs.

---

## Problem Statements & Features

### PS1 — AI Content Understanding & Tagging

**Goal:** Turn an episode transcript into structured, useful audio-content metadata.

**Backend route:** `POST /api/ps1/tag`

The route sends the supplied transcript to the Groq chat-completions API and asks for grounded metadata. The prompt instructs the model not to invent facts.

**Request fields**

| Field | Type | Validation / default |
|---|---|---|
| `text` | string | Required, 20–30,000 characters |
| `title` | string | Optional, default `Untitled episode`, max 200 characters |
| `language` | string | Optional, default `auto`, max 40 characters |

**Expected response fields**

- `title`
- `summary` — 2–4 sentences
- `genre` — array
- `tags` — array (prompt requests 5–15)
- `themes` — array
- `characters` — objects with name and role/evidence
- `emotions` — array
- `content_warnings` — array
- `language`
- `confidence` — model-provided value from 0 to 1
- `evidence_notes` — array
- `provider` and `model` — added by the backend

**Frontend status:** PS1 is represented by a dashboard card, but a complete transcript input form, API submission flow, and rendered tag-results view are not yet wired into the current frontend.

### PS2 — Personalized Audio Recommendation

**Goal:** Recommend catalog items that match a listener profile while restricting recommendations to the catalog provided in the request.

**Backend route:** `POST /api/ps2/recommend`

The Groq prompt tells the model to recommend only titles/items present in the supplied catalog and not fabricate titles or IDs.

**Request fields**

| Field | Type | Validation / default |
|---|---|---|
| `user_profile` | string | Required, 5–10,000 characters |
| `catalog` | string | Required, 10–30,000 characters |
| `top_n` | integer | Optional, default 5, allowed range 1–10 |

**Expected response fields**

- `recommendations` — list of ranked items, including title, catalog reference/ID, match score, reasons, fit explanation, and content notes
- `profile_signals` — extracted listener-interest signals
- `diversity_note` — recommendation diversity explanation
- `provider` and `model` — added by the backend

**Frontend status:** PS2 is represented by a dashboard card, but profile/catalog input forms, recommendation submission, and a recommendation-results interface are not yet connected in the current frontend.

### PS3 — StoryBridge: Microdrama Episode Continuity

**Goal:** Help editors review possible inconsistencies between consecutive episodes.

**Current frontend workflow**

- Browse the episode library and previews.
- Select two dataset episodes and compare them.
- Paste two episode texts for manual comparison.
- Run a full-series scan across adjacent episode pairs.
- Inspect findings, evidence, severity/category, and suggested editorial actions.
- Use the human-review checklist.
- Copy the structured report as JSON.

**Current analyzer:** Python regex/keyword and heuristic name extraction. It is not an LLM continuity verdict.

Signals include:

- possible life-status contradictions;
- possible relationship-status changes;
- possession-related keyword contrasts;
- newly appearing or missing named-character signals;
- selected setting changes.

The system returns findings and a checklist. A flag is a review prompt—not proof of a continuity error. No flags does not prove a script is error-free.

---

## Frontend

**Stack:** React 18, Vite 5, JavaScript.

**Main files**

- `frontend/src/main.jsx` — dashboard, problem cards, navigation, PS3 workflow, results panel
- `frontend/src/style.css` — dashboard styling
- `frontend/package.json` — frontend scripts and dependencies

**Dashboard sections**

- **Home:** assignment overview, three PS cards, recent run history, project/service links.
- **Problems:** problem statement cards and PS3 workspace.
- **Results:** displays the latest continuity report or series-scan result.
- **Docs:** project documentation link.

**PS3 UI components**

- Dataset episode selectors
- Manual previous/next episode text inputs
- Pair-comparison action
- Full-series scan action
- Analysis report panel
- Human-review checklist
- Limitations section
- Copy-report-JSON button

The dashboard's audio preview buttons are currently visual placeholders; they do not play actual audio.

### Frontend configuration

The frontend API base URL is resolved from:

1. `VITE_API_URL`, if configured;
2. production fallback: `https://kukufm-assignment-api.onrender.com`;
3. local development: same-origin relative API paths when no override is set.

Set `VITE_API_URL` in the frontend hosting environment if you need a different backend URL.

---

## Backend

**Stack:** Python, FastAPI, Pydantic, Uvicorn, Groq Python SDK.

**Main file:** `api/index.py`

### Backend responsibilities

- Exposes health, AI status, episode library, tagging, recommendation, and continuity endpoints.
- Validates request payloads with Pydantic.
- Calls Groq for PS1 metadata extraction and PS2 recommendation generation.
- Uses local Python rules for the PS3 continuity analysis.
- Returns JSON responses and HTTP errors for missing configuration or upstream AI failures.

### AI provider configuration

PS1 and PS2 use **Groq** through the Groq Python SDK.

Environment variables:

| Variable | Purpose | Default |
|---|---|---|
| `GROQ_API_KEY` | Required secret for Groq requests | No default; configure privately in Render |
| `GROQ_MODEL` | Model name sent to Groq | `llama-3.3-70b-versatile` |

The model name must be available for your Groq account. If Groq returns a model-not-found/decommissioned error, update `GROQ_MODEL` to a currently supported model.

**Never put `GROQ_API_KEY` in source code, README examples, frontend environment variables, or Git commits.** Keep it in Render's backend environment settings or a local untracked `.env` file.

The `GET /api/ai-status` route reports whether the key is configured and which model name is set. It does not make a model inference request.

### PS3 implementation note

The active PS3 endpoints use the local `analyze()` regex/keyword baseline. An AI-based continuity review helper exists in the backend source, but it is not currently the analyzer called by the PS3 routes. Do not describe PS3 as Groq-powered unless the route wiring is changed and tested.

---

## API Reference

| Method | Endpoint | Problem | Description |
|---|---|---|---|
| GET | `/` | General | Backend health check |
| GET | `/api/ai-status` | PS1/PS2 | Groq key/model configuration status |
| POST | `/api/ps1/tag` | PS1 | Generate episode metadata/tags from transcript |
| POST | `/api/ps2/recommend` | PS2 | Generate catalog-constrained recommendations |
| GET | `/api/episodes` | PS3 | List dataset episode IDs, previews, and character counts |
| POST | `/api/analyze` | PS3 | Compare manually supplied episode text |
| POST | `/api/analyze-episodes` | PS3 | Compare two dataset episode IDs |
| GET | `/api/analyze-series` | PS3 | Scan adjacent episode pairs across the dataset |

### Deployed API URLs

- [Health check](https://kukufm-assignment-api.onrender.com/)
- [AI configuration status](https://kukufm-assignment-api.onrender.com/api/ai-status)
- [Episode library](https://kukufm-assignment-api.onrender.com/api/episodes)
- [Series scan](https://kukufm-assignment-api.onrender.com/api/analyze-series)

The PS1 and PS2 endpoints use `POST` and require JSON request bodies. Test them with an HTTP client or API testing tool.

### Example PS1 request

```json
{
  "title": "Episode 1",
  "language": "Hindi",
  "text": "Paste at least 20 characters of episode transcript here..."
}
```

### Example PS2 request

```json
{
  "user_profile": "Likes suspense, mystery, short Hindi audio stories.",
  "catalog": "ID: A1 | Title: The Hidden Room | Genre: Mystery | Synopsis: ...",
  "top_n": 5
}
```

### Example PS3 manual request

```json
{
  "show_name": "Demo show",
  "previous_episode": "Paste at least 20 characters of previous episode text...",
  "next_episode": "Paste at least 20 characters of next episode text..."
}
```

---

## Repository Structure

```text
.
├── api/
│   └── index.py                  # FastAPI routes, Groq calls, PS3 analyzer
├── frontend/
│   ├── src/
│   │   ├── main.jsx              # React dashboard and PS3 workflow
│   │   └── style.css             # UI styles
│   └── package.json               # Vite/React scripts and dependencies
├── original_assignment_files/     # Episode TXT dataset (episode-001 to episode-050)
├── tests/                        # Test files, if present in this checkout
├── docs/
│   └── validation_plan.md         # Proposed validation approach
├── requirements.txt               # Python dependencies
├── solution_doc.md                # Solution document
└── README.md
```

---

## Run Locally

### 1. Backend setup

From the repository root:

```bash
python -m pip install -r requirements.txt
uvicorn api.index:app --reload
```

Backend default: `http://localhost:8000`

### 2. Frontend setup

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite development URL shown in the terminal.

For a separate local frontend/backend origin, configure:

```bash
VITE_API_URL=http://localhost:8000
```

### Requirements

Backend dependencies are declared in `requirements.txt`:

- FastAPI
- Pydantic
- Uvicorn
- Groq SDK

Frontend dependencies are declared in `frontend/package.json`:

- React
- React DOM
- Vite
- Vite React plugin

---

## Render Deployment

### Backend start command

```bash
uvicorn api.index:app --host 0.0.0.0 --port $PORT
```

### Backend environment variables

Configure these in the Render backend service:

- `GROQ_API_KEY` — required for PS1 and PS2 inference
- `GROQ_MODEL` — optional override for the model identifier

### Frontend environment variable

- `VITE_API_URL` — optional backend URL override

### Deployment checklist

- [ ] Frontend opens without a blocking error.
- [ ] Backend health check returns `{"status":"ok","service":"StoryBridge"}`.
- [ ] `/api/ai-status` shows Groq configured when the key is set.
- [ ] PS1 tagging route works with valid transcript input.
- [ ] PS2 recommendation route returns items grounded in the submitted catalog.
- [ ] PS3 episode library loads.
- [ ] PS3 manual and dataset pair comparisons work.
- [ ] PS3 series scan returns adjacent-pair reports.
- [ ] Browser console and Render logs contain no blocking errors.
- [ ] PS1 and PS2 frontend workflows are integrated before claiming all three are end-to-end complete.

---

## Quality, Evaluation & Limitations

### PS1 limitations

- Output quality depends on transcript quality, language, prompt, and model response.
- Metadata is model-generated and should be reviewed.
- Confidence is model output, not a calibrated probability unless separately validated.
- The API asks the model not to invent details, but that instruction does not guarantee factual accuracy.

### PS2 limitations

- Recommendations depend on the quality and completeness of the supplied profile/catalog.
- Catalog-only recommendations are enforced through prompt instructions, not a deterministic post-generation catalog-ID validator.
- Match scores are model-generated and are not empirically calibrated.
- User profile information should be minimized and handled responsibly.

### PS3 limitations

- Character-name extraction is heuristic; aliases and nicknames may be missed.
- Keyword contrasts can flag intentional twists or miss implied contradictions.
- Complex timeline, visual, wardrobe, blocking, prop, and timestamp continuity are not comprehensively checked.
- Multilingual and semantic nuance are not reliably analyzed.
- Findings are review prompts, not editorial verdicts.

### Suggested evaluation

Evaluate each problem independently:

- **PS1:** metadata/tag precision, reviewer acceptance, hallucination rate, and time saved.
- **PS2:** catalog validity, relevance ratings, diversity, and user/editor acceptance.
- **PS3:** precision, recall, false-positive rate, editor dismissal rate, and review time saved.

Any target in the validation document is a proposed target—not a measured result unless evaluation data has been collected.

---

## Data & Privacy

The repository includes episode text files under `original_assignment_files/`. If assignment materials are confidential or restricted to evaluation, do not publish or redistribute them without permission. Consider making the repository private or removing source scripts before public sharing. Avoid sending confidential scripts or identifiable listener profiles to third-party AI services without authorization.

## AI / Implementation Disclosure

AI assistance was used during drafting and implementation. PS1 and PS2 backend requests use Groq; PS3's current route uses rule-based Python analysis. The developer should run tests, verify deployed behavior, understand the code, and be ready to explain architecture, API contracts, model limitations, and implementation trade-offs.
