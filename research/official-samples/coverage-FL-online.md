# Florida — official practice material vs. DriveReady coverage

_Audit date: 2026-10-15. Extracted questions: `research/official-samples/FL-online.json` (research only — never shipped, never copied into the app). Page refs are the `=== PAGE n ===` markers of `research/handbooks/FL.txt` (Official Florida Driver License Handbook, rev. 08/2023; the PDF numbering the app's FL refs use)._

## What was collectable

| Source (official) | What it is | Collected |
|---|---|---|
| https://www.flhsmv.gov/pdf/teen/testyourknowledge.pdf (from `officialPracticeTests`; linked from FLHSMV's teen resources page) | "Test Your Knowledge" (2017): 84 open-ended study questions by handbook chapter; **no choices and no answers printed** | **Yes** — 84 items. The download is byte-identical (SHA-256) to `research/raw/FL/tyk.pdf`, which the FL handbook audit already reviewed: it is the 2017 printing of the handbook's 84-item "Study Guide for Knowledge Exam" (`FL.json`). Differences are wording only: 3b asks about "car seats" (handbook: rear-facing / forward-facing), 5c and 5r say "interstate" (handbook: limited access highway), 5l/5m split handbook #36, 5w merges handbook #46-#47 (adds downhill), 6f and 12 are reworded. |
| https://www.flhsmv.gov/driver-licenses-id-cards/licensing-requirements-teens-graduated-driver-license-laws-driving-curfews/class-e-knowledge-exam-driving-skills-test/ | Class E knowledge exam page: 50 questions, 40 correct to pass; tells applicants to "take the Class E Knowledge Practice Test" | Page read. **No practice test is linked** from it (or from the teen resources page), and none was found on flhsmv.gov. Third-party prep sites are not official and were not used. |

Answers: none are printed, so every item is marked `"answerFrom": "handbook"`; `handbookAnswer`/`answerPages` reuse the answers the FL handbook audit read from the pages cited by FLHSMV's "Study Guide Answer Locations" sheet (checked again for the split/merged items 5l, 5m, 5w). 2 plain GET requests (PDF + exam page), at least 2 s apart; nothing behind a login or CAPTCHA; no form submitted. The raw download folder `research/raw/online-FL` was deleted after extraction.

## Summary

| | Count |
|---|---|
| Official questions (open-ended; no printed key) | **84** |
| COVERED | **84** (66 were covered before the FL handbook audit; 18 were closed by its new questions `fl.car.102`-`fl.car.119` and `car.cvfom.001`-`car.cvfom.003`) |
| PARTIAL | **0** |
| MISSING | **0** |
| New questions written | **0** (state 0, universal 0) |

Validator: `node scripts/validate-content.mjs src/content/questions/states/CT.json src/content/questions/states/IL.json src/content/questions/states/MN.json src/content/questions/car/coverage-online-b.json` → **0 errors, 0 warnings** (no duplicate prompts). (No Florida file was changed in this audit.)

## Conflicts (official answer vs. app)

Florida prints no key, so no keyed answer can contradict the app; no app question was changed. Notes carried over and re-checked:

| Item | Issue | Resolution |
|---|---|---|
| 10b | The 2017 sheet's answer is the TLSAE course. Since Aug. 1, 2025, first-time applicants under 18 take the 6-hour DETS course; adults still take TLSAE. | The app already teaches current law (`fl.car.023` DETS, `fl.car.101` TLSAE). |
| 8c | Conventional brakes: pump; ABS: press, hold and steer. | `car.em.013`, `car.em.015`, `fl.car.112` (see coverage-FL.md #67). |
| 3b | Asks only "car seat" ages; the handbook gives under 4 (child safety seat) and 4-5 (safety seat or booster). | `fl.car.039`, `fl.car.040` match. |

## Item-by-item table

`item` is the TYK number; the note gives the matching handbook study-guide item (`FL.json`, analyzed in `coverage-FL.md`).

| n | Official item | Handbook answer | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|
| 1 | 1a: In your vehicle, what should you adjust before you start your engine? | Adjust the seat to reach all controls and adjust all mirror… | safe-habits | COVERED | `car.sh.050` | = handbook study-guide #1 |
| 2 | 1b: What are the equipment requirements for windshields and side windows? | Windshield: safety glass, not reflective or non-transparent… | safe-habits | COVERED | `car.cvkic.001`, `fl.car.102`, `fl.car.103` | = handbook study-guide #2 (PARTIAL before the FL handbook audit, closed there) |
| 3 | 1c: What are bumper height requirements? Are they the same for every vehi… | Maximum bumper heights depend on the vehicle's net shipping… | safe-habits | COVERED | `fl.car.104` | = handbook study-guide #3 (MISSING before the FL handbook audit, closed there) |
| 4 | 1d: What must you do if hauling a load of material which could fall or bl… | Use a close-fitting cover; the load must not drop, shift, l… | safe-habits | COVERED | `fl.car.105` | = handbook study-guide #4 (MISSING before the FL handbook audit, closed there) |
| 5 | 1e: When a projected load extends more than 4 feet from the vehicle, what… | Day: red flags at least 18 in. square at the load's extremi… | safe-habits | COVERED | `fl.car.106`, `fl.car.107` | = handbook study-guide #5 (MISSING before the FL handbook audit, closed there) |
| 6 | 2a: Why is drowsy driving dangerous? | Fatigue slows thinking and reaction, affects judgment and v… | safe-habits | COVERED | `car.cvpa.016`, `car.fw.030` | = handbook study-guide #6 |
| 7 | 2b: What should you do if another driver is threatening you or intentiona… | Stay calm, put distance between you, slow down and let them… | safe-habits | COVERED | `car.sh.038`, `fl.car.041` | = handbook study-guide #7 |
| 8 | 2c: What are the three main categories of distracted driving? | Visual, manual and cognitive | safe-habits | COVERED | `car.sh.001`, `car.sh.002`, `car.sh.003` | = handbook study-guide #8 |
| 9 | 2d: Why is texting one of the most dangerous of distracted driving behavi… | Texting involves all three kinds of distraction | safe-habits | COVERED | `car.sh.001` | = handbook study-guide #9 |
| 10 | 2e: Can anyone drink and drive safely? | No; even one drink affects driving | alcohol-drugs | COVERED | `car.ad.043`, `car.ad.005` | = handbook study-guide #10 |
| 11 | 2f: Both your judgment and vision are affected after drinking alcohol. Wh… | Judgment is affected first | alcohol-drugs | COVERED | `car.ad.001` | = handbook study-guide #11 |
| 12 | 3a: What can happen to you if you are in a crash and not wearing a seat b… | You are far more likely to be killed: ejected, thrown again… | safe-habits | COVERED | `car.sh.027`, `car.cvpa.023` | = handbook study-guide #12 |
| 13 | 3b: What age are children required to be in a car seat? In a car seat or… | Under 4: child safety seat; ages 4-5: safety seat or booste… | safe-habits | COVERED | `fl.car.039`, `fl.car.040` | = handbook study-guide #13 |
| 14 | 3c: If a law enforcement officer stops a vehicle and a front seat passeng… | The driver | safe-habits | COVERED | `fl.car.038` | = handbook study-guide #14 |
| 15 | 4a: What does a single broken white line on the highway mean? | Lanes in the same direction; you may cross it to change lan… | signals-markings | COVERED | `car.smv.032`, `car.sm.039` | = handbook study-guide #15 |
| 16 | 4b: What does a double solid yellow line in the center of the highway mea… | Double solid yellow: no passing/crossing either direction (… | signals-markings | COVERED | `car.sm.041`, `car.lp.022`, `car.sm.047`, `fl.car.059` | = handbook study-guide #16 |
| 17 | 4c: What does a solid yellow line to the right of the center line of the… | Solid line on your side of the center line: no passing from… | signals-markings | COVERED | `car.sm.043`, `car.lp.009` | = handbook study-guide #17 |
| 18 | 4d: What do the colors of traffic signs indicate (red, orange, yellow, et… | Red stop/prohibition, orange construction, yellow warning,… | road-signs | COVERED | `car.rs.123`, `car.rs.124`, `car.rs.125`, `car.rs.126`, `car.rs.127`, `car.rs.128`, `car.rs.129`, `car.rs.130` | = handbook study-guide #18 |
| 19 | 4e: When more than one vehicle approaches a four-way stop sign, which one… | First to arrive goes first; at the same time, yield to the… | right-of-way | COVERED | `car.row.013`, `car.rs.007` | = handbook study-guide #19 |
| 20 | 4f: What does a red traffic light mean? What does a flashing red traffic… | Red: stop and stay stopped; flashing red: stop, then go whe… | signals-markings | COVERED | `car.smv.001`, `car.sm.015` | = handbook study-guide #20 |
| 21 | 4g: After a full stop at a red traffic light when may a driver turn right? | After a full stop, if no NO TURN ON RED sign and the way is… | intersections-turns | COVERED | `fl.car.052` | = handbook study-guide #21 |
| 22 | 4h: What does a green arrow showing at the same time as a red traffic lig… | You may turn in the arrow's direction (from the proper lane… | signals-markings | COVERED | `car.smv.006`, `car.smv.007`, `car.row.030` | = handbook study-guide #22 |
| 23 | 4i: What does a flashing yellow light mean? | Proceed with caution | signals-markings | COVERED | `car.sm.016` | = handbook study-guide #23 |
| 24 | 4j: If you are approaching a railroad crossing that does not have gates o… | Stop: a visible approaching train requires a stop; crossbuc… | sharing-road | COVERED | `car.rs.112`, `fl.car.089` | = handbook study-guide #24 |
| 25 | 5a: What happens to the force of impact when you double your speed? Tripl… | Doubling speed makes impact (and braking distance) 4 times… | speed-space | COVERED | `car.ss.030`, `car.cvfom.001` | = handbook study-guide #25 (PARTIAL before the FL handbook audit, closed there) |
| 26 | 5b: Unless otherwise posted, what is the speed limit for cars in a reside… | 30 MPH | speed-space | COVERED | `fl.car.044` | = handbook study-guide #26 |
| 27 | 5c: What is the maximum speed limit on an interstate highway? | 70 MPH | speed-space | COVERED | `fl.car.046` | = handbook study-guide #27 |
| 28 | 5d: Can you be issued a ticket for driving too slowly? | Yes; driving so slowly that you block or delay normal traff… | speed-space | COVERED | `fl.car.047`, `car.ss.006`, `fl.car.108` | = handbook study-guide #28 (PARTIAL before the FL handbook audit, closed there) |
| 29 | 5e: What are the steps for making a smooth stop? | Check mirrors and blind spots, release the accelerator, bra… | speed-space | COVERED | `car.cvkic.005`, `car.cvfom.002` | = handbook study-guide #29 (PARTIAL before the FL handbook audit, closed there) |
| 30 | 5f: What is the arm signal for a left turn? Right turn? Slow or stop? | Left: arm straight out; right: arm bent up; slow/stop: arm… | signals-markings | COVERED | `car.smv.046`, `car.smv.047`, `car.smv.048` | = handbook study-guide #30 |
| 31 | 5g: How long (distance) should you signal before making a left or right t… | At least 100 feet | intersections-turns | COVERED | `fl.car.054` | = handbook study-guide #31 |
| 32 | 5h: When can you use a three-point turn? Where should you never make a th… | Only when the road is too narrow for a U-turn and you can't… | intersections-turns | COVERED | `car.it.065`, `car.it.060` | = handbook study-guide #32 |
| 33 | 5i: What is an open intersection? When must you yield right-of-way? | No signs or signals; yield if a vehicle is already in it, i… | right-of-way | COVERED | `car.row.008`, `car.row.009`, `car.row.026`, `fl.car.109`, `fl.car.110` | = handbook study-guide #33 (PARTIAL before the FL handbook audit, closed there) |
| 34 | 5j: When may you drive in the left lane of a road with two lanes? With fo… | Two-lane: drive in the right lane except to pass; four or m… | lanes-passing | COVERED | `fl.car.060`, `car.lp.029` | = handbook study-guide #34 |
| 35 | 5k: What does it mean if you see red reflectors on the lane lines facing… | You are on the wrong side of the road (or wrong way on a ra… | freeway | COVERED | `car.fw.039` | = handbook study-guide #35 |
| 36 | 5l: What is the recommended safe following distance? | At least 4 seconds | speed-space | COVERED | `fl.car.050`, `car.ss.005`, `car.ss.021`, `car.ss.023`, `car.ss.026` | = handbook study-guide #36 |
| 37 | 5m: When should you increase your following distance? | Increase it in rain or low visibility, when being passed, w… | speed-space | COVERED | `fl.car.050`, `car.ss.005`, `car.ss.021`, `car.ss.023`, `car.ss.026` | = handbook study-guide #36 |
| 38 | 5n: What are blind spots? | Areas near the rear corners you can't see in your mirrors | lanes-passing | COVERED | `car.lp.005` | = handbook study-guide #37 |
| 39 | 5o: How do you check your blind spots when you are preparing to change la… | Turn your head and look | lanes-passing | COVERED | `car.lp.004`, `car.lp.056` | = handbook study-guide #38 |
| 40 | 5p: Where is it unlawful to overtake and pass? | Solid lines, no-passing zones, hills/curves without 500 ft… | lanes-passing | COVERED | `fl.car.062`, `fl.car.086`, `car.lp.009`, `car.lp.008`, `fl.car.111` | = handbook study-guide #39 (PARTIAL before the FL handbook audit, closed there) |
| 41 | 5q: Under what circumstances can you stop in the acceleration lane on an… | Only if traffic is too heavy and there is no space to enter… | freeway | COVERED | `car.fw.005` | = handbook study-guide #40 |
| 42 | 5r: What should you do if you drive past your exit on an interstate highw… | Go on to the next exit | freeway | COVERED | `car.fw.014` | = handbook study-guide #41 |
| 43 | 5s: Where should you move your vehicle if you break down while driving on… | Completely off the pavement (no more than 6 hours on a limi… | emergencies | COVERED | `fl.car.072`, `car.fw.033` | = handbook study-guide #42 |
| 44 | 5t: What is the farthest away you can park from a curb? | 12 inches | parking | COVERED | `fl.car.069` | = handbook study-guide #43 |
| 45 | 5u: If you have a manual transmission, what gear should you put the car i… | Manual: reverse downhill, first uphill; automatic: park | parking | COVERED | `car.pk.008`, `car.pk.007` | = handbook study-guide #44 |
| 46 | 5v: Where is parking prohibited? | Crosswalks, sidewalks, bike lanes, intersections, bridges,… | parking | COVERED | `fl.car.063`, `fl.car.064`, `fl.car.065`, `fl.car.066`, `fl.car.067`, `fl.car.068`, `fl.car.071`, `car.pk.026`, `car.pk.027` | = handbook study-guide #45 |
| 47 | 5w: Which way should you turn your wheels when parking uphill along a cur… | Uphill with curb: away from the curb; uphill without curb:… | parking | COVERED | `car.pk.003`, `car.pk.004`, `car.pk.002` | = handbook study-guide #46+47 |
| 48 | 6a: Are motorists required to stop or yield for pedestrians crossing the… | Yes, stop and stay stopped for pedestrians crossing at any… | right-of-way | COVERED | `car.row.042`, `car.row.044` | = handbook study-guide #48 |
| 49 | 6b: What must you do when you see a pedestrian with a white cane in the s… | Stop and let the pedestrian cross | right-of-way | COVERED | `car.row.051`, `car.row.052` | = handbook study-guide #49 |
| 50 | 6c: What is the minimum distance a motorist must give when traveling next… | 3 feet | sharing-road | COVERED | `fl.car.084` | = handbook study-guide #50 |
| 51 | 6d: As a motorist, what should you do when preparing to turn right on a r… | Yield to bicyclists and turn behind them | sharing-road | COVERED | `car.scnr.014` | = handbook study-guide #51 |
| 52 | 6e: When on the roadway, do motorcyclists and moped riders have the same… | Yes, the same rights and duties; riders can be cited | sharing-road | COVERED | `car.sr.012`, `car.sr.022`, `car.cvfom.003` | = handbook study-guide #52 (PARTIAL before the FL handbook audit, closed there) |
| 53 | 6f: If you are driving a motor vehicle, are you allowed to share a lane w… | No; a motorcyclist is entitled to the full lane | sharing-road | COVERED | `car.sr.022`, `car.sr.091` | = handbook study-guide #53 |
| 54 | 6g: When a school bus is stopped to unload children on a highway divided… | No (raised barrier or unpaved median at least 5 ft); procee… | sharing-road | COVERED | `fl.car.080`, `fl.car.082` | = handbook study-guide #54 |
| 55 | 6h: When a school bus stops to unload children, are vehicles traveling in… | Yes, always | sharing-road | COVERED | `fl.car.081`, `car.ph.003` | = handbook study-guide #55 |
| 56 | 6i: What must you do when children or school crossing guards are present… | Yield and stop at the stop line, not in the crosswalk | sharing-road | COVERED | `car.sr.087`, `car.ph.027`, `car.row.049` | = handbook study-guide #56 |
| 57 | 6j: What must you do if an emergency vehicle with activated lights and/or… | Pull over to the closest edge of the road and stop until it… | right-of-way | COVERED | `fl.car.079`, `car.row.056` | = handbook study-guide #57 |
| 58 | 6k: What does the Move Over law require you to do? | Vacate the lane next to the stopped vehicle or slow to 20 M… | sharing-road | COVERED | `fl.car.075`, `fl.car.076`, `fl.car.077`, `fl.car.078` | = handbook study-guide #58 |
| 59 | 6l: What is a “No Zone”? | Blind spots around trucks and buses | sharing-road | COVERED | `car.sr.033` | = handbook study-guide #59 |
| 60 | 7a: At what times must you use your headlights? | Sunset to sunrise and in rain, smoke or fog | hazards-conditions | COVERED | `fl.car.090`, `fl.car.091` | = handbook study-guide #60 |
| 61 | 7b: At night, within how many feet of approaching a vehicle from the rear… | 300 feet | hazards-conditions | COVERED | `fl.car.093` | = handbook study-guide #61 |
| 62 | 7c: Within how many feet of an oncoming vehicle should you dim your brigh… | 500 feet | hazards-conditions | COVERED | `fl.car.092` | = handbook study-guide #62 |
| 63 | 7d: When driving in the rain, fog, or smoke in the daytime, what lights s… | Headlights on low beam | hazards-conditions | COVERED | `fl.car.091`, `car.ph.022` | = handbook study-guide #63 |
| 64 | 7e: What should you do when driving on wet roads in the rain? Why? | Slow down and increase following distance: roads are slick… | hazards-conditions | COVERED | `car.ss.005`, `car.ss.036`, `car.hz.022` | = handbook study-guide #64 |
| 65 | 8a: What should you do if your right wheels go off the pavement while dri… | Ease off the gas, hold the wheel firmly, brake lightly, ret… | emergencies | COVERED | `car.em.021`, `car.ph.015` | = handbook study-guide #65 |
| 66 | 8b: What should you do if your tires begin to skid while driving? | Foot off the gas, avoid braking, steer where you want to go | emergencies | COVERED | `car.em.007`, `car.em.008` | = handbook study-guide #66 |
| 67 | 8c: When emergency braking, what is the difference between conventional b… | Conventional brakes: pump them; ABS: press hard, hold and s… | emergencies | COVERED | `car.em.013`, `car.em.015`, `fl.car.112` | = handbook study-guide #67 (PARTIAL before the FL handbook audit, closed there) |
| 68 | 8d: What should you do during a tire blow-out? | Foot off the gas, don't brake, steer, slow gradually, brake… | emergencies | COVERED | `car.em.004` | = handbook study-guide #68 |
| 69 | 8e: What must you do if you are involved in a minor accident and your veh… | Move the vehicle (or have it moved) out of traffic | emergencies | COVERED | `fl.car.096` | = handbook study-guide #69 |
| 70 | 8f: If you hit a parked car and are unable to find the owner, what should… | Leave a note with your name, contact information and plate… | emergencies | COVERED | `car.em.058` | = handbook study-guide #70 |
| 71 | 8g: What are the penalties for leaving the scene of an accident involving… | Death: first-degree felony, minimum 4 years prison; serious… | emergencies | COVERED | `fl.car.097`, `fl.car.113` | = handbook study-guide #71 (PARTIAL before the FL handbook audit, closed there) |
| 72 | 9a: What are the requirements of the No-Fault law? | Proof of $10,000 PIP and $10,000 PDL from a Florida-license… | laws-licensing | COVERED | `fl.car.025`, `fl.car.026` | = handbook study-guide #72 |
| 73 | 9b: If your license and registration are suspended for being in violation… | Get insurance and pay a $150-$500 reinstatement fee; no tem… | laws-licensing | COVERED | `fl.car.114` | = handbook study-guide #73 (MISSING before the FL handbook audit, closed there) |
| 74 | 9c: What are the penalties if you are at fault in a crash and you are not… | Prove financial responsibility; FLHSMV can require you to p… | laws-licensing | COVERED | `fl.car.009`, `fl.car.115` | = handbook study-guide #74 (MISSING before the FL handbook audit, closed there) |
| 75 | 9d: What are the time restrictions for a driver with a learner’s license? | Learner: daylight only for 3 months, then until 10 p.m., wi… | laws-licensing | COVERED | `fl.car.016`, `fl.car.017`, `fl.car.015` | = handbook study-guide #75 |
| 76 | 9e: What are the time restrictions for a licensed driver under age 17? Un… | Age 16: not 11 p.m.-6 a.m.; age 17: not 1-5 a.m. (unless to… | laws-licensing | COVERED | `fl.car.018`, `fl.car.019`, `fl.car.020` | = handbook study-guide #76 |
| 77 | 9f: When can you be charged with driving under the influence (DUI)? | Driving or in physical control while under the influence of… | alcohol-drugs | COVERED | `fl.car.001`, `car.ad.014` | = handbook study-guide #77 |
| 78 | 9g: What are the penalties for refusing to take a blood test, a urine tes… | First refusal: 1-year suspension; second: 18 months and a f… | alcohol-drugs | COVERED | `fl.car.004`, `fl.car.005` | = handbook study-guide #78 |
| 79 | 9h: What can happen if you are found guilty of racing on the highway? | License revocation (racing is on the revocation list) and a… | laws-licensing | COVERED | `fl.car.116` | = handbook study-guide #79 (MISSING before the FL handbook audit, closed there) |
| 80 | 10a: If you have a learner’s license, how many hours of driving experience… | 50 hours, including 10 at night | laws-licensing | COVERED | `fl.car.014` | = handbook study-guide #80 |
| 81 | 10b: What education course are you required to take if you are applying fo… | Traffic Law and Substance Abuse Education (TLSAE) | laws-licensing | COVERED | `fl.car.101`, `fl.car.023` | = handbook study-guide #81 |
| 82 | 10c: Are you required to notify DHSMV of any health problems that may affe… | Yes: list physical or mental conditions on the application;… | laws-licensing | COVERED | `fl.car.117` | = handbook study-guide #82 (MISSING before the FL handbook audit, closed there) |
| 83 | 11: Why would one opt to take a Basic Driver Improvement Course? | To avoid points for a noncriminal moving violation (18% off… | laws-licensing | COVERED | `fl.car.083`, `fl.car.099`, `fl.car.118` | = handbook study-guide #83 (PARTIAL before the FL handbook audit, closed there) |
| 84 | 12: What maneuvers are required on a driving skills test? | Approach of crossing, backing 50 ft looking back (no mirror… | laws-licensing | COVERED | `fl.car.119` | = handbook study-guide #84 (MISSING before the FL handbook audit, closed there) |
