import os
import logging
import pandas as pd
from datasets import load_dataset

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

def download_sample_datasets():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

    logger.info("Downloading a sample of GoEmotions dataset...")
    # GoEmotions provides emotion labels. We'll download the split 'train' and take first 500 rows for the sample
    go_emotions = load_dataset("go_emotions", split="train[:500]")
    go_emotions_df = go_emotions.to_pandas()
    
    go_emotions_path = os.path.join(DATA_DIR, "go_emotions_sample.csv")
    go_emotions_df.to_csv(go_emotions_path, index=False)
    logger.info(f"Saved {len(go_emotions_df)} rows to {go_emotions_path}")

    logger.info("Downloading a sample of Fake News/Bias dataset...")
    # Hugging Face dataset: 'GonzaloA/fake_news' is a good lightweight fake news dataset
    fake_news = load_dataset("GonzaloA/fake_news", split="train[:500]")
    fake_news_df = fake_news.to_pandas()
    
    fake_news_path = os.path.join(DATA_DIR, "fake_news_sample.csv")
    fake_news_df.to_csv(fake_news_path, index=False)
    logger.info(f"Saved {len(fake_news_df)} rows to {fake_news_path}")

    logger.info("Dataset acquisition complete! All samples are in the data/ directory.")

if __name__ == "__main__":
    download_sample_datasets()
