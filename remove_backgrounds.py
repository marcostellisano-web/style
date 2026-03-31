#!/usr/bin/env python3
"""Remove backgrounds from all wardrobe photos and save as PNG with transparency."""

import os
from pathlib import Path
from rembg import remove
from PIL import Image
import io

wardrobe_dir = Path("/home/user/style/wardrobe-photos")

image_extensions = {".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG", ".WEBP"}

images = [f for f in wardrobe_dir.iterdir() if f.suffix in image_extensions]
images.sort()

print(f"Found {len(images)} images to process")

for img_path in images:
    print(f"Processing: {img_path.name} ...", end=" ", flush=True)
    try:
        with open(img_path, "rb") as f:
            input_data = f.read()

        output_data = remove(input_data)

        # Determine output path: same name but .png
        out_path = img_path.with_suffix(".png")
        # Rename to remove spaces-safe name (keep same name, just change extension)
        with open(out_path, "wb") as f:
            f.write(output_data)

        # If original wasn't already a .png, delete the original
        if img_path.suffix.lower() != ".png":
            os.remove(img_path)
            print(f"done -> {out_path.name}")
        else:
            print(f"done (overwritten)")

    except Exception as e:
        print(f"ERROR: {e}")

print("\nAll done!")
