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
11. Backend: asked for options at 100k MAU; chose **B — Cloudflare R2 for content updates** (≈$1/month for the
   domain; Supabase only later if accounts/sync/leaderboards are wanted). Asked whether premium questions for
   ~$9 are possible later without an account → yes, Google Play Billing one-time purchase tied to the Google
   account (15% fee); not built.
12. "work as senior android engineer.. like building this app for 100M users.. all insane" → the engineering bar
   in AGENTS.md (offline-first, never strand a user, fail-closed updates, backup quota, CI gates).

## 2. Key decisions (and why)

| Decision | Why |
|---|---|
| App name **DriveReady**, package `com.driveready.app` | Neutral, not implying government affiliation. Package id is permanent once published — change it *before* the first Play upload if desired (`android/app/build.gradle` `applicationId`/`namespace`, Java/Kotlin package dirs). |
| React Native **0.87.1** (latest), React 19.2, new architecture only | Latest stable on 2026-10-13; builds cleanly with the cached Gradle 9.4.1. |
| Minimal native deps: navigation (native-stack + bottom-tabs), screens, safe-area, svg, AsyncStorage v3, zustand, lucide icons | Reliability (fewer native build risks) and small APK. Animations use RN `Animated`. |
| **Custom TurboModule** (Java) for read-aloud (Android TextToSpeech), haptics (performHapticFeedback, no VIBRATE permission) and daily reminders (inexact `setAndAllowWhileIdle` alarms + boot receiver) | Third-party TTS/notification libs were unmaintained or heavy; this needs no exact-alarm permission. |
| Content updates over the air from **Cloudflare R2** (owner's choice, 2026-10-14) | Same-day question fixes without a Play release; app stays offline-first (bundled content is the fallback). INTERNET is used only for anonymous HTTPS GETs of public files, so "no data collected" still holds. Off until `CONTENT_BASE_URL` is set (app/docs/CONTENT_UPDATES.md). |
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
- **34 states live & verified** (+ AR) (facts with page + verbatim quote checked by an independent verifier, often
  against current statutes; ~100-115 state questions each): CA TX FL NY PA IL OH GA NC MI · WA MA TN IN MO ·
  NJ VA AZ MD MN · WI CO SC AL LA KY · OR OK CT UT · IA NV KS. Sectioned exams: NY IL GA NC VA WI
  (`research/facts/exam-sections.json`). Verifiers regularly find handbooks that lag the law (IA teen phone ban
  repealed 2025, KS refusal penalties, NV marijuana per se limit) and key questions to current law.
- **Banks**: car ~1,120 universal (incl. 256 sign/signal/marking image questions + 84 scenario-picture
  questions), motorcycle 305, CDL 824, all independently reviewed. **Lessons** 30, illustrated.
- **Real photos & placards (2026-10-15)**: 25 openly licensed US photos (Commons; credited in Official sources)
  with 31 questions; 21 public-domain DOT hazmat placards (new library category) with 28 CDL questions.
- **Real-test coverage audits**: PA, TN, WI, UT official sample questions (273) mapped to the bank; 52 gap
  questions added; no official key contradicted the app (research/official-samples/).
- **Images**: 228 signs in the library (public-domain MUTCD + app-drawn signals/markings/hand signals), every
  sign has questions; 52 app-drawn scenes (car 40, motorcycle 6, CDL 6) used in questions and lessons. Photo
  support (WebP + credits) and a `hazmat` category are in place.
- **Spanish**: whole UI translated and reviewed; content translation infrastructure ready (glossary from the
  official CA/TX/FL/NY Spanish handbooks: `research/notes/glossary-es.md`); content translation not started
  (a partial, unreviewed attempt is parked outside the repo).

- **Engineering (2026-10-15):** OTA content updates via Cloudflare R2 (hash-verified, atomic, offline-first;
  off until `CONTENT_BASE_URL` is set — app/docs/CONTENT_UPDATES.md); fail-safe persisted storage (corrupted
  data can't hang boot; version bumps keep progress); root ErrorBoundary; content cache excluded from Auto
  Backup; GitHub Actions CI (tsc, jest, content validation, index integrity, signer self-test); `app/.npmrc`
  pins peer resolution (CI found the lockfile depended on a global setting). 141 tests.

### In progress (background agents, ≤4 at a time; Workflow tool unavailable → plain agents with prompts from tools/workflows/extract-prompts.mjs)
- States: Mississippi (verifier), New Mexico (author), Nebraska (author).
- Real-test coverage audit: Kansas, Indiana, Connecticut, Illinois.

### Next steps (prioritized)
1. Remaining real-test coverage audits (`tools/workflows/coverage-audit.js`; done: PA, TN, WI, UT): FL OR MD MI ·
   VA KY TX SC AL · then MT, NE, AK when those states are added; CDL review questions.
   Independent review of the 84 image questions written without a separate reviewer (photos-real-world,
   cdl-hazmat-placards, mc-scenarios, cdl-scenarios).
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
