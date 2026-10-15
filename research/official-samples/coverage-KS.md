# Kansas — official sample questions vs. DriveReady coverage

_Audit date: 2026-10-15. Sources: Kansas Driving Handbook (`research/handbooks/KS.txt`): the ten "Test Your Knowledge"
quizzes at the end of Sections 1–10 (keys printed under each quiz; the handbook says "These questions may be on the
test") and the 13 "Sample Questions" in Section 11 (key p.95); Kansas Motorcycle Handbook
(`research/handbooks/KS_MOTORCYCLE.txt`): 12 "Test Your Knowledge" items (key p.45) and 5 "Knowledge Test- Sample
Questions" (key p.44). Page numbers are the `=== PAGE n ===` markers of the file each item comes from (items 1–44:
KS.txt, the same PDF numbering the app's KS refs use; items 45–61: KS_MOTORCYCLE.txt). Extracted questions:
`research/official-samples/KS.json` (research only — never shipped, never copied into the app)._

## Summary

| | Count |
|---|---|
| Official sample questions (car handbook 31 Test Your Knowledge + 13 sample; motorcycle handbook 12 + 5; all keyed) | **61** |
| COVERED (an app question tests the same fact with the same answer) | **49** |
| PARTIAL (related app question, different fact/angle) | **7** |
| MISSING (no app question) | **5** |
| New questions written | **12** — 9 Kansas (`ks.car.105`–`ks.car.113` in `app/src/content/questions/states/KS.json`) + 3 universal car (`car.cvkic.002`, `car.cvkic.004`, `car.cvkic.005` in `app/src/content/questions/car/coverage-ks-in-ct-il.json`); no motorcycle question needed |

Car track: 44 items → 32 covered, 7 partial, 5 missing. Motorcycle track: 17 items → all covered (the KS motorcycle
handbook reuses the MSF "Test Yourself"/sample items, which the TN/WI/UT audit already closed with
`mc.cvtwu.001`–`mc.cvtwu.002`).

Validator: `node scripts/validate-content.mjs src/content/questions/states/KS.json src/content/questions/states/IN.json src/content/questions/states/CT.json src/content/questions/states/IL.json src/content/questions/car/coverage-ks-in-ct-il.json`
→ **0 errors, 0 warnings** (no duplicate prompts).

Index: not rebuilt here (per the audit instructions). `node scripts/check-content-index.mjs` reports stale hashes for `states/KS.json`, `states/IN.json`, `states/CT.json`, `states/IL.json` and the unindexed new file `questions/car/coverage-ks-in-ct-il.json`; run `node scripts/build-content-index.mjs`.

## Conflicts (official key vs. app)

**No existing app question was changed.** The only real disagreement is motorcycle item XI, where the printed key contradicts the handbook's own text. Items reviewed closely:

| Official # | Issue | Resolution |
|---|---|---|
| 55 (MC Test Your Knowledge XI) | Printed key **B** ("In front of the group"). The same handbook (p.37) says "Put Beginners Up Front — Place inexperienced riders just behind the leader", which is choice A. `mc.pass.024` keys "Just behind the leader" (its distractor "In front of the leader" is wrong under either reading). | Official key error or loose wording ("up front"); the app follows the manual text and the MSF manual. No change. `KS.json` records the printed key B. Same issue as WI's "A and B" key (coverage-WI.md). |
| 46 (MC Test Your Knowledge II) | KS key: more than half of crashes involve riders with **less than 6 months** on their motorcycle (handbook p.10 says the same). `mc.gear.024` keys "less than five months" (MSF manual, TN/CT manuals). | Same fact, slightly different number; `mc.gear.024`'s distractors (5 weeks, 2 years, 10+ years) don't clash, so a learner answers both correctly. No change (as decided for WI). |
| 36 (Sample #5) | Key: average perception time for an alert driver is ¾ second to 1 second (p.58). The CDL bank's `cdl.gk.074` keys 1¾ seconds (CDL manual). | Different manuals use different figures, so the fact is taught only as Kansas-specific `ks.car.105`, without 1¾ s as a distractor. CDL question unchanged (it follows the CDL manual). |
| 19 (TYK Sec.7 #1) | Key: a 4 to 6 second gap when changing lanes (p.64), but p.58 says "identify a 4 to 5 second gap". | `ks.car.111` teaches 4 to 6 seconds (the key and p.64) and does not offer 4–5 as a wrong choice. |
| 13 (TYK Sec.5 #2) | Key: for hand-to-hand steering grip the wheel at 7–8 and 4–5 o'clock (p.31). `car.sh.036` says many handbooks recommend 9 and 3 or 8 and 4. | Consistent (8 and 4 sits inside the Kansas ranges); taught as `ks.car.110`. |
| 30 (TYK Sec.10 #1) | Key: flash your headlights once quickly at an oncoming driver with high beams (p.91). `car.hz.005` keys "keep your low beams on and look to the right edge". | Not a contradiction — Kansas's next step is to look to the right side of the road. Flashing is not universal advice (Michigan's handbook p.78 says it is illegal to even flash high beams within 500 feet of an oncoming vehicle; Indiana p.51 lists repeated headlight flashing as aggressive driving), so it is taught as Kansas-only `ks.car.113`. |
| 2, 3 (TYK Sec.1 #2–3) | Keys (Class C covers vehicles under 26,001 lb GVWR; licenses expire on your birthday) are not stated in the handbook body. | Confirmed by statute: K.S.A. 8-234b(a)(6) and K.S.A. 8-247 (licenses expire on the 6th birthday anniversary for ages 21–64, 4th for 65+, the 21st birthday if issued under 21). Taught as `ks.car.106`, `ks.car.107`. |
| 35 (Sample #4), 44 (Sample #13), 23 (TYK Sec.8 #1) | Traction loss: ease off the brakes and reapply; stalled on tracks: run toward the approaching train; ABS: press as hard as you can. | Match `car.em.015`, `car.em.032` (away from the tracks at an angle toward the train) and `car.em.013` (press firmly, keep steady pressure). |

## New questions

Kansas-specific (`states/KS.json`, `"states": ["KS"]`):
- `ks.car.105` (speed-space) — How long does the Kansas Driving Handbook say an alert driver typically needs to recognize a hazard once their eyes see it? → _Three-quarters of a second to 1 second_ (Kansas Driving Handbook, p. 58) — closes #36
- `ks.car.106` (laws-licensing) — A regular Kansas Class C license lets you drive a single vehicle up to what gross vehicle weight rating? → _Under 26,001 pounds_ (Kansas Statutes Annotated, K.S.A. 8-234b; Kansas Driving Handbook, p. 15) — closes #2
- `ks.car.107` (laws-licensing) — On what date does a Kansas driver's license expire? → _On the driver's birthday_ (Kansas Statutes Annotated, K.S.A. 8-247; Kansas Driving Handbook, pp. 14-15) — closes #3
- `ks.car.108` (safe-habits) — The Kansas Driving Handbook describes a traditional side-mirror setting, where you can just see the edge of your own vehicle. When may this setting be the better choice? → _When towing or backing a truck, van or SUV in tight spaces_ (Kansas Driving Handbook, p. 26) — closes #9
- `ks.car.109` (safe-habits) — According to the Kansas Driving Handbook, what should you make sure of before you start the engine? → _That the parking brake is set_ (Kansas Driving Handbook, p. 30) — closes #12
- `ks.car.110` (safe-habits) — Using hand-to-hand (push/pull) steering as the Kansas Driving Handbook describes, where do your hands grip the wheel? → _Left near 7 to 8 o'clock, right near 4 to 5 o'clock_ (Kansas Driving Handbook, p. 31) — closes #13
- `ks.car.111` (lanes-passing) — How big a gap in traffic does the Kansas Driving Handbook say you need when changing lanes or merging? → _4 to 6 seconds_ (Kansas Driving Handbook, p. 64) — closes #19
- `ks.car.112` (speed-space) — Rain, snow, dust, smoke or fog keeps you from seeing more than 100 feet ahead. According to the Kansas Driving Handbook, what is the fastest you can safely drive? → _30 mph_ (Kansas Driving Handbook, p. 77) — closes #25
- `ks.car.113` (hazards-conditions) — At night, a vehicle coming toward you keeps its high beams on. According to the Kansas Driving Handbook, what should you do first? → _Flash your headlights once, quickly_ (Kansas Driving Handbook, p. 91) — closes #30

Universal car (`car/coverage-ks-in-ct-il.json`):
- `car.cvkic.002` (speed-space) — You are following a pickup truck on a gravel road. How should your following distance compare with what you use on dry pavement? → _Leave more room, since you need longer to stop on loose gravel_ (State driver handbooks (e.g. KS p.90, LA p.108, NJ p.98)) — closes #43
- `car.cvkic.004` (laws-licensing) — Why can a state suspend or take away your driver's license when you break traffic laws? → _Driving is a privilege, not a right_ (State driver handbooks (e.g. KS p.14, FL p.31, PA p.3)) — closes #20
- `car.cvkic.005` (speed-space) — You are about to slow down and stop at the side of the road. What should you check first? → _Your mirrors, for traffic behind you_ (State driver handbooks (e.g. KS p.58, CT p.24, MT p.64, NM p.20)) — closes #14

State-specific vs. universal decisions: perception time, lane-change gap, the 100 ft / 30 mph visibility rule, the
traditional-mirror advice, the hand-to-hand grip, the pre-start parking-brake check, license class weights, license
expiration and headlight flashing are Kansas handbook numbers/advice or Kansas statute, so they went to the Kansas file.
Universal only where no handbook differs: more following distance on gravel (KS, LA, NJ, FL), a license is a privilege,
not a right (24 handbooks say so, none disagree), and checking mirrors before slowing or stopping (KS, CT, MT, NM, NY).
The "pass one hazard at a time" item (#21, pedestrian) was already taught with a bicyclist (`car.ss.055`, `car.scnr.012`).

Answer-position spread of all 38 questions written or rewritten in this KS/IN/CT/IL run (37 new + `il.car.074`): 10/10/9/9; the correct choice is the uniquely longest option in 0 of them.

## Item-by-item table

| n | Official item | Page | Key | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|---|
| 1 | TYK Sec.1 #1 | p.15 | A | laws-licensing | COVERED | `ks.car.016`, `car.ll.002` |  |
| 2 | TYK Sec.1 #2 | p.15 | B | laws-licensing | MISSING | **`ks.car.106`** (new) | Key confirmed by K.S.A. 8-234b(a)(6); the handbook body never states the weight. |
| 3 | TYK Sec.1 #3 | p.15 | A | laws-licensing | MISSING | **`ks.car.107`** (new) | Key confirmed by K.S.A. 8-247 (licenses expire on a birthday). |
| 4 | TYK Sec.2 #1 | p.19 | A | safe-habits | COVERED | `ks.car.051` |  |
| 5 | TYK Sec.2 #2 | p.19 | A | right-of-way | COVERED | `ks.car.080`, `car.sr.052` |  |
| 6 | TYK Sec.3 #1 | p.25 | C | safe-habits | COVERED | `car.rsg.026`, `car.sh.015` | Stop somewhere safe and rest; sleep is the only cure. |
| 7 | TYK Sec.3 #2 | p.25 | B | safe-habits | COVERED | `car.sh.005` |  |
| 8 | TYK Sec.3 #3 | p.25 | A | alcohol-drugs | COVERED | `ks.car.001` |  |
| 9 | TYK Sec.4 #1 | p.29 | A | safe-habits | PARTIAL | `car.sh.052`, **`ks.car.108`** (new) | car.sh.052 covers aiming the side mirrors, not when Kansas says the traditional setting fits. |
| 10 | TYK Sec.4 #2 | p.29 | C | safe-habits | COVERED | `car.sh.026`, `car.sh.027` |  |
| 11 | TYK Sec.4 #3 | p.29 | B | safe-habits | COVERED | `car.sh.032` |  |
| 12 | TYK Sec.5 #1 | p.32 | B | safe-habits | MISSING | **`ks.car.109`** (new) |  |
| 13 | TYK Sec.5 #2 | p.32 | C | safe-habits | PARTIAL | `car.sh.037`, **`ks.car.110`** (new) | car.sh.037 covers not crossing your hands; the 7-8 / 4-5 o'clock grip was not asked. |
| 14 | TYK Sec.5 #3 | p.32 | B | speed-space | PARTIAL | `car.hz.071`, **`car.cvkic.005`** (new) | Only general mirror checking (car.hz.071) was asked. |
| 15 | TYK Sec.6 #1 | p.55 | C | road-signs | COVERED | `car.rs.129` |  |
| 16 | TYK Sec.6 #2 | p.55 | C | signals-markings | COVERED | `car.sm.042`, `car.smv.030` |  |
| 17 | TYK Sec.6 #3 | p.55 | B | parking | COVERED | `car.pk.003`, `car.scnr.032` |  |
| 18 | TYK Sec.6 #4 | p.55 | B | right-of-way | COVERED | `car.scni.011`, `car.row.026`, `car.row.047` |  |
| 19 | TYK Sec.7 #1 | p.72 | C | lanes-passing | MISSING | **`ks.car.111`** (new) | Key matches p.64 (4 to 6 seconds); p.58 says 4 to 5 for lane changes, so 4-5 is not used as a distractor. |
| 20 | TYK Sec.7 #2 | p.72 | B | laws-licensing | MISSING | **`car.cvkic.004`** (new) |  |
| 21 | TYK Sec.7 #3 | p.72 | A | sharing-road | COVERED | `car.ss.055`, `car.scnr.012` | Same rule shown with a bicyclist: take hazards one at a time. |
| 22 | TYK Sec.7 #4 | p.72 | B | lanes-passing | COVERED | `car.lp.009`, `car.sm.042`, `car.lp.035`, `ks.car.069` |  |
| 23 | TYK Sec.8 #1 | p.78 | A | emergencies | COVERED | `car.em.013` | KS: press as hard as you can; app: press firmly and keep steady pressure. Consistent. |
| 24 | TYK Sec.8 #2 | p.78 | B | emergencies | COVERED | `car.em.004`, `car.em.003` |  |
| 25 | TYK Sec.8 #3 | p.78 | B | speed-space | PARTIAL | `ks.car.101`, **`ks.car.112`** (new) | ks.car.101 covered the basic speed law in fog, not the 100 ft / 30 mph rule. |
| 26 | TYK Sec.9 #1 | p.89 | B | sharing-road | COVERED | `car.it.045`, `car.scni.032` |  |
| 27 | TYK Sec.9 #2 | p.89 | A | right-of-way | COVERED | `car.row.046` |  |
| 28 | TYK Sec.9 #3 | p.89 | C | right-of-way | COVERED | `car.row.056`, `car.sr.094` |  |
| 29 | TYK Sec.9 #4 | p.89 | A | sharing-road | COVERED | `car.sr.022` |  |
| 30 | TYK Sec.10 #1 | p.93 | A | hazards-conditions | PARTIAL | `car.hz.005`, **`ks.car.113`** (new) | car.hz.005 keys keep low beams and look right (Kansas's second step); flashing first is Kansas advice. |
| 31 | TYK Sec.10 #2 | p.93 | B | hazards-conditions | COVERED | `car.scnr.042`, `car.hz.065` |  |
| 32 | Sample Q #1 | p.94 | C | parking | COVERED | `car.pk.003`, `car.scnr.032` |  |
| 33 | Sample Q #2 | p.94 | B | lanes-passing | COVERED | `car.lp.037`, `car.scnr.028` |  |
| 34 | Sample Q #3 | p.94 | A | laws-licensing | COVERED | `car.ll.002`, `ks.car.016` |  |
| 35 | Sample Q #4 | p.95 | A | emergencies | COVERED | `car.em.015`, `car.em.007` | KS p.74: if front traction is lost, ease off the brakes and reapply without skidding (= car.em.015). |
| 36 | Sample Q #5 | p.95 | B | speed-space | PARTIAL | `car.ss.027`, `car.ss.028`, **`ks.car.105`** (new) | Stopping-distance parts were covered, not the perception time (Kansas: 3/4 to 1 second). |
| 37 | Sample Q #6 | p.95 | C | signals-markings | COVERED | `car.sm.038`, `car.smv.027` |  |
| 38 | Sample Q #7 | p.95 | C | hazards-conditions | COVERED | `car.hz.050`, `car.hz.053` |  |
| 39 | Sample Q #8 | p.95 | A | right-of-way | COVERED | `car.row.013`, `car.scni.001` |  |
| 40 | Sample Q #9 | p.95 | C | sharing-road | COVERED | `car.sr.042` |  |
| 41 | Sample Q #10 | p.95 | A | intersections-turns | COVERED | `car.it.046` | Stay behind the stop line so a turning truck has room. |
| 42 | Sample Q #11 | p.95 | A | hazards-conditions | COVERED | `car.hz.019` |  |
| 43 | Sample Q #12 | p.95 | A | hazards-conditions | PARTIAL | `car.hz.082`, **`car.cvkic.002`** (new) | car.hz.082 taught slowing down on gravel; following distance was not asked. |
| 44 | Sample Q #13 | p.95 | B | emergencies | COVERED | `car.em.032`, `car.em.031` | Key b (run toward the approaching train) = car.em.032 (away from the tracks at an angle toward the train). |
| 45 | MC Test Your Knowledge I | p.10 | C | mc-gear-controls | COVERED | `mc.gear.012` |  |
| 46 | MC Test Your Knowledge II | p.16 | D | mc-gear-controls | COVERED | `mc.gear.024` | KS: less than 6 months; app (MSF): less than five months. See Conflicts. |
| 47 | MC Test Your Knowledge III | p.16 | D | mc-basic-control | COVERED | `mc.ctl.036` |  |
| 48 | MC Test Your Knowledge IV | p.21 | A | mc-lane-position | COVERED | `mc.lane.021` |  |
| 49 | MC Test Your Knowledge V | p.24 | C | mc-intersections | COVERED | `mc.int.004` |  |
| 50 | MC Test Your Knowledge VI | p.26 | D | mc-intersections | COVERED | `mc.cvtwu.001`, `mc.int.021`, `mc.int.022` | Closed by mc.cvtwu.001 in the TN/WI/UT audit. |
| 51 | MC Test Your Knowledge VII | p.30 | D | mc-crash-avoidance | COVERED | `mc.crash.001` |  |
| 52 | MC Test Your Knowledge VIII | p.32 | C | mc-crash-avoidance | COVERED | `mc.crash.026` |  |
| 53 | MC Test Your Knowledge IX | p.33 | C | mc-crash-avoidance | COVERED | `mc.crash.039` |  |
| 54 | MC Test Your Knowledge X | p.34 | D | mc-crash-avoidance | COVERED | `mc.crash.044` |  |
| 55 | MC Test Your Knowledge XI | p.38 | B | mc-passengers-groups | COVERED | `mc.pass.024` | Printed key B (in front of the group); the manual text (p.37) says just behind the leader. See Conflicts. |
| 56 | MC Test Your Knowledge XII | p.42 | C | mc-impairment | COVERED | `mc.imp.022` |  |
| 57 | MC Sample #1 | p.44 | B | mc-intersections | COVERED | `mc.int.027`, `mc.int.028`, `mc.cvtwu.002` |  |
| 58 | MC Sample #2 | p.44 | C | mc-basic-control | COVERED | `mc.ctl.023` | KS: about three-quarters; app: 70% or more. Consistent. |
| 59 | MC Sample #3 | p.44 | C | mc-crash-avoidance | COVERED | `mc.crash.009` |  |
| 60 | MC Sample #4 | p.44 | C | mc-crash-avoidance | COVERED | `mc.crash.035` |  |
| 61 | MC Sample #5 | p.44 | B | mc-intersections | COVERED | `mc.int.005`, `mc.int.006` | Pictured: car waiting at a side street. |
