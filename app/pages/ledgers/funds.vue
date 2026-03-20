<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-center">
      <div class="flex items-center space-x-2">
        <button class="cursor-pointer px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600">&lt;</button>
        <button class="cursor-pointer px-4 py-1 bg-blue-50 text-blue-700 font-medium rounded dark:bg-blue-900/30 dark:text-blue-300">오늘</button>
        <button class="cursor-pointer px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600">&gt;</button>
        <div class="border-l border-gray-300 h-6 mx-2 dark:border-gray-600"></div>
        <button class="cursor-pointer px-4 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600">이번주</button>
        <button class="cursor-pointer px-4 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600">이번달</button>
        <button class="cursor-pointer px-4 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600">이번년도</button>
      </div>
      <div class="flex-grow"></div>
      <button class="cursor-pointer px-4 py-1.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 flex items-center">
        <UIcon name="i-heroicons-printer" class="w-4 h-4 mr-2" /> 인쇄
      </button>
      <button class="cursor-pointer px-4 py-1.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 flex items-center">
        <UIcon name="i-heroicons-table-cells" class="w-4 h-4 mr-2" /> 엑셀
      </button>
    </div>

    <!-- 상세 필터 옵션 영역 (참고 사이트 반영) -->
    <div class="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-wrap gap-6 items-center">
      <div class="flex items-center space-x-2">
        <span class="text-sm font-bold text-gray-700 dark:text-gray-300">장부 선택보기:</span>
        <select class="border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600">
          <option>전체</option>
          <option>재정부</option>
        </select>
      </div>
      <div class="flex items-center space-x-4">
        <label class="flex items-center space-x-1">
          <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <span class="text-sm text-gray-700 dark:text-gray-300">현금 미출력</span>
        </label>
        <label class="flex items-center space-x-1">
          <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <span class="text-sm text-gray-700 dark:text-gray-300">장부단위로 보기</span>
        </label>
        <label class="flex items-center space-x-1">
          <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <span class="text-sm text-gray-700 dark:text-gray-300">장부별 소계</span>
        </label>
        <label class="flex items-center space-x-1">
          <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <span class="text-sm text-gray-700 dark:text-gray-300">계좌분류소계</span>
        </label>
      </div>
      <div class="flex-grow"></div>
      <button class="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">조회 적용</button>
    </div>

    <!-- 와이드 테이블 영역 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
        <h3 class="text-sm font-bold text-gray-800 dark:text-gray-200">자금명세서 (2026.02.25)</h3>
      </div>
      <div class="overflow-x-auto w-full">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
          <thead class="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th class="px-4 py-3 text-left font-bold text-gray-600 dark:text-gray-300 uppercase">장부구분</th>
              <th class="px-4 py-3 text-left font-bold text-gray-600 dark:text-gray-300 uppercase">계좌분류</th>
              <th class="px-4 py-3 text-left font-bold text-gray-600 dark:text-gray-300 uppercase">은행명</th>
              <th class="px-4 py-3 text-left font-bold text-gray-600 dark:text-gray-300 uppercase">계좌별칭</th>
              <th class="px-4 py-3 text-right font-bold text-gray-600 dark:text-gray-300 uppercase">이월금</th>
              <th class="px-4 py-3 text-right font-bold text-gray-600 dark:text-gray-300 uppercase">수입</th>
              <th class="px-4 py-3 text-right font-bold text-gray-600 dark:text-gray-300 uppercase">지출</th>
              <th class="px-4 py-3 text-right font-bold text-gray-600 dark:text-gray-300 uppercase">잔액</th>
              <th class="px-4 py-3 text-left font-bold text-gray-600 dark:text-gray-300 uppercase">계좌번호</th>
              <th class="px-4 py-3 text-left font-bold text-gray-600 dark:text-gray-300 uppercase">계좌설명</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
            <tr v-for="item in items" :key="item.id" class="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
              <td class="px-4 py-3 whitespace-nowrap text-gray-500">{{ item.bookType }}</td>
              <td class="px-4 py-3 whitespace-nowrap font-bold text-gray-900 dark:text-white">{{ item.category }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-gray-500">{{ item.bank }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-gray-900 dark:text-gray-300">{{ item.alias }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-right font-mono">{{ item.carryOver }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-right font-mono font-bold text-blue-600">{{ item.income }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-right font-mono font-bold text-red-600">{{ item.expense }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-right font-mono font-bold">{{ item.balance }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-gray-500">{{ item.accountNumber }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-gray-400">{{ item.note }}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-800 font-bold border-t-2 border-gray-300 dark:border-gray-600">
              <td colspan="4" class="px-4 py-3 text-center text-gray-900 dark:text-white uppercase tracking-wider">총 계</td>
              <td class="px-4 py-3 text-right font-mono">120,465,409,058</td>
              <td class="px-4 py-3 text-right font-mono text-blue-600">1,350,000</td>
              <td class="px-4 py-3 text-right font-mono text-red-600">450,000</td>
              <td class="px-4 py-3 text-right font-mono">120,466,309,058</td>
              <td colspan="2"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const items = ref([
  { id: 1, bookType: '재정부', category: '현금', bank: '현금', alias: '현금', carryOver: '120,425,452,058', income: '1,350,000', expense: '450,000', balance: '120,426,352,058', accountNumber: '', note: '* 현금 입금,출금시 선택' },
  { id: 2, bookType: '재정부', category: '미국', bank: '달러', alias: '선교달러', carryOver: '40,000,000', income: '0', expense: '0', balance: '40,000,000', accountNumber: '100', note: '' },
  { id: 3, bookType: '재정부', category: '가지급금', bank: '가지급금', alias: '-', carryOver: '-50,000', income: '0', expense: '0', balance: '-50,000', accountNumber: '', note: '* 가지급금 정산' },
])
</script>
