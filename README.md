# Aether Fleet Ops

A small React and TypeScript app for keeping track of an EVE Online fleet. Each
ship is a name you choose and a fitting you pasted straight out of the game.

## What it does

Pick a name, paste a fit, commission the ship. That is the whole loop.

- **Fits come from the game.** In the fitting window, right-click the ship and
  choose _Copy to Clipboard_, then paste the result into the app. It is parsed
  into low, mid and high slots, rigs, subsystems, drone and fighter bays, and
  cargo.
- **The fit supplies the hull.** A fit's first line names its ship, so there is
  no hull to pick and no way for a ship's hull and its fitting to disagree. The
  hull is spelled the way the game spells it: a hand-typed `[vedmak, ...]` is
  read as `Vedmak`, and a header copied from the game is left alone.
- **Names are a registry.** The app ships with a pool of names and suggests one
  that is not already flying. You can add your own, remove ones you dislike, or
  restore the defaults. The registry dialog also exports the names as a JSON
  array and imports one. An import merges: it adds the names you do not have and
  removes nothing.
- **Names ignore case.** Typing `apex archive` matches a registered
  `Apex Archive`, marks that entry deployed, and keeps the registry's spelling.
  The registry never ends up holding two spellings of one name.
- **Your fit comes back out.** The exact text you pasted is stored and can be
  copied back to the clipboard, so a fit always returns to the game unchanged.
- **A ship can be refitted.** Open a ship and choose _Change Fit_ to paste a
  replacement. The ship keeps its name. The replacement must be for the same
  hull; a different hull means commissioning a new ship. The ship also keeps its
  spelling of the hull, which came from the game when it was commissioned. A
  replacement whose header spells the hull differently has that one word
  corrected.
- **Importing a fleet asks before it touches yours.** When you already have
  ships, the app asks whether to merge or overwrite, and shows what each choice
  will do. A merge adds the ships from the file and removes nothing. It skips
  any ship whose name is already flying, because two ships never share a name.
  An overwrite replaces your fleet with the one in the file. With no ships of
  your own, the file is imported without a question.
- **Everything is local.** The fleet and the registry live in `localStorage`.
  Nothing is uploaded. Import and export move a fleet or a name registry between
  browsers as JSON files.

## Running it

```bash
npm install
npm start          # dev server on http://localhost:3000
npm run build      # lint, format, docs, typecheck, then bundle to dist/
```

Individual gates, should you want one on its own:

| Script              | What it checks                                                              |
| ------------------- | --------------------------------------------------------------------------- |
| `npm run lint`      | oxlint, including type-aware rules and compiler diagnostics                 |
| `npm run lint:fix`  | The same, applying fixes and suggestions. Run deliberately, review the diff |
| `npm run format`    | Prettier, in place                                                          |
| `npm run docs`      | markdownlint over every Markdown file                                       |
| `npm run typecheck` | `tsc --noEmit` at full strictness                                           |
| `npm run update`    | Bumps dependencies. Always run the full build afterwards                    |

## How the code is arranged

The layers only ever point downward: components know about the domain, the
domain knows nothing about React.

| Path                                 | Holds                                                                 |
| ------------------------------------ | --------------------------------------------------------------------- |
| [`src/domain/`](src/domain/)         | Fit parsing, ship and fleet types, and the name rules. No React       |
| [`src/state/`](src/state/)           | The fleet reducer and the `useFleet` hook that drives it              |
| [`src/storage/`](src/storage/)       | Reading and writing `localStorage` and import/export files            |
| [`src/components/`](src/components/) | One folder per component: the component and its props type            |
| [`src/App.tsx`](src/App.tsx)         | The composition root: all wiring, and the questions asked of the user |

Two decisions are worth knowing about before you change anything.

### A stored ship keeps its fit as text

Storage holds the name you gave a ship and the fit text you pasted, never the
parsed structure. The fit is parsed again on load. That keeps `parseFit` the
single authority on what a fit means: an improvement to the parser reaches fits
that were saved before it, and a stored fit can never drift out of step with the
code that reads it.

### The parser does not trust blank lines

The game separates a fit's sections with blank lines, and writes an empty
section for every slot type the hull does not have. That structure does not
survive a trip through a text editor or a chat window, so the parser does not
depend on it. It relies on three things instead:

1. Low, mid, high and rig always come first, in that order, on every hull.
2. A stack count such as `x16` can only appear in a hold, never in a slot. The
   first block past the rigs that carries one is where the holds begin.
3. Anything between the rigs and that point is subsystems.

Cargo is always written last, so the holds line up from there. When a paste has
lost its structure entirely the leftover lines are read as cargo rather than
mislabelled as modules — and either way the original text is kept verbatim.

## Accessibility

The app targets WCAG 2.1 Level AA, and that is treated as a build requirement
rather than a goal. Every colour pair in
[`src/styles/app.css`](src/styles/app.css) has been measured — 4.5:1 for text,
3:1 for control borders and the focus ring — in both the light and dark
editions. Dialogs are native `<dialog>` elements, so focus trapping, the Escape
key and focus restoration come from the browser rather than from code that could
drift. The layout reflows to a single column and holds a side gutter down to a
320px viewport, and `prefers-reduced-motion`, `prefers-color-scheme`,
`prefers-contrast` and `forced-colors` are all honoured.

## Contributing

[`CLAUDE.md`](CLAUDE.md) is the working agreement for this repository and
applies to every change, whoever or whatever is making it. Open a PR with
focused changes and a green `npm run build`.

## License

See [`LICENSE`](LICENSE).
