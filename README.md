# Ship Namer (Aether Fleet)

A small React + TypeScript app for generating, managing, and deploying ship
names into a lightweight fleet registry. Designed for quick name generation,
registry import/export, and safe in-app confirmations.

## Features

- Random candidate name generation and deployment to an active fleet.
- Editable suggested candidate: the random name displays as a large, editable
  input so users can accept or tweak the suggested name before deployment.
- Registries for ship names, hulls, and tags with: import, export, clear, and
  restore defaults.
- Persistence via `localStorage` keys: `aetherShipNames`, `aetherFleet`,
  `aetherHulls`, `aetherTags`.
- Exports are named using the `aether-<UTC-ISO>-<filename>.json` format for
  deterministic filenames.

## Tech

- React + TypeScript
- ESLint + Prettier
- Webpack for bundling

## Project Structure (important files)

- `src/App.tsx` — main application wiring and state handlers (deploy,
  registries)
- `src/components/LaunchBay.tsx` — random candidate display (now editable) and
  deploy button
- `src/components/{NameRegistry,HullRegistry,TagRegistry}.tsx` — registry UIs
  and import/export controls
- `src/utils/fleet.ts` — helper utilities (random selection, import/export,
  `makeAetherFilename`)
- `src/App.css` — centralized styling and utility classes

## Scripts

Use the npm scripts defined in `package.json` to run, build, update, etc.

## Development notes

- The app persists registries to `localStorage`. Import handlers validate and
  normalize JSON before saving.
- Exports create downloadable JSON files with deterministic timestamps using
  `makeAetherFilename()`.
- Webpack emits warnings about entrypoint size.

## Contributing

Open a PR with focused changes.

## License

Licensed under the project `LICENSE` in the repository.
