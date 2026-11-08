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


def test_voice_reads_binary_api_response_bytes(monkeypatch):
    class MockBinaryResponse:
        def __init__(self, payload):
            self.payload = payload
            self.read_called = False

        def read(self):
            self.read_called = True
            return self.payload

    class MockSpeech:
        def __init__(self, payload):
            self.payload = payload

        def create(self, **kwargs):
            assert kwargs["response_format"] == "wav"
            return MockBinaryResponse(self.payload)

    class MockAudio:
        def __init__(self, payload):
            self.speech = MockSpeech(payload)

    class MockGroqClient:
        def __init__(self, api_key):
            self.audio = MockAudio(b"RIFFmock-wav-bytes")

    monkeypatch.setenv("GROQ_API_KEY", "test-key")
    monkeypatch.setattr(index, "Groq", MockGroqClient)
    result = index.generate_voice(index.SpeechRequest(text="Hello StoryBridge"))
    assert result.body == b"RIFFmock-wav-bytes"
    assert result.media_type == "audio/wav"


def test_voice_rejects_empty_binary_response(monkeypatch):
    class EmptyResponse:
        def read(self):
            return b""

    class MockSpeech:
        def create(self, **kwargs):
            return EmptyResponse()

    class MockAudio:
        speech = MockSpeech()

    class MockGroqClient:
        def __init__(self, api_key):
            self.audio = MockAudio()

    monkeypatch.setenv("GROQ_API_KEY", "test-key")
    monkeypatch.setattr(index, "Groq", MockGroqClient)
    try:
        index.generate_voice(index.SpeechRequest(text="Hello"))
    except HTTPException as exc:
        assert exc.status_code == 502
        assert "empty or unreadable" in exc.detail
    else:
        raise AssertionError("Expected empty audio response to fail")
