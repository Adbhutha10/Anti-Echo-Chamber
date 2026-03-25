# 🧠 Anti-Echo Chamber & Cognitive Bias Neutralizer

## 📖 The Vision
Algorithms on modern social media platforms and news aggregators are optimized to maximize engagement, often prioritizing outrage or fear to keep users clicking. This dynamic traps readers inside an **"Echo Chamber"**, severely limiting their exposure to diverse viewpoints and reinforcing pre-existing biases. 

The **Anti-Echo Chamber System** acts as a "Cognitive Bias Neutralizer." Instead of pushing audiences deeper into polarized feeds, it objectively analyzes text semantics, maps a user's media consumption trajectory, and actively attempts to pull them back toward the center by recommending factual, non-manipulative counter-perspectives.

---

## 🏗️ System Architecture (The Road Map)

This application is built in four distinct phases to tackle the massive complexities of deploying a full-scale Machine Learning product:

### Phase 1: The Brain (NLP Inference Engine)
The core backend API powering the analysis. Built on **FastAPI**, it ingests any news article or snippet and processes it through transformer models (e.g., `bart-large-mnli` zero-shot classification) to grade it on three specific axes:
1. **Cognitive Bias:** Analyzes if the text is objective reporting or heavily opinionated/fake news.
2. **Emotional Manipulation:** Detects outrage-bait, subjective framing, and fear-mongering.
3. **Political Leaning:** Determines if the rhetoric aligns with liberal/progressive or conservative/right-wing talking points.

### Phase 2: The Tracker (User Profiling Database)
A database layer (SQLite/SQLAlchemy) that attaches to a specific user. As the user traverses the web, it stores the bias profiles of the articles they consume in real-time. This historical data is used to calculate their overall **Echo Chamber Trajectory**—detecting if they are suddenly spiraling into a high-stress, closed loop.

### Phase 3: The Cure (Reinforcement Learning Agent)
Once trapped, simply aggressively contradicting a user causes cognitive backfire. The recommendation engine utilizes **Reinforcement Learning (RL)** to find articles that are just *slightly* closer to the center, gently nudging them out of radicalized media pockets without making them defensive.

### Phase 4: The Product (Chrome Extension)
The entire analytical stack packaged into a sleek browser extension. Edge-optimized machine learning models optionally process text securely in the browser. When you visit a highly biased webpage, a visual dial displays the real-time bias score and offers objective counter-articles dynamically.

---

## 🚀 Getting Started

Ensure you have Python 3.10+ installed and a virtual environment activated. 

### 1. Installation
```bash
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux (run `source venv/bin/activate`)

pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### 2. Running the API Locally
To start the FastAPI zero-shot classification server (Note: the first initialization will download a 1.6GB Hugging Face model):
```bash
uvicorn app.main:app --reload
```

### 3. Testing
Navigate to `http://localhost:8000/docs` in your browser. Open the `POST /analyze` route to pass raw text to the inference engine and receive real-time political and emotional manipulation metrics!
