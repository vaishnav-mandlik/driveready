# CLAUDE.md

Read `AGENTS.md` (project rules, layout, commands, gotchas) and `docs/HANDOFF.md` (history, status,
next steps) before doing anything.

Claude-specific notes:
- Heavy research/content work was done with multi-agent Workflow scripts; copies with full prompts are in
  `tools/workflows/` (see its README). Paths inside them are absolute to the original machine
  (`/Users/vaishnav/Desktop/DMV Test`) — adjust if the repo lives elsewhere.
- Keep workflows small (the owner's account hit session limits with ~35 parallel agents). Prefer
  2 agents per state (author → independent verifier) and batch several topics per reviewer.
- The owner writes short, informal messages; they want autonomous end-to-end execution and status updates,
  not questions about cosmetic choices.
