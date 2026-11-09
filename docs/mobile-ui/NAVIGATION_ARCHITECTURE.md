# Navigation architecture

## Study Session update · 2026-11-09

Learning routes are unchanged. Hint/defer stay in the same session; Switch path uses the existing paths view, Leave uses the owning path/reader, with confirmation and memory-only draft retention. See [implementation, contracts and verification](../STUDY_SESSION_UPDATE.md).


Revision: 2026-11-05. **Focused mobile companion; UI-only.** This revision supersedes the full-port roadmap. Source baseline: DeepTutor v1.7.1, `f7aed0744c36c5afef16a4261c31ebee1208cac2`.

[Original inventory](audit/screen-inventory.md), [63 page files](audit/route-map.md), [197 captures](audit/screenshot-catalog.md), [design evidence](audit/design-system.md), and [audit limitations](audit/validation.md) are preserved. Previous planning documents are archived in [planning history](planning-history/full-port-baseline/README.md).

VERIFIED means source-confirmed behavior or the actual visible capture state, not successful backend operation. Most captures show shell/Retry, including Task Board CAP-134 inspected in this revision; populated interiors remain visually UNVERIFIED. All mobile layouts, routes added for presentation, and fixture outcomes below are PROPOSED. No new UI or backend integration is implemented by this revision.

## Focused Android-first structure

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

Use Expo Router with one root entry/presentation stack and nested feature stacks under the drawer. Non-route components stay outside `src/app/`. This is a navigation contract, not new Router code; check the installed Expo version and matching documentation before implementation.

The four primary drawer destinations are Chat, Learning, Task Board and Notebook. History is a prominent Chat header action and drawer shortcut; Profile/Settings remain footer actions. No six-item bottom bar, separate Mastery tab, generic Home dashboard, or admin shelf is required. The drawer preserves the audited shell's visual language and gives conversation history room without compressing the composer. One-handed header actions make New chat and History reachable without repeated drawer use.

## Intentional changes from the web

| Web structure | Mobile adaptation | UX justification |
|---|---|---|
| Five shelves with many admin/resource destinations | Four selected feature destinations plus account footer | Keeps learning tasks discoverable without suggesting unsupported management |
| History under Resources; archive under Settings | Both under Chat history; canonical URLs retained | Conversations and their recovery belong together |
| Mastery/Practice/Books/Reading | Nested Learning routes, with recent source-owned items | Preserves actual workflows without four extra primary tabs |
| Co-Writer under Home; Favorites under Resources | Notebook opens editable pages; Saved originals is a separate nested destination | Related capture/edit workflows are discoverable while record types remain distinct |
| Progress under Settings, Journal under Resources | Learning shortcuts to existing canonical paths | Puts learning feedback near study activity |
| Side-by-side readers/editor/companion | Full-width primary content; secondary sheets or retained companion view | Phone text remains readable, source locators and editor selection survive switching |
| Drag-only/hover affordances | Explicit action/move sheets with accessible labels | Touch/TalkBack operation without precision dragging |

## Transition and dependency contracts

| Owner | Entry / next action | Return and identity | Dependency |
|---|---|---|---|
| Entry | No server → /connect → mocked auth status → login/register or /chat; returning selected deep link resumes after auth | Internal allowlisted return path only; invalid/excluded route shows unavailable and a selected-feature return action | M8 composes existing M2 boundary; M3–M7 use a preselected fixture server |
| Chat | New → first send binds sessionId; history → exact chat/mastery/reading owner; rename/delete/pin/archive in context menu | Keep draft, message IDs, scroll and stream lifecycle in repository; deleting active conversation returns new chat; failed delete retains it | M3; Mastery/Reading owner types wired fully in M4/M5 |
| History | Search/kind/archive filters → result; group expand/collapse; archived list → restore/permanent chat delete | Search results are flat (source disables manual grouping there); normal groups come from mastery paths/reading collections, not invented arbitrary folders | S09 SessionActionsMenu/OrganizedSessionList; M3 |
| Composer | Model/tool/capability/resource sheet → staged selection → submitted turn snapshot | Cancel retains prior selection; no provider edit, credentials, partner/group creation, agent connection or memory administration | M3; selected Books/Reading/question pickers completed with M4/M5; task links M6 |
| Learning | /learning → actual surface/item; /learning/new → corresponding goal/book/import/material flow | Continue learning reopens source record, saved page/locator or persisted session; no new curriculum engine | M4 hub, M5 materials; unavailable/later feature entries explain availability rather than inert Retry |
| Mastery | Atlas → goal/source wizard → Outline conversation → path detail → objective → Study/Review → report/trail | pathId + contentWorkspaceId + optional sessionId; persisted mode wins over entry default; mode switch disabled during live turn; reset differs from delete | Chat streaming/questions M3; M4 mastery fixtures |
| Practice | Due summary or Bank/Mistakes selection → run → answer/reveal/judgment → source rating → completion | Stable run/question reference; do not advance twice; retain scope of cross-workspace questions; fixed review schedule data | M4, separate from generated Quiz and notebook flashcards |
| Books | Library/create → proposal → editable spine → reader/page → tutor/capture | bookId/pageId/block locator; Back preserves place; creation route distinct from dynamic ID | M5 renderer; saved-original dialog M3 |
| Reading | Library/materials/folder → material locator → reader/companion → selected session; Build Mastery Path opens S19 | reading workspaceId is collection ID, never contentWorkspaceId; preserve source unit/time and annotation selection | M5; Mastery M4; note editing handoff completes M7 |
| Task Board | /kanban → card detail/editor sheet → save/move/archive/restore → same filtered board; linked chat opens owning session | taskId + workspace + revision; failed action retains card/draft; date is local YYYY-MM-DD; status color belongs to column | M6, M3 chat links; calendar schedule block is excluded |
| Notebook | /co-writer → create/open page → edit/save/subpage/source/companion/review; Saved originals → collection → record | docId/page/block/thread/revision distinct from notebookId/recordId; source jumps retain return context; drafts survive failures | M7; M3 saved originals, M5 locators |
| Settings | Profile/footer → General/language or Appearance; change server via /connect | Active versus staged preferences; apply/discard retains M2 behavior; server switch confirmation clears old simulated identity/content and restores correct scoped data | M8; no advanced settings dispatcher |

## Back, restoration, links and retained UI

Android Back closes the IME, then dismissible overlay, then feature history; busy operations follow their source dismissal policy. Root Back follows platform exit behavior, not a navigation loop. Modal close restores trigger focus. Switching primary destinations preserves scoped drafts, filters and positions; changing server/account/workspace prevents stale scoped results from appearing in the new scope. Workspace switching selects existing scopes only; no server folders, bindings or workspace management.

Keep selected web URL patterns and validated IDs from `web/lib/learning-routes.ts`. Route aliases may resolve only into selected owners: `/`→`/chat`, `/settings` and `/settings/overview`→`/settings/general`, legacy books/mastery/reading/watching→their verified canonical owner. S38 is a compatibility adapter, not a Watching feature. Do not register excluded admin/settings/partner/memory routes just to satisfy the old 63-page parity target. The original route map remains evidence, not a mobile route mandate.

Full-height presentations: `/ui/search`, `/ui/session-viewer`, `/ui/file-preview`, `/ui/mastery-create`, `/ui/practice-import`; all are proposed mobile presentation paths. Short sheets are owner-local typed state: model/tool/filter/action, task detail, language, sources, objective, page tree and confirmations. Long note/book forms keep their existing MS screen identities. No payloads, passwords, file bytes or tokens in route params.

M0–M2 code is unchanged by this task. M3 will apply the focused navigation/search allowlist while retaining the existing `/space` and `/personalization` implementation as optional support pages. Their out-of-scope tiles and the Profile handoff link must be omitted from the focused learner entry set or show an explicit web-only explanation; they must not trigger new mobile administration work. The stored components, design choices, translations and verification artifacts remain intact. M8 verifies this integration. Development galleries remain development-only.


## Tutor composer sync — 2026-11-08

Existing `/chat`, `/chat/[sessionId]`, `/space/chat-history` route ownership is unchanged. Toolbar and learning choices use existing full-screen modals, preserving the current draft and conversation. No additional routes or fixture providers are introduced.

Evidence, modified files, API contracts, verification limits and remaining design differences: [Tutor composer sync report](TUTOR_COMPOSER_SYNC.md).
