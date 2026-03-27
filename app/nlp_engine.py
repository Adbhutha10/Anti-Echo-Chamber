import torch
from transformers import pipeline
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

        # Priority: NLP_MODEL env var → CUSTOM_MODEL_PATH local dir → default small model
        env_model = os.getenv("NLP_MODEL", "")
        model_path = os.getenv("CUSTOM_MODEL_PATH", "models/fine_tuned")
        default_model = "cross-encoder/nli-MiniLM2-L6-H768"  # 90MB — fits in Render free tier

        if env_model:
            active_model = env_model
            logger.info(f"Using NLP_MODEL env var: {active_model}")
        elif os.path.exists(model_path):
            active_model = model_path
            logger.info(f"Loading CUSTOM fine-tuned model from: {model_path}")
        else:
            active_model = default_model
            logger.info(f"Using default model: {active_model}")

        self.device = 0 if torch.cuda.is_available() else -1
        try:
            self.classifier = pipeline(
                "zero-shot-classification",
                model=active_model,   # BUG FIX: was passing model_name (None) instead of active_model
                device=self.device
            )
            self._initialized = True
            logger.info(f"NLP Model loaded successfully: {active_model}")
        except Exception as e:
            logger.error(f"Failed to load NLP Model: {e}")
            raise

    def analyze_text(self, text: str):
        """
        Runs zero-shot classification for bias, emotion, and political leaning.
        """
        # Bias Detection
        bias_labels = ["biased", "neutral", "objective"]
        bias_res = self.classifier(text, bias_labels)
        bias_score = bias_res['scores'][bias_res['labels'].index('biased')]

        # Emotional Manipulation Detection
        emotion_labels = ["outrage", "fear", "joy", "neutral", "sadness", "surprise"]
        emo_res = self.classifier(text, emotion_labels)
        mani_score = emo_res['scores'][emo_res['labels'].index('outrage')] + \
                     emo_res['scores'][emo_res['labels'].index('fear')]

        # Political Leaning (-1 = Left, +1 = Right)
        pol_labels = ["liberal", "conservative"]
        pol_res = self.classifier(text, pol_labels)
        lib_score = pol_res['scores'][pol_res['labels'].index('liberal')]
        con_score = pol_res['scores'][pol_res['labels'].index('conservative')]
        pol_leaning = con_score - lib_score

        return {
            "cognitive_bias": round(float(bias_score), 3),
            "emotional_manipulation": round(float(mani_score), 3),
            "political_leaning": round(float(pol_leaning), 3)
        }

# Singleton — loaded once at startup
nlp_engine = NLPEngine()
