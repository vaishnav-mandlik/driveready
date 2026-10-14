# DriveReady — project log & handoff

_Last updated: 2026-10-14 evening (America/Phoenix). Keep this file current: it is how the next agent (human or AI)
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
6. "again push all.. uptodate.."
7. On release items (privacy URL, support email, app name): "i will do later ... first complete all app end to
   end.. all things.. to prepare user for test must get pass", "can add later.. comment need to add.. i will
   create later", "will add some diff name.. also dont build now will do once all done.. complete add all
   things.. first" → no builds/release work until content is complete; placeholders carry `TODO(owner)`.
8. "continue.. do all.. all things .. all images.. kinda all that other top app.. do all" → full sign library
   with questions for every sign, illustrated driving-scenario pictures (like Zutobi/DMV Genie), Spanish.
9. "must need all image all thing end to end user must get confident to pass.. premium all question that occurs
   in real test.." → real-test coverage audits against official sample questions; images everywhere.
10. "no need to create own again that image use already created high quality things by other apps.." → stop
   drawing new scenes; use openly licensed real photos / public-domain government art (never competitor images,
   which are copyrighted), credited in Official sources → Image credits.

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

_Updated 2026-10-14 (evening)._

### Done
- **App**: 32 screens, 123 Jest tests (engine, i18n, every screen in English and Spanish, App-level e2e).
  No builds since the owner's "don't build now".
- **33 states live & verified** (facts with page + verbatim quote checked by an independent verifier, often
  against current statutes; ~100-115 state questions each): CA TX FL NY PA IL OH GA NC MI · WA MA TN IN MO ·
  NJ VA AZ MD MN · WI CO SC AL LA KY · OR OK CT UT · IA NV KS. Sectioned exams: NY IL GA NC VA WI
  (`research/facts/exam-sections.json`). Verifiers regularly find handbooks that lag the law (IA teen phone ban
  repealed 2025, KS refusal penalties, NV marijuana per se limit) and key questions to current law.
- **Banks**: car ~1,120 universal (incl. 256 sign/signal/marking image questions + 84 scenario-picture
  questions), motorcycle 305, CDL 824, all independently reviewed. **Lessons** 30, illustrated.
- **Images**: 228 signs in the library (public-domain MUTCD + app-drawn signals/markings/hand signals), every
  sign has questions; 52 app-drawn scenes (car 40, motorcycle 6, CDL 6) used in questions and lessons. Photo
  support (WebP + credits) and a `hazmat` category are in place.
- **Spanish**: whole UI translated and reviewed; content translation infrastructure ready (glossary from the
  official CA/TX/FL/NY Spanish handbooks: `research/notes/glossary-es.md`); content translation not started
  (a partial, unreviewed attempt is parked outside the repo).

### In progress (background agents; Workflow tool was unavailable, so plain agents ≤4 at a time)
- Arkansas author (then verifier).
- Real-world photos from Wikimedia Commons (PD/CC0/CC BY/CC BY-SA, US roads only) → `app/assets/photos/`,
  questions in `car/photos-real-world.json`.
- DOT hazmat placards (public domain) → `research/signs/svg-hazmat/`, questions `cdl/cdl-hazmat-placards.json`.
- Real-test coverage audit, Pennsylvania (official sample questions → `research/official-samples/`, gaps filled
  in `states/PA.json` and `car/coverage-pa.json`).

### Next steps (prioritized)
1. Coverage audits for other states with official sample questions in their handbooks: TN MT WI UT · KS IN CT
   IL FL OR · MD MI VA AK KY NE TX SC AL, plus the motorcycle "Test Yourself" and CDL review questions.
2. Remaining 16 jurisdictions (`state-content-v2.js` prompts; extract with the stub runner described in
   tools/workflows/README.md if Workflow is unavailable): AR (running) · MS NM NE ID · WV HI NH ME · MT RI DE SD ·
   ND AK DC VT · WY. Keep in-progress states out of the index: `EXCLUDE_STATES=XX node scripts/build-content-index.mjs`.
3. Spanish content (`content-i18n.js` jobs or agents): universal questions, lessons, signs, then states.
4. Independent review of the motorcycle/CDL scenario questions written in the main session.
5. One consolidated on-device check (debug build) of photos, scenes and Spanish — only when the owner allows builds.
6. Owner items before publishing (only with the owner): app name/package id, support email, privacy-policy
   hosting, screenshots, AAB, Play Console, 12-tester closed test. Then iOS (needs Xcode).

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
