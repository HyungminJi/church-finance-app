<template>
  <div>
    <!-- 헤더 -->
    <div class="mb-4 flex justify-end items-center">
      <div class="flex space-x-2">
        <button class="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors">
          추가
        </button>
        <button class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors">
          저장
        </button>
      </div>
    </div>

    <!-- 테이블 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden max-w-3xl">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              예배코드
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              예배이름
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              관리
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="item in items" :key="item.code">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-mono">
              {{ item.code }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
              <input type="text" v-model="item.name" class="border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                삭제
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const items = ref([
  { code: 'W001', name: '주일1부예배' },
  { code: 'W002', name: '주일2부예배' },
  { code: 'W003', name: '주일3부예배' },
  { code: 'W004', name: '수요예배' },
  { code: 'W005', name: '금요철야예배' },
  { code: 'W006', name: '새벽기도회' },
])
</script>
