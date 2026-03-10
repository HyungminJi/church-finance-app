<template>
  <div>
    <!-- 헤더 -->
    <div class="mb-4 flex justify-between items-center">
      <div class="flex space-x-2">
        <button class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors">
          사용계좌
        </button>
        <button class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors">
          미사용계좌
        </button>
      </div>
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
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">코드</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">계좌분류</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">타입</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">계좌별칭</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">은행명</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">계좌번호</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용여부</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">설명</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="item in items" :key="item.code">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ item.code }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.category }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.type }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ item.alias }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.bank }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.accountNumber }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                사용중
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.description }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const items = [
  { code: 'A001', category: '보통예금', type: 'KRW', alias: '메인계좌', bank: '우리은행', accountNumber: '1002-123-456789', description: '교회 운영 통장' },
  { code: 'A002', category: '적금', type: 'KRW', alias: '건축헌금', bank: '국민은행', accountNumber: '110-123-456789', description: '건축 기금' },
]
</script>
