<template>
  <div class="space-y-6">
    <!-- 필터 영역 -->
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">출금기간</label>
          <div class="flex items-center space-x-2">
            <input type="date" class="flex-1 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 text-sm" />
            <span class="text-gray-500">~</span>
            <input type="date" class="flex-1 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 text-sm" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">캠페인</label>
          <select class="w-full border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 text-sm">
            <option>차량구입</option>
            <option>건축헌금</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이름 / 휴대폰번호</label>
          <div class="flex space-x-2">
            <input type="text" placeholder="이름" class="flex-1 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 text-sm" />
            <input type="text" placeholder="휴대폰" class="flex-1 border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 text-sm" />
            <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">검색</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 와이드 테이블 영역 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
        <h3 class="text-base font-bold text-gray-800 dark:text-white">출금/입금 상세 현황</h3>
        <button class="px-4 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors shadow-sm">
          전표추가
        </button>
      </div>
      
      <!-- 테이블 컨테이너: w-full 적용하여 가득 채움 -->
      <div class="overflow-x-auto w-full">
        <table class="min-w-[1800px] w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
          <thead class="bg-gray-50 dark:bg-gray-900/50">
            <tr class="divide-x divide-gray-200 dark:divide-gray-700">
              <th class="px-3 py-3 text-left font-bold text-gray-600 dark:text-gray-300">이름</th>
              <th class="px-3 py-3 text-left font-bold text-gray-600 dark:text-gray-300">휴대폰</th>
              <th class="px-3 py-3 text-left font-bold text-gray-600 dark:text-gray-300">생년월일</th>
              <th class="px-3 py-3 text-left font-bold text-gray-600 dark:text-gray-300">납입방법</th>
              <th class="px-3 py-3 text-left font-bold text-gray-600 dark:text-gray-300">은행명</th>
              <th class="px-3 py-3 text-left font-bold text-gray-600 dark:text-gray-300">계좌번호</th>
              <th class="px-3 py-3 text-left font-bold text-gray-600 dark:text-gray-300">납입주기</th>
              <th class="px-3 py-3 text-center font-bold text-gray-600 dark:text-gray-300">납입일</th>
              <th class="px-3 py-3 text-right font-bold text-gray-600 dark:text-gray-300">1회 작정액</th>
              <th class="px-3 py-3 text-center font-bold text-gray-600 dark:text-gray-300">작정횟수</th>
              <th class="px-3 py-3 text-right font-bold text-gray-600 dark:text-gray-300">총 작정액</th>
              <th class="px-3 py-3 text-center font-bold text-gray-600 dark:text-gray-300">최초납부</th>
              <th class="px-3 py-3 text-center font-bold text-gray-600 dark:text-gray-300">최종납부</th>
              <th class="px-3 py-3 text-right font-bold text-gray-600 dark:text-gray-300">현재헌금액</th>
              <th class="px-3 py-3 text-center font-bold text-gray-600 dark:text-gray-300 w-48">납부율 (차트)</th>
              <th class="px-3 py-3 text-center font-bold text-gray-600 dark:text-gray-300">실패</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
            <tr v-for="(item, idx) in dummyData" :key="idx" class="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors divide-x divide-gray-100 dark:divide-gray-700">
              <td class="px-3 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-white">{{ item.name }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-gray-500">{{ item.phone }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-gray-500">{{ item.birth }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-gray-500">{{ item.method }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-gray-500">{{ item.bank }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-gray-500 font-mono">{{ item.account }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-gray-500">{{ item.cycle }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-center text-gray-500">{{ item.day }}일</td>
              <td class="px-3 py-4 whitespace-nowrap text-right font-mono">{{ item.amountPerOnce }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-center text-gray-500">{{ item.count }}회</td>
              <td class="px-3 py-4 whitespace-nowrap text-right font-bold">{{ item.totalPledged }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-center text-gray-500">{{ item.firstDate }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-center text-gray-500">{{ item.lastDate }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-right font-bold text-blue-600">{{ item.currentAmount }}</td>
              <td class="px-3 py-4 whitespace-nowrap min-w-[150px]">
                <!-- 납부율 차트화 (Progress Bar) -->
                <div class="flex items-center space-x-2">
                  <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      class="h-full bg-blue-500 rounded-full transition-all duration-500" 
                      :style="{ width: item.rate + '%' }"
                    ></div>
                  </div>
                  <span class="text-blue-700 dark:text-blue-400 font-bold w-10 text-right">{{ item.rate }}%</span>
                </div>
              </td>
              <td class="px-3 py-4 whitespace-nowrap text-center text-red-500 font-bold">{{ item.fail }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const dummyData = ref([
  {
    name: '김철수', phone: '010-1234-5678', birth: '1980-01-01', method: 'CMS', bank: '우리은행', 
    account: '1002-123-456789', cycle: '매월', day: '25', amountPerOnce: '100,000', count: '12', 
    totalPledged: '1,200,000', firstDate: '2026-01-25', lastDate: '2026-02-25', currentAmount: '200,000', rate: '16.6', fail: '0'
  },
  {
    name: '이영희', phone: '010-9876-5432', birth: '1985-05-05', method: '가상계좌', bank: '신한은행', 
    account: '110-123-456789', cycle: '매월', day: '10', amountPerOnce: '50,000', count: '10', 
    totalPledged: '500,000', firstDate: '2026-01-10', lastDate: '2026-02-10', currentAmount: '100,000', rate: '20.0', fail: '0'
  },
  {
    name: '최지혜', phone: '010-1111-2222', birth: '1990-12-25', method: '직접납입', bank: '-', 
    account: '-', cycle: '매월', day: '1', amountPerOnce: '200,000', count: '12', 
    totalPledged: '2,400,000', firstDate: '2026-01-01', lastDate: '2026-02-01', currentAmount: '1,200,000', rate: '50.0', fail: '0'
  }
])
</script>
