# Live demo

<ClientOnly>
  <PasswordStrengthDemo />
</ClientOnly>

The demo uses the default zxcvbn import (no built-in frequency list). Use the dropdowns to try optional **common-passwords** and **name** lists. For production, pass `passwords` and `names` as shown in the [API reference](/api).

<script setup lang="ts">
import PasswordStrengthDemo from './.vitepress/components/PasswordStrengthDemo.vue'
</script>
