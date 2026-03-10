<template>
  <div class="space-y-6">
    <!-- 옵션 패널 -->
    <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex flex-wrap gap-4 items-center">
      <div class="flex items-center space-x-2">
        <label class="text-sm text-gray-700 dark:text-gray-300">기간:</label>
        <button class="px-2 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600">이번달</button>
        <button class="px-2 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600">이번년도</button>
      </div>
      
      <div class="border-l border-gray-300 h-6 dark:border-gray-600"></div>

      <div class="flex items-center space-x-4">
        <label class="flex items-center space-x-1">
          <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <span class="text-sm text-gray-700 dark:text-gray-300">이월금표기</span>
        </label>
        <label class="flex items-center space-x-1">
          <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <span class="text-sm text-gray-700 dark:text-gray-300">잔액표기</span>
        </label>
        <label class="flex items-center space-x-1">
          <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <span class="text-sm text-gray-700 dark:text-gray-300">누계합계</span>
        </label>
      </div>

      <div class="flex-grow"></div>
      
      <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
        조회
      </button>
    </div>

    <!-- 명세서 테이블 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-900 text-center">
          <tr>
            <th colspan="4" class="px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase border-r border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/30">수입부</th>
            <th colspan="4" class="px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase bg-red-50 dark:bg-red-900/30">지출부</th>
          </tr>
          <tr>
            <th class="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-r">항목</th>
            <th class="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-r">예산</th>
            <th class="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-r">금액</th>
            <th class="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-r">누계</th>
            <th class="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-r">항목</th>
            <th class="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-r">예산</th>
            <th class="px-4 py-2 text-xs font-medium text-gray-500 uppercase border-r">금액</th>
            <th class="px-4 py-2 text-xs font-medium text-gray-500 uppercase">누계</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="(item, index) in items" :key="index" class="text-sm">
            <!-- 수입 -->
            <td class="px-4 py-2 border-r">{{ item.incomeName }}</td>
            <td class="px-4 py-2 text-right border-r text-gray-500">{{ item.incomeBudget }}</td>
            <td class="px-4 py-2 text-right border-r font-medium text-blue-600">{{ item.incomeAmount }}</td>
            <td class="px-4 py-2 text-right border-r text-gray-500">{{ item.incomeTotal }}</td>
            
            <!-- 지출 -->
            <td class="px-4 py-2 border-r">{{ item.expenseName }}</td>
            <td class="px-4 py-2 text-right border-r text-gray-500">{{ item.expenseBudget }}</td>
            <td class="px-4 py-2 text-right border-r font-medium text-red-600">{{ item.expenseAmount }}</td>
            <td class="px-4 py-2 text-right text-gray-500">{{ item.expenseTotal }}</td>
          </tr>
          
          <!-- 합계행 -->
          <tr class="font-bold bg-gray-50 dark:bg-gray-800 border-t-2 border-gray-300 dark:border-gray-600">
             <td class="px-4 py-2 border-r text-center">수입합계</td>
             <td class="px-4 py-2 text-right border-r">1,200,000,000</td>
             <td class="px-4 py-2 text-right border-r text-blue-700">1,350,000</td>
             <td class="px-4 py-2 text-right border-r">50,000,000</td>
             <td class="px-4 py-2 border-r text-center">지출합계</td>
             <td class="px-4 py-2 text-right border-r">35,000,000</td>
             <td class="px-4 py-2 text-right border-r text-red-700">450,000</td>
             <td class="px-4 py-2 text-right">15,000,000</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const items = ref([
  { 
    incomeName: '십일조', incomeBudget: '1,000,000,000', incomeAmount: '900,000', incomeTotal: '30,000,000',
    expenseName: '목회활동비', expenseBudget: '15,000,000', expenseAmount: '200,000', expenseTotal: '5,000,000'
  },
  { 
    incomeName: '감사헌금', incomeBudget: '100,000,000', incomeAmount: '100,000', incomeTotal: '5,000,000',
    expenseName: '운영비', expenseBudget: '5,000,000', expenseAmount: '250,000', expenseTotal: '3,000,000'
  },
  { 
    incomeName: '주일헌금', incomeBudget: '50,000,000', incomeAmount: '350,000', incomeTotal: '15,000,000',
    expenseName: '', expenseBudget: '', expenseAmount: '', expenseTotal: ''
  },
])
</script>
