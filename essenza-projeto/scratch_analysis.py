import re
import json

with open("C:/Users/booki/Antigravity/essenza-projeto/index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Find images
img_tags = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html)
print(f"Number of <img> tags: {len(img_tags)}")
print("Image sources:")
for src in set(img_tags):
    print(" - " + src)

# Find CSS background images
bg_imgs = re.findall(r'url\(["\']?(.*?)["\']?\)', html)
print(f"\nNumber of background images: {len(bg_imgs)}")
for src in set(bg_imgs):
    print(" - " + src)

# Look for flower/animation keywords
print("\nSearching for animation keywords (flower, petal, confetti, jump, float):")
for keyword in ["flower", "petal", "confetti", "jump", "float", "sakura", "animate", "particle"]:
    if keyword in html.lower():
        print(f" - Found keyword: {keyword}")

