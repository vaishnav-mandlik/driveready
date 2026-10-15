# Minnesota — official practice test vs. DriveReady coverage

_Audit date: 2026-10-15. Extracted questions: `research/official-samples/MN-online.json` (research only — never shipped, never copied into the app). Page refs are the `=== PAGE n ===` markers of `research/handbooks/MN.txt` (Minnesota Driver's Manual; the PDF numbering the app's MN refs use). There is no earlier handbook audit for Minnesota: the manual (`MN.txt`) prints no sample or study questions._

## What was collectable

| Source (official) | What it is | Collected |
|---|---|---|
| https://assets.dps.mn.gov/files/dvs/dvs-class-d-practice-test.pdf (from `officialPracticeTests`) | DVS "Class D Practice Knowledge Test": 25 questions (2 true/false, 23 multiple choice), each citing the manual chapter, key on p. 5. It says the questions "may or may not be on the actual exam." | **Yes** — 25 items, keyed. |
| DVS pages: https://dps.mn.gov/divisions/dvs, …/license-and-id/class-d-regular-dl, …/class-d-dl-forms-documents-and-manuals, …/class-d-dl-new-driver-under-age-18, …/license-and-id/dl-all | Driver-license pages | Read for links: none links another practice test (the forms/manuals page lists the manual, not the test). No motorcycle practice test was found (a web search of dps.mn.gov returned only the motorcycle manual and permit pages). |

The key is a single column; positions were checked (each letter on the same row as its number). Every key was checked against the manual chapter it cites. 6 plain GET requests (PDF + 5 pages), at least 2 s apart; nothing behind a login or CAPTCHA; no form submitted. The raw download folder `research/raw/online-MN` was deleted after extraction.

## Summary

| | Count |
|---|---|
| Official questions (all keyed) | **25** |
| COVERED | **21** |
| PARTIAL | **4** |
| MISSING | **0** |
| New questions written | **4** — 3 Minnesota (`mn.car.106`-`mn.car.108` in `app/src/content/questions/states/MN.json`) + 1 universal car (`car.cvob.007` in `app/src/content/questions/car/coverage-online-b.json`) |

Validator: `node scripts/validate-content.mjs src/content/questions/states/CT.json src/content/questions/states/IL.json src/content/questions/states/MN.json src/content/questions/car/coverage-online-b.json` → **0 errors, 0 warnings** (no duplicate prompts).

Index: not rebuilt here (per the audit instructions). Run `node scripts/build-content-index.mjs` (with `EXCLUDE_STATES` for in-progress states): `states/CT.json`, `states/IL.json` and `states/MN.json` hashes changed and `questions/car/coverage-online-b.json` is new.

## Conflicts (official key vs. app)

No app question contradicts a Minnesota key; no existing question was changed. Items reviewed closely:

| Official # | Issue | Resolution |
|---|---|---|
| 8 | Keyed choice: blind pedestrians with guide dogs or white canes "must be given the right-of-way **at corners only**". The other choices are clearly wrong, but "at corners only" is not in the manual (p. 50: watch for blind pedestrians, don't honk or rev; yield to pedestrians in marked or unmarked crosswalks), and other manuals say "at all times" (e.g. GA p. 9). | Not taught. The app's `car.row.051`/`car.row.052` key yielding to blind pedestrians wherever they cross, which also selects the keyed choice (the only one that gives them the right-of-way). No change. |
| 4 | Accelerator stuck: key "turn on your four-way flashers" (vs. honk / slam on the brakes). Manual p. 89: free the pedal with your toe; else brake, shift to neutral, steer to the shoulder; if it is unpaved, switch on hazard lights and keep going straight. `car.em.017` keys "shift to neutral, brake, and steer to a safe place off the road". | Consistent (the official choices don't include neutral). The hazard-light step was not taught → new `mn.car.107`. |
| 14 | Red right arrow: don't turn until the light turns green. Manual p. 69: a red arrow means stop; go when the arrow turns green. | Consistent with `car.sm.012` (stop; a few states allow turns on a red arrow — learn your state's rule) and `car.smv.008`. No change. |
| 5 | "When approaching a reduced conflict intersection, you may not turn left" — True. The 2026 manual calls these J-turns (p. 35): side-street drivers turn right, then make a U-turn. | Matches `mn.car.061`. |
| 7 | Key: flashers on and low beams on when stopped along the road at night. Manual p. 40: parking or hazard lights, headlights on low beam. `car.pk.037` keys "parking lights or hazard flashers". | Consistent; the low-beam rule was added as `mn.car.108`. |

## New questions

Minnesota-specific (`states/MN.json`, `"states": ["MN"]`):
- `mn.car.106` (lanes-passing) — On a Minnesota highway with three lanes in your direction, which lane should you drive in when you are not passing, turning left or exiting to the left? → _The right-hand lane, when it is available_ (Minnesota Driver's Manual, p. 36) — closes #10
- `mn.car.107` (emergencies) — Your gas pedal sticks, so you brake and shift to neutral, but the shoulder ahead is not paved. What does the Minnesota Driver's Manual tell you to turn on while you keep steering straight? → _Your hazard warning lights_ (Minnesota Driver's Manual, p. 89) — closes #4
- `mn.car.108` (parking) — You must stop on the shoulder of a Minnesota highway at night. According to the Minnesota Driver's Manual, how should your headlights be set? → _On low beam_ (Minnesota Driver's Manual, p. 40) — closes #7

Universal car (`car/coverage-online-b.json`):
- `car.cvob.007` (speed-space) — You are pulling away from the curb into moving traffic. How big a gap do you need? → _One big enough to get up to the speed of traffic_ (State driver handbooks (e.g. CA p.30, NM p.27, MT p.76, KS p.65)) — closes #15

State-specific vs. universal decisions: the right-hand-lane rule (other states, e.g. CT p. 22, advise a center lane when many vehicles enter and exit), the manual's stuck-pedal hazard-light step and the low-beam rule for parked cars are Minnesota manual rules, so they went to the Minnesota file. The gap needed to enter traffic from a stop is in many handbooks without state differences (CA p. 30, NM p. 27, MT p. 76, KS p. 65), so it is universal.

Answer-position spread of the 16 questions written or rewritten in this CT/FL/IN/IL/MN run (15 new + `ct.car.058`): 4/4/4/4 (positions 0/1/2/3); the correct choice is the uniquely longest option in 0 of them. Wording is original (official wording was not copied).

## Item-by-item table

Key letters follow the official choice order (true/false: A = True, B = False).

| n | Official item | Key | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|
| 1 | Practice test #1: You may pass another vehicle if the line dividing your lane from the… | A | signals-markings | COVERED | `car.smv.032`, `car.sm.039` |  |
| 2 | Practice test #2: When making a turn, you must ____ your speed. | D | intersections-turns | COVERED | `car.cvpa.021` |  |
| 3 | Practice test #3: To prepare for anything coming up on the road ahead, you should: | A | hazards-conditions | COVERED | `car.hz.070` |  |
| 4 | Practice test #4: You are driving on a busy street, and your vehicle’s accelerator stic… | C | emergencies | PARTIAL | `car.em.017`, **`mn.car.107`** (new) | car.em.017 keys neutral/brake/steer off; the manual's hazard-light step (key) was not taught. |
| 5 | Practice test #5: When approaching a reduced conflict intersection, you may not turn le… | A | intersections-turns | COVERED | `mn.car.061` | The manual calls them J-turns: side-street drivers turn right, then U-turn. |
| 6 | Practice test #6: At night, it is hardest to see: | B | hazards-conditions | COVERED | `car.hz.011` |  |
| 7 | Practice test #7: If you stop along the road at night: | D | parking | PARTIAL | `car.pk.037`, **`mn.car.108`** (new) | Flashers/parking lights taught; low-beam headlights were not. |
| 8 | Practice test #8: Pedestrians using guide dogs or white canes must: | A | right-of-way | COVERED | `car.row.051`, `car.row.052` | Key wording 'at corners only' is not in the manual (p.50); app teaches yielding to blind pedestrians wherever they cross. |
| 9 | Practice test #9: Before you leave a parking space that is parallel to the curb, you sh… | C | parking | COVERED | `car.pk.017` |  |
| 10 | Practice test #10: On a road with three or more lanes traveling in the same direction, s… | D | lanes-passing | PARTIAL | `car.lp.002`, **`mn.car.106`** (new) | Universal question covers slower traffic only; MN says use the right-hand lane whenever available. |
| 11 | Practice test #11: When driving through fog or rain, it is advisable to: | C | hazards-conditions | COVERED | `car.hz.028`, `car.hz.080` |  |
| 12 | Practice test #12: Preparing to smoke and smoking while driving: | C | safe-habits | COVERED | `car.cvpa.007` |  |
| 13 | Practice test #13: What does alcohol do to your driving skills and judgment? | D | alcohol-drugs | COVERED | `car.ad.001`, `car.ad.042`, `car.ad.033` |  |
| 14 | Practice test #14: A red arrow pointing to the right on a traffic light means? | B | signals-markings | COVERED | `car.smv.008`, `car.sm.012` | Manual p.69: a red arrow means stop; go when the arrow turns green. |
| 15 | Practice test #15: When you enter traffic from a stop (e.g. pulling away from the curb),… | B | speed-space | PARTIAL | `car.pk.017`, `car.fw.006`, **`car.cvob.007`** (new) | Gap size needed to reach traffic speed from a stop was not taught. |
| 16 | Practice test #16: You should always use your emergency flashers when: | C | emergencies | COVERED | `car.em.049` |  |
| 17 | Practice test #17: The traffic light is red, but a police officer is telling you to proc… | B | signals-markings | COVERED | `car.sm.020` |  |
| 18 | Practice test #18: If you are a minor and your cell phone rings while you are driving, y… | B | safe-habits | COVERED | `mn.car.020` |  |
| 19 | Practice test #19: At night, if an oncoming vehicle fails to dim its high beams, look: | B | hazards-conditions | COVERED | `car.hz.005` |  |
| 20 | Practice test #20: Teenage drivers are more likely to be involved in a crash when: | B | laws-licensing | COVERED | `car.cvpa.006` |  |
| 21 | Practice test #21: Use your headlights on rainy, snowy, or foggy days: | B | hazards-conditions | COVERED | `car.hz.080`, `car.ph.023` |  |
| 22 | Practice test #22: When you want to make a right turn, your car must be: | C | intersections-turns | COVERED | `car.it.001` |  |
| 23 | Practice test #23: When a traffic light turns green, should you go immediately? | C | right-of-way | COVERED | `car.row.033`, `car.row.035` |  |
| 24 | Practice test #24: If you see orange construction signs and cones on a freeway, you must: | B | hazards-conditions | COVERED | `car.fw.050`, `car.hz.059`, `car.rs.123` |  |
| 25 | Practice test #25: After being pulled over by law enforcement, the driver should immedia… | B | laws-licensing | COVERED | `car.ll.004` |  |
