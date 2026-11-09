# Learning implementation and verification

Updated 2026-11-09. Overall: **PARTIAL**. Core Learning discovery, real mastery-session messaging and persistence work against the development backend. This is not a claim that every designed feature has been completed or tested on Android.

## Final design sources

The open document `file:///home/zillia/Documents/deep-tutor-app-2.pen` was read through Pencil MCP, without edits or saves. Final `MOBILE DARK` frames were used; old imported frames were excluded. Editable layers, metadata, dimensions and screenshots were inspected. `MOBILE DARK INDEX · Tutor` (`R2p12`) is only a section heading; the actual Tutor screen `Xmj8E` and its composer were inspected for comparison.

The current Study Session `FqRwt` is 390×850, rather than the old 390×1092 snapshot. It specifies a 52px answer surface (46px minimum metadata, 140px maximum), integrated circular send, a paperclip/count, one overflow action, and resource/action sheets. The implementation uses that compact structure. It reuses TutorComposer and keeps model/mode/skills/connections/secondary learning actions in the overflow panel, avoiding a duplicate folder action. The goal itself is not counted as an attachment.

Reference PNGs for all Learning frames, module variants, progress and destructive confirmations were exported to `/tmp/deeptutor-learning-design-references/`. Implemented captures are in `/tmp/deeptutor-learning-verification/`. These may include private account content and are deliberately not committed. Actual server topic/module names differ from the design's example engineering curriculum. The source's drawn OS bars are replaced with real safe areas; 390px is a reference viewport rather than a fixed app width.

## Screen matrix

| Final frame(s) | Live implementation / entry | Status | Evidence / remaining work |
|---|---|---|---|
| 01 Learn · `e2o6q` | `/learning`, LiveLearningScreen overview | COMPLETE | Authenticated topic list, actual counts, workspace picker, working discovery/navigation; rendered comparison and responsive checks |
| 02 New activity · `hvR8U` | `/learning/new` | COMPLETE | All listed methods navigate to live screens. Goal creation exercised once. Book/reader advanced work has its own status below. |
| 03 Path · `DefJ1` | `/learning/mastery/{pathId}` or `view=topic` | COMPLETE | Live metadata/modules/progression, continue and secondary screens. No fabricated progress. |
| 04 / 131–136 Modules · `IQnCc`, `xtS37`, `D8RyO`, `NqVNL`, `RIo1P`, `y1ljt1`, `HMZgk` | `view=module&pathId=...&moduleId=...` | COMPLETE | One reusable dynamic module screen; all 13 modules in the real path rendered and opened. Actual objective IDs/names retained. |
| 05 Study session · `FqRwt` | `view=study` and existing session route | PARTIAL | Authenticated history, one real streaming submission, persisted reopen, compact bounded composer, resource/action panels. Structured question parsing/submission implemented; real assessment and interrupted-generation recovery not fully exercised. |
| 06 Review plan · `ubH7b` | `view=review` | PARTIAL | Real due reviews/settings/strategies; target and strategy writes implemented. No review scheduling mutation was performed on existing user work. |
| 07 Profile · `NFIba` | `view=profile` | COMPLETE | Real recorded fields or explicit missing state. Discuss action opens the current path's tutor. |
| 08 Sessions · `N9RlAh` | Existing path sessions route / `view=sessions` | COMPLETE | Real list, persisted reopen, fresh-session flow. Destructive actions have separate statuses. |
| 09 Books · `mIKUD` | `/learning/books`; BookTools; `view=book` | PARTIAL | Live list/can_create; proposal, approval, compile/pause/resume and text-block reader implemented from verified Book contracts. Generation/content not live-tested in the empty book library. |
| 10 Immersive reading · `ZnZ4h` | `/learning/reading` | PARTIAL | Real library/status and URL import. One small public source imported (HTTP202, backend ready). Native file/KB document import picker remains unfinished. |
| 11 Read & understand · `NeYvW` | `view=reader&id=...` | PARTIAL | Live text, saved position and reopen verified. Numeric section navigation, display size, selected-passage copy/paste fallback, context-aware tutor. PDF/EPUB visual rendering, native selection menu and read aloud unfinished. See separate live reader test result. |
| 126 Learning actions · `C9U3t` | Study overflow | PARTIAL | Meaningful hint/assessment/defer/broken-question/revision drafts, mode/configuration menus, skip endpoint, switch/leave. These are not invented per-action endpoints. Not every resulting backend tool was exercised. |
| 127 Review strategies · `jJi1S` | `view=strategies` / review screen | PARTIAL | Real strategy catalog/binding; custom interval editing not implemented. Tutor discussion is available. |
| 137 Original goal · `OGDxL` | `view=goal` | COMPLETE | Full persisted goal; discuss/revise preserves path context. |
| 153 / 154 Reset / delete · `EmQ3t`, `vtPMF` | Session-list confirmation modals | PARTIAL | Name confirmation and verified mutation contracts. No destructive test executed. |
| 58 Learning progress · `ZutbM` | `view=progress`, `/mobile/58` redirect | PARTIAL | Actual assessed mastery per path. Combined historical reading/journal analytics are not yet integrated. |
| Practice | `/learning/practice` | PARTIAL | Live summary/empty queue. Answer check and versioned review writes implemented, but account had no queued questions to grade. |
| Resources | Study paperclip panel | PARTIAL | Real KB/book/reading catalogs, count, source availability, session-reference add/remove with next message. Path context inspected on reopen. Reading-reference attach/remove persistence and preservation of the original source were verified live. KB/book references, file upload and some source types remain unverified/unimplemented. Resource preference persistence is verified; AI grounding in attached content is not established by that test. |
| Native Android verification | Same React Native screens | BLOCKED | No adb/emulator/device available. Native keyboard, cookie handling and touch behavior must still be checked on a device. |

Numbered `/mobile` Learning links now lead into real Learning entry points. Links without server record identifiers open discovery; they do not impersonate a source sample entity. The old fixture components remain available in source for regression tooling but are not the production Learning route implementations. Other app sections retain their existing routes.

## Architecture and behavior

- Existing Expo Router, AuthProvider, API configuration, Zustand preferences and shared UI controls retained. No dependency additions, native project generation, WebViews or bitmap screens.
- `src/features/learning/live/` owns typed API adapters, focused/cancellable server reads and mobile domain screens. Server data is not copied into an incompatible global cache. Local editor/selection/loading state stays separate.
- Shared `useLiveChat`/ChatConnection carries Learning turns and scoped session reads. Original frontend question/grade parsers and Book one-operation protocol helper were reused. Books require their own `/ws/books` protocol; ordinary study/reading chat shares `/ws`.
- HTTP 401/403/network failures remain distinct. Sign-in retains Learning query context. Workspace IDs are scoped by server and account. No test credentials, session cookies, tokens, or private message bodies were committed.
- Shared Button now correctly wraps arrays of text children; this was a real rendered native/web text-node error. ListRow accepts optional typography styles so Learning can match Inter without redesigning unrelated screens.
- New copy is registered in the existing localization inventory; new entries currently use English fallback in other languages. Full translation of the new Learning copy is not claimed.

## Verification

- TypeScript: `npx tsc --noEmit`.
- Lint: `npm run lint` (`expo lint`).
- Project tests: **51 passed** at the latest recorded run, including four Learning tests for durable assessment IDs, malformed grouped cards, cross-message verdicts, explicit workspace/cancellation, invalid proxy responses, and restored resource identifiers.
- Authenticated live REST: topics, detail, sessions/history, workspace catalog, models, review strategies, empty Books, KBs, Reading and practice summary/queue.
- Initial live mutation test: one goal and one brief study message; **64 content events**, server-created IDs, persisted transcript after reload. [Sanitized report](learning/live-submit-report.json).
- A second live test used one small public `https://example.com/` reading source and two short messages in the same verification session. Import/ready state, text, saved position, attachment persistence, removal persistence and preservation of the original material passed. [Resource report](learning/resources-report.json). The tutor did not confirm that it could see the attached source; this test proves stored reference association, not retrieval/grounding. Total created verification data: one goal, one study session, one reading material/collection; three user messages. No existing data was deleted.
- Read-only browser suite: **31 checks, zero JavaScript errors**, all real path modules, resource and overflow interactions, compact/multiline composer, persisted reopen (including a session without an outline), 320/390/768px overflow. [Report](learning/browser-readonly-report.json).
- Source/render comparisons actually performed for overview, study composer, path/module, review/profile/session/goal and empty discovery screens. They led to Inter/gutter, text-child, paperclip-badge, overflow styling and initial-history-scroll corrections. This is not pixel-perfect certification of every frame. Reader content, generated book states, visual question cards and native keyboard still have specific limitations above.
- Negative/refresh checks passed after the hook fix: simulated HTTP403 and network errors recover through Retry, live same-mode PUT returns 200, reset requires typed confirmation, and unauthenticated sign-in preserves query/session context. [Report](learning/error-recovery-report.json). Live URL ingestion, extracted text, reading-position PUT and reopen also passed using one small public reference source. [Report](learning/reading-report.json). The error suite exposed a focused-screen refresh issue; the final hook uses an explicit abortable request owner instead of a refresh counter.

## Reproduce the browser checks

The backend does not allow the Expo dev origin for credentialed CORS. Use a local development proxy without changing backend security:

```sh
npx expo start --web --port 8095
node scripts/learning-preview-proxy.cjs
PLAYWRIGHT_MODULE=/path/to/playwright \
LEARNING_TEST_USERNAME=your-test-account \
LEARNING_TEST_PASSWORD=your-test-password \
node tests/browser/verify-learning-live.cjs
```

`LEARNING_BACKEND_URL`, `LEARNING_EXPO_URL`, `LEARNING_PREVIEW_PORT`, `LEARNING_BASE_URL`, `LEARNING_WORKSPACE_ID`, and `LEARNING_OUTPUT_DIR` are configurable. An optional private `LEARNING_COOKIE_FILE` avoids providing a password. The committed suite is read-only; credentials are never printed. Screenshots can contain private content; keep its output outside Git.

## Remaining work

1. Exercise remaining generated-book and assessment states with small dedicated verification records.
2. Exercise KB/book associations, queued practice grading, mastery assessments and interruption/replay. Use small dedicated verification records rather than existing user progress.
3. Finish native file/source pickers, visual PDF/EPUB and audio/video rendering, read aloud, native passage-selection actions and interactive book blocks.
4. Complete combined learning-history analytics, custom strategy interval editing and translations.
5. Compare the remaining populated screens and run native Android/iOS keyboard/touch/cookie checks.
