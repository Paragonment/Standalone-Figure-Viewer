# Figure Viewer

A reference and practice tool for ballroom figures: International Standard (Waltz, Tango, Foxtrot,
Quickstep) and International Latin (Cha Cha Cha, Samba, Rumba, Paso Doble, Jive), at Pre-Bronze,
Bronze, Silver and Gold level. Built with React 19, TypeScript and Vite.

## Screens

On a phone (768px wide or less) the app has three screens and a settings sheet:

- **Home** - search, always-visible dance and level filters, and the figure list. Searching ranks
  figure names first, then figures whose notes mention the query.
- **Figure** - the steps, with the positions, a rhythm strip and the Lead/Follow switch frozen above
  them. Tap a beat to jump to its step. An About band holds the notes. Side by side shows both parts.
- **Practice** - one step at a time, large. Back and Next, swipe, the arrow keys or the rhythm strip
  move between steps, and the next step is previewed at the bottom.
- **Settings** - which part you dance, which details each style shows on every step, and the theme
  (system, light or dark). Settings are stored in the browser.

On wider screens the app shows a dense table with expandable rows, per-part columns, and the same
filters and theme choice.

## Data

The figures live in `public/standard.csv` and `public/latin.csv`. Where the Latin charts come from is
recorded in [`docs/latin-sources`](docs/latin-sources/README.md).

## Development

```sh
npm install
npm run dev      # start the dev server
npm run lint     # eslint
npm run build    # type-check and build to dist/
```

The design tokens (colors, type, motion) are CSS variables in `src/index.css`; both themes are
defined there. Shared building blocks are in `src/components/ui`, user settings in `src/state`.
