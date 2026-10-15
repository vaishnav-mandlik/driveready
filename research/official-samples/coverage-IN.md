# Indiana — official sample questions vs. DriveReady coverage

_Audit date: 2026-10-15. Source: Indiana Driver's Manual (`research/handbooks/IN.txt`), Chapter 9 "Knowledge Exam
Sample Questions": 6 sign questions and 10 traffic questions for the learner's permit/driver's license exam (keys p.70),
4 For-Hire Endorsement questions (key p.71) and 4 Motor Driven Cycle Endorsement questions (key p.72). Page numbers are
the `=== PAGE n ===` markers (the same PDF numbering the app's IN refs use). There is no Indiana motorcycle manual in
`research/handbooks/`, so there is no motorcycle-manual track for Indiana. Extracted questions:
`research/official-samples/IN.json` (research only — never shipped, never copied into the app)._

## Summary

| | Count |
|---|---|
| Official sample questions (16 license exam + 4 for-hire + 4 motor driven cycle; all keyed) | **24** |
| COVERED (an app question tests the same fact with the same answer) | **20** |
| PARTIAL (related app question, different fact/angle) | **2** |
| MISSING (no app question) | **2** |
| New questions written | **4** — 3 Indiana (`in.car.103`–`in.car.105` in `app/src/content/questions/states/IN.json`) + 1 universal car (`car.cvkic.003` in `app/src/content/questions/car/coverage-ks-in-ct-il.json`) |

License exam items: 16 → 14 covered, 2 partial. The manual says the real exam has a sign part and a traffic-law part and
you need 80% on each. For-hire items: 2 covered (railroad-stop rule in the IN bank; warning devices in the CDL bank),
2 missing. Motor driven cycle items are general rules of the road, all covered by the universal car bank.

Validator: `node scripts/validate-content.mjs src/content/questions/states/KS.json src/content/questions/states/IN.json src/content/questions/states/CT.json src/content/questions/states/IL.json src/content/questions/car/coverage-ks-in-ct-il.json`
→ **0 errors, 0 warnings** (no duplicate prompts).

Index: not rebuilt here (per the audit instructions). `node scripts/check-content-index.mjs` reports stale hashes for `states/KS.json`, `states/IN.json`, `states/CT.json`, `states/IL.json` and the unindexed new file `questions/car/coverage-ks-in-ct-il.json`; run `node scripts/build-content-index.mjs`.

## Conflicts (official key vs. app)

None. Every Indiana key matches the app and the manual; **no existing app question was changed**. Notes:

| Official # | Issue | Resolution |
|---|---|---|
| 1–6 (sign questions) | The sign images are not in the text extraction. | Mapped by the keyed answers: Warning = diamond (`car.rs.118`), Regulatory = vertical rectangle (`car.rs.129`), No Passing Zone = pennant (`car.rs.120`), Flagger Ahead (`car.rsg.009`, W20-7), Lane Ends (symbol sign W4-2 → new `car.cvkic.003` with the W4-2R image), Railroad Crossing = round (`car.rs.122`). |
| 14–15 (traffic #8–9) | Low beams within 200 ft when following, 500 ft when meeting. | Match `in.car.087` and `in.car.086`. |
| 17–20 (for-hire) | The for-hire endorsement is a separate Indiana exam (taxi, limo and ride-share driving, and hauling property for pay in 16,000-26,000 lb trucks) with no app track of its own. | Its two uncovered facts (property-for-hire weight range; 8 ft 6 in width limit, which is also general manual content on p.54) were added to the Indiana car file. Warning devices (#20, "all answers are correct") match the CDL bank (`cdl.gk.030`, `cdl.pv.005`, `cdl.pv.006`). |
| 21–24 (motor driven cycle) | General rules of the road (railroad crossing sign, stop sign, dark signal, officer vs. signal). | Covered by universal car questions; no motorcycle-track question needed. |

## New questions

Indiana-specific (`states/IN.json`, `"states": ["IN"]`):
- `in.car.103` (sharing-road) — A fully loaded tractor-trailer with hot brakes is traveling 55 mph on an Indiana highway. According to the Indiana Driver's Manual, how much distance might it need to stop? → _More than 400 feet_ (Indiana Driver's Manual, p. 55) — closes #9
- `in.car.104` (laws-licensing) — An Indiana driver with a for-hire endorsement, but no CDL, wants to haul property for pay. What is the heaviest registered gross weight the vehicle may have? → _26,000 pounds_ (Indiana Driver's Manual, p. 21) — closes #17
- `in.car.105` (sharing-road) — A truck is about to carry a wide load on Indiana roads. Above what width does it need a special oversize permit? → _Wider than 8 feet, 6 inches_ (Indiana Driver's Manual, p. 54) — closes #19

Universal car (`car/coverage-ks-in-ct-il.json`):
- `car.cvkic.003` (road-signs) — What does this sign warn you about? → _The right lane ends, so drivers in it must merge left_ (MUTCD Sec. 2C; state driver handbooks (e.g. IN p.34, CA p.43, FL p.57)) — closes #5

State-specific vs. universal decisions: the truck stopping-distance figures, the for-hire endorsement weight range and
the oversize-permit width are Indiana manual facts (other states and manuals use different figures or rules), so they
went to the Indiana file. The Lane Ends symbol sign is a national MUTCD sign, so its question is universal.

Answer-position spread of all 38 questions written or rewritten in this KS/IN/CT/IL run (37 new + `il.car.074`): 10/10/9/9; the correct choice is the uniquely longest option in 0 of them.

## Item-by-item table

| n | Official item | Page | Key | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|---|
| 1 | Sign Q #1 | p.68 | C | road-signs | COVERED | `car.rs.118` | Keyed answer Warning: a diamond sign. |
| 2 | Sign Q #2 | p.68 | C | road-signs | COVERED | `car.rs.129` | Keyed answer Regulatory: a vertical rectangle. |
| 3 | Sign Q #3 | p.68 | A | road-signs | COVERED | `car.rs.120`, `car.rsw.049` | Keyed answer No Passing Zone: the pennant. |
| 4 | Sign Q #4 | p.68 | B | road-signs | COVERED | `car.rsg.009`, `car.rsg.010` |  |
| 5 | Sign Q #5 | p.68 | D | road-signs | PARTIAL | `car.rsw.034`, **`car.cvkic.003`** (new) | Only the word-message RIGHT LANE ENDS sign (W9-1) was asked; the Lane Ends symbol sign (W4-2) had no universal question. |
| 6 | Sign Q #6 | p.68 | B | road-signs | COVERED | `car.rs.122`, `car.rsw.064` | Keyed answer Railroad Crossing: the round advance warning sign. |
| 7 | Traffic Q #1 | p.69 | C | intersections-turns | COVERED | `in.car.049` |  |
| 8 | Traffic Q #2 | p.69 | B | signals-markings | COVERED | `car.sm.020` |  |
| 9 | Traffic Q #3 | p.69 | D | sharing-road | PARTIAL | `car.sr.037`, **`in.car.103`** (new) | App said trucks need much longer to stop; the manual's 400+ ft (vs. 130-140 ft for a car) at 55 mph was not taught. |
| 10 | Traffic Q #4 | p.69 | A | hazards-conditions | COVERED | `in.car.085` |  |
| 11 | Traffic Q #5 | p.69 | B | intersections-turns | COVERED | `car.it.066`, `car.it.010` |  |
| 12 | Traffic Q #6 | p.69 | C | speed-space | COVERED | `in.car.042` |  |
| 13 | Traffic Q #7 | p.69 | D | speed-space | COVERED | `in.car.039` |  |
| 14 | Traffic Q #8 | p.70 | C | hazards-conditions | COVERED | `in.car.087` |  |
| 15 | Traffic Q #9 | p.70 | D | hazards-conditions | COVERED | `in.car.086` |  |
| 16 | Traffic Q #10 | p.70 | B | emergencies | COVERED | `car.em.003`, `car.em.004` |  |
| 17 | For-Hire #1 | p.71 | A | laws-licensing | MISSING | **`in.car.104`** (new) |  |
| 18 | For-Hire #2 | p.71 | C | sharing-road | COVERED | `in.car.088`, `in.car.089`, `cdl.pv.047` |  |
| 19 | For-Hire #3 | p.71 | A | sharing-road | MISSING | **`in.car.105`** (new) |  |
| 20 | For-Hire #4 | p.71 | C | emergencies | COVERED | `cdl.gk.030`, `cdl.pv.005`, `cdl.pv.006` | CDL bank: three reflective triangles, or 6 fusees / 3 liquid-burning flares (IN manual p.62). |
| 21 | Motor Driven Cycle #1 | p.72 | C | road-signs | COVERED | `car.rsw.065`, `car.sr.056` |  |
| 22 | Motor Driven Cycle #2 | p.72 | A | intersections-turns | COVERED | `car.rs.001`, `car.it.039`, `car.it.040` |  |
| 23 | Motor Driven Cycle #3 | p.72 | A | right-of-way | COVERED | `car.row.063`, `car.row.065` |  |
| 24 | Motor Driven Cycle #4 | p.72 | B | signals-markings | COVERED | `car.sm.020` |  |
