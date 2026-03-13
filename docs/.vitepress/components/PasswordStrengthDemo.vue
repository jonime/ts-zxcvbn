<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import zxcvbn from 'ts-zxcvbn';

const password = ref('Tr0ub4dour&3');
const inputs = ref('');

const passwordListKind = ref<'none' | 'lite' | 'full'>('none');
const nameListKind = ref<'none' | 'english' | 'finnish'>('none');
const passwordsList = ref<string[]>([]);
const namesList = ref<string[]>([]);

const userInputs = computed(() =>
  inputs.value
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
);

async function loadPasswordsList(kind: 'none' | 'lite' | 'full') {
  if (kind === 'none') {
    passwordsList.value = [];
    return;
  }
  const mod =
    kind === 'lite'
      ? await import('ts-zxcvbn/frequencies/passwords-lite')
      : await import('ts-zxcvbn/frequencies/passwords');
  passwordsList.value = mod.default;
}

async function loadNamesList(kind: 'none' | 'english' | 'finnish') {
  if (kind === 'none') {
    namesList.value = [];
    return;
  }
  const mod =
    kind === 'english'
      ? await import('ts-zxcvbn/names/english')
      : await import('ts-zxcvbn/names/finnish');
  namesList.value = mod.default;
}

watch(
  passwordListKind,
  (kind) => {
    loadPasswordsList(kind);
  },
  { immediate: true }
);
watch(
  nameListKind,
  (kind) => {
    loadNamesList(kind);
  },
  { immediate: true }
);

const result = computed(() => {
  const options: { user_inputs: string[]; passwords?: string[]; names?: string[] } = {
    user_inputs: userInputs.value,
  };
  if (passwordsList.value.length) options.passwords = passwordsList.value;
  if (namesList.value.length) options.names = namesList.value;
  return zxcvbn(password.value, options);
});

const scoreLabel = computed(() => {
  const labels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
  return labels[result.value.score] ?? 'Unknown';
});
</script>

<template>
  <div class="demo-wrap">
    <label>
      Password
      <input
        v-model="password"
        type="text"
        autocomplete="off"
        spellcheck="false"
      />
    </label>

    <label>
      User inputs (comma-separated)
      <input
        v-model="inputs"
        type="text"
        autocomplete="off"
        spellcheck="false"
        placeholder="name, email, company"
      />
    </label>

    <label>
      Common passwords list
      <select v-model="passwordListKind">
        <option value="none">None</option>
        <option value="lite">Top 5k (lite)</option>
        <option value="full">Full (~30k)</option>
      </select>
    </label>

    <label>
      Name list
      <select v-model="nameListKind">
        <option value="none">None</option>
        <option value="english">English</option>
        <option value="finnish">Finnish</option>
      </select>
    </label>

    <div class="stats">
      <p><strong>Score: </strong>{{ result.score }} / 4 ({{ scoreLabel }})</p>
      <p>
        <strong>Estimated guesses: </strong>
        {{ result.guesses.toLocaleString() }}
      </p>
      <p><strong>Warning: </strong>{{ result.feedback.warning ?? 'None' }}</p>
      <p>
        <strong>Suggestions: </strong>
        <span v-if="result.feedback.suggestions.length">
          {{ result.feedback.suggestions.join(' ') }}
        </span>
        <span v-else>Looks good.</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.demo-wrap {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 16px;
  margin-top: 16px;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 12px;
}

input,
select {
  width: 100%;
  margin-top: 6px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 10px;
  background: var(--vp-c-bg-soft);
}

.stats p {
  margin: 8px 0;
}
</style>
