<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">기초코드등록</h1>
    
    <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav class="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors"
          :class="[
            $route.path === tab.to || ($route.path === '/basic-codes' && tab.to === '/basic-codes')
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
const route = useRoute()

const tabs = [
  { name: '계정과목등록', to: '/basic-codes' },
  // { name: '계좌/외화 코드등록', to: '/basic-codes/bank-accounts' }, // TODO: 연관 테이블 없음
  // { name: '예배코드관리', to: '/basic-codes/worships' }, // TODO: 연관 테이블 없음
  { name: '성도 목록', to: '/basic-codes/members' },
  { name: '구역 목록', to: '/basic-codes/cell-groups' },
]
</script>
