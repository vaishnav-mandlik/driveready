# Indiana — official practice tests vs. DriveReady coverage

_Audit date: 2026-10-15. Extracted questions: `research/official-samples/IN-online.json` (research only — never shipped, never copied into the app). Page refs are the `=== PAGE n ===` markers of `research/handbooks/IN.txt` (Indiana Driver's Manual; the PDF numbering the app's IN refs use)._

## What was collectable

| Source (official) | What it is | Collected |
|---|---|---|
| https://www.in.gov/bmv/files/practice-knowledge-exam.pdf (from `officialPracticeTests`) | "BMV Practice Knowledge Examination": 6 sign questions (pictures) + 10 traffic questions, key on the last page | **Yes** — 16 items (n 1-16). They are the same questions as the manual's Chapter 9 license-exam samples, but traffic #3, #8 and #9 list their choices in a different order, so the letters differ (C/D/A here vs. D/C/D in Chapter 9) while the answers are the same (400 ft, 200 ft, 500 ft). |
| https://www.in.gov/bmv/licenses-permits-ids/files/Drivers_Manual_Chapter_9.pdf (from `officialPracticeTests`) | Stand-alone copy of the manual's Chapter 9 (pp. 63-67): the same 16 license-exam items + 4 For-Hire Endorsement + 4 Motor Driven Cycle Endorsement items, keys printed | **Yes** — identical to `IN.json` #1-24 (already analyzed in `coverage-IN.md`). Recorded once: n 1-16 carry `alsoIn` (Chapter 9 letter), n 17-24 are the endorsement items. |
| https://www.in.gov/bmv/licenses-permits-ids/learners-permits-and-drivers-licenses-overview/learners-permit/knowledge-exam/ | BMV knowledge-exam page | Page read; its "View the Practice Knowledge Exam" link (`/dA/4122bd18c8/practice-knowledge-exam.pdf`) downloads a file byte-identical (SHA-256) to the one above. No other practice test is linked (the page also points to BMV YouTube videos). |

Keys: both PDFs print one-column or one-line keys (no column interleaving; positions checked), and every key was confirmed against the manual and the sign pictures (viewed: blank diamond, blank vertical rectangle, pennant, W20-7 flagger, W4-2 lane reduction, blank round sign). 4 plain GET requests, at least 2 s apart; nothing behind a login or CAPTCHA; no form submitted. The raw download folder `research/raw/online-IN` was deleted after extraction. No Indiana motorcycle practice test is published.

## Summary

| | Count |
|---|---|
| Official questions (distinct; all keyed) | **24** (16 license exam + 4 for-hire + 4 motor driven cycle) |
| COVERED | **24** (4 of them — #5, #9, #17, #19 — closed by the IN handbook audit) |
| PARTIAL | **0** |
| MISSING | **0** |
| New questions written | **0** |

Validator: `node scripts/validate-content.mjs src/content/questions/states/CT.json src/content/questions/states/IL.json src/content/questions/states/MN.json src/content/questions/car/coverage-online-b.json` → **0 errors, 0 warnings** (no duplicate prompts). (No Indiana file was changed in this audit.)

## Conflicts (official key vs. app)

None. Every key matches the manual and the app; no app question was changed. #20 (for-hire warning devices) is covered only by the CDL bank (`cdl.gk.030`, `cdl.pv.005`, `cdl.pv.006`), as noted in `coverage-IN.md`.

## Item-by-item table

Key letters follow the practice-exam PDF's choice order (n 1-16) or Chapter 9's (n 17-24).

| n | Official item | Key | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|
| 1 | Practice exam Sign #1: The shape of this sign indicates | C | road-signs | COVERED | `car.rs.118` | = manual Chapter 9 item (IN.json #1) |
| 2 | Practice exam Sign #2: The shape of this sign indicates | C | road-signs | COVERED | `car.rs.129` | = manual Chapter 9 item (IN.json #2) |
| 3 | Practice exam Sign #3: The shape of this sign indicates | A | road-signs | COVERED | `car.rs.120`, `car.rsw.049` | = manual Chapter 9 item (IN.json #3) |
| 4 | Practice exam Sign #4: This sign indicates | B | road-signs | COVERED | `car.rsg.009`, `car.rsg.010` | = manual Chapter 9 item (IN.json #4) |
| 5 | Practice exam Sign #5: This sign indicates | D | road-signs | COVERED | `car.cvkic.003`, `car.rsw.034` | = manual Chapter 9 item (IN.json #5); gap closed by the IN handbook audit |
| 6 | Practice exam Sign #6: The shape of this sign indicates | B | road-signs | COVERED | `car.rs.122`, `car.rsw.064` | = manual Chapter 9 item (IN.json #6) |
| 7 | Practice exam Traffic #1: A legal left turn at a red light may be made when? | C | intersections-turns | COVERED | `in.car.049` | = manual Chapter 9 item (IN.json #7) |
| 8 | Practice exam Traffic #2: When a law enforcement officer is directing traffic, but the officer'… | B | signals-markings | COVERED | `car.sm.020` | = manual Chapter 9 item (IN.json #8) |
| 9 | Practice exam Traffic #3: A tractor-trailer takes longer to stop than a car traveling at the sa… | C | sharing-road | COVERED | `in.car.103`, `car.sr.037` | = manual Chapter 9 item (IN.json #9); gap closed by the IN handbook audit |
| 10 | Practice exam Traffic #4: According to Indiana law, during what period of time must a vehicle h… | A | hazards-conditions | COVERED | `in.car.085` | = manual Chapter 9 item (IN.json #10) |
| 11 | Practice exam Traffic #5: If the road you will be turning from has more than one lane, which la… | B | intersections-turns | COVERED | `car.it.066`, `car.it.010` | = manual Chapter 9 item (IN.json #11) |
| 12 | Practice exam Traffic #6: Unless otherwise posted, the speed limit on a rural state divided hig… | C | speed-space | COVERED | `in.car.042` | = manual Chapter 9 item (IN.json #12) |
| 13 | Practice exam Traffic #7: Unless otherwise posted, the maximum speed limit for a passenger vehi… | D | speed-space | COVERED | `in.car.039` | = manual Chapter 9 item (IN.json #13) |
| 14 | Practice exam Traffic #8: When driving at night, low beam headlights must be used when followin… | D | hazards-conditions | COVERED | `in.car.087` | = manual Chapter 9 item (IN.json #14) |
| 15 | Practice exam Traffic #9: When driving at night, lower headlight beams must be used when approa… | A | hazards-conditions | COVERED | `in.car.086` | = manual Chapter 9 item (IN.json #15) |
| 16 | Practice exam Traffic #10: In a situation with a flat tire or tire blowout, you should? | B | emergencies | COVERED | `car.em.003`, `car.em.004` | = manual Chapter 9 item (IN.json #16) |
| 17 | Chapter 9 For-Hire #1: If you are transporting property for hire with a for-hire endorsement… | A | laws-licensing | COVERED | `in.car.104` | = manual Chapter 9 item (IN.json #17); gap closed by the IN handbook audit |
| 18 | Chapter 9 For-Hire #2: Vehicles carrying passengers for hire are required to stop at railroa… | C | sharing-road | COVERED | `in.car.088`, `in.car.089` | = manual Chapter 9 item (IN.json #18) |
| 19 | Chapter 9 For-Hire #3: What is the maximum width of any vehicle that may be operated without… | A | sharing-road | COVERED | `in.car.105` | = manual Chapter 9 item (IN.json #19); gap closed by the IN handbook audit |
| 20 | Chapter 9 For-Hire #4: Which of the following are acceptable warning devices for a truck, bu… | C | emergencies | COVERED | `cdl.gk.030`, `cdl.pv.005`, `cdl.pv.006` | = manual Chapter 9 item (IN.json #20); CDL bank |
| 21 | Chapter 9 Motor Driven Cycle #1: When approaching a railroad crossing sign, you should: | C | road-signs | COVERED | `car.rsw.065`, `car.sr.056` | = manual Chapter 9 item (IN.json #21) |
| 22 | Chapter 9 Motor Driven Cycle #2: When approaching a stop sign you must: | A | intersections-turns | COVERED | `car.rs.001`, `car.it.039`, `car.it.040` | = manual Chapter 9 item (IN.json #22) |
| 23 | Chapter 9 Motor Driven Cycle #3: Drivers approaching an intersection with a non-operating traffic sign… | A | right-of-way | COVERED | `car.row.063`, `car.row.065` | = manual Chapter 9 item (IN.json #23) |
| 24 | Chapter 9 Motor Driven Cycle #4: When a law enforcement officer is directing traffic, but the officer’… | B | signals-markings | COVERED | `car.sm.020` | = manual Chapter 9 item (IN.json #24) |
