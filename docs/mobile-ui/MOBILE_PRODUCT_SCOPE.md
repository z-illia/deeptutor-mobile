# DeepTutor Mobile product scope

Revision: 2026-11-05. **Focused mobile companion; UI-only.** This revision supersedes the full-port roadmap. Source baseline: DeepTutor v1.7.1, `f7aed0744c36c5afef16a4261c31ebee1208cac2`.

[Original inventory](audit/screen-inventory.md), [63 page files](audit/route-map.md), [197 captures](audit/screenshot-catalog.md), [design evidence](audit/design-system.md), and [audit limitations](audit/validation.md) are preserved. Previous planning documents are archived in [planning history](planning-history/full-port-baseline/README.md).

VERIFIED means source-confirmed behavior or the actual visible capture state, not successful backend operation. Most captures show shell/Retry, including Task Board CAP-134 inspected in this revision; populated interiors remain visually UNVERIFIED. All mobile layouts, routes added for presentation, and fixture outcomes below are PROPOSED. No new UI or backend integration is implemented by this revision.

## Product vision

An Android-first learning companion for conversations, guided mastery, studying real materials, organizing study tasks and keeping notes. It will use the existing self-hosted DeepTutor backend in a separately authorized integration phase. It is not a full web port or server administration client.

## Explicitly selected capabilities and source ownership

| Capability | Actual web source/routes | Selected audit IDs | Delivery |
|---|---|---|---|
| Chat and relevant controls | `/chat`, `/chat/[sessionId]`; ChatWorkspace, ChatComposer, ModelSelector, ChatMessageList, activity/file viewers | S04–S08, S11–S15 | M3; advanced local result renderers M5 |
| Conversations | `/space/chat-history`, `/settings/archive`; ChatHistorySection, OrganizedSessionList, SessionActionsMenu | S09–S10 | M3 |
| Mastery Path | `/learning/mastery`, `/learning/mastery/[pathId]`, `/sessions` and `/sessions/[sessionId]`; TopicAtlas, CreateTopicWizard, StudyOutline, LearningBoard, MasteryStudy | S18–S22, S120 | M4 |
| Actual Learning workflows | `/learning`, `/learning/new`, `/learning/practice`, `/space/questions`, `/learning/books` and book/page URLs, `/learning/reading` and materials/folder/collection/session URLs; `components/learning/surfaces.ts` | S16–S17, S23–S37, S116, S119, S124 | M4–M5 |
| Progress and continue learning | `/settings/progress`, `/space/journal`; source record/session/page links in LearningDashboard and learning route helpers | S48, S79 plus owning learning IDs | M4–M5 |
| Task Board | `/kanban`; KanbanBoard, TaskPanelSection, TaskLinkSelector | S64; UI-TASK-DETAIL is a child | M6 |
| Notebook | `/co-writer`, `/co-writer/[docId]` editable notes; `/notebooks`, `/notebooks/[notebookId]` saved originals | S45–S47, S62–S63, S121–S123 | Saved-original dependency M3; editable notebook M7 |
| Essential application UI | `/login`, `/register`, `/profile`, `/settings/general`, `/settings/appearance`; source language controls | S73–S75, S81–S82 | Retain M2; integrate M8 |
| Server connection | No independent audited web surface; web `shared/api/client.ts` assumes deployment-relative origin, auth pages own status/login. User-required mobile deployment selection | MOBILE-01 / MS-SERVER-CONNECTION | M8, mock only |

Every selected S ID has exact source-component links, route, overlays, significant source states and capture references in [Screen mapping](SCREEN_MAPPING.md). The matrix above summarizes rather than replaces those records. Embedded Research/Quiz/Visualize/video results are included only as existing chat/learning controls, not new top-level applications. Select existing model/resource/tool options without exposing provider credentials or resource administration.

## Included IDs and counts

- **IN SCOPE: 54 of the original 135 audited surfaces**, mapping to **32 distinct mobile screen contracts** plus their sheets/embedded interfaces.
- **One additional mobile-specific screen**, `MS-SERVER-CONNECTION` (MOBILE-01), has no audited equivalent and is excluded from the 135-surface denominator.
- **Total selected mobile screen contracts: 33**, including Server connection.
- **SUPPORTING: 9 audited surfaces**, including **3 screen contracts**: `MS-SEARCH`, `MS-RESOURCES`, `MS-PERSONALIZATION`. The rest are shared UI, a compatibility adapter and a developer gallery.
- **OUT OF SCOPE: 72 audited surfaces**. These are surfaces, not necessarily standalone pages; no mobile milestone is assigned.

Selected screen IDs: `MS-CHAT`, `MS-SESSION-VIEWER`, `MS-FILE-PREVIEW`, `MS-HISTORY`, `MS-SETTINGS-archive`, `MS-LEARNING`, `MS-LEARNING-CREATE`, `MS-MASTERY-LIBRARY`, `MS-MASTERY-DETAIL`, `MS-MASTERY-STUDY`, `MS-PRACTICE`, `MS-QUESTION-BANK`, `MS-PRACTICE-SESSION`, `MS-BOOKS`, `MS-BOOK-CREATE`, `MS-BOOK-READER`, `MS-READING-LIBRARY`, `MS-READING-MATERIALS`, `MS-READING-FOLDER`, `MS-READING`, `MS-FAVORITES`, `MS-FAVORITES-DETAIL`, `MS-JOURNAL`, `MS-NOTES`, `MS-NOTE-EDITOR`, `MS-TASKS`, `MS-LOGIN`, `MS-REGISTER`, `MS-PROFILE`, `MS-PROGRESS`, `MS-SETTINGS-general`, `MS-SETTINGS-appearance`, `MS-SERVER-CONNECTION`.

Selected audit IDs: S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23, S24, S25, S26, S27, S28, S29, S30, S31, S32, S33, S34, S35, S36, S37, S45, S46, S47, S48, S62, S63, S64, S73, S74, S75, S79, S81, S82, S116, S119, S120, S121, S122, S123, S124.

Supporting audit IDs: S01, S02, S03, S38, S39, S40, S80, S134, S135.

## Excluded features

Knowledge Base administration/creation/indexing, GitHub/Web Source management, embedding/RAG engines, provider credentials and advanced model/service configuration, users/server administration and desktop settings are web-only. Calendar, Partners/groups/channels, agent management/history import, memory workbenches, skills/personas libraries, MCP/CLI management, Whisper and session-handoff creation/redemption are also excluded because they were not selected. No future milestone below schedules these features. Existing prepared assets, source archives and M0–M2 code are retained.

S06 resource choices are bounded to existing selected-resource references and read-only eligible catalogs. A tool can be selected without implementing the tool's server configuration. Knowledge-base reference selection, if required by an existing chat turn, is a read-only catalog within S06, never S41–S44/S125–S127 administration. Partner/group/subagent and memory-management journeys do not follow implicitly from the broad original picker inventory. Old unsupported references can show a source-compatible unavailable state without implementing their feature owners.

## Supporting screens and preservation

M0–M2 remain complete within their recorded verification scope. M1 shell/avatar/confirm/feedback and M2 search/workspace/account/auth/profile/settings/overviews remain untouched in this task. `/space` and `/personalization` become retained optional support pages, not default destinations. `/explore` and `/avatar-preview` remain development previews. Workspace selection is supporting context; workspace creation/configuration is not selected. Focused navigation filtering is future M3 work, with end-to-end entry/settings integration in M8. Historical browser verification and Hermes export are preserved; neither establishes native Android behavior.

## Navigation structure

```text
Root / entry boundary
├─ Server connection — MS-SERVER-CONNECTION (mobile-specific, mocked)
├─ Login / Register — MS-LOGIN / MS-REGISTER
└─ Focused app drawer (no mandatory bottom tab bar)
   ├─ Chat — MS-CHAT
   │  ├─ New conversation /chat
   │  ├─ Conversation /chat/[sessionId]
   │  ├─ History — MS-HISTORY /space/chat-history
   │  │  └─ Archived — MS-SETTINGS-archive /settings/archive
   │  └─ Result/activity viewer and file preview (root presentation stack)
   ├─ Learning — MS-LEARNING /learning
   │  ├─ Create chooser — MS-LEARNING-CREATE
   │  ├─ Mastery atlas → goal creation → path detail → Outline/Study/Review
   │  ├─ Practice → question session; Question Bank / Mistakes → categories/import
   │  ├─ Books → proposal/spine creation → book/page reader → tutor/captures
   │  ├─ Immersive Reading → materials/folders → reader ↔ companion/session
   │  └─ Progress /settings/progress; read-only Journal /space/journal
   ├─ Task Board — MS-TASKS /kanban
   │  └─ Task detail/editor sheet — UI-TASK-DETAIL (S64 child)
   └─ Notebook — MS-NOTES /co-writer
      ├─ Editable page — MS-NOTE-EDITOR /co-writer/[docId]
      ├─ Page tree / sources / companion / flashcard review
      └─ Saved originals — MS-FAVORITES /notebooks
         └─ Collection and focused record — MS-FAVORITES-DETAIL

Drawer header: existing workspace switcher (select existing scopes only)
Drawer footer: Profile → General (language) / Appearance / Server connection
Root search: MS-SEARCH, limited to selected accessible destinations/records
Shared overlays: model/tools/references, Save original, confirmation, feedback
Retained optional routes: /space, /personalization (M2); /explore, /avatar-preview (dev)
```

No separate bottom tab is required for every capability. [Navigation architecture](NAVIGATION_ARCHITECTURE.md) specifies phone adaptations, source transitions, identities, Back behavior, dependencies and route exclusions.

## MVP definition

The **UI-only MVP is complete only after M3–M9**: all selected capabilities above operate with realistic deterministic typed fixtures, every visible interaction has a meaningful outcome, error/retry/empty/busy states work, and native Android verification has evidence. Intermediate M3 and M4 demos are incremental checkpoints, not the full requested MVP. Books, Reading, Task Board and Notebook are not silently postponed beyond MVP.

An MVP UI is not a production connected app. No REST, WebSocket, Codex OAuth, OpenRouter or other external service is called. No real server probe, file ingestion, model generation or account creation is implied by mock success.

## Post-MVP scope

A separately authorized backend integration phase may connect the selected flows to the existing self-hosted contracts, after checking deployed version, capabilities, auth/session handling, streaming protocol, upload support and deployment-origin compatibility. Do not change existing web API shapes or the existing mobile client in this planning task. Transport design and implementation are not part of M3–M9. Larger-device/iOS polish can follow Android verification. Excluded administration/product features remain excluded unless explicitly respecified; they are not a hidden post-MVP backlog.

## Milestone breakdown

| Milestone | Scope and dependencies | Exit evidence |
|---|---|---|
| M0 — complete | Baseline quality and archive isolation | Preserve [M0 verification](M0_VERIFICATION.md) |
| M1 — complete | Design system, shell, shared dialogs/feedback, developer avatar | Preserve [M1 verification](M1_VERIFICATION.md); five-shelf implementation is historical, focused navigation is future work |
| M2 — complete | Auth/profile, search/workspace menu, overview pages, General/Appearance | Preserve [M2 verification](M2_VERIFICATION.md); browser/mock completion does not establish native Android verification |
| M3 — Chat and conversations | M2; focused drawer/route allowlist; transcript/composer, model/tools/attachments, scripted streaming, actions, history/rename/delete/grouping, archive, viewer and preview. Include saved-original collections/save (S45–S47) early because chat actions depend on them | New→send→stream→stop/retry→history→reopen; draft retention and no duplicate messages; save original and reopen it; history kind/group rules; no network |
| M4 — Mastery and Practice | M3; actual Learning hub/create chooser, goals/atlas/detail/route editing, Outline/Study/Review, assessments, daily review, bank/mistakes/import/categories, journal and progress | Create goal→outline→study→assessment→due review; scripted outcomes update the same path; distinct quiz/recall/flashcard semantics |
| M5 — Books and Immersive Reading | M4; books/proposal/spine/page blocks; material libraries/folders/import, reader/source locators, companion, annotations, media, saved position and continue learning; chat visualization/video rendering | Reopen correct page/passage/session; failed import/render preserves identity; bundled renderer tests and fallback per format; legacy watching maps to reading |
| M6 — Task Board | M3 (chat links); sequenced after M5 to prioritize learning. Board/status/date/archive filters, task detail/edit, moves, colors, archive/restore, chat task links | todo→doing→done plus failed move rollback; date filters and archive; no calendar route, task-delete control or fabricated task fields |
| M7 — Editable Notebook | M3 saved originals + M5 source locators; library/search/tree, page edit, source insertion, revisions/recovery, companion suggestions and notebook review | Create→edit→save→reopen; conflict retains draft; original record is not overwritten by note edit; meaningful local suggestion/review outcomes |
| M8 — Essential entry/settings integration | M3–M7; mocked server connection, retained auth/profile, General/Appearance/language, account/scope changes and selected search; optional overviews remain preserved | Cold start/change server/auth-disabled/register-closed/temporary-password cases; safe return paths; no credential/provider/admin setup; locale/theme and draft persistence |
| M9 — UI consistency and native Android verification | M8; cross-feature regression, accessibility, keyboard/Back, rendering/performance and evidence closure | Lint/typecheck; offline interaction scenarios; install/run Android development build on emulator/device and record device/API level, captures, Back/IME/TalkBack; export alone is insufficient |

The early saved-original implementation in M3 is a dependency choice: chat/learning Save actions need real mock destinations before editable Notebook M7. Materials M5 precedes tasks/notebook to prioritize learning and establish source locators. M3–M7 use an injected fixture server, so server-selection UI M8 does not block them.

## Screen-by-screen acceptance criteria

Each screen below must satisfy its specific behavior plus the source loading/empty/error/completed and overlay states in SCREEN_MAPPING. For proposed mobile operation failures, retain owner data/draft, expose a meaningful retry, prevent duplicate mutations and provide a return action. Apply the verified DeepTutor design roles from COMPONENT_MAPPING; fixture success is not evidence of backend success. M0–M2 acceptance is preserved, while focused integration checks are new pending work.

### MS-SEARCH

S02; `/ui/search`; SUPPORTING. Owner milestone: M2; focused integration M8.

Retain M2 search interaction; narrow results to selected accessible routes and records. Result opens exact owner, no-results is distinct from denied/error, dismiss restores origin. Do not retain Partners/groups/admin hits in the focused search index.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-033](audit/screenshots/snow-1440-033--chat.png), [CAP-131](audit/screenshots/dark-412-033--chat.png); host state only unless actual form captured

### MS-CHAT

S04, S05; `/chat or /chat/[sessionId]`; IN SCOPE. Owner milestone: M3.

New and restored conversations share one contract. Send creates one session and scripted turn; show incremental text/Markdown/code, stop, retry and source-supported edit/copy/save actions. Preserve failed draft and scroll; opening history must not duplicate the stream. Validate supported attachment metadata and simulate processing/failure/cancel. Model/tools selection snapshots into the sent turn; no model setup or provider login.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-032](audit/screenshots/snow-1440-032--chat-audit-missing-record.png), [CAP-130](audit/screenshots/dark-412-032--chat-audit-missing-record.png); host state only unless actual form captured

### MS-SESSION-VIEWER

S07; `/ui/session-viewer`; IN SCOPE. Owner milestone: M3.

Open a typed result/activity reference from a selected owner; preserve source tab open/close/active state and return context. Expand supported tool/activity details; display bundled result payloads. Partner consultation/subagent-management workflows are excluded; unsupported legacy result types show a clear unavailable state.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-033](audit/screenshots/snow-1440-033--chat.png), [CAP-131](audit/screenshots/dark-412-033--chat.png); host state only unless actual form captured

### MS-FILE-PREVIEW

S08; `/ui/file-preview`; IN SCOPE. Owner milestone: M3.

Open a bundled source-supported file type with loading, decode failure, unsupported fallback and ready content. Preserve file reference and owner selection on Back. File actions must have an observable local result; do not upload/download from a server.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-033](audit/screenshots/snow-1440-033--chat.png), [CAP-131](audit/screenshots/dark-412-033--chat.png); host state only unless actual form captured

### MS-HISTORY

S09; `/space/chat-history`; IN SCOPE. Owner milestone: M3.

Search title/content as source supports; filter kinds/archive; open exact chat/mastery/reading destination. Rename, pin/unpin, archive/restore and confirmed delete update the same fixture record everywhere. Normal grouping is by source mastery path/reading collection; search disables hand grouping/order. No arbitrary folder CRUD invented. Scope switch must not leak another workspace record.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-023](audit/screenshots/snow-1440-023--space-chat-history.png), [CAP-121](audit/screenshots/dark-412-023--space-chat-history.png); host state only unless actual form captured

### MS-SETTINGS-archive

S10; `/settings/archive`; IN SCOPE. Owner milestone: M3.

Search archived sessions; restore keeps the original session ID and moves it to active history. Confirmed permanent conversation deletion removes only the named session; failed action retains the list. Enter from History; no settings Apply bar.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-062](audit/screenshots/snow-1440-063--settings-archive.png), [CAP-160](audit/screenshots/dark-412-063--settings-archive.png); host state only unless actual form captured

### MS-LEARNING

S16; `/learning`; IN SCOPE. Owner milestone: M4.

Show Books, Mastery Path, Practice and Immersive Reading from surfaces.ts with their own records/counts/availability. Open exact existing record for continue learning, including saved position/session. No invented study-session, course, streak, badge or grading system. Source-hidden versus unavailable versus empty remain distinct.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-045](audit/screenshots/snow-1440-045--learning.png), [CAP-143](audit/screenshots/dark-412-045--learning.png); host state only unless actual form captured

### MS-LEARNING-CREATE

S17; `/learning/new`; IN SCOPE. Owner milestone: M4.

Chooser dispatches Books proposal, Mastery goal wizard, Practice import and Reading material flow. Empty eligible/hidden set has customization recovery. Each choice reaches its actual owner; during staged development a not-yet-built owner is explicitly unavailable, never a completed flow.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-044](audit/screenshots/snow-1440-044--learning-new.png), [CAP-142](audit/screenshots/dark-412-044--learning-new.png); host state only unless actual form captured

### MS-MASTERY-LIBRARY

S18; `/learning/mastery`; IN SCOPE. Owner milestone: M4.

Render goal/path cards and mastery indicators; open same path; create goal opens UI-MASTERY-CREATE. Empty atlas and failed list differ. Successful mock creation appears once in atlas and resumes Outline.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-043](audit/screenshots/snow-1440-043--learning-mastery.png), [CAP-141](audit/screenshots/dark-412-043--learning-mastery.png); host state only unless actual form captured

### MS-MASTERY-DETAIL

S20; `/learning/mastery/[pathId]`; IN SCOPE. Owner milestone: M4.

Keep pathId, goal/sources, modules/knowledge points and objective report. Outline/board, session list, review trail and source-supported strategy/retention controls retain separate failure states. Study/Review resume correct path. Edit route updates that path; reset and permanent delete require distinct confirmations and consequences.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-040](audit/screenshots/snow-1440-040--learning-mastery-audit-missing-record.png), [CAP-138](audit/screenshots/dark-412-040--learning-mastery-audit-missing-record.png); host state only unless actual form captured

### MS-MASTERY-STUDY

S21, S22; `/learning/mastery/[pathId]/sessions or /learning/mastery/[pathId]/sessions/[sessionId]`; IN SCOPE. Owner milestone: M4.

Outline/Study/Review are source modes. Restore persisted session and its mode; disable invalid mode changes during live turns. Answer/skip source question cards; fixed assessment outcomes update path progress/review trail once. Retain source celebration/session camp and return to the same path/point.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-041](audit/screenshots/snow-1440-041--learning-mastery-audit-missing-record-sessions-audit-missing-record.png), [CAP-139](audit/screenshots/dark-412-041--learning-mastery-audit-missing-record-sessions-audit-missing-record.png); host state only unless actual form captured

### MS-PRACTICE

S23; `/learning/practice`; IN SCOPE. Owner milestone: M4.

Present due/overdue/next-due summary; start a stable review queue; distinguish caught-up from failure. Returning from review updates completed/skip counts. Do not compute a new spaced-repetition algorithm.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-046](audit/screenshots/snow-1440-046--learning-practice.png), [CAP-144](audit/screenshots/dark-412-046--learning-practice.png); host state only unless actual form captured

### MS-QUESTION-BANK

S24; `/space/questions`; IN SCOPE. Owner milestone: M4.

Bank/Mistakes tabs, search/scope/category filters, bulk selection/category management, bookmark and source-supported deletion all mutate shared question fixtures. Start practice from the chosen entries with original contentWorkspaceId references.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-029](audit/screenshots/snow-1440-029--space-questions.png), [CAP-127](audit/screenshots/dark-412-029--space-questions.png); host state only unless actual form captured

### MS-PRACTICE-SESSION

S25; `/learning/practice/session`; IN SCOPE. Owner milestone: M4.

Answer/reveal/fixed judgment precedes source recall rating; preserve source rating identifiers and copy. Again remains queued as fixture script specifies; retries cannot double-rate. Completion, stale/conflict reload and skipped questions are distinct from quiz grading.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-029](audit/screenshots/snow-1440-029--space-questions.png), [CAP-127](audit/screenshots/dark-412-029--space-questions.png); host state only unless actual form captured

### MS-BOOKS

S27; `/learning/books`; IN SCOPE. Owner milestone: M5.

Open/create source books with readiness/generation statuses and library actions. Restore last page via reader. A book-generation placeholder is not an empty library.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-039](audit/screenshots/snow-1440-039--learning-books.png), [CAP-137](audit/screenshots/dark-412-039--learning-books.png); host state only unless actual form captured

### MS-BOOK-CREATE

S28; `/learning/books/create`; IN SCOPE. Owner milestone: M5.

Subject → fixed proposal → editable chapter spine → confirmation → scripted generation/reader. Invalid input/failure retains draft; cancel does not create a second book. No AI generation occurs.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-037](audit/screenshots/snow-1440-037--learning-books-audit-missing-record.png), [CAP-135](audit/screenshots/dark-412-037--learning-books-audit-missing-record.png); host state only unless actual form captured

### MS-BOOK-READER

S29, S30; `/learning/books/[bookId] or /learning/books/[bookId]/pages/[pageId]`; IN SCOPE. Owner milestone: M5.

Navigate spine/page deep links; retain reading position and block locator. Exercise supported quiz/flashcard/reveal/play/deep-dive/tutor/capture controls. Pause/resume/rebuild/supplement uses deterministic state; failed rebuild preserves prior content. Renderer gates must be resolved for supported bundled samples.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-037](audit/screenshots/snow-1440-037--learning-books-audit-missing-record.png), [CAP-135](audit/screenshots/dark-412-037--learning-books-audit-missing-record.png); host state only unless actual form captured

### MS-READING-LIBRARY

S31; `/learning/reading`; IN SCOPE. Owner milestone: M5.

Search/open collections, add bundled materials, create/edit folders through actual source dialogs. Source-supported link import uses seeded metadata without fetching a URL. Keep material and collection identities distinct.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-052](audit/screenshots/snow-1440-052--learning-reading.png), [CAP-150](audit/screenshots/dark-412-052--learning-reading.png); host state only unless actual form captured

### MS-READING-MATERIALS

S32; `/learning/reading/materials`; IN SCOPE. Owner milestone: M5.

Browse/search actual material records, select/open/add as source supports and retain import failure state. Do not introduce Knowledge Base ingestion/indexing screens.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-051](audit/screenshots/snow-1440-051--learning-reading-materials.png), [CAP-149](audit/screenshots/dark-412-051--learning-reading-materials.png); host state only unless actual form captured

### MS-READING-FOLDER

S33; `/learning/reading/folders/[folderId]`; IN SCOPE. Owner milestone: M5.

Display collection files and conversations; rename/organize via source actions, open exact material/session. Empty folder, missing folder and no matches differ; content workspace is not the collection ID.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-050](audit/screenshots/snow-1440-050--learning-reading-folders-audit-missing-record.png), [CAP-148](audit/screenshots/dark-412-050--learning-reading-folders-audit-missing-record.png); host state only unless actual form captured

### MS-READING

S34, S35, S36; `/learning/reading/[workspaceId], /learning/reading/[workspaceId]/sessions or /learning/reading/[workspaceId]/sessions/[sessionId]`; IN SCOPE. Owner milestone: M5.

Restore source unit/locator or timestamp and optional persisted conversation. Switch full-width reader/companion without losing position; ask from a passage, annotate, rename/remove/link conversations, organize notes, save originals and Build Mastery Path. Use bundled text/media and fixed tutor/audio examples; no external TTS/embed requests. Source selection and reader-display preferences persist.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-047](audit/screenshots/snow-1440-047--learning-reading-audit-missing-record.png), [CAP-145](audit/screenshots/dark-412-047--learning-reading-audit-missing-record.png); host state only unless actual form captured

### MS-RESOURCES

S39; `/space`; SUPPORTING. Owner milestone: M2; focused integration M8.

Preserve completed M2 screen and evidence as optional supporting UI. It is not a primary destination; focused entry set exposes only selected capabilities. Existing excluded resource tiles never become new implementation obligations.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-027](audit/screenshots/snow-1440-027--space.png), [CAP-125](audit/screenshots/dark-412-027--space.png); host state only unless actual form captured

### MS-PERSONALIZATION

S40; `/personalization`; SUPPORTING. Owner milestone: M2; focused integration M8.

Preserve completed M2 overview and evidence as optional supporting UI. No new skills/personas/agents/MCP/CLI/memory management. Keep it outside default learner navigation; preserve source and local preview access.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-019](audit/screenshots/snow-1440-019--personalization.png), [CAP-117](audit/screenshots/dark-412-019--personalization.png); host state only unless actual form captured

### MS-FAVORITES

S45; `/notebooks`; IN SCOPE. Owner milestone: M3.

Create/open/rename saved-original collections with metadata/search. Chat/learning Save original targets the same collection store. This screen does not create editable Co-Writer pages.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-018](audit/screenshots/snow-1440-018--notebooks.png), [CAP-116](audit/screenshots/dark-412-018--notebooks.png); host state only unless actual form captured

### MS-FAVORITES-DETAIL

S46; `/notebooks/[notebookId]`; IN SCOPE. Owner milestone: M3.

Search/filter record kinds, focus requested record, use its typed source reference, edit collection metadata, and confirm supported record/collection deletion. Saved content remains an original snapshot; unavailable source does not silently become a new note.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-017](audit/screenshots/snow-1440-017--notebooks-audit-missing-record.png), [CAP-115](audit/screenshots/dark-412-017--notebooks-audit-missing-record.png); host state only unless actual form captured

### MS-JOURNAL

S48; `/space/journal`; IN SCOPE. Owner milestone: M4.

Display current mission, last-session handoff and confirmed records; refresh/retry only. Missing sections and corrupt/unreadable journal retain source fallback. No diary editing or fabricated weekly analytics.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-025](audit/screenshots/snow-1440-025--space-journal.png), [CAP-123](audit/screenshots/dark-412-025--space-journal.png); host state only unless actual form captured

### MS-NOTES

S62; `/co-writer`; IN SCOPE. Owner milestone: M7.

Create/open/search hierarchical editable pages; pin/unpin/delete and bundled Word import match source. Imported/new page opens exact docId. Review entry appears only for due fixture cards. Search spans source page hierarchy without inventing collection semantics.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-035](audit/screenshots/snow-1440-035--co-writer.png), [CAP-133](audit/screenshots/dark-412-035--co-writer.png); host state only unless actual form captured

### MS-NOTE-EDITOR

S63; `/co-writer/[docId]`; IN SCOPE. Owner milestone: M7.

Read/edit title/icon/cover and supported rich blocks; insert/reorder via touch-accessible actions; navigate subpages/outline/backlinks. Save/reopen same revision; conflict and recovery preserve draft. Source/favorites insertion preserves provenance. Companion suggestions/review threads accept/reject locally with visible block changes; no model call.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-034](audit/screenshots/snow-1440-034--co-writer-audit-missing-record.png), [CAP-132](audit/screenshots/dark-412-034--co-writer-audit-missing-record.png); host state only unless actual form captured

### MS-TASKS

S64; `/kanban`; IN SCOPE. Owner milestone: M6.

Show todo/doing/done, counts and all/today/this-week plus archived filters. Create/edit title/note/due date; open UI-TASK-DETAIL; explicit move and archive/restore update board once. Colors apply to status columns, not a fabricated per-task color field. Chat linking/status-link behavior uses source SessionTaskLinks. No permanent delete, calendar events or new assignee/priority/subtask model.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-036](audit/screenshots/snow-1440-036--kanban.png), [CAP-134](audit/screenshots/dark-412-036--kanban.png); host state only unless actual form captured

### MS-LOGIN

S73; `/login`; IN SCOPE. Owner milestone: M2; focused integration M8.

Retain M2 validation/auth-mode/temporary-password and internal return-path behavior. M8 binds it to selected mock server; wrong credentials/status error retry never exposes data from a previous principal.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-002](audit/screenshots/snow-1440-002--login.png), [CAP-100](audit/screenshots/dark-412-002--login.png); host state only unless actual form captured

### MS-REGISTER

S74; `/register`; IN SCOPE. Owner milestone: M2; focused integration M8.

Retain M2 registration, first-user and registration-closed scenarios with source routing after success. No social sign-in, password reset, billing or real account creation.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-003](audit/screenshots/snow-1440-003--register.png), [CAP-101](audit/screenshots/dark-412-003--register.png); host state only unless actual form captured

### MS-PROFILE

S75; `/profile`; IN SCOPE. Owner milestone: M2; focused integration M8.

Retain identity, source avatar choices, password validation/change and sign-out. M8 makes server/account transitions coherent. Existing public-device handoff control remains preserved in legacy implementation but is not an entry in focused navigation; no handoff feature scheduled.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-020](audit/screenshots/snow-1440-020--profile.png), [CAP-118](audit/screenshots/dark-412-020--profile.png); host state only unless actual form captured

### MS-PROGRESS

S79; `/settings/progress`; IN SCOPE. Owner milestone: M4.

Show source reading progress and recent learning actions with separate no-activity/no-reading/no-actions states. Open from Learning despite canonical settings URL. Values derive from fixed learning fixtures, not invented score calculations.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-022](audit/screenshots/snow-1440-022--settings-progress.png), [CAP-120](audit/screenshots/dark-412-022--settings-progress.png); host state only unless actual form captured

### MS-SETTINGS-general

S81; `/settings/general`; IN SCOPE. Owner milestone: M2; focused integration M8.

Retain General preferences, interface/output languages and Classic/Modern choice with staged/apply/discard semantics. UI-LANGUAGE selects source language options and preserves fallback. Provider-readiness/setup links are not part of focused settings; missing model is a read-only availability notice.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-063](audit/screenshots/snow-1440-064--settings-general.png), [CAP-161](audit/screenshots/dark-412-064--settings-general.png); host state only unless actual form captured

### MS-SETTINGS-appearance

S82; `/settings/appearance`; IN SCOPE. Owner milestone: M2; focused integration M8.

Retain source palettes/system theme, learning text scale/spacing, syntax theme/code preview and apply/discard. Readability changes do not alter data or source locators; test long translations and system/font scaling.

Evidence: [source/state mapping](SCREEN_MAPPING.md); [CAP-064](audit/screenshots/snow-1440-065--settings-appearance.png), [CAP-162](audit/screenshots/dark-412-065--settings-appearance.png); host state only unless actual form captured

### MS-SERVER-CONNECTION

MOBILE-01; `/connect`; IN SCOPE; M8. This is a new mobile adaptation, not one of the audited 135 surfaces. Source relationship: [deployment-relative client](audit/source/web/shared/api/client.ts), [auth status/login](audit/source/web/lib/auth.ts), S73/S74 entry boundaries; no source screenshot exists for server selection.

Accept and normalize a server origin using local validation; show selected origin and change-server action. Simulate checking, reachable/auth-enabled, auth-disabled, registration-closed, unavailable, invalid address and incompatible-version states with a typed connection fixture. Continue transitions into the correct existing entry boundary; cancel change keeps the old server. Confirmed switch scopes/clears mock identity, selected workspace and content caches; unsaved work gets an explicit keep/cancel/discard decision. Do not send a probe, store real credentials, alter `src/api/client.ts`, configure LLM providers or assert a newly invented health endpoint. Actual handshake/TLS/auth compatibility requires future integration verification.

## Sheet and embedded acceptance

Every selected/supporting UI or adapter ID below remains tied to its owner and inherits the specific source states/captures from SCREEN_MAPPING. No extra top-level destination is implied.

| Stable ID / source | Owner milestone | Acceptance |
|---|---|---|
| <a id="ui-shell"></a>`UI-SHELL` / S01 | M1 | Navigate; change shelf; new conversation; collapse/resize sidebar; customize navigation; visible control has deterministic local effect, cancel is non-mutating, busy blocks duplicate submission, failure retains owner context. |
| <a id="ui-account-workspace"></a>`UI-ACCOUNT-WORKSPACE` / S03 | M2 | Select existing workspace/account context, profile/settings/logout; preserve source scope return behavior. No new workspace/server administration.; visible control has deterministic local effect, cancel is non-mutating, busy blocks duplicate submission, failure retains owner context. |
| <a id="ui-composer-pickers"></a>`UI-COMPOSER-PICKERS` / S06 | M3 | Select/remove existing supported models, tools and typed learning/chat/Favorites references; preserve staged selection and turn snapshot. No provider, partner/agent or resource-management editor.; visible control has deterministic local effect, cancel is non-mutating, busy blocks duplicate submission, failure retains owner context. |
| <a id="ui-capabilities"></a>`UI-CAPABILITIES` / S11 | M3 | Select capability; configure/confirm; submit through same composer; visible control has deterministic local effect, cancel is non-mutating, busy blocks duplicate submission, failure retains owner context. |
| <a id="ui-structured-reply"></a>`UI-STRUCTURED-REPLY` / S12 | M3 | Select options; type response; submit; source-supported skip; visible control has deterministic local effect, cancel is non-mutating, busy blocks duplicate submission, failure retains owner context. |
| <a id="ui-quiz"></a>`UI-QUIZ` / S13 | M3 | Answer; submit; reveal/review; attach answer image; bookmark; open question follow-up; visible control has deterministic local effect, cancel is non-mutating, busy blocks duplicate submission, failure retains owner context. |
| <a id="ui-research"></a>`UI-RESEARCH` / S14 | M3 | Configure; edit/confirm outline; read citations and report; visible control has deterministic local effect, cancel is non-mutating, busy blocks duplicate submission, failure retains owner context. |
| <a id="ui-visual-result"></a>`UI-VISUAL-RESULT` / S15 | M5 | Toggle code; copy; fullscreen; play; source-supported file actions; visible control has deterministic local effect, cancel is non-mutating, busy blocks duplicate submission, failure retains owner context. |
| <a id="ui-mastery-create"></a>`UI-MASTERY-CREATE` / S19 | M4 | Enter goal; select materials; create; continue outline conversation; visible control has deterministic local effect, cancel is non-mutating, busy blocks duplicate submission, failure retains owner context. |
| <a id="ui-practice-import"></a>`UI-PRACTICE-IMPORT` / S26 | M4 | Choose file/target; import; inspect outcome; visible control has deterministic local effect, cancel is non-mutating, busy blocks duplicate submission, failure retains owner context. |
| <a id="ui-reading-actions"></a>`UI-READING-ACTIONS` / S37 | M5 | Highlight; write note; contextual tutor action; adjust/reset reading display; visible control has deterministic local effect, cancel is non-mutating, busy blocks duplicate submission, failure retains owner context. |
| <a id="adapter-legacy-watch"></a>`ADAPTER-LEGACY-WATCH` / S38 | M5 | Resolve only verified legacy watching identities into reading; invalid legacy identity gets recoverable unavailable state, never a new Watching screen.; visible control has deterministic local effect, cancel is non-mutating, busy blocks duplicate submission, failure retains owner context. |
| <a id="ui-favorites-save"></a>`UI-FAVORITES-SAVE` / S47 | M3 | Select collection; save/cancel; choose records for composer; visible control has deterministic local effect, cancel is non-mutating, busy blocks duplicate submission, failure retains owner context. |
| <a id="ui-avatar-gallery"></a>`UI-AVATAR-GALLERY` / S80 | M1 | Preview animation states; visible control has deterministic local effect, cancel is non-mutating, busy blocks duplicate submission, failure retains owner context. |
| <a id="ui-page-customize"></a>`UI-PAGE-CUSTOMIZE` / S116 | M4 | Show/hide eligible selected chat/learning items; restore defaults; cannot re-enable excluded product features.; visible control has deterministic local effect, cancel is non-mutating, busy blocks duplicate submission, failure retains owner context. |
| <a id="ui-question-categories"></a>`UI-QUESTION-CATEGORIES` / S119 | M4 | Manage categories; apply source-supported bulk actions; visible control has deterministic local effect, cancel is non-mutating, busy blocks duplicate submission, failure retains owner context. |
| <a id="ui-mastery-route-edit"></a>`UI-MASTERY-ROUTE-EDIT` / S120 | M4 | Edit draft; validate; confirm/cancel; visible control has deterministic local effect, cancel is non-mutating, busy blocks duplicate submission, failure retains owner context. |
| <a id="ui-note-review"></a>`UI-NOTE-REVIEW` / S121 | M7 | Reveal; grade; follow source; export; close; visible control has deterministic local effect, cancel is non-mutating, busy blocks duplicate submission, failure retains owner context. |
| <a id="ui-note-insert-sources"></a>`UI-NOTE-INSERT-SOURCES` / S122 | M7 | Select source/favorite; insert source-supported block kind; visible control has deterministic local effect, cancel is non-mutating, busy blocks duplicate submission, failure retains owner context. |
| <a id="ui-note-review-margin"></a>`UI-NOTE-REVIEW-MARGIN` / S123 | M7 | Inspect/accept/reject source-supported review; follow thread; visible control has deterministic local effect, cancel is non-mutating, busy blocks duplicate submission, failure retains owner context. |
| <a id="ui-book-blocks"></a>`UI-BOOK-BLOCKS` / S124 | M5 | Use block-specific reveal/answer/play/deep-dive/edit actions; visible control has deterministic local effect, cancel is non-mutating, busy blocks duplicate submission, failure retains owner context. |
| <a id="ui-confirm"></a>`UI-CONFIRM` / S134 | M1 | Confirm or cancel the named operation; visible control has deterministic local effect, cancel is non-mutating, busy blocks duplicate submission, failure retains owner context. |
| <a id="ui-feedback"></a>`UI-FEEDBACK` / S135 | M1 | Dismiss/retry/recover as offered by owning notice; visible control has deterministic local effect, cancel is non-mutating, busy blocks duplicate submission, failure retains owner context. |
| <a id="ui-task-detail"></a>`UI-TASK-DETAIL` / S64 child | M6 | Open named task; edit title/note/due date, status/move, archive/restore and source chat links; save/cancel/error returns same filtered board. No permanent deletion. |
| <a id="ui-language"></a>`UI-LANGUAGE` / S81 child | M2 retained / M8 | Interface and model-output language remain separate; choose source options; apply/discard and reopen retain correct values. |

## Source corrections and remaining verification

- Task Board audit text mentions deletion, but inspected `KanbanBoard.tsx` and `lib/task-board-api.ts` expose no permanent delete; this revision excludes it. Task colors are status-column colors. The task detail sheet is a mobile presentation of the inline editor, not a new web route. Calendar-backed schedule blocks may exist in web imports; calendar remains excluded.
- Notebook means both editable Co-Writer and original Favorites in this plan; their IDs, revision rules and actions remain separate. No generic notes model replaces either source model.
- Server connection has no audited equivalent or screenshot. Its local validation/status scripts are proposed UX, not proof of a server discovery API. Future connection handshake/auth behavior remains unverified.
- Most original screenshots show shell/Retry; populated Mastery, tasks, notes, chat and reader layouts require source-guided implementation and later runtime comparison. Original failed search/handoff attempts remain documented, not replaced with fabricated evidence.
- Native renderer parity for math/HTML/interactive blocks, PDF/EPUB text selection, media sync and rich note editing is not established by the web audit. M3/M5/M7 own renderer evidence; M9 requires native verification.
- Actual deployed model/tool catalogs, attachment formats/limits, role policy and streaming payload compatibility require verification in the future integration phase. Fixtures retain source semantics and do not invent successful backend support.
