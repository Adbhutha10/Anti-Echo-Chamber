from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
load_dotenv()  # Loads NEWSAPI_KEY and any other vars from .env

# Import database configuration, NLP engine, and news service
from app.database import SessionLocal, engine, User, ReadHistory, ArticleInventory, Base
from app.nlp_engine import nlp_engine
from app.news_service import news_service

# Create tables instantly (in production use Alembic migrations)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Anti-Echo Chamber API",
    description="API for detecting cognitive bias and tracking user Echo Chamber trajectories.",
    version="1.0.0",
)

# Allow React frontend to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class BiasProfile(BaseModel):
    political_leaning: float  # -1 (Left) to 1 (Right)
    emotional_manipulation: float # 0 to 1
    cognitive_bias: float # 0 to 1

class TrackArticleRequest(BaseModel):
    user_id: int
    text: str

class UserCreate(BaseModel):
    username: str

@app.get("/")
def read_root():
    return {"message": "Anti-Echo Chamber API is running"}

@app.post("/users", response_model=dict)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        # Return existing user instead of erroring — idempotent for extension save flow
        return {"user_id": db_user.id, "username": db_user.username}
    
    new_user = User(username=user.username)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"user_id": new_user.id, "username": new_user.username}

@app.get("/users/by-username/{username}")
def get_user_by_username(username: str, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == username).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user_id": db_user.id, "username": db_user.username}

@app.post("/track", response_model=BiasProfile)
def track_article(request: TrackArticleRequest, db: Session = Depends(get_db)):
    # 1. Verify user exists
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Analyze the text (The Brain)
    results = nlp_engine.analyze_text(request.text)
    bias_score = results["cognitive_bias"]
    emotion_score = results["emotional_manipulation"]
    political_leaning = results["political_leaning"]

    # 3. Store the interaction in the database (The Tracker)
    history_entry = ReadHistory(
        user_id=user.id,
        article_text=request.text,
        political_leaning=round(political_leaning, 2),
        emotional_manipulation=round(emotion_score, 2),
        cognitive_bias=round(bias_score, 2)
    )
    db.add(history_entry)
    db.commit()

    return BiasProfile(
        political_leaning=history_entry.political_leaning,
        emotional_manipulation=history_entry.emotional_manipulation,
        cognitive_bias=history_entry.cognitive_bias
    )

@app.get("/users/{user_id}/profile")
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    history = db.query(ReadHistory).filter(ReadHistory.user_id == user_id).all()
    if not history:
        return {
            "username": user.username,
            "articles_read": 0,
            "status": "No data yet. Go read some articles!"
        }
        
    avg_pol = sum(h.political_leaning for h in history) / len(history)
    avg_emo = sum(h.emotional_manipulation for h in history) / len(history)
    avg_bias = sum(h.cognitive_bias for h in history) / len(history)
    
    # Simple logic to determine echo chamber status
    trapped = False
    warning = ""
    # Tuning threshold down to 0.50 so it triggers realistically based on user tests
    if avg_bias > 0.5 and avg_emo > 0.5:
        trapped = True
        warning = "WARNING: You are currently trapped in a highly biased, emotionally manipulative echo chamber."
        if avg_pol > 0.3:
            warning += " (Right-Leaning)"
        elif avg_pol < -0.3:
            warning += " (Left-Leaning)"

    return {
        "username": user.username,
        "articles_read": len(history),
        "average_political_leaning": round(avg_pol, 2),
        "average_emotional_manipulation": round(avg_emo, 2),
        "average_cognitive_bias": round(avg_bias, 2),
        "echo_chamber_detected": trapped,
        "metrics_warning": warning
    }

@app.get("/users/{user_id}/recommend")
def recommend_article(user_id: int, db: Session = Depends(get_db)):
    # 1. Get user profile metrics
    profile_response = get_user_profile(user_id, db)
    if "status" in profile_response and profile_response["status"].startswith("No data"):
        raise HTTPException(status_code=400, detail="Cannot calculate recommendation without reading history.")
    
    avg_pol = profile_response["average_political_leaning"]
    
    articles = db.query(ArticleInventory).all()
    if not articles:
        raise HTTPException(status_code=500, detail="Article inventory is empty.")
    
    best_article = None
    best_score = float('inf') # lower is better (a penalty system)
    
    for article in articles:
        # Distance calculation
        # 1. Pull political leaning closer to 0 (neutral), but gently (don't give far right to a far left reader immediately)
        # We want the article's political leaning to be exactly half-way between the user's current stance and 0.0
        target_pol = avg_pol / 2.0
        pol_diff = abs(article.political_leaning - target_pol)
        
        # 2. We want emotional manipulation and cognitive bias to be AS LOW AS POSSIBLE.
        manip_penalty = article.emotional_manipulation * 2.0
        bias_penalty = article.cognitive_bias * 2.0
        
        total_penalty = pol_diff + manip_penalty + bias_penalty
        
        if total_penalty < best_score:
            best_score = total_penalty
            best_article = article
            
    if not best_article:
        raise HTTPException(status_code=404, detail="No suitable recommendation found.")
        
    return {
        "recommended_article_id": best_article.id,
        "title": best_article.title,
        "content": best_article.content,
        "url": best_article.url,
        "political_leaning": best_article.political_leaning,
        "emotional_manipulation": best_article.emotional_manipulation,
        "cognitive_bias": best_article.cognitive_bias,
        "depolarization_score": round(10.0 - best_score, 2) # Friendly match metric out of ~10
    }

class LiveScoutRequest(BaseModel):
    user_id: int
    topic: str

@app.post("/live-scout")
def live_scout(req: LiveScoutRequest, db: Session = Depends(get_db)):
    """
    Fetches live news articles on a topic, analyzes them with the NLP engine,
    and returns the best counter-perspective article for the user's current trajectory.
    """
    # Get user's current political leaning to find counter-perspective
    profile = get_user_profile(req.user_id, db)
    avg_pol = profile.get("average_political_leaning", 0.0)

    # Fetch live articles via NewsService
    raw_articles = news_service.search_counter_perspectives(req.topic, avg_pol, limit=5)
    if not raw_articles:
        raise HTTPException(status_code=404, detail="No live articles found for this topic.")

    # Analyze each article with the NLP engine
    scored_articles = []
    for article in raw_articles:
        content = article.get("content") or article.get("description", "")
        if not content or len(content) < 20:
            continue
        try:
            scores = nlp_engine.analyze_text(content)
            scored_articles.append({**article, **scores})
        except Exception:
            continue

    if not scored_articles:
        raise HTTPException(status_code=500, detail="Could not analyze any live articles.")

    # Pick the best antidote: lowest bias + emotion, highest opposition to user's leaning
    best = min(
        scored_articles,
        key=lambda a: a["cognitive_bias"] + a["emotional_manipulation"] + abs(a["political_leaning"] - (-avg_pol))
    )

    return {
        "source": "live",
        "title": best.get("title", "Untitled"),
        "content": best.get("description") or best.get("content", "")[:400],
        "url": best.get("url", "#"),
        "publisher": best.get("source", "Unknown"),
        "cognitive_bias": best["cognitive_bias"],
        "emotional_manipulation": best["emotional_manipulation"],
        "political_leaning": best["political_leaning"],
        "live_mode": news_service.live_mode
    }
