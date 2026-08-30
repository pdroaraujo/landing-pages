from bs4 import BeautifulSoup
import re

with open("C:/Users/booki/Antigravity/essenza-projeto/index.html", "r", encoding="utf-8") as f:
    html = f.read()

soup = BeautifulSoup(html, "html.parser")

# 1. Look for remaining English text
# We can just extract all text and show unique words or sentences
texts = list(soup.stripped_strings)
english_clues = ["The", "the", "and", "And", "with", "With", "for", "For", "to", "To", "of", "Of", "in", "In", "on", "On", "at", "At", "by", "By", "an", "An", "is", "Is", "are", "Are", "we", "We", "you", "You", "our", "Our", "will", "Will", "be", "Be", "this", "This", "that", "That"]

potential_untranslated = []
for t in texts:
    words = t.split()
    if any(w in english_clues for w in words):
        potential_untranslated.append(t)

print("--- POTENTIAL UNTRANSLATED TEXT ---")
for t in set(potential_untranslated):
    print(t)

# 2. Find the flower effect
# Could it be a div with a specific class?
print("\n--- SVG ELEMENTS ---")
svgs = soup.find_all("svg")
for i, svg in enumerate(svgs):
    print(f"SVG {i}: class={svg.get('class')}")

# Could it be framer-motion elements?
print("\n--- ELEMENTS WITH ANIMATION CLASSES ---")
animated = soup.find_all(class_=re.compile("animat|flower|petal|jump|float", re.I))
for a in animated:
    print(a.name, a.get("class"))

