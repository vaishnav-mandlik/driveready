"""Render SVGs with rsvg-convert and tile them into labeled contact sheets.

Usage: python3 -I contact_sheet.py <svg_dir> <out_prefix> [--per 24] [--codes A,B,...]

Each <code>.svg in <svg_dir> (or only the listed codes) is rendered to a
temporary 200px-wide PNG beside <out_prefix>, then ImageMagick `montage`
tiles them 6 per row on a gray background with the code as the label.
Writes <out_prefix>-1.png, <out_prefix>-2.png, ... for visual review.
"""
import os
import subprocess
import sys


def main() -> None:
    args = sys.argv[1:]
    per, codes = 24, None
    if "--per" in args:
        i = args.index("--per"); per = int(args[i + 1]); del args[i:i + 2]
    if "--codes" in args:
        i = args.index("--codes"); codes = args[i + 1].split(","); del args[i:i + 2]
    if len(args) != 2:
        sys.exit(__doc__)
    svg_dir, prefix = args
    tmp = prefix + "_tiles"
    os.makedirs(tmp, exist_ok=True)
    names = sorted(f[:-4] for f in os.listdir(svg_dir) if f.endswith(".svg"))
    if codes:
        names = [c for c in codes if c in names]
    tiles = []
    for code in names:
        png = os.path.join(tmp, code + ".png")
        r = subprocess.run(["rsvg-convert", "-w", "200", "-o", png,
                            os.path.join(svg_dir, code + ".svg")],
                           capture_output=True, text=True)
        if r.returncode == 0:
            tiles.append((code, png))
        else:
            print(f"render failed: {code}: {r.stderr.strip()[:120]}", file=sys.stderr)
    for n, start in enumerate(range(0, len(tiles), per), 1):
        chunk = tiles[start:start + per]
        cmd = ["montage"]
        for code, png in chunk:
            cmd += ["-label", code, png]
        cmd += ["-tile", "6x", "-geometry", "200x200+8+8", "-background", "#9a9a9a",
                "-pointsize", "16", f"{prefix}-{n}.png"]
        subprocess.run(cmd, check=True)
        print(f"{prefix}-{n}.png: " + " ".join(c for c, _ in chunk))


if __name__ == "__main__":
    main()
