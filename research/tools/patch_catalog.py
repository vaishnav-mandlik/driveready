"""Apply field updates to the sign catalog by code.

Usage: python3 -I patch_catalog.py <catalog.json> <patch.json>

<patch.json> maps code -> {field: value, ...}; a value of null deletes the
field (e.g. "_review": null once an entry has been visually confirmed).
Unknown codes are reported and nothing is written.
"""
import json
import sys

cat_path, patch_path = sys.argv[1], sys.argv[2]
cat = json.load(open(cat_path, encoding="utf-8"))
patch = json.load(open(patch_path, encoding="utf-8"))
by_code = {c["code"]: c for c in cat}
unknown = [k for k in patch if k not in by_code]
if unknown:
    sys.exit(f"unknown codes: {unknown}")
for code, fields in patch.items():
    for k, v in fields.items():
        if v is None:
            by_code[code].pop(k, None)
        else:
            by_code[code][k] = v
json.dump(cat, open(cat_path, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
print(f"patched {len(patch)} entries")
