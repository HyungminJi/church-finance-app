<template>
  <div class="h-[calc(100vh-16rem)] flex flex-col md:flex-row gap-4">
    <!-- 좌측 계정 트리 -->
    <div class="w-full md:w-64 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
      <div class="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <span class="text-sm font-bold text-gray-700 dark:text-gray-300">계정과목</span>
        <UButton 
          label="모두펼침" 
          color="primary" 
          variant="ghost" 
          size="xs" 
          class="cursor-pointer" 
        />
      </div>
      <div class="flex-1 overflow-y-auto p-2">
        <ul class="text-sm space-y-1">
          <li v-for="node in accountTree" :key="node.code" >
            <div class="flex items-center p-1.5 hover:bg-blue-50 dark:hover:bg-gray-700 rounded" :class="{'bg-blue-100 dark:bg-gray-700 font-bold text-blue-700 dark:text-blue-400': node.active}">
              <UIcon :name="node.hasChildren ? 'i-heroicons-folder' : 'i-heroicons-document'" class="w-4 h-4 mr-2" :class="node.hasChildren ? 'text-yellow-500' : 'text-gray-400'" />
              <span class="font-mono text-xs text-gray-500 mr-2">{{ node.code }}</span>
              <span class="text-gray-800 dark:text-gray-200">{{ node.name }}</span>
            </div>
            <ul v-if="node.hasChildren && node.expanded" class="pl-4 mt-1 border-l border-gray-200 dark:border-gray-600 ml-2">
              <li v-for="child in node.children" :key="child.code" class="flex items-center p-1.5 hover:bg-blue-50 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300" :class="{'bg-blue-100 dark:bg-gray-700 font-bold text-blue-700 dark:text-blue-400': child.active}">
                 <UIcon name="i-heroicons-document" class="w-4 h-4 mr-2 text-gray-400" />
                 <span class="font-mono text-xs text-gray-500 mr-2">{{ child.code }}</span>
                 {{ child.name }}
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>

    <!-- 우측 상세 내역 -->
    <div class="flex-1 flex flex-col bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <!-- 상단 컨트롤 패널 -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col gap-3">
        <!-- 1행: 기간 및 기본 버튼 -->
        <div class="flex flex-wrap items-center gap-2">
          <UButton icon="i-heroicons-chevron-left" color="neutral" variant="outline" size="sm" class="cursor-pointer bg-white dark:bg-gray-700" />
          <UButton label="오늘" color="primary" size="sm" class="cursor-pointer font-bold" />
          <UButton icon="i-heroicons-chevron-right" color="neutral" variant="outline" size="sm" class="cursor-pointer bg-white dark:bg-gray-700" />
          <div class="border-l border-gray-300 h-6 mx-1 dark:border-gray-600"></div>
          <UButton label="이번주" color="neutral" variant="outline" size="sm" class="cursor-pointer bg-white dark:bg-gray-700 font-bold" />
          <UButton label="이번달" color="neutral" variant="outline" size="sm" class="cursor-pointer bg-white dark:bg-gray-700 font-bold" />
          <div class="flex-grow"></div>
          <UButton icon="i-heroicons-printer" color="neutral" variant="outline" label="인쇄" size="sm" class="cursor-pointer bg-white dark:bg-gray-700 font-bold" />
          <UButton icon="i-heroicons-table-cells" color="success" variant="outline" label="엑셀" size="sm" class="cursor-pointer bg-white dark:bg-gray-700 font-bold" />
        </div>

        <!-- 2행: 상세 옵션 -->
        <div class="flex flex-wrap items-center gap-4 text-sm bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
          <div class="flex space-x-3">
             <label class="flex items-center space-x-1"><input type="radio" name="bukiType" checked class="text-blue-600" /> <span>복식부기용</span></label>
             <label class="flex items-center space-x-1"><input type="radio" name="bukiType" class="text-blue-600" /> <span>단식부기용</span></label>
          </div>
          <div class="border-l border-gray-300 h-4 dark:border-gray-600"></div>
          <div class="flex space-x-3">
             <label class="flex items-center space-x-1"><input type="radio" name="sumType" checked class="text-blue-600" /> <span>월계합산</span></label>
             <label class="flex items-center space-x-1"><input type="radio" name="sumType" class="text-blue-600" /> <span>일계합산</span></label>
             <label class="flex items-center space-x-1"><input type="radio" name="sumType" class="text-blue-600" /> <span>계정별합산</span></label>
             <label class="flex items-center space-x-1"><input type="radio" name="sumType" class="text-blue-600" /> <span>합산없음</span></label>
          </div>
          <div class="border-l border-gray-300 h-4 dark:border-gray-600"></div>
          <UButton label="보기옵션" color="primary" variant="link" size="sm" class="cursor-pointer font-bold p-0" />
          
          <div class="flex-grow"></div>
          
          <div class="flex space-x-2">
            <UButton label="모든계정조회" color="primary" size="xs" class="cursor-pointer font-bold" />
            <UButton label="모든계정인쇄" color="neutral" variant="outline" size="xs" class="cursor-pointer font-bold bg-white dark:bg-gray-700" />
            <UButton label="모든계정엑셀" color="success" variant="outline" size="xs" class="cursor-pointer font-bold bg-white dark:bg-gray-700" />
          </div>
        </div>
        
        <!-- 3행: 현재 선택 정보 -->
        <div class="flex justify-between items-center mt-1">
          <div class="text-sm font-bold text-gray-800 dark:text-gray-200">
             [10101030000] 주일헌금 원장
          </div>
        </div>
      </div>
      
      <!-- 테이블 -->
      <div class="flex-1 overflow-x-auto overflow-y-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead class="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
            <tr>
              <th class="px-4 py-2 text-left font-bold text-gray-500 uppercase">일자</th>
              <th class="px-4 py-2 text-left font-bold text-gray-500 uppercase">적요</th>
              <th class="px-4 py-2 text-right font-bold text-gray-500 uppercase">차변(지출)</th>
              <th class="px-4 py-2 text-right font-bold text-gray-500 uppercase">대변(수입)</th>
              <th class="px-4 py-2 text-right font-bold text-gray-500 uppercase">잔액</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr class="bg-gray-100 dark:bg-gray-800 font-bold">
              <td colspan="4" class="px-4 py-2 text-center text-gray-700 dark:text-gray-300">전기이월</td>
              <td class="px-4 py-2 text-right font-mono text-blue-600">0</td>
            </tr>
            <tr v-for="(tx, idx) in transactions" :key="idx" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="px-4 py-2 text-gray-500">{{ tx.date }}</td>
              <td class="px-4 py-2 text-gray-900 dark:text-white">{{ tx.note }}</td>
              <td class="px-4 py-2 text-right text-red-600 font-mono">{{ tx.debit }}</td>
              <td class="px-4 py-2 text-right text-blue-600 font-mono">{{ tx.credit }}</td>
              <td class="px-4 py-2 text-right font-mono font-bold">{{ tx.balance }}</td>
            </tr>
            <tr class="bg-gray-50 dark:bg-gray-900 font-bold border-t-2 border-gray-300 dark:border-gray-600">
              <td colspan="2" class="px-4 py-2 text-center text-gray-700 dark:text-gray-300">월계</td>
              <td class="px-4 py-2 text-right text-red-600 font-mono">0</td>
              <td class="px-4 py-2 text-right text-blue-600 font-mono">350,000</td>
              <td class="px-4 py-2 text-right font-mono text-gray-900 dark:text-white">350,000</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const accountTree = ref([
  { code: '1000', name: '수입', hasChildren: true, expanded: true, active: false, children: [
    { code: '1100', name: '십일조', active: false },
    { code: '1200', name: '감사헌금', active: false },
    { code: '10101030000', name: '주일헌금', active: true },
  ]},
  { code: '2000', name: '지출', hasChildren: true, expanded: false, active: false, children: [] },
])

const transactions = ref([
  { date: '2026-02-01', note: '주일1부예배 무명', debit: '0', credit: '100,000', balance: '100,000' },
  { date: '2026-02-08', note: '주일1부예배 무명', debit: '0', credit: '120,000', balance: '220,000' },
  { date: '2026-02-15', note: '주일1부예배 박민수', debit: '0', credit: '130,000', balance: '350,000' },
])
</script>
