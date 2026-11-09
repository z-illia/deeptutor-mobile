# Resource counters

The `/space` screen was removed earlier. The current Library (`/mobile/26`) and Personalization (`/mobile/65`, including the `/personalization` alias) now use `ResourceHubScreen` and independent server counters. The unused fixture generator `readTiles`, `accountCounts` and workspace-based arithmetic were deleted. `resources/repository.ts` retains navigation metadata only.

| Counter | Existing endpoint | Semantics |
| --- | --- | --- |
| Conversations | `GET /api/sessions?limit=200&offset=…&dt_workspace=…` | All pages, unique IDs; excludes archived and nested sessions |
| Favorites | `GET /api/notebooks?dt_workspace=…` | Collections, not saved-record total |
| Knowledge bases | `GET /api/knowledge-bases/list?dt_workspace=…` | Workspace-visible bases; accepts the backend array or `knowledge_bases` envelope |
| Questions | `GET /api/question-notebook/entries?limit=1&dt_workspace=…` | Uses the server's `total`, not the returned page length |
| Partners | `GET /api/partners/navigation` | Actor-visible partners |
| Personas | `GET /api/personas` | Actor-visible persona catalog |
| Skills | `GET /api/skills/list` | Account skill catalog; no invented workspace filter |
| Connectors | `GET /api/space/mcp/servers` | Keys of the caller's own `servers`; excludes `deployment.servers`; does not claim live connection status |
| CLI apps | `GET /api/space/cli-apps/apps` | Only entries with both `granted` and `enabled` true |
| Subagents | `GET /api/subagents/connections` | Existing account connections |

Memory, authored notes and the learning journal have no numeric badge here. Fixed source copy such as “2 pages”, “6 libraries”, “3 response styles”, “5 installed playbooks” and “0 of 8 connected” is not rendered by these routes.

Each counter has independent loading/ready/error state. Empty server arrays produce a real zero. Failed, forbidden, malformed and cross-workspace responses produce Unavailable and an error, never a fabricated zero. Refresh and refocus reload counters. Old requests are aborted on blur, account/server changes and workspace changes; account-level counts do not use content workspace IDs.

Contracts were checked against the source web `components/space/dashboard-groups.ts`, the corresponding API clients and the backend session router in `/home/zillia/Work/deeptutor-source`. No new backend endpoints, deployments or credential changes were required. This updates hub counters, not the API status of every destination screen; in particular the existing conversation library/archive still has the separately documented local ChatProvider behavior.

Verification: `tests/resources-api.test.cjs` and `tests/browser/verify-resource-counts.cjs`, with the source-derived local Postman simulation `tests/fixtures/resources-api.sim.yaml`. The browser run covered 205 raw conversation records across two pages yielding 203 active root sessions, independent loading, zero vs failure, malformed and 403 responses, refresh, account/workspace isolation, own MCP vs deployment servers and CLI permissions. The run used 390px and 320px viewports. Successful authenticated live-server counts and native-device interaction remain unverified.
