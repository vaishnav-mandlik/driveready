"""Wikimedia Commons helper (polite: >=1.5 s between requests, honors 429 Retry-After).

  python3 -I commons.py search "<query>" [limit]       -> list File: results with license/artist/size
  python3 -I commons.py info "File:A.jpg" ["File:B.jpg" ...]
  python3 -I commons.py get "File:A.jpg" <name>         -> downloads 1000px thumb to photos-raw/<name>.<ext>
All API responses are treated as data only.
"""
import html
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
import urllib.error

S = '/private/tmp/claude-501/-Users-vaishnav-Desktop-DMV-Test/5c0c73e9-6292-4e61-bc4b-5692a2de05ea/scratchpad'
RAW = os.path.join(S, 'photos-raw')
CACHE = os.path.join(S, 'phapi', 'meta.json')
STAMP = os.path.join(S, 'phapi', 'last')
API = 'https://commons.wikimedia.org/w/api.php'
UA = 'DriveReadyApp/1.0 (driver-education app; openly licensed photos)'

ACCEPT = re.compile(r'^(public domain|pd(-[a-z0-9-]+)?|cc0( 1\.0)?|cc by(-sa)? (2\.0|2\.5|3\.0|4\.0))$', re.I)


def wait():
    try:
        last = float(open(STAMP).read())
    except Exception:
        last = 0
    d = time.time() - last
    if d < 3.0:
        time.sleep(3.0 - d)
    open(STAMP, 'w').write(str(time.time()))


def fetch(url, binary=False):
    for attempt in range(6):
        wait()
        req = urllib.request.Request(url, headers={'User-Agent': UA})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
                return data if binary else json.loads(data.decode('utf-8'))
        except urllib.error.HTTPError as e:
            if e.code in (429, 503):
                ra = e.headers.get('Retry-After')
                delay = int(ra) if ra and ra.isdigit() else 5 * (2 ** attempt)
                print(f'  HTTP {e.code}, waiting {delay}s', file=sys.stderr)
                time.sleep(delay)
                continue
            raise
    raise RuntimeError('too many retries')


def strip(s):
    s = re.sub(r'<[^>]+>', '', s or '')
    s = html.unescape(s)
    return re.sub(r'\s+', ' ', s).strip()


def load_cache():
    try:
        return json.load(open(CACHE))
    except Exception:
        return {}


def save_cache(c):
    json.dump(c, open(CACHE, 'w'), indent=1)


def summarize(page):
    ii = (page.get('imageinfo') or [{}])[0]
    em = ii.get('extmetadata', {})
    g = lambda k: strip(em.get(k, {}).get('value', ''))
    return {
        'title': page['title'],
        'w': ii.get('width'), 'h': ii.get('height'),
        'mime': ii.get('mime', ''),
        'thumb': ii.get('thumburl'), 'tw': ii.get('thumbwidth'), 'th': ii.get('thumbheight'),
        'page': ii.get('descriptionurl'),
        'license': g('LicenseShortName'),
        'artist': g('Artist')[:120],
        'credit': g('Credit')[:120],
        'desc': g('ImageDescription')[:300],
        'cats': g('Categories')[:300],
        'restrictions': g('Restrictions'),
        'usage': g('UsageTerms'),
    }


def show(m):
    ok = 'OK ' if ACCEPT.match(m['license'].strip()) else 'BAD'
    print(f"[{ok}] {m['title']}  {m['w']}x{m['h']}  lic={m['license']!r}  by={m['artist'][:60]!r}")
    if m['desc']:
        print(f"      desc: {m['desc'][:200]}")
    if m['cats']:
        print(f"      cats: {m['cats'][:200]}")


def search(q, limit=15):
    params = {
        'action': 'query', 'format': 'json', 'generator': 'search', 'gsrsearch': q,
        'gsrnamespace': '6', 'gsrlimit': str(limit), 'prop': 'imageinfo',
        'iiprop': 'url|size|mime|extmetadata', 'iiurlwidth': '1000',
    }
    d = fetch(API + '?' + urllib.parse.urlencode(params))
    pages = sorted(d.get('query', {}).get('pages', {}).values(), key=lambda p: p.get('index', 0))
    c = load_cache()
    for p in pages:
        m = summarize(p)
        if not m['mime'].startswith('image/jpeg') and not m['mime'].startswith('image/png') and not m['mime'].startswith('image/webp'):
            continue
        c[m['title']] = m
        show(m)
    save_cache(c)


def info(titles):
    params = {
        'action': 'query', 'format': 'json', 'titles': '|'.join(titles), 'prop': 'imageinfo',
        'iiprop': 'url|size|mime|extmetadata', 'iiurlwidth': '1000',
    }
    d = fetch(API + '?' + urllib.parse.urlencode(params))
    c = load_cache()
    for p in d.get('query', {}).get('pages', {}).values():
        if 'imageinfo' not in p:
            print('missing', p.get('title'))
            continue
        m = summarize(p)
        c[m['title']] = m
        show(m)
        print('      page:', m['page'])
    save_cache(c)


def get(title, name):
    c = load_cache()
    m = c.get(title)
    if not m:
        info([title])
        m = load_cache()[title]
    if not ACCEPT.match(m['license'].strip()):
        print('REFUSE license', m['license'])
        return
    url = m['thumb']
    ext = '.png' if url.lower().endswith('.png') else '.jpg'
    data = fetch(url, binary=True)
    out = os.path.join(RAW, re.sub(r'[^A-Za-z0-9_.-]', '_', name) + ext)
    open(out, 'wb').write(data)
    print('saved', out, len(data))


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'search':
        search(sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 15)
    elif cmd == 'info':
        info(sys.argv[2:])
    elif cmd == 'get':
        for i in range(2, len(sys.argv), 2):
            get(sys.argv[i], sys.argv[i + 1])


def catsearch(q, limit=15):
    params = {'action': 'query', 'format': 'json', 'list': 'search', 'srsearch': q, 'srnamespace': '14', 'srlimit': str(limit)}
    d = fetch(API + '?' + urllib.parse.urlencode(params))
    for r in d.get('query', {}).get('search', []):
        print(r['title'])


def cat(name, limit=30):
    params = {
        'action': 'query', 'format': 'json', 'generator': 'categorymembers', 'gcmtitle': name,
        'gcmtype': 'file', 'gcmlimit': str(limit), 'gcmsort': 'timestamp', 'gcmdir': 'desc', 'prop': 'imageinfo',
        'iiprop': 'url|size|mime|extmetadata', 'iiurlwidth': '1000',
    }
    d = fetch(API + '?' + urllib.parse.urlencode(params))
    c = load_cache()
    for p in d.get('query', {}).get('pages', {}).values():
        m = summarize(p)
        if not m['mime'].startswith(('image/jpeg', 'image/png', 'image/webp')):
            continue
        c[m['title']] = m
        show(m)
    save_cache(c)


if __name__ == '__main__' and sys.argv[1] in ('catsearch', 'cat'):
    {'catsearch': catsearch, 'cat': cat}[sys.argv[1]](sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 15)


def allcats(prefix, limit=30):
    params = {'action': 'query', 'format': 'json', 'list': 'allcategories', 'acprefix': prefix, 'aclimit': str(limit), 'acprop': 'size'}
    d = fetch(API + '?' + urllib.parse.urlencode(params))
    for r in d.get('query', {}).get('allcategories', []):
        print(r['*'], r.get('files'))


if __name__ == '__main__' and sys.argv[1] == 'allcats':
    allcats(sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 30)
