# Pencil mobile redesign — implementation and verification

Date: 2026-11-08. Source: `file:///home/zillia/Documents/deep-tutor-app-2.pen`. The document was read through Pencil MCP and was not modified.

## Outcome and limits

This is a broad native presentation implementation with selected working local flows. **It is not a completed, server-connected mobile application.** All 154 numbered light screens and 154 dark counterparts have native presentations. No screen has been certified complete end to end. The matrix distinguishes local behavior from unfinished domain operations; none of the frame inventory is silently excluded.

The 461 document roots comprise 123 older imports/reference roots, 308 mobile screen variants, and 30 reference boards. The latter include two foundations, four handoff boards, thirteen coverage boards and eleven dark indexes. `reference-boards.json` records those boards. `editable-frames.json` preserves all 308 editable trees; `frame-bounds.json` preserves their resolved dimensions. Matching light/dark trees have identical non-color layout and content.

## Existing project audit and architecture

- Expo `~58.0.23`, React Native `0.88.1`, React `19.3.0`, TypeScript `~6.0.3`, strict mode. npm lockfile; no Bun lockfile.
- Existing Expo Router file routes and root provider tree are retained. `/` now opens `/mobile/1`; the preexisting `/chat`, learning, notebook, settings and authentication routes are retained.
- Existing shared controls and design palettes follow an earlier web-port design. The redesign has distinct semantic palettes, Inter typography, 20px gutters, 48px targets, 12px controls, and no decorative elevation. Those mobile values are isolated rather than changing legacy UI behavior.
- The only existing live transport boundary is `src/api/client.ts`, an Axios client requiring `EXPO_PUBLIC_API_URL`. No endpoint implementation was found in the feature modules. Existing authentication, chat, favorites and learning behaviors are fixture based. No backend endpoint was invented or added by this change.
- Existing tests cover foundation, entry, chat, favorites and mastery behavior. Their 34 checks continue to pass.

SDK 58 documentation, Expo's current LLM index, Router and Clipboard references were checked before touching those APIs. No new package dependency was introduced. Inter is bundled with its OFL license. All icons use the existing Lucide dependency; no image fills occur in the mobile screen trees.

## Native implementation

`src/features/mobile/` contains:

- `model.ts`: typed design specifications, exact semantic light/dark palettes, color resolution and reusable disclosure-row construction.
- `NativeLayers.tsx`: reusable native text, frame, icon, disclosure/action, field, selector, switch and editor components. These read editable layout properties, not HTML/CSS or screenshots.
- `MobileScreen.tsx`: safe-area/keyboard shell, four primary destinations, nested Expo Router navigation, selection dialogs, finite-form/list rendering, error feedback and domain adapters.
- `navigation.ts`: explicit frame relationships plus unambiguous title aliases. `interaction-inventory.json` records design rows/actions and static destinations; it is traceability evidence, not proof that unlisted actions are complete.
- `local-store.ts`: existing Zustand/AsyncStorage infrastructure for local drafts, appearance, notes and tasks. Drafts are scoped by workspace/frame; chat drafts also use session identity. Passwords, credentials and HTTP headers remain transient and are never written by this store.
- `screens.json`: a compact build-time snapshot of the editable light screen trees. Both themes share the same native layout and semantic variable references. Future design changes require re-extraction via Pencil MCP; do not edit encrypted `.pen` files.

The native OS supplies status bar, safe areas and keyboard. The source's drawn status bars/keyboards are omitted. Canvas heights describe full handoff content; the application uses fixed viewport navigation and scrolling. The top-level list is virtualized. Some nested design sections still render their finite children eagerly and will need domain-specific virtualization for large real datasets.

## Working behavior

- Four primary destinations, back navigation, direct `/mobile/<frame-number>` routes, account/settings navigation and mapped nested flows.
- Native editable fields, focus styling, URL/numeric validation, switches, selection dialogs, search filtering and empty feedback. Selection state is stored; most selections are not yet connected to execution.
- Local task create/edit/status filtering and persistence, scoped by workspace.
- Multiple local authored notes, editing, saving, list reopening and accepting the designed sample suggested revision.
- Sample practice question selection and different correct/incorrect feedback. This is one proposed design example, not a complete question bank or real learner progress.
- Local workspace and light/dark/system appearance selection. The redesign's workspace identities are not yet mapped to legacy fixture provider workspace IDs.
- Existing ChatProvider sending and transcript rendering, history/archive list projection, rename, pin, archive, deletion after the designed confirmation, and copying response text. Replies remain simulated and are labeled as a demo. Existing advanced chat/learning routes remain available.
- Unsupported actions explicitly disclose that no server operation occurred. Secret form fields are not saved under the generic local-draft behavior.

## Remaining implementation by frame family

| Frames | Required work before completion |
|---|---|
| 3–11, 126–127, 131–137, 153–154 | Bind the displayed engineering path/modules to actual topic/session IDs; submit study answers/assessment; review schedules/strategies; books and reader tools; reset/delete operations. Legacy learning fixtures have different topics and must not be relabeled as this path. |
| 14–25, 124–125 | Reconnect/request reconciliation; device file/source selection; model catalog mapping; apply modes, response styles, skills and connectors; full streaming/activity, speech, Markdown/export. |
| 28–39, 108, 130 | Server note sync, rich editor blocks, Favorites-provider adapter, real question/CSV imports, question storage, tags, journal and practice queue. Chat fixture state is in memory, while notes/tasks/drafts persist locally. |
| 40–51, 59–60, 128, 140, 147–151 | Document pick/upload/preview, source configuration/sync, engines/indexes/recovery, folder access, moves/deletion, credentials and real catalog data. |
| 52–58, 129 | Real calendar dates/events and progress data, complete task board/archive operations, server sync and applying status colors. Date selection is saved, but day/week content remains the source sample. |
| 61–64, 138–139 | Real profile/avatar handling and device image picker, password endpoint, device sign-in tokens, server workspace identity and authorization. Source account names/counts remain illustrative. |
| 65–80, 117, 123 | Partner/persona/skill creation, assignments, extension installation, MCP tests, agent imports and memory processing/evidence data. Current editors/selectors store drafts only. |
| 81–111, 118–122, 141–146 | Server settings/catalog loading and saving, usage/runtime data, model/provider tests, migration, users/modules and authenticated permission enforcement. Theme works locally; language/text-size/code settings are not fully applied. |
| 112–116, 152–154 | Real operation-to-state transitions, record-aware confirmations, retry and recovery. State routes exist; this does not mean their related operations are integrated. |
| All families | Domain loading/disabled/error states for actual requests, complete accessibility/device verification, and individual visual comparison for the remaining frames. |

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm run test` | 34/34 passed |
| `npx expo-doctor` | 20/20 passed; no issues detected |
| `npx expo install --check` | Passed using the local SDK map; CLI explicitly warned that offline validation was less reliable. Expo Doctor subsequently passed with network access. |
| `npx expo export --platform android --output-dir /tmp/deeptutor-mobile-android-export-final` | Passed; Android Hermes bundle generated. This is an export, not an APK build or device test. |
| Browser route regression | 154/154 routes, plus six representative routes at both 320px and 768px: 166 checks, no console errors or horizontal overflow. See `all-routes-report.json`. |
| Browser interaction regression | Task persistence across reload, note saving/list reopening, incorrect-answer feedback, empty search, persisted dark appearance and existing fixture chat sending passed. |
| Android/iOS device or simulator | Unavailable; not tested. |

The browser regression script is `scripts/verify-mobile-redesign.cjs`. It uses an externally supplied Playwright installation rather than adding a runtime dependency:

```sh
BASE_URL=http://localhost:8099 \
PLAYWRIGHT_MODULE=/tmp/deeptutor-ui-audit/source/web/node_modules/playwright \
CHROME_EXECUTABLE=/opt/google/chrome/chrome \
node scripts/verify-mobile-redesign.cjs --all
```

Start Expo web on the matching port first. Omit `--all` for the focused route/interaction run. `OUTPUT_DIR` defaults to `/tmp/deeptutor-mobile-verification`. The script waits for client hydration before interacting and checks page/console errors. Browser verification does not establish native keyboard or accessibility behavior.

## Visual evidence and unresolved differences

Pencil hierarchy and tokens were read for all 308 variants. `TakeScreenshot` references were inspected for Learn, Tutor, Library, Plan, Account, Settings, Module 1, Practice question, Task details and Appearance. Selected browser screenshots were compared to these references, including dark Learn. A text-fill/background error and an empty-text-node warning were found and fixed.

- The browser lacks the OS status-bar inset, so its header starts approximately 62px above the canvas reference. Native safe-area behavior still requires device comparison.
- Bottom navigation is fixed to the real viewport; tall canvas references place it below the entire handoff content. This is intentional per the design's implementation guidance.
- Demo/data disclosures, real local notes/tasks, dynamic chat titles and incorrect-answer feedback intentionally differ from fixed source samples.
- The browser uses Inter correctly; native variable-font weights and large Dynamic Type remain unverified.
- Most frames have only structural/runtime validation, not individual visual comparison. There is no pixel-perfect claim.
- VoiceOver/TalkBack, native dialog focus, keyboard avoidance, Android system navigation bar, iOS insets, offline request recovery and real permissions remain unverified.

## Resume order

1. Use the matrix and action inventory to select a domain family; replace design fixture content with typed domain adapters while retaining the shared native components.
2. Obtain the real API contracts and authenticated permission model. Connect existing providers rather than inventing endpoints or claiming local storage is server sync.
3. Complete learning/study and library/import functionality first, then knowledge, plan, personalization and administration.
4. Apply configuration selections to execution and wire operation-to-state transitions.
5. Compare every remaining frame on Android, then iOS; run accessibility, keyboard and large-text checks.
6. Re-run the checked-in browser regression, existing tests, lint/typecheck, Doctor and Android export. Update per-frame statuses only when the corresponding behavior is verified.
