import requests
from bs4 import BeautifulSoup
import sys

def get_product_image(product_id, title):
    # Construct URL (logic from App.jsx)
    slug = title.lower().strip().replace(' ', '-')
    # Simple clean up, might need more regex to match JS exactly if strict
    # JS: .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    import re
    slug = re.sub(r'[^a-z0-9]+', '-', slug).strip('-')
    
    url = f"https://www.ind2b.com/products/{product_id}-{slug}"
    print(f"Fetching: {url}")
    
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Try og:image
            og_image = soup.find("meta", property="og:image")
            if og_image and og_image.get("content"):
                return og_image["content"]
            
            # Try finding the main product image (heuristic)
            # Inspecting common patterns... often inside a class like 'product-image' or similar
            # For now, just print all img src to see possibilities if og:image fails
            # images = soup.find_all('img')
            # for img in images[:5]:
            #     print(f"Found img: {img.get('src')}")
                
            return "No og:image found"
        else:
            return f"Error: {response.status_code}"
    except Exception as e:
        return f"Exception: {e}"

if __name__ == "__main__":
    # Test with the product: "Bosch 110mm..."
    # ID: 70 (from the url I visited: products/70-bosch...)
    # Wait, the CSV has ID 1. The URL I used in read_url_content was from a search earlier?
    # Let's use the product we have in the CSV: ID 1, title "Bosch GSB 500W..."
    
    # In my csv: ID=1, Title="Bosch GSB 500W 10 RE Professional Tool Kit"
    img = get_product_image("1", "Bosch GSB 500W 10 RE Professional Tool Kit")
    print(f"Image URL: {img}")
