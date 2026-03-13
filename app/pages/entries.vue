<template>
  <div class="h-full flex flex-col">
    <!-- 탭 네비게이션 -->
    <div class="flex-none px-8 pt-6 border-b border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-slate-900">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          class="whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-colors"
          :class="[
            $route.path === tab.to || ($route.path === '/entries' && tab.to === '/entries')
              ? 'border-brand-blue text-brand-blue'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
          ]"
        >
          {{ tab.name }}
        </NuxtLink>
      </nav>
    </div>

    <!-- 하위 페이지 렌더링 (Native Scroll 영역) -->
    <div class="flex-1 relative bg-slate-50 dark:bg-slate-900">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
const tabs = [
  { name: '전표 목록 (조회 및 입력)', to: '/entries' },
  { name: '헌금 엑셀 대량 업로드', to: '/entries/excel-upload' },
  { name: '작정헌금 캠페인 관리', to: '/entries/campaign' },
  { name: '작정헌금 관리 현황', to: '/entries/pledge-status' },
  { name: '작정헌금 월별 통계', to: '/entries/pledge-statistics' },
]
</script>
