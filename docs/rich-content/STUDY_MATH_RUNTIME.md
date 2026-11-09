# Study Session math runtime failure

## Confirmed cause

The supplied live Study Session reproduced raw LaTeX even though its API response contained a valid `$$` block. The response's math source uses ordinary newlines and single backslashes. Missing delimiters, legacy rendering and stale source were not the cause of this occurrence.

Development diagnostics confirmed the current `RichMarkdownRenderer` mounted, parsed one math AST node and passed the complete 109-character health-check expression to `MathExpression`. Loading the typesetter then threw **`ReferenceError: __dirname is not defined`**. MathJax's `js/components/version.js` discovers its version using `eval('require')` and `eval('__dirname')`; these Node module globals do not exist in Metro's browser/Hermes module runtime. The component silently converted this load failure into raw body text.

The previous Node-based tests executed MathJax in an environment where these globals existed. SVG comparison screenshots bypassed Metro and the application route. A successful Hermes export established compilation, not execution of the failing module. Those checks did not prove the Study Session worked.

## Small runtime fix

`metro.config.js` retains Expo's default configuration/resolver and redirects only MathJax's internal version metadata module to `src/shared/markdown/mathjax-version.ts`. The replacement reads bundled `mathjax-full/package.json` metadata with a static import. No Node globals, filesystem access, network, global polyfill, third-party edits or renderer replacement are needed. The alias applies to both web and Android resolution.

The active Expo process was verified to belong to this repository and serve port 3000. It was restarted on the same port using `npx expo start --web --port 3000 --lan --clear`, then the actual provided route was reloaded. This restart is necessary for a new Metro configuration to take effect; the fault was the runtime module, not merely a cache.

## Actual mounted path

`/learning/live` route → `LiveLearningScreen` (`view=study`) → `LiveStudyScreen` → `useLiveChat` → `getConversation`/JSON-decoded persisted messages (or ordered WebSocket content concatenation) → `visibleMessages` → exact pending-question split → `ChatMarkdown` compatibility wrapper → `RichMarkdownRenderer` → `parseMarkdown` math AST → `MathExpression` → MathJax TeX/AMS → `SvgXml` from react-native-svg.

Existing Markdown and transport logic remain. No replacement API content was used to verify the user's live route, and no turn was submitted or conversation modified. The historical WebSocket frames for this completed turn were unavailable; streaming was verified separately with a deterministic fixture replay through the same mounted screen and `useLiveChat`.

## Safe development diagnostics

`diagnostics.ts` exposes version `rich-math-runtime-3` and a bounded 64-event buffer at `globalThis.__DEEPTUTOR_RICH_CONTENT__` only in development. History decoding, mounted renderer/AST counts, math input, SVG generation and failures record metadata/fingerprints. No messages, TeX, user/session IDs, cookies, passwords or tokens are retained. Production diagnostics are disabled. `MathExpression` now warns on failed loading/typesetting and on SVG parsing errors instead of falling back silently; the component still recovers gracefully.

## Runtime evidence

The actual supplied Study Session, after the restart, produced:

- Decoded assistant response: 6,091 characters, fingerprint `a2ed6453`.
- Mounted renderer: the same fingerprint and one math node.
- Math input: 109 characters, fingerprint `d059a7df`, exactly matching the formula extracted from the API and the native SVG accessibility label.
- Actual DOM SVG: 75 paths, nonzero dimensions approximately 508.64 × 13.98px; long equation scrolls within the response.
- Raw `\text{health-check latency}` absent from visible body text; no page-level horizontal overflow.

[Sanitized live report](study-math-live-report.json).

An actual live application screenshot was captured at `/tmp/deeptutor-live-study-math.jpg`. It includes the Study header, real response/formula and composer. It is intentionally not committed because it includes real conversation context. [Fixture application screenshot](study-math-integration.png) is committed instead and is labeled as fixture evidence, not the user's live session.

## Regression tests

- `tests/math-runtime.test.cjs` reproduces the upstream `__dirname` error in a Node-global-free VM, validates the compatible metadata module, checks narrowly scoped resolution for web/Android and verifies bounded/production-disabled diagnostics.
- `tests/browser/verify-study-math-runtime.cjs` opens the **actual Expo Study route and all actual rendering components**, intercepting only HTTP/WebSocket data in an isolated browser context. It tests persisted history and an active-turn replay split into 13-character chunks. Both assert renderer version/fingerprint/AST, exact math input, visible SVG paths, no visible raw LaTeX, headings, links, code/copy controls and no page errors. It does not submit writes to the real backend.
- `tests/fixtures/study-math-conversation.json` retains only the exact health-check formula from the reported response, surrounded by synthetic nonprivate test prose.
- The math component regression also exercises SVG failure recovery.

[Integration report](study-math-integration-report.json). Reproduce with `PLAYWRIGHT_MODULE=<installed-playwright> STUDY_BASE_URL=http://expo.deeptutor.local:3000 node tests/browser/verify-study-math-runtime.cjs` against a running dev server.

## Verification boundary

Application-level runtime verification was completed for **Expo Web at the supplied URL**, including the real authenticated session. This URL serves a `platform=web` development bundle; it is not evidence of an Expo Go/development-client Android process.

No Android SDK/adb, device or emulator was available on the host. Native Android execution and native SVG/gesture/screen-reader verification remain unavailable. Android bundle export validates the new resolver's build compatibility but is not reported as device verification. Reload the Android client against the restarted Metro server; a previously embedded/OTA bundle requires rebuilding or updating through its existing release flow.

Executed final checks: `npm test` **80 passed**; `npm run typecheck` and `npm run lint` passed without errors/warnings; both route-level browser integration scenarios passed; `npx expo export --platform android --output-dir /tmp/deeptutor-math-runtime-android` passed. After adding the explicit SVG-failure recovery assertion, the 11 focused math/runtime tests were rerun and passed as well.

Files added/changed for the runtime correction: `metro.config.js`, `src/shared/markdown/mathjax-version.ts`, `diagnostics.ts`, `MathExpression.tsx`, `RichMarkdownRenderer.tsx`, `src/features/chat/live/repository.ts`, the repository test's diagnostic import fixture, runtime tests, route-level browser test, sanitized conversation fixture, and this report/evidence. Earlier math parser work remains separate from the confirmed runtime fix.
