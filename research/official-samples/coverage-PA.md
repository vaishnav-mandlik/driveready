# Pennsylvania — official sample questions vs. DriveReady coverage

_Audit date: 2026-10-14. Source: Pennsylvania Driver's Manual PUB 95 (4-21), `research/handbooks/PA.txt`
(page numbers = `=== PAGE n ===` markers, the same numbering used in app refs). Extracted questions:
`research/official-samples/PA.json` (research only — never shipped, never copied into the app)._

## Summary

| | Count |
|---|---|
| Official sample questions (Ch.2 review 58 + Ch.3 review 110 + Ch.4 review 16; all have printed answer keys) | **184** |
| COVERED (an app question tests the same fact with the same answer) | **142** |
| PARTIAL (related app question, different fact/angle) | **16** |
| MISSING (no app question) | **23** |
| OUTDATED / unsupported official key (current manual says otherwise; not taught as keyed) | **3** |
| New questions written | **38** — 12 Pennsylvania (`pa.car.103`–`pa.car.114` in `app/src/content/questions/states/PA.json`) + 26 universal (`car.cvpa.001`–`car.cvpa.026` in `app/src/content/questions/car/coverage-pa.json`) |

Some official items are duplicates (Ch.2 #7/#8 = Ch.3 #9/#10; Ch.4 #5/#6/#7 differ only in the verb), so one new
question can close several items (e.g. `pa.car.112` covers official #173–#175).

Validator: `node scripts/validate-content.mjs src/content/questions/states/PA.json src/content/questions/car/coverage-pa.json`
→ **0 errors, 0 warnings** (no duplicate prompts).

Index: `app/src/content/index.ts` (rebuilt elsewhere during this audit) already lists `coverage-pa.json`, and its
stored hashes match the final `coverage-pa.json` and `states/PA.json`. If either file changes again, re-run
`node scripts/build-content-index.mjs`.

## Conflicts (official key vs. app)

No app question has a keyed answer or explanation that contradicts an official PA answer key, so **no existing
app question was changed**. Items reviewed closely:

| Official # | Issue | Resolution |
|---|---|---|
| 93 (Ch.3 #35) | Official key: when an oncoming vehicle uses high beams, *flash your high beams*. Universal `car.hz.005` keys "keep your low beams on and look to the right edge" and warns not to "punish" with your own high beams. | Not a contradiction: PA manual p.44 says flash quickly a few times, then, if the driver does not dim, look to the right side, and never keep brights on to punish. `car.hz.005` stays (correct in every state). Added PA-specific `pa.car.106` for the quick-flash step. |
| 57 (Ch.2 #57) | Official: center lane = left turns only (U-turns listed as a distractor). `car.lp.015` explanation says "(and U-turns where allowed)". | Hedged wording, not a contradiction; no change. |
| 66 (Ch.3 #8) | Official key "at least 4 seconds" behind a motorcycle; manual p.2 says "three or four seconds", p.60 says "the same 4-second following distance or more". | Followed p.60 + the key in new `pa.car.104`. |
| 170 (Ch.4 #2) | Key: under-16 false-ID users get a license suspension starting on their 16th birthday. | **Official key appears outdated.** The current PDF manual (4-21) and PennDOT's online manual no longer mention any license suspension for false ID or underage drinking (the likely reason is Pennsylvania's 2018 change ending license suspensions for many non-driving offenses; not verified against the statute here). Not taught; flag for a statute check. |
| 171 (Ch.4 #3) | Key: first underage-drinking offense (not driving) = 90-day suspension + up to $500 fine. | **Outdated vs. current manual**, which (p.88, and online) lists only "a fine of up to $500 plus court costs". New `pa.car.110` teaches the current manual wording and does not mention a suspension. |
| 182 (Ch.4 #14) | Key: carrying a false ID = $500 fine + 90-day suspension "even if you were not driving". | Same as #170 — not in the current manual; not taught; flagged. |
| 50 (Ch.2 #50) | Choice D reads "Broken yellow audio" in the source. | Source typo kept verbatim in the research file; key (C, solid white) matches `car.sm.045`. |

## New questions

PA-specific (`states/PA.json`, `"states": ["PA"]`, ref = Pennsylvania Driver's Manual page):
- `pa.car.103` (safe-habits) — According to the teen crash facts in the Pennsylvania Driver's Manual, what is the most frequent type of crash for 16-year-old drivers in Pennsylvania? → _A single vehicle running off the road_ (p. 55)
- `pa.car.104` (sharing-road) — On a dry road in Pennsylvania, how much following distance should you keep behind a motorcycle? → _At least 4 seconds_ (p. 60)
- `pa.car.105` (intersections-turns) — How long before a turn does the Pennsylvania Driver's Manual tell you to turn on your turn signal? → _3 to 4 seconds before the turn_ (p. 49)
- `pa.car.106` (hazards-conditions) — At night, an oncoming driver is using high beams. What does the Pennsylvania Driver's Manual tell you to do first? → _Quickly flash your high beams a few times_ (p. 44)
- `pa.car.107` (safe-habits) — The Pennsylvania Driver's Manual warns that teens face a higher crash risk when they regularly sleep less than how many hours a night? → _8 hours_ (p. 37)
- `pa.car.108` (alcohol-drugs) — A driver's BAC is .04, half the adult legal limit. According to the Pennsylvania Driver's Manual, how does this driver's crash risk compare with a driver who has had no alcohol? → _It is 2 to 7 times higher_ (p. 37)
- `pa.car.109` (emergencies) — You are driving on a one-way street when a fire truck with its siren and flashing lights comes up behind you. What does the Pennsylvania Driver's Manual tell you to do? → _Drive toward the nearest side of the street and stop_ (p. 63)
- `pa.car.110` (alcohol-drugs) — An 18-year-old is caught drinking beer at a party in Pennsylvania; no driving is involved. What penalty does the Pennsylvania Driver's Manual list for underage drinking? → _A fine of up to $500, plus court costs_ (p. 88)
- `pa.car.111` (alcohol-drugs) — A 17-year-old is arrested in Pennsylvania and taken for a breath or blood test. Do the police need a parent's consent to do the test? → _No, but the police will notify the parents_ (p. 88)
- `pa.car.112` (alcohol-drugs) — You and a friend are both 19. Your friend asks you to drive a sealed case of beer to a relative's house in Pennsylvania. Is that legal? → _No; anyone under 21 may not transport alcohol_ (p. 88)
- `pa.car.113` (alcohol-drugs) — Besides fines and other penalties, what must a Pennsylvania driver attend after a first or second DUI conviction, at any level of impairment? → _Alcohol Highway Safety School_ (p. 86)
- `pa.car.114` (alcohol-drugs) — An adult is convicted of a first DUI in Pennsylvania at the lowest (General Impairment, .08 to .099) level. What fine does the penalty table list? → _$300_ (p. 87)

Universal (`car/coverage-pa.json`; key rules spot-checked by grepping the other state handbooks (e.g. crossing yellow lines to turn, tapping brakes, arrow boards) — no handbook found stating a different rule):
- `car.cvpa.001` (freeway) — A yellow EXIT ONLY panel appears on the overhead sign above the lane you are driving in. What does it mean? → _Stay in that lane only if you plan to take the exit_
- `car.cvpa.002` (road-signs, sign W8-9) — Why is the road condition this sign warns about dangerous? → _Dropping a wheel off the edge can cost you control_
- `car.cvpa.003` (signals-markings) — You are turning left on a green arrow. The arrow goes off and only a circular green light remains. What may you do? → _Turn left after yielding to oncoming traffic and pedestrians_
- `car.cvpa.004` (hazards-conditions) — In a work zone, a large flashing arrow board shows a flashing bar or flashing corner lights instead of an arrow. What does it mean? → _Work is going on near the travel lane, so drive with extra caution_
- `car.cvpa.005` (lanes-passing) — On a two-lane road with a double solid yellow center line, you want to turn left into a driveway. What is true? → _You may cross the lines to make the turn when it is safe_
- `car.cvpa.006` (safe-habits) — When are teen drivers statistically more likely to crash? → _When they carry other teens as passengers_
- `car.cvpa.007` (safe-habits) — How does smoking while driving affect safety? → _It is a distraction that can take your eyes and hands off driving_
- `car.cvpa.008` (speed-space) — You must slow down where drivers behind you may not expect it, such as just before a hidden driveway. How can you warn them early? → _Tap your brake pedal lightly a few times_
- `car.cvpa.009` (safe-habits) — What is the best way to see what is behind you while you back up? → _Turn your head and look back through the rear window_
- `car.cvpa.010` (safe-habits) — Why do driving handbooks stress letting other road users know where you are and what you plan to do? → _It helps them predict your moves, which helps prevent crashes_
- `car.cvpa.011` (signals-markings) — Your car's turn signals stop working during a trip. How should you signal turns until they are fixed? → _Use arm and hand signals out the driver's window_
- `car.cvpa.012` (sharing-road) — In which of these situations is it most appropriate to sound your horn? → _A child near the curb is about to run into the street_
- `car.cvpa.013` (emergencies) — Your car slides on ice and you cannot stop it from heading toward people at a bus stop. Besides working to regain control, what should you do? → _Sound your horn to warn them_
- `car.cvpa.014` (signals-markings) — What do your brake lights tell drivers behind you? → _That you are slowing down or stopping_
- `car.cvpa.015` (emergencies) — A driver backing out of a driveway is about to back into the side of your moving car and does not seem to see you. What should you do? → _Sound your horn to warn the driver_
- `car.cvpa.016` (safe-habits) — How does driving after going without enough sleep compare with driving after drinking alcohol? → _The effects are similar: slower reactions and poorer judgment_
- `car.cvpa.017` (hazards-conditions) — What are the main causes of deadly crashes in highway work zones? → _Speeding and careless driving_
- `car.cvpa.018` (lanes-passing) — On a road with one lane in each direction, when may you pass the vehicle ahead on its right? → _When it is turning left and you can pass safely_
- `car.cvpa.019` (signals-markings) — You are in the center lane at an intersection, and the arrow painted in your lane points both straight ahead and to the left. What may you do? → _Go straight or turn left_
- `car.cvpa.020` (speed-space) — You are stopping behind another car on a steep uphill street. Why should you leave extra space in front of you? → _The car ahead may roll back when it starts to move_
- `car.cvpa.021` (intersections-turns) — What should you do with your speed when you make a turn? → _Reduce it so you stay in control and in your lane_
- `car.cvpa.022` (intersections-turns) — The amount of space you need to cross or turn across traffic safely depends on what? → _The road, the weather and the oncoming traffic_
- `car.cvpa.023` (safe-habits) — Which single action does the most to lower your risk of being hurt or killed in a crash? → _Wearing your seat belt_
- `car.cvpa.024` (hazards-conditions) — The road is slick from rain or snow. How should you take turns and curves? → _More slowly than you would on a dry road_
- `car.cvpa.025` (safe-habits) — Which of these is a distraction that raises your crash risk while driving? → _Changing songs or adjusting the radio_
- `car.cvpa.026` (alcohol-drugs) — In every U.S. state, what is the minimum age to legally buy alcohol? → _21_

State-specific vs. universal decisions: one-way-street emergency pull-over (nearest side) went to the PA file because
several handbooks only say "pull to the right"; PA-only statistics (run-off-road crash type, .04 BAC risk, teen sleep
hours, 3–4-second signal guideline, 4-second motorcycle gap, high-beam flash) and PA alcohol law are PA-only.
The adult minimum purchase age (21) is federal-uniform, so it is universal. Answer-position spread of the 38 new
questions: 8/11/10/9; the correct choice is the longest option in 7/38 (18%).

## Item-by-item table

| n | Official item | Page | Key | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|---|
| 1 | Ch.2 #1 | p.27 | A | road-signs | COVERED | `car.rs.001` |  |
| 2 | Ch.2 #2 | p.27 | C | road-signs | COVERED | `car.rs.117` |  |
| 3 | Ch.2 #3 | p.27 | D | road-signs | COVERED | `car.rs.042` |  |
| 4 | Ch.2 #4 | p.27 | A | road-signs | COVERED | `car.rs.019` |  |
| 5 | Ch.2 #5 | p.27 | C | road-signs | COVERED | `car.rs.016` |  |
| 6 | Ch.2 #6 | p.27 | C | road-signs | COVERED | `car.rs.052` |  |
| 7 | Ch.2 #7 | p.27 | C | right-of-way | COVERED | `car.scni.039` |  |
| 8 | Ch.2 #8 | p.27 | A | right-of-way | COVERED | `car.row.051` |  |
| 9 | Ch.2 #9 | p.28 | A | sharing-road | COVERED | `car.sr.056`, `car.rs.111` |  |
| 10 | Ch.2 #10 | p.28 | B | sharing-road | COVERED | `car.sr.060` |  |
| 11 | Ch.2 #11 | p.28 | D | freeway | PARTIAL | `car.sm.049`, **`car.cvpa.001`** (new) | App only covered dotted lane lines; no EXIT ONLY panel question (no sign image in library). |
| 12 | Ch.2 #12 | p.28 | B | road-signs | COVERED | `car.rs.127` |  |
| 13 | Ch.2 #13 | p.28 | C | road-signs | COVERED | `car.rs.084` |  |
| 14 | Ch.2 #14 | p.28 | C | road-signs | COVERED | `car.rs.090` |  |
| 15 | Ch.2 #15 | p.28 | D | road-signs | COVERED | `car.rsw.028` |  |
| 16 | Ch.2 #16 | p.28 | A | road-signs | COVERED | `car.rsw.022` |  |
| 17 | Ch.2 #17 | p.28 | A | road-signs | COVERED | `car.rs.118` |  |
| 18 | Ch.2 #18 | p.29 | A | road-signs | COVERED | `car.rs.120`, `car.rsw.049` |  |
| 19 | Ch.2 #19 | p.29 | A | road-signs | COVERED | `car.rsw.018` |  |
| 20 | Ch.2 #20 | p.29 | A | road-signs | COVERED | `car.rsw.034` |  |
| 21 | Ch.2 #21 | p.29 | A | road-signs | COVERED | `car.rs.094` |  |
| 22 | Ch.2 #22 | p.29 | B | road-signs | COVERED | `car.rs.095`, `car.rs.096` |  |
| 23 | Ch.2 #23 | p.29 | D | road-signs | PARTIAL | `car.rsw.031`, `car.em.020`, **`car.cvpa.002`** (new) | App asked what to do at a low shoulder, not what the hazard is. |
| 24 | Ch.2 #24 | p.29 | D | road-signs | COVERED | `car.rsw.004` |  |
| 25 | Ch.2 #25 | p.29 | D | road-signs | COVERED | `car.rsw.016` |  |
| 26 | Ch.2 #26 | p.29 | A | signals-markings | COVERED | `car.sm.021` |  |
| 27 | Ch.2 #27 | p.30 | A | signals-markings | PARTIAL | `car.sm.006`, `car.row.030`, **`car.cvpa.003`** (new) | Green arrow changing to a circular green was not asked directly. |
| 28 | Ch.2 #28 | p.30 | C | signals-markings | COVERED | `car.sm.002` |  |
| 29 | Ch.2 #29 | p.30 | C | signals-markings | COVERED | `car.sm.013` |  |
| 30 | Ch.2 #30 | p.30 | A | signals-markings | COVERED | `car.sm.016` |  |
| 31 | Ch.2 #31 | p.30 | A | signals-markings | COVERED | `car.smv.011` |  |
| 32 | Ch.2 #32 | p.30 | C | signals-markings | COVERED | `car.sm.005`, `car.smv.004` |  |
| 33 | Ch.2 #33 | p.30 | C | signals-markings | COVERED | `car.smv.002`, `car.sm.002` |  |
| 34 | Ch.2 #34 | p.30 | D | signals-markings | COVERED | `car.sm.003` |  |
| 35 | Ch.2 #35 | p.30 | C | signals-markings | COVERED | `pa.car.068` |  |
| 36 | Ch.2 #36 | p.31 | C | signals-markings | COVERED | `car.sm.018`, `car.row.063` |  |
| 37 | Ch.2 #37 | p.31 | A | signals-markings | COVERED | `pa.car.102` |  |
| 38 | Ch.2 #38 | p.31 | C | right-of-way | COVERED | `car.sm.027` |  |
| 39 | Ch.2 #39 | p.31 | B | speed-space | COVERED | `pa.car.046` |  |
| 40 | Ch.2 #40 | p.31 | A | signals-markings | COVERED | `car.sm.034`, `car.smv.024` |  |
| 41 | Ch.2 #41 | p.31 | A | signals-markings | COVERED | `car.smv.017` |  |
| 42 | Ch.2 #42 | p.31 | D | road-signs | COVERED | `car.rsg.009` |  |
| 43 | Ch.2 #43 | p.31 | B | road-signs | COVERED | `car.rsg.011` |  |
| 44 | Ch.2 #44 | p.31 | B | hazards-conditions | PARTIAL | `car.hz.063`, **`car.cvpa.004`** (new) | App covered arrow panels for lane closures only, not the caution (bar) display. |
| 45 | Ch.2 #45 | p.32 | B | signals-markings | COVERED | `car.smv.036` |  |
| 46 | Ch.2 #46 | p.32 | A | signals-markings | COVERED | `car.smv.032`, `car.sm.040` |  |
| 47 | Ch.2 #47 | p.32 | B | signals-markings | COVERED | `car.sm.039` |  |
| 48 | Ch.2 #48 | p.32 | C | signals-markings | COVERED | `car.smv.026`, `car.sm.041` |  |
| 49 | Ch.2 #49 | p.32 | D | lanes-passing | MISSING | **`car.cvpa.005`** (new) |  |
| 50 | Ch.2 #50 | p.32 | C | signals-markings | COVERED | `car.sm.045` |  |
| 51 | Ch.2 #51 | p.32 | D | signals-markings | COVERED | `car.sm.038` |  |
| 52 | Ch.2 #52 | p.32 | C | road-signs | COVERED | `car.rs.091` |  |
| 53 | Ch.2 #53 | p.32 | C | road-signs | COVERED | `car.rs.093`, `car.rs.081` |  |
| 54 | Ch.2 #54 | p.33 | D | intersections-turns | COVERED | `car.it.041` |  |
| 55 | Ch.2 #55 | p.33 | C | speed-space | COVERED | `car.ss.002` |  |
| 56 | Ch.2 #56 | p.33 | C | road-signs | COVERED | `car.rsw.020` |  |
| 57 | Ch.2 #57 | p.33 | A | intersections-turns | COVERED | `car.smv.036`, `car.scni.027` |  |
| 58 | Ch.2 #58 | p.33 | A | road-signs | COVERED | `car.rs.039` |  |
| 59 | Ch.3 #1 | p.69 | C | safe-habits | MISSING | **`car.cvpa.006`** (new) |  |
| 60 | Ch.3 #2 | p.69 | D | safe-habits | COVERED | `car.sh.068` |  |
| 61 | Ch.3 #3 | p.69 | C | safe-habits | MISSING | **`car.cvpa.007`** (new) |  |
| 62 | Ch.3 #4 | p.69 | A | safe-habits | MISSING | **`pa.car.103`** (new) |  |
| 63 | Ch.3 #5 | p.69 | B | sharing-road | COVERED | `car.scnr.013`, `pa.car.092` |  |
| 64 | Ch.3 #6 | p.69 | C | sharing-road | COVERED | `car.sr.010` |  |
| 65 | Ch.3 #7 | p.69 | A | sharing-road | COVERED | `car.sr.022` |  |
| 66 | Ch.3 #8 | p.69 | C | sharing-road | PARTIAL | `car.ss.021`, **`pa.car.104`** (new) | App said "extra distance" behind motorcycles but not the PA 4-second figure. |
| 67 | Ch.3 #9 | p.70 | C | right-of-way | COVERED | `car.scni.039` |  |
| 68 | Ch.3 #10 | p.70 | A | right-of-way | COVERED | `car.row.051` |  |
| 69 | Ch.3 #11 | p.70 | B | right-of-way | COVERED | `car.row.044`, `car.row.042` |  |
| 70 | Ch.3 #12 | p.70 | C | sharing-road | COVERED | `car.sr.072`, `car.smv.049` |  |
| 71 | Ch.3 #13 | p.70 | B | hazards-conditions | COVERED | `car.hz.011` |  |
| 72 | Ch.3 #14 | p.70 | A | sharing-road | COVERED | `car.lp.007`, `car.fw.048` |  |
| 73 | Ch.3 #15 | p.70 | A | sharing-road | COVERED | `car.sr.037` |  |
| 74 | Ch.3 #16 | p.70 | A | sharing-road | COVERED | `car.sr.059` |  |
| 75 | Ch.3 #17 | p.71 | A | sharing-road | COVERED | `car.it.045`, `car.scni.032` |  |
| 76 | Ch.3 #18 | p.71 | A | sharing-road | COVERED | `pa.car.088` |  |
| 77 | Ch.3 #19 | p.71 | A | sharing-road | COVERED | `pa.car.086` |  |
| 78 | Ch.3 #20 | p.71 | A | sharing-road | COVERED | `car.sr.059`, `car.scnr.019` |  |
| 79 | Ch.3 #21 | p.71 | A | speed-space | MISSING | **`car.cvpa.008`** (new) |  |
| 80 | Ch.3 #22 | p.71 | C | intersections-turns | PARTIAL | `pa.car.069`, `pa.car.070`, **`pa.car.105`** (new) | App had the 100/300-foot legal minimums, not the manual's 3-to-4-second guideline. |
| 81 | Ch.3 #23 | p.71 | C | lanes-passing | COVERED | `car.lp.010` |  |
| 82 | Ch.3 #24 | p.71 | A | lanes-passing | COVERED | `car.lp.005` |  |
| 83 | Ch.3 #25 | p.72 | D | lanes-passing | COVERED | `car.ss.044`, `car.lp.019` |  |
| 84 | Ch.3 #26 | p.72 | D | lanes-passing | COVERED | `car.lp.019`, `car.lp.056` |  |
| 85 | Ch.3 #27 | p.72 | A | parking | COVERED | `car.pk.037`, `pa.car.081` |  |
| 86 | Ch.3 #28 | p.72 | D | safe-habits | MISSING | **`car.cvpa.009`** (new) |  |
| 87 | Ch.3 #29 | p.72 | A | safe-habits | PARTIAL | `car.it.032`, **`car.cvpa.010`** (new) | App covered the purpose of turn signals only. |
| 88 | Ch.3 #30 | p.72 | A | signals-markings | COVERED | `car.smv.048` |  |
| 89 | Ch.3 #31 | p.72 | C | signals-markings | MISSING | **`car.cvpa.011`** (new) |  |
| 90 | Ch.3 #32 | p.72 | D | freeway | COVERED | `pa.car.064` |  |
| 91 | Ch.3 #33 | p.72 | C | sharing-road | MISSING | **`car.cvpa.012`** (new) |  |
| 92 | Ch.3 #34 | p.73 | A | hazards-conditions | COVERED | `pa.car.055` |  |
| 93 | Ch.3 #35 | p.73 | D | hazards-conditions | PARTIAL | `car.hz.005`, **`pa.car.106`** (new) | PA says flash your high beams quickly first; car.hz.005 (keep low beams, look right) does not contradict it. |
| 94 | Ch.3 #36 | p.73 | C | hazards-conditions | COVERED | `car.hz.004` |  |
| 95 | Ch.3 #37 | p.73 | C | emergencies | MISSING | **`car.cvpa.013`** (new) |  |
| 96 | Ch.3 #38 | p.73 | D | signals-markings | MISSING | **`car.cvpa.014`** (new) |  |
| 97 | Ch.3 #39 | p.73 | A | intersections-turns | COVERED | `car.it.032` |  |
| 98 | Ch.3 #40 | p.73 | D | signals-markings | COVERED | `car.smv.047` |  |
| 99 | Ch.3 #41 | p.73 | A | signals-markings | COVERED | `car.smv.046` |  |
| 100 | Ch.3 #42 | p.73 | A | emergencies | MISSING | **`car.cvpa.015`** (new) |  |
| 101 | Ch.3 #43 | p.74 | C | safe-habits | COVERED | `car.sh.015`, `car.fw.031` |  |
| 102 | Ch.3 #44 | p.74 | A | safe-habits | MISSING | **`car.cvpa.016`** (new) |  |
| 103 | Ch.3 #45 | p.74 | C | safe-habits | MISSING | **`pa.car.107`** (new) |  |
| 104 | Ch.3 #46 | p.74 | B | safe-habits | COVERED | `car.sh.038` |  |
| 105 | Ch.3 #47 | p.74 | A | safe-habits | COVERED | `car.sh.040` |  |
| 106 | Ch.3 #48 | p.74 | B | alcohol-drugs | COVERED | `car.ad.010` |  |
| 107 | Ch.3 #49 | p.74 | C | alcohol-drugs | COVERED | `car.ad.043` |  |
| 108 | Ch.3 #50 | p.74 | A | alcohol-drugs | COVERED | `car.ad.017` |  |
| 109 | Ch.3 #51 | p.74 | A | alcohol-drugs | COVERED | `car.ad.042` |  |
| 110 | Ch.3 #52 | p.75 | A | alcohol-drugs | MISSING | **`pa.car.108`** (new) |  |
| 111 | Ch.3 #53 | p.75 | C | emergencies | COVERED | `car.row.056` |  |
| 112 | Ch.3 #54 | p.75 | B | emergencies | COVERED | `car.em.004` |  |
| 113 | Ch.3 #55 | p.75 | B | emergencies | COVERED | `car.em.049`, `car.fw.034` |  |
| 114 | Ch.3 #56 | p.75 | C | emergencies | COVERED | `car.row.056` |  |
| 115 | Ch.3 #57 | p.75 | B | emergencies | MISSING | **`pa.car.109`** (new) |  |
| 116 | Ch.3 #58 | p.75 | C | emergencies | COVERED | `pa.car.082` |  |
| 117 | Ch.3 #59 | p.75 | D | hazards-conditions | PARTIAL | `car.fw.051`, **`car.cvpa.017`** (new) | App covered the most common work-zone crash type, not its causes. |
| 118 | Ch.3 #60 | p.75 | D | hazards-conditions | COVERED | `pa.car.060` |  |
| 119 | Ch.3 #61 | p.76 | A | intersections-turns | COVERED | `car.it.007` |  |
| 120 | Ch.3 #62 | p.76 | C | intersections-turns | COVERED | `car.scni.031` |  |
| 121 | Ch.3 #63 | p.76 | D | lanes-passing | PARTIAL | `car.lp.025`, `car.lp.054`, **`car.cvpa.018`** (new) | Left-turn exception appeared only in an explanation and a hazard scenario. |
| 122 | Ch.3 #64 | p.76 | D | lanes-passing | COVERED | `car.lp.021`, `car.smv.030` |  |
| 123 | Ch.3 #65 | p.76 | A | signals-markings | PARTIAL | `car.smv.041`, **`car.cvpa.019`** (new) | App image question covers single-direction lane arrows, not a combined straight/left arrow. |
| 124 | Ch.3 #66 | p.76 | B | speed-space | COVERED | `car.ss.046` |  |
| 125 | Ch.3 #67 | p.76 | B | right-of-way | COVERED | `car.row.066` |  |
| 126 | Ch.3 #68 | p.76 | A | right-of-way | COVERED | `car.row.001` |  |
| 127 | Ch.3 #69 | p.76 | D | intersections-turns | COVERED | `car.it.035` |  |
| 128 | Ch.3 #70 | p.77 | D | freeway | COVERED | `car.fw.003` |  |
| 129 | Ch.3 #71 | p.77 | C | freeway | COVERED | `car.fw.013` |  |
| 130 | Ch.3 #72 | p.77 | D | freeway | COVERED | `car.lp.056`, `car.fw.004` |  |
| 131 | Ch.3 #73 | p.77 | A | freeway | COVERED | `car.fw.014` |  |
| 132 | Ch.3 #74 | p.77 | B | intersections-turns | COVERED | `car.it.018` |  |
| 133 | Ch.3 #75 | p.77 | D | right-of-way | COVERED | `car.row.026` |  |
| 134 | Ch.3 #76 | p.77 | A | freeway | COVERED | `car.fw.028` |  |
| 135 | Ch.3 #77 | p.77 | A | lanes-passing | COVERED | `car.lp.019` |  |
| 136 | Ch.3 #78 | p.78 | C | speed-space | COVERED | `pa.car.051` |  |
| 137 | Ch.3 #79 | p.78 | D | speed-space | COVERED | `car.ss.011` |  |
| 138 | Ch.3 #80 | p.78 | B | speed-space | COVERED | `car.ss.011` |  |
| 139 | Ch.3 #81 | p.78 | A | speed-space | PARTIAL | `car.sr.040`, **`car.cvpa.020`** (new) | App covered roll-back behind trucks only. |
| 140 | Ch.3 #82 | p.78 | D | intersections-turns | MISSING | **`car.cvpa.021`** (new) |  |
| 141 | Ch.3 #83 | p.78 | D | speed-space | COVERED | `car.ss.006` |  |
| 142 | Ch.3 #84 | p.78 | D | speed-space | COVERED | `pa.car.045` |  |
| 143 | Ch.3 #85 | p.78 | A | speed-space | COVERED | `car.ss.002` |  |
| 144 | Ch.3 #86 | p.78 | A | intersections-turns | MISSING | **`car.cvpa.022`** (new) |  |
| 145 | Ch.3 #87 | p.79 | D | speed-space | COVERED | `car.ss.034` |  |
| 146 | Ch.3 #88 | p.79 | A | speed-space | COVERED | `car.ss.002`, `car.ss.003` |  |
| 147 | Ch.3 #89 | p.79 | A | hazards-conditions | COVERED | `car.hz.070` |  |
| 148 | Ch.3 #90 | p.79 | C | speed-space | COVERED | `pa.car.051` |  |
| 149 | Ch.3 #91 | p.79 | B | speed-space | COVERED | `car.fw.025` |  |
| 150 | Ch.3 #92 | p.79 | C | sharing-road | COVERED | `car.ss.055` |  |
| 151 | Ch.3 #93 | p.79 | C | emergencies | COVERED | `car.em.041` |  |
| 152 | Ch.3 #94 | p.79 | A | emergencies | COVERED | `car.em.009` |  |
| 153 | Ch.3 #95 | p.80 | A | safe-habits | PARTIAL | `car.sh.027`, `car.sh.029`, **`car.cvpa.023`** (new) | App covered why/who to buckle, not that belts are the single most effective protection. |
| 154 | Ch.3 #96 | p.80 | A | hazards-conditions | PARTIAL | `car.hz.038`, **`car.cvpa.024`** (new) | App said "gently and smoothly" but not slower turns on slick roads. |
| 155 | Ch.3 #97 | p.80 | A | hazards-conditions | COVERED | `car.hz.021`, `car.hz.024` |  |
| 156 | Ch.3 #98 | p.80 | C | hazards-conditions | COVERED | `car.scnr.031` |  |
| 157 | Ch.3 #99 | p.80 | C | hazards-conditions | COVERED | `pa.car.052` |  |
| 158 | Ch.3 #100 | p.80 | A | hazards-conditions | COVERED | `pa.car.052` |  |
| 159 | Ch.3 #101 | p.80 | D | hazards-conditions | COVERED | `car.hz.034` |  |
| 160 | Ch.3 #102 | p.80 | C | hazards-conditions | COVERED | `car.hz.019` |  |
| 161 | Ch.3 #103 | p.80 | D | hazards-conditions | COVERED | `car.hz.024` |  |
| 162 | Ch.3 #104 | p.81 | C | hazards-conditions | COVERED | `car.hz.024` |  |
| 163 | Ch.3 #105 | p.81 | A | hazards-conditions | COVERED | `car.hz.028` |  |
| 164 | Ch.3 #106 | p.81 | C | hazards-conditions | COVERED | `car.hz.001` |  |
| 165 | Ch.3 #107 | p.81 | D | safe-habits | COVERED | `car.sh.001`, `car.sh.002`, `car.sh.003` |  |
| 166 | Ch.3 #108 | p.81 | D | safe-habits | PARTIAL | `car.sh.004`, **`car.cvpa.025`** (new) | App covered phones only, not audio devices. |
| 167 | Ch.3 #109 | p.81 | C | sharing-road | COVERED | `car.sr.058` |  |
| 168 | Ch.3 #110 | p.81 | D | sharing-road | COVERED | `car.sr.051`, `pa.car.086` |  |
| 169 | Ch.4 #1 | p.90 | C | alcohol-drugs | MISSING | **`car.cvpa.026`** (new) |  |
| 170 | Ch.4 #2 | p.90 | A | alcohol-drugs | OUTDATED KEY | — | Key (suspension starting on 16th birthday for false ID) is not in the current manual text; flagged, not taught. |
| 171 | Ch.4 #3 | p.90 | A | alcohol-drugs | OUTDATED KEY | **`pa.car.110`** (new) | Key says 90-day suspension + up to $500; current manual lists only a fine of up to $500 plus costs. New question teaches the manual's current wording. |
| 172 | Ch.4 #4 | p.90 | A | alcohol-drugs | MISSING | **`pa.car.111`** (new) |  |
| 173 | Ch.4 #5 | p.90 | C | alcohol-drugs | MISSING | **`pa.car.112`** (new) |  |
| 174 | Ch.4 #6 | p.90 | B | alcohol-drugs | MISSING | **`pa.car.112`** (new) |  |
| 175 | Ch.4 #7 | p.90 | D | alcohol-drugs | MISSING | **`pa.car.112`** (new) |  |
| 176 | Ch.4 #8 | p.90 | C | alcohol-drugs | MISSING | **`pa.car.113`** (new) |  |
| 177 | Ch.4 #9 | p.91 | C | alcohol-drugs | COVERED | `pa.car.005` |  |
| 178 | Ch.4 #10 | p.91 | D | alcohol-drugs | COVERED | `pa.car.005` |  |
| 179 | Ch.4 #11 | p.91 | D | alcohol-drugs | PARTIAL | `pa.car.007`, **`pa.car.114`** (new) | pa.car.007 asks the license penalty; the $300 fine was only in its explanation. |
| 180 | Ch.4 #12 | p.91 | D | alcohol-drugs | COVERED | `pa.car.002`, `pa.car.003` |  |
| 181 | Ch.4 #13 | p.91 | D | alcohol-drugs | COVERED | `pa.car.009` |  |
| 182 | Ch.4 #14 | p.91 | B | alcohol-drugs | OUTDATED KEY | — | Key ($500 fine + 90-day suspension for carrying a false ID) is not in the current manual text; flagged, not taught. |
| 183 | Ch.4 #15 | p.91 | A | alcohol-drugs | COVERED | `pa.car.002` |  |
| 184 | Ch.4 #16 | p.91 | C | laws-licensing | COVERED | `car.ll.004`, `car.ll.010` |  |
