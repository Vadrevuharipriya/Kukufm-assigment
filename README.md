# StoryBridge — Microdrama Episode Continuity Checker

**KukuFM Assignment · Problem Statement 3**

StoryBridge is a human-in-the-loop editorial assistant that helps reviewers identify possible continuity inconsistencies between microdrama episodes. It provides transparent, rule-based signals and a checklist for human review; it does **not** claim that a flagged issue is definitely an error.

## Quick Links

| Resource | Link |
|---|---|
| **Live frontend** | [Open StoryBridge](https://kukufm-assignment-frontend-kwao.onrender.com) |
| **Live backend** | [Backend service](https://kukufm-assignment-api.onrender.com) |
| **Backend health check** | [GET /](https://kukufm-assignment-api.onrender.com/) |
| **Episode dataset API** | [GET /api/episodes](https://kukufm-assignment-api.onrender.com/api/episodes) |
| **Source repository** | [teambugbusters00/kuku-assignment-](https://github.com/teambugbusters00/kuku-assignment-) |
| **Assignment / collaboration repository** | [Vadrevuharipriya/Kukufm-assigment](https://github.com/Vadrevuharipriya/Kukufm-assigment) |
| **Frontend Render dashboard** | [Frontend service](https://dashboard.render.com/static/srv-dbmtv3vf3r2c73bkqa50) |
| **Backend Render dashboard** | [Backend service](https://dashboard.render.com/web/srv-dbmtu395efls738j9l7g) |

> Render services may take a short time to wake up after inactivity. A link being available does not by itself guarantee the latest deployment is healthy.

## Features

- **Episode library:** browse the included episode scripts, character counts, and previews.
- **Pair comparison:** compare two episodes and inspect character, status, relationship, possession, and setting signals.
- **Full-series scan:** analyze adjacent episode pairs in filename order.
- **Manual comparison:** paste or edit text without modifying the source episode files.
- **Report export:** copy pair or series analysis as JSON.
- **Editorial checklist:** review timeline, relationships, props, injuries, wardrobe, recap context, and cliffhanger payoff.

## How It Works

1. The user selects two episodes, or starts a full-series scan.
2. The FastAPI backend applies transparent regex/keyword-based rules.
3. The frontend displays possible continuity signals and a structured report.
4. An editor reviews each flag against the actual story context.

**Important:** flags are review prompts—not proof of a continuity error. A result with no flags does not establish that an episode pair is error-free.

## Tech Stack

- **Frontend:** React, Vite, JavaScript
- **Backend:** Python, FastAPI, Uvicorn
- **Analysis:** rule-based regex and keyword signals
- **Deployment:** Render

## Repository Structure

```text
.
├── api/
│   └── index.py                  # FastAPI routes and rule-based analysis
├── frontend/                     # React + Vite application
├── original_assignment_files/     # Episode TXT dataset (episode-001 to episode-050)
├── tests/                        # API tests
├── solution_doc.md               # Solution and evaluation plan
├── docs/
│   └── validation_plan.md         # Proposed validation approach and targets
└── README.md
```

## Run Locally

### 1. Start the backend

From the repository root:

```bash
python -m pip install -r requirements.txt
uvicorn api.index:app --reload
```

The backend runs at `http://localhost:8000` by default.

### 2. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local Vite URL printed in the terminal.

If the frontend and backend run on different origins, configure the frontend API URL:

```bash
VITE_API_URL=http://localhost:8000
```

For production, the frontend uses the deployed Render backend URL as its fallback. Configure `VITE_API_URL` in the frontend deployment environment when needed.

## API Reference

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Backend health check |
| GET | `/api/episodes` | List the available episode scripts |
| POST | `/api/analyze` | Analyze manually supplied episode text |
| POST | `/api/analyze-episodes` | Compare two dataset episode IDs |
| GET | `/api/analyze-series` | Scan adjacent episode pairs across the series |

### Deployed API Links

- [Health check](https://kukufm-assignment-api.onrender.com/)
- [Episode list](https://kukufm-assignment-api.onrender.com/api/episodes)
- [Series analysis](https://kukufm-assignment-api.onrender.com/api/analyze-series)

The `POST` endpoints require request bodies and should be tested with the API docs or an HTTP client rather than opened as ordinary browser links.

## Render Deployment

### Backend start command

```bash
uvicorn api.index:app --host 0.0.0.0 --port $PORT
```

### Environment configuration

- Set `VITE_API_URL` on the frontend if you need to override the backend URL.
- Keep secrets and API keys in Render environment variables.
- **Never commit API keys, tokens, or credentials to GitHub.**

### Deployment verification

Before describing the application as production-ready, verify:

- [ ] Frontend loads successfully.
- [ ] Backend health check returns a successful response.
- [ ] Episode list endpoint returns the expected dataset.
- [ ] Pair comparison works with valid episode IDs.
- [ ] Series scan completes and returns a report.
- [ ] Browser console and Render logs contain no blocking errors.

## Detection Approach & Limitations

The current analyzer is a **rule-based Python baseline**, not a trained language model. It can detect selected surface-level cues, named-character changes, and possible status, relationship, possession, or setting shifts.

It may miss or misinterpret:

- character aliases and indirect references;
- implied or context-dependent contradictions;
- intentional plot twists and unreliable narration;
- chronology and complex timeline changes;
- visual continuity such as wardrobe, props, or scene details;
- multilingual dialogue and subtle semantic changes.

Human editorial review remains essential.

## Evaluation Plan

Evaluate on adjacent episode pairs labeled by human editors. Useful metrics include:

- precision and recall;
- false-positive rate;
- editor dismissal rate;
- review time saved.

Any target described in `docs/validation_plan.md` is a **proposed target**, not a measured result unless supported by completed evaluation data.

## Data & Privacy

The repository contains episode TXT files under `original_assignment_files/`. If the assignment materials are confidential or restricted to evaluation, do not publish the repository or redistribute those scripts without permission. Consider making the repository private or removing the source scripts before public sharing. Do not send confidential scripts to third-party AI services.

## AI / Implementation Disclosure

AI assistance was used during drafting and implementation. The deployed continuity analysis is rule-based. Before submission, the developer should run the tests, verify the deployed behavior, and be prepared to explain the architecture, rules, trade-offs, and limitations.
