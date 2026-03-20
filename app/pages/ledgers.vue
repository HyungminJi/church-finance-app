<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">장부관리</h1>
    
    <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer"
          :class="[
            isTabActive(tab.to)
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
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { name: '원장', to: '/ledgers' },
  { name: '총계정원장', to: '/ledgers/total-account' },
  { name: '재정보고서', to: '/ledgers/report' },
  { name: '자금명세서', to: '/ledgers/funds' },
  { name: '헌금자리스트', to: '/ledgers/donors' },
  { name: '헌금자통계', to: '/ledgers/statistics' },
  { name: '헌금자순위', to: '/ledgers/rank' },
  { name: '기부금영수증', to: '/ledgers/receipts' },
]

const isTabActive = (path: string) => {
  if (path === '/ledgers') {
    return route.path === '/ledgers' || route.path === '/ledgers/'
  }
  return route.path.startsWith(path)
}
</script>
