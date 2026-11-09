import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';

export type CodeToken = { text: string; type?: string };
export function highlight(code: string, language: string): CodeToken[] {
  const aliases: Record<string, string> = { py: 'python', ts: 'typescript', js: 'javascript', sh: 'bash', shell: 'bash' };
  const grammar = Prism.languages[aliases[language.toLowerCase()] ?? language.toLowerCase()];
  if (!grammar || code.length > 30000) return [{ text: code }];
  const flatten = (tokens: (string | Prism.Token)[], inherited?: string): CodeToken[] => tokens.flatMap(token => {
    if (typeof token === 'string') return [{ text: token, type: inherited }];
    return flatten(typeof token.content === 'string' ? [token.content] : Array.isArray(token.content) ? token.content : [token.content], token.type);
  });
  return flatten(Prism.tokenize(code, grammar));
}
