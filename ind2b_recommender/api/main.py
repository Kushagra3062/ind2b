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
def search_products_endpoint(
    q: str = "",
    n: int = 5,
    min_price: float = None,
    max_price: float = None,
    category: str = None,
    brand: str = None
):
    """
    Search products.
    First tries partial keyword match.
    If few/no results, uses vector semantic search.
    Supports filtering by price, category, and brand.
    """
    return search_product(
        q, 
        n, 
        min_price=min_price, 
        max_price=max_price, 
        category=category, 
        brand=brand
    )



from src.llm_parser import parse_query_with_llm

@app.get("/smart-search")
def smart_search_endpoint(q: str = "", history: str = None, n: int = 5):
    """
    Smart search using LLM to parse natural language query into filters.
    Supports 'history' as a JSON string of previous messages.
    """
    import json
    parsed_history = None
    if history:
        try:
            parsed_history = json.loads(history)
        except:
            pass

    filters = parse_query_with_llm(q, history=parsed_history)
    print(f"Parsed Agentic State: {filters}")
    
    products = search_product(
        query=filters.get("search_term", q),
        n=n,
        min_price=filters.get("min_price"),
        max_price=filters.get("max_price"),
        category=filters.get("category"),
        brand=filters.get("brand")
    )

    return {
        "conversational_response": filters.get("conversational_response"),
        "products": products,
        "filters": {
            "search_term": filters.get("search_term"),
            "brand": filters.get("brand"),
            "max_price": filters.get("max_price"),
            "category": filters.get("category")
        },
        "intent": filters.get("intent")
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
