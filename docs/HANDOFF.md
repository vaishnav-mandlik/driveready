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

_Updated 2026-10-14._

### Done
- **App**: all 31 screens, 78 Jest tests passing, signed release APK verified on an Android 16 emulator.
- **Top 10 states complete & verified** (facts w/ page + verbatim quote, official test format, ~110 state
  questions each): CA, TX, FL, NY, PA, IL, OH, GA, NC, MI. Formats: CA 80%, TX 70% (counts unpublished → 40-Q
  practice exam), FL 50/40, NY 20/14 (+2 of 4 signs), PA 18/15, IL 35/28, OH 40/30, GA 2×20 (15 each),
  NC 40/32, MI teen Segment 1 exam 80 Q @70%.
- **Universal car bank** 748 Q (reviewed against all handbooks); **motorcycle** 292 Q (MSF manual, reviewed);
  **CDL General Knowledge** 252 Q (AAMVA manual, reviewed).
- **Signs**: 132 in-app (MUTCD + app-drawn signals/markings/hand signals); remaining MUTCD SVGs downloading.
- **Extra features**: State Laws mode, survival, speed round, driving log, share cheat sheet, road-test guide.

### In progress
- CDL modules: air brakes, combination, hazmat, tanker, doubles/triples, passenger, school bus (`bank-builder.js`).
- Car lessons for 14 topics (`lessons.js`).

### Next steps (prioritized)
1. Road-sign questions (~150, `sign` field) + image questions for signals/markings, after all signs download.
2. Motorcycle + CDL lessons (`lessons.js`).
3. Play release prep: AAB (`./gradlew bundleRelease`), screenshots (emulator), host privacy policy, Play Console
   (owner's account), 12-tester closed test.
4. Remaining 41 states in batches of 4 (`state-content-v2.js`; handbooks for AL AK AZ AR CO MT NE NV NH NJ NM
   are already in research/handbooks).
5. iOS (needs Xcode + iOS native module).

## 4. How content is produced (pipeline)
1. Handbook PDF → text: `python3 -I research/tools/extract_pdf.py <pdf> research/handbooks/XX.txt`.
2. Facts: agent writes `research/facts/XX.draft.json` (every fact has a verbatim quote + page); an independent
   verifier checks each with `python3 -I research/tools/find_quote.py research/handbooks/XX.txt "<quote>"`,
   sets status, writes `research/facts/XX.json`.
3. `node app/scripts/import-state-facts.mjs XX` → `app/src/content/states/XX.json` (drops unverified facts).
4. State questions → `app/src/content/questions/states/XX.json`; verifier re-checks every answer key.
5. `node app/scripts/build-content-index.mjs` then `node app/scripts/validate-content.mjs` (0 errors).

## 5. On-device testing (Android 16 emulator, release build)
- Verified on a real Android 16 runtime: launch, onboarding, Home, practice quiz with feedback, leave-confirm
  dialog, Signs library (MUTCD SVGs via SvgXml), Learn, verified CA cheat sheet.
- Bugs found & fixed from device testing: onboarding stayed on Goal after "Start studying" (navigationKey on
  navigator groups + App-level test); disabled tiles drew a grey box (elevation + opacity); discouraging
  "1% pass chance" before any answers; disclaimer footer missing the non-affiliation sentence.
- Emulator: AVD `driveready36` (system-images;android-36;default;arm64-v8a), qcow2 data disk. Start with
  `emulator -avd driveready36 -no-window -no-audio -no-snapshot -gpu swiftshader_indirect -memory 2048`;
  drive it with `adb` + `uiautomator dump` (tap by text/content-desc). Stop with `adb emu kill`.

## 6. Environment notes (owner's Mac)
- **8 GB RAM + ~2–7 GB free disk**: running the emulator + Gradle + several agents pushed swap to 12+ GB
  (swap files live on the same disk). Run one heavy thing at a time; `./gradlew --stop` after builds;
  `adb emu kill` when done.
- macOS, Node 22.21, JDK 17, Android SDK (build-tools 35–37, platforms 36/37, NDK 27.1), Gradle 9.4.1 cached.
- No full Xcode installed (Command Line Tools only) → iOS work deferred.
- Disk is tight (~7 GB free): debug builds use `-PreactNativeArchitectures=arm64-v8a`.
- The project path contains a space ("DMV Test"); builds work, but always quote paths in scripts.
