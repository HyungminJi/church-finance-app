<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">결산/보고서</h1>
    
    <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          class="cursor-pointer whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors"
          :class="[
            $route.path === tab.to || ($route.path === '/reports' && tab.to === '/reports')
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
          ]"
        >
          {{ tab.name }}
        </NuxtLink>
      </nav>
    </div>

    <!-- 하위 페이지 렌더링 -->
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
const tabs = [
  { name: '항목별명세서', to: '/reports' },
  { name: '합계잔액시산표', to: '/reports/trial-balance' },
]
</script>
