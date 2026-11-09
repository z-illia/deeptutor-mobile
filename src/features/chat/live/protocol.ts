export type ChatEvent = {
  protocol_version: '2.0';
  type: string;
  content?: string;
  session_id?: string;
  turn_id?: string;
  seq?: number;
  status?: string;
  message?: string;
  accepted?: boolean;
  metadata?: Record<string, unknown>;
};
export type ChatModel = { profile_id: string; model_id: string; model_name: string; profile_name?: string; is_active_default?: boolean };
export type ChatRow = { id: number; parent_message_id?: number | null; role: string; content: string; created_at?: string; events?: ChatEvent[] };
export type Conversation = { session_id: string; title: string; messages?: ChatRow[]; preferences?: Record<string, unknown> & { llm_selection?: { profile_id: string; model_id: string }; selected_branches?: Record<string, number>; archived?: boolean }; workspace_mode?: string; session_type?: string; updated_at?: string };

export function websocketUrl(baseUrl: string): string {
  const url = new URL(`${baseUrl.replace(/\/+$/, '').replace(/\/api$/, '')}/ws`);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
}
export function parseChatEvent(raw: string): ChatEvent {
  const event: unknown = JSON.parse(raw);
  if (!event || typeof event !== 'object' || !('protocol_version' in event) || event.protocol_version !== '2.0' || !('type' in event) || typeof event.type !== 'string') {
    throw new Error('The server uses an unsupported chat protocol.');
  }
  return event as ChatEvent;
}
export function answerChunk(event: ChatEvent): string {
  if (event.type !== 'content') return '';
  const meta = event.metadata;
  if (meta?.call_id && !['llm_final_response', 'agent_loop_round'].includes(String(meta.call_kind))) return '';
  return event.content ?? '';
}
export function visibleMessages(session: Conversation): ChatRow[] {
  const rows = session.messages ?? [];
  const selections = session.preferences?.selected_branches ?? {};
  const result: ChatRow[] = [];
  const visited = new Set<number>();
  let parent: number | null = null;
  while (true) {
    const children = rows.filter(row => (row.parent_message_id ?? null) === parent);
    const selected = children.find(row => row.id === selections[String(parent)]) ?? children.at(-1);
    if (!selected || visited.has(selected.id)) break;
    visited.add(selected.id); result.push(selected); parent = selected.id;
  }
  return result.filter(row => row.role === 'user' || row.role === 'assistant');
}

let sequence = 0;
export function commandId() { return `mobile-${Date.now()}-${++sequence}-${Math.random().toString(36).slice(2)}`; }

/** One screen owns one socket. Commands are never resent automatically. */
export class ChatConnection {
  private socket: WebSocket | null = null;
  private opening: Promise<void> | null = null;
  private closed = false;
  private turnId = '';
  private cursor = 0;
  private pendingOpen: ((error: Error) => void) | null = null;
  constructor(private url: string, private onEvent: (event: ChatEvent) => void, private onDisconnect: (message: string) => void) {}
  connect(): Promise<void> {
    if (this.closed) return Promise.reject(new Error('Chat connection is closed.'));
    if (this.socket?.readyState === 1) return Promise.resolve();
    if (this.opening) return this.opening;
    this.opening = new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(this.url);
      this.socket = socket;
      const timer = setTimeout(() => { reject(new Error('Could not connect to the chat server.')); socket.close(); }, 15000);
      this.pendingOpen = reject;
      socket.onopen = () => { clearTimeout(timer); this.pendingOpen = null; resolve(); };
      socket.onmessage = ({ data }) => {
        if (this.closed) return;
        try {
          const event = parseChatEvent(String(data));
          if (event.turn_id && event.type !== 'active_turn_info') {
            if (this.turnId !== event.turn_id) { this.turnId = event.turn_id; this.cursor = 0; }
            if (event.seq && event.seq <= this.cursor) return;
            this.cursor = event.seq ?? this.cursor;
          }
          this.onEvent(event);
        } catch (error) { this.onDisconnect(error instanceof Error ? error.message : 'Invalid chat response.'); }
      };
      socket.onerror = () => { clearTimeout(timer); reject(new Error('Could not connect to the chat server.')); };
      socket.onclose = event => {
        clearTimeout(timer); this.socket = null; this.opening = null; this.pendingOpen = null;
        reject(new Error('The chat connection was closed.'));
        if (!this.closed) this.onDisconnect(event.code === 4001 ? 'Your session has expired. Please sign in again.' : 'Connection lost. Reopen the conversation to recover the response.');
      };
    });
    return this.opening;
  }
  async send(command: Record<string, unknown>) {
    await this.connect();
    if (this.closed || this.socket?.readyState !== 1) throw new Error('Chat is disconnected.');
    this.socket.send(JSON.stringify({ ...command, protocol_version: '2.0' }));
  }
  close() {
    this.closed = true;
    this.pendingOpen?.(new Error('Chat connection is closed.'));
    this.socket?.close();
    this.socket = null;
  }
}
