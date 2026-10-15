"""Writes app/assets/photos/manifest_photos.json from keep.json + cached Commons metadata."""
import json, os, subprocess
S = '/private/tmp/claude-501/-Users-vaishnav-Desktop-DMV-Test/5c0c73e9-6292-4e61-bc4b-5692a2de05ea/scratchpad'
APPPH = '/Users/vaishnav/Desktop/DMV Test/app/assets/photos'
keep = json.load(open(os.path.join(S, 'phtools', 'keep.json')))
meta = json.load(open(os.path.join(S, 'phapi', 'meta.json')))

# Short author credits (Commons "Artist" field, trimmed).
AUTHOR = {
    'PH-SCHOOL-BUS-RED-LIGHTS': 'U.S. National Transportation Safety Board (NTSB)',
    'PH-SCHOOL-BUS-STOP-ARM': 'Katy Warner',
    'PH-FLASHING-YELLOW-ARROW': 'Deloreanman14',
    'PH-GREEN-BIKE-LANE': 'Atomic Taco',
    'PH-SHARROW': 'Jim.henderson',
    'PH-FOG-ROAD': 'U.S. Forest Service, San Bernardino National Forest',
    'PH-PEDESTRIAN-HYBRID-BEACON': 'William F. Yurasko',
    'PH-MOTORCYCLE-GROUP-STAGGERED': 'Cpl. Peter R. Miller, U.S. Marine Corps',
}
INFO = {
    'PH-ROUNDABOUT-AERIAL': ('Roundabout from above',
        'Aerial view of a single-lane roundabout: a grassy center island ringed by a reddish truck apron, with four roads entering it, raised splitter islands and crosswalks on each approach.'),
    'PH-SCHOOL-BUS-RED-LIGHTS': ('School bus with red lights and stop arm',
        'A yellow school bus stopped on a road at dusk with its red warning lights flashing and its red STOP arm swung out from the driver\'s side.'),
    'PH-SCHOOL-BUS-STOP-ARM': ('School bus stop arm, driver\'s view',
        'View from the driver\'s seat of a car: a yellow school bus right in front has its red STOP arm extended from its side.'),
    'PH-FLASHING-YELLOW-ARROW': ('Flashing yellow left-turn arrow',
        'Two traffic signals over a road: the left-turn signal shows a yellow left arrow in its third light position, while the signal for straight-ahead traffic shows a green light.'),
    'PH-RAILROAD-CROSSBUCK-RURAL': ('Rural crossing with crossbucks only',
        'A gravel road crosses a railroad track in open country. The crossing is marked only by white X-shaped RAILROAD CROSSING signs on posts, with no lights or gates.'),
    'PH-RAILROAD-GATES-DOWN': ('Railroad crossing gates down',
        'A city railroad crossing with its red-and-white striped gate arms lowered across the road and a red warning light lit on the signal mast.'),
    'PH-HOV-CARPOOL-LANE': ('Carpool (HOV) lane sign',
        'An overhead sign above the left lane of a freeway shows a white diamond and reads CARPOOLS ONLY, 2 OR MORE PERSONS PER VEHICLE, with an arrow pointing down to the lane.'),
    'PH-CENTER-TURN-LANE': ('Two-way center left-turn lane',
        'A multi-lane road with a center lane bordered on each side by a solid yellow line and a broken yellow line, with a white turn arrow painted in the lane.'),
    'PH-GREEN-BIKE-LANE': ('Green-painted bike lane',
        'A wide city street seen from above, with a bike lane painted bright green running along the right side of the car lanes and across an area where cars merge in from a ramp.'),
    'PH-SHARROW': ('Shared-lane marking (sharrow)',
        'A city street in New York with a shared-lane marking, a bicycle symbol with two chevrons above it, painted in the travel lane next to a crosswalk.'),
    'PH-RUMBLE-STRIP-SHOULDER': ('Shoulder rumble strip',
        'Close-up of a paved highway shoulder next to the white edge line, with a band of grooves (a rumble strip) cut across the pavement.'),
    'PH-FREEWAY-MERGE': ('Entrance ramp merging onto a freeway',
        'Two cars on an entrance ramp heading to merge onto a busy divided interstate highway, seen from behind.'),
    'PH-DIVIDED-HIGHWAY-MEDIAN': ('Divided highway with median',
        'An interstate highway seen from an overpass: two lanes in each direction separated by a wide grassy median, with a solid yellow edge line on the median side of each roadway and a white edge line on the outside.'),
    'PH-FLOODED-ROAD': ('Flooded road',
        'A two-lane road with a double yellow center line disappears under brown floodwater ahead; a white truck is stopped at the left edge of the road in the foreground.'),
    'PH-DEER-CROSSING-ROAD': ('Deer crossing the road',
        'A white-tailed deer walks across a curving two-lane road with a double yellow center line, next to woods.'),
    'PH-WORK-ZONE-TWO-LANE': ('Work zone on a two-lane road',
        'Driver\'s view of a two-lane road in a work zone: orange cones line the lane, orange diamond warning signs stand on the shoulder, and construction equipment is working ahead.'),
    'PH-WORK-ZONE-HIGHWAY': ('Highway work zone lane closure',
        'Trucks and cars move in single file past a highway work zone where a long row of orange-and-white drums closes off a lane.'),
    'PH-FOG-ROAD': ('Car driving in thick fog',
        'A car drives on a road in thick fog that hides the trees and the road ahead.'),
    'PH-SNOW-TRAFFIC': ('Traffic in falling snow',
        'Heavy traffic with headlights on moves along a snow-covered city street while snow falls.'),
    'PH-AMBULANCE-RESPONDING': ('Ambulance responding',
        'A red-and-white ambulance with its emergency lights on drives along a city street toward the camera.'),
    'PH-HORSE-BUGGY': ('Horse-drawn buggy on a highway',
        'A horse-drawn buggy travels along the edge of a curving two-lane rural highway.'),
    'PH-FARM-TRACTOR-ROAD': ('Farm tractor on a highway',
        'A large green farm tractor travels on a two-lane highway, with a line of cars and a truck following close behind it.'),
    'PH-SCHOOL-CROSSING-GUARDS': ('School crossing guards',
        'School crossing guards in bright safety vests hold up STOP paddles while children walk and ride bikes across a marked crosswalk next to a yellow-green school crossing sign.'),
    'PH-CROSSWALK-PEDESTRIANS': ('Pedestrians in a crosswalk',
        'Several people, seen from behind, walk across a wide street in a marked crosswalk with white bars at a city intersection.'),
    'PH-PEDESTRIAN-HYBRID-BEACON': ('Pedestrian hybrid beacon',
        'A pedestrian hybrid beacon, two red lights above one yellow light, hangs dark on a mast arm over a marked crosswalk on a suburban road.'),
    'PH-MOTORCYCLE-GROUP-STAGGERED': ('Motorcycle group in staggered formation',
        'A group of motorcyclists rides on a U.S. highway in a staggered formation, alternating between the left and right sides of the lane.'),
}
out = []
for code, title in keep.items():
    m = meta[title]
    f = os.path.join(APPPH, 'img', code + '.webp')
    w, h = subprocess.run(['magick', 'identify', '-format', '%w %h', f], capture_output=True, text=True, check=True).stdout.split()
    name, meaning = INFO[code]
    out.append({
        'code': code, 'name': name, 'category': 'scenario', 'meaning': meaning,
        'file': f'img/{code}.webp', 'width': int(w), 'height': int(h),
        'license': m['license'], 'author': AUTHOR.get(code, m['artist']),
        'sourceUrl': m['page'],
    })
assert len(out) == len(INFO) == len(keep)
json.dump(out, open(os.path.join(APPPH, 'manifest_photos.json'), 'w'), indent=2, ensure_ascii=False)
open(os.path.join(APPPH, 'manifest_photos.json'), 'a').write('\n')
for e in out:
    print(e['code'], e['width'], e['height'], e['license'], '|', e['author'])
