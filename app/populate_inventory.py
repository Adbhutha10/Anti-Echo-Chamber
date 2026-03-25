import os
import sys

# Ensure correct path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, ArticleInventory, engine, Base

# Ensure tables are created
Base.metadata.create_all(bind=engine)

MOCK_ARTICLES = [
    {
        "title": "A Centrist Discussion on Tax Reform",
        "content": "Experts across the aisle sat down today to review the potential economic impacts of the proposed 2026 tax bracket recalibration. Both conservative and liberal economists presented detailed models suggesting a mixed outcome for middle-income families.",
        "url": "https://example.com/centrist-tax",
        "political_leaning": 0.05,
        "emotional_manipulation": 0.10,
        "cognitive_bias": 0.10
    },
    {
        "title": "The Moderate View on Border Security",
        "content": "There is a growing bipartisan consensus that while humane immigration systems are necessary, stricter protocols at ports of entry must be maintained to ensure systemic integrity and proper resource allocation.",
        "url": "https://example.com/moderate-border",
        "political_leaning": 0.30,
        "emotional_manipulation": 0.15,
        "cognitive_bias": 0.20
    },
    {
        "title": "Progressive Solutions for Climate Legislation",
        "content": "Environmental advocates gently urged lawmakers to consider sustainable infrastructure investments. While recognizing the economic costs, they argued long-term benefits outweigh immediate financial hesitation.",
        "url": "https://example.com/progressive-climate",
        "political_leaning": -0.40,
        "emotional_manipulation": 0.20,
        "cognitive_bias": 0.25
    },
    {
        "title": "Free Market Approaches to Healthcare",
        "content": "Proponents of deregulation argue that removing arbitrary state boundaries for healthcare providers will naturally decrease costs through enhanced competition, allowing consumers more reliable choices without federal mandates.",
        "url": "https://example.com/market-health",
        "political_leaning": 0.45,
        "emotional_manipulation": 0.10,
        "cognitive_bias": 0.20
    },
    {
        "title": "The Nuance of Universal Basic Income",
        "content": "UBI pilot programs have shown interesting results. While proponents highlight reduced poverty metrics, critics point to localized inflation. A balanced approach may involve targeted assistance rather than purely universal checks.",
        "url": "https://example.com/ubi-nuance",
        "political_leaning": -0.15,
        "emotional_manipulation": 0.05,
        "cognitive_bias": 0.15
    }
]

def populate():
    db = SessionLocal()
    # Check if already populated
    if db.query(ArticleInventory).count() > 0:
        print("ArticleInventory is already populated.")
        return
    
    for article in MOCK_ARTICLES:
        db_article = ArticleInventory(**article)
        db.add(db_article)
    
    db.commit()
    db.close()
    print(f"Successfully inserted {len(MOCK_ARTICLES)} objective counter-articles into the inventory.")

if __name__ == "__main__":
    populate()
