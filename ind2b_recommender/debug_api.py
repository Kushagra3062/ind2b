import urllib.request
import json
import sys

urls = [
    "http://localhost:8000/search?q=drill",
    "http://localhost:8000/search?q=TrialSoap"
]

with open("d:/ind2b_recommender/api_debug.log", "w", encoding="utf-8") as f:
    for url in urls:
        f.write(f"--- Fetching {url} ---\n")
        try:
            with urllib.request.urlopen(url) as response:
                f.write(f"Status: {response.status}\n")
                f.write("Headers:\n")
                f.write(str(response.headers) + "\n")
                body = response.read().decode('utf-8')
                f.write("Body:\n")
                try:
                    data = json.loads(body)
                    f.write(json.dumps(data, indent=2))
                except:
                    f.write(body)
        except Exception as e:
            f.write(f"Error: {e}\n")
        f.write("\n\n")
