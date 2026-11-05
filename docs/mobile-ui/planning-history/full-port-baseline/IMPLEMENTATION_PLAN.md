# Implementation plan and acceptance contracts

> **M2 completion:** registration test navigation race resolved; remaining temporary-password redirect/notice defects fixed. All nine surfaces have local-mock/browser coverage; TypeScript, ESLint, 19 unit tests, repeated registration, 84 hydration loads and Hermes export pass. Native Android is **NOT RUN**; unavailable source visual comparisons remain **UNVERIFIED**. See [current evidence](M2_VERIFICATION.md#registration-completion-investigation--2026-11-05). M3 has not started.



> **Execution status (2026-11-05): M0 and M1 completed within recorded verification coverage.** See [M0 verification](M0_VERIFICATION.md) and [M1 verification](M1_VERIFICATION.md). M1 implements S01, S80, S134 and S135 foundations; later feature destinations remain planned. Android device/IME/TalkBack checks are unverified; browser visual/interaction checks and Hermes export pass. M2 is now complete within the recorded UI-only scope; M3 is next and has not started. Historical planning-only statements below refer to preparation of this specification.

Planning baseline: official DeepTutor v1.7.1, commit `f7aed0744c36c5afef16a4261c31ebee1208cac2`. Audit inputs: [135 surfaces](audit/screen-inventory.md), [63 page files](audit/route-map.md), [design](audit/design-system.md), [captures](audit/screenshot-catalog.md), [validation](audit/validation.md). Original audit files remain unchanged. The planning phase left application code unchanged; subsequent execution updates are recorded above.

**VERIFIED** = source-confirmed behavior, or an explicitly scoped observed capture. **UNVERIFIED** = runtime/presentation not established. **PROPOSED** = every mobile destination, component arrangement, fixture and acceptance contract below. Source verification never establishes that an asynchronous backend operation succeeded. Synthetic fixture content is allowed for UI development; it is not a new product capability or an API contract.

## Scope and execution order

This is a UI-only implementation roadmap, not permission to implement now. Current deliverable is documentation only. All existing src/assets/package/config files must remain preserved. No feature is silently removed: all 135 IDs have a disposition in SCREEN_MAPPING, a fixture dependency in MOCK_DATA_SPEC, and traceability in TRACEABILITY_MATRIX. Advanced/admin/conditional features ship in later milestones rather than vanishing from final scope.

Each milestone is complete only when its screen/component checklist and acceptance contracts pass. Milestones are ordered by dependency, not calendar estimates. Code locations proposed in COMPONENT_MAPPING and NAVIGATION_ARCHITECTURE are future ownership boundaries; they create no screens in this phase. Mock view-state completion and successful backend integration are separate acceptance levels.

## M0 — specific documented quality fixes (future authorized code work)

| Problem | Planned fix | Required proof |
|---|---|---|
| react-hooks/set-state-in-effect at src/hooks/use-color-scheme.web.ts:11 | Replace synchronous effect hydration flag with subscription/server-snapshot semantics preserving deterministic light server output and client OS changes; review actual SDK58 hook choices before edit | Lint clean without rule suppression; web hydration has no mismatch/flash regression, changing OS theme updates clients, native hook unchanged |
| TS2322 src/components/app-tabs.web.tsx:38 | Explicitly adapt TabTriggerSlotProps to Pressable-compatible props/ref composition; do not spread an incompatible component ref into native element. Verify source SDK58 Router contract before code | Strict tsc passes without any/double-cast/ref deletion that breaks trigger behavior; web press/focus navigation works; Home/Explore baseline stays operational until approved shell replacement |
| Axios named-as-default-member warning src/api/client.ts:9 | Use an import/member access form accepted by installed Axios typings and lint while preserving base URL/env/timeout/headers; future live adapter separate from fixtures | No warning; no transport behavior change; mock mode has no import-time env requirement and makes zero network calls |
| No root ESLint configuration | Add explicit approved Expo lint configuration in implementation phase; agree source/test/docs scope | Root lint reproducible; no auto-config write during read-only planning; no blanket disable rules |
| Audit archive copied under docs/mobile-ui/audit contains TypeScript source and installed artifacts; tsconfig includes **/*.ts and **/*.tsx | Explicitly exclude/document archival source from mobile lint/typecheck input in future config change, or relocate/archive it only with user authorization; preserve existing files now | Mobile checks cover all mobile source while archived Next/desktop examples do not join the app program; no ignored mobile code; archive provenance/links preserved |

Historical planning baseline: lint failed on the effect-driven hydration flag plus Axios warning; strict TypeScript failed on the web tab ref mismatch. Before scope isolation, TypeScript included 1,561 archived files alongside 21 mobile/generated inputs. M0 now fixes these source issues and establishes explicit root check scope. `npm run lint` and `npm run typecheck` pass; `npm test` passes four regression tests. Browser comparison confirms no new runtime/hydration diagnostic versus the pre-M0 source, with the existing Reanimated starter-animation SSR warning still present. See [executed evidence and limitations](M0_VERIFICATION.md).

## Milestone-by-milestone checklist

### M0 — Baseline quality and scope isolation

Dependencies: None.

Completed behavior-preserving fixes for web theme subscription, Router/Pressable ref typing and the Axios warning. Root ESLint and TypeScript now exclude only the archived audit application and standard generated/native outputs; all mobile source remains checked. Reproducible test/typecheck scripts and focused regression/browser checks are available. The existing starter-animation SSR warning is reproduced on the baseline and remains documented, not suppressed.

- [x] Record existing app/source fingerprints and baseline checks
- [x] Fix hydration lint issue preserving SSR/native behavior
- [x] Fix strict Router/Pressable ref typing and Axios warning
- [x] Configure check scope for archived audit code without deleting user files
- [x] Run repo lint and strict typecheck with declared scope; no suppression-based completion

### M1 — Design primitives and shell scaffolding

Dependencies: M0.

Map exact base and Modern override tokens; preserve original brand assets, typography and ten source UI locales; shared buttons/fields/alerts/dialogs; source shelf drawer; all four palettes and Classic/Modern presentation fixtures; development-only avatar states.

- [x] `UI-SHELL` — S01: Application shell / navigation; complete contract below.
- [x] `UI-AVATAR-GALLERY` — S80: Avatar preview developer surface; complete contract below.
- [x] `UI-CONFIRM` — S134: Shared confirmation; complete contract below.
- [x] `UI-FEEDBACK` — S135: Shared transient feedback; complete contract below.
- [x] Complete matching fixture scenarios and applicable invalid/denied/operation-failure variants.
- [x] Verify navigation, interactions and source token/layout behavior; rerun agreed lint/typecheck.

Evidence: [M1 verification](M1_VERIFICATION.md), [rendered captures](verification/M1/SCREENSHOTS.md), eight passing unit tests, three viewport browser interaction runs and Android Hermes export. Completion is scoped to M1 foundations; native-device behavior and exact canvas raster parity remain unverified. M2–M9 were not implemented.

### M2 — Entry, account, navigation and overview mocks

Dependencies: M1.

Auth-disabled/admin/standard/learner/unavailable fixture entry; profile; General/Appearance; source menus/search; resource and personalization overview. Search opened-state is a mobile proposal until visual source runtime can be verified.

- [x] `MS-SEARCH` — S02: Command palette / search; complete contract below.
- [x] `UI-ACCOUNT-WORKSPACE` — S03: Workspace and account menus; complete contract below.
- [x] `MS-RESOURCES` — S39: Resources / Learning Space; complete contract below.
- [x] `MS-PERSONALIZATION` — S40: Personalization; complete contract below.
- [x] `MS-LOGIN` — S73: Login; complete contract below.
- [x] `MS-REGISTER` — S74: Registration; complete contract below.
- [x] `MS-PROFILE` — S75: Profile; complete contract below.
- [x] `MS-SETTINGS-general` — S81: General; complete contract below.
- [x] `MS-SETTINGS-appearance` — S82: Appearance; complete contract below.
- [x] Complete matching fixture scenarios and applicable invalid/denied/operation-failure variants.
- [x] Verify navigation, interactions and source token/layout behavior; rerun agreed lint/typecheck.

### M3 — Chat, history, references and scripted capabilities

Dependencies: M2.

Chat new/restored view, send/stop/retry/edit/ask-user, model/resource/answer controls, history, viewer and file preview. Research config/outline/report uses fixed results. No fake model call or protocol success.

- [ ] `MS-CHAT` — S04, S05: Home / Chat; complete contract below.
- [ ] `UI-COMPOSER-PICKERS` — S06: Composer controls and reference selection; complete contract below.
- [ ] `MS-SESSION-VIEWER` — S07: Session viewer / activity workspace; complete contract below.
- [ ] `MS-FILE-PREVIEW` — S08: File preview; complete contract below.
- [ ] `MS-HISTORY` — S09: Conversation organization / history; complete contract below.
- [ ] `UI-CAPABILITIES` — S11: Chat capabilities; complete contract below.
- [ ] `UI-STRUCTURED-REPLY` — S12: Ask Questions / structured question; complete contract below.
- [ ] `UI-RESEARCH` — S14: Research outline and report; complete contract below.
- [ ] Complete matching fixture scenarios and applicable invalid/denied/operation-failure variants.
- [ ] Verify navigation, interactions and source token/layout behavior; rerun agreed lint/typecheck.

### M4 — Mastery, Practice, Favorites and journal

Dependencies: M3.

Four-surface dashboard/create; Mastery goal/source/outline/detail/study/review and objective/strategy/reset semantics; daily recall/Bank/Mistakes/import; original Favorites; read-only journal; progress/customization.

- [ ] `UI-QUIZ` — S13: Quiz result and follow-up; complete contract below.
- [ ] `MS-LEARNING` — S16: Personalized Learning / Learning; complete contract below.
- [ ] `MS-LEARNING-CREATE` — S17: Create learning; complete contract below.
- [ ] `MS-MASTERY-LIBRARY` — S18: Mastery Path atlas; complete contract below.
- [ ] `UI-MASTERY-CREATE` — S19: Create mastery goal; complete contract below.
- [ ] `MS-MASTERY-DETAIL` — S20: Mastery Path detail; complete contract below.
- [ ] `MS-MASTERY-STUDY` — S21, S22: Mastery study conversation; complete contract below.
- [ ] `MS-PRACTICE` — S23: Practice / daily review; complete contract below.
- [ ] `MS-QUESTION-BANK` — S24: Question Bank / Mistakes; complete contract below.
- [ ] `MS-PRACTICE-SESSION` — S25: Practice question session; complete contract below.
- [ ] `UI-PRACTICE-IMPORT` — S26: Import practice questions; complete contract below.
- [ ] `MS-FAVORITES` — S45: Favorites collections; complete contract below.
- [ ] `MS-FAVORITES-DETAIL` — S46: Favorites collection detail; complete contract below.
- [ ] `UI-FAVORITES-SAVE` — S47: Save to Favorites / Notebook; complete contract below.
- [ ] `MS-JOURNAL` — S48: Learning journal; complete contract below.
- [ ] `MS-PROGRESS` — S79: Learning progress; complete contract below.
- [ ] `UI-PAGE-CUSTOMIZE` — S116: Page customization; complete contract below.
- [ ] `UI-QUESTION-CATEGORIES` — S119: Question categories and bulk organization; complete contract below.
- [ ] `UI-MASTERY-ROUTE-EDIT` — S120: Edit mastery route; complete contract below.
- [ ] Complete matching fixture scenarios and applicable invalid/denied/operation-failure variants.
- [ ] Verify navigation, interactions and source token/layout behavior; rerun agreed lint/typecheck.

### M5 — Books, immersive reading and advanced rendering

Dependencies: M4.

Books proposal/spine/generation/reader/blocks/captures; Reading collections/materials/folders/document/media/annotations/companion; visualize/math/video/GeoGebra; preserved legacy Watching routes. Renderer spikes are mandatory completion gates.

- [ ] `UI-VISUAL-RESULT` — S15: Visualize / math animation / Video Lesson output; complete contract below.
- [ ] `MS-BOOKS` — S27: Books library; complete contract below.
- [ ] `MS-BOOK-CREATE` — S28: Create book / chapter spine; complete contract below.
- [ ] `MS-BOOK-READER` — S29, S30: Book / page reader; complete contract below.
- [ ] `MS-READING-LIBRARY` — S31: Immersive Reading library; complete contract below.
- [ ] `MS-READING-MATERIALS` — S32: All reading materials; complete contract below.
- [ ] `MS-READING-FOLDER` — S33: Reading collection folder; complete contract below.
- [ ] `MS-READING` — S34, S35, S36: Immersive Reading workspace; complete contract below.
- [ ] `UI-READING-ACTIONS` — S37: Reading annotation and display tools; complete contract below.
- [ ] `ADAPTER-LEGACY-WATCH` — S38: Legacy watching session; complete contract below.
- [ ] `UI-BOOK-BLOCKS` — S124: Book learning block family; complete contract below.
- [ ] Complete matching fixture scenarios and applicable invalid/denied/operation-failure variants.
- [ ] Verify navigation, interactions and source token/layout behavior; rerun agreed lint/typecheck.

### M6 — Editable Learning notebook, tasks, calendar and partners

Dependencies: M3, M4; M5 renderer decisions for shared media/notes.

Note tree/blocks/revision/recovery/AI suggestion/review/Anki sample; full task status editing; all calendar views and recurrence; partner five-step wizard, continuity/channels/archives/groups. No real channel/notifications.

- [ ] `MS-NOTES` — S62: Learning notebook / Co-Writer library; complete contract below.
- [ ] `MS-NOTE-EDITOR` — S63: Learning notebook editor; complete contract below.
- [ ] `MS-TASKS` — S64: Task Board; complete contract below.
- [ ] `MS-CALENDAR` — S65: Calendar; complete contract below.
- [ ] `MS-PARTNERS` — S66: Partners directory; complete contract below.
- [ ] `MS-PARTNER-CREATE` — S67: Create partner; complete contract below.
- [ ] `MS-PARTNER` — S68: Partner detail / chat; complete contract below.
- [ ] `UI-PARTNER-CHANNELS` — S69: Partner channel onboarding; complete contract below.
- [ ] `MS-GROUP-CREATE` — S70: Create partner group; complete contract below.
- [ ] `MS-GROUP` — S71: Partner group discussion; complete contract below.
- [ ] `UI-NOTE-REVIEW` — S121: Notebook flashcard review; complete contract below.
- [ ] `UI-NOTE-INSERT-SOURCES` — S122: Note source and favorites selection; complete contract below.
- [ ] `UI-NOTE-REVIEW-MARGIN` — S123: Note review and generated suggestion margin; complete contract below.
- [ ] `UI-PARTNER-LINK-ARCHIVES` — S132: Partner link and archive selection; complete contract below.
- [ ] Complete matching fixture scenarios and applicable invalid/denied/operation-failure variants.
- [ ] Verify navigation, interactions and source token/layout behavior; rerun agreed lint/typecheck.

### M7 — Knowledge and account-resource management

Dependencies: M3; M5 for preview/render reuse.

KB/engine/source/index/version/coverage flows; Skills/Personas; connected and imported agents; MCP/CLI management; Memory layers/resolver/graph/run. Preserve account/workspace and admin/read-only boundaries.

- [ ] `MS-KNOWLEDGE` — S41: Knowledge Center; complete contract below.
- [ ] `MS-KB-DETAIL` — S42: Knowledge base details; complete contract below.
- [ ] `UI-KB-CREATE` — S43: Create / link knowledge base; complete contract below.
- [ ] `MS-ENGINE-DETAIL` — S44: Knowledge engine configuration; complete contract below.
- [ ] `MS-SKILLS` — S49: Skills; complete contract below.
- [ ] `MS-PERSONAS` — S50: Personas; complete contract below.
- [ ] `MS-AGENTS` — S51: My Agents; complete contract below.
- [ ] `MS-MCP` — S52: MCP Services; complete contract below.
- [ ] `MS-CLI` — S53: CLI Apps; complete contract below.
- [ ] `MS-MEMORY` — S54: Memory hub; complete contract below.
- [ ] `MS-MEMORY-L1` — S55: L1 workspace mirror; complete contract below.
- [ ] `MS-MEMORY-L2` — S56, S57: L2 summaries; complete contract below.
- [ ] `MS-MEMORY-L3` — S58, S59: L3 cross-surface knowledge; complete contract below.
- [ ] `MS-MEMORY-GRAPH` — S60: Memory graph; complete contract below.
- [ ] `ADAPTER-MEMORY-RESOLVE` — S61: Memory reference resolver; complete contract below.
- [ ] `UI-IMPORTED-AGENTS` — S117: Imported-history agents; complete contract below.
- [ ] `UI-HISTORY-IMPORT` — S118: Chat history import wizard; complete contract below.
- [ ] `UI-KB-SOURCES` — S125: Knowledge source management; complete contract below.
- [ ] `UI-KB-DIAGNOSTICS` — S126: KB indexing history and diagnostics; complete contract below.
- [ ] `UI-KIWIX-CONNECT` — S127: Kiwix connection; complete contract below.
- [ ] `UI-MEMORY-RUN` — S133: Memory processing run; complete contract below.
- [ ] Complete matching fixture scenarios and applicable invalid/denied/operation-failure variants.
- [ ] Verify navigation, interactions and source token/layout behavior; rerun agreed lint/typecheck.

### M8 — Advanced settings, user administration and conditional parity

Dependencies: M2, M6, M7.

All remaining source settings and agent backends; shared staged save/apply/discard; readiness/OAuth/discovery/migration; admin/grants/guardian; handoff create/redeem; conditional Whisper fixture. No inventory record removed for MVP convenience.

- [ ] `MS-SETTINGS-archive` — S10: Archived chats; complete contract below.
- [ ] `MS-WHISPER` — S72: Whisper practice room; complete contract below.
- [ ] `MS-ADMIN-USERS` — S76: User administration; complete contract below.
- [ ] `MS-HANDOFF-CREATE` — S77: Session handoff link creation; complete contract below.
- [ ] `MS-HANDOFF-REDEEM` — S78: Session handoff redemption; complete contract below.
- [ ] `MS-SETTINGS-workspace` — S83: Workspace; complete contract below.
- [ ] `MS-SETTINGS-data-migration` — S84: Data migration; complete contract below.
- [ ] `MS-SETTINGS-usage` — S85: Usage statistics; complete contract below.
- [ ] `MS-SETTINGS-connections` — S86: Providers; complete contract below.
- [ ] `MS-SETTINGS-llm` — S87: Language models; complete contract below.
- [ ] `MS-SETTINGS-task-models` — S88: Task models; complete contract below.
- [ ] `MS-SETTINGS-embedding` — S89: Embedding models; complete contract below.
- [ ] `MS-SETTINGS-search` — S90: Search; complete contract below.
- [ ] `MS-SETTINGS-voice` — S91: Voice; complete contract below.
- [ ] `MS-SETTINGS-multimodal` — S92: Multimodal generation; complete contract below.
- [ ] `MS-SETTINGS-starters` — S93: Starting points; complete contract below.
- [ ] `MS-SETTINGS-attachments` — S94: Attachments; complete contract below.
- [ ] `MS-SETTINGS-video-learning` — S95: Video Learning; complete contract below.
- [ ] `MS-SETTINGS-learner-profile` — S96: Learner profile; complete contract below.
- [ ] `MS-SETTINGS-guardian` — S97: Guardian; complete contract below.
- [ ] `MS-SETTINGS-memory` — S98: Memory settings; complete contract below.
- [ ] `MS-SETTINGS-tools` — S99: Tools; complete contract below.
- [ ] `MS-SETTINGS-capabilities` — S100: Capabilities; complete contract below.
- [ ] `MS-SETTINGS-knowledge` — S101: Knowledge Base / document parsing; complete contract below.
- [ ] `MS-SETTINGS-network` — S102: Network; complete contract below.
- [ ] `MS-SETTINGS-status` — S103: Runtime status; complete contract below.
- [ ] `MS-SETTINGS-about` — S104: About; complete contract below.
- [ ] `MS-SETTINGS-agent-claude-code` — S105: Partners & agents: claude-code; complete contract below.
- [ ] `MS-SETTINGS-agent-codex` — S106: Partners & agents: codex; complete contract below.
- [ ] `MS-SETTINGS-agent-grok` — S107: Partners & agents: grok; complete contract below.
- [ ] `MS-SETTINGS-agent-antigravity` — S108: Partners & agents: antigravity; complete contract below.
- [ ] `MS-SETTINGS-agent-kimi` — S109: Partners & agents: kimi; complete contract below.
- [ ] `MS-SETTINGS-agent-opencode` — S110: Partners & agents: opencode; complete contract below.
- [ ] `MS-SETTINGS-agent-mimo` — S111: Partners & agents: mimo; complete contract below.
- [ ] `MS-SETTINGS-agent-hermes` — S112: Partners & agents: hermes; complete contract below.
- [ ] `MS-SETTINGS-agent-hermes-remote` — S113: Partners & agents: hermes-remote; complete contract below.
- [ ] `MS-SETTINGS-agent-openclaw` — S114: Partners & agents: openclaw; complete contract below.
- [ ] `MS-SETTINGS-agent-deepseek-harness` — S115: Partners & agents: deepseek-harness; complete contract below.
- [ ] `UI-SERVER-FOLDER` — S128: Server folder chooser; complete contract below.
- [ ] `UI-WORKSPACE-BINDINGS` — S129: Workspace resource assignment; complete contract below.
- [ ] `UI-SETTINGS-SETUP` — S130: Settings readiness and guided setup; complete contract below.
- [ ] `UI-PROVIDER-SETUP` — S131: Provider credential and test subpanels; complete contract below.
- [ ] Complete matching fixture scenarios and applicable invalid/denied/operation-failure variants.
- [ ] Verify navigation, interactions and source token/layout behavior; rerun agreed lint/typecheck.

### M9 — Complete UI-only parity and handoff validation

Dependencies: M0–M8.

Verify all 135 dispositions, 63 route resolutions, screen and overlay acceptance, deterministic failure fixtures, theme/layout/locale/device behavior, renderer fidelity and repo checks. Record backend integration gaps separately; UI completion is not backend parity.

- [ ] Check off all 135 primary dispositions and grouped secondary actions
- [ ] Exercise all 63 web-page-to-mobile resolutions including canonical/legacy/invalid links
- [ ] Validate every screen loading/empty/error/ready and conditional access fixture
- [ ] Validate every sheet/dialog dismissal, busy, cancel/confirm, focus restore and failure state
- [ ] Compare only observed source screenshots to equivalent rendered mobile state; source-only interiors retain pending visual review
- [ ] Check all palettes/layout variants, locales, font scale, TalkBack, reduced motion, IME, Back and interrupted rendering
- [ ] Prove no live API/provider/channel/notification execution in UI-only mode
- [ ] Run agreed scoped lint/typecheck and meaningful navigation/state tests; record unresolved backend parity separately

## Shared acceptance baseline (applies to every screen)

1. Navigation uses the registry destination and validated typed IDs. Normal entry, direct/deep entry, invalid identity, Back and workspace/account switch have deliberate results. No duplicate product screen is registered for an alias or restore route.
2. Layout uses the source role map and original assets. Shell/header/content/composer/secondary panels follow SCREEN_MAPPING. For each capture reference, match only what it actually shows: shell/auth/blocked state; populated interiors use source evidence and remain visually unverified.
3. All source actions listed in the per-screen contract are reachable with source permission/availability guards. Every action has fixture success and operation-failure/cancel where meaningful; busy blocks duplicate submit. UI-only success is a local transition, not a real service result.
4. Loading, empty, error and ready are distinguishable; a failed fetch cannot silently become an empty-success list unless source explicitly degrades that way, which must remain documented. Recovery preserves user text/selection/IDs. Pure local controls substitute applicable idle/closed/validation/busy states rather than inventing a loader.
5. TalkBack label/heading/state, keyboard-safe inputs, 48dp proposed target regions, text scaling, focus restoration, system Back and reduced motion work across Android and retained web/iOS paths. Heavy rendering and long lists must not block the composer or lose source locators.
6. Fixture state is deterministic by principal/content-workspace/record and resets only through the development harness. UI never contacts a backend in mock mode. Real auth/permissions/streaming/indexing/provider correctness remain separate integration work.

## Screen-by-screen implementation and acceptance

Each named MS contract is an actual mobile navigation destination. Multiple source rows can share it; settings keys share one dynamic route implementation but retain distinct section contracts and access cases. Checkbox text is proposed acceptance; the quoted source state descriptions retain their original evidence labels.

### MS-SEARCH

Audit: S02. Milestone: M2. Destination: `/ui/search`. Host: Root modal stack. Fixture package: `shell`.

Source ownership: [CommandPalette.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/sidebar/CommandPalette.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Search pages, sessions, learning records, partners and groups.

Specific fidelity rule: Results retain page/session/learning/partner/group types; query and selected index reset on open. No opened-palette screenshot exists in the audit; use source structure and mark visual sign-off pending.

Capture references: [CAP-033](audit/screenshots/snow-1440-033--chat.png), [CAP-131](audit/screenshots/dark-412-033--chat.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [x] **Navigation:** enter from Root modal stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [x] **Interactions (S02):** Type query; select result; new chat; navigate. Bind each to the `shell` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [x] **Loading:** Pending identity/workspace probe; skeleton shell and disabled dependent actions.
- [x] **Empty:** No records in shelf or no query results; preserve allowed navigation.
- [x] **Error / recovery:** Unavailable identity/workspace probe with retry; failed switch leaves prior selection.
- [x] **Ready / completion:** Switch selects a fixture scope and applies source destination rule; search opens exact typed record.
- [x] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [x] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S02: loading — Not applicable — modal opens from shell; empty — VERIFIED — query filtering; exact no-result appearance needs runtime; error — UNVERIFIED — not a universal backend search/error screen; completed — VERIFIED — chosen action navigates

Executed UI-only coverage and explicit native/source-visual limits: [M2 acceptance disposition](M2_VERIFICATION.md#acceptance-disposition-by-surface). Checked boxes do not assert native device or backend verification.

### MS-CHAT

Audit: S04, S05. Milestone: M3. Destination: `/chat or /chat/[sessionId]`. Host: Home shelf / conversation stack. Fixture package: `chat`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/chat/page.tsx), [ChatWorkspace.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/chat/components/ChatWorkspace.tsx), [StarterSuggestions.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/StarterSuggestions.tsx), [ChatComposer.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/ChatComposer.tsx), [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/chat/[sessionId]/page.tsx), [ChatMessageList.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/chat/messages/ChatMessageList.tsx), [ChatSessionMenu.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/chat/components/ChatSessionMenu.tsx), [SessionActionsMenu.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/sessions/SessionActionsMenu.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): New conversation; greeting; starter suggestions; composer; resource and answer controls / Persisted message stream; editable title; user messages; response activity; output previews; usage.

Specific fidelity rule: New entry has source greeting/starters; first send creates exactly one fixture session and persisted route; restored transcript keeps same IDs. Capability-specific output stays within message/viewer context.

Capture references: [CAP-032](audit/screenshots/snow-1440-032--chat-audit-missing-record.png), [CAP-130](audit/screenshots/dark-412-032--chat-audit-missing-record.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Home shelf / conversation stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S04):** Compose; attach; select model/capability/tools/resources; record voice; send. Bind each to the `chat` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Interactions (S05):** Send/stop; retry; edit/discard message where allowed; copy; read aloud; rename/export/save/archive/delete via source menus. Bind each to the `chat` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Restoring session or catalog; live stream distinct from restore loading.
- [ ] **Empty:** New conversation greeting/starters versus missing saved session; filtered history empty.
- [ ] **Error / recovery:** Restore failure, attachment validation, failed structured reply, protocol mismatch or dropped stream.
- [ ] **Ready / completion:** Send binds one fixture session; scripted stream completes once; stop/retry/edit use stable IDs and preserve failed draft.
- [ ] **Permissions/availability:** Route requires llm access when authentication is enabled; learning policy and runtime capability/module checks also apply.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S04: loading — VERIFIED — model/resource probes and session loading; empty — VERIFIED — greeting and starters before messages; error — VERIFIED — attachment errors and resource/session load failure handling; completed — VERIFIED — first successful send binds a session route
- S05: loading — VERIFIED — SessionLoadingView and restore loading; empty — VERIFIED — same workspace handles empty session; error — VERIFIED — failed restore/retry/edit/copy and protocol mismatch surfaces; completed — VERIFIED — rendered completed response and usage footer

### MS-SESSION-VIEWER

Audit: S07. Milestone: M3. Destination: `/ui/session-viewer`. Host: Conversation stack. Fixture package: `chat`.

Source ownership: [SessionViewerPanel.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/SessionViewerPanel.tsx), [SessionActivityPanel.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/SessionActivityPanel.tsx), [ChatMarkdownNoteTab.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/ChatMarkdownNoteTab.tsx), [SubagentTabBody.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/SubagentTabBody.tsx), [ConsultationTabBody.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/ConsultationTabBody.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Tabs for file, web, Markdown note, followup/consultation/subagent/GeoGebra content; activity and attachments.

Specific fidelity rule: Restore selected/closed/stashed tabs per source owner; web timeout, activity, followup, consultation/subagent and Markdown/GeoGebra views must not collapse into one generic document.

Capture references: [CAP-033](audit/screenshots/snow-1440-033--chat.png), [CAP-131](audit/screenshots/dark-412-033--chat.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Conversation stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S07):** Open/switch/close/reopen viewer tabs; inspect activity; work with contextual content. Bind each to the `chat` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Restoring session or catalog; live stream distinct from restore loading.
- [ ] **Empty:** New conversation greeting/starters versus missing saved session; filtered history empty.
- [ ] **Error / recovery:** Restore failure, attachment validation, failed structured reply, protocol mismatch or dropped stream.
- [ ] **Ready / completion:** Send binds one fixture session; scripted stream completes once; stop/retry/edit use stable IDs and preserve failed draft.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S07: loading — VERIFIED — web embed loaded/timeout state; empty — VERIFIED — viewer landing when tabs are empty; error — VERIFIED — embed timeout and file-preview-specific failures; completed — VERIFIED — selected tab content

### MS-FILE-PREVIEW

Audit: S08. Milestone: M3. Destination: `/ui/file-preview`. Host: Root modal stack. Fixture package: `files`.

Source ownership: [FilePreviewDrawer.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/preview/FilePreviewDrawer.tsx), [previewerFor.ts](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/preview/previewerFor.ts)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Attachment/output preview selected by file kind; image, PDF, Office, sheet, Markdown, SVG, video/text and fallback renderers.

Specific fidelity rule: Renderer selection uses typed file kind; bundled PDF/image/text/Office/sheet/video examples plus unsupported/decode error scenarios; Back restores origin selection. Interactive file support is gated by format-specific spike.

Capture references: [CAP-033](audit/screenshots/snow-1440-033--chat.png), [CAP-131](audit/screenshots/dark-412-033--chat.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Root modal stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S08):** Open; close; use available file actions. Bind each to the `files` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Local decode/read wait or deliberate loading scenario.
- [ ] **Empty:** Unsupported file uses original fallback; missing file is unavailable, not blank content.
- [ ] **Error / recovery:** Fixture decode/read failure; retain owner and fallback/download indication.
- [ ] **Ready / completion:** Open bundled sample file in the planned renderer; close restores owner. No generated/uploaded server file claimed.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S08: loading — VERIFIED — per-format fetch/decode loading; empty — VERIFIED — fallback renderer for unsupported files; error — VERIFIED — per-preview fetch/decode failures; completed — VERIFIED — rendered file or supported fallback

### MS-HISTORY

Audit: S09. Milestone: M3. Destination: `/space/chat-history`. Host: Resources shelf. Fixture package: `chat`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/space/chat-history/page.tsx), [ChatHistorySection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/ChatHistorySection.tsx), [OrganizedSessionList.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/sessions/OrganizedSessionList.tsx), [SessionActionsMenu.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/sessions/SessionActionsMenu.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Conversation history; search; kind and archive filters; mastery/reading labels.

Specific fidelity rule: Search, kind and archived filters distinguish no results from load failure; reopening chat/mastery/reading history uses its owning route and workspace.

Capture references: [CAP-023](audit/screenshots/snow-1440-023--space-chat-history.png), [CAP-121](audit/screenshots/dark-412-023--space-chat-history.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Resources shelf and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S09):** Search; filter; reopen/restore; use per-session actions. Bind each to the `chat` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Restoring session or catalog; live stream distinct from restore loading.
- [ ] **Empty:** New conversation greeting/starters versus missing saved session; filtered history empty.
- [ ] **Error / recovery:** Restore failure, attachment validation, failed structured reply, protocol mismatch or dropped stream.
- [ ] **Ready / completion:** Send binds one fixture session; scripted stream completes once; stop/retry/edit use stable IDs and preserve failed draft.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S09: loading — VERIFIED — list and search loading; empty — VERIFIED — filtered list/no matches requires exact runtime copy check; error — VERIFIED — searchError branch and retry version; completed — VERIFIED — restored conversation opens owning destination

### MS-SETTINGS-archive

Audit: S10. Milestone: M8. Destination: `/settings/archive`. Host: Settings stack. Fixture package: `archive`.

Source ownership: [ArchivedChatsSettingsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/ArchivedChatsSettingsSection.tsx), [ArchivedConversations.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/ArchivedConversations.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Archived conversation management.

Specific fidelity rule: Render archived conversation search/list actions. Unarchive restores the same session; permanent delete requires source confirmation. This is not a configuration form: no Save draft/Apply toolbar or provider fields are added.

Capture references: [CAP-062](audit/screenshots/snow-1440-063--settings-archive.png), [CAP-160](audit/screenshots/dark-412-063--settings-archive.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S10):** Search; unarchive; permanently delete. Bind each to the `archive` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Archived list loading; selected restore/permanent-delete busy.
- [ ] **Empty:** No archived conversations versus no search matches.
- [ ] **Error / recovery:** Failed list/unarchive/permanent delete retains prior rows and recoverable action.
- [ ] **Ready / completion:** Unarchive moves same fixture session to active history; permanent delete requires named confirmation and removes only selected record; no settings-draft toolbar.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S10: loading — VERIFIED — archived list loading; empty — VERIFIED — archived-list empty branch; error — VERIFIED — operation failure handling; completed — VERIFIED — restored/deleted list refresh

### MS-LEARNING

Audit: S16. Milestone: M4. Destination: `/learning`. Host: Learning shelf. Fixture package: `learning`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/page.tsx), [LearningDashboard.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/learning/LearningDashboard.tsx), [ClassicLearningDashboard.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/ui-layout/classic/ClassicLearningDashboard.tsx), [surfaces.ts](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/learning/surfaces.ts)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Learning dashboard; Books, Mastery Path, Practice, Immersive Reading; activity/items and source-specific counts.

Specific fidelity rule: Books/Mastery/Practice/Reading are distinct cards/entries with separately derived counts; source module/policy/hidden preferences apply before displaying choices.

Capture references: [CAP-045](audit/screenshots/snow-1440-045--learning.png), [CAP-143](audit/screenshots/dark-412-045--learning.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Learning shelf and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S16):** Open learning surface or item; create learning. Bind each to the `learning` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Inventory/preferences loading plus library skeletons.
- [ ] **Empty:** No learning records versus every eligible feature hidden; preserve source create/customize recovery.
- [ ] **Error / recovery:** Fixture module/preferences/list error independently retryable.
- [ ] **Ready / completion:** Open correct library/item; create chooser hands off to feature owner; per-kind counts update only after fixture mutation.
- [ ] **Permissions/availability:** Route requires llm access when authentication is enabled; learning policy and runtime capability/module checks also apply.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S16: loading — VERIFIED — feature data loading; empty — VERIFIED — feature-specific empty invitations; error — VERIFIED — feature load errors; inspect runtime for combined failure layout; completed — VERIFIED — existing learning records

### MS-LEARNING-CREATE

Audit: S17. Milestone: M4. Destination: `/learning/new`. Host: Learning stack. Fixture package: `learning`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/new/page.tsx), [NewLearningPage.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/learning/NewLearningPage.tsx), [LearningCreateMenu.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/learning/LearningCreateMenu.tsx), [surfaces.ts](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/learning/surfaces.ts)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Choose which actual learning surface to create.

Specific fidelity rule: The same four eligible choices launch their owning create/import flow; every-hidden state offers source customization recovery, not a fabricated fifth learning feature.

Capture references: [CAP-044](audit/screenshots/snow-1440-044--learning-new.png), [CAP-142](audit/screenshots/dark-412-044--learning-new.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Learning stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S17):** Start Books, Mastery Path, Practice import or Reading creation. Bind each to the `learning` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Inventory/preferences loading plus library skeletons.
- [ ] **Empty:** No learning records versus every eligible feature hidden; preserve source create/customize recovery.
- [ ] **Error / recovery:** Fixture module/preferences/list error independently retryable.
- [ ] **Ready / completion:** Open correct library/item; create chooser hands off to feature owner; per-kind counts update only after fixture mutation.
- [ ] **Permissions/availability:** Route requires llm access when authentication is enabled; learning policy and runtime capability/module checks also apply.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S17: loading — VERIFIED — auth, customization and module inventory gate LearningSkeleton; empty — VERIFIED — customize.emptyLearning when eligible surfaces are all hidden; error — VERIFIED — inventory/preferences error and reload controls; completed — VERIFIED — navigates to owning creation flow

### MS-MASTERY-LIBRARY

Audit: S18. Milestone: M4. Destination: `/learning/mastery`. Host: Learning stack. Fixture package: `mastery`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/mastery/page.tsx), [TopicAtlas.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/TopicAtlas.tsx), [TopicMapCard.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/TopicMapCard.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Learning goals/path cards; mastery progress; source and next-step context.

Specific fidelity rule: Path cards display coherent mastered/total/modules/sessions and next-step context; create action opens source goal/source wizard.

Capture references: [CAP-043](audit/screenshots/snow-1440-043--learning-mastery.png), [CAP-141](audit/screenshots/dark-412-043--learning-mastery.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Learning stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S18):** Open path; create topic. Bind each to the `mastery` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Atlas/detail/session/strategy/board probes independently pending.
- [ ] **Empty:** Uncharted atlas; no outline/no sessions; mode-specific conversation starters.
- [ ] **Error / recovery:** Missing path/session, board/report error, failed route save and strategy/retention errors.
- [ ] **Ready / completion:** Goal + sources opens Outline; route edit updates same path; scripted Study/Review answers update fixture mastery; reset differs from delete.
- [ ] **Permissions/availability:** Route requires llm access when authentication is enabled; learning policy and runtime capability/module checks also apply.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S18: loading — VERIFIED — topic-card skeletons; empty — VERIFIED — Your atlas is still uncharted; error — VERIFIED — LearningErrorState with retry; completed — VERIFIED — path cards and mastery progress

### MS-MASTERY-DETAIL

Audit: S20. Milestone: M4. Destination: `/learning/mastery/[pathId]`. Host: Learning stack. Fixture package: `mastery`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/mastery/[pathId]/page.tsx), [StudyOutline.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/StudyOutline.tsx), [LearningBoard.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/LearningBoard.tsx), [ObjectiveDetail.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/ObjectiveDetail.tsx), [ReviewTrail.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/ReviewTrail.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Topic heading; sources; outline/board; knowledge points/objective reports; review trail; sessions; strategies/retention.

Specific fidelity rule: Outline/board are contextual views; objective, review trail, sessions, strategies/retention remain separate; reset progress retains path while delete removes it after named confirmation.

Capture references: [CAP-040](audit/screenshots/snow-1440-040--learning-mastery-audit-missing-record.png), [CAP-138](audit/screenshots/dark-412-040--learning-mastery-audit-missing-record.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Learning stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S20):** Select point; inspect objective; start study/review; edit route; adjust available strategy/retention; reset/delete. Bind each to the `mastery` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Atlas/detail/session/strategy/board probes independently pending.
- [ ] **Empty:** Uncharted atlas; no outline/no sessions; mode-specific conversation starters.
- [ ] **Error / recovery:** Missing path/session, board/report error, failed route save and strategy/retention errors.
- [ ] **Ready / completion:** Goal + sources opens Outline; route edit updates same path; scripted Study/Review answers update fixture mastery; reset differs from delete.
- [ ] **Permissions/availability:** Route requires llm access when authentication is enabled; learning policy and runtime capability/module checks also apply.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S20: loading — VERIFIED — topic, sessions and strategies load separately; empty — VERIFIED — unfinished outline and no sessions have distinct handling; error — VERIFIED — topic/sessions/board/strategy/retention errors; completed — VERIFIED — progress and completed/mastered points

### MS-MASTERY-STUDY

Audit: S21, S22. Milestone: M4. Destination: `/learning/mastery/[pathId]/sessions or /learning/mastery/[pathId]/sessions/[sessionId]`. Host: Learning stack. Fixture package: `mastery`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/mastery/[pathId]/sessions/page.tsx), [MasteryStudy.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/MasteryStudy.tsx), [ModeSwitch.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/ModeSwitch.tsx), [SessionCamp.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/SessionCamp.tsx), [mastery-mode.ts](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/lib/mastery-mode.ts), [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/mastery/[pathId]/sessions/[sessionId]/page.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Outline, Study, Review modes; study outline; transcript; contextual question cards; session camp; celebration / Same Mastery study surface restored to a specific session.

Specific fidelity rule: Existing session mode wins; Outline/Study/Review selector is visible and disabled during a live scripted turn; answer/skip/handoff and celebration update same path identity.

Capture references: [CAP-041](audit/screenshots/snow-1440-041--learning-mastery-audit-missing-record-sessions-audit-missing-record.png), [CAP-139](audit/screenshots/dark-412-041--learning-mastery-audit-missing-record-sessions-audit-missing-record.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Learning stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S21):** Send/stop; change mode when idle; answer/skip allowed questions; open sessions/outline; save. Bind each to the `mastery` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Interactions (S22):** Continue existing session using its persisted mode. Bind each to the `mastery` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Atlas/detail/session/strategy/board probes independently pending.
- [ ] **Empty:** Uncharted atlas; no outline/no sessions; mode-specific conversation starters.
- [ ] **Error / recovery:** Missing path/session, board/report error, failed route save and strategy/retention errors.
- [ ] **Ready / completion:** Goal + sources opens Outline; route edit updates same path; scripted Study/Review answers update fixture mastery; reset differs from delete.
- [ ] **Permissions/availability:** Route requires llm access when authentication is enabled; learning policy and runtime capability/module checks also apply.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S21: loading — VERIFIED — useMasteryStudySession loading; empty — VERIFIED — mode-specific starter choices; error — VERIFIED — missing/unavailable session and action failures; completed — VERIFIED — mastered progress and level-up overlay
- S22: loading — VERIFIED — existing session load; empty — UNVERIFIED — empty persisted session allowed by runtime; error — VERIFIED — session load failure handling in study owner; completed — VERIFIED — resumed transcript

### MS-PRACTICE

Audit: S23. Milestone: M4. Destination: `/learning/practice`. Host: Learning stack. Fixture package: `practice`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/practice/page.tsx), [PracticePage.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/learning/practice/PracticePage.tsx), [ReviewHome.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/learning/practice/ReviewHome.tsx), [PracticeInsights.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/learning/practice/PracticeInsights.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Today review; due/overdue/next due; cross-workspace question references; practice insights; import entry.

Specific fidelity rule: Caught-up and overdue/next-due summaries differ; source review queue can span content workspaces using typed refs, not a generic quiz sequence.

Capture references: [CAP-046](audit/screenshots/snow-1440-046--learning-practice.png), [CAP-144](audit/screenshots/dark-412-046--learning-practice.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Learning stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S23):** Start review; import questions; open source collections. Bind each to the `practice` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Summary/question/judgment/import loading; rating submit disabled.
- [ ] **Empty:** Caught-up review with next due; bank/mistakes no entries/no matches; completed queue.
- [ ] **Error / recovery:** Stale question/conflict reload; judgment/import failure; duplicate rating prevented.
- [ ] **Ready / completion:** Answer/reveal enables source recall rating; recorded fixture outcome advances once; Again remains in queue; completion counts/skips remain coherent.
- [ ] **Permissions/availability:** Route requires llm access when authentication is enabled; learning policy and runtime capability/module checks also apply.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S23: loading — VERIFIED — summary/start/import busy states; empty — VERIFIED — caught-up state and next due; error — VERIFIED — LearningErrorState retry; completed — VERIFIED — session completion returns refreshed summary

### MS-QUESTION-BANK

Audit: S24. Milestone: M4. Destination: `/space/questions`. Host: Resources stack. Fixture package: `practice`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/space/questions/page.tsx), [PracticePage.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/learning/practice/PracticePage.tsx), [QuestionBankSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/question-bank/QuestionBankSection.tsx), [BankToolbar.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/question-bank/BankToolbar.tsx), [BankScopeRail.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/question-bank/BankScopeRail.tsx), [QuestionCard.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/question-bank/QuestionCard.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Question Bank and Mistakes tabs; filters/search/categories; question cards; bulk selection.

Specific fidelity rule: Question Bank and Mistakes remain tabs; no entries/no match/everything filed/nothing in view are distinct. Category editing/bulk actions preserve selected entry IDs.

Capture references: [CAP-029](audit/screenshots/snow-1440-029--space-questions.png), [CAP-127](audit/screenshots/dark-412-029--space-questions.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Resources stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S24):** Filter/search; select; organize categories; bookmark; practice selection; source-supported deletion. Bind each to the `practice` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Summary/question/judgment/import loading; rating submit disabled.
- [ ] **Empty:** Caught-up review with next due; bank/mistakes no entries/no matches; completed queue.
- [ ] **Error / recovery:** Stale question/conflict reload; judgment/import failure; duplicate rating prevented.
- [ ] **Ready / completion:** Answer/reveal enables source recall rating; recorded fixture outcome advances once; Again remains in queue; completion counts/skips remain coherent.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S24: loading — VERIFIED — bank loading; empty — VERIFIED — No matching questions / Everything is filed / No entries yet / Nothing in this view; error — VERIFIED — bank error retry; completed — VERIFIED — organized cards or selected practice session

### MS-PRACTICE-SESSION

Audit: S25. Milestone: M4. Destination: `/learning/practice/session`. Host: Learning stack. Fixture package: `practice`.

Source ownership: [PracticeSession.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/learning/practice/PracticeSession.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Question queue; answer/reveal; correctness; recall ratings Again, Hard, Mastered, Easy; completion summary.

Specific fidelity rule: Question → answer/reveal → original recall rating → next → completion; rating values again/hard/good/easy display Again/Hard/Mastered/Easy; conflict reload cannot double-rate.

Capture references: [CAP-029](audit/screenshots/snow-1440-029--space-questions.png), [CAP-127](audit/screenshots/dark-412-029--space-questions.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Learning stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S25):** Answer/reveal; rate; retry conflict; skip where offered; finish. Bind each to the `practice` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Summary/question/judgment/import loading; rating submit disabled.
- [ ] **Empty:** Caught-up review with next due; bank/mistakes no entries/no matches; completed queue.
- [ ] **Error / recovery:** Stale question/conflict reload; judgment/import failure; duplicate rating prevented.
- [ ] **Ready / completion:** Answer/reveal enables source recall rating; recorded fixture outcome advances once; Again remains in queue; completion counts/skips remain coherent.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S25: loading — VERIFIED — question fetch and answer/rating busy; empty — VERIFIED — queue completion with skipped count; error — VERIFIED — missing/conflicting question, error and reload; completed — VERIFIED — Practice complete; saved count and next due

### MS-BOOKS

Audit: S27. Milestone: M5. Destination: `/learning/books`. Host: Learning stack. Fixture package: `books`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/books/page.tsx), [BooksRoute.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/books/BooksRoute.tsx), [BookLibrary.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/books/components/BookLibrary.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): AI-authored book library; generation/readiness status; create entry.

Specific fidelity rule: Only AI-authored fixture books live here; imported PDFs/EPUBs stay in Reading. Book status and create authority are visible.

Capture references: [CAP-039](audit/screenshots/snow-1440-039--learning-books.png), [CAP-137](audit/screenshots/dark-412-039--learning-books.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Learning stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S27):** Open book; create; source-provided library actions. Bind each to the `books` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Book opening/page hydration; scripted generation placeholders independently pending.
- [ ] **Empty:** Empty library, no generated page content and placeholders are distinct.
- [ ] **Error / recovery:** Failed proposal/page render/generation; paused is not error; rebuild failure retains old content.
- [ ] **Ready / completion:** Confirm proposal/spine advances scripted generation; selected page displays fixed blocks; pause/resume/rebuild/deep-dive/capture are fixture transitions.
- [ ] **Permissions/availability:** Route requires llm access when authentication is enabled; learning policy and runtime capability/module checks also apply.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S27: loading — VERIFIED — loadingBooks; empty — VERIFIED — empty library; error — VERIFIED — booksError; completed — VERIFIED — generated books list

### MS-BOOK-CREATE

Audit: S28. Milestone: M5. Destination: `/learning/books/create`. Host: Learning stack. Fixture package: `books`.

Source ownership: [BookCreator.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/books/components/BookCreator.tsx), [SpineEditor.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/books/components/SpineEditor.tsx), [BooksRoute.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/books/BooksRoute.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Subject/proposal; proposed book; editable chapter spine; confirmation before pages.

Specific fidelity rule: Creator, proposal confirmation and editable spine are ordered steps; no pages are considered generated until confirmed spine and scripted generation; cancel retains owner navigation.

Capture references: [CAP-037](audit/screenshots/snow-1440-037--learning-books-audit-missing-record.png), [CAP-135](audit/screenshots/dark-412-037--learning-books-audit-missing-record.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Learning stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S28):** Create proposal; confirm; edit spine; begin generation. Bind each to the `books` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Book opening/page hydration; scripted generation placeholders independently pending.
- [ ] **Empty:** Empty library, no generated page content and placeholders are distinct.
- [ ] **Error / recovery:** Failed proposal/page render/generation; paused is not error; rebuild failure retains old content.
- [ ] **Ready / completion:** Confirm proposal/spine advances scripted generation; selected page displays fixed blocks; pause/resume/rebuild/deep-dive/capture are fixture transitions.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S28: loading — VERIFIED — creating/proposal/spine confirmation busy; empty — VERIFIED — initial creator form; error — VERIFIED — book operation failure in route owner; completed — VERIFIED — confirmed spine transitions toward reader/generation

### MS-BOOK-READER

Audit: S29, S30. Milestone: M5. Destination: `/learning/books/[bookId] or /learning/books/[bookId]/pages/[pageId]`. Host: Learning stack. Fixture package: `books`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/books/[bookId]/page.tsx), [BooksRoute.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/books/BooksRoute.tsx), [PageReader.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/books/components/PageReader.tsx), [BookSidebar.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/books/components/BookSidebar.tsx), [BookChatPanel.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/books/components/BookChatPanel.tsx), [LearningCapturePanel.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/books/components/LearningCapturePanel.tsx), [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/books/[bookId]/pages/[pageId]/page.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Book spine; selected page; generated blocks; generation activity; pause/health banners; tutor chat; captures / Same reader as S29 focused on page ID.

Specific fidelity rule: Chapter/page/block references survive navigation; block types retain their own controls; health/paused/placeholder/failure states differ; tutor/capture/spine are secondary phone panes.

Capture references: [CAP-037](audit/screenshots/snow-1440-037--learning-books-audit-missing-record.png), [CAP-135](audit/screenshots/dark-412-037--learning-books-audit-missing-record.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Learning stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S29):** Navigate pages; read; answer quiz/flashcards; chat; deep dive; capture; pause/resume/rebuild/supplement when allowed. Bind each to the `books` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Interactions (S30):** Navigate/read specific page. Bind each to the `books` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Book opening/page hydration; scripted generation placeholders independently pending.
- [ ] **Empty:** Empty library, no generated page content and placeholders are distinct.
- [ ] **Error / recovery:** Failed proposal/page render/generation; paused is not error; rebuild failure retains old content.
- [ ] **Ready / completion:** Confirm proposal/spine advances scripted generation; selected page displays fixed blocks; pause/resume/rebuild/deep-dive/capture are fixture transitions.
- [ ] **Permissions/availability:** Route requires llm access when authentication is enabled; learning policy and runtime capability/module checks also apply.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S29: loading — VERIFIED — opening book and unhydrated page loading; empty — VERIFIED — placeholder blocks during generation; error — VERIFIED — BookHealthBanner and page generation failure handling; completed — VERIFIED — generated chapter and saved reading position
- S30: loading — VERIFIED — page hydration loading; empty — VERIFIED — page placeholders when not generated; error — VERIFIED — owner handles unavailable pages; completed — VERIFIED — page blocks displayed

### MS-READING-LIBRARY

Audit: S31. Milestone: M5. Destination: `/learning/reading`. Host: Learning stack. Fixture package: `reading`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/reading/page.tsx), [ReadingLibrary.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/library/ReadingLibrary.tsx), [LibraryShell.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/library/LibraryShell.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Collections/folders and reading library; creation/import entry.

Specific fidelity rule: Collections have independent membership from material records; create/add/rename/folder operations use source dialogs rather than new book generation.

Capture references: [CAP-052](audit/screenshots/snow-1440-052--learning-reading.png), [CAP-150](audit/screenshots/dark-412-052--learning-reading.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Learning stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S31):** Search/browse; open collection; add materials; manage folder. Bind each to the `reading` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Library/import checks; selected document/companion restore; media load.
- [ ] **Empty:** No materials, empty collection and no active conversation distinguishable.
- [ ] **Error / recovery:** Unsupported/corrupt material, broken URL, missing session, failed annotation/organize-notes.
- [ ] **Ready / completion:** Add bundled file or seeded URL metadata; source selection/timestamp anchors fixed tutor response; annotation persists within fixture run; display changes retain locator.
- [ ] **Permissions/availability:** Route requires llm access when authentication is enabled; learning policy and runtime capability/module checks also apply.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S31: loading — VERIFIED — library load; empty — VERIFIED — empty library branch; error — VERIFIED — library load/action failures; completed — VERIFIED — created collection appears

### MS-READING-MATERIALS

Audit: S32. Milestone: M5. Destination: `/learning/reading/materials`. Host: Learning stack. Fixture package: `reading`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/reading/materials/page.tsx), [MaterialLibrary.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/library/MaterialLibrary.tsx), [AddMaterialsDialog.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/library/AddMaterialsDialog.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Materials library independent of collection; documents/web/video/audio.

Specific fidelity rule: File/link/existing-material choices stay distinct; file and URL fixtures show source checking/import feedback; empty library differs from no search matches.

Capture references: [CAP-051](audit/screenshots/snow-1440-051--learning-reading-materials.png), [CAP-149](audit/screenshots/dark-412-051--learning-reading-materials.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Learning stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S32):** Browse/search; select/add material; import existing material. Bind each to the `reading` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Library/import checks; selected document/companion restore; media load.
- [ ] **Empty:** No materials, empty collection and no active conversation distinguishable.
- [ ] **Error / recovery:** Unsupported/corrupt material, broken URL, missing session, failed annotation/organize-notes.
- [ ] **Ready / completion:** Add bundled file or seeded URL metadata; source selection/timestamp anchors fixed tutor response; annotation persists within fixture run; display changes retain locator.
- [ ] **Permissions/availability:** Route requires llm access when authentication is enabled; learning policy and runtime capability/module checks also apply.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S32: loading — VERIFIED — material fetch/loading; empty — VERIFIED — no material rows/matches; error — VERIFIED — import/link errors; completed — VERIFIED — selected/imported material available

### MS-READING-FOLDER

Audit: S33. Milestone: M5. Destination: `/learning/reading/folders/[folderId]`. Host: Learning stack. Fixture package: `reading`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/reading/folders/[folderId]/page.tsx), [ReadingFolder.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/library/ReadingFolder.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Collection files and conversations; enter reading.

Specific fidelity rule: Files and conversations belong to selected collection; opening reader retains material/session relation; removing membership does not silently delete the global material.

Capture references: [CAP-050](audit/screenshots/snow-1440-050--learning-reading-folders-audit-missing-record.png), [CAP-148](audit/screenshots/dark-412-050--learning-reading-folders-audit-missing-record.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Learning stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S33):** Open material or conversation; manage collection membership. Bind each to the `reading` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Library/import checks; selected document/companion restore; media load.
- [ ] **Empty:** No materials, empty collection and no active conversation distinguishable.
- [ ] **Error / recovery:** Unsupported/corrupt material, broken URL, missing session, failed annotation/organize-notes.
- [ ] **Ready / completion:** Add bundled file or seeded URL metadata; source selection/timestamp anchors fixed tutor response; annotation persists within fixture run; display changes retain locator.
- [ ] **Permissions/availability:** Route requires llm access when authentication is enabled; learning policy and runtime capability/module checks also apply.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S33: loading — VERIFIED — folder load; empty — VERIFIED — empty folder invitation; error — VERIFIED — folder operation failure; completed — VERIFIED — collection contents and conversations

### MS-READING

Audit: S34, S35, S36. Milestone: M5. Destination: `/learning/reading/[workspaceId], /learning/reading/[workspaceId]/sessions or /learning/reading/[workspaceId]/sessions/[sessionId]`. Host: Learning stack. Fixture package: `reading`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/reading/[workspaceId]/page.tsx), [ReadingWorkspace.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/workspace/ReadingWorkspace.tsx), [ReaderPane.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/ReaderPane.tsx), [ReadingCompanion.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/workspace/ReadingCompanion.tsx), [SourceNavigator.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/workspace/SourceNavigator.tsx), [MediaReadingStage.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/workspace/MediaReadingStage.tsx), [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/reading/[workspaceId]/sessions/page.tsx), [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/reading/[workspaceId]/sessions/[sessionId]/page.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Sources/outline; document or synchronized media/transcript stage; companion conversation; reading controls / Same reading workspace; active/new conversation / Same reader and companion restored to session.

Specific fidelity rule: Reader gets full phone width; source navigator and companion open on demand. PDF/EPUB/text/media source jumps, selection, annotations and timestamps retain source locator; link/send/organize/mastery handoff use separate owner dialogs.

Capture references: [CAP-047](audit/screenshots/snow-1440-047--learning-reading-audit-missing-record.png), [CAP-145](audit/screenshots/dark-412-047--learning-reading-audit-missing-record.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Learning stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S34):** Read; navigate locators/timestamps; select passage; ask tutor; annotate; read aloud; manage conversations; organize notes. Bind each to the `reading` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Interactions (S35):** Open/create/continue reading conversation. Bind each to the `reading` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Interactions (S36):** Continue selected reading conversation. Bind each to the `reading` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Library/import checks; selected document/companion restore; media load.
- [ ] **Empty:** No materials, empty collection and no active conversation distinguishable.
- [ ] **Error / recovery:** Unsupported/corrupt material, broken URL, missing session, failed annotation/organize-notes.
- [ ] **Ready / completion:** Add bundled file or seeded URL metadata; source selection/timestamp anchors fixed tutor response; annotation persists within fixture run; display changes retain locator.
- [ ] **Permissions/availability:** Route requires llm access when authentication is enabled; learning policy and runtime capability/module checks also apply.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S34: loading — VERIFIED — reading workspace loading; empty — VERIFIED — EmptyWorkspace with add-material action; error — VERIFIED — error without workspace and operation errors; completed — VERIFIED — loaded reader, source-grounded conversation and annotations
- S35: loading — VERIFIED — session/workspace loading; empty — VERIFIED — new reading conversation; error — VERIFIED — workspace error handling; completed — VERIFIED — active reading transcript
- S36: loading — VERIFIED — restore/load; empty — UNVERIFIED — depends on saved record; error — VERIFIED — owner load failure branch; completed — VERIFIED — restored reader conversation

### MS-RESOURCES

Audit: S39. Milestone: M2. Destination: `/space`. Host: Resources shelf. Fixture package: `resources`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/space/page.tsx), [SpaceDashboard.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/SpaceDashboard.tsx), [dashboard-groups.ts](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/dashboard-groups.ts)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Conversations & Materials; Chat History, Favorites, Learning journal, Question Bank, Knowledge Center; conditional More Projects.

Specific fidelity rule: Use exact source resource titles/routes, independently loaded counts and conditional More Projects; count failure is not a zero-record success.

Capture references: [CAP-027](audit/screenshots/snow-1440-027--space.png), [CAP-125](audit/screenshots/dark-412-027--space.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [x] **Navigation:** enter from Resources shelf and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [x] **Interactions (S39):** Open actual resource; read available counts. Bind each to the `resources` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [x] **Loading:** Per-tile count probe; unavailable must not look like zero.
- [x] **Empty:** Zero supported records and conditional missing capability are distinct.
- [x] **Error / recovery:** One failed count shows source fallback/retry without suppressing allowed unrelated tiles.
- [x] **Ready / completion:** Open source resource managers; switch scope recalculates fixture counts without changing account-owned tiles.
- [x] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [x] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S39: loading — VERIFIED — per-tile load/count probes; empty — VERIFIED — conditional group omitted if no available items; error — UNVERIFIED — count failures vary by tile; completed — VERIFIED — resource tiles

Executed UI-only coverage and explicit native/source-visual limits: [M2 acceptance disposition](M2_VERIFICATION.md#acceptance-disposition-by-surface). Checked boxes do not assert native device or backend verification.

### MS-PERSONALIZATION

Audit: S40. Milestone: M2. Destination: `/personalization`. Host: Personalization shelf. Fixture package: `resources`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/personalization/page.tsx), [PersonalizationHub.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/PersonalizationHub.tsx), [dashboard-groups.ts](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/dashboard-groups.ts)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): My Agents, Personas, Skills, MCP Services, CLI Apps, Memory.

Specific fidelity rule: My Agents/Personas/Skills/MCP/CLI/Memory remain account-wide and distinct from content workspace resource assignment.

Capture references: [CAP-019](audit/screenshots/snow-1440-019--personalization.png), [CAP-117](audit/screenshots/dark-412-019--personalization.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [x] **Navigation:** enter from Personalization shelf and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [x] **Interactions (S40):** Open account-level resource managers. Bind each to the `resources` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [x] **Loading:** Per-tile count probe; unavailable must not look like zero.
- [x] **Empty:** Zero supported records and conditional missing capability are distinct.
- [x] **Error / recovery:** One failed count shows source fallback/retry without suppressing allowed unrelated tiles.
- [x] **Ready / completion:** Open source resource managers; switch scope recalculates fixture counts without changing account-owned tiles.
- [x] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [x] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S40: loading — VERIFIED — source count probes; empty — UNVERIFIED — no global empty state required; error — UNVERIFIED — count probe failure presentation; completed — VERIFIED — account-resource tiles

Executed UI-only coverage and explicit native/source-visual limits: [M2 acceptance disposition](M2_VERIFICATION.md#acceptance-disposition-by-surface). Checked boxes do not assert native device or backend verification.

### MS-KNOWLEDGE

Audit: S41. Milestone: M7. Destination: `/knowledge-bases`. Host: Resources stack. Fixture package: `knowledge`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/knowledge-bases/page.tsx), [KnowledgePage.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/knowledge/KnowledgePage.tsx), [KnowledgeHome.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/knowledge/KnowledgeHome.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Knowledge bases and Knowledge engines tabs; search/cards; source connectors Obsidian, MarginNote4, Kiwix.

Specific fidelity rule: Knowledge bases and Knowledge engines remain tabs; search/create/link and Obsidian/MarginNote/Kiwix source connectors remain source-driven.

Capture references: [CAP-008](audit/screenshots/snow-1440-008--knowledge-bases.png), [CAP-106](audit/screenshots/dark-412-008--knowledge-bases.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Resources stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S41):** Search; open KB/engine; create/link KB; connect source. Bind each to the `knowledge` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Catalog/detail/default/probe/load; indexing progress independent of screen load.
- [ ] **Empty:** No bases/matches/files/sources/versions; eligible sections remain discoverable.
- [ ] **Error / recovery:** Probe failure, upload/index/render failure, read-only denial; retry retains KB/run IDs.
- [ ] **Ready / completion:** New/link creates synthetic KB; source import starts scripted index progression; supported publish/retry/version actions update fixtures only.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S41: loading — VERIFIED — page loading and Suspense spinner; empty — VERIFIED — no bases / no matches; error — VERIFIED — page error banner; completed — VERIFIED — configured KB/engine cards

### MS-KB-DETAIL

Audit: S42. Milestone: M7. Destination: `/knowledge-bases/[kbName]`. Host: Resources stack. Fixture package: `knowledge`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/knowledge-bases/[kbName]/page.tsx), [KnowledgeBaseDetail.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/knowledge/KnowledgeBaseDetail.tsx), [KbFilesTab.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/knowledge/KbFilesTab.tsx), [KbIndexingRun.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/knowledge/KbIndexingRun.tsx), [KbTaskLogs.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/knowledge/KbTaskLogs.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Files; Add documents; Linked folders; GitHub; Web; Index versions; Devices; Articles; Settings; task logs and indexing status.

Specific fidelity rule: Only provider-eligible Files/Add documents/Linked folders/GitHub/Web/Index versions/Devices/Articles/Settings appear; read_only blocks writes; index/run/version status does not reset on pane changes.

Capture references: [CAP-007](audit/screenshots/snow-1440-007--knowledge-bases-audit-missing-record.png), [CAP-105](audit/screenshots/dark-412-007--knowledge-bases-audit-missing-record.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Resources stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S42):** Browse/upload/manage documents; configure sources; inspect/retry indexing and versions; read allowed previews. Bind each to the `knowledge` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Catalog/detail/default/probe/load; indexing progress independent of screen load.
- [ ] **Empty:** No bases/matches/files/sources/versions; eligible sections remain discoverable.
- [ ] **Error / recovery:** Probe failure, upload/index/render failure, read-only denial; retry retains KB/run IDs.
- [ ] **Ready / completion:** New/link creates synthetic KB; source import starts scripted index progression; supported publish/retry/version actions update fixtures only.
- [ ] **Permissions/availability:** Honor kb.read_only and per-engine/KB source eligibility. Not all nine sections appear for every base.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S42: loading — VERIFIED — page fetch, file loads and live task progress; empty — VERIFIED — per-section empty collections; error — VERIFIED — index-failure banner and retry handling; completed — VERIFIED — published/ready index and completed run

### MS-ENGINE-DETAIL

Audit: S44. Milestone: M7. Destination: `/knowledge-engines/[engineId]`. Host: Resources stack. Fixture package: `knowledge`.

Source ownership: [EngineDetail.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/knowledge/components/engines/EngineDetail.tsx), [LlamaIndexForm.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/knowledge/components/engines/LlamaIndexForm.tsx), [LightRagForm.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/knowledge/components/engines/LightRagForm.tsx), [GraphRagForm.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/knowledge/components/engines/GraphRagForm.tsx), [ImaForm.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/knowledge/components/engines/ImaForm.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Selected engine configuration; engine-specific forms, model/index controls.

Specific fidelity rule: Render source-selected engine form fields and model/probe status; engineId cannot resolve as kbName; no invented common form drops provider-specific options.

Capture references: [CAP-007](audit/screenshots/snow-1440-007--knowledge-bases-audit-missing-record.png), [CAP-105](audit/screenshots/dark-412-007--knowledge-bases-audit-missing-record.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Resources stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S44):** Select engine; inspect/edit supported configuration; test/probe where provided. Bind each to the `knowledge` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Catalog/detail/default/probe/load; indexing progress independent of screen load.
- [ ] **Empty:** No bases/matches/files/sources/versions; eligible sections remain discoverable.
- [ ] **Error / recovery:** Probe failure, upload/index/render failure, read-only denial; retry retains KB/run IDs.
- [ ] **Ready / completion:** New/link creates synthetic KB; source import starts scripted index progression; supported publish/retry/version actions update fixtures only.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S44: loading — VERIFIED — configuration loading; empty — UNVERIFIED — depends on engine/provider availability; error — VERIFIED — engine/model validation/probe failures in forms; completed — VERIFIED — saved engine configuration

### MS-FAVORITES

Audit: S45. Milestone: M4. Destination: `/notebooks`. Host: Resources stack. Fixture package: `favorites`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/notebooks/page.tsx), [NotebookConsole.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/notebook/NotebookConsole.tsx), [useNotebookLibrary.ts](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/notebook/useNotebookLibrary.ts)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Saved original conversations and sources; collection cards/search; metadata.

Specific fidelity rule: Source navigation Favorites can coexist with component Notebooks labels; create/rename metadata uses original collection meaning.

Capture references: [CAP-018](audit/screenshots/snow-1440-018--notebooks.png), [CAP-116](audit/screenshots/dark-412-018--notebooks.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Resources stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S45):** Create/open/rename collection. Bind each to the `favorites` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Collection/record load or save busy.
- [ ] **Empty:** No collections/records versus no filter matches.
- [ ] **Error / recovery:** Unavailable record/collection, failed save/delete; preserve selected source payload.
- [ ] **Ready / completion:** Save original once to selected fixture collection; reopen/focus record; reference picker creates typed ref without converting it to editable note.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S45: loading — VERIFIED — library loading; empty — VERIFIED — empty collections state; error — VERIFIED — Could not load your notebooks with recovery; completed — VERIFIED — collection list refreshed

### MS-FAVORITES-DETAIL

Audit: S46. Milestone: M4. Destination: `/notebooks/[notebookId]`. Host: Resources stack. Fixture package: `favorites`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/notebooks/[notebookId]/page.tsx), [NotebookConsole.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/notebook/NotebookConsole.tsx), [NotebookRecordRow.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/notebook/NotebookRecordRow.tsx), [NotebookRecordActions.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/notebook/NotebookRecordActions.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Collection heading; record-kind filter/search; original saved records; focused record query.

Specific fidelity rule: Kind/query filters and ?record= focus restore correctly; original source content remains unmodified; delete collection and remove record have named confirmations.

Capture references: [CAP-017](audit/screenshots/snow-1440-017--notebooks-audit-missing-record.png), [CAP-115](audit/screenshots/dark-412-017--notebooks-audit-missing-record.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Resources stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S46):** Search/filter; inspect/use/delete records; edit/delete collection. Bind each to the `favorites` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Collection/record load or save busy.
- [ ] **Empty:** No collections/records versus no filter matches.
- [ ] **Error / recovery:** Unavailable record/collection, failed save/delete; preserve selected source payload.
- [ ] **Ready / completion:** Save original once to selected fixture collection; reopen/focus record; reference picker creates typed ref without converting it to editable note.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S46: loading — VERIFIED — record loading; empty — VERIFIED — no records / no matches; error — VERIFIED — unavailable collection/record error; completed — VERIFIED — collection and matching records

### MS-JOURNAL

Audit: S48. Milestone: M4. Destination: `/space/journal`. Host: Resources stack. Fixture package: `journal`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/space/journal/page.tsx), [LearningJournalPanel.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/LearningJournalPanel.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Current mission; last-session handoff; confirmed learning records.

Specific fidelity rule: Display Current mission, Last-session handoff and Confirmed learning records. Corrupt-data fixture preserves original records; no user-created diary or weekly summary added.

Capture references: [CAP-025](audit/screenshots/snow-1440-025--space-journal.png), [CAP-123](audit/screenshots/dark-412-025--space-journal.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Resources stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S48):** Inspect; refresh/retry. Bind each to the `journal` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Journal pending.
- [ ] **Empty:** Missing mission/handoff and zero confirmed records use audited fallbacks.
- [ ] **Error / recovery:** Unreadable/corrupt journal notice preserves original record set; retry restores fixture view.
- [ ] **Ready / completion:** Read/refresh only; no diary editor, fabricated weekly summary or record CRUD.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S48: loading — VERIFIED — journal load pending; empty — VERIFIED — absent mission/handoff/records use source fallbacks; error — VERIFIED — corrupt/unreadable journal notice preserves original data; completed — VERIFIED — confirmed records displayed

### MS-SKILLS

Audit: S49. Milestone: M7. Destination: `/space/skills`. Host: Personalization stack. Fixture package: `skills`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/space/skills/page.tsx), [SkillsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/SkillsSection.tsx), [SkillLibraryScope.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/SkillLibraryScope.tsx), [EduHubImportModal.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/EduHubImportModal.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Account skill library; scope; tags; Markdown skill viewer/editor; import.

Specific fidelity rule: Filter/manage tags and builtin/editable distinctions; source name validation; Markdown view/editor and EduHub import retain distinct steps and busy/failure states.

Capture references: [CAP-030](audit/screenshots/snow-1440-030--space-skills.png), [CAP-128](audit/screenshots/dark-412-030--space-skills.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Personalization stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S49):** Create/edit/delete; view; filter/manage tags; import from EduHub. Bind each to the `skills` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** List/viewer/import/editor busy.
- [ ] **Empty:** No skills versus no matches for tag filter.
- [ ] **Error / recovery:** Source name validation, read-only edit denial, import/read/save failure.
- [ ] **Ready / completion:** View Markdown; edit synthetic skill/tag and source-compatible scope; import bundled EduHub sample, never fetch remote library.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S49: loading — VERIFIED — list/viewer/editor busy; empty — VERIFIED — empty skills / no filtered matches; error — VERIFIED — list/editor/viewer errors and name validation; completed — VERIFIED — updated skill library

### MS-PERSONAS

Audit: S50. Milestone: M7. Destination: `/space/personas`. Host: Personalization stack. Fixture package: `personas`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/space/personas/page.tsx), [PersonasSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/PersonasSection.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Behavior presets; Markdown content; builtin indicators; viewer/editor.

Specific fidelity rule: Preserve builtin/read-only presets and source name constraints; selecting a response style applies per turn, not as an invented universal agent identity.

Capture references: [CAP-028](audit/screenshots/snow-1440-028--space-personas.png), [CAP-126](audit/screenshots/dark-412-028--space-personas.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Personalization stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S50):** Create/view/edit/delete supported personas. Bind each to the `personas` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** List/viewer/editor busy.
- [ ] **Empty:** No personas; builtins may remain available.
- [ ] **Error / recovery:** Name/permissions/load/save failure.
- [ ] **Ready / completion:** Edit permitted fixture preset and select it for a later chat turn without changing already-submitted turn snapshots.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S50: loading — VERIFIED — list/viewer load; empty — VERIFIED — empty personas; error — VERIFIED — errors and name validation; completed — VERIFIED — updated presets

### MS-AGENTS

Audit: S51. Milestone: M7. Destination: `/agents`. Host: Personalization stack. Fixture package: `agents`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/agents/page.tsx), [AgentsHub.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/agents/AgentsHub.tsx), [ConnectedAgents.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/agents/ConnectedAgents.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Local/remote connected agents and connection configuration; imported-history agent library in MyAgentsSection (S117–S118).

Specific fidelity rule: ConnectedAgents and imported-history MyAgentsSection both visible. Unavailable backend and zero connections differ; source detection failure may degrade to empty and is not reclassified as a verified explicit error.

Capture references: [CAP-005](audit/screenshots/snow-1440-005--agents.png), [CAP-103](audit/screenshots/dark-412-005--agents.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Personalization stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S51):** Connect/configure/test/remove supported backend; inspect availability. Bind each to the `agents` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Detecting connection backends, importing/scanning/sync busy.
- [ ] **Empty:** No available backend versus no connections versus no imported histories.
- [ ] **Error / recovery:** Source ConnectedAgents may silently degrade probe failure to empty; import/scope/scan errors explicit; never claim missing error UI verified.
- [ ] **Ready / completion:** Connect/disconnect fixture row; import seeded transcript through intro/scanning/select/importing/done or error; replay imported history distinctly from live consult.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S51: loading — VERIFIED — connection discovery/loading; empty — VERIFIED — no connections handling in ConnectedAgents; error — VERIFIED — detection/list fetch catches fall back to empty arrays; explicit load error is not retained in ConnectedAgents. Disconnect errors may propagate without an inline message. Import errors are separate in S118.; completed — VERIFIED — configured agent available to chat

### MS-MCP

Audit: S52. Milestone: M7. Destination: `/space/mcp`. Host: Personalization stack. Fixture package: `mcp`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/space/mcp/page.tsx), [McpStoreSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/McpStoreSection.tsx), [McpServerList.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/mcp/McpServerList.tsx), [McpServerForm.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/mcp/McpServerForm.tsx), [McpCatalogBrowser.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/mcp/McpCatalogBrowser.tsx), [McpAdminRegistry.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/mcp/McpAdminRegistry.tsx), [McpDeploymentList.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/mcp/McpDeploymentList.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Account hosted connections; catalog; deployment/admin registry; tool lists/status.

Specific fidelity rule: Account servers versus deployment/admin registry stay distinct; catalog, schema fields and discovered tool groups are separate source panels; fixture never makes a live connection.

Capture references: [CAP-026](audit/screenshots/snow-1440-026--space-mcp.png), [CAP-124](audit/screenshots/dark-412-026--space-mcp.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Personalization stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S52):** Connect/edit/remove; discover tools; inspect deployment; administer only where authorized. Bind each to the `mcp` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Server list/catalog/tool discovery pending.
- [ ] **Empty:** No account servers/tools; deployment rows may exist separately.
- [ ] **Error / recovery:** Connection/discovery/deployment denied/failure states.
- [ ] **Ready / completion:** Add fixture server then reveal fixed tool list; admin deployment edit affects deployment fixture only; never connect real MCP service.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S52: loading — VERIFIED — fetch/discovery states; empty — VERIFIED — no configured server/tool cases; error — VERIFIED — server connection/discovery error states; completed — VERIFIED — usable connection status

### MS-CLI

Audit: S53. Milestone: M7. Destination: `/space/cli-apps`. Host: Personalization stack. Fixture package: `cli`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/space/cli-apps/page.tsx), [CliAppsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/cli-apps/CliAppsSection.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Server CLI-Anything catalog; installed/granted/enabled distinctions.

Specific fidelity rule: Installed/granted/enabled must remain separate flags; only allowed fixture actions change availability; no native command execution.

Capture references: [CAP-024](audit/screenshots/snow-1440-024--space-cli-apps.png), [CAP-122](audit/screenshots/dark-412-024--space-cli-apps.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Personalization stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S53):** Browse; source-supported enable/configure/install/grant actions. Bind each to the `cli` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Catalog/action busy.
- [ ] **Empty:** No catalog items versus installed but not granted/enabled.
- [ ] **Error / recovery:** Install/enable/grant denied/failure fixture.
- [ ] **Ready / completion:** Source-authorized fixture toggles change simulated callable availability; no Android executable installation or backend command execution.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S53: loading — VERIFIED — catalog load/busy; empty — VERIFIED — absent apps/catalog entries; error — VERIFIED — app action/load errors; completed — VERIFIED — granted enabled apps usable from chat

### MS-MEMORY

Audit: S54. Milestone: M7. Destination: `/memory`. Host: Personalization stack. Fixture package: `memory`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/memory/page.tsx), [MemoryHub.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/memory/MemoryHub.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): L1 Workspace mirror; L2 Per-surface summaries; L3 Cross-surface knowledge; graph/run access.

Specific fidelity rule: L1 Workspace mirror, L2 summaries and L3 cross-surface knowledge remain different entries; overview count/load and processing run independent.

Capture references: [CAP-015](audit/screenshots/snow-1440-015--memory.png), [CAP-113](audit/screenshots/dark-412-015--memory.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Personalization stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S54):** Open layer; refresh; inspect memory process. Bind each to the `memory` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Overview/count/content/graph/run pending.
- [ ] **Empty:** No mirror rows or document lines; empty graph sample.
- [ ] **Error / recovery:** Invalid resolver ID/surface/slot, load/save/run failure; retain edits until resolved.
- [ ] **Ready / completion:** Switch layers/surface; edit permitted L2/L3 fixture content; graph selection follows valid source ref; run advances scripted progress; L1 stays mirror semantics.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S54: loading — VERIFIED — overview and L1 totals loading; empty — UNVERIFIED — no-memory hub copy needs runtime; error — UNVERIFIED — overview failure may degrade silently; verify; completed — VERIFIED — memory overview

### MS-MEMORY-L1

Audit: S55. Milestone: M7. Destination: `/memory/l1`. Host: Personalization stack. Fixture package: `memory`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/memory/l1/page.tsx), [MemoryL1Workbench.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/memory/MemoryL1Workbench.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Chat/notebook/quiz/kb/book/partner/cowriter surfaces; counts/pending; reference-focused mirror.

Specific fidelity rule: Surface/ref filtering and mirrored records only; do not add arbitrary manual memory editing unsupported by L1 owner.

Capture references: [CAP-010](audit/screenshots/snow-1440-010--memory-l1.png), [CAP-108](audit/screenshots/dark-412-010--memory-l1.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Personalization stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S55):** Switch surface; focus reference; trigger supported memory run. Bind each to the `memory` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Overview/count/content/graph/run pending.
- [ ] **Empty:** No mirror rows or document lines; empty graph sample.
- [ ] **Error / recovery:** Invalid resolver ID/surface/slot, load/save/run failure; retain edits until resolved.
- [ ] **Ready / completion:** Switch layers/surface; edit permitted L2/L3 fixture content; graph selection follows valid source ref; run advances scripted progress; L1 stays mirror semantics.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S55: loading — VERIFIED — run/count requests; empty — UNVERIFIED — per-surface no-mirror state needs runtime; error — UNVERIFIED — owner toast/error presentation needs runtime; completed — VERIFIED — mirrored content and active reference

### MS-MEMORY-L2

Audit: S56, S57. Milestone: M7. Destination: `/memory/l2 or /memory/l2/[surface]`. Host: Personalization stack. Fixture package: `memory`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/memory/l2/page.tsx), [MemoryWorkbench.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/memory/MemoryWorkbench.tsx), [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/memory/l2/[surface]/page.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Per-surface summaries; rendered/line-number view; editable content / Same L2 workbench on validated surface; ?focus= line.

Specific fidelity rule: Valid chat/notebook/quiz/kb/book/partner/cowriter surface; rendered/line-number view; focused line and editable draft; save failure retains text.

Capture references: [CAP-011](audit/screenshots/snow-1440-011--memory-l2-chat.png), [CAP-109](audit/screenshots/dark-412-011--memory-l2-chat.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Personalization stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S56):** Select surface; edit/save/cancel; inspect reference lines. Bind each to the `memory` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Interactions (S57):** Inspect/edit surface summary. Bind each to the `memory` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Overview/count/content/graph/run pending.
- [ ] **Empty:** No mirror rows or document lines; empty graph sample.
- [ ] **Error / recovery:** Invalid resolver ID/surface/slot, load/save/run failure; retain edits until resolved.
- [ ] **Ready / completion:** Switch layers/surface; edit permitted L2/L3 fixture content; graph selection follows valid source ref; run advances scripted progress; L1 stays mirror semantics.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S56: loading — VERIFIED — overview/content fetch; empty — VERIFIED — EmptyState when no lines; error — VERIFIED — save/error toast paths require runtime exact copy; completed — VERIFIED — saved content/line view
- S57: loading — VERIFIED — same owner load; empty — VERIFIED — same empty lines; error — VERIFIED — invalid surface calls notFound; completed — VERIFIED — focused document

### MS-MEMORY-L3

Audit: S58, S59. Milestone: M7. Destination: `/memory/l3 or /memory/l3/[slot]`. Host: Personalization stack. Fixture package: `memory`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/memory/l3/page.tsx), [MemoryWorkbench.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/memory/MemoryWorkbench.tsx), [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/memory/l3/[slot]/page.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Recent summary; User profile; Knowledge scope; rendered/line-number editor / Same L3 workbench, validated recent/profile/scope.

Specific fidelity rule: Only recent/profile/scope slots; source note says focus is not surfaced, so mobile must not promise line targeting parity that does not exist.

Capture references: [CAP-013](audit/screenshots/snow-1440-013--memory-l3-profile.png), [CAP-111](audit/screenshots/dark-412-013--memory-l3-profile.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Personalization stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S58):** Select slot; edit/save; inspect references. Bind each to the `memory` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Interactions (S59):** Inspect/edit selected slot. Bind each to the `memory` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Overview/count/content/graph/run pending.
- [ ] **Empty:** No mirror rows or document lines; empty graph sample.
- [ ] **Error / recovery:** Invalid resolver ID/surface/slot, load/save/run failure; retain edits until resolved.
- [ ] **Ready / completion:** Switch layers/surface; edit permitted L2/L3 fixture content; graph selection follows valid source ref; run advances scripted progress; L1 stays mirror semantics.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S58: loading — VERIFIED — shared workbench load; empty — VERIFIED — EmptyState when no lines; error — VERIFIED — shared save failure paths; completed — VERIFIED — saved cross-surface content
- S59: loading — VERIFIED — shared workbench load; empty — VERIFIED — empty lines; error — VERIFIED — invalid slot calls notFound; completed — VERIFIED — selected slot

### MS-MEMORY-GRAPH

Audit: S60. Milestone: M7. Destination: `/memory/graph`. Host: Personalization stack. Fixture package: `memory`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/memory/graph/page.tsx), [MemoryGraph.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/memory/MemoryGraph.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Memory relationship graph and source-specific graph controls.

Specific fidelity rule: Layer switches, pan/zoom and selected node detail preserve source layer color mixtures and reference links; accessible detail is equivalent to pointer hover/selection, not invented graph analytics.

Capture references: [CAP-009](audit/screenshots/snow-1440-009--memory-graph.png), [CAP-107](audit/screenshots/dark-412-009--memory-graph.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Personalization stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S60):** Inspect/select graph items and their references. Bind each to the `memory` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Overview/count/content/graph/run pending.
- [ ] **Empty:** No mirror rows or document lines; empty graph sample.
- [ ] **Error / recovery:** Invalid resolver ID/surface/slot, load/save/run failure; retain edits until resolved.
- [ ] **Ready / completion:** Switch layers/surface; edit permitted L2/L3 fixture content; graph selection follows valid source ref; run advances scripted progress; L1 stays mirror semantics.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S60: loading — VERIFIED — graph loading state in owner; empty — UNVERIFIED — empty graph needs runtime; error — UNVERIFIED — graph runtime errors need execution; completed — VERIFIED — graph nodes/edges rendered

### MS-NOTES

Audit: S62. Milestone: M6. Destination: `/co-writer`. Host: Home stack. Fixture package: `notes`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/co-writer/page.tsx), [NoteReview.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteReview.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Hierarchical note pages; pinned/recent cards; search; Word import; review entry.

Specific fidelity rule: Pinned/recent grouping; search across all pages; hierarchy/top level; import Word; delete with subpage promotion source behavior; separate due flashcards entry only when appropriate.

Capture references: [CAP-035](audit/screenshots/snow-1440-035--co-writer.png), [CAP-133](audit/screenshots/dark-412-035--co-writer.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Home stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S62):** Create/open; import Word; pin/unpin; delete; search all pages. Bind each to the `notes` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Library/editor hydrate; save/companion/review generation pending.
- [ ] **Empty:** Empty notebook/page; no filtered pages or backlinks; no review trigger when zero due cards.
- [ ] **Error / recovery:** Expected revision conflict, failed save/import/companion/grade; preserve local recovery blocks.
- [ ] **Ready / completion:** Edit same fixture block tree; accept/reject source-shaped suggestion; save updates revision; flashcards remembered/not and Anki sample export distinct from Practice.
- [ ] **Permissions/availability:** Route requires llm access when authentication is enabled; learning policy and runtime capability/module checks also apply.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S62: loading — VERIFIED — six-card loading skeleton; empty — VERIFIED — Your notebook is empty / no matching pages; error — VERIFIED — load/create/import/pin/delete error; completed — VERIFIED — new/imported page navigates to detail

### MS-NOTE-EDITOR

Audit: S63. Milestone: M6. Destination: `/co-writer/[docId]`. Host: Home stack. Fixture package: `notes`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/co-writer/[docId]/page.tsx), [NoteWorkspace.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteWorkspace.tsx), [NoteEditor.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteEditor.tsx), [NoteCompanion.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteCompanion.tsx), [NoteInsertMenu.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteInsertMenu.tsx), [NoteSourcePicker.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteSourcePicker.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Page tree; outline; rich blocks; title/icon/cover; linked-from pages; source/favorites pickers; Dito companion; AI suggestions/reviews.

Specific fidelity rule: Preserve block schema, nested pages, source/favorites pickers, review/suggestion threads and revision recovery. Static Markdown preview cannot satisfy editor parity; editor/bridge selection is an explicit renderer gate.

Capture references: [CAP-034](audit/screenshots/snow-1440-034--co-writer-audit-missing-record.png), [CAP-132](audit/screenshots/dark-412-034--co-writer-audit-missing-record.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Home stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S63):** Edit/save; insert/reorder blocks; select sources; accept/reject supported suggestions; manage subpages/references; review. Bind each to the `notes` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Library/editor hydrate; save/companion/review generation pending.
- [ ] **Empty:** Empty notebook/page; no filtered pages or backlinks; no review trigger when zero due cards.
- [ ] **Error / recovery:** Expected revision conflict, failed save/import/companion/grade; preserve local recovery blocks.
- [ ] **Ready / completion:** Edit same fixture block tree; accept/reject source-shaped suggestion; save updates revision; flashcards remembered/not and Anki sample export distinct from Practice.
- [ ] **Permissions/availability:** Route requires llm access when authentication is enabled; learning policy and runtime capability/module checks also apply.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S63: loading — VERIFIED — note load and saving status; empty — VERIFIED — new blank note content; error — VERIFIED — save conflict/recovery and per-review errors; completed — VERIFIED — Saved status and revised page

### MS-TASKS

Audit: S64. Milestone: M6. Destination: `/kanban`. Host: Home stack. Fixture package: `tasks`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/kanban/page.tsx), [KanbanBoard.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/tasks/components/KanbanBoard.tsx), [TaskBoardRuntime.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/tasks/TaskBoardRuntime.tsx), [TaskLinkSelector.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/tasks/TaskLinkSelector.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Task columns; quick add; edit title/note/due date/color; date filters; archived tasks.

Specific fidelity rule: Use source statuses/colors/due/archive behavior; explicit Move action supplies web drag equivalent. Filter/empty column and load/action error states differ.

Capture references: [CAP-036](audit/screenshots/snow-1440-036--kanban.png), [CAP-134](audit/screenshots/dark-412-036--kanban.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Home stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S64):** Create/edit; move status; archive/restore/delete available tasks; link to chat. Bind each to the `tasks` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Board/action pending.
- [ ] **Empty:** No tasks, empty column and archive/filter zero matches.
- [ ] **Error / recovery:** Board load/action failure; drag-equivalent move failure retains old status.
- [ ] **Ready / completion:** Add/edit/move/archive/restore fixture tasks; preserve source statuses and explicit move equivalent; update linked task reference.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S64: loading — VERIFIED — board load and action busy; empty — VERIFIED — empty column/board prompts in source; error — VERIFIED — loadError and action error; completed — VERIFIED — updated task columns

### MS-CALENDAR

Audit: S65. Milestone: M6. Destination: `/calendar`. Host: Home stack. Fixture package: `calendar`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/calendar/page.tsx), [CalendarPage.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/calendar/components/CalendarPage.tsx), [EventEditor.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/calendar/components/EventEditor.tsx), [ItemDetails.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/calendar/components/ItemDetails.tsx), [CalendarRail.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/calendar/components/CalendarRail.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Day/week/month/agenda views; mini month; layer toggles; search; item details; event editor; recurrence/reminders.

Specific fidelity rule: Day/week/month/agenda all in final scope; shared source events, layers/search, recurrence edit scope, reminders, undo and import/export retained. Browser notification behavior does not prove Android background delivery.

Capture references: [CAP-031](audit/screenshots/snow-1440-031--calendar.png), [CAP-129](audit/screenshots/dark-412-031--calendar.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Home stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S65):** Navigate dates; change view/layers; search; create/edit/move/delete; choose recurrence scope; undo; import/export supported actions. Bind each to the `calendar` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Calendar/search/editor action pending.
- [ ] **Empty:** No agenda items or query hits; empty date still navigable.
- [ ] **Error / recovery:** Invalid source form, recurring edit failure, denied/unsupported notification representation.
- [ ] **Ready / completion:** Month/week/day/agenda share fixture items; create/edit/move and recurrence scope/undo affect same fixture; no OS or server reminders scheduled.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S65: loading — VERIFIED — load/search/action busy; empty — VERIFIED — agenda/no-event branches in owner; error — VERIFIED — page/editor error; notification unsupported/permission states; completed — VERIFIED — event saved/undo feedback

### MS-PARTNERS

Audit: S66. Milestone: M6. Destination: `/partners`. Host: Partners shelf. Fixture package: `partners`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/partners/page.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Partners and groups in one roster; avatars; channel/runtime summaries.

Specific fidelity rule: Partners and groups shown in same account roster; list error degradation is not presented as verified explicit error without source evidence.

Capture references: [CAP-060](audit/screenshots/snow-1440-060--partners.png), [CAP-158](audit/screenshots/dark-412-060--partners.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Partners shelf and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S66):** Open partner/group; create partner/group. Bind each to the `partners` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Directory/model/tool/partner/continuity/session/channel resolution pending.
- [ ] **Empty:** No partners/groups or messages/archives; no available channel separate.
- [ ] **Error / recovery:** Continuity failure blocks unintended new chat; missing partner/group or channel config/QR expiry/failure.
- [ ] **Ready / completion:** Five steps create fixture partner; chats/rounds use scripted attributed replies; configure/connect/archive/link/export never contact actual channel or AI backend.
- [ ] **Permissions/availability:** Route requires llm access when authentication is enabled; learning policy and runtime capability/module checks also apply.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S66: loading — VERIFIED — list loading; empty — VERIFIED — initial no-partner directory state; error — UNVERIFIED — list load failure may collapse to empty; verify runtime; completed — VERIFIED — partner/group roster

### MS-PARTNER-CREATE

Audit: S67. Milestone: M6. Destination: `/partners/new`. Host: Partners stack. Fixture package: `partners`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/partners/new/page.tsx), [FaceEditor.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/partners/FaceEditor.tsx), [SoulPicker.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/partners/SoulPicker.tsx), [PartnerModelPicker.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/partners/PartnerModelPicker.tsx), [ToolPicker.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/partners/ToolPicker.tsx), [AssetPicker.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/partners/AssetPicker.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Five steps Identity → Soul → Mind → Library → Review; name/face/language; models/tools; workspace/assets.

Specific fidelity rule: Identity→Soul→Mind→Library→Review exactly; model+backup/tools/workspace/assets retained. Channel configuration starts after creation, not an added wizard step.

Capture references: [CAP-059](audit/screenshots/snow-1440-059--partners-new.png), [CAP-157](audit/screenshots/dark-412-059--partners-new.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Partners stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S67):** Complete steps; choose primary/backup model; select assets/tools; create. Bind each to the `partners` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Directory/model/tool/partner/continuity/session/channel resolution pending.
- [ ] **Empty:** No partners/groups or messages/archives; no available channel separate.
- [ ] **Error / recovery:** Continuity failure blocks unintended new chat; missing partner/group or channel config/QR expiry/failure.
- [ ] **Ready / completion:** Five steps create fixture partner; chats/rounds use scripted attributed replies; configure/connect/archive/link/export never contact actual channel or AI backend.
- [ ] **Permissions/availability:** Route requires llm access when authentication is enabled; learning policy and runtime capability/module checks also apply.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S67: loading — VERIFIED — model/tools fetch and creating; empty — VERIFIED — initial wizard inputs; error — VERIFIED — model load and creation error; completed — VERIFIED — opens created partner

### MS-PARTNER

Audit: S68. Milestone: M6. Destination: `/partners/[partnerId]`. Host: Partners stack. Fixture package: `partners`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/partners/[partnerId]/page.tsx), [PartnerChat.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/partners/PartnerChat.tsx), [PartnerConfigure.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/partners/PartnerConfigure.tsx), [PartnerChannels.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/partners/PartnerChannels.tsx), [PartnerArchives.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/partners/PartnerArchives.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Identity/run state; Chat, Configure, Channels and archives-related content; chat continuity/session controls.

Specific fidelity rule: Chat/configure/channels and archive/session controls remain separate; failed continuity restoration blocks accidental fresh conversation; link/save/export/lifecycle actions operate on named fixture partner.

Capture references: [CAP-056](audit/screenshots/snow-1440-056--partners-audit-missing-record.png), [CAP-154](audit/screenshots/dark-412-056--partners-audit-missing-record.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Partners stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S68):** Chat; select session; configure; connect channel; lifecycle actions; archive/export/save/link/delete where offered. Bind each to the `partners` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Directory/model/tool/partner/continuity/session/channel resolution pending.
- [ ] **Empty:** No partners/groups or messages/archives; no available channel separate.
- [ ] **Error / recovery:** Continuity failure blocks unintended new chat; missing partner/group or channel config/QR expiry/failure.
- [ ] **Ready / completion:** Five steps create fixture partner; chats/rounds use scripted attributed replies; configure/connect/archive/link/export never contact actual channel or AI backend.
- [ ] **Permissions/availability:** Route requires llm access when authentication is enabled; learning policy and runtime capability/module checks also apply.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S68: loading — VERIFIED — partner/auth/continuity resolving; empty — VERIFIED — partner unavailable and empty chat states; error — VERIFIED — continuity blocks, runtime session error/retry; completed — VERIFIED — live/resumed partner chat and configured state

### MS-GROUP-CREATE

Audit: S70. Milestone: M6. Destination: `/partners/groups/new`. Host: Partners stack. Fixture package: `partners`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/partners/groups/new/page.tsx), [DiscussionModePicker.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/partners/group/DiscussionModePicker.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Name/description; emoji/color; members; discussion mode.

Specific fidelity rule: Name/description/avatar/members/source discussion mode; member availability and validation before create; route uses new groupId only after fixture success.

Capture references: [CAP-058](audit/screenshots/snow-1440-058--partners-groups-new.png), [CAP-156](audit/screenshots/dark-412-058--partners-groups-new.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Partners stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S70):** Select members/mode; create. Bind each to the `partners` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Directory/model/tool/partner/continuity/session/channel resolution pending.
- [ ] **Empty:** No partners/groups or messages/archives; no available channel separate.
- [ ] **Error / recovery:** Continuity failure blocks unintended new chat; missing partner/group or channel config/QR expiry/failure.
- [ ] **Ready / completion:** Five steps create fixture partner; chats/rounds use scripted attributed replies; configure/connect/archive/link/export never contact actual channel or AI backend.
- [ ] **Permissions/availability:** Route requires llm access when authentication is enabled; learning policy and runtime capability/module checks also apply.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S70: loading — VERIFIED — member load and creating; empty — VERIFIED — no partners available state; error — VERIFIED — creation failure; completed — VERIFIED — group detail route

### MS-GROUP

Audit: S71. Milestone: M6. Destination: `/partners/groups/[groupId]`. Host: Partners stack. Fixture package: `partners`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/partners/groups/[groupId]/page.tsx), [PartnerGroupChat.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/partners/group/PartnerGroupChat.tsx), [GroupSidePanel.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/partners/group/GroupSidePanel.tsx), [GroupSessionPicker.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/partners/group/GroupSessionPicker.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Group chat; rounds/member seats; discussion mode; session selector; side panel.

Specific fidelity rule: Keep member-attributed rounds/invocations, session selector, mode and side panel; edit/delete group distinct from clearing conversation; archive/export uses displayed messages only.

Capture references: [CAP-057](audit/screenshots/snow-1440-057--partners-groups-audit-missing-record.png), [CAP-155](audit/screenshots/dark-412-057--partners-groups-audit-missing-record.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Partners stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S71):** Send; mention member; switch sessions; inspect round/invocation; export; edit/delete group. Bind each to the `partners` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Directory/model/tool/partner/continuity/session/channel resolution pending.
- [ ] **Empty:** No partners/groups or messages/archives; no available channel separate.
- [ ] **Error / recovery:** Continuity failure blocks unintended new chat; missing partner/group or channel config/QR expiry/failure.
- [ ] **Ready / completion:** Five steps create fixture partner; chats/rounds use scripted attributed replies; configure/connect/archive/link/export never contact actual channel or AI backend.
- [ ] **Permissions/availability:** Route requires llm access when authentication is enabled; learning policy and runtime capability/module checks also apply.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S71: loading — VERIFIED — group/member/session load; empty — VERIFIED — group unavailable and GroupEmptyState; error — VERIFIED — selectionError and group edit failures; completed — VERIFIED — completed round and session content

### MS-WHISPER

Audit: S72. Milestone: M8. Destination: `/whisper`. Host: Conditional Resources entry. Fixture package: `whisper`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/whisper/page.tsx), [WhisperMessageList.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/whisper/WhisperMessageList.tsx), [WhisperComposer.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/whisper/WhisperComposer.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Optional dual-seat practice room; visitor/trainee seats; supervisor whisper; room and connection status.

Specific fidelity rule: Default optional capability absent; explicit fixture capability enables visitor/trainee room and supervisor whisper/crisis/closed states. This never claims stock backend availability.

Capture references: [CAP-061](audit/screenshots/snow-1440-061--whisper.png), [CAP-159](audit/screenshots/dark-412-061--whisper.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Conditional Resources entry and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S72):** Choose seat; start/send; handle closed room and crisis state. Bind each to the `whisper` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Capability probe and room/connection submit pending.
- [ ] **Empty:** Capability absent shows unavailable rather than active empty room.
- [ ] **Error / recovery:** Closed room, crisis/stream failure and reconnect unlock scenario.
- [ ] **Ready / completion:** Default absent; explicit optional-plugin fixture enables fixed dual-seat conversation; no clinical/AI response generation or plugin installation.
- [ ] **Permissions/availability:** Only offered when out-of-tree whisper_visitor capability is reported available; stock repository does not supply that plugin.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S72: loading — VERIFIED — connection and submit retry state; empty — VERIFIED — absent capability shows unavailable view; error — VERIFIED — room closed/stream error/disconnection unlock; completed — VERIFIED — live room dialogue

### MS-LOGIN

Audit: S73. Milestone: M2. Destination: `/login`. Host: Auth stack. Fixture package: `auth`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28auth%29/login/page.tsx), [auth.ts](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/lib/auth.ts)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Email or username label; password; registration and preserved return path.

Specific fidelity rule: Use visible Email or username label and username request meaning, password field and registration link; wrong credentials remain inline; no social login/reset/verification feature invented.

Capture references: [CAP-002](audit/screenshots/snow-1440-002--login.png), [CAP-100](audit/screenshots/dark-412-002--login.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [x] **Navigation:** enter from Auth stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [x] **Interactions (S73):** Sign in; register. Bind each to the `auth` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [x] **Loading:** Pending status; signing in/registering/profile password/avatar operation busy.
- [x] **Empty:** Blank login/register fields; missing profile returns appropriate auth boundary.
- [x] **Error / recovery:** Fixture wrong credentials, status unavailable, password mismatch/current-password error or invalid avatar.
- [x] **Ready / completion:** Valid synthetic credentials switch fixture principal and normalized destination; temporary-password profile path simulated.
- [x] **Permissions/availability:** Respect deployment auth.enabled; first user can be directed to registration.
- [x] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S73: loading — VERIFIED — auth/first-user checks and Signing in…; empty — VERIFIED — initial empty fields; error — VERIFIED — Login failed response; completed — VERIFIED — redirects to normalized intended route

Executed UI-only coverage and explicit native/source-visual limits: [M2 acceptance disposition](M2_VERIFICATION.md#acceptance-disposition-by-surface). Checked boxes do not assert native device or backend verification.

### MS-REGISTER

Audit: S74. Milestone: M2. Destination: `/register`. Host: Auth stack. Fixture package: `auth`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28auth%29/register/page.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Email or username label; password/confirmation; first-user status and server registration policy.

Specific fidelity rule: Password confirmation and first-user/bootstrap policy states; successful local fixture creation returns /login?registered=1; no server registration occurs.

Capture references: [CAP-003](audit/screenshots/snow-1440-003--register.png), [CAP-101](audit/screenshots/dark-412-003--register.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [x] **Navigation:** enter from Auth stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [x] **Interactions (S74):** Create account; sign in. Bind each to the `auth` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [x] **Loading:** Pending status; signing in/registering/profile password/avatar operation busy.
- [x] **Empty:** Blank login/register fields; missing profile returns appropriate auth boundary.
- [x] **Error / recovery:** Fixture wrong credentials, status unavailable, password mismatch/current-password error or invalid avatar.
- [x] **Ready / completion:** Valid synthetic credentials switch fixture principal and normalized destination; temporary-password profile path simulated.
- [x] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [x] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S74: loading — VERIFIED — checkingFirst and Creating account…; empty — VERIFIED — blank form; error — VERIFIED — mismatch and server registration failure; completed — VERIFIED — /login?registered=1

Executed UI-only coverage and explicit native/source-visual limits: [M2 acceptance disposition](M2_VERIFICATION.md#acceptance-disposition-by-surface). Checked boxes do not assert native device or backend verification.

### MS-PROFILE

Audit: S75. Milestone: M2. Destination: `/profile`. Host: Account stack. Fixture package: `auth`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/profile/page.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Account identity/role; avatar selection/upload/remove; password change; session/account utilities.

Specific fidelity rule: Original identity/role, avatar upload/select/remove, password-change validation and logout/account utilities; min length/mismatch/current password/image failure source semantics retained.

Capture references: [CAP-020](audit/screenshots/snow-1440-020--profile.png), [CAP-118](audit/screenshots/dark-412-020--profile.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [x] **Navigation:** enter from Account stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [x] **Interactions (S75):** Update avatar; change password; logout; open authorized account utilities. Bind each to the `auth` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [x] **Loading:** Pending status; signing in/registering/profile password/avatar operation busy.
- [x] **Empty:** Blank login/register fields; missing profile returns appropriate auth boundary.
- [x] **Error / recovery:** Fixture wrong credentials, status unavailable, password mismatch/current-password error or invalid avatar.
- [x] **Ready / completion:** Valid synthetic credentials switch fixture principal and normalized destination; temporary-password profile path simulated.
- [x] **Permissions/availability:** Redirects if auth disabled/unauthenticated; role-specific controls.
- [x] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S75: loading — VERIFIED — profile load; avatar/password busy; empty — UNVERIFIED — no-profile fallback depends on auth; error — VERIFIED — image size/decode; wrong current password; min length/mismatch; completed — VERIFIED — password notice and updated profile

Executed UI-only coverage and explicit native/source-visual limits: [M2 acceptance disposition](M2_VERIFICATION.md#acceptance-disposition-by-surface). Checked boxes do not assert native device or backend verification.

### MS-ADMIN-USERS

Audit: S76. Milestone: M8. Destination: `/admin/users`. Host: Admin stack. Fixture package: `admin`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28admin%29/admin/users/page.tsx), [GrantEditor.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/multi-user/components/GrantEditor.tsx), [BookPermissionEditor.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/multi-user/components/BookPermissionEditor.tsx), [LearnerProfileEditor.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/multi-user/components/LearnerProfileEditor.tsx), [GuardianRelationshipsEditor.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/multi-user/components/GuardianRelationshipsEditor.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Users table/search/bulk selection; expanded permissions/profile/guardian/book grants; create; CSV import result.

Specific fidelity rule: Admin gate before showing users; search/bulk selection; per-user grants/book permissions/learner/guardian; create/import/reset/delete with mixed CSV row results; no real account operations.

Capture references: [CAP-001](audit/screenshots/snow-1440-001--admin-users.png), [CAP-099](audit/screenshots/dark-412-001--admin-users.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Admin stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S76):** Create/import; edit grants; reset/delete supported user actions; bulk delete. Bind each to the `admin` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Auth/users/import/create/delete busy.
- [ ] **Empty:** No users/search matches; do not count current admin deletion as ordinary empty list.
- [ ] **Error / recovery:** Nonadmin denied; duplicate/invalid CSV rows, create/password validation, mutation failures.
- [ ] **Ready / completion:** Create/edit/import/reset/delete synthetic users and permissions; mixed CSV success rows preserved; bulk confirm names count; no server accounts created.
- [ ] **Permissions/availability:** Checks authenticated admin; redirects ordinary users and unauthenticated users.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S76: loading — VERIFIED — users load and operation busy; empty — VERIFIED — filtered/empty table cases need exact runtime copy; error — VERIFIED — load/action/create/import error fields; completed — VERIFIED — per-row import results and refreshed users

### MS-HANDOFF-CREATE

Audit: S77. Milestone: M8. Destination: `/session-handoff`. Host: Account stack. Fixture package: `handoff`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/session-handoff/page.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Public origin; temporary session handoff code/link.

Specific fidelity rule: Dummy public-origin/code/link/expiry output distinct from chat sharing; copy uses simulated handoff only; success does not authenticate another device.

Capture references: [CAP-021](audit/screenshots/snow-1440-021--session-handoff.png), [CAP-119](audit/screenshots/dark-412-021--session-handoff.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Account stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S77):** Create/copy handoff; inspect expiry. Bind each to the `handoff` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Create/redeem pending.
- [ ] **Empty:** No generated code yet or blank manual entry.
- [ ] **Error / recovery:** Invalid/expired/already-used code; unsafe next rejected.
- [ ] **Ready / completion:** Dummy handoff transitions accepted once in fixture state; generated text says simulated; never creates transferable authentication.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S77: loading — VERIFIED — generation busy; empty — VERIFIED — no handoff before create; error — VERIFIED — generation/copy errors; completed — VERIFIED — generated handoff details

### MS-HANDOFF-REDEEM

Audit: S78. Milestone: M8. Destination: `/handoff`. Host: Root entry stack. Fixture package: `handoff`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/handoff/page.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Handoff URL/code input; idle/working/error.

Specific fidelity rule: Manual/passed code idle/working/error; invalid/expired/used/unsafe next; local accepted result once. No successful /handoff screenshot exists; source-driven layout pending capture sign-off.

Capture references: No captured feature state; see failed handoff attempts in TRACEABILITY_MATRIX.. These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Root entry stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S78):** Redeem code; continue to normalized destination. Bind each to the `handoff` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Create/redeem pending.
- [ ] **Empty:** No generated code yet or blank manual entry.
- [ ] **Error / recovery:** Invalid/expired/already-used code; unsafe next rejected.
- [ ] **Ready / completion:** Dummy handoff transitions accepted once in fixture state; generated text says simulated; never creates transferable authentication.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S78: loading — VERIFIED — working state; empty — VERIFIED — manual code entry; error — VERIFIED — redemption error; completed — VERIFIED — router replace after successful redemption

### MS-PROGRESS

Audit: S79. Milestone: M4. Destination: `/settings/progress`. Host: Settings stack. Fixture package: `progress`.

Source ownership: [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/settings/progress/page.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Reading progress and recent learning actions.

Specific fidelity rule: Materials count, recent learning actions, reading percentages and action/extension/locator records only; failed title lookup falls back to IDs; no invented streak/time/mastery metrics.

Capture references: [CAP-022](audit/screenshots/snow-1440-022--settings-progress.png), [CAP-120](audit/screenshots/dark-412-022--settings-progress.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S79):** Inspect activity/progress. Bind each to the `progress` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Progress load; independent material-title lookup.
- [ ] **Empty:** No activity versus no reading progress versus no recent actions.
- [ ] **Error / recovery:** Record load error; title lookup failure falls back to material IDs.
- [ ] **Ready / completion:** Display fixture reading progress and recent actions accurately; no invented streak, hours or mastery chart.
- [ ] **Permissions/availability:** Account/workspace scope and server authorization apply. Do not infer write permission from navigation visibility.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S79: loading — VERIFIED — progress load state; empty — VERIFIED — No learning activity yet; No reading progress yet; No learning actions yet; error — VERIFIED — page error state in source; completed — VERIFIED — recorded reading/activity summary

### MS-SETTINGS-general

Audit: S81. Milestone: M2. Destination: `/settings/general`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [SettingsOverview.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsOverview.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Interface language; model output language; Classic/Modern layout; setup help.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-063](audit/screenshots/snow-1440-064--settings-general.png), [CAP-161](audit/screenshots/dark-412-064--settings-general.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [x] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [x] **Interactions (S81):** Select supported locale/layout; stage and apply preferences. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [x] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [x] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [x] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [x] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [x] **Permissions/availability:** Settings access resolves before rendering. Admin-owned catalog/config controls follow catalogEditable and feature gates; source SettingsAccessProvider remains authoritative.
- [x] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S81: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

Executed UI-only coverage and explicit native/source-visual limits: [M2 acceptance disposition](M2_VERIFICATION.md#acceptance-disposition-by-surface). Checked boxes do not assert native device or backend verification.

### MS-SETTINGS-appearance

Audit: S82. Milestone: M2. Destination: `/settings/appearance`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [AppearanceSettingsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/AppearanceSettingsSection.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Default/Cream/Dark/Glass/System themes; learning text; code blocks.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-064](audit/screenshots/snow-1440-065--settings-appearance.png), [CAP-162](audit/screenshots/dark-412-065--settings-appearance.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [x] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [x] **Interactions (S82):** Change theme; adjust text/code preferences. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [x] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [x] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [x] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [x] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [x] **Permissions/availability:** Settings access resolves before rendering. Admin-owned catalog/config controls follow catalogEditable and feature gates; source SettingsAccessProvider remains authoritative.
- [x] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S82: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

Executed UI-only coverage and explicit native/source-visual limits: [M2 acceptance disposition](M2_VERIFICATION.md#acceptance-disposition-by-surface). Checked boxes do not assert native device or backend verification.

### MS-SETTINGS-workspace

Audit: S83. Milestone: M8. Destination: `/settings/workspace`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [WorkspaceSettingsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/WorkspaceSettingsSection.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): System/general/custom workspaces; root folder; resource bindings; storage migration.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-065](audit/screenshots/snow-1440-066--settings-workspace.png), [CAP-163](audit/screenshots/dark-412-066--settings-workspace.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S83):** Create/edit/switch/manage permitted workspace; choose server folder; migrate storage. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Settings access resolves before rendering. Admin-owned catalog/config controls follow catalogEditable and feature gates; source SettingsAccessProvider remains authoritative.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S83: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-data-migration

Audit: S84. Milestone: M8. Destination: `/settings/data-migration`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [DataMigrationSettingsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/DataMigrationSettingsSection.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Discover/migrate/export learning data.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-066](audit/screenshots/snow-1440-067--settings-data-migration.png), [CAP-164](audit/screenshots/dark-412-067--settings-data-migration.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S84):** Discover; preview; migrate/export according to source controls. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Settings access resolves before rendering. Admin-owned catalog/config controls follow catalogEditable and feature gates; source SettingsAccessProvider remains authoritative.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S84: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-usage

Audit: S85. Milestone: M8. Destination: `/settings/usage`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [UsageSettingsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/UsageSettingsSection.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Model usage; conversation activity.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-067](audit/screenshots/snow-1440-068--settings-usage.png), [CAP-165](audit/screenshots/dark-412-068--settings-usage.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S85):** Change source-supported usage filters; inspect totals/activity. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Settings access resolves before rendering. Admin-owned catalog/config controls follow catalogEditable and feature gates; source SettingsAccessProvider remains authoritative.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S85: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-connections

Audit: S86. Milestone: M8. Destination: `/settings/connections`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [ConnectionsSettingsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/models/ConnectionsSettingsSection.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Provider connection list/editor; names/endpoints/credentials; connectivity.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-068](audit/screenshots/snow-1440-069--settings-connections.png), [CAP-166](audit/screenshots/dark-412-069--settings-connections.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S86):** Add/edit/test/remove provider connection. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Settings access resolves before rendering. Admin-owned catalog/config controls follow catalogEditable and feature gates; source SettingsAccessProvider remains authoritative.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S86: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-llm

Audit: S87. Milestone: M8. Destination: `/settings/llm`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [LlmSettingsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/models/LlmSettingsSection.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Language model list; context window/capabilities; configured provider; tests.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-069](audit/screenshots/snow-1440-070--settings-llm.png), [CAP-167](audit/screenshots/dark-412-070--settings-llm.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S87):** Add/edit/discover/test models; choose defaults. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Settings access resolves before rendering. Admin-owned catalog/config controls follow catalogEditable and feature gates; source SettingsAccessProvider remains authoritative.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S87: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-task-models

Audit: S88. Milestone: M8. Destination: `/settings/task-models`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [TaskModelsSettingsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/models/TaskModelsSettingsSection.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Models for DeepTutor background calls.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-070](audit/screenshots/snow-1440-071--settings-task-models.png), [CAP-168](audit/screenshots/dark-412-071--settings-task-models.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S88):** Assign model for listed task roles. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Settings access resolves before rendering. Admin-owned catalog/config controls follow catalogEditable and feature gates; source SettingsAccessProvider remains authoritative.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S88: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-embedding

Audit: S89. Milestone: M8. Destination: `/settings/embedding`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [EmbeddingSettingsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/models/EmbeddingSettingsSection.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Embedding models; dimensions; usage and tests.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-071](audit/screenshots/snow-1440-072--settings-embedding.png), [CAP-169](audit/screenshots/dark-412-072--settings-embedding.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S89):** Configure/test model and dimensions; inspect usage. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Settings access resolves before rendering. Admin-owned catalog/config controls follow catalogEditable and feature gates; source SettingsAccessProvider remains authoritative.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S89: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-search

Audit: S90. Milestone: M8. Destination: `/settings/search`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [SearchSettingsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/models/SearchSettingsSection.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Search providers; source-specific service configuration.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-072](audit/screenshots/snow-1440-073--settings-search.png), [CAP-170](audit/screenshots/dark-412-073--settings-search.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S90):** Configure provider; test/select as supported. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Settings access resolves before rendering. Admin-owned catalog/config controls follow catalogEditable and feature gates; source SettingsAccessProvider remains authoritative.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S90: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-voice

Audit: S91. Milestone: M8. Destination: `/settings/voice`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [VoiceSettingsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/models/VoiceSettingsSection.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): TTS and STT sub-surfaces; saved providers; preview/playback preferences.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-073](audit/screenshots/snow-1440-074--settings-voice.png), [CAP-171](audit/screenshots/dark-412-074--settings-voice.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S91):** Configure synthesis/transcription; discover voices; preview. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Settings access resolves before rendering. Admin-owned catalog/config controls follow catalogEditable and feature gates; source SettingsAccessProvider remains authoritative.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S91: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-multimodal

Audit: S92. Milestone: M8. Destination: `/settings/multimodal`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [MultimodalSettingsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/models/MultimodalSettingsSection.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Image and video generation model configuration.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-074](audit/screenshots/snow-1440-075--settings-multimodal.png), [CAP-172](audit/screenshots/dark-412-075--settings-multimodal.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S92):** Configure image/video services; test where offered. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Settings access resolves before rendering. Admin-owned catalog/config controls follow catalogEditable and feature gates; source SettingsAccessProvider remains authoritative.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S92: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-starters

Audit: S93. Milestone: M8. Destination: `/settings/starters`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [StartersSettingsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/StartersSettingsSection.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): History/material scope shaping composer starters.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-075](audit/screenshots/snow-1440-076--settings-starters.png), [CAP-173](audit/screenshots/dark-412-076--settings-starters.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S93):** Adjust source/history suggestion scope. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Settings access resolves before rendering. Admin-owned catalog/config controls follow catalogEditable and feature gates; source SettingsAccessProvider remains authoritative.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S93: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-attachments

Audit: S94. Milestone: M8. Destination: `/settings/attachments`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [AttachmentsSettingsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/AttachmentsSettingsSection.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Upload size caps and extraction budgets.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-076](audit/screenshots/snow-1440-077--settings-attachments.png), [CAP-174](audit/screenshots/dark-412-077--settings-attachments.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S94):** Edit attachment limits where authorized. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Admin-only navigation leaf when auth is enabled; hidden for non-admin and pending auth failures.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S94: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-video-learning

Audit: S95. Milestone: M8. Destination: `/settings/video-learning`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [VideoLearningSettingsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/VideoLearningSettingsSection.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Native YouTube/local Invidious provider settings.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-077](audit/screenshots/snow-1440-078--settings-video-learning.png), [CAP-175](audit/screenshots/dark-412-078--settings-video-learning.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S95):** Configure/test permitted playback provider. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Admin-only navigation leaf when auth is enabled; hidden for non-admin and pending auth failures.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S95: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-learner-profile

Audit: S96. Milestone: M8. Destination: `/settings/learner-profile`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [LearnerProfileSettingsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/LearnerProfileSettingsSection.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Age/grade/explanation preferences.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-078](audit/screenshots/snow-1440-079--settings-learner-profile.png), [CAP-176](audit/screenshots/dark-412-079--settings-learner-profile.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S96):** Edit permitted learner fields. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Only authenticated learner preset (showLearnerOnly).
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S96: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-guardian

Audit: S97. Milestone: M8. Destination: `/settings/guardian`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [GuardianSettingsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/GuardianSettingsSection.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Authorized learners and permitted learning materials.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-079](audit/screenshots/snow-1440-080--settings-guardian.png), [CAP-177](audit/screenshots/dark-412-080--settings-guardian.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S97):** Inspect/manage only authorized relationships/materials. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Only authenticated standard/custom users allowed by showGuardianOnly; resource access still server-authorized.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S97: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-memory

Audit: S98. Milestone: M8. Destination: `/settings/memory`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [MemorySettingsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/MemorySettingsSection.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Chunking, budget, deduplication and reference policies.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-080](audit/screenshots/snow-1440-081--settings-memory.png), [CAP-178](audit/screenshots/dark-412-081--settings-memory.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S98):** Edit memory runtime policies. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Settings access resolves before rendering. Admin-owned catalog/config controls follow catalogEditable and feature gates; source SettingsAccessProvider remains authoritative.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S98: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-tools

Audit: S99. Milestone: M8. Destination: `/settings/tools`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [ToolsSettingsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/ToolsSettingsSection.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): User-toggleable built-in tools.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-081](audit/screenshots/snow-1440-082--settings-tools.png), [CAP-179](audit/screenshots/dark-412-082--settings-tools.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S99):** Enable/configure source-supported tools. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Settings access resolves before rendering. Admin-owned catalog/config controls follow catalogEditable and feature gates; source SettingsAccessProvider remains authoritative.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S99: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-capabilities

Audit: S100. Milestone: M8. Destination: `/settings/capabilities`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [CapabilitiesSettingsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/CapabilitiesSettingsSection.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Per-capability LLM parameters/runtime controls.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-082](audit/screenshots/snow-1440-083--settings-capabilities.png), [CAP-180](audit/screenshots/dark-412-083--settings-capabilities.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S100):** Configure installed capability parameters. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Settings access resolves before rendering. Admin-owned catalog/config controls follow catalogEditable and feature gates; source SettingsAccessProvider remains authoritative.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S100: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-knowledge

Audit: S101. Milestone: M8. Destination: `/settings/knowledge`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [DocumentParsingSettingsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/DocumentParsingSettingsSection.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Document parsing engine; MinerU and source-supported settings.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-083](audit/screenshots/snow-1440-084--settings-knowledge.png), [CAP-181](audit/screenshots/dark-412-084--settings-knowledge.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S101):** Configure/test parsing. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Settings access resolves before rendering. Admin-owned catalog/config controls follow catalogEditable and feature gates; source SettingsAccessProvider remains authoritative.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S101: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-network

Audit: S102. Milestone: M8. Destination: `/settings/network`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [NetworkSettingsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/NetworkSettingsSection.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Ports; browser API base; CORS.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-084](audit/screenshots/snow-1440-085--settings-network.png), [CAP-182](audit/screenshots/dark-412-085--settings-network.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S102):** Edit deployment network settings where authorized. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Settings access resolves before rendering. Admin-owned catalog/config controls follow catalogEditable and feature gates; source SettingsAccessProvider remains authoritative.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S102: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-status

Audit: S103. Milestone: M8. Destination: `/settings/status`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [SettingsRuntimePage.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsRuntimePage.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Service readiness/diagnostics; memory usage; modules and turn coordination.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-085](audit/screenshots/snow-1440-086--settings-status.png), [CAP-183](audit/screenshots/dark-412-086--settings-status.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S103):** Refresh diagnostics; inspect source-supported module/runtime actions. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Settings access resolves before rendering. Admin-owned catalog/config controls follow catalogEditable and feature gates; source SettingsAccessProvider remains authoritative.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S103: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-about

Audit: S104. Milestone: M8. Destination: `/settings/about`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [AboutSettingsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/AboutSettingsSection.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): App version; updates; project resources.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-086](audit/screenshots/snow-1440-087--settings-about.png), [CAP-184](audit/screenshots/dark-412-087--settings-about.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S104):** Inspect version; open official resources/check updates where offered. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Settings access resolves before rendering. Admin-owned catalog/config controls follow catalogEditable and feature gates; source SettingsAccessProvider remains authoritative.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S104: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-agent-claude-code

Audit: S105. Milestone: M8. Destination: `/settings/agent-claude-code`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [SubagentSettingsEditor.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SubagentSettingsEditor.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Backend-specific model/reasoning/run parameters; agent setup help.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-087](audit/screenshots/snow-1440-088--settings-agent-claude-code.png), [CAP-185](audit/screenshots/dark-412-088--settings-agent-claude-code.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S105):** Configure the selected supported backend; stage/apply available fields. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Admin-only navigation leaf when auth is enabled; hidden for non-admin and pending auth failures.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S105: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-agent-codex

Audit: S106. Milestone: M8. Destination: `/settings/agent-codex`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [SubagentSettingsEditor.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SubagentSettingsEditor.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Backend-specific model/reasoning/run parameters; agent setup help.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-088](audit/screenshots/snow-1440-089--settings-agent-codex.png), [CAP-186](audit/screenshots/dark-412-089--settings-agent-codex.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S106):** Configure the selected supported backend; stage/apply available fields. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Admin-only navigation leaf when auth is enabled; hidden for non-admin and pending auth failures.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S106: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-agent-grok

Audit: S107. Milestone: M8. Destination: `/settings/agent-grok`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [SubagentSettingsEditor.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SubagentSettingsEditor.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Backend-specific model/reasoning/run parameters; agent setup help.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-089](audit/screenshots/snow-1440-090--settings-agent-grok.png), [CAP-187](audit/screenshots/dark-412-090--settings-agent-grok.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S107):** Configure the selected supported backend; stage/apply available fields. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Admin-only navigation leaf when auth is enabled; hidden for non-admin and pending auth failures.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S107: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-agent-antigravity

Audit: S108. Milestone: M8. Destination: `/settings/agent-antigravity`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [SubagentSettingsEditor.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SubagentSettingsEditor.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Backend-specific model/reasoning/run parameters; agent setup help.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-090](audit/screenshots/snow-1440-091--settings-agent-antigravity.png), [CAP-188](audit/screenshots/dark-412-091--settings-agent-antigravity.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S108):** Configure the selected supported backend; stage/apply available fields. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Admin-only navigation leaf when auth is enabled; hidden for non-admin and pending auth failures.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S108: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-agent-kimi

Audit: S109. Milestone: M8. Destination: `/settings/agent-kimi`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [SubagentSettingsEditor.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SubagentSettingsEditor.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Backend-specific model/reasoning/run parameters; agent setup help.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-091](audit/screenshots/snow-1440-092--settings-agent-kimi.png), [CAP-189](audit/screenshots/dark-412-092--settings-agent-kimi.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S109):** Configure the selected supported backend; stage/apply available fields. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Admin-only navigation leaf when auth is enabled; hidden for non-admin and pending auth failures.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S109: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-agent-opencode

Audit: S110. Milestone: M8. Destination: `/settings/agent-opencode`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [SubagentSettingsEditor.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SubagentSettingsEditor.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Backend-specific model/reasoning/run parameters; agent setup help.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-092](audit/screenshots/snow-1440-093--settings-agent-opencode.png), [CAP-190](audit/screenshots/dark-412-093--settings-agent-opencode.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S110):** Configure the selected supported backend; stage/apply available fields. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Admin-only navigation leaf when auth is enabled; hidden for non-admin and pending auth failures.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S110: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-agent-mimo

Audit: S111. Milestone: M8. Destination: `/settings/agent-mimo`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [SubagentSettingsEditor.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SubagentSettingsEditor.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Backend-specific model/reasoning/run parameters; agent setup help.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-093](audit/screenshots/snow-1440-094--settings-agent-mimo.png), [CAP-191](audit/screenshots/dark-412-094--settings-agent-mimo.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S111):** Configure the selected supported backend; stage/apply available fields. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Admin-only navigation leaf when auth is enabled; hidden for non-admin and pending auth failures.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S111: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-agent-hermes

Audit: S112. Milestone: M8. Destination: `/settings/agent-hermes`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [SubagentSettingsEditor.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SubagentSettingsEditor.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Backend-specific model/reasoning/run parameters; agent setup help.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-094](audit/screenshots/snow-1440-095--settings-agent-hermes.png), [CAP-192](audit/screenshots/dark-412-095--settings-agent-hermes.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S112):** Configure the selected supported backend; stage/apply available fields. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Admin-only navigation leaf when auth is enabled; hidden for non-admin and pending auth failures.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S112: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-agent-hermes-remote

Audit: S113. Milestone: M8. Destination: `/settings/agent-hermes-remote`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [SubagentSettingsEditor.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SubagentSettingsEditor.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Backend-specific model/reasoning/run parameters; agent setup help.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-095](audit/screenshots/snow-1440-096--settings-agent-hermes-remote.png), [CAP-193](audit/screenshots/dark-412-096--settings-agent-hermes-remote.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S113):** Configure the selected supported backend; stage/apply available fields. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Admin-only navigation leaf when auth is enabled; hidden for non-admin and pending auth failures.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S113: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-agent-openclaw

Audit: S114. Milestone: M8. Destination: `/settings/agent-openclaw`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [SubagentSettingsEditor.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SubagentSettingsEditor.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Backend-specific model/reasoning/run parameters; agent setup help.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-096](audit/screenshots/snow-1440-097--settings-agent-openclaw.png), [CAP-194](audit/screenshots/dark-412-097--settings-agent-openclaw.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S114):** Configure the selected supported backend; stage/apply available fields. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Admin-only navigation leaf when auth is enabled; hidden for non-admin and pending auth failures.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S114: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply

### MS-SETTINGS-agent-deepseek-harness

Audit: S115. Milestone: M8. Destination: `/settings/agent-deepseek-harness`. Host: Settings stack. Fixture package: `settings`.

Source ownership: [SubagentSettingsEditor.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SubagentSettingsEditor.tsx), [SettingsPageContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx)

Layout/content requirements (source-confirmed sections; arrangement PROPOSED): Backend-specific model/reasoning/run parameters; agent setup help.

Specific fidelity rule: Render only this canonical source section, including its provider/backend-specific fields and role/preset restrictions. For editable staged fields preserve shared clean → unsaved → saved-draft → applied states across navigation; Save draft does not activate configuration. Read-only usage/about/status views do not gain invented editable controls. Source aliases resolve here without duplicate screen.

Capture references: [CAP-097](audit/screenshots/snow-1440-098--settings-agent-deepseek-harness.png), [CAP-195](audit/screenshots/dark-412-098--settings-agent-deepseek-harness.png). These establish at most the captured shell/auth/blocked layout, not completed interior workflow.

- [ ] **Navigation:** enter from Settings stack and by the proposed path; preserve validated owner/record IDs, return selection and drawer context. Invalid/deleted fixture identity has a recoverable fallback; Back follows NAVIGATION_ARCHITECTURE. No duplicate route on repeated open.
- [ ] **Interactions (S115):** Configure the selected supported backend; stage/apply available fields. Bind each to the `settings` fixture transition, preserving source busy/validation/access/cancel behavior; no external effect.
- [ ] **Loading:** Access/settings/section loading; probe/test/save/apply pending.
- [ ] **Empty:** Unconfigured service/list; unavailable section explicit, not generic blank page.
- [ ] **Error / recovery:** Validation/load/save/apply/probe denied/failure; keep draft recoverable.
- [ ] **Ready / completion:** Draft change → Save draft (inactive) → Apply (active) or Discard; tests/discovery/OAuth/migration/root-folder operations simulate source-shaped results only.
- [ ] **Permissions/availability:** Admin-only navigation leaf when auth is enabled; hidden for non-admin and pending auth failures.
- [ ] **Visual/accessibility:** apply COMPONENT_MAPPING roles, origin-specific secondary panels and shared acceptance baseline; mark source-only states visually UNVERIFIED until suitable source captures exist.

Audited source state evidence (do not upgrade UNVERIFIED statements to source facts):

- S115: loading — VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton; empty — UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen; error — VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified; completed — VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply


## Dialog, sheet, embedded and reusable acceptance contracts

These are not extra product screens. Long modal URL proposals appear in NAVIGATION_ARCHITECTURE; otherwise use owner-local overlay state. All are required in the milestones above.

### UI-SHELL

Audit: S01. Reusable component. Milestone M1. Owner: Root application layout. Fixture: `shell`.

- [x] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [x] S01 actions: Navigate; change shelf; new conversation; collapse/resize sidebar; customize navigation; source components [AppShell.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/layout/AppShell.tsx), [SidebarShell.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/sidebar/SidebarShell.tsx), [WorkspaceSidebar.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/sidebar/WorkspaceSidebar.tsx), [UtilitySidebar.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/sidebar/UtilitySidebar.tsx), [page-sections.ts](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/sidebar/page-sections.ts).
- [x] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [x] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [x] Use exact source theme/content roles; match only observed capture details [CAP-033](audit/screenshots/snow-1440-033--chat.png), [CAP-131](audit/screenshots/dark-412-033--chat.png), and explicitly track unverified interior visual behavior.

Verification scope: [M1 evidence](M1_VERIFICATION.md). Checks apply to the shared foundation/development fixture, not later feature owners. Native device checks remain unverified; shell feature selection is scaffolding only.

### UI-ACCOUNT-WORKSPACE

Audit: S03. Bottom sheet. Milestone M2. Owner: UI-SHELL. Fixture: `shell`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S03 actions: Switch workspace; profile/settings/admin/logout where exposed; source components [WorkspaceMenu.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/sidebar/WorkspaceMenu.tsx), [WorkspacePill.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/workspaces/WorkspacePill.tsx), [WorkspaceNavigation.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/workspaces/WorkspaceNavigation.tsx), [page-sections.ts](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/sidebar/page-sections.ts).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-033](audit/screenshots/snow-1440-033--chat.png), [CAP-131](audit/screenshots/dark-412-033--chat.png), and explicitly track unverified interior visual behavior.

### UI-COMPOSER-PICKERS

Audit: S06. Bottom sheet. Milestone M3. Owner: MS-CHAT; MS-MASTERY-STUDY; MS-READING. Fixture: `chat`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S06 actions: Search/select/remove model, persona, partner/group/subagent and resources; enable allowed tools; source components [ModelSelector.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/ModelSelector.tsx), [ComposerResources.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/ComposerResources.tsx), [ComposerTray.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/ComposerTray.tsx), [AnswerModeMenu.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/AnswerModeMenu.tsx), [ContextReferenceTree.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/ContextReferenceTree.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-032](audit/screenshots/snow-1440-032--chat-audit-missing-record.png), [CAP-130](audit/screenshots/dark-412-032--chat-audit-missing-record.png), and explicitly track unverified interior visual behavior.

### UI-CAPABILITIES

Audit: S11. Embedded interface. Milestone M3. Owner: MS-CHAT composer/messages. Fixture: `capabilities`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S11 actions: Select capability; configure/confirm; submit through same composer; source components [presentation.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/capabilities/presentation.tsx), [CapabilityConfigCard.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/CapabilityConfigCard.tsx), [QuizConfigPanel.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/quiz/QuizConfigPanel.tsx), [ResearchConfigPanel.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/research/ResearchConfigPanel.tsx), [VisualizeConfigPanel.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/visualize/VisualizeConfigPanel.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-032](audit/screenshots/snow-1440-032--chat-audit-missing-record.png), [CAP-130](audit/screenshots/dark-412-032--chat-audit-missing-record.png), and explicitly track unverified interior visual behavior.

### UI-STRUCTURED-REPLY

Audit: S12. Embedded interface. Milestone M3. Owner: MS-CHAT; MS-MASTERY-STUDY. Fixture: `chat`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S12 actions: Select options; type response; submit; source-supported skip; source components [AskUserOptions.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/AskUserOptions.tsx), [MasteryQuestionCard.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/MasteryQuestionCard.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-032](audit/screenshots/snow-1440-032--chat-audit-missing-record.png), [CAP-130](audit/screenshots/dark-412-032--chat-audit-missing-record.png), and explicitly track unverified interior visual behavior.

### UI-QUIZ

Audit: S13. Embedded interface. Milestone M4. Owner: MS-CHAT; MS-SESSION-VIEWER. Fixture: `quiz`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S13 actions: Answer; submit; reveal/review; attach answer image; bookmark; open question follow-up; source components [QuizViewer.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/quiz/QuizViewer.tsx), [QuizFollowupTabBody.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/quiz/QuizFollowupTabBody.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-032](audit/screenshots/snow-1440-032--chat-audit-missing-record.png), [CAP-130](audit/screenshots/dark-412-032--chat-audit-missing-record.png), and explicitly track unverified interior visual behavior.

### UI-RESEARCH

Audit: S14. Embedded interface. Milestone M3. Owner: MS-CHAT; MS-SESSION-VIEWER. Fixture: `capabilities`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S14 actions: Configure; edit/confirm outline; read citations and report; source components [ResearchOutlineEditor.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/research/ResearchOutlineEditor.tsx), [ResearchConfigPanel.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/research/ResearchConfigPanel.tsx), [ChatMessageList.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/chat/messages/ChatMessageList.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-032](audit/screenshots/snow-1440-032--chat-audit-missing-record.png), [CAP-130](audit/screenshots/dark-412-032--chat-audit-missing-record.png), and explicitly track unverified interior visual behavior.

### UI-VISUAL-RESULT

Audit: S15. Embedded interface. Milestone M5. Owner: MS-CHAT; MS-SESSION-VIEWER. Fixture: `capabilities`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S15 actions: Toggle code; copy; fullscreen; play; source-supported file actions; source components [VisualizationViewer.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/visualize/VisualizationViewer.tsx), [MathAnimatorViewer.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/math-animator/MathAnimatorViewer.tsx), [VideoLessonViewer.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/video-lesson/VideoLessonViewer.tsx), [Geogebra.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/Geogebra.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-032](audit/screenshots/snow-1440-032--chat-audit-missing-record.png), [CAP-130](audit/screenshots/dark-412-032--chat-audit-missing-record.png), and explicitly track unverified interior visual behavior.

### UI-MASTERY-CREATE

Audit: S19. Dialog. Milestone M4. Owner: MS-MASTERY-LIBRARY; reading handoff. Fixture: `mastery`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S19 actions: Enter goal; select materials; create; continue outline conversation; source components [CreateTopicWizard.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/CreateTopicWizard.tsx), [TopicWizardSteps.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/TopicWizardSteps.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-043](audit/screenshots/snow-1440-043--learning-mastery.png), [CAP-141](audit/screenshots/dark-412-043--learning-mastery.png), and explicitly track unverified interior visual behavior.

### UI-PRACTICE-IMPORT

Audit: S26. Dialog. Milestone M4. Owner: MS-PRACTICE; MS-QUESTION-BANK. Fixture: `practice`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S26 actions: Choose file/target; import; inspect outcome; source components [PracticeImport.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/learning/practice/PracticeImport.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-029](audit/screenshots/snow-1440-029--space-questions.png), [CAP-127](audit/screenshots/dark-412-029--space-questions.png), and explicitly track unverified interior visual behavior.

### UI-READING-ACTIONS

Audit: S37. Bottom sheet. Milestone M5. Owner: MS-READING selection and toolbar. Fixture: `reading`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S37 actions: Highlight; write note; contextual tutor action; adjust/reset reading display; source components [AnnotationPopover.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/AnnotationPopover.tsx), [AnnotationList.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/AnnotationList.tsx), [ReaderDisplayControls.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/ReaderDisplayControls.tsx), [reading-display-preferences.ts](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/lib/reading-display-preferences.ts).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-047](audit/screenshots/snow-1440-047--learning-reading-audit-missing-record.png), [CAP-145](audit/screenshots/dark-412-047--learning-reading-audit-missing-record.png), and explicitly track unverified interior visual behavior.

### ADAPTER-LEGACY-WATCH

Audit: S38. Reusable component. Milestone M5. Owner: Incoming route resolver, no new product screen. Fixture: `reading`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S38 actions: Resolve/open previous watching session; source components [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/watching/[sessionId]/page.tsx), [LegacyWatchingSession.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/workspace/LegacyWatchingSession.tsx), [YouTubeReadingPlayer.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/workspace/YouTubeReadingPlayer.tsx), [BilibiliReadingPlayer.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/workspace/BilibiliReadingPlayer.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-053](audit/screenshots/snow-1440-053--learning-watching-audit-missing-record.png), [CAP-151](audit/screenshots/dark-412-053--learning-watching-audit-missing-record.png), and explicitly track unverified interior visual behavior.

### UI-KB-CREATE

Audit: S43. Dialog. Milestone M7. Owner: MS-KNOWLEDGE. Fixture: `knowledge`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S43 actions: Enter valid name; choose engine; add documents; probe link/server; submit; source components [CreateKbModal.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/knowledge/CreateKbModal.tsx), [LinkFolderModal.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/knowledge/LinkFolderModal.tsx), [PageIndexSettingsModal.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/knowledge/PageIndexSettingsModal.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-008](audit/screenshots/snow-1440-008--knowledge-bases.png), [CAP-106](audit/screenshots/dark-412-008--knowledge-bases.png), and explicitly track unverified interior visual behavior.

### UI-FAVORITES-SAVE

Audit: S47. Dialog. Milestone M4. Owner: Chat/partner/reading source action. Fixture: `favorites`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S47 actions: Select collection; save/cancel; choose records for composer; source components [SaveToNotebookModal.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/notebook/SaveToNotebookModal.tsx), [NotebookRecordPicker.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/notebook/NotebookRecordPicker.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-018](audit/screenshots/snow-1440-018--notebooks.png), [CAP-116](audit/screenshots/dark-412-018--notebooks.png), and explicitly track unverified interior visual behavior.

### ADAPTER-MEMORY-RESOLVE

Audit: S61. Reusable component. Milestone M7. Owner: Incoming reference resolver. Fixture: `memory`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S61 actions: Resolve/navigate; recover from missing ID/failure; source components [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/memory/resolve/page.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-016](audit/screenshots/snow-1440-016--memory-resolve.png), [CAP-114](audit/screenshots/dark-412-016--memory-resolve.png), and explicitly track unverified interior visual behavior.

### UI-PARTNER-CHANNELS

Audit: S69. Embedded interface. Milestone M6. Owner: MS-PARTNER Channels tab. Fixture: `partners`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S69 actions: Enter channel settings; connect; inspect QR/status; stop/retry where supported; source components [ChannelOnboardingPanel.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/partners/ChannelOnboardingPanel.tsx), [PartnerChannels.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/partners/PartnerChannels.tsx), [WeixinQrLogin.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/partners/WeixinQrLogin.tsx), [ChannelRuntimeStatus.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/partners/ChannelRuntimeStatus.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-056](audit/screenshots/snow-1440-056--partners-audit-missing-record.png), [CAP-154](audit/screenshots/dark-412-056--partners-audit-missing-record.png), and explicitly track unverified interior visual behavior.

### UI-AVATAR-GALLERY

Audit: S80. Reusable component. Milestone M1. Owner: Development-only /avatar-preview route, no learner navigation. Fixture: `gallery`.

- [x] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [x] S80 actions: Preview animation states; source components [page.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/avatar-preview/page.tsx).
- [x] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [x] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [x] Use exact source theme/content roles; match only observed capture details [CAP-006](audit/screenshots/snow-1440-006--avatar-preview.png), [CAP-104](audit/screenshots/dark-412-006--avatar-preview.png), and explicitly track unverified interior visual behavior.

Verification scope: [M1 evidence](M1_VERIFICATION.md). Checks apply to the shared foundation/development fixture, not later feature owners. Native device checks remain unverified; shell feature selection is scaffolding only.

### UI-PAGE-CUSTOMIZE

Audit: S116. Dialog. Milestone M4. Owner: MS-CHAT; MS-LEARNING; MS-LEARNING-CREATE. Fixture: `customization`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S116 actions: Toggle visibility; edit starter label/prompt; save/reset; retry load; source components [PageCustomizeDialog.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/customization/PageCustomizeDialog.tsx), [PageCustomizeButton.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/customization/PageCustomizeButton.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-032](audit/screenshots/snow-1440-032--chat-audit-missing-record.png), [CAP-130](audit/screenshots/dark-412-032--chat-audit-missing-record.png), and explicitly track unverified interior visual behavior.

### UI-IMPORTED-AGENTS

Audit: S117. Embedded interface. Milestone M7. Owner: MS-AGENTS second section. Fixture: `agents`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S117 actions: Import; select scope; synchronize; open supported imported sessions; source components [MyAgentsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/MyAgentsSection.tsx), [ScopePicker.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/ScopePicker.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-005](audit/screenshots/snow-1440-005--agents.png), [CAP-103](audit/screenshots/dark-412-005--agents.png), and explicitly track unverified interior visual behavior.

### UI-HISTORY-IMPORT

Audit: S118. Dialog. Milestone M7. Owner: MS-AGENTS imported-history section. Fixture: `agents`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S118 actions: Select source/files or server-compatible history; scan; choose scope; import; inspect result; source components [ImportWizard.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/ImportWizard.tsx), [ScopeEditorModal.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/ScopeEditorModal.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-005](audit/screenshots/snow-1440-005--agents.png), [CAP-103](audit/screenshots/dark-412-005--agents.png), and explicitly track unverified interior visual behavior.

### UI-QUESTION-CATEGORIES

Audit: S119. Bottom sheet. Milestone M4. Owner: MS-QUESTION-BANK; bulk selection toolbar. Fixture: `practice`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S119 actions: Manage categories; apply source-supported bulk actions; source components [CategoryManager.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/question-bank/CategoryManager.tsx), [CategoryMenu.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/question-bank/CategoryMenu.tsx), [BankSelectionBar.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/question-bank/BankSelectionBar.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-029](audit/screenshots/snow-1440-029--space-questions.png), [CAP-127](audit/screenshots/dark-412-029--space-questions.png), and explicitly track unverified interior visual behavior.

### UI-MASTERY-ROUTE-EDIT

Audit: S120. Dialog. Milestone M4. Owner: MS-MASTERY-DETAIL. Fixture: `mastery`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S120 actions: Edit draft; validate; confirm/cancel; source components [EditTopicRouteDialog.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/EditTopicRouteDialog.tsx), [RouteDraftEditor.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/RouteDraftEditor.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-040](audit/screenshots/snow-1440-040--learning-mastery-audit-missing-record.png), [CAP-138](audit/screenshots/dark-412-040--learning-mastery-audit-missing-record.png), and explicitly track unverified interior visual behavior.

### UI-NOTE-REVIEW

Audit: S121. Dialog. Milestone M6. Owner: MS-NOTES; note review trigger. Fixture: `notes`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S121 actions: Reveal; grade; follow source; export; close; source components [NoteReview.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteReview.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-035](audit/screenshots/snow-1440-035--co-writer.png), [CAP-133](audit/screenshots/dark-412-035--co-writer.png), and explicitly track unverified interior visual behavior.

### UI-NOTE-INSERT-SOURCES

Audit: S122. Bottom sheet. Milestone M6. Owner: MS-NOTE-EDITOR. Fixture: `notes`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S122 actions: Select source/favorite; insert source-supported block kind; source components [NoteSourcePicker.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteSourcePicker.tsx), [NoteFavoritesPicker.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteFavoritesPicker.tsx), [NoteInsertMenu.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteInsertMenu.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-034](audit/screenshots/snow-1440-034--co-writer-audit-missing-record.png), [CAP-132](audit/screenshots/dark-412-034--co-writer-audit-missing-record.png), and explicitly track unverified interior visual behavior.

### UI-NOTE-REVIEW-MARGIN

Audit: S123. Embedded interface. Milestone M6. Owner: MS-NOTE-EDITOR and companion. Fixture: `notes`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S123 actions: Inspect/accept/reject source-supported review; follow thread; source components [NoteInlineReviews.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteInlineReviews.tsx), [NoteSuggestionContent.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteSuggestionContent.tsx), [NoteThreadMarkers.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteThreadMarkers.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-034](audit/screenshots/snow-1440-034--co-writer-audit-missing-record.png), [CAP-132](audit/screenshots/dark-412-034--co-writer-audit-missing-record.png), and explicitly track unverified interior visual behavior.

### UI-BOOK-BLOCKS

Audit: S124. Embedded interface. Milestone M5. Owner: MS-BOOK-READER. Fixture: `books`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S124 actions: Use block-specific reveal/answer/play/deep-dive/edit actions; source components [BlockRenderer.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/books/components/blocks/BlockRenderer.tsx), [FlashCardsBlock.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/books/components/blocks/FlashCardsBlock.tsx), [QuizBlock.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/books/components/blocks/QuizBlock.tsx), [InteractiveBlock.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/books/components/blocks/InteractiveBlock.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-037](audit/screenshots/snow-1440-037--learning-books-audit-missing-record.png), [CAP-135](audit/screenshots/dark-412-037--learning-books-audit-missing-record.png), and explicitly track unverified interior visual behavior.

### UI-KB-SOURCES

Audit: S125. Embedded interface. Milestone M7. Owner: MS-KB-DETAIL eligible sections. Fixture: `knowledge`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S125 actions: Add/configure/synchronize/remove sources according to KB kind and permission; source components [KbWebSourcesSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/knowledge/KbWebSourcesSection.tsx), [KbGitHubSourcesSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/knowledge/KbGitHubSourcesSection.tsx), [KbLinkedFoldersSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/knowledge/KbLinkedFoldersSection.tsx), [KbMarginNoteDevicesSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/knowledge/KbMarginNoteDevicesSection.tsx), [KbKiwixArticlesSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/knowledge/KbKiwixArticlesSection.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-007](audit/screenshots/snow-1440-007--knowledge-bases-audit-missing-record.png), [CAP-105](audit/screenshots/dark-412-007--knowledge-bases-audit-missing-record.png), and explicitly track unverified interior visual behavior.

### UI-KB-DIAGNOSTICS

Audit: S126. Embedded interface. Milestone M7. Owner: MS-KB-DETAIL. Fixture: `knowledge`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S126 actions: Inspect run/version/provenance; retry/publish only where source exposes action; source components [KbIndexVersionsSection.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/knowledge/KbIndexVersionsSection.tsx), [KbUpdateHistory.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/knowledge/KbUpdateHistory.tsx), [KbVisualCoverage.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/knowledge/KbVisualCoverage.tsx), [KbIndexFailureBanner.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/knowledge/KbIndexFailureBanner.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-007](audit/screenshots/snow-1440-007--knowledge-bases-audit-missing-record.png), [CAP-105](audit/screenshots/dark-412-007--knowledge-bases-audit-missing-record.png), and explicitly track unverified interior visual behavior.

### UI-KIWIX-CONNECT

Audit: S127. Dialog. Milestone M7. Owner: MS-KNOWLEDGE. Fixture: `knowledge`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S127 actions: Enter/probe/connect source; cancel; source components [ConnectKiwixModal.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/knowledge/ConnectKiwixModal.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-008](audit/screenshots/snow-1440-008--knowledge-bases.png), [CAP-106](audit/screenshots/dark-412-008--knowledge-bases.png), and explicitly track unverified interior visual behavior.

### UI-SERVER-FOLDER

Audit: S128. Dialog. Milestone M8. Owner: MS-SETTINGS-workspace; linked-folder form. Fixture: `settings`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S128 actions: Browse permitted server folder; choose root; inspect snapshot; source components [ServerFolderPicker.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/workspaces/ServerFolderPicker.tsx), [SystemWorkspaceSnapshot.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/workspaces/SystemWorkspaceSnapshot.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-065](audit/screenshots/snow-1440-066--settings-workspace.png), [CAP-163](audit/screenshots/dark-412-066--settings-workspace.png), and explicitly track unverified interior visual behavior.

### UI-WORKSPACE-BINDINGS

Audit: S129. Embedded interface. Milestone M8. Owner: MS-SETTINGS-workspace. Fixture: `settings`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S129 actions: Select bindings; edit allowed instructions; source components [WorkspaceResourcePicker.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/workspaces/WorkspaceResourcePicker.tsx), [WorkspaceInstructionsField.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/workspaces/WorkspaceInstructionsField.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-065](audit/screenshots/snow-1440-066--settings-workspace.png), [CAP-163](audit/screenshots/dark-412-066--settings-workspace.png), and explicitly track unverified interior visual behavior.

### UI-SETTINGS-SETUP

Audit: S130. Embedded interface. Milestone M8. Owner: Settings shell, guided tour overlay child. Fixture: `settings`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S130 actions: Inspect/setup; apply permitted preset; step/dismiss tour; manage supported modules; source components [SettingsReadinessPanel.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsReadinessPanel.tsx), [SettingsPresetsPanel.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPresetsPanel.tsx), [SettingsTourOverlay.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsTourOverlay.tsx), [ModulesPanel.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/ModulesPanel.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-063](audit/screenshots/snow-1440-064--settings-general.png), [CAP-161](audit/screenshots/dark-412-064--settings-general.png), and explicitly track unverified interior visual behavior.

### UI-PROVIDER-SETUP

Audit: S131. Embedded interface. Milestone M8. Owner: MS-SETTINGS-connections/llm and related service editors. Fixture: `settings`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S131 actions: Add/discover/test; follow backend-specific authentication instructions; source components [AddProviderPanel.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/AddProviderPanel.tsx), [ProviderModelDiscovery.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/ProviderModelDiscovery.tsx), [ModelTestPanel.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/ModelTestPanel.tsx), [CodexOAuthCard.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/CodexOAuthCard.tsx), [CodeBuddyAuthCard.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/CodeBuddyAuthCard.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-068](audit/screenshots/snow-1440-069--settings-connections.png), [CAP-166](audit/screenshots/dark-412-069--settings-connections.png), and explicitly track unverified interior visual behavior.

### UI-PARTNER-LINK-ARCHIVES

Audit: S132. Dialog. Milestone M6. Owner: MS-PARTNER; MS-GROUP. Fixture: `partners`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S132 actions: Link; inspect/restore supported archive; inspect invocation; source components [PartnerLinkModal.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/partners/PartnerLinkModal.tsx), [PartnerArchives.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/partners/PartnerArchives.tsx), [InvocationCard.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/partners/group/InvocationCard.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-056](audit/screenshots/snow-1440-056--partners-audit-missing-record.png), [CAP-154](audit/screenshots/dark-412-056--partners-audit-missing-record.png), and explicitly track unverified interior visual behavior.

### UI-MEMORY-RUN

Audit: S133. Embedded interface. Milestone M7. Owner: MS-MEMORY; layer workbenches. Fixture: `memory`.

- [ ] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [ ] S133 actions: Run/inspect/cancel only where owner offers action; source components [MemoryRunPanel.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/memory/MemoryRunPanel.tsx), [MemoryArchivedBanner.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/memory/MemoryArchivedBanner.tsx).
- [ ] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [ ] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [ ] Use exact source theme/content roles; match only observed capture details [CAP-015](audit/screenshots/snow-1440-015--memory.png), [CAP-113](audit/screenshots/dark-412-015--memory.png), and explicitly track unverified interior visual behavior.

### UI-CONFIRM

Audit: S134. Dialog. Milestone M1. Owner: Any source destructive-action owner. Fixture: `local`.

- [x] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [x] S134 actions: Confirm or cancel the named operation; source components [ConfirmDialog.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/ui/ConfirmDialog.tsx), [ConfirmDialog.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/ConfirmDialog.tsx).
- [x] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [x] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [x] Use exact source theme/content roles; match only observed capture details [CAP-033](audit/screenshots/snow-1440-033--chat.png), [CAP-131](audit/screenshots/dark-412-033--chat.png), and explicitly track unverified interior visual behavior.

Verification scope: [M1 evidence](M1_VERIFICATION.md). Checks apply to the shared foundation/development fixture, not later feature owners. Native device checks remain unverified; shell feature selection is scaffolding only.

### UI-FEEDBACK

Audit: S135. Reusable component. Milestone M1. Owner: Root toast + feature inline notices. Fixture: `local`.

- [x] Entry is only through the named host (or documented compatibility/development path); closing returns to same owner state and accessibility trigger.
- [x] S135 actions: Dismiss/retry/recover as offered by owning notice; source components [ToastViewport.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/common/ToastViewport.tsx), [ProtocolMismatchNotice.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/chat/components/turn/ProtocolMismatchNotice.tsx), [SettingsLoadStatusBanner.tsx](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsLoadStatusBanner.tsx).
- [x] Apply corresponding MOCK_DATA_SPEC loading/empty/error/ready or local idle/closed/invalid/busy equivalents; preserve busy/cancel/confirm/denied behavior and source selection identity.
- [x] Grouped secondary interfaces in SCREEN_MAPPING remain reachable; no source action dropped by replacing several editors with one generic sheet.
- [x] Use exact source theme/content roles; match only observed capture details [CAP-033](audit/screenshots/snow-1440-033--chat.png), [CAP-131](audit/screenshots/dark-412-033--chat.png), and explicitly track unverified interior visual behavior.

Verification scope: [M1 evidence](M1_VERIFICATION.md). Checks apply to the shared foundation/development fixture, not later feature owners. Native device checks remain unverified; shell feature selection is scaffolding only.

## Definition of UI-only completion

Every checklist item is backed by navigation/state evidence, renderer prototypes and source/capture comparison of the same state. No fixture progress, successful import/answer/auth/connection or synthetic grant is represented as a verified backend capability. Document any unsupported format or source-only visual uncertainty before claiming fidelity. Missing optional-plugin availability may intentionally hide Whisper, but its unavailable/present fixture and route decision still need acceptance. The development avatar gallery remains deliberately outside learner navigation.

No screens, components, fixtures or fixes were implemented during original specification preparation. Subsequent authorized M0 and M1 work is recorded above; remaining milestones await separate authorization.
