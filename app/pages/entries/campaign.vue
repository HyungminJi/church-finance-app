<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex justify-between items-center">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">작정헌금 캠페인 목록</h3>
      <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        캠페인 등록
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">캠페인명</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">기간</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">목표금액</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">약정금액</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">진행상태</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="item in campaigns" :key="item.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ item.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.period }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{{ item.targetAmount }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">{{ item.pledgedAmount }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                진행중
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <button class="text-blue-600 hover:text-blue-900 mr-2">수정</button>
              <button class="text-red-600 hover:text-red-900">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const campaigns = ref([
  { id: 1, name: '2026 건축헌금 작정', period: '2026.01.01 ~ 2026.12.31', targetAmount: '1,000,000,000', pledgedAmount: '800,000,000' },
  { id: 2, name: '해외선교 후원 작정', period: '2026.01.01 ~ 2026.12.31', targetAmount: '500,000,000', pledgedAmount: '450,000,000' },
])
</script>
