# Workflow scripts (multi-agent orchestration)

These are the Claude Code `Workflow` scripts used to produce research and content. Each file starts with
`export const meta` and is plain JavaScript using `agent()`, `pipeline()`, `parallel()`, `phase()`, `log()`
and the `args` global. The prompts inside are the real instructions given to the agents — reuse them.

| Script | What it does | Args |
|---|---|---|
| `state-content-v2.js` | **Current approach.** Per state, 2 agents: author (facts with verbatim quotes → `research/facts/XX.draft.json`, then 70–100 state questions → `app/src/content/questions/states/XX.json`) and independent verifier (checks every fact + question, writes `research/facts/XX.json`, runs `import-state-facts`). | `{"states": [["CA","California"],["TX","Texas"]]}` |
| `universal-bank.js` | Per topic: write universal questions → adversarial correctness/universality review → quality review → lesson → lesson fact-check. | `{"jobs": [{track, topic, title, prefix, target, scope}]}` |
| `universal-review.js` | Batch review of universal car questions (correctness + universality across all handbooks + quality), one agent per 3–4 topics. | `{"batches": [["right-of-way","freeway"], ...]}` |
| `bank-builder.js` | Universal banks from a manual (motorcycle MSF, CDL AAMVA): one author per job of several topics → independent reviewer. | `{"jobs": [{name, track, topics:[{topic,title,prefix,target,scope}]}]}` |
| `lessons.js` | Study lessons per topic (several per agent), grounded in sources and aligned with the question bank → independent fact-check. | `{"jobs": [{name, track, topics:[{topic,title}]}]}` |
| `sign-questions.js` | Image-based questions (`sign` field) for every sign/signal/marking code in `_codes.json` → independent review. | none |
| `sign-questions-topup.js` | Questions only for sign codes that have none yet, one writer per group into a new file → independent review against the rendered sign. | `{"groups": [{key, file, prefix, codes: [...]}]}` |
| `scenario-images.js` | Illustrators compose top-down scenes with `app/assets/scenes/scene.py` and write scenario questions → reviewers render every scene and check it against US conventions + universal rules. | — |
| `ui-i18n.js` | Moves all UI strings into `defineStrings(en, es)` tables with Spanish, one agent per file group (≤4 at a time) → bilingual code review. | `{"groups": [{key, files: [...]}]}` |
| `content-i18n.js` | Spanish content via `scripts/i18n.mjs`: optional glossary from official Spanish handbooks, then translator → bilingual reviewer per job, `wave` jobs at a time (default 2). | `{"lang": "es", "glossary": bool, "wave": 2, "jobs": [{key, sources: [...]}]}` |
| `app-screens.js` | Parallel screen implementation + adversarial code review (superseded: screens are now written directly). | none |
| `custom-illustrations.js` | Draw signal / pavement-marking / hand-signal SVGs into `app/assets/signs-custom/` and visually review them. | none |
| `state-research-v1.js`, `state-e2e-v1.js` | Earlier, heavier versions (4 agents/state). Kept for their prompts (fact keys, verification procedure). | `{"states": [...], "side": bool}` |

Lessons learned: ~35 concurrent max-effort agents exhausted the account's session limit. Run at most one or
two small workflows (≤4 agents) at a time, use `effort: 'high'` for authoring, and keep state work at 2
agents per state.

### When the Workflow tool is unavailable
Extract the exact agent prompts from any script with the stub runner and hand them to plain agents
(≤4 at a time): `node <scratch>/prompts.mjs "<script.js>" '<args json>' <outdir>` — the runner replaces
`agent()` with a recorder (see the 2026-10-14 session; it is ~30 lines: strip `export`, wrap the body in an
async function with stub `agent/pipeline/parallel/phase/log/args`). Each agent is told to read its prompt file.
