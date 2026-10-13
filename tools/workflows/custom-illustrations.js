export const meta = {
  name: 'custom-illustrations',
  description: 'Draw traffic-signal, pavement-marking and hand-signal SVG illustrations; render and visually review each',
  phases: [
    { title: 'Draw', detail: 'author SVGs + manifest' },
    { title: 'Visual review', detail: 'render to PNG, inspect, fix' },
  ],
}

const APP = '/Users/vaishnav/Desktop/DMV Test/app'
const DIR = APP + '/assets/signs-custom'

const SETS = [
  {
    key: 'signals',
    manifest: 'manifest_signals.json',
    items: [
      'SIG-RED: steady red light (3-section vertical signal, top lens lit red)',
      'SIG-YELLOW: steady yellow light (middle lens lit)',
      'SIG-GREEN: steady green light (bottom lens lit)',
      'SIG-FLASH-RED: flashing red light (single or top lens lit red with short radiating "flash" rays)',
      'SIG-FLASH-YELLOW: flashing yellow light (with flash rays)',
      'SIG-GREEN-ARROW-LEFT: green left-turn arrow (protected left; bottom lens shows green arrow)',
      'SIG-YELLOW-ARROW-LEFT: steady yellow left arrow',
      'SIG-RED-ARROW-LEFT: red left arrow',
      'SIG-FLASH-YELLOW-ARROW-LEFT: flashing yellow left arrow (4-section signal, flash rays) — permissive left turn, yield to oncoming traffic and pedestrians',
      'SIG-GREEN-ARROW-RIGHT: green right-turn arrow',
      'SIG-PED-WALK: pedestrian signal showing the white walking-person symbol',
      'SIG-PED-DONT-WALK: pedestrian signal showing the steady orange raised hand',
      'SIG-PED-COUNTDOWN: pedestrian signal with flashing orange hand and an orange countdown number (e.g. 12)',
      'SIG-LANE-RED-X: lane-use control signal, red X (lane closed — do not drive in it)',
      'SIG-LANE-YELLOW-X: lane-use control signal, steady yellow X (lane about to close — move out safely)',
      'SIG-LANE-GREEN-ARROW: lane-use control signal, green downward arrow (lane open)',
      'SIG-RR-FLASHING: railroad crossing flashing red lights below a crossbuck, both lights with flash rays (category railroad)',
      'SIG-OUT: a dark (unlit, power out) traffic signal — all three lenses unlit gray',
    ],
    style: 'Signals: dark charcoal (#1F2328) rounded housing with subtle highlight, lit lenses bright (red #E5332A, yellow #FFB81C, green #13B25B, pedestrian/lane orange #FF8A00, white #FFFFFF) with a soft glow halo (use semi-transparent circles — no blur filters), unlit lenses dim (#3A4048). Category "signal" except SIG-RR-FLASHING = "railroad".',
  },
  {
    key: 'markings',
    manifest: 'manifest_markings.json',
    items: [
      'MARK-DOUBLE-YELLOW: two-lane road from above with a double solid yellow center line (no passing either direction)',
      'MARK-SOLID-BROKEN-YELLOW: solid yellow + broken yellow center lines; arrows show the direction of travel on each side (passing allowed only from the broken-line side)',
      'MARK-BROKEN-YELLOW: single broken yellow center line (passing allowed when safe, two-way road)',
      'MARK-BROKEN-WHITE: multi-lane one-direction road with broken white lane lines (lane changes allowed)',
      'MARK-SOLID-WHITE: solid white lane line between same-direction lanes (lane changes discouraged/prohibited)',
      'MARK-EDGE-LINES: solid white right edge line and solid yellow left edge line on a divided/one-way roadway',
      'MARK-TWLTL: two-way left-turn center lane: solid yellow outer lines with broken yellow inner lines and opposite left-turn arrows',
      'MARK-STOP-LINE: intersection approach with a white stop line and a marked crosswalk',
      'MARK-YIELD-LINE: row of white triangles ("shark teeth") across the lane pointing toward the approaching driver',
      'MARK-HOV-DIAMOND: lane with white diamond symbol (HOV / restricted lane)',
      'MARK-BIKE-LANE: bike lane with solid white line and bicycle symbol + arrow',
      'MARK-RR-XING: railroad crossing pavement marking — white X with R R letters before tracks',
      'MARK-REVERSIBLE: reversible lane marked by double broken yellow lines on each side',
      'MARK-ARROWS: lane-use arrows on pavement (left-only arrow, straight arrow, right-only arrow in three lanes)',
      'MARK-CROSSHATCH: painted island / gore area with white chevron crosshatching where a ramp leaves the freeway',
      'HAND-LEFT: hand signal for a left turn — driver\'s left arm extended straight out the window (category hand_signal)',
      'HAND-RIGHT: hand signal for a right turn — left arm out, bent up at the elbow, hand pointing up (category hand_signal)',
      'HAND-STOP: hand signal for slow/stop — left arm out, bent down at the elbow, palm facing back (category hand_signal)',
      'SMV-EMBLEM: slow-moving vehicle emblem — fluorescent orange triangle with a dark red reflective border, point up (category other)',
    ],
    style: 'Markings: top-down view, asphalt #4B5059 with faint texture-free fill, white marking #F4F4F4, yellow marking #F2C11C, direction-of-travel arrows as small white/gray chevrons; keep at least 2 lanes visible. Hand signals: simple flat illustration of the rear-left of a car (body #2F6FD8, window #BFD6F5) with a skin-tone arm (#E0A97A) in the correct position, viewed from behind the car; the car occupies the lower part, arm clearly visible. Category "marking" for MARK-*, "hand_signal" for HAND-*, "other" for SMV-EMBLEM.',
  },
]

const SUMMARY = {
  type: 'object',
  properties: { drawn: { type: 'array', items: { type: 'string' } }, problems: { type: 'array', items: { type: 'string' } }, notes: { type: 'string' } },
  required: ['drawn', 'problems', 'notes'],
}

function drawPrompt(set) {
  return [
    'You are an illustrator writing hand-authored SVG for a driver\'s-test study app (rendered on Android with react-native-svg SvgXml).',
    'Create one SVG file per item in "' + DIR + '/svg/" named <CODE>.svg, and a manifest "' + DIR + '/' + set.manifest + '": JSON array of {code, name, category, shape, colors, meaning, license: "app-drawn", svgPath: "svg/<CODE>.svg"}. meaning = one accurate sentence of what it means / what the driver must do (universal US rules per the MUTCD; avoid state-specific details).',
    'Items:',
    set.items.map(x => '- ' + x).join('\n'),
    '',
    'Style: ' + set.style,
    'Technical rules (react-native-svg compatibility): a viewBox on the root <svg> (e.g. "0 0 200 200"; markings may be wider like "0 0 240 200"), NO <style> elements, NO CSS classes, NO filters/blur, NO <text> unless essential (prefer paths/shapes for letters and digits; the countdown and RR letters may use bold <text> with font-family="sans-serif"), NO external references or embedded images. Use only presentation attributes (fill, stroke, stroke-width, opacity, transform, rx). Keep each file small (< 6 KB) and clean.',
    'Paths contain a space ("DMV Test"): quote paths in shell commands.',
    'After writing, render every file with: rsvg-convert -w 240 "<svg>" -o "/private/tmp/claude-501/-Users-vaishnav-Desktop-DMV-Test/5c0c73e9-6292-4e61-bc4b-5692a2de05ea/scratchpad/illus-' + set.key + '/<CODE>.png" (mkdir the folder first) and LOOK at each PNG with the Read tool; fix anything that is unclear, misdrawn, or inaccurate. Return the summary.',
  ].join('\n')
}

function reviewPrompt(set) {
  return [
    'You are a strict visual reviewer for driver-education illustrations. Files: "' + DIR + '/svg/" (codes listed below) and manifest "' + DIR + '/' + set.manifest + '".',
    'Items:',
    set.items.map(x => '- ' + x).join('\n'),
    '',
    'For EACH item: render with rsvg-convert -w 320 to "/private/tmp/claude-501/-Users-vaishnav-Desktop-DMV-Test/5c0c73e9-6292-4e61-bc4b-5692a2de05ea/scratchpad/illus-review-' + set.key + '/<CODE>.png" (mkdir first) and view it with Read. Check: it unambiguously depicts the described thing as a US driver would see it (correct colors, lens order red-top/yellow/green-bottom, arrow directions, which side lines are on, shark teeth pointing toward approaching traffic, hand-signal arm positions exactly as described), it is legible at small size (~120 px), consistent style across the set, and the manifest meaning is accurate. Also check technical rules: viewBox present; no <style>, classes, filters, external refs; small files.',
    'Fix problems directly (edit SVG/manifest), re-render and re-check. Paths contain a space: quote them. Return the summary listing problems found and fixed.',
  ].join('\n')
}

const out = await pipeline(
  SETS,
  s => agent(drawPrompt(s), { label: 'draw:' + s.key, phase: 'Draw', schema: SUMMARY }),
  (d, s) => agent(reviewPrompt(s), { label: 'review:' + s.key, phase: 'Visual review', schema: SUMMARY }).then(r => ({ d, r })),
)
return out.map((x, i) => ({ set: SETS[i].key, drawn: x && x.d && x.d.drawn.length, reviewProblems: x && x.r && x.r.problems }))
