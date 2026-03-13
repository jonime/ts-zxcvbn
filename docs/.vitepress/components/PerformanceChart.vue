<script setup lang="ts">
// Chart data is loaded from benchmark-results.json. Update it with: npm run benchmark:update-docs
import chartData from '../../benchmark-results.json';

const exampleData = chartData as Array<{ name: string; opsPerSec: number }>;
const maxOps = Math.max(...exampleData.map((d) => d.opsPerSec));
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
          :style="{ width: (row.opsPerSec / maxOps) * 100 + '%' }"
        />
      </div>
      <span class="perf-chart-value">{{ row.opsPerSec.toLocaleString() }} ops/sec</span>
    </div>
    <p class="perf-chart-caption">
      Example run (same password set, 95 passwords × 200 iterations). To refresh this chart with your machine’s results, run
      <code>npm run benchmark:update-docs</code>; for a one-off comparison, run <code>npm run benchmark</code>.
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

.perf-chart-value {
  text-align: right;
  color: var(--vp-c-text-2);
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
