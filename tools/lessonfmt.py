"""Serialize lesson JSON in the repo's hand-formatted style (one block per line; list items on their own lines)."""
import json

def j(v):
    return json.dumps(v, ensure_ascii=False)

def block(b, ind):
    pad = ' ' * ind
    for key in ('items', 'rows'):
        if key in b:
            head = {k: v for k, v in b.items() if k != key}
            inner = j(head)[:-1] + f', "{key}": ['
            lines = [pad + inner]
            vals = b[key]
            for i, v in enumerate(vals):
                lines.append(pad + '  ' + j(v) + (',' if i < len(vals) - 1 else ''))
            lines.append(pad + ']}')
            return '\n'.join(lines)
    return pad + j(b)

def dump(lesson):
    out = ['{']
    keys = list(lesson.keys())
    for ki, k in enumerate(keys):
        comma = ',' if ki < len(keys) - 1 else ''
        if k == 'sections':
            out.append('  "sections": [')
            secs = lesson['sections']
            for si, s in enumerate(secs):
                out.append('    {')
                out.append(f'      "heading": {j(s["heading"])},')
                out.append('      "blocks": [')
                bl = s['blocks']
                for bi, b in enumerate(bl):
                    out.append(block(b, 8) + (',' if bi < len(bl) - 1 else ''))
                out.append('      ]')
                out.append('    }' + (',' if si < len(secs) - 1 else ''))
            out.append('  ]' + comma)
        elif k == 'keyPoints':
            out.append('  "keyPoints": [')
            kp = lesson['keyPoints']
            for i, p in enumerate(kp):
                out.append('    ' + j(p) + (',' if i < len(kp) - 1 else ''))
            out.append('  ]' + comma)
        else:
            out.append(f'  {j(k)}: {j(lesson[k])}{comma}')
    out.append('}')
    return '\n'.join(out) + '\n'
