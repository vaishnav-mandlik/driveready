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
| `app-screens.js` | Parallel screen implementation + adversarial code review (superseded: screens are now written directly). | none |
| `custom-illustrations.js` | Draw signal / pavement-marking / hand-signal SVGs into `app/assets/signs-custom/` and visually review them. | none |
| `state-research-v1.js`, `state-e2e-v1.js` | Earlier, heavier versions (4 agents/state). Kept for their prompts (fact keys, verification procedure). | `{"states": [...], "side": bool}` |

Lessons learned: ~35 concurrent max-effort agents exhausted the account's session limit. Run at most one or
two small workflows (≤4 agents) at a time, use `effort: 'high'` for authoring, and keep state work at 2
agents per state.
