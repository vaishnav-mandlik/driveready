"""Enumerate Wikimedia Commons file names by title prefix (part B sign research).

Usage: python3 -I signs_b_enumerate.py <out.json> "<prefix>" ["<prefix>" ...]

Uses list=allimages (names only, no downloads) and writes a JSON object
{prefix: [file names]}, merged into <out.json> after every prefix so a
rate-limit failure never loses earlier work. Nothing fetched is executed.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://commons.wikimedia.org/w/api.php"
UA = ("DMVTestSignResearch/1.0 (educational US driver knowledge-test app; "
      "road-sign asset research; python-urllib)")
PAUSE = 2.0  # seconds between API calls (be polite to Commons)


def api_get(params):
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
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


def enumerate_prefix(prefix):
    names = []
    params = {"action": "query", "format": "json", "list": "allimages",
              "aiprefix": prefix, "ailimit": "500", "aiprop": "size|mime",
              "maxlag": "5"}
    while True:
        data = api_get(params)
        for img in data.get("query", {}).get("allimages", []):
            names.append({"name": img["name"], "size": img.get("size"),
                          "mime": img.get("mime")})
        cont = data.get("continue")
        if not cont:
            break
        params.update(cont)
        time.sleep(PAUSE)
    return names


def main():
    out = sys.argv[1]
    result = {}
    if os.path.exists(out):
        with open(out) as f:
            result = json.load(f)
    for prefix in sys.argv[2:]:
        if prefix in result:
            print(f"{prefix!r}: cached ({len(result[prefix])})", file=sys.stderr)
            continue
        result[prefix] = enumerate_prefix(prefix)
        print(f"{prefix!r}: {len(result[prefix])} files", file=sys.stderr)
        with open(out, "w") as f:
            json.dump(result, f, indent=1)
        time.sleep(PAUSE)


if __name__ == "__main__":
    main()
