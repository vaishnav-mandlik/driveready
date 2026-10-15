# Nevada - official online practice tests vs. DriveReady coverage

_Audit date: 2026-10-15. Collected questions: `research/official-samples/NV-online.json` (research only; never shipped, never copied into the app). Handbook pages use the `=== PAGE n ===` markers in `research/handbooks/`._

## What was collectable

**Listed source:** <https://dmv.nv.gov/dlquiz.htm> ("Practice Nevada Class C Driver's License Quiz";
`officialPracticeTests` in `app/src/content/states/NV.json`).

**Collected (3 plain GET requests):** the quiz is a small web app with all **25 questions and their correct-answer
indices embedded** in an inline script (`quizQuestions = [...]`, `correct: n`). The order is fixed: the code does not
shuffle or sample, so the whole pool was collected in one request.

**Other official NV practice tests:** none. The Driver License page (<https://dmv.nv.gov/nvdl.htm>) and the handbooks
page (<https://dmv.nv.gov/dlhandbook.htm>) link only to handbooks (driver, motorcycle, CDL, study guide).

## Summary

| | Count |
|---|---|
| Official questions collected | **25** |
| COVERED (an app question tests the same knowledge with the same answer) | **20** |
| PARTIAL (related app question, different fact or angle) | **2** |
| MISSING (no app question) | **3** |
| New questions written | **5** - 5 Nevada (`nv.car.103`-`nv.car.107` in `app/src/content/questions/states/NV.json`) |

Validator: `node scripts/validate-content.mjs src/content/questions/states/CA.json src/content/questions/states/NJ.json src/content/questions/states/OH.json src/content/questions/states/NV.json src/content/questions/car/coverage-online-a.json src/content/questions/motorcycle/coverage-online-a.json` → **0 errors, 0 warnings** (no duplicate prompts).

Index: `car/coverage-online-a.json` and `motorcycle/coverage-online-a.json` are new files, and the state files changed. As instructed, I did not run `build-content-index`; run `node scripts/build-content-index.mjs` before committing.

## Conflicts (official key vs. app)

No app question contradicts an official NV key, so **no existing question was changed**.

| n | Issue | Resolution |
|---|---|---|
| 1 | The quiz says doubling speed makes **stopping distance** four times as long. The NV handbook (p.41) and the app (`car.ss.030`, `car.ss.031`) say **braking distance** quadruples; total stopping distance also includes reaction distance, which only doubles. | Same answer (four times), and the app is the more precise of the two. No change. |
| 5 | The quiz generalizes the move-over duty to "any vehicle parked at the side of the road with flashing lights". Handbook p.61 (NRS 484B.607) lists law enforcement, tow, NDOT and garbage vehicles, vehicles with non-flashing blue lights, and anyone repairing a vehicle. | Same safe behavior (slow down and move over a lane when safe). `nv.car.081`/`nv.car.082` stay keyed to the handbook. No change. |
| 13, 24 | Crossing guard (wait until the guard is completely out of the crosswalk) and the 2-second following distance. | Match `nv.car.079` and `nv.car.045`. No change. |

## New questions

Nevada-specific (`states/NV.json`, `"states": ["NV"]`):
- `nv.car.103` (right-of-way) - A funeral procession with headlights on comes up behind you on a Nevada road. What does the Nevada Driver's Handbook tell you to do? → _Yield and let the procession pass as a group_ (Nevada Driver’s Handbook, p. 34)
- `nv.car.104` (intersections-turns) - Which of these is a place where Nevada law says you must NEVER make a U-turn? → _In front of a fire station_ (Nevada Driver’s Handbook, p. 46)
- `nv.car.105` (parking) - In Nevada, what does a curb painted white usually mean? → _Stop only briefly to load or unload passengers or mail_ (Nevada Driver’s Handbook, p. 48)
- `nv.car.106` (safe-habits) - Under Nevada law, what is it to leave a dog or cat unattended in a vehicle during extreme heat or cold? → _A misdemeanor_ (Nevada Driver’s Handbook, p. 25)
- `nv.car.107` (laws-licensing) - The Nevada DMV suspends your car's registration because your liability insurance lapsed and you had no coverage for that time. Besides a reinstatement fee and fines, what else may happen? → _An SR-22 requirement and/or a 30-day license suspension_ (Nevada Driver’s Handbook, p. 75)

## Item-by-item table

Key column: (hb) = answer determined from the handbook (not published by the state).

| n | Official item | Key | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|
| 1 | Q1 | D | speed-space | COVERED | `car.ss.030`, `car.ss.031` | Quiz says "stopping distance"; the NV handbook (p.41) and the app say braking distance quadruples. Same answer. |
| 2 | Q2 | B | signals-markings | COVERED | `car.sm.015` |  |
| 3 | Q3 | B | safe-habits | COVERED | `nv.car.017` |  |
| 4 | Q4 | A | parking | COVERED | `car.pk.003`, `car.scnr.032` |  |
| 5 | Q5 | D | emergencies | COVERED | `nv.car.081`, `nv.car.082`, `car.rs.079` |  |
| 6 | Q6 | C | right-of-way | COVERED | `car.scni.022`, `car.cvfom.007` |  |
| 7 | Q7 | A | right-of-way | COVERED | `car.row.007` |  |
| 8 | Q8 | A | signals-markings | COVERED | `nv.car.063` |  |
| 9 | Q9 | B | signals-markings | COVERED | `car.smv.030` |  |
| 10 | Q10 | A | laws-licensing | COVERED | `nv.car.035` |  |
| 11 | Q11 | B | alcohol-drugs | COVERED | `nv.car.002` |  |
| 12 | Q12 | A | right-of-way | MISSING | **`nv.car.103`** (new) |  |
| 13 | Q13 | B | right-of-way | COVERED | `nv.car.079` |  |
| 14 | Q14 | B | signals-markings | COVERED | `car.smv.047` |  |
| 15 | Q15 | A | freeway | COVERED | `car.fw.003` |  |
| 16 | Q16 | D | signals-markings | COVERED | `nv.car.058`, `nv.car.059` |  |
| 17 | Q17 | A | right-of-way | COVERED | `car.row.042` |  |
| 18 | Q18 | D | intersections-turns | PARTIAL | `nv.car.071`, `nv.car.072`, `car.it.060`, **`nv.car.104`** (new) | App covered business districts, 200-ft visibility and hills/curves, not fire stations, one-way streets or railroad crossings. |
| 19 | Q19 | A | parking | MISSING | **`nv.car.105`** (new) |  |
| 20 | Q20 | C | safe-habits | COVERED | `car.sh.044` |  |
| 21 | Q21 | B | safe-habits | COVERED | `nv.car.014` |  |
| 22 | Q22 | C | safe-habits | PARTIAL | `nv.car.018`, **`nv.car.106`** (new) | App covered the unattended-child rule only, not pets or the misdemeanor penalty. |
| 23 | Q23 | A | laws-licensing | MISSING | **`nv.car.107`** (new) |  |
| 24 | Q24 | B | speed-space | COVERED | `nv.car.045` |  |
| 25 | Q25 | A | right-of-way | COVERED | `car.row.052`, `car.row.051` |  |
