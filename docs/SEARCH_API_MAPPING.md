# Mobile search API

Canonical route: `/search`; `/ui/search?q=…` redirects to it and preserves the query. The shell, developer links and the mobile Library search entry now use `/search`.

| Search source | Request | Behavior |
| --- | --- | --- |
| Conversation text | `GET /api/sessions/search?q=…&limit=50&offset=…&dt_workspace=…` | Backend literal search across titles and persisted user/assistant messages; displays `match_excerpt`, pages via `total`, skips archived/child sessions while advancing the raw server offset |
| Recent conversations | `GET /api/sessions?limit=50&offset=…&dt_workspace=…` | Used for an empty query, because the search endpoint rejects blanks |
| Learning paths | `GET /api/mastery-paths/topics?dt_workspace=…` | Actual scoped server catalog; filters name/goal/description locally because this endpoint has no text-search contract |
| Partners and groups | `GET /api/partners/navigation` | Actual actor-visible server catalog; filters names/descriptions locally; not scoped to a content workspace |
| Navigation pages | No HTTP request | Static translated app destinations; no fixture entity records |

No aggregate global-search endpoint was invented. Data from ChatProvider and LearningProvider fixtures is no longer searched. Partner/group results retain their real IDs and navigate to the existing domain destinations; those detail screens remain unimplemented boundaries in this app.

Implementation uses the shared authenticated Axios client, a 250 ms debounce, focus/query/workspace/account/server cancellation, schema/scope validation, partial-source errors and retry. Query length is bounded to 200 characters. User-authored labels and excerpts are displayed literally, without translation or HTML interpretation. Unsupported/forbidden/malformed responses are errors rather than empty success or fixture fallback. The shared authentication interceptor redirects expired sessions (401) to login; the current search query is retained in the return path.

Contract evidence: inspected `deeptutor/api/routers/sessions.py`, `deeptutor/services/session/search.py`, `sqlite_store.py`, `deeptutor/api/routers/partners.py`, `web/lib/session-api.ts` and `web/components/sidebar/CommandPalette.tsx` in `/home/zillia/Work/deeptutor-source`. A read-only unauthenticated live request returned 401; successful authenticated live search is not established. Server behavior is further exercised by the local source-derived stand-in in `tests/fixtures/search-api.sim.yaml`.

Verification entry points: `tests/search.test.cjs`, `tests/browser/verify-search.cjs`. Example browser command after starting Expo on 8100 and the simulation on 4124:

```sh
SEARCH_SIM_URL=http://localhost:4124/search PLAYWRIGHT_MODULE=/path/to/playwright node tests/browser/verify-search.cjs
```

The client tests do not certify live actor permissions, search indexing correctness or native-device interaction.

Validation result (2026-11-09): browser scenarios passed for pagination, query cancellation, independent source failures/retry, 401/404/malformed responses, General/workspace isolation, Library navigation and the old query-preserving alias. 101 Node tests passed; Expo lint, TypeScript and locale contract checks passed.
