# Oregon — official sample questions vs. DriveReady coverage

_Audit date: 2026-10-15. Sources: Oregon Driver Manual 2026–2027 (`research/handbooks/OR.txt`): 23 "Sample Test Questions" in seven sets at the end of the manual's sections (PDF pp. 25, 45, 53, 69–70, 75, 80, 95); Oregon Motorcycle & Moped Manual (`research/handbooks/OR_MOTORCYCLE.txt`): 25 "Test Your Knowledge" questions in eight sections (PDF pp. 16, 23, 29, 40, 46, 50, 54, 60). Neither manual prints an answer key. Instead every item cites a manual page, e.g. "(page 34)" — printed numbering, which is PDF page minus 8 in the driver manual and minus 6 in the motorcycle manual. The answer was read from the cited page and stored as `handbookAnswer` (`answer` stays null), with the cited page in `citedPage`. Items are numbered 1–23 (car) and 24–48 (motorcycle); page numbers are the `=== PAGE n ===` markers of the file each item comes from (the PDF numbering the app's OR refs use). Extracted questions: `research/official-samples/OR.json` (research only — never shipped, never copied into the app)._

## Summary

| | Count |
|---|---|
| Official sample questions (23 driver manual + 25 motorcycle manual; no printed key, answers read from the cited pages) | **48** |
| COVERED (an app question tests the same fact with the same answer) | **35** |
| PARTIAL (related app question, different fact/angle) | **7** |
| MISSING (no app question) | **6** |
| New questions written | **14** — 9 Oregon (`or.car.102`–`or.car.105`, `or.mc.011`–`or.mc.015` in `app/src/content/questions/states/OR.json`) + 5 universal motorcycle (`mc.cvfom.001`–`mc.cvfom.005` in `app/src/content/questions/motorcycle/coverage-fl-or-md-mi.json`); no universal car question needed |

Car track: 23 items → 20 covered, 2 partial, 1 missing. Motorcycle track: 25 items → 15 covered, 5 partial, 5 missing (the Oregon motorcycle manual is TEAM OREGON's own text, not the MSF manual, and has a three-wheel section the app barely covered).

Validator: `node scripts/validate-content.mjs src/content/questions/states/FL.json src/content/questions/states/OR.json src/content/questions/states/MI.json src/content/questions/car/coverage-fl-or-md-mi.json src/content/questions/motorcycle/coverage-fl-or-md-mi.json`
→ **0 errors, 0 warnings** (no duplicate prompts).

Index: not rebuilt here (per the audit instructions). `node scripts/check-content-index.mjs` reports stale hashes for `states/FL.json`, `states/OR.json`, `states/MI.json` and the unindexed new files `questions/car/coverage-fl-or-md-mi.json` and `questions/motorcycle/coverage-fl-or-md-mi.json` (plus `states/ID.json`, another agent's in-progress state); run `node scripts/build-content-index.mjs` (with `EXCLUDE_STATES` for in-progress states).

## Conflicts (official answer vs. app)

Oregon prints no answer key; each answer was read from the page the item cites. **No existing app question was changed.** Items reviewed closely:

| Official # | Issue | Resolution |
|---|---|---|
| 33 (MC Sec.4 #4) | Oregon lists the turning steps as **Slow, Look, Roll, Press** (PDF p.28); the MSF manual and `mc.ctl.034` use **Slow, Look, Press, Roll**. | Not a contradiction: `mc.ctl.034` asks for the MSF manual's order and offers no Oregon-order distractor, and Oregon's own item doesn't contrast the two orders. No change; the Oregon order is taught as `or.mc.012`, whose explanation notes both orders and that the steps overlap. |
| 16 (Car set 5 #1) | The cited page (66 → PDF 74) supports C (watch for pedestrians and pass with caution). The page before it (PDF 73) adds that if a streetcar stops in your lane to load, you stay behind it until it moves or the riders are clear, which is close to choice B. | `handbookAnswer` C (per the cited page), with this caveat recorded. Both rules taught: `or.car.103` (stay behind) and `or.car.104` (watch for riders). |
| 1 (Car set 1 #1) | The sign picture is not in the text extraction. | Of the three choices, only Slippery When Wet appears on the cited p.12 (PDF 20); recorded B; covered by `car.rsw.028`. |
| 22 (Car set 7 #3) | Choice B says the law "requires" open containers to be in the trunk; the manual (PDF p.91) says they "should be in the trunk". | Taught as "should be in the trunk" (`or.car.105`); consistent with `or.car.011`. |
| 11 (Car set 4 #1) | Oregon: temporary work-zone speeds apply at all times (PDF p.67). Michigan's "where workers present" limits apply only where workers are present. | Both kept state-specific (`or.car.093`, new `mi.car.106`); no universal question states either rule. |
| 47 (MC Sec.9 #3) | Oregon: three-wheelers in a group ride single file at least 4 seconds apart (PDF p.56); MSF Three-Wheel Supplement: single file, at least 2 seconds. | Universal `mc.cvfom.004` teaches single file and mentions both spacings. |
| 28 (MC Sec.3 #2) | Oregon: synthetic or leather gives the best protection; `mc.gear.017` keys "Leather" (its explanation adds sturdy synthetics). | No clash: its distractors are denim, cotton canvas and nylon mesh. |

## New questions

Oregon-specific (`states/OR.json`, `"states": ["OR"]`):
- `or.car.102` (speed-space) — You stop behind another car at a red light. How much room does the Oregon Driver Manual say to leave? → _Enough to see its rear tires touching the road_ (Oregon Driver Manual, p. 35) — closes #7
- `or.car.103` (sharing-road) — A streetcar ahead of you in your lane stops to let riders on and off. What does the Oregon Driver Manual tell you to do? → _Stay behind it until it moves or the riders are safely away_ (Oregon Driver Manual, p. 73) — closes #16
- `or.car.104` (sharing-road) — You are driving past a streetcar that has stopped at a platform in the lane next to yours. What hazard does the Oregon Driver Manual tell you to watch for? → _Riders running across your lane to catch it_ (Oregon Driver Manual, p. 74) — closes #16
- `or.car.105` (alcohol-drugs) — You are bringing home a partly finished bottle of wine in your car in Oregon. Where does the Oregon Driver Manual say it should be? → _In the trunk_ (Oregon Driver Manual, p. 91) — closes #22
- `or.mc.011` (mc-impairment) — Very cold weather slows your reaction time on a motorcycle. What does the Oregon Motorcycle Manual say to do about it? → _Slow down and leave more space ahead and to your sides_ (Oregon Motorcycle & Moped Manual, p. 14) — closes #26
- `or.mc.012` (mc-basic-control) — The Oregon Motorcycle Manual teaches four steps for turning. In what order does it list them? → _Slow, Look, Roll, Press_ (Oregon Motorcycle & Moped Manual, p. 28) — closes #33
- `or.mc.013` (mc-crash-avoidance) — You are about to take a curve on a crowned road, one that is higher in the middle than at the edges. What does the Oregon Motorcycle Manual advise? → _Slow down; you have less ground clearance to lean_ (Oregon Motorcycle & Moped Manual, p. 47) — closes #40
- `or.mc.014` (mc-crash-avoidance) — According to the Oregon Motorcycle Manual, what may be the best way to avoid a collision on a three-wheel motorcycle? → _Braking hard_ (Oregon Motorcycle & Moped Manual, p. 57) — closes #45
- `or.mc.015` (mc-basic-control) — What can happen if you enter a turn too fast on a three-wheel motorcycle, according to the Oregon Motorcycle Manual? → _You may cross into another lane or lift a wheel_ (Oregon Motorcycle & Moped Manual, p. 56) — closes #46

Universal motorcycle (`motorcycle/coverage-fl-or-md-mi.json`):
- `mc.cvfom.001` (mc-impairment) — A rider who has been drinking wants to sober up before riding home. What actually removes alcohol from the body? → _Time_ (MSF Motorcycle Operator Manual, p. 42 (Alcohol in the Body); state motorcycle manuals (e.g. OR p.13, SC p.25, TN p.15)) — closes #24
- `mc.cvfom.002` (mc-basic-control) — On a motorcycle with a manual clutch, what is the "friction zone"? → _Where the clutch starts sending power to the rear wheel_ (MSF Motorcycle Operator Manual, pp. 9, 12; state motorcycle manuals (e.g. OR p.26, SC p.38)) — closes #31
- `mc.cvfom.003` (mc-lane-position) — There is no single correct lane position for a motorcycle. What should decide which part of the lane you ride in? → _Where others can best see you and you keep a space cushion_ (MSF Motorcycle Operator Manual, p. 15 (Lane Positions); Oregon Motorcycle & Moped Manual, p. 34) — closes #35
- `mc.cvfom.004` (mc-passengers-groups) — A group of riders on three-wheel motorcycles is riding together. Which formation should they use? → _Single file, keeping a safe gap between vehicles_ (MSF Motorcycle Operator Manual, pp. 50-51 (Three-Wheel Supplement: Lane Position); Oregon Motorcycle & Moped Manual, p. 56) — closes #47
- `mc.cvfom.005` (mc-basic-control) — You are turning a three-wheel motorcycle. What should you do with your body? → _Lean your upper body slightly toward the turn_ (MSF Motorcycle Operator Manual, pp. 49-50 (Three-Wheel Supplement); Oregon Motorcycle & Moped Manual, pp. 57-58) — closes #48

State-specific vs. universal decisions: the stopping gap ("see the rear tires", only in the OR and KS handbooks), the streetcar rules, the open-container trunk rule, cold-weather reaction time, Oregon's turning-step order, crowned roads and two three-wheel items worded only in Oregon's manual (hard braking as the best avoidance option; drifting into another lane when a turn is entered too fast) went to the Oregon file. Universal motorcycle questions only where the MSF Motorcycle Operator Manual (the basis of the universal bank) says the same: only time removes alcohol, the friction zone, choosing the lane position where you are most likely to be seen with a space cushion, single-file groups of three-wheelers, and leaning the upper body toward the turn on a three-wheeler.

Answer-position spread of the 40 questions written in this FL/OR/MD/MI run: 9/10/11/10 (positions 0-3); the correct choice is the uniquely longest option in 0 of them.

## Item-by-item table

| n | Official item | Page | Cited page | Handbook answer | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|---|---|
| 1 | Car set 1 #1 | p.25 | p.12 | B (Slippery when wet) | road-signs | COVERED | `car.rsw.028`, `car.rsw.029` | Picture not in the text; Slippery When Wet is the only choice described on the cited p.12 (PDF 20). |
| 2 | Car set 1 #2 | p.25 | p.7 | A (Do Not Enter) | road-signs | COVERED | `car.rs.128`, `car.rs.042` |  |
| 3 | Car set 1 #3 | p.25 | p.15 | C (treat it like there are stop signs in all directions) | signals-markings | COVERED | `car.row.063`, `car.row.065` |  |
| 4 | Car set 2 #1 | p.45 | p.34 | B (speed up and merge with traffic) | freeway | COVERED | `car.fw.001`, `car.fw.003` |  |
| 5 | Car set 2 #2 | p.45 | p.22 | C (passing is allowed on your side) | signals-markings | COVERED | `car.sm.042`, `car.smv.028` |  |
| 6 | Car set 2 #3 | p.45 | p.31 | B (do not begin your pass before the start of a passing zone) | lanes-passing | COVERED | `car.lp.009`, `car.lp.059`, `car.rsw.050` |  |
| 7 | Car set 2 #4 | p.45 | p.27 | A (where the rear tires meet the road) | speed-space | MISSING | **`or.car.102`** (new) | Only the KS and OR handbooks give this rule, so it is Oregon-specific. |
| 8 | Car set 3 #1 | p.53 | p.41 | C (turn into the closest lane in the direction you want to go) | intersections-turns | COVERED | `car.it.002`, `car.it.009`, `car.it.003` |  |
| 9 | Car set 3 #2 | p.53 | p.43 | A (yield, wait for a gap and merge into traffic) | right-of-way | COVERED | `car.row.066` |  |
| 10 | Car set 3 #3 | p.53 | p.40 | C (can turn on the red light after yielding to other traffic) | intersections-turns | COVERED | `or.car.065` |  |
| 11 | Car set 4 #1 | p.69 | p.59 | B (at all times) | hazards-conditions | COVERED | `or.car.093` | Oregon: temporary work zone limits apply at all times (Michigan differs: see coverage-MI.md #9). |
| 12 | Car set 4 #2 | p.69 | p.55 | A (traffic in all lanes must stop) | right-of-way | COVERED | `or.car.078` |  |
| 13 | Car set 4 #3 | p.69 | p.53 | B (wait until the large vehicle turns before you turn right) | sharing-road | COVERED | `car.it.045`, `car.scni.032` |  |
| 14 | Car set 4 #4 | p.69 | p.50 | A (can pass to the left if you leave enough distance to prevent contact with the person on the bicycle if they fall into your lane) | sharing-road | COVERED | `or.car.080` |  |
| 15 | Car set 4 #5 | p.70 | p.58 | C (drive through the intersection, pull to the right and stop) | right-of-way | COVERED | `car.row.058`, `car.scni.034` |  |
| 16 | Car set 5 #1 | p.75 | p.66 | C (watch for pedestrians and pass with caution) | sharing-road | PARTIAL | `or.car.083`, `car.sr.049`, **`or.car.103`** (new), **`or.car.104`** (new) | Existing questions covered turning in front of streetcars, not riders around a stopped one. Cited p.66 supports C; p.65 adds: stay behind a streetcar loading in your lane until it moves or riders are clear. |
| 17 | Car set 5 #2 | p.75 | p.64 | A (15) | sharing-road | COVERED | `or.car.100` |  |
| 18 | Car set 6 #1 | p.80 | p.68 | A (12) | parking | COVERED | `or.car.099` |  |
| 19 | Car set 6 #2 | p.80 | p.68 | A (Yield to other traffic after you signal and check your blind spots and mirrors) | parking | COVERED | `car.pk.017`, `car.row.040` |  |
| 20 | Car set 7 #1 | p.95 | p.76 | A (required to dim your headlights) | hazards-conditions | COVERED | `or.car.089` |  |
| 21 | Car set 7 #2 | p.95 | p.74 | B (Stop quickly, turn quickly, speed up) | emergencies | COVERED | `car.em.039` |  |
| 22 | Car set 7 #3 | p.95 | p.83 | B (requires any open bottles or containers to be in the trunk) | alcohol-drugs | PARTIAL | `or.car.011`, **`or.car.105`** (new) | or.car.011 covered what counts as open, not where an open container belongs. |
| 23 | Car set 7 #4 | p.95 | p.80 | B (Ignore the text until you stop in a safe parking area) | safe-habits | COVERED | `car.sh.005`, `or.car.014` |  |
| 24 | MC Sec.2 #1 | p.16 | p.7 | B (Time) | mc-impairment | PARTIAL | `mc.imp.009`, `mc.imp.014`, **`mc.cvfom.001`** (new) | The motorcycle bank taught the one-drink-per-hour rate, not that nothing else (coffee, showers, exercise) removes alcohol. |
| 25 | MC Sec.2 #2 | p.16 | p.7 | C (Can affect your ability to ride safely) | mc-impairment | COVERED | `mc.imp.005` |  |
| 26 | MC Sec.2 #3 | p.16 | p.8 | C (Increase your following distance) | mc-impairment | PARTIAL | `mc.gear.046`, **`or.mc.011`** (new) | mc.gear.046 covers dressing warmly, not slower reactions and extra space; Oregon-only advice. |
| 27 | MC Sec.3 #1 | p.23 | p.12 | C (Fits snugly all the way around your head) | mc-gear-controls | COVERED | `mc.gear.009` |  |
| 28 | MC Sec.3 #2 | p.23 | p.13 | B (Synthetic or leather clothing) | mc-gear-controls | COVERED | `mc.gear.017` | mc.gear.017 keys leather; its explanation adds sturdy synthetic material, matching Oregon. |
| 29 | MC Sec.3 #3 | p.23 | p.14 | B (Conduct a pre-ride check) | mc-gear-controls | COVERED | `mc.gear.032` |  |
| 30 | MC Sec.4 #1 | p.29 | p.19 | C (Keep your right wrist flat) | mc-basic-control | COVERED | `mc.ctl.002`, `mc.ctl.003` |  |
| 31 | MC Sec.4 #2 | p.29 | p.20 | A (Point on the clutch where the engine’s power begins to transmit to the rear wheel) | mc-basic-control | MISSING | **`mc.cvfom.002`** (new) | The motorcycle bank never defined the friction zone. |
| 32 | MC Sec.4 #3 | p.29 | p.21 | C (Squeeze the front brake lever and press down on the rear brake pedal gradually until stopped) | mc-basic-control | COVERED | `mc.crash.001`, `mc.ctl.026`, `mc.ctl.029` |  |
| 33 | MC Sec.4 #4 | p.29 | p.22 | A (Slow, Look, Roll, Press) | mc-basic-control | PARTIAL | `mc.ctl.034`, **`or.mc.012`** (new) | Oregon orders the steps Slow, Look, Roll, Press; MSF (mc.ctl.034) uses Slow, Look, Press, Roll. See Conflicts. |
| 34 | MC Sec.5 #1 | p.40 | p.26 | B (Drivers turning left in front of you) | mc-intersections | COVERED | `mc.int.003` |  |
| 35 | MC Sec.5 #2 | p.40 | p.28 | B (The lane portion where you are most likely to be seen) | mc-lane-position | PARTIAL | `mc.lane.004`, `mc.lane.003`, **`mc.cvfom.003`** (new) | Existing questions said no part of the lane must be avoided, not what should decide your position. |
| 36 | MC Sec.5 #3 | p.40 | p.32 | A (An alternate path of travel you can take if a hazard develops) | mc-lane-position | COVERED | `mc.lane.037`, `mc.lane.017` | Escape paths are taught in context rather than defined. |
| 37 | MC Sec.6 #1 | p.46 | p.36 | A (Knees against the tank and eyes up) | mc-crash-avoidance | COVERED | `mc.ctl.025` |  |
| 38 | MC Sec.6 #2 | p.46 | p.36 | A (Straighten the motorcycle, square the handlebars and then stop) | mc-crash-avoidance | COVERED | `mc.ctl.030`, `mc.crash.006` |  |
| 39 | MC Sec.6 #3 | p.46 | p.37 | C (Separate braking from swerving) | mc-crash-avoidance | COVERED | `mc.crash.013` |  |
| 40 | MC Sec.7 #1 | p.50 | p.41 | C (Use caution and slow down) | mc-crash-avoidance | MISSING | **`or.mc.013`** (new) | Crowned roads are not in the MSF manual, so Oregon-specific. |
| 41 | MC Sec.7 #2 | p.50 | p.43 | A (Move away from other vehicles as they approach or pass you) | mc-crash-avoidance | COVERED | `mc.lane.027`, `mc.scn.008` |  |
| 42 | MC Sec.7 #3 | p.50 | p.43 | A (Slow down and downshift, then accelerate away from the dog as it approaches) | mc-crash-avoidance | COVERED | `mc.crash.044` |  |
| 43 | MC Sec.8 #1 | p.54 | p.45 | B (Affect the way your motorcycle handles, requiring extra practice, preparation and caution) | mc-passengers-groups | COVERED | `mc.pass.013`, `mc.pass.001` |  |
| 44 | MC Sec.8 #2 | p.54 | p.46 | A (Tighten their hold) | mc-passengers-groups | COVERED | `mc.pass.012` |  |
| 45 | MC Sec.9 #1 | p.60 | p.51 | B (Hard braking) | mc-crash-avoidance | MISSING | **`or.mc.014`** (new) | MSF only says to plan ahead to avoid swerving; 'hard braking may be best' is Oregon's wording. |
| 46 | MC Sec.9 #2 | p.60 | p.50 | C (Cross into another lane of traffic) | mc-basic-control | MISSING | **`or.mc.015`** (new) | Oregon wording (MSF discusses tipping/wheel lift). |
| 47 | MC Sec.9 #3 | p.60 | p.50 | B (In single file) | mc-passengers-groups | MISSING | **`mc.cvfom.004`** (new) | MSF Three-Wheel Supplement says the same (single file). |
| 48 | MC Sec.9 #4 | p.60 | p.52 | C (Lean or shift your weight in the direction of the turn) | mc-basic-control | PARTIAL | `mc.ctl.044`, **`mc.cvfom.005`** (new) | mc.ctl.044 says three-wheelers can't countersteer, not what the rider's body should do. |
