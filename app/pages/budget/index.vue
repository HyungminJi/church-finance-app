<template>
  <div>
    <!-- 헤더 버튼 -->
    <div class="mb-4 flex justify-end space-x-2">
      <UButton 
        icon="i-heroicons-table-cells" 
        color="success" 
        variant="outline" 
        label="엑셀" 
        class="cursor-pointer bg-white dark:bg-gray-800 font-bold" 
      />
      <UButton 
        icon="i-heroicons-printer" 
        color="neutral" 
        variant="outline" 
        label="인쇄" 
        class="cursor-pointer bg-white dark:bg-gray-800 font-bold" 
      />
      <UButton 
        color="primary" 
        label="저장하기" 
        class="font-bold cursor-pointer" 
      />
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
          <tr class="bg-blue-50 dark:bg-blue-900/30 font-bold">
            <td colspan="2" class="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-100 uppercase tracking-wider">수입 합계</td>
            <td class="px-6 py-4 text-right text-sm">{{ formatNumber(24300000) }}</td>
            <td class="px-6 py-4 text-right text-sm">0</td>
            <td class="px-6 py-4 text-right text-sm">{{ formatNumber(1141400000) }}</td>
            <td class="px-6 py-4 text-right text-sm text-blue-600">{{ formatNumber(1117100000) }}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const budgetItems = ref([
  { code: '5000', name: '수입', level: 0, isGroup: true, lastYearBudget: 24300000, lastYearActual: 0, thisYearBudget: 0, note: '' },
  { code: '5100', name: '헌금수입', level: 1, isGroup: true, lastYearBudget: 24000000, lastYearActual: 0, thisYearBudget: 0, note: '' },
  { code: '5110', name: '십일조', level: 2, isGroup: false, lastYearBudget: 0, lastYearActual: 0, thisYearBudget: 1000000000, note: '' },
  { code: '5120', name: '감사헌금', level: 2, isGroup: false, lastYearBudget: 0, lastYearActual: 0, thisYearBudget: 0, note: '' },
  { code: '5130', name: '주일헌금', level: 2, isGroup: false, lastYearBudget: 0, lastYearActual: 0, thisYearBudget: 50000000, note: '' },
  { code: '5200', name: '기타수입', level: 1, isGroup: false, lastYearBudget: 300000, lastYearActual: 0, thisYearBudget: 1000000, note: '' },
])

const formatNumber = (val: number) => {
  return new Intl.NumberFormat().format(val)
}

const calculateGroupTotal = (item: any) => {
  // 실제로는 하위 항목들의 합을 계산해야 함. 여기선 더미 데이터 기반
  if (item.code === '5000') return 1141400000
  if (item.code === '5100') return 1050000000
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
