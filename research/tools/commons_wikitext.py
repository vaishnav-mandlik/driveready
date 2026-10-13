"""Fetch the description-page wikitext of Commons file pages (50 per request).

Usage: python3 -I commons_wikitext.py <titles.txt> <output.json>

Titles one per line (the "File:" prefix is added when missing). Output maps
each canonical title to its current wikitext (or null when missing). Uses the
query API with prop=revisions, a descriptive User-Agent, and pauses between
requests. Standard library only.
"""
import json
import sys
import time

sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
from commons_imageinfo import api_get, norm_title  # noqa: E402


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    titles = []
    for line in open(sys.argv[1], encoding="utf-8"):
        line = line.strip()
        if line and not line.startswith("#"):
            t = norm_title(line)
            if t not in titles:
                titles.append(t)
    out = {}
    for i in range(0, len(titles), 50):
        batch = titles[i:i + 50]
        data = api_get({"action": "query", "prop": "revisions",
                        "rvprop": "content", "rvslots": "main",
                        "redirects": "1", "titles": "|".join(batch)})
        for p in data.get("query", {}).get("pages", {}).values():
            revs = p.get("revisions")
            out[p["title"]] = (revs[0]["slots"]["main"].get("*")
                               if revs else None)
        print(f"  batch {i // 50 + 1}", file=sys.stderr)
        time.sleep(1.5)
    with open(sys.argv[2], "w", encoding="utf-8") as fh:
        json.dump(out, fh, indent=1, ensure_ascii=False)


if __name__ == "__main__":
    main()
