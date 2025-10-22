from flask import Flask, request, jsonify, render_template
import requests, json

app = Flask(__name__, template_folder='templates', static_folder='static')

OPENROUTER_API_KEY = "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"
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL_NAME = "x-ai/grok-4-fast:free"  # change if needed

@app.route('/chatbot')
def index():
    return render_template("chat.html")

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    prompt = data.get("message", "")
    if not prompt:
        return jsonify({"response": "⚠️ No message provided"}), 400

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        # Optional for OpenRouter rankings:
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "Agri AI Chatbot"
    }

    payload = {
        "model": MODEL_NAME,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 500
    }

    try:
        response = requests.post(
            OPENROUTER_API_URL,
            headers=headers,
            data=json.dumps(payload),
            timeout=30
        )
        response.raise_for_status()
        json_response = response.json()
        if 'choices' in json_response and len(json_response['choices']) > 0:
            bot_reply = json_response['choices'][0]['message'].get('content', "⚠️ No content in response")
        else:
            bot_reply = "⚠️ No valid response received"
        return jsonify({"response": bot_reply})
    except Exception as e:
        return jsonify({"response": f"⚠️ Error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)