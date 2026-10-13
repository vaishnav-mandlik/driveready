"""List Wikimedia Commons file titles that start with one or more prefixes.

Usage: python3 -I commons_list_prefix.py <output.json> "<prefix>" ["<prefix>" ...]

Example prefixes: "MUTCD R", "MUTCD S", "MUTCD W10".
Uses list=allimages (namespace File, sorted by name) with continuation, a
descriptive User-Agent, maxlag, and a short pause between requests. Writes a
JSON object {prefix: [{"name", "size", "url"}...]} to <output.json>.
Standard library only; no downloaded content is executed.
"""
import gzip
import json
import sys
import urllib.error
import time
import urllib.parse
import urllib.request

API = "https://commons.wikimedia.org/w/api.php"
UA = "DMVTestSignResearch/1.0 (driver knowledge-test app asset research)"


def api_get(params: dict) -> dict:
    params = dict(params, format="json", maxlag="5")
    url = API + "?" + urllib.parse.urlencode(params)
    for attempt in range(6):
        req = urllib.request.Request(
            url, headers={"User-Agent": UA, "Accept-Encoding": "gzip"})
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
        except Exception as exc:  # network hiccup: back off and retry
            print(f"  retry {attempt + 1}: {exc}", file=sys.stderr)
            time.sleep(5 * (attempt + 1))
            continue
        if "error" in data and data["error"].get("code") == "maxlag":
            time.sleep(5)
            continue
        return data
    raise RuntimeError("API request failed repeatedly: " + url)


def list_prefix(prefix: str) -> list:
    out = []
    params = {"action": "query", "list": "allimages", "aiprefix": prefix,
              "ailimit": "500", "aiprop": "size|url"}
    while True:
        data = api_get(params)
        for img in data.get("query", {}).get("allimages", []):
            out.append({"name": img["name"], "size": img.get("size"),
                        "url": img.get("url")})
        cont = data.get("continue")
        if not cont:
            break
        params.update(cont)
        time.sleep(1.5)
    return out


def main() -> None:
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    result = {}
    for prefix in sys.argv[2:]:
        names = list_prefix(prefix)
        print(f"{prefix!r}: {len(names)} files", file=sys.stderr)
        result[prefix] = names
    with open(sys.argv[1], "w", encoding="utf-8") as fh:
        json.dump(result, fh, indent=1)


if __name__ == "__main__":
    main()
