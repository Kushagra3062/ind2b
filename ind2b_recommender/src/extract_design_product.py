import requests
from bs4 import BeautifulSoup
import re

def extract_design_tokens(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        print(f"Fetching {url}...")
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            print(f"Failed to fetch {url}: {response.status_code}")
            return
            
        soup = BeautifulSoup(response.text, 'html.parser')
        html_content = response.text
        
        print("\n--- HTML Colors (Top 10) ---")
        hex_colors = re.findall(r'#[0-9a-fA-F]{6}', html_content)
        common_colors = {}
        for color in hex_colors:
            color = color.lower()
            common_colors[color] = common_colors.get(color, 0) + 1
            
        for color, count in sorted(common_colors.items(), key=lambda x: x[1], reverse=True)[:10]:
            print(f"{color}: {count}")
            
        print("\n--- CSS Variables ---")
        # Look for :root style block or inline styles
        style_tags = soup.find_all('style')
        for style in style_tags:
            if ':root' in style.text:
                print("Found :root variables in style tag:")
                vars = re.findall(r'--[\w-]+:\s*[^;]+;', style.text)
                for var in vars:
                    print(var.strip())
                    
        # Also look for CSS links to potentially identifying main.css
        print("\n--- Stylesheets ---")
        for link in soup.find_all('link', rel='stylesheet'):
            print(link.get('href'))

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Use a product URL we know works from previous step context or common ID
    # ID 7: Bosch GBM 350 -> bosch-gbm-350...
    url = "https://www.ind2b.com/products/7-bosch-gbm-350-professional-350w-rotary-drill-machine" 
    extract_design_tokens(url)
