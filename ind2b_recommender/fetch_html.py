import requests
import sys

url = "https://www.ind2b.com/products/7-bosch-gbm-350-professional-350w-rotary-drill-machine"
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}

try:
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    with open("product_dump.html", "w", encoding="utf-8") as f:
        f.write(response.text)
    print("Successfully saved product_dump.html")
except Exception as e:
    print(f"Error fetching URL: {e}")
