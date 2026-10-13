"""Estimate the MUTCD color names that cover a rendered sign PNG.

Usage: python3 -I png_colors.py <png> [<png> ...]   (prints one line per file)

Opaque pixels are snapped to the nearest reference color (RGB distance) and
reported by share of area, largest first, keeping colors with >= 1.5% area.
This is a sanity check for the hand-written "colors" field, not a spec.
"""
import sys

from PIL import Image

REF = {
    "white": [(255, 255, 255), (235, 235, 235)],
    "black": [(0, 0, 0), (35, 31, 32)],
    "red": [(193, 39, 45), (175, 30, 45), (237, 28, 36), (204, 0, 0)],
    "yellow": [(255, 204, 0), (253, 184, 19), (255, 221, 0), (247, 181, 0)],
    "fluorescent yellow-green": [(204, 255, 0), (190, 214, 48), (178, 210, 53), (221, 240, 0)],
    "green": [(0, 107, 63), (0, 132, 61), (0, 128, 0), (0, 100, 0)],
    "blue": [(0, 63, 135), (0, 82, 147), (0, 0, 255), (31, 78, 156)],
    "orange": [(255, 128, 0), (243, 128, 32), (255, 102, 0)],
    "brown": [(94, 58, 28)],
    "gray": [(128, 128, 128), (160, 160, 160)],
}


def nearest(rgb):
    best, bd = None, 1e9
    for name, samples in REF.items():
        for s in samples:
            d = sum((a - b) ** 2 for a, b in zip(rgb, s))
            if d < bd:
                best, bd = name, d
    return best


def colors(path, min_share=0.015):
    im = Image.open(path).convert("RGBA")
    im.thumbnail((120, 120))
    counts, total = {}, 0
    pixels = im.get_flattened_data() if hasattr(im, "get_flattened_data") else im.getdata()
    for r, g, b, a in pixels:
        if a < 200:
            continue
        name = nearest((r, g, b))
        counts[name] = counts.get(name, 0) + 1
        total += 1
    ranked = sorted(counts.items(), key=lambda kv: -kv[1])
    return [(n, round(c / total, 3)) for n, c in ranked if total and c / total >= min_share]


def main() -> None:
    for p in sys.argv[1:]:
        print(p.rsplit("/", 1)[-1], colors(p))


if __name__ == "__main__":
    main()
