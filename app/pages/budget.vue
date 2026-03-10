<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">예산작성</h1>
      
      <!-- 회계년도 선택 -->
      <div class="flex items-center space-x-2 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <span class="pl-3 text-sm font-bold text-gray-500">회계년도</span>
        <USelectMenu 
          v-model="selectedYear" 
          :items="yearOptions" 
          class="w-32"
          size="sm"
        />
      </div>
    </div>
    
    <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          class="whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-colors cursor-pointer"
          :class="[
            isTabActive(tab.to)
              ? 'border-brand-blue text-brand-blue'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
          ]"
        >
          {{ tab.name }}
        </NuxtLink>
      </nav>
    </div>

    <div class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm flex items-start gap-2">
      <UIcon name="i-heroicons-information-circle" class="w-5 h-5 shrink-0 mt-0.5" />
      <div>
        <p class="font-bold">예산 입력 가이드</p>
        <p>※ 예산은 최하위단계(레벨 2) 계정과목에만 입력할 수 있습니다. 상위 항목은 하위 항목들의 합계로 자동 계산됩니다.</p>
      </div>
    </div>

    <!-- 하위 페이지 렌더링 -->
    <NuxtPage :selectedYear="selectedYear" />
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'

const route = useRoute()

// 연도 옵션 (현재 전후 2년)
const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString())
const selectedYear = ref(currentYear.toString())

// 하위 페이지를 위해 provide (필요시)
provide('budgetYear', selectedYear)

const tabs = [
  { name: '수입예산', to: '/budget' },
  { name: '지출예산', to: '/budget/expense' },
]

const isTabActive = (path: string) => {
  if (path === '/budget' && route.path === '/budget') return true
  if (path === '/budget/expense' && route.path === '/budget/expense') return true
  return false
}
</script>
