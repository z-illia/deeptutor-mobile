# Mobile LaTeX compatibility

## Root cause

Web uses `hasMarkdownMath`, `normalizeMathMarkup`/`processMarkdownContent`, remark-math and rehype-katex with KaTeX CSS. The available web checkout pins KaTeX 0.16.27. It handles additional model delimiter conventions before its Markdown parser. Mobile already had dollar-math AST nodes and a MathJax-to-native-SVG typesetter, but lacked the backslash delimiter/bare-expression recognition. Those inputs stayed text, never reaching the typesetter. Loading and error fallbacks used monospace, making that failure resemble a code block.

The supplied bare health-check expression has another edge case: CommonMark interprets its standalone `=` as a setext H1 underline. The new AST reconciliation recovers a contiguous standalone TeX expression in that case. A fenced `latex` block deliberately remains code, as requested; use dollar/backslash delimiters or a standalone bare expression for rendered math.

## Architecture decision

| Option | Tradeoff |
| --- | --- |
| Native SVG (selected) | Reuses existing dependencies and native content layout; no browser engines per equation, offline, memoized expression components. MathJax base/AMS covers the requested KaTeX-compatible commands. Fonts and some advanced macros differ from KaTeX. |
| KaTeX WebView per expression | Closest font/HTML fidelity but expensive for many inline expressions; separate measurement, baseline, lifecycle and accessibility problems. |
| One WebView for a whole rich response | Avoids per-expression browsers and supports KaTeX/MathML, but requires replacing the native Markdown layout and introducing height measurement, link/copy messaging, and streaming DOM synchronization. Disproportionate for this compatibility fix. |

No dependencies added. Reused unified, remark-parse, remark-gfm, remark-math, micromark/mdast extension APIs, mathjax-full and react-native-svg. No WebView or network assets are needed.

## Implementation

- `src/shared/markdown/math-syntax.ts`: extends micromark with `\(...\)` and single-line `\[...\]` tokens. Markdown code spans/fences and escaped backslashes retain their existing parser protections. AST data retains original math source.
- `parser.ts`: promotes standalone multiline bracket displays and narrowly recognized standalone TeX paragraphs into math nodes; recovers the setext-heading case without changing the source string. Splits display math out of surrounding paragraphs. Recognizes `$$...$$` displays even when fences hug the formula. Rejects loose currency-like single-dollar matches. Completed source text/code and original math values remain intact.
- `math.ts`: base/AMS typesetting (`\text`, `\frac`, `\sum`, `\sqrt`, `aligned`, symbols). Invalid input throws into the component's fallback rather than emitting MathJax's visible error SVG. SVG dimensions now use the TeX ex-to-em ratio at the surrounding 14px size.
- `MathExpression.tsx`: tracks source/display identity so an old equation cannot appear after its source changes. Unclosed display fences wait before typesetting. Loading uses a compact ellipsis; invalid/oversized formulas retain selectable source with ordinary body typography. Successful expressions render as native SVG with source accessibility labels, theme foreground and font scaling. Long display equations scroll horizontally. Inline equations are bounded to viewport width.
- `RichMarkdownRenderer.tsx`: passes incomplete-display state to the shared math component; all existing Markdown surfaces continue using one renderer.

Streaming remains the existing ordered v2 WebSocket transport, with answer chunks appended verbatim. No transport, navigation, composer or API changes were needed. Expression work is deferred through the renderer's existing deferred content updates and memoization; effect cleanup ignores superseded/unmounted results. There are no WebView reloads.

Pen.dev Study response variants `K26Ix` and `jDg4F` were rechecked: 14/22 body, existing dark foreground and compact spacing. Math uses that scale, an 8px vertical block margin, and horizontal scrolling rather than screen overflow.

## Verification

Executed successfully:

- `npm run typecheck`.
- `npm run lint` (no warnings).
- `npm test`: 77 passed, including eight new math tests.
- `npx expo export --platform android --output-dir /tmp/deeptutor-math-android`: Hermes bundle generated successfully.
- `tests/browser/verify-math-rendering.cjs`: web checkout's actual KaTeX compared with the native SVG typesetter for the same health-check, aligned and Cyrillic expressions. At 320/390/1024px, no page overflow or formula-rendering errors; the health-check expression scrolls at narrow widths.

The shared response fixture is `tests/fixtures/math-response.md`. Tests cover inline/display math, multiline equations, Markdown structure, lists, blockquotes, currency, escaped dollars, preserved fenced/inline code, invalid/oversized TeX, Cyrillic, every prefix of a representative stream, component transition to SVG, stale-result rejection and incomplete-fence waiting.

[Comparison screenshot](math-comparison-390.png) · [Browser report](math-browser-report.json).

Reproduce browser comparison with `PLAYWRIGHT_MODULE=<installed-playwright> DEEPTUTOR_WEB_ROOT=<web-checkout> node tests/browser/verify-math-rendering.cjs`. Output defaults to `/tmp/deeptutor-math-rendering`.

## Limits of the evidence

The screenshot compares actual KaTeX HTML and actual SVG output in Chrome; it does not show a running native Android application or the complete production web Study page. An Android device/emulator and adb were unavailable. Native inline SVG baseline, nested scrolling and screen-reader behavior still need device verification.

MathJax and KaTeX are semantically compatible for the requested examples, not pixel-identical. Cyrillic text uses fallback glyphs with different spacing. The native accessibility label contains TeX source rather than KaTeX MathML/speech. Extremely wide inline expressions shrink to fit; authors should use display math for long equations. MathJax-specific/KaTeX-specific advanced macros are not guaranteed interchangeable. Equations over 2,000 characters retain source, as before.

Bare-expression recovery is intentionally limited to standalone paragraphs beginning with recognized structural commands; it does not reinterpret arbitrary prose or code. Multiline backslash display blocks should stand alone; multiline inline backslash expressions embedded in prose should use dollar delimiters. Invalid or incomplete input may temporarily remain source text until completed; it must never show an error SVG or crash the response.

## Runtime correction

The initial isolated tests missed a Metro-incompatible MathJax metadata module. See [Study Session runtime investigation](STUDY_MATH_RUNTIME.md) for the confirmed `__dirname` root cause, scoped resolver fix, live application evidence and route-level regression tests. The actual reported formula was already dollar-delimited.
