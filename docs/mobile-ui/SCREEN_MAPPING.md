# Screen mapping

## Study Session update · 2026-11-09

Existing Study Session routes still resolve to `LiveStudyScreen`. One contextual action row belongs to the latest study explanation, never Mastery Path. Resources and More actions are bottom sheets, not new screens. See [implementation, contracts and verification](../STUDY_SESSION_UPDATE.md).


Learning supersession (2026-11-09): see the [live Learning implementation and verification](../LEARNING_IMPLEMENTATION_STATUS.md) for current routes, API integration, screen statuses, and remaining gaps. The earlier UI-only scope below is retained as historical evidence.

Revision: 2026-11-05. **Focused mobile companion; UI-only.** This revision supersedes the full-port roadmap. Source baseline: DeepTutor v1.7.1, `f7aed0744c36c5afef16a4261c31ebee1208cac2`.

[Original inventory](audit/screen-inventory.md), [63 page files](audit/route-map.md), [197 captures](audit/screenshot-catalog.md), [design evidence](audit/design-system.md), and [audit limitations](audit/validation.md) are preserved. Previous planning documents are archived in [planning history](planning-history/full-port-baseline/README.md).

VERIFIED means source-confirmed behavior or the actual visible capture state, not successful backend operation. Most captures show shell/Retry, including Task Board CAP-134 inspected in this revision; populated interiors remain visually UNVERIFIED. All mobile layouts, routes added for presentation, and fixture outcomes below are PROPOSED. No new UI or backend integration is implemented by this revision.

## Counting and classification

An audited surface can be a screen, alias, sheet, embedded component or adapter. Counts of S IDs are not counts of independent mobile screens. Each S01–S135 has exactly one classification. Stable MS/UI/ADAPTER IDs are preserved; excluded IDs are reserved historical identifiers with no scheduled implementation. See the product scope for distinct destination totals.

## Complete 135-surface scope ledger

| Audit surface | Classification | Stable target | Presentation | Owner / entry | Milestone | Scope boundary |
|---|---|---|---|---|---|---|
| S01 — Application shell / navigation | SUPPORTING | `UI-SHELL` | Reusable component | Root / selected-feature owner | M1 | Shared navigation, compatibility or feedback supporting selected workflows. |
| S02 — Command palette / search | SUPPORTING | `MS-SEARCH` | Mobile screen | Root / selected-feature owner | M2 | Shared navigation, compatibility or feedback supporting selected workflows. |
| S03 — Workspace and account menus | SUPPORTING | `UI-ACCOUNT-WORKSPACE` | Bottom sheet | Root / selected-feature owner | M2 | Shared navigation, compatibility or feedback supporting selected workflows. |
| S04 — Home / Chat | IN SCOPE | `MS-CHAT` | Mobile screen | Chat stack / result owner | M3 | Selected learner workflow; preserve source-supported behavior. |
| S05 — Conversation | IN SCOPE | `MS-CHAT` | Mobile screen | Chat stack / result owner | M3 | Selected learner workflow; preserve source-supported behavior. |
| S06 — Composer controls and reference selection | IN SCOPE | `UI-COMPOSER-PICKERS` | Bottom sheet | Chat stack / result owner | M3 | Selected chat controls/results only; no partner/agent administration, provider setup or separate capability application. |
| S07 — Session viewer / activity workspace | IN SCOPE | `MS-SESSION-VIEWER` | Mobile screen | Chat stack / result owner | M3 | Selected chat controls/results only; no partner/agent administration, provider setup or separate capability application. |
| S08 — File preview | IN SCOPE | `MS-FILE-PREVIEW` | Mobile screen | Chat stack / result owner | M3 | Selected learner workflow; preserve source-supported behavior. |
| S09 — Conversation organization / history | IN SCOPE | `MS-HISTORY` | Mobile screen | Chat stack / History | M3 | Selected learner workflow; preserve source-supported behavior. |
| S10 — Archived chats | IN SCOPE | `MS-SETTINGS-archive` | Mobile screen | Chat stack / History | M3 | Selected learner workflow; preserve source-supported behavior. |
| S11 — Chat capabilities | IN SCOPE | `UI-CAPABILITIES` | Embedded interface | Chat stack / result owner | M3 | Selected chat controls/results only; no partner/agent administration, provider setup or separate capability application. |
| S12 — Ask Questions / structured question | IN SCOPE | `UI-STRUCTURED-REPLY` | Embedded interface | Chat stack / result owner | M3 | Selected learner workflow; preserve source-supported behavior. |
| S13 — Quiz result and follow-up | IN SCOPE | `UI-QUIZ` | Embedded interface | Chat stack / result owner | M3 | Selected learner workflow; preserve source-supported behavior. |
| S14 — Research outline and report | IN SCOPE | `UI-RESEARCH` | Embedded interface | Chat stack / result owner | M3 | Selected chat controls/results only; no partner/agent administration, provider setup or separate capability application. |
| S15 — Visualize / math animation / Video Lesson output | IN SCOPE | `UI-VISUAL-RESULT` | Embedded interface | Chat stack / result owner | M5 | Selected chat controls/results only; no partner/agent administration, provider setup or separate capability application. |
| S16 — Personalized Learning / Learning | IN SCOPE | `MS-LEARNING` | Mobile screen | Learning stack | M4 | Selected learner workflow; preserve source-supported behavior. |
| S17 — Create learning | IN SCOPE | `MS-LEARNING-CREATE` | Mobile screen | Learning stack | M4 | Selected learner workflow; preserve source-supported behavior. |
| S18 — Mastery Path atlas | IN SCOPE | `MS-MASTERY-LIBRARY` | Mobile screen | Learning stack | M4 | Selected learner workflow; preserve source-supported behavior. |
| S19 — Create mastery goal | IN SCOPE | `UI-MASTERY-CREATE` | Dialog | Learning stack | M4 | Selected learner workflow; preserve source-supported behavior. |
| S20 — Mastery Path detail | IN SCOPE | `MS-MASTERY-DETAIL` | Mobile screen | Learning stack | M4 | Selected learner workflow; preserve source-supported behavior. |
| S21 — Mastery study conversation | IN SCOPE | `MS-MASTERY-STUDY` | Mobile screen | Learning stack | M4 | Selected learner workflow; preserve source-supported behavior. |
| S22 — Persisted mastery study session | IN SCOPE | `MS-MASTERY-STUDY` | Mobile screen | Learning stack | M4 | Selected learner workflow; preserve source-supported behavior. |
| S23 — Practice / daily review | IN SCOPE | `MS-PRACTICE` | Mobile screen | Learning stack | M4 | Selected learner workflow; preserve source-supported behavior. |
| S24 — Question Bank / Mistakes | IN SCOPE | `MS-QUESTION-BANK` | Mobile screen | Learning stack | M4 | Selected learner workflow; preserve source-supported behavior. |
| S25 — Practice question session | IN SCOPE | `MS-PRACTICE-SESSION` | Mobile screen | Learning stack | M4 | Selected learner workflow; preserve source-supported behavior. |
| S26 — Import practice questions | IN SCOPE | `UI-PRACTICE-IMPORT` | Dialog | Learning stack | M4 | Selected learner workflow; preserve source-supported behavior. |
| S27 — Books library | IN SCOPE | `MS-BOOKS` | Mobile screen | Learning stack | M5 | Selected learner workflow; preserve source-supported behavior. |
| S28 — Create book / chapter spine | IN SCOPE | `MS-BOOK-CREATE` | Mobile screen | Learning stack | M5 | Selected learner workflow; preserve source-supported behavior. |
| S29 — Book / page reader | IN SCOPE | `MS-BOOK-READER` | Mobile screen | Learning stack | M5 | Selected learner workflow; preserve source-supported behavior. |
| S30 — Book page deep link | IN SCOPE | `MS-BOOK-READER` | Mobile screen | Learning stack | M5 | Selected learner workflow; preserve source-supported behavior. |
| S31 — Immersive Reading library | IN SCOPE | `MS-READING-LIBRARY` | Mobile screen | Learning stack | M5 | Selected learner workflow; preserve source-supported behavior. |
| S32 — All reading materials | IN SCOPE | `MS-READING-MATERIALS` | Mobile screen | Learning stack | M5 | Selected learner workflow; preserve source-supported behavior. |
| S33 — Reading collection folder | IN SCOPE | `MS-READING-FOLDER` | Mobile screen | Learning stack | M5 | Selected learner workflow; preserve source-supported behavior. |
| S34 — Immersive Reading workspace | IN SCOPE | `MS-READING` | Mobile screen | Learning stack | M5 | Selected learner workflow; preserve source-supported behavior. |
| S35 — Reading session URL variants | IN SCOPE | `MS-READING` | Mobile screen | Learning stack | M5 | Selected learner workflow; preserve source-supported behavior. |
| S36 — Persisted reading conversation | IN SCOPE | `MS-READING` | Mobile screen | Learning stack | M5 | Selected learner workflow; preserve source-supported behavior. |
| S37 — Reading annotation and display tools | IN SCOPE | `UI-READING-ACTIONS` | Bottom sheet | Learning stack | M5 | Selected learner workflow; preserve source-supported behavior. |
| S38 — Legacy watching session | SUPPORTING | `ADAPTER-LEGACY-WATCH` | Reusable component | Learning stack | M5 | Shared navigation, compatibility or feedback supporting selected workflows. |
| S39 — Resources / Learning Space | SUPPORTING | `MS-RESOURCES` | Mobile screen | Retained optional/development entry; outside primary navigation | M2 | Preserve completed M2 overview; optional legacy/support route, not a mandate to build its destinations. |
| S40 — Personalization | SUPPORTING | `MS-PERSONALIZATION` | Mobile screen | Retained optional/development entry; outside primary navigation | M2 | Preserve completed M2 overview; optional legacy/support route, not a mandate to build its destinations. |
| S41 — Knowledge Center | OUT OF SCOPE | `MS-KNOWLEDGE` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S42 — Knowledge base details | OUT OF SCOPE | `MS-KB-DETAIL` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S43 — Create / link knowledge base | OUT OF SCOPE | `UI-KB-CREATE` | Dialog | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S44 — Knowledge engine configuration | OUT OF SCOPE | `MS-ENGINE-DETAIL` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S45 — Favorites collections | IN SCOPE | `MS-FAVORITES` | Mobile screen | Notebook stack; Save original also hosted by Chat/Learning | M3 | Saved originals support chat/learning capture and Notebook; not editable note pages. |
| S46 — Favorites collection detail | IN SCOPE | `MS-FAVORITES-DETAIL` | Mobile screen | Notebook stack; Save original also hosted by Chat/Learning | M3 | Saved originals support chat/learning capture and Notebook; not editable note pages. |
| S47 — Save to Favorites / Notebook | IN SCOPE | `UI-FAVORITES-SAVE` | Dialog | Notebook stack; Save original also hosted by Chat/Learning | M3 | Saved originals support chat/learning capture and Notebook; not editable note pages. |
| S48 — Learning journal | IN SCOPE | `MS-JOURNAL` | Mobile screen | Learning stack | M4 | Selected learner workflow; preserve source-supported behavior. |
| S49 — Skills | OUT OF SCOPE | `MS-SKILLS` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S50 — Personas | OUT OF SCOPE | `MS-PERSONAS` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S51 — My Agents | OUT OF SCOPE | `MS-AGENTS` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S52 — MCP Services | OUT OF SCOPE | `MS-MCP` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S53 — CLI Apps | OUT OF SCOPE | `MS-CLI` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S54 — Memory hub | OUT OF SCOPE | `MS-MEMORY` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S55 — L1 workspace mirror | OUT OF SCOPE | `MS-MEMORY-L1` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S56 — L2 summaries | OUT OF SCOPE | `MS-MEMORY-L2` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S57 — L2 focused surface | OUT OF SCOPE | `MS-MEMORY-L2` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S58 — L3 cross-surface knowledge | OUT OF SCOPE | `MS-MEMORY-L3` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S59 — L3 focused slot | OUT OF SCOPE | `MS-MEMORY-L3` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S60 — Memory graph | OUT OF SCOPE | `MS-MEMORY-GRAPH` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S61 — Memory reference resolver | OUT OF SCOPE | `ADAPTER-MEMORY-RESOLVE` | Reusable component | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S62 — Learning notebook / Co-Writer library | IN SCOPE | `MS-NOTES` | Mobile screen | Notebook stack; Save original also hosted by Chat/Learning | M7 | Selected learner workflow; preserve source-supported behavior. |
| S63 — Learning notebook editor | IN SCOPE | `MS-NOTE-EDITOR` | Mobile screen | Notebook stack; Save original also hosted by Chat/Learning | M7 | Selected learner workflow; preserve source-supported behavior. |
| S64 — Task Board | IN SCOPE | `MS-TASKS` | Mobile screen | Task Board stack | M6 | Source task board only; no calendar or permanent task deletion. |
| S65 — Calendar | OUT OF SCOPE | `MS-CALENDAR` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S66 — Partners directory | OUT OF SCOPE | `MS-PARTNERS` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S67 — Create partner | OUT OF SCOPE | `MS-PARTNER-CREATE` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S68 — Partner detail / chat | OUT OF SCOPE | `MS-PARTNER` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S69 — Partner channel onboarding | OUT OF SCOPE | `UI-PARTNER-CHANNELS` | Embedded interface | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S70 — Create partner group | OUT OF SCOPE | `MS-GROUP-CREATE` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S71 — Partner group discussion | OUT OF SCOPE | `MS-GROUP` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S72 — Whisper practice room | OUT OF SCOPE | `MS-WHISPER` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S73 — Login | IN SCOPE | `MS-LOGIN` | Mobile screen | Entry stack | M2 | Essential UI retained from M2; M8 integrates focused entry/settings. |
| S74 — Registration | IN SCOPE | `MS-REGISTER` | Mobile screen | Entry stack | M2 | Essential UI retained from M2; M8 integrates focused entry/settings. |
| S75 — Profile | IN SCOPE | `MS-PROFILE` | Mobile screen | Account and basic settings | M2 | Essential UI retained from M2; M8 integrates focused entry/settings. |
| S76 — User administration | OUT OF SCOPE | `MS-ADMIN-USERS` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S77 — Session handoff link creation | OUT OF SCOPE | `MS-HANDOFF-CREATE` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S78 — Session handoff redemption | OUT OF SCOPE | `MS-HANDOFF-REDEEM` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S79 — Learning progress | IN SCOPE | `MS-PROGRESS` | Mobile screen | Learning stack | M4 | Selected learner workflow; preserve source-supported behavior. |
| S80 — Avatar preview developer surface | SUPPORTING | `UI-AVATAR-GALLERY` | Reusable component | Retained optional/development entry; outside primary navigation | M1 | Preserve completed developer gallery; no learner entry. |
| S81 — General | IN SCOPE | `MS-SETTINGS-general` | Mobile screen | Account and basic settings | M2 | Essential UI retained from M2; M8 integrates focused entry/settings. |
| S82 — Appearance | IN SCOPE | `MS-SETTINGS-appearance` | Mobile screen | Account and basic settings | M2 | Essential UI retained from M2; M8 integrates focused entry/settings. |
| S83 — Workspace | OUT OF SCOPE | `MS-SETTINGS-workspace` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S84 — Data migration | OUT OF SCOPE | `MS-SETTINGS-data-migration` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S85 — Usage statistics | OUT OF SCOPE | `MS-SETTINGS-usage` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S86 — Providers | OUT OF SCOPE | `MS-SETTINGS-connections` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S87 — Language models | OUT OF SCOPE | `MS-SETTINGS-llm` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S88 — Task models | OUT OF SCOPE | `MS-SETTINGS-task-models` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S89 — Embedding models | OUT OF SCOPE | `MS-SETTINGS-embedding` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S90 — Search | OUT OF SCOPE | `MS-SETTINGS-search` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S91 — Voice | OUT OF SCOPE | `MS-SETTINGS-voice` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S92 — Multimodal generation | OUT OF SCOPE | `MS-SETTINGS-multimodal` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S93 — Starting points | OUT OF SCOPE | `MS-SETTINGS-starters` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S94 — Attachments | OUT OF SCOPE | `MS-SETTINGS-attachments` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S95 — Video Learning | OUT OF SCOPE | `MS-SETTINGS-video-learning` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S96 — Learner profile | OUT OF SCOPE | `MS-SETTINGS-learner-profile` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S97 — Guardian | OUT OF SCOPE | `MS-SETTINGS-guardian` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S98 — Memory settings | OUT OF SCOPE | `MS-SETTINGS-memory` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S99 — Tools | OUT OF SCOPE | `MS-SETTINGS-tools` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S100 — Capabilities | OUT OF SCOPE | `MS-SETTINGS-capabilities` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S101 — Knowledge Base / document parsing | OUT OF SCOPE | `MS-SETTINGS-knowledge` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S102 — Network | OUT OF SCOPE | `MS-SETTINGS-network` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S103 — Runtime status | OUT OF SCOPE | `MS-SETTINGS-status` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S104 — About | OUT OF SCOPE | `MS-SETTINGS-about` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S105 — Partners & agents: claude-code | OUT OF SCOPE | `MS-SETTINGS-agent-claude-code` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S106 — Partners & agents: codex | OUT OF SCOPE | `MS-SETTINGS-agent-codex` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S107 — Partners & agents: grok | OUT OF SCOPE | `MS-SETTINGS-agent-grok` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S108 — Partners & agents: antigravity | OUT OF SCOPE | `MS-SETTINGS-agent-antigravity` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S109 — Partners & agents: kimi | OUT OF SCOPE | `MS-SETTINGS-agent-kimi` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S110 — Partners & agents: opencode | OUT OF SCOPE | `MS-SETTINGS-agent-opencode` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S111 — Partners & agents: mimo | OUT OF SCOPE | `MS-SETTINGS-agent-mimo` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S112 — Partners & agents: hermes | OUT OF SCOPE | `MS-SETTINGS-agent-hermes` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S113 — Partners & agents: hermes-remote | OUT OF SCOPE | `MS-SETTINGS-agent-hermes-remote` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S114 — Partners & agents: openclaw | OUT OF SCOPE | `MS-SETTINGS-agent-openclaw` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S115 — Partners & agents: deepseek-harness | OUT OF SCOPE | `MS-SETTINGS-agent-deepseek-harness` | Mobile screen | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S116 — Page customization | IN SCOPE | `UI-PAGE-CUSTOMIZE` | Dialog | Learning stack | M4 | Selected learner workflow; preserve source-supported behavior. |
| S117 — Imported-history agents | OUT OF SCOPE | `UI-IMPORTED-AGENTS` | Embedded interface | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S118 — Chat history import wizard | OUT OF SCOPE | `UI-HISTORY-IMPORT` | Dialog | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S119 — Question categories and bulk organization | IN SCOPE | `UI-QUESTION-CATEGORIES` | Bottom sheet | Learning stack | M4 | Selected learner workflow; preserve source-supported behavior. |
| S120 — Edit mastery route | IN SCOPE | `UI-MASTERY-ROUTE-EDIT` | Dialog | Learning stack | M4 | Selected learner workflow; preserve source-supported behavior. |
| S121 — Notebook flashcard review | IN SCOPE | `UI-NOTE-REVIEW` | Dialog | Notebook stack; Save original also hosted by Chat/Learning | M7 | Selected learner workflow; preserve source-supported behavior. |
| S122 — Note source and favorites selection | IN SCOPE | `UI-NOTE-INSERT-SOURCES` | Bottom sheet | Notebook stack; Save original also hosted by Chat/Learning | M7 | Selected learner workflow; preserve source-supported behavior. |
| S123 — Note review and generated suggestion margin | IN SCOPE | `UI-NOTE-REVIEW-MARGIN` | Embedded interface | Notebook stack; Save original also hosted by Chat/Learning | M7 | Selected learner workflow; preserve source-supported behavior. |
| S124 — Book learning block family | IN SCOPE | `UI-BOOK-BLOCKS` | Embedded interface | Learning stack | M5 | Selected learner workflow; preserve source-supported behavior. |
| S125 — Knowledge source management | OUT OF SCOPE | `UI-KB-SOURCES` | Embedded interface | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S126 — KB indexing history and diagnostics | OUT OF SCOPE | `UI-KB-DIAGNOSTICS` | Embedded interface | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S127 — Kiwix connection | OUT OF SCOPE | `UI-KIWIX-CONNECT` | Dialog | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S128 — Server folder chooser | OUT OF SCOPE | `UI-SERVER-FOLDER` | Dialog | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S129 — Workspace resource assignment | OUT OF SCOPE | `UI-WORKSPACE-BINDINGS` | Embedded interface | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S130 — Settings readiness and guided setup | OUT OF SCOPE | `UI-SETTINGS-SETUP` | Embedded interface | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S131 — Provider credential and test subpanels | OUT OF SCOPE | `UI-PROVIDER-SETUP` | Embedded interface | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S132 — Partner link and archive selection | OUT OF SCOPE | `UI-PARTNER-LINK-ARCHIVES` | Dialog | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S133 — Memory processing run | OUT OF SCOPE | `UI-MEMORY-RUN` | Embedded interface | Web only; no mobile implementation scheduled | — | Not selected for the mobile companion; remains in the web application. |
| S134 — Shared confirmation | SUPPORTING | `UI-CONFIRM` | Dialog | Root / selected-feature owner | M1 | Shared navigation, compatibility or feedback supporting selected workflows. |
| S135 — Shared transient feedback | SUPPORTING | `UI-FEEDBACK` | Reusable component | Root / selected-feature owner | M1 | Shared navigation, compatibility or feedback supporting selected workflows. |

## Selected and supporting mobile destination registry

| Stable screen ID | Audit IDs | Mobile path(s), proposed unless already implemented | Status / next ownership |
|---|---|---|---|
| `MS-SEARCH` | S02 | `/ui/search` | Retained M1–M2 implementation; M8 integration |
| `MS-CHAT` | S04, S05 | `/chat or /chat/[sessionId]` | Planned M3 |
| `MS-SESSION-VIEWER` | S07 | `/ui/session-viewer` | Planned M3 |
| `MS-FILE-PREVIEW` | S08 | `/ui/file-preview` | Planned M3 |
| `MS-HISTORY` | S09 | `/space/chat-history` | Planned M3 |
| `MS-SETTINGS-archive` | S10 | `/settings/archive` | Planned M3 |
| `MS-LEARNING` | S16 | `/learning` | Planned M4 |
| `MS-LEARNING-CREATE` | S17 | `/learning/new` | Planned M4 |
| `MS-MASTERY-LIBRARY` | S18 | `/learning/mastery` | Planned M4 |
| `MS-MASTERY-DETAIL` | S20 | `/learning/mastery/[pathId]` | Planned M4 |
| `MS-MASTERY-STUDY` | S21, S22 | `/learning/mastery/[pathId]/sessions or /learning/mastery/[pathId]/sessions/[sessionId]` | Planned M4 |
| `MS-PRACTICE` | S23 | `/learning/practice` | Planned M4 |
| `MS-QUESTION-BANK` | S24 | `/space/questions` | Planned M4 |
| `MS-PRACTICE-SESSION` | S25 | `/learning/practice/session` | Planned M4 |
| `MS-BOOKS` | S27 | `/learning/books` | Planned M5 |
| `MS-BOOK-CREATE` | S28 | `/learning/books/create` | Planned M5 |
| `MS-BOOK-READER` | S29, S30 | `/learning/books/[bookId] or /learning/books/[bookId]/pages/[pageId]` | Planned M5 |
| `MS-READING-LIBRARY` | S31 | `/learning/reading` | Planned M5 |
| `MS-READING-MATERIALS` | S32 | `/learning/reading/materials` | Planned M5 |
| `MS-READING-FOLDER` | S33 | `/learning/reading/folders/[folderId]` | Planned M5 |
| `MS-READING` | S34, S35, S36 | `/learning/reading/[workspaceId], /learning/reading/[workspaceId]/sessions or /learning/reading/[workspaceId]/sessions/[sessionId]` | Planned M5 |
| `MS-RESOURCES` | S39 | `/space` | Retained M1–M2 implementation; M8 integration |
| `MS-PERSONALIZATION` | S40 | `/personalization` | Retained M1–M2 implementation; M8 integration |
| `MS-FAVORITES` | S45 | `/notebooks` | Planned M3 |
| `MS-FAVORITES-DETAIL` | S46 | `/notebooks/[notebookId]` | Planned M3 |
| `MS-JOURNAL` | S48 | `/space/journal` | Planned M4 |
| `MS-NOTES` | S62 | `/co-writer` | Planned M7 |
| `MS-NOTE-EDITOR` | S63 | `/co-writer/[docId]` | Planned M7 |
| `MS-TASKS` | S64 | `/kanban` | Planned M6 |
| `MS-LOGIN` | S73 | `/login` | Retained M1–M2 implementation; M8 integration |
| `MS-REGISTER` | S74 | `/register` | Retained M1–M2 implementation; M8 integration |
| `MS-PROFILE` | S75 | `/profile` | Retained M1–M2 implementation; M8 integration |
| `MS-PROGRESS` | S79 | `/settings/progress` | Planned M4 |
| `MS-SETTINGS-general` | S81 | `/settings/general` | Retained M1–M2 implementation; M8 integration |
| `MS-SETTINGS-appearance` | S82 | `/settings/appearance` | Retained M1–M2 implementation; M8 integration |
| `MS-SERVER-CONNECTION` | MOBILE-01; no audited equivalent | `/connect` | Planned M8; user-required mobile adaptation of deployment origin, not provider configuration |

`UI-TASK-DETAIL` is an S64 child sheet, not a new audited surface or route. `UI-LANGUAGE` is the S81 language selector, not a new standalone screen. `UI-NOTE-DETAIL` is not needed: MS-NOTE-EDITOR owns detail/read/edit states. `/settings/archive` is entered from History despite retaining its stable ID/path.

## Selected source, states, overlays and adaptation

The following records carry the original verified route/component/action/state evidence forward. Source actions are constrained by the scope notes: selection of existing chat resources never authorizes their administration. Runtime-only states without source evidence are explicitly fixture proposals. The product-scope acceptance table and navigation document define transitions and phone presentation.

### S01 — Application shell / navigation

**Target / milestone:** `UI-SHELL` / M1. **Classification:** SUPPORTING.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Application frame; workspace shelves Home, Learning, Resources; account shelves Partners and Personalization; page bar and breadcrumbs
- **User actions:** Navigate; change shelf; new conversation; collapse/resize sidebar; customize navigation
- **Modals / dialogs / drawers / sheets:** Mobile sidebar drawer; command palette; account menu
- **Loading state:** VERIFIED — shell Suspense busy fallback
- **Empty state:** Not applicable — shell surrounds content
- **Error state:** UNVERIFIED — child/runtime gates own errors
- **Success / completed state:** VERIFIED — selected destination and active shelf
- **Source components:** [`web/components/layout/AppShell.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/layout/AppShell.tsx), [`web/components/sidebar/SidebarShell.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/sidebar/SidebarShell.tsx), [`web/components/sidebar/WorkspaceSidebar.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/sidebar/WorkspaceSidebar.tsx), [`web/components/sidebar/UtilitySidebar.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/sidebar/UtilitySidebar.tsx), [`web/components/sidebar/page-sections.ts`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/sidebar/page-sections.ts)
- **Captures / limitation:** [CAP-033](audit/screenshots/snow-1440-033--chat.png), [CAP-131](audit/screenshots/dark-412-033--chat.png); host state only unless actual form captured
- **Mobile adaptation:** Root / selected-feature owner; Shared navigation, compatibility or feedback supporting selected workflows. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ui-shell) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S02 — Command palette / search

**Target / milestone:** `MS-SEARCH` / M2. **Classification:** SUPPORTING.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Search pages, sessions, learning records, partners and groups
- **User actions:** Type query; select result; new chat; navigate
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** Not applicable — modal opens from shell
- **Empty state:** VERIFIED — query filtering; exact no-result appearance needs runtime
- **Error state:** UNVERIFIED — not a universal backend search/error screen
- **Success / completed state:** VERIFIED — chosen action navigates
- **Source components:** [`web/components/sidebar/CommandPalette.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/sidebar/CommandPalette.tsx)
- **Captures / limitation:** [CAP-033](audit/screenshots/snow-1440-033--chat.png), [CAP-131](audit/screenshots/dark-412-033--chat.png); host state only unless actual form captured
- **Mobile adaptation:** Root / selected-feature owner; Shared navigation, compatibility or feedback supporting selected workflows. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-search) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S03 — Workspace and account menus

**Target / milestone:** `UI-ACCOUNT-WORKSPACE` / M2. **Classification:** SUPPORTING.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Account utilities; workspace selection; scoped destinations
- **User actions:** Switch workspace; profile/settings/admin/logout where exposed
- **Modals / dialogs / drawers / sheets:** Workspace picker and menu
- **Loading state:** VERIFIED — workspace choice fetch states in owner
- **Empty state:** UNVERIFIED — depends on available workspace list
- **Error state:** UNVERIFIED — runtime-dependent authentication and switch failure
- **Success / completed state:** VERIFIED — workspace switch returns detail routes to their owning index
- **Source components:** [`web/components/sidebar/WorkspaceMenu.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/sidebar/WorkspaceMenu.tsx), [`web/components/workspaces/WorkspacePill.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/workspaces/WorkspacePill.tsx), [`web/components/workspaces/WorkspaceNavigation.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/workspaces/WorkspaceNavigation.tsx), [`web/components/sidebar/page-sections.ts`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/sidebar/page-sections.ts)
- **Captures / limitation:** [CAP-033](audit/screenshots/snow-1440-033--chat.png), [CAP-131](audit/screenshots/dark-412-033--chat.png); host state only unless actual form captured
- **Mobile adaptation:** Root / selected-feature owner; Shared navigation, compatibility or feedback supporting selected workflows. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ui-account-workspace) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S04 — Home / Chat

**Target / milestone:** `MS-CHAT` / M3. **Classification:** IN SCOPE.

- **Web route:** /chat
- **Visible sections:** New conversation; greeting; starter suggestions; composer; resource and answer controls
- **User actions:** Compose; attach; select model/capability/tools/resources; record voice; send
- **Modals / dialogs / drawers / sheets:** Composer tray; model selector; reference pickers; capability config cards
- **Loading state:** VERIFIED — model/resource probes and session loading
- **Empty state:** VERIFIED — greeting and starters before messages
- **Error state:** VERIFIED — attachment errors and resource/session load failure handling
- **Success / completed state:** VERIFIED — first successful send binds a session route
- **Source components:** [`web/app/(workspace)/chat/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/chat/page.tsx), [`web/features/chat/components/ChatWorkspace.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/chat/components/ChatWorkspace.tsx), [`web/components/chat/home/StarterSuggestions.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/StarterSuggestions.tsx), [`web/components/chat/home/ChatComposer.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/ChatComposer.tsx)
- **Captures / limitation:** [CAP-032](audit/screenshots/snow-1440-032--chat-audit-missing-record.png), [CAP-130](audit/screenshots/dark-412-032--chat-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Chat stack / result owner; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-chat) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S05 — Conversation

**Target / milestone:** `MS-CHAT` / M3. **Classification:** IN SCOPE.

- **Web route:** /chat/[sessionId]
- **Visible sections:** Persisted message stream; editable title; user messages; response activity; output previews; usage
- **User actions:** Send/stop; retry; edit/discard message where allowed; copy; read aloud; rename/export/save/archive/delete via source menus
- **Modals / dialogs / drawers / sheets:** Save to Favorites; viewer panel; session actions; delete/discard confirmation
- **Loading state:** VERIFIED — SessionLoadingView and restore loading
- **Empty state:** VERIFIED — same workspace handles empty session
- **Error state:** VERIFIED — failed restore/retry/edit/copy and protocol mismatch surfaces
- **Success / completed state:** VERIFIED — rendered completed response and usage footer
- **Source components:** [`web/app/(workspace)/chat/[sessionId]/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/chat/[sessionId]/page.tsx), [`web/features/chat/components/ChatWorkspace.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/chat/components/ChatWorkspace.tsx), [`web/features/chat/messages/ChatMessageList.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/chat/messages/ChatMessageList.tsx), [`web/features/chat/components/ChatSessionMenu.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/chat/components/ChatSessionMenu.tsx), [`web/components/sessions/SessionActionsMenu.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/sessions/SessionActionsMenu.tsx)
- **Captures / limitation:** [CAP-032](audit/screenshots/snow-1440-032--chat-audit-missing-record.png), [CAP-130](audit/screenshots/dark-412-032--chat-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Chat stack / result owner; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-chat) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S06 — Composer controls and reference selection

**Target / milestone:** `UI-COMPOSER-PICKERS` / M3. **Classification:** IN SCOPE.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Model selection; response style; who answers; skills/connectors/creation choices; selected resource tree; context budget
- **User actions:** Search/select/remove model, persona, partner/group/subagent and resources; enable allowed tools
- **Modals / dialogs / drawers / sheets:** Notebook, Book, Reading, History, MyAgents, QuestionBank and Memory pickers
- **Loading state:** VERIFIED — catalog/answerer loading
- **Empty state:** VERIFIED — unavailable/empty answerers and filtered resources vary by selector
- **Error state:** VERIFIED — answerer and model-loading failure branches
- **Success / completed state:** VERIFIED — selections reflected in composer and turn snapshot
- **Source components:** [`web/components/chat/home/ModelSelector.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/ModelSelector.tsx), [`web/components/chat/home/ComposerResources.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/ComposerResources.tsx), [`web/components/chat/home/ComposerTray.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/ComposerTray.tsx), [`web/components/chat/home/AnswerModeMenu.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/AnswerModeMenu.tsx), [`web/components/chat/home/ContextReferenceTree.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/ContextReferenceTree.tsx)
- **Captures / limitation:** [CAP-032](audit/screenshots/snow-1440-032--chat-audit-missing-record.png), [CAP-130](audit/screenshots/dark-412-032--chat-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Chat stack / result owner; Selected chat controls/results only; no partner/agent administration, provider setup or separate capability application. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ui-composer-pickers) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S07 — Session viewer / activity workspace

**Target / milestone:** `MS-SESSION-VIEWER` / M3. **Classification:** IN SCOPE.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Tabs for file, web, Markdown note, followup/consultation/subagent/GeoGebra content; activity and attachments
- **User actions:** Open/switch/close/reopen viewer tabs; inspect activity; work with contextual content
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** VERIFIED — web embed loaded/timeout state
- **Empty state:** VERIFIED — viewer landing when tabs are empty
- **Error state:** VERIFIED — embed timeout and file-preview-specific failures
- **Success / completed state:** VERIFIED — selected tab content
- **Source components:** [`web/components/chat/home/SessionViewerPanel.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/SessionViewerPanel.tsx), [`web/components/chat/home/SessionActivityPanel.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/SessionActivityPanel.tsx), [`web/components/chat/home/ChatMarkdownNoteTab.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/ChatMarkdownNoteTab.tsx), [`web/components/chat/home/SubagentTabBody.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/SubagentTabBody.tsx), [`web/components/chat/home/ConsultationTabBody.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/ConsultationTabBody.tsx)
- **Captures / limitation:** [CAP-033](audit/screenshots/snow-1440-033--chat.png), [CAP-131](audit/screenshots/dark-412-033--chat.png); host state only unless actual form captured
- **Mobile adaptation:** Chat stack / result owner; Selected chat controls/results only; no partner/agent administration, provider setup or separate capability application. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-session-viewer) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S08 — File preview

**Target / milestone:** `MS-FILE-PREVIEW` / M3. **Classification:** IN SCOPE.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Attachment/output preview selected by file kind; image, PDF, Office, sheet, Markdown, SVG, video/text and fallback renderers
- **User actions:** Open; close; use available file actions
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** VERIFIED — per-format fetch/decode loading
- **Empty state:** VERIFIED — fallback renderer for unsupported files
- **Error state:** VERIFIED — per-preview fetch/decode failures
- **Success / completed state:** VERIFIED — rendered file or supported fallback
- **Source components:** [`web/components/chat/preview/FilePreviewDrawer.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/preview/FilePreviewDrawer.tsx), [`web/components/chat/preview/previewerFor.ts`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/preview/previewerFor.ts)
- **Captures / limitation:** [CAP-033](audit/screenshots/snow-1440-033--chat.png), [CAP-131](audit/screenshots/dark-412-033--chat.png); host state only unless actual form captured
- **Mobile adaptation:** Chat stack / result owner; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-file-preview) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S09 — Conversation organization / history

**Target / milestone:** `MS-HISTORY` / M3. **Classification:** IN SCOPE.

- **Web route:** /space/chat-history
- **Visible sections:** Conversation history; search; kind and archive filters; mastery/reading labels
- **User actions:** Search; filter; reopen/restore; use per-session actions
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** VERIFIED — list and search loading
- **Empty state:** VERIFIED — filtered list/no matches requires exact runtime copy check
- **Error state:** VERIFIED — searchError branch and retry version
- **Success / completed state:** VERIFIED — restored conversation opens owning destination
- **Source components:** [`web/app/(utility)/space/chat-history/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(utility)/space/chat-history/page.tsx), [`web/components/space/ChatHistorySection.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/ChatHistorySection.tsx), [`web/components/sessions/OrganizedSessionList.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/sessions/OrganizedSessionList.tsx), [`web/components/sessions/SessionActionsMenu.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/sessions/SessionActionsMenu.tsx)
- **Captures / limitation:** [CAP-023](audit/screenshots/snow-1440-023--space-chat-history.png), [CAP-121](audit/screenshots/dark-412-023--space-chat-history.png); host state only unless actual form captured
- **Mobile adaptation:** Chat stack / History; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-history) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S10 — Archived chats

**Target / milestone:** `MS-SETTINGS-archive` / M3. **Classification:** IN SCOPE.

- **Web route:** /settings/archive
- **Visible sections:** Archived conversation management
- **User actions:** Search; unarchive; permanently delete
- **Modals / dialogs / drawers / sheets:** Permanent delete confirmation
- **Loading state:** VERIFIED — archived list loading
- **Empty state:** VERIFIED — archived-list empty branch
- **Error state:** VERIFIED — operation failure handling
- **Success / completed state:** VERIFIED — restored/deleted list refresh
- **Source components:** [`web/features/settings/sections/ArchivedChatsSettingsSection.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/ArchivedChatsSettingsSection.tsx), [`web/components/space/ArchivedConversations.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/ArchivedConversations.tsx)
- **Captures / limitation:** [CAP-062](audit/screenshots/snow-1440-063--settings-archive.png), [CAP-160](audit/screenshots/dark-412-063--settings-archive.png); host state only unless actual form captured
- **Mobile adaptation:** Chat stack / History; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-settings-archive) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S11 — Chat capabilities

**Target / milestone:** `UI-CAPABILITIES` / M3. **Classification:** IN SCOPE.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Chat/Auto; Solve; Ask Questions; Quiz; Research; Visualize; Video Lesson; configuration cards
- **User actions:** Select capability; configure/confirm; submit through same composer
- **Modals / dialogs / drawers / sheets:** Capability tray and contextual configuration
- **Loading state:** VERIFIED — capability catalog discovery
- **Empty state:** VERIFIED — unavailable capabilities filtered by catalog
- **Error state:** VERIFIED — Quiz and Research configuration validation
- **Success / completed state:** VERIFIED — selected capability drives the chat turn
- **Source components:** [`web/features/capabilities/presentation.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/capabilities/presentation.tsx), [`web/components/chat/home/CapabilityConfigCard.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/CapabilityConfigCard.tsx), [`web/components/quiz/QuizConfigPanel.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/quiz/QuizConfigPanel.tsx), [`web/components/research/ResearchConfigPanel.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/research/ResearchConfigPanel.tsx), [`web/components/visualize/VisualizeConfigPanel.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/visualize/VisualizeConfigPanel.tsx)
- **Captures / limitation:** [CAP-032](audit/screenshots/snow-1440-032--chat-audit-missing-record.png), [CAP-130](audit/screenshots/dark-412-032--chat-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Chat stack / result owner; Selected chat controls/results only; no partner/agent administration, provider setup or separate capability application. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ui-capabilities) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S12 — Ask Questions / structured question

**Target / milestone:** `UI-STRUCTURED-REPLY` / M3. **Classification:** IN SCOPE.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Structured request for input embedded in tutor output
- **User actions:** Select options; type response; submit; source-supported skip
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** VERIFIED — pending submit state
- **Empty state:** UNVERIFIED — depends on server question payload
- **Error state:** VERIFIED — submit failure/hint handled by chat owner
- **Success / completed state:** VERIFIED — reply resumes existing turn
- **Source components:** [`web/components/chat/home/AskUserOptions.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/AskUserOptions.tsx), [`web/components/chat/home/MasteryQuestionCard.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/chat/home/MasteryQuestionCard.tsx)
- **Captures / limitation:** [CAP-032](audit/screenshots/snow-1440-032--chat-audit-missing-record.png), [CAP-130](audit/screenshots/dark-412-032--chat-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Chat stack / result owner; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ui-structured-reply) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S13 — Quiz result and follow-up

**Target / milestone:** `UI-QUIZ` / M3. **Classification:** IN SCOPE.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Question pager; choices or written/image answer; judgment/review; bookmark/category; follow-up
- **User actions:** Answer; submit; reveal/review; attach answer image; bookmark; open question follow-up
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** VERIFIED — judging busy state
- **Empty state:** UNVERIFIED — requires actual generated result
- **Error state:** VERIFIED — judgment error and per-question operation state
- **Success / completed state:** VERIFIED — answer/judgment and review views
- **Source components:** [`web/components/quiz/QuizViewer.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/quiz/QuizViewer.tsx), [`web/components/quiz/QuizFollowupTabBody.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/quiz/QuizFollowupTabBody.tsx)
- **Captures / limitation:** [CAP-032](audit/screenshots/snow-1440-032--chat-audit-missing-record.png), [CAP-130](audit/screenshots/dark-412-032--chat-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Chat stack / result owner; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ui-quiz) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S14 — Research outline and report

**Target / milestone:** `UI-RESEARCH` / M3. **Classification:** IN SCOPE.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Research configuration; notes/report/comparison/learning_path modes; quick/standard/deep/manual depth; editable outline; streamed report
- **User actions:** Configure; edit/confirm outline; read citations and report
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** VERIFIED — shared live-turn activity
- **Empty state:** UNVERIFIED — no standalone report library found
- **Error state:** VERIFIED — research configuration validation
- **Success / completed state:** VERIFIED — report rendered as assistant response
- **Source components:** [`web/components/research/ResearchOutlineEditor.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/research/ResearchOutlineEditor.tsx), [`web/components/research/ResearchConfigPanel.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/research/ResearchConfigPanel.tsx), [`web/features/chat/messages/ChatMessageList.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/chat/messages/ChatMessageList.tsx)
- **Captures / limitation:** [CAP-032](audit/screenshots/snow-1440-032--chat-audit-missing-record.png), [CAP-130](audit/screenshots/dark-412-032--chat-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Chat stack / result owner; Selected chat controls/results only; no partner/agent administration, provider setup or separate capability application. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ui-research) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S15 — Visualize / math animation / Video Lesson output

**Target / milestone:** `UI-VISUAL-RESULT` / M5. **Classification:** IN SCOPE.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Visualization presentation; SVG/HTML/charts/diagrams; code and fullscreen; math animation result; lesson player; GeoGebra board
- **User actions:** Toggle code; copy; fullscreen; play; source-supported file actions
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** VERIFIED — rendering/player loading states vary by renderer
- **Empty state:** UNVERIFIED — result payload required
- **Error state:** VERIFIED — visualization render error and embed limitations
- **Success / completed state:** VERIFIED — rendered presentation/video result
- **Source components:** [`web/components/visualize/VisualizationViewer.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/visualize/VisualizationViewer.tsx), [`web/components/math-animator/MathAnimatorViewer.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/math-animator/MathAnimatorViewer.tsx), [`web/components/video-lesson/VideoLessonViewer.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/video-lesson/VideoLessonViewer.tsx), [`web/components/Geogebra.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/Geogebra.tsx)
- **Captures / limitation:** [CAP-032](audit/screenshots/snow-1440-032--chat-audit-missing-record.png), [CAP-130](audit/screenshots/dark-412-032--chat-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Chat stack / result owner; Selected chat controls/results only; no partner/agent administration, provider setup or separate capability application. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ui-visual-result) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S16 — Personalized Learning / Learning

**Target / milestone:** `MS-LEARNING` / M4. **Classification:** IN SCOPE.

- **Web route:** /learning
- **Visible sections:** Learning dashboard; Books, Mastery Path, Practice, Immersive Reading; activity/items and source-specific counts
- **User actions:** Open learning surface or item; create learning
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** VERIFIED — feature data loading
- **Empty state:** VERIFIED — feature-specific empty invitations
- **Error state:** VERIFIED — feature load errors; inspect runtime for combined failure layout
- **Success / completed state:** VERIFIED — existing learning records
- **Source components:** [`web/app/(workspace)/learning/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/page.tsx), [`web/components/learning/LearningDashboard.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/learning/LearningDashboard.tsx), [`web/features/ui-layout/classic/ClassicLearningDashboard.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/ui-layout/classic/ClassicLearningDashboard.tsx), [`web/components/learning/surfaces.ts`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/learning/surfaces.ts)
- **Captures / limitation:** [CAP-045](audit/screenshots/snow-1440-045--learning.png), [CAP-143](audit/screenshots/dark-412-045--learning.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-learning) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S17 — Create learning

**Target / milestone:** `MS-LEARNING-CREATE` / M4. **Classification:** IN SCOPE.

- **Web route:** /learning/new
- **Visible sections:** Choose which actual learning surface to create
- **User actions:** Start Books, Mastery Path, Practice import or Reading creation
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** VERIFIED — auth, customization and module inventory gate LearningSkeleton
- **Empty state:** VERIFIED — customize.emptyLearning when eligible surfaces are all hidden
- **Error state:** VERIFIED — inventory/preferences error and reload controls
- **Success / completed state:** VERIFIED — navigates to owning creation flow
- **Source components:** [`web/app/(workspace)/learning/new/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/new/page.tsx), [`web/components/learning/NewLearningPage.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/learning/NewLearningPage.tsx), [`web/components/learning/LearningCreateMenu.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/learning/LearningCreateMenu.tsx), [`web/components/learning/surfaces.ts`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/learning/surfaces.ts)
- **Captures / limitation:** [CAP-044](audit/screenshots/snow-1440-044--learning-new.png), [CAP-142](audit/screenshots/dark-412-044--learning-new.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-learning-create) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S18 — Mastery Path atlas

**Target / milestone:** `MS-MASTERY-LIBRARY` / M4. **Classification:** IN SCOPE.

- **Web route:** /learning/mastery
- **Visible sections:** Learning goals/path cards; mastery progress; source and next-step context
- **User actions:** Open path; create topic
- **Modals / dialogs / drawers / sheets:** CreateTopicWizard
- **Loading state:** VERIFIED — topic-card skeletons
- **Empty state:** VERIFIED — Your atlas is still uncharted
- **Error state:** VERIFIED — LearningErrorState with retry
- **Success / completed state:** VERIFIED — path cards and mastery progress
- **Source components:** [`web/app/(workspace)/learning/mastery/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/mastery/page.tsx), [`web/components/space/learning/TopicAtlas.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/TopicAtlas.tsx), [`web/components/space/learning/TopicMapCard.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/TopicMapCard.tsx)
- **Captures / limitation:** [CAP-043](audit/screenshots/snow-1440-043--learning-mastery.png), [CAP-141](audit/screenshots/dark-412-043--learning-mastery.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-mastery-library) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S19 — Create mastery goal

**Target / milestone:** `UI-MASTERY-CREATE` / M4. **Classification:** IN SCOPE.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Goal and emoji; source choices; step progression
- **User actions:** Enter goal; select materials; create; continue outline conversation
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** VERIFIED — busy creation
- **Empty state:** VERIFIED — unselected sources/blank goal before entry
- **Error state:** VERIFIED — creation error
- **Success / completed state:** VERIFIED — creation opens owning goal/conversation
- **Source components:** [`web/components/space/learning/CreateTopicWizard.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/CreateTopicWizard.tsx), [`web/components/space/learning/TopicWizardSteps.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/TopicWizardSteps.tsx)
- **Captures / limitation:** [CAP-043](audit/screenshots/snow-1440-043--learning-mastery.png), [CAP-141](audit/screenshots/dark-412-043--learning-mastery.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ui-mastery-create) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S20 — Mastery Path detail

**Target / milestone:** `MS-MASTERY-DETAIL` / M4. **Classification:** IN SCOPE.

- **Web route:** /learning/mastery/[pathId]
- **Visible sections:** Topic heading; sources; outline/board; knowledge points/objective reports; review trail; sessions; strategies/retention
- **User actions:** Select point; inspect objective; start study/review; edit route; adjust available strategy/retention; reset/delete
- **Modals / dialogs / drawers / sheets:** EditTopicRouteDialog; reset and permanent-delete confirmation
- **Loading state:** VERIFIED — topic, sessions and strategies load separately
- **Empty state:** VERIFIED — unfinished outline and no sessions have distinct handling
- **Error state:** VERIFIED — topic/sessions/board/strategy/retention errors
- **Success / completed state:** VERIFIED — progress and completed/mastered points
- **Source components:** [`web/app/(workspace)/learning/mastery/[pathId]/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/mastery/[pathId]/page.tsx), [`web/components/space/learning/StudyOutline.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/StudyOutline.tsx), [`web/components/space/learning/LearningBoard.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/LearningBoard.tsx), [`web/components/space/learning/ObjectiveDetail.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/ObjectiveDetail.tsx), [`web/components/space/learning/ReviewTrail.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/ReviewTrail.tsx)
- **Captures / limitation:** [CAP-040](audit/screenshots/snow-1440-040--learning-mastery-audit-missing-record.png), [CAP-138](audit/screenshots/dark-412-040--learning-mastery-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-mastery-detail) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S21 — Mastery study conversation

**Target / milestone:** `MS-MASTERY-STUDY` / M4. **Classification:** IN SCOPE.

- **Web route:** /learning/mastery/[pathId]/sessions
- **Visible sections:** Outline, Study, Review modes; study outline; transcript; contextual question cards; session camp; celebration
- **User actions:** Send/stop; change mode when idle; answer/skip allowed questions; open sessions/outline; save
- **Modals / dialogs / drawers / sheets:** Session viewer; save to Favorites; sessions panel; level-up celebration
- **Loading state:** VERIFIED — useMasteryStudySession loading
- **Empty state:** VERIFIED — mode-specific starter choices
- **Error state:** VERIFIED — missing/unavailable session and action failures
- **Success / completed state:** VERIFIED — mastered progress and level-up overlay
- **Source components:** [`web/app/(workspace)/learning/mastery/[pathId]/sessions/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/mastery/[pathId]/sessions/page.tsx), [`web/components/space/learning/MasteryStudy.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/MasteryStudy.tsx), [`web/components/space/learning/ModeSwitch.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/ModeSwitch.tsx), [`web/components/space/learning/SessionCamp.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/SessionCamp.tsx), [`web/lib/mastery-mode.ts`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/lib/mastery-mode.ts)
- **Captures / limitation:** [CAP-041](audit/screenshots/snow-1440-041--learning-mastery-audit-missing-record-sessions-audit-missing-record.png), [CAP-139](audit/screenshots/dark-412-041--learning-mastery-audit-missing-record-sessions-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-mastery-study) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S22 — Persisted mastery study session

**Target / milestone:** `MS-MASTERY-STUDY` / M4. **Classification:** IN SCOPE.

- **Web route:** /learning/mastery/[pathId]/sessions/[sessionId]
- **Visible sections:** Same Mastery study surface restored to a specific session
- **User actions:** Continue existing session using its persisted mode
- **Modals / dialogs / drawers / sheets:** Same overlays as S21
- **Loading state:** VERIFIED — existing session load
- **Empty state:** UNVERIFIED — empty persisted session allowed by runtime
- **Error state:** VERIFIED — session load failure handling in study owner
- **Success / completed state:** VERIFIED — resumed transcript
- **Source components:** [`web/app/(workspace)/learning/mastery/[pathId]/sessions/[sessionId]/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/mastery/[pathId]/sessions/[sessionId]/page.tsx), [`web/components/space/learning/MasteryStudy.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/MasteryStudy.tsx)
- **Captures / limitation:** [CAP-041](audit/screenshots/snow-1440-041--learning-mastery-audit-missing-record-sessions-audit-missing-record.png), [CAP-139](audit/screenshots/dark-412-041--learning-mastery-audit-missing-record-sessions-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-mastery-study) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S23 — Practice / daily review

**Target / milestone:** `MS-PRACTICE` / M4. **Classification:** IN SCOPE.

- **Web route:** /learning/practice
- **Visible sections:** Today review; due/overdue/next due; cross-workspace question references; practice insights; import entry
- **User actions:** Start review; import questions; open source collections
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** VERIFIED — summary/start/import busy states
- **Empty state:** VERIFIED — caught-up state and next due
- **Error state:** VERIFIED — LearningErrorState retry
- **Success / completed state:** VERIFIED — session completion returns refreshed summary
- **Source components:** [`web/app/(workspace)/learning/practice/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/practice/page.tsx), [`web/components/learning/practice/PracticePage.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/learning/practice/PracticePage.tsx), [`web/components/learning/practice/ReviewHome.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/learning/practice/ReviewHome.tsx), [`web/components/learning/practice/PracticeInsights.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/learning/practice/PracticeInsights.tsx)
- **Captures / limitation:** [CAP-046](audit/screenshots/snow-1440-046--learning-practice.png), [CAP-144](audit/screenshots/dark-412-046--learning-practice.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-practice) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S24 — Question Bank / Mistakes

**Target / milestone:** `MS-QUESTION-BANK` / M4. **Classification:** IN SCOPE.

- **Web route:** /space/questions
- **Visible sections:** Question Bank and Mistakes tabs; filters/search/categories; question cards; bulk selection
- **User actions:** Filter/search; select; organize categories; bookmark; practice selection; source-supported deletion
- **Modals / dialogs / drawers / sheets:** CategoryManager; CategoryMenu; import panel
- **Loading state:** VERIFIED — bank loading
- **Empty state:** VERIFIED — No matching questions / Everything is filed / No entries yet / Nothing in this view
- **Error state:** VERIFIED — bank error retry
- **Success / completed state:** VERIFIED — organized cards or selected practice session
- **Source components:** [`web/app/(utility)/space/questions/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(utility)/space/questions/page.tsx), [`web/components/learning/practice/PracticePage.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/learning/practice/PracticePage.tsx), [`web/components/space/question-bank/QuestionBankSection.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/question-bank/QuestionBankSection.tsx), [`web/components/space/question-bank/BankToolbar.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/question-bank/BankToolbar.tsx), [`web/components/space/question-bank/BankScopeRail.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/question-bank/BankScopeRail.tsx), [`web/components/space/question-bank/QuestionCard.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/question-bank/QuestionCard.tsx)
- **Captures / limitation:** [CAP-029](audit/screenshots/snow-1440-029--space-questions.png), [CAP-127](audit/screenshots/dark-412-029--space-questions.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-question-bank) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S25 — Practice question session

**Target / milestone:** `MS-PRACTICE-SESSION` / M4. **Classification:** IN SCOPE.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Question queue; answer/reveal; correctness; recall ratings Again, Hard, Mastered, Easy; completion summary
- **User actions:** Answer/reveal; rate; retry conflict; skip where offered; finish
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** VERIFIED — question fetch and answer/rating busy
- **Empty state:** VERIFIED — queue completion with skipped count
- **Error state:** VERIFIED — missing/conflicting question, error and reload
- **Success / completed state:** VERIFIED — Practice complete; saved count and next due
- **Source components:** [`web/components/learning/practice/PracticeSession.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/learning/practice/PracticeSession.tsx)
- **Captures / limitation:** [CAP-029](audit/screenshots/snow-1440-029--space-questions.png), [CAP-127](audit/screenshots/dark-412-029--space-questions.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-practice-session) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S26 — Import practice questions

**Target / milestone:** `UI-PRACTICE-IMPORT` / M4. **Classification:** IN SCOPE.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Spreadsheet/file import; target collection and result feedback
- **User actions:** Choose file/target; import; inspect outcome
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** VERIFIED — import busy
- **Empty state:** UNVERIFIED — unselected file validation depends on input
- **Error state:** VERIFIED — import failure notice
- **Success / completed state:** VERIFIED — onImported feedback and parent refresh
- **Source components:** [`web/components/learning/practice/PracticeImport.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/learning/practice/PracticeImport.tsx)
- **Captures / limitation:** [CAP-029](audit/screenshots/snow-1440-029--space-questions.png), [CAP-127](audit/screenshots/dark-412-029--space-questions.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ui-practice-import) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S27 — Books library

**Target / milestone:** `MS-BOOKS` / M5. **Classification:** IN SCOPE.

- **Web route:** /learning/books
- **Visible sections:** AI-authored book library; generation/readiness status; create entry
- **User actions:** Open book; create; source-provided library actions
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** VERIFIED — loadingBooks
- **Empty state:** VERIFIED — empty library
- **Error state:** VERIFIED — booksError
- **Success / completed state:** VERIFIED — generated books list
- **Source components:** [`web/app/(workspace)/learning/books/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/books/page.tsx), [`web/app/(workspace)/learning/books/BooksRoute.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/books/BooksRoute.tsx), [`web/app/(workspace)/learning/books/components/BookLibrary.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/books/components/BookLibrary.tsx)
- **Captures / limitation:** [CAP-039](audit/screenshots/snow-1440-039--learning-books.png), [CAP-137](audit/screenshots/dark-412-039--learning-books.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-books) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S28 — Create book / chapter spine

**Target / milestone:** `MS-BOOK-CREATE` / M5. **Classification:** IN SCOPE.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Subject/proposal; proposed book; editable chapter spine; confirmation before pages
- **User actions:** Create proposal; confirm; edit spine; begin generation
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** VERIFIED — creating/proposal/spine confirmation busy
- **Empty state:** VERIFIED — initial creator form
- **Error state:** VERIFIED — book operation failure in route owner
- **Success / completed state:** VERIFIED — confirmed spine transitions toward reader/generation
- **Source components:** [`web/app/(workspace)/learning/books/components/BookCreator.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/books/components/BookCreator.tsx), [`web/app/(workspace)/learning/books/components/SpineEditor.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/books/components/SpineEditor.tsx), [`web/app/(workspace)/learning/books/BooksRoute.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/books/BooksRoute.tsx)
- **Captures / limitation:** [CAP-037](audit/screenshots/snow-1440-037--learning-books-audit-missing-record.png), [CAP-135](audit/screenshots/dark-412-037--learning-books-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-book-create) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S29 — Book / page reader

**Target / milestone:** `MS-BOOK-READER` / M5. **Classification:** IN SCOPE.

- **Web route:** /learning/books/[bookId]
- **Visible sections:** Book spine; selected page; generated blocks; generation activity; pause/health banners; tutor chat; captures
- **User actions:** Navigate pages; read; answer quiz/flashcards; chat; deep dive; capture; pause/resume/rebuild/supplement when allowed
- **Modals / dialogs / drawers / sheets:** Book chat and capture panels; block body editing where source enables it
- **Loading state:** VERIFIED — opening book and unhydrated page loading
- **Empty state:** VERIFIED — placeholder blocks during generation
- **Error state:** VERIFIED — BookHealthBanner and page generation failure handling
- **Success / completed state:** VERIFIED — generated chapter and saved reading position
- **Source components:** [`web/app/(workspace)/learning/books/[bookId]/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/books/[bookId]/page.tsx), [`web/app/(workspace)/learning/books/BooksRoute.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/books/BooksRoute.tsx), [`web/app/(workspace)/learning/books/components/PageReader.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/books/components/PageReader.tsx), [`web/app/(workspace)/learning/books/components/BookSidebar.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/books/components/BookSidebar.tsx), [`web/app/(workspace)/learning/books/components/BookChatPanel.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/books/components/BookChatPanel.tsx), [`web/app/(workspace)/learning/books/components/LearningCapturePanel.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/books/components/LearningCapturePanel.tsx)
- **Captures / limitation:** [CAP-037](audit/screenshots/snow-1440-037--learning-books-audit-missing-record.png), [CAP-135](audit/screenshots/dark-412-037--learning-books-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-book-reader) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S30 — Book page deep link

**Target / milestone:** `MS-BOOK-READER` / M5. **Classification:** IN SCOPE.

- **Web route:** /learning/books/[bookId]/pages/[pageId]
- **Visible sections:** Same reader as S29 focused on page ID
- **User actions:** Navigate/read specific page
- **Modals / dialogs / drawers / sheets:** Same as S29
- **Loading state:** VERIFIED — page hydration loading
- **Empty state:** VERIFIED — page placeholders when not generated
- **Error state:** VERIFIED — owner handles unavailable pages
- **Success / completed state:** VERIFIED — page blocks displayed
- **Source components:** [`web/app/(workspace)/learning/books/[bookId]/pages/[pageId]/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/books/[bookId]/pages/[pageId]/page.tsx), [`web/app/(workspace)/learning/books/BooksRoute.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/books/BooksRoute.tsx)
- **Captures / limitation:** [CAP-037](audit/screenshots/snow-1440-037--learning-books-audit-missing-record.png), [CAP-135](audit/screenshots/dark-412-037--learning-books-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-book-reader) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S31 — Immersive Reading library

**Target / milestone:** `MS-READING-LIBRARY` / M5. **Classification:** IN SCOPE.

- **Web route:** /learning/reading
- **Visible sections:** Collections/folders and reading library; creation/import entry
- **User actions:** Search/browse; open collection; add materials; manage folder
- **Modals / dialogs / drawers / sheets:** AddMaterialsDialog; FolderDialog
- **Loading state:** VERIFIED — library load
- **Empty state:** VERIFIED — empty library branch
- **Error state:** VERIFIED — library load/action failures
- **Success / completed state:** VERIFIED — created collection appears
- **Source components:** [`web/app/(workspace)/learning/reading/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/reading/page.tsx), [`web/components/reading/library/ReadingLibrary.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/library/ReadingLibrary.tsx), [`web/components/reading/library/LibraryShell.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/library/LibraryShell.tsx)
- **Captures / limitation:** [CAP-052](audit/screenshots/snow-1440-052--learning-reading.png), [CAP-150](audit/screenshots/dark-412-052--learning-reading.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-reading-library) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S32 — All reading materials

**Target / milestone:** `MS-READING-MATERIALS` / M5. **Classification:** IN SCOPE.

- **Web route:** /learning/reading/materials
- **Visible sections:** Materials library independent of collection; documents/web/video/audio
- **User actions:** Browse/search; select/add material; import existing material
- **Modals / dialogs / drawers / sheets:** Add materials; existing material picker; Invidious feedback
- **Loading state:** VERIFIED — material fetch/loading
- **Empty state:** VERIFIED — no material rows/matches
- **Error state:** VERIFIED — import/link errors
- **Success / completed state:** VERIFIED — selected/imported material available
- **Source components:** [`web/app/(workspace)/learning/reading/materials/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/reading/materials/page.tsx), [`web/components/reading/library/MaterialLibrary.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/library/MaterialLibrary.tsx), [`web/components/reading/library/AddMaterialsDialog.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/library/AddMaterialsDialog.tsx)
- **Captures / limitation:** [CAP-051](audit/screenshots/snow-1440-051--learning-reading-materials.png), [CAP-149](audit/screenshots/dark-412-051--learning-reading-materials.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-reading-materials) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S33 — Reading collection folder

**Target / milestone:** `MS-READING-FOLDER` / M5. **Classification:** IN SCOPE.

- **Web route:** /learning/reading/folders/[folderId]
- **Visible sections:** Collection files and conversations; enter reading
- **User actions:** Open material or conversation; manage collection membership
- **Modals / dialogs / drawers / sheets:** Folder/add-material actions
- **Loading state:** VERIFIED — folder load
- **Empty state:** VERIFIED — empty folder invitation
- **Error state:** VERIFIED — folder operation failure
- **Success / completed state:** VERIFIED — collection contents and conversations
- **Source components:** [`web/app/(workspace)/learning/reading/folders/[folderId]/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/reading/folders/[folderId]/page.tsx), [`web/components/reading/library/ReadingFolder.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/library/ReadingFolder.tsx)
- **Captures / limitation:** [CAP-050](audit/screenshots/snow-1440-050--learning-reading-folders-audit-missing-record.png), [CAP-148](audit/screenshots/dark-412-050--learning-reading-folders-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-reading-folder) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S34 — Immersive Reading workspace

**Target / milestone:** `MS-READING` / M5. **Classification:** IN SCOPE.

- **Web route:** /learning/reading/[workspaceId]
- **Visible sections:** Sources/outline; document or synchronized media/transcript stage; companion conversation; reading controls
- **User actions:** Read; navigate locators/timestamps; select passage; ask tutor; annotate; read aloud; manage conversations; organize notes
- **Modals / dialogs / drawers / sheets:** Source navigator; session list; link conversations; send to Notebook; organized notes; rename/remove; Build Mastery Path
- **Loading state:** VERIFIED — reading workspace loading
- **Empty state:** VERIFIED — EmptyWorkspace with add-material action
- **Error state:** VERIFIED — error without workspace and operation errors
- **Success / completed state:** VERIFIED — loaded reader, source-grounded conversation and annotations
- **Source components:** [`web/app/(workspace)/learning/reading/[workspaceId]/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/reading/[workspaceId]/page.tsx), [`web/components/reading/workspace/ReadingWorkspace.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/workspace/ReadingWorkspace.tsx), [`web/components/reading/ReaderPane.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/ReaderPane.tsx), [`web/components/reading/workspace/ReadingCompanion.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/workspace/ReadingCompanion.tsx), [`web/components/reading/workspace/SourceNavigator.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/workspace/SourceNavigator.tsx), [`web/components/reading/workspace/MediaReadingStage.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/workspace/MediaReadingStage.tsx)
- **Captures / limitation:** [CAP-047](audit/screenshots/snow-1440-047--learning-reading-audit-missing-record.png), [CAP-145](audit/screenshots/dark-412-047--learning-reading-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-reading) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S35 — Reading session URL variants

**Target / milestone:** `MS-READING` / M5. **Classification:** IN SCOPE.

- **Web route:** /learning/reading/[workspaceId]/sessions
- **Visible sections:** Same reading workspace; active/new conversation
- **User actions:** Open/create/continue reading conversation
- **Modals / dialogs / drawers / sheets:** Same as S34
- **Loading state:** VERIFIED — session/workspace loading
- **Empty state:** VERIFIED — new reading conversation
- **Error state:** VERIFIED — workspace error handling
- **Success / completed state:** VERIFIED — active reading transcript
- **Source components:** [`web/app/(workspace)/learning/reading/[workspaceId]/sessions/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/reading/[workspaceId]/sessions/page.tsx), [`web/components/reading/workspace/ReadingWorkspace.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/workspace/ReadingWorkspace.tsx)
- **Captures / limitation:** [CAP-047](audit/screenshots/snow-1440-047--learning-reading-audit-missing-record.png), [CAP-145](audit/screenshots/dark-412-047--learning-reading-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-reading) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S36 — Persisted reading conversation

**Target / milestone:** `MS-READING` / M5. **Classification:** IN SCOPE.

- **Web route:** /learning/reading/[workspaceId]/sessions/[sessionId]
- **Visible sections:** Same reader and companion restored to session
- **User actions:** Continue selected reading conversation
- **Modals / dialogs / drawers / sheets:** Same as S34
- **Loading state:** VERIFIED — restore/load
- **Empty state:** UNVERIFIED — depends on saved record
- **Error state:** VERIFIED — owner load failure branch
- **Success / completed state:** VERIFIED — restored reader conversation
- **Source components:** [`web/app/(workspace)/learning/reading/[workspaceId]/sessions/[sessionId]/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/reading/[workspaceId]/sessions/[sessionId]/page.tsx), [`web/components/reading/workspace/ReadingWorkspace.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/workspace/ReadingWorkspace.tsx)
- **Captures / limitation:** [CAP-047](audit/screenshots/snow-1440-047--learning-reading-audit-missing-record.png), [CAP-145](audit/screenshots/dark-412-047--learning-reading-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-reading) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S37 — Reading annotation and display tools

**Target / milestone:** `UI-READING-ACTIONS` / M5. **Classification:** IN SCOPE.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Selection anchored annotation actions; highlight colors/note input; font size/family/line width/theme; EPUB spread
- **User actions:** Highlight; write note; contextual tutor action; adjust/reset reading display
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** Not applicable — local controls; annotation persistence belongs to owner
- **Empty state:** VERIFIED — empty annotation list handling in owner
- **Error state:** UNVERIFIED — selection drift and persistence recovery need runtime
- **Success / completed state:** VERIFIED — stored annotation/display preferences
- **Source components:** [`web/components/reading/AnnotationPopover.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/AnnotationPopover.tsx), [`web/components/reading/AnnotationList.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/AnnotationList.tsx), [`web/components/reading/ReaderDisplayControls.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/ReaderDisplayControls.tsx), [`web/lib/reading-display-preferences.ts`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/lib/reading-display-preferences.ts)
- **Captures / limitation:** [CAP-047](audit/screenshots/snow-1440-047--learning-reading-audit-missing-record.png), [CAP-145](audit/screenshots/dark-412-047--learning-reading-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ui-reading-actions) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S38 — Legacy watching session

**Target / milestone:** `ADAPTER-LEGACY-WATCH` / M5. **Classification:** SUPPORTING.

- **Web route:** /learning/watching/[sessionId]
- **Visible sections:** Compatibility route into current reading/media behavior
- **User actions:** Resolve/open previous watching session
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** VERIFIED — legacy resolution state
- **Empty state:** UNVERIFIED — record required
- **Error state:** VERIFIED — legacy unavailable handling depends on resolution
- **Success / completed state:** VERIFIED — resolves to supported reading session
- **Source components:** [`web/app/(workspace)/learning/watching/[sessionId]/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/watching/[sessionId]/page.tsx), [`web/components/reading/workspace/LegacyWatchingSession.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/workspace/LegacyWatchingSession.tsx), [`web/components/reading/workspace/YouTubeReadingPlayer.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/workspace/YouTubeReadingPlayer.tsx), [`web/components/reading/workspace/BilibiliReadingPlayer.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/reading/workspace/BilibiliReadingPlayer.tsx)
- **Captures / limitation:** [CAP-053](audit/screenshots/snow-1440-053--learning-watching-audit-missing-record.png), [CAP-151](audit/screenshots/dark-412-053--learning-watching-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Shared navigation, compatibility or feedback supporting selected workflows. See [acceptance](MOBILE_PRODUCT_SCOPE.md#adapter-legacy-watch) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S39 — Resources / Learning Space

**Target / milestone:** `MS-RESOURCES` / M2. **Classification:** SUPPORTING.

- **Web route:** /space
- **Visible sections:** Conversations & Materials; Chat History, Favorites, Learning journal, Question Bank, Knowledge Center; conditional More Projects
- **User actions:** Open actual resource; read available counts
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** VERIFIED — per-tile load/count probes
- **Empty state:** VERIFIED — conditional group omitted if no available items
- **Error state:** UNVERIFIED — count failures vary by tile
- **Success / completed state:** VERIFIED — resource tiles
- **Source components:** [`web/app/(utility)/space/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(utility)/space/page.tsx), [`web/components/space/SpaceDashboard.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/SpaceDashboard.tsx), [`web/components/space/dashboard-groups.ts`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/dashboard-groups.ts)
- **Captures / limitation:** [CAP-027](audit/screenshots/snow-1440-027--space.png), [CAP-125](audit/screenshots/dark-412-027--space.png); host state only unless actual form captured
- **Mobile adaptation:** Retained optional/development entry; outside primary navigation; Preserve completed M2 overview; optional legacy/support route, not a mandate to build its destinations. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-resources) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S40 — Personalization

**Target / milestone:** `MS-PERSONALIZATION` / M2. **Classification:** SUPPORTING.

- **Web route:** /personalization
- **Visible sections:** My Agents, Personas, Skills, MCP Services, CLI Apps, Memory
- **User actions:** Open account-level resource managers
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** VERIFIED — source count probes
- **Empty state:** UNVERIFIED — no global empty state required
- **Error state:** UNVERIFIED — count probe failure presentation
- **Success / completed state:** VERIFIED — account-resource tiles
- **Source components:** [`web/app/(utility)/personalization/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(utility)/personalization/page.tsx), [`web/components/space/PersonalizationHub.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/PersonalizationHub.tsx), [`web/components/space/dashboard-groups.ts`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/dashboard-groups.ts)
- **Captures / limitation:** [CAP-019](audit/screenshots/snow-1440-019--personalization.png), [CAP-117](audit/screenshots/dark-412-019--personalization.png); host state only unless actual form captured
- **Mobile adaptation:** Retained optional/development entry; outside primary navigation; Preserve completed M2 overview; optional legacy/support route, not a mandate to build its destinations. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-personalization) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S45 — Favorites collections

**Target / milestone:** `MS-FAVORITES` / M3. **Classification:** IN SCOPE.

- **Web route:** /notebooks
- **Visible sections:** Saved original conversations and sources; collection cards/search; metadata
- **User actions:** Create/open/rename collection
- **Modals / dialogs / drawers / sheets:** NotebookMetaDialog
- **Loading state:** VERIFIED — library loading
- **Empty state:** VERIFIED — empty collections state
- **Error state:** VERIFIED — Could not load your notebooks with recovery
- **Success / completed state:** VERIFIED — collection list refreshed
- **Source components:** [`web/app/(utility)/notebooks/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(utility)/notebooks/page.tsx), [`web/components/notebook/NotebookConsole.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/notebook/NotebookConsole.tsx), [`web/components/notebook/useNotebookLibrary.ts`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/notebook/useNotebookLibrary.ts)
- **Captures / limitation:** [CAP-018](audit/screenshots/snow-1440-018--notebooks.png), [CAP-116](audit/screenshots/dark-412-018--notebooks.png); host state only unless actual form captured
- **Mobile adaptation:** Notebook stack; Save original also hosted by Chat/Learning; Saved originals support chat/learning capture and Notebook; not editable note pages. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-favorites) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S46 — Favorites collection detail

**Target / milestone:** `MS-FAVORITES-DETAIL` / M3. **Classification:** IN SCOPE.

- **Web route:** /notebooks/[notebookId]
- **Visible sections:** Collection heading; record-kind filter/search; original saved records; focused record query
- **User actions:** Search/filter; inspect/use/delete records; edit/delete collection
- **Modals / dialogs / drawers / sheets:** Metadata edit; collection delete confirmation
- **Loading state:** VERIFIED — record loading
- **Empty state:** VERIFIED — no records / no matches
- **Error state:** VERIFIED — unavailable collection/record error
- **Success / completed state:** VERIFIED — collection and matching records
- **Source components:** [`web/app/(utility)/notebooks/[notebookId]/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(utility)/notebooks/[notebookId]/page.tsx), [`web/components/notebook/NotebookConsole.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/notebook/NotebookConsole.tsx), [`web/components/notebook/NotebookRecordRow.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/notebook/NotebookRecordRow.tsx), [`web/components/notebook/NotebookRecordActions.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/notebook/NotebookRecordActions.tsx)
- **Captures / limitation:** [CAP-017](audit/screenshots/snow-1440-017--notebooks-audit-missing-record.png), [CAP-115](audit/screenshots/dark-412-017--notebooks-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Notebook stack; Save original also hosted by Chat/Learning; Saved originals support chat/learning capture and Notebook; not editable note pages. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-favorites-detail) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S47 — Save to Favorites / Notebook

**Target / milestone:** `UI-FAVORITES-SAVE` / M3. **Classification:** IN SCOPE.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Choose collection; save original content; reference existing saved records
- **User actions:** Select collection; save/cancel; choose records for composer
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** VERIFIED — destination/record loading and save busy
- **Empty state:** VERIFIED — no collections/records handling belongs to picker
- **Error state:** VERIFIED — save/select failure handling
- **Success / completed state:** VERIFIED — saved original/reference chip
- **Source components:** [`web/components/notebook/SaveToNotebookModal.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/notebook/SaveToNotebookModal.tsx), [`web/components/notebook/NotebookRecordPicker.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/notebook/NotebookRecordPicker.tsx)
- **Captures / limitation:** [CAP-018](audit/screenshots/snow-1440-018--notebooks.png), [CAP-116](audit/screenshots/dark-412-018--notebooks.png); host state only unless actual form captured
- **Mobile adaptation:** Notebook stack; Save original also hosted by Chat/Learning; Saved originals support chat/learning capture and Notebook; not editable note pages. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ui-favorites-save) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S48 — Learning journal

**Target / milestone:** `MS-JOURNAL` / M4. **Classification:** IN SCOPE.

- **Web route:** /space/journal
- **Visible sections:** Current mission; last-session handoff; confirmed learning records
- **User actions:** Inspect; refresh/retry
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** VERIFIED — journal load pending
- **Empty state:** VERIFIED — absent mission/handoff/records use source fallbacks
- **Error state:** VERIFIED — corrupt/unreadable journal notice preserves original data
- **Success / completed state:** VERIFIED — confirmed records displayed
- **Source components:** [`web/app/(utility)/space/journal/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(utility)/space/journal/page.tsx), [`web/components/space/LearningJournalPanel.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/LearningJournalPanel.tsx)
- **Captures / limitation:** [CAP-025](audit/screenshots/snow-1440-025--space-journal.png), [CAP-123](audit/screenshots/dark-412-025--space-journal.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-journal) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S62 — Learning notebook / Co-Writer library

**Target / milestone:** `MS-NOTES` / M7. **Classification:** IN SCOPE.

- **Web route:** /co-writer
- **Visible sections:** Hierarchical note pages; pinned/recent cards; search; Word import; review entry
- **User actions:** Create/open; import Word; pin/unpin; delete; search all pages
- **Modals / dialogs / drawers / sheets:** Per-card actions and inline destructive confirmation; NoteReview
- **Loading state:** VERIFIED — six-card loading skeleton
- **Empty state:** VERIFIED — Your notebook is empty / no matching pages
- **Error state:** VERIFIED — load/create/import/pin/delete error
- **Success / completed state:** VERIFIED — new/imported page navigates to detail
- **Source components:** [`web/app/(workspace)/co-writer/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/co-writer/page.tsx), [`web/features/notes/components/NoteReview.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteReview.tsx)
- **Captures / limitation:** [CAP-035](audit/screenshots/snow-1440-035--co-writer.png), [CAP-133](audit/screenshots/dark-412-035--co-writer.png); host state only unless actual form captured
- **Mobile adaptation:** Notebook stack; Save original also hosted by Chat/Learning; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-notes) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S63 — Learning notebook editor

**Target / milestone:** `MS-NOTE-EDITOR` / M7. **Classification:** IN SCOPE.

- **Web route:** /co-writer/[docId]
- **Visible sections:** Page tree; outline; rich blocks; title/icon/cover; linked-from pages; source/favorites pickers; Dito companion; AI suggestions/reviews
- **User actions:** Edit/save; insert/reorder blocks; select sources; accept/reject supported suggestions; manage subpages/references; review
- **Modals / dialogs / drawers / sheets:** Source picker; favorites picker; page tree; companion and review margin; recovery controls
- **Loading state:** VERIFIED — note load and saving status
- **Empty state:** VERIFIED — new blank note content
- **Error state:** VERIFIED — save conflict/recovery and per-review errors
- **Success / completed state:** VERIFIED — Saved status and revised page
- **Source components:** [`web/app/(workspace)/co-writer/[docId]/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/co-writer/[docId]/page.tsx), [`web/features/notes/components/NoteWorkspace.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteWorkspace.tsx), [`web/features/notes/components/NoteEditor.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteEditor.tsx), [`web/features/notes/components/NoteCompanion.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteCompanion.tsx), [`web/features/notes/components/NoteInsertMenu.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteInsertMenu.tsx), [`web/features/notes/components/NoteSourcePicker.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteSourcePicker.tsx)
- **Captures / limitation:** [CAP-034](audit/screenshots/snow-1440-034--co-writer-audit-missing-record.png), [CAP-132](audit/screenshots/dark-412-034--co-writer-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Notebook stack; Save original also hosted by Chat/Learning; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-note-editor) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S64 — Task Board

**Target / milestone:** `MS-TASKS` / M6. **Classification:** IN SCOPE.

- **Web route:** /kanban
- **Visible sections:** Task columns; quick add; edit title/note/due date/color; date filters; archived tasks
- **User actions:** Create/edit; move todo/doing/done; archive/restore; filter all/today/this week and archived; change status colors; link chats. Permanent deletion is NOT exposed by the inspected source UI/client (audit wording corrected here).
- **Modals / dialogs / drawers / sheets:** Inline task editor; date/color controls
- **Loading state:** VERIFIED — board load and action busy
- **Empty state:** VERIFIED — empty column/board prompts in source
- **Error state:** VERIFIED — loadError and action error
- **Success / completed state:** VERIFIED — updated task columns
- **Source components:** [`web/app/(workspace)/kanban/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/kanban/page.tsx), [`web/features/tasks/components/KanbanBoard.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/tasks/components/KanbanBoard.tsx), [`web/components/tasks/TaskBoardRuntime.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/tasks/TaskBoardRuntime.tsx), [`web/components/tasks/TaskLinkSelector.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/tasks/TaskLinkSelector.tsx)
- **Captures / limitation:** [CAP-036](audit/screenshots/snow-1440-036--kanban.png), [CAP-134](audit/screenshots/dark-412-036--kanban.png); host state only unless actual form captured
- **Mobile adaptation:** Task Board stack; Source task board only; no calendar or permanent task deletion. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-tasks) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S73 — Login

**Target / milestone:** `MS-LOGIN` / M2. **Classification:** IN SCOPE.

- **Web route:** /login
- **Visible sections:** Email or username label; password; registration and preserved return path
- **User actions:** Sign in; register
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** VERIFIED — auth/first-user checks and Signing in…
- **Empty state:** VERIFIED — initial empty fields
- **Error state:** VERIFIED — Login failed response
- **Success / completed state:** VERIFIED — redirects to normalized intended route
- **Source components:** [`web/app/(auth)/login/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(auth)/login/page.tsx), [`web/lib/auth.ts`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/lib/auth.ts)
- **Captures / limitation:** [CAP-002](audit/screenshots/snow-1440-002--login.png), [CAP-100](audit/screenshots/dark-412-002--login.png); host state only unless actual form captured
- **Mobile adaptation:** Entry stack; Essential UI retained from M2; M8 integrates focused entry/settings. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-login) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S74 — Registration

**Target / milestone:** `MS-REGISTER` / M2. **Classification:** IN SCOPE.

- **Web route:** /register
- **Visible sections:** Email or username label; password/confirmation; first-user status and server registration policy
- **User actions:** Create account; sign in
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** VERIFIED — checkingFirst and Creating account…
- **Empty state:** VERIFIED — blank form
- **Error state:** VERIFIED — mismatch and server registration failure
- **Success / completed state:** VERIFIED — /login?registered=1
- **Source components:** [`web/app/(auth)/register/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(auth)/register/page.tsx)
- **Captures / limitation:** [CAP-003](audit/screenshots/snow-1440-003--register.png), [CAP-101](audit/screenshots/dark-412-003--register.png); host state only unless actual form captured
- **Mobile adaptation:** Entry stack; Essential UI retained from M2; M8 integrates focused entry/settings. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-register) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S75 — Profile

**Target / milestone:** `MS-PROFILE` / M2. **Classification:** IN SCOPE.

- **Web route:** /profile
- **Visible sections:** Account identity/role; avatar selection/upload/remove; password change; session/account utilities
- **User actions:** Update avatar; change password; logout; open authorized account utilities
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** VERIFIED — profile load; avatar/password busy
- **Empty state:** UNVERIFIED — no-profile fallback depends on auth
- **Error state:** VERIFIED — image size/decode; wrong current password; min length/mismatch
- **Success / completed state:** VERIFIED — password notice and updated profile
- **Source components:** [`web/app/(utility)/profile/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(utility)/profile/page.tsx)
- **Captures / limitation:** [CAP-020](audit/screenshots/snow-1440-020--profile.png), [CAP-118](audit/screenshots/dark-412-020--profile.png); host state only unless actual form captured
- **Mobile adaptation:** Account and basic settings; Essential UI retained from M2; M8 integrates focused entry/settings. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-profile) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S79 — Learning progress

**Target / milestone:** `MS-PROGRESS` / M4. **Classification:** IN SCOPE.

- **Web route:** /settings/progress
- **Visible sections:** Reading progress and recent learning actions
- **User actions:** Inspect activity/progress
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** VERIFIED — progress load state
- **Empty state:** VERIFIED — No learning activity yet; No reading progress yet; No learning actions yet
- **Error state:** VERIFIED — page error state in source
- **Success / completed state:** VERIFIED — recorded reading/activity summary
- **Source components:** [`web/app/(utility)/settings/progress/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(utility)/settings/progress/page.tsx)
- **Captures / limitation:** [CAP-022](audit/screenshots/snow-1440-022--settings-progress.png), [CAP-120](audit/screenshots/dark-412-022--settings-progress.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-progress) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S80 — Avatar preview developer surface

**Target / milestone:** `UI-AVATAR-GALLERY` / M1. **Classification:** SUPPORTING.

- **Web route:** /avatar-preview
- **Visible sections:** Session avatar state gallery; phase, auto and size controls
- **User actions:** Preview animation states
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** Not applicable — local gallery
- **Empty state:** Not applicable
- **Error state:** UNVERIFIED — rendering only
- **Success / completed state:** VERIFIED — phase gallery
- **Source components:** [`web/app/(utility)/avatar-preview/page.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(utility)/avatar-preview/page.tsx)
- **Captures / limitation:** [CAP-006](audit/screenshots/snow-1440-006--avatar-preview.png), [CAP-104](audit/screenshots/dark-412-006--avatar-preview.png); host state only unless actual form captured
- **Mobile adaptation:** Retained optional/development entry; outside primary navigation; Preserve completed developer gallery; no learner entry. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ui-avatar-gallery) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S81 — General

**Target / milestone:** `MS-SETTINGS-general` / M2. **Classification:** IN SCOPE.

- **Web route:** /settings/general
- **Visible sections:** Interface language; model output language; Classic/Modern layout; setup help
- **User actions:** Select supported locale/layout; stage and apply preferences
- **Modals / dialogs / drawers / sheets:** Shared staged-settings apply/discard controls; section-specific discovery/test/confirmation surfaces where rendered.
- **Loading state:** VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton
- **Empty state:** UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen
- **Error state:** VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified
- **Success / completed state:** VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply
- **Source components:** [`web/components/settings/SettingsOverview.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsOverview.tsx), [`web/components/settings/SettingsPageContent.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx), [`web/features/settings/navigation/settings-nav.ts`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/navigation/settings-nav.ts), [`web/features/settings/navigation/settings-access.ts`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/navigation/settings-access.ts)
- **Captures / limitation:** [CAP-063](audit/screenshots/snow-1440-064--settings-general.png), [CAP-161](audit/screenshots/dark-412-064--settings-general.png); host state only unless actual form captured
- **Mobile adaptation:** Account and basic settings; Essential UI retained from M2; M8 integrates focused entry/settings. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-settings-general) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S82 — Appearance

**Target / milestone:** `MS-SETTINGS-appearance` / M2. **Classification:** IN SCOPE.

- **Web route:** /settings/appearance
- **Visible sections:** Default/Cream/Dark/Glass/System themes; learning text; code blocks
- **User actions:** Change theme; adjust text/code preferences
- **Modals / dialogs / drawers / sheets:** Shared staged-settings apply/discard controls; section-specific discovery/test/confirmation surfaces where rendered.
- **Loading state:** VERIFIED — SettingsPageContent waits for access/settings; dynamic section skeleton
- **Empty state:** UNVERIFIED — section-specific unconfigured/empty controls require runtime; no universal empty screen
- **Error state:** VERIFIED — unavailable page guard; shared load/save banners; section operation errors must be visually verified
- **Success / completed state:** VERIFIED — shared fieldset disabled during saving/applying; persisted settings reflected after successful apply
- **Source components:** [`web/features/settings/sections/AppearanceSettingsSection.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/sections/AppearanceSettingsSection.tsx), [`web/components/settings/SettingsPageContent.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsPageContent.tsx), [`web/features/settings/navigation/settings-nav.ts`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/navigation/settings-nav.ts), [`web/features/settings/navigation/settings-access.ts`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/settings/navigation/settings-access.ts)
- **Captures / limitation:** [CAP-064](audit/screenshots/snow-1440-065--settings-appearance.png), [CAP-162](audit/screenshots/dark-412-065--settings-appearance.png); host state only unless actual form captured
- **Mobile adaptation:** Account and basic settings; Essential UI retained from M2; M8 integrates focused entry/settings. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ms-settings-appearance) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S116 — Page customization

**Target / milestone:** `UI-PAGE-CUSTOMIZE` / M4. **Classification:** IN SCOPE.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Chat modes, controls and starter groups; learning visibility; reset defaults
- **User actions:** Toggle visibility; edit starter label/prompt; save/reset; retry load
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** UNVERIFIED — per-control busy/load behavior; inspect owning state excerpts
- **Empty state:** UNVERIFIED — payload-dependent or not applicable; no generic empty state specified
- **Error state:** UNVERIFIED — exact runtime failure presentation; source evidence index preserves branches
- **Success / completed state:** VERIFIED — owning source renders the named operation/content; successful backend operation UNVERIFIED
- **Source components:** [`web/components/customization/PageCustomizeDialog.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/customization/PageCustomizeDialog.tsx), [`web/components/customization/PageCustomizeButton.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/customization/PageCustomizeButton.tsx)
- **Captures / limitation:** [CAP-032](audit/screenshots/snow-1440-032--chat-audit-missing-record.png), [CAP-130](audit/screenshots/dark-412-032--chat-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ui-page-customize) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S119 — Question categories and bulk organization

**Target / milestone:** `UI-QUESTION-CATEGORIES` / M4. **Classification:** IN SCOPE.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Category manager/menu; selected-question actions
- **User actions:** Manage categories; apply source-supported bulk actions
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** UNVERIFIED — per-control busy/load behavior; inspect owning state excerpts
- **Empty state:** UNVERIFIED — payload-dependent or not applicable; no generic empty state specified
- **Error state:** UNVERIFIED — exact runtime failure presentation; source evidence index preserves branches
- **Success / completed state:** VERIFIED — owning source renders the named operation/content; successful backend operation UNVERIFIED
- **Source components:** [`web/components/space/question-bank/CategoryManager.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/question-bank/CategoryManager.tsx), [`web/components/space/question-bank/CategoryMenu.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/question-bank/CategoryMenu.tsx), [`web/components/space/question-bank/BankSelectionBar.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/question-bank/BankSelectionBar.tsx)
- **Captures / limitation:** [CAP-029](audit/screenshots/snow-1440-029--space-questions.png), [CAP-127](audit/screenshots/dark-412-029--space-questions.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ui-question-categories) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S120 — Edit mastery route

**Target / milestone:** `UI-MASTERY-ROUTE-EDIT` / M4. **Classification:** IN SCOPE.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Editable route draft; structure and validation
- **User actions:** Edit draft; validate; confirm/cancel
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** UNVERIFIED — per-control busy/load behavior; inspect owning state excerpts
- **Empty state:** UNVERIFIED — payload-dependent or not applicable; no generic empty state specified
- **Error state:** UNVERIFIED — exact runtime failure presentation; source evidence index preserves branches
- **Success / completed state:** VERIFIED — owning source renders the named operation/content; successful backend operation UNVERIFIED
- **Source components:** [`web/components/space/learning/EditTopicRouteDialog.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/EditTopicRouteDialog.tsx), [`web/components/space/learning/RouteDraftEditor.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/RouteDraftEditor.tsx)
- **Captures / limitation:** [CAP-040](audit/screenshots/snow-1440-040--learning-mastery-audit-missing-record.png), [CAP-138](audit/screenshots/dark-412-040--learning-mastery-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ui-mastery-route-edit) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S121 — Notebook flashcard review

**Target / milestone:** `UI-NOTE-REVIEW` / M7. **Classification:** IN SCOPE.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Due note flashcards; reveal back; remembered/not remembered; source page/block link; export all for Anki
- **User actions:** Reveal; grade; follow source; export; close
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** UNVERIFIED — per-control busy/load behavior; inspect owning state excerpts
- **Empty state:** UNVERIFIED — payload-dependent or not applicable; no generic empty state specified
- **Error state:** UNVERIFIED — exact runtime failure presentation; source evidence index preserves branches
- **Success / completed state:** VERIFIED — owning source renders the named operation/content; successful backend operation UNVERIFIED
- **Source components:** [`web/features/notes/components/NoteReview.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteReview.tsx)
- **Captures / limitation:** [CAP-035](audit/screenshots/snow-1440-035--co-writer.png), [CAP-133](audit/screenshots/dark-412-035--co-writer.png); host state only unless actual form captured
- **Mobile adaptation:** Notebook stack; Save original also hosted by Chat/Learning; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ui-note-review) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S122 — Note source and favorites selection

**Target / milestone:** `UI-NOTE-INSERT-SOURCES` / M7. **Classification:** IN SCOPE.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Sources/favorites selection; block insertion choices
- **User actions:** Select source/favorite; insert source-supported block kind
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** UNVERIFIED — per-control busy/load behavior; inspect owning state excerpts
- **Empty state:** UNVERIFIED — payload-dependent or not applicable; no generic empty state specified
- **Error state:** UNVERIFIED — exact runtime failure presentation; source evidence index preserves branches
- **Success / completed state:** VERIFIED — owning source renders the named operation/content; successful backend operation UNVERIFIED
- **Source components:** [`web/features/notes/components/NoteSourcePicker.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteSourcePicker.tsx), [`web/features/notes/components/NoteFavoritesPicker.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteFavoritesPicker.tsx), [`web/features/notes/components/NoteInsertMenu.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteInsertMenu.tsx)
- **Captures / limitation:** [CAP-034](audit/screenshots/snow-1440-034--co-writer-audit-missing-record.png), [CAP-132](audit/screenshots/dark-412-034--co-writer-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Notebook stack; Save original also hosted by Chat/Learning; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ui-note-insert-sources) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S123 — Note review and generated suggestion margin

**Target / milestone:** `UI-NOTE-REVIEW-MARGIN` / M7. **Classification:** IN SCOPE.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Inline reviews; generated suggestions; anchored thread markers
- **User actions:** Inspect/accept/reject source-supported review; follow thread
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** UNVERIFIED — per-control busy/load behavior; inspect owning state excerpts
- **Empty state:** UNVERIFIED — payload-dependent or not applicable; no generic empty state specified
- **Error state:** UNVERIFIED — exact runtime failure presentation; source evidence index preserves branches
- **Success / completed state:** VERIFIED — owning source renders the named operation/content; successful backend operation UNVERIFIED
- **Source components:** [`web/features/notes/components/NoteInlineReviews.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteInlineReviews.tsx), [`web/features/notes/components/NoteSuggestionContent.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteSuggestionContent.tsx), [`web/features/notes/components/NoteThreadMarkers.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/notes/components/NoteThreadMarkers.tsx)
- **Captures / limitation:** [CAP-034](audit/screenshots/snow-1440-034--co-writer-audit-missing-record.png), [CAP-132](audit/screenshots/dark-412-034--co-writer-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Notebook stack; Save original also hosted by Chat/Learning; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ui-note-review-margin) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S124 — Book learning block family

**Target / milestone:** `UI-BOOK-BLOCKS` / M5. **Classification:** IN SCOPE.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Text/section/callout/code/figure/timeline/flashcards/quiz/deep dive/animation/concept graph/interactive/user note/placeholder blocks
- **User actions:** Use block-specific reveal/answer/play/deep-dive/edit actions
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** UNVERIFIED — per-control busy/load behavior; inspect owning state excerpts
- **Empty state:** UNVERIFIED — payload-dependent or not applicable; no generic empty state specified
- **Error state:** UNVERIFIED — exact runtime failure presentation; source evidence index preserves branches
- **Success / completed state:** VERIFIED — owning source renders the named operation/content; successful backend operation UNVERIFIED
- **Source components:** [`web/app/(workspace)/learning/books/components/blocks/BlockRenderer.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/books/components/blocks/BlockRenderer.tsx), [`web/app/(workspace)/learning/books/components/blocks/FlashCardsBlock.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/books/components/blocks/FlashCardsBlock.tsx), [`web/app/(workspace)/learning/books/components/blocks/QuizBlock.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/books/components/blocks/QuizBlock.tsx), [`web/app/(workspace)/learning/books/components/blocks/InteractiveBlock.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/app/(workspace)/learning/books/components/blocks/InteractiveBlock.tsx)
- **Captures / limitation:** [CAP-037](audit/screenshots/snow-1440-037--learning-books-audit-missing-record.png), [CAP-135](audit/screenshots/dark-412-037--learning-books-audit-missing-record.png); host state only unless actual form captured
- **Mobile adaptation:** Learning stack; Selected learner workflow; preserve source-supported behavior. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ui-book-blocks) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S134 — Shared confirmation

**Target / milestone:** `UI-CONFIRM` / M1. **Classification:** SUPPORTING.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Action-specific destructive copy; confirm/cancel; busy state
- **User actions:** Confirm or cancel the named operation
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** UNVERIFIED — per-control busy/load behavior; inspect owning state excerpts
- **Empty state:** UNVERIFIED — payload-dependent or not applicable; no generic empty state specified
- **Error state:** UNVERIFIED — exact runtime failure presentation; source evidence index preserves branches
- **Success / completed state:** VERIFIED — owning source renders the named operation/content; successful backend operation UNVERIFIED
- **Source components:** [`web/components/ui/ConfirmDialog.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/ui/ConfirmDialog.tsx), [`web/components/space/learning/ConfirmDialog.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/space/learning/ConfirmDialog.tsx)
- **Captures / limitation:** [CAP-033](audit/screenshots/snow-1440-033--chat.png), [CAP-131](audit/screenshots/dark-412-033--chat.png); host state only unless actual form captured
- **Mobile adaptation:** Root / selected-feature owner; Shared navigation, compatibility or feedback supporting selected workflows. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ui-confirm) and [navigation](NAVIGATION_ARCHITECTURE.md).

### S135 — Shared transient feedback

**Target / milestone:** `UI-FEEDBACK` / M1. **Classification:** SUPPORTING.

- **Web route:** No independent route; hosted by parent
- **Visible sections:** Toast feedback; protocol mismatch; settings load status
- **User actions:** Dismiss/retry/recover as offered by owning notice
- **Modals / dialogs / drawers / sheets:** No separate overlay established for this surface; shared host overlays may apply.
- **Loading state:** UNVERIFIED — per-control busy/load behavior; inspect owning state excerpts
- **Empty state:** UNVERIFIED — payload-dependent or not applicable; no generic empty state specified
- **Error state:** UNVERIFIED — exact runtime failure presentation; source evidence index preserves branches
- **Success / completed state:** VERIFIED — owning source renders the named operation/content; successful backend operation UNVERIFIED
- **Source components:** [`web/components/common/ToastViewport.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/common/ToastViewport.tsx), [`web/features/chat/components/turn/ProtocolMismatchNotice.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/features/chat/components/turn/ProtocolMismatchNotice.tsx), [`web/components/settings/SettingsLoadStatusBanner.tsx`](https://github.com/HKUDS/DeepTutor/blob/f7aed0744c36c5afef16a4261c31ebee1208cac2/web/components/settings/SettingsLoadStatusBanner.tsx)
- **Captures / limitation:** [CAP-033](audit/screenshots/snow-1440-033--chat.png), [CAP-131](audit/screenshots/dark-412-033--chat.png); host state only unless actual form captured
- **Mobile adaptation:** Root / selected-feature owner; Shared navigation, compatibility or feedback supporting selected workflows. See [acceptance](MOBILE_PRODUCT_SCOPE.md#ui-feedback) and [navigation](NAVIGATION_ARCHITECTURE.md).


## Tutor composer sync — 2026-11-08

Live Tutor empty, active, recovered/history and waiting/sending states now share `TutorComposer` through `LiveChatScreen`; source frames `Xmj8E` and `eAAWE` were read from current Pen.dev MCP.

Evidence, modified files, API contracts, verification limits and remaining design differences: [Tutor composer sync report](TUTOR_COMPOSER_SYNC.md).
