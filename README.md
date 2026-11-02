# Figure Viewer

A reference and practice tool for ballroom figures: International Standard (Waltz, Tango, Foxtrot,
Quickstep) and International Latin (Cha Cha Cha, Samba, Rumba, Paso Doble, Jive), at Pre-Bronze,
Bronze, Silver and Gold level. Built with React 19, TypeScript and Vite.

## Screens

On a phone (768px wide or less) the app has three screens and a settings page:

- **Home** - search, dance and level filters, and the figure list. Scrolling the list tucks the
  filters into a compact top banner that sums up what is picked; tap it to bring them back.
  Searching ranks figure names first, then figures whose notes mention the query.
- **Figure** - the steps, with the positions, a rhythm strip and the Lead/Follow switch frozen above
  them. Tap a beat to jump to its step. An About band holds the notes. Side by side shows both parts.
  Swipe right anywhere to go back to the list.
- **Practice** - one step at a time, large. Back and Next, swipe, the arrow keys or the rhythm strip
  move between steps, and the next step is previewed at the bottom.
- **Settings** - which details each style shows on every step (each style on a page of its own,
  with a live preview of a real step), whether abbreviations are spelled out, and the theme (system,
  light or dark). It slides in from the right from the menu on any screen, and its pages slide in
  over it; Back, a swipe right or the phone's back gesture steps back one level. Settings are stored
  in the browser.

On wider screens the app is a two-pane reference: the figure list with its search and filters stays
on the left, and the open figure fills the right, with both parts side by side until you pick one.

Practice is always there on a phone. On a wide screen it is off until you turn on **Show Practice** in
Settings (stored with the other settings, and only offered on a wide screen): that adds a Practice
button beside Copy link and the `p` key. Practice then opens over the whole window as one centered
column; Esc, Back or the screen's own Back button returns to the figure.

## Printing

Printing a figure, on a phone or a desktop, gives a plain reference sheet in black on white: the
title, the meta line, the step chart (both parts, or the one picked, with every field turned on in
Settings) and the About notes. The list, buttons, filters, menu and the frozen strip are left off, a
step is never split across pages, the chart's heading repeats on each page, and related figures print
as plain text. Printing the contents page prints the index. The rules are in `src/print.css`, and a
printed page is always the light theme (the dark tokens in `src/index.css` skip print).

## Keyboard

On a desktop, `?` lists the shortcuts (also under Keyboard in Settings): `/` searches, the arrow keys,
`[` and `]` step through the list, `j` `k` and `1`-`9` move between steps, `l` `f` `b` pick the
part, `,` opens Settings, and `p` opens Practice once Show Practice is on. With Practice open only
Esc (back to the figure), the part keys, `,` and `?` apply. They are one table in `src/utils/shortcuts.ts`, so a new shortcut is one
entry there and its action in `src/hooks/useShortcuts.ts`. Stepping through the list with the keys
replaces the current history entry rather than adding one for every figure.

## Links

The address says what is open, on a phone and on a desktop alike (`src/utils/route.ts`,
`src/hooks/useRoute.ts`): `#/waltz/back-lock?part=follow&step=3` is a figure at a part and step,
`#/waltz/back-lock/practice` is its Practice, and `#/?dance=waltz&level=bronze&q=lock` is the list
with its filters and search. Opening a figure or Practice adds a history entry, so Back and Forward
retrace what was read; filters, search, part and step rewrite the current entry instead. A part in
a link applies to that view only and never replaces the saved one. A link to a figure that is not
there opens the list with a note. On a desktop, Copy link puts the current address on the clipboard.

## Data

The figures live in `public/standard.csv` and `public/latin.csv`. Where the charts come from is
recorded in [`docs/standard-sources`](docs/standard-sources/README.md) and
[`docs/latin-sources`](docs/latin-sources/README.md).

## Development

```sh
npm install
npm run dev      # start the dev server
npm run lint     # eslint
npm run build    # type-check and build to dist/
npm test         # unit tests (Vitest), run once
npm run test:e2e # end-to-end and visual tests (Playwright, Chromium)
```

Unit tests sit next to the code they cover as `*.test.ts` (for example
`src/utils/stepValues.test.ts`). End-to-end specs are in `e2e/`; `e2e/helpers.ts` holds the
navigation steps (open a figure, pick a part, open Settings) for specs to share. They run against
the production build, and the first run needs `npx playwright install chromium`.

`e2e/mobile-visual.spec.ts` compares screenshots at 320, 360, 390 and 430px wide, light and dark,
against baselines in `e2e/__screenshots__/` (named per platform; the committed ones are macOS).
After an intended visual change, review the diff and run `npm run test:e2e:update`.

The design tokens (colors, type, motion) are CSS variables in `src/index.css`; both themes are
defined there. The two typefaces are served from `src/fonts` (SIL OFL, licences beside them). Shared building blocks are in `src/components/ui`, user settings in `src/state`.
