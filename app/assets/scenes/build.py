"""Render every scene module (scenes_*.py) to svg/<CODE>.svg and write manifest_scenes.json.

Usage: python3 -I build.py [--png <dir>]
The manifest is picked up by app/scripts/build-signs.mjs (category "scenario").
"""
import importlib.util
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
OUT = os.path.join(HERE, "svg")
os.makedirs(OUT, exist_ok=True)


def load(path):
    spec = importlib.util.spec_from_file_location(os.path.basename(path)[:-3], path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return getattr(mod, "SCENES", [])


def main():
    png_dir = sys.argv[sys.argv.index("--png") + 1] if "--png" in sys.argv else None
    if png_dir:
        os.makedirs(png_dir, exist_ok=True)
    manifest, seen = [], set()
    for name in sorted(os.listdir(HERE)):
        if not (name.startswith("scenes_") and name.endswith(".py")):
            continue
        for code, title, meaning, builder in load(os.path.join(HERE, name)):
            if code in seen:
                raise SystemExit(f"duplicate scene code {code} in {name}")
            if not code.startswith("SCN-"):
                raise SystemExit(f"scene codes must start with SCN-: {code}")
            seen.add(code)
            svg = builder().svg()
            path = os.path.join(OUT, f"{code}.svg")
            with open(path, "w") as f:
                f.write(svg)
            manifest.append({"code": code, "name": title, "category": "scenario", "shape": "Illustration", "colors": "",
                             "meaning": meaning, "license": "app-drawn", "svgPath": f"svg/{code}.svg", "module": name})
            if png_dir:
                subprocess.run(["rsvg-convert", "-w", "360", path, "-o", os.path.join(png_dir, f"{code}.png")], check=False)
    with open(os.path.join(HERE, "manifest_scenes.json"), "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"{len(manifest)} scenes")


if __name__ == "__main__":
    main()
