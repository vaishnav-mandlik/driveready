# Translations (Spanish)

The app runs in English or Spanish (Settings → Language · Idioma, or the toggle on the Welcome
screen; the default follows the phone's language). Two separate mechanisms:

1. **UI text** lives in the code, next to where it is used, in `defineStrings(en, es)` tables.
2. **Content** (questions, lessons, state facts, sign names/meanings) is translated in JSON files
   under `src/content/i18n/<lang>/`, mirroring the English paths. Every entry stores the
   fingerprint (`h`) of the English it was translated from. When the English is corrected later,
   the fingerprint no longer matches and the app shows the corrected English until the entry is
   re-translated. A translation can never hide a fix.

## 1. UI strings (`src/i18n`)

```tsx
import {defineStrings, useStrings} from '../../i18n';

const STR = defineStrings(
  {title: 'Practice', count: (n: number) => (n === 1 ? '1 question' : `${n} questions`)},
  {title: 'Práctica', count: (n: number) => (n === 1 ? '1 pregunta' : `${n} preguntas`)},
);

export function PracticeScreen() {
  const t = useStrings(STR);
  return <Text>{t.title} · {t.count(12)}</Text>;
}
```

- `es` must have exactly the keys/signatures of `en`; a missing translation is a compile error.
- Components: `useStrings(STR)`. Non-component code (data modules, engine, event handlers,
  Alert texts): `tr(STR)` **inside a function**, never at module scope (the language can change
  while the app runs; the navigation tree remounts on change, so render-time reads are safe).
- Text with values or plurals → functions. Never build sentences by concatenating fragments
  whose word order differs between languages.
- Dates: `formatDate(at)` / `formatDateTime(at)` from `src/i18n`, not `toLocaleDateString()`.
- Keep the English text exactly as it was (tests look it up).
- Data modules with English arrays (topics, achievements, exam modes...): keep the English data,
  add a Spanish map keyed by id, and return localized copies from the getter functions.
- Register: **tú** for app UI copy (friendly, like the English "you").

## 2. Content translations (`src/content/i18n/es/`)

| English source | Translation file | Entry |
|---|---|---|
| `questions/<track>/<file>.json`, `questions/states/XX.json` | same path under `i18n/es/` | `{"<id>": {"p", "c": [...], "e", "h"}}` |
| `lessons/<track>/<file>.json` | same path | `{id, h, title, summary, sections, keyPoints}` |
| `states/XX.json` (facts, laws, exam notes) | same path | `{"<textHash(English)>": "Spanish"}` |
| signs + scenes (`content/signs/index.ts`) | `i18n/es/signs/signs.json` | `{"<code>": {h, name, meaning, shape, colors}}` |

Never edit these files by hand to add entries — use the tool, which validates and stamps fingerprints:

```bash
node scripts/i18n.mjs status es                                   # coverage, stale entries
node scripts/i18n.mjs export es src/content/questions/car/parking.json > work.json   # what needs translating
#   ... translate into {"car.pk.001": {"p": "...", "c": ["...", "...", "...", "..."], "e": "..."}, ...}
node scripts/i18n.mjs import es src/content/questions/car/parking.json translated.json
node scripts/validate-content.mjs                                 # numbers/structure checks
node scripts/build-content-index.mjs                              # picks up new translation files
```

`export` accepts a questions file, a lesson file, `src/content/states/XX.json` or `signs`
(`--all` exports everything, e.g. for a review pass). `import` refuses entries whose numbers differ
from the English, whose choice count differs, or whose lesson structure (sections, block types,
sign codes, list/table sizes) differs.

### Content rules (non-negotiable)

- **Meaning first.** The keyed answer must stay the only correct answer; distractors stay wrong.
  Keep every condition, exception and negation ("unless", "except", "NOT", "only if", "at least").
  Uppercase emphasis stays uppercase (`NOT` → `NO`, `EXCEPT` → `EXCEPTO`).
- **Numbers unchanged**, written exactly as in English (US formats: `0.08%`, `1,000`, `$25`,
  `10 p.m.`). Units stay US (feet → pies, miles → millas, mph stays `mph`). Do not convert to metric.
- Keep choices in the same order (`answer` is an index).
- Proper nouns stay as written: agency names (California DMV), handbook titles, statute citations,
  sign legends in images (STOP, YIELD, ONE WAY...). When a prompt quotes sign text, keep the English
  legend and add the Spanish meaning in parentheses if useful: `ONE WAY (un solo sentido)`.
- Register: **usted** for questions, explanations, lessons and state facts (matches official DMV
  Spanish handbooks and the Spanish knowledge test).
- Use the glossary (`research/notes/glossary-es.md`, built from official Spanish DMV handbooks) for
  every traffic term, consistently. US/Latin American Spanish (carro/auto, manejar, licencia de
  manejo/conducir), not Spain-specific usage (coche, conducir por la derecha → circular...).
- `ref` fields are not translated (they cite English documents). Verbatim `source.quote` strings in
  state files stay English.

### UI terms (use consistently)

| English | Spanish |
|---|---|
| knowledge test / written test | examen de conocimientos |
| practice test | examen de práctica |
| exam simulator | simulador de examen |
| road test / driving test | examen de manejo |
| learner's permit / permit | permiso de aprendizaje / permiso |
| driver's license | licencia de manejo |
| road signs | señales de tránsito |
| signals & pavement markings | semáforos y marcas en el pavimento |
| right-of-way | derecho de paso |
| question bank | banco de preguntas |
| lesson / study guide | lección / guía de estudio |
| cheat sheet | hoja de repaso |
| flashcards | tarjetas de estudio |
| mistakes | errores |
| saved (bookmarks) | guardadas |
| marathon | maratón |
| survival | supervivencia |
| speed round | ronda rápida |
| daily challenge | reto diario |
| hardest questions | preguntas más difíciles |
| due for review | pendientes de repaso |
| streak | racha |
| achievements | logros |
| pass chance / readiness | probabilidad de aprobar / preparación |
| passing score | calificación para aprobar |
| explanation | explicación |
| report a problem | reportar un problema |
| driving log | registro de manejo |
| motorcycle | motocicleta |
| commercial driver's license (CDL) | licencia de conducir comercial (CDL) |

## Status

`node scripts/i18n.mjs status es` lists coverage per file. Untranslated or stale items simply show
in English, so partial coverage is safe to ship.
