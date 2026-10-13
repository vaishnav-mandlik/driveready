"""Build the part-B (warning / work zone / guide / service / recreation) sign set.

Usage:
  python3 -I signs_b_build.py --catalog CAT.json --svg-dir DIR --png-dir DIR \
      --manifest OUT.json [--rel-base DIR] [--pause 1.0]

CAT.json is a list of entries:
  {code, name, category, shape, colors, meaning, candidates: ["File:...svg", ...]}

For every entry this script:
  1. queries Commons (batched 50 titles, redirects=1) for imageinfo
     url|size|sha1|mime|extmetadata, using a descriptive User-Agent;
  2. keeps the first candidate whose extmetadata License is public domain
     (License == "pd" / LicenseShortName "Public domain"); CC0, CC-BY-SA etc.
     are rejected and logged;
  3. downloads it to <svg-dir>/<code>.svg (sha1 verified against Commons);
  4. renders <png-dir>/<code>.png with `rsvg-convert -w 240` to prove it parses;
  5. scans the SVG text (regex only, never executed) for react-native-svg
     SvgXml compatibility flags;
  6. writes the manifest (paths relative to --rel-base, default the manifest dir).
Entries with no public-domain SVG are kept with svgPath = null.
"""
import argparse
import base64
import binascii
import hashlib
import html
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://commons.wikimedia.org/w/api.php"
UA = ("DMVTestSignResearch/1.0 (educational US driver knowledge-test app; "
      "road-sign asset research; python-urllib)")


def http_get(url, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                data = r.read()
                return data if binary else json.loads(data.decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code in (429, 503) and attempt < 5:
                wait = int(e.headers.get("Retry-After") or 0) or 15 * (attempt + 1)
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


class Fetcher:
    """Download Commons originals, falling back to sha1-identical IA copies.

    upload.wikimedia.org rate-limits original-file downloads per IP (HTTP 429,
    Retry-After 600). We probe it at most once per run; once it answers 429
    we stop hitting it and instead look up an Internet Archive (Wayback) capture
    of the *same upload.wikimedia.org URL* whose CDX digest equals the current
    Commons sha1, fetch it raw (id_), and re-verify the sha1 locally.
    """

    def __init__(self, pause, use_wikimedia=True):
        self.pause = pause
        self.wikimedia_ok = use_wikimedia

    def _get(self, url, retry_429=True):
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        for attempt in range(4):
            try:
                with urllib.request.urlopen(req, timeout=90) as r:
                    return r.read()
            except urllib.error.HTTPError as e:
                if e.code == 429 and not retry_429:
                    raise
                if e.code in (429, 503) and attempt < 3:
                    wait = min(int(e.headers.get("Retry-After") or 0) or 20 * (attempt + 1), 120)
                    print(f"  HTTP {e.code} from {urllib.parse.urlsplit(url).netloc}; "
                          f"sleeping {wait}s", file=sys.stderr)
                    time.sleep(wait)
                    continue
                raise
            except urllib.error.URLError:
                if attempt < 3:
                    time.sleep(5 * (attempt + 1))
                    continue
                raise
        return None

    def fetch(self, url, sha1_hex):
        """Return (bytes, via) with sha1 verified, or (None, reason)."""
        if self.wikimedia_ok:
            try:
                data = self._get(url, retry_429=False)
                time.sleep(self.pause)
                if hashlib.sha1(data).hexdigest() == sha1_hex:
                    return data, "upload.wikimedia.org"
            except urllib.error.HTTPError as e:
                if e.code == 429:
                    print("  upload.wikimedia.org is rate-limiting originals (429); "
                          "switching to sha1-matched Internet Archive copies", file=sys.stderr)
                    self.wikimedia_ok = False
                else:
                    print(f"  wikimedia HTTP {e.code} for {url}", file=sys.stderr)
        # (a) latest Wayback capture of the exact upload URL (one cheap playback
        #     request; the CDX index is often overloaded and answers 503).
        try:
            data = self._get(f"https://web.archive.org/web/2026id_/{url}")
            time.sleep(self.pause)
            if data and hashlib.sha1(data).hexdigest() == sha1_hex:
                return data, "web.archive.org latest capture (sha1-identical to Commons original)"
        except urllib.error.HTTPError as e:
            time.sleep(self.pause)
            if e.code == 404:
                return None, "no archive capture (Commons original rate-limited)"
        except Exception:
            time.sleep(self.pause)
        # (b) latest capture is an older revision: search CDX for a capture whose
        #     digest equals the current Commons sha1.
        want = base64.b32encode(binascii.unhexlify(sha1_hex)).decode()
        bare = re.sub(r"^https?://", "", url)
        cdx = ("https://web.archive.org/cdx/search/cdx?" + urllib.parse.urlencode(
            {"url": bare, "output": "json", "fl": "timestamp,statuscode,digest",
             "filter": "statuscode:200"}))
        try:
            rows = json.loads((self._get(cdx) or b"[]").decode("utf-8") or "[]")
        except Exception as e:  # CDX hiccup
            return None, f"wayback cdx error {e}"
        time.sleep(self.pause)
        stamps = [r[0] for r in rows[1:] if len(r) >= 3 and r[2] == want]
        if not stamps:
            return None, "no sha1-matching archive capture (Commons original rate-limited)"
        ts = sorted(stamps)[-1]
        try:
            data = self._get(f"https://web.archive.org/web/{ts}id_/{url}")
        except Exception as e:
            return None, f"wayback fetch error {e}"
        time.sleep(self.pause)
        if data and hashlib.sha1(data).hexdigest() == sha1_hex:
            return data, f"web.archive.org capture {ts} (sha1-identical to Commons original)"
        return None, "archive copy sha1 mismatch"


def strip_html(s):
    s = re.sub(r"<[^>]+>", " ", s or "")
    return re.sub(r"\s+", " ", html.unescape(s)).strip()


def norm_title(t):
    t = t.strip().replace("_", " ")
    return "File:" + (t[5:] if t.lower().startswith("file:") else t)


def fetch_meta(titles, pause):
    out = {}
    for i in range(0, len(titles), 50):
        batch = titles[i:i + 50]
        params = {"action": "query", "format": "json", "prop": "imageinfo",
                  "iiprop": "url|size|sha1|mime|extmetadata", "redirects": "1",
                  "titles": "|".join(batch), "maxlag": "5"}
        data = http_get(API + "?" + urllib.parse.urlencode(params))
        q = data.get("query", {})
        alias = {n["from"]: n["to"] for n in q.get("normalized", [])}
        redir = {r["from"]: r["to"] for r in q.get("redirects", [])}
        pages = {p["title"]: p for p in q.get("pages", {}).values()}
        for t in batch:
            cur = alias.get(t, t)
            cur = redir.get(cur, cur)
            p = pages.get(cur)
            rec = {"requested": t, "resolved": cur, "missing": True}
            if p and "missing" not in p and p.get("imageinfo"):
                ii = p["imageinfo"][0]
                meta = ii.get("extmetadata", {})
                g = lambda k: (meta.get(k) or {}).get("value")
                rec.update({
                    "missing": False,
                    "url": (ii.get("url") or "").split("?")[0],
                    "descriptionurl": ii.get("descriptionurl"),
                    "size": ii.get("size"), "sha1": ii.get("sha1"),
                    "mime": ii.get("mime"),
                    "license_short": strip_html(g("LicenseShortName")),
                    "license": g("License"),
                })
            out[t] = rec
        print(f"  metadata {i + len(batch)}/{len(titles)}", file=sys.stderr)
        time.sleep(pause)
    return out


def is_public_domain(rec):
    lic = (rec.get("license") or "").lower()
    short = (rec.get("license_short") or "").lower()
    return lic == "pd" or lic.startswith("pd-") or short.startswith("public domain")


FLAG_PATTERNS = {
    # flags requested for react-native-svg SvgXml compatibility
    "hasText": r"<(?:\w+:)?(?:text|tspan|textPath)[\s>/]",
    "hasStyle": r"<(?:\w+:)?style[\s>/]|\sclass\s*=",
    "hasUseOrDefs": r"<(?:\w+:)?(?:use|defs|symbol)[\s>/]",
    "hasGradient": r"<(?:\w+:)?(?:linearGradient|radialGradient)[\s>/]",
    "hasClipPath": r"<(?:\w+:)?clipPath[\s>/]|\sclip-path\s*=|clip-path\s*:",
    "hasImage": r"<(?:\w+:)?image[\s>/]",
    # extra signals that also matter for SvgXml
    "hasInlineStyleAttr": r"\sstyle\s*=",
    "hasMask": r"<(?:\w+:)?mask[\s>/]|\smask\s*=",
    "hasFilter": r"<(?:\w+:)?filter[\s>/]|\sfilter\s*=",
    "hasPattern": r"<(?:\w+:)?pattern[\s>/]",
    "hasScriptOrEvents": r"<(?:\w+:)?script[\s>/]|\son[a-z]+\s*=|<(?:\w+:)?foreignObject[\s>/]",
    "hasExternalHref": r"href\s*=\s*[\"']\s*(?:https?:|//|file:)",
}


def svg_flags(text):
    return {k: bool(re.search(p, text, re.I)) for k, p in FLAG_PATTERNS.items()}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--catalog", required=True)
    ap.add_argument("--svg-dir", required=True)
    ap.add_argument("--png-dir", required=True)
    ap.add_argument("--manifest", required=True)
    ap.add_argument("--rel-base", default=None)
    ap.add_argument("--pause", type=float, default=1.0)
    ap.add_argument("--no-wikimedia-originals", action="store_true",
                    help="skip upload.wikimedia.org (e.g. while it returns 429)")
    a = ap.parse_args()
    fetcher = Fetcher(a.pause, use_wikimedia=not a.no_wikimedia_originals)
    prev_via = {}
    if os.path.exists(a.manifest):
        try:
            with open(a.manifest) as f:
                prev_via = {e["code"]: e.get("retrievedVia") for e in json.load(f)
                            if e.get("retrievedVia")}
        except Exception:
            prev_via = {}

    with open(a.catalog) as f:
        catalog = json.load(f)
    codes = [c["code"] for c in catalog]
    dupes = {c for c in codes if codes.count(c) > 1}
    if dupes:
        sys.exit(f"duplicate codes in catalog: {sorted(dupes)}")
    os.makedirs(a.svg_dir, exist_ok=True)
    os.makedirs(a.png_dir, exist_ok=True)
    rel_base = a.rel_base or os.path.dirname(os.path.abspath(a.manifest))

    titles = []
    for c in catalog:
        for t in c.get("candidates", []):
            nt = norm_title(t)
            if nt not in titles:
                titles.append(nt)
    meta = fetch_meta(titles, a.pause)

    manifest, log = [], []
    for c in catalog:
        chosen, rejected = None, []
        for t in c.get("candidates", []):
            rec = meta.get(norm_title(t))
            if not rec or rec["missing"]:
                rejected.append(f"{t}: missing")
                continue
            if rec.get("mime") != "image/svg+xml":
                rejected.append(f"{t}: not SVG ({rec.get('mime')})")
                continue
            if not is_public_domain(rec):
                rejected.append(f"{t}: license {rec.get('license_short')!r}")
                continue
            chosen = rec
            break
        entry = {k: c[k] for k in ("code", "name", "category", "shape", "colors", "meaning")}
        entry.update({"commonsFile": None, "commonsUrl": None, "sourceUrl": None,
                      "license": None, "svgPath": None, "pngPath": None,
                      "bytes": None, "sha1": None, "retrievedVia": None,
                      "flags": None})
        if chosen:
            svg_path = os.path.join(a.svg_dir, f"{c['code']}.svg")
            png_path = os.path.join(a.png_dir, f"{c['code']}.png")
            data, via = None, None
            if os.path.exists(svg_path):
                with open(svg_path, "rb") as f:
                    old = f.read()
                if hashlib.sha1(old).hexdigest() == chosen.get("sha1"):
                    data, via = old, prev_via.get(c["code"], "cached (sha1 matches Commons)")
            if data is None:
                data, via = fetcher.fetch(chosen["url"], chosen.get("sha1"))
                if data is None:
                    rejected.append(f"{chosen['resolved']}: download failed: {via}")
                    log.append(f"{c['code']}: PD file found ({chosen['resolved']}) but "
                               f"not downloaded: {via}")
            if data is not None:
                text = data.decode("utf-8", errors="replace")
                if not re.search(r"<svg[\s>]", text[:5000], re.I):
                    rejected.append(f"{chosen['resolved']}: no <svg> root")
                    data = None
            if data is not None:
                with open(svg_path, "wb") as f:
                    f.write(data)
                r = subprocess.run(["rsvg-convert", "-w", "240", "-o", png_path, svg_path],
                                   capture_output=True, text=True, timeout=120)
                png_ok = r.returncode == 0 and os.path.exists(png_path) and os.path.getsize(png_path) > 0
                if not png_ok:
                    log.append(f"{c['code']}: rsvg-convert failed: {r.stderr.strip()[:200]}")
                entry.update({
                    "commonsFile": chosen["resolved"],
                    "commonsUrl": chosen.get("descriptionurl"),
                    "sourceUrl": chosen.get("url"),
                    "license": chosen.get("license_short"),
                    "svgPath": os.path.relpath(svg_path, rel_base),
                    "pngPath": os.path.relpath(png_path, rel_base) if png_ok else None,
                    "bytes": len(data),
                    "sha1": chosen.get("sha1"),
                    "retrievedVia": via,
                    "flags": svg_flags(text),
                })
            else:
                # PD file identified on Commons but could not be downloaded:
                # still record provenance so it can be fetched later.
                entry.update({"commonsFile": chosen["resolved"],
                              "commonsUrl": chosen.get("descriptionurl"),
                              "sourceUrl": chosen.get("url"),
                              "license": chosen.get("license_short"),
                              "sha1": chosen.get("sha1")})
            if chosen["resolved"] != norm_title(c["candidates"][0]):
                log.append(f"{c['code']}: used {chosen['resolved']} "
                           f"(first candidate was {c['candidates'][0]})")
        if rejected:
            log.append(f"{c['code']}: rejected -> " + "; ".join(rejected))
        if not chosen:
            log.append(f"{c['code']}: NO PUBLIC-DOMAIN SVG FOUND ON COMMONS")
        elif not entry["svgPath"]:
            log.append(f"{c['code']}: PD SVG exists but was NOT DOWNLOADED")
        manifest.append(entry)
        print(f"{c['code']:<14} {'OK ' if entry['svgPath'] else 'NONE'} "
              f"{entry['commonsFile'] or ''}", file=sys.stderr)

    with open(a.manifest, "w") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print("\n".join(log))
    ok = sum(1 for e in manifest if e["svgPath"])
    print(f"\n{ok}/{len(manifest)} signs with public-domain SVG; manifest -> {a.manifest}")


if __name__ == "__main__":
    main()
