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
        
        # Look for style tags or inline styles
        print("\n--- Analyzing HTML for Colors ---")
        html_content = response.text
        
        # Simple regex for hex codes
        hex_colors = re.findall(r'#[0-9a-fA-F]{6}', html_content)
        common_colors = {}
        for color in hex_colors:
            common_colors[color] = common_colors.get(color, 0) + 1
            
        # Sort by frequency
        sorted_colors = sorted(common_colors.items(), key=lambda x: x[1], reverse=True)
        print("Most frequent hex colors found:")
        for color, count in sorted_colors[:10]:
            print(f"{color}: {count}")
            
        # Look for CSS variables in style tags
        print("\n--- Looking for CSS Variables ---")
        css_vars = re.findall(r'--[\w-]+:\s*#[0-9a-fA-F]{3,6}', html_content)
        for var in css_vars[:20]:
            print(var)
            
        # Check for external CSS links
        links = soup.find_all('link', rel='stylesheet')
        for link in links:
            href = link.get('href')
            if href:
                print(f"Found stylesheet: {href}")
                # We could fetch these too if needed, but let's start with HTML analysis

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_design_tokens("https://ind2b.com")
