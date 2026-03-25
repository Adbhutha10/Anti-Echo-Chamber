import os
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime

# ─── Database URL Resolution ───────────────────────────────────────────────────
# Priority: DATABASE_URL env var (PostgreSQL) → SQLite local fallback
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Production PostgreSQL (set via .env or Docker Compose)
    # Handle Render/Heroku's legacy "postgres://" prefix
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(DATABASE_URL)
    print(f"[DB] Connected to PostgreSQL")
else:
    # Local SQLite fallback for development
    DB_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(DB_DIR, exist_ok=True)
    SQLITE_URL = f"sqlite:///{os.path.join(DB_DIR, 'anti_echo_chamber.db')}"
    engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
    print(f"[DB] Using local SQLite: {SQLITE_URL}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ─── Models ────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    history = relationship("ReadHistory", back_populates="user", cascade="all, delete-orphan")


class ReadHistory(Base):
    __tablename__ = "read_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    article_text = Column(Text)

    political_leaning = Column(Float, default=0.0)
    emotional_manipulation = Column(Float, default=0.0)
    cognitive_bias = Column(Float, default=0.0)

    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="history")


class ArticleInventory(Base):
    __tablename__ = "article_inventory"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), index=True)
    content = Column(Text)
    url = Column(String(1000))

    political_leaning = Column(Float, default=0.0)
    emotional_manipulation = Column(Float, default=0.0)
    cognitive_bias = Column(Float, default=0.0)
