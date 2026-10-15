# Ohio - official online practice tests vs. DriveReady coverage

_Audit date: 2026-10-15. Collected questions: `research/official-samples/OH-online.json` (research only; never shipped, never copied into the app). Handbook pages use the `=== PAGE n ===` markers in `research/handbooks/`._

## What was collectable

**Listed source:** <https://www.bmv.ohio.gov/dl-sample-test.aspx> (`officialPracticeTests` in
`app/src/content/states/OH.json`).

**Collected (2 plain GET requests):** one static page with **10 questions**. The **answer key is embedded** in the page's
scoring script (`answers[i]` = index of the correct radio button: D C D A A A A D A D).

**Other official OH practice tests:** none. The BMV Motorcycle/Scooter page (<https://www.bmv.ohio.gov/dl-mo-motorcycle.aspx>)
links only to the Motorcycle Ohio operator manual, the Digest and this same car sample test.

## Summary

| | Count |
|---|---|
| Official questions collected | **10** |
| COVERED (an app question tests the same knowledge with the same answer) | **9** |
| PARTIAL (related app question, different fact or angle) | **0** |
| MISSING (no app question) | **1** |
| New questions written | **1** - 1 Ohio (`oh.car.102` in `app/src/content/questions/states/OH.json`) |

Validator: `node scripts/validate-content.mjs src/content/questions/states/CA.json src/content/questions/states/NJ.json src/content/questions/states/OH.json src/content/questions/states/NV.json src/content/questions/car/coverage-online-a.json src/content/questions/motorcycle/coverage-online-a.json` → **0 errors, 0 warnings** (no duplicate prompts).

Index: `car/coverage-online-a.json` and `motorcycle/coverage-online-a.json` are new files, and the state files changed. As instructed, I did not run `build-content-index`; run `node scripts/build-content-index.mjs` before committing.

## Conflicts (official key vs. app)

No conflicts; **no existing question was changed**.

| n | Issue | Resolution |
|---|---|---|
| 4 | The key gives **25 mph in a "residential area"**. The app's `oh.car.056` asks for the 25 mph prima-facie limit on city/village (municipal) streets (ORC 4511.21). The Digest text in `research/` does not list the speed limits in words. | Same number, so counted as COVERED. No new question: the "residential" wording could not be checked against the handbook text. |

## New questions

Ohio-specific (`states/OH.json`, `"states": ["OH"]`):
- `oh.car.102` (laws-licensing) - An Ohio teen is applying for a temporary instruction permit (TIPIC). Applicants younger than what age need a parent or guardian present to co-sign the application? → _18_ (Ohio Driver Manual (Digest of Ohio Motor Vehicle Laws), pp. 1, 12)

## Item-by-item table

Key column: (hb) = answer determined from the handbook (not published by the state).

| n | Official item | Key | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|
| 1 | Q1 | D | speed-space | COVERED | `car.scnr.031`, `car.ss.018`, `car.cvpa.024` |  |
| 2 | Q2 | C | signals-markings | COVERED | `car.sm.015` |  |
| 3 | Q3 | D | laws-licensing | MISSING | **`oh.car.102`** (new) |  |
| 4 | Q4 | A | speed-space | COVERED | `oh.car.056` | oh.car.056 asks the 25 mph limit on city/village streets (ORC 4511.21); the sample says "residential area". |
| 5 | Q5 | A | safe-habits | COVERED | `oh.car.023`, `oh.car.024`, `oh.car.025` |  |
| 6 | Q6 | A | sharing-road | COVERED | `oh.car.080` |  |
| 7 | Q7 | A | right-of-way | COVERED | `car.row.007` |  |
| 8 | Q8 | D | alcohol-drugs | COVERED | `car.ad.002`, `car.ad.009` |  |
| 9 | Q9 | A | intersections-turns | COVERED | `oh.car.069` |  |
| 10 | Q10 | D | intersections-turns | COVERED | `car.it.040` |  |
