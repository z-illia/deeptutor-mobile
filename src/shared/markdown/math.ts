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
  InputJax: new TeX({ packages: ['base', 'ams'], maxBuffer: 5000, maxMacros: 1000 }),
  OutputJax: new SVG({ fontCache: 'none' }),
});
export function typesetMath(source: string, display: boolean) {
  if (source.length > 2000) throw Error('Equation is too large');
  const container = document.convert(source, { display });
  const svg = adaptor.firstChild(container);
  if (!(svg instanceof LiteElement)) throw Error('Invalid equation');
  const width = parseFloat(adaptor.getAttribute(svg, 'width')) * 7;
  const height = parseFloat(adaptor.getAttribute(svg, 'height')) * 7;
  if (!Number.isFinite(width) || !Number.isFinite(height)) throw Error('Invalid equation');
  return { xml: adaptor.outerHTML(svg), width, height };
}
