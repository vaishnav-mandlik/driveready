export const meta = {
  name: 'app-screens',
  description: 'Implement all app screens in parallel groups against the shared foundation + spec, with tests; then adversarial code review and fixes per group',
  phases: [
    { title: 'Implement', detail: 'one agent per screen group, with Jest tests' },
    { title: 'Review', detail: 'adversarial code review + fixes per group' },
  ],
}

const APP = '/Users/vaishnav/Desktop/DMV Test/app'

const GROUPS = [
  { key: 'onboarding-settings', area: 'onboarding+settings', folders: ['src/screens/onboarding', 'src/screens/settings'], screens: 'Welcome, PickState, PickTrack, Goal, Settings, About, Sources, Privacy', extra: 'The onboarding flow must be delightful and fast (3 taps to start). Settings must apply instantly (theme, text size) and reminder scheduling must handle permission denial gracefully.' },
  { key: 'quiz', area: 'quiz', folders: ['src/screens/quiz', 'src/components/quiz'], screens: 'ExamIntro, Quiz, Results, Review, QuestionDetail (plus a shared QuestionCard component in src/components/quiz/ that Review and QuestionDetail reuse)', extra: 'This is the heart of the app. Handle every mode in src/engine/quiz.ts (practice, exam, marathon incl. resume, mistakes, bookmarks, due, hardest, signs, daily, survival with lives, speed with 120s timer, custom). Timer must use timestamps (not interval counting) so it is accurate in the background. Intercept hardware back / gesture with a confirm (usePreventRemove from @react-navigation/native or beforeRemove listener). Never double-record answers. Results must work for every mode. Write thorough tests: answering in practice mode records stats; exam mode defers recording and submits; survival ends at 0 lives; results show pass/fail.' },
  { key: 'home-practice', area: 'home+practice', folders: ['src/screens/home', 'src/screens/practice'], screens: 'Home, StudyPlan, Practice, Topic, QuestionList, Search', extra: 'Home is the first impression: a premium dashboard (readiness ring hero, today/streak, continue, quick actions grid, countdown, question of the day). Use poolSize() for mode counts; memoize heavy computations.' },
  { key: 'signs', area: 'signs', folders: ['src/screens/signs', 'src/components/signs'], screens: 'Signs, SignDetail, Flashcards', extra: 'The sign registry currently has only 2 placeholder signs; the real library (~180 signs incl. signals/markings) lands later with the same SignInfo shape — build for 200+ items (FlatList grid, category chips from SIGN_CATEGORIES via signsByCategory()). Flashcard flip with Animated (rotateY + backfaceVisibility) and swipe-free buttons for accessibility.' },
  { key: 'learn', area: 'learn', folders: ['src/screens/learn', 'src/components/learn'], screens: 'Learn, Lesson, CheatSheet, ExamInfo', extra: 'Lessons render every LessonBlock type beautifully (tables, steps, tips, warnings, signs). CheatSheet must show sources (page + verbatim quote) because Google Play requires official sources for government-related info.' },
  { key: 'progress-drivelog', area: 'progress+drivelog', folders: ['src/screens/progress', 'src/screens/drivelog'], screens: 'Progress, ExamHistory, Achievements, DriveLog, DriveEntry', extra: 'Charts via BarChart/ProgressRing. Driving log reads the requirement from the state fact supervised_driving_hours with requirementFromFact (src/store/driveLog.ts), supports edit/delete/export (Share with driveLogCsv).' },
]

const SUMMARY = {
  type: 'object',
  properties: {
    filesCreatedOrChanged: { type: 'array', items: { type: 'string' } },
    testsAdded: { type: 'integer' },
    testsPassing: { type: 'boolean' },
    tscErrorsInMyFiles: { type: 'integer' },
    sharedChangesNeeded: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['filesCreatedOrChanged', 'testsAdded', 'testsPassing', 'tscErrorsInMyFiles', 'sharedChangesNeeded', 'notes'],
}
const REVIEW = {
  type: 'object',
  properties: {
    bugsFound: { type: 'array', items: { type: 'string' } },
    fixed: { type: 'integer' },
    testsPassing: { type: 'boolean' },
    tscErrorsInGroup: { type: 'integer' },
    sharedChangesNeeded: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['bugsFound', 'fixed', 'testsPassing', 'tscErrorsInGroup', 'sharedChangesNeeded', 'notes'],
}

const OWNERSHIP = (g) => [
  'File ownership (several agents work in this repo at the same time):',
  '- You may create/edit ONLY: files under ' + g.folders.map(f => '"' + APP + '/' + f + '/"').join(', ') + ' and tests under "' + APP + '/__tests__/screens/' + g.key + '/".',
  '- Do NOT edit shared code (src/components/*.tsx at top level, src/engine, src/store, src/data, src/hooks, src/navigation, src/native, src/theme, App.tsx, package.json) or other groups\' folders. If you truly need a shared change, implement a local helper in your folder instead, and describe the shared change in sharedChangesNeeded (exact file + change).',
  '- Do not install packages. Do not touch android/ or ios/. Do not run gradle.',
  '- `npx tsc --noEmit` checks the whole repo; other agents\' in-progress files may have errors — fix only errors in your files.',
  '- Paths contain a space ("DMV Test"): double-quote paths in shell commands.',
].join('\n')

function implementPrompt(g) {
  return [
    'You are a senior React Native engineer building part of "DriveReady", a free DMV practice-test app (React Native 0.87 CLI, TypeScript, React 19, React Navigation 7 native-stack + bottom-tabs, zustand, react-native-svg, lucide icons). Android first.',
    '',
    'Read first: "' + APP + '/docs/APP_SPEC.md" (product spec + design rules + testing rules), then the foundation code it lists (types, hooks, data, engine, stores, components, navigation types). If "' + APP + '/../research/notes/market.md" exists, skim it for competitor UX insights relevant to your screens.',
    'Your group: ' + g.area + ' — implement these screens fully (replace the placeholders): ' + g.screens + '.',
    g.extra,
    '',
    OWNERSHIP(g),
    '',
    'Quality bar: production-ready, premium-feeling UI in light AND dark mode, accessible, no crashes on empty data (content banks may be empty), typed (no `any` except in tests), small focused components, memoized derived data, consistent with the existing UI kit.',
    'Tests: write Jest tests per APP_SPEC "Testing" section for each screen (render with data, empty state, main interaction). Run: cd "' + APP + '" && npx jest __tests__/screens/' + g.key + ' --maxWorkers=2 — all must pass. Then npx tsc --noEmit — 0 errors in your files.',
    'Return the summary.',
  ].join('\n')
}

function reviewPrompt(g, impl) {
  return [
    'You are an adversarial senior reviewer for the "' + g.area + '" screens of DriveReady (React Native 0.87, TypeScript). Another engineer just implemented: ' + g.screens + '. Their report: ' + JSON.stringify(impl || {}).slice(0, 3000),
    '',
    'Read "' + APP + '/docs/APP_SPEC.md" and the foundation code, then the implementation. Assume there are bugs and find them:',
    '- Runtime crashes: undefined access on empty banks/missing state info, missing sessions (e.g. Results opened after app restart), division by zero, NaN %, keys.',
    '- Logic bugs vs the engine/store contracts (src/engine/quiz.ts, src/store/actions.ts, src/store/progress.ts): double-recording answers, wrong answer-index mapping when choices are shuffled (session.orders maps display -> original index), stale closures in timers, effects that run twice, missing cleanup, navigation params mismatches.',
    '- Spec gaps: missing features/states listed in APP_SPEC for these screens — implement them.',
    '- UX/a11y: missing accessibilityLabel/role, color-only signals, text clipping at large textScale, dark-mode colors hard-coded, poor empty states, inconsistent spacing.',
    '- Performance: unmemoized whole-bank loops on render, ScrollView for long lists instead of FlatList.',
    'Fix every real issue you find directly in the group\'s files (and add/repair tests). ' ,
    OWNERSHIP(g),
    '',
    'Finish with: cd "' + APP + '" && npx jest __tests__/screens/' + g.key + ' --maxWorkers=2 (all pass) and npx tsc --noEmit (0 errors in this group\'s files). Return the review summary listing concrete bugs found (file:line — problem — fix).',
  ].join('\n')
}

const results = await pipeline(
  GROUPS,
  g => agent(implementPrompt(g), { label: 'build:' + g.key, phase: 'Implement', schema: SUMMARY }),
  (impl, g) => agent(reviewPrompt(g, impl), { label: 'review:' + g.key, phase: 'Review', schema: REVIEW }).then(r => ({ impl, r })),
)
return results.map((x, i) => ({
  group: GROUPS[i].key,
  impl: x && x.impl && { files: x.impl.filesCreatedOrChanged.length, tests: x.impl.testsAdded, passing: x.impl.testsPassing, shared: x.impl.sharedChangesNeeded, notes: x.impl.notes.slice(0, 500) },
  review: x && x.r && { bugs: x.r.bugsFound.slice(0, 15), fixed: x.r.fixed, passing: x.r.testsPassing, tsc: x.r.tscErrorsInGroup, shared: x.r.sharedChangesNeeded, notes: x.r.notes.slice(0, 500) },
}))
