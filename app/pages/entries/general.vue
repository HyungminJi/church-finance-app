<template>
  <div class="space-y-6">
    <!-- 입력 폼 -->
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">전표일자</label>
          <input type="date" class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600" />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">구분</label>
          <select class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600">
            <option>지출</option>
            <option>수입</option>
            <option>대체</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">계정과목</label>
          <select class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600">
            <option>목회활동비</option>
            <option>운영비</option>
            <option>선교비</option>
            <option>식대</option>
          </select>
        </div>

        <div>
           <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">거래처</label>
           <input type="text" placeholder="거래처명" class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">금액</label>
          <div class="relative">
             <input type="text" placeholder="0" class="w-full text-right pr-8 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600" />
             <span class="absolute right-3 top-2 text-gray-500">원</span>
          </div>
        </div>
        
        <div class="lg:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">적요</label>
          <input type="text" class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600" />
        </div>

        <div class="flex items-end space-x-2">
           <button class="cursor-pointer w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">
            입력
          </button>
           <button class="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200">
            조회
          </button>
        </div>
      </div>
    </div>

    <!-- 목록 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden overflow-x-auto">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">일반 전표 목록</h3>
      </div>
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">일자</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">구분</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">계정과목</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">적요</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="(item, index) in generalEntries" :key="index">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.date }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" :class="item.type === '수입' ? 'text-blue-600' : 'text-red-600'">{{ item.type }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ item.category }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.note }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">{{ item.amount }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <button class="cursor-pointer text-red-600 hover:text-red-800 text-xs">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const generalEntries = ref([
  { date: '2026-02-25', type: '지출', category: '식대', note: '교역자 중식', amount: '50,000' },
  { date: '2026-02-25', type: '지출', category: '운영비', note: '사무용품 구입', amount: '35,000' },
  { date: '2026-02-24', type: '수입', category: '이자수익', note: '예금 이자', amount: '1,250' },
])
</script>
