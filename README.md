# Melis

Melis is a Latvian mobile party-games PWA. It currently contains Melis, Tik Tok, and Mēmais šovs; more games are expected.

## Product constraints

- Static GitHub Pages deployment at `/melis-web/`.
- Mobile-first; desktop centers the phone UI.
- Installable PWA.
- Samsung Galaxy S25 Chrome is the primary test baseline: 360 × 780 CSS pixels, DPR 3. Layouts must still work from 320–430px wide because browser chrome changes visible height.

## Application structure

Use URL-based game navigation, not a single `screen` state in `App`. Use `HashRouter` because GitHub Pages does not provide deep-link fallbacks:

```text
/#/                         Games hub
/#/games/melis              Melis
/#/games/tik-tok            Tik Tok
/#/games/memais-sovs        Mēmais šovs
```

```text
src/
  app/
    App.tsx                 Router, shared PWA setup, route layout
    GameShell.tsx           Header, Home action, Rules overlay
    games.ts                Static lazy route imports
  games/
    melis/
      MelisGame.tsx
      melisRules.ts
      locations.ts
      melisState.ts
    tik-tok/
      TikTokGame.tsx
      tikTokRules.ts
      tikTokState.ts
    memais-sovs/
      MemaisSovsGame.tsx
      memaisSovsRules.ts
      words.ts
tests/
  games.spec.ts            Galaxy S25 browser flows
```

### Rules for new games

- A game owns its state, rules, assets, and screen flow under `src/games/<game-id>/`.
- `app/games.ts` owns static lazy imports; route and launcher details stay in the app shell.
- `GameShell` contains only UI proven to be shared: header, Home action, and Rules overlay.
- Do not create a generic game-state interface. Melis, Tik Tok, and Mēmais šovs have different lifecycles; a generic interface would add coupling without reuse.
- Extract pure game rules only when they have meaningful transitions to test, such as Tik Tok win/tie detection or Melis location selection.

## Loading strategy

Each game route is loaded with `React.lazy` and `Suspense`. The hub imports launcher metadata only; it must not import game roots, word lists, or Melis locations.

This keeps the first visit small as the catalog grows. Vite emits one chunk per game. The PWA may cache those chunks after installation, but they are not part of the initial route download.

Use direct imports inside each game. Avoid a barrel file that imports every game. Keep state local to its active game route so inactive games do not rerender.

## Test architecture

Replace Jest and React Testing Library with Playwright once the Playwright suite covers the current flows. Do not run both indefinitely.

```text
tests/
  games.spec.ts             Hub, Home navigation, and one smoke flow per game
  melis.spec.ts             Player setup, roles, timer, replay
  tik-tok.spec.ts           Turns, win line, reset
  memais-sovs.spec.ts       Reveal, next word, rules
```

- Use Playwright role locators; add a test ID only when a semantic locator is not stable.
- Run tests with a Galaxy S25 Chromium project at 360 × 780, DPR 3, mobile, and touch enabled.
- Clear local storage per test and test persistence explicitly.
- Include one PWA/base-path smoke test because those are browser and deployment concerns that jsdom does not validate.
- Keep deterministic game rules in small pure modules and test them with the Playwright runner without a `page` fixture.

Target scripts after migration:

```text
npm test                  playwright test
npm run test:ui           playwright test --ui
npm run test:report       playwright show-report
```

## Migration order

1. Add `react-router-dom`, `HashRouter`, and lazy game routes without changing behavior.
2. Move each game out of `App.tsx`; move Melis-only assets and persistence helpers with Melis.
3. Add the Playwright S25 project and recreate the six current app flows.
4. Add the browser-only PWA, base-path, and local-storage checks.
5. Remove Jest, React Testing Library, SWC Jest configuration, and their dependencies only after Playwright is green in CI.

## Melis game rules

1. Add player names. They are saved in local storage for future games.
2. Press **Sākt spēli** to start a round.
3. Pass the phone so every player can privately view their role.
4. Regular players see the secret location. The Spy sees only that they are the Spy.
5. Take turns asking another player a question about the location.
6. Answer carefully: prove that you know the location without revealing it to the Spy.
7. At any time, a player may call for a vote to identify the Spy.
8. If the group identifies the Spy, the Spy gets one final chance to guess the secret location.

Players and the round timer are saved in local storage until changed in settings. The default timer is 10 minutes.

Locations are maintained in [locations.md](./locations.md).
