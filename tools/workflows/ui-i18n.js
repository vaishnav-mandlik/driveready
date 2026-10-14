export const meta = {
  name: 'ui-i18n',
  description: 'Move every user-visible UI string into defineStrings(en, es) tables with natural Spanish, one agent per file group, then an independent bilingual code review per group',
  phases: [
    { title: 'Convert', detail: 'English strings -> defineStrings tables + Spanish' },
    { title: 'Review', detail: 'coverage, Spanish quality, no behavior change; fix' },
  ],
}

// args: {groups: [{key, files: [...]}]}  (paths relative to app/)
const APP = '/Users/vaishnav/Desktop/DMV Test/app'
const GROUPS = (args && args.groups) || []
const ALL = GROUPS.flatMap(g => g.files)

const SUMMARY = {
  type: 'object',
  properties: {
    filesDone: { type: 'array', items: { type: 'string' } },
    stringsConverted: { type: 'integer' },
    tsc: { type: 'string', description: 'clean, or the remaining errors in YOUR files' },
    jest: { type: 'string', description: 'e.g. 91 passed' },
    issues: { type: 'array', items: { type: 'string' } },
  },
  required: ['filesDone', 'stringsConverted', 'tsc', 'jest', 'issues'],
}

const COMMON = g => [
  'App: "' + APP + '" (React Native, TypeScript). Paths contain a space: double-quote them in shell commands.',
  'Read first: "' + APP + '/docs/TRANSLATION.md" section 1 (UI strings) and the "UI terms" table — use those Spanish terms consistently. Reference implementation: "' + APP + '/src/screens/onboarding/WelcomeScreen.tsx" and "' + APP + '/src/data/signs.ts" (signCategories). API: "' + APP + '/src/i18n/index.ts" (defineStrings, useStrings, tr, formatDate, formatDateTime).',
  'YOUR files (edit only these): ' + g.files.map(f => '"' + f + '"').join(', ') + '.',
  'Other agents are converting these other files at the same time — do NOT edit them: ' + ALL.filter(f => !g.files.includes(f)).join(', ') + '. If a change of yours needs a call-site update in another group\'s file, keep your exported names and signatures unchanged instead (add a new localized getter next to the old export if needed).',
  'Rules:',
  '- Every user-visible string: JSX text, title/subtitle/label/message/placeholder props, accessibilityLabel/accessibilityHint, Alert.alert titles/messages/buttons, navigation header titles, Share messages, notification text, empty states, toasts, units like "min", "days ago", "of", plural forms.',
  '- Keep the English text EXACTLY as it is now (tests search for it). Add natural, correct Spanish for US/Latin American readers: tú register, accents and ¿¡ punctuation, short enough for buttons/chips (similar length to the English).',
  '- Values and plurals: functions, e.g. count: (n: number) => (n === 1 ? \'1 pregunta\' : `${n} preguntas`). Never concatenate fragments into sentences.',
  '- Components: const t = useStrings(STR). Elsewhere (data modules, engine, handlers): tr(STR) INSIDE functions only — never at module scope (the language can change at runtime; the UI remounts).',
  '- Data modules with English arrays/records (topics, modes, achievements, fact labels...): keep the English data and exports; add the Spanish next to it keyed by id; make the getters/lookup functions return the localized text. If screens read a constant directly (e.g. MODE_TITLES[mode]) and that screen is in another group, add a function (e.g. modeTitle(mode)) and leave the constant in English; note it in issues so the other group can switch.',
  '- Dates: formatDate/formatDateTime from src/i18n instead of toLocaleDateString()/toLocaleString().',
  '- Do NOT translate: the app name DriveReady, state agency names, URLs, emails, sign codes, testIDs, analytics-free internal ids, content coming from JSON (questions, lessons, facts, sign names — translated elsewhere).',
  '- Do not change behavior, layout, styles, testIDs or logic. No new dependencies.',
  'Check: cd "' + APP + '" && npx tsc --noEmit (fix errors in YOUR files; errors in other groups\' files may be their work in progress — re-run later) and npx jest --runInBand (must pass; English is the default language in tests; --runInBand keeps memory low on this 8 GB machine — never run jest without it). If a failure is in another group\'s file, wait a minute and re-run.',
].join('\n')

const convertPrompt = g => [
  'You localize part of the "DriveReady" DMV practice-test app into Spanish.',
  COMMON(g),
  'Convert all of your files. Return the summary (stringsConverted = approximate count; issues = anything other groups must know, e.g. a new getter they should use).',
].join('\n')

const reviewPrompt = g => [
  'You are the independent reviewer of the Spanish localization of part of "DriveReady" (another agent converted it). Assume mistakes exist.',
  COMMON(g),
  'For each of your files: (1) git diff it (cd "' + APP + '/.." && git diff -- "app/<file>") and confirm no behavior/layout change and the English is unchanged; (2) find any user-visible English left un-tabled (grep JSX text, string props, Alert, template strings) and convert it; (3) review every Spanish string: correct grammar/accents/¿¡, natural wording, tú register, UI-terms table used consistently, plural/number agreement, no truncation risk on buttons/chips; (4) tr() never called at module scope; formatDate used for dates. Fix in place, re-run tsc and jest. Return the summary with concrete issues found and fixed.',
].join('\n')

// At most 4 groups at a time: each agent runs tsc/jest, and the machine has 8 GB of RAM.
const out = []
for (let i = 0; i < GROUPS.length; i += 4) {
  const wave = GROUPS.slice(i, i + 4)
  log('groups ' + wave.map(g => g.key).join(', '))
  out.push(...(await pipeline(
    wave,
    g => agent(convertPrompt(g), { label: 'convert:' + g.key, phase: 'Convert', schema: SUMMARY, effort: 'high' }),
    (c, g) => c ? agent(reviewPrompt(g), { label: 'review:' + g.key, phase: 'Review', schema: SUMMARY, effort: 'high' }).then(r => ({ c, r })) : null,
  )))
}
return out.map((x, i) => ({ group: GROUPS[i].key, converted: x && x.c && x.c.stringsConverted, tsc: x && x.r && x.r.tsc, jest: x && x.r && x.r.jest, convertIssues: x && x.c && x.c.issues.slice(0, 6), reviewIssues: x && x.r && x.r.issues.slice(0, 8) }))
