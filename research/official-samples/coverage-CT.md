# Connecticut — official sample questions vs. DriveReady coverage

_Audit date: 2026-10-15. Sources: Connecticut Driver's Manual (`research/handbooks/CT.txt`), 10 "Study Questions" in
four blocks (answers p.56), and the Connecticut Motorcycle Operator Manual (`research/handbooks/CT_MOTORCYCLE.txt`,
the MSF manual): 14 "Test Yourself" items and the 5-item "Knowledge Test (Sample Questions)" (answers p.51). Page
numbers are the `=== PAGE n ===` markers of the file each item comes from (items 1–10: CT.txt, the same PDF numbering
the app's CT refs use; items 11–29: CT_MOTORCYCLE.txt). Extracted questions: `research/official-samples/CT.json`
(research only — never shipped, never copied into the app). The manual also points to sample tests in the CT DMV mobile
app, and `research/facts/CT.json` lists three practice-test PDFs on portal.ct.gov; those are not in
`research/handbooks/` and were not audited here._

## Summary

| | Count |
|---|---|
| Official sample questions (car manual 10 + motorcycle manual 19; all keyed) | **29** |
| COVERED (an app question tests the same fact with the same answer) | **27** |
| PARTIAL (related app question, different fact/angle) | **2** |
| MISSING (no app question) | **0** |
| New questions written | **2** — 1 Connecticut (`ct.car.106` in `app/src/content/questions/states/CT.json`) + 1 universal car (`car.cvkic.001` in `app/src/content/questions/car/coverage-ks-in-ct-il.json`) |

Car track: 10 items → 8 covered, 2 partial. Motorcycle track: 19 items → all covered (the same MSF items as Tennessee's
manual; the two TN partials were closed by `mc.cvtwu.001`–`mc.cvtwu.002`).

Validator: `node scripts/validate-content.mjs src/content/questions/states/KS.json src/content/questions/states/IN.json src/content/questions/states/CT.json src/content/questions/states/IL.json src/content/questions/car/coverage-ks-in-ct-il.json`
→ **0 errors, 0 warnings** (no duplicate prompts).

Index: not rebuilt here (per the audit instructions). `node scripts/check-content-index.mjs` reports stale hashes for `states/KS.json`, `states/IN.json`, `states/CT.json`, `states/IL.json` and the unindexed new file `questions/car/coverage-ks-in-ct-il.json`; run `node scripts/build-content-index.mjs`.

## Conflicts (official key vs. app)

No app question contradicts a Connecticut key, so **no existing app question was changed**. Items reviewed closely:

| Official # | Issue | Resolution |
|---|---|---|
| 5 (Study Q #5) | Key: at a four-way stop "the vehicle on the right goes first". | The manual (p.38) says the first to arrive goes first and, on a tie, the vehicle on the right. The app teaches both (`car.row.013`, `car.row.014`); among CT's choices the key is the tie rule. No change. |
| 7 (Study Q #7) | Key: flash your headlights quickly a couple of times when an oncoming driver keeps high beams on (p.40). `car.hz.005` keys "keep your low beams on and look to the right edge". | Not a contradiction: CT's next step is to look toward the right side of the road. Flashing is not universal advice (Michigan p.78 bans even flashing high beams within 500 feet of an oncoming vehicle; Indiana p.51 lists repeated headlight flashing as aggressive driving), so it is taught as CT-only `ct.car.106`. |
| 2 (Study Q #2) | "Which statement is false?" Key: "After market, any changes to equipment, such as tinted windows, are legal". The key treats "Only your brakes can stop your vehicle" as true. | The tested fact (aftermarket tint/lighting can be illegal; manual p.14) is universal — every state limits tint and light colors — so it became `car.cvkic.001`. The odd brakes statement is not taught. |
| 12 (MC Test Yourself 2) | Key: less than five months of experience. | Matches `mc.gear.024`. (Kansas and Wisconsin print "six months" — see coverage-KS.md.) |

## New questions

Connecticut-specific (`states/CT.json`, `"states": ["CT"]`):
- `ct.car.106` (hazards-conditions) — A car comes toward you at night with its high beams on. According to the Connecticut Driver's Manual, what should you try first? → _Quickly flash your headlights a couple of times_ (Connecticut Driver's Manual, p. 40) — closes #7

Universal car (`car/coverage-ks-in-ct-il.json`):
- `car.cvkic.001` (laws-licensing) — You want to add dark window tint and colored accent lights to your car. What should you know before you install them? → _They can be illegal if they don't meet your state's equipment laws_ (State driver handbooks (e.g. CT p.14, MA p.42, MN p.27, IA p.24)) — closes #2

Answer-position spread of all 38 questions written or rewritten in this KS/IN/CT/IL run (37 new + `il.car.074`): 10/10/9/9; the correct choice is the uniquely longest option in 0 of them.

## Item-by-item table

| n | Official item | Page | Key | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|---|
| 1 | Study Q #1 | p.15 | D | safe-habits | COVERED | `car.sh.046` |  |
| 2 | Study Q #2 | p.15 | B | safe-habits | PARTIAL | `car.ll.015`, **`car.cvkic.001`** (new) | Only a license-plate-cover question existed; nothing on aftermarket tint or lights. |
| 3 | Study Q #3 | p.37 | B | right-of-way | COVERED | `car.row.056`, `car.sr.094`, `ct.car.089` |  |
| 4 | Study Q #4 | p.37 | C | sharing-road | COVERED | `car.sr.033`, `car.scnr.009` |  |
| 5 | Study Q #5 | p.43 | C | right-of-way | COVERED | `car.row.013`, `car.row.014`, `car.rs.007` | CT manual p.38: first to arrive goes first; on a tie the vehicle on the right goes first. |
| 6 | Study Q #6 | p.44 | A | lanes-passing | COVERED | `car.lp.004`, `car.lp.056` |  |
| 7 | Study Q #7 | p.44 | B | hazards-conditions | PARTIAL | `car.hz.005`, **`ct.car.106`** (new) | car.hz.005 keys keep low beams and look right (CT's second step); flashing first is CT advice, not universal. |
| 8 | Study Q #8 | p.54 | C | road-signs | COVERED | `car.rs.099` |  |
| 9 | Study Q #9 | p.54 | B | road-signs | COVERED | `car.rs.127` |  |
| 10 | Study Q #10 | p.54 | C | signals-markings | COVERED | `car.sm.041`, `car.lp.009` |  |
| 11 | MC Test Yourself 1 | p.12 | C | mc-gear-controls | COVERED | `mc.gear.012` |  |
| 12 | MC Test Yourself 2 | p.15 | D | mc-gear-controls | COVERED | `mc.gear.024` |  |
| 13 | MC Test Yourself 3 | p.19 | D | mc-basic-control | COVERED | `mc.ctl.036` |  |
| 14 | MC Test Yourself 4 | p.23 | A | mc-lane-position | COVERED | `mc.lane.021` |  |
| 15 | MC Test Yourself 5 | p.26 | B | mc-lane-position | COVERED | `mc.lane.044` |  |
| 16 | MC Test Yourself 6 | p.29 | C | mc-intersections | COVERED | `mc.int.004` |  |
| 17 | MC Test Yourself 7 | p.31 | D | mc-intersections | COVERED | `mc.cvtwu.001`, `mc.int.021`, `mc.int.022` | Closed by mc.cvtwu.001 in the TN/WI/UT audit. |
| 18 | MC Test Yourself 8 | p.36 | D | mc-crash-avoidance | COVERED | `mc.crash.001` |  |
| 19 | MC Test Yourself 9 | p.37 | C | mc-crash-avoidance | COVERED | `mc.crash.026` |  |
| 20 | MC Test Yourself 10 | p.39 | C | mc-crash-avoidance | COVERED | `mc.crash.039` |  |
| 21 | MC Test Yourself 11 | p.41 | D | mc-crash-avoidance | COVERED | `mc.crash.044` |  |
| 22 | MC Test Yourself 12 | p.42 | A | mc-passengers-groups | COVERED | `mc.pass.011` |  |
| 23 | MC Test Yourself 13 | p.44 | A | mc-passengers-groups | COVERED | `mc.pass.024` |  |
| 24 | MC Test Yourself 14 | p.49 | C | mc-impairment | COVERED | `mc.imp.022` |  |
| 25 | MC Knowledge Test #1 | p.50 | B | mc-intersections | COVERED | `mc.int.027`, `mc.int.028`, `mc.cvtwu.002` |  |
| 26 | MC Knowledge Test #2 | p.50 | C | mc-basic-control | COVERED | `mc.ctl.023` |  |
| 27 | MC Knowledge Test #3 | p.50 | C | mc-crash-avoidance | COVERED | `mc.crash.009` |  |
| 28 | MC Knowledge Test #4 | p.50 | C | mc-crash-avoidance | COVERED | `mc.crash.035` |  |
| 29 | MC Knowledge Test #5 | p.50 | B | mc-intersections | COVERED | `mc.int.005`, `mc.int.006` | Pictured: car waiting at a side street. |
