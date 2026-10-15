# DriveReady — app spec (screens & behavior)

Free DMV knowledge-test prep for all 50 states + DC. **Everything competitors charge for is free**:
every question, exam simulator, marathon, mistakes review, road-sign library, flashcards, cheat
sheets, stats, read-aloud, dark mode — no ads, no account, no paywall, fully offline.
Android first (iOS later from the same code).

## Architecture you build on (read these files before coding)

| Area | Files |
|---|---|
| Types | `src/data/types.ts` |
| Learner context | `src/hooks/useLearner.ts` → `useLearner()` (state, track, bank, exams, stateInfo), `useReadiness()` |
| Content access | `src/data/bank.ts` (`getBank`, `searchBank`, `resolveIds`), `src/data/exams.ts`, `src/data/states.ts` (`STATE_LIST`, `getStateInfo`, `hasResearchedData`), `src/data/tracks.ts` (`TRACKS`, `getTrack`, `getTopic`, `topicTitle`), `src/data/signs.ts`, `src/data/lessons.ts`, `src/data/factMeta.ts` |
| Engine (pure) | `src/engine/quiz.ts` (modes, `buildSession`, `scoreSession`, `examDecided`, `poolSize`), `readiness.ts`, `srs.ts` (`isMistake`, `isDue`, `isMastered`), `achievements.ts`, `stats.ts`, `dates.ts` |
| Stores (zustand, persisted) | `src/store/settings.ts`, `progress.ts`, `driveLog.ts`; in-memory `session.ts`; flows in `actions.ts` (`startSession`, `recordInstantAnswer`, `finishSession`, `checkAchievements`) |
| Native | `src/native/index.ts`: `haptic(kind)`, `speech.speak/stop/available`, `reminders.schedule/cancel`, `ensureNotificationPermission` |
| UI kit | `src/components/index.ts` — **use these**, don't restyle from scratch: `Screen`, `Text`, `Card`, `Button`, `IconButton`, `Icon` (names in `Icon.tsx` ICONS), `ListRow`, `ToggleRow`, `IconTile`, `SectionHeader`, `Divider`, `ProgressBar`, `ProgressRing`, `Chip`, `Badge`, `StatTile`, `EmptyState`, `SegmentedControl`, `LargeHeader`, `BarChart`, `ChoiceButton`, `SignImage`, `Confetti` |
| Theme | `useTheme()` → `colors`, `spacing`, `radius`, `dark`, `textScale`; tokens in `src/theme/tokens.ts` |
| Navigation | `src/navigation/types.ts` (`RootScreenProps<'X'>`, `TabScreenProps<'X'>`), `RootNavigator.tsx` |

Starting a quiz from anywhere: `navigation.navigate('Quiz', {spec: {mode: 'practice', topic}})`.
`QuizScreen` calls `startSession(spec)` itself.

## Design rules

- Premium, calm, modern: generous spacing (`spacing.lg` page padding, `spacing.md` between cards),
  rounded cards (`radius.lg`), clear hierarchy (one primary action per screen), soft tinted icon tiles,
  progress rings/bars for anything measurable. Light **and** dark mode must both look right — only use
  theme colors (never hard-code colors except sign artwork and pure white text on colored buttons).
- Tab screens: `<Screen edges={['top']}>` + `LargeHeader`. Stack screens: native header (title set in
  `RootNavigator` or via `navigation.setOptions`), `<Screen>` with default edges.
- Respect `textScale` (the `Text` component does it). Never fix heights that would clip larger text.
- Accessibility: every pressable has `accessibilityRole`/`accessibilityLabel`; headers use
  `accessibilityRole="header"`; color is never the only signal (icons/text accompany right/wrong).
- Empty states everywhere (no questions yet, no mistakes, no history) using `EmptyState` — the bank can
  be empty for a state/track while content is being produced; nothing may crash on empty data.
- Haptics: `haptic('success'|'error'|'selection')` on answers and key actions (the Button/Card/ListRow
  components already tap).
- Performance: use `FlatList`/`SectionList` for long lists (states, questions, signs, history); memoize
  derived data with `useMemo`; never iterate the whole bank on every render without memoization.
- No network calls except anonymous content-update downloads (src/content/updates.ts, off until CONTENT_BASE_URL is set). External links (official handbook/agency site) open with `Linking.openURL` after
  `Alert` confirmation ("Opens your browser").
- Copy tone: encouraging, clear, short. Never imply government affiliation.

## Screens

### Onboarding (no header) — `screens/onboarding/`
1. **Welcome** — brand hero (app name "DriveReady", tagline "Pass your DMV test the first time — 100% free"),
   3 value bullets (every question free; real exam simulator for your state; works offline, no account),
   primary button "Get started" → PickState. Small print: "Not affiliated with any government agency."
2. **PickState** (`mode: 'onboarding' | 'change'`) — searchable list of all 51 jurisdictions
   (`STATE_LIST`), current selection checked. Tap → `settings.update({state})`; onboarding → PickTrack,
   change → goBack. Show a subtle "Exam format verified" chip for states where `hasResearchedData(code)`.
3. **PickTrack** — 3 big cards from `TRACKS` (Car / Motorcycle / Commercial CDL) with icon, license
   name, description. onboarding → Goal; change → goBack.
4. **Goal** — optional test date (simple +/- day stepper or quick picks: "In 1 week / 2 weeks / 1 month /
   Not sure"), daily goal (10/20/30/50 questions, `SegmentedControl`), optional study reminder toggle
   (calls `reminders.schedule(hour, minute, title, body)`; if permission denied show a gentle note),
   optional first name. "Start studying" → `completeOnboarding()` (navigator switches to Tabs). In
   `change` mode: Save → goBack.

### Home tab — `screens/home/HomeScreen.tsx`
- Header: greeting ("Good evening, Sam"), state + track chip (tap → PickState change), settings gear → Settings.
- **Readiness card** (hero): `ProgressRing` with pass probability %, label (e.g. "Almost ready"),
  "x of y questions practiced", CTA "Take a practice exam" → ExamIntro. If `exam.notes` mention
  unverified format, show nothing scary — just the numbers.
- **Today**: daily goal progress (answered today / goal) + streak flame with count.
- **Continue**: resume marathon if one is saved (`progress.marathons`), else "Practice weakest topic:
  <topic>" from readiness.weakest.
- **Quick actions grid** (2 columns): Practice test, Exam simulator, Mistakes (count badge), Road signs
  quiz, Daily challenge (done ✓ if completed today), Survival, Speed round, Flashcards.
- **Exam countdown** if `examDate` set ("Test in 12 days" + suggested daily target).
- **Question of the day** card (deterministic by date: `daily` mode seed) — tap → QuestionDetail.
- Footer links: State cheat sheet, Driving log (car track only, if state has a supervised-hours fact).
- `StudyPlanScreen`: day-by-day plan until exam date (or 14 days): which topics each day, target
  questions/day computed from remaining unseen + mistakes; checkmarks for days already met.

### Practice tab — `screens/practice/`
- **Practice**: `LargeHeader` ("Practice", subtitle state · track), search icon → Search.
  Mode cards: Practice Test (20 adaptive), Exam Simulator, Marathon (all N; resume if saved),
  Mistakes (count; disabled if 0), Smart Review (due count), Saved (bookmarks count), Hardest,
  Road Signs quiz, Daily Challenge, Survival (3 lives; personal best), Speed Round (2 min; personal best).
  Then **Topics** list for the track: icon tile, title, "answered x/y · 82%", mastery `ProgressBar` → Topic.
  For CDL show each module with its own exam format.
- **Topic**: topic header (icon, description), stats (seen, accuracy, mastered), buttons: Practice 10 /
  20 / All, Marathon this topic, Mistakes in topic, "Read lesson" (if a lesson exists for the topic),
  "Topic exam" for CDL modules. List preview of a few question prompts.
- **QuestionList** (`kind: 'bookmarks' | 'mistakes'`): list of questions (prompt, topic chip, sign
  thumbnail if any, accuracy) → QuestionDetail; header action "Practice these" → Quiz custom/mistakes/bookmarks mode.
  Swipe or button to remove bookmark. Empty states.
- **Search**: text input, results from `searchBank` (debounced), tap → QuestionDetail.

### Quiz flow — `screens/quiz/` (the heart of the app; must feel fast and polished)
- **ExamIntro** (`examId?`): exam title, big numbers (questions, passing score/% , time limit if any),
  format notes + "Official source" link (`exam.sourceUrl`), toggles (timer on/off → `settings.examTimer`;
  "End when result is decided" → `settings.realisticExam`), CDL: list of module exams to choose from.
  Start → Quiz `{mode: 'exam', examId}`. Show last 3 attempts for this exam.
- **Quiz** (`spec`): `startSession(spec)` once (useState initializer). Header: title + progress
  "7 / 25", close (X) with confirm dialog (exam: "Leave exam? Progress will be lost"; marathon: progress
  is saved). Top: `ProgressBar`; timer for timed sessions (exam with time limit, speed round);
  lives (hearts) for survival.
  Body: optional `SignImage` (size ~150, `accessibilityLabel=''` when the question asks what the sign
  means), prompt (`variant="heading"`), choices (`ChoiceButton`, display order from `session.orders`).
  - Instant modes: on tap → lock answer, `recordInstantAnswer`, haptic success/error, reveal correct
    (state correct/incorrect/missed/dimmed), show explanation card (with `ref` small text) + "Next"
    button; `autoAdvance` setting → advance after ~900 ms when correct. Survival: wrong answer loses a
    life; 0 lives → finish. Speed round: no explanation (instant next), timer ends the run.
  - Exam mode: select (state `selected`), can change answer, "Next"/"Previous", question navigator
    sheet (grid of numbers showing answered/unanswered), "Submit" with confirm if unanswered remain. If
    `realisticExam`, after each answer check `examDecided` → finish early. Timer hits 0 → finish (`timedOut`).
  - Each question: bookmark toggle (`progress.toggleBookmark`), read-aloud button (`speech.speak(prompt +
    choices)`), "Report a problem" (mailto: support@driveready.app with question id; via Linking).
  - Finish → `finishSession(session, {endedEarly, timedOut})` → `navigation.replace('Results', {sessionId})`.
  - Android back button/gesture must trigger the same leave-confirm.
- **Results** (`sessionId` → `getSession`): big pass/fail hero for exams (Confetti on pass), score ring,
  correct/wrong/skipped, time, per-topic breakdown bars, new achievements unlocked (cards), personal best
  (survival/speed), buttons: Review answers → Review, Retry wrong answers (custom mode with wrongIds),
  New test (same spec), Done (→ Tabs). Share score (React Native `Share`, text only).
- **Review** (`sessionId`, filter all/wrong): list/pager of every question with user's answer vs
  correct, explanation, bookmark toggle. Filter chips All / Wrong / Correct.
- **QuestionDetail** (`id`): single question card with answer revealed on tap ("Show answer"),
  explanation, stats for this question, bookmark, read aloud, report.

### Signs tab — `screens/signs/`
- **Signs**: `LargeHeader` + search field; top cards: "Signs quiz" (→ Quiz signs mode), "Flashcards"
  (→ Flashcards), "Shapes & colors" mini-guide (expandable card explaining octagon/triangle/diamond/
  pentagon/circle/pennant/crossbuck and color meanings). Category chips filter; grid (3 columns) of
  `SignImage` tiles with names → SignDetail. Known-level dot from `progress.signLevels`.
- **SignDetail**: large sign, name, category chip, meaning, shape/colors, "What to do" emphasis, related
  questions (questions whose `sign` equals code) → QuestionDetail, prev/next sign navigation.
- **Flashcards** (`category?`): card stack — front = sign, back = name + meaning (flip animation with
  `Animated`, tap to flip), buttons "Still learning" / "Got it" (sets `signLevels`), progress "12 / 80",
  shuffle, filter to "only ones I'm learning". End screen with summary.

### Learn tab — `screens/learn/`
- **Learn**: `LargeHeader` ("Learn", `<State> <track>`), hero card for **State Cheat Sheet** (key numbers
  preview: up to 4 facts from `KEY_NUMBER_FACTS`) → CheatSheet; **About your test** → ExamInfo;
  **Lessons** list for the track (`getLessons(track)`) with minutes + read check (`progress.lessonsRead`);
  **Road test guide** lesson if present (topic `road-test`); **Official resources** (handbook link,
  agency website, official practice tests) with external-link confirm; Driving log entry (car).
- **Lesson** (`lessonId`): title, minutes, sections rendering every block type (`p`, `bullets`, `steps`
  (numbered), `tip` (tinted card with lightbulb), `warning` (tinted warning card), `sign`/`signs`
  (SignImage with caption), `table` (2-col rows)), key points box at the end, "Mark as read"
  (auto-mark when scrolled to bottom), "Practice this topic" → Quiz practice with topic, read-aloud of
  the section text.
- **CheatSheet**: `groupFacts(stateInfo.facts)` sections; each fact: label, big value, detail, source
  ("Handbook p. 34" → tap shows the verbatim quote in an Alert and offers to open the source URL).
  Header note: "Verified against the official <handbook title> (<edition>) on <verifiedOn>". Notable laws
  section. If no facts: EmptyState explaining facts for this state are coming soon + link to official handbook.
- **ExamInfo**: exam format (questions, passing score, time, signs section, languages, retest wait,
  format), notes, test-day checklist (generic: bring permit/ID documents per your agency, arrive early,
  eye test, fees — "check your agency"), tips for the test, official links.

### Progress tab — `screens/progress/`
- **Progress**: `LargeHeader`; stat tiles row (questions answered, accuracy, study time, best streak);
  readiness ring + label; 14-day activity `BarChart`; topic mastery list (bars, tap → Topic);
  exam history preview (last 3, pass/fail chips) → ExamHistory; achievements preview (unlocked count +
  6 badges) → Achievements; links: Mistakes, Saved questions, Driving log.
- **ExamHistory**: list of `progress.exams` (date, title, score, pass/fail, duration, ended early/timed
  out) — tap → Review if session still in memory, else show stored per-topic breakdown in an expandable row.
  Simple line of last 10 scores (BarChart is fine).
- **Achievements**: grid of all `ACHIEVEMENTS` with tier color (bronze/silver/gold), locked state with
  progress bar (`progress` fn), unlocked date.

### Driving log — `screens/drivelog/` (car track; teen permit holders)
- **DriveLog**: requirement from state fact `supervised_driving_hours` via `requirementFromFact`
  (override editable), progress rings for total hours and night hours, list of drives (date, duration,
  night portion, conditions chips, supervisor), add button → DriveEntry, edit on tap, delete with confirm,
  "Export / share log" (React Native `Share` with `driveLogCsv`). Disclaimer: "Your state may require an
  official log form — check your agency."
- **DriveEntry** (`id?`): form — date (quick buttons Today/Yesterday + stepper), duration (hours/minutes
  steppers), night minutes, conditions (multi-select chips from `DRIVE_CONDITIONS`), supervisor name,
  notes; Save/Delete.

### Settings — `screens/settings/`
- **Settings**: sections — *Your test*: state (→ PickState change), license type (→ PickTrack change),
  goals & test date (→ Goal change). *Study*: shuffle answers, auto-advance, exam timer, realistic exam
  ending, daily reminder toggle + time (hour/minute stepper or quick picks; schedule/cancel via
  `reminders`), read-aloud speed (SegmentedControl 0.8/1.0/1.2). *Appearance*: theme
  (System/Light/Dark), text size (Default/Large/Extra large = 1/1.15/1.3), haptics. *Data*: reset
  progress (double confirm), reset driving log. *About*: About, Official sources, Privacy policy, Rate
  the app (Play Store link), Send feedback (mailto), version.
- **About**: mission ("Every feature free, forever"), what's included, disclaimer: "DriveReady is an
  independent study app. It is not affiliated with, endorsed by, or connected to any state DMV or
  government agency. Always confirm requirements with your state's official driver handbook.";
  credits: road-sign artwork is public-domain MUTCD artwork; open-source licenses note.
- **Sources**: for the selected state: agency, handbook title/edition with link, official site, the
  verification date; plus general sources (MUTCD, MSF Motorcycle Operator Manual, AAMVA CDL manual,
  FMCSA). Google Play requires official source links for government-related info — make them prominent.
- **Privacy**: plain-language policy: no account, no ads, no analytics, no data collection; all progress
  stored only on the device; notifications only if enabled; contact email.

## Testing (required for every screen you build)
- Tests live in `__tests__/screens/<area>/<Name>.test.tsx`. Use `__tests__/utils/render.tsx`
  (`renderWithProviders`, `mockNav`, `setLearner`) and mock content with
  `jest.mock('../../../src/content', () => require('../../fixtures/content'))` (path relative to the test).
- `@testing-library/react-native` v14: `render`, `fireEvent.press`, `fireEvent.changeText` return
  Promises — always `await` them. Use `screen.findByText` / `getByRole`.
- At minimum: renders with data, renders empty state, main interaction works (e.g. answering a question
  updates UI and the progress store).
- Run only your tests: `npx jest __tests__/screens/<area> --maxWorkers=2`. Type-check at the end:
  `npx tsc --noEmit`.
