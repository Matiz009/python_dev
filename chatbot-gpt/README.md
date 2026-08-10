# Grok Chatbot

A simple Python chatbot that uses the Grok API through the OpenAI-compatible client.

## Setup

1. Create a virtual environment and install dependencies:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. Create or update `.env` and set your Grok API key.
3. Run the chatbot:
   ```bash
   python chatbot.py
   ```

## Testing

```bash
pytest -q
```
