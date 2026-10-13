"""Tile rendered sign PNGs into labeled contact sheets for visual review.

Usage: python3 -I signs_b_contact_sheet.py <out_prefix> <cols> <per_sheet> <png> [<png> ...]

Each tile shows the PNG (fit into 240x240 on a mid-grey background so white
and yellow signs are both visible) with its file stem as a label.
Writes <out_prefix>_1.png, <out_prefix>_2.png, ...
"""
import os
import sys

from PIL import Image, ImageDraw, ImageFont

TILE, LABEL = 240, 22


def main():
    prefix, cols, per = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
    pngs = sys.argv[4:]
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 16)
    except OSError:
        font = ImageFont.load_default()
    for s in range(0, len(pngs), per):
        chunk = pngs[s:s + per]
        rows = (len(chunk) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * (TILE + 8), rows * (TILE + LABEL + 8)), (150, 150, 150))
        d = ImageDraw.Draw(sheet)
        for i, p in enumerate(chunk):
            x = (i % cols) * (TILE + 8) + 4
            y = (i // cols) * (TILE + LABEL + 8) + 4
            try:
                im = Image.open(p).convert("RGBA")
                im.thumbnail((TILE, TILE))
                sheet.paste(im, (x + (TILE - im.width) // 2, y + (TILE - im.height) // 2), im)
            except Exception as e:  # show the failure in the tile
                d.text((x + 4, y + 4), f"ERR {e}"[:40], fill=(255, 0, 0), font=font)
            d.text((x + 2, y + TILE + 2), os.path.splitext(os.path.basename(p))[0][:28],
                   fill=(0, 0, 0), font=font)
        out = f"{prefix}_{s // per + 1}.png"
        sheet.save(out)
        print(out)


if __name__ == "__main__":
    main()
