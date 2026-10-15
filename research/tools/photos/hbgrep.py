"""hbgrep.py <regex> [n_show] : list states whose handbook matches, with page of first match and a snippet."""
import glob, os, re, sys
pat = re.compile(sys.argv[1], re.I | re.S)
show = int(sys.argv[2]) if len(sys.argv) > 2 else 4
D = '/Users/vaishnav/Desktop/DMV Test/research/handbooks'
hits = []
for f in sorted(glob.glob(os.path.join(D, '[A-Z][A-Z].txt'))):
    st = os.path.basename(f)[:2]
    t = open(f, encoding='utf-8', errors='replace').read()
    m = pat.search(t)
    if not m:
        continue
    pages = [(pm.start(), pm.group(1)) for pm in re.finditer(r'=== PAGE (\d+) ===', t)]
    pg = '?'
    for pos, p in pages:
        if pos <= m.start():
            pg = p
        else:
            break
    snip = re.sub(r'\s+', ' ', t[max(0, m.start() - 80): m.end() + 120])
    hits.append((st, pg, snip))
allst = [os.path.basename(f)[:2] for f in sorted(glob.glob(os.path.join(D, '[A-Z][A-Z].txt')))]
print(f'{len(hits)}/{len(allst)} states:', ' '.join(f'{s}:p{p}' for s, p, _ in hits))
print('missing:', ' '.join(s for s in allst if s not in {h[0] for h in hits}))
for s, p, sn in hits[:show]:
    print(f'--- {s} p{p}: {sn}')
