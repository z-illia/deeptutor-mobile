import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

// Parse source verbatim, including incomplete fences during streaming.
const parser = unified().use(remarkParse).use(remarkGfm).use(remarkMath);
export function parseMarkdown(content: string) { return parser.parse(content); }

export function safeExternalUrl(value: string): string | null {
  try {
    if (value !== value.trim() || /[\u0000-\u0020\u007f]/.test(value)) return null;
    const url = new URL(value);
    return ['https:', 'http:', 'mailto:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
