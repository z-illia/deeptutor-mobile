# Profile API integration

The contract is taken from the existing DeepTutor backend
`deeptutor/api/routers/auth.py` and web client `web/lib/profile-api.ts`:

| Action | Request |
| --- | --- |
| Profile and permissions | `GET /api/auth/profile` (AuthProvider) |
| Choose icon/color | `PUT /api/auth/profile` with `{ avatar: "icon:leaf:teal" }` |
| Upload photo | `PUT /api/auth/profile/avatar`, multipart field `file` |
| Remove photo | `DELETE /api/auth/profile/avatar` |
| Display photo | `GET /api/auth/avatar/{userId}?v={version}` |
| Change password | `PUT /api/auth/profile/password` with `current_password`, `new_password` |

`repository.ts` handles transport. `pick-avatar.ts` uses the installed Expo
DocumentPicker, caps files at the backend's 1 MiB limit, and builds the correct
browser File or native URI multipart part. The backend validates image bytes.
Supported formats are PNG, JPEG, and WebP; this implementation does not resize
or crop. Oversized images are rejected before upload.

`useProfileActions.ts` locks duplicate operations, cancels stale requests, and
patches AuthProvider only after server success. Passwords remain in the form;
they are never saved in preferences or compared to fixture credentials. Password
controls are shown only when `can_change_password` is true. Server errors keep
the form available for correction. Successful changes clear password fields.

`ProfilePhoto.tsx` downloads images through the same authenticated Axios client
as other API requests, so image loading does not depend on a separate native
image loader sharing authentication cookies. The bounded response becomes an
in-memory data URI, with retry and cancellation. The URL includes the server's
image version. Profile fields update without resetting unrelated app state;
switching account/server still resets the fixture subtree.

## Verification

Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run locales:check`.
The focused tests are in `tests/profile.test.cjs`.

For the browser scenario, start these in separate terminals:

```sh
postman simulation run tests/fixtures/profile-api.sim.yaml --port 4092 --no-history
npm run web -- --port 8099
```

Then run with Playwright installed (or set `PLAYWRIGHT_MODULE`):

```sh
PROFILE_SIM_URL=http://127.0.0.1:4092/profile node tests/browser/verify-profile.cjs
```

The local mock uses synthetic credentials and supports resetting its state. It
checks icon persistence, API failure recovery, multipart upload, oversized and
invalid files, authenticated photo loading, deletion, wrong/current password
handling, permission flags, and logout. It is a client verification double,
not evidence of live backend or native device compatibility.
