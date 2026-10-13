"""Download files listed in a JSON job file into a directory (data only).

Usage: python3 -I download_files.py <jobs.json> <outdir> [--force]

<jobs.json> is a list of {"name": "R1-1.svg", "url": "https://upload...",
"size": 1702}. Each file is fetched with a descriptive User-Agent, checked
(HTTP 200, byte count equals "size" when given, content looks like SVG when
the name ends in .svg), and written atomically as <outdir>/<name>. Existing
files with the expected size are skipped unless --force is given. Downloaded
content is never executed or parsed as code. Prints a JSON report to stdout.
"""
import gzip
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

UA = "DMVTestSignResearch/1.0 (driver knowledge-test app asset research)"
SAFE_NAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._()-]*$")


def looks_like_svg(data: bytes) -> bool:
    head = data[:4096].lstrip(b"\xef\xbb\xbf").lstrip()
    head = head.decode("utf-8", "replace")
    head = re.sub(r"^<\?xml[^>]*\?>\s*", "", head)
    while True:  # skip comments / doctype before the root element
        m = re.match(r"^(<!--.*?-->|<!DOCTYPE[^>]*(\[.*?\])?\s*>)\s*", head, re.S)
        if not m:
            break
        head = head[m.end():]
    return re.match(r"^<(\w+:)?svg[\s>]", head) is not None


def fetch(url: str) -> bytes:
    for attempt in range(6):
        req = urllib.request.Request(
            url, headers={"User-Agent": UA, "Accept-Encoding": "gzip"})
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                raw = resp.read()
                if resp.headers.get("Content-Encoding") == "gzip":
                    raw = gzip.decompress(raw)
                return raw
        except urllib.error.HTTPError as exc:
            if exc.code == 404:
                raise
            wait = exc.headers.get("Retry-After") if exc.headers else None
            wait = int(wait) if wait and wait.isdigit() else 0
            # Never hammer: wait at least 60s (longer on repeats) after a 429.
            wait = max(wait, 60 * (attempt + 1))
            print(f"  HTTP {exc.code} for {url}; waiting {wait}s", file=sys.stderr)
            time.sleep(wait)
        except Exception as exc:
            print(f"  retry {attempt + 1} for {url}: {exc}", file=sys.stderr)
            time.sleep(5 * (attempt + 1))
    raise RuntimeError("download failed repeatedly: " + url)


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    force = "--force" in sys.argv
    if len(args) != 2:
        sys.exit(__doc__)
    jobs = json.load(open(args[0], encoding="utf-8"))
    outdir = args[1]
    os.makedirs(outdir, exist_ok=True)
    report = []
    for job in jobs:
        name, url, size = job["name"], job["url"], job.get("size")
        if not SAFE_NAME.match(name) or "/" in name:
            report.append({"name": name, "ok": False, "error": "unsafe name"})
            continue
        if not url.startswith("https://upload.wikimedia.org/"):
            report.append({"name": name, "ok": False, "error": "unexpected host"})
            continue
        dest = os.path.join(outdir, name)
        if (not force and os.path.exists(dest) and size
                and os.path.getsize(dest) == size):
            report.append({"name": name, "ok": True, "bytes": size, "skipped": True})
            continue
        try:
            data = fetch(url)
        except Exception as exc:
            report.append({"name": name, "ok": False, "error": str(exc)})
            continue
        problems = []
        if size and len(data) != size:
            problems.append(f"size {len(data)} != expected {size}")
        if name.lower().endswith(".svg") and not looks_like_svg(data):
            problems.append("content is not SVG")
        if problems:
            report.append({"name": name, "ok": False, "error": "; ".join(problems)})
            continue
        tmp = dest + ".part"
        with open(tmp, "wb") as fh:
            fh.write(data)
        os.replace(tmp, dest)
        report.append({"name": name, "ok": True, "bytes": len(data)})
        print(f"  saved {name} ({len(data)} B)", file=sys.stderr)
        time.sleep(float(os.environ.get("DL_PAUSE", "5")))
    json.dump(report, sys.stdout, indent=1)
    bad = [r for r in report if not r["ok"]]
    print(f"\n{len(report) - len(bad)} ok, {len(bad)} failed", file=sys.stderr)


if __name__ == "__main__":
    main()
