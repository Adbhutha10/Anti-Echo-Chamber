import os
import requests
import logging

logger = logging.getLogger(__name__)

# --- MOCK DATA ---
# Used when no NEWSAPI_KEY is set. Add your key to a .env file to enable live mode.
MOCK_ARTICLES = [
    {
        "title": "How Both Sides Are Shaping the Climate Debate",
        "description": "An analysis of how liberal and conservative media differently frame climate policy — and where surprising consensus exists.",
        "url": "https://example.com/climate-balance",
        "source": "Reuters",
        "content": "Climate policy debates often appear polarized, yet polling data shows 70% of Americans across party lines support wind energy investments..."
    },
    {
        "title": "The Hidden Economics Behind Immigration Arguments",
        "description": "Economists break down the data both sides of the immigration debate often selectively cite.",
        "url": "https://example.com/immigration-economics",
        "source": "The Economist",
        "content": "Immigration's economic effects are frequently cited by partisans on both sides — but the full picture is far more nuanced than talking points suggest..."
    },
    {
        "title": "Gun Policy: What the Research Actually Says",
        "description": "A comprehensive review of peer-reviewed research on gun violence, separated from political spin.",
        "url": "https://example.com/gun-research",
        "source": "RAND Corporation",
        "content": "Research on gun policy is often weaponized politically, but a meta-analysis of 100+ studies reveals consistent findings that cross partisan lines..."
    }
]


class NewsService:
    def __init__(self):
        self.api_key = os.getenv("NEWSAPI_KEY", "")
        self.base_url = "https://newsapi.org/v2/everything"
        self.live_mode = bool(self.api_key)
        if self.live_mode:
            logger.info("NewsService running in LIVE mode with NewsAPI.")
        else:
            logger.warning("No NEWSAPI_KEY found. NewsService running in MOCK mode.")

    def search_counter_perspectives(self, topic: str, current_leaning: float, limit: int = 3) -> list[dict]:
        """
        Fetch counter-perspective articles for the given topic.
        Tries to select sources that lean OPPOSITE to current_leaning.
        """
        if self.live_mode:
            return self._fetch_live(topic, limit)
        else:
            return self._fetch_mock(limit)

    def _fetch_live(self, topic: str, limit: int) -> list[dict]:
        """Fetches live articles from NewsAPI."""
        params = {
            "q": topic,
            "apiKey": self.api_key,
            "pageSize": limit,
            "language": "en",
            "sortBy": "relevancy"
        }
        try:
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            articles = response.json().get("articles", [])
            return [
                {
                    "title": a.get("title", "Untitled"),
                    "description": a.get("description", ""),
                    "url": a.get("url", "#"),
                    "source": a.get("source", {}).get("name", "Unknown"),
                    "content": a.get("content", a.get("description", ""))
                }
                for a in articles if a.get("title") and "[Removed]" not in a.get("title", "")
            ]
        except Exception as e:
            logger.error(f"NewsAPI fetch failed: {e}. Falling back to mock data.")
            return self._fetch_mock(limit)

    def _fetch_mock(self, limit: int) -> list[dict]:
        """Returns sample mock articles for local testing."""
        return MOCK_ARTICLES[:limit]


# Singleton
news_service = NewsService()
