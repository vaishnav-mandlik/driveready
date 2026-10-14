"""Intersection & right-of-way scenario scenes (hand-authored).

Each entry: code, name, meaning (what the scene shows), builder.
Helpers that are specific to these scenes live here so scene.py stays shared and untouched.
"""
import math

from scene import ASPHALT, CURB, CX, CY, LANE, ROAD, SIDEWALK, WHITE, YELLOW, H, W, Scene, _f

HALF = ROAD / 2
GREY_CAR = "#8C949E"  # background traffic that is not part of the question
NB = Scene.lane_x("north")  # x of the northbound lane
SB = Scene.lane_x("south")
EB = Scene.lane_y("east")  # y of the eastbound lane
WB = Scene.lane_y("west")
BLUE, RED, GREEN = "#2F6FD8", "#E5484D", "#11994B"


# ------------------------------------------------------------------ helpers
def stop_signs_all(s, size=13):
    o = HALF + 12
    for dx, dy in ((o, o), (-o, -o), (-o, o), (o, -o)):
        s.stop_sign(CX + dx, CY + dy, size)
    return s


def plain_intersection(s, crosswalks=False):
    """4-way crossing with no stop lines (uncontrolled), optional crosswalks."""
    return s.intersection(crosswalks=crosswalks, stop_lines=False)


def inset(s, x, y, w, h):
    """White rounded call-out card (drawn on top) used to show a signal close up."""
    s.top.append(f'<rect x="{_f(x)}" y="{_f(y)}" width="{_f(w)}" height="{_f(h)}" rx="8" fill="#FFFFFF" stroke="#1B1F24" stroke-width="1.5"/>')
    return s


def big_signal(s, x, y, lit=None, arrow=None, flash=False, dark=False):
    """Large 3-lens head for a call-out. lit: red|yellow|green circular lens.
    arrow: 'flashing-yellow-left' draws a yellow left arrow in the middle lens."""
    cols = ["#E5332A", "#FFB81C", "#13B25B"]
    g = [f'<rect x="{_f(x - 13)}" y="{_f(y - 37)}" width="26" height="74" rx="6" fill="#1F2328"/>']
    for i in range(3):
        cy = y - 23 + i * 23
        on = (lit == ["red", "yellow", "green"][i])
        fill = cols[i] if on else "#3A4048"
        g.append(f'<circle cx="{_f(x)}" cy="{_f(cy)}" r="9" fill="{fill}"/>')
        if on:
            g.append(f'<circle cx="{_f(x)}" cy="{_f(cy)}" r="13" fill="{fill}" opacity="0.25"/>')
    if arrow == "flashing-yellow-left":
        cy = y
        g.append(f'<circle cx="{_f(x)}" cy="{_f(cy)}" r="13" fill="#FFB81C" opacity="0.3"/>')
        g.append(
            f'<polygon points="{_f(x - 8)},{_f(cy)} {_f(x - 1)},{_f(cy - 6.5)} {_f(x - 1)},{_f(cy - 2.5)} {_f(x + 7)},{_f(cy - 2.5)} '
            f'{_f(x + 7)},{_f(cy + 2.5)} {_f(x - 1)},{_f(cy + 2.5)} {_f(x - 1)},{_f(cy + 6.5)}" fill="#FFB81C"/>'
        )
        flash = True
        fy = cy
    else:
        fy = y - 23 + ["red", "yellow", "green"].index(lit) * 23 if lit else y
    if flash:
        for sx in (-1, 1):
            for dy in (-7, 0, 7):
                g.append(
                    f'<line x1="{_f(x + sx * 17)}" y1="{_f(fy + dy * 0.9)}" x2="{_f(x + sx * 24)}" y2="{_f(fy + dy * 1.6)}" '
                    'stroke="#FFB81C" stroke-width="2.2" stroke-linecap="round"/>'
                )
    if dark:
        g.append(f'<line x1="{_f(x - 18)}" y1="{_f(y - 42)}" x2="{_f(x + 18)}" y2="{_f(y + 42)}" stroke="#E53935" stroke-width="3" stroke-linecap="round"/>')
    s.top.append("".join(g))
    return s


def zoom(s, k, fx, fy):
    """Magnify the whole scene by k so that point (fx, fy) lands at the canvas center."""
    t = f'<g transform="translate({_f(CX)} {_f(CY)}) scale({k}) translate({_f(-fx)} {_f(-fy)})">'
    s.parts[:] = [t, *s.parts, "</g>"]
    s.top[:] = [t, *s.top, "</g>"]
    return s


def caption(s, x, y, text, size=11, color="#1B1F24", anchor="middle"):
    s.top.append(
        f'<text x="{_f(x)}" y="{_f(y)}" font-family="sans-serif" font-size="{size}" font-weight="bold" fill="{color}" text-anchor="{anchor}">{text}</text>'
    )
    return s


def motion_lines(s, x, y, heading, length=46):
    """Three short speed streaks behind a vehicle (it is still moving)."""
    a = math.radians(heading)
    fx, fy = math.sin(a), -math.cos(a)  # forward
    px, py = math.cos(a), math.sin(a)  # perpendicular
    for off, ln in ((-6, 12), (0, 18), (6, 12)):
        bx = x - fx * (length / 2 + 4) + px * off
        by = y - fy * (length / 2 + 4) + py * off
        s.top.append(
            f'<line x1="{_f(bx)}" y1="{_f(by)}" x2="{_f(bx - fx * ln)}" y2="{_f(by - fy * ln)}" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" opacity="0.9"/>'
        )
    return s


def cane_pedestrian(s, x, y, dx=1):
    """Pedestrian holding a long white cane with a red tip (pointing toward dx)."""
    s.pedestrian(x, y)
    tx, ty = x + dx * 17, y + 10
    s.parts.append(f'<line x1="{_f(x + dx * 5)}" y1="{_f(y + 2)}" x2="{_f(tx)}" y2="{_f(ty)}" stroke="#1B1F24" stroke-width="4.4" stroke-linecap="round"/>')
    s.parts.append(f'<line x1="{_f(x + dx * 5)}" y1="{_f(y + 2)}" x2="{_f(tx)}" y2="{_f(ty)}" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round"/>')
    s.parts.append(f'<line x1="{_f(x + dx * 14)}" y1="{_f(y + 8.2)}" x2="{_f(tx)}" y2="{_f(ty)}" stroke="#E53935" stroke-width="2.8" stroke-linecap="round"/>')
    return s


def walk_arrow(s, x1, y1, x2, y2, color="#5A3E8C"):
    """Short solid arrow showing a pedestrian's walking direction."""
    s.top.append(f'<line x1="{_f(x1)}" y1="{_f(y1)}" x2="{_f(x2)}" y2="{_f(y2)}" stroke="{color}" stroke-width="2.6" stroke-linecap="round"/>')
    ang = math.atan2(y2 - y1, x2 - x1)
    a, b = ang + math.radians(150), ang - math.radians(150)
    s.top.append(
        f'<polygon points="{_f(x2)},{_f(y2)} {_f(x2 + 8 * math.cos(a))},{_f(y2 + 8 * math.sin(a))} {_f(x2 + 8 * math.cos(b))},{_f(y2 + 8 * math.sin(b))}" fill="{color}"/>'
    )
    return s


def x_mark(s, x, y, r=7):
    s.top.append(f'<circle cx="{_f(x)}" cy="{_f(y)}" r="{r + 4}" fill="#FFFFFF" stroke="#E53935" stroke-width="2"/>')
    s.top.append(f'<line x1="{_f(x - r * .6)}" y1="{_f(y - r * .6)}" x2="{_f(x + r * .6)}" y2="{_f(y + r * .6)}" stroke="#E53935" stroke-width="3" stroke-linecap="round"/>')
    s.top.append(f'<line x1="{_f(x - r * .6)}" y1="{_f(y + r * .6)}" x2="{_f(x + r * .6)}" y2="{_f(y - r * .6)}" stroke="#E53935" stroke-width="3" stroke-linecap="round"/>')
    return s


# ------------------------------------------------------------------ scenes
def four_way_first_arrival():
    s = stop_signs_all(Scene().grass().intersection())
    s.car(NB, CY + HALF + 30, 0, label="A", brake=True)
    bx = CX + HALF + 92
    s.car(bx, WB, 270, label="B")
    motion_lines(s, bx, WB, 270)
    s.path(f"M{NB} {CY + 12} L{NB} {CY - 54}", BLUE)
    return s


def four_way_left_vs_straight():
    s = stop_signs_all(Scene().grass().intersection())
    s.car(NB, CY + HALF + 30, 0, label="A", turn_signal="left", brake=True)
    s.car(SB, CY - HALF - 30, 180, label="B", brake=True)
    s.path(f"M{NB} {CY + 12} Q{NB} {WB} {CX - 44} {WB}", BLUE)
    s.path(f"M{SB} {CY - 14} L{SB} {CY + 60}", RED)
    return s


def uncontrolled_right():
    s = plain_intersection(Scene().grass())
    s.car(CX - HALF - 30, EB, 90, label="A")
    s.car(NB, CY + HALF + 30, 0, label="B")
    s.path(f"M{CX - 12} {EB} L{CX + 56} {EB}", BLUE)
    s.path(f"M{NB} {CY + 12} L{NB} {CY - 56}", RED)
    return s


def t_intersection():
    s = Scene().grass().road_h(CY, 1, "dashed-yellow")
    s.road_v(CX, 1, "dashed-yellow", y1=CY + HALF, y2=H)
    s.rect(CX - HALF, CY + HALF - 1, ROAD, 8, ASPHALT)  # open the sidewalk where the side road meets
    s.car(NB, CY + HALF + 32, 0, label="A", turn_signal="left")
    s.car(CX + 110, WB, 270, label="B")
    s.path(f"M{NB} {CY + HALF + 6} Q{NB} {WB} {CX - 60} {WB}", BLUE)
    s.path(f"M{CX + 84} {WB} L{CX + 30} {WB}", RED)
    return s


def flashing_yellow_arrow():
    s = Scene().grass().intersection()
    s.car(NB, CY + HALF + 30, 0, label="A", turn_signal="left")
    s.car(SB, CY - HALF - 30, 180, label="B")
    s.path(f"M{NB} {CY + 12} Q{NB} {WB} {CX - 40} {WB}", BLUE)
    s.path(f"M{SB} {CY - 14} L{SB} {CY + 56}", RED)
    inset(s, 268, 14, 80, 108)
    big_signal(s, 308, 64, arrow="flashing-yellow-left")
    caption(s, 308, 116, "A's signal", 10)
    return s


def right_on_red_ped():
    s = Scene().grass().intersection(crosswalks=True)
    s.signal(CX + HALF + 14, CY - HALF - 22, "red", 0)
    s.car(NB, CY + HALF + 46, 0, label="A", turn_signal="right", brake=True)
    s.pedestrian(CX + 10, CY + HALF + 10)
    walk_arrow(s, CX - 1, CY + HALF + 10, CX - 22, CY + HALF + 10)
    inset(s, 268, 14, 80, 108)
    big_signal(s, 308, 64, lit="red")
    caption(s, 308, 116, "A's signal", 10)
    return s


def right_turn_ped_crossing():
    s = Scene().grass().intersection(crosswalks=True)
    s.signal(CX + HALF + 14, CY - HALF - 22, "green", 0)
    s.car(NB, CY + HALF + 46, 0, label="A", turn_signal="right")
    s.path(f"M{NB} {CY + HALF + 16} Q{NB} {EB} {CX + HALF + 50} {EB}", BLUE)
    ped = Scene().pedestrian(CX + HALF + 10, CY + 14)
    s.top.extend(ped.parts)
    walk_arrow(s, CX + HALF + 10, CY + 3, CX + HALF + 10, CY - 18)
    return s


def gridlock_blocked():
    s = Scene().grass().intersection()
    s.signal(CX + HALF + 14, CY - HALF - 22, "green", 0)
    for i, y in enumerate((CY - HALF - 28, CY - HALF - 80, CY - HALF - 132)):
        s.car(NB, y, 0, color=GREY_CAR, brake=True)
    s.car(NB, CY + HALF + 30, 0, label="A")
    s.car(CX - HALF - 30, EB, 90, label="B", brake=True)
    s.zone([(CX, CY - HALF), (CX + HALF, CY - HALF), (CX + HALF, CY + HALF), (CX, CY + HALF)], "#E53935", 0.22)
    s.path(f"M{CX - HALF - 4} {EB} L{CX + 80} {EB}", RED)
    inset(s, 268, 14, 80, 108)
    big_signal(s, 308, 64, lit="green")
    caption(s, 308, 116, "A's signal", 10)
    return s


def signal_dark():
    s = Scene().grass().intersection()
    o = HALF + 14
    s.signal(CX + o, CY - o - 6, "off", 180)
    s.signal(CX - o - 6, CY - o, "off", 90)
    s.car(NB, CY + HALF + 30, 0, label="A", brake=True)
    s.car(CX + HALF + 32, WB, 270, label="B", brake=True)
    inset(s, 12, 14, 80, 108)
    big_signal(s, 52, 64, dark=True)
    caption(s, 52, 116, "Power out", 10)
    return s


def roundabout_path():
    s = Scene().grass().roundabout()
    r = 72  # circulating lane radius
    # path from the south entry, counter-clockwise (east, north) to the west exit
    pts = []
    for th in range(160, -64, -4):
        t = math.radians(th)
        pts.append((CX + r * math.sin(t), CY - r * math.cos(t)))
    d = f"M{NB} {H - 2} Q{NB} {CY + 84} {_f(pts[0][0])} {_f(pts[0][1])} "
    d += " ".join(f"L{_f(px)} {_f(py)}" for px, py in pts[1:])
    d += f" Q{CX - 96} {WB} {CX - 132} {WB} L4 {WB}"
    s.path(d, BLUE)
    # car A circulating near the north-west, signalling right for its exit
    th = 312
    t = math.radians(th)
    s.car(CX + r * math.sin(t), CY - r * math.cos(t), th - 90, label="A", turn_signal="right")
    return s


def center_turn_lane():
    s = Scene().grass()
    y0 = CY + 16
    half = LANE * 1.5
    dx = 158  # driveway on the north side
    s.rect(0, y0 - half - 6, W, 6, SIDEWALK)
    s.rect(0, y0 + half, W, 6, SIDEWALK)
    s.rect(dx - 24, 0, 48, y0 - half, "#CFC8BC")
    s.rect(0, y0 - half, W, 2 * half, ASPHALT)
    for yy, inner in ((y0 - LANE / 2, 1), (y0 + LANE / 2, -1)):
        s.line(0, yy - inner * 2.5, W, yy - inner * 2.5, YELLOW, 2)  # solid (travel-lane side)
        s.line(0, yy + inner * 2.5, W, yy + inner * 2.5, YELLOW, 2, "12 10")  # broken (center-lane side)
    # two-way left-turn arrows in the center lane
    for ax, east in ((236, True), (280, False)):
        if east:  # eastbound left turn: east, then north
            d = f"M{ax - 16} {y0 + 5} L{ax + 2} {y0 + 5} L{ax + 2} {y0 - 3}"
            head = f"{ax + 2},{y0 - 10} {ax - 3},{y0 - 3} {ax + 7},{y0 - 3}"
        else:  # westbound left turn: west, then south
            d = f"M{ax + 16} {y0 - 5} L{ax - 2} {y0 - 5} L{ax - 2} {y0 + 3}"
            head = f"{ax - 2},{y0 + 10} {ax - 7},{y0 + 3} {ax + 3},{y0 + 3}"
        s.parts.append(f'<path d="{d}" stroke="{WHITE}" stroke-width="3" fill="none"/>')
        s.parts.append(f'<polygon points="{head}" fill="{WHITE}"/>')
    s.car(dx - 44, y0, 90, label="A", turn_signal="left", brake=True)
    s.car(316, y0 - LANE, 270, label="B")
    s.path(f"M{dx - 18} {y0} Q{dx} {y0} {dx} {y0 - half - 34}", BLUE)
    s.path(f"M{288} {y0 - LANE} L{196} {y0 - LANE}", RED)
    return s


def dual_lane_left():
    s = Scene().grass()
    s.road_h(CY, 2, "double-yellow")
    s.road_v(CX, 2, "double-yellow")
    h2 = ROAD  # half-width of a 4-lane road
    s.rect(CX - h2, CY - h2, 2 * h2, 2 * h2, ASPHALT)
    s.line(CX, CY + h2 + 4, CX + h2, CY + h2 + 4, WHITE, 3.5)  # northbound stop line
    ax = CX + LANE / 2  # left (inner) northbound lane
    s.car(ax, CY + h2 + 30, 0, label="A", turn_signal="left")
    s.car(CX + LANE * 1.5, CY + h2 + 34, 0, label="B")
    # destination lanes on the west leg (westbound = north half)
    s.label(CX - h2 - 40, CY - LANE / 2, "1")
    s.label(CX - h2 - 40, CY - LANE * 1.5, "2")
    s.path(f"M{ax} {CY + h2 - 6} Q{ax} {CY + 6} {CX - 22} {CY + 2}", BLUE)
    s.path(f"M{CX + LANE * 1.5} {CY + h2 - 4} L{CX + LANE * 1.5} {CY - 6}", RED)
    return s


def truck_wide_right():
    s = Scene().grass()
    vx = 282  # cross street (2 lanes each way)
    h2 = ROAD
    s.road_h(CY, 2, "double-yellow")
    s.road_v(vx, 2, "double-yellow")
    s.rect(vx - h2, CY - h2, 2 * h2, 2 * h2, ASPHALT)
    s.line(vx - h2 - 4, CY, vx - h2 - 4, CY + h2, WHITE, 3.5)
    ty = CY + LANE / 2  # truck in the left eastbound lane
    s.car(vx - h2 - 54, ty, 90, kind="truck", color="#E8930C", turn_signal="right")
    gy = CY + LANE * 1.5
    s.zone([(vx - h2 - 102, CY + LANE + 1), (vx - h2 - 2, CY + LANE + 1), (vx - h2 - 2, CY + h2 - 1), (vx - h2 - 102, CY + h2 - 1)], "#E53935", 0.3)
    s.car(vx - h2 - 132, gy, 90, label="A")
    s.path(f"M{vx - h2 + 4} {ty} Q{vx - 18} {ty} {vx - 18} {CY + h2 + 8} L{vx - 18} {H - 6}", "#E8930C")
    return s


def emergency_intersection():
    s = Scene().grass().intersection()
    s.car(NB, CY - 6, 0, label="A")
    s.car(NB, H - 44, 0, kind="firetruck")
    s.path(f"M{NB} {CY - 34} L{NB} {CY - HALF - 18} Q{NB} {CY - HALF - 44} {CX + HALF - 8} {CY - HALF - 60} L{CX + HALF - 8} {CY - HALF - 92}", BLUE)
    return s


def driveway_exit():
    s = Scene().grass()
    ry = 82
    s.road_h(ry, 1, "dashed-yellow", edge=False)
    s.rect(0, ry - LANE - 6, W, 6, SIDEWALK)
    sw_top, sw_bot = ry + LANE, ry + LANE + 26
    s.rect(0, sw_top, W, sw_bot - sw_top, SIDEWALK)
    s.line(0, sw_top + 1, W, sw_top + 1, CURB, 2.5)
    dx = 196
    s.rect(dx - 24, sw_bot, 48, H - sw_bot, "#CFC8BC")
    s.rect(dx - 60, H - 34, 120, 40, "#B07A5A", rx=3)  # house / garage
    s.rect(dx - 26, H - 36, 52, 6, "#8E5E43")
    s.car(dx, sw_bot + 30, 0, label="A", turn_signal="right", brake=True)
    s.pedestrian(dx + 52, sw_top + 13)
    walk_arrow(s, dx + 40, sw_top + 13, dx + 22, sw_top + 13)
    s.car(70, ry + LANE / 2, 90, label="B")
    s.path(f"M{98} {ry + LANE / 2} L{150} {ry + LANE / 2}", RED)
    return s


def white_cane_crosswalk():
    s = Scene().grass().road_v(CX, 1, "dashed-yellow")
    cy = CY - 20
    for i in range(6):
        o = -HALF + 3 + i * (ROAD - 6) / 6
        s.rect(CX + o, cy - 11, 6, 22, WHITE)
    s.line(CX, cy + 22, CX + HALF, cy + 22, WHITE, 3)
    s.line(CX - HALF, cy - 22, CX, cy - 22, WHITE, 3)
    s.rect(CX - HALF - 6, cy - 11, 6, 22, "#C4BDB1")  # curb ramps
    s.rect(CX + HALF, cy - 11, 6, 22, "#C4BDB1")
    cane_pedestrian(s, CX + 14, cy, dx=-1)
    walk_arrow(s, CX - 2, cy - 12, CX - 22, cy - 12)
    s.car(NB, cy + 50, 0, label="A", brake=True)
    return zoom(s, 1.55, CX, CY - 4)


def yield_merge():
    s = Scene().grass()
    ry = 92
    s.road_h(ry, 1, "dashed-yellow")
    # side road coming in at an angle from the lower left, joining the eastbound lane
    ang = 50  # heading of traffic on the side road (degrees clockwise from north)
    a = math.radians(ang)
    jx, jy = 196, ry + LANE  # junction point on the road edge
    L = 260
    ux, uy = math.sin(a), -math.cos(a)  # direction of travel toward the junction
    px, py = math.cos(a), math.sin(a)  # toward the driver's right
    hw = LANE / 2 + 3
    sx, sy = jx - ux * L, jy - uy * L
    s.parts.append(
        f'<polygon points="{_f(sx - px * hw)},{_f(sy - py * hw)} {_f(sx + px * hw)},{_f(sy + py * hw)} '
        f'{_f(jx + px * hw + 16)},{_f(jy + py * hw - 4)} {_f(jx - px * hw - 30)},{_f(jy - py * hw + 2)}" fill="{ASPHALT}"/>'
    )
    s.rect(jx - 70, ry + LANE - 2, 110, 8, ASPHALT)
    # yield line: shark teeth pointing at approaching drivers
    for k in range(-2, 3):
        cx_, cy_ = jx - ux * 30 + px * k * 6.5, jy - uy * 30 + py * k * 6.5
        s.parts.append(
            f'<polygon points="{_f(cx_ - px * 2.6)},{_f(cy_ - py * 2.6)} {_f(cx_ + px * 2.6)},{_f(cy_ + py * 2.6)} {_f(cx_ - ux * 6)},{_f(cy_ - uy * 6)}" fill="{WHITE}"/>'
        )
    ax, ay = jx - ux * 76, jy - uy * 76
    s.car(ax, ay, ang, label="A")
    s.yield_sign(jx - ux * 44 + px * 30, jy - uy * 44 + py * 30, 18)
    s.car(110, ry + LANE / 2, 90, label="B")
    s.path(f"M{138} {ry + LANE / 2} L{238} {ry + LANE / 2}", RED)
    s.path(f"M{_f(ax + ux * 28)} {_f(ay + uy * 28)} Q{_f(jx + 4)} {ry + LANE / 2 + 2} {jx + 78} {ry + LANE / 2}", BLUE)
    return s


def roundabout_yield():
    s = Scene().grass().roundabout()
    r = 70  # circulating lane radius
    # yield line (shark teeth) across the south entry lane, pointing at car A
    ey = CY + 84
    for k in range(4):
        x0 = CX + 2 + k * 6.5
        s.parts.append(f'<polygon points="{_f(x0)},{_f(ey)} {_f(x0 + 5.5)},{_f(ey)} {_f(x0 + 2.75)},{_f(ey + 7)}" fill="{WHITE}"/>')
    s.car(NB, H - 23, 0, label="A", brake=True)
    s.yield_sign(CX + HALF + 14, H - 34, 16)
    # B circulating counterclockwise on the south-west part of the circle, about to pass A's entry
    th = 222
    t = math.radians(th)
    bx, by = CX + r * math.sin(t), CY - r * math.cos(t)
    s.car(bx, by, th - 90, label="B")
    pts = []
    for a in range(th - 22, 120, -4):
        u = math.radians(a)
        pts.append((CX + r * math.sin(u), CY - r * math.cos(u)))
    s.path(f"M{_f(pts[0][0])} {_f(pts[0][1])} " + " ".join(f"L{_f(x)} {_f(y)}" for x, y in pts[1:]), RED)
    return s


SCENES = [
    ("SCN-INT-4WAY-FIRST", "All-way stop: first to arrive goes first",
     "At an all-way stop, car A (heading north) is already stopped at its stop line while car B (heading west, on A's right) is still approaching its stop sign.", four_way_first_arrival),
    ("SCN-INT-4WAY-LEFT-STRAIGHT", "All-way stop: left turn vs. straight",
     "At an all-way stop, car A (heading north, signaling left) and oncoming car B (heading south, going straight) have stopped at the same time.", four_way_left_vs_straight),
    ("SCN-INT-UNCONTROLLED", "Uncontrolled intersection",
     "Car A (heading east) and car B (heading north, on A's right) reach an intersection with no signs or signals at the same time.", uncontrolled_right),
    ("SCN-INT-T-JUNCTION", "T-intersection with no signs",
     "Car A on a side road that ends at a through road is about to turn left, while car B approaches on the through road from A's right; there are no signs or signals.", t_intersection),
    ("SCN-INT-FLASHING-YELLOW-ARROW", "Left turn on a flashing yellow arrow",
     "Car A is turning left on a flashing yellow left arrow (shown in the close-up) while oncoming car B goes straight.", flashing_yellow_arrow),
    ("SCN-INT-RED-RIGHT-PED", "Right turn on red with a pedestrian",
     "Car A is stopped at a red light, signaling a right turn, while a pedestrian walks across the crosswalk directly in front of it.", right_on_red_ped),
    ("SCN-INT-RIGHT-TURN-PED", "Right turn while a pedestrian crosses",
     "Car A has a green light and is turning right while a pedestrian crosses the street A is turning into.", right_turn_ped_crossing),
    ("SCN-INT-GRIDLOCK", "Green light, but no room past the intersection",
     "Car A has a green light, but traffic is backed up right to the far side of the intersection; the shaded area is where A would be stuck, blocking car B, which is waiting on the cross street.", gridlock_blocked),
    ("SCN-INT-SIGNAL-DARK", "Traffic signal out of power",
     "The traffic lights at an intersection are completely dark (power out); car A (heading north) and car B (heading west, on A's right) have both stopped.", signal_dark),
    ("SCN-INT-ROUNDABOUT-PATH", "Driving through a roundabout",
     "Car A entered a roundabout from the south, travels counterclockwise around the center island, and signals right as it nears its exit to the west.", roundabout_path),
    ("SCN-INT-CENTER-TURN-LANE", "Two-way left-turn lane",
     "Car A is stopped in a shared center left-turn lane, signaling a left turn into a driveway, while oncoming car B approaches in its own lane.", center_turn_lane),
    ("SCN-INT-DUAL-LEFT", "Left turn onto a multi-lane road",
     "Car A is in the left lane of a road with two lanes each way and is turning left onto another two-lane-each-way road; its destination lanes are marked 1 (next to the center line) and 2.", dual_lane_left),
    ("SCN-INT-TRUCK-RIGHT", "Truck making a wide right turn",
     "A large truck is signaling a right turn from the left lane so it can swing wide; car A is coming up in the right lane into the space beside the truck (shaded).", truck_wide_right),
    ("SCN-INT-EMERGENCY", "Emergency vehicle while you are in an intersection",
     "Car A is in the middle of an intersection when a fire truck with flashing lights comes up behind it; A's path continues through and pulls to the right after the intersection.", emergency_intersection),
    ("SCN-INT-DRIVEWAY-EXIT", "Leaving a driveway",
     "Car A is leaving a driveway, signaling right, and has stopped before the sidewalk, where a pedestrian is walking; car B is approaching on the street in the lane A wants to enter.", driveway_exit),
    ("SCN-INT-WHITE-CANE", "Pedestrian with a white cane",
     "A pedestrian carrying a white cane is crossing at a crosswalk in front of car A, which has stopped at the stop line.", white_cane_crosswalk),
    ("SCN-INT-ROUNDABOUT-YIELD", "Yielding when entering a roundabout",
     "Car A is stopped at the yield line of a roundabout entry while car B, already circulating counterclockwise, is about to pass in front of A's entry from A's left.", roundabout_yield),
    ("SCN-INT-YIELD-MERGE", "Yield sign where a side road joins",
     "Car A is on an angled side road with a yield sign where it joins a through road; car B is approaching on the through road in the lane A wants to enter.", yield_merge),
]
