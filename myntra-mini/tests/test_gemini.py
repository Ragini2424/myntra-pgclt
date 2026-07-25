import importlib
import os


def test_generate_reply_uses_gemini_when_configured(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "dummy-gemini-key")
    monkeypatch.setenv("AI_PROVIDER", "gemini")

    import vision
    importlib.reload(vision)
    class FakeResponse:
        def __init__(self, payload):
            self._payload = payload
            self.ok = True

        def raise_for_status(self):
            return None

        def json(self):
            return self._payload

    def fake_post(url, json=None, timeout=20):
        return FakeResponse({
            "candidates": [{"content": {"parts": [{"text": "Hola desde Gemini"}]}}]
        })

    monkeypatch.setattr(vision.requests, "post", fake_post)

    reply = vision.generate_reply("no_match", "en")

    assert reply == "Hola desde Gemini"
