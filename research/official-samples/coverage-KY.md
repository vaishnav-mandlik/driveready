# Kentucky — official sample questions vs. DriveReady coverage

_Audit date: 2026-10-15. Source: Kentucky Driver Manual (`research/handbooks/KY.txt`, updated July 23, 2026), Section
Twelve "Test Your Knowledge" (PDF p.80, printed p.72), key printed on the same page: **1 a; 2 c; 3 b; 4 a; 5 c; 6 c; 7 a;
8 a; 9 a; 10 c; 11 b**. Items 1–10 are the AAMVA template quiz that South Carolina's manual also prints (see
coverage-SC.md). Item 4's choices and item 5 are pictures; they were checked in the current PDF: #4 a = Divided Highway
(median island at the top, W6-1), b = Divided Highway Ends, c = narrowing-lanes sign; #5 = a single yellow chevron pointing
right (W1-8). Page numbers are the `=== PAGE n ===` markers of KY.txt (= the app's KY refs). No Kentucky motorcycle
manual is in `research/handbooks/`. Extracted questions: `research/official-samples/KY.json` (research only — never
shipped, never copied into the app)._

## Summary

| | Count |
|---|---|
| Official sample questions (all keyed) | **11** |
| COVERED (an app question tests the same fact with the same answer) | **10** |
| PARTIAL (related app question, different fact/angle) | **1** |
| MISSING (no app question) | **0** |
| New questions written | **1** universal car (`car.cvvks.002` in `app/src/content/questions/car/coverage-va-ky-tx-sc-al.json`, shared with South Carolina); no Kentucky-specific question needed |

Key letters checked against the manual (the key prints no page numbers): 1 → p.33 ("Alcohol and other impairing drugs
reduce your: Judgment ..."), 2 → p.55 ("You may pass if there is a solid yellow line on the left side of the broken
yellow line"), 3 → p.42 (yield to "The driver on your right at a four-way intersection controlled by stop signs if both
of you arrive ... at the same time"), 4 → p.49 (Divided Highway sign in the warning-sign chart), 5 → not pictured in the
Kentucky manual; South Carolina's identical manual labels the same chevron "Sharp Curve Ahead" (SC p.64) and the MUTCD
uses chevrons for sharp curves, 6 → p.46 (regulatory signs "are white with black, red, or green letters or symbols"),
7 → p.67 ("always be prepared to yield to pedestrians even if they are not in a crosswalk"), 8 → p.70 ("Allow a
motorcyclist a full lane width"), 9 → p.68 ("Allow as much space as possible and slow down when approaching or passing a
bicyclist"), 10 → p.76 ("Use your high beams whenever there are no oncoming vehicles"), 11 → p.31 ("a distraction is
anything that takes your attention away from driving"). All keys are unambiguous and supported.

Validator (all files changed in the VA/KY/TX/SC/AL run): `node scripts/validate-content.mjs src/content/questions/states/TX.json src/content/questions/states/SC.json src/content/questions/car/coverage-va-ky-tx-sc-al.json src/content/questions/motorcycle/coverage-va-ky-tx-sc-al.json`
→ **0 errors, 0 warnings** (no duplicate prompts).

Index: not rebuilt here (per the audit instructions); `check-content-index` lists `states/SC.json`, `states/TX.json` and
the two new `coverage-va-ky-tx-sc-al.json` files — run `node scripts/build-content-index.mjs`.

## Conflicts (official key vs. app)

**None. No existing app question was changed.** Items reviewed closely:

| Official # | Issue | Resolution |
|---|---|---|
| 1 | Key a ("reduce your judgment"). Distractor b says alcohol "decrease[s] your reaction time"; p.33 lists "Reaction time: slows your ability to process information" among the things alcohol "reduce[s]", so a reader could misread b. | Key a is unambiguous and supported. `car.ad.001` (judgment is affected first) and `car.ad.042` (alcohol slows reaction time) teach both points correctly. No change. |
| 5 | Key c ("sharp curve ahead"). `car.rs.093` (W1-8R) shows the chevron with the curve already given in the prompt ("placed along the outside of a curve") and keys "Follow the curve in the direction they point"; "sharp curve" appeared only in its explanation. | Not a contradiction; added `car.cvvks.002`, which shows a single chevron with no context and keys a sharp curve in the direction shown. |
| 7 | Key: you must stop for a jaywalking pedestrian. `car.row.046` keys "Slow down or stop to avoid hitting them". | Same duty. No change. |

## New questions

Universal car (`car/coverage-va-ky-tx-sc-al.json`):
- `car.cvvks.002` (road-signs, sign `W1-8R`) — What does this sign tell you about the road ahead? → _It curves sharply in the direction shown_ (MUTCD Sec. 2C; state driver handbooks (e.g. SC p.64, TX p.35)) — closes #5 (and SC #5)

Universal: the chevron alignment sign is an MUTCD sign used the same way in every state.

## Item-by-item table

| n | Official item | Page | Key | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|---|
| 1 | TYK #1 | p.80 | A | alcohol-drugs | COVERED | `car.ad.001`, `car.ad.042` |  |
| 2 | TYK #2 | p.80 | C | lanes-passing | COVERED | `car.lp.021`, `car.scnr.027`, `car.smv.030` |  |
| 3 | TYK #3 | p.80 | B | right-of-way | COVERED | `car.row.014`, `car.scni.003` |  |
| 4 | TYK #4 (pictures) | p.80 | A | road-signs | COVERED | `car.rsw.016`, `car.rsw.017` | W6-1 Divided Highway. |
| 5 | TYK #5 (chevron) | p.80 | C | road-signs | PARTIAL | `car.rs.093`, **`car.cvvks.002`** (new) | See Conflicts. |
| 6 | TYK #6 | p.80 | C | road-signs | COVERED | `car.rs.129`, `car.rs.127`, `car.rs.130` | White = regulatory; green = guide; yellow = warning. |
| 7 | TYK #7 | p.80 | A | right-of-way | COVERED | `car.row.046` |  |
| 8 | TYK #8 | p.80 | A | sharing-road | COVERED | `car.sr.022` |  |
| 9 | TYK #9 | p.80 | A | sharing-road | COVERED | `car.scnr.013`, `car.sr.017`, `car.sr.018`, `ky.car.079` |  |
| 10 | TYK #10 | p.80 | C | hazards-conditions | COVERED | `car.hz.008`, `car.hz.006`, `car.hz.007`, `car.hz.028` |  |
| 11 | TYK #11 | p.80 | B | safe-habits | COVERED | `car.sh.004`, `car.sh.003` | A distraction takes your attention off driving, even with eyes on the road. |
