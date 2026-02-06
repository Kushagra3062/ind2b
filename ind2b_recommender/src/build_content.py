"""
Content-based similarity using TF-IDF on title + description
"""

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # project root
MODEL_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(MODEL_DIR, exist_ok=True)

# Load product data
df = pd.read_csv(f"{DATA_DIR}/products.csv")

# Build combined text field
df["text"] = (
    df["title"].fillna("") + " " +
    df["description"].fillna("") + " " +
    df["sku"].fillna("") + " " +
    df["category_id"].astype(str) + " " +
    df["sub_category_id"].astype(str)
)

vec = TfidfVectorizer(stop_words="english", max_features=5000)
tfidf_matrix = vec.fit_transform(df["text"])

# Store similarity matrix
similarity = cosine_similarity(tfidf_matrix)

pickle.dump(vec, open(f"{MODEL_DIR}/tfidf_vectorizer.pkl", "wb"))
pickle.dump(similarity, open(f"{MODEL_DIR}/content_similarity.pkl", "wb"))
df.to_csv("../data/products_indexed.csv", index=False)

print("🎉 Content-based model saved!")
