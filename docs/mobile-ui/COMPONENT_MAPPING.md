# Component and design mapping

## Study Session update · 2026-11-09

Reused TutorComposer compact mode, shared transport, ChatMarkdown and existing theme/controls. Added StudyActionRow, StudyResourcesSheet, BottomSheet, and typed strategy/resource/file/draft helpers. No duplicated input or session transport. See [implementation, contracts and verification](../STUDY_SESSION_UPDATE.md).


Revision: 2026-11-05. **Focused mobile companion; UI-only.** This revision supersedes the full-port roadmap. Source baseline: DeepTutor v1.7.1, `f7aed0744c36c5afef16a4261c31ebee1208cac2`.

[Original inventory](audit/screen-inventory.md), [63 page files](audit/route-map.md), [197 captures](audit/screenshot-catalog.md), [design evidence](audit/design-system.md), and [audit limitations](audit/validation.md) are preserved. Previous planning documents are archived in [planning history](planning-history/full-port-baseline/README.md).

VERIFIED means source-confirmed behavior or the actual visible capture state, not successful backend operation. Most captures show shell/Retry, including Task Board CAP-134 inspected in this revision; populated interiors remain visually UNVERIFIED. All mobile layouts, routes added for presentation, and fixture outcomes below are PROPOSED. No new UI or backend integration is implemented by this revision.

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

Preserve all source palettes: `snow` Default; `light` Cream; `dark` Dark; `glass` Glass with dark base; `system` resolves Default or Dark. Modern is the audited layout default. Retained M2 preferences include Classic/Modern selection; fixture layouts are explicit scenarios, not a new product design.

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

Preserve M1 bundled product assets and their original provenance: `web/public/brand/color-logo.png`, `color-word.png` and canonical full/black variants and app icon assets, with source license/provenance. Preserve logo proportions; no redraw. Use audited provider/agent/knowledge-engine assets and dark alternatives selected through the source mapping, not a filename guess. [281-asset manifest](audit/asset-manifest.json) and source-generated icon maps remain authoritative. Preserved starter assets do not define the DeepTutor visual language.

Source lucide-react glyphs map to installed lucide-react-native where actual glyph parity exists; custom ShelfIcons/ComposerIcons/agent/activity marks need source SVG/native adaptation. Keep original icon size/stroke semantics and add touch padding separately. Do not use the installed Expo symbols library to replace product icons arbitrarily.

UI locales: en/zh/fr/de/uk/pl/pt/vi/ja/tr with source fallback behavior. Model output languages and partner reply language are independent settings. Existing en/uk demo translations are preserved but do not define features or terminology. Inline en/zh source labels must be explicitly reconciled; missing source translations remain a tracked gap, not invented feature copy.


## Preserve completed implementation

Retain `src/shared/design/`, `src/shared/ui/`, `src/features/entry/`, `src/features/settings/`, `src/features/resources/`, existing search/shell and development previews. M3 narrows navigation destinations; M8 composes these existing screens with connection/entry policies. No application file is changed in this planning revision. Do not replace source fonts, theme roles, icons or spacing with an unrelated mobile design system.

## Selected source family → mobile component

| Source family (paths relative to audit/source/web) | Proposed phone presentation / interaction | Milestone |
|---|---|---|
| `components/layout/AppShell.tsx; components/sidebar/SidebarShell.tsx; CommandPalette.tsx` | Focused drawer/header/footer; selected-only search; preserve source theme, wordmark and navigation selection | M3/M8 |
| `components/sessions/OrganizedSessionList.tsx; SessionActionsMenu.tsx; components/space/ChatHistorySection.tsx` | Virtualized history, exact source grouping/filter rules, rename/action sheet and delete confirmation | M3 |
| `features/chat/components/ChatWorkspace.tsx; components/chat/home/ChatComposer.tsx; ModelSelector.tsx; ComposerResources.tsx` | Keyboard-safe composer, attachment chips, model catalog sheet, existing resource/tool selection; administration excluded | M3 |
| `features/chat/messages/ChatMessageList.tsx; components/common/*Markdown*; RichCodeBlock` | Stable message rows; incremental Markdown/code rendering, copy/edit/retry and source-owned message actions; accessible stream status | M3 |
| `components/chat/home/SessionActivityPanel.tsx; SessionViewerPanel; components/chat/preview/FilePreviewDrawer.tsx` | Full-height result/file view; preserve owner/tab/file identity; never load external content in fixtures | M3 |
| `components/chat/home/CapabilityConfigCard.tsx; MasteryQuestionCard.tsx; components/quiz/QuizViewer.tsx; components/research/ResearchOutlineEditor.tsx` | Chat-hosted structured replies, quiz and fixed research config/outline/result; no standalone Research product | M3/M4 |
| `components/visualize/VisualizationViewer.tsx; components/math-animator/MathAnimatorViewer.tsx; components/video-lesson/VideoLessonViewer.tsx` | Bundled result/media view with source code/fullscreen controls and explicit unsupported-format states | M5 |
| `components/learning/LearningDashboard.tsx; NewLearningPage.tsx; surfaces.ts` | Four real learning workflows; source item cards/counts and create handoffs, no invented course dashboard | M4/M5 |
| `components/space/learning/TopicAtlas.tsx; CreateTopicWizard.tsx; StudyOutline.tsx; LearningBoard.tsx; ObjectiveDetail.tsx; ReviewTrail.tsx; EditTopicRouteDialog.tsx` | Atlas cards, full-height goal wizard, outline/board switch and objective/review sheet; reset/delete remain distinct | M4 |
| `components/space/learning/MasteryStudy.tsx; ModeSwitch.tsx; SessionCamp.tsx` | Reuse transcript/composer with outline/study/review constraints and fixed assessment progress | M4 |
| `components/learning/practice/PracticePage.tsx; PracticeSession.tsx; PracticeImport.tsx; components/space/question-bank/*` | Focused question route, Bank/Mistakes tabs, category/filter/import sheets; fixed judgments and recall ratings | M4 |
| `app/(workspace)/learning/books/BooksRoute.tsx; components/BookCreator.tsx; SpineEditor.tsx; PageReader.tsx; blocks/BlockRenderer.tsx` | Separate proposal/spine steps, full-width reader, chapter/tutor/capture sheets and block-specific controls | M5 |
| `components/reading/library/*; components/reading/workspace/ReadingWorkspace.tsx; ReaderPane.tsx; ReadingCompanion.tsx; MediaReadingStage.tsx` | Collections/materials, bundled import, anchored reader/transcript and companion; source navigator and annotation sheets | M5 |
| `components/reading/AnnotationPopover.tsx; ReaderDisplayControls.tsx; AnnotationList.tsx` | Selection actions and reader settings retain locators, highlight colors, text preferences and annotations | M5 |
| `features/tasks/components/KanbanBoard.tsx; components/tasks/TaskPanelSection.tsx; TaskColorPicker.tsx; TaskLinkSelector.tsx` | Status-filtered list or horizontally paged columns; UI-TASK-DETAIL sheet; explicit move controls, local date filter, column colors, chat links; no calendar | M6 |
| `components/notebook/NotebookConsole.tsx; NotebookRecordRow.tsx; NotebookRecordActions.tsx; SaveToNotebookModal.tsx` | Saved-original library/detail and save dialog; never edit original record as a note | M3 |
| `app/(workspace)/co-writer/page.tsx; features/notes/components/NoteWorkspace.tsx; NoteEditor.tsx; NoteInsertMenu.tsx; NoteSourcePicker.tsx` | Editable page library/tree/search and phone editor; preserve block structure, revisions, recovery and source identity | M7 |
| `features/notes/components/NoteCompanion.tsx; NoteInlineReviews.tsx; NoteThreadMarkers.tsx; NoteReview.tsx` | Companion/suggestion sheet tied to block/thread; source flashcard review separate from Practice grading | M7 |
| `components/space/LearningJournalPanel.tsx; app/(utility)/settings/progress/page.tsx` | Read-only learning handoff/records and recorded progress; no diary editor or new scoring model | M4/M5 |
| `app/(auth)/login/page.tsx; register/page.tsx; app/(utility)/profile/page.tsx; components/settings/SettingsOverview.tsx; features/settings/sections/AppearanceSettingsSection.tsx` | Preserve M2 forms and preferences; UI-LANGUAGE stays within General; mocked server entry adapts deployment origin, not LLM credentials | M2/M8 |
| `components/ui/ConfirmDialog.tsx; components/common/ToastViewport.tsx; shared/ui/*` | Reuse M1 confirmation/loading/error/empty/feedback primitives with owner-specific semantics | M1/all |

## Renderer and mobile verification gates

M3 must prove long transcripts, partial Markdown fences, code copy/horizontal scroll, math/table content and stream cancellation without remounting all messages. M5 must prove local PDF/EPUB/text selection and locators, synchronized bundled media/transcript, book interactive blocks and visualization failure paths. M7 must prove structured note round-tripping, IME/caret behavior, block reorder by accessible actions and conflict recovery before selecting a native or isolated local-web renderer. Do not promise DOM editor/KaTeX/GeoGebra parity from a Retry screenshot. No dependencies are selected or added by this plan; use the project's Expo-version documentation check before later API/package decisions.

Any isolated web renderer must use bundled content, a typed minimal bridge and blocked outbound navigation/scripts in fixture mode. External YouTube/Bilibili/provider embeds get a local representative fixture and honest unavailable state, never an external request. A missing renderer is a recorded delivery gate, not a reason to present a no-op button as complete. Font scaling, 48dp touch regions, TalkBack names, reduced motion, safe areas, Android Back/IME and large-data list performance require M9 device evidence.

Out-of-scope component families have no native implementation slot: KB/index/source/engine management, provider/LLM/embedding configuration, administration, calendar, partners/groups/channels, agents/imported agent histories, memory workbenches, MCP/CLI management and Whisper. Existing generic icons/components remain preserved but do not authorize those features.


## Tutor composer sync — 2026-11-08

`TutorComposer` reuses Field, Button, FullScreenModal, ListRow and the existing model dialog; learning chips and toolbar are shared across all live Tutor states. `Field` gained optional label styling. The fixture-only legacy composer remains separate.

Evidence, modified files, API contracts, verification limits and remaining design differences: [Tutor composer sync report](TUTOR_COMPOSER_SYNC.md).
