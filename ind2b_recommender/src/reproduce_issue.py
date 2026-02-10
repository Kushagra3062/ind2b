
import sys
import os
import json

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.llm_parser import parse_query_with_llm
from src.hybrid_recommender import search_product

def test_reproduction():
    history = [
        {"role": "user", "content": "show me some drills"},
        {"role": "assistant", "content": "Here are some drills I found for you: ..."}
    ]
    query = "they must be of endico"
    
    print(f"--- Testing Query: '{query}' ---")
    
    filters = parse_query_with_llm(query, history=history)
    print(f"Parsed Filters: {json.dumps(filters, indent=2)}")
    
    products = search_product(
        query=filters.get("search_term", query),
        min_price=filters.get("min_price"),
        max_price=filters.get("max_price"),
        category=filters.get("category"),
        brand=filters.get("brand")
    )
    
    print(f"\nFinal intent: {filters.get('intent')}")
    print(f"Found {len(products)} products.")
    for p in products:
        print(f"- {p.get('title')} (Brand: {p.get('seller_name')})")

if __name__ == "__main__":
    test_reproduction()
