"""Build a sign manifest: copy kept SVGs, render PNGs, compute SvgXml flags.

Usage:
  python3 -I build_sign_manifest.py <catalog.json> <commons_meta.json> \
      <signs_dir> <manifest_out.json> [--from-staging <dir>]

<catalog.json>: list of {code, name, category, shape, colors, meaning,
  commonsFile (Commons title or null), notes?}.
<commons_meta.json>: output of commons_imageinfo.py for the catalog titles.
<signs_dir>: contains svg/ and png/ (created if missing). SVGs are expected
  at svg/<code>.svg; with --from-staging they are first copied there from
  <dir>/<code>.svg after checking the byte count matches Commons.

Only files whose Commons LicenseShortName is "Public domain" are kept; any
other license (or a missing file) is recorded with svgPath null. Each kept SVG
is rendered with `rsvg-convert -w 240` into png/<code>.png to prove it parses.
Paths in the manifest are relative to <signs_dir>. SVG content is treated as
data only (scanned as text by svg_flags.py; rendered only by rsvg-convert).
"""
import json
import os
import shutil
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svg_flags import analyze  # noqa: E402

REQUIRED_FLAGS = ("hasText", "hasStyle", "hasUseOrDefs", "hasGradient",
                  "hasClipPath", "hasImage")


def is_public_domain(meta: dict) -> bool:
    lic = (meta.get("license") or "").strip().lower()
    return lic == "public domain"


def norm_title(t: str) -> str:
    t = t.strip().replace("_", " ")
    return t if t.lower().startswith("file:") else "File:" + t


def main() -> None:
    args = sys.argv[1:]
    staging = None
    if "--from-staging" in args:
        i = args.index("--from-staging")
        staging = args[i + 1]
        del args[i:i + 2]
    if len(args) != 4:
        sys.exit(__doc__)
    catalog_path, meta_path, signs_dir, out_path = args
    catalog = json.load(open(catalog_path, encoding="utf-8"))
    meta_all = json.load(open(meta_path, encoding="utf-8"))
    svg_dir = os.path.join(signs_dir, "svg")
    png_dir = os.path.join(signs_dir, "png")
    os.makedirs(svg_dir, exist_ok=True)
    os.makedirs(png_dir, exist_ok=True)

    codes = [c["code"] for c in catalog]
    dupes = {c for c in codes if codes.count(c) > 1}
    if dupes:
        sys.exit(f"duplicate codes in catalog: {sorted(dupes)}")

    manifest, problems = [], []
    for entry in catalog:
        code = entry["code"]
        title = entry.get("commonsFile")
        meta = meta_all.get(norm_title(title)) if title else None
        rec = {
            "code": code,
            "name": entry["name"],
            "category": entry["category"],
            "shape": entry["shape"],
            "colors": entry["colors"],
            "meaning": entry["meaning"],
            "commonsFile": meta["title"] if meta and not meta.get("missing") else title,
            "commonsUrl": meta.get("descriptionurl") if meta else None,
            "license": meta.get("license") if meta else None,
            "svgPath": None,
            "pngPath": None,
            "bytes": None,
            "flags": None,
        }
        if meta and not meta.get("missing"):
            rec["downloadUrl"] = meta.get("url")
            rec["author"] = meta.get("artist") or None
        if entry.get("notes"):
            rec["notes"] = entry["notes"]

        if not meta or meta.get("missing"):
            problems.append(f"{code}: no Commons file")
            manifest.append(rec)
            continue
        if not is_public_domain(meta):
            problems.append(f"{code}: license {meta.get('license')!r} is not public domain")
            manifest.append(rec)
            continue

        svg_rel = f"svg/{code}.svg"
        svg_abs = os.path.join(signs_dir, svg_rel)
        if staging:
            src = os.path.join(staging, f"{code}.svg")
            if os.path.exists(src) and os.path.getsize(src) == meta.get("size"):
                shutil.copyfile(src, svg_abs)
        if not os.path.exists(svg_abs):
            problems.append(f"{code}: SVG not downloaded")
            manifest.append(rec)
            continue
        size = os.path.getsize(svg_abs)
        if meta.get("size") and size != meta["size"]:
            problems.append(f"{code}: size {size} != Commons size {meta['size']}")

        png_rel = f"png/{code}.png"
        png_abs = os.path.join(signs_dir, png_rel)
        res = subprocess.run(["rsvg-convert", "-w", "240", "-o", png_abs, svg_abs],
                             capture_output=True, text=True, timeout=60)
        if res.returncode != 0 or not os.path.exists(png_abs) or os.path.getsize(png_abs) == 0:
            problems.append(f"{code}: rsvg-convert failed: {res.stderr.strip()[:200]}")
            png_rel = None
        elif res.stderr.strip():
            problems.append(f"{code}: rsvg-convert warning: {res.stderr.strip()[:200]}")

        flags = analyze(svg_abs)
        ordered = {k: flags[k] for k in REQUIRED_FLAGS}
        ordered.update({k: v for k, v in flags.items() if k not in REQUIRED_FLAGS})
        rec.update({"svgPath": svg_rel, "pngPath": png_rel, "bytes": size,
                    "flags": ordered})
        try:  # width / height of the drawing, for layout in the app
            vb = [float(x) for x in (flags.get("viewBox") or "").replace(",", " ").split()]
            rec["aspectRatio"] = round(vb[2] / vb[3], 3) if len(vb) == 4 and vb[3] else None
        except ValueError:
            rec["aspectRatio"] = None
        manifest.append(rec)

    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=2, ensure_ascii=False)
        fh.write("\n")
    kept = sum(1 for r in manifest if r["svgPath"])
    print(f"{len(manifest)} signs, {kept} with SVG, {len(manifest) - kept} without",
          file=sys.stderr)
    for p in problems:
        print("  - " + p, file=sys.stderr)


if __name__ == "__main__":
    main()
