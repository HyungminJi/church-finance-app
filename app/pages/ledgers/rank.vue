<template>
  <div class="space-y-6">
    <!-- 검색 및 필터 옵션 -->
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        <!-- 기간 및 구분 -->
        <div class="md:col-span-4 flex flex-col gap-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">조회 기간</label>
            <div class="flex items-center space-x-2">
              <input type="date" class="flex-1 border-gray-300 rounded text-sm p-1.5 dark:bg-gray-700 dark:border-gray-600" />
              <span class="text-gray-500">~</span>
              <input type="date" class="flex-1 border-gray-300 rounded text-sm p-1.5 dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div class="mt-2 flex flex-wrap gap-1">
              <button class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600">이번주</button>
              <button class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600">이번달</button>
              <button class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600">1분기</button>
              <button class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600">이번년도</button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">분류 기준</label>
            <select class="w-full border-gray-300 rounded text-sm p-1.5 dark:bg-gray-700 dark:border-gray-600">
              <option>개인(무아이디 제외)</option>
              <option>개인(무아이디 포함)</option>
              <option>가족(무아이디 제외)</option>
              <option>가족(무아이디 포함)</option>
            </select>
          </div>
        </div>

        <!-- 표시 옵션 -->
        <div class="md:col-span-4">
          <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">표시 옵션</label>
          <div class="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 p-3 rounded h-[140px] overflow-y-auto flex flex-col flex-wrap gap-x-4 gap-y-2">
            <label class="flex items-center space-x-2"><input type="checkbox" class="rounded border-gray-300 text-blue-600" checked /> <span class="text-sm text-gray-700 dark:text-gray-300">월별</span></label>
            <label class="flex items-center space-x-2"><input type="checkbox" class="rounded border-gray-300 text-blue-600" checked /> <span class="text-sm text-gray-700 dark:text-gray-300">직분 표시</span></label>
            <label class="flex items-center space-x-2"><input type="checkbox" class="rounded border-gray-300 text-blue-600" /> <span class="text-sm text-gray-700 dark:text-gray-300">전화번호 표시</span></label>
            <label class="flex items-center space-x-2"><input type="checkbox" class="rounded border-gray-300 text-blue-600" checked /> <span class="text-sm text-gray-700 dark:text-gray-300">교구 표시</span></label>
            <label class="flex items-center space-x-2"><input type="checkbox" class="rounded border-gray-300 text-blue-600" checked /> <span class="text-sm text-gray-700 dark:text-gray-300">회수 표시</span></label>
            <label class="flex items-center space-x-2"><input type="checkbox" class="rounded border-gray-300 text-blue-600" checked /> <span class="text-sm text-gray-700 dark:text-gray-300">금액 표시</span></label>
          </div>
        </div>

        <!-- 헌금 종류 -->
        <div class="md:col-span-4 flex flex-col">
          <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">헌금 종류</label>
          <div class="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 p-3 rounded h-[140px] overflow-y-auto text-sm flex flex-col flex-wrap gap-x-4 gap-y-1.5">
            <label class="flex items-center space-x-2"><input type="checkbox" class="rounded border-gray-300 text-blue-600" checked /> <span>전체</span></label>
            <label class="flex items-center space-x-2"><input type="checkbox" class="rounded border-gray-300 text-blue-600" checked /> <span>십일조</span></label>
            <label class="flex items-center space-x-2"><input type="checkbox" class="rounded border-gray-300 text-blue-600" checked /> <span>감사헌금</span></label>
            <label class="flex items-center space-x-2"><input type="checkbox" class="rounded border-gray-300 text-blue-600" checked /> <span>주일헌금</span></label>
            <label class="flex items-center space-x-2"><input type="checkbox" class="rounded border-gray-300 text-blue-600" checked /> <span>선교헌금</span></label>
            <label class="flex items-center space-x-2"><input type="checkbox" class="rounded border-gray-300 text-blue-600" checked /> <span>건축헌금</span></label>
          </div>
        </div>
      </div>
      
      <div class="mt-6 flex justify-end space-x-2 border-t border-gray-200 dark:border-gray-700 pt-4">
        <button class="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200 text-sm font-medium dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">인쇄</button>
        <button class="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200 text-sm font-medium dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">엑셀</button>
        <button class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold text-sm shadow-sm">조회</button>
      </div>
    </div>

    <!-- 순위 테이블 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div class="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 class="text-sm font-bold text-gray-700 dark:text-gray-200">헌금자 순위 결과</h3>
        <div class="flex items-center space-x-2">
           <span class="text-xs text-gray-500">표시할 목록수:</span>
           <select class="border-gray-300 rounded text-xs p-1 dark:bg-gray-700 dark:border-gray-600">
             <option>10</option>
             <option>50</option>
             <option>100</option>
           </select>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-100 dark:bg-gray-900/50">
            <tr>
              <th class="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase w-16">순위</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">이름</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">직분</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">교구</th>
              <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">횟수</th>
              <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">총 금액</th>
              <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase w-48">비율</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
            <tr v-for="(person, idx) in rankings" :key="idx" class="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors">
              <td class="px-4 py-3 whitespace-nowrap text-center">
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs"
                      :class="idx < 3 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'">
                  {{ idx + 1 }}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{{ person.name }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ person.title }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ person.district }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500 font-mono">{{ person.count }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-blue-600 font-mono">{{ person.amount }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="flex items-center space-x-2">
                  <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div class="h-full bg-blue-500 rounded-full" :style="{ width: person.rate + '%' }"></div>
                  </div>
                  <span class="text-xs text-gray-500 font-mono w-8 text-right">{{ person.rate }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const rankings = ref([
  { name: '김철수', title: '장로', district: '1교구', count: '12', amount: '12,500,000', rate: '25.0' },
  { name: '이영희', title: '권사', district: '2교구', count: '24', amount: '8,300,000', rate: '16.6' },
  { name: '박민수', title: '안수집사', district: '1교구', count: '10', amount: '5,000,000', rate: '10.0' },
  { name: '최지혜', title: '집사', district: '3교구', count: '8', amount: '2,100,000', rate: '4.2' },
  { name: '무명', title: '-', district: '-', count: '5', amount: '500,000', rate: '1.0' },
])
</script>
