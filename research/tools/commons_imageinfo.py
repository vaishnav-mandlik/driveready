"""Fetch Wikimedia Commons imageinfo + license metadata for many file titles.

Usage: python3 -I commons_imageinfo.py <titles.txt> <output.json>

<titles.txt> holds one title per line ("File:MUTCD R1-1.svg" or
"MUTCD_R1-1.svg"; the "File:" prefix is added when missing). Titles are sent
50 per request (action=query, prop=imageinfo, iiprop=url|size|mime|
extmetadata), following normalization and redirects. The output JSON maps
each requested title to:
  {"title": canonical title, "missing": bool, "url", "descriptionurl",
   "size", "width", "height", "mime", "license": LicenseShortName,
   "licenseCode": License, "copyrighted": Copyrighted, "usageTerms",
   "artist" (plain text), "description" (plain text), "redirectedFrom"}
Standard library only; nothing downloaded here is executed.
"""
import gzip
import html
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://commons.wikimedia.org/w/api.php"
UA = "DMVTestSignResearch/1.0 (driver knowledge-test app asset research)"
FIELDS = ("LicenseShortName|License|UsageTerms|Copyrighted|ImageDescription|"
          "Artist|AttributionRequired|Restrictions")


def plain(s):
    if not s:
        return ""
    s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"\s+", " ", html.unescape(s)).strip()


def api_get(params: dict) -> dict:
    params = dict(params, format="json", maxlag="5")
    body = urllib.parse.urlencode(params).encode("utf-8")
    for attempt in range(6):
        req = urllib.request.Request(
            API, data=body,
            headers={"User-Agent": UA, "Accept-Encoding": "gzip",
                     "Content-Type": "application/x-www-form-urlencoded"})
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                raw = resp.read()
                if resp.headers.get("Content-Encoding") == "gzip":
                    raw = gzip.decompress(raw)
                data = json.loads(raw.decode("utf-8"))
        except urllib.error.HTTPError as exc:
            wait = exc.headers.get("Retry-After") if exc.headers else None
            wait = int(wait) if wait and wait.isdigit() else 20 * (attempt + 1)
            print(f"  HTTP {exc.code}; waiting {wait}s", file=sys.stderr)
            time.sleep(wait)
            continue
        except Exception as exc:
            print(f"  retry {attempt + 1}: {exc}", file=sys.stderr)
            time.sleep(5 * (attempt + 1))
            continue
        if "error" in data and data["error"].get("code") == "maxlag":
            time.sleep(5)
            continue
        return data
    raise RuntimeError("API request failed repeatedly")


def norm_title(t: str) -> str:
    t = t.strip().replace("_", " ")
    if not t.lower().startswith("file:"):
        t = "File:" + t
    return t


def fetch(titles):
    out = {}
    for i in range(0, len(titles), 50):
        batch = titles[i:i + 50]
        data = api_get({"action": "query", "prop": "imageinfo",
                        "iiprop": "url|size|mime|extmetadata",
                        "iiextmetadatafilter": FIELDS, "redirects": "1",
                        "titles": "|".join(batch)})
        q = data.get("query", {})
        alias = {}
        for n in q.get("normalized", []):
            alias[n["from"]] = n["to"]
        redirect_from = {}
        for r in q.get("redirects", []):
            redirect_from[r["to"]] = r["from"]
            for k, v in list(alias.items()):
                if v == r["from"]:
                    alias[k] = r["to"]
            alias.setdefault(r["from"], r["to"])
        pages = {p["title"]: p for p in q.get("pages", {}).values()}
        for t in batch:
            canon = alias.get(t, t)
            p = pages.get(canon)
            rec = {"title": canon, "missing": True}
            if p is not None and "imageinfo" in p and "missing" not in p:
                ii = p["imageinfo"][0]
                em = ii.get("extmetadata", {})
                g = lambda k: em.get(k, {}).get("value")
                rec = {
                    "title": canon,
                    "missing": False,
                    "url": ii.get("url", "").split("?")[0],
                    "descriptionurl": ii.get("descriptionurl"),
                    "size": ii.get("size"),
                    "width": ii.get("width"),
                    "height": ii.get("height"),
                    "mime": ii.get("mime"),
                    "license": g("LicenseShortName"),
                    "licenseCode": g("License"),
                    "copyrighted": g("Copyrighted"),
                    "usageTerms": g("UsageTerms"),
                    "attributionRequired": g("AttributionRequired"),
                    "restrictions": g("Restrictions"),
                    "artist": plain(g("Artist")),
                    "description": plain(g("ImageDescription")),
                }
                if canon in redirect_from:
                    rec["redirectedFrom"] = redirect_from[canon]
            out[t] = rec
        print(f"  batch {i // 50 + 1}: {len(batch)} titles", file=sys.stderr)
        time.sleep(1.5)
    return out


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    with open(sys.argv[1], encoding="utf-8") as fh:
        titles = []
        for line in fh:
            line = line.strip()
            if line and not line.startswith("#"):
                t = norm_title(line)
                if t not in titles:
                    titles.append(t)
    result = fetch(titles)
    with open(sys.argv[2], "w", encoding="utf-8") as fh:
        json.dump(result, fh, indent=1, ensure_ascii=False)
    found = sum(1 for r in result.values() if not r["missing"])
    print(f"{found}/{len(result)} titles found", file=sys.stderr)


if __name__ == "__main__":
    main()
