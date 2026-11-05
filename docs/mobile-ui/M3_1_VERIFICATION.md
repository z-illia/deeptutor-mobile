# M3.1 Verification Report — Chat & Conversations Foundation

Date: 2026-11-05  
Milestone: **M3.1 — Chat & Conversations Foundation** (Submilestone 1 of M3; **M3 overall remains open**)  
Source baseline: DeepTutor v1.7.1 (`f7aed0744c36c5afef16a4261c31ebee1208cac2`)

---

## 1. Executive Summary

M3.1 delivers the foundational Chat and Conversations experience for the DeepTutor Mobile learning companion (`MS-CHAT`, `MS-HISTORY`, `MS-SETTINGS-archive`, and the M3.1 model-selection & attachment subset of `UI-COMPOSER-PICKERS`) using typed local mock repositories (`ChatRepository`) and in-memory state (`ChatProvider`).

All M3.1 quality gates passed:
- **TypeScript (`npx tsc --noEmit`)**: Passed (0 errors).
- **ESLint (`npx expo lint`)**: Passed (0 errors, 0 warnings).
- **Unit & SSR Tests (`npm test`)**: Passed (**24/24 tests**, including M0/M1/M2 regression suites plus 5 new M3.1 domain and repository state machine tests in [`tests/m3-1-chat.test.cjs`](../../tests/m3-1-chat.test.cjs)).
- **Hydration Regression Suite ([`scripts/verify-m3-1-hydration.cjs`](../../scripts/verify-m3-1-hydration.cjs))**: Passed (**84/84 page loads** across `412`, `768`, `1440` × `light`/`dark` × 7 routes × 2 rounds; 0 page errors, 0 console warnings/errors).
- **Browser Interaction Verification ([`scripts/verify-m3-1-interactions.cjs`](../../scripts/verify-m3-1-interactions.cjs))**: Passed (**4/4 configurations** across `412`/`1440` × `light`/`dark` with 24 verification screenshots in [`docs/mobile-ui/verification/M3_1/`](verification/M3_1/)).
- **Android Hermes Export (`npx expo export --platform android`)**: Passed (`_expo/static/js/android/entry-b12fc7ebb0e0c0796bb967164d426e29.hbc`, 5.9 MB).
- **Physical Android Device / Emulator Execution**: **NOT RUN** (`adb` is unavailable on the host environment).

**M3 overall is NOT marked complete.** Advanced M3.2 capabilities (`MS-SESSION-VIEWER`, `MS-FILE-PREVIEW`, full `UI-CAPABILITIES` config cards, `UI-STRUCTURED-REPLY`, `UI-QUIZ`, `UI-RESEARCH`, `MS-FAVORITES`, `MS-FAVORITES-DETAIL`, `UI-FAVORITES-SAVE`) remain explicitly deferred to M3.2.

---

## 2. Implemented Screen IDs & Routes

| Stable ID | Audited Surfaces | Mobile Route(s) | Implementation Files | Status |
|---|---|---|---|---|
| `MS-CHAT` | `S04`, `S05` | `/chat`, `/chat/[sessionId]` | [`src/app/(app)/chat/index.tsx`](../../src/app/(app)/chat/index.tsx), [`src/app/(app)/chat/[sessionId].tsx`](../../src/app/(app)/chat/[sessionId].tsx), [`src/features/chat/ChatWorkspace.tsx`](../../src/features/chat/ChatWorkspace.tsx) | Complete for M3.1 |
| `MS-HISTORY` | `S09` | `/space/chat-history` | [`src/app/(app)/space/chat-history.tsx`](../../src/app/(app)/space/chat-history.tsx), [`src/features/chat/ChatHistoryScreen.tsx`](../../src/features/chat/ChatHistoryScreen.tsx) | Complete for M3.1 |
| `MS-SETTINGS-archive` | `S10` | `/settings/archive` | [`src/app/(app)/settings/archive.tsx`](../../src/app/(app)/settings/archive.tsx), [`src/features/chat/ChatHistoryScreen.tsx`](../../src/features/chat/ChatHistoryScreen.tsx) | Complete for M3.1 |
| `UI-COMPOSER-PICKERS` (M3.1 subset) | `S06` | Embedded in `MS-CHAT` | [`src/features/chat/ModelSelector.tsx`](../../src/features/chat/ModelSelector.tsx), [`src/features/chat/ChatComposer.tsx`](../../src/features/chat/ChatComposer.tsx) | Model selector & local attachments complete; @mention / KB / Notes reference pickers deferred to M3.2 |
| `UI-SHELL` & `MS-SEARCH` integration | `S01`, `S02` | Sidebar / Drawer & `/ui/search` | [`src/features/shell/AppShell.tsx`](../../src/features/shell/AppShell.tsx), [`src/features/chat/OrganizedSessionList.tsx`](../../src/features/chat/OrganizedSessionList.tsx), [`src/features/search/SearchScreen.tsx`](../../src/features/search/SearchScreen.tsx) | Integrated with live `ChatProvider` state |

---

## 3. Implemented UI Components & Architecture

1. **[`src/features/chat/model.ts`](../../src/features/chat/model.ts)**
   - Pure domain types and helpers faithfully ported from DeepTutor web `session-title.ts`, `llm-options.ts`, `session-organization.ts`, and `chat-Navigation.ts`:
     - `isPlaceholderSessionTitle`, `displaySessionTitle`
     - `llmSelectionKey`, `sameLLMSelection`, `formatContextWindow` (`200k ctx`, `1M ctx`)
     - `masteryPathIdOf`, `readingWorkspaceIdOf`, `sessionRoute`
     - `organizeSessionTree`, `buildSidebarEntries`, `collectArchivedConversations`, `archiveCount`
     - `buildVisiblePath`, `selectChildBranch`, `latestChildId`, `tipMessageId`
     - `filterChatHistorySessions`, `exportSessionMarkdown`
2. **[`src/features/chat/repository.ts`](../../src/features/chat/repository.ts)**
   - Deterministic fixture data across workspaces (`ws-general`, `ws-calculus`, `ws-empty`):
     - 5 configured models across Anthropic, OpenAI, Google, and DeepSeek (`INITIAL_LLM_OPTIONS`)
     - Pinned, general, branched (`session-general-1`), tutor-thread (`session-general-tutor-1`), Mastery-linked (`session-mastery-1`), Immersive-Reading-linked (`session-reading-1`), and archived (`session-archived-chat-1`, `session-archived-mastery-1`, `session-archived-reading-1`) sessions
     - Deterministic assistant chunk generator (`buildSimulatedAssistantChunks`) with Markdown headings, lists, and fenced Python code blocks.
3. **[`src/features/chat/ChatProvider.tsx`](../../src/features/chat/ChatProvider.tsx)**
   - In-memory state machine providing:
     - New conversation creation on first send (`session-local-1`, etc.) with route transition `/chat` → `/chat/[sessionId]`
     - Simulated chunked assistant streaming (`liveSessionIds`, `streamingContentBySession`) with cancellation (`stopStreaming`)
     - Branched conversation tree navigation (`selectBranch`), inline user message editing (`editUserMessage`), assistant regeneration (`regenerateAssistantMessage`), turn deletion (`deleteTurn`), and failed submission retry/discard (`retryFailedMessage`, `discardFailedMessage`)
     - Per-session/draft model selection (`selectModel`) and draft/attachment persistence across navigation
     - Session organization (`renameSession`, `organizeSession` for pin/archive/restore/move workspace, `deleteSession`, `deleteAllArchived`).
4. **[`src/features/chat/ModelSelector.tsx`](../../src/features/chat/ModelSelector.tsx)**
   - Compact trigger pill displaying selected model name and `Running` status indicator.
   - Bottom-sheet dialog (`Choose a model`) showing provider subtext, `Default` badge, context window badge (`200k ctx`, `1M ctx`), active checkmark, plus `loading`, `error`, and `empty` catalog states with `Refresh`.
5. **[`src/features/chat/StarterSuggestions.tsx`](../../src/features/chat/StarterSuggestions.tsx)**
   - 5 category pills (`Explain`, `Solve`, `Practice`, `Plan`, `Research`) expanding 3 curated starter prompts per category, plus personal suggestions (`Ideas for you` and `Suggest something else` rotation).
6. **[`src/features/chat/ChatMessageList.tsx`](../../src/features/chat/ChatMessageList.tsx)**
   - User and assistant message bubbles with Markdown headings/lists/inline code and fenced code blocks (respecting `Appearance` settings for line numbers and code wrapping, with `Copy code` feedback).
   - Message actions: `Copy`, inline `Edit` on user messages, `< 1 / 2 >` branch switcher when multiple sibling branches exist, `Regenerate`, `Listen` / `Stop reading` toggle, inline two-step `Delete` turn confirmation, `Stopped` badge on interrupted streams, and failed message `Retry` / `Discard` recovery banner.
7. **[`src/features/chat/ChatComposer.tsx`](../../src/features/chat/ChatComposer.tsx)**
   - Multiline composer with attachment chips, sample attachment picker (including unsupported `.exe` validation error banner), capability picker dialog (with explicit M3.2/M5 deferred notices for `Ask Questions`, `Quiz`, `Research`, `Visualize`, `Video Lesson`), `ModelSelector`, simulated voice input, and unified `Send` / `Stop generating` button.
8. **[`src/features/chat/SessionActionsSheet.tsx`](../../src/features/chat/SessionActionsSheet.tsx) & [`src/features/chat/OrganizedSessionList.tsx`](../../src/features/chat/OrganizedSessionList.tsx)**
   - Shared conversation actions sheet (`Rename chat`, `Pin`/`Unpin`, `Archive`/`Restore from archive`, `Move to workspace`, `Save to favorites — Coming soon (M3.2)`, `Download Markdown` preview/copy modal, and `Delete chat` confirmation dialog).
   - Grouped session tree with `Pinned`, `Recents`, collapsible Mastery Path / Immersive Reading groups, and nested tutor threads.
9. **[`src/features/chat/ChatWorkspace.tsx`](../../src/features/chat/ChatWorkspace.tsx) & [`src/features/chat/ChatHistoryScreen.tsx`](../../src/features/chat/ChatHistoryScreen.tsx)**
   - `MS-CHAT` workspace header with inline editable session title, `History`, `New`, and `⋯` actions, plus `Archived · Restore` banner when viewing an archived session.
   - `MS-HISTORY` (`/space/chat-history`) and `MS-SETTINGS-archive` (`/settings/archive`) with search, conversation type filter (`All conversations`, `Main conversations`, `Tutor threads`), archive status filter (`Active`, `Archived`, `All`), and partitioned archive buckets (`Conversations`, `Mastery Path`, `Immersive Reading`).

---

## 4. Mobile Adaptations Documented

- **Compact Header Inline Rename (`MS-CHAT`)**: On 412px phone viewports, activating inline session title rename temporarily hides the right-side `History / New / ⋯` toolbar buttons so the rename `TextInput`, `Save title`, and `Cancel` buttons have full horizontal width without pointer-event overlap.
- **Bottom-Sheet Pickers**: Desktop popovers and hover menus (`ModelSelector`, `SessionActionsMenu`, capability selector, attachment picker) are adapted into mobile-friendly modal sheets (`Dialog`) with 44–48px touch targets.
- **Explicit M3.2 Handoff Notices**: Visible controls that depend on M3.2/M5 surfaces (`Save to favorites` / `Save to Notebook`, `Ask Questions`, `Quiz`, `Research`, `Visualize`, `Video Lesson`) are never silent no-ops; activating them shows an explicit toast or inline badge indicating the target submilestone (`M3.2` or `M5`).

---

## 5. Verification Results & Screenshots

### Automated Test & Build Summary

| Check | Command | Result | Evidence |
|---|---|---|---|
| TypeScript | `npx tsc --noEmit` | **PASS** (0 errors) | Clean exit |
| ESLint | `npx expo lint` | **PASS** (0 errors, 0 warnings) | Clean exit |
| Unit & SSR Tests | `npm test` | **PASS** (24/24 tests) | [`tests/m3-1-chat.test.cjs`](../../tests/m3-1-chat.test.cjs) |
| Hydration Suite | `node scripts/verify-m3-1-hydration.cjs` | **PASS** (`{"runs":84,"failures":0}`) | [`scripts/verify-m3-1-hydration.cjs`](../../scripts/verify-m3-1-hydration.cjs) |
| Browser Interactions | `node scripts/verify-m3-1-interactions.cjs` | **PASS** (4/4 viewports/themes, 0 errors) | [`interaction-results.json`](verification/M3_1/interaction-results.json) |
| Android Hermes Export | `npx expo export --platform android --output-dir /tmp/deeptutor-m3-1-android` | **PASS** (`entry-b12fc7ebb0e0c0796bb967164d426e29.hbc`, 5.9 MB) | `/tmp/deeptutor-m3-1-android` |
| Native Android Device / Emulator | `adb devices` | **NOT RUN** (`adb` unavailable) | Explicitly unverified on native runtime |

### Captured Verification Screenshots (`docs/mobile-ui/verification/M3_1/`)

| Scenario | 412px Light | 412px Dark | 1440px Light | 1440px Dark |
|---|---|---|---|---|
| 01 — Empty `/chat` & Starter Suggestions | [412-light-01](verification/M3_1/412-light-01-chat-empty.png) | [412-dark-01](verification/M3_1/412-dark-01-chat-empty.png) | [1440-light-01](verification/M3_1/1440-light-01-chat-empty.png) | [1440-dark-01](verification/M3_1/1440-dark-01-chat-empty.png) |
| 02 — Model Selector Sheet (`UI-COMPOSER-PICKERS`) | [412-light-02](verification/M3_1/412-light-02-model-selector.png) | [412-dark-02](verification/M3_1/412-dark-02-model-selector.png) | [1440-light-02](verification/M3_1/1440-light-02-model-selector.png) | [1440-dark-02](verification/M3_1/1440-dark-02-model-selector.png) |
| 03 — Active Conversation, Stopped Stream & Code Block | [412-light-03](verification/M3_1/412-light-03-chat-conversation.png) | [412-dark-03](verification/M3_1/412-dark-03-chat-conversation.png) | [1440-light-03](verification/M3_1/1440-light-03-chat-conversation.png) | [1440-dark-03](verification/M3_1/1440-dark-03-chat-conversation.png) |
| 04 — Conversation Actions Sheet (`SessionActionsSheet`) | [412-light-04](verification/M3_1/412-light-04-conversation-actions.png) | [412-dark-04](verification/M3_1/412-dark-04-conversation-actions.png) | [1440-light-04](verification/M3_1/1440-light-04-conversation-actions.png) | [1440-dark-04](verification/M3_1/1440-dark-04-conversation-actions.png) |
| 05 — Chat History (`MS-HISTORY` `/space/chat-history`) | [412-light-05](verification/M3_1/412-light-05-chat-history.png) | [412-dark-05](verification/M3_1/412-dark-05-chat-history.png) | [1440-light-05](verification/M3_1/1440-light-05-chat-history.png) | [1440-dark-05](verification/M3_1/1440-dark-05-chat-history.png) |
| 06 — Archived History Partitioned Buckets & Restore | [412-light-06](verification/M3_1/412-light-06-archived-history.png) | [412-dark-06](verification/M3_1/412-dark-06-archived-history.png) | [1440-light-06](verification/M3_1/1440-light-06-archived-history.png) | [1440-dark-06](verification/M3_1/1440-dark-06-archived-history.png) |

---

## 6. Known Limitations & Deferred M3.2 Functionality

1. **Physical Android Device / Emulator Verification (`NOT RUN`)**:
   - `adb` and an attached Android emulator/device are not present in this environment. Android Hermes bundle compilation passed (`npx expo export --platform android`), but native keyboard avoidance (`KeyboardAvoidingView`), Android hardware Back button handling, and TalkBack focus order remain unverified on a physical Android runtime until M9 / native device availability.
2. **Source Visual Parity Note**:
   - As documented in `SCREEN_MAPPING.md` and `TRACEABILITY_MATRIX.md`, the original web audit captures for `/chat` (`CAP-032`, `CAP-033`, `CAP-130`, `CAP-131`), `/space/chat-history` (`CAP-023`, `CAP-121`), and `/settings/archive` (`CAP-062`, `CAP-160`) captured frontend readiness/Retry shells without a live backend. M3.1 interior layouts follow the verified DeepTutor web component source (`ChatHome.tsx`, `ChatMessageList.tsx`, `ModelSelector.tsx`, `OrganizedSessionList.tsx`, `SessionActionsMenu.tsx`, `ChatHistoryPage.tsx`, `ArchivedChatsSettingsSection.tsx`) and design tokens.
3. **Deferred M3.2 Functionality (Do Not Mark M3 Complete)**:
   - `MS-SESSION-VIEWER` (`S07` — `SessionActivityPanel.tsx` / `SessionViewerDrawer.tsx`)
   - `MS-FILE-PREVIEW` (`S08` — `FilePreviewDrawer.tsx`)
   - `UI-COMPOSER-PICKERS` remaining reference pickers (`S06` — `@mention` file/KB/note reference popover, Knowledge Base selector, Notes selector)
   - `UI-CAPABILITIES` full parameter configuration cards (`S11` — `CapabilityConfigCard.tsx`)
   - `UI-STRUCTURED-REPLY` (`S12` — `MasteryQuestionCard.tsx` interactive clarifying question card)
   - `UI-QUIZ` (`S13` — `QuizViewer.tsx` inline quiz card and follow-up)
   - `UI-RESEARCH` (`S14` — `ResearchOutlineEditor.tsx` & `ResearchProgressCard.tsx`)
   - `MS-FAVORITES`, `MS-FAVORITES-DETAIL`, `UI-FAVORITES-SAVE` (`S45–S47` — saved-original collections and `SaveToNotebookModal.tsx`)
