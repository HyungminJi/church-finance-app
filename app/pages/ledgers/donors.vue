<template>
  <div class="space-y-6">
    <!-- 검색 필터 -->
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-center">
      <div>
        <label class="sr-only">기간</label>
        <input type="date" class="border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" />
        <span class="mx-2 text-gray-500">~</span>
        <input type="date" class="border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" />
      </div>
      
      <div class="relative">
        <input type="text" placeholder="성도 이름 검색" class="pl-8 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" />
        <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
      </div>

      <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        조회
      </button>
    </div>

    <!-- 리스트 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">일자</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">직분</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">헌금종류</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">비고</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="(item, index) in donors" :key="index">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.date }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ item.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.title }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.type }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">{{ item.amount }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.note }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const donors = ref([
  { date: '2026-02-25', name: '김철수', title: '집사', type: '십일조', amount: '500,000', note: '' },
  { date: '2026-02-25', name: '이영희', title: '권사', type: '감사헌금', amount: '100,000', note: '범사에 감사' },
  { date: '2026-02-25', name: '박민수', title: '성도', type: '주일헌금', amount: '10,000', note: '' },
])
</script>
