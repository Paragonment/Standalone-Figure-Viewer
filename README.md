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

On wider screens the app shows a dense table with expandable rows, per-part columns, and the same
filters and theme choice.

## Data

The figures live in `public/standard.csv` and `public/latin.csv`. Where the charts come from is
recorded in [`docs/standard-sources`](docs/standard-sources/README.md) and
[`docs/latin-sources`](docs/latin-sources/README.md).

What each figure can follow and lead into lives in `public/standard-transitions.csv` and
`public/latin-transitions.csv`, one link per row. The clean link sits beside the book's wording
for that case:

| Column | Holds |
| --- | --- |
| Dance, Figure Name | The figure whose list this is |
| Relation | `Preceded By` or `Followed By` |
| Level | The first level the book lists the link at; empty when ungraded |
| Condition | When it applies, in the book's words: `At corner`, `If ended DC`, `Ending B` |
| Steps | This figure's own steps the link joins (`4-6`); empty for the whole figure |
| Linked Figure | The figure before or after, by its charted name; empty for a group entry |
| Linked Steps | The linked figure's steps used, e.g. `1-3` |
| Same As | The book's "As for Natural Turn": that figure's whole-figure links apply too |
| Details | The book's wording for this case, read after the name (`after Back Lock`, `(underturned)`), or the whole entry for a group (`Any Reverse figure`) |

Linked Figure names a charted figure of the same dance, or one of the few the books name but
do not chart (the Waltz Wing, the Tango Walks). The app builds each figure's Preceded by and
Followed by text from these rows the first time the figure is shown, and keeps it
(`src/utils/transitions.ts`). `npm test` checks every row against the figure CSVs.

## Development

```sh
npm install
npm run dev      # start the dev server
npm run lint     # eslint
npm test         # unit tests and data checks
npm run build    # type-check and build to dist/
```

The design tokens (colors, type, motion) are CSS variables in `src/index.css`; both themes are
defined there. Shared building blocks are in `src/components/ui`, user settings in `src/state`.
