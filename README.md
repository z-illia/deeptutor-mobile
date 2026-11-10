# DeepTutor Mobile

Mobile client for DeepTutor, built with Expo and React Native for Android, iOS, and web. The app connects to an existing DeepTutor server for authentication, conversations, learning content, resources, and settings. The backend is maintained separately.

## Stack

- Expo SDK 58, React Native 0.88, React 19.3, and TypeScript 6.
- Expo Router with routes in `src/app/`.
- Axios for HTTP requests and WebSocket connections for streaming conversations and book operations.
- Zustand and AsyncStorage for local preferences and persisted selections.
- Lucide icons, shared theme-aware controls, Markdown rendering, syntax highlighting, and mathematical notation.

Use Node.js 22.13 or newer and npm. Dependency versions are locked in `package-lock.json`; EAS builds currently use Node.js 22.23.3.

## Run locally

```bash
npm ci
cp .env.example .env.local
```

Set the DeepTutor server origin in `.env.local`:

```dotenv
EXPO_PUBLIC_API_URL=http://deeptutor.local:8001
```

Use an address reachable from the target device. `localhost` on a physical phone refers to the phone itself. The hostname `deeptutor.local` must resolve on that device; otherwise use the server's LAN IP or a reachable domain.

Provide the origin without `/api`: the HTTP client appends it. The server URL can also be changed on the login screen and is saved locally; a saved URL takes precedence over the environment default. Chat uses the corresponding `ws://` or `wss://` connection. Browser access requires the backend to allow the web origin and credentialed cookies.

Start Metro or the web app:

```bash
npm start
npm run web
```

For a local native build, with the corresponding Android or iOS toolchain installed:

```bash
npm run android
npm run ios
```

Native projects use Expo Continuous Native Generation. Configure native behavior through `app.json` and config plugins; generated `android/` and `ios/` directories are ignored by Git. Adding or changing native modules or config plugins requires rebuilding the native app. Expo Go supports only its bundled native modules; see the [Expo environment setup guide](https://docs.expo.dev/get-started/set-up-your-environment/).

## Application areas

| Area | Entry routes | Features |
| --- | --- | --- |
| Tutor | `/chat`, `/space/chat-history` | Streaming conversations, model selection, history, response cancellation, and session recovery |
| Learning | `/learning` | Learning-path selector and continuation, mastery paths, books, immersive reading, and practice |
| Library | `/library` | Conversations, learning notes, favorites, knowledge bases, question bank, and learning journal |
| Personalization | `/personalization` | Partners, personas, skills, connectors, CLI apps, subagents, and memory |
| Account | `/account`, `/profile` | Profile, avatar, password, device sign-in, usage, and account actions |
| Workspaces | `/workspaces/switch` | General workspace and active custom workspaces, with persisted selection |
| Settings | `/settings` | Preferences, workspaces and data, models and services, learning tools, advanced settings, and administration |

Availability depends on the server, account permissions, configured services, and workspace. Some operations require the DeepTutor web application, including interactive visual book blocks and visual assessment. Live provider behavior and native device integration require separate verification; automated simulations do not establish full backend or platform compatibility.

## Builds with EAS

The existing profiles are defined in `eas.json`:

| Profile | Purpose |
| --- | --- |
| `preview` | Internal distribution; Android APK for direct installation |
| `simulator` | Extends `preview` and enables iOS Simulator builds |
| `production` | Store distribution; Android App Bundle with automatic build version increments |

With an Expo account that has access to the configured EAS project:

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest build --platform ios --profile simulator
npx eas-cli@latest build --platform android --profile production
```

Both `preview` and `production` currently set `EXPO_PUBLIC_API_URL=http://deeptutor.local` explicitly in `eas.json`. Changing `.env.local` alone does not change those profile values. Set the intended server origin in the build configuration before distributing a build outside the local network. Public Expo environment variables are bundled into the client and must not contain secrets.

`plugins/withAndroidHttp.cjs` enables HTTP connections in the generated Android application manifest, including release builds, so user-selected local HTTP servers work consistently. Changes to this plugin require a new native build.

See the [Expo SDK 58 reference](https://docs.expo.dev/versions/v58.0.0/) and [APK build guide](https://docs.expo.dev/build-reference/apk/) for SDK and distribution details.

## Validation

```bash
npm run lint
npm run typecheck
npm test
npm run locales:check
node scripts/audit-locales.cjs --check
```

`npm test` uses Node's built-in test runner. Some transport tests open local HTTP/WebSocket ports and need permission to listen on loopback. Tests cover transport, workspace isolation, settings, learning, rendering, and localization.

Browser verification scripts live in `tests/browser/`. They run separately against Expo web and use flow-specific mocks or simulations. Follow the relevant feature documentation for setup; they are not part of `npm test`.

## Localization

The interface supports English, Chinese, French, German, Ukrainian, Polish, Portuguese, Vietnamese, Japanese, and Turkish. Interface language and model response language are separate preferences.

- Dictionaries: `src/i18n/locales/*.json`.
- Translation lookup: `src/i18n/copy.ts`, exposed through `useCopy()`.
- Coverage contract: `src/i18n/locale-contract.json`.
- Static audit report: `docs/localization-audit.json`.

Translate UI labels, buttons, messages, placeholders, and accessibility text. Use named interpolation parameters for dynamic sentences. User-authored titles, source content, and tutor responses retain their original text.

After adding UI copy, add translations to every dictionary and regenerate the contract:

```bash
node scripts/locale-contract.cjs
npm run locales:check
node scripts/audit-locales.cjs --check
```

The static audit detects unwrapped JSX prose, missing translations, and English placeholders shared by all locales. Dynamic lookups and layout still need interaction testing.

## Project structure

```text
src/app/                 Expo Router routes and layouts
src/api/                 Shared HTTP client and server URL persistence
src/features/            Feature screens, state, and repositories
src/shared/              Design system, reusable controls, preferences, Markdown
src/i18n/                Translation dictionaries and localization contract
assets/                  Brand assets, fonts, and images
plugins/                 Expo config plugins
scripts/                 Validation, localization, and browser verification tools
tests/                   Node tests, browser flows, and contract fixtures
docs/                    API mappings, implementation notes, and audit reports
```

Keep reusable components, hooks, and utilities outside `src/app/`. Add Expo and React Native dependencies with `npx expo install <package>` to resolve SDK-compatible versions.

## Further documentation

- [Live chat transport and verification](src/features/chat/live/README.md)
- [Workspace selection and persistence](src/features/workspaces/README.md)
- [Settings and administration](src/features/settings/README.md)
- [Profile actions](src/features/profile/README.md)
- [Favorites](src/features/favorites/README.md)
- [Learning implementation status](docs/LEARNING_IMPLEMENTATION_STATUS.md)
- [Learning API mapping](docs/LEARNING_API_MAPPING.md)
- [Localization audit](docs/localization-audit.md)
