---
name: Performance comparison docs
overview: Add a Performance section to the VitePress docs that compares ts-zxcvbn to zxcvbn, zxcvbn-typescript, and @zxcvbn-ts/core, with a runnable benchmark script in a dedicated benchmark/ folder so users can reproduce results on their machine.
todos: []
isProject: false
---

# Performance comparison in docs

## Scope

- **Compared packages:** [zxcvbn](https://www.npmjs.com/package/zxcvbn) (Dropbox original), [zxcvbn-typescript](https://www.npmjs.com/package/zxcvbn-typescript), [@zxcvbn-ts/core](https://www.npmjs.com/package/@zxcvbn-ts/core) (with language packages), and ts-zxcvbn. These are the main npm packages; other forks (e.g. language-specific wrappers) can be mentioned briefly or omitted to keep the benchmark maintainable.
- **Run on user's machine:** A `benchmark` script that runs a Node script against the same password set and reports relative timings (e.g. ops/sec or ms per N evaluations) so results are reproducible locally.

## 1. Runnable benchmark

**Location:** Dedicated `benchmark/` folder (like [tests/packaging](tests/packaging/) with its own deps) so the root [package.json](package.json) stays free of benchmark-only packages.

- **benchmark/package.json** — Dependencies: `ts-zxcvbn` via `file:..`, plus `zxcvbn`, `zxcvbn-typescript`, `@zxcvbn-ts/core`, `@zxcvbn-ts/language-common`, `@zxcvbn-ts/language-en`. Script: `"benchmark": "node run.mjs"` (or `run.js`).
- **benchmark/run.mjs** — ESM script that:
  - Defines a shared list of ~50–100 varied passwords (short/long, dictionary-like, numbers, symbols, etc.). Can be inlined or loaded from a small `passwords.json` in `benchmark/`.
  - For each library: require/import, run the same passwords repeatedly (e.g. 100–500 iterations per library), measure with `performance.now()` or Node’s `perf_hooks`, compute ops/sec or total ms.
  - **ts-zxcvbn:** `import zxcvbn from 'ts-zxcvbn'` then `zxcvbn(pwd)` (no optional lists for fair “core” comparison, or add a second run with `passwords` list if desired).
  - **zxcvbn:** `require('zxcvbn')` or dynamic import; API is `zxcvbn(password, user_inputs?)`.
  - **zxcvbn-typescript:** Same pattern; API is compatible.
  - **@zxcvbn-ts/core:** Must call `zxcvbnOptions.setOptions(...)` once with `@zxcvbn-ts/language-common` and `@zxcvbn-ts/language-en` (dictionary, graphs, translations), then `zxcvbn(password)` per run.
  - Output: table or lines like `ts-zxcvbn: X ops/sec`, `zxcvbn: Y ops/sec`, etc., and total time for the run.
- Use a simple timing loop (warmup + measured runs) to avoid adding a benchmark framework; if you prefer a small dependency, [tinybench](https://www.npmjs.com/package/tinybench) is a good fit and gives stats (e.g. std dev).

**Root package.json:** Add script `"benchmark": "cd benchmark && npm install && npm run benchmark"` so users run `npm run benchmark` from the repo root. Document in README “Development” and in [AGENTS.md](AGENTS.md).

**.npmignore:** Exclude `benchmark/` (or at least `benchmark/node_modules`) from the published package so the benchmark stays dev-only.

## 2. Docs: Performance page

- **New file:** [docs/performance.md](docs/performance.md)
  - **Title:** e.g. “Performance”
  - **Intro:** Short note that performance depends on environment and data; the page compares ts-zxcvbn to other zxcvbn implementations.
  - **Chart:** Include a visual bar chart so readers can compare at a glance.
    - **Approach:** Add a Vue component (e.g. `PerformanceChart.vue` in `docs/.vitepress/components/`) that renders a **horizontal bar chart** from example benchmark data (ops/sec per package). Use **CSS-only bars** (no chart library): each row = package name + a `<div>` whose width is a percentage of the max value; normalize so the fastest is 100% and others scale proportionally. Data can be inline in the component or passed as a prop (e.g. one representative run: “Node 20, M1” or similar). Wrap in `<ClientOnly>` in the markdown like the existing [PasswordStrengthDemo](docs/.vitepress/components/PasswordStrengthDemo.vue). This keeps the docs dependency-free and consistent with the demo page.
    - **Alternative:** If you prefer a chart library for richer styling/tooltips, add Mermaid via `vitepress-plugin-mermaid` and embed a Mermaid `xychart` bar block in the markdown with the same example data; then the chart is just a ``

``mermaid ` code block and no Vue component.

- **Compared packages:** Bullet list with links: zxcvbn (Dropbox), zxcvbn-typescript, @zxcvbn-ts/core. Brief note that other forks exist but these are the main ones used in the ecosystem.
- **How to run:** Instruct users to run `npm run benchmark` from the repo root (after clone). Explain that the script runs the same password set through each library and reports timings. Note that the chart above shows example results; run the benchmark locally for your own numbers.
- **Optional:** One “Example output” subsection with a sanitized CLI sample (e.g. “Node 20, M1: ts-zxcvbn X ops/sec, …”) so readers see what to expect without running.
- **Caveats:** Results are machine- and Node-version-dependent; compare relative numbers on the same machine; optional lists (e.g. full password frequency list) can change ts-zxcvbn timings.
- **VitePress config:** In [docs/.vitepress/config.mts](docs/.vitepress/config.mts), add a “Performance” item to `themeConfig.nav` and to the sidebar `items` (e.g. after “Live demo”), linking to `/performance`.

## 3. README and AGENTS.md

- **README:** In the “Why this package” or “Development” section, add a line that points to the performance comparison and the `npm run benchmark` command (with link to the docs performance page once deployed).
- **AGENTS.md:** In the “Quick reference” table, add a row for the benchmark script and location (`benchmark/`, `npm run benchmark`).

## 4. Implementation notes

- **API differences:** @zxcvbn-ts/core requires one-time `setOptions()` with dictionary/graphs/translations; the script should do that once before the timed loop. zxcvbn and zxcvbn-typescript are sync and take `(password, user_inputs?)`; use the same `user_inputs` (e.g. empty) for all for fairness.
- **Password set:** Use a fixed, small set of strings (no PII); variety (length, character classes) makes the benchmark more representative. No need to read from `data/` at runtime.
- **Optional:** If any of the three comparison packages fail to load (e.g. not installed), catch and print “X not installed, skipped” so the script still runs for the rest.

## Summary

| Area               | Action                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| Benchmark runner   | Add `benchmark/` with package.json, run.mjs, shared password list; root script `npm run benchmark`    |
| Docs               | New `docs/performance.md` + nav/sidebar in config                                                     |
| Chart on perf page | Vue component `PerformanceChart.vue` (CSS bar chart from example data) or Mermaid xychart in markdown |
| README / AGENTS.md | Link to performance docs and document `benchmark` script                                              |
| .npmignore         | Exclude `benchmark/` (or its node_modules) from publish                                               |

No change to the main library code or bundle; the benchmark is dev-only and does not affect package size or existing tests.
