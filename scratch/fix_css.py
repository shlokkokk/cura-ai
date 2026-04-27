
import re

# Fix image paths in cura.jsx
with open("scratch/cura.jsx", "r", encoding="utf-8") as f:
    jsx = f.read()

jsx = jsx.replace("Container1.svg", "Container.svg")
jsx = jsx.replace("Asset-1-11@2x.png", "Asset-1-1@2x.png")
jsx = jsx.replace("Asset-5-11@2x.png", "Asset-5-1@2x.png")
jsx = jsx.replace("Asset-4-11@2x.png", "Asset-4-1@2x.png")

with open("scratch/cura.jsx", "w", encoding="utf-8") as f:
    f.write(jsx)

# Fix CSS fixed heights
with open("frontend/src/cura.css", "r", encoding="utf-8") as f:
    css = f.read()

css = re.sub(r"height:\s*\d+(\.\d+)?px;", "height: auto;", css)

with open("frontend/src/cura.css", "w", encoding="utf-8") as f:
    f.write(css)

# Re-inject Landing.jsx
import os
os.system("python scratch\inject_landing.py")

