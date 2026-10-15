# Michigan — official sample questions vs. DriveReady coverage

_Audit date: 2026-10-15. Source: What Every Driver Must Know, Oct. 2025 (`research/handbooks/MI.txt`): the 10-question "Safe Driving Knowledge Test" (PDF pp. 83–84; answer key on PDF p. 87) and the 54-sign "Traffic sign challenge" (pictures on PDF p. 57, printed answers on PDF pp. 58–59). The sign challenge has no answer choices: each item is a picture to name, so its printed answer is stored as `keyText` and `answer` is null. Items are numbered 1–10 (knowledge test) and 11–64 (sign challenge #1–#54). Page numbers are the `=== PAGE n ===` markers (the PDF numbering the app's MI refs use; printed page = PDF page − 14). No Michigan motorcycle manual is in `research/handbooks/`; `research/raw/MI/sample_test.pdf` is a saved 404 page, not a test. Extracted questions: `research/official-samples/MI.json` (research only — never shipped, never copied into the app)._

## Summary

| | Count |
|---|---|
| Official sample items (10 multiple-choice, keyed; 54 sign-identification, keyed by name) | **64** |
| COVERED (an app question tests the same fact with the same answer) | **59** |
| PARTIAL (related app question, different fact/angle) | **4** |
| MISSING (no app question) | **1** |
| New questions written | **5** — 1 Michigan (`mi.car.106` in `app/src/content/questions/states/MI.json`) + 4 universal car (`car.cvfom.004`–`car.cvfom.007` in `app/src/content/questions/car/coverage-fl-or-md-mi.json`) |

Knowledge test: 10 items → 8 covered, 2 partial, 0 missing. Sign challenge: 54 items → 51 covered, 2 partial, 1 missing; every challenge sign but the time-limit parking sign and the pink incident sign has an image in the sign library, and the incident sign's meaning is taught in text (`mi.car.100`).

Validator: `node scripts/validate-content.mjs src/content/questions/states/FL.json src/content/questions/states/OR.json src/content/questions/states/MI.json src/content/questions/car/coverage-fl-or-md-mi.json src/content/questions/motorcycle/coverage-fl-or-md-mi.json`
→ **0 errors, 0 warnings** (no duplicate prompts).

Index: not rebuilt here (per the audit instructions). `node scripts/check-content-index.mjs` reports stale hashes for `states/FL.json`, `states/OR.json`, `states/MI.json` and the unindexed new files `questions/car/coverage-fl-or-md-mi.json` and `questions/motorcycle/coverage-fl-or-md-mi.json` (plus `states/ID.json`, another agent's in-progress state); run `node scripts/build-content-index.mjs` (with `EXCLUDE_STATES` for in-progress states).

## Answer key check

The knowledge-test key is one line on PDF p. 87 — "1 (c); 2 (d); 3 (d); 4 (b); 5 (b); 6 (d); 7 (c); 8 (d); 9 (b); 10 (a)" — with no columns to interleave. Each entry was checked against the handbook body: #2 flashing red = full stop, then proceed when clear (p. 64); #6 keep your eyes on the right edge of the road (p. 78); #7 flashing yellow = proceed carefully (p. 64); #9 matches the work-zone text on p. 41 ("may limit speeds to 45 mph when workers are present, yet allow traffic to return to the normally posted speed when workers are absent"); #10 matches the passing-bicyclists text (p. 71). #8: the body only says to check your blind spots (p. 70); the key's head check is standard and matches the app (`car.lp.004`). The sign-challenge answers are numbered 1–54 in two runs (1–30 on p. 58, 31–54 on p. 59) and were read in order.

## Conflicts (official key vs. app)

**None.** No official answer disagrees with an app question's key or explanation, and no existing app question was changed. Items reviewed closely:

| Official # | Issue | Resolution |
|---|---|---|
| 9 (knowledge test #9) | Key B: with a WHERE WORKERS PRESENT 45 sign, drive at a safe speed up to the posted limit and slow to 45 mph or less where workers are present. `mi.car.049` (most work zones are 45 mph unless posted otherwise) is consistent; Oregon differs (temporary work-zone limits apply at all times, `or.car.093`). | New Michigan question `mi.car.106`; universal work-zone questions state neither rule. |
| 42 (sign #32, Road Curves Ahead) | Michigan pictures a left-then-right reverse curve; the library has the right-then-left versions (W1-3R, W1-4R). | Same knowledge; no change. |
| 11 (sign #1, Incident Ahead) | Fluorescent pink incident sign; no image in the library. | Meaning taught by `mi.car.100`; counted COVERED. |
| 54 (sign #44, Road Work Ahead) | The W20-1 image is used only in a Wisconsin question. | Universal `car.rs.123` teaches that orange signs mean road work ahead; counted COVERED. |

## New questions

Michigan-specific (`states/MI.json`, `"states": ["MI"]`):
- `mi.car.106` (speed-space) — You pass a Michigan work zone sign that reads WHERE WORKERS PRESENT 45. In a part of the zone where no workers are present, what speed applies? → _A safe speed, up to the normal posted limit_ (What Every Driver Must Know (Oct. 2025), p. 41) — closes #9

Universal car (`car/coverage-fl-or-md-mi.json`):
- `car.cvfom.004` (freeway) — Mile for mile, why is driving on city streets usually riskier than driving on an expressway? → _They have cross traffic, intersections and pedestrians_ (State driver handbooks (e.g. MI p.74, NV p.36, MD p.31)) — closes #1
- `car.cvfom.005` (parking) — A sign at the curb reads 2 HOUR PARKING 8:30 AM – 5:30 PM. What does it mean? → _From 8:30 a.m. to 5:30 p.m., you may park there for up to 2 hours_ (MUTCD Sec. 2B (parking signs); Michigan What Every Driver Must Know (Oct. 2025), p. 58) — closes #22 (sign #12)
- `car.cvfom.006` (road-signs) — What does this sign warn you about? → _Bicyclists may be riding on or crossing the road ahead_ (MUTCD Sec. 2C (W11-1); state driver handbooks (e.g. MI p.59, FL p.58, KS p.36, MD p.22)) — closes #45 (sign #35)
- `car.cvfom.007` (road-signs) — What does this sign tell you? → _A roundabout is ahead; slow down and get ready to yield_ (MUTCD Sec. 2C (W2-6); state driver handbooks (e.g. MI p.59, OR p.20, LA p.30, MO p.50)) — closes #53 (sign #43)

State-specific vs. universal decisions: the "where workers present" speed rule is Michigan's (Oregon's limits apply at all times), so it went to the Michigan file. Universal: why city streets are riskier than expressways (MI, NV and MD describe expressways' lack of intersections and cross traffic; no handbook differs), and the meanings of the time-limit parking sign, the W11-1 bicycle warning sign and the W2-6 roundabout-ahead sign, which follow the national MUTCD (the two warning signs use their library images).

Answer-position spread of the 40 questions written in this FL/OR/MD/MI run: 9/10/11/10 (positions 0-3); the correct choice is the uniquely longest option in 0 of them.

## Item-by-item table

| n | Official item | Page | Key | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|---|
| 1 | Knowledge test #1 | p.83 | C | safe-habits | PARTIAL | `car.cvtwu.001`, **`car.cvfom.004`** (new) | car.cvtwu.001 notes interstates lack cross traffic but asks about alertness, not why city streets are riskier. |
| 2 | Knowledge test #2 | p.83 | D | signals-markings | COVERED | `car.sm.015`, `car.sm.017` |  |
| 3 | Knowledge test #3 | p.83 | D | freeway | COVERED | `car.fw.008`, `car.scnr.022` |  |
| 4 | Knowledge test #4 | p.83 | B | right-of-way | COVERED | `car.row.026` |  |
| 5 | Knowledge test #5 | p.83 | B | freeway | COVERED | `car.fw.003`, `car.fw.004` |  |
| 6 | Knowledge test #6 | p.84 | D | hazards-conditions | COVERED | `car.hz.005` |  |
| 7 | Knowledge test #7 | p.84 | C | signals-markings | COVERED | `car.sm.016` |  |
| 8 | Knowledge test #8 | p.84 | D | lanes-passing | COVERED | `car.lp.004`, `car.lp.056` |  |
| 9 | Knowledge test #9 | p.84 | B | speed-space | PARTIAL | `mi.car.049`, **`mi.car.106`** (new) | Only mi.car.049's explanation mentioned limits that lapse when workers are absent. |
| 10 | Knowledge test #10 | p.84 | A | sharing-road | COVERED | `car.scnr.012`, `car.sr.021`, `car.ss.055` |  |
| 11 | Sign challenge #1 | p.57 | Incident Ahead | road-signs | COVERED | `mi.car.100` | Fluorescent pink incident sign (meaning taught in text; no pink sign image in the library). |
| 12 | Sign challenge #2 | p.57 | Gas Pump | road-signs | COVERED | `car.rsg.030` | D9-7 |
| 13 | Sign challenge #3 | p.57 | Exit | road-signs | COVERED | `car.rsg.020` | E5-1 |
| 14 | Sign challenge #4 | p.57 | Bridge Ices Before Road | road-signs | COVERED | `car.rsw.032` | W8-13 |
| 15 | Sign challenge #5 | p.57 | One Way | road-signs | COVERED | `car.rs.050` | R6-1R |
| 16 | Sign challenge #6 | p.57 | Speed Limit 50 | road-signs | COVERED | `car.rs.011` | R2-1 |
| 17 | Sign challenge #7 | p.57 | Yellowstone National Park | road-signs | COVERED | `car.rs.125`, `car.rsg.033` | Brown recreation/cultural guide sign. |
| 18 | Sign challenge #8 | p.57 | School Children Present | road-signs | COVERED | `car.rs.098`, `car.rs.099` | S1-1 |
| 19 | Sign challenge #9 | p.57 | Brookfield/Onondaga | road-signs | COVERED | `car.rsg.013` | D1-1 |
| 20 | Sign challenge #10 | p.57 | Reserved parking with wheelchair symbol | road-signs | COVERED | `car.rs.055` | R7-8 |
| 21 | Sign challenge #11 | p.57 | State Route Marker | road-signs | COVERED | `car.rsg.024` | M1-5 |
| 22 | Sign challenge #12 | p.57 | Parking Permitted | road-signs | MISSING | **`car.cvfom.005`** (new) | No question on time-limited (permissive) parking signs; no image in the library, so a text question was written. |
| 23 | Sign challenge #13 | p.57 | Stop Sign | road-signs | COVERED | `car.rs.001` | R1-1 |
| 24 | Sign challenge #14 | p.57 | Yield | road-signs | COVERED | `car.rs.003`, `car.rs.004` | R1-2 |
| 25 | Sign challenge #15 | p.57 | No Turn On Red | road-signs | COVERED | `car.rs.068`, `car.rs.066` | R10-11a / R10-11 |
| 26 | Sign challenge #16 | p.57 | No Right Turn | road-signs | COVERED | `car.rs.016` | R3-1 |
| 27 | Sign challenge #17 | p.57 | No U Turn | road-signs | COVERED | `car.rs.019` | R3-4 |
| 28 | Sign challenge #18 | p.57 | Left Turn Lanes | road-signs | COVERED | `car.rs.023`, `car.rs.025`, `car.rs.026` | Lane-use control signs R3-5L / R3-6L / R3-7L. |
| 29 | Sign challenge #19 | p.57 | Center Lane Left Turn Only | road-signs | COVERED | `car.rs.028` | R3-9b |
| 30 | Sign challenge #20 | p.57 | Do Not Pass | road-signs | COVERED | `car.rs.033`, `car.rs.034` | R4-1 |
| 31 | Sign challenge #21 | p.57 | Pass With Care | road-signs | COVERED | `car.rs.035`, `car.rs.036` | R4-2 |
| 32 | Sign challenge #22 | p.57 | Keep Left | road-signs | COVERED | `car.rs.040` | R4-8 |
| 33 | Sign challenge #23 | p.57 | Do Not Enter | road-signs | COVERED | `car.rs.042`, `car.rs.043` | R5-1 |
| 34 | Sign challenge #24 | p.57 | Authorized Vehicles Only | road-signs | COVERED | `mi.car.086`, `car.ph.017` | Median crossovers are for emergency/MDOT vehicles only. |
| 35 | Sign challenge #25 | p.57 | Wrong Way | road-signs | COVERED | `car.rs.044`, `car.rs.045` | R5-1a |
| 36 | Sign challenge #26 | p.57 | No Trucks Allowed | road-signs | COVERED | `car.rs.046` | R5-2 |
| 37 | Sign challenge #27 | p.57 | RR Crossbuck | road-signs | COVERED | `car.rs.111`, `car.rs.113` | R15-1 with R15-2P (3 tracks). |
| 38 | Sign challenge #28 | p.57 | Rest Area | road-signs | COVERED | `car.rsg.026` | D5-1 |
| 39 | Sign challenge #29 | p.57 | School Crossing | road-signs | COVERED | `car.rs.100`, `car.rs.101` | S1-1 with W16-7P |
| 40 | Sign challenge #30 | p.57 | Slow-Moving Vehicle | road-signs | COVERED | `car.smv.049`, `mi.car.080` | SMV emblem |
| 41 | Sign challenge #31 | p.57 | Road Turns Left | road-signs | COVERED | `car.rs.081`, `car.rs.082` | W1-1L |
| 42 | Sign challenge #32 | p.57 | Road Curves Ahead | road-signs | COVERED | `car.rs.088`, `car.rs.089` | Michigan shows the left-then-right version; the library has the mirror image (W1-3R / W1-4R). |
| 43 | Sign challenge #33 | p.57 | Winding Curve Ahead, Limit Speed | road-signs | COVERED | `car.rs.090`, `car.rsw.045` | W1-5R with W13-1P advisory speed. |
| 44 | Sign challenge #34 | p.57 | RR | road-signs | COVERED | `car.rsw.064`, `car.rsw.065`, `car.rs.122` | W10-1 |
| 45 | Sign challenge #35 | p.57 | Watch for Bicyclists | road-signs | PARTIAL | `car.rsw.052`, `car.rsw.053`, **`car.cvfom.006`** (new) | The W11-1 sign itself was shown only in MN/WI state questions; universal questions tested the plaques under it. |
| 46 | Sign challenge #36 | p.57 | Watch for Pedestrians | road-signs | COVERED | `car.rsw.036` | W11-2 |
| 47 | Sign challenge #37 | p.57 | Obstacle in Roadway | road-signs | COVERED | `car.rsw.042` | W12-1 |
| 48 | Sign challenge #38 | p.57 | Maximum Height Allowed | road-signs | COVERED | `car.rsw.043`, `car.rsw.044` | W12-2 |
| 49 | Sign challenge #39 | p.57 | Exit 25 mph | road-signs | COVERED | `car.rsw.046`, `car.rsw.045` | W13-2 |
| 50 | Sign challenge #40 | p.57 | No Passing Zone | road-signs | COVERED | `car.rsw.049`, `car.rsw.050`, `car.rs.120` | W14-3 |
| 51 | Sign challenge #41 | p.57 | Intersection Ahead | road-signs | COVERED | `car.rs.094` | W2-1 |
| 52 | Sign challenge #42 | p.57 | Side Road Ahead | road-signs | COVERED | `car.rs.095` | W2-2R |
| 53 | Sign challenge #43 | p.57 | Roundabout Ahead | road-signs | PARTIAL | `car.row.066`, `car.rs.053`, **`car.cvfom.007`** (new) | Roundabout rules and the R6-4 sign were taught, but the W2-6 advance warning sign appeared only in a WI question. |
| 54 | Sign challenge #44 | p.57 | Road Work Ahead | road-signs | COVERED | `car.rs.123`, `car.fw.050` | Orange construction warning (W20-1 image appears only in a WI question). |
| 55 | Sign challenge #45 | p.57 | Stop Ahead | road-signs | COVERED | `car.rsw.001`, `car.rsw.002` | W3-1 |
| 56 | Sign challenge #46 | p.57 | Yield Ahead | road-signs | COVERED | `car.rsw.003` | W3-2 |
| 57 | Sign challenge #47 | p.57 | Merging Traffic | road-signs | COVERED | `car.rsw.008`, `car.rsw.009` | W4-1R |
| 58 | Sign challenge #48 | p.57 | Lane Ends Merge Left | road-signs | COVERED | `car.cvkic.003`, `car.rsw.034` | W4-2R / W9-1 |
| 59 | Sign challenge #49 | p.57 | Divided Highway Ends | road-signs | COVERED | `car.rsw.018`, `car.rsw.019` | W6-2 |
| 60 | Sign challenge #50 | p.57 | Two-Way Traffic | road-signs | COVERED | `car.rsw.020`, `car.rsw.021` | W6-3 |
| 61 | Sign challenge #51 | p.57 | Hill | road-signs | COVERED | `car.rsw.022`, `car.rsw.023` | W7-1 |
| 62 | Sign challenge #52 | p.57 | Slippery When Wet | road-signs | COVERED | `car.rsw.028`, `car.rsw.029` | W8-5 |
| 63 | Sign challenge #53 | p.57 | Right Lane Ends | road-signs | COVERED | `car.rsw.034`, `car.rsw.035` | W9-1 |
| 64 | Sign challenge #54 | p.57 | Bicyclists and Pedestrians | road-signs | COVERED | `car.rsw.041` | W11-15 |
