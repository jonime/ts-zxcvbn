<script setup lang="ts">
// Chart data is loaded from benchmark-results.json. Update it with: npm run benchmark:update-docs
import chartData from '../../benchmark-results.json';

const exampleData = chartData as Array<{ name: string; opsPerSec: number }>;
const maxOps = Math.max(...exampleData.map((d) => d.opsPerSec));
const zxcvbnOps =
  exampleData.find((d) => d.name === 'zxcvbn')?.opsPerSec ?? 1;

// Bar width: scale to largest value (fastest = full bar)
function barWidth(ops: number): number {
  return maxOps > 0 ? (ops / maxOps) * 100 : 0;
}

function vsZxcvbn(ops: number): string {
  if (zxcvbnOps <= 0) return '—';
  const mult = ops / zxcvbnOps;
  return mult >= 9.95 ? mult.toFixed(0) + '×' : mult.toFixed(1) + '×';
}
</script>

<template>
  <div class="perf-chart">
    <div
      v-for="row in exampleData"
      :key="row.name"
      class="perf-chart-row"
    >
      <span class="perf-chart-label">{{ row.name }}</span>
      <div class="perf-chart-bar-wrap">
        <div
          class="perf-chart-bar"
          :style="{ width: barWidth(row.opsPerSec) + '%' }"
        />
      </div>
      <span class="perf-chart-pct">{{ vsZxcvbn(row.opsPerSec) }}</span>
    </div>
    <table class="perf-table">
      <thead>
        <tr>
          <th>Implementation</th>
          <th class="perf-table-ops">ops/sec</th>
          <th class="perf-table-ops">vs zxcvbn (original)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in exampleData" :key="row.name">
          <td>{{ row.name }}</td>
          <td class="perf-table-ops">{{ row.opsPerSec.toLocaleString() }}</td>
          <td class="perf-table-ops">{{ vsZxcvbn(row.opsPerSec) }}</td>
        </tr>
      </tbody>
    </table>
    <p class="perf-chart-caption">
      Example run (same password set, 95 passwords × 200 iterations). To refresh this chart with your machine’s results, run
      <code>npm run benchmark:update-docs</code>; for a one-off comparison, run <code>npm run benchmark</code>. “vs zxcvbn” is speed relative to the original library (1× = same speed).
    </p>
  </div>
</template>

<style scoped>
.perf-chart {
  margin: 1rem 0;
  font-size: 0.9rem;
}

.perf-chart-row {
  display: grid;
  grid-template-columns: 140px 1fr 100px;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.perf-chart-label {
  font-weight: 500;
}

.perf-chart-bar-wrap {
  height: 1.25rem;
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
  overflow: hidden;
}

.perf-chart-bar {
  height: 100%;
  background: var(--vp-c-brand-1);
  border-radius: 4px;
  min-width: 2px;
  transition: width 0.3s ease;
}

.perf-chart-pct {
  text-align: right;
  color: var(--vp-c-text-2);
  font-variant-numeric: tabular-nums;
  min-width: 3.5rem;
}

.perf-table {
  width: 100%;
  margin-top: 1rem;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.perf-table th,
.perf-table td {
  padding: 0.5rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--vp-c-divider);
}

.perf-table th {
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.perf-table-ops {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.perf-chart-caption {
  margin-top: 1rem;
  margin-bottom: 0;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.perf-chart-caption code {
  font-size: 0.8em;
  padding: 0.15em 0.4em;
  border-radius: 4px;
  background: var(--vp-c-bg-soft);
}
</style>
