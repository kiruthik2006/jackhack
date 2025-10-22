# ------------------ IMPORTS ------------------
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import firebase_admin
from firebase_admin import credentials, db
import requests
import json
import feedparser
import base64
import io
from PIL import Image

# ------------------ FLASK APP SETUP ------------------
app = Flask(__name__)
app.secret_key = "supersecretkey"
OPENROUTER_API_KEY = "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"
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL_NAME = "x-ai/grok-4-fast:free"
# ------------------ KERALA MULTI-RSS NEWS ENDPOINT ------------------
# Aggregates 5 Kerala official RSS feeds for dashboard slider
@app.route('/kerala_news_multi')
def kerala_news_multi():
    rss_feeds = [
        {
            "url": "https://www.keralaagriculture.gov.in/en/feed/",
            "source": "Kerala Agriculture Main"
        },
        {
            "url": "https://www.keralaagriculture.gov.in/en/crops/feed/",
            "source": "Kerala Crops"
        },
        {
            "url": "https://www.keralaagriculture.gov.in/en/organic-farming/feed/",
            "source": "Organic Farming"
        },
        {
            "url": "https://www.keralaagriculture.gov.in/en/pesticide-management/feed/",
            "source": "Pesticide Management"
        },
        {
            "url": "https://www.keralaagriculture.gov.in/en/plant-health/feed/",
            "source": "Plant Health"
        }
    ]
    items = []
    for feed in rss_feeds:
        try:
            parsed = feedparser.parse(feed["url"])
            for entry in parsed.entries[:3]:
                items.append({
                    "title": entry.title,
                    "link": entry.link,
                    "source": feed["source"]
                })
        except Exception:
            continue
    # Sort by most recent if possible
    items = items[:15]
    return jsonify({"items": items})
@app.route('/api/chat-image', methods=['POST'])
def chat_with_image():
    user_text = request.form.get('message', '').strip()
    if not user_text and 'image' not in request.files:
        return jsonify({"response": "⚠️ Please provide text or an image"}), 400

    prompt = user_text if user_text else ""

    # Handle image if uploaded
    if 'image' in request.files:
        img = Image.open(request.files['image'].stream)
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_b64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        # Add to the prompt for the model
        prompt += f"\n\nHere is an image in base64 format: data:image/png;base64,{img_b64}\n"
        prompt += "Please analyze the image in the context of my question."

    # Send to OpenRouter API
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    messages = [
        {"role": "user", "content": [{"type": "text", "text": prompt}]}
    ]

    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "response_format": {"type": "json_object"},
    }

    try:
        response = requests.post(OPENROUTER_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        json_response = response.json()
        if 'choices' in json_response and len(json_response['choices']) > 0:
            bot_reply = json_response['choices'][0]['message'].get('content', "⚠️ No content in response")
        else:
            bot_reply = "⚠️ No valid response received"
        return jsonify({"response": bot_reply})
    except Exception as e:
        return jsonify({"response": f"⚠️ Error: {str(e)}"}), 500

    # ...existing code...

# ------------------ FIREBASE SETUP ------------------
cred = credentials.Certificate("config/serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://smart-crop-86220-default-rtdb.firebaseio.com/"
})
users_ref = db.reference("users")

# ------------------ OLLAMA SETUP ------------------
OLLAMA_API_URL = "http://127.0.0.1:11434/api/chat"  # Local Ollama endpoint
OLLAMA_MODEL = "gemma3:1b"  # Replace with your model name

def query_gemma(prompt):
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [{"role": "user", "content": prompt}]
    }
    try:
        r = requests.post(OLLAMA_API_URL, json=payload)
        r.raise_for_status()

        # Safe JSON parsing
        try:
            data = r.json()
        except Exception:
            # Handle multiple JSON objects separated by newlines
            lines = r.text.strip().splitlines()
            data = None
            for line in reversed(lines):
                if line.strip():
                    data = json.loads(line)
                    break
            if data is None:
                return "No response from model."

        # Handle different response structures
        if "completion" in data:
            return data["completion"]
        elif "choices" in data and len(data["choices"]) > 0:
            return data["choices"][0].get("message", {}).get("content", "No response.")
        elif "output" in data and len(data.get("output", [])) > 0:
            return data["output"][0].get("content", "No response.")
        return "No response from model."

    except requests.exceptions.ConnectionError:
        return "Cannot connect to Ollama. Is it running?"
    except Exception as e:
        return f"Error connecting to model: {e}"

# ------------------ ROUTES ------------------

@app.route('/')
def home():
    return redirect(url_for('login'))

# Signup
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        phone = request.form.get('phone', '').strip()
        location = request.form.get('location', '').strip()
        password = request.form.get('password', '').strip()

        if not username or not password:
            flash('Username and password are required.')
            return redirect(url_for('signup'))

        all_users = users_ref.get() or {}
        for uid, user in all_users.items():
            if user.get('username') == username:
                flash('Username already exists. Please login.')
                return redirect(url_for('login'))

        hashed_pw = generate_password_hash(password)
        users_ref.push({
            "username": username,
            "phone": phone,
            "location": location,
            "password": hashed_pw
        })

        flash('Account created successfully. Please login.')
        return redirect(url_for('login'))

    return render_template('signup.html')

# Login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()

        if not username or not password:
            flash('Username and password are required.')
            return redirect(url_for('login'))

        all_users = users_ref.get() or {}
        for uid, user in all_users.items():
            if user.get('username') == username:
                if check_password_hash(user.get('password', ''), password):
                    session['user'] = {
                        "id": uid,
                        "username": user.get('username'),
                        "phone": user.get('phone', ''),
                        "location": user.get('location', '')
                    }
                    flash('Logged in successfully.')
                    return redirect(url_for('dashboard'))
                else:
                    flash('Incorrect password.')
                    return redirect(url_for('login'))

        flash('Username not found.')
        return redirect(url_for('login'))

    return render_template('login.html')

# Dashboard
@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        flash('Please login first!')
        return redirect(url_for('login'))
    return render_template('dashboard.html', user=session['user'])
# Add this
@app.route('/profile_page')
def profile_page():
    return render_template('profile.html')
# Logout
@app.route('/logout')
def logout():
    session.pop('user', None)
    flash('You have been logged out.')
    return redirect(url_for('login'))

# Chatbot API endpoint
@app.route('/ask', methods=['POST'])
def ask_gemma():
    data = request.get_json(force=True)
    prompt = data.get('prompt', '').strip()
    if not prompt:
        return jsonify({"answer": "Please provide a question."})

    answer = query_gemma(prompt)
    return jsonify({"answer": answer})


# ------------------ WEATHER API ENDPOINT ------------------
# Example: /weather?district=Thiruvananthapuram
# ------------------ WEATHER API ENDPOINT ------------------
# Example: /weather?district=Thiruvananthapuram
@app.route('/weather')
def weather():
    district = request.args.get('district', '').title()  # Make lookup case-insensitive
    # Map district to coordinates
    coords = {
        "Thiruvananthapuram": [8.5241, 76.9366],
        "Kollam": [8.8932, 76.6141],
        "Pathanamthitta": [9.2647, 76.7870],
        "Alappuzha": [9.4981, 76.3388],
        "Kottayam": [9.5916, 76.5222],
        "Idukki": [9.8497, 77.1087],
        "Ernakulam": [9.9816, 76.2999],
        "Thrissur": [10.5276, 76.2144],
        "Palakkad": [10.7867, 76.6548],
        "Malappuram": [11.0734, 76.0886],
        "Kozhikode": [11.2588, 75.7804],
        "Wayanad": [11.6854, 76.1320],
        "Kannur": [11.8745, 75.3704],
        "Kasaragod": [12.5000, 75.0000]
    }
    latlon = coords.get(district)
    if not latlon:
        return jsonify({"error": "Invalid district"}), 400

    api_key = "3ba2772b76bded937e432ad45e1ad27c"  # Replace with your key
    url = f"https://api.openweathermap.org/data/2.5/forecast?lat={latlon[0]}&lon={latlon[1]}&appid={api_key}&units=metric"

    try:
        resp = requests.get(url)
        data = resp.json()

        if 'list' not in data:
            return jsonify({"error": "Weather API returned no data"}), 500

        # Extract next 3 days forecast (every 8th item for daily summary)
        forecast = []
        for i in range(0, min(24, len(data['list'])), 8):
            item = data['list'][i]
            forecast.append({
                "date": item['dt_txt'],
                "temp": item['main']['temp'],
                "desc": item['weather'][0]['description'],
                "icon": item['weather'][0]['icon']
            })

        return jsonify({"district": district, "forecast": forecast})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ------------------ DISEASE DETECTOR ENDPOINT ------------------
# Receives image upload, simulates disease detection, returns tips and official Kerala links
from werkzeug.utils import secure_filename
import os
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

@app.route('/analyze_disease', methods=['POST'])
def analyze_disease():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded."}), 400
    image = request.files['image']
    filename = secure_filename(image.filename).lower()
    temp_path = os.path.join('config', 'temp_' + filename)
    image.save(temp_path)

    # Kerala official crop disease tips (simulate detection by filename keyword)
    kerala_disease_db = [
        {
            "name": "Rice Blast",
            "keywords": ["rice", "blast"],
            "tips": [
                "Use resistant rice varieties recommended by Kerala Agriculture Department.",
                "Apply fungicides as per official guidelines.",
                "Maintain proper field drainage and avoid excess nitrogen.",
                "Refer to Kerala Rice Disease Management: https://www.keralaagriculture.gov.in/en/rice/"
            ],
            "official_link": "https://www.keralaagriculture.gov.in/en/rice/"
        },
        {
            "name": "Banana Sigatoka",
            "keywords": ["banana", "sigatoka"],
            "tips": [
                "Remove and destroy affected banana leaves.",
                "Use recommended fungicides as per Kerala guidelines.",
                "Ensure good air circulation in plantations.",
                "Refer to Kerala Banana Disease Management: https://www.keralaagriculture.gov.in/en/banana/"
            ],
            "official_link": "https://www.keralaagriculture.gov.in/en/banana/"
        },
        {
            "name": "Coconut Bud Rot",
            "keywords": ["coconut", "bud rot"],
            "tips": [
                "Remove and destroy affected coconut buds.",
                "Apply Bordeaux mixture as per Kerala Agriculture guidelines.",
                "Improve drainage and avoid waterlogging.",
                "Refer to Kerala Coconut Disease Management: https://www.keralaagriculture.gov.in/en/coconut/"
            ],
            "official_link": "https://www.keralaagriculture.gov.in/en/coconut/"
        },
        {
            "name": "Pepper Quick Wilt",
            "keywords": ["pepper", "quick wilt"],
            "tips": [
                "Remove and destroy wilted pepper vines.",
                "Apply recommended fungicides as per Kerala guidelines.",
                "Ensure proper drainage and avoid water stagnation.",
                "Refer to Kerala Pepper Disease Management: https://www.keralaagriculture.gov.in/en/pepper/"
            ],
            "official_link": "https://www.keralaagriculture.gov.in/en/pepper/"
        },
        {
            "name": "Vegetable Leaf Spot",
            "keywords": ["vegetable", "leaf spot", "tomato", "brinjal", "chilli"],
            "tips": [
                "Remove affected leaves and destroy them.",
                "Apply recommended fungicide as per Kerala agriculture guidelines.",
                "Rotate crops to prevent disease buildup.",
                "Refer to Kerala Vegetable Disease Management: https://www.keralaagriculture.gov.in/en/vegetables/"
            ],
            "official_link": "https://www.keralaagriculture.gov.in/en/vegetables/"
        }
    ]

    # Default tips if no match
    tips = [
        "Remove affected plant parts and destroy them as per Kerala guidelines.",
        "Apply recommended fungicide/pesticide as per Kerala agriculture department.",
        "Consult local agricultural officer for further help.",
        "Refer to Kerala Crop Protection: https://www.keralaagriculture.gov.in/en/crop-protection/"
    ]
    official_link = "https://www.keralaagriculture.gov.in/en/crop-protection/"

    # Simulate detection: match filename keywords to disease
    for disease in kerala_disease_db:
        if any(kw in filename for kw in disease["keywords"]):
            tips = disease["tips"]
            official_link = disease["official_link"]
            break

    # Clean up temp image (optional)
    try:
        os.remove(temp_path)
    except Exception:
        pass

    return jsonify({
        "tips": tips,
        "official_link": official_link
    })

if __name__ == '__main__':
    app.run(debug=True)
