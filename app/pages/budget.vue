<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">예산작성</h1>
    
    <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors"
          :class="[
            $route.path === tab.to || ($route.path === '/budget' && tab.to === '/budget')
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
          ]"
        >
          {{ tab.name }}
        </NuxtLink>
      </nav>
    </div>

    <div class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
      <p>※ 예산은 최하위단계 계정과목에만 입력할 수 있습니다. 입력한 후 [저장하기]를 클릭해 주세요.</p>
    </div>

    <!-- 하위 페이지 렌더링 -->
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
const tabs = [
  { name: '수입예산', to: '/budget' },
  { name: '지출예산', to: '/budget/expense' },
]
</script>
