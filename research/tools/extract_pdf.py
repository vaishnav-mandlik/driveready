"""Extract text from a PDF into a page-marked text file.

Usage: python3 -I extract_pdf.py <input.pdf> <output.txt>

Each page is prefixed with a line "=== PAGE n ===" (1-based, physical page
index) so facts can be cited by page. Prints a short summary to stdout.
"""
import sys

import fitz  # PyMuPDF


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: extract_pdf.py <input.pdf> <output.txt>", file=sys.stderr)
        return 2
    src, dst = sys.argv[1], sys.argv[2]
    doc = fitz.open(src)
    chars = 0
    with open(dst, "w", encoding="utf-8") as out:
        for i, page in enumerate(doc, start=1):
            text = page.get_text("text")
            chars += len(text)
            out.write(f"\n=== PAGE {i} ===\n")
            out.write(text)
    print(f"pages={doc.page_count} chars={chars} -> {dst}")
    if doc.page_count and chars / doc.page_count < 200:
        print("WARNING: very little text per page; PDF may be scanned images")
    return 0


if __name__ == "__main__":
    sys.exit(main())
