# M2 verification — browser/local-mock acceptance complete

M2 is **complete for the approved UI-only local-mock/browser scope**, with native Android and unavailable source visual states explicitly unverified below. Earlier sections are the historical investigation record. Implemented scope: S02 search; S03 workspace/account sheet; S39 Resources; S40 Personalization; S73 login; S74 registration; S75 profile; S81 General; S82 Appearance. M3 has not started.

## Implementation

New entry fixture provider and pure models maintain principal, workspace, password/avatar operations, and separate active/staged/saved settings in memory. Source account roles remain separate from learner presets. Source return-path and avatar helpers were retained. Resource tiles, tints, response languages and all 46 syntax themes were extracted from the pinned source. The fixed Python preview uses extracted tokens; it does not execute code.

Shared Choice sheets extend M1 Dialog positioning. Expo Router owns auth/app routes and the search modal. Later-milestone destinations retain their source URL through a shared Retry boundary, not implemented feature screens. Development fixture controls are in the existing component preview. Source vocabulary is extracted into ten locale bundles, including English and Ukrainian.

Modified existing files: root/index routes, AppShell, ComponentPreview and shared Dialog. Added files are under src/features/{entry,resources,search,settings}, src/app/(app), src/app/(auth), src/app/ui, shared/ui/Choice.tsx, i18n/m2-messages.json, extraction/browser scripts and tests/m2-entry.test.cjs. No dependencies or backend files changed.

## Executed verification

- TypeScript: passed.
- ESLint: passed without warnings after duplicate-import correction.
- Unit tests: 17 passed, including 9 M2 tests for return-path validation, role/preset permissions, settings isolation, workspace switching, password/avatar validation, independent resource counts, typed search, source code-preview integrity and localization/no-transport imports.
- Android Hermes export: passed to /tmp/deeptutor-m2-android. This is not a native build/device test.
- Browser: Resources smoke check passed at 412px with no page errors; screenshot manually inspected. The broader browser run failed its zero-page-error assertion; see verification/M2/browser-failure.log. Captures collected before failure are retained, but this run is not a pass.

## Outstanding acceptance checks and limitations

Authentication/registration transitions, inactive-route redirect behavior, profile upload/password interactions, settings save/apply/failure recovery, workspace failure retention and modal return/focus behavior still require complete browser interaction verification. No native Android device/emulator, IME, TalkBack or hardware Back verification has occurred. Do not infer these passes from compilation or export.

Avatar upload currently selects a bundled sample through a local fixture sheet, with oversized/corrupt development samples; real device image selection/cropping is not implemented. Code preview retains source token colors but native treatment of decorative Prism CSS needs comparison. Setup/provider/admin/workspace-management destinations belong to later milestones and retain boundary UI only. Source search/gallery/settings captures often show blocked Retry states and cannot prove populated-screen visual parity.

All individual M2 acceptance boxes remain open pending these checks. Next implementation milestone after verified M2 is M3; it has not been started.

## Hydration investigation and focused fix

**Hydration defect resolved in the executed coverage; M2 remains open.** Complete original React differences are retained in [browser-failure.log](verification/M2/browser-failure.log). Repeated candidate results, console records and screenshots are under [hydration evidence](verification/M2/hydration/results.json).

### Exact mismatch and cause

The failed multi-width test completed 412px and failed its error assertion during the 768px route batch. The original runner aggregated diagnostics without attaching route names, so its historical log cannot attribute each individual error to one URL. Its affected route batch is `/space`, `/personalization`, `/settings/general`, `/settings/appearance`, `/ui/search`. The React stack explicitly identifies `AppLayout → EntryBoundary → AppShell`.

Server markup contains the compact header and `Open navigation` button with Menu SVG. The initial client markup instead inserts a 272px sidebar, a WORKSPACE button and ExpoImage logo. This is a structural mismatch, not merely differing colors: the server has a flexible content container where the client expects the sidebar.

Installed react-native-web `useWindowDimensions` initializes state synchronously from `Dimensions.get('window')`. SSR has width zero; the browser has its actual viewport. AppShell branches at 768, so desktop/tablet hydration initially renders a different tree. Layout padding and title typography also used the same nondeterministic first snapshot.

Theme uses the M0 deterministic light server snapshot and was not the cause. M2 stores initialize from fixed in-memory constants; neither Zustand hydration nor AsyncStorage/browser persistence participates in these routes. Fixture dates are fixed strings. No random/time-dependent content or animation appears in the divergent stack. Navigation changes route ownership but the concrete divergence is the viewport branch. This differs from M0's Reanimated AnimatedIcon visibility warning; that starter remains unmounted.

### Baseline classification and limits

**C is supported at source level: existing viewport-sensitive M1 code interacting with M2 route rendering.** The pre-M2 hash snapshot and recorded M1 manifest agree for shared Text and Layout. M1 AppShell already used the same direct dimension hook and breakpoint. M1's recorded test covered a root entry followed by client navigation; M2's failing test hard-loaded each new nested route. M1's recorded pass therefore does not prove these new SSR boundaries safe.

The repository has only `15cb112 Initial commit`; no pre-M2 commit or complete immutable M1 checkout is available. Hashes cannot reconstruct modified files. An exact pre-M2 runtime A/B replay was therefore **not performed**. Do not upgrade this source-supported classification into proof that the same runtime failure occurred before M2. The original M2 stack and installed hook implementation establish the current cause independently.

### Minimal code change

- Added `src/hooks/use-layout-dimensions.web.ts`: useSyncExternalStore with a cached deterministic `{width:0,height:0,scale:1,fontScale:1}` server snapshot. React uses it for SSR and hydration, then reads the actual Dimensions snapshot and subscribes to changes; cleanup removes the listener.
- Added native `use-layout-dimensions.ts`, directly re-exporting React Native useWindowDimensions.
- Changed only the dimension imports/calls in AppShell, shared Layout and shared Text. Existing breakpoints, design values, routes, theme state, form state and animations remain unchanged.
- Added an SSR regression test that throws if browser Dimensions are read or subscribed during server rendering.

No warning suppression, arbitrary timeout, global SSR disablement, animation removal or blanket client-only rendering was introduced. The compact SSR representation transitions to the correct viewport after hydration.

### Executed results

| Check | Actual result |
|---|---|
| TypeScript / ESLint | PASS; logs retained |
| Unit tests | PASS, 18 tests, including all M0/M1/M2 tests and new deterministic viewport SSR test |
| Original M2 five-route browser test | PASS after fix at 412, 768, 1440 |
| Repeated hydration suite | PASS: 84 document loads, 12 fresh contexts, two rounds × three widths × light/dark × seven routes; no page errors or captured console warnings/errors |
| Additional M1 paths | `/explore` and `/avatar-preview` included in every repeated suite context |
| Nine-surface coverage | Five M2 route surfaces exercised across all widths/themes. Phone auth flow additionally reached login, workspace sheet, profile and registration; registration completion failed (see below). This is not complete acceptance for all nine surfaces. |
| Android Hermes export | PASS to `/tmp/m2-hydration-android`; not an APK or device test |
| Native Android / IME / TalkBack / hardware Back | NOT RUN |

Repeated checks use reduced motion, matching previous verification. They establish hydration consistency, not animation performance or complete M1 interaction regression coverage. Browser state transitions into the correct viewport/theme remain active; there is no persistent forced light or compact mode.

### Remaining M2 issue

The additional phone auth interaction runner successfully signed in, opened the workspace sheet and profile, signed out, opened registration and submitted matching fields. It then timed out waiting for `Account created! Sign in to continue.`. The assertion failure is retained in [auth.log](verification/M2/hydration/auth.log), with screenshots of the reached surfaces. Its root cause is not established by this hydration fix; inactive-route redirects are a candidate requiring investigation, not a confirmed diagnosis. Subsequent tablet/desktop auth flows were not executed after that failure.

M2's broader settings/workspace failure and accessibility acceptance checks also remain pending as previously documented. **M2 is not complete. M3 has not started.**


## Registration completion investigation — 2026-11-05

**Registration timeout resolved.** This was a test navigation race, not a failed mock operation or hydration regression. The original runner clicked “Create one” and immediately filled “Email or username”, a label shared by login and registration. The captured registration screenshot had an empty username despite the preceding fill. Submission stayed at `/register?next=%2Fchat` and displayed `Email or username · Password`; there were no page errors. See [captured failure](verification/M2/completion/registration-before.json).

The runner now waits for the register URL **and** `Create your account` before filling, asserts the username before submission, observes `Creating account…`, retains the exact success-notice assertion, verifies `/login?registered=1&next=…`, and signs in with the new local account. No timeout increase, fixed sleep, skipped submission, authentication transport, or change to the hydration hook was needed.

Six fresh sessions (412/768/1440 × light/dark) pass required-field, mismatch, minimum-eight-character, loading, completion and new-account sign-in checks. The entire six-session run was repeated successfully after the shared-control adjustment. Registration-closed failure recovers through sign-in; first-user registration grants the local administrator role. Duplicate-account rejection is not an explicit M2 fixture contract and was not invented or claimed tested.

A separate accessibility acceptance check found that installed RN Web does not forward native `accessibilityState` into the expected selected/busy/disabled DOM attributes. Shared Button now forwards explicit ARIA attributes while retaining native accessibilityState. The new regression renders the real shared Button through RN Web SSR and asserts these attributes. Styling is unchanged.

### Current executed evidence

- TypeScript and ESLint pass. All **19 unit tests pass** (M0/M1/M2 plus viewport SSR and shared-button accessibility).
- Registration: six sessions × two successful runs, no captured console warnings/errors or page errors.
- Settings draft/save/apply/discard and failed-apply retention, profile avatar sample/select/remove/password completion, workspace switch/failure retention, closed-registration recovery: pass at 412/1440 × light/dark.
- First-user bootstrap, five resource/settings/search states across five routes, retry and search reset/Escape/exact partner destination: pass. Loading/empty captures are evidence of reached fixtures, not proof of every loading animation.
- Ukrainian application and English restoration, inactive saved draft, learning size/spacing/reset, 46 code choices, line-number/wrap toggles: pass.
- Hydration: **84 loads**, 12 fresh contexts, zero captured page errors or console warnings/errors, including M1 `/explore` and `/avatar-preview`.
- Android Hermes export: pass at `/tmp/m2-completion-android`. No native build/device/IME/TalkBack/hardware Back test was run; `adb` and generated native projects are unavailable.

Evidence and scripts: [completion results](verification/M2/completion/results.json), [registration](verification/M2/completion/registration-results.json), [states](verification/M2/completion/states.json), [preferences](verification/M2/completion/preferences.json), [hydration](verification/M2/completion/hydration-results.json); `scripts/verify-m2-{auth-hydration,interactions,states,preferences,temporary}.cjs`.

### Visual comparison and adaptations

Inspected the current 412 dark registration capture alongside audited CAP-101 (`dark-412-003--register.png`): source background/surface, orange accent, serif branding, form order and terminology are retained. Approved mobile differences are 48px controls, 24px page gutters and vertically stacked account links; the captured current form also includes a validation message absent from the source capture. Inspected dark phone Appearance and light desktop profile completion screenshots. Source settings/profile captures can be access-blocked, so this does **not** establish populated-screen pixel parity. Original source captures and M0/M1 reports are unchanged.

Real image picking/cropping remains represented by the documented bundled local sample. Native Android and source states without usable visual references remain explicitly UNVERIFIED. Later feature routes remain milestone handoffs; M3 has not started.


### Remaining acceptance defect fixed: temporary passwords

The final acceptance runner exposed a real M2 redirect race separate from registration. Login's successful callback selected `/profile?change=1`, but AuthScreen's newly authenticated render also mounted a Redirect to `/chat`. Captured final URL/body: [before](verification/M2/completion/temporary-route-before.json). AuthScreen now uses `/profile?change=1` whenever the authenticated profile requires a password change, making the two transitions agree.

Once that route worked, the completion assertion exposed a second defect: the notice remained because `params.change === '1'` stayed true after updating the profile. ProfileScreen now derives the notice solely from `profile.mustChange`, exactly as pinned web profile source lines 214 and 424 do for `must_change_password`. The unused query hook was removed. The focused browser test now verifies arrival, visible requirement, successful change and absent requirement. See [result](verification/M2/completion/temporary.json). Registration state, hydration hooks, layouts, themes and backend adapters were not changed.

### Acceptance disposition by surface

| Surface | Verified local/mock coverage | Explicit limits |
|---|---|---|
| S02 Search | Search/no matches, reset after Escape/reopen, exact partner destination; loading/empty/error/retry/denied/unavailable; unit coverage of types/scope/permissions | Opened source-palette visual parity unavailable; hardware Back not run |
| S03 Workspace/account | Sheet entry from shell; profile action; switch success; failed switch retains selected workspace; first-user admin action; source destination rules in units | Later admin/workspace managers are handoffs; native modal/Back not run |
| S39 Resources | Three widths, both themes; independent counts and optional features in units; fixture loading/empty/error/retry/denied/unavailable | Counts are synthetic; later feature destinations remain boundaries |
| S40 Personalization | Three widths/both themes; account-wide repository counts; five state variants and retry | Later managers remain boundaries |
| S73 Login | Existing/new credentials; logout/login; auth-disabled hydration; first-user and temporary-password transitions; safe return paths/roles in units | No real authentication or persistence guarantee |
| S74 Registration | Required fields, mismatch, minimum length, busy, completion URL/notice, new-account sign-in, closed-policy recovery, first-user admin | Duplicate-account policy not specified; native keyboard/Back not run |
| S75 Profile | Identity, avatar icon/sample/remove, password completion, logout; temporary requirement cleared; validation/error helpers in units | OS file picker/crop uses approved fixture representation; native IME not run |
| S81 General | Draft/save inactive/apply/discard across routes, failed apply retention, retry/availability, Ukrainian/English, Classic/Modern selection | Missing source translations retain source-string fallback |
| S82 Appearance | Theme selection/application/discard; learning scale/spacing/reset; 46 syntax choices, wrap/line numbers; shared lifecycle and availability | Decorative Prism CSS and uncaptured source states lack full visual sign-off |

All nine surfaces have exercised UI-only acceptance coverage; no backend success is implied. M2 is closed at this scope. Native device validation and source-only visual comparisons remain explicit follow-up limitations, not passed tests. **M3 has not started.**

### Files changed in this completion pass

- `src/shared/ui/Controls.tsx`: expose web accessibility state.
- `src/features/entry/AuthScreen.tsx`: honor temporary-password destination in authenticated redirect.
- `src/features/entry/ProfileScreen.tsx`: clear temporary-password notice from authoritative profile state.
- `tests/m2-hydration.test.cjs`: real RN Web shared-button SSR accessibility regression.
- `scripts/verify-m2-auth-hydration.cjs`: fix destination-readiness race and add six-session validation/completion regression.
- New `scripts/verify-m2-interactions.cjs`, `verify-m2-states.cjs`, `verify-m2-preferences.cjs`, `verify-m2-temporary.cjs`: remaining acceptance coverage.
- This report, `IMPLEMENTATION_PLAN.md`, `TRACEABILITY_MATRIX.md`, and `verification/M2/completion/`: current status and evidence. Existing M0/M1 reports and backend code are unchanged.

The final Android export is `/tmp/m2-completion-final-android`. Test harness startup/bundling and translation-key expectation failures were corrected with rendered-state waits and exact source copy, without weakening completion assertions or adding fixed waits. Historical failure captures are retained alongside final results; they are not counted as passes.
