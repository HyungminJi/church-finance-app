<template>
  <div>
    <!-- 환영 메시지 -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
        환영합니다! 이번 주 재정 현황을 확인하세요.
      </h2>
    </div>

    <!-- 수입/지출 현황 요약 (Grid) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- 수입 현황 -->
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="font-semibold text-lg text-blue-600 dark:text-blue-400">수입 현황</h3>
            <div class="text-sm text-gray-500">이번주 vs 지난주</div>
          </div>
        </template>
        <!-- Nuxt UI v4 UTable - 단순 rows 배열만 사용하여 테스트 -->
        <UTable :data="incomeData" />
      </UCard>

      <!-- 지출 현황 -->
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="font-semibold text-lg text-red-600 dark:text-red-400">지출 현황</h3>
            <div class="text-sm text-gray-500">이번주 vs 지난주</div>
          </div>
        </template>
        <UTable :data="expenseData" />
      </UCard>
    </div>

    <!-- 차트 영역 (Placeholder) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <UCard class="lg:col-span-1">
        <template #header>주차별 현황</template>
        <div class="h-64 bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded">
          <span class="text-gray-400">Chart Placeholder</span>
        </div>
      </UCard>
      <UCard class="lg:col-span-1">
        <template #header>헌금별 현황</template>
        <div class="h-64 bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded">
          <span class="text-gray-400">Pie Chart Placeholder</span>
        </div>
      </UCard>
      <UCard class="lg:col-span-1">
        <template #header>알림 및 요청</template>
        <div class="h-64 flex flex-col items-center justify-center text-gray-500">
          <UIcon name="i-heroicons-inbox" class="w-12 h-12 mb-2" />
          <p>새로운 요청이 없습니다.</p>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
// Nuxt UI v4에서는 :data prop을 사용하며, columns는 선택 사항입니다.
const incomeData = [
  { 항목: '헌금 합계', 지난주: '1,200,000', 이번주: '1,350,000' },
  { 항목: '십일조', 지난주: '800,000', 이번주: '900,000' },
  { 항목: '감사헌금', 지난주: '300,000', 이번주: '350,000' },
  { 항목: '주일헌금', 지난주: '100,000', 이번주: '100,000' }
]

const expenseData = [
  { 항목: '지출 합계', 지난주: '500,000', 이번주: '450,000' },
  { 항목: '목회활동비', 지난주: '200,000', 이번주: '200,000' },
  { 항목: '운영비', 지난주: '300,000', 이번주: '250,000' }
]
</script>
