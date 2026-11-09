// Loaded only when an equation is present. No DOM, network, HTML, or WebView.
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { SVG } from 'mathjax-full/js/output/svg.js';
import { LiteElement } from 'mathjax-full/js/adaptors/lite/Element.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import 'mathjax-full/js/input/tex/ams/AmsConfiguration.js';
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const document = mathjax.document('', {
  InputJax: new TeX({ packages: ['base', 'ams'], maxBuffer: 5000, maxMacros: 1000, formatError: (_jax: unknown, error: Error) => { throw error; } }),
  OutputJax: new SVG({ fontCache: 'none' }),
});
export function typesetMath(source: string, display: boolean) {
  if (source.length > 2000) throw Error('Equation is too large');
  const container = document.convert(source, { display });
  const svg = adaptor.firstChild(container);
  if (!(svg instanceof LiteElement)) throw Error('Invalid equation');
  const width = parseFloat(adaptor.getAttribute(svg, 'width')) * (14 * 0.442);
  const height = parseFloat(adaptor.getAttribute(svg, 'height')) * (14 * 0.442);
  if (!Number.isFinite(width) || !Number.isFinite(height)) throw Error('Invalid equation');
  // react-native-svg camel-cases unknown data-* attributes and forwards them to
  // the DOM. These MathJax debugging markers do not contribute to SVG geometry.
  const removeMetadata = (element: LiteElement) => {
    adaptor.removeAttribute(element, 'data-c');
    adaptor.removeAttribute(element, 'data-mml-node');
    for (const child of adaptor.childNodes(element)) if (child instanceof LiteElement) removeMetadata(child);
  };
  removeMetadata(svg);
  return { xml: adaptor.outerHTML(svg), width, height };
}
