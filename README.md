# Melis

A Latvian-language pass-the-phone party game for 3+ players. One player is the Spy; everyone else knows the same secret location.

## Platform and Technology

- Build as a React web app styled with Tailwind CSS.
- Host the static app on GitHub Pages from [Matiss1337/melis-web](https://github.com/Matiss1337/melis-web).
- Configure the build for the `/melis-web/` GitHub Pages base path.
- Make it installable as a Progressive Web App (PWA).
- Design for mobile only. On desktop, show the mobile interface centered within the page.

## Core Rules

1. Add the player names. They are saved in local storage for future games.
2. Press **Sākt spēli** to start a round.
3. Pass the phone so every player can privately view their role.
4. Regular players see the secret location. The Spy sees only that they are the Spy.
5. Take turns asking another player a question about the location.
6. Answer carefully: prove that you know the location without revealing it to the Spy.
7. At any time, a player may call for a vote to identify the Spy.
8. If the group identifies the Spy, the Spy gets one final chance to guess the secret location.

## Setup

Settings contain only:

- Players
- Round timer

Players and the timer are saved in local storage until changed in settings. The default timer is 10 minutes.

When a round starts, the timer counts down to zero. At zero, show a red `0` and only two actions:

- **Spēlēt vēlreiz** — start a new round with the saved players and timer.
- **Iestatījumi** — change the players or timer.

Keep the interface and game flow simple. Visual design will be decided later.

## Locations

Melis starts with 279 simple Latvian-friendly location cards, such as parks, nightclubs, attics, basements, limousines, dirigibles, theatres, and toilets. The full list is maintained in [locations.md](./locations.md).

## Winning

- Regular players win when they identify the Spy and the Spy guesses the location incorrectly.
- The Spy wins by correctly guessing the location before being caught.

## Example

If the secret location is a casino, a player could ask:

> What do people usually wear when they come here?

A safe answer might be:

> Usually pretty fancy clothes or suits.

This signals knowledge of the location while avoiding a direct reveal.
# melis-web
# melis-web
