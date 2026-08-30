import re

file_path = r"C:\Users\booki\Antigravity\essenza-projeto\index.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Very basic minification: remove newlines and excessive spaces between tags
content = re.sub(r'>\s+<', '><', content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
