<template>
  <div class="flex items-center justify-center h-full">
    <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-slate-500 animate-spin" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'back-office',
  middleware: 'master'
})

onMounted(() => {
  navigateTo('/back-office/churches')
})
</script>
