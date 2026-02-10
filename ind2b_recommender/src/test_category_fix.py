
import sys
import os
import json

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.llm_parser import parse_query_with_llm
from src.hybrid_recommender import search_product

def test_category_filtering():
    # Test case matching the failing query in logs
    # query = "Show me the ones from Asian Paints"
    # Parsed Agentic State: {'intent': 'search', 'search_term': 'Asian Paints adhesives', 'category': 'adhesives', 'min_price': None, 'max_price': None, 'brand': None, ...}
    
    query = "Show me the ones from Asian Paints"
    category = "adhesives"
    search_term = "Asian Paints adhesives"
    
    print(f"--- Testing Filtering: category='{category}', search_term='{search_term}' ---")
    
    try:
        products = search_product(
            query=search_term,
            category=category
        )
        print(f"Success! Found {len(products)} products.")
        for p in products:
            print(f"- {p.get('title')} (CatID: {p.get('category_id')})")
    except Exception as e:
        print(f"Failed! Error: {e}")

if __name__ == "__main__":
    test_category_filtering()
