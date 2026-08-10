import os
from typing import List, Dict

from dotenv import load_dotenv
from openai import OpenAI, APIError, RateLimitError

load_dotenv()

DEFAULT_SYSTEM_PROMPT = "You are a helpful assistant. Answer clearly and concisely."


def get_client() -> OpenAI:
    api_key = os.getenv("GROK_API_KEY") or os.getenv("OPENAI_API_KEY")
    base_url = os.getenv("GROK_BASE_URL", "https://api.x.ai/v1")
    return OpenAI(api_key=api_key, base_url=base_url)


def build_messages(history: List[Dict[str, str]], user_message: str) -> List[Dict[str, str]]:
    messages: List[Dict[str, str]] = [{"role": "system", "content": DEFAULT_SYSTEM_PROMPT}]
    for item in history:
        messages.append({"role": item["role"], "content": item["content"]})
    messages.append({"role": "user", "content": user_message})
    return messages


def get_response(client: OpenAI, history: List[Dict[str, str]], user_message: str) -> str:
    messages = build_messages(history, user_message)
    try:
        response = client.chat.completions.create(
            model=os.getenv("GROK_MODEL", "grok-beta"),
            messages=messages,
            temperature=0.7,
            max_tokens=300,
        )
        return response.choices[0].message.content.strip()
    except (RateLimitError, APIError) as exc:
        return f"I’m temporarily unavailable right now because the API returned an error: {exc}. Please try again later or check your Grok quota and API key."


def main() -> None:
    api_key = os.getenv("GROK_API_KEY") or os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("Missing GROK_API_KEY. Create a .env file and add your Grok API key.")
        return

    client = get_client()
    history: List[Dict[str, str]] = []

    print("Chatbot ready. Type 'exit' to quit.")
    while True:
        user_message = input("You: ").strip()
        if user_message.lower() in {"exit", "quit"}:
            break
        if not user_message:
            continue

        reply = get_response(client, history, user_message)
        print(f"Bot: {reply}")
        history.append({"role": "user", "content": user_message})
        history.append({"role": "assistant", "content": reply})


if __name__ == "__main__":
    main()
