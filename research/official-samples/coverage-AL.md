# Alabama — official sample questions vs. DriveReady coverage

_Audit date: 2026-10-15. Sources: the Alabama Driver Manual (`research/handbooks/AL.txt`, Nov. 2024) prints **no** sample,
review or practice questions (checked for "Test Yourself", "Review", "Sample", "Quiz", numbered items with a./b./c.
choices and answer keys — the only lettered lists are the document requirements on pp.8-9 and the parking steps on pp.30-31). All
official items come from the Alabama Motorcycle Operator Manual (`research/handbooks/AL_MOTORCYCLE.txt`, MSF text): 14
"Test Yourself" items placed through the manual and the 5-item "Knowledge Test (Sample Questions)" on p.49, with both keys
on p.50: **Test Yourself 1-C, 2-D, 3-D, 4-A, 5-B, 6-C, 7-D, 8-D, 9-C, 10-C, 11-D, 12-A, 13-A, 14-C; Knowledge Test 1-B,
2-C, 3-C, 4-C, 5-B**. (Each Test Yourself box prints "Answer - page 45", a leftover from the MSF layout; the key is on PDF
p.50, printed p.48.) Page numbers are the `=== PAGE n ===` markers of AL_MOTORCYCLE.txt. Extracted questions:
`research/official-samples/AL.json` (research only — never shipped, never copied into the app)._

## Summary

| | Count |
|---|---|
| Official sample questions (motorcycle manual 14 Test Yourself + 5 Knowledge Test; all keyed; car manual 0) | **19** |
| COVERED (an app question tests the same fact with the same answer) | **19** |
| PARTIAL (related app question, different fact/angle) | **0** |
| MISSING (no app question) | **0** |
| New questions written | **0** |

The Alabama motorcycle manual reuses the MSF Test Yourself and Knowledge Test items that the TN, WI, UT, KS and CT audits
already closed (`mc.cvtwu.001`, `mc.cvtwu.002`); the Alabama keys are identical to the TN keys.

Every key letter was checked against the Alabama text (key pages are not printed per item): 1 → p.10 (faceshield
"can help protect your whole face"), 2 → p.12 (more than half of crashes involve riders with less than five months on
their motorcycle), 3 → p.18 ("Turn just your head, not your shoulders"), 4 → pp.20-21 (get tailgaters in front of you;
change lanes and let them pass), 5 → p.25 ("Cover the clutch lever and both brakes to reduce reaction time"), 6 → p.24
("Never count on 'eye contact'"), 7 → p.27 (reflective, bright-colored clothing; most crashes happen in daylight) and p.30
(reflective materials at night), 8 → p.31 ("apply both brakes at the same time"), 9 → p.34 ("When it starts to rain,
ride in the tire tracks"), 10 → p.37 (grip the handlebars firmly, close the throttle gradually), 11 → p.38 (downshift,
approach slowly, then accelerate away), 12 → p.39 (passengers lean with you), 13 → p.42 ("Place inexperienced riders just
behind the leader"), 14 → p.47 (wait until your system eliminates the alcohol "and its fatiguing after-effects"); KT 1 →
p.28 (flash the brake light before slowing more quickly than others expect), KT 2 → p.16 (front brake "70% or more"),
KT 3 → p.31 (swerve: pressure on the handgrip on the side of your escape), KT 4 → p.36 (brake the tire that isn't flat,
edge to the side of the road), KT 5 → p.25 (slow, choose a visible lane position, cover the controls). All keys are
unambiguous and supported.

Validator: no Alabama file was changed. The run's changed files (`states/TX.json`, `states/SC.json`, both
`coverage-va-ky-tx-sc-al.json` files) validate with **0 errors, 0 warnings**.

## Conflicts (official key vs. app)

**None.** Notes:

| Official # | Issue | Resolution |
|---|---|---|
| 2 (TY 2) | Key: less than **five** months of experience (p.12). | Matches `mc.gear.024` (the KS/WI manuals say six months; see coverage-KS.md). |
| 18 (KT 4) | Alabama's edition keys "Brake on the good tire and steer to the side of the road" (South Carolina's AAMVA edition keys "Ease off the throttle" for the same item — see coverage-SC.md). | Matches `mc.crash.035` (brake on the good tire) and new `mc.cvvks.006` (first steps). |

## Item-by-item table

| n | Official item | Page | Key | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|---|
| 1 | Test Yourself 1 | p.11 | C | mc-gear-controls | COVERED | `mc.gear.012` |  |
| 2 | Test Yourself 2 | p.14 | D | mc-gear-controls | COVERED | `mc.gear.024` |  |
| 3 | Test Yourself 3 | p.18 | D | mc-basic-control | COVERED | `mc.ctl.036` |  |
| 4 | Test Yourself 4 | p.22 | A | mc-lane-position | COVERED | `mc.lane.021` |  |
| 5 | Test Yourself 5 | p.25 | B | mc-lane-position | COVERED | `mc.lane.044` |  |
| 6 | Test Yourself 6 | p.28 | C | mc-intersections | COVERED | `mc.int.004` |  |
| 7 | Test Yourself 7 | p.30 | D | mc-intersections | COVERED | `mc.cvtwu.001`, `mc.int.020` | Reflective, bright gear day and night. |
| 8 | Test Yourself 8 | p.35 | D | mc-crash-avoidance | COVERED | `mc.crash.001` |  |
| 9 | Test Yourself 9 | p.36 | C | mc-crash-avoidance | COVERED | `mc.crash.026` |  |
| 10 | Test Yourself 10 | p.38 | C | mc-crash-avoidance | COVERED | `mc.crash.039` |  |
| 11 | Test Yourself 11 | p.40 | D | mc-crash-avoidance | COVERED | `mc.crash.044` |  |
| 12 | Test Yourself 12 | p.41 | A | mc-passengers-groups | COVERED | `mc.pass.011` |  |
| 13 | Test Yourself 13 | p.43 | A | mc-passengers-groups | COVERED | `mc.pass.024` |  |
| 14 | Test Yourself 14 | p.48 | C | mc-impairment | COVERED | `mc.imp.022` |  |
| 15 | Knowledge Test 1 | p.49 | B | mc-intersections | COVERED | `mc.cvtwu.002`, `mc.int.027`, `mc.int.028` |  |
| 16 | Knowledge Test 2 | p.49 | C | mc-basic-control | COVERED | `mc.ctl.023` |  |
| 17 | Knowledge Test 3 | p.49 | C | mc-crash-avoidance | COVERED | `mc.crash.009` |  |
| 18 | Knowledge Test 4 | p.49 | C | mc-crash-avoidance | COVERED | `mc.crash.035` |  |
| 19 | Knowledge Test 5 (picture) | p.49 | B | mc-intersections | COVERED | `mc.int.005`, `mc.int.006` | Pictured: car waiting at a side street. |
