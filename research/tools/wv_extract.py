"""Repairing PDF -> page-marked text extractor for the WV handbook.

Some fonts in the PDF are Type0 Identity-H CFF subsets without a ToUnicode map,
so MuPDF emits the raw CID instead of the character (text looks shifted by 31,
digits become control characters). Here every character MuPDF cannot map
(U+FFFD when the CID fallback flag is off) is decoded from its CID using the
standard ISOAdobe glyph order that MyriadPro follows (cid 34 = 'A', 66 = 'a',
8 = quoteright, 105/119 = curly double quotes, 102 = section, 116 = bullet...).

Ligature artifacts in the normal fonts ("traffi  c", "Infl uence") are joined
when the joined word is an English dictionary word; every join is logged.

Usage: python3 -I wv_extract.py <input.pdf> <output.txt> [--check]
"""
import re
import sys

import fitz
from fontTools import agl
from fontTools.cffLib import cffISOAdobeStrings

CIDFLAG = fitz.TEXT_CID_FOR_UNKNOWN_UNICODE
FLAGS_ON = fitz.TEXTFLAGS_TEXT | CIDFLAG
FLAGS_OFF = fitz.TEXTFLAGS_TEXT & ~CIDFLAG


def cid_to_char(cid: int) -> str:
    if 0 < cid < len(cffISOAdobeStrings):
        name = cffISOAdobeStrings[cid]
        u = agl.toUnicode(name)
        if u:
            return u
    return "�"


def unknown_positions(page):
    """Origins of glyphs MuPDF could not map to Unicode (texttrace reports 65533)."""
    unk = set()
    for span in page.get_texttrace():
        for c in span["chars"]:
            if c[0] == 0xFFFD:
                unk.add((round(c[2][0], 1), round(c[2][1], 1)))
    return unk


def page_text(page, decode=True, stats=None):
    on = page.get_text("rawdict", flags=FLAGS_ON)
    unk = unknown_positions(page) if decode else set()
    out = []
    for b in on["blocks"]:
        if b.get("type", 0) != 0:
            continue
        for l in b["lines"]:
            parts = []
            for s in l["spans"]:
                for ch in s["chars"]:
                    c = ch["c"]
                    key = (round(ch["origin"][0], 1), round(ch["origin"][1], 1))
                    if decode and key in unk:
                        dec = cid_to_char(ord(c))
                        if stats is not None:
                            stats["decoded"] = stats.get("decoded", 0) + 1
                            if dec == "\ufffd":
                                stats.setdefault("undecodable", []).append((page.number + 1, ord(c), s["font"]))
                        # Wingdings and other non-Latin fonts: keep the raw code
                        c = dec if dec != "\ufffd" else c
                    parts.append(c)
            out.append("".join(parts) + "\n")
    return "".join(out)


def load_words():
    words = set()
    try:
        with open("/usr/share/dict/words", encoding="utf-8") as f:
            for w in f:
                words.add(w.strip().lower())
    except OSError:
        pass
    return words


LIG_RE = re.compile(r"\b([A-Za-z]*(?:ffi|ffl|fi|fl|ff))[ \t]+([a-z]+)\b")


def fix_ligatures(text, words, log, pno):
    def repl(m):
        a, b = m.group(1), m.group(2)
        joined = a + b
        lw = joined.lower()
        cands = {lw, lw[:-1] if lw.endswith("s") else lw, lw[:-2] if lw.endswith("es") else lw,
                 lw[:-2] if lw.endswith("ed") else lw, lw[:-3] if lw.endswith("ing") else lw,
                 lw[:-2] if lw.endswith("ly") else lw}
        if any(c in words for c in cands) and a.lower() not in ("off", "if", "of", "staff", "stuff", "cliff"):
            log.append((pno, m.group(0), joined))
            return joined
        return m.group(0)
    return LIG_RE.sub(repl, text)


def main():
    args = sys.argv[1:]
    check = "--check" in args
    args = [a for a in args if a != "--check"]
    src, dst = args
    doc = fitz.open(src)
    if check:
        bad = 0
        for page in doc:
            mine = page_text(page, decode=False)
            ref = page.get_text("text", flags=FLAGS_ON)
            if mine != ref:
                bad += 1
                print("reconstruction differs on page", page.number + 1)
        print("reconstruction check: pages differing =", bad)
        return 0
    words = load_words()
    stats, log = {}, []
    with open(dst, "w", encoding="utf-8") as out:
        for i, page in enumerate(doc, start=1):
            t = page_text(page, decode=True, stats=stats)
            t = fix_ligatures(t, words, log, i)
            out.write(f"\n=== PAGE {i} ===\n")
            out.write(t)
    print("decoded chars:", stats.get("decoded", 0))
    und = stats.get("undecodable", [])
    print("undecodable:", len(und), und[:20])
    print("ligature joins:", len(log))
    for item in log:
        print("   ", item)
    return 0


if __name__ == "__main__":
    sys.exit(main())
