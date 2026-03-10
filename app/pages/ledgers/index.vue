<template>
  <div class="space-y-6">
    <!-- 기간 선택 -->
    <div class="flex flex-wrap items-center gap-2">
      <UButton color="neutral" variant="outline" icon="i-heroicons-chevron-left" size="xs" class="cursor-pointer" />
      <UButton color="primary" variant="solid" label="오늘" size="sm" class="cursor-pointer font-bold" />
      <UButton color="neutral" variant="outline" icon="i-heroicons-chevron-right" size="xs" class="cursor-pointer" />
      
      <div class="border-l border-gray-300 h-6 mx-2 dark:border-gray-600"></div>

      <UButton color="neutral" variant="ghost" label="이번주" size="sm" class="cursor-pointer" />
      <UButton color="neutral" variant="ghost" label="이번달" size="sm" class="cursor-pointer" />
      <UButton color="neutral" variant="ghost" label="1분기" size="sm" class="cursor-pointer" />
      
      <div class="flex-grow"></div>
      
      <UButton icon="i-heroicons-printer" color="neutral" variant="outline" label="인쇄" class="cursor-pointer font-bold" />
    </div>

    <!-- 보고서 테이블 (좌우 분할) -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
        <!-- 수입부 -->
        <div>
          <div class="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 font-bold text-center text-blue-700 dark:text-blue-300 border-b border-gray-200 dark:border-gray-700">
            수입부
          </div>
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">항목</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">적요</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">금액</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="item in incomeItems" :key="item.category">
                <td class="px-4 py-2 text-sm text-gray-900 dark:text-white">{{ item.category }}</td>
                <td class="px-4 py-2 text-sm text-gray-500">{{ item.note }}</td>
                <td class="px-4 py-2 text-sm text-right font-mono">{{ item.amount }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 지출부 -->
        <div>
          <div class="bg-red-50 dark:bg-red-900/20 px-4 py-2 font-bold text-center text-red-700 dark:text-red-300 border-b border-gray-200 dark:border-gray-700">
            지출부
          </div>
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">항목</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">적요</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">금액</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
               <tr v-for="item in expenseItems" :key="item.category">
                <td class="px-4 py-2 text-sm text-gray-900 dark:text-white">{{ item.category }}</td>
                <td class="px-4 py-2 text-sm text-gray-500">{{ item.note }}</td>
                <td class="px-4 py-2 text-sm text-right font-mono">{{ item.amount }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- 합계 요약 -->
      <div class="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div class="text-xs text-gray-500 uppercase">수입합계</div>
            <div class="text-lg font-bold text-blue-600">1,350,000</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 uppercase">지출합계</div>
             <div class="text-lg font-bold text-red-600">450,000</div>
          </div>
           <div>
            <div class="text-xs text-gray-500 uppercase">이월금</div>
             <div class="text-lg font-bold text-gray-700 dark:text-gray-300">24,000,000</div>
          </div>
           <div>
            <div class="text-xs text-gray-500 uppercase">차인잔액</div>
             <div class="text-lg font-bold text-green-600">24,900,000</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const incomeItems = ref([
  { category: '십일조', note: '김철수 외 2명', amount: '900,000' },
  { category: '감사헌금', note: '이영희', amount: '100,000' },
  { category: '주일헌금', note: '무명', amount: '350,000' },
])

const expenseItems = ref([
  { category: '식대', note: '중식비', amount: '200,000' },
  { category: '운영비', note: '사무용품', amount: '250,000' },
])
</script>
