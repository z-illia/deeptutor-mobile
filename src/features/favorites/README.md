# Favorites API integration

`api.ts` uses the existing contract from DeepTutor's
`deeptutor/api/routers/notebook.py` and `web/lib/notebook-api.ts`. Every request
uses the shared authenticated client and explicitly passes `dt_workspace`,
including the empty string for General workspace.

| Operation | Endpoint |
| --- | --- |
| List / create collections | `GET / POST /api/notebooks` |
| Read / edit / delete a collection | `GET / PUT / DELETE /api/notebooks/{id}` |
| Save to several collections | `POST /api/notebooks/actions/add-record` |
| Edit / delete a saved record | `PUT / DELETE /api/notebooks/{id}/records/{recordId}` |
| Copy / move a record | `POST /api/notebooks/{id}/records/{recordId}/actions/{copy|move}` |
| Locate a moved record | `GET /api/notebooks/records/{recordId}/location` |
| Export Markdown | `GET /api/notebooks/{id}/export` |

`FavoritesProvider` caches server IDs and responses. It reads summaries for the
index, then loads records only for an opened collection. Collection search
therefore searches names/descriptions; record search is inside a collection.
Counts come from the summary or the detail's records array. The server's create
and update responses contain full notebooks rather than index summaries.

Writes are serialized and update the cache only after confirmation. Record edits
send title and summary only: original output, prompt, provenance, and knowledge
base links are preserved. Unloaded destination details stay unloaded after a
save or move, rather than treating one returned record as the whole collection.
Account/server/workspace changes reset the provider and abort old requests.
Superseded reads cannot overwrite fresher results. A 409 unreadable collection
has a recovery message and confirmed deletion path.

`SaveToNotebookModal` is mounted once at the root. Live chat can save a reply or
selected conversation turns; existing save actions share the same dialog.
The server's `added_to_notebooks` list is authoritative. On partial success,
confirmed collections are locked, the original save payload is retained, and a
retry targets only unsaved collections. A success message appears only after
the requested destinations are confirmed. Requests are not retried automatically:
the add-record API is not idempotent. A network failure after a committed write
can have an unknown outcome; check the collection before manually retrying.
Blank summaries use the backend's existing summary generation behavior, with a
longer request timeout for that operation.

## Verification

Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run locales:check`.
`tests/favorites-api.test.cjs` checks transport fields, scope, normalization,
partial success, immutable snapshots, duplicate submission protection, and
stale response isolation.

For the mobile browser scenario, start these in separate terminals:

```sh
postman simulation run tests/fixtures/favorites-api.sim.yaml --port 4093 --no-history
npm run web -- --port 8099
```

Then run with Playwright installed (or set `PLAYWRIGHT_MODULE`):

```sh
FAVORITES_SIM_URL=http://127.0.0.1:4093/favorites node tests/browser/verify-favorites.cjs
```

The stateful mock is a local client verification double using synthetic data.
It has reset/configuration endpoints for failure injection; these are not app
endpoints. Browser checks cover persistence, create/edit/delete failures,
copy/move, moved links, export, chat references, inline creation and transcript
save, partial retries without duplicate destinations, corrupt collections, and
workspace isolation. Its summary generation is a fixed test response. Live
backend, actual LLM summary generation, and native device behavior remain unverified.
