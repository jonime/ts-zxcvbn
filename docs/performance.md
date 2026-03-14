# Performance

This page compares **ts-zxcvbn** to Dropbox’s original **zxcvbn** and other implementations on the same workload. The chart shows ops/sec and a **vs zxcvbn** multiplier so you can see how much faster ts-zxcvbn is. Results depend on your environment and the password set.

<ClientOnly>
  <PerformanceChart />
</ClientOnly>

<script setup lang="ts">
import PerformanceChart from './.vitepress/components/PerformanceChart.vue'
</script>

## Compared packages

The chart uses **zxcvbn** (Dropbox’s original) as the baseline (1×):

- **ts-zxcvbn** — This library, default import (no optional lists)
- **ts-zxcvbn (passwords + names)** — Same library with the largest password frequency list and English name list enabled (see [API](api.md#options) for `passwords` and `names`). Lets you see how optional lists affect performance.
- **[zxcvbn](https://www.npmjs.com/package/zxcvbn)** — Dropbox’s original JavaScript implementation
- **[zxcvbn-typescript](https://www.npmjs.com/package/zxcvbn-typescript)** — TypeScript port, standalone
- **[@zxcvbn-ts/core](https://www.npmjs.com/package/@zxcvbn-ts/core)** — Modular TypeScript implementation (with language packages)

Other forks and wrappers exist; these are the main npm packages used in the ecosystem.

## How to run the benchmark

From the repo root after cloning:

```bash
npm run benchmark
```

The script installs the comparison packages in `benchmark/`, runs the same password set through each library, and prints ops/sec and a simple bar view. Iteration count is adjusted per implementation (target ~5s each) so slower variants (e.g. ts-zxcvbn with optional lists) don’t run excessively long. The chart above shows example results; run the benchmark locally to see numbers for your machine.

## Example output

Typical CLI output (format may vary slightly):

```
Performance (same password set, 95 passwords, ~5s target per implementation, iteration count varies)

  ts-zxcvbn                      64401 ops/sec    295 ms  (200 it)  ████████████████████
  zxcvbn                          7854 ops/sec   2419 ms  (200 it)  ██░░░░░░░░░░░░░░░░░░
  zxcvbn-typescript               6817 ops/sec   2787 ms  (200 it)  ██░░░░░░░░░░░░░░░░░░
  @zxcvbn-ts/core                 2163 ops/sec   4832 ms  (110 it)  █░░░░░░░░░░░░░░░░░░░
  ts-zxcvbn (passwords + names)    268 ops/sec   4612 ms  ( 13 it)  ░░░░░░░░░░░░░░░░░░░░
```

## Caveats

- Results are **machine- and Node-version-dependent**. Compare relative numbers on the same machine.
- The benchmark includes **ts-zxcvbn** twice: once without optional lists (default) and once with the full password list and English name list, so you can see how optional lists affect performance.
