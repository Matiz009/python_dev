from types import SimpleNamespace

import httpx
from openai import RateLimitError

from chatbot import build_messages, get_response


class RateLimitClient:
    class Chat:
        class Completions:
            def create(self, **kwargs):
                response = httpx.Response(429, request=httpx.Request("POST", "https://api.openai.com/v1/chat/completions"))
                raise RateLimitError(message="quota exceeded", response=response, body={})

        completions = Completions()

    chat = Chat()


def test_build_messages_includes_system_and_history():
    history = [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hi there!"},
    ]

    messages = build_messages(history, "How are you?")

    assert messages[0]["role"] == "system"
    assert messages[1]["role"] == "user"
    assert messages[2]["role"] == "assistant"
    assert messages[3]["role"] == "user"
    assert messages[3]["content"] == "How are you?"


class RecordingClient:
    class Chat:
        class Completions:
            def __init__(self):
                self.last_kwargs = None

            def create(self, **kwargs):
                self.last_kwargs = kwargs
                return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content="Hello from Grok"))])

        def __init__(self):
            self.completions = self.Completions()

    def __init__(self):
        self.chat = self.Chat()


def test_get_response_uses_grok_model_from_environment(monkeypatch):
    monkeypatch.setenv("GROK_MODEL", "grok-2")
    client = RecordingClient()

    reply = get_response(client, [], "Hello")

    assert reply == "Hello from Grok"
    assert client.chat.completions.last_kwargs["model"] == "grok-2"


def test_get_response_returns_fallback_when_rate_limited():
    reply = get_response(RateLimitClient(), [], "Hello")

    assert "quota" in reply.lower() or "temporarily unavailable" in reply.lower()
