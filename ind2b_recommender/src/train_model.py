
import os
import sys
import pickle
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity, linear_kernel

# Setup Paths
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(MODEL_DIR, exist_ok=True)

def train_content_based():
    print("🚀 Training Content-Based Model...")
    csv_path = os.path.join(DATA_DIR, "products.csv")
    if not os.path.exists(csv_path):
        print(f"❌ Error: {csv_path} not found.")
        return False

    try:
        df = pd.read_csv(csv_path)
        print(f"   Loaded {len(df)} products.")
        
        # Build Text Feature
        # Combine title, description, category etc.
        df["text"] = (
            df["title"].fillna("") + " " +
            df["description"].fillna("") + " " +
            df["category_id"].astype(str) + " " + 
            df["brand"].fillna("") # Use brand if we scraped it? Or seller_name
        )
        # Handle cases where columns might be missing in CSV schema
        if "seller_name" in df.columns:
             df["text"] += " " + df["seller_name"].fillna("")

        # TF-IDF
        vec = TfidfVectorizer(stop_words="english", max_features=5000)
        tfidf_matrix = vec.fit_transform(df["text"])
        
        # We don't necessarily compute full similarity on big datasets (N^2), 
        # but for recommendations we might or compute on fly. 
        # hybrid_recommender.py computes linear_kernel on import.
        # But we should save the matrix or the vectorizer.
        # Existing code saves 'tfidf_vectorizer.pkl' and 'content_similarity.pkl'?
        # Let's save both.
        
        # NOTE: Saving huge similarity matrix is memory intensive. 
        # If products > 10k, this might crash low-mem environments.
        # Assuming < 5k products for now.
        if len(df) < 10000:
            similarity = linear_kernel(tfidf_matrix, tfidf_matrix)
            pickle.dump(similarity, open(os.path.join(MODEL_DIR, "content_similarity.pkl"), "wb"))
        
        pickle.dump(vec, open(os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl"), "wb"))
        pickle.dump(tfidf_matrix, open(os.path.join(MODEL_DIR, "tfidf_matrix.pkl"), "wb"))
        
        # Also need indices mapping? hybrid_recommender computes it.
        # But we should ensure product_ids.pkl matches this df order for consistency?
        # Actually, TF-IDF relies on row index. 
        # We might need to save the DF order or index map.
        # The existing code reloads csv, so order is presumed stable if CSV is stable.
        
        print("✅ Content-Based Model Trained & Saved.")
        return True
    except Exception as e:
        print(f"❌ Content Training Failed: {e}")
        return False

def train_collaborative_filtering():
    print("🚀 Training Collaborative Filtering (User-Item)...")
    interactions_path = os.path.join(DATA_DIR, "interactions.csv")
    
    if not os.path.exists(interactions_path) or os.path.getsize(interactions_path) < 10:
        print("⚠️ Warning: interactions.csv missing or empty. Skipping CF training.")
        # Create Dummy/Empty models to prevent import errors in hybrid_recommender
        # if it expects them.
        # But hybrid_recommender loads them unconditionallly? 
        # Let's check: Yes, it loads user_item_matrix.pkl etc.
        # We MUST ensure these exist even if empty/mock to avoid crashes.
        
        # Create dummy data
        empty_matrix = pd.DataFrame()
        empty_sim = np.array([])
        pickle.dump([], open(os.path.join(MODEL_DIR, "user_ids.pkl"), "wb"))
        pickle.dump([], open(os.path.join(MODEL_DIR, "product_ids.pkl"), "wb"))
        pickle.dump(empty_matrix, open(os.path.join(MODEL_DIR, "user_item_matrix.pkl"), "wb"))
        pickle.dump(empty_sim, open(os.path.join(MODEL_DIR, "user_similarity.pkl"), "wb"))
        return

    try:
        interactions = pd.read_csv(interactions_path)
        # Pivot
        if interactions.empty:
             raise ValueError("Empty interactions")

        matrix = interactions.pivot_table(index='user_id', columns='product_id', values='weight', fill_value=0)
        user_ids = matrix.index.tolist()
        product_ids = matrix.columns.tolist()
        
        similarity = cosine_similarity(matrix)
        
        pickle.dump(user_ids, open(os.path.join(MODEL_DIR, "user_ids.pkl"), "wb"))
        pickle.dump(product_ids, open(os.path.join(MODEL_DIR, "product_ids.pkl"), "wb"))
        pickle.dump(matrix, open(os.path.join(MODEL_DIR, "user_item_matrix.pkl"), "wb"))
        pickle.dump(similarity, open(os.path.join(MODEL_DIR, "user_similarity.pkl"), "wb"))
        
        print("✅ Collaborative Filtering Model Trained & Saved.")
    except Exception as e:
        print(f"❌ CF Training Failed: {e}")

if __name__ == "__main__":
    import numpy as np # Local import for dummy
    train_content_based()
    train_collaborative_filtering()
    print("🎉 Training Complete.")
