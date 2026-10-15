# Illinois — official sample questions vs. DriveReady coverage

_Audit date: 2026-10-15. Source: Illinois Rules of the Road 2026 (`research/handbooks/IL.txt`), the "Study Questions"
at the end of Chapters 3–12 (answers on PDF p.103, printed p.100). Page numbers are the `=== PAGE n ===` markers (the
same PDF numbering the app's IL refs use; printed page = PDF page − 3). No Illinois motorcycle manual is in
`research/handbooks/`, so there is no motorcycle-manual track. Extracted questions: `research/official-samples/IL.json`
(research only — never shipped, never copied into the app; items are numbered 1–86 in chapter order, the official
chapter numbers are in the table). Not audited: the Secretary of State's separate "Rules of the Road Review Course"
practice exam (`research/raw/IL/ds9.pdf`), which is outside `research/handbooks/`._

## Summary

| | Count |
|---|---|
| Official sample questions (70 True/False, 16 multiple choice; all keyed) | **86** |
| COVERED (an app question tests the same fact with the same answer) | **66** (incl. #50, covered by `il.car.074`) |
| PARTIAL (related app question, different fact/angle) | **6** |
| MISSING (no app question) | **14** |
| New questions written | **19** Illinois (`il.car.102`–`il.car.120` in `app/src/content/questions/states/IL.json`); no universal question needed |

Most gaps were in Chapter 8 (suspension, revocation, cancellation, restricted permits), the financial-responsibility
rules in Chapter 7 and the equipment rules in Chapter 12, which the Illinois file had not covered.

Validator: `node scripts/validate-content.mjs src/content/questions/states/KS.json src/content/questions/states/IN.json src/content/questions/states/CT.json src/content/questions/states/IL.json src/content/questions/car/coverage-ks-in-ct-il.json`
→ **0 errors, 0 warnings** (no duplicate prompts).

Index: not rebuilt here (per the audit instructions). `node scripts/check-content-index.mjs` reports stale hashes for `states/KS.json`, `states/IN.json`, `states/CT.json`, `states/IL.json` and the unindexed new file `questions/car/coverage-ks-in-ct-il.json`; run `node scripts/build-content-index.mjs`.

## Conflicts (official key vs. app)

| Official # | Issue | Resolution |
|---|---|---|
| 50 (Ch.7 #4) | **No conflict (corrected on review).** The printed key on PDF p.103 says **True** for "A driver has 30 minutes to report a crash after it occurs" (the extracted key text is interleaved by the PDF's column layout, which led to a misreading of False). `il.car.074` keys **30 minutes**, matching the handbook body (p.58) and the official key. | Kept `il.car.074` as originally written (its explanation also says to notify police immediately). Legal background for reference: 625 ILCS 5/11-407 requires notice "by the fastest available means" when no officer is present; the one-half-hour figure comes from 11-401(b). The app follows the handbook and its official key, which is what the Illinois test uses. |
| 5 (Ch.3 #5) | Key False: the phone ban covers drivers under **19**, not under 20. | Matches `il.car.014`, `il.car.015`, `il.car.097`. |
| 4 (Ch.3 #4) | The statement says "under age 16"; the 50-hour rule (10 at night) applies to all drivers under 18. | Key True; `il.car.082` (under 18) is consistent. |
| 19 (Ch.4 #13) | Key: in a construction zone "stop all wireless telephone communications". The handbook (p.28) allows hands-free devices there. | Consistent with the app: adults may use hands-free anywhere (`il.car.014`), handheld use is banned everywhere (`il.car.016`). |
| 44 (Ch.6 #4) | Key False: a test refusal brings a 1-year (not 3-month) suspension. | Matches `il.car.005`. |

## New questions

Illinois-specific (`states/IL.json`, `"states": ["IL"]`, ref = Illinois Rules of the Road 2026 page):
- `il.car.102` (laws-licensing) — A 17-year-old Illinois driver wants court supervision for a traffic ticket. What must the teen do to get it? → _Go to court with a parent or guardian and attend traffic school_ (Illinois Rules of the Road 2026, p. 22) — closes #2
- `il.car.103` (intersections-turns) — You entered an Illinois intersection on a green light to turn left, and you are still waiting for a gap in oncoming traffic when your light turns red. What should you do? → _Yield to any oncoming vehicles, then finish your left turn_ (Illinois Rules of the Road 2026, p. 29) — closes #9
- `il.car.104` (speed-space) — You are driving under the posted speed limit in Illinois. In which situation does the law still require you to slow down? → _When approaching and crossing an intersection_ (Illinois Rules of the Road 2026, p. 27) — closes #22
- `il.car.105` (alcohol-drugs) — What does the Illinois Rules of the Road call the number one killer on American roadways? → _Alcohol_ (Illinois Rules of the Road 2026, p. 51) — closes #42
- `il.car.106` (alcohol-drugs) — An Illinois driver who is under the influence causes a crash that seriously injures another person. What can the driver be charged with? → _Aggravated DUI_ (Illinois Rules of the Road 2026, p. 54) — closes #43
- `il.car.107` (alcohol-drugs) — An Illinois driver's license was revoked after a DUI. Which step is part of getting driving privileges back? → _Getting an alcohol/drug evaluation and paying a reinstatement fee_ (Illinois Rules of the Road 2026, pp. 53, 61) — closes #45
- `il.car.108` (laws-licensing) — You caused a crash in Illinois without insurance, and your license was suspended because you did not pay for the damages. What must you file before you can drive again? → _Proof of financial responsibility, such as an SR-22_ (Illinois Rules of the Road 2026, p. 58) — closes #48
- `il.car.109` (laws-licensing) — Which of these requires an Illinois driver to file proof of financial responsibility, such as an SR-22? → _An unpaid court judgment from a crash_ (Illinois Rules of the Road 2026, p. 59) — closes #52
- `il.car.110` (laws-licensing) — A 30-year-old Illinois driver is convicted twice within 12 months of illegally transporting alcohol. What can happen to the driver's license? → _It can be suspended_ (Illinois Rules of the Road 2026, pp. 62-63) — closes #53
- `il.car.111` (laws-licensing) — What can happen to an Illinois driver who knowingly gives the Secretary of State false information? → _Revocation of driving privileges_ (Illinois Rules of the Road 2026, pp. 61-62) — closes #54 (and #58)
- `il.car.112` (laws-licensing) — An Illinois driver is found to be medically or visually unfit to drive safely. What can the Secretary of State do with the license? → _Cancel it_ (Illinois Rules of the Road 2026, pp. 63-64) — closes #55
- `il.car.113` (laws-licensing) — Can every Illinois driver whose license is suspended or revoked get a Restricted Driving Permit? → _No, it is issued only in certain cases and for limited trips_ (Illinois Rules of the Road 2026, p. 64) — closes #56
- `il.car.114` (laws-licensing) — Which of these can get an Illinois driver's license suspended? → _Using someone else's license or an altered one_ (Illinois Rules of the Road 2026, pp. 62-63) — closes #57
- `il.car.115` (signals-markings) — A long red light is ahead, and a gas station sits on the corner. May you drive through the station's lot to skip the light in Illinois? → _No, leaving the road to avoid a signal is not allowed_ (Illinois Rules of the Road 2026, p. 80) — closes #70
- `il.car.116` (hazards-conditions) — Under Illinois law, during what period must your headlights be on, no matter how well you can see? → _From sunset to sunrise_ (Illinois Rules of the Road 2026, p. 95) — closes #82
- `il.car.117` (safe-habits) — Illinois law requires your car's horn to be loud enough to be heard from at least how far away? → _200 feet_ (Illinois Rules of the Road 2026, p. 95) — closes #83
- `il.car.118` (safe-habits) — What tinting does Illinois law allow on a car's front windshield? → _Only a strip along the top 6 inches of the windshield_ (Illinois Rules of the Road 2026, p. 95) — closes #84
- `il.car.119` (safe-habits) — A passenger wants to play a movie on a screen mounted where the driver can see it while you drive. Is that legal in Illinois? → _No, not while the vehicle is moving_ (Illinois Rules of the Road 2026, p. 96) — closes #85
- `il.car.120` (safe-habits) — Illinois requires a car's front and rear turn signals to be visible from at least how far away? → _300 feet_ (Illinois Rules of the Road 2026, p. 95) — closes #86

State-specific vs. universal decisions: everything here is Illinois law or Illinois handbook wording (court supervision,
the left-turn-after-red rule as stated, the statutory speed-reduction list, "number one killer", Aggravated DUI,
reinstatement, SR-22 triggers, suspension/revocation/cancellation lists, RDPs, the no-cut-through rule, headlight,
horn, tint, video-screen and turn-signal equipment rules), so all 19 went to the Illinois file. The covered items
include many universal facts (passing, crosswalks, railroad crossings, skids, blowouts, fog, bridges).

Answer-position spread of the 37 new questions in this KS/IN/CT/IL run: roughly even across positions; the correct choice is the uniquely longest option in 0 of them.

## Item-by-item table

| n | Official item | Page | Key | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|---|
| 1 | Ch.3 #1 | p.23 | B | laws-licensing | COVERED | `il.car.086`, `il.car.087` |  |
| 2 | Ch.3 #2 | p.23 | A | laws-licensing | MISSING | **`il.car.102`** (new) |  |
| 3 | Ch.3 #3 | p.23 | A | laws-licensing | COVERED | `il.car.088` |  |
| 4 | Ch.3 #4 | p.23 | A | laws-licensing | COVERED | `il.car.082` | The rule applies to drivers under 18 (50 hours, 10 at night). |
| 5 | Ch.3 #5 | p.23 | B | laws-licensing | COVERED | `il.car.014`, `il.car.015`, `il.car.097` | False because the ban is for drivers under 19, not under 20. |
| 6 | Ch.3 #6 | p.23 | A | laws-licensing | COVERED | `il.car.081` |  |
| 7 | Ch.4 #1 | p.39 | A | lanes-passing | COVERED | `car.lp.037`, `car.scnr.028` |  |
| 8 | Ch.4 #2 | p.39 | A | intersections-turns | COVERED | `il.car.035` |  |
| 9 | Ch.4 #3 | p.39 | B | intersections-turns | PARTIAL | `car.sm.004`, **`il.car.103`** (new) | car.sm.004 covers a yellow light while already in the intersection, not finishing a left turn after red. |
| 10 | Ch.4 #4 | p.39 | A | sharing-road | COVERED | `il.car.046`, `car.sr.052` |  |
| 11 | Ch.4 #5 | p.40 | A | right-of-way | COVERED | `il.car.040`, `car.row.056` |  |
| 12 | Ch.4 #6 | p.40 | A | sharing-road | COVERED | `il.car.048` |  |
| 13 | Ch.4 #7 | p.40 | B | lanes-passing | COVERED | `car.lp.058` | car.lp.058: never pass on the shoulder, paved or not. |
| 14 | Ch.4 #8 | p.40 | A | intersections-turns | COVERED | `il.car.034` |  |
| 15 | Ch.4 #9 | p.40 | A | lanes-passing | COVERED | `car.lp.010` |  |
| 16 | Ch.4 #10 | p.40 | B | right-of-way | COVERED | `car.scni.036`, `car.row.036` |  |
| 17 | Ch.4 #11 | p.40 | C | intersections-turns | COVERED | `il.car.032` |  |
| 18 | Ch.4 #12 | p.40 | B | right-of-way | COVERED | `car.row.033` |  |
| 19 | Ch.4 #13 | p.40 | B | hazards-conditions | COVERED | `car.fw.050`, `il.car.031`, `il.car.016` | Phone part: Illinois bans handheld use everywhere (il.car.016); hands-free stays legal in work zones (p.28). |
| 20 | Ch.4 #14 | p.40 | A | right-of-way | COVERED | `car.row.042`, `car.row.044` |  |
| 21 | Ch.4 #15 | p.40 | A | safe-habits | COVERED | `il.car.014` |  |
| 22 | Ch.4 #16 | p.41 | C | speed-space | PARTIAL | `il.car.099`, `car.ss.001`, **`il.car.104`** (new) | Weather was covered (car.ss.001/005); slowing for intersections appeared only in il.car.099's explanation. |
| 23 | Ch.4 #17 | p.41 | B | lanes-passing | COVERED | `car.lp.002` |  |
| 24 | Ch.4 #18 | p.41 | A | speed-space | COVERED | `il.car.027` |  |
| 25 | Ch.4 #19 | p.41 | A | parking | COVERED | `car.pk.023`, `car.scnr.016` |  |
| 26 | Ch.4 #20 | p.41 | B | lanes-passing | COVERED | `il.car.050` |  |
| 27 | Ch.4 #21 | p.41 | A | parking | COVERED | `car.pk.029`, `il.car.061` |  |
| 28 | Ch.4 #22 | p.41 | A | right-of-way | COVERED | `il.car.039` |  |
| 29 | Ch.4 #23 | p.41 | B | laws-licensing | COVERED | `il.car.079`, `car.ll.004` |  |
| 30 | Ch.4 #24 | p.41 | A | laws-licensing | COVERED | `car.ll.010`, `car.ll.005` |  |
| 31 | Ch.4 #25 | p.41 | A | sharing-road | COVERED | `il.car.063` |  |
| 32 | Ch.4 #26 | p.42 | A | sharing-road | COVERED | `car.sr.056`, `car.rsw.068` |  |
| 33 | Ch.4 #27 | p.42 | B | sharing-road | COVERED | `car.sr.058`, `car.rsw.060` |  |
| 34 | Ch.4 #28 | p.42 | A | sharing-road | COVERED | `car.sm.036` |  |
| 35 | Ch.5 #1 | p.50 | A | sharing-road | COVERED | `car.scnr.014`, `car.sr.019` |  |
| 36 | Ch.5 #2 | p.50 | B | sharing-road | COVERED | `il.car.030`, `car.ss.021` |  |
| 37 | Ch.5 #3 | p.50 | A | sharing-road | COVERED | `car.sr.022`, `car.sr.091` |  |
| 38 | Ch.5 #4 | p.50 | A | sharing-road | COVERED | `car.sr.041` |  |
| 39 | Ch.5 #5 | p.50 | A | right-of-way | COVERED | `car.row.051` |  |
| 40 | Ch.5 #6 | p.50 | D | sharing-road | COVERED | `il.car.054`, `car.pk.024`, `car.pk.023` | Key d (both a and b): Dutch Reach plus opening only when it won't interfere. |
| 41 | Ch.6 #1 | p.56 | A | alcohol-drugs | COVERED | `il.car.006` |  |
| 42 | Ch.6 #2 | p.56 | A | alcohol-drugs | MISSING | **`il.car.105`** (new) | Handbook p.51: alcohol is the number one killer on American roadways. |
| 43 | Ch.6 #3 | p.56 | D | alcohol-drugs | PARTIAL | `il.car.012`, **`il.car.106`** (new) | il.car.012 covered DUI without a valid license or insurance, not an injury crash. |
| 44 | Ch.6 #4 | p.56 | B | alcohol-drugs | COVERED | `il.car.005` |  |
| 45 | Ch.6 #5 | p.56 | A | alcohol-drugs | MISSING | **`il.car.107`** (new) |  |
| 46 | Ch.6 #6 | p.56 | A | alcohol-drugs | COVERED | `il.car.003` |  |
| 47 | Ch.7 #1 | p.59 | A | emergencies | COVERED | `il.car.072`, `il.car.073` |  |
| 48 | Ch.7 #2 | p.59 | A | laws-licensing | MISSING | **`il.car.108`** (new) |  |
| 49 | Ch.7 #3 | p.59 | A | emergencies | COVERED | `car.em.059` |  |
| 50 | Ch.7 #4 | p.59 | A | emergencies | COVERED | `il.car.074` | Key True (p.103); matches il.car.074. |
| 51 | Ch.7 #5 | p.59 | A | laws-licensing | COVERED | `il.car.093` |  |
| 52 | Ch.7 #6 | p.60 | D | laws-licensing | MISSING | **`il.car.109`** (new) |  |
| 53 | Ch.8 #1 | p.65 | C | laws-licensing | MISSING | **`il.car.110`** (new) |  |
| 54 | Ch.8 #2 | p.65 | A | laws-licensing | MISSING | **`il.car.111`** (new) |  |
| 55 | Ch.8 #3 | p.65 | A | laws-licensing | MISSING | **`il.car.112`** (new) |  |
| 56 | Ch.8 #4 | p.65 | B | laws-licensing | MISSING | **`il.car.113`** (new) |  |
| 57 | Ch.8 #5 | p.65 | D | laws-licensing | PARTIAL | `il.car.048`, **`il.car.114`** (new) | il.car.048 covered only the school-bus suspension. |
| 58 | Ch.8 #6 | p.65 | D | laws-licensing | PARTIAL | `il.car.076`, **`il.car.111`** (new) | il.car.076 covered leaving the scene; false information is closed by il.car.111. |
| 59 | Ch.9 #1 | p.79 | A | road-signs | COVERED | `car.rsw.008` |  |
| 60 | Ch.9 #2 | p.79 | A | intersections-turns | COVERED | `car.it.040` |  |
| 61 | Ch.9 #3 | p.79 | A | road-signs | COVERED | `car.rs.123`, `car.fw.050` |  |
| 62 | Ch.9 #4 | p.79 | A | sharing-road | COVERED | `car.scnr.041`, `car.sr.072` |  |
| 63 | Ch.9 #5 | p.79 | A | road-signs | COVERED | `car.rsw.065` |  |
| 64 | Ch.9 #6 | p.79 | A | road-signs | COVERED | `car.rs.118` |  |
| 65 | Ch.10 #1 | p.85 | A | right-of-way | COVERED | `il.car.037`, `car.row.063` |  |
| 66 | Ch.10 #2 | p.85 | B | signals-markings | COVERED | `car.sm.010` |  |
| 67 | Ch.10 #3 | p.85 | B | signals-markings | COVERED | `car.lp.009`, `car.sm.043` |  |
| 68 | Ch.10 #4 | p.85 | A | road-signs | COVERED | `car.rs.111`, `car.sr.056` |  |
| 69 | Ch.10 #5 | p.85 | A | signals-markings | COVERED | `car.sm.015` |  |
| 70 | Ch.10 #6 | p.85 | B | signals-markings | MISSING | **`il.car.115`** (new) | Only Michigan had this rule (mi.car.070). |
| 71 | Ch.11 #1 | p.94 | A | hazards-conditions | COVERED | `car.hz.033`, `car.rsw.032` |  |
| 72 | Ch.11 #2 | p.94 | B | hazards-conditions | COVERED | `car.hz.008` |  |
| 73 | Ch.11 #3 | p.94 | A | speed-space | COVERED | `car.fw.025` |  |
| 74 | Ch.11 #4 | p.94 | A | speed-space | COVERED | `il.car.029` |  |
| 75 | Ch.11 #5 | p.94 | B | hazards-conditions | COVERED | `car.hz.022` |  |
| 76 | Ch.11 #6 | p.94 | A | emergencies | COVERED | `car.em.019`, `car.rsw.031` | App: ease off the gas, don't brake hard, steer back gently; IL: brake gently. Consistent. |
| 77 | Ch.11 #7 | p.94 | A | hazards-conditions | COVERED | `car.hz.086` |  |
| 78 | Ch.11 #8 | p.94 | B | emergencies | COVERED | `car.em.003`, `car.em.004` |  |
| 79 | Ch.11 #9 | p.94 | B | emergencies | COVERED | `car.em.008` |  |
| 80 | Ch.11 #10 | p.94 | A | hazards-conditions | COVERED | `il.car.068` |  |
| 81 | Ch.12 #1 | p.97 | C | hazards-conditions | COVERED | `il.car.070` |  |
| 82 | Ch.12 #2 | p.97 | A | hazards-conditions | PARTIAL | `il.car.069`, **`il.car.116`** (new) | Sunset to sunrise was stated only in il.car.069's prompt. |
| 83 | Ch.12 #3 | p.97 | A | safe-habits | MISSING | **`il.car.117`** (new) |  |
| 84 | Ch.12 #4 | p.97 | A | safe-habits | MISSING | **`il.car.118`** (new) |  |
| 85 | Ch.12 #5 | p.97 | B | safe-habits | MISSING | **`il.car.119`** (new) |  |
| 86 | Ch.12 #6 | p.97 | A | safe-habits | MISSING | **`il.car.120`** (new) |  |
