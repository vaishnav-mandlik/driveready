"""Locate a quote inside a page-marked handbook text file.

Usage: python3 -I find_quote.py <handbook.txt> "<quote or key phrase>" [--context N]

PDF extraction breaks lines, hyphenates words and mangles quotes/dashes, so
both the handbook and the query are normalized (lowercased, punctuation
unified, hyphenated line breaks joined, whitespace collapsed) before
searching. Prints every exact normalized hit with its page number and
context. If there is no exact hit, prints the best partial matches based on
the longest run of consecutive query words found on a page.
"""
import re
import sys

PAGE_RE = re.compile(r"^=== PAGE (\d+) ===.*$", re.M)


def norm(s: str) -> str:
    s = s.replace("­", "")
    s = re.sub(r"(\w)-\s*\n\s*(\w)", r"\1\2", s)
    s = s.translate(str.maketrans({
        "‘": "'", "’": "'", "“": '"', "”": '"',
        "–": "-", "—": "-", " ": " ", "ﬁ": "fi", "ﬂ": "fl",
    }))
    s = s.lower()
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def pages(text: str):
    marks = list(PAGE_RE.finditer(text))
    if not marks:
        yield 1, text
        return
    for i, m in enumerate(marks):
        end = marks[i + 1].start() if i + 1 < len(marks) else len(text)
        yield int(m.group(1)), text[m.end():end]


def main() -> int:
    args = sys.argv[1:]
    ctx = 220
    if "--context" in args:
        i = args.index("--context")
        ctx = int(args[i + 1])
        del args[i:i + 2]
    if len(args) != 2:
        print(__doc__)
        return 2
    path, quote = args
    with open(path, encoding="utf-8", errors="replace") as f:
        text = f.read()
    q = norm(quote)
    hits = 0
    for num, body in pages(text):
        nb = norm(body)
        start = 0
        while True:
            j = nb.find(q, start)
            if j < 0:
                break
            hits += 1
            lo, hi = max(0, j - ctx), min(len(nb), j + len(q) + ctx)
            print(f"[EXACT] page {num}: ...{nb[lo:hi]}...")
            start = j + len(q)
    if hits:
        print(f"{hits} exact hit(s)")
        return 0
    words = q.split()
    scored = []
    for num, body in pages(text):
        nb = norm(body)
        best, best_at = 0, -1
        for i in range(len(words)):
            for k in range(len(words), i + best, -1):
                frag = " ".join(words[i:k])
                at = nb.find(frag)
                if at >= 0:
                    if k - i > best:
                        best, best_at = k - i, at
                    break
        if best:
            scored.append((best, num, best_at, nb))
    scored.sort(key=lambda t: -t[0])
    print(f"no exact hit; best partial matches ({len(words)} query words):")
    for best, num, at, nb in scored[:4]:
        lo, hi = max(0, at - ctx), min(len(nb), at + ctx * 2)
        print(f"[{best}/{len(words)} words] page {num}: ...{nb[lo:hi]}...")
    return 1


if __name__ == "__main__":
    sys.exit(main())
