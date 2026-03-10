<template>
  <div class="space-y-6">
    <!-- 입력 폼 -->
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <!-- 전표일자 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">전표일자</label>
          <input type="date" class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 cursor-pointer h-[40px] px-3" />
        </div>
        
        <!-- 예배선택 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">예배</label>
          <select class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 cursor-pointer h-[40px] px-2">
            <option>주일1부예배</option>
            <option>주일2부예배</option>
            <option>수요예배</option>
          </select>
        </div>

        <!-- 성도검색 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">성도검색 (이름/번호)</label>
          <div class="relative">
            <input type="text" placeholder="이름 또는 번호" class="w-full pl-8 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 h-[40px]" />
            <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
          </div>
        </div>

        <!-- 헌금종류 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">헌금종류</label>
          <select class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 cursor-pointer h-[40px] px-2">
            <option>십일조</option>
            <option>감사헌금</option>
            <option>주일헌금</option>
            <option>선교헌금</option>
          </select>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <!-- 금액 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">금액</label>
          <div class="relative">
             <input type="text" placeholder="0" class="w-full text-right pr-8 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600" />
             <span class="absolute right-3 top-2 text-gray-500">원</span>
          </div>
        </div>
        
        <!-- 적요 -->
        <div class="lg:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">적요</label>
          <input type="text" class="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600" />
        </div>

        <!-- 버튼 -->
        <div class="flex items-end space-x-2">
          <UButton 
            color="primary" 
            label="입력" 
            class="w-full justify-center py-2.5 font-bold cursor-pointer" 
          />
          <UButton 
            color="neutral" 
            variant="outline" 
            label="조회" 
            class="px-4 py-2.5 font-bold cursor-pointer bg-white dark:bg-gray-800" 
          />
        </div>
      </div>
    </div>

    <!-- 입력 목록 테이블 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden overflow-x-auto">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">금일 입력 내역</h3>
        <div class="text-sm text-gray-500">
          합계: <span class="font-bold text-blue-600">1,350,000</span> 원
        </div>
      </div>
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">헌금종류</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">적요</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="(item, index) in entries" :key="index">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ index + 1 }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ item.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.type }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">{{ item.amount }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.note }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <UButton 
                label="삭제" 
                color="error" 
                variant="ghost" 
                size="xs" 
                class="cursor-pointer" 
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const entries = ref([
  { name: '김철수', type: '십일조', amount: '500,000', note: '' },
  { name: '이영희', type: '감사헌금', amount: '100,000', note: '범사에 감사' },
  { name: '박민수', type: '주일헌금', amount: '50,000', note: '' },
  { name: '최지혜', type: '선교헌금', amount: '200,000', note: '해외선교' },
  { name: '무명', type: '주일헌금', amount: '10,000', note: '' },
  { name: '정우성', type: '십일조', amount: '490,000', note: '' },
])
</script>
