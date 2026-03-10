<script setup lang="ts">
import { computed, ref } from 'vue'
import zxcvbn from 'ts-zxcvbn'

const password = ref('Tr0ub4dour&3')
const inputs = ref('john, example.com')

const userInputs = computed(() =>
  inputs.value
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
)

const result = computed(() => zxcvbn(password.value, { user_inputs: userInputs.value }))

const scoreLabel = computed(() => {
  const labels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong']
  return labels[result.value.score] ?? 'Unknown'
})
</script>

<template>
  <div class="demo-wrap">
    <label>
      Password
      <input v-model="password" type="text" autocomplete="off" spellcheck="false" />
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

    <div class="stats">
      <p><strong>Score:</strong> {{ result.score }} / 4 ({{ scoreLabel }})</p>
      <p><strong>Estimated guesses:</strong> {{ result.guesses.toLocaleString() }}</p>
      <p><strong>Warning:</strong> {{ result.feedback.warning ?? 'None' }}</p>
      <p>
        <strong>Suggestions:</strong>
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

input {
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
