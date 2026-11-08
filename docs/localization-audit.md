# Localization coverage

All ten interface locales share the same lookup: English, Ukrainian, Polish, Chinese, French, German, Portuguese, Vietnamese, Japanese and Turkish. The checked-in locale contract covers 3,120 translatable strings, including the specifications for all 154 mobile screens and strings used by the other route family.

## Changes

- Completed dictionaries for navigation, settings, learning, quiz, research, favorites, files, sources, calendars and administrative screens.
- Localized runtime error labels, accessibility labels, counts and dynamic notifications using templates with named parameters.
- Kept canonical option values, route paths, React keys and native element IDs independent of translated labels.
- Preserved authored conversation/note titles and bodies, code, technical identifiers and the original learning-goal text. The contract lists explicit invariants separately.
- Added coverage and placeholder checks so newly introduced UI strings cannot silently lack entries in another locale.

The application uses bundled dictionaries offline. Existing source translations were retained. Missing translations were generated with Google Translate and core Ukrainian labels were manually reviewed; structural completeness does not imply a full human linguistic review of every language.

## Reproduce

- `npm run locales:check` detects new strings without complete dictionary coverage.
- `npm run locales:audit` regenerates the detailed [coverage report](localization-audit.json).
- `npm test` checks locale parity, interpolation, fallback, authored content and preference persistence/migration.
- `npx expo lint` and `npx tsc --noEmit` check source quality and types.
- `node scripts/verify-locales.cjs --all` tests UI language switching, reload persistence, both route families in every language, and all 154 mobile routes in the last selected language. It needs a running Expo web server, Playwright and Chrome; `BASE_URL`, `PLAYWRIGHT_MODULE` and `CHROME_EXECUTABLE` can be supplied through the environment. Screenshots and the interaction report are saved under `/tmp/deeptutor-locale-verification` by default.

The remaining unwrapped JSX strings are unused starter tabs, `@mention` notation, sample file metadata and a sample username. The static scan excludes development galleries and legacy starter screens. Browser checks cover shared React UI behavior; no physical-device walkthrough has been performed.

## Latest validation

- Locale contract: zero missing entries for every supported locale.
- Unit/regression tests: 41 passed.
- Expo lint and TypeScript: passed without warnings or errors.
- Browser: 218 route checks passed with no page errors. These include actual switching and reload persistence across all ten locales, both route families, and all 154 mobile routes in Turkish (the final selected locale).
- Browser checks also confirmed that an authored note named `General` and its code body remain unchanged under a translated interface.
