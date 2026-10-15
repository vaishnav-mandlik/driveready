# Maryland — official sample questions vs. DriveReady coverage

_Audit date: 2026-10-15. Source: Maryland Driver's Manual, October 2025 edition, DL-002 (10-25) (`research/handbooks/MD.txt`). No Maryland
motorcycle manual is in `research/handbooks/`. Extracted questions: `research/official-samples/MD.json` is an empty list, because there was
nothing to extract._

## Summary

| | Count |
|---|---|
| Official sample questions in the manual | **0** |
| COVERED / PARTIAL / MISSING | **0 / 0 / 0** |
| New questions written | **0** |

The Maryland manual has no sample, review or practice questions. The whole text was searched for "Sample", "Review", "Practice",
"Test Yourself", "Quiz" and "Answer", for every question mark and for A./B./C. choice lists; the only hits are the table of contents,
two "Did you know?" boxes and the description of the knowledge test (25 questions, 20 minutes, PDF p. 7).

Instead, the manual points readers to the MVA's **Online Driver Test Tutorial** (PDF pp. 3 and 7). The MVA practice-test page
(mva.maryland.gov, "Learner's Permit Practice Tests") links to timed and untimed 25-question tutorials at mvarookie.mva.maryland.gov.
They are a JavaScript app: fetching the tutorial page on 2026-10-15 returned only its title and no questions, so they could not be
extracted or audited here.

Validator: no Maryland file was changed by this audit. The run's validator result (FL, OR, MI and the two `coverage-fl-or-md-mi.json`
files) was **0 errors, 0 warnings**.

## Conflicts (official key vs. app)

None (no official questions).

## Follow-up

- If someone takes the untimed tutorial in a browser and saves its questions, add them to `research/official-samples/MD.json` and run
  this audit for Maryland. Use the same rules as the other states: original wording only, and confirm each answer against the manual.
- Current Maryland coverage in the app: 104 Maryland car questions and 10 Maryland motorcycle questions (`states/MD.json`), built from
  the verified facts in `research/facts/MD.json`, plus the universal banks.

## Item-by-item table

| n | Official item | Page | Key | Topic | Status | App ids | Note |
|---|---|---|---|---|---|---|---|
| — | (none in the manual) | — | — | — | — | — | — |
