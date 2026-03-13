# Performance

Performance depends on your environment and the password set. This page compares **ts-zxcvbn** to other zxcvbn implementations on the same workload.

<ClientOnly>
  <PerformanceChart />
</ClientOnly>

<script setup lang="ts">
import PerformanceChart from './.vitepress/components/PerformanceChart.vue'
</script>

## Compared packages

- **[zxcvbn](https://www.npmjs.com/package/zxcvbn)** — Dropbox’s original JavaScript implementation
- **[zxcvbn-typescript](https://www.npmjs.com/package/zxcvbn-typescript)** — TypeScript port, standalone
- **[@zxcvbn-ts/core](https://www.npmjs.com/package/@zxcvbn-ts/core)** — Modular TypeScript implementation (with language packages)

Other forks and wrappers exist; these are the main npm packages used in the ecosystem.

## How to run the benchmark

From the repo root after cloning:

```bash
npm run benchmark
```

The script installs the comparison packages in `benchmark/`, runs the same password set through each library, and prints ops/sec and a simple bar view. The chart above shows example results; run the benchmark locally to see numbers for your machine.

## Example output

Typical CLI output (format may vary slightly):

```
Performance (same password set, 95 passwords × 200 iterations)

  ts-zxcvbn               19772 ops/sec  961 ms  ████████████████████
  zxcvbn                   8435 ops/sec  2253 ms  █████████░░░░░░░░░░░
  zxcvbn-typescript        7167 ops/sec  2651 ms  ███████░░░░░░░░░░░░░
  @zxcvbn-ts/core          2249 ops/sec  8449 ms  ██░░░░░░░░░░░░░░░░░░
```

## Caveats

- Results are **machine- and Node-version-dependent**. Compare relative numbers on the same machine.
- Using optional lists (e.g. full password frequency list via `passwords`) can change ts-zxcvbn timings; the benchmark uses the default import (no built-in lists) for a fair core comparison.
