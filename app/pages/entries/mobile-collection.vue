<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center space-x-4">
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

    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">일자</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">헌금종류</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">금액</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr>
            <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">조회된 데이터가 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
