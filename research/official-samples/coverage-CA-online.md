# California - official online practice tests vs. DriveReady coverage

_Audit date: 2026-10-15. Collected questions: `research/official-samples/CA-online.json` (research only; never shipped, never copied into the app). Handbook pages use the `=== PAGE n ===` markers in `research/handbooks/`._

## What was collectable

**Listed source:** <https://www.dmv.ca.gov/portal/driver-education-and-safety/educational-materials/sample-driver-license-dl-knowledge-tests/>
(`officialPracticeTests` in `app/src/content/states/CA.json`).

**Collected (9 plain GET requests):**
- English **Class C Tests #1-#4** (10 questions each, 3 choices) and **Class M Tests #1-#2** (10 each) = **60 items**.
  Three are repeats: n31 = n12 (large trucks), n37 = n24 (bike-lane right turn, choices reordered), n56 = n42
  (grabbing the brakes), so there are 57 distinct questions.
- Each page serves a **fixed** set: a second fetch of Test #1 returned the same 10 questions. The landing page says
  "DMV periodically adds new questions to the sample tests", so re-check these pages in later audits.

**Answer keys are not published in the pages.** Each test is a form that is graded server-side after a POST (the page
script only does analytics and "answer all questions" validation). The landing page mentions an answer sheet for
non-JavaScript browsers, but no link to it is present. The forms were not submitted (plain GETs only), so all 60 answers
were determined from the handbooks and are marked `"answerFrom": "handbook"` with a `handbookRef`:
Class C items from the California Driver's Handbook (`research/handbooks/CA.txt`); Class M items from the MSF Motorcycle
Operator Manual (`research/handbooks/MOTORCYCLE.txt`, which the California Motorcycle Handbook DL 665 follows) plus the
verified CA facts already behind `ca.mc.001`/`ca.mc.005` (there is no CA motorcycle handbook text in `research/`).
Every key was matched against the handbook text; the closest calls (n11/n39 and n53) are explained in the conflicts table.

**Not collected:**
- The Spanish, Armenian, Chinese, Farsi, Punjabi, Russian, Tagalog, Vietnamese and ASL versions: these are translations
  of the same four Class C tests.
- **Commercial Tests #1-#2** (CDL). They are outside this audit's car/motorcycle/state banks; the CDL bank needs its own
  audit.

## Summary

| | Count |
|---|---|
| Official questions collected | **60** |
| COVERED (an app question tests the same knowledge with the same answer) | **55** |
| PARTIAL (related app question, different fact or angle) | **3** |
| MISSING (no app question) | **2** |
| New questions written | **5** - 3 California (`ca.car.102`-`ca.car.104` in `app/src/content/questions/states/CA.json`) + 2 universal (`car.cvoa.001`, `mc.cvoa.001` in `app/src/content/questions/car/coverage-online-a.json`, `app/src/content/questions/motorcycle/coverage-online-a.json`) |

Validator: `node scripts/validate-content.mjs src/content/questions/states/CA.json src/content/questions/states/NJ.json src/content/questions/states/OH.json src/content/questions/states/NV.json src/content/questions/car/coverage-online-a.json src/content/questions/motorcycle/coverage-online-a.json` → **0 errors, 0 warnings** (no duplicate prompts).

Index: `car/coverage-online-a.json` and `motorcycle/coverage-online-a.json` are new files, and the state files changed. As instructed, I did not run `build-content-index`; run `node scripts/build-content-index.mjs` before committing.

## Conflicts (official key vs. app)

No app question contradicts the (handbook-derived) keys, so **no existing question was changed**. Items I looked at closely:

| n | Issue | Resolution |
|---|---|---|
| 25 | The key wording "You must drive 65 mph only if driving conditions are ideal" is awkward. It means 65 mph is the maximum speed under ideal conditions (handbook p.73). | Matches `ca.car.050` (65 mph limit) and `ca.car.045` (Basic Speed Law in fog). No change. |
| 36 | Dust or smoke → headlights. The app teaches the same rule with fog and rain. | Counted as COVERED (`car.hz.080`, `car.hz.028`, `ca.car.058`); no new question. |
| 39, 11 | Pedestrian still crossing when your light turns green: the key requires waiting until they have **finished** crossing, not just until they are out of your path (pp.41, 47). | `car.row.034` already keys "wait until the pedestrian finishes crossing". No change. |
| 53 | CA phrasing "major factor in collisions caused by motorcycles" → *following too closely*. One distractor ("not being seen by other drivers") is itself a major factor in car-motorcycle crashes. | New `mc.cvoa.001` teaches the MSF statement ("frequent factor in crashes involving motorcyclists") and uses only recommended habits as distractors. |
| 24, 37 | Right turn with a bike lane: CA keys "merge into the bicycle lane" (allowed within 200 ft of the turn). | Universal `car.sm.062` ("check for bicyclists and yield before entering or crossing it") does not contradict this. `ca.car.067` teaches the 200-ft rule. |

## New questions

California-specific (`states/CA.json`, `"states": ["CA"]`):
- `ca.car.102` (laws-licensing) - During a police chase, a driver in California flees in a car and someone is seriously injured. What is the longest sentence the law allows for this? → _Up to 7 years in state prison_ (California Driver’s Handbook, p. 59)
- `ca.car.103` (emergencies) - A minor collision in California causes only $300 in damage, but the other driver's passenger says their neck hurts. Must you report the collision to DMV? → _Yes, within 10 days, because someone was hurt_ (California Driver’s Handbook, p. 84)
- `ca.car.104` (signals-markings) - On a California road, two sets of solid double yellow lines are painted two or more feet apart. What do they mean? → _A barrier you must not cross except at marked openings_ (California Driver’s Handbook, p. 19)

Universal (true in every state; car rules were checked by grepping `research/handbooks/[A-Z][A-Z].txt` and no handbook states a different rule; motorcycle rules come from the MSF Motorcycle Operator Manual that the motorcycle bank is built on):
- `car.cvoa.001` (safe-habits) - Which of these is one of the most common causes of traffic collisions? → _Driver distraction_ (State driver handbooks (e.g. CA p.83, NJ p.94, CO p.9, IN p.76))
- `mc.cvoa.001` (mc-lane-position) - Which rider habit does the motorcycle operator manual call a frequent factor in crashes involving motorcyclists? → _Following other vehicles too closely_ (MSF Motorcycle Operator Manual, p. 15 (Following Another Vehicle))

## Item-by-item table

Key column: (hb) = answer determined from the handbook (not published by the state).

| n | Official item | Key | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|
| 1 | Class C Test #1 Q1 | B (hb) | lanes-passing | COVERED | `car.lp.058` |  |
| 2 | Class C Test #1 Q2 | A (hb) | speed-space | COVERED | `ca.car.052` |  |
| 3 | Class C Test #1 Q3 | C (hb) | parking | COVERED | `car.pk.012`, `car.pk.013` |  |
| 4 | Class C Test #1 Q4 | A (hb) | freeway | COVERED | `car.fw.003` |  |
| 5 | Class C Test #1 Q5 | C (hb) | signals-markings | COVERED | `ca.car.060` |  |
| 6 | Class C Test #1 Q6 | B (hb) | parking | COVERED | `ca.car.084` |  |
| 7 | Class C Test #1 Q7 | A (hb) | sharing-road | COVERED | `car.sr.050` |  |
| 8 | Class C Test #1 Q8 | C (hb) | speed-space | COVERED | `ca.car.044` |  |
| 9 | Class C Test #1 Q9 | B (hb) | laws-licensing | COVERED | `ca.car.028` |  |
| 10 | Class C Test #1 Q10 | B (hb) | hazards-conditions | COVERED | `car.hz.070` |  |
| 11 | Class C Test #2 Q1 | A (hb) | right-of-way | COVERED | `car.row.034`, `car.scni.038` |  |
| 12 | Class C Test #2 Q2 | B (hb) | sharing-road | COVERED | `car.sr.033`, `car.fw.046` |  |
| 13 | Class C Test #2 Q3 | C (hb) | safe-habits | PARTIAL | `car.cvpa.025`, **`car.cvoa.001`** (new) | App asked which habit is a distraction, not that distraction is among the most common collision causes. |
| 14 | Class C Test #2 Q4 | A (hb) | laws-licensing | MISSING | **`ca.car.102`** (new) |  |
| 15 | Class C Test #2 Q5 | C (hb) | right-of-way | COVERED | `car.row.028` |  |
| 16 | Class C Test #2 Q6 | C (hb) | parking | COVERED | `car.pk.001`, `car.pk.008` |  |
| 17 | Class C Test #2 Q7 | B (hb) | laws-licensing | COVERED | `ca.car.018` |  |
| 18 | Class C Test #2 Q8 | B (hb) | intersections-turns | COVERED | `car.it.010` | App asks one-way to two-way; same rule (start a left turn from the far-left lane of a one-way street). |
| 19 | Class C Test #2 Q9 | B (hb) | emergencies | COVERED | `ca.car.029` |  |
| 20 | Class C Test #2 Q10 | B (hb) | hazards-conditions | COVERED | `car.hz.019` |  |
| 21 | Class C Test #3 Q1 | B (hb) | parking | COVERED | `ca.car.083` |  |
| 22 | Class C Test #3 Q2 | B (hb) | emergencies | PARTIAL | `ca.car.029`, **`ca.car.103`** (new) | App covered only the $1,000 damage trigger; the injury trigger was in an explanation. |
| 23 | Class C Test #3 Q3 | B (hb) | signals-markings | MISSING | **`ca.car.104`** (new) |  |
| 24 | Class C Test #3 Q4 | A (hb) | intersections-turns | COVERED | `ca.car.067` |  |
| 25 | Class C Test #3 Q5 | C (hb) | speed-space | COVERED | `ca.car.045`, `ca.car.050` |  |
| 26 | Class C Test #3 Q6 | A (hb) | parking | COVERED | `car.pk.031` |  |
| 27 | Class C Test #3 Q7 | B (hb) | safe-habits | COVERED | `car.sh.005`, `ca.car.034` |  |
| 28 | Class C Test #3 Q8 | B (hb) | signals-markings | COVERED | `car.sm.007`, `car.it.042` |  |
| 29 | Class C Test #3 Q9 | C (hb) | intersections-turns | COVERED | `car.it.002` |  |
| 30 | Class C Test #3 Q10 | A (hb) | sharing-road | COVERED | `car.sr.087` |  |
| 31 | Class C Test #4 Q1 | B (hb) | sharing-road | COVERED | `car.sr.033` | Same item as n12. |
| 32 | Class C Test #4 Q2 | A (hb) | safe-habits | COVERED | `ca.car.043` |  |
| 33 | Class C Test #4 Q3 | C (hb) | sharing-road | COVERED | `car.sr.058` |  |
| 34 | Class C Test #4 Q4 | A (hb) | speed-space | COVERED | `car.ss.041` |  |
| 35 | Class C Test #4 Q5 | A (hb) | speed-space | COVERED | `car.ss.003`, `ca.car.045` |  |
| 36 | Class C Test #4 Q6 | C (hb) | hazards-conditions | COVERED | `car.hz.080`, `car.hz.028`, `ca.car.058` | Same rule (headlights, not parking or emergency lights, when visibility is poor); app examples are rain and fog rather than dust or smoke. |
| 37 | Class C Test #4 Q7 | C (hb) | intersections-turns | COVERED | `ca.car.067` | Same item as n24 with choices reordered. |
| 38 | Class C Test #4 Q8 | B (hb) | signals-markings | COVERED | `car.sm.016` |  |
| 39 | Class C Test #4 Q9 | C (hb) | right-of-way | COVERED | `car.row.034`, `ca.car.098` |  |
| 40 | Class C Test #4 Q10 | B (hb) | alcohol-drugs | COVERED | `ca.car.009` |  |
| 41 | Class M Test #1 Q1 | B (hb) | mc-laws | COVERED | `ca.mc.001` |  |
| 42 | Class M Test #1 Q2 | A (hb) | mc-basic-control | COVERED | `mc.ctl.026`, `mc.ctl.028` |  |
| 43 | Class M Test #1 Q3 | C (hb) | mc-passengers-groups | COVERED | `mc.pass.038` |  |
| 44 | Class M Test #1 Q4 | B (hb) | mc-passengers-groups | COVERED | `mc.pass.030` |  |
| 45 | Class M Test #1 Q5 | C (hb) | mc-gear-controls | COVERED | `mc.gear.014`, `mc.gear.013` |  |
| 46 | Class M Test #1 Q6 | B (hb) | mc-crash-avoidance | COVERED | `mc.crash.017` |  |
| 47 | Class M Test #1 Q7 | C (hb) | mc-lane-position | COVERED | `mc.cvfom.003` |  |
| 48 | Class M Test #1 Q8 | C (hb) | mc-intersections | COVERED | `mc.int.037`, `mc.int.034` |  |
| 49 | Class M Test #1 Q9 | A (hb) | mc-crash-avoidance | COVERED | `mc.crash.037` |  |
| 50 | Class M Test #1 Q10 | B (hb) | mc-laws | COVERED | `ca.mc.005` |  |
| 51 | Class M Test #2 Q1 | A (hb) | mc-basic-control | COVERED | `mc.ctl.020`, `mc.ctl.021` |  |
| 52 | Class M Test #2 Q2 | B (hb) | mc-intersections | COVERED | `mc.int.026` |  |
| 53 | Class M Test #2 Q3 | A (hb) | mc-lane-position | PARTIAL | `mc.lane.012`, **`mc.cvoa.001`** (new) | Only mc.lane.012's explanation said following too closely is a frequent crash factor. |
| 54 | Class M Test #2 Q4 | C (hb) | mc-crash-avoidance | COVERED | `mc.crash.032` |  |
| 55 | Class M Test #2 Q5 | A (hb) | mc-passengers-groups | COVERED | `mc.pass.017` |  |
| 56 | Class M Test #2 Q6 | A (hb) | mc-basic-control | COVERED | `mc.ctl.026`, `mc.ctl.028` | Same item as n42. |
| 57 | Class M Test #2 Q7 | A (hb) | mc-lane-position | COVERED | `mc.lane.039` |  |
| 58 | Class M Test #2 Q8 | B (hb) | mc-intersections | COVERED | `mc.int.013`, `mc.scn.012` |  |
| 59 | Class M Test #2 Q9 | B (hb) | mc-intersections | COVERED | `mc.int.021`, `mc.cvtwu.001` |  |
| 60 | Class M Test #2 Q10 | A (hb) | mc-basic-control | COVERED | `mc.ctl.038` |  |
