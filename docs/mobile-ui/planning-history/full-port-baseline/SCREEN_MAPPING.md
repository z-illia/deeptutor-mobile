# Screen mapping

Planning baseline: official DeepTutor v1.7.1, commit `f7aed0744c36c5afef16a4261c31ebee1208cac2`. Audit inputs: [135 surfaces](audit/screen-inventory.md), [63 page files](audit/route-map.md), [design](audit/design-system.md), [captures](audit/screenshot-catalog.md), [validation](audit/validation.md). Existing audit files and all application code remain unchanged.

**VERIFIED** = source-confirmed behavior, or an explicitly scoped observed capture. **UNVERIFIED** = runtime/presentation not established. **PROPOSED** = every mobile destination, component arrangement, fixture and acceptance contract below. Source verification never establishes that an asynchronous backend operation succeeded. Synthetic fixture content is allowed for UI development; it is not a new product capability or an API contract.

## Classification rules

One primary disposition is assigned to every S01–S135 record. A mobile screen is a navigation destination; a dialog can use a full-screen modal presentation without becoming a new feature; a bottom sheet is host-local selection/action state; an embedded interface remains inside its owner; a reusable component includes nonvisual compatibility adapters. Secondary children of grouped surfaces are explicitly described below. No functionality is excluded from the final roadmap. Conditional Whisper and the development avatar gallery have restricted entry rules rather than being silently omitted.

Records that restore an existing view (S04/S05, S21/S22, S29/S30, S34/S35/S36, S56/S57 and S58/S59) share mobile screen contracts. The 35 configurable settings sections plus Archived chats have distinct screen contracts but share `/settings/[section]` implementation; Progress remains separately owned.

| Primary disposition | Audit records |
|---|---|
| Reusable component | 5 |
| Mobile screen | 98 |
| Bottom sheet | 5 |
| Embedded interface | 15 |
| Dialog | 12 |

## Complete disposition ledger

| Audit ID / original surface | Primary mobile disposition | Proposed target | Host / entry | Milestone | Evidence |
|---|---|---|---|---|---|
| S01 — Application shell / navigation | Reusable component | `UI-SHELL` | Root application layout | M1 | [AppShell.tsx:55](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/layout/AppShell.tsx#L55) |
| S02 — Command palette / search | Mobile screen | `MS-SEARCH` | Root modal stack | M2 | [CommandPalette.tsx:6](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/sidebar/CommandPalette.tsx#L6) |
| S03 — Workspace and account menus | Bottom sheet | `UI-ACCOUNT-WORKSPACE` | UI-SHELL | M2 | [WorkspaceMenu.tsx:135](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/sidebar/WorkspaceMenu.tsx#L135) |
| S04 — Home / Chat | Mobile screen | `MS-CHAT` | Home shelf / conversation stack | M3 | [page.tsx:3](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/chat/page.tsx#L3) |
| S05 — Conversation | Mobile screen | `MS-CHAT` | Home shelf / conversation stack | M3 | [page.tsx:3](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/chat/[sessionId]/page.tsx#L3) |
| S06 — Composer controls and reference selection | Bottom sheet | `UI-COMPOSER-PICKERS` | MS-CHAT; MS-MASTERY-STUDY; MS-READING | M3 | [ModelSelector.tsx:107](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/ModelSelector.tsx#L107) |
| S07 — Session viewer / activity workspace | Mobile screen | `MS-SESSION-VIEWER` | Conversation stack | M3 | [SessionActivityPanel.tsx:222](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/SessionActivityPanel.tsx#L222) |
| S08 — File preview | Mobile screen | `MS-FILE-PREVIEW` | Root modal stack | M3 | [FilePreviewDrawer.tsx:64](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/preview/FilePreviewDrawer.tsx#L64) |
| S09 — Conversation organization / history | Mobile screen | `MS-HISTORY` | Resources shelf | M3 | [page.tsx:3](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/space/chat-history/page.tsx#L3) |
| S10 — Archived chats | Mobile screen | `MS-SETTINGS-archive` | Settings stack | M8 | [ArchivedChatsSettingsSection.tsx:36](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/ArchivedChatsSettingsSection.tsx#L36) |
| S11 — Chat capabilities | Embedded interface | `UI-CAPABILITIES` | MS-CHAT composer/messages | M3 | [CapabilityConfigCard.tsx:123](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/CapabilityConfigCard.tsx#L123) |
| S12 — Ask Questions / structured question | Embedded interface | `UI-STRUCTURED-REPLY` | MS-CHAT; MS-MASTERY-STUDY | M3 | [MasteryQuestionCard.tsx:443](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/MasteryQuestionCard.tsx#L443) |
| S13 — Quiz result and follow-up | Embedded interface | `UI-QUIZ` | MS-CHAT; MS-SESSION-VIEWER | M4 | [QuizViewer.tsx:191](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/quiz/QuizViewer.tsx#L191) |
| S14 — Research outline and report | Embedded interface | `UI-RESEARCH` | MS-CHAT; MS-SESSION-VIEWER | M3 | [ResearchOutlineEditor.tsx:25](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/research/ResearchOutlineEditor.tsx#L25) |
| S15 — Visualize / math animation / Video Lesson output | Embedded interface | `UI-VISUAL-RESULT` | MS-CHAT; MS-SESSION-VIEWER | M5 | [VisualizationViewer.tsx:186](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/visualize/VisualizationViewer.tsx#L186) |
| S16 — Personalized Learning / Learning | Mobile screen | `MS-LEARNING` | Learning shelf | M4 | [page.tsx:3](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/page.tsx#L3) |
| S17 — Create learning | Mobile screen | `MS-LEARNING-CREATE` | Learning stack | M4 | [page.tsx:3](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/new/page.tsx#L3) |
| S18 — Mastery Path atlas | Mobile screen | `MS-MASTERY-LIBRARY` | Learning stack | M4 | [page.tsx:96](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/mastery/page.tsx#L96) |
| S19 — Create mastery goal | Dialog | `UI-MASTERY-CREATE` | MS-MASTERY-LIBRARY; reading handoff | M4 | [TopicWizardSteps.tsx:244](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/TopicWizardSteps.tsx#L244) |
| S20 — Mastery Path detail | Mobile screen | `MS-MASTERY-DETAIL` | Learning stack | M4 | [page.tsx:70](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/mastery/[pathId]/page.tsx#L70) |
| S21 — Mastery study conversation | Mobile screen | `MS-MASTERY-STUDY` | Learning stack | M4 | [page.tsx:8](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/mastery/[pathId]/sessions/page.tsx#L8) |
| S22 — Persisted mastery study session | Mobile screen | `MS-MASTERY-STUDY` | Learning stack | M4 | [page.tsx:7](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/mastery/[pathId]/sessions/[sessionId]/page.tsx#L7) |
| S23 — Practice / daily review | Mobile screen | `MS-PRACTICE` | Learning stack | M4 | [page.tsx:5](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/practice/page.tsx#L5) |
| S24 — Question Bank / Mistakes | Mobile screen | `MS-QUESTION-BANK` | Resources stack | M4 | [page.tsx:5](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/space/questions/page.tsx#L5) |
| S25 — Practice question session | Mobile screen | `MS-PRACTICE-SESSION` | Learning stack | M4 | [PracticeSession.tsx:6](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/learning/practice/PracticeSession.tsx#L6) |
| S26 — Import practice questions | Dialog | `UI-PRACTICE-IMPORT` | MS-PRACTICE; MS-QUESTION-BANK | M4 | [PracticeImport.tsx:3](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/learning/practice/PracticeImport.tsx#L3) |
| S27 — Books library | Mobile screen | `MS-BOOKS` | Learning stack | M5 | [BooksRoute.tsx:84](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/books/BooksRoute.tsx#L84) |
| S28 — Create book / chapter spine | Mobile screen | `MS-BOOK-CREATE` | Learning stack | M5 | [BookCreator.tsx:86](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/books/components/BookCreator.tsx#L86) |
| S29 — Book / page reader | Mobile screen | `MS-BOOK-READER` | Learning stack | M5 | [BooksRoute.tsx:84](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/books/BooksRoute.tsx#L84) |
| S30 — Book page deep link | Mobile screen | `MS-BOOK-READER` | Learning stack | M5 | [BooksRoute.tsx:84](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/books/BooksRoute.tsx#L84) |
| S31 — Immersive Reading library | Mobile screen | `MS-READING-LIBRARY` | Learning stack | M5 | [page.tsx:5](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/reading/page.tsx#L5) |
| S32 — All reading materials | Mobile screen | `MS-READING-MATERIALS` | Learning stack | M5 | [page.tsx:3](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/reading/materials/page.tsx#L3) |
| S33 — Reading collection folder | Mobile screen | `MS-READING-FOLDER` | Learning stack | M5 | [page.tsx:3](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/reading/folders/[folderId]/page.tsx#L3) |
| S34 — Immersive Reading workspace | Mobile screen | `MS-READING` | Learning stack | M5 | [page.tsx:3](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/reading/[workspaceId]/page.tsx#L3) |
| S35 — Reading session URL variants | Mobile screen | `MS-READING` | Learning stack | M5 | [page.tsx:3](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/reading/[workspaceId]/sessions/page.tsx#L3) |
| S36 — Persisted reading conversation | Mobile screen | `MS-READING` | Learning stack | M5 | [page.tsx:3](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/reading/[workspaceId]/sessions/[sessionId]/page.tsx#L3) |
| S37 — Reading annotation and display tools | Bottom sheet | `UI-READING-ACTIONS` | MS-READING selection and toolbar | M5 | [AnnotationPopover.tsx:213](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/AnnotationPopover.tsx#L213) |
| S38 — Legacy watching session | Reusable component | `ADAPTER-LEGACY-WATCH` | Incoming route resolver, no new product screen | M5 | [page.tsx:2](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/watching/[sessionId]/page.tsx#L2) |
| S39 — Resources / Learning Space | Mobile screen | `MS-RESOURCES` | Resources shelf | M2 | [page.tsx:3](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/space/page.tsx#L3) |
| S40 — Personalization | Mobile screen | `MS-PERSONALIZATION` | Personalization shelf | M2 | [page.tsx:3](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/personalization/page.tsx#L3) |
| S41 — Knowledge Center | Mobile screen | `MS-KNOWLEDGE` | Resources stack | M7 | [page.tsx:7](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/knowledge-bases/page.tsx#L7) |
| S42 — Knowledge base details | Mobile screen | `MS-KB-DETAIL` | Resources stack | M7 | [page.tsx:7](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/knowledge-bases/[kbName]/page.tsx#L7) |
| S43 — Create / link knowledge base | Dialog | `UI-KB-CREATE` | MS-KNOWLEDGE | M7 | [CreateKbModal.tsx:129](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/knowledge/CreateKbModal.tsx#L129) |
| S44 — Knowledge engine configuration | Mobile screen | `MS-ENGINE-DETAIL` | Resources stack | M7 | [EngineDetail.tsx:3](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/knowledge/components/engines/EngineDetail.tsx#L3) |
| S45 — Favorites collections | Mobile screen | `MS-FAVORITES` | Resources stack | M4 | [NotebookConsole.tsx:81](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/notebook/NotebookConsole.tsx#L81) |
| S46 — Favorites collection detail | Mobile screen | `MS-FAVORITES-DETAIL` | Resources stack | M4 | [NotebookConsole.tsx:81](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/notebook/NotebookConsole.tsx#L81) |
| S47 — Save to Favorites / Notebook | Dialog | `UI-FAVORITES-SAVE` | Chat/partner/reading source action | M4 | [SaveToNotebookModal.tsx:149](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/notebook/SaveToNotebookModal.tsx#L149) |
| S48 — Learning journal | Mobile screen | `MS-JOURNAL` | Resources stack | M4 | [page.tsx:4](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/space/journal/page.tsx#L4) |
| S49 — Skills | Mobile screen | `MS-SKILLS` | Personalization stack | M7 | [page.tsx:3](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/space/skills/page.tsx#L3) |
| S50 — Personas | Mobile screen | `MS-PERSONAS` | Personalization stack | M7 | [page.tsx:3](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/space/personas/page.tsx#L3) |
| S51 — My Agents | Mobile screen | `MS-AGENTS` | Personalization stack | M7 | [page.tsx:4](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/agents/page.tsx#L4) |
| S52 — MCP Services | Mobile screen | `MS-MCP` | Personalization stack | M7 | [page.tsx:3](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/space/mcp/page.tsx#L3) |
| S53 — CLI Apps | Mobile screen | `MS-CLI` | Personalization stack | M7 | [page.tsx:3](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/space/cli-apps/page.tsx#L3) |
| S54 — Memory hub | Mobile screen | `MS-MEMORY` | Personalization stack | M7 | [page.tsx:4](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/memory/page.tsx#L4) |
| S55 — L1 workspace mirror | Mobile screen | `MS-MEMORY-L1` | Personalization stack | M7 | [page.tsx:61](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/memory/l1/page.tsx#L61) |
| S56 — L2 summaries | Mobile screen | `MS-MEMORY-L2` | Personalization stack | M7 | [page.tsx:5](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/memory/l2/page.tsx#L5) |
| S57 — L2 focused surface | Mobile screen | `MS-MEMORY-L2` | Personalization stack | M7 | [page.tsx:34](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/memory/l2/[surface]/page.tsx#L34) |
| S58 — L3 cross-surface knowledge | Mobile screen | `MS-MEMORY-L3` | Personalization stack | M7 | [page.tsx:5](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/memory/l3/page.tsx#L5) |
| S59 — L3 focused slot | Mobile screen | `MS-MEMORY-L3` | Personalization stack | M7 | [page.tsx:24](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/memory/l3/[slot]/page.tsx#L24) |
| S60 — Memory graph | Mobile screen | `MS-MEMORY-GRAPH` | Personalization stack | M7 | [page.tsx:5](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/memory/graph/page.tsx#L5) |
| S61 — Memory reference resolver | Reusable component | `ADAPTER-MEMORY-RESOLVE` | Incoming reference resolver | M7 | [page.tsx:93](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/memory/resolve/page.tsx#L93) |
| S62 — Learning notebook / Co-Writer library | Mobile screen | `MS-NOTES` | Home stack | M6 | [page.tsx:144](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/co-writer/page.tsx#L144) |
| S63 — Learning notebook editor | Mobile screen | `MS-NOTE-EDITOR` | Home stack | M6 | [page.tsx:10](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/co-writer/[docId]/page.tsx#L10) |
| S64 — Task Board | Mobile screen | `MS-TASKS` | Home stack | M6 | [KanbanBoard.tsx:45](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/tasks/components/KanbanBoard.tsx#L45) |
| S65 — Calendar | Mobile screen | `MS-CALENDAR` | Home stack | M6 | [CalendarPage.tsx:77](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/calendar/components/CalendarPage.tsx#L77) |
| S66 — Partners directory | Mobile screen | `MS-PARTNERS` | Partners shelf | M6 | [page.tsx:32](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/partners/page.tsx#L32) |
| S67 — Create partner | Mobile screen | `MS-PARTNER-CREATE` | Partners stack | M6 | [page.tsx:42](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/partners/new/page.tsx#L42) |
| S68 — Partner detail / chat | Mobile screen | `MS-PARTNER` | Partners stack | M6 | [PartnerChat.tsx:253](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/partners/PartnerChat.tsx#L253) |
| S69 — Partner channel onboarding | Embedded interface | `UI-PARTNER-CHANNELS` | MS-PARTNER Channels tab | M6 | [ChannelOnboardingPanel.tsx:25](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/partners/ChannelOnboardingPanel.tsx#L25) |
| S70 — Create partner group | Mobile screen | `MS-GROUP-CREATE` | Partners stack | M6 | [page.tsx:17](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/partners/groups/new/page.tsx#L17) |
| S71 — Partner group discussion | Mobile screen | `MS-GROUP` | Partners stack | M6 | [page.tsx:38](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/partners/groups/[groupId]/page.tsx#L38) |
| S72 — Whisper practice room | Mobile screen | `MS-WHISPER` | Conditional Resources entry | M8 | [page.tsx:39](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/whisper/page.tsx#L39) |
| S73 — Login | Mobile screen | `MS-LOGIN` | Auth stack | M2 | [page.tsx:176](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28auth%29/login/page.tsx#L176) |
| S74 — Registration | Mobile screen | `MS-REGISTER` | Auth stack | M2 | [page.tsx:9](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28auth%29/register/page.tsx#L9) |
| S75 — Profile | Mobile screen | `MS-PROFILE` | Account stack | M2 | [page.tsx:100](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/profile/page.tsx#L100) |
| S76 — User administration | Mobile screen | `MS-ADMIN-USERS` | Admin stack | M8 | [page.tsx:56](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28admin%29/admin/users/page.tsx#L56) |
| S77 — Session handoff link creation | Mobile screen | `MS-HANDOFF-CREATE` | Account stack | M8 | [page.tsx:12](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/session-handoff/page.tsx#L12) |
| S78 — Session handoff redemption | Mobile screen | `MS-HANDOFF-REDEEM` | Root entry stack | M8 | [page.tsx:105](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/handoff/page.tsx#L105) |
| S79 — Learning progress | Mobile screen | `MS-PROGRESS` | Settings stack | M4 | [page.tsx:17](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/settings/progress/page.tsx#L17) |
| S80 — Avatar preview developer surface | Reusable component | `UI-AVATAR-GALLERY` | Development-only /avatar-preview route, no learner navigation | M1 | [page.tsx:58](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28utility%29/avatar-preview/page.tsx#L58) |
| S81 — General | Mobile screen | `MS-SETTINGS-general` | Settings stack | M2 | [SettingsOverview.tsx:56](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsOverview.tsx#L56) |
| S82 — Appearance | Mobile screen | `MS-SETTINGS-appearance` | Settings stack | M2 | [AppearanceSettingsSection.tsx:46](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/AppearanceSettingsSection.tsx#L46) |
| S83 — Workspace | Mobile screen | `MS-SETTINGS-workspace` | Settings stack | M8 | [WorkspaceSettingsSection.tsx:100](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/WorkspaceSettingsSection.tsx#L100) |
| S84 — Data migration | Mobile screen | `MS-SETTINGS-data-migration` | Settings stack | M8 | [DataMigrationSettingsSection.tsx:74](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/DataMigrationSettingsSection.tsx#L74) |
| S85 — Usage statistics | Mobile screen | `MS-SETTINGS-usage` | Settings stack | M8 | [UsageSettingsSection.tsx:12](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/UsageSettingsSection.tsx#L12) |
| S86 — Providers | Mobile screen | `MS-SETTINGS-connections` | Settings stack | M8 | [ConnectionsSettingsSection.tsx:8](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/models/ConnectionsSettingsSection.tsx#L8) |
| S87 — Language models | Mobile screen | `MS-SETTINGS-llm` | Settings stack | M8 | [LlmSettingsSection.tsx:5](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/models/LlmSettingsSection.tsx#L5) |
| S88 — Task models | Mobile screen | `MS-SETTINGS-task-models` | Settings stack | M8 | [TaskModelsSettingsSection.tsx:5](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/models/TaskModelsSettingsSection.tsx#L5) |
| S89 — Embedding models | Mobile screen | `MS-SETTINGS-embedding` | Settings stack | M8 | [EmbeddingSettingsSection.tsx:5](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/models/EmbeddingSettingsSection.tsx#L5) |
| S90 — Search | Mobile screen | `MS-SETTINGS-search` | Settings stack | M8 | [SearchSettingsSection.tsx:5](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/models/SearchSettingsSection.tsx#L5) |
| S91 — Voice | Mobile screen | `MS-SETTINGS-voice` | Settings stack | M8 | [VoiceSettingsSection.tsx:6](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/models/VoiceSettingsSection.tsx#L6) |
| S92 — Multimodal generation | Mobile screen | `MS-SETTINGS-multimodal` | Settings stack | M8 | [MultimodalSettingsSection.tsx:5](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/models/MultimodalSettingsSection.tsx#L5) |
| S93 — Starting points | Mobile screen | `MS-SETTINGS-starters` | Settings stack | M8 | [StartersSettingsSection.tsx:27](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/StartersSettingsSection.tsx#L27) |
| S94 — Attachments | Mobile screen | `MS-SETTINGS-attachments` | Settings stack | M8 | [AttachmentsSettingsSection.tsx:47](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/AttachmentsSettingsSection.tsx#L47) |
| S95 — Video Learning | Mobile screen | `MS-SETTINGS-video-learning` | Settings stack | M8 | [VideoLearningSettingsSection.tsx:23](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/VideoLearningSettingsSection.tsx#L23) |
| S96 — Learner profile | Mobile screen | `MS-SETTINGS-learner-profile` | Settings stack | M8 | [LearnerProfileSettingsSection.tsx:22](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/LearnerProfileSettingsSection.tsx#L22) |
| S97 — Guardian | Mobile screen | `MS-SETTINGS-guardian` | Settings stack | M8 | [GuardianSettingsSection.tsx:44](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/GuardianSettingsSection.tsx#L44) |
| S98 — Memory settings | Mobile screen | `MS-SETTINGS-memory` | Settings stack | M8 | [MemorySettingsSection.tsx:37](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/MemorySettingsSection.tsx#L37) |
| S99 — Tools | Mobile screen | `MS-SETTINGS-tools` | Settings stack | M8 | [ToolsSettingsSection.tsx:78](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/ToolsSettingsSection.tsx#L78) |
| S100 — Capabilities | Mobile screen | `MS-SETTINGS-capabilities` | Settings stack | M8 | [CapabilitiesSettingsSection.tsx:88](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/CapabilitiesSettingsSection.tsx#L88) |
| S101 — Knowledge Base / document parsing | Mobile screen | `MS-SETTINGS-knowledge` | Settings stack | M8 | [DocumentParsingSettingsSection.tsx:66](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/DocumentParsingSettingsSection.tsx#L66) |
| S102 — Network | Mobile screen | `MS-SETTINGS-network` | Settings stack | M8 | [NetworkSettingsSection.tsx:87](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/NetworkSettingsSection.tsx#L87) |
| S103 — Runtime status | Mobile screen | `MS-SETTINGS-status` | Settings stack | M8 | [SettingsRuntimePage.tsx:10](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsRuntimePage.tsx#L10) |
| S104 — About | Mobile screen | `MS-SETTINGS-about` | Settings stack | M8 | [AboutSettingsSection.tsx:59](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/AboutSettingsSection.tsx#L59) |
| S105 — Partners & agents: claude-code | Mobile screen | `MS-SETTINGS-agent-claude-code` | Settings stack | M8 | [SubagentSettingsEditor.tsx:435](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SubagentSettingsEditor.tsx#L435) |
| S106 — Partners & agents: codex | Mobile screen | `MS-SETTINGS-agent-codex` | Settings stack | M8 | [SubagentSettingsEditor.tsx:435](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SubagentSettingsEditor.tsx#L435) |
| S107 — Partners & agents: grok | Mobile screen | `MS-SETTINGS-agent-grok` | Settings stack | M8 | [SubagentSettingsEditor.tsx:435](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SubagentSettingsEditor.tsx#L435) |
| S108 — Partners & agents: antigravity | Mobile screen | `MS-SETTINGS-agent-antigravity` | Settings stack | M8 | [SubagentSettingsEditor.tsx:435](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SubagentSettingsEditor.tsx#L435) |
| S109 — Partners & agents: kimi | Mobile screen | `MS-SETTINGS-agent-kimi` | Settings stack | M8 | [SubagentSettingsEditor.tsx:435](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SubagentSettingsEditor.tsx#L435) |
| S110 — Partners & agents: opencode | Mobile screen | `MS-SETTINGS-agent-opencode` | Settings stack | M8 | [SubagentSettingsEditor.tsx:435](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SubagentSettingsEditor.tsx#L435) |
| S111 — Partners & agents: mimo | Mobile screen | `MS-SETTINGS-agent-mimo` | Settings stack | M8 | [SubagentSettingsEditor.tsx:435](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SubagentSettingsEditor.tsx#L435) |
| S112 — Partners & agents: hermes | Mobile screen | `MS-SETTINGS-agent-hermes` | Settings stack | M8 | [SubagentSettingsEditor.tsx:435](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SubagentSettingsEditor.tsx#L435) |
| S113 — Partners & agents: hermes-remote | Mobile screen | `MS-SETTINGS-agent-hermes-remote` | Settings stack | M8 | [SubagentSettingsEditor.tsx:435](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SubagentSettingsEditor.tsx#L435) |
| S114 — Partners & agents: openclaw | Mobile screen | `MS-SETTINGS-agent-openclaw` | Settings stack | M8 | [SubagentSettingsEditor.tsx:435](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SubagentSettingsEditor.tsx#L435) |
| S115 — Partners & agents: deepseek-harness | Mobile screen | `MS-SETTINGS-agent-deepseek-harness` | Settings stack | M8 | [SubagentSettingsEditor.tsx:435](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SubagentSettingsEditor.tsx#L435) |
| S116 — Page customization | Dialog | `UI-PAGE-CUSTOMIZE` | MS-CHAT; MS-LEARNING; MS-LEARNING-CREATE | M4 | [PageCustomizeDialog.tsx:65](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/customization/PageCustomizeDialog.tsx#L65) |
| S117 — Imported-history agents | Embedded interface | `UI-IMPORTED-AGENTS` | MS-AGENTS second section | M7 | [MyAgentsSection.tsx:89](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/MyAgentsSection.tsx#L89) |
| S118 — Chat history import wizard | Dialog | `UI-HISTORY-IMPORT` | MS-AGENTS imported-history section | M7 | [ImportWizard.tsx:59](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/ImportWizard.tsx#L59) |
| S119 — Question categories and bulk organization | Bottom sheet | `UI-QUESTION-CATEGORIES` | MS-QUESTION-BANK; bulk selection toolbar | M4 | [CategoryManager.tsx:23](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/question-bank/CategoryManager.tsx#L23) |
| S120 — Edit mastery route | Dialog | `UI-MASTERY-ROUTE-EDIT` | MS-MASTERY-DETAIL | M4 | [EditTopicRouteDialog.tsx:3](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/EditTopicRouteDialog.tsx#L3) |
| S121 — Notebook flashcard review | Dialog | `UI-NOTE-REVIEW` | MS-NOTES; note review trigger | M6 | [NoteReview.tsx:17](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteReview.tsx#L17) |
| S122 — Note source and favorites selection | Bottom sheet | `UI-NOTE-INSERT-SOURCES` | MS-NOTE-EDITOR | M6 | [NoteSourcePicker.tsx:13](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteSourcePicker.tsx#L13) |
| S123 — Note review and generated suggestion margin | Embedded interface | `UI-NOTE-REVIEW-MARGIN` | MS-NOTE-EDITOR and companion | M6 | [NoteInlineReviews.tsx:22](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteInlineReviews.tsx#L22) |
| S124 — Book learning block family | Embedded interface | `UI-BOOK-BLOCKS` | MS-BOOK-READER | M5 | [BlockRenderer.tsx:85](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/%28workspace%29/learning/books/components/blocks/BlockRenderer.tsx#L85) |
| S125 — Knowledge source management | Embedded interface | `UI-KB-SOURCES` | MS-KB-DETAIL eligible sections | M7 | [KbWebSourcesSection.tsx:33](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/knowledge/KbWebSourcesSection.tsx#L33) |
| S126 — KB indexing history and diagnostics | Embedded interface | `UI-KB-DIAGNOSTICS` | MS-KB-DETAIL | M7 | [KbIndexVersionsSection.tsx:50](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/knowledge/KbIndexVersionsSection.tsx#L50) |
| S127 — Kiwix connection | Dialog | `UI-KIWIX-CONNECT` | MS-KNOWLEDGE | M7 | [ConnectKiwixModal.tsx:15](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/knowledge/ConnectKiwixModal.tsx#L15) |
| S128 — Server folder chooser | Dialog | `UI-SERVER-FOLDER` | MS-SETTINGS-workspace; linked-folder form | M8 | [ServerFolderPicker.tsx:83](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/workspaces/ServerFolderPicker.tsx#L83) |
| S129 — Workspace resource assignment | Embedded interface | `UI-WORKSPACE-BINDINGS` | MS-SETTINGS-workspace | M8 | [WorkspaceResourcePicker.tsx:3](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/workspaces/WorkspaceResourcePicker.tsx#L3) |
| S130 — Settings readiness and guided setup | Embedded interface | `UI-SETTINGS-SETUP` | Settings shell, guided tour overlay child | M8 | [SettingsReadinessPanel.tsx:119](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsReadinessPanel.tsx#L119) |
| S131 — Provider credential and test subpanels | Embedded interface | `UI-PROVIDER-SETUP` | MS-SETTINGS-connections/llm and related service editors | M8 | [AddProviderPanel.tsx:3](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/AddProviderPanel.tsx#L3) |
| S132 — Partner link and archive selection | Dialog | `UI-PARTNER-LINK-ARCHIVES` | MS-PARTNER; MS-GROUP | M6 | [PartnerLinkModal.tsx:25](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/partners/PartnerLinkModal.tsx#L25) |
| S133 — Memory processing run | Embedded interface | `UI-MEMORY-RUN` | MS-MEMORY; layer workbenches | M7 | [MemoryRunPanel.tsx:59](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/memory/MemoryRunPanel.tsx#L59) |
| S134 — Shared confirmation | Dialog | `UI-CONFIRM` | Any source destructive-action owner | M1 | [ConfirmDialog.tsx:29](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/ui/ConfirmDialog.tsx#L29) |
| S135 — Shared transient feedback | Reusable component | `UI-FEEDBACK` | Root toast + feature inline notices | M1 | [ToastViewport.tsx:18](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/common/ToastViewport.tsx#L18) |

## Grouped records and secondary interfaces

- S06: model/answer/tool choices use short sheets; Book/Reading/History/Question Bank/Memory/Favorites/agent references use a tall searchable sheet with their original single/multi-select semantics. A nested reference detail stays inside this picker; selected references retain source locators.
- S07/S08: activity stays embedded in the viewer; file preview has its own full-screen viewer. Tabs retain IDs and can reopen; a tab does not become a top-level shelf.
- S11/S13/S14/S15: capability selection/configuration, generated quiz, research outline/report, visualization/math/video results remain chat-hosted. Fullscreen result presentation reuses MS-SESSION-VIEWER. No extra Research/Solve product screens.
- S20: outline/board remains a tab switch; objective detail and session camp become host sheets. S21 Outline/Study/Review are conversation modes, not three separate learning features.
- S24/S119: Question Bank/Mistakes remain collection tabs; category chooser is a sheet, category editor is a nested dialog, bulk selection stays inline.
- S28: creator → proposal → spine are steps of MS-BOOK-CREATE. S124 block types stay embedded and share viewer/quiz primitives only where source behavior agrees.
- S34/S37: source/outline, conversation list, tutor companion and annotations open as secondary panes/sheets on phone. Link conversations, send notes, organized notes, rename/remove and Build Mastery Path retain distinct source actions and dialogs.
- S42/S125/S126: eligible KB sections remain tabs/section selector; source editing and version diagnostics are nested forms/panels. Read-only and provider eligibility determine available controls.
- S43/S44: new/link KB is a full-height dialog; engine configuration is an actual nested screen, since the source engine detail consumes a whole web panel. Creation never implies a local Android index engine.
- S45/S46/S47 versus S62/S63/S121/S122/S123: Favorites originals and editable Learning notebook remain independent records/workflows. Note flashcard review remains distinct from Practice recall.
- S49/S50/S51/S52: Markdown viewers/editors, connection forms, tag/scope management and import dialogs are host children. S117 imported-history agents remains the second My Agents section; S118 import and scope editor are separate steps/subdialogs.
- S55–S60/S133: layer selector/document editor/graph and run diagnostics retain L1 mirror, L2 summaries and L3 knowledge semantics. S61 resolves references; it is not a new memory editor.
- S64/S65: task edit/move/color/archive and calendar item/edit/recurrence/reminder/search controls are contextual sheets/dialogs; every calendar view stays available in the final roadmap.
- S68/S69/S71/S132: Partner chat/configure/channels/archives retain separate tabs/panels; channel onboarding/QR, link and archives are distinct dialogs, not a single generic connection form. Group member/mode/session controls stay contextual.
- S76: admin user detail/grants/learner/guardian/book-permission editors become nested panels; create/import/reset/delete and bulk delete retain distinct confirmations.
- S116/S130/S131: page customization is its own dialog; guided setup can use a source-equivalent tour overlay; presets/modules/readiness and provider OAuth/test/discovery stay separate embedded controls.
- S128/S129: server-folder selection is a simulated server tree, not the Android document picker. Resource binding and workspace instructions remain embedded in Workspace settings.
- S134/S135: confirmation, toast, protocol mismatch and load banners have reusable rendering but preserve the owning operation and error semantics. Compatibility resolvers S38/S61 stay nonvisual reusable logic with error fallback, not arbitrary product screens.

## Mobile screen contracts

Every contract below is implemented in the milestone shown and has per-screen acceptance in IMPLEMENTATION_PLAN. Same-target source rows do not require duplicate screen implementations. `/ui/...` paths are proposed internal presentation routes; they are not verified web URLs.

| Contract | Covered audit IDs | Proposed URL pattern | Existing mobile screen disposition |
|---|---|---|---|
| `MS-SEARCH` | S02 | `/ui/search` | New feature screen; no implemented mobile equivalent found |
| `MS-CHAT` | S04, S05 | `/chat or /chat/[sessionId]` | Future adaptation of starter src/app/index.tsx entry; retain original source during this phase |
| `MS-SESSION-VIEWER` | S07 | `/ui/session-viewer` | New feature screen; no implemented mobile equivalent found |
| `MS-FILE-PREVIEW` | S08 | `/ui/file-preview` | New feature screen; no implemented mobile equivalent found |
| `MS-HISTORY` | S09 | `/space/chat-history` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-archive` | S10 | `/settings/archive` | New feature screen; no implemented mobile equivalent found |
| `MS-LEARNING` | S16 | `/learning` | New feature screen; no implemented mobile equivalent found |
| `MS-LEARNING-CREATE` | S17 | `/learning/new` | New feature screen; no implemented mobile equivalent found |
| `MS-MASTERY-LIBRARY` | S18 | `/learning/mastery` | New feature screen; no implemented mobile equivalent found |
| `MS-MASTERY-DETAIL` | S20 | `/learning/mastery/[pathId]` | New feature screen; no implemented mobile equivalent found |
| `MS-MASTERY-STUDY` | S21, S22 | `/learning/mastery/[pathId]/sessions or /learning/mastery/[pathId]/sessions/[sessionId]` | New feature screen; no implemented mobile equivalent found |
| `MS-PRACTICE` | S23 | `/learning/practice` | New feature screen; no implemented mobile equivalent found |
| `MS-QUESTION-BANK` | S24 | `/space/questions` | New feature screen; no implemented mobile equivalent found |
| `MS-PRACTICE-SESSION` | S25 | `/learning/practice/session` | New feature screen; no implemented mobile equivalent found |
| `MS-BOOKS` | S27 | `/learning/books` | New feature screen; no implemented mobile equivalent found |
| `MS-BOOK-CREATE` | S28 | `/learning/books/create` | New feature screen; no implemented mobile equivalent found |
| `MS-BOOK-READER` | S29, S30 | `/learning/books/[bookId] or /learning/books/[bookId]/pages/[pageId]` | New feature screen; no implemented mobile equivalent found |
| `MS-READING-LIBRARY` | S31 | `/learning/reading` | New feature screen; no implemented mobile equivalent found |
| `MS-READING-MATERIALS` | S32 | `/learning/reading/materials` | New feature screen; no implemented mobile equivalent found |
| `MS-READING-FOLDER` | S33 | `/learning/reading/folders/[folderId]` | New feature screen; no implemented mobile equivalent found |
| `MS-READING` | S34, S35, S36 | `/learning/reading/[workspaceId], /learning/reading/[workspaceId]/sessions or /learning/reading/[workspaceId]/sessions/[sessionId]` | New feature screen; no implemented mobile equivalent found |
| `MS-RESOURCES` | S39 | `/space` | New feature screen; no implemented mobile equivalent found |
| `MS-PERSONALIZATION` | S40 | `/personalization` | New feature screen; no implemented mobile equivalent found |
| `MS-KNOWLEDGE` | S41 | `/knowledge-bases` | New feature screen; no implemented mobile equivalent found |
| `MS-KB-DETAIL` | S42 | `/knowledge-bases/[kbName]` | New feature screen; no implemented mobile equivalent found |
| `MS-ENGINE-DETAIL` | S44 | `/knowledge-engines/[engineId]` | New feature screen; no implemented mobile equivalent found |
| `MS-FAVORITES` | S45 | `/notebooks` | New feature screen; no implemented mobile equivalent found |
| `MS-FAVORITES-DETAIL` | S46 | `/notebooks/[notebookId]` | New feature screen; no implemented mobile equivalent found |
| `MS-JOURNAL` | S48 | `/space/journal` | New feature screen; no implemented mobile equivalent found |
| `MS-SKILLS` | S49 | `/space/skills` | New feature screen; no implemented mobile equivalent found |
| `MS-PERSONAS` | S50 | `/space/personas` | New feature screen; no implemented mobile equivalent found |
| `MS-AGENTS` | S51 | `/agents` | New feature screen; no implemented mobile equivalent found |
| `MS-MCP` | S52 | `/space/mcp` | New feature screen; no implemented mobile equivalent found |
| `MS-CLI` | S53 | `/space/cli-apps` | New feature screen; no implemented mobile equivalent found |
| `MS-MEMORY` | S54 | `/memory` | New feature screen; no implemented mobile equivalent found |
| `MS-MEMORY-L1` | S55 | `/memory/l1` | New feature screen; no implemented mobile equivalent found |
| `MS-MEMORY-L2` | S56, S57 | `/memory/l2 or /memory/l2/[surface]` | New feature screen; no implemented mobile equivalent found |
| `MS-MEMORY-L3` | S58, S59 | `/memory/l3 or /memory/l3/[slot]` | New feature screen; no implemented mobile equivalent found |
| `MS-MEMORY-GRAPH` | S60 | `/memory/graph` | New feature screen; no implemented mobile equivalent found |
| `MS-NOTES` | S62 | `/co-writer` | New feature screen; no implemented mobile equivalent found |
| `MS-NOTE-EDITOR` | S63 | `/co-writer/[docId]` | New feature screen; no implemented mobile equivalent found |
| `MS-TASKS` | S64 | `/kanban` | New feature screen; no implemented mobile equivalent found |
| `MS-CALENDAR` | S65 | `/calendar` | New feature screen; no implemented mobile equivalent found |
| `MS-PARTNERS` | S66 | `/partners` | New feature screen; no implemented mobile equivalent found |
| `MS-PARTNER-CREATE` | S67 | `/partners/new` | New feature screen; no implemented mobile equivalent found |
| `MS-PARTNER` | S68 | `/partners/[partnerId]` | New feature screen; no implemented mobile equivalent found |
| `MS-GROUP-CREATE` | S70 | `/partners/groups/new` | New feature screen; no implemented mobile equivalent found |
| `MS-GROUP` | S71 | `/partners/groups/[groupId]` | New feature screen; no implemented mobile equivalent found |
| `MS-WHISPER` | S72 | `/whisper` | New feature screen; no implemented mobile equivalent found |
| `MS-LOGIN` | S73 | `/login` | New feature screen; no implemented mobile equivalent found |
| `MS-REGISTER` | S74 | `/register` | New feature screen; no implemented mobile equivalent found |
| `MS-PROFILE` | S75 | `/profile` | New feature screen; no implemented mobile equivalent found |
| `MS-ADMIN-USERS` | S76 | `/admin/users` | New feature screen; no implemented mobile equivalent found |
| `MS-HANDOFF-CREATE` | S77 | `/session-handoff` | New feature screen; no implemented mobile equivalent found |
| `MS-HANDOFF-REDEEM` | S78 | `/handoff` | New feature screen; no implemented mobile equivalent found |
| `MS-PROGRESS` | S79 | `/settings/progress` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-general` | S81 | `/settings/general` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-appearance` | S82 | `/settings/appearance` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-workspace` | S83 | `/settings/workspace` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-data-migration` | S84 | `/settings/data-migration` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-usage` | S85 | `/settings/usage` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-connections` | S86 | `/settings/connections` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-llm` | S87 | `/settings/llm` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-task-models` | S88 | `/settings/task-models` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-embedding` | S89 | `/settings/embedding` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-search` | S90 | `/settings/search` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-voice` | S91 | `/settings/voice` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-multimodal` | S92 | `/settings/multimodal` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-starters` | S93 | `/settings/starters` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-attachments` | S94 | `/settings/attachments` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-video-learning` | S95 | `/settings/video-learning` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-learner-profile` | S96 | `/settings/learner-profile` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-guardian` | S97 | `/settings/guardian` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-memory` | S98 | `/settings/memory` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-tools` | S99 | `/settings/tools` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-capabilities` | S100 | `/settings/capabilities` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-knowledge` | S101 | `/settings/knowledge` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-network` | S102 | `/settings/network` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-status` | S103 | `/settings/status` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-about` | S104 | `/settings/about` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-agent-claude-code` | S105 | `/settings/agent-claude-code` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-agent-codex` | S106 | `/settings/agent-codex` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-agent-grok` | S107 | `/settings/agent-grok` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-agent-antigravity` | S108 | `/settings/agent-antigravity` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-agent-kimi` | S109 | `/settings/agent-kimi` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-agent-opencode` | S110 | `/settings/agent-opencode` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-agent-mimo` | S111 | `/settings/agent-mimo` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-agent-hermes` | S112 | `/settings/agent-hermes` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-agent-hermes-remote` | S113 | `/settings/agent-hermes-remote` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-agent-openclaw` | S114 | `/settings/agent-openclaw` | New feature screen; no implemented mobile equivalent found |
| `MS-SETTINGS-agent-deepseek-harness` | S115 | `/settings/agent-deepseek-harness` | New feature screen; no implemented mobile equivalent found |
