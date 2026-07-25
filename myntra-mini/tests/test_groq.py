import importlib
import json


def test_generate_reply_uses_groq_when_configured(monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "dummy-groq-key")
    monkeypatch.setenv("AI_PROVIDER", "groq")

    import vision
    importlib.reload(vision)

    class FakeResponse:
        def __init__(self, payload):
            self._payload = payload
            self.ok = True
            self.text = json.dumps(payload)

        def raise_for_status(self):
            return None

        def json(self):
            return self._payload

    def fake_post(url, headers=None, json=None, timeout=20):
        return FakeResponse({
            "choices": [{"message": {"content": "Hola desde Groq"}}]
        })

    monkeypatch.setattr(vision.requests, "post", fake_post)

    reply = vision.generate_reply("no_match", "en")

    assert reply == "Hola desde Groq"


def test_generate_reply_uses_groq_when_configured(monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "dummy-groq-key")
    monkeypatch.setenv("AI_PROVIDER", "groq")

    import vision
    importlib.reload(vision)

    class FakeResponse:
        def __init__(self, payload):
            self._payload = payload
            self.ok = True
            self.text = json.dumps(payload)

        def raise_for_status(self):
            return None

        def json(self):
            return self._payload

    def fake_post(url, headers=None, json=None, timeout=20):
        return FakeResponse({
            "choices": [{"message": {"content": "Hola desde Groq"}}]
        })

    monkeypatch.setattr(vision.requests, "post", fake_post)

    reply = vision.generate_reply("no_match", "en")

    assert reply == "Hola desde Groq"


def test_groq_cleanup_strips_thinking_process(monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "dummy-groq-key")
    monkeypatch.setenv("AI_PROVIDER", "groq")

    import vision
    importlib.reload(vision)

    class FakeResponse:
        def __init__(self, payload):
            self._payload = payload
            self.ok = True
            self.text = json.dumps(payload)

        def raise_for_status(self):
            return None

        def json(self):
            return self._payload

    def fake_post(url, headers=None, json=None, timeout=20):
        return FakeResponse({
            "choices": [{"message": {"content": "Here's a thinking process: 1. analyze... Final answer: यह तीन अच्छा विकल्प हैं"}}]
        })

    monkeypatch.setattr(vision.requests, "post", fake_post)

    reply = vision.generate_reply("no_match", "hi")

    assert reply == "यह तीन अच्छा विकल्प हैं"


def test_analyze_image_falls_back_on_groq_error(monkeypatch):
    import requests

    def raise_http_error(*args, **kwargs):
        raise requests.HTTPError("400 Bad Request")

    monkeypatch.setenv("GROQ_API_KEY", "dummy-groq-key")
    monkeypatch.setenv("AI_PROVIDER", "groq")

    import vision
    importlib.reload(vision)
    monkeypatch.setattr(vision.requests, "post", raise_http_error)

    attrs = vision.analyze_image(b"fake-image", media_type="image/jpeg")

    assert attrs["category"] == "other"
