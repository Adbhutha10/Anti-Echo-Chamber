import torch
from transformers import pipeline
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NLPEngine:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(NLPEngine, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self, model_name=None):
        if self._initialized:
            return
            
        # Check for local fine-tuned model in 'models/fine_tuned'
        default_model = "facebook/bart-large-mnli"
        model_path = os.getenv("CUSTOM_MODEL_PATH", "models/fine_tuned")
        
        if os.path.exists(model_path):
            logger.info(f"Loading CUSTOM fine-tuned model from: {model_path}")
            active_model = model_path
        else:
            active_model = model_name or default_model
            logger.info(f"Using standard model: {active_model}")

        self.device = 0 if torch.cuda.is_available() else -1
        try:
            self.classifier = pipeline(
                "zero-shot-classification", 
                model=model_name, 
                device=self.device
            )
            self._initialized = True
            logger.info("NLP Model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load NLP Model: {e}")
            raise

    def analyze_text(self, text: str):
        """
        Runs multiple zero-shot classification passes to determine bias, emotion, and political leaning.
        """
        # Bias Detection
        bias_labels = ["biased", "neutral", "objective"]
        bias_res = self.classifier(text, bias_labels)
        bias_score = bias_res['scores'][bias_res['labels'].index('biased')]

        # Emotional Manipulation Detection
        emotion_labels = ["outrage", "fear", "joy", "neutral", "sadness", "surprise"]
        emo_res = self.classifier(text, emotion_labels)
        # We calculate 'manipulation' as the sum of high-arousal negative emotions
        mani_score = emo_res['scores'][emo_res['labels'].index('outrage')] + \
                     emo_res['scores'][emo_res['labels'].index('fear')]

        # Political Leaning (Left vs Right)
        pol_labels = ["liberal", "conservative"]
        pol_res = self.classifier(text, pol_labels)
        # Calculate leaning on a scale of -1 (Liberal/Left) to 1 (Conservative/Right)
        lib_score = pol_res['scores'][pol_res['labels'].index('liberal')]
        con_score = pol_res['scores'][pol_res['labels'].index('conservative')]
        pol_leaning = con_score - lib_score

        return {
            "cognitive_bias": round(float(bias_score), 3),
            "emotional_manipulation": round(float(mani_score), 3),
            "political_leaning": round(float(pol_leaning), 3)
        }

# Singleton instance
nlp_engine = NLPEngine()
