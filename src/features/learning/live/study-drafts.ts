import type { ChatDraft } from '@/features/chat/live/useLiveChat';
/** Unsent private content stays in memory only; bounded and scoped by server/user/workspace/session. */
const drafts = new Map<string, ChatDraft>();
export function readStudyDraft(key: string): ChatDraft | undefined { return drafts.get(key); }
export function saveStudyDraft(key: string, draft: ChatDraft) {
  drafts.delete(key);
  if (draft.text || draft.attachments?.length || draft.configuration) drafts.set(key, draft);
  while (drafts.size > 8) drafts.delete(drafts.keys().next().value!);
}
