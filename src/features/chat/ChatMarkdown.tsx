import { RichMarkdownRenderer } from '@/shared/markdown/RichMarkdownRenderer';

/** Compatibility entry point: every rich-content surface uses one renderer. */
export function ChatMarkdown({ content }: { content: string; learning?: boolean }) {
  return <RichMarkdownRenderer content={content} />;
}
