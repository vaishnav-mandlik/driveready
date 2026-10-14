"""Commercial-vehicle scenes, grounded in the AAMVA CDL Manual (research/handbooks/CDL.txt):
right turns and dual left-turn lanes (p. 41), driver-side backing (p. 32), following distance (p. 39),
railroad crossings for buses and placarded vehicles (pp. 53, 73, 159). Each entry: (code, name, meaning, builder).
"""
from scene import ASPHALT, CURB, CX, CY, H, LANE, ROAD, SIDEWALK, W, WHITE, YELLOW, Scene, _f

BLUE = "#2F6FD8"
RED = "#E5484D"
ORANGE = "#E8930C"


def zoom(s, k, fx, fy):
    t = f'<g transform="translate({_f(CX)} {_f(CY)}) scale({k}) translate({_f(-fx)} {_f(-fy)})">'
    s.parts[:] = [t, *s.parts, "</g>"]
    s.top[:] = [t, *s.top, "</g>"]
    return s


def caption(s, x, y, text, size=11, color="#1B1F24", anchor="middle"):
    s.top.append(f'<text x="{_f(x)}" y="{_f(y)}" font-family="sans-serif" font-size="{size}" font-weight="bold" fill="{color}" text-anchor="{anchor}">{text}</text>')


def bracket_v(s, x, y1, y2, text, color="#FFFFFF"):
    s.line(x, y1, x, y2, color, 2, top=True)
    s.line(x - 5, y1, x + 5, y1, color, 2, top=True)
    s.line(x - 5, y2, x + 5, y2, color, 2, top=True)
    s.label(x, (y1 + y2) / 2, text)


def turn_arrow(s, x, y, kind="left"):
    """Painted lane arrow (white) pointing north, turning left."""
    d = f"M{_f(x + 3)} {_f(y + 16)} L{_f(x + 3)} {_f(y - 2)} Q{_f(x + 3)} {_f(y - 9)} {_f(x - 4)} {_f(y - 9)} L{_f(x - 7)} {_f(y - 9)}" if kind == "left" else ""
    s.parts.append(f'<path d="{d}" stroke="{WHITE}" stroke-width="3" fill="none"/>')
    s.parts.append(f'<polygon points="{_f(x - 12)},{_f(y - 9)} {_f(x - 5)},{_f(y - 14)} {_f(x - 5)},{_f(y - 4)}" fill="{WHITE}"/>')


def right_turn_correct():
    s = Scene().grass().intersection()
    lx = Scene.lane_x("north") + 5  # rear kept close to the curb
    s.car(lx, CY + 86, 0, kind="truck", color=ORANGE, turn_signal="right")
    s.label(lx + 26, CY + 100, "A")
    ey = Scene.lane_y("east")
    s.path(f"M{lx} {CY + 36} L{lx} {CY + 2} Q{lx} {CY - 22} {CX + 48} {CY - 14} Q{CX + 84} {CY - 8} {CX + 112} {ey}", BLUE)
    return zoom(s, 1.12, CX + 22, CY + 10)


def right_turn_wrong():
    s = Scene().grass().intersection()
    # truck swung left across the center line before turning; car B squeezed in on its right
    s.parts.append(f'<g transform="translate({_f(CX - 2)} {_f(CY + 92)}) rotate(-8) translate({_f(-(CX - 2))} {_f(-(CY + 92))})">')
    s.car(CX - 2, CY + 92, 0, kind="truck", color=ORANGE, turn_signal="right")
    s.parts.append("</g>")
    s.label(CX - 32, CY + 104, "A")
    bx = Scene.lane_x("north") + 6
    s.car(bx, CY + 58, 0, label="B", color="#8A939E")
    s.path(f"M{CX + 2} {CY + 44} Q{CX + 6} {CY - 4} {CX + 64} {Scene.lane_y('east')}", RED)
    return zoom(s, 1.12, CX + 14, CY + 12)


def dual_left():
    s = Scene()
    s.rect(-120, -120, W + 240, H + 240, "#9CC27E")  # grass beyond the canvas: this scene is zoomed out
    s.road_h(CY, 2, "double-yellow", x1=-120, x2=W + 120)
    s.road_v(CX, 2, "double-yellow", y1=-120, y2=H + 120)
    h2 = ROAD
    s.rect(CX - h2, CY - h2, 2 * h2, 2 * h2, ASPHALT)
    s.line(CX, CY + h2 + 4, CX + h2, CY + h2 + 4, WHITE, 3.5)
    for x in (CX + LANE / 2, CX + LANE * 1.5):
        turn_arrow(s, x, CY + h2 + 26)
    inner, outer = CX + LANE / 2, CX + LANE * 1.5
    s.car(inner, CY + h2 + 46, 0, label="B", color="#8A939E", turn_signal="left")
    s.car(outer, CY + h2 + 70, 0, kind="truck", color=ORANGE, turn_signal="left")
    s.label(outer + 24, CY + h2 + 84, "A")
    wy_inner, wy_outer = CY - LANE / 2, CY - LANE * 1.5
    s.path(f"M{outer} {CY + h2 + 22} L{outer} {CY + 10} Q{outer} {wy_outer} {CX - 30} {wy_outer} L{CX - h2 - 20} {wy_outer}", BLUE)
    s.path(f"M{inner} {CY + h2 + 22} Q{inner} {wy_inner + 6} {CX - 30} {wy_inner} L{CX - h2 - 20} {wy_inner}", "#8A939E")
    return zoom(s, 0.86, CX + 6, CY + 36)


def backing_sight_side():
    s = Scene().grass()
    ry = CY + 56  # street (eastbound truck)
    s.road_h(ry, 1, "none")  # service road behind the building (no center line)
    # loading dock / alley on the north side of the street (driver's side for an eastbound truck)
    dock_x = CX - 70
    s.rect(dock_x - 32, 0, 64, ry - LANE - 6, ASPHALT)
    s.rect(dock_x - 50, 0, 100, 26, "#B0A595")  # building wall
    s.rect(dock_x - 22, 22, 44, 8, "#5D4037")  # dock door
    caption(s, dock_x, 16, "DOCK", 11, "#FFFFFF")
    tx = CX + 66
    s.car(tx, ry - LANE / 2, 90, kind="truck", color=ORANGE, turn_signal="hazard")
    s.label(tx + 4, ry - LANE / 2 - 24, "A")
    rear = tx - 46
    s.path(f"M{rear - 4} {ry - LANE / 2} Q{dock_x} {ry - LANE / 2} {dock_x} {ry - LANE - 30} L{dock_x} 46", BLUE)
    s.pedestrian(dock_x + 34, 58, "#E8930C")
    caption(s, dock_x + 34, 78, "helper", 10, "#1B1F24")
    return s


def bus_railroad():
    s = Scene().grass()
    s.road_v(CX, 1, "double-yellow")
    ty = 70
    s.rail_tracks_h(ty)
    bx = Scene.lane_x("north")
    front = ty + 13 + 60
    s.car(bx, front + 37, 0, kind="bus", turn_signal="hazard")
    s.label(bx + 26, front + 44, "A")
    bracket_v(s, CX - ROAD / 2 - 26, ty + 6, front, "15-50 ft")
    s.parts.append(f'<g transform="translate({CX + ROAD / 2 + 16} {ty + 26})">'
                   '<rect x="-1.5" y="0" width="3" height="16" fill="#555"/>'
                   '<rect x="-12" y="-3" width="24" height="5" fill="#FFFFFF" stroke="#333" transform="rotate(35)"/>'
                   '<rect x="-12" y="-3" width="24" height="5" fill="#FFFFFF" stroke="#333" transform="rotate(-35)"/></g>')
    return zoom(s, 1.25, CX - 6, CY - 6)


def following_distance():
    s = Scene().grass()
    s.road_h(CY, 1, "dashed-yellow")
    ey = Scene.lane_y("east")
    s.car(282, ey, 90, label="B", color="#8A939E")
    s.parts.append(f'<rect x="246" y="{_f(ey - 14)}" width="6" height="28" fill="#3E444C" opacity="0.6"/>')  # shadow line on the road
    s.car(96, ey, 90, kind="truck", color=ORANGE)
    s.label(96, ey - 26, "A")
    s.line(50, ey + 26, 142, ey + 26, "#FFFFFF", 2, top=True)
    s.line(50, ey + 20, 50, ey + 32, "#FFFFFF", 2, top=True)
    s.line(142, ey + 20, 142, ey + 32, "#FFFFFF", 2, top=True)
    s.label(96, ey + 26, "40-ft truck")
    s.label(250, CY - 44, "COUNT SECONDS")
    return zoom(s, 1.08, CX, CY + 6)


SCENES = [
    ("SCN-CDL-RIGHT-TURN", "Truck right turn done correctly",
     "Truck A turns right from the right lane: it keeps the rear of the truck close to the curb, goes forward into the intersection and swings wide only as it completes the turn.", right_turn_correct),
    ("SCN-CDL-RIGHT-TURN-WRONG", "Truck swinging left before a right turn",
     "Truck A signals right but has swung left across the center line before turning, leaving a gap at the curb where car B has pulled up on its right.", right_turn_wrong),
    ("SCN-CDL-DUAL-LEFT", "Truck at a double left-turn lane",
     "At an intersection with two left-turn lanes, truck A is in the right (outer) turn lane and car B is in the inner turn lane; both turn left.", dual_left),
    ("SCN-CDL-BACKING", "Backing toward the driver's side",
     "Truck A is backing into a loading dock on the driver's (left) side of the truck, with a helper standing near the back where the driver can see them.", backing_sight_side),
    ("SCN-CDL-BUS-RAILROAD", "Bus stopped at a railroad crossing",
     "Bus A has stopped with its four-way flashers on before a railroad crossing with no stop line, between 15 and 50 feet from the nearest rail.", bus_railroad),
    ("SCN-CDL-FOLLOWING", "Following distance for a 40-foot truck",
     "40-foot truck A follows car B; the driver counts the seconds from when B passes a shadow on the road until the truck reaches it.", following_distance),
]
