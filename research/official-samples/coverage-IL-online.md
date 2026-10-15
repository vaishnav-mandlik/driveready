# Illinois — official practice exam (Rules of the Road Review Course) vs. DriveReady coverage

_Audit date: 2026-10-15. Extracted questions: `research/official-samples/IL-online.json` (research only — never shipped, never copied into the app). Page refs are the `=== PAGE n ===` markers of `research/handbooks/IL.txt` (Illinois Rules of the Road 2026; PDF page = printed page + 3; the numbering the app's IL refs use)._

## What was collectable

| Source (official) | What it is | Collected |
|---|---|---|
| https://www.ilsos.gov/content/dam/publications/pdf_publications/dsd_ds9.pdf (from `officialPracticeTests`) | Secretary of State "Rules of the Road Review Course" workbook (PDF title "Illinois Rules of the Road Workbook", 36 pp., created Nov. 2023): explains the exams, then a 24-sign **identification exercise** (match each pictured sign to one of 24 names) and **62 written sample questions** (48 true/false, 14 multiple choice); key on PDF p. 31 (printed p. 29) | **Yes** — 86 items (n 1-62 written, n 63-86 signs (a)-(x)). The live download failed three times (HTTP/2 stream error, then HTTP/1.1 receive timeouts from ilsos.gov), so the copy of the same URL downloaded for the project on 2026-10-13 (`research/raw/IL/ds9.pdf`, left in place) was used. |

Because ilsos.gov did not respond, its other pages could not be checked this time for further practice tests (none is listed in `officialPracticeTests`; the handbook's chapter study questions were audited separately in `coverage-IL.md`). 3 GET attempts (all failed), at least 2 s apart; nothing behind a login or CAPTCHA; no form submitted. `research/raw/online-IL` (empty) was deleted.

**Key extraction.** The key is printed in columns: the sign key in four columns ((a)-(d) on the first row), the written key in three columns (1-22, 23-44, 45-62). Plain text extraction reads the sign key column by column, so every pairing was confirmed by word positions (label and answer on the same baseline), and the 24 sign answers were checked against the rendered sign page (all match: e.g. (f) the chevron = "Warning of a change in direction", (j) W6-1 = "Divided Highway", (w) W4-2 = "Reduction in Lanes"). Every written key was checked against the handbook; all agree.

## Summary

| | Count |
|---|---|
| Official questions (all keyed) | **86** (62 written + 24 signs) |
| COVERED | **84** |
| PARTIAL | **1** (#2) |
| MISSING | **1** (#18) |
| New questions written | **2** Illinois (`il.car.121`-`il.car.122` in `app/src/content/questions/states/IL.json`); no universal question needed |

58 of the 62 written items are near-identical to the handbook's chapter study questions (`IL.json`, analyzed in `coverage-IL.md`; mapping in the notes). The 4 that are not: #2 (child restraint in any seat), #18 (headsets), #33 (only time removes alcohol) and #61 (taillights at night). All 24 signs already had image questions.

Validator: `node scripts/validate-content.mjs src/content/questions/states/CT.json src/content/questions/states/IL.json src/content/questions/states/MN.json src/content/questions/car/coverage-online-b.json` → **0 errors, 0 warnings** (no duplicate prompts).

Index: not rebuilt here (per the audit instructions). Run `node scripts/build-content-index.mjs` (with `EXCLUDE_STATES` for in-progress states): `states/CT.json`, `states/IL.json` and `states/MN.json` hashes changed and `questions/car/coverage-online-b.json` is new.

## Conflicts (official key vs. app)

None — no app question was changed. Items reviewed closely:

| Official # | Issue | Resolution |
|---|---|---|
| 1 | Key True: phone use is allowed with a hands-free device. The handbook (p. 25) allows hands-free only for drivers 19 and older. | The workbook item states the adult rule; the app teaches both (`il.car.014` adults, `il.car.015` under 19). Consistent. |
| 31, 34 | .08% → suspension of at least 6 months; refusal → 12 months (True, True). | Match `il.car.006` and `il.car.005`. |
| 37 | Crash report when death, injury or damage over $1,500 (over $500 if uninsured) — True. | Matches `il.car.072`, `il.car.073`. |
| 44 | "A railroad crossing sign should be treated the same as a yield sign" — True (the crossbuck). | Matches `car.rs.111`; the handbook's #68 says crossbuck. |
| 57 | "Apply the brakes and steer in the opposite direction of the skid" — False. | Consistent with `car.em.008` (ease off, steer where you want to go). |
| 2 | Key a (anywhere in the vehicle). Handbook p. 26: all children under 8 must be secured in an appropriate child restraint system (front-seat rules on the same page). | `il.car.020` taught the age only → new `il.car.122`. |

## New questions

Illinois-specific (`states/IL.json`, `"states": ["IL"]`):
- `il.car.121` (safe-habits) — Under Illinois law, which of these may a 30-year-old driver wear while driving? → _A one-ear earpiece for a phone call_ (Illinois Rules of the Road 2026, p. 25) — closes #18
- `il.car.122` (safe-habits) — An Illinois driver is carrying a 5-year-old. Where in the vehicle must the child be secured in an appropriate child restraint system? → _In any seat, front or back_ (Illinois Rules of the Road 2026, p. 26) — closes #2

Answer-position spread of the 16 questions written or rewritten in this CT/FL/IN/IL/MN run (15 new + `ct.car.058`): 4/4/4/4 (positions 0/1/2/3); the correct choice is the uniquely longest option in 0 of them. Wording is original (official wording was not copied).

## Item-by-item table

n 1-62 = written sample questions (T/F items: A = True, B = False); n 63-86 = sign identification (a)-(x), key = number of the matching name.

| n | Official item | Key | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|
| 1 | Written exam sample question #1: Cellphone use while driving is permitted as long as you are using a h… | A | safe-habits | COVERED | `il.car.014`, `il.car.015` | ~ handbook study question IL.json #21; key True is the adult rule: drivers under 19 may not use any phone, even hands-free (il.car.015) |
| 2 | Written exam sample question #2: Illinois law requires children under 8 years old to be secured by a r… | A | safe-habits | PARTIAL | `il.car.020`, `il.car.019`, **`il.car.122`** (new) | not among the handbook study questions; the age (8) was taught, not that the rule applies in every seat |
| 3 | Written exam sample question #3: A parent or legal guardian may request that the driver’s license of a… | A | laws-licensing | COVERED | `il.car.088` | ~ handbook study question IL.json #3 |
| 4 | Written exam sample question #4: When passing another vehicle, you should wait until the entire car yo… | A | lanes-passing | COVERED | `car.lp.037`, `car.scnr.028` | ~ handbook study question IL.json #7 |
| 5 | Written exam sample question #5: After making a complete stop and yielding to traffic or pedestrians w… | A | intersections-turns | COVERED | `il.car.035` | ~ handbook study question IL.json #8 |
| 6 | Written exam sample question #6: How should you proceed if you are within an intersection waiting to m… | B | intersections-turns | COVERED | `il.car.103` | ~ handbook study question IL.json #9 |
| 7 | Written exam sample question #7: When on a two-lane roadway, you must stop your vehicle if approaching… | A | sharing-road | COVERED | `il.car.046`, `car.sr.052` | ~ handbook study question IL.json #10 |
| 8 | Written exam sample question #8: When an authorized vehicle using its sirens and flashing lights appro… | A | right-of-way | COVERED | `il.car.040`, `car.row.056` | ~ handbook study question IL.json #11 |
| 9 | Written exam sample question #9: Your driving privileges will be suspended if you are convicted of ill… | A | sharing-road | COVERED | `il.car.048` | ~ handbook study question IL.json #12 |
| 10 | Written exam sample question #10: You may pass another vehicle by driving on the shoulder of the road. | B | lanes-passing | COVERED | `car.lp.058` | ~ handbook study question IL.json #13 |
| 11 | Written exam sample question #11: It is permissible to make a right turn against a red signal light aft… | A | intersections-turns | COVERED | `il.car.034` | ~ handbook study question IL.json #14 |
| 12 | Written exam sample question #12: You must give the right- or left-turn signal when changing lanes. | A | lanes-passing | COVERED | `car.lp.010` | ~ handbook study question IL.json #15 |
| 13 | Written exam sample question #13: In urban areas, if you are moving out of an alley, building, private… | B | right-of-way | COVERED | `car.scni.036`, `car.row.036` | ~ handbook study question IL.json #16 |
| 14 | Written exam sample question #14: For what distance should a continuous turn signal be given when makin… | C | intersections-turns | COVERED | `il.car.032` | ~ handbook study question IL.json #17 |
| 15 | Written exam sample question #15: When waiting at an intersection and the traffic signal light turns gr… | A | right-of-way | COVERED | `car.row.033`, `car.row.035` | ~ handbook study question IL.json #18 |
| 16 | Written exam sample question #16: What should you do when approaching a construction area? | B | hazards-conditions | COVERED | `car.fw.050`, `il.car.031`, `il.car.016` | ~ handbook study question IL.json #19 |
| 17 | Written exam sample question #17: You are not required to yield to pedestrians in a crosswalk. | B | right-of-way | COVERED | `car.row.042`, `car.row.044` | ~ handbook study question IL.json #20 |
| 18 | Written exam sample question #18: It is permissible for anyone to wear a headset while driving. | B | safe-habits | MISSING | **`il.car.121`** (new) | not among the handbook study questions |
| 19 | Written exam sample question #19: Speed should be reduced below the posted speed limit for which of the… | C | speed-space | COVERED | `il.car.104`, `car.ss.001` | ~ handbook study question IL.json #22 |
| 20 | Written exam sample question #20: Slow vehicles should use the right-hand lane except when passing or t… | A | lanes-passing | COVERED | `car.lp.002` | ~ handbook study question IL.json #23 |
| 21 | Written exam sample question #21: When must you slow down in a school zone? | A | speed-space | COVERED | `il.car.027` | ~ handbook study question IL.json #24 |
| 22 | Written exam sample question #22: When parked, you may open car doors on the side on which traffic is m… | A | parking | COVERED | `car.pk.024`, `car.pk.023`, `car.scnr.016` | ~ handbook study question IL.json #25 |
| 23 | Written exam sample question #23: Passing on a two-lane, two-way roadway within 100 feet of an intersec… | B | lanes-passing | COVERED | `il.car.050` | ~ handbook study question IL.json #26 |
| 24 | Written exam sample question #24: Only vehicles displaying special plates or parking placards for perso… | A | parking | COVERED | `car.pk.029`, `il.car.061` | ~ handbook study question IL.json #27 |
| 25 | Written exam sample question #25: Unless authorized, you may not break into the line of a funeral proce… | A | right-of-way | COVERED | `il.car.039` | ~ handbook study question IL.json #28 |
| 26 | Written exam sample question #26: When you are turning right and a bicyclist is approaching on the righ… | A | sharing-road | COVERED | `car.scnr.014`, `car.sr.019` | ~ handbook study question IL.json #35 |
| 27 | Written exam sample question #27: You do not need to allow as much distance when following a motorcycle… | B | sharing-road | COVERED | `il.car.030`, `car.ss.021` | ~ handbook study question IL.json #36 |
| 28 | Written exam sample question #28: Motorcyclists are entitled to use the full width of a traffic lane; t… | A | sharing-road | COVERED | `car.sr.022`, `car.sr.091` | ~ handbook study question IL.json #37 |
| 29 | Written exam sample question #29: When following a vehicle at night, it is important to dim your high b… | A | hazards-conditions | COVERED | `car.hz.007`, `car.sr.041` | ~ handbook study question IL.json #38 |
| 30 | Written exam sample question #30: When approaching a disabled pedestrian using a guide dog, white cane,… | A | right-of-way | COVERED | `car.row.051` | ~ handbook study question IL.json #39 |
| 31 | Written exam sample question #31: If arrested with a blood-alcohol concentration of .08% or more, your… | A | alcohol-drugs | COVERED | `il.car.006` | ~ handbook study question IL.json #41 |
| 32 | Written exam sample question #32: Alcohol is the single greatest factor in fatal motor vehicle crashes. | A | alcohol-drugs | COVERED | `il.car.105` | ~ handbook study question IL.json #42 |
| 33 | Written exam sample question #33: What is the only effective way to remove alcohol from the body? | B | alcohol-drugs | COVERED | `car.ad.002`, `car.ad.009` | not among the handbook study questions |
| 34 | Written exam sample question #34: If you are arrested for DUI and refuse to submit to testing, your dri… | A | alcohol-drugs | COVERED | `il.car.005` | ~ handbook study question IL.json #44 |
| 35 | Written exam sample question #35: If your license has been revoked as a result of DUI, you must meet se… | A | alcohol-drugs | COVERED | `il.car.107` | ~ handbook study question IL.json #45 |
| 36 | Written exam sample question #36: It is illegal for persons under 21 years old to drive with any trace… | A | alcohol-drugs | COVERED | `il.car.003` | ~ handbook study question IL.json #46 |
| 37 | Written exam sample question #37: Regardless of fault, a crash report must be filed by the driver of a… | A | emergencies | COVERED | `il.car.072`, `il.car.073` | ~ handbook study question IL.json #47 |
| 38 | Written exam sample question #38: Before you can regain driving privileges after losing them for failur… | A | laws-licensing | COVERED | `il.car.108` | ~ handbook study question IL.json #48 |
| 39 | Written exam sample question #39: If you are involved in a traffic crash, you should stop your vehicle… | A | emergencies | COVERED | `car.em.059` | ~ handbook study question IL.json #49 |
| 40 | Written exam sample question #40: Driving privileges may be revoked for giving false information to the… | A | laws-licensing | COVERED | `il.car.111` | ~ handbook study question IL.json #54 |
| 41 | Written exam sample question #41: What should you do when approaching a traffic control signal that is… | A | right-of-way | COVERED | `il.car.037`, `car.row.063` | ~ handbook study question IL.json #65 |
| 42 | Written exam sample question #42: If a traffic light shows both a red light and a green arrow at the sa… | B | signals-markings | COVERED | `car.sm.010` | ~ handbook study question IL.json #66 |
| 43 | Written exam sample question #43: You may pass on a two-lane roadway marked with a single solid yellow… | B | signals-markings | COVERED | `car.lp.009`, `car.sm.043` | ~ handbook study question IL.json #67 |
| 44 | Written exam sample question #44: A railroad crossing sign should be treated the same as a yield sign. | A | road-signs | COVERED | `car.rs.111`, `car.sr.056` | ~ handbook study question IL.json #68 |
| 45 | Written exam sample question #45: All vehicles are required to stop within how many feet of the nearest… | A | sharing-road | COVERED | `il.car.063` | ~ handbook study question IL.json #31 |
| 46 | Written exam sample question #46: When approaching a railroad crossing without warning signals (such as… | A | sharing-road | COVERED | `car.sr.056`, `car.rsw.068` | ~ handbook study question IL.json #32 |
| 47 | Written exam sample question #47: After a train clears a crossing with flashing signals, you may procee… | A | sharing-road | COVERED | `car.sm.036` | ~ handbook study question IL.json #34 |
| 48 | Written exam sample question #48: If moving with a stream of vehicles across a railroad track, it is sa… | B | sharing-road | COVERED | `car.sr.058`, `car.rsw.060` | ~ handbook study question IL.json #33 |
| 49 | Written exam sample question #49: The road surface of a bridge may be dangerous in winter due to ice bu… | A | hazards-conditions | COVERED | `car.hz.033`, `car.rsw.032` | ~ handbook study question IL.json #71 |
| 50 | Written exam sample question #50: When driving in fog, you should turn on the high-beam headlights to i… | B | hazards-conditions | COVERED | `car.hz.008` | ~ handbook study question IL.json #72 |
| 51 | Written exam sample question #51: Most rear-end collisions are caused by the vehicle in back following… | A | speed-space | COVERED | `car.fw.025` | ~ handbook study question IL.json #73 |
| 52 | Written exam sample question #52: The three-second rule helps you determine a safe following distance. | A | speed-space | COVERED | `il.car.029` | ~ handbook study question IL.json #74 |
| 53 | Written exam sample question #53: If your vehicle starts to skid on water (hydro plane), you should qui… | B | hazards-conditions | COVERED | `car.hz.022` | ~ handbook study question IL.json #75 |
| 54 | Written exam sample question #54: If the front right wheel of your vehicle runs off the pavement, you s… | A | emergencies | COVERED | `car.em.019`, `car.rsw.031` | ~ handbook study question IL.json #76 |
| 55 | Written exam sample question #55: If you become stranded in blizzard conditions, you should remain in y… | A | hazards-conditions | COVERED | `car.hz.086` | ~ handbook study question IL.json #77 |
| 56 | Written exam sample question #56: When experiencing a tire blowout, you should immediately apply the br… | B | emergencies | COVERED | `car.em.003`, `car.em.004` | ~ handbook study question IL.json #78 |
| 57 | Written exam sample question #57: If your vehicle starts to skid, you should apply the brakes and steer… | B | emergencies | COVERED | `car.em.008` | ~ handbook study question IL.json #79 |
| 58 | Written exam sample question #58: Illinois law requires that headlights be on when weather conditions r… | A | hazards-conditions | COVERED | `il.car.068` | ~ handbook study question IL.json #80 |
| 59 | Written exam sample question #59: If pulled over by law enforcement, you should immediately exit the ve… | B | laws-licensing | COVERED | `il.car.079`, `car.ll.004` | ~ handbook study question IL.json #29 |
| 60 | Written exam sample question #60: Within how many feet are you required to dim the highbeams before mee… | C | hazards-conditions | COVERED | `il.car.070` | ~ handbook study question IL.json #81 |
| 61 | Written exam sample question #61: Taillights are not required to be illuminated after dark. | B | hazards-conditions | COVERED | `car.hz.016` | not among the handbook study questions |
| 62 | Written exam sample question #62: Your vehicle must have a horn that can be heard from a distance of 20… | A | safe-habits | COVERED | `il.car.117` | ~ handbook study question IL.json #83 |
| 63 | Traffic sign identification (a): Match sign (a) to its name. | 19 (Stop) | road-signs | COVERED | `car.rs.001`, `car.rs.116` | (a) = 19 Stop |
| 64 | Traffic sign identification (b): Match sign (b) to its name. | 1 (Winding Road Ahead) | road-signs | COVERED | `car.rs.090` | (b) = 1 Winding Road Ahead |
| 65 | Traffic sign identification (c): Match sign (c) to its name. | 8 (No Right Turn) | road-signs | COVERED | `car.rs.016` | (c) = 8 No Right Turn |
| 66 | Traffic sign identification (d): Match sign (d) to its name. | 24 (Yield Right of Way) | road-signs | COVERED | `car.rs.003`, `car.rs.004` | (d) = 24 Yield Right of Way |
| 67 | Traffic sign identification (e): Match sign (e) to its name. | 15 (School Zone and Crossing) | road-signs | COVERED | `car.rs.099`, `car.rs.098` | (e) = 15 School Zone and Crossing |
| 68 | Traffic sign identification (f): Match sign (f) to its name. | 23 (Warning of a Change in Direction or Narrowing of Roadway) | road-signs | COVERED | `car.rs.093` | (f) = 23 Warning of a Change in Direction or Narrowing of Roadway |
| 69 | Traffic sign identification (g): Match sign (g) to its name. | 12 (Railroad Warning) | road-signs | COVERED | `car.rs.122`, `car.rsw.064` | (g) = 12 Railroad Warning |
| 70 | Traffic sign identification (h): Match sign (h) to its name. | 7 (No Passing Zone) | road-signs | COVERED | `car.rs.120`, `car.rsw.049` | (h) = 7 No Passing Zone |
| 71 | Traffic sign identification (i): Match sign (i) to its name. | 11 (Persons with Disabilities Parking) | road-signs | COVERED | `car.rs.055` | (i) = 11 Persons with Disabilities Parking |
| 72 | Traffic sign identification (j): Match sign (j) to its name. | 3 (Divided Highway) | road-signs | COVERED | `car.rsw.016`, `car.rsw.017` | (j) = 3 Divided Highway |
| 73 | Traffic sign identification (k): Match sign (k) to its name. | 2 (Crossroad) | road-signs | COVERED | `car.rs.094` | (k) = 2 Crossroad |
| 74 | Traffic sign identification (l): Match sign (l) to its name. | 17 (Slippery When Wet) | road-signs | COVERED | `car.rsw.028`, `car.rsw.029` | (l) = 17 Slippery When Wet |
| 75 | Traffic sign identification (m): Match sign (m) to its name. | 5 (Downgrade) | road-signs | COVERED | `car.rsw.022`, `car.rsw.023` | (m) = 5 Downgrade |
| 76 | Traffic sign identification (n): Match sign (n) to its name. | 6 (Merge) | road-signs | COVERED | `car.rsw.008`, `car.rsw.009` | (n) = 6 Merge |
| 77 | Traffic sign identification (o): Match sign (o) to its name. | 10 (Pedestrian Crossing) | road-signs | COVERED | `car.rsw.036`, `car.rsw.054` | (o) = 10 Pedestrian Crossing |
| 78 | Traffic sign identification (p): Match sign (p) to its name. | 14 (Road Construction/Maintenance Area) | road-signs | COVERED | `car.rs.123` | (p) = 14 Road Construction/Maintenance Area |
| 79 | Traffic sign identification (q): Match sign (q) to its name. | 4 (Do Not Enter) | road-signs | COVERED | `car.rs.042`, `car.rs.043` | (q) = 4 Do Not Enter |
| 80 | Traffic sign identification (r): Match sign (r) to its name. | 9 (No U-Turn) | road-signs | COVERED | `car.rs.019` | (r) = 9 No U-Turn |
| 81 | Traffic sign identification (s): Match sign (s) to its name. | 21 (Traffic Signal Ahead) | road-signs | COVERED | `car.rsw.004`, `car.rsw.005` | (s) = 21 Traffic Signal Ahead |
| 82 | Traffic sign identification (t): Match sign (t) to its name. | 18 (Slow-Moving Vehicle) | road-signs | COVERED | `car.smv.049` | (t) = 18 Slow-Moving Vehicle |
| 83 | Traffic sign identification (u): Match sign (u) to its name. | 16 (Side Road) | road-signs | COVERED | `car.rs.095` | (u) = 16 Side Road |
| 84 | Traffic sign identification (v): Match sign (v) to its name. | 22 (Two-Way Traffic) | road-signs | COVERED | `car.rsw.020`, `car.rsw.021` | (v) = 22 Two-Way Traffic |
| 85 | Traffic sign identification (w): Match sign (w) to its name. | 13 (Reduction in Lanes) | road-signs | COVERED | `car.cvkic.003` | (w) = 13 Reduction in Lanes |
| 86 | Traffic sign identification (x): Match sign (x) to its name. | 20 (Stop Sign Ahead) | road-signs | COVERED | `car.rsw.001`, `car.rsw.002` | (x) = 20 Stop Sign Ahead |
