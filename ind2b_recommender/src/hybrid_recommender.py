import pickle
import numpy as np
import pandas as pd
import os

# ======================
# PATH SETUP
# ======================
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # project root
MODEL_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "data")

# ======================
# LOAD DATA + MODELS
# ======================
products_df = pd.read_csv(os.path.join(DATA_DIR, "products.csv"))

user_ids = pickle.load(open(os.path.join(MODEL_DIR, "user_ids.pkl"), "rb"))
product_ids = pickle.load(open(os.path.join(MODEL_DIR, "product_ids.pkl"), "rb"))
matrix = pickle.load(open(os.path.join(MODEL_DIR, "user_item_matrix.pkl"), "rb"))
user_sim = pickle.load(open(os.path.join(MODEL_DIR, "user_similarity.pkl"), "rb"))

user_to_idx = {u: i for i, u in enumerate(user_ids)}
product_to_idx = {p: i for i, p in enumerate(product_ids)}

# ======================
# COLLABORATIVE FILTERING (User-based KNN)
# ======================
def recommend_for_user(user_id, n=10):
    """Return item recommendations using user-user cosine similarity."""
    if user_id not in user_to_idx:
        # cold start fallback = random products
        return products_df.sample(n).to_dict(orient='records')

    uidx = user_to_idx[user_id]

    # similarity scores for target user
    sim_scores = user_sim[uidx]

    # get top 5 similar users (skip self at index 0)
    nearest_users = np.argsort(-sim_scores)[1:6]

    # weighted sum of neighbor interactions
    scores = np.zeros(len(product_ids))
    for neigh in nearest_users:
        scores += matrix.iloc[neigh].values * sim_scores[neigh]

    # remove items user has already interacted with
    user_row = matrix.iloc[uidx].values
    scores = scores * (user_row == 0)

    top_idx = np.argsort(-scores)[:n]
    pids = [product_ids[i] for i in top_idx]

    recommendations = products_df[products_df["product_id"].isin(pids)]
    return (
    recommendations.fillna("").replace({np.nan: None}).to_dict(orient="records")
   )


# ======================
# CONTENT BASED (TF-IDF)
# ======================
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

# Build product text
products_df["text"] = (
    products_df["title"].fillna("") + " " +
    products_df["description"].fillna("") + " " +
    products_df["category_id"].astype(str)
)

tfidf = TfidfVectorizer(stop_words="english")
tfidf_matrix = tfidf.fit_transform(products_df["text"])

cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)
indices = pd.Series(products_df.index, index=products_df["product_id"])

def similar_products(product_id, n=10):
    """Return content-similar products using TF-IDF cosine similarity."""
    if product_id not in indices:
        return []

    idx = indices[product_id]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:n+1]
    prod_idxs = [i for i, _ in sim_scores]

    return (
    products_df.iloc[prod_idxs]
    .fillna("")
    .replace({np.nan: None})
    .to_dict(orient="records")
   )



def search_by_vector(query: str, n: int = 5):
    """Search products by semantic similarity using TF-IDF vectors."""
    # Transform query to vector
    query_vec = tfidf.transform([query])
    
    # Calculate cosine similarity between query and all products
    # query_vec is (1, n_features), tfidf_matrix is (n_products, n_features)
    # linear_kernel result is (1, n_products)
    sim_scores = linear_kernel(query_vec, tfidf_matrix).flatten()
    
    # Get top N indices
    top_indices = sim_scores.argsort()[::-1][:n]
    
    # Filter out zero similarity (irrelevant)
    top_indices = [i for i in top_indices if sim_scores[i] > 0]
    
    if not top_indices:
        return []

    return (
        products_df.iloc[top_indices]
        .fillna("")
        .replace({np.nan: None})
        .to_dict(orient="records")
    )

def search_product(query: str, n: int = 5):
    """Search products by title (keyword) + vector semantic fall back."""
    # Try exact keyword match first
    mask = products_df["title"].str.contains(query, case=False, na=False)
    keyword_results = products_df[mask]
    
    if not keyword_results.empty:
        return (
            keyword_results.head(n)
            .fillna("")
            .replace({np.nan: None})
            .to_dict(orient="records")
        )
    
    # Fallback to vector search if no keyword matches (or we can mix them)
    return search_by_vector(query, n)


