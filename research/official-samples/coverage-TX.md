# Texas — official sample questions vs. DriveReady coverage

_Audit date: 2026-10-15. Source: Texas Driver Handbook (DL-7, revised January 2026; `research/handbooks/TX.txt`), Appendix
C "Study and Review Questions for Class C Operators" (PDF pp.84-86): **84 open-ended study questions**, each tagged with
the chapter that answers it. They print no choices and no answer key, so `research/official-samples/TX.json` records
`"choices": []` and `"answer": null`, plus `handbookAnswer` (what the cited chapter says, in summary) and `handbookPages`.
The handbook has no other sample questions, and there is no Texas motorcycle manual in `research/handbooks/`. Pictured
signs and the stopping-distance chart were read in the current PDF (dps.texas.gov DL-7.pdf). Page numbers are the
`=== PAGE n ===` markers of TX.txt (the numbering the app's TX refs use; printed page + 6). TX.json is research only —
never shipped, never copied into the app._

## Summary

| | Count |
|---|---|
| Official study questions (open-ended, no key; answers taken from the cited chapters) | **84** |
| COVERED (an app question tests the same fact with the same answer) | **65** |
| PARTIAL (related app question, different fact/angle) | **7** |
| MISSING (no app question) | **12** |
| New questions written | **19** Texas (`tx.car.100`–`tx.car.118` in `app/src/content/questions/states/TX.json`); no universal question needed |

Several study questions repeat one fact (#15 and #76 emission system; #30 and #75 suspensions; #29 and #68 headlights;
#37 and #53 crossroad sign), so 19 new questions close all 19 partial/missing items.

Validator (all files changed in the VA/KY/TX/SC/AL run): `node scripts/validate-content.mjs src/content/questions/states/TX.json src/content/questions/states/SC.json src/content/questions/car/coverage-va-ky-tx-sc-al.json src/content/questions/motorcycle/coverage-va-ky-tx-sc-al.json`
→ **0 errors, 0 warnings** (no duplicate prompts).

Index: not rebuilt here (per the audit instructions); `check-content-index` lists `states/SC.json`, `states/TX.json` and
the two new `coverage-va-ky-tx-sc-al.json` files — run `node scripts/build-content-index.mjs`.

## Conflicts and outdated official material

**No existing app question was changed.** Items reviewed closely:

| Official # | Issue | Resolution |
|---|---|---|
| 35 | The handbook (p.65, repeated on p.66) says a crash not investigated by an officer must be reported in writing to TxDOT "no later than the 10th day", and its sentence states the condition inverted ("has not resulted in injury or death ... or damage ... of $1,000 or more"). That driver-report duty came from Transportation Code § 550.061, which Texas repealed effective Sept. 1, 2017: chapter 550 now refers only to "former Section 550.061 ... before September 1, 2017" (`research/raw/TX/TN550.txt`), and TxDOT states that driver crash reports (CR-2) stopped being kept under SB 312 (2017). | **Outdated official material, flagged for the owner.** New `tx.car.108` teaches the handbook's 10-day figure because the exam is built from the handbook, and its explanation says the law behind it was repealed in 2017 and TxDOT no longer keeps drivers' reports. Its prompt avoids the garbled injury/$1,000 condition. Drop `tx.car.108` if the owner prefers not to teach an obsolete duty; `tx.car.094`/`tx.car.095` (notify police) already cover the current rule. |
| 1 | The question dates from when 18 was the answer. The current handbook requires an approved driver education course for every applicant younger than 25 (p.13; Class C table p.10: 18 to 24 need an approved course), so the answer today is 25. | `tx.car.034` (driver ed required under 25) is current. No change. |
| 59 | The question assumes a stop within 45–50 ft is possible from some speed; the current chart (1½-second reaction time) shows 63 ft needed from 20 mph (44 ft reaction + 19 ft braking) and lists no lower speed. | New `tx.car.112` teaches the 20-mph figure and that you could not stop within 50 ft even at 20 mph. |
| 18, 20 | The text extraction keeps only the chart's totals; the bar labels were read in the PDF (p.51): 20 mph 44+19=63, 30 mph 66+43=109, 40 mph 88+76=164, 50 mph 110+119=229, 60 mph 132+171=303, 70 mph 154+233=387 ft. | New `tx.car.106` (233 ft braking at 70) and `tx.car.107` (110 ft reaction at 50). The universal bank teaches no numeric reaction time, so nothing contradicts the 1½-second figure. |
| 3 | p.15 says the full list of restrictions is in "Appendix 'XYZ'" (an editing placeholder; no such appendix exists). | Taught from p.13 (corrective lenses) and p.15 (purpose of restrictions): new `tx.car.101`. |
| 70 | Texas says parking lights **or low-beam headlights** (pp.48, 53); universal `car.pk.037` keys "parking lights or hazard flashers". | Consistent (both include parking lights). Texas's low-beam option is taught as `tx.car.113`. |

## New questions

Texas-specific (`states/TX.json`, `"states": ["TX"]`):
- `tx.car.100` (laws-licensing) — What is the maximum fine for a first conviction of driving without a license in Texas? → _$200_ (Texas Driver Handbook, p. 15) — closes #2
- `tx.car.101` (laws-licensing) — Your Texas vision exam shows that you see much better with your glasses on. What can DPS do? → _Add a restriction requiring corrective lenses to drive_ (pp. 13, 15) — closes #3
- `tx.car.102` (laws-licensing) — Texas equipment rules set a standard for your car's foot brake. From 20 mph, the car must be able to stop within what distance? → _25 feet_ (p. 21) — closes #14 (with tx.car.103)
- `tx.car.103` (laws-licensing) — Under Texas equipment rules, from how far away must your car's horn be able to be heard? → _At least 200 feet_ (p. 21) — closes #14
- `tx.car.104` (laws-licensing) — Texas requires cars built in 1968 or later to have an exhaust emission system as well as a muffler. What is the emission system for? → _To help reduce air pollution_ (pp. 21-22) — closes #15 and #76
- `tx.car.105` (laws-licensing) — Which of these is illegal to have on a private passenger car in Texas? → _A device that jams police radar or laser speed checks_ (p. 22) — closes #16
- `tx.car.106` (speed-space) — According to the stopping-distance chart in the Texas Driver Handbook, once the brakes are applied at 70 mph, about how far does a car travel before it stops? → _About 233 feet_ (p. 51) — closes #18
- `tx.car.107` (speed-space) — The Texas Driver Handbook says the average driver needs 1½ seconds to see danger, react and apply the brakes. At 50 mph, about how far does the car go in that time? → _About 110 feet_ (p. 51) — closes #20
- `tx.car.108` (emergencies) — The Texas Driver Handbook says that if a crash is not investigated by a law enforcement officer, a written crash report must be filed with TxDOT. By when? → _Within 10 days after the crash_ (pp. 65-66; Texas Transportation Code, Ch. 550) — closes #35 (see Conflicts)
- `tx.car.109` (laws-licensing) — After certain convictions, a Texas driver must keep proof of financial responsibility on file for the future (an SR-22). For how long? → _Two years from the most recent conviction date_ (pp. 16, 25) — closes #36
- `tx.car.110` (road-signs) — In Texas, a white route marker with the word LOOP above the number tells you what about the road? → _It is a short state highway in a city or urban area_ (p. 38) — closes #55
- `tx.car.111` (laws-licensing) — You are carrying a load that sticks out past the left side of your car. How far does Texas law allow it to extend? → _No more than 3 inches_ (p. 22) — closes #56
- `tx.car.112` (speed-space) — A child runs into the street about 50 feet ahead of you. According to the Texas Driver Handbook's chart, how far does a car going just 20 mph need to stop, counting the driver's reaction time? → _About 63 feet_ (p. 51) — closes #59
- `tx.car.113` (parking) — You must park on an unlighted Texas highway at night. Besides your parking lights, which lights does the Texas Driver Handbook say you may leave on? → _Your low-beam headlights_ (pp. 48, 53) — closes #70
- `tx.car.114` (laws-licensing) — When must a Texas driver show evidence of financial responsibility (proof of insurance)? → _Whenever an officer asks, or after a crash_ (p. 24) — closes #72
- `tx.car.115` (laws-licensing) — An officer asks for proof of insurance during a Texas traffic stop. Which of these is accepted? → _An image of your insurance card on your phone_ (p. 24) — closes #73
- `tx.car.116` (laws-licensing) — Which of these may you drive with a Texas Class C license? → _A pickup towing a 9,000-pound GVWR trailer_ (pp. 9-11) — closes #79
- `tx.car.117` (sharing-road) — Two bicyclists are riding side by side on a Texas road with marked lanes. When is this legal? → _When they stay in one lane and don't impede traffic_ (p. 68; Texas Transportation Code, Sec. 551.103(c)) — closes #81
- `tx.car.118` (sharing-road) — The Texas Driver Handbook lists the most common car-bicycle crashes caused by drivers. Which driver action is one of them? → _Turning left in front of an oncoming bicyclist_ (pp. 59-60) — closes #82

All new questions are Texas-specific: they test Texas fines, equipment rules, license classes, the Texas stopping-distance
chart, Texas route markers, Texas insurance-proof rules, Transportation Code 551.103(c), or a list only the Texas handbook
(and a few others such as AR) prints. Answer-position spread of the 31 questions written in this VA/KY/TX/SC/AL run:
7/8/8/8; the correct choice is the uniquely longest option in 3 of them.

## Item-by-item table

| n | Official item (chapter) | Page | Handbook answer | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|---|
| 1 | Min. age for Class C without driver ed or hardship (Ch.1) | p.84 | 25 (driver ed required under 25) | laws-licensing | COVERED | `tx.car.034`, `tx.car.027` | See Conflicts. |
| 2 | Max fine, 1st conviction driving without a license (Ch.1) | p.84 | Up to $200 (p.15) | laws-licensing | MISSING | **`tx.car.100`** (new) |  |
| 3 | Restrictions on a license (Ch.1) | p.84 | e.g. corrective lenses (pp.13, 15) | laws-licensing | MISSING | **`tx.car.101`** (new) |  |
| 4 | Wheels when parking uphill without a curb (Ch.7) | p.84 | To the right (p.50) | parking | COVERED | `car.pk.004`, `car.scnr.036` |  |
| 5 | No renewal notice received (Ch.1) | p.84 | Still your responsibility to renew (p.15) | laws-licensing | COVERED | `car.ll.014` | Same rule shown with a registration renewal. |
| 6 | Color of broken lane lines on a one-way street (Ch.5) | p.84 | White (p.39) | signals-markings | COVERED | `car.smv.032` |  |
| 7 | Describe the Yield sign (Ch.5) | p.84 | Red-and-white downward triangle (p.32) | road-signs | COVERED | `car.rs.117`, `car.rs.003` |  |
| 8 | Narrow Bridge sign (Ch.5) | p.84 | Bridge narrower than the road; slow down (p.34) | road-signs | COVERED | `car.rsw.013` |  |
| 9 | Keep Right sign shape and action (Ch.5) | p.84 | Vertical rectangle; keep right of island (pp.32, 36) | road-signs | COVERED | `car.rs.039`, `car.rs.129` |  |
| 10 | Double-curve sign (Ch.5) | p.84 | Reverse curve; slow, keep right (p.33) | road-signs | COVERED | `car.rs.089` |  |
| 11 | Do Not Pass sign (Ch.5) | p.84 | Do not pass (p.36) | road-signs | COVERED | `car.rs.033`, `car.rs.034` |  |
| 12 | Keep-right-if-slower sign (Ch.5) | p.84 | SLOWER TRAFFIC KEEP RIGHT (p.36) | road-signs | COVERED | `car.rs.037` |  |
| 13 | Meaning of "Yield Right-of-Way" (Ch.4, 5) | p.84 | Let others go first; given, not taken (pp.26, 37) | right-of-way | COVERED | `car.row.001`, `car.rs.003` |  |
| 14 | Equipment required on cars (Ch.2) | p.84 | Brakes, lights, horn 200 ft, etc. (p.21) | laws-licensing | PARTIAL | `car.sh.046`, `car.cvkic.001`, **`tx.car.102`**, **`tx.car.103`** (new) | Only tire wear and "equipment must be legal" were taught. |
| 15 | Purpose of the exhaust emission system (Ch.2) | p.84 | Reduce air pollution (p.21) | laws-licensing | MISSING | **`tx.car.104`** (new) |  |
| 16 | Equipment forbidden on cars (Ch.2) | p.84 | Red front light, siren, muffler cutout, radar jammer... (p.22) | laws-licensing | PARTIAL | `car.cvkic.001`, **`tx.car.105`** (new) |  |
| 17 | Officer directs you to do something normally illegal (Ch.5) | p.84 | Obey the officer (p.31) | signals-markings | COVERED | `car.cvoa.002` |  |
| 18 | Braking distance at 70 mph (Ch.8) | p.84 | About 233 ft (p.51 chart) | speed-space | MISSING | **`tx.car.106`** (new) | See Conflicts. |
| 19 | When to stop for a school bus (Ch.4) | p.84 | Red lights flashing, either direction (p.29) | sharing-road | COVERED | `tx.car.056`, `car.sr.051`, `car.scnr.003` |  |
| 20 | Reaction distance at 50 mph (Ch.8) | p.84 | About 110 ft (p.51 chart) | speed-space | MISSING | **`tx.car.107`** (new) |  |
| 21 | Parking distance from a crosswalk (Ch.7) | p.84 | 20 ft (p.48) | parking | COVERED | `tx.car.086` |  |
| 22 | Urban district speed limit (Ch.8) | p.84 | 30 mph (p.52) | speed-space | COVERED | `tx.car.069` |  |
| 23 | Posted 55 under all conditions? (Ch.8) | p.84 | No; adjust for conditions (p.52) | speed-space | COVERED | `tx.car.076` |  |
| 24 | No driving on left half within ___ ft (Ch.6) | p.84 | 100 ft (p.44) | lanes-passing | COVERED | `tx.car.066` |  |
| 25 | In the wrong lane to turn (Ch.6) | p.84 | Don't turn; go on (p.45) | intersections-turns | COVERED | `car.it.030` |  |
| 26 | Two-lane road meets four-lane road (Ch.4) | p.84 | Two-lane road yields (p.26) | right-of-way | COVERED | `tx.car.048` |  |
| 27 | Hearing a siren (Ch.4) | p.84 | Pull right and stop (p.28) | right-of-way | COVERED | `car.row.056`, `car.row.057` |  |
| 28 | First thing in a skid (Ch.9) | p.84 | Don't brake hard; foot off the gas (p.54) | emergencies | COVERED | `car.em.007` |  |
| 29 | When headlights must be on (Ch.9) | p.84 | 30 min after sunset–30 min before sunrise; <1,000 ft visibility (p.53) | hazards-conditions | COVERED | `tx.car.080`, `tx.car.081` |  |
| 30 | Conditions for suspension (Ch.1) | p.84 | Mandatory, administrative, ALR, minors (pp.16-18) | laws-licensing | COVERED | `tx.car.041`, `tx.car.042`, `tx.car.003`, `tx.car.004` |  |
| 31 | Carbon monoxide (Ch.14) | p.84 | Deadly exhaust gas; fresh air, call 911 (p.74) | emergencies | COVERED | `car.em.062`, `car.em.066`, `car.sh.049` |  |
| 32 | Blowout (Ch.9) | p.85 | Foot off gas, brake gently, steer straight (p.55) | emergencies | COVERED | `car.em.003`, `car.em.004` |  |
| 33 | Steep downgrade with a manual transmission (Ch.9) | p.85 | Low gear; never coast (pp.55, 50) | hazards-conditions | COVERED | `car.hz.055`, `car.hz.057` |  |
| 34 | Damage to an unattended vehicle (Ch.11) | p.85 | Find the owner or leave a note (p.66) | emergencies | COVERED | `tx.car.097` |  |
| 35 | When crash reports are required (Ch.11) | p.85 | Notify police in listed cases; written report to TxDOT in 10 days (pp.65-66; outdated) | emergencies | PARTIAL | `tx.car.094`, `tx.car.095`, **`tx.car.108`** (new) | See Conflicts. |
| 36 | Years to keep proof of financial responsibility (Ch.3) | p.85 | Two years (p.25) | laws-licensing | MISSING | **`tx.car.109`** (new) |  |
| 37 | Sign: watch for cross traffic right and left (Ch.5) | p.85 | Crossroad warning sign (p.33) | road-signs | COVERED | `car.rs.094` |  |
| 38 | Slow-moving vehicle emblem (Ch.5) | p.85 | Orange triangle, red border; 25 mph or less (p.43) | road-signs | COVERED | `car.smv.049` |  |
| 39 | Gear for a steep hill (Ch.9) | p.85 | Low gear (p.55) | hazards-conditions | COVERED | `car.hz.055` |  |
| 40 | Who may supervise a beginner (Ch.1) | p.85 | Licensed 21+, 1 year experience, front seat (p.7) | laws-licensing | COVERED | `tx.car.024` |  |
| 41 | Provisional license expiry (Ch.1) | p.85 | 18th birthday (p.9) | laws-licensing | COVERED | `tx.car.032` |  |
| 42 | Curb distance when parallel parked (Ch.7) | p.85 | 18 in (pp.49-50) | parking | COVERED | `tx.car.090` |  |
| 43 | Following distance (Ch.8) | p.85 | 2 s at ≤30 mph, 4 s above (p.51) | speed-space | COVERED | `tx.car.074`, `tx.car.075` |  |
| 44 | Change of address (Ch.1) | p.85 | DPS within 30 days (p.15) | laws-licensing | COVERED | `tx.car.040` |  |
| 45 | Marijuana and amphetamines (Ch.10) | p.85 | p.61 effects | alcohol-drugs | COVERED | `car.ad.019`, `car.ad.021`, `car.ad.049` |  |
| 46 | DWI penalty (Ch.10) | p.85 | 1st: up to $2,000, 72 h–180 days, 90–365 day suspension (p.64) | alcohol-drugs | COVERED | `tx.car.005`, `tx.car.006`, `tx.car.004` |  |
| 47 | Green arrow with a red light (Ch.5) | p.85 | Go in arrow direction after yielding (p.31) | signals-markings | COVERED | `car.smv.006`, `car.smv.007`, `car.row.030` |  |
| 48 | Flashing red light (Ch.5) | p.85 | Stop, then go when safe (p.31) | signals-markings | COVERED | `car.smv.011` |  |
| 49 | Sign warning of a train (Ch.5) | p.85 | Round yellow RR sign (p.38) | road-signs | COVERED | `car.rs.122` |  |
| 50 | Winding road sign (Ch.5) | p.85 | p.33 | road-signs | COVERED | `car.rs.090` |  |
| 51 | Merge sign (Ch.5) | p.85 | p.34 | road-signs | COVERED | `car.rsw.008` |  |
| 52 | Sign for a 25-mph safe speed on a turn (Ch.5) | p.85 | Advisory speed sign (pp.36-37) | road-signs | COVERED | `car.rsw.045`, `car.rs.087` |  |
| 53 | Sign: cross traffic ahead (Ch.5) | p.85 | Crossroad sign (p.33) | road-signs | COVERED | `car.rs.094` |  |
| 54 | Sign: sharp rise in the road (Ch.5) | p.85 | BUMP sign (p.35) | road-signs | COVERED | `car.rsw.024` |  |
| 55 | Sign: short state highway in a city (Ch.5) | p.85 | LOOP route marker (p.38) | road-signs | MISSING | **`tx.car.110`** (new) | Texas marker; no image in the sign library. |
| 56 | Max overhang beyond the left fender (Ch.2) | p.85 | 3 in (p.22) | laws-licensing | MISSING | **`tx.car.111`** (new) |  |
| 57 | When you must always stop (Ch.5) | p.85 | Stop signs, red lights, school bus, RR signals, officer (pp.29-39) | signals-markings | COVERED | `car.rs.001`, `car.smv.011`, `car.sr.051` |  |
| 58 | Entering a street from an alley or driveway (Ch.4) | p.85 | Stop before the sidewalk, yield to all (p.26) | right-of-way | COVERED | `car.row.036` |  |
| 59 | Child 45–50 ft ahead: highest stoppable speed (Ch.8) | p.85 | Below 20 mph (63 ft needed at 20 mph, p.51) | speed-space | MISSING | **`tx.car.112`** (new) | See Conflicts. |
| 60 | Parking distance from a fireplug (Ch.7) | p.85 | 15 ft (p.48) | parking | COVERED | `tx.car.085` |  |
| 61 | Meaning of a 55-mph limit (Ch.5) | p.85 | Max speed in good conditions (pp.36, 52) | speed-space | COVERED | `tx.car.076` |  |
| 62 | Max speed on TX/US-numbered highways (Ch.8) | p.85 | 70 mph (p.52) | speed-space | COVERED | `tx.car.071` |  |
| 63 | Never pass when... (Ch.6) | p.85 | No-passing zones, within 100 ft, hills/curves (pp.44-45) | lanes-passing | COVERED | `tx.car.066`, `car.lp.008` |  |
| 64 | Passing on the right not permitted (Ch.6) | p.85 | Only in listed cases; never off the pavement (p.45) | lanes-passing | COVERED | `tx.car.067`, `car.cvpa.018` |  |
| 65 | Left turn when the light turns green (Ch.5) | p.85 | Yield to oncoming traffic (p.31) | intersections-turns | COVERED | `car.row.026` |  |
| 66 | Uncontrolled intersections (Ch.4) | p.85 | Yield to the right; check left (p.26) | right-of-way | COVERED | `car.row.007`, `car.row.009`, `car.row.010` |  |
| 67 | Rules for bicycle riders (Ch.13) | p.86 | pp.68-69 | sharing-road | COVERED | `car.sr.012`, `car.sr.015`, `tx.car.093` |  |
| 68 | When to use headlights (Ch.9) | p.86 | As #29 plus low-beam rules (p.53) | hazards-conditions | COVERED | `tx.car.080`, `tx.car.081`, `tx.car.082`, `tx.car.083` |  |
| 69 | Dim within ___ ft of an approaching car (Ch.9) | p.86 | 500 ft (p.53) | hazards-conditions | COVERED | `tx.car.082` |  |
| 70 | Lights when parked on a highway at night (Ch.9) | p.86 | Parking lights or low beams (pp.53, 48) | parking | PARTIAL | `car.pk.037`, **`tx.car.113`** (new) | See Conflicts. |
| 71 | Lights in fog (Ch.9) | p.86 | Low beams (p.53) | hazards-conditions | COVERED | `car.hz.028` |  |
| 72 | When proof of financial responsibility is required (Ch.3) | p.86 | Officer request, crash, license, registration (p.24) | laws-licensing | PARTIAL | `tx.car.037`, `tx.car.039`, **`tx.car.114`** (new) | Amounts and the fine were taught, not when to show proof. |
| 73 | How to show proof of financial responsibility (Ch.3) | p.86 | Policy, card, binder, bond, deposit, phone image (p.24) | laws-licensing | MISSING | **`tx.car.115`** (new) |  |
| 74 | Sign that says you must slow down (Ch.5) | p.86 | Warning signs (p.32) | road-signs | COVERED | `car.rs.118`, `car.rs.130` |  |
| 75 | What may lead to loss of license (Ch.1) | p.86 | As #30 | laws-licensing | COVERED | `tx.car.041`, `tx.car.042`, `tx.car.003`, `tx.car.004` |  |
| 76 | Equipment required on 1968+ cars besides mufflers (Ch.2) | p.86 | Exhaust emission system (p.21) | laws-licensing | MISSING | **`tx.car.104`** (new) | Same question as #15. |
| 77 | Why seat belts matter (Ch.14) | p.86 | Not thrown out, control (p.70) | safe-habits | COVERED | `car.sh.027` |  |
| 78 | Defensive driving (Ch.14) | p.86 | Alert, look for trouble, plan, protect others (p.70) | safe-habits | COVERED | `car.hz.072`, `car.row.004` |  |
| 79 | License classes and ages (Ch.1) | p.86 | A, B, C, M (pp.9-11) | laws-licensing | PARTIAL | `tx.car.023`, `tx.car.027`, `tx.mc.007`, **`tx.car.116`** (new) | Ages were taught; what each class covers was not. |
| 80 | When a bicyclist need not keep right (Ch.13) | p.86 | Passing, left turn, hazards, lane <14 ft (p.68) | sharing-road | COVERED | `tx.car.093` |  |
| 81 | Riding two abreast (Ch.13) | p.86 | Within one lane, not impeding traffic (p.68) | sharing-road | MISSING | **`tx.car.117`** (new) |  |
| 82 | Three common driver-caused bicycle crashes (Ch.9) | p.86 | Left turn in front, right turn across, stop sign (pp.59-60) | sharing-road | PARTIAL | `car.it.004`, `car.scnr.014`, `car.scnr.015`, **`tx.car.118`** (new) | Only the right-turn crash was taught. |
| 83 | Minor DUI penalties (Ch.10) | p.86 | 1st: up to $500, 20–40 h service, course (p.63) | alcohol-drugs | COVERED | `tx.car.012` |  |
| 84 | Minor non-driving alcohol penalties (Ch.10) | p.86 | 1st: up to $500, 8–12 h, course, 30-day suspension (pp.19, 62) | alcohol-drugs | COVERED | `tx.car.011` |  |
