"""Generate app-drawn SVG illustrations: traffic signals, pavement markings, hand signals.

Usage: python3 -I generate.py   (writes svg/*.svg, manifest_signals.json, manifest_markings.json next to this file)

All output is plain SVG (shapes + presentation attributes; no CSS/filters) so react-native-svg's
SvgXml can render it. US conventions per the MUTCD (traffic keeps right; yellow separates opposing
traffic, white separates same-direction traffic).
"""
import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "svg")
os.makedirs(OUT, exist_ok=True)

RED, YELLOW, GREEN, ORANGE, WHITE = "#E5332A", "#FFB81C", "#13B25B", "#FF8A00", "#FFFFFF"
HOUSING, UNLIT, ASPHALT = "#1F2328", "#3A4048", "#4B5059"
MARK_W, MARK_Y = "#F4F4F4", "#F2C11C"


def svg(w, h, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}">{body}</svg>'


def rays(cx, cy, r, color, n=8):
    out = []
    for i in range(n):
        a = 2 * math.pi * i / n + math.pi / n
        x1, y1 = cx + (r + 8) * math.cos(a), cy + (r + 8) * math.sin(a)
        x2, y2 = cx + (r + 20) * math.cos(a), cy + (r + 20) * math.sin(a)
        out.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{color}" stroke-width="5" stroke-linecap="round"/>')
    return "".join(out)


def arrow_path(cx, cy, s, direction):
    """Bold arrow centered at (cx,cy), size s, pointing left/right/up/down."""
    pts = [(-0.5, -0.12), (0.05, -0.12), (0.05, -0.38), (0.5, 0), (0.05, 0.38), (0.05, 0.12), (-0.5, 0.12)]
    rot = {"right": 0, "down": 90, "left": 180, "up": 270}[direction]
    a = math.radians(rot)
    p = []
    for x, y in pts:
        X = cx + s * (x * math.cos(a) - y * math.sin(a))
        Y = cy + s * (x * math.sin(a) + y * math.cos(a))
        p.append(f"{X:.1f},{Y:.1f}")
    return " ".join(p)


def signal(lenses, lit=None, flash=False):
    """Vertical signal. lenses: list of (color, kind) with kind 'ball' or an arrow direction."""
    n = len(lenses)
    w, h = 160, 40 + 100 * n
    body = [f'<rect x="30" y="10" width="100" height="{h - 20}" rx="16" fill="{HOUSING}"/>',
            f'<rect x="38" y="16" width="84" height="{h - 32}" rx="12" fill="#2A2F36"/>']
    for i, (color, kind) in enumerate(lenses):
        cy = 60 + 100 * i
        on = lit == i
        body.append(f'<path d="M36 {cy - 30} Q80 {cy - 64} 124 {cy - 30} L124 {cy - 22} Q80 {cy - 50} 36 {cy - 22} Z" fill="#14171B"/>')
        if on:
            body.append(f'<circle cx="80" cy="{cy}" r="50" fill="{color}" opacity="0.22"/>')
        if kind == "ball":
            body.append(f'<circle cx="80" cy="{cy}" r="34" fill="{color if on else UNLIT}"/>')
            if on:
                body.append(f'<circle cx="70" cy="{cy - 10}" r="9" fill="#FFFFFF" opacity="0.35"/>')
        else:
            body.append(f'<circle cx="80" cy="{cy}" r="34" fill="#101317"/>')
            body.append(f'<polygon points="{arrow_path(80, cy, 50, kind)}" fill="{color if on else UNLIT}"/>')
        if on and flash:
            body.append(rays(80, cy, 34, color))
    return svg(w, h, "".join(body))


def box(inner, w=160, h=160):
    return svg(w, h, f'<rect x="6" y="6" width="{w - 12}" height="{h - 12}" rx="14" fill="{HOUSING}"/><rect x="16" y="16" width="{w - 32}" height="{h - 32}" rx="8" fill="#101317"/>{inner}')


WALKER = ('<circle cx="84" cy="40" r="10" fill="#FFFFFF"/>'
          '<path d="M80 54 L72 88 L58 122 M74 84 L92 120 M80 58 L98 74 L110 68 M80 58 L66 76 L58 92" '
          'stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>')
HAND = ('<path d="M62 120 L56 78 Q55 70 62 69 Q68 69 69 77 L71 92 L70 52 Q70 44 77 44 Q84 44 84 52 L85 88 L86 46 Q87 38 94 39 '
        'Q100 40 100 48 L100 90 L103 56 Q104 49 110 50 Q116 52 115 60 L112 104 Q110 124 92 128 L76 128 Q66 126 62 120 Z" fill="' + ORANGE + '"/>')


def lane_control(kind):
    if kind == "red-x":
        inner = f'<path d="M48 48 L112 112 M112 48 L48 112" stroke="{RED}" stroke-width="16" stroke-linecap="round"/>'
    elif kind == "yellow-x":
        inner = f'<path d="M48 48 L112 112 M112 48 L48 112" stroke="{YELLOW}" stroke-width="16" stroke-linecap="round"/>'
    else:
        inner = f'<polygon points="{arrow_path(80, 82, 82, "down")}" fill="{GREEN}"/>'
    return box(inner)


def rr_flashing():
    boards = ('<g transform="translate(120 60) rotate(35)"><rect x="-70" y="-11" width="140" height="22" rx="3" fill="#FFFFFF" stroke="#111" stroke-width="3"/></g>'
              '<g transform="translate(120 60) rotate(-35)"><rect x="-70" y="-11" width="140" height="22" rx="3" fill="#FFFFFF" stroke="#111" stroke-width="3"/></g>')
    light = lambda cx: (f'<circle cx="{cx}" cy="168" r="30" fill="#111"/><circle cx="{cx}" cy="168" r="40" fill="{RED}" opacity="0.2"/>'
                        f'<circle cx="{cx}" cy="168" r="20" fill="{RED}"/>' + rays(cx, 168, 20, RED, 8))
    body = (f'<rect x="114" y="40" width="12" height="230" fill="#9AA3AD"/>{boards}'
            f'<rect x="54" y="160" width="132" height="14" rx="4" fill="#2A2F36"/>{light(70)}{light(170)}')
    return svg(240, 280, body)


# ---------------- pavement markings ----------------

def road(w, h, inner):
    return svg(w, h, f'<rect width="{w}" height="{h}" fill="{ASPHALT}"/>{inner}')


def solid(x, color, h=200, width=5):
    return f'<rect x="{x - width / 2:.1f}" y="0" width="{width}" height="{h}" fill="{color}"/>'


def dashed(x, color, h=200, width=5):
    return "".join(f'<rect x="{x - width / 2:.1f}" y="{y}" width="{width}" height="22" fill="{color}"/>' for y in range(4, h, 44))


def chevron(cx, cy, up=True, color="#D9DCE1"):
    d = -1 if up else 1
    return f'<path d="M{cx - 11} {cy - d * 6} L{cx} {cy + d * 6} L{cx + 11} {cy - d * 6}" stroke="{color}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'


def lane_arrow(cx, cy, kind, color=MARK_W):
    """Pavement arrow (straight / left / right) pointing up the page."""
    stem = f'<rect x="{cx - 4}" y="{cy - 6}" width="8" height="40" fill="{color}"/>'
    if kind == "straight":
        return stem + f'<polygon points="{cx - 13},{cy - 2} {cx},{cy - 26} {cx + 13},{cy - 2}" fill="{color}"/>'
    sign = -1 if kind == "left" else 1
    return (stem + f'<path d="M{cx} {cy} Q{cx} {cy - 18} {cx + sign * 16} {cy - 18}" stroke="{color}" stroke-width="8" fill="none"/>'
            f'<polygon points="{cx + sign * 14},{cy - 30} {cx + sign * 32},{cy - 18} {cx + sign * 14},{cy - 6}" fill="{color}"/>')


def markings():
    m = {}
    m["MARK-DOUBLE-YELLOW"] = road(240, 200, solid(115, MARK_Y) + solid(125, MARK_Y) + chevron(60, 100, up=False) + chevron(180, 100, up=True) + solid(8, MARK_W) + solid(232, MARK_W))
    m["MARK-SOLID-BROKEN-YELLOW"] = road(240, 200, solid(114, MARK_Y) + dashed(126, MARK_Y) + chevron(60, 100, up=False) + chevron(180, 100, up=True) + solid(8, MARK_W) + solid(232, MARK_W))
    m["MARK-BROKEN-YELLOW"] = road(240, 200, dashed(120, MARK_Y) + chevron(60, 100, up=False) + chevron(180, 100, up=True) + solid(8, MARK_W) + solid(232, MARK_W))
    m["MARK-BROKEN-WHITE"] = road(240, 200, solid(8, MARK_Y) + dashed(85, MARK_W) + dashed(160, MARK_W) + solid(232, MARK_W) + chevron(46, 100) + chevron(122, 100) + chevron(196, 100))
    m["MARK-SOLID-WHITE"] = road(240, 200, solid(8, MARK_Y) + solid(120, MARK_W) + solid(232, MARK_W) + chevron(64, 100) + chevron(176, 100))
    m["MARK-EDGE-LINES"] = road(240, 200, solid(14, MARK_Y, width=6) + dashed(120, MARK_W) + solid(226, MARK_W, width=6) + chevron(66, 100) + chevron(174, 100))
    twltl = (solid(96, MARK_Y) + dashed(104, MARK_Y) + dashed(136, MARK_Y) + solid(144, MARK_Y)
             + lane_arrow(120, 70, "left") + f'<g transform="rotate(180 120 140)">{lane_arrow(120, 140, "left")}</g>'
             + chevron(48, 100, up=False) + chevron(192, 100, up=True) + solid(6, MARK_W) + solid(234, MARK_W))
    m["MARK-TWLTL"] = road(240, 200, twltl)
    stop = (dashed(120, MARK_Y, h=96) + f'<rect x="124" y="104" width="112" height="10" fill="{MARK_W}"/>'
            + "".join(f'<rect x="{x}" y="62" width="12" height="34" fill="{MARK_W}"/>' for x in range(8, 240, 24))
            + chevron(180, 160) + chevron(60, 160, up=False) + solid(6, MARK_W, h=200) + solid(234, MARK_W, h=200))
    m["MARK-STOP-LINE"] = road(240, 200, stop)
    teeth = "".join(f'<polygon points="{x},90 {x + 22},90 {x + 11},112" fill="{MARK_W}"/>' for x in range(16, 220, 30))
    m["MARK-YIELD-LINE"] = road(240, 200, teeth + chevron(120, 160) + solid(6, MARK_W) + solid(234, MARK_W))
    m["MARK-HOV-DIAMOND"] = road(240, 200, solid(8, MARK_Y) + solid(120, MARK_W) + dashed(124, MARK_W) + solid(232, MARK_W)
                                 + f'<polygon points="64,40 84,100 64,160 44,100" fill="none" stroke="{MARK_W}" stroke-width="7"/>' + chevron(176, 100))
    bike = ('<g transform="translate(196 100)" fill="none" stroke="#F4F4F4" stroke-width="4">'
            '<circle cx="-14" cy="14" r="11"/><circle cx="14" cy="14" r="11"/>'
            '<path d="M-14 14 L-3 -6 L10 -6 L14 14 M-3 -6 L4 14 L-14 14 M8 -12 L13 -12"/></g>'
            '<circle cx="190" cy="74" r="5" fill="#F4F4F4"/>')
    m["MARK-BIKE-LANE"] = road(240, 200, solid(8, MARK_Y) + dashed(96, MARK_W) + solid(168, MARK_W, width=7) + solid(234, MARK_W) + bike
                               + lane_arrow(196, 170, "straight") + chevron(52, 100) + chevron(132, 100))
    rr = (dashed(120, MARK_Y) + solid(6, MARK_W) + solid(234, MARK_W)
          + f'<path d="M136 40 L224 150 M224 40 L136 150" stroke="{MARK_W}" stroke-width="9"/>'
          + f'<text x="146" y="104" font-family="sans-serif" font-weight="bold" font-size="30" fill="{MARK_W}">R</text>'
          + f'<text x="196" y="104" font-family="sans-serif" font-weight="bold" font-size="30" fill="{MARK_W}">R</text>'
          + f'<rect x="124" y="20" width="112" height="9" fill="{MARK_W}"/>' + chevron(180, 178))
    m["MARK-RR-XING"] = road(240, 200, rr)
    rev = (dashed(84, MARK_Y) + dashed(92, MARK_Y) + dashed(148, MARK_Y) + dashed(156, MARK_Y) + solid(6, MARK_W) + solid(234, MARK_W)
           + chevron(44, 100, up=False) + chevron(196, 100, up=True) + chevron(120, 70, up=True) + chevron(120, 130, up=False))
    m["MARK-REVERSIBLE"] = road(240, 200, rev)
    arrows = (solid(8, MARK_Y) + solid(85, MARK_W) + solid(160, MARK_W) + solid(232, MARK_W)
              + lane_arrow(46, 110, "left") + lane_arrow(122, 110, "straight") + lane_arrow(196, 110, "right"))
    m["MARK-ARROWS"] = road(240, 200, arrows)
    gore = ('<path d="M150 200 L150 120 Q150 60 230 0 L240 0 L240 200 Z" fill="#555A63"/>'
            + solid(8, MARK_Y) + dashed(80, MARK_W)
            + '<path d="M150 200 L150 120 Q150 70 210 0" stroke="#F4F4F4" stroke-width="6" fill="none"/>'
            + '<path d="M182 200 L182 140 Q186 80 240 26" stroke="#F4F4F4" stroke-width="6" fill="none"/>'
            + "".join(f'<path d="M154 {y} L178 {y - 26}" stroke="#F4F4F4" stroke-width="5"/>' for y in range(190, 110, -22))
            + chevron(44, 120) + chevron(116, 120))
    m["MARK-CROSSHATCH"] = road(240, 200, gore)
    return m


# ---------------- hand signals ----------------

def hand_signal(kind):
    car = ('<rect x="70" y="120" width="150" height="90" rx="18" fill="#2F6FD8"/>'
           '<rect x="84" y="70" width="122" height="62" rx="14" fill="#2F6FD8"/>'
           '<rect x="94" y="80" width="102" height="44" rx="8" fill="#BFD6F5"/>'
           '<rect x="70" y="200" width="36" height="22" rx="6" fill="#1B1F24"/><rect x="184" y="200" width="36" height="22" rx="6" fill="#1B1F24"/>'
           '<rect x="76" y="140" width="22" height="12" rx="3" fill="#E5332A"/><rect x="192" y="140" width="22" height="12" rx="3" fill="#E5332A"/>')
    skin = "#E0A97A"
    shoulder = (96, 106)
    elbow = (40, 106)
    if kind == "left":
        arm = f'<path d="M{shoulder[0]} {shoulder[1]} L10 106" stroke="{skin}" stroke-width="16" stroke-linecap="round"/><circle cx="10" cy="106" r="10" fill="{skin}"/>'
    elif kind == "right":
        arm = (f'<path d="M{shoulder[0]} {shoulder[1]} L{elbow[0]} {elbow[1]} L{elbow[0]} 50" stroke="{skin}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
               f'<circle cx="{elbow[0]}" cy="44" r="10" fill="{skin}"/>')
    else:
        arm = (f'<path d="M{shoulder[0]} {shoulder[1]} L{elbow[0]} {elbow[1]} L{elbow[0]} 162" stroke="{skin}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
               f'<circle cx="{elbow[0]}" cy="168" r="10" fill="{skin}"/>')
    return svg(240, 230, car + arm)


def smv():
    return svg(200, 180, '<polygon points="100,8 192,170 8,170" fill="#B3261E"/><polygon points="100,40 164,152 36,152" fill="#FF6A13"/>')


SIGNALS = [
    ("SIG-RED", "Steady red light", signal([(RED, "ball"), (YELLOW, "ball"), (GREEN, "ball")], 0), "Come to a complete stop. You may turn right (and in some states left onto a one-way street) after stopping only if no sign prohibits it and it is safe."),
    ("SIG-YELLOW", "Steady yellow light", signal([(RED, "ball"), (YELLOW, "ball"), (GREEN, "ball")], 1), "The light is about to turn red. Stop if you can do so safely; if you are too close to stop safely, proceed with caution."),
    ("SIG-GREEN", "Steady green light", signal([(RED, "ball"), (YELLOW, "ball"), (GREEN, "ball")], 2), "Go if the intersection is clear, yielding to pedestrians and to vehicles still in the intersection. When turning left, yield to oncoming traffic."),
    ("SIG-FLASH-RED", "Flashing red light", signal([(RED, "ball")], 0, flash=True), "Treat it like a stop sign: come to a complete stop, yield, and go only when it is safe."),
    ("SIG-FLASH-YELLOW", "Flashing yellow light", signal([(YELLOW, "ball")], 0, flash=True), "Slow down and proceed with caution; watch for cross traffic and pedestrians."),
    ("SIG-GREEN-ARROW-LEFT", "Green left-turn arrow", signal([(RED, "ball"), (YELLOW, "ball"), (GREEN, "left")], 2), "Protected left turn: you may turn left in the direction of the arrow; oncoming traffic is stopped. Still yield to pedestrians and vehicles in the intersection."),
    ("SIG-YELLOW-ARROW-LEFT", "Steady yellow left arrow", signal([(RED, "left"), (YELLOW, "left"), (GREEN, "left")], 1), "The protected left-turn period is ending. Stop if you can do so safely, or complete the turn with caution if you are already in the intersection."),
    ("SIG-RED-ARROW-LEFT", "Red left arrow", signal([(RED, "left"), (YELLOW, "left"), (GREEN, "left")], 0), "Do not turn left. Stop and wait until a green arrow or a permissive signal allows the turn."),
    ("SIG-FLASH-YELLOW-ARROW-LEFT", "Flashing yellow left arrow", signal([(RED, "left"), (YELLOW, "left"), (YELLOW, "left"), (GREEN, "left")], 2, flash=True), "Left turns are allowed but not protected: yield to oncoming traffic and pedestrians, then turn when there is a safe gap."),
    ("SIG-GREEN-ARROW-RIGHT", "Green right-turn arrow", signal([(RED, "ball"), (YELLOW, "ball"), (GREEN, "right")], 2), "You may turn right in the direction of the arrow; yield to pedestrians and vehicles already in the intersection."),
    ("SIG-PED-WALK", "Pedestrian signal: walk", box(WALKER), "Pedestrians may start crossing. Drivers turning across the crosswalk must yield to them."),
    ("SIG-PED-DONT-WALK", "Pedestrian signal: don't walk", box(HAND), "Pedestrians must not start crossing. Drivers should still watch for pedestrians finishing their crossing."),
    ("SIG-PED-COUNTDOWN", "Pedestrian countdown signal",
     box(f'<g transform="translate(-34 0) scale(0.95)">{HAND}</g><text x="122" y="100" font-family="sans-serif" font-weight="bold" font-size="44" fill="{ORANGE}" text-anchor="middle">12</text>'),
     "The number shows the seconds left to finish crossing. Pedestrians should not start crossing; drivers should expect pedestrians still in the crosswalk."),
    ("SIG-LANE-RED-X", "Lane-use signal: red X", lane_control("red-x"), "Do not drive in this lane — it is closed to traffic in your direction."),
    ("SIG-LANE-YELLOW-X", "Lane-use signal: yellow X", lane_control("yellow-x"), "This lane is about to close to your direction. Move safely out of it as soon as you can."),
    ("SIG-LANE-GREEN-ARROW", "Lane-use signal: green arrow", lane_control("green"), "You may drive in this lane."),
    ("SIG-RR-FLASHING", "Railroad crossing flashing lights", rr_flashing(), "A train is approaching. Stop before the crossing and do not cross until the lights stop flashing and the way is clear."),
    ("SIG-OUT", "Traffic signal not working", signal([(RED, "ball"), (YELLOW, "ball"), (GREEN, "ball")], None), "When signals are dark (power out), treat the intersection as an all-way stop: stop, then proceed when it is your turn and safe."),
]

MARKING_META = {
    "MARK-DOUBLE-YELLOW": ("Double solid yellow center line", "Separates traffic moving in opposite directions; passing is not allowed from either side."),
    "MARK-SOLID-BROKEN-YELLOW": ("Solid and broken yellow center lines", "Drivers on the side with the broken line may pass when it is safe; drivers on the side with the solid line may not pass."),
    "MARK-BROKEN-YELLOW": ("Broken yellow center line", "Two-way traffic; you may pass on the left when the way ahead is clear and it is safe."),
    "MARK-BROKEN-WHITE": ("Broken white lane lines", "Separate lanes of traffic moving in the same direction; you may change lanes when it is safe."),
    "MARK-SOLID-WHITE": ("Solid white lane line", "Separates lanes moving in the same direction where lane changes are discouraged or prohibited; stay in your lane."),
    "MARK-EDGE-LINES": ("Edge lines", "A solid yellow line marks the left edge of a divided or one-way road; a solid white line marks the right edge."),
    "MARK-TWLTL": ("Two-way left-turn lane", "The center lane is shared by drivers in both directions for making left turns only; do not use it for passing or travel."),
    "MARK-STOP-LINE": ("Stop line and crosswalk", "When required to stop, stop before the stop line; if there is none, stop before the crosswalk."),
    "MARK-YIELD-LINE": ("Yield line (shark teeth)", "The triangles point toward approaching drivers and show where to yield or stop when required."),
    "MARK-HOV-DIAMOND": ("HOV / restricted lane diamond", "The diamond marks a lane reserved for certain vehicles, such as carpools or buses, as posted on signs."),
    "MARK-BIKE-LANE": ("Bike lane", "A lane reserved for bicycles, marked with a solid white line and a bicycle symbol; drivers may cross it only to turn or park where permitted, after yielding to cyclists."),
    "MARK-RR-XING": ("Railroad crossing pavement marking", "An X with the letters RR painted before a railroad crossing warns you to slow down, look and listen, and be ready to stop."),
    "MARK-REVERSIBLE": ("Reversible lane", "A lane bounded by double broken yellow lines whose direction changes at certain times; check signs or lane-use signals before using it."),
    "MARK-ARROWS": ("Lane-use arrows", "Arrows on the pavement show which movements are allowed from each lane: left turn only, straight, or right turn only."),
    "MARK-CROSSHATCH": ("Gore area (painted island)", "The striped area between a freeway and a ramp; do not drive or stop on it."),
}


def main():
    sig_manifest = []
    for code, name, data, meaning in SIGNALS:
        with open(os.path.join(OUT, f"{code}.svg"), "w") as f:
            f.write(data)
        sig_manifest.append({"code": code, "name": name, "category": "railroad" if code == "SIG-RR-FLASHING" else "signal",
                             "shape": "Traffic signal", "colors": "", "meaning": meaning, "license": "app-drawn", "svgPath": f"svg/{code}.svg"})
    mark_manifest = []
    for code, data in markings().items():
        name, meaning = MARKING_META[code]
        with open(os.path.join(OUT, f"{code}.svg"), "w") as f:
            f.write(data)
        mark_manifest.append({"code": code, "name": name, "category": "marking", "shape": "Pavement marking", "colors": "",
                              "meaning": meaning, "license": "app-drawn", "svgPath": f"svg/{code}.svg"})
    for code, name, meaning in [
        ("HAND-LEFT", "Hand signal: left turn", "Left arm and hand extended straight out the window means the driver will turn left."),
        ("HAND-RIGHT", "Hand signal: right turn", "Left arm extended out with the forearm and hand pointing up means the driver will turn right."),
        ("HAND-STOP", "Hand signal: slow or stop", "Left arm extended out with the forearm and hand pointing down means the driver will slow down or stop."),
    ]:
        kind = code.split("-")[1].lower()
        with open(os.path.join(OUT, f"{code}.svg"), "w") as f:
            f.write(hand_signal(kind))
        mark_manifest.append({"code": code, "name": name, "category": "hand_signal", "shape": "Arm position", "colors": "",
                              "meaning": meaning, "license": "app-drawn", "svgPath": f"svg/{code}.svg"})
    with open(os.path.join(OUT, "SMV-EMBLEM.svg"), "w") as f:
        f.write(smv())
    mark_manifest.append({"code": "SMV-EMBLEM", "name": "Slow-moving vehicle emblem", "category": "other", "shape": "Triangle",
                          "colors": "Fluorescent orange with red border",
                          "meaning": "Marks a vehicle that travels at 25 mph or less, such as farm equipment or horse-drawn vehicles; slow down and pass only when safe.",
                          "license": "app-drawn", "svgPath": "svg/SMV-EMBLEM.svg"})
    with open(os.path.join(HERE, "manifest_signals.json"), "w") as f:
        json.dump(sig_manifest, f, indent=2)
    with open(os.path.join(HERE, "manifest_markings.json"), "w") as f:
        json.dump(mark_manifest, f, indent=2)
    print(f"signals={len(sig_manifest)} markings+other={len(mark_manifest)}")


if __name__ == "__main__":
    main()
