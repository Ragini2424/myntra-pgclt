import importlib
import sys
from types import SimpleNamespace


def _fake_anthropic_module():
    class AuthenticationError(Exception):
        pass

    class Anthropic:
        def __init__(self, api_key):
            pass

        def messages(self, *args, **kwargs):
            raise NotImplementedError

    return SimpleNamespace(Anthropic=Anthropic, AuthenticationError=AuthenticationError)


def test_generate_reply_falls_back_on_auth_error(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "dummy-anthropic-key")
    monkeypatch.setenv("AI_PROVIDER", "anthropic")
    monkeypatch.setitem(sys.modules, "anthropic", _fake_anthropic_module())

    import vision
    importlib.reload(vision)

    def raise_auth_error(*args, **kwargs):
        raise vision.AuthenticationError("invalid x-api-key")

    vision.client = SimpleNamespace(messages=SimpleNamespace(create=raise_auth_error))

    reply = vision.generate_reply("no_match", "en")

    assert reply
    assert "try again" in reply.lower()
