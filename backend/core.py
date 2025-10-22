from flask import Flask, request, jsonify
import requests
from utils import clean_output

app = Flask(__name__)

# ---- Simple configuration ----
OPENROUTER_API_KEY = "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"  # <-- paste your key here
OPENROUTER_BASE = "https://openrouter.ai/api/v1"
DEFAULT_MODEL = "google/gemma-3n-e2b-it:free"

@app.route("/")
def home():
    return jsonify({"status": "Grok API Flask backend running"})

@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    if not data or "prompt" not in data:
        return jsonify({"error": "Missing 'prompt' in request body"}), 400

    prompt = data["prompt"]
    model = data.get("model", DEFAULT_MODEL)
    max_tokens = data.get("max_tokens", 500)
    temperature = data.get("temperature", 0.7)

    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": temperature,
    }

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        res = requests.post(
            f"{OPENROUTER_BASE}/chat/completions",
            headers=headers,
            json=payload,
            timeout=30,
        )
        res.raise_for_status()
        result = res.json()

        message = result["choices"][0]["message"]["content"]
        return jsonify({
            "model": model,
            "output": clean_output(message)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)