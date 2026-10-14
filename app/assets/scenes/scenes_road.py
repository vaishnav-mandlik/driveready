"""Road-situation scenes: sharing the road, passing, freeway merging, parking on hills, work zones.

Each entry: (code, name, meaning, builder). Helpers that draw extra props live in this module so the
shared engine (scene.py) stays untouched.
"""
import math

from scene import ASPHALT, CURB, CX, CY, GRASS_DARK, H, LANE, ROAD, SIDEWALK, W, WHITE, YELLOW, Scene, _f

ORANGE = "#F57C00"
SHOULDER = "#727882"
GRAVEL = "#C9B48A"
BLUE = "#2F6FD8"
RED = "#E5484D"
GREEN = "#11994B"
GREY_CAR = "#8A939E"

LN = Scene.lane_x("north")  # northbound lane center on a vertical two-lane road
LS = Scene.lane_x("south")
LE = Scene.lane_y("east")  # eastbound lane center on a horizontal two-lane road
LW = Scene.lane_y("west")


# --------------------------------------------------------------------------- helpers
def center_v(s, x, west="solid", east="solid", y1=0, y2=H):
    """Vertical yellow center marking; each half is 'solid' or 'dashed'. Northbound traffic sees the east half."""
    for dx, style in ((-3.5, west), (3.5, east)):
        s.line(x + dx, y1, x + dx, y2, YELLOW, 2.2, "12 10" if style == "dashed" else None)


def zoom(s, k, cx=CX, cy=CY):
    """Magnify the whole finished scene by k around (cx, cy) so small roads read well at phone size."""
    t = f'<g transform="translate({_f(CX)} {_f(CY)}) scale({k}) translate({_f(-cx)} {_f(-cy)})">'
    s.parts = [t] + s.parts + ["</g>"]
    s.top = [t] + s.top + ["</g>"]
    return s


def no_zone(s, points):
    """Truck blind spot: bright translucent fill with a dashed outline so it reads on asphalt."""
    pts = " ".join(f"{_f(px)},{_f(py)}" for px, py in points)
    s.parts.append(f'<polygon points="{pts}" fill="#FF5A4F" opacity="0.42"/>')
    s.parts.append(f'<polygon points="{pts}" fill="none" stroke="#FFD0CC" stroke-width="1.5" stroke-dasharray="5 4"/>')


def light_glow(s, x, y, r=10):
    """Red/blue glow over an emergency vehicle's light bar so 'flashing lights' reads at phone size."""
    for dy, col in ((-6, "#FF1744"), (6, "#2979FF")):  # eastbound car: red half of the bar is on the north side
        s.top.append(f'<circle cx="{_f(x)}" cy="{_f(y + dy)}" r="{r}" fill="{col}" opacity="0.3"/>')
        s.top.append(f'<circle cx="{_f(x)}" cy="{_f(y + dy)}" r="{r * 0.45}" fill="{col}" opacity="0.6"/>')


def cone(s, x, y):
    s.parts.append(f'<circle cx="{_f(x)}" cy="{_f(y)}" r="5" fill="{ORANGE}" stroke="#FFFFFF" stroke-width="1.6"/>')


def scaled(s, x, y, k, draw):
    """Draw actors at k-times size around (x, y): draw() adds parts at (x, y) as usual."""
    s.parts.append(f'<g transform="translate({_f(x)} {_f(y)}) scale({k}) translate({_f(-x)} {_f(-y)})">')
    draw()
    s.parts.append("</g>")


def warn_diamond(s, x, y, size=16, color=ORANGE):
    s.parts.append(
        f'<rect x="{_f(x - size / 2)}" y="{_f(y - size / 2)}" width="{size}" height="{size}" rx="2" fill="{color}" '
        f'stroke="#1B1F24" stroke-width="1.5" transform="rotate(45 {_f(x)} {_f(y)})"/>'
    )


def flagger(s, x, y, paddle="stop"):
    """Flagger in an orange vest holding a STOP paddle on a short pole (to the flagger's left on screen)."""
    s.line(x - 6, y - 2, x - 15, y - 9, "#1B1F24", 2.5)
    s.parts.append(f'<circle cx="{_f(x)}" cy="{_f(y)}" r="8.5" fill="{ORANGE}" stroke="#FFFFFF" stroke-width="2"/>')
    s.parts.append(f'<circle cx="{_f(x)}" cy="{_f(y)}" r="3.6" fill="#F2C9A0"/>')
    if paddle == "stop":
        s.stop_sign(x - 21, y - 16, 21)
    else:
        warn_diamond(s, x - 19, y - 14, 13)


def tractor(s, x, y, heading=0, label=None):
    """Farm tractor with the orange-and-red slow-moving-vehicle triangle on its back."""
    g = [
        '<rect x="-6" y="-34" width="12" height="26" rx="3" fill="#2E7D32"/>',  # hood
        '<rect x="-9" y="-33" width="4" height="9" rx="1.5" fill="#1B1F24"/><rect x="5" y="-33" width="4" height="9" rx="1.5" fill="#1B1F24"/>',
        '<rect x="-21" y="-6" width="8" height="22" rx="3" fill="#1B1F24"/><rect x="13" y="-6" width="8" height="22" rx="3" fill="#1B1F24"/>',
        '<rect x="-13" y="-11" width="26" height="26" rx="4" fill="#388E3C"/>',  # cab
        '<rect x="-9" y="-7" width="18" height="13" rx="2" fill="#CFE0F5"/>',
        # slow-moving-vehicle emblem (drawn flat behind the tractor so it reads from above)
        '<polygon points="0,19 13,41 -13,41" fill="#C62828"/>',
        '<polygon points="0,24.5 8.6,38.5 -8.6,38.5" fill="#FF8F00"/>',
    ]
    s.parts.append(f'<g transform="translate({_f(x)} {_f(y)}) rotate({heading})">{"".join(g)}</g>')
    if label:
        s.label(x, y + 1, label)


def deer(s, x, y, scale=1.0, facing="left"):
    """Deer silhouette (side view, easier to recognise than from above) standing with its feet at (x, y)."""
    flip = 1 if facing == "left" else -1
    col = "#8D5A2B"
    g = [
        f'<g stroke="{col}" stroke-width="2.6" stroke-linecap="round">'
        '<line x1="-8" y1="-12" x2="-9" y2="0"/><line x1="-4" y1="-12" x2="-3" y2="0"/>'
        '<line x1="6" y1="-12" x2="7" y2="0"/><line x1="9.5" y1="-12" x2="11" y2="0"/></g>',
        f'<ellipse cx="0" cy="-16" rx="13" ry="7" fill="{col}"/>',
        f'<polygon points="-7,-20 -13,-31 -7.5,-33 -1,-19" fill="{col}"/>',
        f'<ellipse cx="-14" cy="-32" rx="5.6" ry="3.4" fill="{col}"/>',
        '<polygon points="-10,-34 -6,-39 -7,-33" fill="#6D4220"/>',
        '<path d="M-12 -35 L-14 -43 M-13 -39 L-18 -42 M-12 -35 L-9 -44" stroke="#EAD9BF" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
        '<ellipse cx="12.5" cy="-19" rx="2.6" ry="3.2" fill="#FFFFFF"/>',
        '<circle cx="-15" cy="-33" r="1" fill="#1B1F24"/>',
    ]
    s.parts.append(f'<g transform="translate({_f(x)} {_f(y)}) scale({_f(flip * scale)} {_f(scale)})">{"".join(g)}</g>')


def headlight_beams(s, x, y_front, length=120, spread=34, color="#FFF3B0", opacity=0.45):
    """Headlight cones for a northbound car whose front bumper is at (x, y_front)."""
    for dx in (-7, 7):
        pts = f"{_f(x + dx - 3)},{_f(y_front)} {_f(x + dx + 3)},{_f(y_front)} {_f(x + dx + spread / 2)},{_f(y_front - length)} {_f(x + dx - spread / 2)},{_f(y_front - length)}"
        s.parts.append(f'<polygon points="{pts}" fill="{color}" opacity="{opacity}"/>')


def bike_symbol(s, x, y):
    """White bicycle pavement marking."""
    s.parts.append(
        f'<g transform="translate({_f(x)} {_f(y)})" stroke="{WHITE}" stroke-width="1.6" fill="none">'
        '<circle cx="-5" cy="0" r="3.6"/><circle cx="5" cy="0" r="3.6"/>'
        '<path d="M-5 0 L-1 -5 L4 -5 L5 0 M-1 -5 L1 0"/></g>'
    )


def car_door_open(s, x, y, side="left", angle=55):
    """Open driver door on a northbound parked car centered at (x, y) (car body 23 x 46)."""
    hx = x - 11.5 if side == "left" else x + 11.5
    hy = y - 10
    rot = angle if side == "left" else -angle
    s.parts.append(
        f'<g transform="translate({_f(hx)} {_f(hy)}) rotate({rot})">'
        '<rect x="-4" y="0" width="5" height="21" rx="2" fill="#2F6FD8" stroke="#1B1F24" stroke-width="1.2"/></g>'
    )


def rr_gate(s, post_x, post_y, arm_to_x, lights=True):
    """Railroad crossing gate: post at (post_x, post_y), striped arm lowered horizontally to arm_to_x."""
    s.line(post_x, post_y, arm_to_x, post_y, WHITE, 5, top=False)
    s.line(post_x, post_y, arm_to_x, post_y, "#D32F2F", 5, "6 6")
    s.parts.append(f'<circle cx="{_f(post_x)}" cy="{_f(post_y)}" r="5" fill="#1B1F24" stroke="#FFFFFF" stroke-width="1.2"/>')
    if lights:
        side = 1 if post_x > arm_to_x else -1
        lx = post_x + side * 13
        for dy in (-6, 6):
            s.parts.append(f'<circle cx="{_f(lx)}" cy="{_f(post_y + dy)}" r="9" fill="#FF1744" opacity="0.28"/>')
            s.parts.append(f'<circle cx="{_f(lx)}" cy="{_f(post_y + dy)}" r="4" fill="#FF1744" stroke="#1B1F24" stroke-width="1"/>')
        # crossbuck
        cx, cy = lx + side * 14, post_y
        for a in (35, -35):
            s.parts.append(
                f'<rect x="{_f(cx - 11)}" y="{_f(cy - 2.6)}" width="22" height="5.2" fill="#FFFFFF" stroke="#1B1F24" stroke-width="1" transform="rotate({a} {_f(cx)} {_f(cy)})"/>'
            )


def inset_slope(s, text, uphill=True, curb=True, x=10, y=10, w=150, h=84):
    """Side-view inset: the car on a hill, facing right (east, same as the main picture)."""
    s.top.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="9" fill="#FFFFFF" stroke="#1B1F24" stroke-width="1.5" opacity="0.97"/>')
    s.top.append(f'<text x="{_f(x + w / 2)}" y="{y + 17}" font-family="sans-serif" font-size="12.5" font-weight="bold" fill="#1B1F24" text-anchor="middle">{text}</text>')
    gx1, gx2 = x + 8, x + w - 8
    gb = y + h - 8
    rise = 30
    yl, yr = (gb, gb - rise) if uphill else (gb - rise, gb)
    s.top.append(f'<polygon points="{gx1},{yl} {gx2},{yr} {gx2},{gb} {gx1},{gb}" fill="{GRASS_DARK}"/>')
    s.top.append(f'<line x1="{gx1}" y1="{yl}" x2="{gx2}" y2="{yr}" stroke="{ASPHALT}" stroke-width="4"/>')
    ang = math.degrees(math.atan2(yr - yl, gx2 - gx1))
    mx = (gx1 + gx2) / 2
    my = (yl + yr) / 2 - 2
    car = (
        '<rect x="-24" y="-15" width="48" height="11" rx="4" fill="#2F6FD8"/>'
        '<path d="M-12 -15 L-7 -24 L9 -24 L15 -15 Z" fill="#2F6FD8"/>'
        '<path d="M-9 -16 L-5 -22 L7 -22 L11 -16 Z" fill="#CFE0F5"/>'
        '<circle cx="-14" cy="-3" r="5" fill="#1B1F24"/><circle cx="14" cy="-3" r="5" fill="#1B1F24"/>'
        '<rect x="21" y="-13" width="4" height="4" rx="1" fill="#FFE082"/>'
    )
    s.top.append(f'<g transform="translate({_f(mx)} {_f(my)}) rotate({_f(ang)})">{car}</g>')


def hill_parking(wheels, inset_text, uphill, curb=True):
    """Zoomed top-down view of car A parked at the right edge, facing east, plus a side-view slope inset."""
    s = Scene().grass()
    s.rect(0, 26, W, 188, ASPHALT)
    s.line(0, 90, W, 90, YELLOW, 2.5, "12 10")
    if curb:
        s.rect(0, 214, W, 8, CURB)
        s.rect(0, 222, W, 24, SIDEWALK)
        s.line(0, 214, W, 214, "#9C9488", 1.5)
    else:
        s.line(0, 211, W, 211, WHITE, 2.5)
        s.rect(0, 214, W, 22, GRAVEL)
    cx, cy, k = 196, 184, 2.0
    if not curb:
        cy = 192
    scaled(s, cx, cy, k, lambda: s.car(cx, cy, 90, wheels=wheels))
    # highlight the front wheels
    fx = cx + 12 * k
    for wy in (cy - 12.5 * k, cy + 12.5 * k):
        s.top.append(f'<circle cx="{_f(fx)}" cy="{_f(wy)}" r="15" fill="none" stroke="#FFD54F" stroke-width="3" stroke-dasharray="5 3"/>')
    s.label(cx - 30, cy, "A")
    s.label(56, 238 if curb else 236, "CURB" if curb else "NO CURB")
    inset_slope(s, inset_text, uphill=uphill, curb=curb)
    return s


# --------------------------------------------------------------------------- scenes
def school_bus_behind():
    s = Scene().grass().road_h(CY, 1, "dashed-yellow")
    s.school_bus_stopped(CX + 40, LE, 90, arm=True, lights="red")
    s.car(CX - 78, LE, 90, label="A", brake=True)
    s.pedestrian(CX + 94, LE + 4)
    s.pedestrian(CX + 98, LW, "#E8930C")
    return zoom(s, 1.4, CX + 4, CY)


def move_over():
    s = Scene().grass()
    top, lane2, edge, sh_bot = 92, 120, 148, 178
    s.rect(0, top, W, sh_bot - top, ASPHALT)
    s.rect(0, edge, W, sh_bot - edge, SHOULDER)
    s.line(0, top + 1.5, W, top + 1.5, YELLOW, 2.5)
    s.line(0, lane2, W, lane2, WHITE, 2, "14 12")
    s.line(0, edge, W, edge, WHITE, 2.5)
    s.car(316, 163, 90, color=GREY_CAR, turn_signal="hazard")
    s.car(250, 163, 90, kind="police")
    light_glow(s, 250 + 28 - 21.5, 163)  # light bar sits 21.5 px behind the front of a 56 px police car
    s.car(118, (lane2 + edge) / 2, 90, label="A")
    s.path(f"M146 {(lane2 + edge) / 2} C170 {(lane2 + edge) / 2} 178 {(top + lane2) / 2} 206 {(top + lane2) / 2} L244 {(top + lane2) / 2}", BLUE)
    return zoom(s, 1.3, 204, 135)


def truck_no_zones():
    s = Scene().grass()
    t, b = 93, 177
    s.rect(0, t, W, b - t, ASPHALT)
    s.line(0, t + 1.5, W, t + 1.5, YELLOW, 2.5)
    s.line(0, b - 1.5, W, b - 1.5, WHITE, 2.5)
    for yy in (t + LANE, t + 2 * LANE):
        s.line(0, yy, W, yy, WHITE, 2, "14 12")
    mid = t + 1.5 * LANE  # center lane
    tx = CX  # truck spans tx-46 .. tx+46, cab at the east end
    no_zone(s, [(tx + 48, t + LANE + 1), (tx + 118, t + LANE + 1), (tx + 118, t + 2 * LANE - 1), (tx + 48, t + 2 * LANE - 1)])  # front
    no_zone(s, [(tx - 48, t + LANE + 1), (tx - 140, t + LANE + 1), (tx - 140, t + 2 * LANE - 1), (tx - 48, t + 2 * LANE - 1)])  # rear
    no_zone(s, [(tx + 30, t + 3), (tx + 30, t + LANE - 1), (tx - 14, t + LANE - 1), (tx - 14, t + 3)])  # left, by the cab
    no_zone(s, [(tx + 40, t + 2 * LANE + 1), (tx + 40, b - 3), (tx - 92, b - 3), (tx - 40, t + 2 * LANE + 1)])  # right, large
    s.car(tx, mid, 90, kind="truck", color="#E5484D")
    s.car(tx - 6, t + 2.5 * LANE, 90, label="A")
    s.car(tx - 98, t + 0.5 * LANE, 90, color="#11994B", label="B")
    return zoom(s, 1.3, CX - 8, CY)


def pass_bicycle():
    s = Scene().grass().road_v(CX, 1, "dashed-yellow")
    s.bicycle(CX + LANE - 8, CY - 8, 0)
    s.label(CX + LANE + 12, CY - 8, "C", color="#11994B")
    s.car(LN, CY + 74, 0, label="A")
    s.car(LS, CY - 72, 180, label="B")
    s.path(f"M{LS} {CY - 44} L{LS} {CY + 6}", RED)
    return zoom(s, 1.3, CX, CY - 4)


def right_turn_bike_lane():
    s = Scene().grass().road_h(CY, 1, "dashed-yellow")
    half = ROAD / 2
    bl = 18  # bike lane width
    x0, x1 = CX - half, CX + half + bl
    s.rect(x0 - 6, 0, 6, H, SIDEWALK)
    s.rect(x1, 0, 6, H, SIDEWALK)
    s.rect(x0, 0, x1 - x0, H, ASPHALT)
    for ya, yb in ((0, CY - half), (CY + half, H)):
        s.line(CX, ya, CX, yb, YELLOW, 2.5, "12 10")
        s.line(CX + half, ya, CX + half, yb, WHITE, 2.2)
    s.rect(x0, CY - half, x1 - x0, ROAD, ASPHALT)
    s.rect(x1, CY - half, 6, ROAD, ASPHALT)
    s.rect(x0 - 6, CY - half, 6, ROAD, ASPHALT)
    s.line(CX, CY + half + 4, x1, CY + half + 4, WHITE, 3.5)
    s.line(x0, CY - half - 4, CX, CY - half - 4, WHITE, 3.5)
    bike_symbol(s, CX + half + bl / 2, H - 14)
    bike_symbol(s, CX + half + bl / 2, 20)
    bx = CX + half + bl / 2
    s.car(LN, CY + half + 30, 0, label="A", turn_signal="right")
    s.bicycle(bx, CY + half + 66, 0)
    s.label(bx + 20, CY + half + 66, "B")
    s.path(f"M{LN} {CY + half + 2} Q{LN + 2} {LE} {x1 + 40} {LE}", BLUE)
    s.path(f"M{bx} {CY + half + 44} L{bx} {CY - half - 22}", GREEN)
    return zoom(s, 1.25, CX + 14, CY + 22)


def dooring():
    s = Scene().grass()
    # from west to east: southbound lane, northbound lane, bike lane, parking lane, curb + sidewalk
    sb0, ctr, nb1, bk1, pk1 = 96, 124, 152, 172, 204
    s.rect(sb0, 0, pk1 - sb0, H, ASPHALT)
    s.rect(sb0 - 6, 0, 6, H, SIDEWALK)
    s.rect(pk1, 0, 6, H, CURB)
    s.rect(pk1 + 6, 0, 22, H, SIDEWALK)
    s.line(ctr, 0, ctr, H, YELLOW, 2.5, "12 10")
    s.line(nb1, 0, nb1, H, WHITE, 2.2)
    s.line(bk1, 0, bk1, H, WHITE, 2.2)
    bike_symbol(s, (nb1 + bk1) / 2, 22)
    px = (bk1 + pk1) / 2 + 2
    s.car(px, CY - 76, 0, color=GREY_CAR)
    s.car(px, CY + 82, 0, color=GREY_CAR)
    bx = (nb1 + bk1) / 2
    s.zone([(nb1 + 1, CY - 14), (bk1, CY - 14), (bk1, CY + 8), (nb1 + 1, CY + 8)], "#FF1744", 0.3)
    car_door_open(s, px, CY, "left", 62)
    s.car(px, CY, 0, label="A")
    s.bicycle(bx, CY + 64, 0)
    s.label(bx - 22, CY + 64, "B")
    s.path(f"M{bx} {CY + 42} L{bx} {CY + 16}", GREEN)
    return zoom(s, 1.4, 160, CY)


def railroad_gates():
    s = Scene().grass().road_v(CX, 1, "dashed-yellow")
    ty = CY - 34
    s.rail_tracks_h(ty)
    s.train(ty, -10, 104)
    # gates: northbound gate south of the tracks on the east side, southbound gate north of the tracks on the west side
    rr_gate(s, CX + ROAD / 2 + 8, ty + 30, CX + 2)
    rr_gate(s, CX - ROAD / 2 - 8, ty - 30, CX - 2)
    s.line(CX, ty + 46, CX + ROAD / 2, ty + 46, WHITE, 3.5)
    s.car(LN, ty + 82, 0, label="A", brake=True)
    s.path("M112 " + _f(ty) + " L140 " + _f(ty), RED)
    return zoom(s, 1.3, CX - 10, CY + 4)


def freeway_merge():
    s = Scene().grass()
    t = 62
    l1, l2, acc = t + LANE, t + 2 * LANE, t + 3 * LANE  # lane boundaries
    s.rect(0, t, W, 2 * LANE, ASPHALT)
    # on-ramp curving up into the acceleration lane
    s.parts.append(f'<path d="M-30 292 C10 220 30 {acc - LANE / 2} 110 {acc - LANE / 2}" stroke="{ASPHALT}" stroke-width="{LANE}" fill="none"/>')
    s.rect(100, l2, 170, LANE, ASPHALT)
    s.parts.append(f'<polygon points="270,{l2} 340,{l2} 270,{acc}" fill="{ASPHALT}"/>')
    s.line(0, t + 1.5, W, t + 1.5, YELLOW, 2.5)
    s.line(0, l1, W, l1, WHITE, 2, "14 12")
    s.line(0, l2, 104, l2, WHITE, 2.5)
    s.line(104, l2, 268, l2, WHITE, 2, "6 8")
    s.line(340, l2, W, l2, WHITE, 2.5)
    s.line(110, acc - 1, 270, acc - 1, WHITE, 2.5)
    s.line(270, acc - 1, 340, l2 + 1, WHITE, 2.5)
    s.car(296, (l1 + l2) / 2, 90, label="B")
    s.car(58, (l1 + l2) / 2, 90, label="C", color="#11994B")
    s.car(150, (l2 + acc) / 2, 90, label="A", turn_signal="left")
    s.path(f"M176 {(l2 + acc) / 2} C204 {(l2 + acc) / 2} 214 {(l1 + l2) / 2} 246 {(l1 + l2) / 2}", BLUE)
    return zoom(s, 1.12, 190, 122)


def blind_spot():
    s = Scene().grass()
    x0, x1 = CX - LANE, CX + LANE
    s.rect(x0 - 6, 0, 6, H, SIDEWALK)
    s.rect(x1, 0, 6, H, SIDEWALK)
    s.rect(x0, 0, x1 - x0, H, ASPHALT)
    s.line(x0 + 1.5, 0, x0 + 1.5, H, YELLOW, 2.5)
    s.line(CX, 0, CX, H, WHITE, 2, "14 12")
    ay = CY - 10
    s.zone([(x0 + 3, ay - 4), (CX - 2, ay - 4), (CX - 2, ay + 70), (x0 + 3, ay + 70)], "#FFB300", 0.4)
    s.car(Scene.lane_x("north"), ay, 0, label="A", turn_signal="left")
    s.car(Scene.lane_x("south"), ay + 33, 0, label="B", color=RED)
    s.path(f"M{Scene.lane_x('north')} {ay - 26} C{Scene.lane_x('north')} {ay - 50} {Scene.lane_x('south')} {ay - 52} {Scene.lane_x('south')} {ay - 78}", BLUE)
    return zoom(s, 1.45, CX, CY + 2)


def two_lane_passing(a_side):
    """A northbound behind slower B. a_side = marking on A's (east) half: 'solid' or 'dashed'."""
    s = Scene().grass()
    half = ROAD / 2
    s.rect(CX - half - 6, 0, 6, H, SIDEWALK)
    s.rect(CX + half, 0, 6, H, SIDEWALK)
    s.rect(CX - half, 0, ROAD, H, ASPHALT)
    other = "dashed" if a_side == "solid" else "solid"
    center_v(s, CX, west=other, east=a_side)
    s.car(LN, CY + 8, 0, label="B", color=RED)
    s.car(LN, CY + 72, 0, label="A")
    if a_side == "dashed":
        # out into the left lane, past B, and back only once B is well behind (about two car lengths)
        s.path(f"M{LN} {CY + 46} C{LN} {CY + 30} {LS} {CY + 32} {LS} {CY + 14} L{LS} {CY - 58} C{LS} {CY - 76} {LN} {CY - 78} {LN} {CY - 98}", BLUE)
    return zoom(s, 1.2, CX, CY - 12)


def following_distance():
    s = Scene().grass().road_h(CY, 1, "dashed-yellow")
    post = 236
    s.tree(post, CY + ROAD / 2 + 22, 13)
    s.line(post, CY + 2, post, CY + ROAD / 2, "#FFFFFF", 2, "4 4", top=True)
    s.car(post + 28, LE, 90, label="B", color=RED)
    s.car(120, LE, 90, label="A")
    # measuring bracket from A's front bumper to the tree
    yb = CY + ROAD / 2 + 26
    s.line(146, yb, post - 16, yb, "#1B1F24", 2, top=True)
    s.line(146, yb - 6, 146, yb + 6, "#1B1F24", 2, top=True)
    s.label(186, yb + 22, "COUNT SECONDS")
    return zoom(s, 1.3, CX + 10, CY + 14)


def flagger_stop():
    s = Scene().grass().road_v(CX, 1, "dashed-yellow")
    # northbound lane closed ahead by a work area with a cone taper
    s.rect(CX + 3, 0, LANE - 3, 62, "#FFB74D", opacity=0.6)
    s.pedestrian(CX + 17, 30, ORANGE)  # road worker inside the closed lane
    for i, y in enumerate((122, 102, 82, 62)):
        cone(s, CX + LANE - 5 - i * 6.5, y)
    for y in (44, 24, 4):
        cone(s, CX + 6, y)
    warn_diamond(s, CX + ROAD / 2 + 22, H - 40, 18)
    flagger(s, CX + ROAD / 2 + 12, CY + 18)
    s.car(LN, CY + 72, 0, label="A", brake=True)
    return zoom(s, 1.15, CX + 14, CY - 4)


def slow_moving_vehicle():
    s = Scene().grass().road_v(CX, 1, "dashed-yellow")
    scaled(s, LN + 1, CY - 40, 0.82, lambda: tractor(s, LN + 1, CY - 40, 0))
    s.label(LN + 1, CY - 39, "B")
    s.car(LN, CY + 82, 0, label="A")
    return zoom(s, 1.3, CX + 6, CY + 10)


def deer_dusk():
    s = Scene().grass().road_v(CX, 1, "dashed-yellow")
    for (x, y) in ((70, 60), (300, 210), (60, 220), (310, 40)):
        s.tree(x, y, 16)
    s.rect(0, 0, W, H, "#1A2340", opacity=0.42)
    ay = CY + 78
    headlight_beams(s, LN, ay - 23, length=150, spread=46)
    s.car(LN, ay, 0, label="A")
    deer(s, CX + ROAD / 2 + 16, CY - 20, 1.25)
    deer(s, CX + ROAD / 2 + 62, CY - 54, 1.0)
    return zoom(s, 1.2, CX + 10, CY)


def park_uphill_curb():
    return hill_parking(-32, "FACING UPHILL", uphill=True, curb=True)


def park_downhill_curb():
    return hill_parking(32, "FACING DOWNHILL", uphill=False, curb=True)


def park_uphill_no_curb():
    return hill_parking(32, "FACING UPHILL", uphill=True, curb=False)


SCENES = [
    ("SCN-SCHOOL-BUS-BEHIND", "Behind a stopped school bus",
     "Car A is behind a school bus that is stopped in the same lane with red lights flashing and its stop arm out while children cross the road in front of it.", school_bus_behind),
    ("SCN-MOVE-OVER-POLICE", "Police car stopped on the shoulder",
     "A police car with flashing lights is stopped on the right shoulder of a two-lane one-way roadway behind a pulled-over car; car A, in the right lane, moves over to the left lane.", move_over),
    ("SCN-TRUCK-NO-ZONES", "Large truck No-Zones",
     "Shaded areas mark a large truck's No-Zones (front, rear and both sides); car A is beside the truck in its right-side No-Zone and car B is in the left lane well behind the truck.", truck_no_zones),
    ("SCN-PASS-BICYCLE", "Passing a bicyclist on a two-lane road",
     "On a two-lane road, car A is behind bicyclist C riding near the right edge while car B approaches in the oncoming lane.", pass_bicycle),
    ("SCN-RIGHT-TURN-BIKE-LANE", "Right turn across a bike lane",
     "Car A is signaling to turn right at an intersection while bicyclist B rides straight ahead in the bike lane on A's right.", right_turn_bike_lane),
    ("SCN-DOOR-BIKE-LANE", "Car door opening into a bike lane",
     "Parked car A has its driver door open into the bike lane while bicyclist B rides toward the door.", dooring),
    ("SCN-RAILROAD-GATES-DOWN", "Railroad crossing with gates down",
     "At a railroad crossing the red lights are flashing and the gates are down while a train approaches; car A is stopped before the stop line.", railroad_gates),
    ("SCN-FREEWAY-MERGE", "Merging onto a freeway",
     "Car A is in the acceleration lane of a freeway on-ramp, signaling left to merge into the gap between car C and car B in the right lane.", freeway_merge),
    ("SCN-BLIND-SPOT-LANE-CHANGE", "Car in the blind spot",
     "Car A is signaling to move into the left lane while car B is beside and slightly behind it in A's blind spot (shaded).", blind_spot),
    ("SCN-NO-PASSING-SOLID-YELLOW", "Solid yellow line on your side",
     "Car A is following slower car B on a two-lane road; the center line is solid yellow on A's side and broken yellow on the other side.", lambda: two_lane_passing("solid")),
    ("SCN-PASSING-BROKEN-YELLOW", "Broken yellow line on your side",
     "Car A is following slower car B on a two-lane road; the center line is broken yellow on A's side and solid on the other side, and an arrow shows A passing B.", lambda: two_lane_passing("dashed")),
    ("SCN-FOLLOWING-DISTANCE", "Counting following distance",
     "Car B has just passed a roadside tree; car A, behind B, counts the seconds until it reaches the same tree.", following_distance),
    ("SCN-PARK-UPHILL-CURB", "Parked uphill with a curb",
     "Car A is parked facing uphill next to a curb with its front wheels turned away from the curb (to the left).", park_uphill_curb),
    ("SCN-PARK-DOWNHILL-CURB", "Parked downhill with a curb",
     "Car A is parked facing downhill next to a curb with its front wheels turned toward the curb (to the right).", park_downhill_curb),
    ("SCN-PARK-UPHILL-NO-CURB", "Parked uphill with no curb",
     "Car A is parked facing uphill at the edge of a road with no curb, its front wheels turned toward the edge of the road (to the right).", park_uphill_no_curb),
    ("SCN-FLAGGER-STOP", "Work-zone flagger showing STOP",
     "In a work zone, a flagger at the right side of the road holds a STOP paddle toward car A, which is stopping.", flagger_stop),
    ("SCN-SLOW-MOVING-VEHICLE", "Farm tractor ahead",
     "Car A is behind farm tractor B, which shows an orange-and-red slow-moving-vehicle triangle, on a two-lane road.", slow_moving_vehicle),
    ("SCN-DEER-DUSK", "Deer at the roadside at dusk",
     "At dusk, car A drives with headlights on toward a deer standing at the right edge of the road with another deer behind it in the field.", deer_dusk),
]
