# New Jersey - official online practice tests vs. DriveReady coverage

_Audit date: 2026-10-15. Collected questions: `research/official-samples/NJ-online.json` (research only; never shipped, never copied into the app). Handbook pages use the `=== PAGE n ===` markers in `research/handbooks/`._

## What was collectable

**Listed source:** <https://www.nj.gov/mvc/license/sample_knowledge_test.htm> (`officialPracticeTests` in
`app/src/content/states/NJ.json`).

**Collected (4 plain GET requests, one of them a 404):** one static page with **19 numbered questions plus 1 unnumbered
example** (n20). The **answer key is published** at <https://www.nj.gov/mvc/license/answers.htm> and is also embedded in
the page's quiz script; the two agree (1d 2c 3a 4d 5d 6b 7d 8d 9b 10d 11d 12c 13d 14c 15d 16d 17d 18d 19a). The example's
answer (stop before entering the intersection) is not in the key, so it is marked `answerFrom: handbook`.
Formatting artifacts in the source were normalized in the research file: in Q19 a stray letter sits outside each label
("S b.low down to 10 mph"), and Q10 choice d wraps across a line break.

**Other official NJ practice tests:** none. The sample test page and the MVC manuals page
(<https://www.nj.gov/mvc/about/manuals.htm>) link only to manuals (driver, CDL, moped, e-bike), not to other tests.
A lookup of <https://www.nj.gov/mvc/vehicles/>, made to verify Q3 (vehicle registration age), returned 404. I did not
guess further URLs.

## Summary

| | Count |
|---|---|
| Official questions collected | **20** |
| COVERED (an app question tests the same knowledge with the same answer) | **12** |
| PARTIAL (related app question, different fact or angle) | **4** |
| MISSING (no app question) | **4** |
| New questions written | **7** - 4 New Jersey (`nj.car.101`-`nj.car.104` in `app/src/content/questions/states/NJ.json`) + 3 universal (`car.cvoa.002`, `car.cvoa.003`, `car.cvoa.004` in `app/src/content/questions/car/coverage-online-a.json`) |
| Gaps left without a new question | **1** (n3; see the conflicts table) |

Validator: `node scripts/validate-content.mjs src/content/questions/states/CA.json src/content/questions/states/NJ.json src/content/questions/states/OH.json src/content/questions/states/NV.json src/content/questions/car/coverage-online-a.json src/content/questions/motorcycle/coverage-online-a.json` → **0 errors, 0 warnings** (no duplicate prompts).

Index: `car/coverage-online-a.json` and `motorcycle/coverage-online-a.json` are new files, and the state files changed. As instructed, I did not run `build-content-index`; run `node scripts/build-content-index.mjs` before committing.

## Conflicts (official key vs. app)

No app question contradicts an official NJ key, so **no existing question was changed**.

| n | Issue | Resolution |
|---|---|---|
| 12 | The key says to increase the **"two-second" rule** in bad weather. The current NJ Driver Manual teaches a **three-seconds-plus** rule (nj.car.054), with six or more seconds on snow (nj.car.055). | Not a contradiction: both say to increase the gap. The sample test's two-second wording is out of date. The app keeps the current manual's numbers. |
| 3 | The key says you must be **17 to register a motor vehicle**. Neither the NJ Driver Manual nor the verified NJ facts state this. | **Not taught.** Flagged for a check against the statute or an MVC registration page before writing a question. |
| 7 | The key's exception for being "directed by a police officer" is not in the manual, which simply calls driving on property to avoid a signal a violation (p.69; 2 points, p.140). | The new `nj.car.102` teaches the violation and its 2 points. The new universal `car.cvoa.002` covers obeying an officer's directions over signals. |

## New questions

New Jersey-specific (`states/NJ.json`, `"states": ["NJ"]`):
- `nj.car.101` (laws-licensing) - A 16-year-old with a New Jersey special learner permit plans to practice driving with a qualified adult supervisor. During which hours is practice driving NOT allowed? → _11:01 p.m. to 5:00 a.m._ (New Jersey Driver Manual, p. 20)
- `nj.car.102` (intersections-turns) - To avoid waiting at a red light, a driver cuts across a corner gas station lot and comes out on the cross street. What is true in New Jersey? → _It is a traffic violation that carries 2 points_ (New Jersey Driver Manual, pp. 69, 140)
- `nj.car.103` (sharing-road) - You are driving on a New Jersey dual highway. On the other side of a raised median, an ice cream truck is stopped with red lights flashing and its stop arm out. What must you do? → _You need not stop, but stay alert for children_ (New Jersey Driver Manual, p. 80)
- `nj.car.104` (laws-licensing) - Which of these is a common reason the New Jersey MVC rejects the vehicle an applicant brings for the road test? → _The examiner cannot reach the foot brake or parking brake_ (New Jersey Driver Manual, p. 39)

Universal (true in every state; car rules were checked by grepping `research/handbooks/[A-Z][A-Z].txt` and no handbook states a different rule; motorcycle rules come from the MSF Motorcycle Operator Manual that the motorcycle bank is built on):
- `car.cvoa.002` (signals-markings) - A police officer is directing traffic at an intersection. Your light is green, but the officer holds up a hand for you to stop. What should you do? → _Stop and follow the officer's directions_ (State driver handbooks (e.g. CA p.51, TX p.31))
- `car.cvoa.003` (emergencies) - Your windshield wipers suddenly stop working in heavy rain, and you can barely see the road. What should you do? → _Slow down and get safely off the road as soon as you can_ (State driver handbooks (e.g. AL p.77, MN p.89, NJ p.110, NV p.58))
- `car.cvoa.004` (alcohol-drugs) - How much alcohol does a 5-ounce glass of wine contain compared with a 12-ounce can of regular beer? → _About the same amount_ (State driver handbooks (e.g. CA p.79, NJ p.117, PA p.38, TX p.64))

## Item-by-item table

Key column: (hb) = answer determined from the handbook (not published by the state).

| n | Official item | Key | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|
| 1 | Q1 | D | alcohol-drugs | COVERED | `nj.car.002` |  |
| 2 | Q2 | C | laws-licensing | PARTIAL | `nj.car.035`, **`nj.car.101`** (new) | App covered the 11:01 p.m.-5 a.m. ban for probationary drivers only, not permit holders. |
| 3 | Q3 | A | laws-licensing | MISSING | - | NOT WRITTEN: the age-17 registration rule appears only in this sample key; it is not in the NJ Driver Manual or the verified NJ facts (one lookup of the MVC vehicles page returned 404). Flag for a statute/MVC check before teaching it. |
| 4 | Q4 | D | signals-markings | PARTIAL | `car.sm.001`, `car.rs.001`, **`car.cvoa.002`** (new) | Stop sign and red light were covered; no question said an officer's directions override signals. |
| 5 | Q5 | D | hazards-conditions | COVERED | `nj.car.090`, `nj.car.091` |  |
| 6 | Q6 | B | right-of-way | COVERED | `car.row.057`, `car.row.056` |  |
| 7 | Q7 | D | intersections-turns | MISSING | **`nj.car.102`** (new) | Manual p.69 (violation) and p.140 (2 points); the sample's police-direction exception is the general duty to obey officers. |
| 8 | Q8 | D | speed-space | COVERED | `car.ss.005`, `car.sr.056`, `car.hz.077` |  |
| 9 | Q9 | B | speed-space | COVERED | `car.ss.027`, `car.ss.033`, `car.sh.046` |  |
| 10 | Q10 | D | sharing-road | PARTIAL | `nj.car.075`, **`nj.car.103`** (new) | The dual-highway exception was only in nj.car.075's explanation. |
| 11 | Q11 | D | freeway | COVERED | `car.fw.029`, `car.hz.070` |  |
| 12 | Q12 | C | speed-space | COVERED | `car.ss.018`, `nj.car.055` | Key says increase the "two-second" rule; the current manual teaches a three-seconds-plus rule (nj.car.054). Not a conflict: both say increase the gap. |
| 13 | Q13 | D | laws-licensing | MISSING | **`nj.car.104`** (new) |  |
| 14 | Q14 | C | alcohol-drugs | COVERED | `nj.car.005` |  |
| 15 | Q15 | D | emergencies | COVERED | `car.em.043`, `car.em.044`, `car.em.045` |  |
| 16 | Q16 | D | emergencies | MISSING | **`car.cvoa.003`** (new) |  |
| 17 | Q17 | D | alcohol-drugs | COVERED | `car.ad.035`, `car.ad.036` |  |
| 18 | Q18 | D | alcohol-drugs | PARTIAL | `car.ad.004`, `car.ad.005`, **`car.cvoa.004`** (new) | Car bank asked beer vs. liquor only (mc.imp.011 asks wine, but only in the motorcycle track). |
| 19 | Q19 | A | sharing-road | COVERED | `nj.car.072` |  |
| 20 | Example (unnumbered) | D (hb) | signals-markings | COVERED | `car.sm.015`, `car.smv.011` | Unnumbered example question on the page. |
