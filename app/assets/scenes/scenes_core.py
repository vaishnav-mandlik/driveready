"""Core scenario scenes (hand-authored). Each entry: code, name, meaning (what the scene shows), builder."""
from scene import CX, CY, LANE, ROAD, W, H, Scene


def four_way_same_time():
    s = Scene().grass().intersection()
    for x, y in ((CX + ROAD / 2 + 12, CY + ROAD / 2 + 12), (CX - ROAD / 2 - 12, CY - ROAD / 2 - 12),
                 (CX - ROAD / 2 - 12, CY + ROAD / 2 + 12), (CX + ROAD / 2 + 12, CY - ROAD / 2 - 12)):
        s.stop_sign(x, y)
    s.car(Scene.lane_x("north"), CY + ROAD / 2 + 32, 0, label="A")
    s.car(CX + ROAD / 2 + 32, Scene.lane_y("west"), 270, label="B")
    s.path(f"M{Scene.lane_x('north')} {CY + 10} L{Scene.lane_x('north')} {CY - 52}", "#2F6FD8")
    s.path(f"M{CX + 10} {Scene.lane_y('west')} L{CX - 56} {Scene.lane_y('west')}", "#E5484D")
    return s


def left_turn_oncoming():
    s = Scene().grass().intersection()
    s.signal(CX + ROAD / 2 + 14, CY - ROAD / 2 - 22, "green", 180)
    s.car(Scene.lane_x("north"), CY + ROAD / 2 + 30, 0, label="A", turn_signal="left")
    s.car(Scene.lane_x("south"), CY - ROAD / 2 - 30, 180, label="B")
    lx = Scene.lane_x("north")
    s.path(f"M{lx} {CY + 12} Q{lx} {Scene.lane_y('west')} {CX - 40} {Scene.lane_y('west')}", "#2F6FD8")
    s.path(f"M{Scene.lane_x('south')} {CY - 14} L{Scene.lane_x('south')} {CY + 56}", "#E5484D")
    return s


def school_bus_two_lane():
    s = Scene().grass().road_h(CY, 1, "dashed-yellow")
    s.school_bus_stopped(CX + 40, Scene.lane_y("west"), 270, arm=True, lights="red")
    s.car(CX - 70, Scene.lane_y("east"), 90, label="A")
    s.pedestrian(CX + 32, CY - LANE - 12)
    s.pedestrian(CX + 48, CY - LANE - 14, "#E8930C")
    return s


def roundabout_entry():
    s = Scene().grass().roundabout()
    s.car(Scene.lane_x("north"), H - 22, 0, label="A")
    s.yield_sign(CX + ROAD / 2 + 12, H - 50)
    # B circulating counter-clockwise, at the right side of the circle heading north... drawn at east side moving up
    s.car(CX + 69, CY + 8, 0, label="B")
    return s


def emergency_vehicle_behind():
    s = Scene().grass().road_v(CX, 1, "dashed-yellow")
    s.car(Scene.lane_x("north"), CY - 30, 0, label="A")
    s.car(Scene.lane_x("north"), CY + 62, 0, kind="ambulance")
    s.path(f"M{Scene.lane_x('north')} {CY - 54} Q{Scene.lane_x('north')} {CY - 80} {CX + LANE + 2} {CY - 98}", "#2F6FD8")
    return s


SCENES = [
    ("SCN-4WAY-SAME-TIME", "4-way stop: two cars arrive together", "Car A (heading north) and car B (heading west) arrive at an all-way stop at the same time. B is on A's right.", four_way_same_time),
    ("SCN-LEFT-TURN-ONCOMING", "Left turn on a green light with oncoming traffic", "Car A is turning left on a circular green light while car B approaches from the opposite direction going straight.", left_turn_oncoming),
    ("SCN-SCHOOL-BUS-2LANE", "School bus stopped on a two-lane road", "A school bus is stopped with red lights flashing and its stop arm out on a two-lane road; car A approaches from the opposite direction.", school_bus_two_lane),
    ("SCN-ROUNDABOUT-ENTRY", "Entering a roundabout", "Car A is approaching the yield line of a roundabout while car B is already circulating inside it.", roundabout_entry),
    ("SCN-EMERGENCY-BEHIND", "Emergency vehicle approaching from behind", "An ambulance with flashing lights is coming up behind car A on a two-lane road; A pulls to the right edge and stops.", emergency_vehicle_behind),
]
