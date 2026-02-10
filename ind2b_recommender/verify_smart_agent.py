
import sys
import os
import json

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))

try:
    from src.llm_parser import parse_query_with_llm
    from src.hybrid_recommender import search_product
except ImportError:
    # Try relative import if running from root
    try:
        from ind2b_recommender.src.llm_parser import parse_query_with_llm
        from ind2b_recommender.src.hybrid_recommender import search_product
    except:
        print("Import Error. Run this script from the project root or src.")
        sys.exit(1)

def test_smart_agent(query):
    print(f"\n--- Testing Query: '{query}' ---")
    
    # 1. Parse
    print("1. Parsing with LLM...")
    try:
        filters = parse_query_with_llm(query)
        print(f"   Parsed Filters: {json.dumps(filters, indent=2)}")
    except Exception as e:
        print(f"   Parsing Failed: {e}")
        return

    # 2. Search
    print("2. Searching Products...")
    try:
        results = search_product(
            query=filters.get("search_term", query),
            min_price=filters.get("min_price"),
            max_price=filters.get("max_price"),
            category=filters.get("category"),
            brand=filters.get("brand"),
            n=3
        )
        print(f"   Found {len(results)} results.")
        for p in results:
            print(f"   - {p.get('title')} (Price: {p.get('price')})")
            
    except Exception as e:
        print(f"   Search Failed: {e}")

if __name__ == "__main__":
    test_smart_agent("Cheapest drill under 3000")
    test_smart_agent("Bosch power tools")
    test_smart_agent("Polygrip S709 1L")
    test_smart_agent("Something for cutting wood")

