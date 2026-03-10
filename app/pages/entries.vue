<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">전표입력</h1>
    
    <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors"
          :class="[
            $route.path === tab.to || ($route.path === '/entries' && tab.to === '/entries')
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
  { name: '헌금전표입력', to: '/entries' },
  { name: '헌금전표엑셀입력', to: '/entries/excel-upload' },
  // { name: '모바일헌금 집금내역', to: '/entries/mobile-collection' }, // TODO: 연관 테이블 없음
  // { name: '헌금누락확인요청', to: '/entries/omission-check' }, // TODO: 연관 테이블 없음
  { name: '일반전표입력', to: '/entries/general' },
  // { name: '예약전표관리', to: '/entries/reservation' }, // TODO: 연관 테이블 없음
  { name: '작정헌금 캠페인 관리', to: '/entries/campaign' },
  { name: '작정헌금 출금/입력 현황', to: '/entries/pledge-status' },
  { name: '작정헌금 월별 통계 조회', to: '/entries/pledge-statistics' },
]
</script>
