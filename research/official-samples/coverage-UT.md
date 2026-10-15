# Utah — official sample questions vs. DriveReady coverage

_Audit date: 2026-10-15. Source: Utah Driver Handbook 2026 (`research/handbooks/UT.txt`), "Sample Test Questions" on
p.112 (Sections 3, 4, 6, 7, 8, 9, 10; answers printed on the same page). Page numbers are the `=== PAGE n ===` markers
(the same PDF numbering the app's UT refs use). No separate Utah motorcycle manual is in `research/handbooks/`, so there
is no motorcycle track for Utah. Extracted questions: `research/official-samples/UT.json` (research only — never shipped,
never copied into the app; items are numbered 1–13 in page order, the official section numbers are in the table)._

## Summary

| | Count |
|---|---|
| Official sample questions (all with printed answers; 7 are True/False) | **13** |
| COVERED (an app question tests the same fact with the same answer) | **8** |
| PARTIAL (related app question, different fact/angle) | **2** |
| MISSING (no app question) | **3** |
| New questions written | **5** Utah (`ut.car.104`–`ut.car.108` in `app/src/content/questions/states/UT.json`); no universal question needed |

Validator: `node scripts/validate-content.mjs src/content/questions/states/TN.json src/content/questions/states/WI.json src/content/questions/states/UT.json src/content/questions/car/coverage-tn-wi-ut.json src/content/questions/motorcycle/coverage-tn-wi-ut.json`
→ **0 errors, 0 warnings** (no duplicate prompts).

Index: `app/src/content/index.ts` already carries the current hash of `states/UT.json` (the new universal coverage
files from this run still need `node scripts/build-content-index.mjs`, not run here).

## Conflicts (official key vs. app)

None. Every printed answer agrees with the app and the handbook; **no existing app question was changed**. Notes:

| Official # | Issue | Resolution |
|---|---|---|
| 10–11 (Sec.9 #1–2) | The printed answer line reads "Section 9— 2. A 3. B", but the section has only questions 1 and 2. | Typo; read as 1. A (white = one direction), 2. B (yellow = two directions), which matches the handbook and `car.sm.039`/`car.sm.038`. |
| 12 (Sec.10 #1) | Key: 6 months for under-21 drivers with any measurable alcohol. | Matches `ut.car.005` and the Not-a-Drop Act text (p.62). |
| 13 (Sec.10 #2) | Key: 3-year ignition interlock restriction for a first DUI when under 21. | Matches `ut.car.011` (p.64: 18 months if 21+, three years if under 21 at arrest). |
| 1 (Sec.3 #1) | Key: True — 19+ never-licensed applicants need not take driver education. | Handbook p.16 adds the condition: hold a learner permit 90 days and drive 40 hours (10 after sunset), or take driver ed and skip the 90 days. New `ut.car.104` teaches the age threshold with that condition. |

## New questions

Utah-specific (`states/UT.json`, `"states": ["UT"]`, ref = Utah Driver Handbook page):
- `ut.car.104` (laws-licensing) — At what age may a never-licensed Utah applicant get a driver license without completing a driver education course? → _19 or older_ (p. 16) — closes #1
- `ut.car.105` (laws-licensing) — Which class of Utah driver license lets you drive ordinary personal vehicles, such as a family car or pickup truck? → _Class D_ (pp. 20-21) — closes #3
- `ut.car.106` (laws-licensing) — Who provides the vehicle for a Utah driving skills test at a Driver License Division office? → _You do, and it must be registered, insured and safe to drive_ (pp. 33-35) — closes #5
- `ut.car.107` (laws-licensing) — In Utah, what may a certified third-party tester give a new driver? → _The driving skills test_ (p. 35) — closes #6
- `ut.car.108` (safe-habits) — Who must be buckled in a safety belt or child seat whenever a vehicle is moving in Utah? → _Everyone in the vehicle_ (pp. 37-38) — closes #7

State-specific vs. universal decisions: license classes, testing logistics, driver-education age rules and the
all-occupant belt law differ between states, so all five went to the Utah file. The covered items include two universal
facts (children 12 and under ride in back, `car.sh.032`; white vs. yellow lines, `car.sm.039`/`car.sm.038`).

Answer-position spread of all 14 new questions written in this TN/WI/UT run: 3/3/4/4; the correct choice is never the
uniquely longest option (two questions have equal-length choices).

## Item-by-item table

| n | Official item | Page | Key | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|---|
| 1 | Sec.3 #1 | p.112 | A | laws-licensing | PARTIAL | `ut.car.025`, `ut.car.026`, **`ut.car.104`** (new) | App implied driver ed is optional at 22 but never asked the age-19 threshold. |
| 2 | Sec.3 #2 | p.112 | A | laws-licensing | COVERED | `ut.car.024` |  |
| 3 | Sec.4 #1 | p.112 | D | laws-licensing | MISSING | **`ut.car.105`** (new) |  |
| 4 | Sec.4 #2 | p.112 | A | laws-licensing | COVERED | `ut.mc.003`, `car.ll.018` |  |
| 5 | Sec.6 #1 | p.112 | A | laws-licensing | MISSING | **`ut.car.106`** (new) |  |
| 6 | Sec.6 #2 | p.112 | B | laws-licensing | MISSING | **`ut.car.107`** (new) |  |
| 7 | Sec.7 #1 | p.112 | A | safe-habits | PARTIAL | `ut.car.014`, **`ut.car.108`** (new) | ut.car.014 covers when police can stop you, not who must buckle up. |
| 8 | Sec.7 #2 | p.112 | B | safe-habits | COVERED | `car.sh.032` |  |
| 9 | Sec.8 #1 | p.112 | B | lanes-passing | COVERED | `ut.car.071`, `car.lp.043` |  |
| 10 | Sec.9 #1 | p.112 | A | signals-markings | COVERED | `car.sm.039` | Printed key numbers this section "2. A 3. B"; read as 1. A, 2. B. |
| 11 | Sec.9 #2 | p.112 | B | signals-markings | COVERED | `car.sm.038` |  |
| 12 | Sec.10 #1 | p.112 | B | alcohol-drugs | COVERED | `ut.car.005` |  |
| 13 | Sec.10 #2 | p.112 | C | alcohol-drugs | COVERED | `ut.car.011` |  |
