"""
User-based KNN Collaborative Filtering (Pure Python)
"""

import pandas as pd
import numpy as np
import pickle
import os
from sklearn.metrics.pairwise import cosine_similarity


BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # project root
MODEL_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "data")

os.makedirs(MODEL_DIR, exist_ok=True)

# Load interactions
df = pd.read_csv(f"{DATA_DIR}/interactions.csv")

# Build user-item matrix
matrix = df.pivot_table(index='user_id', columns='product_id', values='weight', fill_value=0)

user_ids = matrix.index.tolist()
product_ids = matrix.columns.tolist()

# Compute cosine similarity between users
print("🚀 Training user-user similarity...")
similarity = cosine_similarity(matrix)

# Save results
pickle.dump(user_ids, open(f"{MODEL_DIR}/user_ids.pkl", "wb"))
pickle.dump(product_ids, open(f"{MODEL_DIR}/product_ids.pkl", "wb"))
pickle.dump(matrix, open(f"{MODEL_DIR}/user_item_matrix.pkl", "wb"))
pickle.dump(similarity, open(f"{MODEL_DIR}/user_similarity.pkl", "wb"))

print("🎯 User-KNN ready!")
