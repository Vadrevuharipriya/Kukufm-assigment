# StoryBridge validation plan

This document defines the automated regression checks and the manual end-to-end validation plan. **Mocked tests verify application logic only; they do not prove Groq credentials, model access, or Render deployment are live.**

## 1. Automated regression suite

Run from the repository root:

```bash
python -m pip install -r requirements.txt
python -m pip install pytest
python -m pytest -q
```

### Test inventory

| Test | Area | Scenario | Expected result |
|---|---|---|---|
| `test_ps3_uses_groq_and_returns_structured_review` | PS3 | Mock Groq returns continuity findings | Groq provider/model metadata, findings and summary are returned |
| `test_report_includes_checklist_and_limitations` | PS3 | Groq response includes editorial checklist | Checklist and limitations are present |
| `test_groq_failure_is_not_silently_replaced_by_heuristic` | PS3 | Groq continuity helper raises HTTP error | Error propagates; no heuristic fallback |
| `test_voice_reads_binary_api_response_bytes` | TTS | Mock Groq binary response writes WAV bytes to file | Endpoint returns those bytes as `audio/wav` |
| `test_voice_rejects_empty_binary_response` | TTS | TTS response produces empty bytes | Endpoint returns HTTP 502 with a clear failure |
| `test_ps1_calls_groq_and_marks_provider` | PS1 | Mock Groq returns transcript metadata | Groq metadata and expected tags are returned |
| `test_ps2_calls_groq_and_returns_catalog_grounded_recommendations` | PS2 | Mock Groq returns recommendation from catalog | Groq metadata and catalog reference are preserved |
| `test_groq_json_wraps_provider_errors` | Shared Groq client | Chat-completion provider raises an exception | Provider failure is wrapped as HTTP 502 |

These tests are deterministic and should not need a real API key. The tests intentionally mock Groq to avoid charges, rate limits, and nondeterministic model outputs.

## 2. API validation cases

Use a local backend or the deployed backend. Configure `GROQ_API_KEY` and ensure the selected `GROQ_MODEL` is enabled for the account.

| ID | Endpoint | Test input / action | Expected result |
|---|---|---|---|
| API-01 | `GET /` | Health request | HTTP 200 and service status |
| API-02 | `GET /api/ai-status` | Groq key configured | Provider/model/TTS configuration reported; never exposes the key |
| API-03 | `GET /api/ai-status` | Key absent in isolated environment | `configured=false` |
| API-04 | `POST /api/ps1/tag` | Valid transcript | JSON metadata response with Groq provider/model |
| API-05 | `POST /api/ps1/tag` | Transcript shorter than schema minimum | HTTP 422 |
| API-06 | `POST /api/ps2/recommend` | Valid profile/catalog/top_n | Recommendations should reference submitted catalog items |
| API-07 | `POST /api/ps2/recommend` | `top_n` outside 1–10 | HTTP 422 |
| API-08 | `POST /api/analyze` | Valid adjacent episode pair | Groq continuity review |
| API-09 | `POST /api/analyze` | Groq unavailable / invalid key | Clear HTTP error; no rule-based fallback |
| API-10 | `GET /api/episodes` | Episode files present | Dataset count and episode list |
| API-11 | `POST /api/analyze-episodes` | Valid episode IDs | Pair review and source episode IDs |
| API-12 | `POST /api/analyze-episodes` | Traversal or unknown filename | HTTP 400/404; no file outside dataset is read |
| API-13 | `GET /api/analyze-series` | Dataset loaded and Groq available | Adjacent pairs are reviewed by Groq; expect latency/rate-limit cost per pair |
| API-14 | `POST /api/voice` | Short text, valid Groq TTS model and voice | HTTP 200, nonempty audio/WAV response |
| API-15 | `POST /api/voice` | Missing key or provider/model failure | Clear HTTP 503/502, not a frontend success state |
| API-16 | `POST /api/voice` | Empty or malformed audio response | HTTP 502; never return empty audio as success |

## 3. Frontend end-to-end checklist

Run the frontend and backend locally or use the Render links in the README.

- [ ] PS1 workspace accepts transcript input and displays Groq metadata/tags.
- [ ] PS1 result can be downloaded as JSON and tags as CSV.
- [ ] PS2 workspace accepts a profile and catalog, and recommendations reference catalog items.
- [ ] PS2 result can be downloaded as JSON and recommendations as CSV.
- [ ] PS3 manual pair comparison returns Groq findings and review checklist.
- [ ] PS3 dataset comparison includes the selected source episode names.
- [ ] PS3 series scan shows all adjacent pair reports and provider metadata.
- [ ] Each PS result can download its solution/report Markdown.
- [ ] Voice preview plays generated audio and displays a useful error if the API fails.
- [ ] Refresh behavior for in-memory session history is understood; do not assume history persists unless storage is implemented.
- [ ] Browser console and backend logs show no unexpected errors.

## 4. TTS regression details

Groq's Python SDK returns a binary response object rather than guaranteeing a `.content` property. The implementation should use the SDK-supported `write_to_file(path)` method, then read the generated file bytes for the FastAPI audio response. Regression tests mock this SDK interface and verify exact byte preservation and empty-response handling.

Official reference: [Groq Text-to-Speech docs](https://console.groq.com/docs/text-to-speech).

## 5. Editorial benchmark

For a meaningful PS3 quality evaluation, collect at least 20 adjacent episode pairs labeled by editors:

- 5 known continuity errors
- 5 intentional twists/reversals
- 5 clean transitions
- 5 ambiguous cases

Review Groq outputs blind against the editorial labels. Report:

- Precision and recall
- False-positive rate
- Editor dismissal rate
- Minutes saved per episode pair
- Results by language and episode length

Do not claim a quality score until this benchmark has actually been run. Model confidence is not calibrated probability.

## 6. Risks and production safeguards

- Aliases, nicknames, transliteration and multilingual names may be missed or merged.
- Intentional twists can look like contradictions.
- Text-only analysis cannot verify video, wardrobe, blocking, prop visuals or timestamps.
- PS2 catalog grounding currently depends on prompt instructions unless code performs deterministic catalog validation.
- Avoid sending confidential scripts or identifiable listener profiles to Groq without authorization.
- Add authentication, rate limits, request-size controls, retention policy and access controls before production use.
- A long PS3 episode may trigger multiple chunk-summary calls plus a final comparison. A full-series scan repeats this pipeline for every adjacent pair; large datasets can hit TPM/RPM limits and cost/latency limits. Chunking reduces oversized individual prompts but does not increase account quota.

## 7. Deployment smoke test

After GitHub Actions passes and Render finishes deploying:

1. Check `GET /api/ai-status` and verify the model/provider configuration.
2. Run one small PS1 request.
3. Run one PS2 request with a two-item catalog.
4. Run one PS3 manual comparison.
5. Run a short voice preview and confirm the browser receives playable audio.
6. Check Render logs for the exact TTS provider/model error if playback fails.
7. Confirm the deployed commit SHA matches the latest intended GitHub commit.

Passing CI is not equivalent to passing this live smoke test.
