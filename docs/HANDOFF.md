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

_Updated 2026-10-13 evening._

### Done
- **App**: all 31 screens implemented (no placeholders), type-check clean, 75 Jest tests passing (engine, every
  screen with content + empty bank, full practice/exam/survival flows). Signed release APK builds (arm64 ≈24 MB).
- **States complete & verified** (facts with page + verbatim quote → `app/src/content/states/XX.json`, state
  questions → `app/src/content/questions/states/XX.json`): **CA** (48 facts, 101 car + 10 motorcycle),
  **TX** (50 facts, 97 car + 10 motorcycle). Verifiers caught real errors (e.g. TX crash-report rule repealed in 2017).
- **Universal car bank**: 747 questions in 13 topics, adversarially reviewed against ALL downloaded handbooks
  (non-universal rules removed/rewritten, answer-length giveaway removed, duplicates removed).
- **Signs**: 132 in-app (95 public-domain MUTCD + 37 app-drawn signals/markings/hand signals via
  `app/assets/signs-custom/generate.py`). Remaining MUTCD SVGs are still downloading (Wikimedia rate limits):
  rerun `python3 -I research/tools/fetch_signs.py "<repo>/research"` then `node app/scripts/build-signs.mjs`.
- **Lessons**: Road Test Guide (`app/src/content/lessons/car/road-test.json`).
- **Market research**: `research/notes/market.md`. **Play listing + policy answers**: `app/docs/play-store/listing.md`
  (target API 36 verified; 12 testers × 14 days closed test for new personal accounts).

### In progress
- `state-content-v2.js` for **FL, NY, PA, IL**; `bank-builder.js` for **motorcycle (7 topics) + CDL general knowledge**.

### Next steps (prioritized)
1. Remaining top-10 states: **OH, GA, NC, MI** (`tools/workflows/state-content-v2.js`).
2. Car lessons for the 13 topics (+ road-signs lesson), motorcycle + CDL lessons.
3. CDL modules: air brakes, combination, hazmat, tanker, doubles/triples, passenger, school bus (`bank-builder.js`).
4. Road-sign questions (~150, `sign` field) + image questions for signals/markings once all signs are downloaded.
5. On-device/emulator QA + Play screenshots (AVD `driveready36`, Android 16 arm64, created locally).
6. Host privacy policy, Play Console setup, closed test, production.
7. Remaining 41 states; then iOS (needs Xcode + iOS native module implementation).

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
