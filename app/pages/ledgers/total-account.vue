<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col gap-4">
      <!-- 1행: 기간 및 기본 버튼 -->
      <div class="flex flex-wrap items-center gap-2">
        <button class="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600">&lt;</button>
        <button class="px-3 py-1 bg-blue-50 text-blue-700 font-medium rounded dark:bg-blue-900/30 dark:text-blue-300">오늘</button>
        <button class="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600">&gt;</button>
        <div class="border-l border-gray-300 h-6 mx-1 dark:border-gray-600"></div>
        <button class="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600">이번주</button>
        <button class="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600">이번달</button>
        <div class="flex-grow"></div>
        <button class="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-sm flex items-center dark:bg-gray-700 dark:border-gray-600">
          <UIcon name="i-heroicons-printer" class="w-4 h-4 mr-1" /> 인쇄
        </button>
        <button class="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-sm flex items-center dark:bg-gray-700 dark:border-gray-600">
          <UIcon name="i-heroicons-table-cells" class="w-4 h-4 mr-1" /> 엑셀
        </button>
      </div>

      <!-- 2행: 상세 필터 옵션 -->
      <div class="flex flex-wrap items-center gap-4 bg-gray-50 dark:bg-gray-900/50 p-3 rounded border border-gray-200 dark:border-gray-700">
        <div class="flex items-center space-x-2">
          <label class="text-sm font-bold text-gray-700 dark:text-gray-300">기간:</label>
          <input type="date" class="border-gray-300 rounded text-sm dark:bg-gray-700 dark:border-gray-600 p-1" />
          <span class="text-gray-500">~</span>
          <input type="date" class="border-gray-300 rounded text-sm dark:bg-gray-700 dark:border-gray-600 p-1" />
        </div>
        <div class="border-l border-gray-300 h-6 dark:border-gray-600"></div>
        
        <div class="flex items-center space-x-3 text-sm">
          <label class="flex items-center space-x-1"><input type="radio" name="viewType" checked class="text-blue-600" /> <span>낱장</span></label>
          <label class="flex items-center space-x-1"><input type="radio" name="viewType" class="text-blue-600" /> <span>일별</span></label>
          <label class="flex items-center space-x-1"><input type="radio" name="viewType" class="text-blue-600" /> <span>월별</span></label>
        </div>
        <div class="border-l border-gray-300 h-6 dark:border-gray-600"></div>

        <div class="flex items-center space-x-2">
           <button class="px-3 py-1 bg-blue-50 text-blue-700 font-medium border border-blue-200 rounded text-sm dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">모두</button>
           <button class="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600">수입</button>
           <button class="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600">지출</button>
           <button class="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600">자산</button>
           <button class="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600">부채</button>
           <button class="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600">자본</button>
        </div>
      </div>
      
      <!-- 3행: 계정 검색 -->
      <div class="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-2 rounded border border-gray-200 dark:border-gray-700">
         <div class="flex items-center space-x-2">
            <span class="text-sm font-bold text-gray-700 dark:text-gray-300">계정과목 :</span>
            <input type="text" placeholder="코드" class="w-20 border-gray-300 rounded text-sm p-1 dark:bg-gray-700 dark:border-gray-600" />
            <input type="text" placeholder="과목명" class="w-32 border-gray-300 rounded text-sm p-1 dark:bg-gray-700 dark:border-gray-600" />
            <span class="text-gray-500">~</span>
            <input type="text" placeholder="코드" class="w-20 border-gray-300 rounded text-sm p-1 dark:bg-gray-700 dark:border-gray-600" />
            <input type="text" placeholder="과목명" class="w-32 border-gray-300 rounded text-sm p-1 dark:bg-gray-700 dark:border-gray-600" />
         </div>
         <button class="px-6 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-bold shadow-sm">조회</button>
      </div>
    </div>

    <!-- 데이터 테이블 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
        <thead class="bg-gray-50 dark:bg-gray-900 sticky top-0">
          <tr>
            <th class="px-4 py-3 text-left font-bold text-gray-500 uppercase w-24">계정코드</th>
            <th class="px-4 py-3 text-left font-bold text-gray-500 uppercase w-48">계정명</th>
            <th class="px-4 py-3 text-center font-bold text-gray-500 uppercase">일자</th>
            <th class="px-4 py-3 text-right font-bold text-gray-500 uppercase">예산금액</th>
            <th class="px-4 py-3 text-right font-bold text-gray-500 uppercase">집행</th>
            <th class="px-4 py-3 text-right font-bold text-gray-500 uppercase">집행비율</th>
            <th class="px-4 py-3 text-right font-bold text-gray-500 uppercase">차변</th>
            <th class="px-4 py-3 text-right font-bold text-gray-500 uppercase">대변</th>
            <th class="px-4 py-3 text-right font-bold text-gray-500 uppercase">예산잔액</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
          <template v-for="(acnt, idx) in accounts" :key="idx">
            <tr class="bg-gray-50/80 dark:bg-gray-900/50">
              <td class="px-4 py-3 whitespace-nowrap font-mono text-gray-500">{{ acnt.code }}</td>
              <td class="px-4 py-3 whitespace-nowrap font-bold text-gray-900 dark:text-white" colspan="8">{{ acnt.name }}</td>
            </tr>
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td colspan="2"></td>
              <td class="px-4 py-2 whitespace-nowrap text-center text-gray-500 bg-gray-50 dark:bg-gray-800">[이월금]</td>
              <td class="px-4 py-2 whitespace-nowrap text-right text-gray-500">{{ acnt.budget }}</td>
              <td class="px-4 py-2 whitespace-nowrap text-right text-gray-500">0</td>
              <td class="px-4 py-2 whitespace-nowrap text-right text-gray-500">0%</td>
              <td class="px-4 py-2 whitespace-nowrap text-right font-mono text-gray-500">{{ acnt.carryDebit }}</td>
              <td class="px-4 py-2 whitespace-nowrap text-right font-mono text-gray-500">{{ acnt.carryCredit }}</td>
              <td class="px-4 py-2 whitespace-nowrap text-right font-mono text-gray-500">{{ acnt.budget }}</td>
            </tr>
            <tr class="font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td colspan="2"></td>
              <td class="px-4 py-2 whitespace-nowrap text-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800">월 계</td>
              <td class="px-4 py-2 whitespace-nowrap text-right text-gray-700"></td>
              <td class="px-4 py-2 whitespace-nowrap text-right text-gray-700"></td>
              <td class="px-4 py-2 whitespace-nowrap text-right text-gray-700"></td>
              <td class="px-4 py-2 whitespace-nowrap text-right text-red-600 font-mono">{{ acnt.monthlyDebit }}</td>
              <td class="px-4 py-2 whitespace-nowrap text-right text-blue-600 font-mono">{{ acnt.monthlyCredit }}</td>
              <td class="px-4 py-2 whitespace-nowrap text-right font-mono"></td>
            </tr>
            <tr class="font-bold bg-blue-50/20 dark:bg-blue-900/10 border-b-2 border-gray-300 dark:border-gray-600">
              <td colspan="2"></td>
              <td class="px-4 py-3 whitespace-nowrap text-center text-blue-800 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-900/20">누 계</td>
              <td class="px-4 py-3 whitespace-nowrap text-right">{{ acnt.budget }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-right text-blue-600">{{ acnt.totalExec }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-right" :class="{'text-red-500': parseInt(acnt.rate) > 100, 'text-green-600': parseInt(acnt.rate) <= 100}">{{ acnt.rate }}%</td>
              <td class="px-4 py-3 whitespace-nowrap text-right font-mono text-red-700 dark:text-red-400">{{ acnt.totalDebit }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-right font-mono text-blue-700 dark:text-blue-400">{{ acnt.totalCredit }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-right font-mono text-gray-900 dark:text-white">{{ acnt.balance }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const accounts = ref([
  { 
    code: 'A1-02', name: '감사헌금', budget: '10,000,000', 
    carryDebit: '0', carryCredit: '0', 
    monthlyDebit: '0', monthlyCredit: '1,030,000',
    totalExec: '1,030,000', rate: '10.3', 
    totalDebit: '0', totalCredit: '1,030,000', balance: '8,970,000'
  },
  { 
    code: '10101030000', name: '주일헌금', budget: '0', 
    carryDebit: '0', carryCredit: '0', 
    monthlyDebit: '0', monthlyCredit: '650,000',
    totalExec: '650,000', rate: '0.0', 
    totalDebit: '0', totalCredit: '650,000', balance: '-650,000'
  },
])
</script>
