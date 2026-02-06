import pandas as pd
import requests
from bs4 import BeautifulSoup
import re
import time
import sys
import os

def get_product_details(title, product_id):
    # Construct URL
    slug = title.lower().strip()
    slug = re.sub(r'[^a-z0-9]+', '-', slug).strip('-')
    url = f"https://www.ind2b.com/products/{product_id}-{slug}"
    
    print(f"Scraping: {url}")
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            data = {}
            
            # Image
            og_image = soup.find("meta", property="og:image")
            if og_image and og_image.get("content"):
                data['image_link'] = og_image["content"]
            
            # Title (og:title or h1)
            og_title = soup.find("meta", property="og:title")
            if og_title:
                data['title'] = og_title["content"].replace(" - ind2b.com", "").strip()
            
            # Extract data using Regex from the raw HTML content
            # Next.js hydration data is embedding in the HTML
            content = response.text
            
            # Price
            price_match = re.search(r'\\?"price\\?":\s*(\d+(\.\d+)?)', content)
            if price_match:
                price = float(price_match.group(1))
                data['price'] = price
            
            # Discount
            discount_match = re.search(r'\\?"discount\\?":\s*(\d+(\.\d+)?)', content)
            if discount_match:
                discount = float(discount_match.group(1))
                data['discount'] = discount
                
                # Calculate MRP if we have price and discount
                # Price is the selling price. Discount is percentage off.
                # Selling Price = MRP * (1 - Discount/100)
                # MRP = Selling Price / (1 - Discount/100)
                if 'price' in data and discount > 0:
                    try:
                        mrp = price / (1 - (discount / 100))
                        data['mrp'] = round(mrp, 2)
                    except ZeroDivisionError:
                        pass

            # Stock
            stock_match = re.search(r'\\?"stock\\?":\s*(\d+)', content)
            if stock_match:
                data['stock'] = int(stock_match.group(1))

            # Category - Attempt to find breadcrumbs or similar
            # Based on inspection, we might find category in the JSON too but let's stick to what we verified.
            # We can try to use a generic regex for categoryId or similar if needed later.
            
            return data
            
        else:
            print(f"Failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def main():
    csv_path = 'data/products.csv'
    if not os.path.exists(csv_path):
        print("csv not found")
        return

    df = pd.read_csv(csv_path)
    
    # Create backup
    df.to_csv('data/products_backup_auto.csv', index=False)
    
    updated_count = 0
    
    for index, row in df.iterrows():
        # Only update if image is invalid or missing, or just update all?
        # User said "information of the products in cards must be actual information"
        # So let's update all.
        
        # We need product_id. The CSV has it.
        pid = row.get('product_id')
        title = row.get('title')
        
        if not pid or not title:
            continue
            
        details = get_product_details(title, pid)
        
        if details:
            if 'image_link' in details:
                df.at[index, 'image_link'] = details['image_link']
            if 'title' in details:
                 df.at[index, 'title'] = details['title']
            if 'price' in details:
                 df.at[index, 'price'] = details['price']
            if 'discount' in details:
                 df.at[index, 'discount'] = details['discount']
            if 'stock' in details:
                 df.at[index, 'stock'] = details['stock']
            # We don't have an MRP column in the CSV schema shown earlier, but we can compute it or add it if needed.
            # The user asked for "Price, Discount, Category, Stock".
            # Let's save what we have.
            updated_count += 1
            print(f"Updated {title}")
        
        time.sleep(1) # Be polite
        
    df.to_csv('data/products_updated.csv', index=False)
    print(f"Finished. Updated {updated_count} products. Saved to data/products_updated.csv")

if __name__ == "__main__":
    main()
