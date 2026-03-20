<template>
  <div>
    <!-- 헤더 -->
    <div class="mb-4 flex justify-between items-center">
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200">초기이월금 등록</h2>
      <button class="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
        저장하기
      </button>
    </div>

    <!-- 테이블 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">타입</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">계정코드</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">계정이름</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">이월금</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="item in items" :key="item.code">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.type }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{{ item.code }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ item.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">
              <input 
                type="text" 
                v-model="item.amount" 
                class="text-right border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </td>
          </tr>
          <!-- 합계 -->
          <tr class="bg-gray-50 dark:bg-gray-700 font-bold">
            <td colspan="3" class="px-6 py-4 text-right text-sm text-gray-900 dark:text-gray-100">합계</td>
            <td class="px-6 py-4 text-right text-sm text-gray-900 dark:text-gray-100">{{ totalAmount }}</td>
          </tr>
          <tr class="bg-gray-100 dark:bg-gray-600 font-bold text-red-600 dark:text-red-300">
            <td colspan="3" class="px-6 py-4 text-right text-sm">대차 차액</td>
            <td class="px-6 py-4 text-right text-sm">{{ balanceDiff }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const items = ref([
  { type: '자산', code: '1111', name: '현금', amount: '24,457,403' },
  { type: '자산', code: '1112', name: '보통예금', amount: '0' },
  { type: '부채', code: '2101', name: '미지급금', amount: '0' },
  { type: '자본', code: '3100', name: '기본금', amount: '0' },
])

const totalAmount = computed(() => {
  // 실제 계산 로직 필요 (콤마 제거 후 합산)
  return '24,457,403'
})

const balanceDiff = computed(() => {
  return '0'
})
</script>
