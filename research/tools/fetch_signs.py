"""Resolve sign catalogs to public-domain Wikimedia Commons SVGs, download them, write manifests.

Usage: python3 -I fetch_signs.py <research_dir>

Reads  <research_dir>/tools/regulatory_catalog.json   (entries with "commonsFile")
       <research_dir>/tools/signs_b_catalog.json      (entries with "candidates")
Writes <research_dir>/signs/svg/<code>.svg (data only, never executed)
       <research_dir>/signs/manifest_regulatory.json, manifest_warning_guide.json
"""
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

UA = "DriveReadyApp/1.0 (driver-education app; public-domain MUTCD sign assets)"
API = "https://commons.wikimedia.org/w/api.php"
PD = re.compile(r"public domain|^pd|cc0", re.I)


def get(url: str) -> bytes:
    for attempt in range(10):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if attempt == 9 or e.code not in (429, 500, 502, 503, 504):
                raise
            wait = int(e.headers.get("Retry-After") or 0) or min(120, 15 * (attempt + 1))
            print(f"  HTTP {e.code}; waiting {wait}s", flush=True)
            time.sleep(wait)
        except Exception:  # noqa: BLE001 - transient network errors
            if attempt == 9:
                raise
            time.sleep(5 * (attempt + 1))
    return b""


def imageinfo(titles):
    out = {}
    for i in range(0, len(titles), 50):
        batch = titles[i:i + 50]
        q = urllib.parse.urlencode({
            "action": "query", "format": "json", "prop": "imageinfo",
            "iiprop": "url|size|extmetadata|mime", "titles": "|".join(batch),
        })
        data = json.loads(get(f"{API}?{q}"))
        norm = {n["from"]: n["to"] for n in data.get("query", {}).get("normalized", [])}
        pages = data.get("query", {}).get("pages", {})
        by_title = {p.get("title"): p for p in pages.values()}
        for t in batch:
            p = by_title.get(norm.get(t, t))
            if not p or "missing" in p or not p.get("imageinfo"):
                out[t] = None
                continue
            ii = p["imageinfo"][0]
            meta = ii.get("extmetadata", {})
            out[t] = {
                "url": ii.get("url"),
                "page": ii.get("descriptionurl"),
                "mime": ii.get("mime"),
                "size": ii.get("size"),
                "license": (meta.get("LicenseShortName") or {}).get("value", ""),
            }
        time.sleep(0.5)
    return out


def looks_like_svg(data: bytes) -> bool:
    head = data[:4096].decode("utf-8", "replace")
    head = re.sub(r"^﻿?\s*(<\?xml[^>]*\?>\s*)?", "", head)
    head = re.sub(r"^(\s*(<!--.*?-->|<!DOCTYPE[^>]*(\[.*?\])?\s*>))*\s*", "", head, flags=re.S)
    return re.match(r"^<(\w+:)?svg[\s>]", head) is not None


def main() -> int:
    root = sys.argv[1]
    cats = {
        "manifest_regulatory.json": json.load(open(os.path.join(root, "tools", "regulatory_catalog.json"))),
        "manifest_warning_guide.json": json.load(open(os.path.join(root, "tools", "signs_b_catalog.json"))),
    }
    svg_dir = os.path.join(root, "signs", "svg")
    os.makedirs(svg_dir, exist_ok=True)
    titles = set()
    for entries in cats.values():
        for e in entries:
            for t in ([e["commonsFile"]] if e.get("commonsFile") else []) + e.get("candidates", []):
                titles.add(t if t.startswith("File:") else f"File:{t}")
    info = imageinfo(sorted(titles))
    missing = []
    for manifest_name, entries in cats.items():
        manifest = []
        for e in entries:
            cands = ([e["commonsFile"]] if e.get("commonsFile") else []) + e.get("candidates", [])
            cands = [t if t.startswith("File:") else f"File:{t}" for t in cands]
            chosen = None
            for t in cands:
                ii = info.get(t)
                if ii and ii.get("mime") == "image/svg+xml" and PD.search(ii.get("license", "")):
                    chosen = (t, ii)
                    break
            row = {k: e.get(k) for k in ("code", "name", "category", "shape", "colors", "meaning")}
            if not chosen:
                missing.append(f"{e['code']} ({', '.join(cands) or 'no candidates'})")
                manifest.append({**row, "license": None, "svgPath": None})
                continue
            title, ii = chosen
            dest = os.path.join(svg_dir, f"{e['code']}.svg")
            if not (os.path.exists(dest) and os.path.getsize(dest) == ii.get("size")):
                data = get(ii["url"])
                if not looks_like_svg(data):
                    missing.append(f"{e['code']} (not svg)")
                    manifest.append({**row, "license": None, "svgPath": None})
                    continue
                with open(dest + ".part", "wb") as f:
                    f.write(data)
                os.replace(dest + ".part", dest)
                time.sleep(2.0)
            manifest.append({**row, "commonsFile": title, "commonsUrl": ii["page"], "license": ii["license"], "svgPath": f"svg/{e['code']}.svg"})
        with open(os.path.join(root, "signs", manifest_name), "w") as f:
            json.dump(manifest, f, indent=2)
        print(f"{manifest_name}: {sum(1 for m in manifest if m['svgPath'])}/{len(manifest)} with svg")
    if missing:
        print("missing:", "; ".join(missing))
    return 0


if __name__ == "__main__":
    sys.exit(main())
