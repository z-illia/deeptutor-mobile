# M0 — Baseline quality and scope isolation

Completed 2026-11-05. Only the first incomplete milestone, M0, was implemented. All six planning documents were reviewed, alongside the current mobile source, audited design/route mappings and installed SDK types. The project uses Expo 58, React Native 0.88 and React 19.3. No backend or production installation was modified.

## Scope and implemented changes

No screen IDs are assigned to M0. **No S01–S135 screen, dialog, sheet or design primitive is marked implemented.** M1 remains pending. No mock repositories, auth flows, localization changes, new navigation structure, dependencies or design tokens were introduced. Existing English/Ukrainian translations, native Home/Explore navigation, assets and theme values remain unchanged.

| File | Change |
|---|---|
| `src/hooks/use-color-scheme.web.ts` | Replace effect-driven hydration state with `useSyncExternalStore`, a stable Appearance subscription and a light server snapshot. Cleanup removes the Appearance listener. Native `use-color-scheme.ts` remains unchanged. |
| `src/components/app-tabs.web.tsx` | Adapt Router's declared slot ref to the installed Pressable element-ref type and explicitly forward it, retaining Router events, href and accessibility props; no casts, dropped ref or navigation redesign. |
| `src/api/client.ts` | Import Axios's named `create`; existing base URL/env validation, timeout and headers unchanged. No requests are made by this fix. |
| `eslint.config.js` | Add explicit Expo flat config with global archive/generated-output ignores; no rule suppression. |
| `tsconfig.json` | Preserve existing strict settings/includes and Expo exclusions; additionally exclude `docs/mobile-ui/audit`. The copied Next/desktop source is reference material, not mobile input. |
| `package.json` | Add `typecheck` and `test` scripts. Existing dependencies and user changes retained; package-lock.json unchanged by M0. Tests use the Node 24 built-in runner without subprocess isolation. |
| `tests/m0-regressions.test.cjs` | Four meaningful regression checks: real hook SSR without browser access; real tab ref/events/accessibility forwarding; TypeScript input scope; ESLint archive/native/web/test scope. Native dependencies are isolated in the Node test harness; this is not a native renderer test. |
| `scripts/verify-m0-web.cjs` | Reproducible optional Playwright browser comparison against running Expo previews. External/backend requests are blocked and cause failure. Baseline diagnostics remain in results; new candidate diagnostics fail the comparison. |
| `IMPLEMENTATION_PLAN.md`, `TRACEABILITY_MATRIX.md` | Check off M0 and record verified progress without advancing any UI surface or M1 item. |
| `verification/M0/` | Baseline/candidate browser results and 12 screenshots. |

Initial application/config fingerprints were recorded before edits. Exactly the three source files above, package.json scripts and tsconfig.json changed among the fingerprinted files. Other application source, app.json, assets, package-lock.json and native theme hook retain their initial hashes. Pre-existing dependency/lockfile edits and untracked API/i18n files were preserved. The audit checkout and original capture files were not edited or deleted.

## Baseline failures and check scope

Before code fixes, scoped root checks reproduced:

- Lint: `react-hooks/set-state-in-effect` in the web theme hook, plus the Axios `import/no-named-as-default-member` warning.
- TypeScript: TS2322 from the Router slot-ref/Pressable-ref mismatch in the web tab button.

The original TypeScript program included 1,582 files: 1,561 archived source files and 21 mobile/generated inputs. After the explicit archive exclusion it contains the same 21 mobile/generated inputs and zero archived inputs. Root native/web mobile sources remain checked. ESLint also checks the new regression and browser scripts; only the copied audit application and generated outputs are excluded.

## Executed checks

| Check | Result | Scope / limit |
|---|---|---|
| `npm run typecheck` (`tsc --noEmit`) | PASS | Strict installed SDK types; agreed mobile scope |
| `npm run lint` (`expo lint`) | PASS, zero errors/warnings | Explicit root Expo config; no auto-config mutation or rule suppression |
| `npm test` | PASS, 4 tests | Node source/SSR/ref/check-scope regressions; not native interaction tests |
| `node --check scripts/verify-m0-web.cjs` | PASS | Browser runner syntax |
| `node scripts/verify-m0-web.cjs` with explicit preview/tool environment below | PASS relative to exact pre-M0 baseline | Both 1440×1000 and 412×915: dark startup, live light switch, keyboard Explore entry, disclosure, browser Back, direct Explore→Home, no backend/provider requests; no new candidate runtime/hydration diagnostics |
| `npx --no-install expo export --platform android --output-dir /tmp/deeptutor-m0-android-export` | PASS | 1,660 modules; Hermes .hbc bundle and 41 assets exported. This is a JS/assets export, **not an APK/AAB build**. |
| Native Android APK/device/emulator tests | NOT RUN — unsupported environment | No Android SDK, adb, configured SDK paths or Gradle executable. Java alone is insufficient. No generated ios/android directories were created or edited. |

TypeScript, lint and unit tests were rerun after the implementation. No service authentication, REST API, WebSocket or provider requests were executed. Expo development tooling serves local bundles; it is separate from backend integration.

## Browser and visual evidence

The temporary baseline source was restored to the exact initial source hashes and served on localhost:8088. The candidate runs on localhost:8087. This independently confirms the existing animation warning rather than assuming it is unrelated. Browser output is recorded in [browser-results.json](verification/M0/browser-results.json).

| State | Exact baseline | Candidate |
|---|---|---|
| Phone dark Home | [baseline](verification/M0/baseline-starter-dark-412.png) | [candidate](verification/M0/candidate-starter-dark-412.png) |
| Phone light Home | [baseline](verification/M0/baseline-starter-light-412.png) | [candidate](verification/M0/candidate-starter-light-412.png) |
| Phone Explore disclosure | [baseline](verification/M0/baseline-explore-expanded-412.png) | [candidate](verification/M0/candidate-explore-expanded-412.png) |
| Desktop dark Home | [baseline](verification/M0/baseline-starter-dark-1440.png) | [candidate](verification/M0/candidate-starter-dark-1440.png) |
| Desktop light Home | [baseline](verification/M0/baseline-starter-light-1440.png) | [candidate](verification/M0/candidate-starter-light-1440.png) |
| Desktop Explore disclosure | [baseline](verification/M0/baseline-explore-expanded-1440.png) | [candidate](verification/M0/candidate-explore-expanded-1440.png) |

Visual review sampled the phone dark candidate and compared baseline/candidate state captures and diagnostics. The candidate retains the starter text/layout and system-theme behavior. No new UI proportions, colors, typography, icons or assets were designed. Reduced motion was used for repeatability; animation frame-by-frame equivalence was not verified.

The original 197 DeepTutor captures and source design remain references for **M1 onward**. M0 does not claim that the retained Expo starter matches DeepTutor. Its purpose is a working code-check/navigation baseline before the design system and shell are implemented. There are no new dialogs/bottom sheets to compare and no new intentional mobile visual adaptations.

### Pre-existing limitation reproduced

Both baseline and candidate emit **one identical React hydration warning per tested viewport** from the unchanged Reanimated `AnimatedIcon` entering animations: server-injected `visibility: hidden` differs from client attributes. The first strict browser run failed on this diagnostic; a baseline comparison was then added and confirmed it predates M0. The application does not suppress it. Candidate browser checks pass for **no new diagnostics**, not for zero existing warnings. Retain this issue for the existing M1 starter-branding/animation adaptation; do not silently count it as fixed.

Keyboard tab activation, click/disclosure and browser Back were exercised. Native Android Back/IME, TalkBack, iOS behavior and native element rendering were **not** executed. The tab ref regression test verifies forwarding, while strict TypeScript verifies compatibility; native device focus behavior remains unverified.

## Reproduce

```bash
npm run typecheck
npm run lint
npm test
npx --no-install expo start --web --port 8087 --localhost
```

For optional browser checks, provide an existing Playwright installation and Chrome executable; no browser dependency was added to the mobile package. In this session Playwright was supplied by the previously installed audit toolchain. With a pre-M0 preview on port8088:

```bash
PLAYWRIGHT_MODULE=/absolute/path/to/playwright \
CHROME_EXECUTABLE=/absolute/path/to/chrome \
M0_BASELINE_URL=http://127.0.0.1:8088 \
M0_WEB_URL=http://127.0.0.1:8087 \
node scripts/verify-m0-web.cjs
```

Without `M0_BASELINE_URL`, the script requires zero runtime/hydration errors and will currently fail on the documented starter animation warning. Evidence is written to `/tmp/deeptutor-m0-verification` unless `M0_OUTPUT_DIR` is supplied. No fixture success or actual backend behavior is asserted.

API references checked before changes: [SDK58](https://docs.expo.dev/versions/v58.0.0/), [Expo custom tabs](https://docs.expo.dev/router/advanced/custom-tabs/), installed Router `TabTrigger.d.ts`, [React external stores/SSR](https://react.dev/reference/react/useSyncExternalStore), [React Native Appearance](https://reactnative.dev/docs/appearance), and [Expo ESLint](https://docs.expo.dev/guides/using-eslint/).

## Next milestone

**M1 — Design primitives and shell scaffolding.** Pending: UI-SHELL/S01, UI-AVATAR-GALLERY/S80, UI-CONFIRM/S134, UI-FEEDBACK/S135, audited palettes/typography/assets and associated accessibility/fixture acceptance. No M1 work was started in this execution.
