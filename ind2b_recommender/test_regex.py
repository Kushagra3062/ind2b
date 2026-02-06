import re

with open("product_dump.html", "r", encoding="utf-8") as f:
    content = f.read()

# Pattern to find price, discount, stock in the Next.js hydration data
# The format looks like: \"price\":2232,\"imageUrl\":...,\"discount\":38,\"sellerId\":7,\"stock\":99
# We need to handle the escaped quotes.

price_match = re.search(r'\\?"price\\?":\s*(\d+(\.\d+)?)', content)
discount_match = re.search(r'\\?"discount\\?":\s*(\d+(\.\d+)?)', content)
stock_match = re.search(r'\\?"stock\\?":\s*(\d+)', content)

print("Price:", price_match.group(1) if price_match else "Not found")
print("Discount:", discount_match.group(1) if discount_match else "Not found")
print("Stock:", stock_match.group(1) if stock_match else "Not found")
