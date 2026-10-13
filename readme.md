# DriveReady — free DMV practice tests for all 50 states

React Native (CLI, no Expo) app that prepares learners for the US driver knowledge test — car, motorcycle
and CDL — with **every feature free**: all questions, a state-accurate exam simulator, marathon, mistakes
review with spaced repetition, road-sign library and flashcards, verified state cheat sheets, pass-probability
meter, study plan, driving log, read-aloud, dark mode. No ads, no account, works offline.

- **AI agents / new contributors:** start with [`AGENTS.md`](AGENTS.md), then [`docs/HANDOFF.md`](docs/HANDOFF.md).
- App code: [`app/`](app) · Product spec: [`app/docs/APP_SPEC.md`](app/docs/APP_SPEC.md) ·
  Content rules: [`app/docs/CONTENT_GUIDE.md`](app/docs/CONTENT_GUIDE.md)
- Research (official handbooks, verified facts, sign assets): [`research/`](research)

```bash
cd app && npm install && npx jest && npx tsc --noEmit
cd android && ./gradlew assembleDebug -PreactNativeArchitectures=arm64-v8a
```

DriveReady is an independent study app and is not affiliated with any government agency.
