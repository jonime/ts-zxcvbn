# Live demo

Yes — VitePress can embed interactive Vue components, so users can try `ts-zxcvbn` directly on the docs site.

<ClientOnly>
  <PasswordStrengthDemo />
</ClientOnly>

<script setup lang="ts">
import PasswordStrengthDemo from './.vitepress/components/PasswordStrengthDemo.vue'
</script>
