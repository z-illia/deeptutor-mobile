# Workspace selection

`repository.ts` reads `/api/settings/workspace/registrations` using the shared
authenticated Axios client. The response shape comes from the existing Learning
client: `{ workspaces: [{ workspace_id, display_name, archived }] }`.
Archived entries are excluded. General workspace is represented by `''` and
rendered once by the UI. Authored display names are never translated.

`WorkspaceProvider.tsx` owns the list, loading/errors, and selected ID. AsyncStorage
keys include the server URL and user ID. A switch is committed only after the
storage write succeeds. A failed refresh retains the selected scope; a removed
registration is marked unavailable, rather than silently showing General data.
Superseded list requests are cancelled. The provider is reset on identity changes.

`WorkspaceList.tsx` is shared by the shell sheet, Learning picker, and mobile
screen 62. `EntryBoundary` waits for storage restoration before rendering screens.
Learning uses the shared selection unless its route explicitly supplies a
workspace; focused deep links also adopt that workspace into the shared state.
Switching from Learning goes to its overview; switching from a chat detail goes
to a new chat. Chat HTTP reads, composer resources, and WebSocket commands all
receive the selected ID. This does not add workspace management CRUD.

## Verification

Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run locales:check`.
`tests/workspaces.test.cjs` checks persistence failures, unavailable registrations,
identity keys, invalid responses, cancellation, and stale response ordering.

The browser test uses a local Postman simulation. Its examples are client test
fixtures, not a verified backend specification. They disable authentication only
inside the mock. No account or publishing is required:

```sh
postman mock generate tests/fixtures/workspaces-api.openapi.json --output /tmp/deeptutor-workspaces-mock --name workspaces
```

Create `/tmp/deeptutor-workspaces.sim.yaml`:

```yaml
simulation: workspace-client
routing: path
mocks:
  - name: workspaces
    routeKey: workspaces
    path: /tmp/deeptutor-workspaces-mock
```

Start the simulation and Expo in separate terminals:

```sh
postman simulation run /tmp/deeptutor-workspaces.sim.yaml --port 4091 --no-history
npm run web -- --port 8099
```

Then run (set `PLAYWRIGHT_MODULE` or `CHROME_EXECUTABLE` if needed):

```sh
WORKSPACE_SIM_URL=http://127.0.0.1:4091/workspaces node tests/browser/verify-workspaces.cjs
```

The test checks active/archived entries, switching between Learning and chat,
restoring the choice after reload, HTTP 503 recovery, General workspace, and
horizontal overflow at a 390px viewport. Native device and live backend behavior
still require verification against the deployed service.
