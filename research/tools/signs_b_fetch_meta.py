"""Fetch Commons imageinfo + extmetadata for file titles (part B sign research).

Usage: python3 -I signs_b_fetch_meta.py <titles.txt> <out.json>

<titles.txt> has one title per line ("File:MUTCD W1-1L.svg" or "MUTCD_W1-1L.svg").
Titles are queried in batches of 50 with redirects=1 so redirected file
pages resolve to their target. Output maps each requested title to:
  {requested, resolved, missing, url, descriptionurl, size, width, height,
   mime, license_short, license, usage_terms, copyrighted, object_name,
   description (plain text)}
Existing entries in <out.json> are kept (re-runs only fetch new titles).
Only metadata is fetched; nothing is executed.
"""
import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://commons.wikimedia.org/w/api.php"
UA = ("DMVTestSignResearch/1.0 (educational US driver knowledge-test app; "
      "road-sign asset research; python-urllib)")
PAUSE = 2.0


def api_get(params):
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code in (429, 503) and attempt < 5:
                wait = int(e.headers.get("Retry-After") or 0) or 20 * (attempt + 1)
                print(f"  HTTP {e.code}; sleeping {wait}s", file=sys.stderr)
                time.sleep(wait)
                continue
            raise
        except urllib.error.URLError:
            if attempt < 5:
                time.sleep(5 * (attempt + 1))
                continue
            raise
    return None


def norm_title(t):
    t = t.strip().replace("_", " ")
    if not t.lower().startswith("file:"):
        t = "File:" + t
    else:
        t = "File:" + t[5:]
    return t


def strip_html(s):
    s = re.sub(r"<[^>]+>", " ", s or "")
    s = html.unescape(s)
    return re.sub(r"\s+", " ", s).strip()


def em(meta, key):
    v = meta.get(key, {})
    return v.get("value") if isinstance(v, dict) else None


def fetch_batch(titles):
    params = {"action": "query", "format": "json", "prop": "imageinfo",
              "iiprop": "url|size|mime|extmetadata", "redirects": "1",
              "titles": "|".join(titles), "maxlag": "5"}
    data = api_get(params)
    q = data.get("query", {})
    alias = {}
    for n in q.get("normalized", []):
        alias[n["from"]] = n["to"]
    redirect = {r["from"]: r["to"] for r in q.get("redirects", [])}
    pages = {p["title"]: p for p in q.get("pages", {}).values()}
    out = {}
    for t in titles:
        cur = alias.get(t, t)
        cur = redirect.get(cur, cur)
        p = pages.get(cur)
        rec = {"requested": t, "resolved": cur, "missing": True}
        if p and "missing" not in p and p.get("imageinfo"):
            ii = p["imageinfo"][0]
            meta = ii.get("extmetadata", {})
            rec.update({
                "missing": False,
                "url": (ii.get("url") or "").split("?")[0],
                "descriptionurl": ii.get("descriptionurl"),
                "size": ii.get("size"), "width": ii.get("width"),
                "height": ii.get("height"), "mime": ii.get("mime"),
                "license_short": strip_html(em(meta, "LicenseShortName")),
                "license": em(meta, "License"),
                "usage_terms": strip_html(em(meta, "UsageTerms")),
                "copyrighted": em(meta, "Copyrighted"),
                "object_name": strip_html(em(meta, "ObjectName")),
                "description": strip_html(em(meta, "ImageDescription"))[:400],
                "categories": em(meta, "Categories"),
            })
        out[t] = rec
    return out


def main():
    src, out = sys.argv[1], sys.argv[2]
    with open(src) as f:
        titles = [norm_title(l) for l in f if l.strip()]
    titles = list(dict.fromkeys(titles))
    result = {}
    if os.path.exists(out):
        with open(out) as f:
            result = json.load(f)
    todo = [t for t in titles if t not in result]
    print(f"{len(titles)} titles, {len(todo)} to fetch", file=sys.stderr)
    for i in range(0, len(todo), 50):
        batch = todo[i:i + 50]
        result.update(fetch_batch(batch))
        with open(out, "w") as f:
            json.dump(result, f, indent=1)
        print(f"  fetched {i + len(batch)}/{len(todo)}", file=sys.stderr)
        time.sleep(PAUSE)


if __name__ == "__main__":
    main()
