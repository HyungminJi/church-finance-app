<template>
  <div class="space-y-6">
    <!-- 옵션 패널 -->
    <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex flex-wrap gap-4 items-center">
      <div class="flex items-center space-x-2">
        <label class="text-sm text-gray-700 dark:text-gray-300">기간:</label>
        <input type="date" class="border-gray-300 rounded text-sm dark:bg-gray-700 dark:border-gray-600" />
        <span class="text-gray-500">~</span>
        <input type="date" class="border-gray-300 rounded text-sm dark:bg-gray-700 dark:border-gray-600" />
      </div>

      <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
        조회
      </button>
    </div>

    <!-- 시산표 테이블 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-900 text-center">
          <tr>
            <th colspan="2" class="px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase border-r border-gray-200 dark:border-gray-700">차변 (Debit)</th>
            <th rowspan="2" class="px-6 py-2 text-sm font-bold text-gray-900 dark:text-white uppercase border-r border-gray-200 dark:border-gray-700 w-64 bg-gray-200 dark:bg-gray-800">계정과목</th>
            <th colspan="2" class="px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">대변 (Credit)</th>
          </tr>
          <tr>
            <th class="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-r border-t border-gray-200 dark:border-gray-700">잔액</th>
            <th class="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-r border-t border-gray-200 dark:border-gray-700">합계</th>
            <th class="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-r border-t border-gray-200 dark:border-gray-700">합계</th>
            <th class="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-t border-gray-200 dark:border-gray-700">잔액</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="(item, index) in trialItems" :key="index" class="text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="px-4 py-2 text-right border-r font-medium text-blue-600">{{ item.debitBalance }}</td>
            <td class="px-4 py-2 text-right border-r text-gray-500">{{ item.debitTotal }}</td>
            <td class="px-4 py-2 text-center border-r font-bold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">{{ item.account }}</td>
            <td class="px-4 py-2 text-right border-r text-gray-500">{{ item.creditTotal }}</td>
            <td class="px-4 py-2 text-right font-medium text-red-600">{{ item.creditBalance }}</td>
          </tr>
          
          <!-- 합계 -->
           <tr class="font-bold bg-gray-100 dark:bg-gray-800 border-t-2 border-gray-300 dark:border-gray-600">
             <td class="px-4 py-2 text-right border-r text-blue-800">24,900,000</td>
             <td class="px-4 py-2 text-right border-r text-gray-700">55,000,000</td>
             <td class="px-4 py-2 text-center border-r bg-gray-200 dark:bg-gray-700">합계</td>
             <td class="px-4 py-2 text-right border-r text-gray-700">55,000,000</td>
             <td class="px-4 py-2 text-right text-red-800">24,900,000</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const trialItems = ref([
  { account: '현금', debitBalance: '24,000,000', debitTotal: '24,000,000', creditTotal: '0', creditBalance: '0' },
  { account: '보통예금', debitBalance: '900,000', debitTotal: '31,000,000', creditTotal: '30,100,000', creditBalance: '0' },
  { account: '십일조', debitBalance: '0', debitTotal: '0', creditTotal: '30,000,000', creditBalance: '30,000,000' },
  { account: '감사헌금', debitBalance: '0', debitTotal: '0', creditTotal: '5,000,000', creditBalance: '5,000,000' },
  { account: '목회활동비', debitBalance: '0', debitTotal: '5,000,000', creditTotal: '0', creditBalance: '5,000,000' },
])
</script>
