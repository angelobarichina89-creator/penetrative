"""Local web app with TinyFish-powered book discovery."""

import os
from pathlib import Path

# pyright: reportMissingImports=false
from flask import Flask, abort, jsonify, request, send_from_directory
from dotenv import load_dotenv
from tinyfish import (
    APIConnectionError,
    APIStatusError,
    AuthenticationError,
    RateLimitError,
    SDKError,
    TinyFish,
)


APP_DIRECTORY = Path(__file__).resolve().parent
DEFAULT_RUNTIME_ATTEMPT_ID = "5f25087a-32b3-49fd-9972-55506e4f03b7"

app = Flask(__name__, static_folder=None)
app.config["MAX_CONTENT_LENGTH"] = 256 * 1024


@app.errorhandler(413)
def request_too_large(_error):
    return jsonify(error="The request is too large. Please shorten your search request."), 413


@app.get("/")
def serve_home():
    return send_from_directory(APP_DIRECTORY, "index.html")


@app.get("/images/<path:filename>")
@app.get("/Images/<path:filename>")
def serve_images(filename: str):
    return send_from_directory(APP_DIRECTORY / "images", filename)


@app.get("/image/<path:filename>")
def serve_legacy_images(filename: str):
    return send_from_directory(APP_DIRECTORY / "image", filename)


@app.get("/<path:asset_path>")
def serve_asset(asset_path: str):
    if asset_path not in {"script.js", "style.css"}:
        abort(404)
    return send_from_directory(APP_DIRECTORY, asset_path)


def _limited_text(value: object, max_length: int) -> str:
    return value.strip()[:max_length] if isinstance(value, str) else ""


def create_client() -> TinyFish:
    load_dotenv()
    api_key = os.getenv("TINYFISH_API_KEY")
    if not api_key:
        raise ValueError(
            "TINYFISH_API_KEY is not set. Add your TinyFish API key to .env "
            "before using search."
        )

    os.environ["TINYFISH_RUNTIME_ATTEMPT_ID"] = os.getenv(
        "TINYFISH_RUNTIME_ATTEMPT_ID",
        DEFAULT_RUNTIME_ATTEMPT_ID
    )
    return TinyFish(api_key=api_key, timeout=30, max_retries=1)


def _search_results(query: str, purpose: str) -> list[dict[str, str]]:
    client = create_client()
    response = client.search.query(
        query,
        purpose=purpose,
        location="US",
        language="en",
    )
    results = []
    for result in response.results[:8]:
        title = _limited_text(result.title, 300)
        url = _limited_text(result.url, 2000)
        if not title or not url.startswith(("https://", "http://")):
            continue
        results.append({
            "title": title,
            "url": url,
            "site_name": _limited_text(result.site_name, 200),
            "snippet": _limited_text(result.snippet, 1000)
        })
    return results


def _tinyfish_error_response(error: SDKError):
    if isinstance(error, AuthenticationError):
        return jsonify(error="TinyFish rejected the API key. Check TINYFISH_API_KEY."), 401
    if isinstance(error, RateLimitError):
        return jsonify(error="TinyFish search is rate limited. Please try again later."), 429
    if isinstance(error, APIConnectionError):
        return jsonify(error="Could not connect to TinyFish. Check your internet connection."), 503
    if isinstance(error, APIStatusError):
        app.logger.error("TinyFish returned HTTP %s: %s", error.status_code, error)
        if error.status_code in {402, 403}:
            return jsonify(error="TinyFish account access or credits are insufficient. Check your TinyFish account."), 502
    else:
        app.logger.exception("TinyFish SDK failed")
    return jsonify(error="TinyFish could not complete the search. Please try again."), 502


@app.post("/api/ai/chat")
def ai_chat():
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        return jsonify(error="Send a JSON request body."), 400

    query = _limited_text(body.get("message"), 500)
    if not query:
        return jsonify(error="Enter a search question."), 400

    try:
        results = _search_results(query, "Find useful web pages that answer the reader's question.")
    except ValueError as error:
        return jsonify(error=str(error)), 503
    except SDKError as error:
        return _tinyfish_error_response(error)
    return jsonify(query=query, results=results)


@app.post("/api/ai/recommendations")
def ai_recommendations():
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        return jsonify(error="Send a JSON request body."), 400

    preference = _limited_text(body.get("preference"), 500)
    if not preference:
        return jsonify(error="Tell us what you would like to read."), 400
    favorites = body.get("favorites", [])
    if not isinstance(favorites, list):
        favorites = []
    favorites = [_limited_text(title, 120) for title in favorites[:5] if isinstance(title, str)]
    recent = body.get("recentlyViewed", [])
    if not isinstance(recent, list):
        recent = []
    recent = [_limited_text(title, 120) for title in recent[:5] if isinstance(title, str)]

    query_parts = [f"best books for {preference}"]
    if favorites:
        query_parts.append("similar to " + ", ".join(favorites))
    if recent:
        query_parts.append("reader recently viewed " + ", ".join(recent))
    query = _limited_text("; ".join(query_parts), 500)

    try:
        results = _search_results(
            query,
            "Find book recommendations and reviews that match the reader's interests."
        )
    except ValueError as error:
        return jsonify(error=str(error)), 503
    except SDKError as error:
        return _tinyfish_error_response(error)
    return jsonify(query=query, recommendations=results)


if __name__ == "__main__":
    print("Penetrative Library is running at http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=False)