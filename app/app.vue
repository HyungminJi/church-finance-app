<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- 전역 모달 시스템 -->
    <AppModal />
  </UApp>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
colorMode.preference = 'light'

useHead({
  title: '교회 재정 관리',
  titleTemplate: (title) => title ? `${title} - Ledgerrection` : '교회 재정 관리'
})
</script>
