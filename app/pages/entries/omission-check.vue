<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex justify-between items-center">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">누락 확인 요청 목록</h3>
      <button class="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
        새로고침
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">요청일</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">요청자</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">내용</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr>
            <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">요청된 내역이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
