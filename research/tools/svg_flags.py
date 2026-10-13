"""Report react-native-svg (SvgXml) compatibility flags for SVG files.

Usage: python3 -I svg_flags.py <file.svg> [<file.svg> ...]   (prints JSON)
Also importable: svg_flags.analyze(path) -> dict.

The SVG is treated as plain text (never executed or rendered here). Comments
are removed before scanning so commented-out markup does not count.

Required flags (task spec):
  hasText       <text> or Inkscape <flowRoot> elements (font-dependent text)
  hasStyle      CSS in a <style> element (or an xml-stylesheet instruction),
                which SvgXml ignores: class-styled parts fall back to default
                black fill unless rendered with SvgCss or the CSS is inlined
  hasUseOrDefs  <use>, <defs> or <symbol>
  hasGradient   <linearGradient> / <radialGradient> / <meshgradient>
  hasClipPath   <clipPath> elements or clip-path attributes
  hasImage      <image> elements (embedded or linked raster)
Extra diagnostics:
  cssRuleCount, cssSimpleClassOnly (every selector is a plain .class, so
  the rules can be inlined as attributes), classAttrCount,
  hasViewBox, rootWidth, rootHeight, viewBox, textCount, flowTextCount,
  fontFamilies, inlineStyleAttrCount, hasMask, hasFilter, hasScript,
  hasForeignObject, hasEntityDecl (<!ENTITY> in a DOCTYPE, which SvgXml's
  parser does not expand), hasExternalHref (http(s) links), editorMetadata
  (Inkscape/Sodipodi/Illustrator namespaces present).
"""
import json
import re
import sys

PFX = r"(?:[A-Za-z_][\w.-]*:)?"


def count_tag(src: str, name: str) -> int:
    return len(re.findall(r"<\s*" + PFX + name + r"(?=[\s/>])", src))


def analyze(path: str) -> dict:
    raw = open(path, "rb").read()
    src = raw.decode("utf-8", "replace")
    has_entity = re.search(r"<!ENTITY", src) is not None
    nocomment = re.sub(r"<!--.*?-->", "", src, flags=re.S)
    root = re.search(r"<\s*" + PFX + r"svg\b([^>]*)>", nocomment, re.S)
    attrs = root.group(1) if root else ""

    def attr(name):
        m = re.search(r"(?<![\w:-])" + name + r"\s*=\s*([\"'])(.*?)\1", attrs, re.S)
        return m.group(2).strip() if m else None

    text_n = count_tag(nocomment, "text")
    flow_n = count_tag(nocomment, "flowRoot")
    fonts = sorted(set(
        f.strip().strip("'\"") for f in
        re.findall(r"font-family\s*[:=]\s*[\"']?([^;\"'>]+)", nocomment)
    )) if (text_n or flow_n) else []
    css_blocks = re.findall(r"<\s*" + PFX + r"style\b[^>]*>(.*?)</\s*" + PFX + r"style\s*>",
                            nocomment, re.S)
    css = re.sub(r"<!\[CDATA\[|\]\]>", "", " ".join(css_blocks))
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    rules = re.findall(r"([^{}]+)\{([^{}]*)\}", css)
    selectors = [sel.strip() for sels, _ in rules for sel in sels.split(",")]
    simple_class = bool(rules) and "@" not in css and all(
        re.fullmatch(r"\.[A-Za-z_][\w-]*", sel) for sel in selectors)
    has_style_el = count_tag(nocomment, "style") > 0
    xml_stylesheet = re.search(r"<\?xml-stylesheet", src) is not None
    image_tags = re.findall(r"<\s*" + PFX + r"image\b[^>]*>", nocomment, re.S)
    flags = {
        "hasText": (text_n + flow_n) > 0,
        "hasStyle": (has_style_el and bool(css.strip())) or xml_stylesheet,
        "hasUseOrDefs": any(count_tag(nocomment, t) for t in ("use", "defs", "symbol")),
        "hasGradient": any(count_tag(nocomment, t) for t in
                           ("linearGradient", "radialGradient", "meshgradient")),
        "hasClipPath": count_tag(nocomment, "clipPath") > 0
                       or re.search(r"clip-path\s*[:=]", nocomment) is not None,
        "hasImage": len(image_tags) > 0,
        # extra diagnostics
        "cssRuleCount": len(rules),
        "cssSimpleClassOnly": simple_class,
        "classAttrCount": len(re.findall(r"\sclass\s*=", nocomment)),
        "hasViewBox": attr("viewBox") is not None,
        "viewBox": attr("viewBox"),
        "rootWidth": attr("width"),
        "rootHeight": attr("height"),
        "textCount": text_n,
        "flowTextCount": flow_n,
        "fontFamilies": fonts,
        "inlineStyleAttrCount": len(re.findall(r"\sstyle\s*=", nocomment)),
        "hasMask": count_tag(nocomment, "mask") > 0,
        "hasFilter": count_tag(nocomment, "filter") > 0,
        "hasScript": count_tag(nocomment, "script") > 0
                     or re.search(r"\son[a-z]+\s*=", nocomment, re.I) is not None,
        "hasForeignObject": count_tag(nocomment, "foreignObject") > 0,
        "hasEntityDecl": has_entity,
        "hasExternalHref": re.search(r"href\s*=\s*[\"']\s*https?:", nocomment) is not None,
        "embeddedRaster": any("data:image" in t for t in image_tags),
        "editorMetadata": re.search(r"xmlns:(inkscape|sodipodi|i|x)\s*=", nocomment) is not None,
    }
    return flags


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    out = {p: analyze(p) for p in sys.argv[1:]}
    json.dump(out, sys.stdout, indent=1)


if __name__ == "__main__":
    main()
