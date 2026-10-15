# Google Play listing — DriveReady

## App details
- **App name (≤30):** `DriveReady: DMV Practice Test` (29)
- **Short description (≤80):** `Free DMV permit practice tests for every state. All questions free. No ads.` (75)
- **Category:** Education · **Tags:** Driving test, Exam prep, Study
- **Contact email:** support@driveready.app (update in `src/config.ts` too)
- **Privacy policy URL:** host `app/docs/privacy-policy.html` (e.g. GitHub Pages) and update `PRIVACY_POLICY_URL`.

## Full description (≤4000)

Pass your DMV knowledge test the first time — for free. DriveReady gives you every question and every study tool that other apps charge for: no subscription, no ads, no account, and it works offline.

**Built for your state**
• Practice for the official written test in all 50 states + DC
• Exam simulator that follows your state's official format and passing score
• State cheat sheet: BAC limits, parking distances, teen permit rules, phone laws and more — each rule shows the official handbook page it comes from
• Car (learner's permit / driver's license), Motorcycle and CDL

**Every study mode, free**
• Practice tests that adapt to you — new questions and your mistakes come first
• Exam simulator with an optional timer and "end when the result is decided", like many DMV computers
• Marathon: answer every question in the bank, and pick up where you left off
• Mistakes review with spaced repetition until you've truly learned each rule
• Hardest questions, daily challenge, survival (3 lives) and 2-minute speed rounds
• Road-sign library with flashcards and a signs quiz
• Study lessons for every topic, plus a road-test guide

**Know when you're ready**
• Pass-chance meter based on your answers and your state's passing score
• Study plan counting down to your test date
• Detailed stats, streaks and achievements

**Made for learners**
• Clear explanation for every answer
• Read-aloud for questions, choices and explanations
• Large-text option, dark mode and screen-reader support
• Supervised driving log to track your practice hours (with export)
• Report a problem on any question — we fix content fast

**Private by design**
DriveReady collects no data. There is no account and no tracking, and your progress stays on your phone.

DriveReady is an independent study app. It is not affiliated with, endorsed by, or connected to any state DMV or other government agency. State information comes from each state's official driver handbook and licensing agency website, linked in the app under Official Sources. Always confirm requirements with your state agency.

## Graphics
- App icon 512×512: `play-store-icon-512.png`
- Feature graphic 1024×500: `feature-graphic-1024x500.png`
- Phone screenshots (2–8, 9:16): capture Home, Exam simulator question, Results (pass), Cheat sheet, Signs, Progress — on a device/emulator in light mode, plus one in dark mode.

## Policy forms (answers)
- **Government information:** The app shows government-related information but is not affiliated with any government. Disclaimer appears in the listing (above), in onboarding, and in About and Official Sources. Official source links are under Learn → Official resources and Settings → Official sources.
- **Data safety:** No data collected. No data shared. (The app only downloads public question updates over HTTPS; it sends no user data.) Users can delete data (Settings → Reset study progress, or uninstall).
- **Ads:** No ads.
- **Target audience:** 13+ (teens studying for permits, and adults). Not designed primarily for children.
- **Content rating (IARC):** No violence, no user-generated content, no gambling, no location sharing → expected "Everyone".
- **Permissions:** POST_NOTIFICATIONS (optional daily reminder), RECEIVE_BOOT_COMPLETED (restore reminder after reboot). INTERNET (download public question updates; no user data sent). No exact alarms.

## Release checklist
0. Target API: **36** (`targetSdkVersion` in `android/build.gradle`) — required for new apps and updates since Aug 31, 2026 (verified 2026-10-13). API 36 ignores orientation locks on ≥600dp screens and enforces edge-to-edge; the app already supports both.
1. Upload key ready (`android/keystores/driveready-upload.keystore`, git-ignored) → enroll in Play App Signing.
2. `cd android && ./gradlew bundleRelease` → `app/build/outputs/bundle/release/app-release.aab`.
3. New personal developer accounts (created after Nov 13, 2023): run a **closed test with at least 12 testers opted in continuously for 14 days** before production access (rule confirmed 2026-10-13; testers must install the app with the invited Google account).
4. Create the store listing, upload graphics, fill forms above, roll out to production.
