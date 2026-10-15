# Connecticut — official practice tests vs. DriveReady coverage

_Audit date: 2026-10-15. Extracted questions: `research/official-samples/CT-online.json` (research only — never shipped, never copied into the app). Page refs are the `=== PAGE n ===` markers of `research/handbooks/CT.txt` (Connecticut Driver's Manual, March 2023; the same PDF numbering the app's CT refs use). The handbook audit (`coverage-CT.md`) already covered the manual's 10 study questions and the motorcycle manual; this audit covers the DMV's three practice-test PDFs._

## What was collectable

| Source (official) | What it is | Collected |
|---|---|---|
| https://portal.ct.gov/dmv/-/media/dmv/practice-tests/practice-test-one.pdf (from `officialPracticeTests`) | "Practice Test ONE": 21 three-choice questions, then an answer section that repeats them with the correct choice in bold and an "ANSWER" label beside it | **Yes** — 21 items (n 1-21). #13 ("This sign means") is printed **without its sign image**; the same item in Test Three (#5) shows the R3-6L left-turn-or-straight lane-use sign. |
| https://portal.ct.gov/dmv/-/media/dmv/practice-tests/practice-test-two.pdf | "Practice Test TWO": 21 items, same layout | **Yes** — n 22-42 |
| https://portal.ct.gov/dmv/-/media/dmv/practice-tests/practice-test-three.pdf | "Practice Test THREE": 21 items, 16 of them repeats of Tests One/Two | **Yes** — n 43-63 (repeats carry `sameAs`). Its #10 has no "ANSWER" label; the bold choice (B, left lane) matches Test One #10's labeled key. |
| https://portal.ct.gov/dmv/licenses-permits-ids/take-knowledge-vision-test (DMV page that links the PDFs) | Links the three PDFs and Spanish versions; says the real test has 25 questions and 20 correct answers pass; says the DMV mobile app has sample questions | Page read. The Spanish PDFs are translations of the same items (not collected). The mobile app's sample questions are not on a web page — **not collected**. |

**Key extraction.** The answer key is a separate text column ("ANSWER" boxes at x ≈ 440 pt), so keys were read by position, not text order: in 62 of 63 items the ANSWER label sits on the same line (±2 pt) as the only bold choice — two independent signals that agree. The exception is Test Three #10 (bold only; see above). Every key was then checked against the manual page in the table notes; all agree with the manual.

4 plain GET requests in total (3 PDFs + the DMV page), at least 2 s apart. Nothing was behind a login or CAPTCHA, and no form was submitted. Sign images were viewed (rendered from the PDFs) to identify W3-3, R3-4 and R3-6L. The raw download folder `research/raw/online-CT` was deleted after extraction.

## Summary

| | Items | Distinct questions |
|---|---|---|
| Official questions (all keyed) | **63** | **47** (16 repeats in Test Three) |
| COVERED (same fact, same answer) | **50** | **38** |
| PARTIAL | **9** | **6** |
| MISSING | **4** | **3** |

COVERED includes #42 after the conflict fix below. New questions written: **9** — 3 Connecticut (`ct.car.107`-`ct.car.109` in `app/src/content/questions/states/CT.json`) + 6 universal car (`car.cvob.001`-`car.cvob.006` in the new file `app/src/content/questions/car/coverage-online-b.json`); **1 existing question corrected** (`ct.car.058`). No motorcycle items were published, so no motorcycle question was needed.

Validator: `node scripts/validate-content.mjs src/content/questions/states/CT.json src/content/questions/states/IL.json src/content/questions/states/MN.json src/content/questions/car/coverage-online-b.json` → **0 errors, 0 warnings** (no duplicate prompts).

Index: not rebuilt here (per the audit instructions). Run `node scripts/build-content-index.mjs` (with `EXCLUDE_STATES` for in-progress states): `states/CT.json`, `states/IL.json` and `states/MN.json` hashes changed and `questions/car/coverage-online-b.json` is new.

## Conflicts (official key vs. app)

| Official # | Issue | Resolution |
|---|---|---|
| 42 (Test Two #21) | Key B: you may not park within **25 feet** of a stop sign; the manual agrees (p. 39: "Within 25 feet of a stop sign"). `ct.car.058` asked about the law in effect since Oct. 1, 2025 (P.A. 25-65, Conn. Gen. Stat. § 14-251: 30 feet from a stop or yield sign) and keyed **30 feet** — the app contradicted the official materials. | **Changed `ct.car.058`** (id kept), following CONTENT_GUIDE rule 10: it now asks what the Connecticut Driver's Manual says and keys 25 feet; the explanation states the 30-foot law and that parking 30+ feet away satisfies both; 30 feet is not offered as a choice. The CT cheat-sheet fact (`parking_stop_sign_signal`) already gives the current 30-foot law and notes the manual's 25 feet — not edited here. |
| 40 (Test Two #19) | Key: while being passed in a no-passing zone, slow down and let the passer return (choice "maintain your speed and position" is wrong). The app's universal questions teach "don't speed up / keep your lane" (`car.lp.007`, `car.ss.022`), and Nebraska's manual says keep a steady speed in a normal pass (`ne.car.104`). | Not a contradiction — this is an unsafe pass with a conflict ahead. Added universal `car.cvob.005` (slow down when an oncoming vehicle appears while you are being passed; OK p. 35, TN p. 77, MA p. 111). |
| 31 (Test Two #10) | Key: hold the wheel tightly and use the brakes lightly. `car.em.003`/`car.em.004` key "hold the wheel firmly" and "ease off the gas"; the explanation says to brake gently once the car is stable. | Consistent with manual p. 41 ("Take your foot off the gas pedal and use the brakes lightly"). No change. |
| 21 (Test One #21) | Key: change lanes to the left to avoid merging traffic ("slow down" is a wrong choice). `car.fw.008` keys "If safe, move left or adjust speed to make room". | Consistent with manual p. 24 ("If there is no one next to you, move over a lane"). No change. |
| 61 (Test Three #19) | Key: work-zone fines "can be double normal fines". Manual p. 17: fines up to $1,000 for speeding and other violations; distracted-driving fines are doubled. | Consistent with `car.rsw.069`, `ct.car.044`, `ct.car.079`. No change. |
| 13 (Test One #13) | Sign image missing in the PDF. | Identified from the same item in Test Three (#47, R3-6L); covered by `car.rs.025`. |

## New questions

Connecticut-specific (`states/CT.json`, `"states": ["CT"]`):
- `ct.car.107` (laws-licensing) — A 16-year-old just got a Connecticut driver's license. For how long do the teen passenger restrictions apply? → _For the first 12 months_ (Connecticut Driver's Manual, pp. 10, 33) — closes #5, #43
- `ct.car.108` (hazards-conditions) — The road ahead is covered with packed snow. According to the Connecticut Driver's Manual, how much should you cut your speed? → _By about half_ (Connecticut Driver's Manual, p. 27) — closes #39
- `ct.car.109` (hazards-conditions) — You drive into a Connecticut work zone, but no reduced speed limit is posted. What speed limit applies? → _The road's normal posted limit_ (Connecticut Driver's Manual, p. 17) — closes #62

Universal car (`car/coverage-online-b.json`):
- `car.cvob.001` (freeway) — You are merging into a gap in highway traffic. Where should you look as you move in? → _Check behind, then watch the car ahead_ (State driver handbooks (e.g. MO p.30, CO p.4)) — closes #18
- `car.cvob.002` (sharing-road) — Why should you give children riding bicycles even more room than adult riders? → _They're small, hard to see and less able to react_ (State driver handbooks (e.g. MD p.41, MT p.39, CT p.18)) — closes #22, #48
- `car.cvob.003` (sharing-road) — You see two people walking along the edge of a two-lane road ahead. What should you do? → _Slow down and pass them with plenty of room_ (State driver handbooks (e.g. KS p.67, UT p.84)) — closes #30, #59
- `car.cvob.004` (emergencies) — You are stopped in a line of traffic and see that the car behind you is about to hit you. Besides pressing your head against the head restraint, what should you do? → _Grip the wheel and keep pressing the brake_ (State driver handbooks (e.g. CT p.43, NJ p.111, LA p.119, ME p.95)) — closes #34
- `car.cvob.005` (lanes-passing) — A car is passing you on a two-lane road when an oncoming vehicle comes into view. How can you help the passing driver? → _Ease off the gas so the driver can get back in_ (State driver handbooks (e.g. OK p.35, TN p.77, MA p.111)) — closes #40
- `car.cvob.006` (lanes-passing) — On a two-lane road, what does a no-passing zone usually tell you about the road ahead? → _Your view ahead is too short to pass safely_ (MUTCD Sec. 3B.02; state driver handbooks (e.g. CT p.25, TN p.77, AK p.42)) — closes #12, #54

Corrected: `ct.car.058` (parking) — According to the Connecticut Driver's Manual, how close to a stop sign may you park? → _No closer than 25 feet_ (Connecticut Driver's Manual, p. 39; Conn. Gen. Stat. § 14-251) — resolves #42.

State-specific vs. universal decisions: the 12-month passenger rule, the packed-snow "cut your speed in half" advice (only some handbooks give a number) and the work-zone "normal posted limit" rule are Connecticut manual facts, so they went to the Connecticut file. Universal only where handbooks agree and no state rule differs: watch the vehicle ahead while merging (MO p. 30, CO p. 4), children on bicycles are hard to see and slower to react (MD p. 41, MT p. 39, CT p. 18), slow down and give room to people walking along the road (KS p. 67, UT p. 84), hold the brake and wheel when about to be rear-ended in a line of traffic (CT p. 43, NJ p. 111, LA p. 119, ME p. 95; NC p. 79 says move ahead only if there is room), slow down to let a passer back in when an oncoming car appears (OK p. 35, TN p. 77, MA p. 111), and no-passing zones mark limited sight distance (MUTCD Sec. 3B.02; CT p. 25, TN p. 77, AK p. 42).

Answer-position spread of the 16 questions written or rewritten in this CT/FL/IN/IL/MN run (15 new + `ct.car.058`): 4/4/4/4 (positions 0/1/2/3); the correct choice is the uniquely longest option in 0 of them. Wording is original (official wording was not copied).

## Item-by-item table

n 1-21 = Practice Test One, 22-42 = Test Two, 43-63 = Test Three (`sameAs` repeats noted). Key letters follow the official choice order.

| n | Official item | Key | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|
| 1 | Practice Test One #1: When used on roadways, bicyclists are considered: | B | sharing-road | COVERED | `car.sr.012` |  |
| 2 | Practice Test One #2: Motorcycle/scooter/moped operators: | C | sharing-road | COVERED | `car.sr.022`, `ct.car.097` |  |
| 3 | Practice Test One #3: Reaction time is slower after: | A | alcohol-drugs | COVERED | `car.ad.042` |  |
| 4 | Practice Test One #4: The first thing that a drink of alcohol effects is: | B | alcohol-drugs | COVERED | `car.ad.001` |  |
| 5 | Practice Test One #5: Passenger restrictions apply to 16- and 17-year-old license holders w… | B | laws-licensing | PARTIAL | `ct.car.024`, `ct.car.025`, **`ct.car.107`** (new) | Both six-month phases were taught, but not that the restrictions last 12 months. |
| 6 | Practice Test One #6: As of August 1, 2008, what is the nighttime curfew for 16 and 17-year… | B | laws-licensing | COVERED | `ct.car.026` |  |
| 7 | Practice Test One #7: This sign means: | C | road-signs | COVERED | `car.rsw.004`, `car.rsw.005` | Sign W3-3. |
| 8 | Practice Test One #8: You may not park within how many feet of a fire hydrant? | C | parking | COVERED | `ct.car.057` |  |
| 9 | Practice Test One #9: To make a right turn, you should: | C | intersections-turns | COVERED | `car.it.001`, `car.it.066` |  |
| 10 | Practice Test One #10: To make a left turn, you should: | B | intersections-turns | COVERED | `car.it.010`, `car.it.007` |  |
| 11 | Practice Test One #11: A broken yellow line between two lanes of traffic means: | B | signals-markings | COVERED | `car.smv.030`, `car.scnr.027` |  |
| 12 | Practice Test One #12: Signs or lane markings that indicate a No Passing Zone tell you that: | C | lanes-passing | PARTIAL | `car.rs.033`, **`car.cvob.006`** (new) | Only car.rs.033's explanation said no-passing zones mark limited sight distance. |
| 13 | Practice Test One #13: This sign means: | C | road-signs | COVERED | `car.rs.025` | Image missing in this PDF; Test Three #5 shows R3-6L. |
| 14 | Practice Test One #14: This sign means: | C | road-signs | COVERED | `car.rs.019` | Sign R3-4. |
| 15 | Practice Test One #15: To pass on a two-lane road, you should: | C | lanes-passing | COVERED | `car.smv.031`, `car.lp.051` |  |
| 16 | Practice Test One #16: After passing, you should move back to the right when: | B | lanes-passing | COVERED | `car.lp.037`, `car.scnr.028` |  |
| 17 | Practice Test One #17: You can pass a vehicle ahead, if it is safe to do so, when: | C | lanes-passing | COVERED | `car.scnr.027`, `car.lp.021` |  |
| 18 | Practice Test One #18: To enter a gap in highway traffic: | B | freeway | PARTIAL | `car.fw.004`, **`car.cvob.001`** (new) | Merging steps were taught, not watching the vehicle ahead while you merge. |
| 19 | Practice Test One #19: When you are behind a motorcycle, you should: | C | sharing-road | COVERED | `car.ss.021`, `ct.car.055` |  |
| 20 | Practice Test One #20: To enter highway traffic, you need at least: | C | freeway | COVERED | `ct.car.056` |  |
| 21 | Practice Test One #21: To avoid merging traffic from the right, the best thing to do is: | A | freeway | COVERED | `car.fw.008` | Key: move left; car.fw.008 keys 'if safe, move left or adjust speed'. |
| 22 | Practice Test Two #1: Children on bicycles should be given even more space by motor vehicle… | B | sharing-road | PARTIAL | `car.sr.092`, **`car.cvob.002`** (new) | car.sr.092 taught that children swerve; not that they are hard to see and slower to react. |
| 23 | Practice Test Two #2: When a bicyclist is making a left-hand turn: | A | sharing-road | COVERED | `car.sr.095` |  |
| 24 | Practice Test Two #3: Fatigue increases the risk of: | C | safe-habits | COVERED | `car.sh.021`, `car.cvpa.016` |  |
| 25 | Practice Test Two #4: A driver distraction is: | B | safe-habits | COVERED | `car.sh.004`, `car.sh.002`, `car.sh.003` |  |
| 26 | Practice Test Two #5: If you are 16 or 17 years old and after you have held a license for 6… | A | laws-licensing | COVERED | `ct.car.025` |  |
| 27 | Practice Test Two #6: If you are 16 or 17 years old and are convicted of speeding over 20 m… | C | laws-licensing | COVERED | `ct.car.030` |  |
| 28 | Practice Test Two #7: Your vehicle has a mechanical problem.  You should: | C | emergencies | COVERED | `car.em.049` |  |
| 29 | Practice Test Two #8: There’s an emergency vehicle with flashing lights and siren coming. Y… | C | right-of-way | COVERED | `car.row.056`, `ct.car.089` |  |
| 30 | Practice Test Two #9: You see pedestrians near the road.  You should: | C | sharing-road | MISSING | **`car.cvob.003`** (new) |  |
| 31 | Practice Test Two #10: If a tire blows out, you should: | B | emergencies | COVERED | `car.em.003`, `car.em.004` | Manual p.41: hold the wheel, take your foot off the gas and brake lightly; car.em.004 says brake gently once stable. |
| 32 | Practice Test Two #11: If you drive too fast on a wet road, there is danger that: | A | hazards-conditions | COVERED | `car.hz.021` |  |
| 33 | Practice Test Two #12: Referring to the steering wheel as a clock face, the normal hand posi… | A | safe-habits | COVERED | `car.sh.035` |  |
| 34 | Practice Test Two #13: If you are about to be hit from the rear, you should consider each of… | B | emergencies | PARTIAL | `car.em.047`, **`car.cvob.004`** (new) | Head restraint taught; holding the wheel and brake only in an explanation. |
| 35 | Practice Test Two #14: If you are about to be hit from the rear, what should you NOT do? | A | emergencies | COVERED | `car.em.047` |  |
| 36 | Practice Test Two #15: The following statements regarding the use of seatbelts are true, wit… | B | safe-habits | COVERED | `car.sh.026` |  |
| 37 | Practice Test Two #16: If your vehicle has a two-part safety belt system, you should: | B | safe-habits | COVERED | `car.sh.023`, `car.sh.025` |  |
| 38 | Practice Test Two #17: A yellow arrow on a traffic signal means: | C | signals-markings | COVERED | `car.smv.009` |  |
| 39 | Practice Test Two #18: While driving on packed snow you should reduce your speed by: | C | hazards-conditions | MISSING | **`ct.car.108`** (new) |  |
| 40 | Practice Test Two #19: While being passed in a no passing zone you should: | C | lanes-passing | PARTIAL | `car.lp.057`, `car.lp.007`, **`car.cvob.005`** (new) | Don't speed up was taught; slowing to let the passer back in was not. |
| 41 | Practice Test Two #20: If weather or light conditions require you to have your lights on: | C | hazards-conditions | COVERED | `car.hz.080`, `car.hz.028` |  |
| 42 | Practice Test Two #21: You may not park within how many feet of a stop sign? | B | parking | COVERED | `ct.car.058` | CONFLICT fixed: ct.car.058 keyed the 2025 statute's 30 ft; now keys the manual's 25 ft (current law in the explanation). |
| 43 | Practice Test Three #1: Passenger restrictions apply to operator's license holders who have r… | B | laws-licensing | PARTIAL | `ct.car.024`, `ct.car.025`, **`ct.car.107`** (new) | Same item as #5. |
| 44 | Practice Test Three #2: As of August 1, 2008, what is the nighttime curfew for 16 and 17-year… | B | laws-licensing | COVERED | `ct.car.026` | Same item as #6. |
| 45 | Practice Test Three #3: The first thing that a drink of alcohol effects is: | B | alcohol-drugs | COVERED | `car.ad.001` | Same item as #4. |
| 46 | Practice Test Three #4: Reaction time is slower after: | A | alcohol-drugs | COVERED | `car.ad.042` | Same item as #3. |
| 47 | Practice Test Three #5: This sign means you: | C | road-signs | COVERED | `car.rs.025` | Same item as #13. Sign image shown here: R3-6L. |
| 48 | Practice Test Three #6: Children on bicycles should be given even more space by motor vehicle… | C | sharing-road | PARTIAL | `car.sr.092`, **`car.cvob.002`** (new) | Same item as #22. |
| 49 | Practice Test Three #7: When a bicyclist is making a left-hand turn: | A | sharing-road | COVERED | `car.sr.095` | Same item as #23. |
| 50 | Practice Test Three #8: You may not park within how many feet of a fire hydrant? | C | parking | COVERED | `ct.car.057` | Same item as #8. |
| 51 | Practice Test Three #9: To make a right turn, you should: | C | intersections-turns | COVERED | `car.it.001`, `car.it.066` | Same item as #9. |
| 52 | Practice Test Three #10: To make a left turn, you should: | B | intersections-turns | COVERED | `car.it.010`, `car.it.007` | Same item as #10. |
| 53 | Practice Test Three #11: A broken yellow line between two lanes of traffic means: | B | signals-markings | COVERED | `car.smv.030`, `car.scnr.027` | Same item as #11. |
| 54 | Practice Test Three #12: Signs or lane markings that indicate a No Passing Zone tell you that: | C | lanes-passing | PARTIAL | `car.rs.033`, **`car.cvob.006`** (new) | Same item as #12. |
| 55 | Practice Test Three #13: If weather or light conditions require you to have your lights on: | C | hazards-conditions | COVERED | `car.hz.080`, `car.hz.028` | Same item as #41. |
| 56 | Practice Test Three #14: The blind spots where trucks will not be able to see you are: | C | sharing-road | COVERED | `car.sr.033`, `car.sr.034`, `car.scnr.009`, `car.scnr.011` |  |
| 57 | Practice Test Three #15: Your vehicle has a mechanical problem.  You should: | C | emergencies | COVERED | `car.em.049` | Same item as #28. |
| 58 | Practice Test Three #16: There's an emergency vehicle with flashing lights and siren coming.… | C | right-of-way | COVERED | `car.row.056`, `ct.car.089` | Same item as #29. |
| 59 | Practice Test Three #17: You see pedestrians near the road.  You should: | C | sharing-road | MISSING | **`car.cvob.003`** (new) | Same item as #30. |
| 60 | Practice Test Three #18: In work zones, you should: | C | hazards-conditions | COVERED | `car.ss.058`, `car.ph.020` |  |
| 61 | Practice Test Three #19: Fines for speeding or other illegal behavior in work zones: | A | hazards-conditions | COVERED | `car.rsw.069`, `ct.car.044`, `ct.car.079` | Manual p.17: fines up to $1,000; distracted-driving fines doubled. |
| 62 | Practice Test Three #20: If there are no reduced speed limit signs clearly posted within a wor… | A | hazards-conditions | MISSING | **`ct.car.109`** (new) |  |
| 63 | Practice Test Three #21: When driving through a work zone: | C | hazards-conditions | COVERED | `car.hz.059`, `car.rsg.002` |  |
