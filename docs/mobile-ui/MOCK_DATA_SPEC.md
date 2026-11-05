# UI-only mock data specification

Revision: 2026-11-05. **Focused mobile companion; UI-only.** This revision supersedes the full-port roadmap. Source baseline: DeepTutor v1.7.1, `f7aed0744c36c5afef16a4261c31ebee1208cac2`.

[Original inventory](audit/screen-inventory.md), [63 page files](audit/route-map.md), [197 captures](audit/screenshot-catalog.md), [design evidence](audit/design-system.md), and [audit limitations](audit/validation.md) are preserved. Previous planning documents are archived in [planning history](planning-history/full-port-baseline/README.md).

VERIFIED means source-confirmed behavior or the actual visible capture state, not successful backend operation. Most captures show shell/Retry, including Task Board CAP-134 inspected in this revision; populated interiors remain visually UNVERIFIED. All mobile layouts, routes added for presentation, and fixture outcomes below are PROPOSED. No new UI or backend integration is implemented by this revision.

## Boundary

All next milestones are UI-only. Inject mock repositories; never import `src/api/client.ts` or the archived web runtime into their dependency graph. Preserve existing API/client source unchanged. No REST, WebSockets, Codex OAuth, OpenRouter, remote embeds, telemetry or other external services. Bundled assets and seeded file/URL metadata simulate uploads/imports/media. No real credentials; preview success means a scripted fixture outcome only. A development indicator may identify fixture mode without exposing engineering details throughout learner UI.

## Proposed typed repository contracts

These are UI repository contracts, not new wire/API schemas. Implement them later in `src/features/` or shared mock infrastructure, never under route folders. Use source DTO/type names via explicit projections; do not copy a transport module that performs requests. Keep source IDs and enums intact. Methods below return deterministic promises/events; concrete fields must follow the referenced owners.

```ts
type Loadable<T> =
  | { state: 'loading' }
  | { state: 'empty' }
  | { state: 'ready'; data: T }
  | { state: 'error'; message: string; retryable: boolean }
  | { state: 'unavailable'; reason: string };
type Scope = { serverId: string; principalId: string; contentWorkspaceId: string };
type Operation<T> = { ok: true; value: T } | { ok: false; error: string };
// Source DTO projections replace the domain placeholders below in implementation.
interface Repository<T, Query, Create, Patch> {
  list(scope: Scope, query: Query): Promise<Loadable<readonly T[]>>;
  read(scope: Scope, id: string): Promise<Loadable<T>>;
  create(scope: Scope, input: Create): Promise<Operation<T>>;
  update(scope: Scope, id: string, patch: Patch): Promise<Operation<T>>;
}
// Only use CRUD members actually supported by each source owner.
// Do not add generic delete() to every repository (Task Board has no delete UI).
```

| Repository | Required typed methods/events (source-owned projections) | Source contract reference | Milestone |
|---|---|---|---|
| ConnectionMockRepository | validateOrigin, select, check scripted status, switch/cancel; no HTTP | Mobile adaptation of `web/shared/api/client.ts` and `web/lib/auth.ts`, not a claimed discovery endpoint | M8 |
| Entry/PreferencesMockRepository | authStatus, login, register, profile/password/avatar, signOut; staged/apply/discard preferences | M2 FixtureProvider/model and audited auth/General/Appearance owners | M2/M8 |
| ConversationMockRepository | list/search/restore/create, rename/pin/archive/restoreArchived/delete with owner policy; select catalog and typed refs; send/stop/retry/edit; subscribe to scripted stream | ChatWorkspace, ChatMessageList, SessionActionsMenu, session/protocol types in archived web source | M3 |
| LearningMockRepository | inventory/recentItems, open/create intent, hidden/availability preferences | LearningDashboard, NewLearningPage, `web/lib/learning-routes.ts`, `components/learning/surfaces.ts` | M4/M5 |
| MasteryMockRepository | atlas/detail, goal/source create, route edit, mode/session resume, answer/skip, objective/report/trail, reset/delete | MasteryStudy, CreateTopicWizard, path detail and source mode types | M4 |
| Practice/QuizMockRepository | dueSummary, bank/mistakes/category operations, import, start/reveal/judge/rate/skip; separate quiz pager/followup | PracticePage/PracticeSession/PracticeImport and QuizViewer | M4 |
| BookMockRepository | library/proposal/spine, scripted generation, page/position, pause/resume/rebuild and block interactions | BooksRoute and BookCreator/PageReader/BlockRenderer | M5 |
| ReadingMockRepository | collections/materials/folders, bundled import, source locator/time, annotation/display, session/companion and handoff | ReadingWorkspace/ReadingLibrary/ReadingCompanion; source collection and content workspace IDs | M5 |
| TaskMockRepository | board/create/update, status colors, archive/restore, session links/status-link; no delete | `web/lib/task-board-api.ts`: TaskStatus, TaskCard, TaskBoard, SessionTaskLinks | M6 |
| FavoritesMockRepository | collection metadata, search/filter/focused originals, save/use/delete supported records | NotebookConsole, NotebookRecordActions, SaveToNotebookModal | M3 |
| NoteMockRepository | library/tree/search/create/import/pin/delete, block edit/save with revision, recovery, source links, suggestion/thread/review | NoteWorkspace/NoteEditor/NoteReview and source note models | M7 |
| Progress/JournalMockRepository | read/refresh recorded source projections; no new analytics engine or diary CRUD | settings/progress page, LearningJournalPanel | M4/M5 |

## Graph, persistence and transition invariants

Fixture keys include server, principal and content workspace; reading collection ID remains separate. Use fixed clock, deterministic IDs and injectable delays (default 400ms). Streaming is an ordered local event script with sequence IDs; duplicated timer/replay events never duplicate messages, judgments, saves or imports. Stop retains emitted text; retry follows source retry semantics without an accidental second user submission. No new grading/retention algorithm.

Connected fixtures: session-a → message-a → saved-original-a → note-a source block; path-a → point-a → study-session-a → due-review-a; book-a → page-a → block-a; collection-a → material-a/unit/locator → reading-session-a; task-a → existing session-a via SessionTaskLinks. Progress/recent items reference these same entities. A failed write retains old saved record and current draft; success updates all mounted lists/detail views once. Proposed local optimistic behavior must roll back visibly on failure.

Use at least two workspaces and two server origins, authenticated/disabled/unavailable/temporary-password/registration-closed identities, short/long/Unicode titles, all source UI locales, empty/one/many lists, large transcripts, and stale/missing refs. Persist only intended local preferences and nonsecret fixture drafts with a version/reset policy; errors/loading/toasts/active timers do not silently persist. No production token/password storage is designed here. Server switch cancels stale operations and isolates cached content; cancel retains current scope. Due dates preserve source local calendar days.

## Selected domain fixture packages

The original package descriptions below are narrowed by the explicit boundary notes that follow. No package for excluded management capabilities is scheduled.

| Package | Presentation data | Loading | Empty | Error / denied | Ready / local transition |
|---|---|---|---|---|---|
| shell | Selected route tree, principal/workspace and search refs | Identity/scope loading | No records or no matches | Failed switch retains prior context | Focused drawer/search opens selected exact owner; no excluded destinations |
| local | Owner operation ID, feedback tone/message and busy/dismissibility flags | Busy presentation follows owning action; no independent fetch | No toast/dialog when closed; absence is not a data error | Render supplied owner error with retry/dismiss only where supported | Confirm invokes the fixture operation once; cancel never mutates it; toast remains transient |
| gallery | Source avatar phase, auto-play and size values | Not applicable: deterministic local artwork | Not applicable: all source phases enumerated | Proposed local asset-load fallback only; no backend failure invented | Select phase/size and reduced motion updates visible artwork; keep development-only entry |
| auth | auth enabled/available/authenticated, username display label, preset/grants, avatar marker; local form validation | Pending status; signing in/registering/profile password/avatar operation busy | Blank login/register fields; missing profile returns appropriate auth boundary | Fixture wrong credentials, status unavailable, password mismatch/current-password error or invalid avatar | Valid synthetic credentials switch fixture principal and normalized destination; temporary-password profile path simulated |
| chat | Session/turn/message IDs; composer draft; catalog options; typed context refs; ordered scripted events; usage projection | Restoring session or catalog; live stream distinct from restore loading | New conversation greeting/starters versus missing saved session; filtered history empty | Restore failure, attachment validation, failed structured reply, protocol mismatch or dropped stream | Send binds one fixture session; scripted stream completes once; stop/retry/edit use stable IDs and preserve failed draft |
| archive | Archived session IDs/title/type/workspace and query; restore/delete operation state | Archived list loading; selected restore/permanent-delete busy | No archived conversations versus no search matches | Failed list/unarchive/permanent delete retains prior rows and recoverable action | Unarchive moves same fixture session to active history; permanent delete requires named confirmation and removes only selected record; no settings-draft toolbar |
| files | Typed original file reference, MIME/display name, local fixture URI, source locator and viewer state | Local decode/read wait or deliberate loading scenario | Unsupported file uses original fallback; missing file is unavailable, not blank content | Fixture decode/read failure; retain owner and fallback/download indication | Open bundled sample file in the planned renderer; close restores owner. No generated/uploaded server file claimed |
| capabilities | Audited capability IDs/labels; supported config values; outline, report and renderer result projections | Catalog probe or scripted stage activity; config submit busy | Capability unavailable hides/disables entry according to source; no invented empty report library | Invalid config, stage/renderer failure and protocol mismatch fixtures | Research edit/confirm advances scripted report; Quiz/Visualize/Video Lesson use fixed source-shaped samples, never execute a model |
| learning | Four audited surfaces; module/availability policy; hidden preferences; item refs/counts | Inventory/preferences loading plus library skeletons | No learning records versus every eligible feature hidden; preserve source create/customize recovery | Fixture module/preferences/list error independently retryable | Open correct library/item; create chooser hands off to feature owner; per-kind counts update only after fixture mutation |
| mastery | Path/goal ID, selected source refs, route modules/knowledge points, objective report, next/due items, mode/session IDs | Atlas/detail/session/strategy/board probes independently pending | Uncharted atlas; no outline/no sessions; mode-specific conversation starters | Missing path/session, board/report error, failed route save and strategy/retention errors | Goal + sources opens Outline; route edit updates same path; scripted Study/Review answers update fixture mastery; reset differs from delete |
| practice | Question entry ID + content workspace, kind/options/sample answers, due/review refs, ratings again/hard/good/easy, categories | Summary/question/judgment/import loading; rating submit disabled | Caught-up review with next due; bank/mistakes no entries/no matches; completed queue | Stale question/conflict reload; judgment/import failure; duplicate rating prevented | Answer/reveal enables source recall rating; recorded fixture outcome advances once; Again remains in queue; completion counts/skips remain coherent |
| quiz | Generated quiz question IDs/kind/options, current index, written/image answers, fixed judgment/review, bookmarks/categories and followup refs | Question judgment or bookmark/category/followup operation pending | No supplied quiz result is unavailable content, not an empty Practice queue | Invalid answer/image, fixed judgment failure and retry; no correctness inferred from fixture text | Submit answer reveals fixed judgment/review; question pager/bookmark/category/followup remain tied to generated question; no daily recall rating or invented review schedule |
| books | Book/page/block IDs; proposal and editable spine; block-type projections; generation, pause, health and chat/capture refs | Book opening/page hydration; scripted generation placeholders independently pending | Empty library, no generated page content and placeholders are distinct | Failed proposal/page render/generation; paused is not error; rebuild failure retains old content | Confirm proposal/spine advances scripted generation; selected page displays fixed blocks; pause/resume/rebuild/deep-dive/capture are fixture transitions |
| reading | Content workspace and collection IDs, material/session IDs, source units/locators/timestamps, annotations and display prefs | Library/import checks; selected document/companion restore; media load | No materials, empty collection and no active conversation distinguishable | Unsupported/corrupt material, broken URL, missing session, failed annotation/organize-notes | Add bundled file or seeded URL metadata; source selection/timestamp anchors fixed tutor response; annotation persists within fixture run; display changes retain locator |
| resources | Retained M2 overview fixtures | Existing independent counts | Existing zero/no-capability cases | Existing count failures | Preserve optional overviews; no new excluded resource-manager mocks |
| favorites | Collection notebookId/name/color; original record ID/kind/content/source refs; focused record query | Collection/record load or save busy | No collections/records versus no filter matches | Unavailable record/collection, failed save/delete; preserve selected source payload | Save original once to selected fixture collection; reopen/focus record; reference picker creates typed ref without converting it to editable note |
| journal | Current mission, session handoff, confirmed records and revision for content workspace | Journal pending | Missing mission/handoff and zero confirmed records use audited fallbacks | Unreadable/corrupt journal notice preserves original record set; retry restores fixture view | Read/refresh only; no diary editor, fabricated weekly summary or record CRUD |
| notes | Doc/page/block/thread IDs, hierarchy/title/icon/cover/pin, block JSON projection, revision/draft/recovery, suggestions and due flashcards | Library/editor hydrate; save/companion/review generation pending | Empty notebook/page; no filtered pages or backlinks; no review trigger when zero due cards | Expected revision conflict, failed save/import/companion/grade; preserve local recovery blocks | Edit same fixture block tree; accept/reject source-shaped suggestion; save updates revision; flashcards remembered/not and Anki sample export distinct from Practice |
| tasks | TaskCard id/title/note/status/archived/due_date/workspace and board column colors/session links/revision | Board/action pending | Empty board/column or date/archive filter | Load/save/move failure keeps prior task and edit draft | Create/edit/move/archive/restore; todo/doing/done; all/today/this-week; no task delete or calendar event operations |
| settings | General language/layout and Appearance staged/active values | Existing settings load/apply busy | Source initial values | Load/validation/apply failure retains draft | Apply/discard and profile navigation only; no provider/admin/configuration mocks |

Boundary notes: capability fixtures are embedded chat/learning outcomes only. Resource/answerer pickers never connect agents or expose excluded management. Auth roles are synthetic access scenarios, not user administration. File samples are local. Books/reading locators and assessment outcomes remain source-shaped. Word/spreadsheet import uses bundled valid/invalid samples. Note flashcards retain source remembered/not semantics and are not Practice ratings. No live imports or exports to external services.

## Required exceptional scripts

1. Chat: missing model, invalid attachment, empty send, partial stream then stop, interrupted stream then retry, protocol mismatch, duplicate scripted event, denied/missing restored session, and rename/delete failure.
2. History: search error/no matches; grouping differs from flat search; archive/restore updates same ID; deleting current session returns new chat; different kind opens its correct owner.
3. Mastery: empty atlas, failed goal creation, no outline, separate session/board/strategy failures, question answer failure/retry, persisted mode restoration, reset versus delete.
4. Practice: no due cards, imported invalid rows, stale question/reload, fixed incorrect/correct judgment, rating once, Again queue, skipped/completed summary; no live judgment model.
5. Materials: book generation pause/failure/rebuild, missing page; corrupt/unsupported reading import, invalid locator, annotation failure, media fallback; reading-to-mastery and reading-to-note preserve source.
6. Tasks: all three statuses, empty columns, date boundaries, active/archive filters, move/save failure with rollback, task chat linking and status-link toggle; no deletion success fixture.
7. Notes: empty/filtered library, nested pages, invalid Word sample, pin/delete error, save conflict/recovery, source missing, accept/reject suggestion, due/no-due flashcard review.
8. Entry/settings: no selected server, invalid origin, mock unavailable/incompatible server, server switch cancel/confirm, auth disabled/unavailable/registration closed, temporary-password flow, unsaved locale/theme changes, denied deep link and out-of-scope deep link.

Each visible interactive control must be bound to an observable repository or local-state transition. Unsupported actions are omitted or explicitly unavailable; a no-op callback is not acceptance. M9 runs the full offline graph, including later milestone handoffs.

## Per-surface fixture ownership

| Audit ID | Stable owner | Classification | Delivery | Fixture acceptance reference |
|---|---|---|---|---|
| S01 | `UI-SHELL` | SUPPORTING | M1 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ui-shell); [source states](SCREEN_MAPPING.md) |
| S02 | `MS-SEARCH` | SUPPORTING | M2 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-search); [source states](SCREEN_MAPPING.md) |
| S03 | `UI-ACCOUNT-WORKSPACE` | SUPPORTING | M2 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ui-account-workspace); [source states](SCREEN_MAPPING.md) |
| S04 | `MS-CHAT` | IN SCOPE | M3 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-chat); [source states](SCREEN_MAPPING.md) |
| S05 | `MS-CHAT` | IN SCOPE | M3 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-chat); [source states](SCREEN_MAPPING.md) |
| S06 | `UI-COMPOSER-PICKERS` | IN SCOPE | M3 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ui-composer-pickers); [source states](SCREEN_MAPPING.md) |
| S07 | `MS-SESSION-VIEWER` | IN SCOPE | M3 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-session-viewer); [source states](SCREEN_MAPPING.md) |
| S08 | `MS-FILE-PREVIEW` | IN SCOPE | M3 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-file-preview); [source states](SCREEN_MAPPING.md) |
| S09 | `MS-HISTORY` | IN SCOPE | M3 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-history); [source states](SCREEN_MAPPING.md) |
| S10 | `MS-SETTINGS-archive` | IN SCOPE | M3 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-settings-archive); [source states](SCREEN_MAPPING.md) |
| S11 | `UI-CAPABILITIES` | IN SCOPE | M3 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ui-capabilities); [source states](SCREEN_MAPPING.md) |
| S12 | `UI-STRUCTURED-REPLY` | IN SCOPE | M3 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ui-structured-reply); [source states](SCREEN_MAPPING.md) |
| S13 | `UI-QUIZ` | IN SCOPE | M3 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ui-quiz); [source states](SCREEN_MAPPING.md) |
| S14 | `UI-RESEARCH` | IN SCOPE | M3 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ui-research); [source states](SCREEN_MAPPING.md) |
| S15 | `UI-VISUAL-RESULT` | IN SCOPE | M5 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ui-visual-result); [source states](SCREEN_MAPPING.md) |
| S16 | `MS-LEARNING` | IN SCOPE | M4 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-learning); [source states](SCREEN_MAPPING.md) |
| S17 | `MS-LEARNING-CREATE` | IN SCOPE | M4 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-learning-create); [source states](SCREEN_MAPPING.md) |
| S18 | `MS-MASTERY-LIBRARY` | IN SCOPE | M4 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-mastery-library); [source states](SCREEN_MAPPING.md) |
| S19 | `UI-MASTERY-CREATE` | IN SCOPE | M4 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ui-mastery-create); [source states](SCREEN_MAPPING.md) |
| S20 | `MS-MASTERY-DETAIL` | IN SCOPE | M4 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-mastery-detail); [source states](SCREEN_MAPPING.md) |
| S21 | `MS-MASTERY-STUDY` | IN SCOPE | M4 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-mastery-study); [source states](SCREEN_MAPPING.md) |
| S22 | `MS-MASTERY-STUDY` | IN SCOPE | M4 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-mastery-study); [source states](SCREEN_MAPPING.md) |
| S23 | `MS-PRACTICE` | IN SCOPE | M4 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-practice); [source states](SCREEN_MAPPING.md) |
| S24 | `MS-QUESTION-BANK` | IN SCOPE | M4 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-question-bank); [source states](SCREEN_MAPPING.md) |
| S25 | `MS-PRACTICE-SESSION` | IN SCOPE | M4 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-practice-session); [source states](SCREEN_MAPPING.md) |
| S26 | `UI-PRACTICE-IMPORT` | IN SCOPE | M4 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ui-practice-import); [source states](SCREEN_MAPPING.md) |
| S27 | `MS-BOOKS` | IN SCOPE | M5 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-books); [source states](SCREEN_MAPPING.md) |
| S28 | `MS-BOOK-CREATE` | IN SCOPE | M5 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-book-create); [source states](SCREEN_MAPPING.md) |
| S29 | `MS-BOOK-READER` | IN SCOPE | M5 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-book-reader); [source states](SCREEN_MAPPING.md) |
| S30 | `MS-BOOK-READER` | IN SCOPE | M5 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-book-reader); [source states](SCREEN_MAPPING.md) |
| S31 | `MS-READING-LIBRARY` | IN SCOPE | M5 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-reading-library); [source states](SCREEN_MAPPING.md) |
| S32 | `MS-READING-MATERIALS` | IN SCOPE | M5 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-reading-materials); [source states](SCREEN_MAPPING.md) |
| S33 | `MS-READING-FOLDER` | IN SCOPE | M5 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-reading-folder); [source states](SCREEN_MAPPING.md) |
| S34 | `MS-READING` | IN SCOPE | M5 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-reading); [source states](SCREEN_MAPPING.md) |
| S35 | `MS-READING` | IN SCOPE | M5 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-reading); [source states](SCREEN_MAPPING.md) |
| S36 | `MS-READING` | IN SCOPE | M5 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-reading); [source states](SCREEN_MAPPING.md) |
| S37 | `UI-READING-ACTIONS` | IN SCOPE | M5 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ui-reading-actions); [source states](SCREEN_MAPPING.md) |
| S38 | `ADAPTER-LEGACY-WATCH` | SUPPORTING | M5 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#adapter-legacy-watch); [source states](SCREEN_MAPPING.md) |
| S39 | `MS-RESOURCES` | SUPPORTING | M2 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-resources); [source states](SCREEN_MAPPING.md) |
| S40 | `MS-PERSONALIZATION` | SUPPORTING | M2 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-personalization); [source states](SCREEN_MAPPING.md) |
| S45 | `MS-FAVORITES` | IN SCOPE | M3 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-favorites); [source states](SCREEN_MAPPING.md) |
| S46 | `MS-FAVORITES-DETAIL` | IN SCOPE | M3 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-favorites-detail); [source states](SCREEN_MAPPING.md) |
| S47 | `UI-FAVORITES-SAVE` | IN SCOPE | M3 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ui-favorites-save); [source states](SCREEN_MAPPING.md) |
| S48 | `MS-JOURNAL` | IN SCOPE | M4 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-journal); [source states](SCREEN_MAPPING.md) |
| S62 | `MS-NOTES` | IN SCOPE | M7 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-notes); [source states](SCREEN_MAPPING.md) |
| S63 | `MS-NOTE-EDITOR` | IN SCOPE | M7 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-note-editor); [source states](SCREEN_MAPPING.md) |
| S64 | `MS-TASKS` | IN SCOPE | M6 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-tasks); [source states](SCREEN_MAPPING.md) |
| S73 | `MS-LOGIN` | IN SCOPE | M2 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-login); [source states](SCREEN_MAPPING.md) |
| S74 | `MS-REGISTER` | IN SCOPE | M2 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-register); [source states](SCREEN_MAPPING.md) |
| S75 | `MS-PROFILE` | IN SCOPE | M2 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-profile); [source states](SCREEN_MAPPING.md) |
| S79 | `MS-PROGRESS` | IN SCOPE | M4 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-progress); [source states](SCREEN_MAPPING.md) |
| S80 | `UI-AVATAR-GALLERY` | SUPPORTING | M1 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ui-avatar-gallery); [source states](SCREEN_MAPPING.md) |
| S81 | `MS-SETTINGS-general` | IN SCOPE | M2 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-settings-general); [source states](SCREEN_MAPPING.md) |
| S82 | `MS-SETTINGS-appearance` | IN SCOPE | M2 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ms-settings-appearance); [source states](SCREEN_MAPPING.md) |
| S116 | `UI-PAGE-CUSTOMIZE` | IN SCOPE | M4 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ui-page-customize); [source states](SCREEN_MAPPING.md) |
| S119 | `UI-QUESTION-CATEGORIES` | IN SCOPE | M4 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ui-question-categories); [source states](SCREEN_MAPPING.md) |
| S120 | `UI-MASTERY-ROUTE-EDIT` | IN SCOPE | M4 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ui-mastery-route-edit); [source states](SCREEN_MAPPING.md) |
| S121 | `UI-NOTE-REVIEW` | IN SCOPE | M7 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ui-note-review); [source states](SCREEN_MAPPING.md) |
| S122 | `UI-NOTE-INSERT-SOURCES` | IN SCOPE | M7 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ui-note-insert-sources); [source states](SCREEN_MAPPING.md) |
| S123 | `UI-NOTE-REVIEW-MARGIN` | IN SCOPE | M7 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ui-note-review-margin); [source states](SCREEN_MAPPING.md) |
| S124 | `UI-BOOK-BLOCKS` | IN SCOPE | M5 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ui-book-blocks); [source states](SCREEN_MAPPING.md) |
| S134 | `UI-CONFIRM` | SUPPORTING | M1 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ui-confirm); [source states](SCREEN_MAPPING.md) |
| S135 | `UI-FEEDBACK` | SUPPORTING | M1 | [Specific behavior](MOBILE_PRODUCT_SCOPE.md#ui-feedback); [source states](SCREEN_MAPPING.md) |
| MOBILE-01 | `MS-SERVER-CONNECTION` | IN SCOPE, mobile adaptation | M8 | Connection script above; no web screenshot or live probe |
