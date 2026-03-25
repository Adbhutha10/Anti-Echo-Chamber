import pandas as pd
import spacy
import re
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load SpaCy model, gracefully handle if not installed
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    logger.warning("Spacy en_core_web_sm not found. Please wait for it to be downloaded.")
    nlp = None

def clean_text(text: str) -> str:
    """
    Cleans raw article text by removing HTML, URLs, and excessive whitespace.
    """
    if not isinstance(text, str):
        return ""
    
    # Remove URLs
    text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    # Remove extra whitespaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def preprocess_text(text: str) -> list:
    """
    Applies NLP preprocessing: lowercasing, lemmatization, and stop word removal.
    Used for traditional ML algorithms. (Transformer models only need clean_text).
    """
    # Fallback if spacy isn't loaded
    if not nlp:
        return text.lower().split()
    
    doc = nlp(text.lower())
    tokens = [token.lemma_ for token in doc if not token.is_stop and not token.is_punct]
    return tokens

def load_sample_dataset() -> pd.DataFrame:
    """
    Loads a mock dataset for testing the pipeline before pulling massive real datasets.
    """
    data = [
        {"id": 1, "text": "This is a HORRIBLE policy that will ruin the economy! Read more at http://biased.com", "label": "highly_biased"},
        {"id": 2, "text": "The new policy aims to adjust the tax brackets for 2024.", "label": "neutral"},
        {"id": 3, "text": "You won't BELIEVE what this politician just said!! <a href='x'>Click here</a>", "label": "clickbait_manipulation"}
    ]
    df = pd.DataFrame(data)
    df['cleaned_text'] = df['text'].apply(clean_text)
    return df

if __name__ == "__main__":
    df = load_sample_dataset()
    logger.info("Pipeline test successful. Sample preprocessed data:")
    for idx, row in df.iterrows():
        logger.info(f"Original: {row['text']}")
        logger.info(f"Cleaned:  {row['cleaned_text']}\n")
