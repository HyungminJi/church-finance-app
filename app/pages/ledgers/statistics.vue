<template>
  <div class="space-y-6">
    <!-- 검색 및 필터 옵션 -->
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-center justify-between">
      <div class="flex flex-wrap items-center gap-4">
        <!-- 기간 선택 -->
        <div class="flex items-center space-x-2">
          <label class="text-sm font-bold text-gray-700 dark:text-gray-300">조회 기간:</label>
          <input type="date" class="border-gray-300 rounded text-sm p-1.5 dark:bg-gray-700 dark:border-gray-600" />
          <span class="text-gray-500">~</span>
          <input type="date" class="border-gray-300 rounded text-sm p-1.5 dark:bg-gray-700 dark:border-gray-600" />
        </div>
        
        <div class="border-l border-gray-300 h-6 dark:border-gray-600"></div>
        
        <!-- 구분/옵션 -->
        <div class="flex items-center space-x-3">
          <label class="flex items-center space-x-1"><input type="radio" name="statPeriod" checked class="text-blue-600" /> <span class="text-sm">연도별</span></label>
          <label class="flex items-center space-x-1"><input type="radio" name="statPeriod" class="text-blue-600" /> <span class="text-sm">분기별</span></label>
        </div>
        
        <div class="border-l border-gray-300 h-6 dark:border-gray-600"></div>

        <div class="flex items-center space-x-3">
          <label class="flex items-center space-x-1"><input type="checkbox" class="rounded border-gray-300 text-blue-600" /> <span class="text-sm">가족포함</span></label>
          <label class="flex items-center space-x-1"><input type="checkbox" class="rounded border-gray-300 text-blue-600" /> <span class="text-sm">미헌금자 포함</span></label>
        </div>
      </div>
      
      <!-- 액션 버튼 -->
      <div class="flex items-center space-x-2 mt-2 md:mt-0">
        <button class="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 text-sm font-medium dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 flex items-center shadow-sm">
          <UIcon name="i-heroicons-table-cells" class="w-4 h-4 mr-1" /> 엑셀
        </button>
        <button class="cursor-pointer px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm shadow-sm">조회</button>
      </div>
    </div>

    <!-- 통계 결과 컨테이너 -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- 좌측: 기준 선택 리스트 (교구, 구역 등) -->
      <div class="lg:col-span-3 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 h-[500px] flex flex-col">
        <div class="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <span class="text-sm font-bold text-gray-700 dark:text-gray-300">통계 기준 목록</span>
        </div>
        <div class="flex-1 overflow-y-auto p-2">
          <ul class="text-sm space-y-1 text-gray-700 dark:text-gray-300">
            <li class="p-2 bg-blue-50 dark:bg-gray-700 font-bold text-blue-700 dark:text-blue-400 rounded">교회전체 (나이별)</li>
            <li class="p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded">청년교회</li>
            <li class="p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded">학교드림샘</li>
            <li class="font-bold p-2 mt-2 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700">1교구</li>
            <li class="p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded cursor-pointer ml-2 text-gray-500">창세기포도원</li>
            <li class="p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded cursor-pointer ml-2 text-gray-500">출애굽기포도원</li>
            <li class="p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded cursor-pointer ml-2 text-gray-500">5구역</li>
            <li class="font-bold p-2 mt-2 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700">2교구</li>
            <li class="p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded cursor-pointer ml-2 text-gray-500">시편포도원</li>
            <li class="p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded cursor-pointer ml-2 text-gray-500">잠언포도원</li>
          </ul>
        </div>
      </div>

      <!-- 우측: 통계 데이터 및 차트 -->
      <div class="lg:col-span-9 flex flex-col gap-6">
        <!-- 통계 테이블 -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div class="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 class="text-sm font-bold text-gray-800 dark:text-white">나이별 헌금 통계 (교회전체)</h3>
            <span class="text-xs text-gray-500">[단위:원, 명]</span>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-100 dark:bg-gray-900/50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">구분</th>
                  <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">인원수</th>
                  <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">총 헌금액</th>
                  <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">비율</th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase w-48">그래프</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                <tr v-for="(stat, idx) in stats" :key="idx" class="hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition-colors">
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{{ stat.label }}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500 font-mono">{{ stat.count }}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-right font-mono text-blue-600 font-bold">{{ stat.amount }}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-right font-mono font-bold text-gray-700 dark:text-gray-300">{{ stat.rate }}%</td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden w-full">
                      <div class="h-full bg-blue-500 rounded-full" :style="{ width: stat.rate + '%' }"></div>
                    </div>
                  </td>
                </tr>
                <!-- 합계 로우 -->
                <tr class="bg-gray-50 dark:bg-gray-900/50 font-bold border-t-2 border-gray-300 dark:border-gray-600">
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900 dark:text-white">합계</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white font-mono">205</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-right text-blue-700 dark:text-blue-400 font-mono">100,000,000</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-right font-mono">100.0%</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 차트 시각화 영역 (Pie Chart 대체) -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col p-6 items-center justify-center min-h-[250px]">
          <h4 class="text-sm font-bold text-gray-500 mb-6">헌금액 비율 시각화</h4>
          <!-- CSS로 간단한 원형 차트 흉내내기 -->
          <div class="relative w-40 h-40 rounded-full bg-gray-200 dark:bg-gray-700 shadow-inner flex items-center justify-center" 
               style="background: conic-gradient(#3b82f6 0% 40%, #10b981 40% 65%, #f59e0b 65% 85%, #ef4444 85% 95%, #8b5cf6 95% 100%)">
             <div class="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow">
               <UIcon name="i-heroicons-chart-pie" class="w-8 h-8 text-gray-400" />
             </div>
          </div>
          <div class="flex flex-wrap justify-center gap-4 mt-6 text-xs text-gray-600 dark:text-gray-400 font-medium">
            <span class="flex items-center"><span class="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>40대 (40%)</span>
            <span class="flex items-center"><span class="w-3 h-3 rounded-full bg-green-500 mr-1"></span>30대 (25%)</span>
            <span class="flex items-center"><span class="w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>50대 (20%)</span>
            <span class="flex items-center"><span class="w-3 h-3 rounded-full bg-red-500 mr-1"></span>60대 이상 (10%)</span>
            <span class="flex items-center"><span class="w-3 h-3 rounded-full bg-purple-500 mr-1"></span>20대 (5%)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const stats = ref([
  { label: '40대', count: '60', amount: '40,000,000', rate: '40.0' },
  { label: '30대', count: '45', amount: '25,000,000', rate: '25.0' },
  { label: '50대', count: '55', amount: '20,000,000', rate: '20.0' },
  { label: '60대 이상', count: '30', amount: '10,000,000', rate: '10.0' },
  { label: '20대', count: '15', amount: '5,000,000', rate: '5.0' },
])
</script>
