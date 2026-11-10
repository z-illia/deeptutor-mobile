# Live mobile chat

`/chat`, `/chat/[sessionId]`, and `/space/chat-history` use this module.
The mobile Tutor entry (`/chat`) and the former conversation mock screens
redirect to these routes. The screen uses the existing theme, controls, Markdown
renderer, safe areas, keyboard avoidance and mobile bottom navigation.

The HTTP client uses the API server chosen on the login screen and includes
session cookies. Reads:

- `GET /api/sessions?limit=50&offset=…` — paginated conversation history.
- `GET /api/sessions/{id}` — persisted messages and selected branch.
- `GET /api/settings/llm-options` — account-visible models, with `profile_id` and
  `model_id` (provider/model display names are not request identifiers).

Text turns use `/ws`, with `ws:`/`wss:` matching the configured origin. The socket
sends protocol version `2.0` and `start_turn`, `cancel_turn`, `check_active_turn`,
`subscribe_turn`, and plain-text `submit_user_reply` commands. A new turn gets a
client submission ID. Commands are not automatically resent after a disconnect.
Content chunks are filtered to published answer calls and deduplicated by turn
sequence. After `done`, persisted messages/IDs are reloaded before another send.
Reopening or reloading a conversation checks for an active turn and subscribes
to its replay. Leaving the screen closes its subscription; it does not cancel
the server turn. Use Stop response to request cancellation explicitly.

## Contract sources

HTTP contract downloaded from `http://deeptutor.local:8001/openapi.json`.
WebSocket routes are absent from that OpenAPI document. Wire behavior was read
from the local `deeptutor-source` checkout at `f7aed0744`:

- `deeptutor/api/contracts/turn_protocol.py`
- `deeptutor/core/turn_request.py`
- `deeptutor/api/routers/unified_ws.py`
- `deeptutor/services/model_selection/llm.py`
- `web/lib/stream.ts`

## Verification

- `npx expo lint`, `npx tsc --noEmit`, locale contract check.
- `node --test --test-isolation=none tests/*.test.cjs` — includes actual local
  HTTP/WebSocket transport tests. Opening test ports requires network permission.
- `tests/browser/verify-live-chat.cjs` — 390×844 browser flow with a stateful
  contract-based stand-in: model selection IDs, streaming, history, parent IDs,
  cancellation, persisted reload and active response recovery after disconnect.
  It intercepts HTTP/WebSocket traffic; it makes no live inference calls. Run
  against Expo web with `BASE_URL`, `PLAYWRIGHT_MODULE`, and optionally
  `CHROME_EXECUTABLE` set. Screenshot defaults to `/tmp/deeptutor-live-chat.png`.
- The real `/api/sessions` returned 401 without a session, as expected.

A successful turn against the real server requires an authenticated account and
configured model and remains unverified. Native cookie sharing with WebSocket
also needs an iOS/Android device check. Browser access requires the backend to
allow the web origin and credentialed cookies. The local source checkout may
need comparison with the deployed server if its protocol version differs.

The live screen also exposes scoped rename, pin, archive, move and delete actions
through `SessionActionsSheet` and the existing session HTTP repository. Rename
updates the heading without reloading the socket or discarding the input draft.
The resource sheet reuses Learning's API-backed source picker and attachment
policy/file preparation, passing real reference IDs and files into turn commands.
MCP choices come from the per-user `/space/mcp/servers` catalog. The old numbered
Tutor routes open these live controls; action routes open the conversation
library, with `sessionId` selecting a particular conversation's action menu.

Advanced capability cards and branching controls remain outside this text chat
surface. Fixture messages are never merged into live history.
