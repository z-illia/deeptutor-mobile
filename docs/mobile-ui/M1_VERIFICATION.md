# M1 — Design primitives and shell scaffolding

Execution date: 2026-11-05. **M1 implemented; automated web visual/interaction verification and Android Hermes export passed. Native device verification remains outstanding.** M2 was not started. Assigned surfaces: **S01 / UI-SHELL, S80 / UI-AVATAR-GALLERY, S134 / UI-CONFIRM, S135 / UI-FEEDBACK**. These are foundations and a development gallery, not completed learner feature screens.

## Authority and scope

Read IMPLEMENTATION_PLAN, COMPONENT_MAPPING, SCREEN_MAPPING, NAVIGATION_ARCHITECTURE, MOCK_DATA_SPEC, TRACEABILITY_MATRIX and M0_VERIFICATION. `DESIGN_SYSTEM.md` does not exist. The authoritative substitutes are [audited design](audit/design-system.md), [extracted CSS](audit/design-tokens.json) and COMPONENT_MAPPING. Source is the archived official DeepTutor v1.7.1 checkout at commit `f7aed0744c36c5afef16a4261c31ebee1208cac2`.

**VERIFIED source** describes the archived code; **VERIFIED mobile/web** describes executed browser checks; **PROPOSED adaptation** describes native presentation choices; **UNVERIFIED native** describes device behavior not executed. The original 197 captures remain unchanged. A source screenshot showing Retry does not verify the interior of a dialog or a populated feature.

No REST, WebSocket, OAuth, provider, or authentication integration was added. Existing API files and environment settings were preserved and are not imported by M1. A browser request guard rejected any external or `/api/` request; none occurred. No new dependencies were installed.

## Source-to-mobile mapping

Paths in the source column are relative to `audit/source/web/`; mobile paths are relative to the project root.

| Approved foundation / ID | VERIFIED source | Implementation and behavior |
|---|---|---|
| Theme roles | `app/globals.css`; `features/ui-layout/modern/modern.css` | `src/shared/design/tokens.ts`: all 31 base roles across snow/cream/dark/glass, Modern snow overrides, source shadows and geometry. `DesignProvider.tsx` keeps palette, layout and system resolution separate. CSS Color 4 RGB syntax converts to equivalent RGBA at the renderer boundary; raw source values remain unchanged and tested. |
| Typography | Root layout Geist/Lora; Modern heading/content rules | `fonts.ts`, `Text.tsx`: locally bundled Geist regular/medium/semibold/bold; Lora regular/semibold; semantic heading, body, label, caption, code and learning roles. Classic uses Lora headings; Modern uses Geist. Heading size follows measured usable content: 27 below 640px, otherwise 30 Classic / 32 Modern; source layout-specific leading and tracking are retained. |
| Buttons and icon controls | `shared/ui/Button.tsx`, `shared/ui/IconButton.tsx`; UI Button re-export | `Controls.tsx`: primary/secondary/danger/ghost, sm/md/lg, icon, loading, disabled, focus and pressed; accessible labels and minimum 48dp targets. Native Switch with source track/thumb colors, controlled field with label/hint/error/focus, and selected tabs share audited roles. |
| Layout and content states | `components/layout/FeaturePage.tsx`, source cards/loading/empty conventions | `Layout.tsx`: Surface, PageScaffold, 1180 maximum content width, source Modern top padding 48/64, scrolling and keyboard avoidance. `Feedback.tsx`: LoadingState, Skeleton, EmptyState, ErrorState, retry, semantic chips/alerts. |
| S01 shell | `components/layout/AppShell.tsx`, `components/sidebar/SidebarShell.tsx`, `WorkspaceSidebar.tsx`, `UtilitySidebar.tsx`, `page-sections.ts`, `ShelfIcons.ts` | `features/shell/AppShell.tsx`, `fixtures.ts`: five distinct source shelves, original route identities, local selected location, tablet sidebar, collapse/expand, width limits, hide/reset/reorder and new-conversation selection. Phone drawer has scrim, Escape/native Back handlers. Source custom shelf geometry copied into `ShelfIcons.ts`. |
| S80 session status gallery | `app/(utility)/avatar-preview/page.tsx`, `components/sidebar/SessionAvatar.tsx`, source orb engine | `features/foundation/AvatarGallery.tsx`, `SessionAvatar.tsx`, `shared/design/orb/*`: source six example titles, cycle, 11–14 size choices, 1:1 and 4× samples; ring/unread/failed/running states; play/pause/step and reduced-motion handling. Source pure orb geometry retained; SVG dots replace canvas. |
| S134 confirmation | `components/common/Modal.tsx`; both audited ConfirmDialog owners | `Dialog.tsx`: controlled sm/md/lg/xl Modal, scrollable content, source overlay/surface/border/shadow roles; Cancel initial focus, destructive/default action, busy disabling, failure retention, cancellation, success closure. `use-overlay-focus.web.ts` traps Tab, handles Escape, restores focus. Native Modal provides the native boundary. |
| S135 transient feedback | `components/common/ToastViewport.tsx`; audited notice/banner owners | `Feedback.tsx`: semantic alert/chip roles, timed dismissible root notices, safe-area offset and retry action. No feature-specific protocol/settings logic from later milestones is implemented. |
| Branding | `public/brand/*`, source favicon | `assets/brand/*`: original logo/wordmarks copied byte for byte, source license retained. `app.json` uses original brand images for app/splash/favicon. No logo redesign. |
| Localization | Source ten `app.json` locale bundles | `src/i18n/foundation-messages.json`: exact source vocabulary for en, zh, fr, de, uk, pl, pt, vi, ja, tr, with source English fallback. Existing translations module preserved; design context exposes typed keys. |

## Navigation and local interactions

Expo Router remains the navigator. Root `_layout.tsx` composes safe areas, theme, bundled font loading/retry, status bar, feedback and a headerless Stack. `/` hosts S01. `/explore` is a **development-only component harness**, not an Appearance or General screen; `/avatar-preview` is the specified development gallery. Production builds do not render either harness interior. Original starter Home/Explore are preserved exactly under `src/legacy/` and their reusable components remain in place.

M1 shelf/page selection stores typed local shell location in Router parameters. It does **not** navigate to invented feature screens: later milestones must connect these source route identities to their approved destinations. The center retains the observed source Retry frame. New conversation resets selection to Home/Chat without fabricating messages. Workspace/account menus and search are explicitly M2/S03/S02, not dead M1 controls.

The harness demonstrates every shared control locally: theme/layout/locale selection, text editing and validation, switch/tabs, fixture loading/empty/error/retry, semantic notices/dismissal, and confirmation idle/busy/cancel/failure/success. Failure leaves the dialog open; successful local completion closes it and produces a notice. It changes no records. The typed shell repository contains presentation entries only; there are no fake server DTOs, endpoints, credentials or permission grants. None of the four M1 surfaces requires a backend. Auth/availability/policy behavior belongs to M2 and later owners.

## Visual evidence and comparison

Reproduce against a local Expo dev server (default 8091):

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright CHROME_EXECUTABLE=/opt/google/chrome/chrome node scripts/verify-m1-web.cjs
```

The script uses the already archived Playwright installation, not a new app dependency. Screenshots/results are preserved in [verification/M1/](verification/M1/). Source references remain in [the 197-capture catalog](audit/screenshot-catalog.md).

| New evidence | Compared source / verified scope |
|---|---|
| `shell-snow-{412,768,1440}.png` | CAP-033 snow desktop and CAP-131 dark phone: original logo, source sidebar/content palette, desktop 272px sidebar, Chat location and Retry frame; mobile 48dp header adaptation. |
| `drawer-snow-412.png` | Source sidebar implementation and responsive drawer captures in catalog: 220px drawer, scrim and navigation ordering. Five targets wrap to preserve 48dp hit regions rather than compressing icons. |
| `primitives-{snow,cream,dark,glass}-{412,768,1440}.png` | Raw CSS/source shared component variants; exact computed page backgrounds asserted, Modern border alpha asserted on desktop. These development compositions have no web-screen equivalent. |
| `classic-{412,768,1440}.png`, `ukrainian-{412,768,1440}.png` | Classic heading family asserted; source Ukrainian labels and editable Cyrillic text exercised. |
| `confirm-{412,768,1440}.png`, `confirm-failed-{412,768,1440}.png` | Source Modal/ConfirmDialog structure, tones and dimensions; original route screenshots do not show open confirmation, so full web-runtime dialog parity is unverified. |
| `avatars-{412,768,1440}.png` | Source gallery and SessionAvatar code. CAP-006/CAP-104 show only blocked shell/Retry, so they cannot establish populated-gallery visual equivalence. |
| `browser-results.json`, logs | Three viewport runs; local requests only; zero console errors/page errors; explicit assertion results. |

Manually inspected rendered phone dark primitives, desktop shell, phone drawer, confirmation and failed confirmation, and populated phone avatar gallery. Compared desktop shell side by side with CAP-033 and inspected CAP-104. The initial comparison exposed black borders from RN Web CSS-color parsing; conversion to equivalent RGBA fixed this and a computed-border regression assertion was added. No pixel-perfect claim is made across CSS and native renderers.

## Executed checks

| Check | Actual result |
|---|---|
| `npm run typecheck` | PASS, strict TypeScript, including all new mobile code. |
| `npm run lint` | PASS, no errors/warnings; archived application remains excluded as established by M0. |
| `npm test` | PASS, 8 tests: 4 retained M0 regressions plus exact palettes/Modern resolution, shelf boundaries/width limits, all ten locale vocabularies, source orb geometry and local asset/font integrity. |
| Browser navigation/components | PASS at 412×915, 768×1024, 1440×1000. Source shelf selection; phone drawer Escape; desktop rail/collapse, hide/reset/reorder/resize; theme/system updates; Classic/Modern font; Ukrainian field; switch/tabs; confirmation cancel/success/failure and busy Escape guard; notices; loading/empty/error/retry; avatar phase/size. |
| Browser diagnostics/network | PASS: no browser errors or hydration mismatch in exercised paths; no backend/provider requests. The old Expo animated starter is preserved but is no longer mounted. |
| `npx --no-install expo export --platform android --output-dir /tmp/deeptutor-m1-android-verified` | PASS: Android Hermes `.hbc`, bundled font/brand assets and metadata generated. Export log and manifest preserved with evidence. This is not an APK build or native runtime test. |
| Android APK/device, TalkBack, IME, system navigation | NOT RUN: no Android SDK/emulator/device available. No native project directories created or hand-edited. |

Source and baseline comparison establishes that only `src/app/_layout.tsx`, `src/app/index.tsx`, `src/app/explore.tsx` and `app.json` changed among pre-existing app/config files during M1. The two starter screens match their original hashes in `src/legacy`. Package files, M0 fixes, archived source and original screenshots were preserved. New files are listed in [changed-files.json](verification/M1/changed-files.json); logs are alongside it. M0 documentation was not edited.

## Intentional adaptations, limitations and unresolved checks

- **PROPOSED mobile:** 48dp controls replace smaller web targets; sidebar becomes a 220dp modal drawer below 768. Shelf targets may wrap on narrow drawers. Desktop shelf labels are represented through accessible labels; source selected text-pill details and source section headings are not reproduced exactly. Shared semantic ordering/selection remains intact.
- **PROPOSED shell scaffolding:** location parameters demonstrate future destinations without implementing M2–M9. Sidebar resizing uses explicit increment/decrement controls; arrangement uses move/hide/reset controls instead of pointer drag-and-drop. State is in memory; restart persistence is not claimed.
- **PROPOSED rendering:** source canvas orb uses source geometry rendered as SVG, native switches use platform behavior, and static skeletons/reduced-motion gallery avoid requiring decorative motion. Frame-by-frame canvas/SVG raster parity and live animation performance are unverified. Source SVG shelf paths are preserved; CSS fill classes are adapted to SVG fill opacity.
- **PROPOSED branding integration:** native app icon/adaptive monochrome/splash use original source images. Device launcher masking and splash presentation need a native build. iOS was not built.
- **UNVERIFIED native:** safe areas and status-bar contrast are configured using Expo modules; dialogs/drawer use Modal `onRequestClose`, drawer BackHandler, scrollable content and KeyboardAvoidingView. Browser keyboard Escape and text input were exercised; Android hardware Back, gesture navigation, soft keyboard resizing and TalkBack traversal require a device. Browser results cannot establish them.
- Geist/Lora files are bundled with OFL licenses from [Expo Google Fonts Geist](https://github.com/expo/google-fonts/tree/master/font-packages/geist) and [Lora](https://github.com/expo/google-fonts/tree/master/font-packages/lora); Cyrillic entry was exercised, but native Ukrainian glyph rendering and CJK/system fallbacks need device inspection. Code text uses platform monospace because no loaded source Geist Mono was established.
- The component harness uses English fixture explanations; product foundation labels use all ten source locales. Font loading failure/retry is implemented but corrupt-asset recovery was not fault-injected. Shared field error is demonstrated; no server validation or permission denial is simulated.
- Shared hover/tooltip/pointer affordances are adapted to focus/press and accessible labels on touch. Source dark/glass transparency/shadows use their exact roles; native blur is not invented. The source gallery/dialog interiors were not visually verified in the original backend-blocked audit. Heading layout measures usable rendered text width for the source 640px threshold, including changes caused by sidebar resizing. Native font metrics still need device comparison.

M1 is complete within this documented verification coverage. Native device checks remain explicit follow-up validation, not claimed passes. **Next milestone: M2 — Entry, account, navigation and overview mocks. Stop here; no M2 implementation is authorized by this execution.**
