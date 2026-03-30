#!/usr/bin/env python3
"""Crop each wardrobe PNG to the tight bounding box of the item (trim transparent padding)."""

from pathlib import Path
from PIL import Image

wardrobe_dir = Path("/home/user/style/wardrobe-photos")

for img_path in sorted(wardrobe_dir.glob("*.png")):
    img = Image.open(img_path).convert("RGBA")
    bbox = img.split()[3].getbbox()  # bounding box of non-transparent pixels via alpha channel
    if bbox:
        cropped = img.crop(bbox)
        cropped.save(img_path)
        print(f"{img_path.name}: {img.size} -> {cropped.size}")
    else:
        print(f"{img_path.name}: fully transparent, skipped")

print("\nAll done!")
