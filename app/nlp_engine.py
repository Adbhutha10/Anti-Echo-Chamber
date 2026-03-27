import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── Mode Selection ────────────────────────────────────────────────────────────
# Set USE_HF_API=true on Render (no torch needed, calls HuggingFace hosted GPU)
# Leave unset locally (loads model directly with torch)
USE_HF_API = os.getenv("USE_HF_API", "false").lower() == "true"
HF_TOKEN   = os.getenv("HF_TOKEN", "")
HF_MODEL   = os.getenv("NLP_MODEL", "cross-encoder/nli-MiniLM2-L6-H768")

if USE_HF_API:
    import requests
    logger.info(f"NLPEngine running in HF Inference API mode (model: {HF_MODEL})")
else:
    import torch
    from transformers import pipeline
    logger.info(f"NLPEngine running in LOCAL mode (model: {HF_MODEL})")


class NLPEngine:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(NLPEngine, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        if USE_HF_API:
            self._init_api()
        else:
            self._init_local()
        self._initialized = True

    def _init_api(self):
        """Cloud mode: no model loaded locally — calls HuggingFace Inference API."""
        self.api_url = f"https://api-inference.huggingface.co/models/{HF_MODEL}"
        self.headers = {"Authorization": f"Bearer {HF_TOKEN}"} if HF_TOKEN else {}
        logger.info(f"HF API endpoint ready: {self.api_url}")

    def _init_local(self):
        """Local mode: loads model into memory with torch."""
        device = 0 if torch.cuda.is_available() else -1
        custom_path = os.getenv("CUSTOM_MODEL_PATH", "models/fine_tuned")
        active_model = custom_path if os.path.exists(custom_path) else HF_MODEL
        logger.info(f"Loading model locally: {active_model}")
        self.classifier = pipeline("zero-shot-classification", model=active_model, device=device)
        logger.info("Local NLP model loaded successfully.")

    def _classify_api(self, text: str, labels: list[str]) -> dict:
        """Call HuggingFace Inference API for zero-shot classification."""
        import requests, time
        payload = {"inputs": text, "parameters": {"candidate_labels": labels}}
        for attempt in range(3):
            try:
                res = requests.post(self.api_url, headers=self.headers, json=payload, timeout=30)
                if res.status_code == 503:
                    # Model is loading on HF side, wait and retry
                    time.sleep(20)
                    continue
                res.raise_for_status()
                return res.json()
            except Exception as e:
                logger.warning(f"HF API attempt {attempt+1} failed: {e}")
                time.sleep(5)
        raise RuntimeError("HF Inference API unavailable after 3 retries.")

    def analyze_text(self, text: str) -> dict:
        if USE_HF_API:
            return self._analyze_api(text)
        else:
            return self._analyze_local(text)

    def _analyze_api(self, text: str) -> dict:
        """Inference via HuggingFace API."""
        bias_res = self._classify_api(text, ["biased", "neutral", "objective"])
        bias_score = bias_res['scores'][bias_res['labels'].index('biased')]

        emo_res = self._classify_api(text, ["outrage", "fear", "joy", "neutral", "sadness"])
        mani_score = emo_res['scores'][emo_res['labels'].index('outrage')] + \
                     emo_res['scores'][emo_res['labels'].index('fear')]

        pol_res = self._classify_api(text, ["liberal", "conservative"])
        pol_leaning = pol_res['scores'][pol_res['labels'].index('conservative')] - \
                      pol_res['scores'][pol_res['labels'].index('liberal')]

        return {
            "cognitive_bias": round(float(bias_score), 3),
            "emotional_manipulation": round(float(mani_score), 3),
            "political_leaning": round(float(pol_leaning), 3)
        }

    def _analyze_local(self, text: str) -> dict:
        """Inference via local torch pipeline."""
        bias_res = self.classifier(text, ["biased", "neutral", "objective"])
        bias_score = bias_res['scores'][bias_res['labels'].index('biased')]

        emo_res = self.classifier(text, ["outrage", "fear", "joy", "neutral", "sadness"])
        mani_score = emo_res['scores'][emo_res['labels'].index('outrage')] + \
                     emo_res['scores'][emo_res['labels'].index('fear')]

        pol_res = self.classifier(text, ["liberal", "conservative"])
        pol_leaning = pol_res['scores'][pol_res['labels'].index('conservative')] - \
                      pol_res['scores'][pol_res['labels'].index('liberal')]

        return {
            "cognitive_bias": round(float(bias_score), 3),
            "emotional_manipulation": round(float(mani_score), 3),
            "political_leaning": round(float(pol_leaning), 3)
        }


# Singleton
nlp_engine = NLPEngine()
