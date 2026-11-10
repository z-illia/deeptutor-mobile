# General and Appearance settings

## Additional mobile API screens

The numbered routes now use dedicated API screens instead of the design snapshot
renderer for settings 81, 84–107, 109–111, 118–122 and the category hubs 141–146.
Workspace removal follows the backend's archive operation; no DELETE endpoint is
invented. Migration loads the source inventory, requests a preview, and only
posts `/settings/workspace/data/migrate` after the user confirms that preview.
User CSV imports use multipart uploads; device sign-in creates a one-time HTTPS
session handoff through `/auth/session-handoff`.

`api.ts` owns HTTP transport. `RemoteSettingsScreen` cancels superseded reads and
never exposes data from the previous request while a new path loads.
`ServerForm` preserves a failed draft, prevents duplicate saves, rejects invalid
numbers, and cancels response handling when its owner unmounts. The mobile route
tree remounts on server, account, workspace or entity changes. Credentials remain
in form state and are submitted only when entered. Provider/model edits use the
scoped `/settings/apply/registry` endpoint, preserving unrelated catalog entries
and drafts. General/Appearance keep their existing draft/apply protocol below.

Personalization 66–77 and 117 uses the actual partners, groups, personas, skills,
hub, per-user MCP and subagent endpoints. Existing memory/import integrations
78–80 and 123 remain in use. The Account screen reads the current auth profile;
113/114/116 are navigation/recovery states and do not manufacture successful API
operations.

Contracts were checked against the local `deeptutor-source` router and settings
service implementations. `tests/browser/verify-admin-integration.cjs` runs the
mobile UI against `tests/fixtures/mobile-admin.sim.yaml` with a 390×844 viewport.
It exercises failed saves/retry, workspace and playbook writes, provider/model
registration, partner settings, MCP payloads, migration preview/confirmation,
tools, user creation, handoff, session actions and direct routes.

Run the simulation with `postman simulation run tests/fixtures/mobile-admin.sim.yaml
--port 4517`, Expo web on port 8101, then the browser test with `PLAYWRIGHT_MODULE`
pointing to Playwright. These are simulated HTTP/browser checks. Real deployment
authorization, external providers, file migrations and native CSV/file picking
still require live/device verification.

The client contract comes from DeepTutor's `api/routers/settings.py`,
`web/features/settings/store/SettingsStore.tsx`, and `web/lib/settings-extensions.ts`.

| Operation | Request |
| --- | --- |
| Active preferences | `GET /api/settings` → `ui` |
| Stored draft | `GET /api/settings/draft` → `draft` or `null` |
| Save draft | `PUT /api/settings/draft` with `catalog` and `extensions` |
| Apply personal UI fields | `PUT /api/settings/ui` with changed fields only |
| Discard/finish our draft | `DELETE /api/settings/draft` if empty; otherwise `PUT` preserving other sections |

`POST /settings/apply` applies the administrator's model catalog. These screens
do not call it. Personal UI settings work for ordinary authenticated users.
Drafts are private to the acting account. The provider is keyed by server and
account, outside the workspace provider, so workspace changes do not reset them.

`api.ts` maps mobile preference names to the wire format. Mobile `cream` maps
to server `light`; mobile `snow` is server `snow`. Legacy string booleans are
read consistently with the web client, while writes use actual booleans. The
interface layout has no active server endpoint: it remains a device preference.
Its pending value is carried in the existing `ui-layout` draft extension.

`SettingsProvider.tsx` owns active, staged, and saved state across both screens.
Loading a saved draft does not apply it. Save parks a patch under `extensions.ui`;
Apply parks it first, writes only changed UI fields, then clears our part of the
draft. Catalogs, other extension payloads, and unrelated UI fields are preserved.
Discard clears only our pending fields and reloads the live baseline.

The provider re-reads the draft before writing and rejects changes to its owned
sections made by another client since the last load. The backend has no ETag or
atomic compare-and-swap, so this detects observed conflicts but cannot eliminate
the race between a read and a write. Requests are serialized locally, superseded
reads are cancelled, and old account/server completions are ignored.

UI application and draft cleanup are separate server writes. If UI application
succeeds but cleanup fails, the app reflects the applied values, retains the
pending draft, and offers Apply again. Recovery does not resend already-applied
fields. If an uncertain network outcome or another client changes the draft,
Refresh explicitly reloads it; replacing local edits requires confirmation.

Only applied preferences are cached on device, tagged with their owner; opaque
drafts/catalogs are not persisted there. Runtime consumers use this cache for
theme and interface language, response language in chat/study commands, learning
text scale/spacing, math scale, and code theme/line numbers/wrapping. The existing
preview still renders staged values without changing the live app.

## Verification

Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run locales:check`.
`tests/settings-api.test.cjs` checks mapping, partial updates, draft preservation,
failure recovery, conflict detection, duplicate submission and account isolation.

For the mobile browser scenario, start these in separate terminals:

```sh
postman simulation run tests/fixtures/settings-api.sim.yaml --port 4094 --no-history
npm run web -- --port 8099
```

Then run with Playwright installed (or set `PLAYWRIGHT_MODULE`):

```sh
SETTINGS_SIM_URL=http://127.0.0.1:4094/settings node tests/browser/verify-settings.cjs
```

The stateful local double uses synthetic non-admin accounts. The scenario covers
load retry, General/Appearance drafts, reload persistence, save/apply/cleanup and
discard failures, preserving foreign drafts, local layout, rendered text/code,
model response language, conflict recovery, and switching accounts. It does not
establish live backend, multiple-device atomicity, or native device behavior.
