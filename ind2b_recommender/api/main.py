import sys
import os

# Add project root to path so 'src' can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.hybrid_recommender import recommend_for_user, similar_products, search_product
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/recommend/user/{user_id}")
def recommend_user(user_id: int, n: int = 10):
    return recommend_for_user(user_id, n)

@app.get("/recommend/product/{product_id}")
def recommend_product(product_id: int, n: int = 10):
    return similar_products(product_id, n)

@app.get("/search")
def search_products_endpoint(q: str, n: int = 5):
    """
    Search products.
    First tries partial keyword match.
    If few/no results, uses vector semantic search.
    """
    return search_product(q, n)



if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
