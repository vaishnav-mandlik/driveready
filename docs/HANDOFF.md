# DriveReady — project log & handoff

_Last updated: 2026-10-13 (America/Phoenix). Keep this file current: it is how the next agent (human or AI)
picks up the work._

## 1. What the owner asked for (verbatim, in order)

1. "i want to build a dmv us all 50 state test app driven test that prepare user 100% all things.. premium
   all question free.. all things.. no like other app that require money for premium questions.. so please do
   research do all thing .. and start build fully end to end.. react native.. no expo.. fully end to end premium
   insane app.. all things.."
2. "first for android.." / "then we can do all for ios once all done.. and published android.."
3. "do first top 10 state .. like that.. start building.. all end to end.. first 10 states.. must need all
   question all.. test.. all.."
4. "do research about other app/... take suggestion.. ref that app.. make our app improve add more feature and all.."
5. "put all this code and all research whatever all to github private repo.. use my github acc only.. push all
   also make sure all ai chat context or whatever we did its easy for other ai coding agent to grab.."

## 2. Key decisions (and why)

| Decision | Why |
|---|---|
| App name **DriveReady**, package `com.driveready.app` | Neutral, not implying government affiliation. Package id is permanent once published — change it *before* the first Play upload if desired (`android/app/build.gradle` `applicationId`/`namespace`, Java/Kotlin package dirs). |
| React Native **0.87.1** (latest), React 19.2, new architecture only | Latest stable on 2026-10-13; builds cleanly with the cached Gradle 9.4.1. |
| Minimal native deps: navigation (native-stack + bottom-tabs), screens, safe-area, svg, AsyncStorage v3, zustand, lucide icons | Reliability (fewer native build risks) and small APK. Animations use RN `Animated`. |
| **Custom TurboModule** (Java) for read-aloud (Android TextToSpeech), haptics (performHapticFeedback, no VIBRATE permission) and daily reminders (inexact `setAndAllowWhileIdle` alarms + boot receiver) | Third-party TTS/notification libs were unmaintained or heavy; this needs no exact-alarm permission. |
| Release build has **no INTERNET permission** | "No data collected" privacy story and simple Play Data-safety form. INTERNET exists only in the debug manifest (Metro). |
| Android Auto Backup enabled | Progress moves to a new phone without accounts. |
| Content = bundled JSON, schema in `app/src/data/types.ts`, validated by `scripts/validate-content.mjs` | Offline, fast, reviewable diffs. |
| Universal questions vs state questions | Universal questions must be correct in all 51 jurisdictions; state numbers/laws live in per-state files grounded in that state's handbook. |
| Facts must be **verified with verbatim quotes + page numbers**; "unverified" facts are dropped on import | Wrong legal facts would make users fail; Google Play also requires official sources for government info. |
| Pass-probability model: per-question knowledge from spaced-repetition history → binomial over the state's question count + passing score | Honest "ready to pass" meter (competitors' premium feature). |
| Extra free features beyond competitors | Survival (3 lives), Speed round (2 min), personal bests, supervised **driving log** (hours toward the state's requirement, CSV export), report-a-question, read-aloud, achievements, study plan, question of the day. |

## 3. Status (what exists now)

### Done
- RN project in `app/` builds for Android (debug + release config with R8, resource shrinking, 3 ABIs).
- Foundation: types, data loaders, quiz engine (13 modes), SRS, readiness model, achievements, stats, stores,
  native module, UI kit, navigation (≈31 routes), theme (light/dark), app icon (adaptive + themed), splash.
- Tests: `__tests__/engine/engine.test.ts` (33 tests), `__tests__/App.test.tsx` (smoke). All pass.
- Screens implemented: Quiz, Results, Review, ExamIntro, QuestionDetail, Welcome, PickState, PickTrack, Goal,
  Home, Practice, Topic. Shared helpers: `src/components/quiz/*`, `src/screens/practice/shared/*`.
- Content: **783 universal car questions** in 13 topic files (`app/src/content/questions/car/*.json`) — drafted
  and validated (0 errors) but the adversarial review pass did NOT run yet (session limit).
- Research: official handbook text for AL AK AZ AR CA CO FL GA IL MI MT NE NV NH NJ NM NY NC OH PA TX +
  MOTORCYCLE (MSF manual) + CDL (AAMVA manual) in `research/handbooks/`.
- Road signs: catalogs of 187 signs (`research/tools/*_catalog.json`), public-domain SVGs being downloaded by
  `research/tools/fetch_signs.py` → `research/signs/svg` + manifests → `app/scripts/build-signs.mjs`.
- Play assets: `app/docs/play-store/feature-graphic-1024x500.png`, `play-store-icon-512.png`,
  `app/docs/privacy-policy.html` (must be hosted at a public URL before publishing).
- Upload key generated locally (NOT in git): `app/android/keystores/driveready-upload.keystore` +
  `app/android/keystore.properties`.

### In progress when this was written
- `tools/workflows/state-content-v2.js` running for **CA + TX** (author → verifier). Output:
  `research/facts/CA.json`, `TX.json`, `app/src/content/states/*.json`, `app/src/content/questions/states/*.json`.

### Not done yet (prioritized next steps)
1. Remaining screens (placeholders contain "PLACEHOLDER"): QuestionList, Search, StudyPlan, Signs, SignDetail,
   Flashcards, Learn, Lesson, CheatSheet, ExamInfo, Progress, ExamHistory, Achievements, DriveLog, DriveEntry,
   Settings, About, Sources, Privacy. Spec: `app/docs/APP_SPEC.md`.
2. Top-10 state content: run `state-content-v2.js` for FL+NY, PA+IL, OH+GA, NC+MI (2 states per run).
3. Universal car bank review: correctness/universality + quality pass for all 13 topics (batch 3–4 topics per
   reviewer agent), then one lesson per topic (`app/src/content/lessons/car/<topic>.json`).
4. Road-sign questions (~150, using `sign` codes) once `build-signs.mjs` has produced `_codes.json`.
5. Custom illustrations (signals, pavement markings, hand signals, SMV emblem) → `app/assets/signs-custom/`
   (`tools/workflows/custom-illustrations.js` has the full spec), then rebuild signs.
6. Motorcycle universal bank (MSF manual, 7 topics) and CDL banks (8 modules) + lessons.
7. Competitor research report → `research/notes/market.md`; fold gaps into the app.
8. Integration: `npx tsc --noEmit`, `npx jest`, content validation, debug build on a device
   (the owner's phone is on wireless ADB `10.142.224.79:5555` and must accept the debugging prompt).
9. Release: host privacy policy, Play Console listing (copy draft in `app/docs/play-store/`), Data safety
   (no data collected), content rating, closed testing (new personal accounts need a 12-tester/14-day test),
   upload AAB (`./gradlew bundleRelease`).
10. Remaining 41 states (same pipeline), then iOS (needs full Xcode; native module needs an iOS implementation).

## 4. How content is produced (pipeline)
1. Handbook PDF → text: `python3 -I research/tools/extract_pdf.py <pdf> research/handbooks/XX.txt`.
2. Facts: agent writes `research/facts/XX.draft.json` (every fact has a verbatim quote + page); an independent
   verifier checks each with `python3 -I research/tools/find_quote.py research/handbooks/XX.txt "<quote>"`,
   sets status, writes `research/facts/XX.json`.
3. `node app/scripts/import-state-facts.mjs XX` → `app/src/content/states/XX.json` (drops unverified facts).
4. State questions → `app/src/content/questions/states/XX.json`; verifier re-checks every answer key.
5. `node app/scripts/build-content-index.mjs` then `node app/scripts/validate-content.mjs` (0 errors).

## 5. Environment notes (owner's Mac)
- macOS, Node 22.21, JDK 17, Android SDK (build-tools 35–37, platforms 36/37, NDK 27.1), Gradle 9.4.1 cached.
- No full Xcode installed (Command Line Tools only) → iOS work deferred.
- Disk is tight (~7 GB free): debug builds use `-PreactNativeArchitectures=arm64-v8a`.
- The project path contains a space ("DMV Test"); builds work, but always quote paths in scripts.
