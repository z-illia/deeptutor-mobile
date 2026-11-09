# Study Session approved-design update

Date: 2026-11-09. Scope: the existing `LiveStudyScreen`, shared Tutor composer/transport, and Learning resource picker. No new screen or state-management library. Mastery Path navigation/structure and ordinary Tutor presentation remain intact.

## Current Pen.dev source

Read the live editable `MOBILE DARK 05 · Learning / Study session` (`FqRwt`) and `MOBILE DARK 12 · Tutor / Tutor` (`Xmj8E`) through Pencil MCP. The latest Study frame is **390×914**, superseding the earlier 850px/958px-height handoffs. The document was not edited.

- Background `#1A1918`, primary text `#E8E4DE`, muted `#9B9590`, orange `#D4734B`, card `#242220`, border `#3A3634`.
- Inter headings/body; 20px gutters, 24px content gaps, 12px code/notice corners.
- Starter row `Ht41Q`: three **110×40** label-only controls, 8px gap/corners/padding, 14px orange icon and 12px medium title. Updated from live editable layers on 2026-11-09; older frame metadata still describes the previous 132×84 cards. Subtitles remain accessibility hints. A 2px vertical inset/hit slop on each side provides a 44px touch area without enlarging the visible controls. Horizontal scrolling/snapping is explicit in the design; at larger widths all three fit. The row appears once after the latest explanation/code, before a structured or exact backend-supplied current question. It is never added to Mastery Path.
- Answer input: 52px collapsed, bounded to 112px (approximately four lines); integrated 40px send/stop. Exact placeholder `Explain your reasoning...`. Paperclip and ellipsis are the only toolbar controls; touch areas are at least 44px.
- Resource and action dialogs use the reusable bottom sheet, backdrop dismissal, Android back handling, web Escape/focus restoration, safe-area and keyboard avoidance. Sheets cap viewport height and scroll internally.

Reference exported to `/tmp/deeptutor-study-update/design/FqRwt.png`. Rendered comparisons at 320/390/480px, the action menu, and a live response are in `/tmp/deeptutor-study-update/`. Screenshots may contain private learning content and are not committed.

## Behavior and status

| Feature | Status | Actual behavior / limits |
|---|---|---|
| Compact contextual cards | COMPLETE implementation; PARTIAL live coverage | Quick Check requests diagnostic assessment, Teach Me an intuitive explanation and concrete example, Challenge a practical scenario. All submit through the same mastery session with `mastery_session_mode:'study'`, current objective ID/name and selected resources. Teach Me was exercised live; the other prompts and wire context were unit/component/browser tested. No invented strategy endpoint. |
| Current-question replacement | PARTIAL | If a known ungraded mastery card is pending, a new starter submits its real `question_id` in `mastery_skip` before requesting the next interaction. No inferred IDs, invented grading or repeated starter rows. Pending grouped/visual assessment variants still need live coverage. |
| Compact answer composer | COMPLETE web / bundle verification | Shared TutorComposer compact mode, bounded multiline height, empty validation, stop/submitting state, duplicate guards, failed-send/error/rejection draft restoration. Ordinary Tutor defaults remain unchanged. |
| Unified resources | COMPLETE core implementation; PARTIAL populated-data coverage | Searchable categories: Attach files, Chat History, Books, Favorites, Question Bank, Knowledge, plus existing Reading materials. Available choices are distinct from attached selections; real reference IDs and removal lists are preserved. Catalog errors offer retry. Path context is read-only in this picker and explicitly requires tutor revision. |
| File picking/submission | COMPLETE web/live; BLOCKED device verification | SDK58 `expo-document-picker` and `expo-file-system`; text/PDF/image files, server limits further capped at 4MB/file and 8MB total on mobile. File bytes stay in memory until submitted; server stores message attachments. A tiny text attachment was sent, stored with a server ID, and recovered on reopen. PDF parsing, images and native system picker have not been exercised on a device. |
| Attachment count | COMPLETE | Counts actual reference selections, non-goal path sources and pending files; excludes available catalog entries and historical message files. Sent files remain viewable in conversation history and do not masquerade as session-level attachments. |
| More actions | COMPLETE UI/navigation; PARTIAL live tool coverage | Hint and Defer objective send contextual mastery requests; Switch learning path/Leave session confirm before navigating to existing routes. Unsent answer/selections are retained in a bounded memory cache scoped by server/user/workspace/session. Session setup preserves the existing model/mode/skills/connections configuration interface without another toolbar icon. |
| Backend persistence | COMPLETE verified subset | Reference associations persist with the next turn. Files persist on message rows. Local removals do not delete original resources or old messages. No generic session-preferences endpoint was invented. The existing shared transport restores server history and configuration. |
| Native keyboard/touch/back | BLOCKED | No Android device, emulator or adb available. Android/iOS JS exports pass; that does not prove device interaction or cookie behavior. Existing custom development builds must include/rebuild the newly added Expo native modules. |

Unsent drafts are memory-only (eight session entries), cleared when the app process/page closes. They are not credentials or durable server history. Empty/missing objective states explain why starter/hint/defer actions are disabled.

## Verified contracts

All REST uses the authenticated shared Axios client and explicit `dt_workspace`; the existing server configuration remains configurable for web/native.

| Operation | Contract actually used |
|---|---|
| Objective/progress | GET `/api/mastery-paths/topics/{path_id}` (`next`, `map`, sources/profile) |
| Session history | GET `/api/sessions/{session_id}`; GET `/api/mastery-paths/topics/{path_id}/sessions` |
| Strategies, answer, hint/defer, attachments | Shared `/ws?dt_workspace=...`, protocol2 `start_turn`, `capability:'mastery_path'`, `mastery_path_id`, `mastery_session_mode:'study'`, selected context, `mastery_answer`/`mastery_skip` when applicable, `attachments:[{type:'file'|'image',base64,filename,mime_type}]` |
| Learning strategy semantics | Backend mastery tools own `probe_first`/`teach_first` in learner profile; `mastery_defer_objective` handles deferral. A button sends the explicit pedagogical request; it does not fabricate a new persistent strategy enum. |
| Knowledge / Books | GET `/api/knowledge-bases`; GET `/api/books`; GET `/api/books/{id}?include_blocks=false`; turn `knowledge_bases` / `book_references` |
| Chat History | GET `/api/sessions?limit=50&offset=0`, excluding current/archived; turn `history_references:string[]` |
| Favorites | GET `/api/notebooks`, GET `/api/notebooks/{id}`; turn `notebook_references:[{notebook_id,record_ids:[]}]` selects a saved collection. This is distinct from Question Bank. |
| Question Bank | GET `/api/question-notebook/entries?limit=50&offset=0`; turn `question_notebook_references:number[]` |
| Reading | Existing GET reading library/detail; turn `reading_references:[{material_id,revision,locators:[]}]` |
| File policy | GET `/api/settings/chat-attachments`, `effective.max_file_bytes/max_total_bytes`. No standalone upload endpoint is invented. |
| Session setup | Existing model/config catalogs and PUT `/api/mastery-paths/topics/{path_id}/sessions/{session_id}/mode`; existing Tutor configuration retained |

Source contracts checked against the original frontend's `ComposerResources`, `pending-attachments.ts`, `notebook-api.ts`, and backend `core/turn_request.py`, mastery tools, settings and notebook/session routers under `/tmp/deeptutor-ui-audit/source`. Live authentication/catalog/limit responses matched these shapes. New catalog selections beyond the first 50 history/questions are not yet paginated; selected historical IDs still resolve individually.

## Files and reusable components

Modified: `LiveStudyScreen.tsx`, Learning `repository.ts`, shared `TutorComposer.tsx`, `useLiveChat.ts`, `configuration.ts`, `protocol.ts`, `package.json`/lockfile, locale inventory/bundles, and the Learning documentation maps.

New reusable UI: `StudyActionRow.tsx`, `StudyResourcesSheet.tsx`, `src/shared/ui/BottomSheet.tsx`. Supporting modules: `study-actions.ts`, `study-resources.ts`, `study-files.ts`, `study-drafts.ts`. Reused: ChatMarkdown, MasteryQuestionCard, ModelSelectionDialog, shared controls/theme, useLearningData, AuthProvider, API client and ChatConnection. No duplicate Study screen or new WebSocket transport.

Tests: `tests/study-session.test.cjs` and `tests/browser/verify-study-session.cjs`.

## Executed validation

- `npx tsc --noEmit`, `npm run lint`: passed.
- `npm test`: **56 passed**, including five new tests for contextual prompts, exact question splitting, selections/count/removal, component accessibility, shared transport empty/duplicate/rejection behavior and scoped draft restoration.
- Browser: **8 scenario groups passed**, zero runtime errors. Uses real authentication/catalogs/history; strategy rejection is deliberately intercepted to verify payload/context and error handling without mutating an existing user's path. Also checks Expo web file picking/removal, sheet categories/search, leave/restore navigation, 320/390/480px layout and no Mastery Path starters. [Report](learning/study-update/browser-report.json).
- Separate live test: one small verification goal/session, one Teach Me message and one tiny text file. **202 content events**, persisted study mode/path context, server-stored attachment ID, and history/file restoration. [Sanitized report](learning/study-update/live-report.json). No existing records were deleted.
- `npx expo export --platform all --output-dir /tmp/deeptutor-study-final-export`: Android, iOS, Web and server-render exports passed. These are bundle exports, not signed builds or device tests.
- Pen.dev/rendered comparisons actually inspected. Content differs because the app renders server material; no source screenshot is used as UI. Device verification, every live strategy/tool outcome, populated Books/Favorites/Question Bank references, and media parsing remain limited as above.

### Label-only row follow-up

Re-inspected the live `Ht41Q`/`nlre7` layers: controls are now 110×40, not the stale 132×84 metadata values. Removed visible subtitles; retained accessibility hints, selection, disabled behavior and existing handlers. TypeScript, ESLint and all five Study Session tests passed. An isolated React Native Web rendering measured all three controls at 110×40 on a single row at 390px and 320px, without viewport overflow. Compared the rendered 390px row with the exported current Pen.dev row; captures are in `/tmp/study-action-row-update/`. This follow-up does not claim a new native-device test.
