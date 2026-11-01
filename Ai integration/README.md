# Penetrative Library

The library app includes an AI assistant in its existing customer-support chat. When a support admin is away, the assistant can answer library questions with OpenRouter. Quick-help options and the human-support inbox continue to work.

## Setup

1. Install Python 3.10 or later.
2. Create and activate a virtual environment, then install dependencies:

   ```powershell
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   python -m pip install -r requirements.txt
   ```

3. Add your OpenRouter key to `.env`:

   ```dotenv
   OPENROUTER_API_KEY=your-key-here
   ```

   You can optionally set `OPENROUTER_MODEL` in the same file to override the default model.

## Start the library

```powershell
python main.py
```

The app opens in your browser at `http://127.0.0.1:8000`. Sign in, then use the floating chat button to talk to the AI assistant. Conversation context is kept for the current browser session; existing support messages remain in the library app. Keep the terminal open while using the app and press `Ctrl+C` there to stop the server.

Set `ASSISTANT_PORT` to use another port. The API key can also be supplied through the `OPENROUTER_API_KEY` environment variable.
