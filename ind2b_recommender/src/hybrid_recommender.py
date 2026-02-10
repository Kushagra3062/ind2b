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

# Build product text - ensure no NaNs
products_df["text"] = (
    products_df["title"].fillna("") + " " +
    products_df["description"].fillna("") + " " +
    products_df["category_id"].astype(str)
)

# Load pre-trained models if available (Preferred)
try:
    tfidf = pickle.load(open(os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl"), "rb"))
    tfidf_matrix = pickle.load(open(os.path.join(MODEL_DIR, "tfidf_matrix.pkl"), "rb"))
    # Also load similarity matrix if we want user-item similarity to use it? 
    # But search_product uses linear_kernel on fly or pre-computed.
    # The original variable `cosine_sim` was computed: `cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)`
    # This is O(N^2) memory. For 130 products it's instant. For 10k it crashes.
    # Let's re-compute cosine_sim for small N, or load it.
    cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)

except Exception as e:
    print(f"Warning: Could not load trained models ({e}). Retraining on startup...")
    # Fallback to training
    from sklearn.feature_extraction.text import TfidfVectorizer
    tfidf = TfidfVectorizer(stop_words="english")
    # Ensure text column is perfect string
    products_df["text"] = products_df["text"].fillna("").astype(str)
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

def search_product(
    query: str,
    n: int = 5,
    min_price: float = None,
    max_price: float = None,
    category: str = None,
    brand: str = None,
):
    """
    Search products by title/keyword + vector semantic search, with structured filtering.
    """
    # Start with all products
    df = products_df.copy()

    # Apply Filters
    if min_price is not None:
        df = df[df["price"] >= min_price]
    if max_price is not None:
        df = df[df["price"] <= max_price]
    
    if category:
        # Case insensitive partial match on category_name or sub_category_name
        # Fallback to category_id if name columns are missing
        cat_cols = [c for c in ["category_name", "sub_category_name", "category_id"] if c in df.columns]
        if cat_cols:
            cat_mask = False
            for col in cat_cols:
                cat_mask = cat_mask | df[col].astype(str).str.contains(category, case=False, na=False)
            df = df[cat_mask]
        else:
            # If no category columns, search in title as a backup
            df = df[df["title"].str.contains(category, case=False, na=False)]
    
    if brand:
        # Case insensitive partial match on seller_name or title
        # Safely handle 'model' only if it exists in the dataframe
        brand_mask = (
            df["seller_name"].astype(str).str.contains(brand, case=False, na=False) |
            df["title"].str.contains(brand, case=False, na=False)
        )
        if "model" in df.columns:
            brand_mask = brand_mask | df["model"].astype(str).str.contains(brand, case=False, na=False)
            
        df = df[brand_mask]

    # If no query provided, just return top N filtered results by some metric (e.g. rating or price)
    if not query:
        return (
            df.head(n)
            .fillna("")
            .replace({np.nan: None})
            .to_dict(orient="records")
        )

    # If query provided, filter first then search within filtered dataset
    # 1. Keyword search on filtered df
    # Clean query of common filler words that LLMs might pass if they don't strip them well
    clean_query = query.lower()
    for skip in ["they must be of ", "must be of ", "find me ", "show me "]:
        if clean_query.startswith(skip):
            clean_query = clean_query[len(skip):]
    
    mask = df["title"].str.contains(clean_query, case=False, na=False) | \
           df["description"].str.contains(clean_query, case=False, na=False)
    keyword_results = df[mask]
    
    if not keyword_results.empty:
         # If plenty of exact matches, return them
        if len(keyword_results) >= n:
            return (
                keyword_results.head(n)
                .fillna("")
                .replace({np.nan: None})
                .to_dict(orient="records")
            )
        # Else, we might want to combine keyword results with vector results
        # To do vector search on subset, we need to subset the vector matrix which is tricky since indices change.
        # Simple approach: Return keyword results. 
        return (
            keyword_results.head(n)
            .fillna("")
            .replace({np.nan: None})
            .to_dict(orient="records")
        )
    
    # 2. Vector search (Semantic)
    # Since vector search index `tfidf_matrix` corresponds to original `products_df` indices,
    # we can run vector search on full dataset, get indices, and INTERSECT with filtered `df` indices.
    
    query_vec = tfidf.transform([clean_query])
    sim_scores = linear_kernel(query_vec, tfidf_matrix).flatten()
    top_indices_all = sim_scores.argsort()[::-1] # Get all sorted indices
    
    # Filter to keep only those in our filtered dataframe `df`
    valid_indices = set(df.index)
    
    final_indices = []
    count = 0
    for idx in top_indices_all:
        if idx in valid_indices and sim_scores[idx] > 0:
            final_indices.append(idx)
            count += 1
            if count >= n:
                break
    
    # If vector search also returned nothing but we have filtered results (e.g. brand only query)
    # Return the top filtered results
    if not final_indices:
        if not df.empty:
            return (
                df.head(n)
                .fillna("")
                .replace({np.nan: None})
                .to_dict(orient="records")
            )
        return []

    return (
        products_df.loc[final_indices]
        .fillna("")
        .replace({np.nan: None})
        .to_dict(orient="records")
    )


