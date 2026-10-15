# Tennessee — official sample questions vs. DriveReady coverage

_Audit date: 2026-10-15. Sources: Tennessee Comprehensive Driver License Manual (`research/handbooks/TN.txt`, the
"Chapter Sample Test Questions" in Section B with the Study Questions Answer Key on p.104) and the Tennessee Motorcycle
Operator Manual (`research/handbooks/TN_MOTORCYCLE.txt`, 14 "Test Yourself" items plus the 5-item Knowledge Test, keys
on p.81). Page numbers are the `=== PAGE n ===` markers of the file each item comes from (items 1–27: TN.txt, the same
PDF numbering the app's TN refs use; items 28–46: TN_MOTORCYCLE.txt). Extracted questions:
`research/official-samples/TN.json` (research only — never shipped, never copied into the app)._

## Summary

| | Count |
|---|---|
| Official sample questions (car manual 27 + motorcycle manual 19; all have printed answer keys) | **46** |
| COVERED (an app question tests the same fact with the same answer) | **39** |
| PARTIAL (related app question, different fact/angle) | **7** |
| MISSING (no app question) | **0** |
| New questions written | **7** — 3 Tennessee (`tn.car.104`–`tn.car.106` in `app/src/content/questions/states/TN.json`) + 2 universal car (`car.cvtwu.001`–`car.cvtwu.002` in `app/src/content/questions/car/coverage-tn-wi-ut.json`) + 2 universal motorcycle (`mc.cvtwu.001`–`mc.cvtwu.002` in `app/src/content/questions/motorcycle/coverage-tn-wi-ut.json`, shared with the Wisconsin audit) |

The TN manual says its sample questions "are actual questions from the driver license test", so every item was treated
as a likely real-test question. Car track: 27 items → 22 covered, 5 partial. Motorcycle track: 19 items → 17 covered,
2 partial (the MSF "Test Yourself"/sample items are almost all already in the universal motorcycle bank).

Validator: `node scripts/validate-content.mjs src/content/questions/states/TN.json src/content/questions/states/WI.json src/content/questions/states/UT.json src/content/questions/car/coverage-tn-wi-ut.json src/content/questions/motorcycle/coverage-tn-wi-ut.json`
→ **0 errors, 0 warnings** (no duplicate prompts).

Index: `app/src/content/index.ts` already carries the current hash of `states/TN.json` (rebuilt elsewhere during this
audit), but the two new files `questions/car/coverage-tn-wi-ut.json` and `questions/motorcycle/coverage-tn-wi-ut.json`
are not indexed yet (`node scripts/check-content-index.mjs` reports exactly these two). Run
`node scripts/build-content-index.mjs` (not run here, per the audit instructions).

## Conflicts (official key vs. app)

No app question has a keyed answer or explanation that contradicts an official Tennessee answer key, so **no existing
app question was changed**. Items reviewed closely:

| Official # | Issue | Resolution |
|---|---|---|
| 11 (Ch.4B #11) | Key: the two-second rule "will hold true at any speed". `tn.car.054` says to increase to at least four seconds at higher interstate speeds, at night, in bad weather and behind motorcycles. | Not a contradiction: manual p.63 says both — the principle holds at any speed on state and U.S. highways with moderate limits, and 4+ seconds is advised in those conditions. `car.ss.016` ("a seconds count works at any speed") covers the key. No change. |
| 5 (Ch.2 #5) | Key: pregnant women wear the lap belt below the abdomen and "the shoulder belt above the belly" (manual p.45). `car.sh.024` keys "shoulder belt beside the belly" (explanation: crosses the chest to the side of the belly). | Same rule in different words (shoulder belt across the chest, never across the belly; NHTSA wording is "to the side of the belly"). No change. |
| 3 (Ch.1 #3) | Key: body about 10 to 12 inches from the wheel (p.41). `car.sh.030`: at least 10 inches. | Consistent. No change. |
| 15 (Ch.5B #15) | The printed page reference ("Page 71") points to a page without the crossover rule in this edition. | The rule is on PDF p.73 (printed p.59): crossovers are for emergency vehicles and highway maintenance crews only; new `tn.car.105` cites p.73. |
| 25 (Ch.8 #25) | Key: file the crash report within 20 days. | Matches `tn.car.087`/`tn.car.088` (20 days; reportable = injury, death or over $400 damage to one person's property, manual p.103). |
| 29 (MC Test Yourself 2) | Key: "less than five months of experience". | Matches `mc.gear.024`. (Wisconsin's version of this item says six months — see coverage-WI.md.) |

## New questions

Tennessee-specific (`states/TN.json`, `"states": ["TN"]`, ref = Tennessee Comprehensive Driver License Manual page):
- `tn.car.104` (safe-habits) — Under Tennessee's child restraint law, what must a 2-year-old who weighs 30 pounds ride in? → _A forward-facing child safety seat_ (p. 45) — closes #4
- `tn.car.105` (freeway) — Who may legally use the emergency crossovers in the median of a Tennessee interstate? → _Only emergency vehicles and highway maintenance crews_ (p. 73) — closes #15
- `tn.car.106` (alcohol-drugs) — A Tennessee driver is convicted of DUI because a prescription painkiller impaired their driving. How do the penalties compare with a DUI for alcohol? → _They are the same as for an alcohol DUI_ (p. 96) — closes #20

Universal car (`car/coverage-tn-wi-ut.json`):
- `car.cvtwu.001` (freeway) — Interstates have no traffic lights, stop signs or cross traffic. What does safe interstate driving still demand from you? → _Constant alertness, since high speeds leave less time to react_ (TN p.82, IL p.89) — closes #16
- `car.cvtwu.002` (emergencies) — You come upon a crash that you did not see happen. Police and an ambulance are already there, and you are not involved. What should you do? → _Keep driving carefully past without stopping_ (TN p.104, PA p.85, NY p.77) — closes #26

Universal motorcycle (`motorcycle/coverage-tn-wi-ut.json`, MSF Motorcycle Operator Manual):
- `mc.cvtwu.001` (mc-intersections) — When does reflective, brightly colored riding gear help other drivers notice you? → _On every ride, day or night_ (MSF p.23) — closes #34 (and WI #20)
- `mc.cvtwu.002` (mc-intersections) — You are riding on a high-speed highway and must slow down sharply to turn onto a side road. What should you do before you brake? → _Flash your brake light to warn drivers behind you_ (MSF p.24) — closes #42 (and WI #26)

State-specific vs. universal decisions: the forward-facing seat ages/weights, the crossover rule (TN statute) and
"drug DUI = same penalties as alcohol" (TN manual p.96; not checked across all 51 jurisdictions) went to the TN file.
"Don't stop at a crash when help is already there unless you are involved" appears in AR, CT, MT, NM, NY and PA
handbooks and TN says to drive on if your help is not needed; no handbook says otherwise, so it is universal. The
interstate-alertness question states a general safety principle with no state-specific number. The two motorcycle
items come straight from the MSF manual used by every state.

Answer-position spread of all 14 new questions written in this TN/WI/UT run: 3/3/4/4; the correct choice is never the uniquely longest option (two questions have equal-length choices).

## Item-by-item table

| n | Official item | Page | Key | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|---|
| 1 | Ch.1 #1 | p.44 | B | safe-habits | COVERED | `car.sh.051`, `car.em.047` |  |
| 2 | Ch.1 #2 | p.44 | A | safe-habits | COVERED | `car.sh.035` |  |
| 3 | Ch.1 #3 | p.44 | B | safe-habits | COVERED | `car.sh.030` | App: at least 10 inches; TN manual p.41: about 10 to 12 inches. Consistent. |
| 4 | Ch.2 #4 | p.48 | C | safe-habits | PARTIAL | `tn.car.021`, **`tn.car.104`** (new) | App had only the rear-facing rule (under 1 year or under 20 lb). |
| 5 | Ch.2 #5 | p.48 | C | safe-habits | COVERED | `car.sh.022`, `car.sh.024` | TN: shoulder belt "above the belly"; app: across the chest to the side of the belly. Same rule. |
| 6 | Ch.2 #6 | p.48 | B | safe-habits | COVERED | `car.sh.032` |  |
| 7 | Ch.3 #7 | p.58 | A | road-signs | COVERED | `car.rs.003`, `car.scni.041` | Pictured sign: YIELD. |
| 8 | Ch.3 #8 | p.58 | C | signals-markings | COVERED | `car.sm.011`, `car.smv.009` |  |
| 9 | Ch.3 #9 | p.58 | B | signals-markings | COVERED | `car.sm.042`, `car.scnr.027` |  |
| 10 | Ch.4B #10 | p.81 | C | parking | COVERED | `tn.car.072`, `tn.car.075` |  |
| 11 | Ch.4B #11 | p.81 | B | speed-space | COVERED | `car.ss.016`, `tn.car.054` | car.ss.016: a seconds count works at any speed; tn.car.054: 4+ seconds in bad weather, at night, at high interstate speeds. |
| 12 | Ch.4B #12 | p.81 | A | intersections-turns | COVERED | `car.it.010` |  |
| 13 | Ch.4B #13 | p.81 | B | sharing-road | COVERED | `tn.car.096` |  |
| 14 | Ch.5B #14 | p.87 | C | freeway | COVERED | `car.fw.003`, `car.fw.004` |  |
| 15 | Ch.5B #15 | p.87 | C | freeway | PARTIAL | `tn.car.063`, **`tn.car.105`** (new) | Who may use crossovers was only in tn.car.063's explanation and distractor. |
| 16 | Ch.5B #16 | p.87 | C | freeway | PARTIAL | `car.fw.029`, `car.ss.040`, **`car.cvtwu.001`** (new) | Related (highway hypnosis, speed narrows vision); nothing on the alertness interstate driving demands. |
| 17 | Ch.6 #17 | p.92 | B | hazards-conditions | COVERED | `car.em.012`, `car.hz.038`, `car.em.016` |  |
| 18 | Ch.6 #18 | p.92 | C | hazards-conditions | COVERED | `car.hz.028` |  |
| 19 | Ch.6 #19 | p.92 | B | hazards-conditions | COVERED | `car.hz.001` |  |
| 20 | Ch.7 #20 | p.98 | A | alcohol-drugs | PARTIAL | `car.ad.014`, `car.ad.020`, **`tn.car.106`** (new) | App said drugged driving is illegal, not that TN penalties equal alcohol DUI. |
| 21 | Ch.7 #21 | p.98 | C | alcohol-drugs | COVERED | `car.ad.010` | car.ad.010: about one drink per hour (four drinks take about four hours). |
| 22 | Ch.7 #22 | p.98 | A | alcohol-drugs | COVERED | `car.ad.001`, `car.ad.043` |  |
| 23 | Ch.7 #23 | p.98 | A | alcohol-drugs | COVERED | `car.ad.027`, `tn.car.005` |  |
| 24 | Ch.7 #24 | p.98 | C | alcohol-drugs | COVERED | `car.ad.001`, `car.ad.042` |  |
| 25 | Ch.8 #25 | p.104 | B | emergencies | COVERED | `tn.car.087` |  |
| 26 | Ch.8 #26 | p.104 | C | emergencies | PARTIAL | `car.sh.010`, **`car.cvtwu.002`** (new) | App covered rubbernecking only, not whether to stop when help is already there. |
| 27 | Ch.8 #27 | p.104 | C | laws-licensing | COVERED | `tn.car.041`, `car.ll.020` |  |
| 28 | MC Test Yourself 1 | p.42 | C | mc-gear-controls | COVERED | `mc.gear.012` |  |
| 29 | MC Test Yourself 2 | p.45 | D | mc-gear-controls | COVERED | `mc.gear.024` |  |
| 30 | MC Test Yourself 3 | p.49 | D | mc-basic-control | COVERED | `mc.ctl.036` |  |
| 31 | MC Test Yourself 4 | p.53 | A | mc-lane-position | COVERED | `mc.lane.021` |  |
| 32 | MC Test Yourself 5 | p.56 | B | mc-lane-position | COVERED | `mc.lane.044` |  |
| 33 | MC Test Yourself 6 | p.59 | C | mc-intersections | COVERED | `mc.int.004` |  |
| 34 | MC Test Yourself 7 | p.61 | D | mc-intersections | PARTIAL | `mc.int.020`, `mc.int.021`, `mc.int.022`, **`mc.cvtwu.001`** (new) | App covered colors and where reflective material helps, not wearing it day and night. |
| 35 | MC Test Yourself 8 | p.66 | D | mc-crash-avoidance | COVERED | `mc.crash.001` |  |
| 36 | MC Test Yourself 9 | p.67 | C | mc-crash-avoidance | COVERED | `mc.crash.026` |  |
| 37 | MC Test Yourself 10 | p.69 | C | mc-crash-avoidance | COVERED | `mc.crash.039` |  |
| 38 | MC Test Yourself 11 | p.71 | D | mc-crash-avoidance | COVERED | `mc.crash.044` |  |
| 39 | MC Test Yourself 12 | p.72 | A | mc-passengers-groups | COVERED | `mc.pass.011` |  |
| 40 | MC Test Yourself 13 | p.74 | A | mc-passengers-groups | COVERED | `mc.pass.024` |  |
| 41 | MC Test Yourself 14 | p.79 | C | mc-impairment | COVERED | `mc.imp.022` |  |
| 42 | MC Knowledge Test #1 | p.80 | B | mc-intersections | PARTIAL | `mc.int.027`, `mc.int.028`, **`mc.cvtwu.002`** (new) | "Slowing more quickly than others expect" was only in mc.int.027's explanation. |
| 43 | MC Knowledge Test #2 | p.80 | C | mc-basic-control | COVERED | `mc.ctl.023` |  |
| 44 | MC Knowledge Test #3 | p.80 | C | mc-crash-avoidance | COVERED | `mc.crash.009` |  |
| 45 | MC Knowledge Test #4 | p.80 | C | mc-crash-avoidance | COVERED | `mc.crash.035` |  |
| 46 | MC Knowledge Test #5 | p.80 | B | mc-intersections | COVERED | `mc.int.005`, `mc.int.006` | Pictured: car waiting at a side street. |
