
import os
import re
import time
import pandas as pd
import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient
from dotenv import load_dotenv
import concurrent.futures

# Load environment variables
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("PROD_DB", "test")
COLLECTION_NAME = os.getenv("PRODUCT_COLLECTION", "products")

# Headers for scraping
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def get_db_products():
    """Connect to MongoDB and fetch all product IDs and Titles."""
    print(f"Connecting to MongoDB: {DB_NAME}.{COLLECTION_NAME}...")
    try:
        client = MongoClient(MONGODB_URI)
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]
        
        # Projection: We primarily need details to construct the URL
        # We also grab 'category' id if available to seed
        products = list(collection.find({}, {
            "product_id": 1, 
            "title": 1, 
            "id": 1, 
            "category_id": 1, 
            "description": 1,
            "seller_id": 1
        }))
        print(f"Found {len(products)} products in MongoDB.")
        return products
    except Exception as e:
        print(f"MongoDB Connection Error: {e}")
        return []

def scrape_product_page(product):
    """Scrape product details from ind2b.com using product ID and Title."""
    
    # Identify the correct ID to use in URL
    # CSV used numeric IDs. Mongo might have 'product_id' or just 'id'.
    pid = product.get("product_id") or product.get("id")
    title = product.get("title", "")
    
    if not pid or not title:
        return None

    # Construct Slug
    slug = title.lower().strip()
    slug = re.sub(r'[^a-z0-9]+', '-', slug).strip('-')
    
    url = f"https://www.ind2b.com/product/{pid}" 
    # Note: PortalWeb Chatbot link was `/product/{product_id}`.
    # Previous script used `/products/{product_id}-{slug}`.
    # We will try the shorter one first, or redirect might handle it. 
    # Let's try to match the previous script's pattern to be safe:
    url_slug = f"https://www.ind2b.com/products/{pid}-{slug}"

    data = {
        "product_id": pid,
        "title": title,
        "category_id": product.get("category_id", ""),
        "description": product.get("description", ""),
        "image_link": "",
        "price": 0,
        "discount": 0,
        "stock": 0,
        "seller_name": "", # We might scrape this
        "scraped_url": url_slug
    }

    try:
        # Try fetching
        response = requests.get(url_slug, headers=HEADERS, timeout=10)
        
        # Fallback to simple /product/id if 404?
        if response.status_code == 404:
             response = requests.get(f"https://www.ind2b.com/product/{pid}", headers=HEADERS, timeout=10)

        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # --- Image (Priority) ---
            og_image = soup.find("meta", property="og:image")
            if og_image and og_image.get("content"):
                data['image_link'] = og_image["content"]
            else:
                # Fallback: simple img tag search?
                # This depends on site structure.
                pass

            # --- Price/Stock/Discount/Seller (Metadata from JSON/store state) ---
            content = response.text
            
            # Regex for Price
            price_match = re.search(r'\\?"price\\?":\s*(\d+(\.\d+)?)', content)
            if price_match:
                data['price'] = float(price_match.group(1))
            
            # Regex for Discount
            discount_match = re.search(r'\\?"discount\\?":\s*(\d+(\.\d+)?)', content)
            if discount_match:
                data['discount'] = float(discount_match.group(1))
                
            # Regex for Stock
            stock_match = re.search(r'\\?"stock\\?":\s*(\d+)', content)
            if stock_match:
                data['stock'] = int(stock_match.group(1))
            
            # Category Name?
            # Creating a hybrid dataset: Mongo might have ID, but we want name.
            # We'll skip complex category extraction for now unless it's easy.
            
            return data
        else:
            # If scraping fails, return what we have (at least valid ID/Title)
            # But image will be missing.
            print(f"Failed to scrape {url_slug}: {response.status_code}")
            return data

    except Exception as e:
        print(f"Error scraping {pid}: {e}")
        return data

def main():
    # 1. Get List
    db_products = get_db_products()
    
    if not db_products:
        print("No products found in DB. Exiting.")
        return

    print("Starting scraping...")
    
    enriched_products = []
    
    # 2. Scrape concurrently
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        future_to_product = {executor.submit(scrape_product_page, p): p for p in db_products}
        
        for i, future in enumerate(concurrent.futures.as_completed(future_to_product)):
            try:
                data = future.result()
                if data:
                    enriched_products.append(data)
            except Exception as exc:
                print(f"Generated an exception: {exc}")
            
            if i % 10 == 0:
                print(f"Processed {i}/{len(db_products)}")

    # 3. Save
    if enriched_products:
        df = pd.DataFrame(enriched_products)
        output_path = os.path.join(os.path.dirname(__file__), "../data/products.csv")
        df.to_csv(output_path, index=False)
        print(f"Saved {len(df)} products to {output_path}")
    else:
        print("No data collected.")

if __name__ == "__main__":
    main()
