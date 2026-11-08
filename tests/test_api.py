from fastapi import HTTPException

from api import index


def fake_groq_review(*args):
    return {
        "summary": {"overall_assessment": "Possible continuity risk", "risk_level": "review"},
        "findings": [{
            "severity": "review",
            "category": "Character status",
            "title": "Check character status",
            "evidence": "Previous episode: alive; next episode: died.",
            "explanation": "The statements may conflict depending on chronology.",
            "recommendation": "Verify timeline and context.",
            "confidence": 0.82
        }],
        "recurring_characters": ["Maya"],
        "unresolved_threads": ["Who sent the letter?"],
        "continuity_checklist": ["Verify chronology"]
    }


def test_ps3_uses_groq_and_returns_structured_review(monkeypatch):
    monkeypatch.setattr(index, "ai_story_review", fake_groq_review)
    r = index.analyze(index.Request(
        previous_episode="Maya says her father is alive and found a letter.",
        next_episode="Maya says her father died years ago."
    ))
    assert r["analysis_provider"] == "Groq"
    assert r["fallback_used"] is False
    assert r["summary"]["risk_level"] == "review"
    assert r["findings"][0]["title"] == "Check character status"
    assert r["recurring_characters"] == ["Maya"]


def test_report_includes_checklist_and_limitations(monkeypatch):
    monkeypatch.setattr(index, "ai_story_review", fake_groq_review)
    r = index.analyze(index.Request(
        previous_episode="Maya enters the hospital and sees Arjun.",
        next_episode="Maya arrives at a hotel and sees Arjun."
    ))
    assert r["review_checklist"] == ["Verify chronology"]
    assert r["limitations"]


def test_groq_failure_is_not_silently_replaced_by_heuristic(monkeypatch):
    def fail(*args):
        raise HTTPException(status_code=502, detail="Groq unavailable")

    monkeypatch.setattr(index, "ai_story_review", fail)
    try:
        index.analyze(index.Request(
            previous_episode="Maya enters the hospital and sees Arjun.",
            next_episode="Maya arrives at a hotel and sees Arjun."
        ))
    except HTTPException as exc:
        assert exc.status_code == 502
    else:
        raise AssertionError("Expected Groq error to propagate")
