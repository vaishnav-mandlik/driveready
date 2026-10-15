# South Carolina — official sample questions vs. DriveReady coverage

_Audit date: 2026-10-15. Sources: South Carolina Driver's Manual (`research/handbooks/SC.txt`), Section 12 "Sample
Knowledge Test Questions" (PDF pp.140-141, key "Correct Answers: 1. a; 2. c; 3. b; 4. a; 5. c; 6. c; 7. a; 8. a; 9. a;
10. c" on p.141 — the same AAMVA quiz Kentucky prints, pictures checked in the current PDF); South Carolina Motorcycle and
Moped Operator Manual (`research/handbooks/SC_MOTORCYCLE.txt`, AAMVA-based): ten "Test Your Knowledge" boxes at the end
of Sections 1-10 (24 items, each key printed under its box with the section that holds the answer) and Section 11 "Sample
Knowledge Test Questions" (5 items, key p.107). Page numbers are the `=== PAGE n ===` markers of the file each item comes
from (items 1-10: SC.txt; items 11-39: SC_MOTORCYCLE.txt) — the numbering the app's SC refs use. Extracted questions:
`research/official-samples/SC.json` (research only — never shipped, never copied into the app)._

## Summary

| | Count |
|---|---|
| Official sample questions (car manual 10 + motorcycle manual 29; all keyed) | **39** |
| COVERED (an app question tests the same fact with the same answer) | **28** |
| PARTIAL (related app question, different fact/angle) | **11** |
| MISSING (no app question) | **0** |
| New questions written | **11** — 4 South Carolina motorcycle (`sc.mc.011`–`sc.mc.014` in `app/src/content/questions/states/SC.json`) + 6 universal motorcycle (`mc.cvvks.001`–`mc.cvvks.006` in `app/src/content/questions/motorcycle/coverage-va-ky-tx-sc-al.json`) + 1 universal car (`car.cvvks.002`, shared with Kentucky) |

Car track: 10 items → 9 covered, 1 partial (#5, the chevron; same as Kentucky #5). Motorcycle track: 29 items → 19 covered,
10 partial. Motorcycle learners only see motorcycle-track questions (`getBank` loads the track's universal bank plus the
state's questions of that track), so car-track questions such as `sc.car.001` or `car.ll.018` do not count as coverage for
motorcycle items.

Key checks (each letter compared with the page the key points to):
- Car: as in coverage-KY.md, at SC pages 37 (alcohol reduces judgment), 72 ("passing permitted when dashed line is on
  your side"), 61 (four-way stop, driver on your right), 64 (warning-sign chart: "Divided Highway Begins", and the single
  chevron labeled "Sharp Curve Ahead"), 68 (regulatory signs are white), 110 (yield to pedestrians even outside a
  crosswalk), 114 (motorcyclist gets a full lane width), 91/112 (slow down, allow as much space as possible), 126 (high
  beams whenever no oncoming vehicles).
- Motorcycle: p.10 (Class M), pp.17/24 (impaired and convicted even under 0.08; 0.08% considered intoxicated; impairment begins with the first drink), p.29 ("Protection should be the first consideration when buying your motorcycle helmet"),
  p.31 (face shield), p.40 (use both brakes; front brake 70% or more), p.42 (turn just your head, not your shoulders),
  p.51 (intersections; reduce speed and cover the brakes), p.56 (tailgaters), p.60 (headlight on), p.61 (flash the brake
  light before slowing more quickly than others expect), p.62 (tire tracks in rain), p.66 (both brakes at once), p.69
  (swerve: press the handgrip on the side you want to turn), pp.70-71 (with traffic present, center of the lane in curves),
  p.75 (grooved pavement: head and eyes up), p.76 (dogs; flat tire: grip firmly, ease off the throttle), p.82 (passenger
  looks over your shoulder toward the turn), p.83 (staggered formation), p.88 (night: reduce speed), p.90 (rest breaks
  every two hours), pp.93/95/97/102 (three-wheel vehicles).

**Ambiguous-looking key, resolved:** the Section 10 key line (p.104) is clipped at the bottom of its text box in the PDF;
the text layer reads "1. B – Differences between Two-Wheel Motorcycles and Three-Wheel Vehicles 2 A Lane Position 3 A
4 B Stopping Quickly". Each letter matches the manual: 2-A single file, four seconds minimum (p.95); 3-A head up, adjust
speed before the turn (p.97); 4-B front-wheel skid: ease off some of the pressure (p.102). Recorded as printed. The
Section 11 key's section numbers are off by one in this edition (e.g. "section 6, Increasing Conspicuity" is in Section 5),
but every answer is supported (pp.61, 40, 69, 76, 51).

Validator (all files changed in the VA/KY/TX/SC/AL run): `node scripts/validate-content.mjs src/content/questions/states/TX.json src/content/questions/states/SC.json src/content/questions/car/coverage-va-ky-tx-sc-al.json src/content/questions/motorcycle/coverage-va-ky-tx-sc-al.json`
→ **0 errors, 0 warnings** (no duplicate prompts).

Index: not rebuilt here (per the audit instructions); `check-content-index` lists `states/SC.json`, `states/TX.json` and
the two new `coverage-va-ky-tx-sc-al.json` files — run `node scripts/build-content-index.mjs`.

## Conflicts (official key vs. app)

**No existing app question was changed.** Items reviewed closely:

| Official # | Issue | Resolution |
|---|---|---|
| 14 (MC Sec.2 #2) | Key: 0.08% BAC is considered intoxicated (p.24). The same manual's p.17 says "If you are operating a motor vehicle with a BAC of 0.05 percent or higher you are in violation of the law." | S.C. Code § 56-5-2933 sets the unlawful alcohol concentration at 0.08 (and § 56-5-2950 presumes a driver at 0.05 or less is not under the influence), so the key is right and p.17's line is loose. The app keys 0.08 (`sc.car.001`, new `sc.mc.013`) and never offers 0.05 as an answer, as already noted in research/facts/SC.json. |
| 32 (MC Sec.10 #2) | Key: three-wheel vehicles ride single file at least **four** seconds apart (p.95). The MSF Three-Wheel Supplement (p.51) says two seconds minimum; universal `mc.cvfom.004` keys single file and mentions both numbers. | Consistent (four seconds satisfies "at least two"). South Carolina's figure is taught as `sc.mc.014`. |
| 34 (MC Sec.10 #4) | Key: when the front wheel skids in a quick stop (three-wheel/sidecar section), ease off some of the pressure (p.102). `mc.crash.003` (two-wheeler, MSF): release the front brake at once, then reapply smoothly. | Same direction — reduce front braking to regain steering — for different vehicle types. No change. |
| 38 (MC Sample #4) | South Carolina's version keys "Ease off the throttle" (p.76); the MSF version of the same item keys "Brake on the good tire and steer to the side of the road". `mc.crash.035` teaches the braking step only. | Both are steps of one procedure (grip firmly, ease off the throttle, keep straight; then brake on the good tire and edge off the road). New `mc.cvvks.006` teaches the first step. |
| 27 (MC Sec.8 #1) | Key: passengers look over the rider's shoulder in the direction of the turn (p.82). `mc.pass.011` keys "Stay directly behind you and lean with you". | Complementary, not conflicting; new `mc.cvvks.003` teaches the look. |
| (not a sample item) | Night riding: SC p.88 says open up a **four**-second following distance or more; `mc.int.034` (MSF p.26) keys three seconds or more. | Four or more satisfies "three or more"; left unchanged. Noted for the owner. |

## New questions

South Carolina-specific (`states/SC.json`, `"states": ["SC"]`, motorcycle track):
- `sc.mc.011` (mc-laws) — Besides two-wheel motorcycles, what else may you operate with a South Carolina Class M license? → _Mopeds and three-wheel motorcycles_ (South Carolina Motorcycle and Moped Operator Manual, pp. 10-11) — closes #11
- `sc.mc.012` (mc-impairment) — Your BAC is below 0.08, but alcohol has affected your riding. According to the South Carolina motorcycle manual, which is true? → _You can still be impaired and convicted of riding impaired_ (pp. 17, 24) — closes #12
- `sc.mc.013` (mc-impairment) — A South Carolina motorcycle rider is 21 or older. At what BAC is the rider considered intoxicated? → _0.08 percent or higher_ (pp. 17, 24; S.C. Code of Laws § 56-5-2933) — closes #14
- `sc.mc.014` (mc-passengers-groups) — According to South Carolina's motorcycle manual, how should three-wheel vehicles ride when traveling in a group? → _Single file, at least four seconds apart_ (p. 95) — closes #32

Universal motorcycle (`motorcycle/coverage-va-ky-tx-sc-al.json`):
- `mc.cvvks.001` (mc-gear-controls) — You are shopping for your first motorcycle helmet. What should matter most? → _How well it protects your head in a crash_ (MSF p. 5; SC p. 29) — closes #15
- `mc.cvvks.002` (mc-crash-avoidance) — In a work zone, your lane has been grooved for repaving. How should you ride across it? → _Keep your eyes up, go slow and don't fight the bars_ (SC p. 75; MSF p. 31) — closes #25
- `mc.cvvks.003` (mc-passengers-groups) — Where should your passenger look as you ride through a curve? → _Over your shoulder, in the direction of the curve_ (MSF p. 35; SC p. 82) — closes #27
- `mc.cvvks.004` (mc-basic-control) — How does a three-wheel motorcycle's stability compare with a two-wheeler's? → _More stable, but it can lift a wheel or tip in a turn_ (MSF p. 49; SC p. 93) — closes #31
- `mc.cvvks.005` (mc-basic-control) — You are about to make a turn on a three-wheel motorcycle. How should you approach it? → _Slow down first, keep your head up and look through it_ (MSF pp. 49-50; SC p. 97) — closes #33
- `mc.cvvks.006` (mc-crash-avoidance) — A tire suddenly goes flat while you are riding. What should you do first? → _Grip firmly, ease off the throttle and ride straight_ (MSF p. 32; SC p. 76) — closes #38

Universal car: `car.cvvks.002` (chevron, sign `W1-8R`) — closes #5; see coverage-KY.md.

State-specific vs. universal decisions: license classes (Class M also covers mopeds and three-wheelers), the BAC
statements and the four-second three-wheel group gap are South Carolina law or South Carolina manual numbers (MSF says two
seconds), so they went to the SC file on the motorcycle track. Universal only where the MSF manual used by most states says
the same thing: helmet protection first (MSF "get the most protection"), grooves (MSF "relax, maintain a steady speed"),
passenger looking over the rider's shoulder, three-wheel stability/tip-over lines and turning, and the first steps after a
flat tire.

## Item-by-item table

| n | Official item | Page | Key | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|---|
| 1 | Car Sample #1 | p.140 | A | alcohol-drugs | COVERED | `car.ad.001`, `car.ad.042` |  |
| 2 | Car Sample #2 | p.140 | C | lanes-passing | COVERED | `car.lp.021`, `car.scnr.027`, `car.smv.030` |  |
| 3 | Car Sample #3 | p.140 | B | right-of-way | COVERED | `car.row.014`, `car.scni.003` |  |
| 4 | Car Sample #4 (pictures) | p.141 | A | road-signs | COVERED | `car.rsw.016`, `car.rsw.017` | W6-1 Divided Highway. |
| 5 | Car Sample #5 (chevron) | p.141 | C | road-signs | PARTIAL | `car.rs.093`, **`car.cvvks.002`** (new) | car.rs.093 gave the curve in its prompt; "sharp curve" was only in its explanation. |
| 6 | Car Sample #6 | p.141 | C | road-signs | COVERED | `car.rs.129`, `car.rs.127`, `car.rs.130` |  |
| 7 | Car Sample #7 | p.141 | A | right-of-way | COVERED | `car.row.046` |  |
| 8 | Car Sample #8 | p.141 | A | sharing-road | COVERED | `car.sr.022` |  |
| 9 | Car Sample #9 | p.141 | A | sharing-road | COVERED | `car.scnr.013`, `car.sr.017`, `car.sr.018`, `sc.car.087` |  |
| 10 | Car Sample #10 | p.141 | C | hazards-conditions | COVERED | `car.hz.008`, `car.hz.006`, `car.hz.007` |  |
| 11 | MC Sec.1 #1 | p.21 | C | mc-laws | PARTIAL | `car.ll.018` (car track), **`sc.mc.011`** (new) | Nothing on the motorcycle track said what a Class M license covers. |
| 12 | MC Sec.1 #2 | p.21 | A | mc-impairment | PARTIAL | `mc.imp.004`, `sc.car.009` (car track), **`sc.mc.012`** (new) | mc.imp.004: judgment suffers long before legal limits; conviction under 0.08 was not on the motorcycle track. |
| 13 | MC Sec.2 #1 | p.26 | C | mc-impairment | COVERED | `mc.imp.002` |  |
| 14 | MC Sec.2 #2 | p.26 | C | mc-impairment | PARTIAL | `sc.car.001` (car track), **`sc.mc.013`** (new) | See Conflicts (p.17 says 0.05). |
| 15 | MC Sec.3 #1 | p.35 | B | mc-gear-controls | PARTIAL | `mc.gear.007`, `mc.gear.008`, **`mc.cvvks.001`** (new) | Helmet use and styles were taught, not what to put first when buying one. |
| 16 | MC Sec.3 #2 | p.35 | C | mc-gear-controls | COVERED | `mc.gear.012` |  |
| 17 | MC Sec.4 #1 | p.43 | A | mc-basic-control | COVERED | `mc.ctl.022` |  |
| 18 | MC Sec.4 #2 | p.43 | B | mc-basic-control | COVERED | `mc.ctl.036` |  |
| 19 | MC Sec.5 #1 | p.65 | B | mc-intersections | COVERED | `mc.int.001` |  |
| 20 | MC Sec.5 #2 | p.65 | A | mc-lane-position | COVERED | `mc.lane.021`, `mc.lane.022` |  |
| 21 | MC Sec.5 #3 | p.65 | C | mc-crash-avoidance | COVERED | `mc.crash.026` |  |
| 22 | MC Sec.5 #4 | p.65 | A | mc-intersections | COVERED | `mc.int.023` | Headlight on at all times; twice as likely to be noticed. |
| 23 | MC Sec.6 #1 | p.72 | C | mc-crash-avoidance | COVERED | `mc.crash.001` |  |
| 24 | MC Sec.6 #2 | p.72 | C | mc-crash-avoidance | COVERED | `mc.crash.018` |  |
| 25 | MC Sec.7 #1 | p.78 | B | mc-crash-avoidance | PARTIAL | `mc.crash.032`, **`mc.cvvks.002`** (new) | Only bridge gratings were asked. |
| 26 | MC Sec.7 #2 | p.78 | B | mc-crash-avoidance | COVERED | `mc.crash.044` |  |
| 27 | MC Sec.8 #1 | p.86 | A | mc-passengers-groups | PARTIAL | `mc.pass.011`, **`mc.cvvks.003`** (new) | See Conflicts. |
| 28 | MC Sec.8 #2 | p.86 | C | mc-passengers-groups | COVERED | `mc.scn.005`, `mc.pass.028`, `mc.pass.027` |  |
| 29 | MC Sec.9 #1 | p.91 | C | mc-intersections | COVERED | `mc.int.037`, `mc.int.034`, `mc.int.035` | Slow so you can stop within your headlight's reach; don't close up on the car ahead. |
| 30 | MC Sec.9 #2 | p.91 | B | mc-impairment | COVERED | `mc.imp.030`, `mc.imp.032` |  |
| 31 | MC Sec.10 #1 | p.104 | B | mc-basic-control | PARTIAL | `mc.ctl.044`, **`mc.cvvks.004`** (new) | Steering was taught; "more stable but can tip" was not. |
| 32 | MC Sec.10 #2 | p.104 | A | mc-passengers-groups | PARTIAL | `mc.cvfom.004`, **`sc.mc.014`** (new) | Clipped key line; see Conflicts. |
| 33 | MC Sec.10 #3 | p.104 | A | mc-basic-control | PARTIAL | `mc.cvfom.005`, **`mc.cvvks.005`** (new) | mc.cvfom.005 covers body lean, not head up and setting speed before the turn. |
| 34 | MC Sec.10 #4 | p.104 | B | mc-crash-avoidance | COVERED | `mc.crash.003`, `mc.crash.015` | See Conflicts. |
| 35 | MC Sample #1 | p.106 | B | mc-intersections | COVERED | `mc.cvtwu.002`, `mc.int.027`, `mc.int.028` |  |
| 36 | MC Sample #2 | p.106 | C | mc-basic-control | COVERED | `mc.ctl.023` |  |
| 37 | MC Sample #3 | p.106 | C | mc-crash-avoidance | COVERED | `mc.crash.009` |  |
| 38 | MC Sample #4 | p.107 | C | mc-crash-avoidance | PARTIAL | `mc.crash.035`, **`mc.cvvks.006`** (new) | See Conflicts. |
| 39 | MC Sample #5 (picture) | p.107 | B | mc-intersections | COVERED | `mc.int.005`, `mc.int.006` | Pictured: car waiting at a side street. |
