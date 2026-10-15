# Wisconsin — official sample questions vs. DriveReady coverage

_Audit date: 2026-10-15. Sources: Wisconsin Motorists' Handbook BDS126 (2026) Section 14 "Practice Quiz"
(`research/handbooks/WI.txt`, answers on p.64) and the Wisconsin Motorcyclists' Handbook BDS110 (`research/handbooks/WI_MOTORCYCLE.txt`,
13 "Test Yourself" items with answers on p.53, plus 5 "Sample knowledge test questions" with answers on p.50). Page
numbers are the `=== PAGE n ===` markers of the file each item comes from (items 1–12: WI.txt, the same PDF numbering the
app's WI refs use; items 13–30: WI_MOTORCYCLE.txt). Extracted questions: `research/official-samples/WI.json` (research
only — never shipped, never copied into the app)._

## Summary

| | Count |
|---|---|
| Official sample questions (car handbook 12 + motorcycle handbook 18; all have printed answer keys) | **30** |
| COVERED (an app question tests the same fact with the same answer) | **26** |
| PARTIAL (related app question, different fact/angle) | **4** |
| MISSING (no app question) | **0** |
| New questions written | **2** Wisconsin (`wi.car.101`–`wi.car.102` in `app/src/content/questions/states/WI.json`). The two motorcycle gaps are closed by the universal `mc.cvtwu.001`–`mc.cvtwu.002` written in the same run (`app/src/content/questions/motorcycle/coverage-tn-wi-ut.json`, listed under coverage-TN.md); no Wisconsin-only universal question was needed. |

Car track: 12 items → 10 covered, 2 partial. Motorcycle track: 18 items → 16 covered, 2 partial. The handbook notes
the quiz items "are not the same as those on the official knowledge test but cover the same subject matter".

Validator: `node scripts/validate-content.mjs src/content/questions/states/TN.json src/content/questions/states/WI.json src/content/questions/states/UT.json src/content/questions/car/coverage-tn-wi-ut.json src/content/questions/motorcycle/coverage-tn-wi-ut.json`
→ **0 errors, 0 warnings** (no duplicate prompts).

Index: `app/src/content/index.ts` already carries the current hash of `states/WI.json`; the new
`motorcycle/coverage-tn-wi-ut.json` (and `car/coverage-tn-wi-ut.json`) still need `node scripts/build-content-index.mjs`
(not run here, per the audit instructions).

## Conflicts (official key vs. app)

No app question contradicts a Wisconsin answer key, so **no existing app question was changed**. Items reviewed closely:

| Official # | Issue | Resolution |
|---|---|---|
| 15 (MC Test Yourself 3) | WI key: more than half of all crashes "involve riders who have ridden their motorcycles less than six months". Universal `mc.gear.024` keys "less than five months" (MSF manual; TN Motorcycle Operator Manual p.43; `research/handbooks/MOTORCYCLE.txt`). The WI handbook body text gives no figure. | Same fact, slightly different number in the WI quiz. Not a practical conflict: `mc.gear.024`'s distractors are 5 weeks / 2 years / 10+ years, and the WI item's distractors (speed over 35 mph, night) are unrelated, so a learner answers both correctly. No change; no WI-only "six months" question added (it would contradict the MSF figure shown to the same learner). |
| 25 (MC Test Yourself 13) | Printed key: **"A and B"** (A = just behind the leader, B = in front of the group). | The handbook text (p.48) says "Put beginners up front: place inexperienced riders just behind the leader", so "in front of the group" is apparently accepted as "up front". `WI.json` records **A** (the MSF answer). `mc.pass.024` keys "Just behind the leader"; its distractor "In front of the leader" (leading the group) is wrong under either reading. No change. |
| 9 (Practice Quiz #9) | Key: it is never OK to exceed the posted limit. | Correct for Wisconsin (handbook p.14 and p.22: you cannot go over the limit, even to pass), but **not universal**: Minnesota (p.37) and Montana (p.48) allow 10 mph over the limit while passing on two-lane highways. Taught as Wisconsin-specific `wi.car.101`; no universal question claims "never". |
| 10 (Practice Quiz #10) | Key: look 10 to 15 seconds ahead. | Wisconsin's number (p.15–16); other handbooks use 12–15 or 20–30 seconds, and no universal question states a number. Taught as `wi.car.102`. |
| 7 (Practice Quiz #7) | Key: stop until the lights stop flashing and no children are around. | Matches `wi.car.079` (go when the red lights stop flashing). |

## New questions

Wisconsin-specific (`states/WI.json`, `"states": ["WI"]`, ref = Wisconsin Motorists' Handbook page):
- `wi.car.101` (speed-space) — You are passing a slow car on a two-lane Wisconsin highway posted at 55 mph. How fast may you legally go to finish the pass? → _No faster than 55 mph; the limit still applies when passing_ (pp. 14, 22) — closes #9
- `wi.car.102` (speed-space) — To keep good control of your vehicle, how far ahead does the Wisconsin Motorists' Handbook say you need to be able to see? → _10 to 15 seconds ahead_ (pp. 15-16) — closes #10

Universal motorcycle (shared with Tennessee, see coverage-TN.md): `mc.cvtwu.001` (reflective, bright gear helps day and
night) closes #20; `mc.cvtwu.002` (flash the brake light before slowing more quickly than others expect) closes #26.

## Item-by-item table

| n | Official item | Page | Key | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|---|
| 1 | Practice Quiz #1 | p.62 | B | speed-space | COVERED | `wi.car.046` |  |
| 2 | Practice Quiz #2 | p.62 | D | emergencies | COVERED | `car.em.053`, `car.em.054` |  |
| 3 | Practice Quiz #3 | p.62 | C | right-of-way | COVERED | `car.row.026`, `car.row.029` |  |
| 4 | Practice Quiz #4 | p.62 | C | hazards-conditions | COVERED | `car.hz.028`, `car.hz.080` |  |
| 5 | Practice Quiz #5 | p.62 | C | signals-markings | COVERED | `car.sm.016` |  |
| 6 | Practice Quiz #6 | p.63 | D | signals-markings | COVERED | `car.smv.030`, `car.sm.038` |  |
| 7 | Practice Quiz #7 | p.63 | B | sharing-road | COVERED | `wi.car.079` |  |
| 8 | Practice Quiz #8 | p.63 | A | freeway | COVERED | `car.fw.004` |  |
| 9 | Practice Quiz #9 | p.63 | A | speed-space | PARTIAL | `car.ss.010`, `car.lp.059`, **`wi.car.101`** (new) | Not universal: MN (p.37) and MT (p.48) allow 10 mph over the limit to pass on two-lane highways. |
| 10 | Practice Quiz #10 | p.63 | C | speed-space | PARTIAL | `wi.car.052`, **`wi.car.102`** (new) | wi.car.052 gave the 10-15 seconds in its prompt but never asked for it. |
| 11 | Practice Quiz #11 | p.63 | A | sharing-road | COVERED | `car.ss.055`, `car.scnr.012` |  |
| 12 | Practice Quiz #12 | p.63 | D | hazards-conditions | COVERED | `car.ss.026` |  |
| 13 | MC Test Yourself 1 | p.18 | C | mc-gear-controls | COVERED | `mc.gear.012` |  |
| 14 | MC Test Yourself 2 | p.22 | C | mc-impairment | COVERED | `mc.imp.022` |  |
| 15 | MC Test Yourself 3 | p.22 | C | mc-gear-controls | COVERED | `mc.gear.024` | WI key says "less than six months"; MSF/TN manuals and mc.gear.024 say five months. See conflicts. |
| 16 | MC Test Yourself 4 | p.25 | C | mc-basic-control | COVERED | `mc.ctl.036` |  |
| 17 | MC Test Yourself 5 | p.30 | A | mc-lane-position | COVERED | `mc.lane.021` |  |
| 18 | MC Test Yourself 6 | p.31 | B | mc-lane-position | COVERED | `mc.lane.044` |  |
| 19 | MC Test Yourself 7 | p.34 | C | mc-intersections | COVERED | `mc.int.004` |  |
| 20 | MC Test Yourself 8 | p.38 | C | mc-intersections | PARTIAL | `mc.int.020`, `mc.int.021`, `mc.int.022`, **`mc.cvtwu.001`** (new) | Same gap as TN #34. |
| 21 | MC Test Yourself 9 | p.40 | C | mc-crash-avoidance | COVERED | `mc.crash.001` |  |
| 22 | MC Test Yourself 10 | p.43 | C | mc-crash-avoidance | COVERED | `mc.crash.026` |  |
| 23 | MC Test Yourself 11 | p.44 | C | mc-crash-avoidance | COVERED | `mc.crash.039` |  |
| 24 | MC Test Yourself 12 | p.47 | A | mc-passengers-groups | COVERED | `mc.pass.011` |  |
| 25 | MC Test Yourself 13 | p.49 | A | mc-passengers-groups | COVERED | `mc.pass.024` | Printed key "A and B"; recorded as A. See conflicts. |
| 26 | MC Sample #1 | p.50 | B | mc-intersections | PARTIAL | `mc.int.027`, `mc.int.028`, **`mc.cvtwu.002`** (new) | Same gap as TN #42. |
| 27 | MC Sample #2 | p.50 | C | mc-basic-control | COVERED | `mc.ctl.023` | About three-quarters = 70% or more. |
| 28 | MC Sample #3 | p.50 | C | mc-crash-avoidance | COVERED | `mc.crash.009` |  |
| 29 | MC Sample #4 | p.50 | C | mc-crash-avoidance | COVERED | `mc.crash.035` |  |
| 30 | MC Sample #5 | p.50 | B | mc-intersections | COVERED | `mc.int.005`, `mc.int.006` | Pictured: car waiting to enter. |
