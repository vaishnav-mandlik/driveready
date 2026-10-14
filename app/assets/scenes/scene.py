"""Scene renderer: top-down driving-situation illustrations as plain SVG.

Scenes are 360x270 (4:3). Build a scene with Scene(), add a road layout, actors,
paths and props, then .svg() returns markup that react-native-svg's SvgXml
renders (shapes + presentation attributes only; short bold labels use <text>).

Conventions (US): traffic keeps right. Screen "up" = north. Headings are in
degrees clockwise from north: 0 = driving up the screen, 90 = right, 180 =
down, 270 = left. Lane centers for the standard roads are exposed as helpers so
scene authors never guess coordinates.
"""
from __future__ import annotations

import math
from dataclasses import dataclass, field

W, H = 360, 270
CX, CY = W / 2, H / 2

GRASS = "#9CC27E"
GRASS_DARK = "#8AB46C"
ASPHALT = "#5B616B"
SIDEWALK = "#D8D2C8"
WHITE = "#F4F4F4"
YELLOW = "#F2C11C"
CURB = "#BDB6AA"

ACTOR_COLORS = {
    "A": "#2F6FD8",  # blue
    "B": "#E5484D",  # red
    "C": "#11994B",  # green
    "D": "#8E44AD",  # purple
    "E": "#E8930C",  # orange
    "YOU": "#2F6FD8",
}

LANE = 28  # lane width
ROAD = LANE * 2  # two-lane road width


def _f(v: float) -> str:
    return f"{v:.1f}".rstrip("0").rstrip(".")


@dataclass
class Scene:
    parts: list[str] = field(default_factory=list)
    top: list[str] = field(default_factory=list)  # drawn above actors (labels, arrows)

    # ---------------------------------------------------------------- base
    def grass(self) -> "Scene":
        self.parts.append(f'<rect width="{W}" height="{H}" fill="{GRASS}"/>')
        return self

    def rect(self, x, y, w, h, fill, rx=0, opacity=None) -> "Scene":
        op = f' opacity="{opacity}"' if opacity is not None else ""
        self.parts.append(f'<rect x="{_f(x)}" y="{_f(y)}" width="{_f(w)}" height="{_f(h)}" rx="{rx}" fill="{fill}"{op}/>')
        return self

    def line(self, x1, y1, x2, y2, color=WHITE, width=2.5, dash=None, top=False) -> "Scene":
        d = f' stroke-dasharray="{dash}"' if dash else ""
        el = f'<line x1="{_f(x1)}" y1="{_f(y1)}" x2="{_f(x2)}" y2="{_f(y2)}" stroke="{color}" stroke-width="{width}"{d}/>'
        (self.top if top else self.parts).append(el)
        return self

    # ---------------------------------------------------------------- roads
    def road_h(self, y=CY, lanes_each_way=1, center="dashed-yellow", x1=0, x2=W, edge=True) -> "Scene":
        """Horizontal two-way road centered at y. center: dashed-yellow | double-yellow | solid-dashed | none | dashed-white."""
        half = LANE * lanes_each_way
        self.rect(x1, y - half - 6, x2 - x1, 6, SIDEWALK) if edge else None
        self.rect(x1, y + half, x2 - x1, 6, SIDEWALK) if edge else None
        self.rect(x1, y - half, x2 - x1, 2 * half, ASPHALT)
        self._center_h(y, x1, x2, center)
        for k in range(1, lanes_each_way):
            for yy in (y - k * LANE, y + k * LANE):
                self.line(x1, yy, x2, yy, WHITE, 2, "12 12")
        return self

    def road_v(self, x=CX, lanes_each_way=1, center="dashed-yellow", y1=0, y2=H, edge=True) -> "Scene":
        half = LANE * lanes_each_way
        if edge:
            self.rect(x - half - 6, y1, 6, y2 - y1, SIDEWALK)
            self.rect(x + half, y1, 6, y2 - y1, SIDEWALK)
        self.rect(x - half, y1, 2 * half, y2 - y1, ASPHALT)
        self._center_v(x, y1, y2, center)
        for k in range(1, lanes_each_way):
            for xx in (x - k * LANE, x + k * LANE):
                self.line(xx, y1, xx, y2, WHITE, 2, "12 12")
        return self

    def _center_h(self, y, x1, x2, center):
        if center == "dashed-yellow":
            self.line(x1, y, x2, y, YELLOW, 2.5, "12 10")
        elif center == "double-yellow":
            self.line(x1, y - 2.5, x2, y - 2.5, YELLOW, 2)
            self.line(x1, y + 2.5, x2, y + 2.5, YELLOW, 2)
        elif center == "solid-dashed":  # solid on the north half, broken on the south half (southern lane may pass)
            self.line(x1, y - 2.5, x2, y - 2.5, YELLOW, 2)
            self.line(x1, y + 2.5, x2, y + 2.5, YELLOW, 2, "12 10")
        elif center == "dashed-white":
            self.line(x1, y, x2, y, WHITE, 2.5, "12 10")

    def _center_v(self, x, y1, y2, center):
        if center == "dashed-yellow":
            self.line(x, y1, x, y2, YELLOW, 2.5, "12 10")
        elif center == "double-yellow":
            self.line(x - 2.5, y1, x - 2.5, y2, YELLOW, 2)
            self.line(x + 2.5, y1, x + 2.5, y2, YELLOW, 2)
        elif center == "solid-dashed":  # solid on the west half (southbound may not pass), broken on the east half
            self.line(x - 2.5, y1, x - 2.5, y2, YELLOW, 2)
            self.line(x + 2.5, y1, x + 2.5, y2, YELLOW, 2, "12 10")
        elif center == "dashed-white":
            self.line(x, y1, x, y2, WHITE, 2.5, "12 10")

    def intersection(self, crosswalks=False, stop_lines=True, center="dashed-yellow") -> "Scene":
        """Standard 4-way crossing of two 2-lane roads at the canvas center."""
        self.road_h(CY, 1, center)
        self.road_v(CX, 1, center)
        # clear the box
        self.rect(CX - ROAD / 2, CY - ROAD / 2, ROAD, ROAD, ASPHALT)
        half = ROAD / 2
        if crosswalks:
            for i in range(6):
                o = -half + 3 + i * (ROAD - 6) / 6
                self.rect(CX + o, CY - half - 16, 6, 12, WHITE)  # north
                self.rect(CX + o, CY + half + 4, 6, 12, WHITE)  # south
                self.rect(CX - half - 16, CY + o, 12, 6, WHITE)  # west
                self.rect(CX + half + 4, CY + o, 12, 6, WHITE)  # east
        if stop_lines:
            g = 20 if crosswalks else 4
            self.line(CX, CY + half + g, CX + half, CY + half + g, WHITE, 3.5)  # northbound approach (south leg)
            self.line(CX - half, CY - half - g, CX, CY - half - g, WHITE, 3.5)  # southbound approach (north leg)
            self.line(CX - half - g, CY, CX - half - g, CY + half, WHITE, 3.5)  # eastbound approach (west leg)
            self.line(CX + half + g, CY - half, CX + half + g, CY, WHITE, 3.5)  # westbound approach (east leg)
        return self

    def t_junction(self, stem="south", center="dashed-yellow") -> "Scene":
        """Through road east-west; a side road ends at it from the south (default) or north."""
        self.road_h(CY, 1, center)
        if stem == "south":
            self.road_v(CX, 1, center, y1=CY + ROAD / 2, y2=H)
            self.line(CX, CY + ROAD / 2 + 4, CX + ROAD / 2, CY + ROAD / 2 + 4, WHITE, 3.5)
        else:
            self.road_v(CX, 1, center, y1=0, y2=CY - ROAD / 2)
            self.line(CX - ROAD / 2, CY - ROAD / 2 - 4, CX, CY - ROAD / 2 - 4, WHITE, 3.5)
        return self

    def roundabout(self, r_outer=92, r_island=46) -> "Scene":
        for x, y, w, h in ((CX - ROAD / 2, 0, ROAD, H), (0, CY - ROAD / 2, W, ROAD)):
            self.rect(x, y, w, h, ASPHALT)
        self.parts.append(f'<circle cx="{CX}" cy="{CY}" r="{r_outer}" fill="{ASPHALT}"/>')
        self.parts.append(f'<circle cx="{CX}" cy="{CY}" r="{r_island + 6}" fill="{CURB}"/>')
        self.parts.append(f'<circle cx="{CX}" cy="{CY}" r="{r_island}" fill="{GRASS_DARK}"/>')
        # splitter islands + yield lines on each approach
        for ang in (0, 90, 180, 270):
            a = math.radians(ang)
            ux, uy = math.sin(a), -math.cos(a)
            px, py = CX + ux * (r_outer + 24), CY + uy * (r_outer + 24)
            self.parts.append(
                f'<rect x="{_f(px - 5)}" y="{_f(py - 22)}" width="10" height="44" rx="5" fill="{CURB}" transform="rotate({ang} {_f(px)} {_f(py)})"/>'
            )
        # counter-clockwise circulation hint arrows
        for ang in (45, 135, 225, 315):
            self.path_arc_hint(ang, (r_outer + r_island) / 2 + 3)
        return self

    def path_arc_hint(self, ang, r):
        a1, a2 = math.radians(ang - 14), math.radians(ang + 14)
        x1, y1 = CX + r * math.sin(a1), CY - r * math.cos(a1)
        x2, y2 = CX + r * math.sin(a2), CY - r * math.cos(a2)
        # counter-clockwise (screen): travel from a2 to a1
        self.parts.append(
            f'<path d="M{_f(x2)} {_f(y2)} A{_f(r)} {_f(r)} 0 0 0 {_f(x1)} {_f(y1)}" stroke="#AEB4BC" stroke-width="2.5" fill="none" stroke-dasharray="4 5"/>'
        )
        hx, hy = x1, y1
        tx, ty = math.cos(a1), math.sin(a1)  # tangent (counter-clockwise direction)
        self.parts.append(
            f'<polygon points="{_f(hx)},{_f(hy)} {_f(hx + 7 * tx - 4 * ty * -1)},{_f(hy + 7 * ty + 4 * tx * -1)} {_f(hx + 7 * tx + 4 * ty * -1)},{_f(hy + 7 * ty - 4 * tx * -1)}" fill="#AEB4BC"/>'
        )

    def divided_highway(self, y=CY, lanes_each_way=2, median=26) -> "Scene":
        half = LANE * lanes_each_way
        self.rect(0, y - median / 2 - half, W, half, ASPHALT)
        self.rect(0, y + median / 2, W, half, ASPHALT)
        self.rect(0, y - median / 2, W, median, GRASS_DARK)
        self.line(0, y - median / 2 - 1, W, y - median / 2 - 1, YELLOW, 2)
        self.line(0, y + median / 2 + 1, W, y + median / 2 + 1, YELLOW, 2)
        for k in range(1, lanes_each_way):
            self.line(0, y - median / 2 - k * LANE, W, y - median / 2 - k * LANE, WHITE, 2, "12 12")
            self.line(0, y + median / 2 + k * LANE, W, y + median / 2 + k * LANE, WHITE, 2, "12 12")
        return self

    def rail_tracks_h(self, y) -> "Scene":
        """Railroad tracks crossing horizontally at y (ties + rails)."""
        for x in range(0, W, 9):
            self.rect(x, y - 13, 5, 26, "#7A5C3E")
        self.line(0, y - 6, W, y - 6, "#9AA0A6", 2.5)
        self.line(0, y + 6, W, y + 6, "#9AA0A6", 2.5)
        return self

    def curb_h(self, y, x1=0, x2=W, color=CURB) -> "Scene":
        self.rect(x1, y - 3, x2 - x1, 6, color)
        return self

    # ---------------------------------------------------------------- lane helpers
    @staticmethod
    def lane_x(direction: str) -> float:
        """x center of the lane on the vertical road for 'north' (right lane) or 'south'."""
        return CX + LANE / 2 if direction == "north" else CX - LANE / 2

    @staticmethod
    def lane_y(direction: str) -> float:
        """y center of the lane on the horizontal road for 'east' (lower lane) or 'west'."""
        return CY + LANE / 2 if direction == "east" else CY - LANE / 2

    # ---------------------------------------------------------------- actors
    def car(self, x, y, heading=0, color=None, label=None, kind="car", turn_signal=None, brake=False, wheels=0) -> "Scene":
        """Top-down vehicle centered at (x, y). kind: car | truck | bus | police | ambulance | firetruck | motorcycle.
        turn_signal: 'left' | 'right' | 'hazard'. wheels: front-wheel angle in degrees (parking scenes)."""
        color = color or ACTOR_COLORS.get(label or "", "#2F6FD8")
        g = []
        if kind == "car":
            L, Wd = 46, 23
            g.append(f'<rect x="{-Wd/2}" y="{-L/2}" width="{Wd}" height="{L}" rx="6" fill="{color}"/>')
            g.append(f'<rect x="{-Wd/2+3}" y="{-L/2+8}" width="{Wd-6}" height="9" rx="2.5" fill="#CFE0F5"/>')  # windshield
            g.append(f'<rect x="{-Wd/2+3}" y="{L/2-12}" width="{Wd-6}" height="6" rx="2" fill="#B8CCE4"/>')  # rear window
            if wheels:
                for sx in (-1, 1):
                    g.append(f'<rect x="-2.5" y="-6" width="5" height="12" rx="1.5" fill="#1B1F24" transform="translate({sx * (Wd/2 + 1)} {-L/2 + 11}) rotate({wheels})"/>')
        elif kind == "truck":
            L, Wd = 92, 26
            g.append(f'<rect x="{-Wd/2}" y="{-L/2 + 22}" width="{Wd}" height="{L - 22}" rx="3" fill="#E9ECEF" stroke="#9AA0A6" stroke-width="1.5"/>')
            g.append(f'<rect x="{-Wd/2+1}" y="{-L/2}" width="{Wd-2}" height="20" rx="4" fill="{color}"/>')
            g.append(f'<rect x="{-Wd/2+4}" y="{-L/2+3}" width="{Wd-8}" height="6" rx="2" fill="#CFE0F5"/>')
        elif kind == "bus":
            L, Wd = 74, 25
            g.append(f'<rect x="{-Wd/2}" y="{-L/2}" width="{Wd}" height="{L}" rx="5" fill="#F7B500"/>')
            g.append(f'<rect x="{-Wd/2+3}" y="{-L/2+5}" width="{Wd-6}" height="7" rx="2" fill="#CFE0F5"/>')
            g.append(f'<rect x="{-Wd/2+2}" y="{-L/2+16}" width="{Wd-4}" height="{L-24}" rx="2" fill="#E5A800"/>')
        elif kind in ("police", "ambulance", "firetruck"):
            L, Wd = (56, 25) if kind != "firetruck" else (78, 27)
            body = {"police": "#1F2A44", "ambulance": "#FFFFFF", "firetruck": "#C62828"}[kind]
            g.append(f'<rect x="{-Wd/2}" y="{-L/2}" width="{Wd}" height="{L}" rx="6" fill="{body}" stroke="#9AA0A6" stroke-width="1"/>')
            g.append(f'<rect x="{-Wd/2+3}" y="{-L/2+8}" width="{Wd-6}" height="8" rx="2" fill="#CFE0F5"/>')
            g.append(f'<rect x="{-Wd/2+2}" y="{-L/2+19}" width="{Wd/2-2}" height="5" fill="#E53935"/>')
            g.append(f'<rect x="0" y="{-L/2+19}" width="{Wd/2-2}" height="5" fill="#1E63E9"/>')
            for dx in (-Wd / 2 - 7, Wd / 2 + 7):  # flashing-light rays
                g.append(f'<line x1="{dx}" y1="{-L/2+17}" x2="{dx + (5 if dx > 0 else -5)}" y2="{-L/2+12}" stroke="#E53935" stroke-width="2.5" stroke-linecap="round"/>')
        elif kind == "motorcycle":
            g.append('<rect x="-4" y="-16" width="8" height="32" rx="4" fill="#1B1F24"/>')
            g.append(f'<circle cx="0" cy="-1" r="6" fill="{color}"/>')
            L = 32
        if turn_signal in ("left", "hazard"):
            g.append(f'<circle cx="{-9}" cy="{-L/2 + 2}" r="3.2" fill="#FFB300"/><circle cx="-9" cy="{L/2 - 2}" r="3.2" fill="#FFB300"/>')
        if turn_signal in ("right", "hazard"):
            g.append(f'<circle cx="{9}" cy="{-L/2 + 2}" r="3.2" fill="#FFB300"/><circle cx="9" cy="{L/2 - 2}" r="3.2" fill="#FFB300"/>')
        if brake:
            g.append(f'<rect x="-11" y="{L/2 - 3}" width="7" height="3" fill="#FF1744"/><rect x="4" y="{L/2 - 3}" width="7" height="3" fill="#FF1744"/>')
        self.parts.append(f'<g transform="translate({_f(x)} {_f(y)}) rotate({heading})">{"".join(g)}</g>')
        if label:
            self.label(x, y, label)
        return self

    def school_bus_stopped(self, x, y, heading=0, arm=True, lights="red") -> "Scene":
        """School bus with flashing lights (red or yellow) and stop arm out on the driver's (left) side."""
        self.car(x, y, heading, kind="bus")
        g = []
        L = 74
        col = "#E53935" if lights == "red" else "#FFB300"
        for (px, py) in ((-8, -L / 2 + 2), (8, -L / 2 + 2), (-8, L / 2 - 2), (8, L / 2 - 2)):
            g.append(f'<circle cx="{px}" cy="{py}" r="3.5" fill="{col}"/>')
            g.append(f'<circle cx="{px}" cy="{py}" r="7" fill="{col}" opacity="0.25"/>')
        if arm:
            g.append('<rect x="-26" y="-14" width="13" height="2.5" fill="#333"/>')
            g.append('<polygon points="-31,-19 -27,-23 -21,-23 -17,-19 -17,-13 -21,-9 -27,-9 -31,-13" fill="#C62828" stroke="#FFF" stroke-width="1.2"/>')
        self.parts.append(f'<g transform="translate({_f(x)} {_f(y)}) rotate({heading})">{"".join(g)}</g>')
        return self

    def pedestrian(self, x, y, color="#5A3E8C") -> "Scene":
        self.parts.append(f'<circle cx="{_f(x)}" cy="{_f(y)}" r="7.5" fill="{color}" stroke="#FFFFFF" stroke-width="2"/>')
        self.parts.append(f'<circle cx="{_f(x)}" cy="{_f(y)}" r="3" fill="#F2C9A0"/>')
        return self

    def bicycle(self, x, y, heading=0, color="#11994B") -> "Scene":
        g = ('<rect x="-1.8" y="-15" width="3.6" height="30" rx="1.8" fill="#1B1F24"/>'
             f'<circle cx="0" cy="0" r="6" fill="{color}" stroke="#FFF" stroke-width="1.5"/>'
             '<rect x="-7" y="-9" width="14" height="2.5" rx="1" fill="#1B1F24"/>')
        self.parts.append(f'<g transform="translate({_f(x)} {_f(y)}) rotate({heading})">{g}</g>')
        return self

    def train(self, y, x1=-10, x2=150) -> "Scene":
        self.rect(x1, y - 11, x2 - x1, 22, "#37474F", rx=4)
        for xx in range(int(x1) + 8, int(x2) - 10, 26):
            self.rect(xx, y - 6, 16, 12, "#90A4AE", rx=2)
        self.rect(x2 - 14, y - 11, 14, 22, "#FFC107", rx=4)
        return self

    def stop_sign(self, x, y, size=13) -> "Scene":
        r = size / 2
        pts = " ".join(f"{_f(x + r * math.cos(math.radians(22.5 + 45 * i)))},{_f(y + r * math.sin(math.radians(22.5 + 45 * i)))}" for i in range(8))
        self.parts.append(f'<polygon points="{pts}" fill="#C62828" stroke="#FFFFFF" stroke-width="1.5"/>')
        return self

    def yield_sign(self, x, y, size=14) -> "Scene":
        s = size
        self.parts.append(f'<polygon points="{_f(x - s/2)},{_f(y - s/3)} {_f(x + s/2)},{_f(y - s/3)} {_f(x)},{_f(y + s*0.55)}" fill="#C62828" stroke="#FFFFFF" stroke-width="2"/>')
        return self

    def signal(self, x, y, state="red", heading=0) -> "Scene":
        """Small 3-lens signal head facing traffic whose heading is `heading`."""
        lit = {"red": 0, "yellow": 1, "green": 2, "off": -1}[state]
        cols = ["#E5332A", "#FFB81C", "#13B25B"]
        g = ['<rect x="-6" y="-17" width="12" height="34" rx="3" fill="#1F2328"/>']
        for i in range(3):
            g.append(f'<circle cx="0" cy="{-10 + i * 10}" r="3.6" fill="{cols[i] if i == lit else "#3A4048"}"/>')
        self.parts.append(f'<g transform="translate({_f(x)} {_f(y)}) rotate({heading})">{"".join(g)}</g>')
        return self

    def tree(self, x, y, r=12) -> "Scene":
        self.parts.append(f'<circle cx="{_f(x)}" cy="{_f(y)}" r="{r}" fill="#4E8A3A"/><circle cx="{_f(x - r/3)}" cy="{_f(y - r/3)}" r="{r/2.2}" fill="#6AA84F"/>')
        return self

    def hydrant(self, x, y) -> "Scene":
        self.parts.append(f'<circle cx="{_f(x)}" cy="{_f(y)}" r="5" fill="#D32F2F" stroke="#7F0000" stroke-width="1.5"/>')
        return self

    def zone(self, points, color="#E53935", opacity=0.28) -> "Scene":
        """Shaded polygon (blind spots / no-zones)."""
        pts = " ".join(f"{_f(px)},{_f(py)}" for px, py in points)
        self.parts.append(f'<polygon points="{pts}" fill="{color}" opacity="{opacity}"/>')
        return self

    # ---------------------------------------------------------------- annotations (always on top)
    def path(self, d: str, color="#2F6FD8", dashed=True) -> "Scene":
        """Intended path as an SVG path 'd' string, with an arrowhead at the end."""
        dash = ' stroke-dasharray="7 6"' if dashed else ""
        self.top.append(f'<path d="{d}" stroke="{color}" stroke-width="3.5" fill="none" stroke-linecap="round"{dash}/>')
        nums = [float(t) for t in d.replace(",", " ").replace("M", " ").replace("L", " ").replace("Q", " ").replace("C", " ").split()]
        (x1, y1), (x2, y2) = (nums[-4], nums[-3]), (nums[-2], nums[-1])
        ang = math.atan2(y2 - y1, x2 - x1)
        a, b = ang + math.radians(150), ang - math.radians(150)
        self.top.append(
            f'<polygon points="{_f(x2)},{_f(y2)} {_f(x2 + 11 * math.cos(a))},{_f(y2 + 11 * math.sin(a))} {_f(x2 + 11 * math.cos(b))},{_f(y2 + 11 * math.sin(b))}" fill="{color}"/>'
        )
        return self

    def label(self, x, y, text, color="#1B1F24", bg="#FFFFFF") -> "Scene":
        r = 9 if len(text) <= 1 else 6 + 4.5 * len(text)
        if len(text) <= 1:
            self.top.append(f'<circle cx="{_f(x)}" cy="{_f(y)}" r="{r}" fill="{bg}" stroke="{color}" stroke-width="1.5"/>')
        else:
            self.top.append(f'<rect x="{_f(x - r)}" y="{_f(y - 9)}" width="{_f(2 * r)}" height="18" rx="9" fill="{bg}" stroke="{color}" stroke-width="1.5"/>')
        self.top.append(f'<text x="{_f(x)}" y="{_f(y + 4.5)}" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="{color}" text-anchor="middle">{text}</text>')
        return self

    def svg(self) -> str:
        return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}">{"".join(self.parts)}{"".join(self.top)}</svg>'
