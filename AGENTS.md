# AGENTS.md — start here (any AI coding agent)

This repo is **DriveReady**: a free DMV knowledge-test prep app for all 50 US states + DC,
built with **React Native CLI (no Expo)**. Read this file, then `docs/HANDOFF.md` (full history,
current status, exact next steps), then the docs it links.

## The owner's requirements (non-negotiable)
- Every feature competitors paywall is **free**: all questions, exam simulator, marathon, mistakes
  review, signs, flashcards, cheat sheets, stats, read-aloud, dark mode. No ads, no account, offline.
- Cover **all 50 states + DC**, car + motorcycle + CDL. "Prepare the user 100%."
- **Android first → publish on Google Play → then iOS.**
- Priority right now: the **top 10 states end-to-end first** (CA, TX, FL, NY, PA, IL, OH, GA, NC, MI),
  then the remaining 41.
- Research competitor apps (DMV Genie, Zutobi, etc.) and add the best ideas.
- Content must be **accurate and sourced from official state handbooks** (never dmv.org or other prep apps).

## Repo layout
```
app/                      React Native 0.87 app (TypeScript)  ← the product
  src/data/               types.ts (content schema), bank/exams/states/tracks/signs/lessons loaders
  src/engine/             pure logic: quiz modes, scoring, SRS, pass-probability, achievements, dates
  src/store/              zustand stores (settings, progress, driveLog, session) + actions.ts flows
  src/components/         UI kit (+ components/quiz/* question card, timer, actions)
  src/screens/            all screens (see app/docs/APP_SPEC.md)
  src/content/            bundled content JSON (questions, states, lessons, signs) — GENERATED/curated
  src/native/             TurboModule spec + JS wrappers (TTS, haptics, reminders)
  android/                native Android; custom Java module in app/src/main/java/.../nativemodules
  scripts/                content tooling: build-content-index, validate-content, import-state-facts, build-signs
  docs/                   APP_SPEC.md (screens/behavior), CONTENT_GUIDE.md (content rules), play-store/, privacy-policy.html
  __tests__/              Jest (engine + app smoke tests; fixtures/content.ts)
research/
  handbooks/<XX>.txt      official handbook text per state (page-marked "=== PAGE n ===") + MOTORCYCLE.txt + CDL.txt
  facts/<XX>.json         verified state facts with verbatim quotes/pages (input to import-state-facts)
  signs/                  public-domain MUTCD SVGs (Wikimedia Commons) + manifests
  tools/                  extract_pdf.py, extract_html.py, find_quote.py, fetch_signs.py, ...
tools/workflows/          the multi-agent workflow scripts used to produce research/content (prompts included)
docs/HANDOFF.md           project log + status + next steps  ← read this
```

## Commands (run from `app/`; note the space in the path "DMV Test" — always quote paths)
```bash
npm install
npx tsc --noEmit                     # type-check (must be clean)
npx jest                             # tests (must pass)
node scripts/validate-content.mjs    # content integrity (must report 0 errors)
node scripts/build-content-index.mjs # after adding/removing content JSON files
node scripts/import-state-facts.mjs CA TX   # research/facts/XX.json -> src/content/states/XX.json
node scripts/build-signs.mjs [--png <dir>]  # research/signs + assets/{signs-custom,scenes,photos} -> src/content/signs/index.ts
node scripts/check-content-index.mjs        # index is current (CI runs this)
npm run content:release / content:publish   # OTA content update: dry run / upload to R2 (app/docs/CONTENT_UPDATES.md)
cd android && ./gradlew assembleDebug -PreactNativeArchitectures=arm64-v8a   # fast debug APK
cd android && ./gradlew bundleRelease          # Play AAB (needs android/keystore.properties — NOT in git)
```
Environment: Node 22, JDK 17, Android SDK at ~/Library/Android/sdk (build-tools 37, NDK 27.1). No full Xcode yet.

## Gotchas already discovered (save yourself time)
- RN 0.87 is edge-to-edge only: `StatusBar` has no `backgroundColor`/`translucent` props.
- ScrollView ref type: `useRef<React.ComponentRef<typeof ScrollView>>(null)`.
- `@testing-library/react-native` v14: `render()` and `fireEvent.*()` are **async** — always `await`.
  Needs the `test-renderer` package (installed).
- Jest maps `lucide-react-native` to its CJS build (see jest.config.js); AsyncStorage v3 mock is wired in jest.setup.js.
- AsyncStorage v3 API: `getItem/setItem/removeItem/getMany/setMany/removeMany` (no multiGet).
- JSX text does not process `’` escapes — type the real character (’) or use `{'’'}`.
- Custom native module = TurboModule via app-level codegen (`codegenConfig` in package.json,
  spec `src/native/specs/NativeDriveReady.ts`, Java impl `DriveReadyModule.java`). Use `TurboModuleRegistry.get` (nullable).
- Release builds use INTERNET **only** for content updates (`src/content/updates.ts`): anonymous HTTPS GETs of public
  files, no identifiers, no analytics. Keep it that way (privacy policy + Play "no data collected" depend on it).
  Updates are off until `CONTENT_BASE_URL` is set (app/docs/CONTENT_UPDATES.md).
- `react-native-svg` `SvgXml` ignores `<style>`: sign SVGs are pre-processed by `scripts/build-signs.mjs` (svgo).

## Engineering bar (the owner asked for "100M users" quality)
- **Offline-first, instant.** All content is bundled; nothing on screen waits for the network. Content
  updates (`src/content/updates.ts`) download in the background and apply on the next launch.
- **Never strand a user.** Boot must always finish: storage reads never throw (`src/store/storage.ts`
  backs up unreadable data to `<name>.corrupt`), failed hydration counts as finished, every persisted store
  has `migrate: keepPersisted` (zustand otherwise DISCARDS data on a version bump) — add real migrations there.
  A root `ErrorBoundary` turns render crashes into a recovery screen.
- **Fail closed on remote data.** Downloads are hash-verified, shape-validated, size-capped and committed
  atomically; unknown sign codes/topics are dropped, not rendered broken. Bundled content is the fallback.
- **Protect backups.** Android Auto Backup has a 25 MB per-app quota: re-downloadable data goes in its own
  database (`createAsyncStorage('content')`) excluded in `res/xml/*_rules.xml`.
- **Privacy by design.** No analytics/ads/trackers/accounts; crash data comes from Play Console vitals only.
- **Every user-visible string** goes through `defineStrings(en, es)` (see app/docs/TRANSLATION.md).
- **Gates (CI on every push, `.github/workflows/ci.yml`):** `tsc`, `jest`, `validate-content`,
  `check-content-index` (index current: files exist, SHA-256 match), signer self-test. Run them before committing.
- npm resolution is pinned by `app/.npmrc` (`legacy-peer-deps=true`); the lockfile depends on it.

## Content rules (summary — full rules in app/docs/CONTENT_GUIDE.md)
- Universal questions must be true in **every** state; anything numeric that varies by state goes in
  `src/content/questions/states/<XX>.json` with `"states": ["XX"]`.
- One defensible answer, plausible distractors, original wording, explanation states the rule.
- Question `id`s are permanent (progress is keyed by them) — never renumber or reuse.
- Only teach facts whose status is verified/corrected (import script drops "unverified").

## Secrets
`app/android/keystore.properties` + `app/android/keystores/driveready-upload.keystore` are the Google Play
**upload key**. They are git-ignored and must never be committed. The owner keeps a backup.
