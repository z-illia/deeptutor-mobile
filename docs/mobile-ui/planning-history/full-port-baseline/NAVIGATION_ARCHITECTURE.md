# Navigation architecture

Planning baseline: official DeepTutor v1.7.1, commit `f7aed0744c36c5afef16a4261c31ebee1208cac2`. Audit inputs: [135 surfaces](audit/screen-inventory.md), [63 page files](audit/route-map.md), [design](audit/design-system.md), [captures](audit/screenshot-catalog.md), [validation](audit/validation.md). Existing audit files and all application code remain unchanged.

**VERIFIED** = source-confirmed behavior, or an explicitly scoped observed capture. **UNVERIFIED** = runtime/presentation not established. **PROPOSED** = every mobile destination, component arrangement, fixture and acceptance contract below. Source verification never establishes that an asynchronous backend operation succeeded. Synthetic fixture content is allowed for UI development; it is not a new product capability or an API contract.

## Chosen structure — PROPOSED

Use Expo Router. Root stacks own auth, app, admin and full-height modal presentations. Inside the application shell, an Android drawer retains the source shelves: Home, Learning, Resources, Partners and Personalization, with workspace and account menus. Each feature has a detail stack; selecting a detail does not create a new top-level drawer item. Preserve web URL patterns where possible for deep-link traceability. Route groups are implementation organization and do not appear in public paths.

Modern is the baseline because the source default is Modern. General settings retains Classic/Modern as presentation choices in the full roadmap; it does not change the data model. Native tabs already in the starter are not the required final navigation: adapting their usage is future work, and existing native/web files are preserved in this phase. No arbitrary Home/Chat/Learn/Library/Profile tab bar is introduced.

Proposed file organization (specification only; no files are created):

```text
src/app/_layout.tsx              root providers and Stack
src/app/index.tsx                root → /chat after entry resolution
src/app/(auth)/                  login, register
src/app/(app)/_layout.tsx        source-shelf drawer + workspace runtime boundary
src/app/(app)/chat/              new and persisted conversation entries
src/app/(app)/learning/          dashboard, create, mastery, practice, books, reading
src/app/(app)/space/             resources, history, questions, journal, account-resource URLs
src/app/(app)/knowledge-bases/   base library/detail
src/app/(app)/knowledge-engines/ proposed full-screen engine panel
src/app/(app)/notebooks/         Favorites collections/detail
src/app/(app)/co-writer/         Learning notebook library/editor
src/app/(app)/partners/          partner/group directory/create/detail
src/app/(app)/memory/            layer workbenches, graph and reference resolver
src/app/(app)/settings/          dynamic section registry plus progress entry
src/app/(app)/                   calendar, kanban, personalization, agents, profile, handoff creator
src/app/(admin)/                 admin/users
src/app/(modal)/ui/              search, viewer, preview and long-form dialogs
src/app/handoff.tsx              account handoff redemption entry
src/features/                   non-route components, controllers and UI fixtures
src/shared/                     design roles, storage and navigation helpers
```

These are directory responsibilities, not duplicate routes: create one route entry per URL. A route may use `index.tsx` or a directory index consistently. Do not create helpers under src/app. Keep static `create`, `new`, `materials`, `folders`, `groups`, `session` paths distinct from dynamic record segments; validate/encode IDs rather than infer resource kind from a free-text path. Existing `/explore` remains preserved starter code, with an explicit future decision to keep it development-only and remove its learner navigation entry; no current deletion is planned.

## Drawer hierarchy and scopes

| Shelf | Destinations | Scope / filtering |
|---|---|---|
| Home | Chat, Calendar, Task Board, Learning notebook (source Co-Writer) | Route policy controls access; calendar retains its source scope rather than assuming every Home item is workspace-only |
| Learning | Create, All learning, Books, Mastery Path, Practice, Immersive Reading | Learning policy + module availability + page customization; distinguish hidden from unavailable |
| Resources | All resources, Chat History, Favorites, Learning journal, Question Bank, Knowledge Center, optional Whisper | Content workspace; Whisper only when capability fixture reports available |
| Partners | Partner and group directory; details reached from directory/history | Account-level, shared across workspaces; partner may bind a content workspace separately |
| Personalization | My Agents, Personas, Skills, MCP Services, CLI Apps, Memory | Account-level library versus workspace assignment remains distinct |
| Account menu | Profile, Settings, authorized user administration, handoff utilities, logout | Auth mode/preset/grants; no social login, billing or password reset invented |

## Route parameters, state and return contracts

| Feature | Required identity / meaningful state | Return and invalid-input behavior |
|---|---|---|
| Global | fixture principal, content workspace ID, feature availability, selected theme/layout | No user passwords/tokens in params; discard old scope results on account/workspace change |
| Chat | sessionId optional; stable turn/message IDs; return origin for viewer | First send binds one session; resume preserves context; missing record shows source-equivalent unavailable/retry |
| Viewer/preview | viewerContextId or fileRef; session/owner IDs; active tab | Resolve in owner store; no file bytes, secret URL or full message payload in URL; Back restores owner selection/scroll |
| Mastery | pathId; persisted sessionId optional; mode only initial outline/study/review; objective selection | Existing session's mode wins over incoming default; reset and delete remain separate |
| Practice | stable practiceRunId references fixture queue; question refs include content workspace | Invalid/expired run returns recoverable state; no duplicate rating after retry; Back retains queue in owner |
| Book | bookId/pageId/block locator; creation proposal/spine state | Static create entry cannot be interpreted as bookId; failed page leaves book identity intact |
| Reading | source workspaceId means reading collection; separate contentWorkspaceId; material/unit/locator or timestamp; optional sessionId | Never conflate the two workspaces; invalid locator gives source view plus recoverable indication rather than unrelated content |
| Favorites/notes | notebookId/record query versus docId/block/thread | Preserve different systems; Back from source link can restore originating note/review |
| Knowledge | encoded kbName; engineId; section/run/version state | Provider-eligible sections only; read-only blocks writes; no unknown engine fallthrough |
| Memory | L1 surface/ref; L2 valid surface/focus; L3 recent/profile/scope; resolver id | Validate allowed values; L3 does not promise implemented focus targeting absent in source |
| Partners | partnerId/groupId; session query; tab and discussion mode | Continuity resolving/error blocks accidental new session; account scope preserved across workspace switches |
| Settings/admin | canonical section; selected provider/model/user ID; unsaved draft in shared owner | Aliases normalize; unavailable/unauthorized section explicit; user grants never inferred from navigation |
| Handoff | fixture code and internal normalized next destination | Simulate invalid/expired/used/accepted; no real login transfer or token creation |

## Back, overlays, switching and deep links

1. Android Back first dismisses IME according to platform behavior, then the topmost dismissible sheet/dialog, then navigates feature history; visible cancel/close always remains available under owner policy. Busy confirmations can block duplicate submission and source-forbidden dismissal. Do not cancel a source durable turn merely because navigation changes.
2. Drawer navigation closes the drawer, announces the new page and retains the source shelf context. Modal close restores trigger focus. Long lists, companion panes and viewer tabs preserve owner scroll/selection while mounted.
3. On content-workspace switch, apply source switchDestination semantics: detail routes return to their feature index; account Partners/Personalization remain at their account destination. Calendar scope is determined by its owner, not generic workspace remount assumptions. Scope fixture keys include principal/content workspace/record.
4. Mock entry resolution handles auth-disabled, pending, unavailable, standard, learner and admin fixture profiles. Unauthorized deep links render an access state and safe destination; no actual server grants are created. Later backend integration reuses these state projections without making mock permission decisions authoritative.
5. Settings aliases tts/stt→voice, imagegen/videogen/image/video→multimodal, overview→general, models→llm, chat→starters, agents→agent-claude-code, document-parsing→knowledge are normalized. `/notebook/*`, legacy `/books`, `/mastery`, `/reading`, `/watching` and mastery study URLs resolve to audited canonical paths. Do not register duplicate screens for aliases.
6. No public deep link is required for every small sheet. Search/viewer/preview and long dialogs have /ui presentation routes; smaller local overlays use typed owner state. Creation from `?create=1` resolves to the same creation modal/screen as the visible action; record navigation does not need to carry large form state.

## Long modal route registry

| Proposed path | Owner/disposition | Allowed origin and completion |
|---|---|---|
| /ui/search | S02 Mobile screen | Shell; result opens exact source feature, cancel restores shell |
| /ui/session-viewer | S07 Mobile screen | Chat/mastery/reading result; Back returns to owner with tab state |
| /ui/file-preview | S08 Mobile screen | Typed attachment/KB/output/Favorites; unsupported file retains fallback |
| /ui/mastery-create | S19 Dialog presented full height | Atlas or reading handoff; simulated creation opens path Outline conversation |
| /ui/practice-import | S26 Dialog presented full height | Practice/Bank; import outcome refreshes same collection |
| /ui/kb-create | S43 Dialog presented full height | Knowledge Center; returns created linked/new fixture KB |
| /ui/history-import | S118 Dialog presented full height | Imported-history agents; import phases preserve scope selection |
| /ui/mastery-route-edit | S120 Dialog presented full height | Path detail; save returns same path and updated outline |
| /ui/note-review | S121 Dialog presented full height | Note library; source page/block links preserve review return context |

## All 63 source page files → mobile navigation

Each row is a physical Next page file, not a claim of a separate mobile screen. Every destination is PROPOSED; source route/file existence is VERIFIED.

| Source page file | Web URL | Mobile contract | Proposed mobile URL | Resolution |
|---|---|---|---|---|
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28admin%29/admin/users/page.tsx) | `/admin/users` | `MS-ADMIN-USERS` | `/admin/users` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28auth%29/login/page.tsx) | `/login` | `MS-LOGIN` | `/login` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28auth%29/register/page.tsx) | `/register` | `MS-REGISTER` | `/register` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28settings%29/settings/[section]/page.tsx) | `/settings/[section]` | `MS-SETTINGS-{canonical section}` | `/settings/[section]` | Validate registry key and aliases; no unknown empty-success page |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28settings%29/settings/page.tsx) | `/settings` | `MS-SETTINGS-general` | `/settings/general` | Normalize legacy hash/query; Progress remains /settings/progress |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/agents/page.tsx) | `/agents` | `MS-AGENTS` | `/agents` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/avatar-preview/page.tsx) | `/avatar-preview` | `UI-AVATAR-GALLERY` | `/avatar-preview` | Development-only gallery, no learner menu entry |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/knowledge-bases/[kbName]/page.tsx) | `/knowledge-bases/[kbName]` | `MS-KB-DETAIL` | `/knowledge-bases/[kbName]` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/knowledge-bases/page.tsx) | `/knowledge-bases` | `MS-KNOWLEDGE` | `/knowledge-bases` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/memory/graph/page.tsx) | `/memory/graph` | `MS-MEMORY-GRAPH` | `/memory/graph` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/memory/l1/page.tsx) | `/memory/l1` | `MS-MEMORY-L1` | `/memory/l1` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/memory/l2/[surface]/page.tsx) | `/memory/l2/[surface]` | `MS-MEMORY-L2` | `/memory/l2/[surface]` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/memory/l2/page.tsx) | `/memory/l2` | `MS-MEMORY-L2` | `/memory/l2` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/memory/l3/[slot]/page.tsx) | `/memory/l3/[slot]` | `MS-MEMORY-L3` | `/memory/l3/[slot]` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/memory/l3/page.tsx) | `/memory/l3` | `MS-MEMORY-L3` | `/memory/l3` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/memory/page.tsx) | `/memory` | `MS-MEMORY` | `/memory` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/memory/resolve/page.tsx) | `/memory/resolve` | `ADAPTER-MEMORY-RESOLVE` | `/memory/resolve?id=[referenceId]` | Resolve to validated /memory/l2/[surface]?focus=… or source-supported layer target; invalid reference retains error |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/notebooks/[notebookId]/page.tsx) | `/notebooks/[notebookId]` | `MS-FAVORITES-DETAIL` | `/notebooks/[notebookId]` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/notebooks/page.tsx) | `/notebooks` | `MS-FAVORITES` | `/notebooks` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/personalization/page.tsx) | `/personalization` | `MS-PERSONALIZATION` | `/personalization` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/profile/page.tsx) | `/profile` | `MS-PROFILE` | `/profile` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/session-handoff/page.tsx) | `/session-handoff` | `MS-HANDOFF-CREATE` | `/session-handoff` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/settings/progress/page.tsx) | `/settings/progress` | `MS-PROGRESS` | `/settings/progress` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/space/chat-history/page.tsx) | `/space/chat-history` | `MS-HISTORY` | `/space/chat-history` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/space/cli-apps/page.tsx) | `/space/cli-apps` | `MS-CLI` | `/space/cli-apps` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/space/journal/page.tsx) | `/space/journal` | `MS-JOURNAL` | `/space/journal` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/space/mcp/page.tsx) | `/space/mcp` | `MS-MCP` | `/space/mcp` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/space/page.tsx) | `/space` | `MS-RESOURCES` | `/space` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/space/personas/page.tsx) | `/space/personas` | `MS-PERSONAS` | `/space/personas` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/space/questions/page.tsx) | `/space/questions` | `MS-QUESTION-BANK` | `/space/questions` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/space/skills/page.tsx) | `/space/skills` | `MS-SKILLS` | `/space/skills` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/calendar/page.tsx) | `/calendar` | `MS-CALENDAR` | `/calendar` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/chat/[sessionId]/page.tsx) | `/chat/[sessionId]` | `MS-CHAT` | `/chat/[sessionId]` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/chat/page.tsx) | `/chat` | `MS-CHAT` | `/chat` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/co-writer/[docId]/page.tsx) | `/co-writer/[docId]` | `MS-NOTE-EDITOR` | `/co-writer/[docId]` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/co-writer/page.tsx) | `/co-writer` | `MS-NOTES` | `/co-writer` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/kanban/page.tsx) | `/kanban` | `MS-TASKS` | `/kanban` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/books/[bookId]/page.tsx) | `/learning/books/[bookId]` | `MS-BOOK-READER` | `/learning/books/[bookId]` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/books/[bookId]/pages/[pageId]/page.tsx) | `/learning/books/[bookId]/pages/[pageId]` | `MS-BOOK-READER` | `/learning/books/[bookId]/pages/[pageId]` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/books/page.tsx) | `/learning/books` | `MS-BOOKS` | `/learning/books` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/mastery/[pathId]/page.tsx) | `/learning/mastery/[pathId]` | `MS-MASTERY-DETAIL` | `/learning/mastery/[pathId]` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/mastery/[pathId]/sessions/[sessionId]/page.tsx) | `/learning/mastery/[pathId]/sessions/[sessionId]` | `MS-MASTERY-STUDY` | `/learning/mastery/[pathId]/sessions/[sessionId]` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/mastery/[pathId]/sessions/page.tsx) | `/learning/mastery/[pathId]/sessions` | `MS-MASTERY-STUDY` | `/learning/mastery/[pathId]/sessions` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/mastery/page.tsx) | `/learning/mastery` | `MS-MASTERY-LIBRARY` | `/learning/mastery` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/new/page.tsx) | `/learning/new` | `MS-LEARNING-CREATE` | `/learning/new` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/page.tsx) | `/learning` | `MS-LEARNING` | `/learning` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/practice/page.tsx) | `/learning/practice` | `MS-PRACTICE` | `/learning/practice` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/reading/[workspaceId]/page.tsx) | `/learning/reading/[workspaceId]` | `MS-READING` | `/learning/reading/[workspaceId]` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/reading/[workspaceId]/sessions/[sessionId]/page.tsx) | `/learning/reading/[workspaceId]/sessions/[sessionId]` | `MS-READING` | `/learning/reading/[workspaceId]/sessions/[sessionId]` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/reading/[workspaceId]/sessions/page.tsx) | `/learning/reading/[workspaceId]/sessions` | `MS-READING` | `/learning/reading/[workspaceId]/sessions` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/reading/folders/[folderId]/page.tsx) | `/learning/reading/folders/[folderId]` | `MS-READING-FOLDER` | `/learning/reading/folders/[folderId]` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/reading/materials/page.tsx) | `/learning/reading/materials` | `MS-READING-MATERIALS` | `/learning/reading/materials` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/reading/page.tsx) | `/learning/reading` | `MS-READING-LIBRARY` | `/learning/reading` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/watching/[sessionId]/page.tsx) | `/learning/watching/[sessionId]` | `ADAPTER-LEGACY-WATCH` | `/learning/watching/[sessionId] → /learning/reading/[workspaceId]/sessions/[sessionId]` | Resolve source legacy record to its actual collection/session; missing mapping gets unavailable state |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/watching/page.tsx) | `/learning/watching` | `MS-READING-LIBRARY` | `/learning/reading` | Preserve supported scalar query parameters |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/page.tsx) | `/` | `MS-CHAT` | `/chat` | Root redirect; no separate Home dashboard |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/partners/[partnerId]/page.tsx) | `/partners/[partnerId]` | `MS-PARTNER` | `/partners/[partnerId]` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/partners/groups/[groupId]/page.tsx) | `/partners/groups/[groupId]` | `MS-GROUP` | `/partners/groups/[groupId]` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/partners/groups/new/page.tsx) | `/partners/groups/new` | `MS-GROUP-CREATE` | `/partners/groups/new` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/partners/new/page.tsx) | `/partners/new` | `MS-PARTNER-CREATE` | `/partners/new` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/partners/page.tsx) | `/partners` | `MS-PARTNERS` | `/partners` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/whisper/page.tsx) | `/whisper` | `MS-WHISPER` | `/whisper` | Rendered route |
| [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/handoff/page.tsx) | `/handoff` | `MS-HANDOFF-REDEEM` | `/handoff` | Rendered route |

## Documentation/API version check

Project package.json declares Expo ~58.0.23. Router structure was checked against [Expo Router](https://docs.expo.dev/router/introduction/) and [SDK 58 reference](https://docs.expo.dev/versions/v58.0.0/), using the [Expo documentation index](https://docs.expo.dev/llms.txt). No navigator API code or dependency change is supplied here. Recheck the matching API page before later code changes; package additions must use npx expo install in this npm-lock project.
