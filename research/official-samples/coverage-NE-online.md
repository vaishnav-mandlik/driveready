# Nebraska — official online practice tests vs. DriveReady coverage

_Audit date: 2026-10-15. Extracted questions: `research/official-samples/NE-online.json` (research only — never shipped, never copied into the app). App page refs use the January 2025 Nebraska Driver's Manual PDF pages (`research/handbooks/NE.txt`, printed page + 8)._

## What was collectable

| Source (official) | What it is | Collected |
|---|---|---|
| https://www.nebraska.gov/dmv/practice/ (from `officialPracticeTests`; the DMV page's legacy link `nebraska.gov/dmv_cgi/2003exam/practice_test.cgi` redirects here) | DMV Online Practice Drivers Examination. The page says its questions "come from the same pool of questions as the actual test"; it draws questions at random from one JSON file. | **Yes — the whole pool**: `data/exam.json`, 143 questions with keys and page references (to an older manual edition, `engdrivermanual.pdf`). 25 items use pictures (`data/img/<id>`, GIF); all 25 were downloaded and viewed to read the diagrams/signs, then described in the `image` field. One request returned the full pool, so no random sampling was needed — the pool is complete, not a sample. |
| https://dmv.nebraska.gov/dl/practice-drivers-license-exam (from `officialPracticeTests`) | DMV page linking the online test and a "AAA Sample Test" PDF | Page read (links only). |
| https://dmv.nebraska.gov/sites/dmv.nebraska.gov/files/doc/dls/aaaexam.pdf (linked from that page) | "Nebraska Driver's Practice Exam" provided by AAA Nebraska / Cornhusker Motor Club Foundation with the cooperation of the Nebraska DMV, hosted on the DMV site; the same 39 questions are printed in the current manual (PDF pp. 84-85). It states its questions differ from the actual test. | **Yes** — 39 items (25 true/false + 14 multiple choice), answer key printed. Items n = 144-182. |
| http://www.nebraska.gov/dmv/cdl-practice-exam/practice_test.cgi (linked from the same page) | CDL practice exam | **Not collected** — CDL is outside this audit (car/motorcycle/state banks only). |
| Apple App Store link on the DMV page | Third-party store listing | Not an official .gov test page; skipped. |

No motorcycle practice test is published (the DMV pages link only the Class O test, the AAA sample and the CDL exam). Nothing was behind a login or CAPTCHA, and no form was submitted. About 35 plain GET requests in total (pool JSON, landing page, app.js, 25 images, DMV page, redirect check, AAA PDF), at least 2 s apart. The raw download folder `research/raw/online-NE` was deleted after extraction.

## Summary

| | Pool (143) | AAA sample (39) | Total |
|---|---|---|---|
| COVERED | 129 | 35 | **164** |
| PARTIAL | 11 | 3 | **14** |
| MISSING | 3 | 1 | **4** |
| Official questions | 143 | 39 | **182** |

COVERED includes #111 after the conflict fix below. New questions written: **15** — 12 Nebraska (`ne.car.101`–`ne.car.112` in `app/src/content/questions/states/NE.json`) + 3 universal car (`car.cvone.001`–`car.cvone.003` in the new file `app/src/content/questions/car/coverage-online-ne.json`); 1 existing question corrected (`ne.car.099`). No motorcycle question was needed (no official motorcycle items).

Validator: `node scripts/validate-content.mjs src/content/questions/states/NE.json src/content/questions/car/coverage-online-ne.json` → **0 errors, 0 warnings** (no duplicate prompts).
Index: not rebuilt here (per the audit instructions): run `node scripts/build-content-index.mjs` (NE.json hash changed; `car/coverage-online-ne.json` is new).

## Conflicts (official key vs. app)

| Official # | Issue | Resolution |
|---|---|---|
| 111 (pool) | Key: report a crash within 10 days if anyone is hurt/killed or damage exceeds **$1,500** (choice "10/$1500"); the manual (p. 81) says the same. `ne.car.099` keyed **$2,000** (LB 1126, Neb. Rev. Stat. 60-699, effective July 18, 2026) — the app contradicted the official materials. | **Changed `ne.car.099`** (id kept): it now asks what the manual says and keys $1,500; the explanation says current law raised the threshold to $2,000 on July 18, 2026. $2,000 is not offered as a wrong choice, so the question stays true under both. `ne.car.098` (10 days) unchanged. Note: `research/facts/NE.json` gaps text and the state fact `crash_reporting` still describe the $2,000 approach — not edited here (outside this audit's files). |
| 32 (pool) | Key: when being passed, stay in your lane **and maintain speed** ("stay in your lane and reduce speed" is a wrong choice; manual p. 62). App keys agree (`car.sr.030` keep speed and lane position; `car.lp.007` don't speed up), but the explanations of `car.lp.030`, `car.ss.022` and `car.fw.048` say easing off slightly helps (true in other handbooks, e.g. MA says slow down, VA says steady speed or slow down). | Universal questions unchanged (their keys are not contradicted and they serve all states). Added Nebraska-specific `ne.car.104` keyed to the manual, with "slow down" as a wrong choice and the nuance in the explanation. |
| 96-97 (pool) | Key: fleeing to avoid arrest can be a misdemeanor or felony, and the license can be revoked. Manual p. 30: fleeing a felony arrest = Class IV felony. `ne.car.042` follows current 28-905 (first flight = Class I misdemeanor; felony with prior conviction, injury/death or willful reckless driving). | Consistent with the key (misdemeanor or felony + revocation); no change. |
| 67 (pool) | Key: wind "can be a problem for all vehicles". `car.hz.048` keys tall vehicles/trailers as MOST affected (wrong choice: "all vehicles are affected equally"). | Not a contradiction (most affected ≠ only); `car.hz.047` and the `car.hz.048` explanation cover cars too. No change. |
| 181 (AAA #38) | Key "10-12 inches" between driver and air-bag steering wheel; manual p. 34 and `car.sh.030`: at least 10 inches. | Consistent. No change. |
| 41 (pool) | Left turn from a two-way street onto a one-way street: key = the one-way street's left lane (manual p. 63). California lets drivers end such a turn in any open lane when there are 3+ lanes (CA p. 27), so this is not universal. | Taught as Nebraska-specific `ne.car.105`. |

Other observations (no official item involved, no change): the pool's page references point to an older manual edition; `ne.car.051` teaches the 2025 statute's $50 speeding fine while the manual's p. 61 table still shows $10 — the pool has no fine-amount question.

## New questions

Nebraska-specific (`states/NE.json`, `"states": ["NE"]`):
- `ne.car.101` (hazards-conditions) — How far ahead does the Nebraska Driver's Manual tell you to look to take in what is happening on the road? → _At least 10 to 15 seconds ahead_ (Nebraska Driver's Manual, p. 74) — closes #9
- `ne.car.102` (safe-habits) — According to the Nebraska Driver's Manual, how often should you check the traffic behind you? → _At least every 10 seconds, and when slowing or going down steep hills_ (Nebraska Driver's Manual, p. 74) — closes #10
- `ne.car.103` (hazards-conditions) — In a work zone, the Nebraska Driver's Manual says to keep a steady speed that matches the traffic flow and not to slow abruptly. Why? → _Speed differences with nearby traffic are a major cause of rear-end crashes there_ (Nebraska Driver's Manual, p. 61) — closes #12, #14
- `ne.car.104` (lanes-passing) — Another vehicle is passing you on a Nebraska highway, and there is no emergency. What does the Nebraska Driver's Manual tell you to do? → _Stay in your lane and keep your speed steady_ (Nebraska Driver's Manual, p. 62) — closes #32
- `ne.car.105` (intersections-turns) — You turn left from a two-way street onto a one-way street that has three lanes, and no turn lanes are marked. Under Nebraska's rules, which lane should you finish the turn in? → _The left lane of the one-way street_ (Nebraska Driver's Manual, pp. 63-64) — closes #41
- `ne.car.106` (emergencies) — You make an emergency stop on the shoulder of a Nebraska highway. According to the Nebraska Driver's Manual, what should you do once you are parked? → _Put it in park (or gear), set the parking brake and use your flashers_ (Nebraska Driver's Manual, pp. 64-65) — closes #50, #51
- `ne.car.107` (signals-markings) — According to the Nebraska Driver's Manual, rumble strips are sometimes placed in the travel lane itself. What do these warn a drowsy or inattentive driver about? → _That a stop sign or signal is just ahead_ (Nebraska Driver's Manual, p. 54) — closes #109
- `ne.car.108` (sharing-road) — Why does the Nebraska Driver's Manual warn against making sudden stops in front of large trucks and buses? → _Their air brakes do not work instantly, unlike a car's hydraulic brakes_ (Nebraska Driver's Manual, p. 79) — closes #114
- `ne.car.109` (alcohol-drugs) — The Nebraska Driver's Manual names a major contributing factor in Nebraska crashes that kill or seriously injure people. What is it? → _Driving after using alcohol or other drugs_ (Nebraska Driver's Manual, pp. 32-33) — closes #129, #144
- `ne.car.110` (alcohol-drugs) — According to the Nebraska Driver's Manual, at what blood alcohol concentration (BAC) does a driver's risk of a crash begin to rise noticeably? → _Between .04% and .05%_ (Nebraska Driver's Manual, p. 33) — closes #145
- `ne.car.111` (sharing-road) — You plan to turn right where a bike lane runs between your lane and the curb, and no bicyclist is close. What does the Nebraska Driver's Manual say to do? → _Signal and move into the bike lane before you turn_ (Nebraska Driver's Manual, pp. 54, 77) — closes #151
- `ne.car.112` (signals-markings) — According to the Nebraska Driver's Manual, when may you cross double solid yellow center lines? → _Only to turn left or to get around an obstruction_ (Nebraska Driver's Manual, p. 52) — closes #163

Universal car (`car/coverage-online-ne.json`):
- `car.cvone.001` (right-of-way) — At an intersection with no signs or signals, you want to turn left. One car is coming from your right and another is coming toward you from the opposite direction, both close. Whom must you yield to? → _The car on your right and the oncoming car_ (State driver handbooks (e.g. NE p.56, TX p.26)) — closes #23
- `car.cvone.002` (intersections-turns) — You must stop at a STOP sign at a corner with sidewalks, but there is no stop line and no crosswalk painted on the street. Where should you stop? → _Before the unmarked crosswalk, in line with the sidewalk_ (State driver handbooks (e.g. NE p.44, IL p.29, MN p.44)) — closes #87
- `car.cvone.003` (right-of-way) — Your light turns green, but a pedestrian steps into the crosswalk in front of you against a steady DON'T WALK signal. What should you do? → _Wait and let the pedestrian cross safely_ (State driver handbooks (e.g. NE p.77, NM p.14, KS p.80)) — closes #121

Corrected: `ne.car.099` (emergencies) — what the manual says the crash-report damage threshold is → _$1,500_, with the July 2026 $2,000 change in the explanation (Nebraska Driver's Manual, p. 81; Neb. Rev. Stat. § 60-699 (LB 1126, 2026)) — resolves #111.

State-specific vs. universal decisions: scan distance (10-15 s), the 10-second rear check, the work-zone steady-speed rationale, keeping speed while being passed, the left-lane rule for left turns onto one-way streets, the emergency roadside stop steps, in-lane rumble strips before stops, the air-brake reason for not stopping short in front of trucks, the manual's alcohol/drug crash statement and .04-.05% crash-risk threshold, merging into the bike lane before a right turn, and the "only" exceptions for crossing double yellow lines are Nebraska manual rules (other handbooks differ or are silent), so they went to the Nebraska file. Universal only where every handbook agrees: yield both to the right and to oncoming traffic when turning left at an uncontrolled intersection (NE p. 56, TX p. 26), stop before an unmarked crosswalk when there is no stop line (UVC rule; NE p. 44, IL p. 29, MN p. 44), and yield to a pedestrian crossing against the signal (NE p. 77, NM p. 14, KS p. 80). The roundabout sign (#140) was already closed by `car.cvfom.007` from the FL/OR/MD/MI audit.

Answer-position spread of the 16 questions written or rewritten (15 new + `ne.car.099`): 3/5/4/4 (positions 0/1/2/3); the correct choice is the uniquely longest option in 0 of them. Wording is original (official wording was not copied).

## Item-by-item table

n 1-143 = online pool (`exam.json` order); n 144-182 = AAA sample exam #1-#39. Key letters follow the official choice order.

| n | Official item | Key | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|
| 1 | All children ages eight up to 18 are required to ride: | C | safe-habits | COVERED | `ne.car.019`, `ne.car.017` | ne.car.019 (a 12-year-old must be buckled) and ne.car.017 teach the belt-or-child-seat rule for ages 8 to 18. |
| 2 | Failure to secure children ages eight up to 18 in a safety belt or ch… | A | safe-habits | COVERED | `ne.car.019` |  |
| 3 | Failure to secure children under age eight in a federally-approved ch… | A | safe-habits | COVERED | `ne.car.019` | Same $25 + 1 point penalty for the whole child restraint law (explanation). |
| 4 | The Child Passenger Restraint Law requires that all children up to ag… | B | safe-habits | COVERED | `ne.car.017` |  |
| 5 | The following is true about air bags: | B | safe-habits | COVERED | `car.sh.026` |  |
| 6 | Children up to age _ are prohibited from riding in cargo areas | C | safe-habits | COVERED | `ne.car.020` |  |
| 7 | Children up to age eighteen are prohibited from riding in cargo areas | A | safe-habits | COVERED | `ne.car.020` |  |
| 8 | Always keep a cushion of space between you and other vehicles to have… | A | speed-space | COVERED | `ne.car.049`, `ne.car.050` |  |
| 9 | Knowing what traffic ahead of you is doing is very important. A good… | C | hazards-conditions | MISSING | **`ne.car.101`** (new) | Scan distance (10-15 s) varies by handbook, so Nebraska-specific. |
| 10 | It is important to check the traffic behind you every ten seconds whe… | D | safe-habits | PARTIAL | `car.hz.071`, `car.cvkic.005`, **`ne.car.102`** (new) | Mirror checks were taught, not the 10-second rule or the slowing/steep-hill occasions. |
| 11 | It is unlawful to operate a motor vehicle upon any public roadway, wh… | A | safe-habits | COVERED | `ne.car.021` |  |
| 12 | When driving in work zones, you should: | B | hazards-conditions | PARTIAL | `car.hz.062`, `car.hz.059`, **`ne.car.103`** (new) | Stay alert/obey signs/expect stops were taught; steady speed without abrupt slowing was not. |
| 13 | The basic color for various traffic control devices used in construct… | B | road-signs | COVERED | `car.rs.123` |  |
| 14 | The major cause of rear-end crashes in work zones is: | A | hazards-conditions | MISSING | **`ne.car.103`** (new) |  |
| 15 | Nebraska's speed law requires you drive: | C | speed-space | COVERED | `ne.car.043` |  |
| 16 | Unless otherwise posted, the speed limit in a residential district is: | B | speed-space | COVERED | `ne.car.044` |  |
| 17 | It is legal to go faster than the speed limit when passing another ve… | B | speed-space | COVERED | `ne.car.057` |  |
| 18 | Unless otherwise posted, the speed limit in a business district is: | A | speed-space | COVERED | `ne.car.045` |  |
| 19 | Unless otherwise posted, the speed limit on a non-hard surface county… | C | speed-space | COVERED | `ne.car.046` | Non-hard-surface (gravel / not dustless) road: 50 mph. |
| 20 | The minimum speed when driving on the interstate is: | A | freeway | COVERED | `ne.car.054` |  |
| 21 | Fines for speeding are _ in work zones | B | speed-space | COVERED | `ne.car.052` |  |
| 22 | Fines for speeding are tripled in work and school zone areas | B | speed-space | COVERED | `ne.car.052` |  |
| 23 | In the following diagram where no signs or signals are used, if car "… [picture] | B | right-of-way | PARTIAL | `car.row.007`, `car.row.026`, `car.scni.010`, **`car.cvone.001`** (new) | Each rule was taught separately; the combined case (left turn with a car on the right and an oncoming car) was not. |
| 24 | For right-of-way at an intersection where signs or signals are not us… [picture] | B | right-of-way | COVERED | `car.row.007`, `car.scni.007` |  |
| 25 | At intersections with a "Yield" sign, you must: | A | right-of-way | COVERED | `car.row.023`, `car.rs.003`, `car.scni.040` |  |
| 26 | At intersections with four-way stops: | B | right-of-way | COVERED | `car.row.013`, `car.scni.001` |  |
| 27 | When you hear the siren or see the flashing lights of an emergency ve… | B | right-of-way | COVERED | `car.row.056`, `car.scnr.005` |  |
| 28 | When leaving alleys or driveways: | B | right-of-way | COVERED | `car.scni.036`, `car.row.038` |  |
| 29 | Enter a roundabout: | A | intersections-turns | COVERED | `car.scni.023`, `car.row.066` |  |
| 30 | At intersections with four-way stops, the driver on the right should… | B | right-of-way | COVERED | `car.row.001`, `car.row.019`, `car.row.076` |  |
| 31 | After you have passed a vehicle moving in the same direction, it is s… | C | lanes-passing | COVERED | `car.lp.037`, `car.scnr.028` |  |
| 32 | When another vehicle is passing you: | B | lanes-passing | PARTIAL | `car.sr.030`, `car.lp.007`, **`ne.car.104`** (new) | Key: keep lane AND speed; "reduce speed" is a wrong choice. Universal explanations (car.lp.030, car.ss.022, car.fw.048) say easing off slightly helps, so the Nebraska rule needed its own question. |
| 33 | It is unlawful to: | A | lanes-passing | COVERED | `car.lp.023`, `car.scnr.025`, `ne.car.056` |  |
| 34 | It is unlawful to: | D | lanes-passing | COVERED | `ne.car.056`, `car.sr.051` |  |
| 35 | To see objects in your "blind spot" when changing lanes, drivers shou… | B | lanes-passing | COVERED | `car.lp.019`, `car.scnr.023`, `car.lp.005` |  |
| 36 | To let others know you intend to turn, give signals at least ___ feet… | B | intersections-turns | COVERED | `ne.car.062` |  |
| 37 | The following diagram indicates the driver intends to: [picture] | C | signals-markings | COVERED | `car.smv.047` |  |
| 38 | When changing lanes, you should never: | A | lanes-passing | COVERED | `car.lp.045` |  |
| 39 | What is the correct lane to be in when making a left turn from a one… [picture] | D | intersections-turns | COVERED | `car.it.010` |  |
| 40 | What is the correct lane to be in when making a right turn from a one… [picture] | A | intersections-turns | COVERED | `car.it.066` |  |
| 41 | What is the correct lane to enter when making a left turn from a two… [picture] | D | intersections-turns | PARTIAL | `car.it.009`, `car.scni.030`, **`ne.car.105`** (new) | App taught the lane nearest the center line on two-way streets; onto a one-way street Nebraska says the left lane (CA lets you finish in any open lane), so Nebraska-specific. |
| 42 | What is the correct lane to enter when making a right turn from a two… [picture] | A | intersections-turns | COVERED | `car.it.002` |  |
| 43 | At many intersections, under certain conditions, a right turn may be… | B | intersections-turns | COVERED | `ne.car.058`, `car.scni.014` |  |
| 44 | Always signal when: | D | intersections-turns | COVERED | `car.lp.019`, `car.pk.011`, `car.pk.017` |  |
| 45 | If you park facing up hill where there is a curb, set the parking bra… [picture] | B | parking | COVERED | `car.pk.003`, `car.scnr.032` |  |
| 46 | If you park facing up hill where there is no curb, set the parking br… [picture] | A | parking | COVERED | `car.pk.004`, `car.scnr.036` |  |
| 47 | You should never park a vehicle | D | parking | COVERED | `car.pk.028`, `ne.car.085`, `ne.car.086` |  |
| 48 | Motorists overtaking a bicycle proceeding in the same direction shoul… | C | sharing-road | COVERED | `ne.car.078` |  |
| 49 | Individuals may park in the handicapped parking access aisles located… | B | parking | COVERED | `car.pk.031` |  |
| 50 | When completing an Emergency Roadside Stop, it is not necessary to pu… | B | emergencies | PARTIAL | `car.pk.001`, `car.fw.034`, **`ne.car.106`** (new) | Parking brake when parking and flashers on the shoulder were taught, not the emergency roadside stop steps. |
| 51 | When making an emergency roadside stop, you should: | B | emergencies | PARTIAL | `car.pk.001`, `car.fw.033`, `car.fw.034`, **`ne.car.106`** (new) |  |
| 52 | You should never park within _ feet of a fire hydrant | C | parking | COVERED | `ne.car.084` |  |
| 53 | When entering the interstate, you should check for a gap in traffic i… | B | freeway | COVERED | `car.fw.004`, `car.fw.002` |  |
| 54 | When driving on the interstate, you should use the left lane: | B | freeway | COVERED | `car.lp.001`, `car.rs.041` |  |
| 55 | When you plan on leaving the interstate, you should: | A | freeway | COVERED | `ne.car.055` |  |
| 56 | While driving on the interstate, you see vehicles on the entrance ram… | C | freeway | COVERED | `car.fw.008` |  |
| 57 | When driving on the interstate, slower traffic should: | A | freeway | COVERED | `car.lp.002`, `car.rs.037` |  |
| 58 | When driving at night, if the oncoming lights are blinding you, you s… | A | hazards-conditions | COVERED | `car.hz.004`, `car.hz.005` |  |
| 59 | While driving at night, you may use your parking lights instead of he… | B | hazards-conditions | COVERED | `ne.car.092` |  |
| 60 | To help others see you when daylight begins to fade, you should use y… | B | hazards-conditions | COVERED | `car.hz.014` |  |
| 61 | Headlights must be used: | D | hazards-conditions | COVERED | `ne.car.091` |  |
| 62 | When driving at night, using the parking lights only is unlawful | A | hazards-conditions | COVERED | `ne.car.092` |  |
| 63 | Hydroplaning occurs when tires ride on a thin film of water instead o… | B | hazards-conditions | COVERED | `car.hz.024` |  |
| 64 | When driving in snow or ice conditions, it is safe to use your cruise… | B | hazards-conditions | COVERED | `car.sh.058`, `car.hz.025` |  |
| 65 | To improve visibility caused by rain or fog, drivers should use: | A | hazards-conditions | COVERED | `car.hz.080`, `car.hz.028` |  |
| 66 | When stopping on snow or ice, drivers who are operating vehicles equi… | B | hazards-conditions | COVERED | `car.em.013` |  |
| 67 | Wind, when driving: | C | hazards-conditions | COVERED | `car.hz.047`, `car.hz.048` | car.hz.048 says tall vehicles/trailers are MOST affected and its explanation adds light vehicles; consistent with "a problem for all vehicles". |
| 68 | When driving in snow or ice conditions: | B | hazards-conditions | COVERED | `car.hz.038` |  |
| 69 | When driving on snow and ice, you should: | C | hazards-conditions | COVERED | `car.hz.039`, `car.ss.018` |  |
| 70 | When driving in fog, you should use your high beam headlights | B | hazards-conditions | COVERED | `car.hz.028`, `car.ph.022` |  |
| 71 | When driving in fog, you should: | C | hazards-conditions | COVERED | `car.hz.028` |  |
| 72 | Should your wheels drop off the roadway or pavement edge, you should: | A | emergencies | COVERED | `car.em.021`, `car.em.020` |  |
| 73 | If you are the driver of vehicle "A" you: [picture] | A | sharing-road | COVERED | `car.scnr.001`, `ne.car.080` |  |
| 74 | When approaching a school bus in the opposite direction, which has it… | B | sharing-road | COVERED | `ne.car.081` |  |
| 75 | When approaching a school bus in the opposite direction, which has it… | B | sharing-road | COVERED | `ne.car.081` |  |
| 76 | A diamond shaped sign means: [picture] | C | road-signs | COVERED | `car.rs.118` |  |
| 77 | A pentagon-shaped sign tells you that the sign is a: [picture] | C | road-signs | COVERED | `car.rs.099` |  |
| 78 | This sign indicates that the road ahead: [picture] | B | road-signs | COVERED | `car.rs.089` |  |
| 79 | Blue color traffic signs offer information on: [picture] | A | road-signs | COVERED | `car.rs.126` |  |
| 80 | When you see an octagon shaped sign, you should: [picture] | B | road-signs | COVERED | `car.rs.115` |  |
| 81 | This sign is a: [picture] | A | road-signs | COVERED | `car.rs.117` |  |
| 82 | This sign means: [picture] | C | road-signs | COVERED | `car.rsw.036` |  |
| 83 | This sign means: [picture] | B | road-signs | COVERED | `car.rsw.016` |  |
| 84 | When approaching an intersection with a flashing yellow light: | C | signals-markings | COVERED | `car.sm.016`, `car.smv.013` |  |
| 85 | Black-on-orange signs identify: | B | road-signs | COVERED | `car.rs.123`, `car.rsg.008` |  |
| 86 | This sign means: [picture] | C | road-signs | COVERED | `car.rsw.022` |  |
| 87 | When approaching an intersection with a stop sign and a sidewalk, but… | B | intersections-turns | PARTIAL | `car.it.039`, `car.it.040`, `car.row.049`, **`car.cvone.002`** (new) | Stop line and no-crosswalk cases were taught; stopping before an unmarked crosswalk at a stop sign was not. |
| 88 | Flashing arrow panels used in work zones: | B | hazards-conditions | COVERED | `car.hz.063`, `car.cvpa.004` |  |
| 89 | Barricades, vertical panels, drums and cones are the most commonly us… | A | hazards-conditions | COVERED | `car.hz.063`, `car.ph.021` |  |
| 90 | You are approaching an intersection with a traffic signal indicating… | C | signals-markings | COVERED | `car.smv.002` |  |
| 91 | Turning left at a red light is never permitted | B | intersections-turns | COVERED | `ne.car.059` |  |
| 92 | When approaching an intersection with a flashing red light: | A | signals-markings | COVERED | `car.sm.015`, `car.smv.011` |  |
| 93 | A steady yellow signal light is a warning that the light is about to… | B | signals-markings | COVERED | `car.sm.004` |  |
| 94 | At a red traffic light with a green arrow, you may proceed in the dir… | C | signals-markings | COVERED | `car.sm.010` |  |
| 95 | It is legal to make a left turn at a red traffic light after stopping… | B | intersections-turns | COVERED | `ne.car.059` |  |
| 96 | Any motor vehicle operator convicted of fleeing in order to avoid arr… | A | laws-licensing | COVERED | `ne.car.042` |  |
| 97 | What is the penalty for fleeing to avoid arrest? | C | laws-licensing | COVERED | `ne.car.042` | Misdemeanor (first flight) + possible revocation in the key; the explanation covers the felony cases. |
| 98 | This sign means you are approaching a railroad crossing without a sig… [picture] | C | road-signs | COVERED | `car.rsw.065`, `car.rs.111` |  |
| 99 | Without exception, never drive a vehicle through, around or under any… | A | sharing-road | COVERED | `car.sr.060` |  |
| 100 | When turning left at an intersection with this sign: [picture] | C | signals-markings | COVERED | `car.smv.008`, `ne.car.060` |  |
| 101 | You have stopped for a train at a railroad crossing. After the train… | C | sharing-road | COVERED | `car.sr.059`, `car.ss.020` |  |
| 102 | A broken yellow center line indicates: [picture] | C | signals-markings | COVERED | `car.smv.030` |  |
| 103 | Stop lines are white lines painted across the pavement at intersectio… | B | signals-markings | COVERED | `car.it.039`, `car.smv.043` |  |
| 104 | Roads with double solid yellow line markings in the center indicate t… [picture] | C | signals-markings | COVERED | `car.smv.026` |  |
| 105 | Road markings are used to guide and warn drivers as well as regulate… [picture] | B | signals-markings | COVERED | `car.smv.032` |  |
| 106 | A broken yellow line beside a solid yellow line indicates: | C | signals-markings | COVERED | `car.smv.028` |  |
| 107 | When double solid yellow lines mark the center of the road and separa… | C | signals-markings | COVERED | `car.sm.041`, `car.smv.026` |  |
| 108 | Shoulder rumble strips are a series of indented or raised elements in… | A | signals-markings | COVERED | `car.ph.014` |  |
| 109 | What is the purpose of rumble strips? | C | signals-markings | PARTIAL | `car.ph.014`, **`ne.car.107`** (new) | Shoulder rumble strips were taught, not in-lane strips before a stop sign or signal. |
| 110 | When a stop line is present at a stop sign, drivers must: | A | signals-markings | COVERED | `car.it.039`, `car.smv.043` |  |
| 111 | Nebraska law requires individuals involved in a crash to report it to… | B | emergencies | COVERED | `ne.car.098`, `ne.car.099` | CONFLICT fixed: ne.car.099 keyed the 2026 statute ($2,000); now keys the manual/pool figure ($1,500) with the law change in the explanation. |
| 112 | Nebraska law requires that individuals who change their name or addre… | B | laws-licensing | COVERED | `ne.car.035` |  |
| 113 | Accumulating 12 violation points in a two year period results in an a… | B | laws-licensing | COVERED | `ne.car.037` |  |
| 114 | You should not make sudden stops in front of large trucks and buses b… | B | sharing-road | PARTIAL | `car.sr.037`, **`ne.car.108`** (new) | Longer truck stopping distance was taught, not the air-brake lag reason. |
| 115 | No Zones are areas around trucks where cars: | A | sharing-road | COVERED | `car.sr.033`, `car.scnr.009` |  |
| 116 | 40% of motorcycle crashes were caused by: | A | sharing-road | COVERED | `car.sr.023` |  |
| 117 | The following distance behind a motorcycle should be: | C | sharing-road | COVERED | `ne.car.073` |  |
| 118 | Allow the motorcyclist a full lane width. Do not share the lane | A | sharing-road | COVERED | `car.sr.022` |  |
| 119 | A motorist making a left turn at an intersection should yield to the… | A | sharing-road | COVERED | `car.sr.020` |  |
| 120 | A person riding a bicycle has all the same rights, responsibilities a… | A | sharing-road | COVERED | `car.sr.012` |  |
| 121 | Motorists are not required to yield to pedestrians when they walk aga… | B | right-of-way | PARTIAL | `car.row.046`, `car.row.052`, **`car.cvone.003`** (new) | Jaywalkers and white-cane users were taught; a pedestrian crossing against the signal was not. |
| 122 | If the motorist sees pedestrians in a crosswalk, what should the moto… | B | right-of-way | COVERED | `car.row.042`, `car.scni.016`, `car.sm.026` |  |
| 123 | When approaching someone using a white cane or guide dog, you should: | A | right-of-way | COVERED | `car.scni.038`, `car.row.052` |  |
| 124 | The Nebraska blood alcohol concentration (BAC) limit for minor driver… | A | alcohol-drugs | COVERED | `ne.car.002` |  |
| 125 | Drivers who refuse to submit to a chemical test for alcohol or drugs… | C | alcohol-drugs | COVERED | `ne.car.004` |  |
| 126 | Which of the following factors affect an individual's absorption of a… | A | alcohol-drugs | COVERED | `car.ad.007` |  |
| 127 | Only ____ can reduce the alcohol level and the effects from the body | C | alcohol-drugs | COVERED | `car.ad.002` |  |
| 128 | A driver that operates a vehicle on Nebraska roadways has already agr… | A | alcohol-drugs | COVERED | `ne.car.005` |  |
| 129 | The major contributing factor in Nebraska crashes resulting in death… | B | alcohol-drugs | MISSING | **`ne.car.109`** (new) |  |
| 130 | No vehicle may follow any fire apparatus traveling in an emergency st… | C | right-of-way | COVERED | `ne.car.065` |  |
| 131 | The following is true regarding funeral procession escort vehicles: | A | right-of-way | COVERED | `ne.car.066` |  |
| 132 | Except when passing, maintain a following distance of at least _ feet… | A | sharing-road | COVERED | `ne.car.083` |  |
| 133 | When approaching snow removal equipment, you should: | D | sharing-road | COVERED | `ne.car.083`, `car.hz.083` | 100 ft in ne.car.083; car.hz.083 explanation covers poor visibility and thrown snow/salt. |
| 134 | Using a handheld wireless communication device to read, type or send… | C | safe-habits | COVERED | `ne.car.012`, `ne.car.013` |  |
| 135 | It is a secondary offense to use a handheld wireless communication de… | A | safe-habits | COVERED | `ne.car.011`, `ne.car.012` |  |
| 136 | When approaching an intersection with a flashing yellow arrow, if in… | B | signals-markings | COVERED | `car.sm.013`, `car.smv.015` |  |
| 137 | If a traffic signal is not operational (dark) because of a power fail… | B | intersections-turns | COVERED | `ne.car.061`, `car.row.063` |  |
| 138 | What is the color for warning signs specific to pedestrians, bicycles… | D | road-signs | COVERED | `car.rs.124` |  |
| 139 | When entering a roundabout: | C | intersections-turns | COVERED | `car.row.066`, `car.row.067`, `car.scni.022` |  |
| 140 | This sign means: [picture] | C | road-signs | COVERED | `car.cvfom.007` | W2-6 question added by the FL/OR/MD/MI audit (commit b856303) while this audit ran. |
| 141 | A driver in a vehicle on a multi-lane controlled access highway appro… | B | right-of-way | COVERED | `ne.car.067`, `ne.car.068` |  |
| 142 | Drivers involved in minor crashes on the interstate or freeway system… | C | emergencies | COVERED | `ne.car.097` |  |
| 143 | Persons who leave the scene of a motor vehicle crash may have their d… | D | laws-licensing | COVERED | `ne.car.041` |  |
| 144 | AAA #1: Being under the influence of alcohol or other drugs is a major contri… | A | alcohol-drugs | MISSING | **`ne.car.109`** (new) | Same fact as #129. |
| 145 | AAA #2: The risk of being in a crash begins to rise noticeably between .04% a… | A | alcohol-drugs | PARTIAL | `car.ad.043`, **`ne.car.110`** (new) | Impairment below the limit was taught, not the .04-.05% crash-risk threshold. |
| 146 | AAA #3: At .05% BAC a driver is at no risk of being involved in a crash. | B | alcohol-drugs | COVERED | `car.ad.043`, `car.ad.031` |  |
| 147 | AAA #4: Nebraska law requires the driver and all front seat passengers to pro… | A | safe-habits | COVERED | `ne.car.015` |  |
| 148 | AAA #5: Children up to age eight must ride correctly secured in a federally-a… | A | safe-habits | COVERED | `ne.car.017` |  |
| 149 | AAA #6: It is possible that when an air bag deploys, even in a low speed cras… | A | safe-habits | COVERED | `car.sh.033`, `car.sh.034` | Air-bag risk to children and short drivers is taught; "elderly" appears only in the official item. |
| 150 | AAA #7: Never use a rear facing infant safety seat in the front passenger sea… | A | safe-habits | COVERED | `car.sh.031` |  |
| 151 | AAA #8: Motorists should merge with bicycle traffic when preparing for a righ… | A | sharing-road | PARTIAL | `car.sr.019`, `car.sm.062`, **`ne.car.111`** (new) | Turning behind bicyclists and yielding in bike lanes were taught, not merging into the bike lane before the turn. |
| 152 | AAA #9: Motorcyclists should not constantly change positions within a lane. | B | sharing-road | COVERED | `car.sr.026` |  |
| 153 | AAA #10: Physicians and/or pharmacists should be consulted regarding any presc… | A | alcohol-drugs | COVERED | `car.ad.016` |  |
| 154 | AAA #11: Children and infants in child safety seats should always be placed in… | A | safe-habits | COVERED | `car.sh.033` |  |
| 155 | AAA #12: The “Blind Spot” is the area directly in front of your vehicle. | B | lanes-passing | COVERED | `car.lp.005` |  |
| 156 | AAA #13: On two way streets, it’s equally important to leave room between onco… | A | speed-space | COVERED | `car.hz.077` |  |
| 157 | AAA #14: Turning right at a red light after stopping is allowed, unless signs… | A | intersections-turns | COVERED | `ne.car.058` |  |
| 158 | AAA #15: The correct hand signal for a left turn is left arm out and fully ext… | A | signals-markings | COVERED | `car.smv.046` |  |
| 159 | AAA #16: Flagpersons have the authority to stop traffic. | A | hazards-conditions | COVERED | `car.sr.082`, `car.scnr.038` |  |
| 160 | AAA #17: Headlights must be used from sunset to sunrise. | A | hazards-conditions | COVERED | `ne.car.091` |  |
| 161 | AAA #18: At a four way stop, common courtesy is that the driver who stops firs… | A | right-of-way | COVERED | `car.row.013` |  |
| 162 | AAA #19: You may pass if a solid yellow line is on your side of the middle of… | B | lanes-passing | COVERED | `car.scnr.025`, `car.smv.028` |  |
| 163 | AAA #20: Making a left turn or avoiding an obstruction are the only lawful cro… | A | signals-markings | PARTIAL | `car.cvpa.005`, `car.sm.041`, **`ne.car.112`** (new) | Crossing to turn left into a driveway was taught; the obstruction exception and "only" were not. |
| 164 | AAA #21: Pedestrians have the right of way when in crosswalks even if the driv… | A | right-of-way | COVERED | `car.sm.026`, `car.scni.017` |  |
| 165 | AAA #22: If you park facing uphill where there is a curb, you should set the p… | A | parking | COVERED | `car.pk.003` |  |
| 166 | AAA #23: White lines separate lanes of traffic going in the same direction. | A | signals-markings | COVERED | `car.smv.032` |  |
| 167 | AAA #24: It is unlawful to exceed the posted speed limit when passing. | A | lanes-passing | COVERED | `ne.car.057` |  |
| 168 | AAA #25: The State has established different Blood Alcohol Concentration legal… | A | alcohol-drugs | COVERED | `ne.car.001`, `ne.car.002`, `ne.car.003` |  |
| 169 | AAA #26: The minimum speed allowed for driving on the interstate is: | B | freeway | COVERED | `ne.car.054` |  |
| 170 | AAA #27: Signal your turn at least ___ feet before planning to change directio… | B | intersections-turns | COVERED | `ne.car.062` |  |
| 171 | AAA #28: You should allow ___ seconds between your vehicle and the car in fron… | B | speed-space | COVERED | `ne.car.049` |  |
| 172 | AAA #29: Orange signs indicate which of the following: | A | road-signs | COVERED | `car.rs.123` |  |
| 173 | AAA #30: A triangle shaped road sign requires that the driver: | C | road-signs | COVERED | `car.rs.117` |  |
| 174 | AAA #31: When you hear a siren or see the flashing lights of an emergency vehi… | D | right-of-way | COVERED | `car.row.056` |  |
| 175 | AAA #32: The speed limit in residential areas is: | D | speed-space | COVERED | `ne.car.044` |  |
| 176 | AAA #33: You may not park within ___ feet of a fire hydrant. | C | parking | COVERED | `ne.car.084` |  |
| 177 | AAA #34: When approaching railroad tracks, one should stop for which of the fo… | D | sharing-road | COVERED | `car.scnr.018`, `car.sr.060`, `car.rs.112` |  |
| 178 | AAA #35: When driving on the interstate, slower traffic should keep to the: | A | freeway | COVERED | `car.lp.002` |  |
| 179 | AAA #36: When driving in fog, one should use: | B | hazards-conditions | COVERED | `car.hz.028` |  |
| 180 | AAA #37: The only exception for passing a school bus with its stop lights on a… | C | sharing-road | COVERED | `ne.car.081` |  |
| 181 | AAA #38: Drivers of air bag-equipped vehicles should allow at least ___ inches… | C | safe-habits | COVERED | `car.sh.030` | Key "10-12 inches"; manual and app: at least 10 inches. |
| 182 | AAA #39: If the wheels of your vehicle fall off the edge of the roadway or pav… | D | emergencies | COVERED | `car.em.021` |  |
