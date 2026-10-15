"""Download public-domain US DOT hazmat placard SVGs from Wikimedia Commons and write the manifest.

Adapted from fetch_signs.py (same public-domain filter and download checks).

Usage: python3 -I fetch_hazmat.py <research_dir> <raw_download_dir>

Downloads each chosen Commons file into <raw_download_dir> (a new, empty scratch dir: data only, never
executed), checks it is a plain SVG (no script/foreign content), then copies it to
<research_dir>/signs/svg-hazmat/<code>.svg and writes <research_dir>/signs/manifest_hazmat.json.

Only files whose extmetadata LicenseShortName is public domain / CC0 are accepted. Placard designs are the
current US DOT 49 CFR 172.519-172.560 placards (class/division number in the bottom corner). The 1991 white
"POISON GAS" design is not used: since 1997 the 2.3 and 6.1 inhalation placards have a black upper diamond
(49 CFR 172.540, 172.555).
"""
import json
import os
import re
import shutil
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

UA = "DriveReadyApp/1.0 (driver-education app; public-domain hazmat placards)"
API = "https://commons.wikimedia.org/w/api.php"
PD = re.compile(r"public domain|^pd|cc0", re.I)
DELAY = 2.0  # seconds between requests (>= 1.5 s)

SHAPE = "diamond (square-on-point)"

# code, name, colors, meaning, candidate Commons files (first public-domain SVG wins)
CATALOG = [
    ("HM-1.1", "Explosives 1.1 placard (Division 1.1)", "orange, black",
     "Marks Division 1.1 explosives, which have a mass explosion hazard (for example, dynamite). It is a Table 1 "
     "material, so placards are required for any amount; never park within 5 feet of the traveled road or, except "
     "briefly for needs like fueling, within 300 feet of a bridge, tunnel, building, crowd or open fire.",
     ["1991 United States Hazmat Placard - Explosives 1.1.svg"]),
    ("HM-1.4", "Explosives 1.4 placard (Division 1.4)", "orange, black",
     "Marks Division 1.4 explosives, which have only a minor explosion hazard (for example, ammunition). It is a "
     "Table 2 material: placards are required when the vehicle carries 1,001 pounds or more of Table 2 materials.",
     ["1991 United States Hazmat Placard - Explosives 1.4 - Blank.svg"]),
    ("HM-1.5", "Explosives 1.5 placard (Division 1.5, blasting agents)", "orange, black",
     "Marks Division 1.5 very insensitive explosives, also called blasting agents. It is a Table 2 material: "
     "placards are required when the vehicle carries 1,001 pounds or more of Table 2 materials.",
     ["1991 United States Hazmat Placard - Explosives 1.5 - Blank.svg"]),
    ("HM-1.6", "Explosives 1.6 placard (Division 1.6)", "orange, black",
     "Marks Division 1.6 extremely insensitive explosives (explosive devices). It is a Table 2 material: placards "
     "are required when the vehicle carries 1,001 pounds or more of Table 2 materials.",
     ["1991 United States Hazmat Placard - Explosives 1.6.svg"]),
    ("HM-2.1", "Flammable gas placard (Division 2.1)", "red, white",
     "Marks Division 2.1 flammable gases such as propane. It is a Table 2 material (1,001 pounds or more); never "
     "use flares around a tank used for flammable gas, loaded or empty, and never smoke within 25 feet of one.",
     ["1991 - United States Hazmat Placard - Flammable Gas.svg"]),
    ("HM-2.2", "Non-flammable gas placard (Division 2.2)", "green, white",
     "Marks Division 2.2 non-flammable compressed gases such as helium. It is a Table 2 material: placards are "
     "required when the vehicle carries 1,001 pounds or more of Table 2 materials.",
     ["1991 - United States Hazmat Placard - Non-Flammable Gas.svg"]),
    ("HM-OXYGEN", "Oxygen placard (Division 2.2)", "yellow, black",
     "Used for compressed or refrigerated liquid oxygen, a Division 2.2 gas that also feeds fire. In domestic "
     "transportation it may be used in place of the NON-FLAMMABLE GAS placard; Table 2 rules (1,001 pounds or more) "
     "apply.",
     ["1991 - United States Hazmat Placard - Oxygen.svg"]),
    ("HM-2.3", "Poison gas placard (Division 2.3)", "white, black",
     "Marks Division 2.3 poisonous (toxic) gases; the current design reads INHALATION HAZARD with class 2 at the "
     "bottom. It is a Table 1 material, so placards are required for any amount.",
     ["1998 - United States Hazmat Placard - Inhalation Hazard - Class 2.svg"]),
    ("HM-6.1-INHALATION", "Poison inhalation hazard placard (Division 6.1)", "white, black",
     "Marks Division 6.1 poisons that are toxic to breathe (INHALATION HAZARD on the shipping paper or package). "
     "It is required for any amount (Table 1), in addition to any other placards the hazard class needs.",
     ["1998 - United States Hazmat Placard - Inhalation Hazard - Class 6.svg"]),
    ("HM-3", "Flammable liquid placard (Class 3)", "red, white",
     "Marks Class 3 flammable liquids such as gasoline. It is a Table 2 material (1,001 pounds or more, or any "
     "amount in bulk); never use flares around a Class 3 tank, loaded or empty, and never smoke within 25 feet.",
     ["1991 - United States Hazmat Placard - Flammable.svg"]),
    ("HM-COMBUSTIBLE", "Combustible liquid placard", "red, white",
     "Marks combustible liquids such as fuel oil (a category of its own, though the placard shows a 3). It is in "
     "Table 2; a FLAMMABLE placard may be used in its place on a cargo tank or portable tank.",
     ["1991 - United States Hazmat Placard - Combustible.svg"]),
    ("HM-4.1", "Flammable solid placard (Division 4.1)", "red, white",
     "Marks Division 4.1 flammable solids (for example, wetted ammonium picrate). It is a Table 2 material; Class 4 "
     "loads must be in a closed cargo space or fully covered by a fire- and water-resistant tarp.",
     ["1991 - United States Hazmat Placard - Flammable Solid.svg"]),
    ("HM-4.2", "Spontaneously combustible placard (Division 4.2)", "white, red",
     "Marks Division 4.2 materials that can catch fire on their own, such as white phosphorus. It is a Table 2 "
     "material; these loads need a vehicle with enough ventilation.",
     ["1991 - United States Hazmat Placard - Spontaneously Combustible.svg"]),
    ("HM-4.3", "Dangerous when wet placard (Division 4.3)", "blue, white",
     "Marks Division 4.3 materials that react dangerously with water, such as sodium. It is a Table 1 material, so "
     "placards are required for any amount; keep the load dry during loading, transit and unloading.",
     ["1991 - United States Hazmat Placard - Dangerous When Wet.svg"]),
    ("HM-5.1", "Oxidizer placard (Division 5.1)", "yellow, black",
     "Marks Division 5.1 oxidizers such as ammonium nitrate. It is a Table 2 material; never smoke around oxidizers "
     "and do not carry them as an overhang or tailgate load.",
     ["1991 - United States Hazmat Placard - Oxidizer.svg"]),
    ("HM-5.2", "Organic peroxide placard (Division 5.2)", "red, yellow, black",
     "Marks Division 5.2 organic peroxides such as methyl ethyl ketone peroxide (red top half, yellow bottom half). "
     "Type B temperature-controlled organic peroxide needs placards in any amount (Table 1); other organic "
     "peroxides are Table 2.",
     ["2007 - United States Hazmat Placard - Organic Peroxide.svg"]),
    ("HM-6.1", "Poison placard (Division 6.1)", "white, black",
     "Marks Division 6.1 poisonous (toxic) materials such as potassium cyanide that are not an inhalation hazard. "
     "It is a Table 2 material; never load POISON-labeled packages in the cab or sleeper or with food for people "
     "or animals.",
     ["1991 - United States Hazmat Placard - Poison.svg"]),
    ("HM-7", "Radioactive placard (Class 7)", "yellow, white, black",
     "Marks Class 7 radioactive materials such as uranium. Any amount of packages with the Radioactive Yellow III "
     "label requires it (Table 1); the carrier must choose the safest route and show the driver the route plan.",
     ["1991 - United States Hazmat Placard - Radioactive.svg"]),
    ("HM-8", "Corrosive placard (Class 8)", "white, black",
     "Marks Class 8 corrosives such as battery fluid. It is a Table 2 material; load breakable containers of "
     "corrosive liquid one by one, right side up, and never next to or above materials like Division 4.1 or Class 5.",
     ["1991 - United States Hazmat Placard - Corrosive.svg"]),
    ("HM-9", "Class 9 placard (miscellaneous hazardous materials)", "black, white",
     "Marks Class 9 miscellaneous hazardous materials such as PCBs (seven black stripes on top, underlined 9). It "
     "is in Table 2, but a Class 9 placard is not required for domestic transportation.",
     ["1991 - United States Hazmat Placard - Miscellaneous Hazardous Materials.svg"]),
    ("HM-DANGEROUS", "Dangerous placard (mixed loads)", "red, white, black",
     "May be used instead of separate placards when a vehicle has 1,001 pounds or more of two or more Table 2 "
     "hazard classes. It cannot replace the class placard for 2,205 pounds or more of one class loaded at one "
     "place, and never replaces Table 1 placards; it is an option, not a requirement.",
     ["1977 United States Placard - Dangerous.svg"]),
]


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
        time.sleep(DELAY)
    return out


def looks_like_svg(data: bytes) -> bool:
    head = data[:4096].decode("utf-8", "replace")
    head = re.sub(r"^﻿?\s*(<\?xml[^>]*\?>\s*)?", "", head)
    head = re.sub(r"^(\s*(<!--.*?-->|<!DOCTYPE[^>]*(\[.*?\])?\s*>))*\s*", "", head, flags=re.S)
    return re.match(r"^<(\w+:)?svg[\s>]", head) is not None


def unsafe(data: bytes) -> bool:
    text = data.decode("utf-8", "replace")
    return re.search(r"<script|<foreignObject|<image|\bon[a-z]+\s*=|<!ENTITY", text, re.I) is not None


def main() -> int:
    root, raw_dir = sys.argv[1], sys.argv[2]
    os.makedirs(raw_dir, exist_ok=True)
    svg_dir = os.path.join(root, "signs", "svg-hazmat")
    os.makedirs(svg_dir, exist_ok=True)
    titles = sorted({f"File:{t}" for *_, cands in CATALOG for t in cands})
    info = imageinfo(titles)
    manifest, missing = [], []
    for code, name, colors, meaning, cands in CATALOG:
        chosen = None
        for t in (f"File:{c}" for c in cands):
            ii = info.get(t)
            if ii and ii.get("mime") == "image/svg+xml" and PD.search(ii.get("license", "")):
                chosen = (t, ii)
                break
        if not chosen:
            missing.append(f"{code} (no public-domain SVG among {cands})")
            continue
        title, ii = chosen
        raw = os.path.join(raw_dir, f"{code}.svg")
        if not (os.path.exists(raw) and os.path.getsize(raw) == ii.get("size")):
            data = get(ii["url"])
            with open(raw + ".part", "wb") as f:
                f.write(data)
            os.replace(raw + ".part", raw)
            time.sleep(DELAY)
        with open(raw, "rb") as f:
            data = f.read()
        if not looks_like_svg(data) or unsafe(data):
            missing.append(f"{code} (not a plain svg)")
            continue
        shutil.copyfile(raw, os.path.join(svg_dir, f"{code}.svg"))
        manifest.append({
            "code": code, "name": name, "category": "hazmat", "shape": SHAPE, "colors": colors,
            "meaning": meaning, "commonsFile": title, "commonsUrl": ii["page"], "license": ii["license"],
            "svgPath": f"svg-hazmat/{code}.svg",
        })
        print(f"{code}: {title} [{ii['license']}]")
    with open(os.path.join(root, "signs", "manifest_hazmat.json"), "w") as f:
        json.dump(manifest, f, indent=2)
        f.write("\n")
    print(f"manifest_hazmat.json: {len(manifest)}/{len(CATALOG)} placards")
    if missing:
        print("missing:", "; ".join(missing))
    return 0


if __name__ == "__main__":
    sys.exit(main())
