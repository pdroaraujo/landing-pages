import os
import re

TARGET_DIR = r"C:\Users\booki\Antigravity\essenza-projeto"

with open(os.path.join(TARGET_DIR, "scraper.py"), "r", encoding="utf-8") as f:
    code = f.read()

# Fix the previous edit mistake
code = code.replace('with open("index.html", "w", encoding="utf-8") as f:', "with open(os.path.join(TARGET_DIR, 'index.html'), 'w', encoding='utf-8') as f:")

with open(os.path.join(TARGET_DIR, "scraper.py"), "w", encoding="utf-8") as f:
    f.write(code)
