<template>
  <div class="space-y-6">
    <!-- 타이틀 및 필터 -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center space-x-4">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white">작정헌금 월별 통계 조회</h2>
        <div class="flex items-center border border-gray-300 rounded-md overflow-hidden dark:border-gray-600">
          <button class="px-2 py-1 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border-r dark:border-gray-600">&lt;&lt;</button>
          <div class="px-4 py-1 text-sm bg-white dark:bg-gray-900 font-medium">2026.01.01 ~ 2026.12.31</div>
          <button class="px-2 py-1 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border-l dark:border-gray-600">&gt;&gt;</button>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">캠페인명 :</span>
        <select class="border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 text-sm min-w-[150px]">
          <option>차량구입</option>
          <option>건축헌금</option>
        </select>
        <button class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 text-sm flex items-center">
          <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4 mr-2" />
          엑셀
        </button>
      </div>
    </div>

    <!-- 통계 테이블 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div class="p-2 text-right text-xs text-gray-500 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">[단위:원]</div>
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">기간</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">구분</th>
            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">작정건수</th>
            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">총 작정금액</th>
            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">헌금건수</th>
            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">총 헌금액</th>
            <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">비율</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="(stat, idx) in statistics" :key="idx" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ stat.period }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ stat.type }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{{ stat.pledgeCount }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-gray-900 dark:text-white">{{ stat.pledgeAmount }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{{ stat.offeringCount }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-mono font-bold text-blue-600">{{ stat.offeringAmount }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-bold" :class="getRateColor(stat.rate)">{{ stat.rate }}%</td>
          </tr>
          <!-- 데이터 없음 표시 (참고 사이트 재현) -->
          <tr v-if="statistics.length === 0">
            <td colspan="7" class="px-6 py-10 text-center text-gray-500 text-sm">데이터가 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const statistics = ref([
  { period: '2026-01', type: '월별합계', pledgeCount: 120, pledgeAmount: '1,500,000,000', offeringCount: 110, offeringAmount: '1,200,000,000', rate: '80.0' },
  { period: '2026-02', type: '월별합계', pledgeCount: 120, pledgeAmount: '1,500,000,000', offeringCount: 95, offeringAmount: '950,000,000', rate: '63.3' },
])

const getRateColor = (rate: string) => {
  const r = parseFloat(rate)
  if (r >= 80) return 'text-green-600 dark:text-green-400'
  if (r >= 50) return 'text-blue-600 dark:text-blue-400'
  return 'text-red-600 dark:text-red-400'
}
</script>
