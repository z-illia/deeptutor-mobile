import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import type { Root, RootContent, PhrasingContent } from 'mdast';
import { remarkMathDelimiters } from './math-syntax';

// Parse source verbatim, including incomplete fences during streaming.
const parser = unified().use(remarkParse).use(remarkGfm).use(remarkMath).use(remarkMathDelimiters);

/** Reconcile model math with web conventions using source-backed AST nodes, never rewriting code. */
export function parseMarkdown(content: string): Root {
  const tree = parser.parse(content);
  const source = (node: RootContent) => {
    const raw = content.slice(node.position?.start.offset, node.position?.end.offset);
    const indent = (node.position?.start.column ?? 1) - 1;
    return raw.split('\n').map((line, i) => i && /^[ >\t]*$/.test(line.slice(0, indent)) ? line.slice(indent) : line).join('\n');
  };
  const visit = (parent: Root | RootContent) => {
    if (!('children' in parent)) return;
    const result: RootContent[] = [];
    const siblings = parent.children as RootContent[];
    for (let index = 0; index < siblings.length; index++) {
      const node = siblings[index];
      // CommonMark can interpret a standalone '=' in bare TeX as a setext heading.
      // Recover only a contiguous prose block beginning with an explicit math command/delimiter.
      const proseNode = node.type === 'paragraph' || node.type === 'heading';
      const rawNode = proseNode ? source(node) : '';
      const bracketBlock = rawNode.startsWith('\\[');
      const bareBlock = /^\\(?:text|frac|dfrac|tfrac|sqrt|sum|prod|int|begin|lim)\b/.test(rawNode);
      if (proseNode && (bracketBlock || bareBlock) && node.children.every(child => ['text', 'emphasis', 'strong', 'break'].includes(child.type))) {
        let last: RootContent = node;
        let lastIndex = index;
        let raw = rawNode;
        while ((bracketBlock ? !raw.trimEnd().endsWith('\\]') : last.type === 'heading') && lastIndex + 1 < siblings.length) {
          const next = siblings[lastIndex + 1];
          if (!['paragraph', 'heading'].includes(next.type) || next.position?.start.line !== (last.position?.end.line ?? 0) + 1) break;
          raw += '\n' + source(next); last = next; lastIndex++;
        }
        if (!bracketBlock || raw.trimEnd().endsWith('\\]')) {
          index = lastIndex;
          result.push({ type: 'math', value: bracketBlock ? raw.trimEnd().slice(2, -2) : raw, data: { originalMathSource: raw }, position: { start: node.position!.start, end: last.position!.end } }); continue;
        }
      }
      if (node.type === 'inlineMath') {
        const raw = source(node);
        node.data = { ...node.data, originalMathSource: raw };
        // remark-math accepts currency prose and surrounding spaces. Match the web's tight rule.
        if (raw.startsWith('$') && !raw.startsWith('$$') && (node.value !== node.value.trim() || /^\d[\d.,]*\s+(?:and|or|та|і|або)\s*$/u.test(node.value))) {
          result.push({ type: 'text', value: raw, position: node.position }); continue;
        }
        if (raw.startsWith('$$')) node.data = { ...node.data, displayMath: true };
      }
      if (node.type === 'math') {
        const raw = source(node).trimEnd();
        const opening = raw.match(/^\${2,}/)?.[0] ?? '$$';
        node.data = { ...node.data, originalMathSource: raw, pendingMath: !raw.slice(opening.length).trimEnd().endsWith(opening) };
      }
      visit(node);
      if (node.type === 'paragraph' && node.children.some(child => child.type === 'inlineMath' && child.data?.displayMath)) {
        let inline: PhrasingContent[] = [];
        const flush = () => { if (inline.some(child => child.type !== 'text' || child.value.trim())) result.push({ ...node, children: inline }); inline = []; };
        for (const child of node.children) {
          if (child.type === 'inlineMath' && child.data?.displayMath) { flush(); result.push({ type: 'math', value: child.value, data: { originalMathSource: child.data.originalMathSource }, position: child.position }); }
          else inline.push(child);
        }
        flush();
      } else result.push(node);
    }
    // Each replacement retains its original semantic category except display math promoted out of paragraphs.
    parent.children = result as typeof parent.children;
  };
  visit(tree);
  return tree;
}

export function safeExternalUrl(value: string): string | null {
  try {
    if (value !== value.trim() || /[\u0000-\u0020\u007f]/.test(value)) return null;
    const url = new URL(value);
    return ['https:', 'http:', 'mailto:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
