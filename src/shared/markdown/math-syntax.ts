import { markdownLineEnding } from 'micromark-util-character';
import type { Processor } from 'unified';
import type { Tokenizer, State } from 'micromark-util-types';
import type { Extension as FromMarkdownExtension } from 'mdast-util-from-markdown';
declare module 'mdast-util-math' {
  interface InlineMathData { displayMath?: boolean; originalMathSource?: string }
  interface MathData { pendingMath?: boolean; originalMathSource?: string }
}

declare module 'micromark-util-types' {
  interface TokenTypeMap { tutorMath: 'tutorMath' }
}

/** Extend the existing parser, so code spans, fences and escaped backslashes stay protected. */
export function remarkMathDelimiters(this: Processor) {
  const data = this.data();
  const tokenize: Tokenizer = function (effects, ok, nok) {
    let close = 0;
    let escaping = false;
    const start: State = code => {
      if (code !== 92) return nok(code);
      effects.enter('tutorMath'); effects.consume(code); return opening;
    };
    const opening: State = code => {
      if (code !== 40 && code !== 91) return nok(code);
      close = code === 40 ? 41 : 93;
      effects.consume(code); return inside;
    };
    const inside: State = code => {
      if (code === null) return nok(code);
      if (markdownLineEnding(code)) return nok(code);
      if (code === 92 && !escaping) { effects.consume(code); return closing; }
      escaping = false;
      effects.consume(code); return inside;
    };
    const closing: State = code => {
      if (code === close) { effects.consume(code); effects.exit('tutorMath'); return ok; }
      // A doubled backslash belongs to TeX (for example an aligned row break).
      escaping = code === 92;
      return inside(code);
    };
    return start;
  };
  const extension: FromMarkdownExtension = {
    enter: { tutorMath(token) { this.enter({ type: 'inlineMath', value: '' }, token); this.buffer(); } },
    exit: { tutorMath(token) {
      this.resume();
      const node = this.stack[this.stack.length - 1];
      if (node.type === 'inlineMath') {
        const raw = this.sliceSerialize(token);
        node.value = raw.slice(2, -2);
        node.data = { ...node.data, displayMath: raw[1] === '[', originalMathSource: raw };
      }
      this.exit(token);
    } },
  };
  (data.micromarkExtensions ??= []).push({ text: { 92: { name: 'tutorMath', tokenize } } });
  (data.fromMarkdownExtensions ??= []).push(extension);
}
