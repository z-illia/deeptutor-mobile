# Component and design mapping

Planning baseline: official DeepTutor v1.7.1, commit `f7aed0744c36c5afef16a4261c31ebee1208cac2`. Audit inputs: [135 surfaces](audit/screen-inventory.md), [63 page files](audit/route-map.md), [design](audit/design-system.md), [captures](audit/screenshot-catalog.md), [validation](audit/validation.md). Existing audit files and all application code remain unchanged.

**VERIFIED** = source-confirmed behavior, or an explicitly scoped observed capture. **UNVERIFIED** = runtime/presentation not established. **PROPOSED** = every mobile destination, component arrangement, fixture and acceptance contract below. Source verification never establishes that an asynchronous backend operation succeeded. Synthetic fixture content is allowed for UI development; it is not a new product capability or an API contract.

## Design contract

Use audited source values, never the mobile starter palette or arbitrary Material defaults. PROPOSED native role names (`background`, `foreground`, `surface`, `primary`, `muted`, `border`, `ring`, semantic status and text roles) resolve to the exact CSS tokens below. Preserve theme family separately from Classic/Modern layout and learning/reader text preferences.

The following table is the VERIFIED base palette extraction; Modern overrides follow it and take precedence for the startup light theme. Exact non-color CSS tokens and repeated selector order remain available in [design-tokens.json](audit/design-tokens.json).

| Token | Cream (light) | Dark | Default (snow) | Glass |
|---|---|---|---|---|
| --background | `#fdfcf9` | `#1a1918` | `#ffffff` | `#0e0d1a` |
| --foreground | `#1c1816` | `#e8e4de` | `#0d0d0d` | `#ffffff` |
| --card | `#ffffff` | `#242220` | `#ffffff` | `rgba(255, 255, 255, 0.06)` |
| --card-foreground | `#1c1816` | `#e8e4de` | `#0d0d0d` | `#ffffff` |
| --popover | `#ffffff` | `#242220` | `#ffffff` | `rgba(24, 22, 36, 0.92)` |
| --popover-foreground | `#1c1816` | `#e8e4de` | `#0d0d0d` | `#ffffff` |
| --primary | `#b0501e` | `#d4734b` | `#2563eb` | `#a855f7` |
| --primary-foreground | `#ffffff` | `#1a1918` | `#ffffff` | `#ffffff` |
| --secondary | `#f5f2ea` | `#2a2725` | `#f7f7f7` | `rgba(255, 255, 255, 0.04)` |
| --secondary-foreground | `#1c1816` | `#e8e4de` | `#0d0d0d` | `#eeeeee` |
| --muted | `#f1ede2` | `#2a2725` | `#f2f2f2` | `rgba(255, 255, 255, 0.06)` |
| --muted-foreground | `#6d645a` | `#9b9590` | `#6e6e6e` | `#b5b5c7` |
| --accent | `#ece7d8` | `#302d2a` | `#ececec` | `rgba(255, 255, 255, 0.12)` |
| --accent-foreground | `#1c1816` | `#e8e4de` | `#0d0d0d` | `#ffffff` |
| --destructive | `#c53a2c` | `#d44a3c` | `#d92d20` | `#f07178` |
| --destructive-foreground | `#ffffff` | `#ffffff` | `#ffffff` | `#ffffff` |
| --border | `#e6decc` | `#3a3634` | `#e5e5e5` | `rgba(255, 255, 255, 0.12)` |
| --input | `#e6decc` | `#3a3634` | `#e5e5e5` | `rgba(255, 255, 255, 0.06)` |
| --ring | `#b0501e` | `#d4734b` | `#2563eb` | `#a855f7` |
| --overlay | `rgba(28, 24, 22, 0.42)` | `rgba(0, 0, 0, 0.6)` | `rgba(0, 0, 0, 0.4)` | `rgba(0, 0, 0, 0.55)` |
| --success | `#237a4b` | `#5fd08a` | `#16794b` | `#68dfa0` |
| --success-foreground | `#14532d` | `#bbf7d0` | `#14532d` | `#bbf7d0` |
| --success-surface | `#ecf8f0` | `#173424` | `#ecfdf3` | `rgba(34, 197, 94, 0.14)` |
| --warning | `#a15c00` | `#f2b84b` | `#a15c00` | `#f7c65a` |
| --warning-foreground | `#713f12` | `#fde68a` | `#713f12` | `#fde68a` |
| --warning-surface | `#fff7df` | `#3a2c16` | `#fffaeb` | `rgba(245, 158, 11, 0.16)` |
| --info | `#2563eb` | `#7ba7ff` | `#2563eb` | `#9ab7ff` |
| --info-foreground | `#1e3a8a` | `#bfdbfe` | `#1e3a8a` | `#dbeafe` |
| --info-surface | `#eff6ff` | `#172641` | `#eff6ff` | `rgba(59, 130, 246, 0.16)` |
| --surface-raised | `#ffffff` | `#2a2826` | `#ffffff` | `rgba(35, 32, 51, 0.96)` |
| --shadow-raised | `0 16px 40px rgba(69, 49, 31, 0.12)` | `0 16px 44px rgba(0, 0, 0, 0.32)` | `0 16px 40px rgba(13, 13, 13, 0.12)` | `0 18px 48px rgba(0, 0, 0, 0.42)` |


### Effective startup colors and geometry

VERIFIED Modern Default keeps background `#ffffff` and primary/ring `#2563eb`, but sets foreground/card/popover/secondary/accent foreground `#37352f`, muted foreground `#787774`, secondary `#f8f8f7`, muted `#f1f1ef`, accent `rgb(55 53 47 / 0.06)`, border `rgb(55 53 47 / 0.09)`, input `rgb(55 53 47 / 0.16)`. Source `modern.css` loads after `globals.css`; do not use base snow `#0d0d0d` text for Modern.

Preserve all source palettes: `snow` Default; `light` Cream; `dark` Dark; `glass` Glass with dark base; `system` resolves Default or Dark. Modern is the audited layout default. Full parity retains Classic/Modern selection; fixture layouts are explicit scenarios, not a new product design.

| Role | Source value / behavior | Proposed native mapping |
|---|---|---|
| Sans / serif | Geist / Lora, root layout loads both; no loaded Geist Mono established | Bundle licensed matching fonts later; native font roles with tested glyph fallbacks; no new font family |
| Titles | Base 27, 30 at 640 content width; Modern 700, -0.025em, line 1.2 and 32 at 640; Classic serif | Separate layout token; narrow screen uses source narrow hierarchy, text scales with accessibility |
| Description/section | Modern 14 / 1.6; base 12.5 relaxed; section 13.5 semibold | Named role per source component, no universal arbitrary 16px replacement |
| Learning content | 16 × learning scale; 1.75 configurable; headings 24/20/18/16/14/14 | Content role independent of shell; no double scale in nested Markdown |
| Reader | 17 default, 12–28; serif default; line width 84 (48–104); auto/sepia/night; EPUB none/auto spread | Reader preference projection; clamp layout to available phone width without changing stored meaning |
| Spacing | Shared observed 4/6/8/10/12/16/20/24/28/32/36/48/64; no universal custom scale | Map component measurements explicitly; starter spacing subset is not complete source scale |
| Page/card | Feature max 1180; gutters 24/36; grid gap12; base top28/36; Modern top48/64 | Phone one-column with source narrow gutter intent; safe areas added outside content; no desktop sidebar squeezed beside reader |
| Corners | Modern 6/8/12; navigation7; icon tile14; shared dialogs/cards16; chip pill | Preserve role-specific radius; no new global rounded-card identity |
| Interaction | Source button sizes32/40/48; disabled50%; icon disabled45%; focus ring2 offset2; primary active brightness90% | Proposed at least48dp action regions independent of glyph size; equivalent pressed/focus/disabled state |
| Motion | Global120/180/240ms; drawer200ms; Modern ease cubic-bezier(0.2,0,0,1); reduced motion | Match source intent; respect system reduced motion; audit screenshots cannot verify normal timing |
| Shadow | Exact layered Modern xs/sm/md plus theme raised shadows in JSON | Match measured appearance on Android; do not equate source shadows to invented elevation constants |

Color-mix/opacity must resolve consistently; preserve Glass alpha surfaces and theme-specific scrim rather than flattening to white/black. Feature identity tints, highlight colors, task colors, memory layer mixtures and code themes are retained from their source owners. Line strokes, logo proportions and icon semantics remain original.

### Asset and localization mapping

Copy original product assets only in a later implementation milestone: `web/public/brand/color-logo.png`, `color-word.png` and canonical full/black variants and app icon assets, with source license/provenance. Preserve logo proportions; no redraw. Use audited provider/agent/knowledge-engine assets and dark alternatives selected through the source mapping, not a filename guess. [281-asset manifest](audit/asset-manifest.json) and source-generated icon maps remain authoritative. Mobile `assets/images/*` and `assets/expo.icon` are starter art, preserved now and not claimed as DeepTutor branding.

Source lucide-react glyphs map to installed lucide-react-native where actual glyph parity exists; custom ShelfIcons/ComposerIcons/agent/activity marks need source SVG/native adaptation. Keep original icon size/stroke semantics and add touch padding separately. Do not use the installed Expo symbols library to replace product icons arbitrarily.

UI locales: en/zh/fr/de/uk/pl/pt/vi/ja/tr with source fallback behavior. Model output languages and partner reply language are independent settings. Existing en/uk demo translations are preserved but do not define features or terminology. Inline en/zh source labels must be explicitly reconciled; missing source translations remain a tracked gap, not invented feature copy.

## Current mobile file-by-file reuse decision

All listed files remain untouched in this phase. Reuse means future adaptation eligibility, not that source parity already exists.

| Existing source | Decision | Future role | Required adaptation / limit |
|---|---|---|---|
| [src/app/_layout.tsx](../../src/app/_layout.tsx) | Future adaptation | Root providers/router shell | Keep source now; later replace tab-only composition with source drawer/stack, preserve theme/splash lifetimes; SDK 58 API check first. |
| [src/app/index.tsx](../../src/app/index.tsx) | Future modification | Root entry/Home → MS-CHAT | Starter greeting/dev hints are not DeepTutor. Later make / route resolve to source Home/Chat; no extra dashboard. |
| [src/app/explore.tsx](../../src/app/explore.tsx) | Preserve; development-only candidate | Starter reference screen | No audited product equivalent. Keep file now; later remove learner tab entry and explicitly decide development access. |
| [src/components/themed-text.tsx](../../src/components/themed-text.tsx) | Adapt primitive | Source typography roles | Underlying Text wrapper reusable; map roles to Geist/Lora and audited size/weight/leading; current 48 title and hardcoded blue are not authoritative. |
| [src/components/themed-view.tsx](../../src/components/themed-view.tsx) | Adapt primitive | Source surface roles | View/theme mechanism reusable; expand semantic palette roles and alpha surfaces; do not carry starter color values forward. |
| [src/components/ui/collapsible.tsx](../../src/components/ui/collapsible.tsx) | Adapt interaction | Disclosure/activity/section expansion | Retain local expanded-state pattern, add accessibility selected/expanded and reduced-motion behavior; match source geometry and icons. |
| [src/components/external-link.tsx](../../src/components/external-link.tsx) | Reuse with verification | External source/document/resource link | Expo Router/web-browser boundary is reusable; verify SDK58 linking and allowed URL behavior, keep internal locators inside router. |
| [src/components/hint-row.tsx](../../src/components/hint-row.tsx) | Preserve; limited structural reuse | Possible label/value row | Layout only; dev-hint copy/chip styling does not match settings or domain components. Do not force settings into this API. |
| [src/components/app-tabs.tsx](../../src/components/app-tabs.tsx) | Future navigation adaptation | Native shell entry | Current Home/Explore NativeTabs is a starter; not adopted as final product IA. Preserve now; implement source drawer/stack later. |
| [src/components/app-tabs.web.tsx](../../src/components/app-tabs.web.tsx) | Future fix and navigation adaptation | Web compatibility shell | Address TS2322 typed ref composition before navigation refactor; keep web test coverage while native structure changes. |
| [src/components/animated-icon.tsx](../../src/components/animated-icon.tsx) | Preserve; branding adaptation later | Splash lifecycle wrapper | Reuse lifecycle concept only; original Expo animation/art is not DeepTutor identity. Match original DeepTutor assets after license check. |
| [src/components/animated-icon.web.tsx](../../src/components/animated-icon.web.tsx) | Preserve; branding adaptation later | Web splash counterpart | Retain platform separation; no claim source product has Expo starter animation. |
| [src/components/animated-icon.module.css](../../src/components/animated-icon.module.css) | Preserve; future review | Web starter animation stylesheet | Do not import web-only CSS into native design system; future brand motion must cite source or be explicitly proposed. |
| [src/components/web-badge.tsx](../../src/components/web-badge.tsx) | Preserve; development-only candidate | Expo starter attribution badge | No DeepTutor screen equivalent; no product reuse unless required attribution separately established. |
| [src/constants/theme.ts](../../src/constants/theme.ts) | Future token adaptation | Theme/layout/content role mapping | Existing theme typing can guide role access; replace values only in later authorized implementation using exact audited palettes + Modern overrides. |
| [src/hooks/use-theme.ts](../../src/hooks/use-theme.ts) | Adapt hook | Theme resolution | Extend beyond current light/dark pair to source theme/layout settings with deterministic resolved palette. |
| [src/hooks/use-color-scheme.ts](../../src/hooks/use-color-scheme.ts) | Reuse underlying platform input | System theme input | Preserve as system observation input, separate from explicit user theme choice. |
| [src/hooks/use-color-scheme.web.ts](../../src/hooks/use-color-scheme.web.ts) | Future lint fix | Hydration-safe system input | Replace effect-driven hydration flag with a subscription/snapshot approach preserving light server snapshot and live client scheme; no disabled lint rule. |
| [src/global.css](../../src/global.css) | Preserve; future web adaptation | Web font variables | Current Spline Sans/Inter/Georgia fallbacks are starter values, not audited Geist/Lora. |
| [src/api/client.ts](../../src/api/client.ts) | Preserve; isolate from UI fixtures | Future live transport adapter | Import throws without env. Do not import into fixture screen dependencies. Resolve axios warning in later quality milestone; no new auth/API scheme invented. |
| [src/i18n/translations.ts](../../src/i18n/translations.ts) | Preserve; future source reconciliation | Localization types/helpers only where compatible | Unused en/uk demo text is not product authority. Retain file; later map source keys/ten UI locales and independent response/partner languages, mark unsupported demo text unreachable. |

## Web component family → proposed native building block

The audit component catalog below supplies source variants/states. Native names/ownership are proposed; no JSX, styling files or dependencies are added now.

| Family / source | Supported variants and significant states | Classification / Android adaptation |
|---|---|---|
| `shared/ui/Button.tsx`; `components/ui/Button.tsx` re-export | primary, secondary, danger, ghost; sm/md/lg; icon; loading replaces icon with spinner; disabled or loading blocks action; focus/hover/active | Embedded component; native button preserving semantic variants |
| `shared/ui/IconButton.tsx` | sm/md/lg 32/40/48 web px; accessible label; tooltip side; focus, hover, disabled | Embedded component; at least 48dp hit region proposed |
| `shared/ui/Field.tsx`; `components/settings/shared.tsx` | label, optional label, hint, error, invalid state; setting rows/sections; styled input/textarea/select | Embedded component; linked accessibility label/hint/error; keyboard-safe forms |
| `shared/ui/StatusChip.tsx` | neutral/info/success/warning/danger; optional icon; min 24px web pill | Embedded component; text + shape, not color alone |
| `shared/ui/InlineAlert.tsx` | info/success/warning/danger; icon/title/body/action; danger announces alert, others status | Embedded component; preserve urgency and retry action |
| `shared/ui/EmptyState.tsx` | compact/full; optional icon/description/action; centered | Embedded component; retain feature-specific copy |
| `shared/ui/Skeleton.tsx`; `components/learning/LearningShell.tsx` | generic pulse block; learning cards/error/empty; retry | Embedded component; do not replace errors with empty-success lists |
| `shared/ui/Tooltip.tsx`, TooltipLayer; `components/common/PickerShell.tsx` | positioned tooltip; picker overlay; keyboard/focus semantics | Overlay; tooltips become accessible labels/help on phone; long picker becomes full-height modal |
| `shared/ui/Dialog.tsx`; `components/common/Modal.tsx` | separate APIs; sm/md/lg/xl; title/footer; Escape/backdrop policy; focus trap/restore; busy blocks dismissal in Dialog; alert role | Dialog/Modal; owner-specific native back behavior |
| `components/ui/ConfirmDialog.tsx`; `space/learning/ConfirmDialog.tsx` | destructive/action copy; cancel/confirm; busy/error depends on owner | Dialog; source operation-specific confirmation |
| `components/layout/FeaturePage.tsx`, PageChrome, LocationCrumbs | scroll container; page/toolbar spacing; level 1/2 headings; actions/meta slots; container grids | Embedded component; mobile page scaffolding, contextual action placement |
| `components/sidebar/*Navigation.tsx`, NavigationPrimitives, PageBar | selected/active shelf/page; folded groups; counts; availability/learning policy gates; record list; sort/filter | Embedded/navigation; source hierarchy in Android drawer |
| `components/sidebar/CommandPalette.tsx` | query/active result; page/session/learning/partner/group results; keyboard selection | Overlay; search candidate full screen |
| `components/sessions/OrganizedSessionList.tsx`, SessionActionsMenu | session grouping/sorting/search; title/avatar; source menu actions and confirmations | List + contextual menu; virtualized list/action sheet |
| `components/chat/home/ModelSelector.tsx`, KnowledgeSelector, AnswerModeMenu | catalog-backed selection, search, readiness and unknown selection; default/persona/answerer; partner/group/subagent and budget | Popover/menu; bottom sheet candidate for short choice, tall picker for catalogs |
| ComposerInput/ChatComposer/ComposerTray/ComposerResources/SelectedResources | expanded/folded tray; selected context tree; resource chips; attachment processing; voice busy/error; send/stop; selected capabilities/tools; context budget | Embedded component; composer pinned above IME; source options remain distinguishable |
| `components/chat/*Picker.tsx`, notebook/NotebookRecordPicker | history, agents, books, reading locators, question entries, memory, persona; single/multi-select per owner | Modal/overlay; type-specific searchable pickers |
| `features/chat/messages/ChatMessageList.tsx`, UsageFooter | user editing/discard, assistant streaming/completed, retry/copy/voice; activity/result cards; source/reference chips; turn usage | Embedded list; virtualize without losing per-message local state |
| `components/activity/*`; `features/chat/trace/*` | activity stack/fold/row/detail grid; status dot/orb; responder/answerer marks; thought/tool/subagent traces | Embedded component; accessible status + expandable detail |
| `components/common/*Markdown*`, AssistantResponse, RichCodeBlock | simple/rich paths; inline/block; GFM tables, math/KaTeX, syntax highlighting, raw HTML in relevant rich path, code copy and theme handling | Embedded renderer; prove parity and security boundary in renderer spike |
| `components/chat/preview/previewers/*` | image, SVG, text, Markdown, PDF, DOCX, XLSX, Office text/PDF, video, fallback; binary/text loading and failure | Drawer/embedded viewer; full-screen mobile preview candidate |
| SessionViewerPanel/ViewerLauncher | file/web/markdown-note/followup/consultation/subagent/GeoGebra/new tabs; active/closed/stashed tabs; web timeout | Drawer; nested full-screen workspace proposed |
| QuizConfigPanel/QuizViewer/QuizFollowupTabBody | config validation; question pager, choices/free answer/image input, judgment states, reviews, bookmarks/categories and follow-up | Embedded capability; dedicated mobile result view only as adaptation |
| ResearchConfigPanel/ResearchOutlineEditor | notes/report/comparison/learning_path; quick/standard/deep/manual; outline edit/confirm; validation | Embedded configuration/result; tall editor proposed |
| VisualizationViewer/MathAnimatorViewer/VideoLessonViewer/Mermaid/Geogebra | render mode/result-specific presentation; code/copy/fullscreen; error/loading; video playback/export actions | Embedded renderer; full-screen interactive viewport candidate |
| LearningShell/LearningCard/LearningWays/LearningCreateMenu | four learning surfaces; available/hidden by module/policy/customization; empty/error/retry; layout-specific home | Embedded cards/navigation; preserve source feature separation |
| TopicMapCard/StudyOutline/ModuleOutline/LearningBoard/ObjectiveDetail/ReviewTrail | path progress; selected knowledge point; outline/board; objective report; due review; source coverage | Embedded learning components; nested mobile objective view |
| CreateTopicWizard/TopicWizardSteps/RouteDraftEditor | stepped goal/source input; busy/validation; editable route; confirm/reset/delete; source eligibility | Modal/Dialog; full-screen stepped form |
| ModeSwitch/MasteryComposer/MasteryQuestionCard/LevelUpCelebration | outline/study/review; disabled in live turn; answer/skip; celebration overlay; progress rings | Embedded + overlay; preserve mode tool constraints |
| PracticeSession/PracticeInsights/PracticeImport | question load/reveal/judgment/rating; conflict/reload; Again/Hard/Mastered/Easy; completion/skip count; spreadsheet import | Nested/embedded; focused review route proposed |
| BankScopeRail/BankToolbar/QuestionCard/CategoryManager/CategoryMenu/BankSelectionBar | Question Bank/Mistakes; query/scope/category filters; empty cases; bulk selection; category maintenance | Tab + menu/dialog; filters and bulk-action sheets proposed |
| BooksRoute; book component BlockRenderer family | create/proposal/spine confirmation; generation/paused/health; chapters, quiz/flashcards, figures, animation, concept graph, interactive, captures | Nested/embedded; full reader with separately opened spine/chat |
| ReadingLibrary/MaterialLibrary/ReadingFolder/AddMaterialsDialog/FolderDialog | collections versus materials; file/link/existing materials; title/color; checking/uploading/error | Full/nested + modal; native selection with server import semantics |
| ReadingWorkspace/ReaderPane/PdfDocumentView/EpubDocumentView/TextUnitView/AnnotationLayer | source units/locators; PDF pages/EPUB/text; grounded passage interactions; persistent annotations | Embedded document renderer; selection/locator fidelity spike |
| MediaReadingStage/YouTubeReadingPlayer/BilibiliReadingPlayer/ReadingCompanion | media/transcript synchronization; grounded timestamp; companion; provider availability | Embedded media; full-width stage and retained source timestamp |
| ReaderDisplayControls/AnnotationPopover/AnnotationList | 12–28 text size; serif toggle; line width steps; auto/sepia/night; spread; five highlight colors and note/contextual actions | Toolbar/contextual menu; bottom sheet candidates |
| KnowledgeHome/KnowledgeBaseDetail/KbStatusBadge/KbFilesTab | base/engine tabs; per-KB section eligibility; read-only; file status; index progress/failure/completion | Cards/tabs/list; section-driven mobile views |
| CreateKbModal/FileDropZone/LinkFolderModal/ConnectKiwixModal | new/link-existing; engine-dependent fields; files versus server folders; probe/default/error/busy | Modal; full-screen input forms, no invented mobile filesystem indexing |
| KbIndexingRun/KbTaskLogs/KbIndexVersions/KbVisualCoverage/KbUpdateHistory | run progress/logs; published versions; provenance; visual coverage and recovery | Embedded diagnostics; expandable mobile details |
| EngineDetail/LlamaIndexForm/LightRagForm/GraphRagForm/ImaForm | actual engine/provider fields; model/index settings; validation/test/probe as owned | Nested form; independent engine configuration destination |
| NotebookConsole/NotebookRecordRow/NotebookFavoriteContent | collections; metadata/name/color; saved originals by kind; query/focused record; unavailable/empty | List/detail + dialogs; Favorites stays distinct from editable notes |
| NoteWorkspace/NoteEditor/NoteRichBlocks/NoteInsertMenu/NoteOutline/NotePageTree | rich blocks; nested pages; cover/icon/title; save/revision conflict/recovery; outline/tree/favorites/sources | Embedded DOM editor; web-rendering candidate pending spike |
| NoteCompanion/NoteSuggestionContent/NoteInlineReviews/NoteThreadMarkers/NoteReview | Dito interaction; AI suggestions and review; thread locations; due flashcards/export/remembered grading | Embedded/overlay; review is distinct from Practice |
| LearningJournalPanel | mission/handoff/confirmed-records; pending/read-error; no user diary editor established | Embedded record view |
| PartnerAvatar/FaceEditor/SoulPicker/PartnerModelPicker/ToolPicker/AssetPicker | face/soul/model+backup/tools/assets; per-step state; channel config after create | Embedded forms; preserve five-step partner creation |
| PartnerChat/PartnerArchives/PartnerConfigure/PartnerChannels | chat/session continuity; archives; settings; channel schemas; runtime status; model restrictions | Tab/nested; keep source readiness and permissions |
| PartnerGroupChat/GroupRound/InvocationCard/PartnerSeat/DiscussionModePicker | modes; rounds; attributed responses; invocation trace; member mention; group session | Embedded + contextual picker; full-width discussion plus details |
| MemoryHub/MemoryL1Workbench/MemoryWorkbench/MemoryGraph/MemoryRunPanel | L1 mirror, L2 surfaces, L3 slots; rendered/lines/edit; ref/focus; graph pan/zoom/layer visibility; run status | Full/nested; layer list/detail and accessible graph detail |
| KanbanBoard/TaskPanelSection/TaskColorPicker/TaskLinkSelector | task status columns; edit/due/color; archive; drag/drop; source links | Embedded board; explicit Move menu on phone proposed |
| Calendar MonthView/TimeGrid/AgendaView/MiniMonth/ItemDetails/EventEditor | month/week/day/agenda; layer visibility; recurrence scope; reminders; create/edit/undo/search | Tab/overlay; Month/Agenda first, Day/Week retained for parity |
| SettingsPageContent/SettingsNav/SettingsToolbar/SettingsLoadStatusBanner | section dispatch/aliases; role/preset visibility; loading/unavailable; clean/unsaved/saved draft; Save draft/Apply/Discard; busy | Full/nested + sticky action bar; no autosave-only replacement |
| Provider/Model cards, ConnectionsEditor, ServiceConfigEditor, VoicePreviewPanel | provider/model master/detail; discovery/test; credentials; model capabilities; voice preview; catalog edit access | Embedded forms; nested list/editor and explicit backend test results |
| Multi-user GrantEditor/BookPermissionEditor/LearnerProfileEditor/GuardianRelationshipsEditor | user/account preset and resource grants; learner/guardian-specific controls | Embedded admin forms; scope and server checks retained |
| ThemeScript; hooks/context/stores/protocol/transport | theme hydration; workspace remount; auth/learning policy; session replay; browser state | Nonvisual logic; adapt dependencies and lifecycle, never turn into screens |


### Native ownership contract

| Proposed family | Responsibility / consumers | Reuse and behavior contract |
|---|---|---|
| shared/ui PageScaffold, AppDrawer, PageHeader | Every full screen, S01/S03 | Safe-area location/header, source shelf policy, independent content scroller; adapt existing themed wrappers |
| shared/ui ActionButton, IconAction, Field, Choice, SourceTabs | Forms, selectors, settings | Exact variants/labels/error/selected/busy; source Button re-export is one family, not two |
| shared/ui DialogFrame, ConfirmDialog, SelectionSheet | S03/S06/S19/S26/S37/S43/S47/S116–S134 | Host identity + dismissibility + trigger focus; short sheet versus tall form according to content |
| shared/ui EmptyState, InlineAlert, Skeleton, FeedbackViewport | Every data screen, S135 | Distinguish load/empty/error/denied/success; source owner chooses copy/actions |
| features/chat Composer, MessageList, ContextPicker, ActivityTrace | S04–S15, Mastery and Reading companions | Shared rendering where compatible, owner-specific capability/model/tool gates and typed references |
| features/rendering Markdown, Code, Formula, FileViewer, InteractiveResult | Messages/books/reading/notes | Preserve GFM/math/citations/format-specific fallback; isolated embedded web candidates need renderer spike; no plain-text substitution counted complete |
| features/learning PathCard, Outline, Objective, ModeSwitch, PracticeTurn | S16–S26/S119/S120 | Mastery modes and Practice scheduling remain different state machines |
| features/books BookSpine, BookBlock, GenerationStatus | S27–S30/S124 | Chapter confirmation and block schema remain book-owned; use shared quiz/visual renderer only where result contract agrees |
| features/reading MaterialLibrary, ReaderStage, AnnotationActions, Companion | S31–S38 | Persistent source locator/selection, document/media-specific display, distinct content/collection IDs |
| features/resources FavoritesRecord, JournalSections | S45–S48 | Saved original content versus read-only tutor journal; no note-editor reuse that adds journal CRUD |
| features/notes BlockEditor, PageTree, ReviewMargin, DueFlashcards | S62/S63/S121–S123 | Schema/revision/conflict/recovery, source-anchored suggestions and separate note review |
| features/knowledge KBSections, EngineForm, IndexRun, SourceEditor | S41–S44/S125–S127 | Engine eligibility/read_only and exact form fields; run/version ID preservation |
| features/personalization MarkdownLibrary, AgentConnections, HistoryImport, MCPRegistry, CLIList, MemoryWorkbench | S49–S61/S117/S118/S133 | Common list/form shells only; distinct scopes/records/tools and runtime-state semantics |
| features/partners IdentityWizard, PartnerTabs, ChannelForm, GroupRound | S66–S71/S132 | Source five-step wizard and schema-driven channel behavior; separate continuity/session and attributed discussion |
| features/tasks TaskCard/Editor; calendar CalendarViews/EventEditor | S64/S65 | Source status/calendar models; explicit Move and recurring edit scope equivalents |
| features/settings SectionRegistry, ServiceListEditor, DraftToolbar, SetupPanels; admin UserDetail | S76/S81–S115/S128–S131 | Preserve section key/access and clean/unsaved/saved/apply; no unauthorized field leakage or real config writes in fixture mode |

## Non-screen surface implementation handoff

Every non-screen primary disposition has a named target and host. Grouped children remain documented in SCREEN_MAPPING; bottom sheets are mobile proposals, not verified web presentations.

| Audit ID | Native target | Kind / host | Interaction contract | Fixture domain |
|---|---|---|---|---|
| S01 | `UI-SHELL` | Reusable component / Root application layout | Navigate; change shelf; new conversation; collapse/resize sidebar; customize navigation | shell |
| S03 | `UI-ACCOUNT-WORKSPACE` | Bottom sheet / UI-SHELL | Switch workspace; profile/settings/admin/logout where exposed | shell |
| S06 | `UI-COMPOSER-PICKERS` | Bottom sheet / MS-CHAT; MS-MASTERY-STUDY; MS-READING | Search/select/remove model, persona, partner/group/subagent and resources; enable allowed tools | chat |
| S11 | `UI-CAPABILITIES` | Embedded interface / MS-CHAT composer/messages | Select capability; configure/confirm; submit through same composer | capabilities |
| S12 | `UI-STRUCTURED-REPLY` | Embedded interface / MS-CHAT; MS-MASTERY-STUDY | Select options; type response; submit; source-supported skip | chat |
| S13 | `UI-QUIZ` | Embedded interface / MS-CHAT; MS-SESSION-VIEWER | Answer; submit; reveal/review; attach answer image; bookmark; open question follow-up | quiz |
| S14 | `UI-RESEARCH` | Embedded interface / MS-CHAT; MS-SESSION-VIEWER | Configure; edit/confirm outline; read citations and report | capabilities |
| S15 | `UI-VISUAL-RESULT` | Embedded interface / MS-CHAT; MS-SESSION-VIEWER | Toggle code; copy; fullscreen; play; source-supported file actions | capabilities |
| S19 | `UI-MASTERY-CREATE` | Dialog / MS-MASTERY-LIBRARY; reading handoff | Enter goal; select materials; create; continue outline conversation | mastery |
| S26 | `UI-PRACTICE-IMPORT` | Dialog / MS-PRACTICE; MS-QUESTION-BANK | Choose file/target; import; inspect outcome | practice |
| S37 | `UI-READING-ACTIONS` | Bottom sheet / MS-READING selection and toolbar | Highlight; write note; contextual tutor action; adjust/reset reading display | reading |
| S38 | `ADAPTER-LEGACY-WATCH` | Reusable component / Incoming route resolver, no new product screen | Resolve/open previous watching session | reading |
| S43 | `UI-KB-CREATE` | Dialog / MS-KNOWLEDGE | Enter valid name; choose engine; add documents; probe link/server; submit | knowledge |
| S47 | `UI-FAVORITES-SAVE` | Dialog / Chat/partner/reading source action | Select collection; save/cancel; choose records for composer | favorites |
| S61 | `ADAPTER-MEMORY-RESOLVE` | Reusable component / Incoming reference resolver | Resolve/navigate; recover from missing ID/failure | memory |
| S69 | `UI-PARTNER-CHANNELS` | Embedded interface / MS-PARTNER Channels tab | Enter channel settings; connect; inspect QR/status; stop/retry where supported | partners |
| S80 | `UI-AVATAR-GALLERY` | Reusable component / Development-only /avatar-preview route, no learner navigation | Preview animation states | gallery |
| S116 | `UI-PAGE-CUSTOMIZE` | Dialog / MS-CHAT; MS-LEARNING; MS-LEARNING-CREATE | Toggle visibility; edit starter label/prompt; save/reset; retry load | customization |
| S117 | `UI-IMPORTED-AGENTS` | Embedded interface / MS-AGENTS second section | Import; select scope; synchronize; open supported imported sessions | agents |
| S118 | `UI-HISTORY-IMPORT` | Dialog / MS-AGENTS imported-history section | Select source/files or server-compatible history; scan; choose scope; import; inspect result | agents |
| S119 | `UI-QUESTION-CATEGORIES` | Bottom sheet / MS-QUESTION-BANK; bulk selection toolbar | Manage categories; apply source-supported bulk actions | practice |
| S120 | `UI-MASTERY-ROUTE-EDIT` | Dialog / MS-MASTERY-DETAIL | Edit draft; validate; confirm/cancel | mastery |
| S121 | `UI-NOTE-REVIEW` | Dialog / MS-NOTES; note review trigger | Reveal; grade; follow source; export; close | notes |
| S122 | `UI-NOTE-INSERT-SOURCES` | Bottom sheet / MS-NOTE-EDITOR | Select source/favorite; insert source-supported block kind | notes |
| S123 | `UI-NOTE-REVIEW-MARGIN` | Embedded interface / MS-NOTE-EDITOR and companion | Inspect/accept/reject source-supported review; follow thread | notes |
| S124 | `UI-BOOK-BLOCKS` | Embedded interface / MS-BOOK-READER | Use block-specific reveal/answer/play/deep-dive/edit actions | books |
| S125 | `UI-KB-SOURCES` | Embedded interface / MS-KB-DETAIL eligible sections | Add/configure/synchronize/remove sources according to KB kind and permission | knowledge |
| S126 | `UI-KB-DIAGNOSTICS` | Embedded interface / MS-KB-DETAIL | Inspect run/version/provenance; retry/publish only where source exposes action | knowledge |
| S127 | `UI-KIWIX-CONNECT` | Dialog / MS-KNOWLEDGE | Enter/probe/connect source; cancel | knowledge |
| S128 | `UI-SERVER-FOLDER` | Dialog / MS-SETTINGS-workspace; linked-folder form | Browse permitted server folder; choose root; inspect snapshot | settings |
| S129 | `UI-WORKSPACE-BINDINGS` | Embedded interface / MS-SETTINGS-workspace | Select bindings; edit allowed instructions | settings |
| S130 | `UI-SETTINGS-SETUP` | Embedded interface / Settings shell, guided tour overlay child | Inspect/setup; apply permitted preset; step/dismiss tour; manage supported modules | settings |
| S131 | `UI-PROVIDER-SETUP` | Embedded interface / MS-SETTINGS-connections/llm and related service editors | Add/discover/test; follow backend-specific authentication instructions | settings |
| S132 | `UI-PARTNER-LINK-ARCHIVES` | Dialog / MS-PARTNER; MS-GROUP | Link; inspect/restore supported archive; inspect invocation | partners |
| S133 | `UI-MEMORY-RUN` | Embedded interface / MS-MEMORY; layer workbenches | Run/inspect/cancel only where owner offers action | memory |
| S134 | `UI-CONFIRM` | Dialog / Any source destructive-action owner | Confirm or cancel the named operation | local |
| S135 | `UI-FEEDBACK` | Reusable component / Root toast + feature inline notices | Dismiss/retry/recover as offered by owning notice | local |

## Renderer decision gates

Rich note BlockNote, PDF/EPUB selection/annotation, raw/rich Markdown math, Office/XLSX, interactive HTML/Chart.js/Mermaid, GeoGebra and browser-live Video Lesson need bounded prototypes before final renderer selection. Use existing react-native-svg/Expo media candidates only when their format semantics match source; installed dependencies do not prove compatibility. Mock complete/loading/error state wiring can proceed, but a static placeholder cannot satisfy the interactive or document acceptance criteria. Native packages are chosen only after matching SDK58 documentation and added later with expo install, never during this documentation phase.
