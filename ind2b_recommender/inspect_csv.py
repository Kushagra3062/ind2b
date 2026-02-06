import pandas as pd
import sys

try:
    with open('d:/ind2b_recommender/inspect_log.txt', 'w', encoding='utf-8') as f:
        df = pd.read_csv('d:/ind2b_recommender/data/products.csv')
        f.write("Unique image links found:\n")
        f.write(str(df['image_link'].unique()) + "\n")
        
        f.write("\nSample rows with image_link:\n")
        f.write(str(df[['title', 'image_link']].head(10)) + "\n")
        
        f.write("\nChecking for local paths (not starting with http or data:):\n")
        local_paths = df[~df['image_link'].str.startswith(('http', 'data:'), na=False)]
        if not local_paths.empty:
            f.write("Found potentially local paths:\n")
            f.write(str(local_paths[['title', 'image_link']]) + "\n")
        else:
            f.write("No local paths found.\n")
            
except Exception as e:
    with open('d:/ind2b_recommender/inspect_log.txt', 'w') as f:
        f.write(f"Error reading CSV: {e}")
