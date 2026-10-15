# New York - official online practice tests vs. DriveReady coverage

_Audit date: 2026-10-15._

## What was collectable

**Listed source:** <https://dmv.ny.gov/new-york-state-drivers-manual-practice-tests> (`officialPracticeTests` in
`app/src/content/states/NY.json`).

**Nothing could be collected.** Both plain HTTPS GETs (the first request and one identical retry) returned **HTTP 403**
with a Cloudflare managed challenge page ("Just a moment... Enable JavaScript and cookies to continue",
`challenge-platform`). That is an anti-bot gate, so under the audit rules (skip anything behind a login, CAPTCHA or
automated-access block) it was **not bypassed**: no header or user-agent tricks, no headless browser. Because the landing
page could not be read, the individual quiz pages it links to could not be found either (no URLs were guessed).

## Summary

| | Count |
|---|---|
| Official online questions collected | **0** |
| COVERED / PARTIAL / MISSING | - |
| New questions written | **0** |
| Conflicts | none (nothing to compare) |

No `NY-online.json` was written, because no questions were collected.

## Suggestions

- The **NY Driver's Manual** (`research/handbooks/NY.txt`) ends most chapters with a **"QUESTIONS"** list of open-ended
  review prompts (e.g. "What must you do when you encounter ... a flashing red light, flashing yellow light ...?").
  The manual says applicants "can practice for the written test with the questions included in this Driver's Manual"
  (p.10 of the text), so a separate **handbook audit** of those prompts (like the PA/TN/WI/UT audits) is the best substitute.
- The online quizzes could be collected by the owner in a normal browser session, or retried later if the Cloudflare
  challenge is lifted.
