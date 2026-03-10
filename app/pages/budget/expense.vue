<template>
  <div>
    <!-- 헤더 버튼 -->
    <div class="mb-4 flex justify-end space-x-2">
      <button class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 text-sm flex items-center">
        <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4 mr-2" />
        엑셀
      </button>
      <button class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 text-sm flex items-center">
        <UIcon name="i-heroicons-printer" class="w-4 h-4 mr-2" />
        인쇄
      </button>
      <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
        저장하기
      </button>
    </div>

    <!-- 테이블 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">계정코드</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">계정이름</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">전년예산</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">전년결산</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">예산 (입력)</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">증감</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">비고</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="item in budgetItems" :key="item.code" :class="{'bg-gray-50/50 dark:bg-gray-900/50': item.isGroup}">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{{ item.code }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100" :class="{'font-bold': item.isGroup}">
              <span :style="{ paddingLeft: (item.level * 20) + 'px' }">{{ item.name }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{{ formatNumber(item.lastYearBudget) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{{ formatNumber(item.lastYearActual) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right">
              <input 
                v-if="!item.isGroup"
                type="text" 
                v-model="item.thisYearBudget"
                class="w-32 text-right border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm px-2 py-1"
              />
              <span v-else class="font-bold">{{ formatNumber(calculateGroupTotal(item)) }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right" :class="getChangeColor(calculateChange(item))">
              {{ formatNumber(calculateChange(item)) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <input 
                v-if="!item.isGroup"
                type="text" 
                v-model="item.note"
                class="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm px-2 py-1"
              />
            </td>
          </tr>
          <!-- 합계 -->
          <tr class="bg-red-50 dark:bg-red-900/30 font-bold">
            <td colspan="2" class="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-100 uppercase tracking-wider">지출 합계</td>
            <td class="px-6 py-4 text-right text-sm">{{ formatNumber(20000000) }}</td>
            <td class="px-6 py-4 text-right text-sm">0</td>
            <td class="px-6 py-4 text-right text-sm">{{ formatNumber(35000000) }}</td>
            <td class="px-6 py-4 text-right text-sm text-blue-600">{{ formatNumber(15000000) }}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const budgetItems = ref([
  { code: '6000', name: '지출', level: 0, isGroup: true, lastYearBudget: 20000000, lastYearActual: 0, thisYearBudget: 0, note: '' },
  { code: '6100', name: '목회활동비', level: 1, isGroup: false, lastYearBudget: 10000000, lastYearActual: 0, thisYearBudget: 15000000, note: '' },
  { code: '6200', name: '선교비', level: 1, isGroup: true, lastYearBudget: 5000000, lastYearActual: 0, thisYearBudget: 0, note: '' },
  { code: '6210', name: '국내선교', level: 2, isGroup: false, lastYearBudget: 3000000, lastYearActual: 0, thisYearBudget: 10000000, note: '' },
  { code: '6220', name: '해외선교', level: 2, isGroup: false, lastYearBudget: 2000000, lastYearActual: 0, thisYearBudget: 5000000, note: '' },
  { code: '6300', name: '관리비', level: 1, isGroup: false, lastYearBudget: 5000000, lastYearActual: 0, thisYearBudget: 5000000, note: '' },
])

const formatNumber = (val: number) => {
  return new Intl.NumberFormat().format(val)
}

const calculateGroupTotal = (item: any) => {
  if (item.code === '6000') return 35000000
  if (item.code === '6200') return 15000000
  return 0
}

const calculateChange = (item: any) => {
  const budget = item.isGroup ? calculateGroupTotal(item) : (parseInt(item.thisYearBudget as any) || 0)
  return budget - item.lastYearBudget
}

const getChangeColor = (change: number) => {
  if (change > 0) return 'text-blue-600 dark:text-blue-400'
  if (change < 0) return 'text-red-600 dark:text-red-400'
  return 'text-gray-500'
}
</script>
