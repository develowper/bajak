<template>
  <slot />
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  window.tailwindElements()
})
</script>
