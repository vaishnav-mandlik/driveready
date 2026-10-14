"""Motorcycle scenes (lane positions, group riding, intersections, being passed, blind spots, parked cars).

Grounded in the MSF Motorcycle Operator Manual (research/handbooks/MOTORCYCLE.txt): a lane has three paths of
travel, 1 = left third, 2 = center, 3 = right third (p. 15); staggered formation p. 38; intersections p. 20;
being passed p. 16-17; passing parked cars p. 22. Each entry: (code, name, meaning, builder).
"""
from scene import ASPHALT, CX, CY, H, LANE, SIDEWALK, W, WHITE, YELLOW, Scene, _f

BLUE = "#2F6FD8"
RED = "#E5484D"
GREY = "#8A939E"

# A close-up of one direction of a two-lane road: wide lanes so the three paths of travel read at phone size.
X_CENTER = 150  # yellow center line
LANE_W = 114
X_EDGE = X_CENTER + LANE_W  # right edge line of the northbound lane
PATH_X = {1: X_CENTER + LANE_W / 6, 2: X_CENTER + LANE_W / 2, 3: X_CENTER + 5 * LANE_W / 6}


def motorcycle(s, x, y, heading=0, color=BLUE, label=None, k=1.7, signal=None):
    """Top-down motorcycle drawn k-times the engine's size (tires, bars, rider helmet)."""
    g = [
        '<rect x="-3.2" y="-17" width="6.4" height="9" rx="3" fill="#1B1F24"/>',  # front tire
        '<rect x="-3.6" y="8" width="7.2" height="10" rx="3.2" fill="#1B1F24"/>',  # rear tire
        f'<rect x="-5" y="-9" width="10" height="19" rx="4.5" fill="{color}"/>',  # tank/seat
        '<rect x="-9" y="-10.5" width="18" height="2.6" rx="1.3" fill="#1B1F24"/>',  # handlebars
        '<circle cx="0" cy="1" r="5.2" fill="#F4F4F4" stroke="#1B1F24" stroke-width="1.2"/>',  # helmet
    ]
    if signal in ("left", "right"):
        sx = -10 if signal == "left" else 10
        g.append(f'<circle cx="{sx}" cy="-9" r="2.6" fill="#FFB300"/><circle cx="{sx}" cy="12" r="2.6" fill="#FFB300"/>')
    s.parts.append(f'<g transform="translate({_f(x)} {_f(y)}) rotate({heading}) scale({k})">{"".join(g)}</g>')
    if label:
        s.label(x + 24, y + 4, label)
    return s


def close_up_road(s, oncoming=True, shoulder_parking=False):
    """Vertical close-up: oncoming lane (left), yellow center line, wide northbound lane, edge line, shoulder."""
    s.grass()
    left = X_CENTER - LANE_W if oncoming else X_CENTER - 8
    right = X_EDGE + (48 if shoulder_parking else 10)
    s.rect(left, 0, right - left, H, ASPHALT)
    if shoulder_parking:
        s.rect(right, 0, 8, H, SIDEWALK)
        s.line(X_EDGE, 0, X_EDGE, H, WHITE, 2, "4 6")  # parking lane line
    else:
        s.line(X_EDGE, 0, X_EDGE, H, WHITE, 2.5)
    s.line(X_CENTER, 0, X_CENTER, H, YELLOW, 3, "14 10")
    return s


def path_guides(s, numbers=True):
    """Faint guides splitting the lane in thirds, with path numbers 1-2-3 at the top."""
    for i in (1, 2):
        x = X_CENTER + i * LANE_W / 3
        s.parts.append(f'<line x1="{_f(x)}" y1="0" x2="{_f(x)}" y2="{H}" stroke="#FFFFFF" stroke-width="1.4" stroke-dasharray="3 7" opacity="0.45"/>')
    if numbers:
        for n, x in PATH_X.items():
            s.label(x, 22, str(n), color="#1B1F24", bg="#FFE08A")
    return s


def lane_paths():
    s = close_up_road(Scene())
    path_guides(s)
    motorcycle(s, PATH_X[1], 170, label="A")
    return s


def staggered():
    s = close_up_road(Scene())
    path_guides(s, numbers=False)
    riders = [(1, PATH_X[1], 58), (2, PATH_X[3], 112), (3, PATH_X[1], 166), (4, PATH_X[3], 220)]
    for n, x, y in riders:
        motorcycle(s, x, y, color=BLUE if n == 1 else "#5B7FBF", k=1.5)
        s.label(x + (-22 if x < PATH_X[2] else 22), y + 2, str(n))
    # spacing brackets on the oncoming side: leader -> rider 2 (1 s), leader -> rider 3 (2 s)
    for (y1, y2, text, bx) in ((58, 112, "1 sec", 118), (58, 166, "2 sec", 80)):
        s.line(bx, y1, bx, y2, "#FFFFFF", 2, top=True)
        s.line(bx - 5, y1, bx + 5, y1, "#FFFFFF", 2, top=True)
        s.line(bx - 5, y2, bx + 5, y2, "#FFFFFF", 2, top=True)
        s.label(bx, (y1 + y2) / 2, text)
    return s


def car_left_turn():
    s = Scene().grass().intersection()
    mx = Scene.lane_x("north")
    motorcycle(s, mx, CY + 66, k=1.25)
    s.label(mx + 18, CY + 70, "A")
    s.car(Scene.lane_x("south"), CY - 50, 180, label="B", color=RED, turn_signal="left")
    s.path(f"M{mx} {CY + 44} L{mx} {CY - 40}", BLUE)
    sx = Scene.lane_x("south")
    s.path(f"M{sx} {CY - 24} Q{sx} {Scene.lane_y('east')} {CX + 56} {Scene.lane_y('east')}", RED)
    t = f'<g transform="translate({_f(CX)} {_f(CY)}) scale(1.25) translate({_f(-CX)} {_f(-CY - 6)})">'
    s.parts = [t] + s.parts + ["</g>"]
    s.top = [t] + s.top + ["</g>"]
    return s


def being_passed():
    s = close_up_road(Scene())
    path_guides(s, numbers=False)
    motorcycle(s, PATH_X[2], 120, label="A")
    on_x = X_CENTER - LANE_W / 2
    s.parts.append(f'<g transform="translate({_f(on_x)} 178) scale(1.7) translate({_f(-on_x)} -178)">')
    s.car(on_x, 178, 0, color=RED, turn_signal="right")
    s.parts.append("</g>")
    s.label(on_x - 30, 178, "B")
    s.path(f"M{on_x} 126 C{on_x} 70 {PATH_X[2]} 70 {PATH_X[2]} 20", RED)
    return s


def blind_spot():
    s = Scene().grass()
    x0, x1 = CX - 2 * LANE - 16, CX + 2 * LANE + 16
    lw = (x1 - x0) / 2
    s.rect(x0 - 6, 0, 6, H, SIDEWALK)
    s.rect(x1, 0, 6, H, SIDEWALK)
    s.rect(x0, 0, x1 - x0, H, ASPHALT)
    s.line(x0 + 2, 0, x0 + 2, H, YELLOW, 2.5)
    s.line(CX, 0, CX, H, WHITE, 2.2, "14 12")
    bx, ax = CX - lw / 2, CX + lw / 2
    s.parts.append(f'<g transform="translate({_f(bx)} 120) scale(1.7) translate({_f(-bx)} -120)">')
    s.car(bx, 120, 0, color=RED)
    s.parts.append("</g>")
    s.label(bx - 34, 120, "B")
    zone_top, zone_bot = 112, 196  # beside B's rear quarter and just behind it
    s.zone([(CX + 4, zone_top), (x1 - 4, zone_top), (x1 - 4, zone_bot), (CX + 4, zone_bot)], "#FFB300", 0.42)
    motorcycle(s, ax, 154, label="A")
    return s


def parked_cars():
    s = close_up_road(Scene(), oncoming=True, shoulder_parking=True)
    path_guides(s)
    px = X_EDGE + 23
    for y, col in ((40, "#8A939E"), (112, "#6B8E6B"), (184, "#B07A4A"), (256, "#8A939E")):
        s.parts.append(f'<g transform="translate({_f(px)} {y}) scale(1.35) translate({_f(-px)} {-y})">')
        s.car(px, y, 0, color=col)
        s.parts.append("</g>")
    motorcycle(s, PATH_X[1], 160, label="A")
    return s


SCENES = [
    ("SCN-MC-LANE-PATHS", "Three paths of travel in a lane",
     "A traffic lane is divided into three paths of travel: 1 (left third), 2 (center) and 3 (right third). Motorcycle A is riding in path 1.", lane_paths),
    ("SCN-MC-STAGGERED", "Staggered group formation",
     "Four motorcycles ride in a staggered formation in one lane: the leader (1) in the left side, rider 2 in the right side at least 1 second back, rider 3 in the left side at least 2 seconds behind the leader, and rider 4 in the right side.", staggered),
    ("SCN-MC-CAR-LEFT-TURN", "Car turning left in front of a motorcycle",
     "Motorcycle A is going straight through an intersection while oncoming car B signals and turns left across A's path.", car_left_turn),
    ("SCN-MC-BEING-PASSED", "Motorcycle being passed by a car",
     "Car B is passing motorcycle A on a two-lane road using the oncoming lane; A rides in the center portion of its lane.", being_passed),
    ("SCN-MC-BLIND-SPOT", "Motorcycle in a car's blind spot",
     "Motorcycle A is riding in the next lane beside the rear of car B, inside B's blind spot (shaded).", blind_spot),
    ("SCN-MC-PARKED-CARS", "Passing parked cars on a motorcycle",
     "Cars are parked along the right side of the road; motorcycle A rides in the left portion (path 1) of its lane as it passes them.", parked_cars),
]
