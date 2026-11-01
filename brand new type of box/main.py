import os

from dotenv import load_dotenv
from openai import APIConnectionError, APIError, AuthenticationError, OpenAI, RateLimitError

MODEL = "recursive/flint-v1.0:free"
SYSTEM_PROMPT = (
    "You are a helpful, honest AI assistant. Answer clearly, ask clarifying questions "
    "when needed, and be transparent about uncertainty."
)


def main() -> None:
    load_dotenv()

    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise SystemExit(
            "Set OPENROUTER_API_KEY in a .env file or your environment before running this script."
        )

    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
    )
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    print("AI assistant ready. Type /reset to clear the conversation or /exit to quit.")
    while True:
        try:
            user_input = input("\nYou: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye!")
            return

        if not user_input:
            continue
        if user_input.lower() in {"/exit", "/quit"}:
            print("Goodbye!")
            return
        if user_input.lower() == "/reset":
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            print("Conversation cleared.")
            continue

        conversation = messages + [{"role": "user", "content": user_input}]
        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=conversation,
                extra_body={"reasoning": {"enabled": True}},
            )
        except AuthenticationError:
            print(
                "OpenRouter rejected the API key. Replace OPENROUTER_API_KEY in .env "
                "with an active key."
            )
            continue
        except RateLimitError:
            print("OpenRouter rate limit reached. Wait a bit and try again.")
            continue
        except APIConnectionError:
            print("Could not connect to OpenRouter. Check your internet connection and retry.")
            continue
        except APIError as error:
            print(f"OpenRouter request failed: {error}")
            continue

        assistant_message = response.choices[0].message
        assistant_turn = {"role": "assistant", "content": assistant_message.content or ""}
        reasoning_details = getattr(assistant_message, "reasoning_details", None)
        if reasoning_details is not None:
            assistant_turn["reasoning_details"] = reasoning_details
        messages.extend(
            [
                {"role": "user", "content": user_input},
                assistant_turn,
            ]
        )
        print(f"\nAssistant: {assistant_message.content or '(No text response.)'}")


if __name__ == "__main__":
    main()
