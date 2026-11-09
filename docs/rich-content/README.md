# Mobile rich educational content

## Audit and root causes

The old `ChatMarkdown` split source into lines, trimmed every line, discarded empty lines, and recognized only a few heading prefixes, bold spans, inline backticks, and triple-backtick fences. It could not preserve CommonMark paragraphs, nesting, links, tables, or many valid fence forms. Its Learning override used 18/26 body text. Code lived in ordinary wrapping Text with no horizontal viewport or syntax highlighting. `ChatMessageList` contained a second independent parser with even fewer inline features, wrapping/clipping code, and per-line learning text.

The replacement was checked against the connected Pen.dev document `deep-tutor-app-2.pen`: Study `FqRwt`, response variants `K26Ix`, `sBRzP`, `zbzER`, `jDg4F`, and reusable Markdown patterns `WXefT`, `xivv4`, `S8aaf`, `RoDnF`. The response variants specify Inter 14/22 body, 12px paragraph gaps, 21/27 H1, 18/24 H2, 16/22 H3, 15/21 H4, and 12/19 monospace code. Existing theme colors and geometry are reused. The older Study base frame still has 18px explanation text; the four newer response patterns supply the content typography.

The available web checkout at `/tmp/deeptutor-ui-audit/source/web` uses ReactMarkdown, remark-gfm, optional remark-math/KaTeX, custom elements, and display normalization (`components/common/RichMarkdownRenderer.tsx`, `lib/markdown-display.ts`). This is an available audit checkout, not a verified current upstream revision. Mobile shares the CommonMark/GFM/math parser family; it renders native elements instead of HTML.

## Architecture and changed files

- `src/shared/markdown/parser.ts`: one frozen unified/remark parser, source passed verbatim; URL allowlist.
- `RichMarkdownRenderer.tsx`: memoized native AST rendering; deferred updates, per-content parse memoization, heading hierarchy, paragraphs, emphasis, inline code, lists/task lists, blockquotes, rules, links/references, compact horizontally scrolling tables.
- `CodeBlock.tsx`, `highlight.ts`: native horizontally scrolling preformatted code, language label, accessible copy action using existing Expo Clipboard, localized errors, feedback timer cleanup, memoized Prism tokens. Python, TypeScript, JavaScript, JSON, Bash, SQL and plain text; common language aliases supported. Unknown languages remain readable. Blocks over 30,000 characters skip highlighting to limit tokenization costs.
- `MathExpression.tsx`, `math.ts`: dollar-delimited inline/display TeX via remark-math, MathJax base/AMS to self-contained SVG paths, existing react-native-svg. Typesetter initializes on demand. Font scaling applies to SVG dimensions. Display equations scroll horizontally; failed/incomplete or oversized equations retain source text. Conversion is bounded to 2,000 characters with macro/buffer limits. MathJax adds bundle weight; dynamic import defers initialization, not necessarily native bundle inclusion.
- `src/features/chat/ChatMarkdown.tsx`: compatibility wrapper for Study, Tutor, Reader, reports, scratchpads, previews, and older learning surfaces. `learning` remains accepted for existing callers but typography is shared.
- `src/features/chat/ChatMessageList.tsx`: removes the competing parser and uses the shared renderer. Artifact/actions/branch controls remain.
- `package.json`, lockfile: added unified, remark-parse, remark-gfm, remark-math, prismjs, @types/prismjs, mathjax-full. Reused React Native, Expo Clipboard, native SVG and existing fonts. No native dependency or WebView added.
- `src/i18n/locale-contract.json`, ten locale bundles: new error/accessibility strings, using English fallback entries for newly introduced copy.
- `tests/rich-markdown.test.cjs`, shared test loader, Markdown fixture, browser verification script: parser/component/action/layout coverage.

Links show their label in the theme accent with underlining and accessibility link role. Only absolute HTTP, HTTPS and mailto URLs without credentials/control characters open through React Native Linking. Unsupported addresses and opening failures show an alert. Relative/backend file links do not open automatically. Raw HTML is displayed as text, never executed; images show alt text rather than fetching remote resources.

## Streaming and malformed headings

`ChatConnection` receives ordered WebSocket v2 events and deduplicates replay with turn/sequence IDs. `answerChunk` filters published answer events. `useLiveChat` appends `row.content + chunk` without trimming or normalizing answer whitespace. Persisted messages are loaded from server history. Structured question splitting only separates the exact backend pending prompt; it does not rewrite the explanation.

No new transport was added. The parser accepts incomplete fenced blocks and incomplete inline syntax, reparsing changed content as more text arrives. Unchanged messages and code blocks retain memoized results. Existing Study/Tutor FlatLists, bottom-follow thresholds and keyboard-avoiding sibling composers remain intact; reading earlier messages does not deliberately trigger follow-to-bottom.

`paragraph.## heading` is malformed source under CommonMark. A newline-separated heading now parses correctly. There was no raw captured response for the reported Ukrainian example in the available checkout, and no authenticated response was captured during this task. The exact upstream cause is therefore unconfirmed. No arbitrary newline insertion or global regex repair was introduced. A regression test preserves literal hashes in code and URLs and distinguishes malformed source from a valid heading boundary. If the issue recurs, capture the affected v2 content events and persisted message to locate the lost boundary before adding a repair.

## Verification

Executed:

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: 65 passed, including nine new renderer tests. Full suite ran with local networking enabled for its HTTP/WebSocket test servers.
- `npx expo export --platform android --output-dir /tmp/deeptutor-rich-android`: passed; Hermes bundle generated. This verifies bundling, not device execution.
- Browser layout script at 320, 390 and 768px: no page-level horizontal overflow; code and table viewports scroll independently. Same representative Ukrainian/English response also rendered through the web checkout's ReactMarkdown + GFM + math pipeline; six headings and labeled documentation link verified.

Reproduce component/parser tests with `node --test --test-isolation=none tests/rich-markdown.test.cjs`. Browser script uses an installed Playwright via `PLAYWRIGHT_MODULE`, optional `CHROME_EXECUTABLE`, and optional `DEEPTUTOR_WEB_ROOT` to produce the desktop reference. Output defaults to `/tmp/deeptutor-rich-markdown`.

[Mobile screenshot](mobile-390.png), [desktop parser reference](desktop-parser-reference.png), [layout report](browser-report.json).

Screenshots use real React Native Web primitives rendered to static HTML. The desktop reference uses the same parser dependencies as web with minimal reference CSS, not the full production web component. Neither screenshot exercises hydration, native SVG equation rendering, clipboard dispatch, keyboard behavior, or live streaming interactions. Equations in static screenshots show readable TeX fallback because effects do not run during SSR. Unit tests exercise SVG generation and clipboard/link action callbacks separately.

## Remaining validation and limitations

- No Android emulator/device was available. Verify keyboard anchoring, horizontal gesture arbitration, Android back navigation, font scaling, inline code background/baseline and SVG equation accessibility on device. Existing navigation/composer logic was preserved.
- Production desktop/mobile visual parity and a fresh authenticated backend response comparison remain to be checked against the current web checkout/server.
- Incomplete links display their unfinished source until valid Markdown arrives; content is never guessed or destructively normalized.
- Math supports dollar delimiters, backslash inline/display delimiters and narrowly recognized standalone TeX. See [math compatibility update](MATH_RENDERING.md) for current behavior, tests and remaining differences from KaTeX.
- Native inline Text padding/corner appearance varies by platform. Tables use consistent 160px columns to retain alignment and readability at narrow widths.
- Existing fixture appearance controls for code wrapping/line numbers no longer affect rich code output: shared code rendering consistently preserves full source and horizontal scrolling.
- New locale strings currently use English fallback translations; existing translated controls are reused.
