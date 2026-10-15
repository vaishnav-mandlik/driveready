# Virginia — official sample questions vs. DriveReady coverage

_Audit date: 2026-10-15. Source: Virginia Driver's Manual (`research/handbooks/VA.txt`), Section 8 "Sample Knowledge
Exam" (PDF p.37, printed p.35) with the printed key "Correct Answers" on p.38: **1. A, 2. D, 3. A, 4. C, 5. D, 6. D,
7. A, 8. C, 9. D, 10. C**. Items 1–5 are pictured signs; the pictures were checked in the current PDF (dmv39.pdf): plain
yellow diamond, ONE WAY signs, right-lane-ends symbol sign, crossroad sign, NO TURN ON RED. Page numbers are the
`=== PAGE n ===` markers of VA.txt (the numbering the app's VA refs use). There is no Virginia motorcycle manual in
`research/handbooks/`, so this is car track only. Extracted questions: `research/official-samples/VA.json` (research only —
never shipped, never copied into the app)._

## Summary

| | Count |
|---|---|
| Official sample questions (all keyed) | **10** |
| COVERED (an app question tests the same fact with the same answer) | **9** |
| PARTIAL (related app question, different fact/angle) | **1** |
| MISSING (no app question) | **0** |
| New questions written | **1** universal car (`car.cvvks.001` in `app/src/content/questions/car/coverage-va-ky-tx-sc-al.json`); no Virginia-specific question needed |

Every key letter was checked against the manual (the key prints no page numbers): 1 → p.9 (Diamond: "warn you of special
conditions or hazards ahead"), 2 → p.9 (One Way: "Traffic flows only in the direction of the arrow"), 3 → p.10 (Lane
Reduction: "The right lane ends soon ... merge left"), 4 → p.11 (Intersections), 5 → p.9 (No Turn on Red), 6 → p.26
(alcohol affects "vision, judgment, and coordination"), 7 → p.25 ("release the accelerator and apply brakes gently"),
8 → p.20 (Slow or Stop: "Left hand and arm pointing downward"), 9 → p.17 ("remain stopped until all persons are clear and
the bus moves again"), 10 → p.27 (stop, help the injured, report to police, exchange information, notify your insurer).
All ten keys are unambiguous and supported.

Validator (all files changed in the VA/KY/TX/SC/AL run): `node scripts/validate-content.mjs src/content/questions/states/TX.json src/content/questions/states/SC.json src/content/questions/car/coverage-va-ky-tx-sc-al.json src/content/questions/motorcycle/coverage-va-ky-tx-sc-al.json`
→ **0 errors, 0 warnings** (no duplicate prompts).

Index: not rebuilt here (per the audit instructions). `node scripts/check-content-index.mjs` reports stale hashes for
`states/SC.json` and `states/TX.json` and the unindexed new files `questions/car/coverage-va-ky-tx-sc-al.json` and
`questions/motorcycle/coverage-va-ky-tx-sc-al.json`; run `node scripts/build-content-index.mjs` (keep in-progress states such
as WV excluded).

## Conflicts (official key vs. app)

**None. No existing app question was changed.** Items reviewed closely:

| Official # | Issue | Resolution |
|---|---|---|
| 6 | Key "All of these" (coordination, vision, judgment). `car.ad.001` asks which ability is affected *first* (judgment) and lists "Coordination" as a wrong choice for that narrower question. | Not a contradiction (its explanation says vision, reaction time and coordination are impaired too), but no question taught that all three are affected, so `car.cvvks.001` was added. |
| 8 | Key: left hand and arm pointing downward = stop. `car.smv.048` (HAND-STOP picture) says a left arm bent downward means slow or stop. | Same signal. No change. |
| 9 | Key: same-direction traffic stops until all persons are clear and the bus moves again. | Matches `va.car.075`, `va.car.077` and `car.sr.051`. |

## New questions

Universal car (`car/coverage-va-ky-tx-sc-al.json`):
- `car.cvvks.001` (alcohol-drugs) — A driver has had a few drinks. Which driving abilities can the alcohol impair? → _Judgment, vision and coordination_ (State driver handbooks (e.g. VA p.26, TX p.61, AL p.35, TN p.97, WA p.74)) — closes #6

Universal, not Virginia-specific: many handbooks name all three (VA p.26, TX p.61, AL pp.35-36, TN p.97, WA p.74, MO p.73),
others name judgment, vision and reaction time (KY p.33, SC p.37); no handbook says any of them is unaffected.

## Item-by-item table

| n | Official item | Page | Key | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|---|
| 1 | Sample #1 (plain yellow diamond) | p.37 | A | road-signs | COVERED | `car.rs.118` | Diamond = warning of a hazard or change ahead. |
| 2 | Sample #2 (ONE WAY) | p.37 | D | road-signs | COVERED | `car.rs.050`, `car.rs.051` |  |
| 3 | Sample #3 (right lane ends) | p.37 | A | road-signs | COVERED | `car.cvkic.003`, `car.rsw.034` | W4-2R symbol sign and W9-1. |
| 4 | Sample #4 (crossroad) | p.37 | C | road-signs | COVERED | `car.rs.094` |  |
| 5 | Sample #5 (NO TURN ON RED) | p.37 | D | road-signs | COVERED | `car.rs.068`, `car.rs.066` |  |
| 6 | Sample #6 | p.37 | D | alcohol-drugs | PARTIAL | `car.ad.001`, `car.ad.042`, `car.ad.034`, **`car.cvvks.001`** (new) | Judgment, reaction time and night vision were taught separately; never that coordination, vision and judgment are all impaired. |
| 7 | Sample #7 | p.37 | A | hazards-conditions | COVERED | `car.hz.038`, `car.hz.039` | Brake gently on ice and snow. |
| 8 | Sample #8 | p.37 | C | signals-markings | COVERED | `car.smv.048` |  |
| 9 | Sample #9 | p.37 | D | sharing-road | COVERED | `va.car.075`, `va.car.077`, `car.sr.051`, `car.scnr.003` |  |
| 10 | Sample #10 | p.37 | C | emergencies | COVERED | `car.em.053`, `car.em.054`, `car.em.057`, `va.car.096` | Must stop, get help for the injured, report to police (`va.car.096`), exchange information. |
