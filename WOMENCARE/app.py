from flask import Flask, render_template, request, jsonify, session, flash, redirect, url_for
from datetime import datetime, timedelta
import json
import os
import uuid
from functools import wraps

app = Flask(__name__)
app.secret_key = 'womens-health-2024-secret-key'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)

# Data Management Functions
def ensure_data_directory():
    """Ensure data directory exists"""
    os.makedirs('data', exist_ok=True)

def load_json_data(filename, default_data=None):
    """Load JSON data from file"""
    ensure_data_directory()
    filepath = f'data/{filename}'
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        if default_data:
            save_json_data(filename, default_data)
        return default_data or []

def save_json_data(filename, data):
    """Save JSON data to file"""
    ensure_data_directory()
    filepath = f'data/{filename}'
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# Initialize Data
def initialize_data():
    """Initialize default data if not exists"""
    doctors_data = [
        {
            'id': 1,
            'name': 'Dr. Priya Sharma',
            'specialization': 'Gynecologist',
            'experience': '15 years',
            'qualifications': ['MBBS', 'MD - Obstetrics & Gynecology'],
            'availability': ['Monday', 'Wednesday', 'Friday'],
            'email': 'drpriya@example.com',
            'phone': '+91-9876543210',
            'bio': 'Specialized in women\'s health, menstrual disorders, and PCOS management. Passionate about empowering women through health education.',
            'is_available': True,
            'response_time': '24-48 hours',
            'languages': ['English', 'Hindi', 'Marathi'],
            'consultation_fee': 'Free (Volunteer)'
        },
        {
            'id': 2,
            'name': 'Dr. Anjali Mehta',
            'specialization': 'Nutritionist & Dietitian',
            'experience': '10 years',
            'qualifications': ['M.Sc Nutrition', 'RD - Registered Dietitian'],
            'availability': ['Tuesday', 'Thursday', 'Saturday'],
            'email': 'dranjali@example.com',
            'phone': '+91-9876543211',
            'bio': 'Expert in menstrual health nutrition, diet planning for hormonal balance, and weight management for women.',
            'is_available': True,
            'response_time': '24 hours',
            'languages': ['English', 'Hindi', 'Gujarati'],
            'consultation_fee': 'Free (Volunteer)'
        }
    ]

    products_data = {
        'disposable_pads': [
            {
                'id': 1,
                'name': 'Disposable Sanitary Pads',
                'description': 'The most commonly used period product that sticks into your underwear and absorbs blood externally',
                'type': 'Disposable',
                'absorption': 'Light to Heavy',
                'duration': '4-8 hours',
                'best_for': 'Beginners, overnight protection, light to heavy flow',
                'pros': [
                    'Simple to use and widely available',
                    'Many different sizes from ultra-thin to thick night pads',
                    'Good for overnight protection',
                    'More comfortable for beginners'
                ],
                'cons': [
                    'Can feel bulky or shift out of place',
                    'Not practical for swimming or water sports',
                    'Environmentally harmful - plastic equivalent to 5 carrier bags per pack',
                    'Can irritate skin if worn too long'
                ],
                'price_range': '₹100 - ₹400 per pack',
                'popular_brands': ['Whisper', 'Stayfree', 'Sofy', 'Carefree'],
                'safety_tips': [
                    'Change every 4-6 hours',
                    'Never wear for more than 8 hours',
                    'Dispose properly in bins',
                    'Choose cotton top layer for breathability'
                ],
                'expert_advice': 'Dr. Tempest advises changing pads regularly and avoiding wearing them for more than 8 hours to prevent skin irritation'
            }
        ],
        'reusable_pads': [
            {
                'id': 1,
                'name': 'Reusable Cloth Pads',
                'description': 'Washable pads made from cotton or bamboo that fasten with poppers and can be reused for years',
                'type': 'Reusable',
                'absorption': 'Light to Heavy',
                'duration': '4-6 hours',
                'lifespan': '3-5 years',
                'best_for': 'Eco-conscious users, sensitive skin, home use',
                'pros': [
                    'Softer and more comfortable than plastic pads',
                    'Eco-friendly and sustainable option',
                    'Cost effective over time',
                    'Variety of sizes and absorbencies available',
                    'Can last 3-5 years with proper care'
                ],
                'cons': [
                    'Need to be washed after each use',
                    'Requires planning and proper drying between uses',
                    'Bulkier than disposable pads',
                    'Less convenient when out - carry used ones home',
                    'Damp fabric can increase infection risk if not dried properly'
                ],
                'price_range': '₹300 - ₹800 per set',
                'popular_brands': ['EcoFemme', 'Saathi', 'Aakar', 'Anandi'],
                'safety_tips': [
                    'Wash thoroughly after each use',
                    'Ensure complete drying before reuse',
                    'Store in clean, dry place',
                    'Sun dry when possible for natural sterilization'
                ],
                'expert_advice': 'Dr. Tempest emphasizes they must be dried properly between uses as damp fabric against skin can increase infection risk'
            }
        ],
        'tampons': [
            {
                'id': 1,
                'name': 'Disposable Tampons',
                'description': 'Inserted into the vagina to soak up blood before it leaves the body, available with or without applicators',
                'type': 'Disposable',
                'absorption': 'Light to Super',
                'duration': '4-8 hours',
                'best_for': 'Active lifestyles, swimming, discreet protection',
                'pros': [
                    'Discreet and small enough to carry in pocket',
                    'Good for sports and swimming activities',
                    'Range of absorbencies for different flows',
                    'No external bulk or visibility'
                ],
                'cons': [
                    'Requires insertion which some find uncomfortable',
                    'Low risk of Toxic Shock Syndrome (TSS) if worn too long',
                    'Environmentally unfriendly',
                    'More expensive long-term than reusable products',
                    'Must be disposed of properly (not flushed)'
                ],
                'price_range': '₹200 - ₹500 per pack',
                'popular_brands': ['Tampax', 'o.b.', 'Playtex', 'Kotex'],
                'safety_tips': [
                    'Change every 4-8 hours',
                    'Never use overnight or for more than 8 hours',
                    'Use lowest absorbency needed',
                    'Wash hands before insertion',
                    'Dispose in bins, never flush'
                ],
                'expert_advice': 'Dr. Tempest stresses that 2.5 million tampons are flushed daily when they should be binned. Proper disposal is crucial.'
            }
        ],
        'menstrual_cups': [
            {
                'id': 1,
                'name': 'Medical Grade Silicone Cups',
                'description': 'Small flexible cups made of medical-grade silicone that collect rather than absorb blood',
                'type': 'Reusable',
                'material': 'Medical Grade Silicone',
                'duration': '6-12 hours',
                'lifespan': '2-10 years',
                'capacity': 'Holds 3x more than tampons',
                'best_for': 'All flow types, eco-conscious users, active lifestyle',
                'pros': [
                    'Most eco-friendly period product available',
                    'Holds up to three times more blood than tampons',
                    'Can be worn for up to 12 hours safely',
                    'Reusable for years (2-10 year lifespan)',
                    'Extremely cost effective over time'
                ],
                'cons': [
                    'Takes practice to insert and remove correctly',
                    'May take time to find the right fit and brand',
                    'Messy to empty, especially in public toilets',
                    'Needs sterilizing between menstrual cycles',
                    'Learning curve for beginners'
                ],
                'price_range': '₹500 - ₹2000 (one-time investment)',
                'popular_brands': ['Sirona', 'Pee Safe', 'Bella', 'Sanfe', 'Boondh'],
                'safety_tips': [
                    'Sterilize before first use and after each cycle',
                    'Wash with mild, unscented soap between uses',
                    'Trim nails before insertion to prevent damage',
                    'Practice insertion and removal before actual need'
                ],
                'expert_advice': 'Dr. Tempest notes different cups suit different needs based on flow heaviness and whether you\'ve had children. Hygiene is crucial - wash hands before insertion and clean cup between uses.'
            }
        ],
        'period_pants': [
            {
                'id': 1,
                'name': 'Period Underwear',
                'description': 'Absorbent underwear with built-in layers that look and feel like regular pants',
                'type': 'Reusable',
                'absorption': 'Light to Moderate',
                'duration': '6-8 hours',
                'lifespan': '2-3 years',
                'best_for': 'Light days, overnight, backup protection, sensitive skin',
                'pros': [
                    'Looks and feels like regular underwear',
                    'No shifting around during wear',
                    'Reusable and eco-friendly',
                    'Can be layered with other products for extra protection',
                    'Built-in waterproof layer and odor lining'
                ],
                'cons': [
                    'Requires washing and drying between uses',
                    'May not be absorbent enough for heavy flows',
                    'Inconvenient for travel without laundry access',
                    'Need to carry used pairs home if changing out',
                    'Limited absorbency compared to other products'
                ],
                'price_range': '₹800 - ₹2000 per pair',
                'popular_brands': ['Thinx', 'Modibodi', 'Knix', 'Wuka', 'Bambody'],
                'safety_tips': [
                    'Rinse immediately after use',
                    'Machine wash with mild detergent',
                    'Air dry completely before reuse',
                    'Don\'t use fabric softeners',
                    'Have multiple pairs for rotation'
                ],
                'expert_advice': 'Dr. Tempest assures they\'re reliable for most people with built-in waterproof layers. Popular for sleeping or lighter days despite initial leakage concerns.'
            }
        ]
    }
    
    # Save initial data
    save_json_data('doctors.json', doctors_data)
    save_json_data('menstrual_products.json', products_data)
    save_json_data('questions.json', [])

# Routes
@app.route('/')
def index():
    """Homepage"""
    return render_template('index.html')

@app.route('/menstrual-products')
def menstrual_products():
    """Menstrual products guide"""
    products = load_json_data('menstrual_products.json')
    return render_template('menstrual_products.html', products=products)

@app.route('/diet-plan')
def diet_plan():
    """Diet plans for menstrual health"""
    diet_plans = {
        'menstrual_phase': {
            'name': 'Menstrual Phase (Days 1-5)',
            'description': 'Focus on iron-rich foods and comfort',
            'foods': [
                {'name': 'Leafy greens', 'benefit': 'Iron for blood loss'},
                {'name': 'Lean red meat', 'benefit': 'Heme iron absorption'},
                {'name': 'Lentils and beans', 'benefit': 'Protein and fiber'},
                {'name': 'Dark chocolate', 'benefit': 'Magnesium for cramps'},
                {'name': 'Warm soups', 'benefit': 'Hydration and comfort'},
                {'name': 'Ginger tea', 'benefit': 'Reduces inflammation'}
            ],
            'avoid': ['Cold foods', 'Excessive caffeine', 'Salty foods', 'Processed snacks'],
            'tips': ['Stay hydrated', 'Small frequent meals', 'Warm beverages']
        },
        'follicular_phase': {
            'name': 'Follicular Phase (Days 6-14)',
            'description': 'Energy boosting and estrogen support',
            'foods': [
                {'name': 'Fresh fruits', 'benefit': 'Natural energy boost'},
                {'name': 'Whole grains', 'benefit': 'Sustained energy'},
                {'name': 'Lean proteins', 'benefit': 'Muscle maintenance'},
                {'name': 'Fermented foods', 'benefit': 'Gut health'},
                {'name': 'Flax seeds', 'benefit': 'Hormone balance'},
                {'name': 'Cruciferous vegetables', 'benefit': 'Liver detox'}
            ],
            'avoid': ['Processed foods', 'Sugary snacks', 'Fried foods'],
            'tips': ['High protein intake', 'Complex carbohydrates', 'Probiotic foods']
        }
    }
    return render_template('diet_plan.html', diet_plans=diet_plans)

@app.route('/hygiene-tips')
def hygiene_tips():
    """Enhanced hygiene tips with visual categories"""
    hygiene_data = {
        'daily_care': {
            'title': 'Daily Personal Care',
            'icon': 'fas fa-shower',
            'color': 'pink',
            'tips': [
                {
                    'title': 'Regular Showering',
                    'description': 'Shower daily during your period to stay fresh and prevent odor',
                    'icon': 'fas fa-shower',
                    'importance': 'high'
                },
                {
                    'title': 'Proper Wiping Technique',
                    'description': 'Always wipe from front to back to prevent bacterial transfer',
                    'icon': 'fas fa-hand-paper',
                    'importance': 'high'
                },
                {
                    'title': 'Clean Underwear',
                    'description': 'Wear clean, breathable cotton underwear daily',
                    'icon': 'fas fa-tshirt',
                    'importance': 'medium'
                },
                {
                    'title': 'Hair Removal Hygiene',
                    'description': 'Keep pubic area clean, especially after hair removal',
                    'icon': 'fas fa-cut',
                    'importance': 'medium'
                }
            ]
        },
        'product_safety': {
            'title': 'Product Safety & Usage',
            'icon': 'fas fa-shield-alt',
            'color': 'purple',
            'tips': [
                {
                    'title': 'Change Frequency',
                    'description': 'Change pads/tampons every 4-6 hours to prevent infections',
                    'icon': 'fas fa-clock',
                    'importance': 'high'
                },
                {
                    'title': 'Tampon Safety',
                    'description': 'Never wear a tampon for more than 8 hours to avoid TSS risk',
                    'icon': 'fas fa-exclamation-triangle',
                    'importance': 'high'
                },
                {
                    'title': 'Proper Disposal',
                    'description': 'Wrap used products properly before disposal',
                    'icon': 'fas fa-trash',
                    'importance': 'medium'
                },
                {
                    'title': 'Storage Matters',
                    'description': 'Store menstrual products in clean, dry places',
                    'icon': 'fas fa-box',
                    'importance': 'medium'
                }
            ]
        },
        'intimate_hygiene': {
            'title': 'Intimate Area Care',
            'icon': 'fas fa-heart',
            'color': 'blue',
            'tips': [
                {
                    'title': 'Avoid Scented Products',
                    'description': 'Don\'t use scented soaps, sprays, or douches in genital area',
                    'icon': 'fas fa-wind',
                    'importance': 'high'
                },
                {
                    'title': 'Gentle Cleansing',
                    'description': 'Use mild, pH-balanced soap for external cleaning only',
                    'icon': 'fas fa-pump-soap',
                    'importance': 'high'
                },
                {
                    'title': 'Proper Drying',
                    'description': 'Pat dry gently after washing - never rub vigorously',
                    'icon': 'fas fa-fan',
                    'importance': 'medium'
                },
                {
                    'title': 'Breathable Clothing',
                    'description': 'Wear loose, breathable clothing to prevent moisture buildup',
                    'icon': 'fas fa-tshirt',
                    'importance': 'medium'
                }
            ]
        },
        'menstrual_care': {
            'title': 'Menstrual Specific Care',
            'icon': 'fas fa-tint',
            'color': 'red',
            'tips': [
                {
                    'title': 'Hand Washing',
                    'description': 'Wash hands before and after changing menstrual products',
                    'icon': 'fas fa-hands-wash',
                    'importance': 'high'
                },
                {
                    'title': 'Cup Sterilization',
                    'description': 'Sterilize menstrual cups before first use and after each cycle',
                    'icon': 'fas fa-virus',
                    'importance': 'high'
                },
                {
                    'title': 'Reusable Product Care',
                    'description': 'Wash reusable pads and period pants thoroughly after each use',
                    'icon': 'fas fa-recycle',
                    'importance': 'medium'
                },
                {
                    'title': 'Skin Protection',
                    'description': 'Use barrier creams if you experience skin irritation from pads',
                    'icon': 'fas fa-plus-square',
                    'importance': 'medium'
                }
            ]
        },
        'lifestyle': {
            'title': 'Lifestyle Habits',
            'icon': 'fas fa-spa',
            'color': 'green',
            'tips': [
                {
                    'title': 'Stay Hydrated',
                    'description': 'Drink plenty of water to flush out toxins and reduce bloating',
                    'icon': 'fas fa-tint',
                    'importance': 'high'
                },
                {
                    'title': 'Healthy Diet',
                    'description': 'Eat balanced meals with fruits, vegetables, and whole grains',
                    'icon': 'fas fa-apple-alt',
                    'importance': 'medium'
                },
                {
                    'title': 'Regular Exercise',
                    'description': 'Moderate exercise improves circulation and reduces cramps',
                    'icon': 'fas fa-walking',
                    'importance': 'medium'
                },
                {
                    'title': 'Adequate Sleep',
                    'description': 'Get 7-9 hours of sleep for hormonal balance and recovery',
                    'icon': 'fas fa-bed',
                    'importance': 'medium'
                }
            ]
        }
    }
    
    return render_template('hygiene_tips.html', hygiene_data=hygiene_data)

@app.route('/period-tracker')
def period_tracker():
    """Period tracker with predictions"""
    cycle_data = session.get('cycle_data', {})
    predictions = {}
    
    if cycle_data and 'last_period' in cycle_data:
        predictions = calculate_cycle_predictions(cycle_data)
    
    return render_template('period_tracker.html', 
                         cycle_data=cycle_data,
                         predictions=predictions)

@app.route('/api/track-cycle', methods=['POST'])
def api_track_cycle():
    """API endpoint to track menstrual cycle"""
    data = request.get_json()
    
    cycle_data = {
        'last_period': data.get('last_period'),
        'cycle_length': data.get('cycle_length', 28),
        'period_length': data.get('period_length', 5),
        'symptoms': data.get('symptoms', []),
        'flow_intensity': data.get('flow_intensity', 'medium'),
        'last_updated': datetime.now().isoformat()
    }
    
    session['cycle_data'] = cycle_data
    session.permanent = True
    
    predictions = calculate_cycle_predictions(cycle_data)
    
    return jsonify({
        'success': True,
        'message': 'Cycle data updated successfully',
        'predictions': predictions
    })

@app.route('/ask-doctor', methods=['GET', 'POST'])
def ask_doctor():
    """Ask a doctor questions"""
    categories = [
        {'id': 'menstrual_health', 'name': 'Menstrual Health', 'icon': 'fas fa-venus'},
        {'id': 'product_advice', 'name': 'Product Advice', 'icon': 'fas fa-box'},
        {'id': 'diet_nutrition', 'name': 'Diet & Nutrition', 'icon': 'fas fa-apple-alt'},
        {'id': 'hygiene', 'name': 'Hygiene', 'icon': 'fas fa-hand-sparkles'},
        {'id': 'mental_health', 'name': 'Mental Health', 'icon': 'fas fa-brain'},
        {'id': 'pcos_pcod', 'name': 'PCOS/PCOD', 'icon': 'fas fa-dna'},
        {'id': 'general_health', 'name': 'General Health', 'icon': 'fas fa-stethoscope'}
    ]
    
    doctors = load_json_data('doctors.json')
    
    if request.method == 'POST':
        question_data = {
            'id': str(uuid.uuid4()),
            'user_name': request.form.get('name'),
            'user_email': request.form.get('email'),
            'user_age': request.form.get('age'),
            'user_phone': request.form.get('phone'),
            'question': request.form.get('question'),
            'category': request.form.get('category'),
            'urgency': request.form.get('urgency', 'normal'),
            'symptoms': request.form.get('symptoms', ''),
            'duration': request.form.get('duration', ''),
            'previous_treatment': request.form.get('previous_treatment', ''),
            'timestamp': datetime.now().isoformat(),
            'status': 'pending',
            'answer': None,
            'answered_by': None,
            'answer_timestamp': None,
            'is_anonymous': request.form.get('is_anonymous') == 'on'
        }
        
        questions = load_json_data('questions.json')
        questions.append(question_data)
        save_json_data('questions.json', questions)
        
        flash('Your question has been submitted! A doctor will respond within 24-48 hours.', 'success')
        return redirect(url_for('question_submitted', question_id=question_data['id']))
    
    return render_template('ask_doctor.html', 
                         categories=categories, 
                         doctors=doctors)

@app.route('/question-submitted/<question_id>')
def question_submitted(question_id):
    """Question submission confirmation"""
    questions = load_json_data('questions.json')
    question = next((q for q in questions if q['id'] == question_id), None)
    return render_template('question_submitted.html', question=question)

@app.route('/view-answer/<question_id>')
def view_answer(question_id):
    """View doctor's answer"""
    questions = load_json_data('questions.json')
    question = next((q for q in questions if q['id'] == question_id), None)
    
    if not question:
        flash('Question not found', 'error')
        return redirect(url_for('ask_doctor'))
    
    return render_template('view_answer.html', question=question)

@app.route('/doctor-dashboard')
def doctor_dashboard():
    """Doctor dashboard to answer questions"""
    questions = load_json_data('questions.json')
    doctors = load_json_data('doctors.json')
    
    pending_questions = [q for q in questions if q['status'] == 'pending']
    answered_questions = [q for q in questions if q['status'] == 'answered']
    
    return render_template('doctor_dashboard.html',
                         pending_questions=pending_questions,
                         answered_questions=answered_questions,
                         doctors=doctors)

@app.route('/answer-question/<question_id>', methods=['GET', 'POST'])
def answer_question(question_id):
    """Answer a specific question"""
    questions = load_json_data('questions.json')
    question = next((q for q in questions if q['id'] == question_id), None)
    
    if not question:
        flash('Question not found', 'error')
        return redirect(url_for('doctor_dashboard'))
    
    if request.method == 'POST':
        for q in questions:
            if q['id'] == question_id:
                q.update({
                    'status': 'answered',
                    'answer': request.form.get('answer'),
                    'answered_by': request.form.get('doctor_name'),
                    'answer_timestamp': datetime.now().isoformat(),
                    'follow_up_advice': request.form.get('follow_up_advice'),
                    'recommendations': request.form.get('recommendations')
                })
                break
        
        save_json_data('questions.json', questions)
        flash('Answer submitted successfully!', 'success')
        return redirect(url_for('doctor_dashboard'))
    
    return render_template('answer_question.html', question=question)

@app.route('/emergency-contacts')
def emergency_contacts():
    """Emergency contacts page"""
    contacts = [
        {
            'name': 'Women Helpline',
            'number': '1091',
            'description': '24/7 National Women Helpline - All India'
        },
        {
            'name': 'Emergency Medical',
            'number': '108',
            'description': 'Ambulance and Emergency Services'
        },
        {
            'name': 'Police',
            'number': '100',
            'description': 'Emergency Police Services'
        },
        {
            'name': 'Mental Health Helpline',
            'number': '1800-599-0019',
            'description': 'KIRAN Mental Health Rehabilitation - 24/7'
        },
        {
            'name': 'Child Helpline',
            'number': '1098',
            'description': '24-hour Child Emergency Service'
        }
    ]
    return render_template('emergency_contacts.html', contacts=contacts)

# Utility Functions
def calculate_cycle_predictions(cycle_data):
    """Calculate menstrual cycle predictions"""
    try:
        last_period = datetime.fromisoformat(cycle_data['last_period'])
        cycle_length = cycle_data.get('cycle_length', 28)
        period_length = cycle_data.get('period_length', 5)
        
        # Next period
        next_period = last_period + timedelta(days=cycle_length)
        
        # Ovulation (typically 14 days before next period)
        ovulation_date = next_period - timedelta(days=14)
        
        # Fertile window
        fertile_start = ovulation_date - timedelta(days=5)
        fertile_end = ovulation_date + timedelta(days=1)
        
        # Current cycle day
        days_since_period = (datetime.now() - last_period).days
        current_cycle_day = max(1, days_since_period + 1)
        
        # Menstrual phase
        phase = "unknown"
        if current_cycle_day <= period_length:
            phase = "menstrual"
        elif current_cycle_day <= 13:
            phase = "follicular"
        elif current_cycle_day <= 15:
            phase = "ovulation"
        else:
            phase = "luteal"
        
        return {
            'next_period': next_period.strftime('%Y-%m-%d'),
            'ovulation_date': ovulation_date.strftime('%Y-%m-%d'),
            'fertile_window_start': fertile_start.strftime('%Y-%m-%d'),
            'fertile_window_end': fertile_end.strftime('%Y-%m-%d'),
            'current_cycle_day': current_cycle_day,
            'current_phase': phase,
            'days_until_next_period': (next_period - datetime.now()).days
        }
    except Exception as e:
        return {}

# Health Quotes API
@app.route('/api/health-quotes')
def api_health_quotes():
    """API for health quotes"""
    quotes = [
        "Your health is your greatest wealth. Prioritize it every day.",
        "Periods are not a problem to solve, but a process to understand and embrace.",
        "Self-care is not selfish. It's essential for your well-being.",
        "Listen to your body - it's smarter than any doctor's advice.",
        "Healthy periods are a sign of a healthy body. Track and understand yours.",
        "Nutrition is medicine. Eat well, feel well, live well.",
        "Mental health is just as important as physical health. Nurture both.",
        "Regular check-ups save lives. Don't skip your health appointments.",
        "Hygiene is the foundation of health. Small habits make big differences.",
        "Your body is your temple. Treat it with love and respect."
    ]
    return jsonify(quotes)

# Error Handlers
@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html'), 500

# Dashboard Routes
@app.route('/dashboard')
def user_dashboard():
    """User dashboard with overview of all features"""
    # Get user data from session
    cycle_data = session.get('cycle_data', {})
    questions = load_json_data('questions.json')
    
    # Filter user's questions
    user_questions = []
    if session.get('user_email'):
        user_questions = [q for q in questions if q.get('user_email') == session.get('user_email')]
    else:
        # For demo, show recent questions
        user_questions = questions[-5:] if questions else []
    
    # Calculate dashboard stats
    dashboard_stats = calculate_dashboard_stats(cycle_data, user_questions)
    
    # Get recent activity
    recent_activity = get_recent_activity(cycle_data, user_questions)
    
    return render_template('dashboard.html',
                         cycle_data=cycle_data,
                         questions=user_questions,
                         stats=dashboard_stats,
                         recent_activity=recent_activity)

def calculate_dashboard_stats(cycle_data, questions):
    """Calculate statistics for dashboard"""
    stats = {
        'cycle_tracked': bool(cycle_data and cycle_data.get('last_period')),
        'questions_asked': len(questions),
        'questions_answered': len([q for q in questions if q.get('status') == 'answered']),
        'current_phase': 'Not tracked',
        'days_until_next_period': '--',
        'cycle_regularity': 'Not enough data'
    }
    
    if cycle_data and cycle_data.get('last_period'):
        predictions = calculate_cycle_predictions(cycle_data)
        stats.update({
            'current_phase': predictions.get('current_phase', 'Unknown').title(),
            'days_until_next_period': predictions.get('days_until_next_period', '--'),
            'current_cycle_day': predictions.get('current_cycle_day', '--')
        })
    
    return stats

def get_recent_activity(cycle_data, questions):
    """Get recent user activity"""
    activity = []
    
    # Add cycle tracking activity
    if cycle_data and cycle_data.get('last_updated'):
        activity.append({
            'type': 'cycle',
            'title': 'Cycle Updated',
            'description': f"Last period: {cycle_data['last_period']}",
            'timestamp': cycle_data.get('last_updated'),
            'icon': 'fas fa-calendar-alt'
        })
    
    # Add question activity
    for question in questions[-3:]:  # Last 3 questions
        activity.append({
            'type': 'question',
            'title': f'Question: {question["category"].replace("_", " ").title()}',
            'description': f'Status: {question["status"].title()}',
            'timestamp': question['timestamp'],
            'icon': 'fas fa-question-circle'
        })
    
    # Sort by timestamp
    activity.sort(key=lambda x: x['timestamp'], reverse=True)
    return activity[:5]  # Return only 5 most recent

@app.route('/api/dashboard-stats')
def api_dashboard_stats():
    """API endpoint for dashboard statistics"""
    cycle_data = session.get('cycle_data', {})
    questions = load_json_data('questions.json')
    
    user_questions = []
    if session.get('user_email'):
        user_questions = [q for q in questions if q.get('user_email') == session.get('user_email')]
    
    stats = calculate_dashboard_stats(cycle_data, user_questions)
    return jsonify(stats)

@app.route('/debug-products')
def debug_products():
    """Debug route to check actual product data structure"""
    products = load_json_data('menstrual_products.json')
    return jsonify(products)

if __name__ == '__main__':
    initialize_data()
    app.run(debug=True, host='0.0.0.0', port=5000)