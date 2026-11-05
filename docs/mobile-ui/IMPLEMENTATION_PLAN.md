# Implementation plan

Revision: 2026-11-05. **Focused mobile companion; UI-only.** This revision supersedes the full-port roadmap. Source baseline: DeepTutor v1.7.1, `f7aed0744c36c5afef16a4261c31ebee1208cac2`.

[Original inventory](audit/screen-inventory.md), [63 page files](audit/route-map.md), [197 captures](audit/screenshot-catalog.md), [design evidence](audit/design-system.md), and [audit limitations](audit/validation.md) are preserved. Previous planning documents are archived in [planning history](planning-history/full-port-baseline/README.md).

VERIFIED means source-confirmed behavior or the actual visible capture state, not successful backend operation. Most captures show shell/Retry, including Task Board CAP-134 inspected in this revision; populated interiors remain visually UNVERIFIED. All mobile layouts, routes added for presentation, and fixture outcomes below are PROPOSED. No new UI or backend integration is implemented by this revision.

## Preserve completed M0–M2

M0, M1 and M2 are complete within the original verification boundaries. Preserve [M0](M0_VERIFICATION.md), [M1](M1_VERIFICATION.md), [M2](M2_VERIFICATION.md), their screenshots/test scripts and all current code. M2 closure includes registration/hydration and temporary-password fixes; native Android was NOT RUN. Full original milestone checklists remain in the historical planning snapshot; they do not authorize M3–M9 full-port work.

## Revised milestones and dependencies

| Milestone | Scope and dependencies | Exit evidence |
|---|---|---|
| M0 — complete | Baseline quality and archive isolation | Preserve [M0 verification](M0_VERIFICATION.md) |
| M1 — complete | Design system, shell, shared dialogs/feedback, developer avatar | Preserve [M1 verification](M1_VERIFICATION.md); five-shelf implementation is historical, focused navigation is future work |
| M2 — complete | Auth/profile, search/workspace menu, overview pages, General/Appearance | Preserve [M2 verification](M2_VERIFICATION.md); browser/mock completion does not establish native Android verification |
| M3 — Chat and conversations (**M3.1 complete; M3.2 pending**) | M2; focused drawer/route allowlist; transcript/composer, model/tools/attachments, scripted streaming, actions, history/rename/delete/grouping, archive, viewer and preview. Include saved-original collections/save (S45–S47) early because chat actions depend on them | M3.1 verified in [M3_1_VERIFICATION.md](M3_1_VERIFICATION.md) (New→send→stream→stop/retry→branch/edit→history→archive/restore→reopen; no network). M3.2 remaining: viewers, reference pickers, structured replies, quiz/research, favorites/save |
| M4 — Mastery and Practice | M3; actual Learning hub/create chooser, goals/atlas/detail/route editing, Outline/Study/Review, assessments, daily review, bank/mistakes/import/categories, journal and progress | Create goal→outline→study→assessment→due review; scripted outcomes update the same path; distinct quiz/recall/flashcard semantics |
| M5 — Books and Immersive Reading | M4; books/proposal/spine/page blocks; material libraries/folders/import, reader/source locators, companion, annotations, media, saved position and continue learning; chat visualization/video rendering | Reopen correct page/passage/session; failed import/render preserves identity; bundled renderer tests and fallback per format; legacy watching maps to reading |
| M6 — Task Board | M3 (chat links); sequenced after M5 to prioritize learning. Board/status/date/archive filters, task detail/edit, moves, colors, archive/restore, chat task links | todo→doing→done plus failed move rollback; date filters and archive; no calendar route, task-delete control or fabricated task fields |
| M7 — Editable Notebook | M3 saved originals + M5 source locators; library/search/tree, page edit, source insertion, revisions/recovery, companion suggestions and notebook review | Create→edit→save→reopen; conflict retains draft; original record is not overwritten by note edit; meaningful local suggestion/review outcomes |
| M8 — Essential entry/settings integration | M3–M7; mocked server connection, retained auth/profile, General/Appearance/language, account/scope changes and selected search; optional overviews remain preserved | Cold start/change server/auth-disabled/register-closed/temporary-password cases; safe return paths; no credential/provider/admin setup; locale/theme and draft persistence |
| M9 — UI consistency and native Android verification | M8; cross-feature regression, accessibility, keyboard/Back, rendering/performance and evidence closure | Lint/typecheck; offline interaction scenarios; install/run Android development build on emulator/device and record device/API level, captures, Back/IME/TalkBack; export alone is insufficient |

## Stable-ID delivery checklist

### M1

Completed within recorded evidence; existing work is preserved.

- [x] `UI-SHELL` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ui-shell).
- [x] `UI-AVATAR-GALLERY` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ui-avatar-gallery).
- [x] `UI-CONFIRM` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ui-confirm).
- [x] `UI-FEEDBACK` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ui-feedback).
### M2

Completed within recorded evidence; existing work is preserved.

- [x] `MS-SEARCH` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-search).
- [x] `UI-ACCOUNT-WORKSPACE` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ui-account-workspace).
- [x] `MS-RESOURCES` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-resources).
- [x] `MS-PERSONALIZATION` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-personalization).
- [x] `MS-LOGIN` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-login).
- [x] `MS-REGISTER` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-register).
- [x] `MS-PROFILE` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-profile).
- [x] `MS-SETTINGS-general` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-settings-general).
- [x] `MS-SETTINGS-appearance` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-settings-appearance).
### M3 (In Progress — M3.1 Foundation Complete; M3.2 Pending)

M3.1 foundation evidence recorded in [M3_1_VERIFICATION.md](M3_1_VERIFICATION.md). **M3 overall is not yet complete.**

- [x] `MS-CHAT` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-chat). Core M3.1 foundation verified in [M3_1_VERIFICATION.md](M3_1_VERIFICATION.md); M3.2 advanced inline cards/viewers remain below.
- [ ] `UI-COMPOSER-PICKERS` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ui-composer-pickers). *M3.1 completed `ModelSelector` (`S06`) and local attachment chips/validation; `@mention`, Knowledge Base, and Notes reference pickers remain for M3.2.*
- [ ] `MS-SESSION-VIEWER` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-session-viewer). *(Deferred to M3.2)*
- [ ] `MS-FILE-PREVIEW` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-file-preview). *(Deferred to M3.2)*
- [x] `MS-HISTORY` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-history). Verified in [M3_1_VERIFICATION.md](M3_1_VERIFICATION.md).
- [x] `MS-SETTINGS-archive` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-settings-archive). Verified in [M3_1_VERIFICATION.md](M3_1_VERIFICATION.md).
- [ ] `UI-CAPABILITIES` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ui-capabilities). *M3.1 added capability trigger with explicit M3.2/M5 deferred notices; full `CapabilityConfigCard` controls remain for M3.2.*
- [ ] `UI-STRUCTURED-REPLY` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ui-structured-reply). *(Deferred to M3.2)*
- [ ] `UI-QUIZ` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ui-quiz). *(Deferred to M3.2)*
- [ ] `UI-RESEARCH` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ui-research). *(Deferred to M3.2)*
- [ ] `MS-FAVORITES` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-favorites). *(Deferred to M3.2)*
- [ ] `MS-FAVORITES-DETAIL` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-favorites-detail). *(Deferred to M3.2)*
- [ ] `UI-FAVORITES-SAVE` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ui-favorites-save). *(Deferred to M3.2; M3.1 shows explicit `Coming soon (M3.2)` handoff notice)*
- [ ] Apply focused drawer/search allowlist without deleting M0–M2 components; omitted future-phase actions are explicit unavailable states, not silent no-ops. *(M3.1 connected live `OrganizedSessionList` in `AppShell` and dynamic sessions in `MS-SEARCH`; final M3 allowlist closure remains open until M3.2 completes).*
### M4

- [ ] `MS-LEARNING` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-learning).
- [ ] `MS-LEARNING-CREATE` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-learning-create).
- [ ] `MS-MASTERY-LIBRARY` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-mastery-library).
- [ ] `UI-MASTERY-CREATE` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ui-mastery-create).
- [ ] `MS-MASTERY-DETAIL` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-mastery-detail).
- [ ] `MS-MASTERY-STUDY` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-mastery-study).
- [ ] `MS-PRACTICE` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-practice).
- [ ] `MS-QUESTION-BANK` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-question-bank).
- [ ] `MS-PRACTICE-SESSION` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-practice-session).
- [ ] `UI-PRACTICE-IMPORT` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ui-practice-import).
- [ ] `MS-JOURNAL` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-journal).
- [ ] `MS-PROGRESS` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-progress).
- [ ] `UI-PAGE-CUSTOMIZE` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ui-page-customize).
- [ ] `UI-QUESTION-CATEGORIES` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ui-question-categories).
- [ ] `UI-MASTERY-ROUTE-EDIT` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ui-mastery-route-edit).
### M5

- [ ] `UI-VISUAL-RESULT` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ui-visual-result).
- [ ] `MS-BOOKS` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-books).
- [ ] `MS-BOOK-CREATE` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-book-create).
- [ ] `MS-BOOK-READER` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-book-reader).
- [ ] `MS-READING-LIBRARY` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-reading-library).
- [ ] `MS-READING-MATERIALS` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-reading-materials).
- [ ] `MS-READING-FOLDER` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-reading-folder).
- [ ] `MS-READING` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-reading).
- [ ] `UI-READING-ACTIONS` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ui-reading-actions).
- [ ] `ADAPTER-LEGACY-WATCH` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#adapter-legacy-watch).
- [ ] `UI-BOOK-BLOCKS` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ui-book-blocks).
### M6

- [ ] `MS-TASKS` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-tasks).
- [ ] `UI-TASK-DETAIL` — S64 child editor/action sheet; no new source surface and no delete action.
### M7

- [ ] `MS-NOTES` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-notes).
- [ ] `MS-NOTE-EDITOR` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-note-editor).
- [ ] `UI-NOTE-REVIEW` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ui-note-review).
- [ ] `UI-NOTE-INSERT-SOURCES` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ui-note-insert-sources).
- [ ] `UI-NOTE-REVIEW-MARGIN` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ui-note-review-margin).
### M8

- [ ] `MS-SERVER-CONNECTION` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ms-server-connection).
- [ ] `UI-LANGUAGE (retained S81 integration)` — [specific acceptance](MOBILE_PRODUCT_SCOPE.md#ui-language).
- [ ] Integrate existing MS-LOGIN, MS-REGISTER, MS-PROFILE, MS-SETTINGS-general, MS-SETTINGS-appearance, MS-SEARCH and UI-ACCOUNT-WORKSPACE with selected-server/scope transitions; preserve optional MS-RESOURCES/MS-PERSONALIZATION code and remove excluded destinations from the focused entry set.

### M9 — final acceptance

- [ ] Exercise every selected screen and owner-local overlay against the source/action/state contracts; complete all required capabilities, including later handoffs from earlier milestones.
- [ ] Verify chat → save original → notebook, mastery/reading → history → exact session, task → linked chat, reading → mastery, and material → editable note without broken IDs or duplicated records.
- [ ] Verify all visible buttons, menus, gestures, filters and retry/cancel/confirm paths produce meaningful mock outcomes; none call external services.
- [ ] Preserve source theme tokens/fonts/icons/locales, Classic/Modern preferences and reader/text settings; test long strings, large font, reduced motion and accessibility.
- [ ] Run lint/typecheck and appropriate repository/state/interaction checks; inspect network traffic for no backend/provider calls.
- [ ] Run an installed Android build on emulator/device: document device/API level, Back/IME, gestures, TalkBack, rotation/restoration where supported, long transcript/list responsiveness and renderer behavior. Capture actual result states, not only loading shells.
- [ ] Preserve original audit evidence; record source visual uncertainties honestly. A missing device run or renderer is an open gate, not a passing export.

## Shared implementation contract

Use typed mock repository interfaces with deterministic clocks/IDs and source-shaped projections. No API/client imports, REST, WebSocket, OAuth, OpenRouter, remote media or provider probes. Preserve existing API contracts as reference only; a future adapter requires separate authorization. All currently selected source surfaces are scheduled; excluded surfaces have no milestone and no implementation checklist.

[MOBILE_PRODUCT_SCOPE.md](MOBILE_PRODUCT_SCOPE.md#screen-by-screen-acceptance-criteria) is the authoritative per-screen acceptance contract, including all stable screen IDs and owner-local interfaces. [SCREEN_MAPPING.md](SCREEN_MAPPING.md) supplies exact source components/routes, significant states, dialogs and captures. [MOCK_DATA_SPEC.md](MOCK_DATA_SPEC.md) supplies typed repositories and transition cases.

A milestone is not complete because its root route renders. Feature dialogs, failure recovery, selected cross-feature dependencies and actual interaction evidence must be present. Missing later owners are explicitly gated during incremental previews and resolved by the full MVP gate; no permanent placeholders count as final delivery. No M3 UI is authorized by this planning update.
