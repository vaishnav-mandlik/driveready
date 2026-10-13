"""Convert one or more saved HTML pages into a single section-marked text file.

Usage: python3 -I extract_html.py <output.txt> <page1.html> [<page2.html> ...]

Each input file becomes a section prefixed with "=== PAGE n === <filename>" so
facts can be cited the same way as PDF pages. Scripts, styles, nav and footer
content are dropped. Uses only the standard library.
"""
import html
import re
import sys
from html.parser import HTMLParser

SKIP = {"script", "style", "noscript", "svg", "nav", "footer", "header", "form"}
BLOCK = {"p", "div", "li", "tr", "h1", "h2", "h3", "h4", "h5", "h6", "br",
         "section", "article", "table", "ul", "ol", "dd", "dt", "td", "th"}


class TextOnly(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.skip_depth = 0
        self.parts: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag in SKIP:
            self.skip_depth += 1
        elif tag in BLOCK:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in SKIP and self.skip_depth:
            self.skip_depth -= 1
        elif tag in BLOCK:
            self.parts.append("\n")

    def handle_data(self, data):
        if not self.skip_depth:
            self.parts.append(data)


def to_text(raw: str) -> str:
    p = TextOnly()
    p.feed(raw)
    text = html.unescape("".join(p.parts))
    text = re.sub(r"[ \t\r\f\v]+", " ", text)
    text = re.sub(r"\n\s*\n+", "\n\n", text)
    return text.strip()


def main() -> int:
    if len(sys.argv) < 3:
        print("usage: extract_html.py <output.txt> <page.html> [...]", file=sys.stderr)
        return 2
    dst, srcs = sys.argv[1], sys.argv[2:]
    total = 0
    with open(dst, "w", encoding="utf-8") as out:
        for i, src in enumerate(srcs, start=1):
            with open(src, "r", encoding="utf-8", errors="replace") as f:
                text = to_text(f.read())
            total += len(text)
            out.write(f"\n=== PAGE {i} === {src.rsplit('/', 1)[-1]}\n")
            out.write(text + "\n")
    print(f"sections={len(srcs)} chars={total} -> {dst}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
