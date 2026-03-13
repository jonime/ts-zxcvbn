# Guide for AI agents

This file helps agents work effectively on **ts-zxcvbn**. Follow it when implementing features, fixing bugs, or refactoring.

## When you change something

### 1. Keep README.md in sync

- **API or options:** If you add or change the public API, options, or return shape, update the README “API” and “Quick start” sections.
- **Scripts:** New or renamed npm scripts that users or contributors might run belong in the “Development” section.
- **Notable behavior:** Document any behavior that affects how people use the package (e.g. new entry points, breaking changes).

### 2. Keep docs in sync

- **VitePress docs** live in `docs/`. Update them when behavior or API changes.
  - `docs/index.md` — overview, installation, quick start, optional frequency and name lists.
  - `docs/api.md` — API reference (parameters, return value, example).
  - `docs/demo.md` — demo page; update if the demo’s behavior or data changes.
- After edits, `docs:dev` / `docs:build` / `docs:preview` are available for local checks.

### 3. Add or update tests

- **Test location:** `src/**/*.test.ts` (see `vitest.config.ts`).
- **Coverage:** New or changed behavior should have tests so regressions are caught.
- **Run:** `npm test`. Before pushing, also run `npm run test:packaging` (build + bundle size + ESM/CJS consumer tests).

### 4. Other conventions

- **Commits:** Use [Conventional Commits](https://www.conventionalcommits.org/) so [semantic-release](https://semantic-release.gitbook.io/) can version and publish correctly:
  - `fix:` → patch
  - `feat:` → minor
  - `feat!:` or `BREAKING CHANGE:` in footer → major
- **CHANGELOG:** Do not edit `CHANGELOG.md` by hand; semantic-release updates it on release.
- **Formatting:** The project uses Prettier (see `.prettierrc`); keep formatting consistent.
- **Bundle size:** The packaging test fails if the main bundle grows; avoid adding large dependencies or data to the default entry point. Optional data (frequency lists, name lists) use separate entry points under `./frequencies/*` and `./names/*`.
- **Publishing:** When you add files that should not be shipped to npm (e.g. tooling, dev config, docs source), update `.npmignore` so they are excluded from the published package.

## Quick reference

| Task              | Command / location                          |
|-------------------|---------------------------------------------|
| Unit tests        | `npm test`                                  |
| Full check        | `npm run test:packaging`                    |
| Build             | `npm run build`                             |
| Docs dev server   | `npm run docs:dev`                          |
| Test files        | `src/**/*.test.ts`                         |
| Public API        | `src/main.ts`                               |

## Project layout (relevant to agents)

- `src/` — TypeScript source and tests (`*.test.ts`).
- `docs/` — VitePress site (index, API, demo).
- `data/`, `data-scripts/` — raw data and scripts that generate `src/frequencies/*`, `src/adjacency_graphs.ts`, and `src/names/*`. Run `npm run build-frequency-lists`, `npm run build-name-lists` (and other `build-*` scripts) if you change data or generation.
- `tests/packaging/` — ESM/CJS consumer tests and bundle size check; run via `npm run test:packaging`.

When in doubt: update README and docs for user-facing changes, add or adjust tests for behavior changes, then run `npm test` and `npm run test:packaging`.
