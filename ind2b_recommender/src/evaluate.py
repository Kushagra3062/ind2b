import pandas as pd
import numpy as np
from collections import defaultdict
import os

from hybrid_recommender import recommend_for_user

BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # project root
MODEL_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "data")

# Load interactions
interactions = pd.read_csv(f"{DATA_DIR}/interactions.csv")
products = pd.read_csv(f"{DATA_DIR}/products.csv")

# Convert to user -> product list
user_history = defaultdict(list)
for _, row in interactions.iterrows():
    user_history[row["user_id"]].append(row["product_id"])

# Split into train / test
train_ratio = 0.8
train_history = {}
test_history = {}

for user, items in user_history.items():
    cutoff = int(len(items) * train_ratio)
    train_history[user] = items[:cutoff]
    test_history[user] = items[cutoff:]  # next items user interacted with

def evaluate_at_k(k=10):
    hits = 0
    total = 0
    precision_sum = 0
    recall_sum = 0
    recommended_items = set()

    for user, test_items in test_history.items():
        if len(test_items) == 0:
            continue

        recs = recommend_for_user(user, n=k)
        rec_ids = [p["product_id"] for p in recs]

        recommended_items.update(rec_ids)

        # Hit = did we recommend at least one item user later interacted with?
        hit = any(item in rec_ids for item in test_items)
        hits += int(hit)
        total += 1

        # Precision & Recall
        relevant = set(test_items)
        recommended = set(rec_ids)

        intersect = relevant & recommended
        precision_sum += len(intersect) / k
        recall_sum += len(intersect) / len(relevant)

    hit_rate = hits / total if total > 0 else 0
    precision_at_k = precision_sum / total if total > 0 else 0
    recall_at_k = recall_sum / total if total > 0 else 0
    coverage = len(recommended_items) / len(products)

    return {
        "HitRate@K": round(hit_rate, 3),
        "Precision@K": round(precision_at_k, 3),
        "Recall@K": round(recall_at_k, 3),
        "Coverage": round(coverage, 3),
        "Users evaluated": total
    }

if __name__ == "__main__":
    for k in [5, 10]:
        print(f"\n📌 Evaluating at K={k}")
        print(evaluate_at_k(k))
