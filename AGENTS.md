# Melis

A Latvian-language, mobile-first "pass-the-phone" party game (Spyfall-style). 100% client-side React + Vite PWA. No backend, no database — all state persists in browser `localStorage`. Location data is bundled from `locations.md`, `locations.en.md`, `locations.ru.md`.

## Cursor Cloud specific instructions

- Single service: the Vite dev server. Standard scripts are in `package.json` (`dev`, `build`, `preview`, `test`). There is no lint script.
- The app is served under the base path `/melis-web/`, so the dev URL is `http://localhost:5173/melis-web/` — NOT the root `/`. This is set by `base` in `vite.config.ts`.
- `npm run build` runs `tsc -b` first (uses TypeScript 7). Tests use Jest with `@swc/jest` and jsdom.
- Jest maps `../locations*.md?raw` imports and `./baseUrl` to test fixtures/mocks (see `jest.config.cjs`); markdown location files are consumed as raw text.
