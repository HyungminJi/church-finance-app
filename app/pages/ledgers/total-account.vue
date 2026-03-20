<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col gap-4">
      <!-- 1행: 기간 및 기본 버튼 -->
      <div class="flex flex-wrap items-center gap-2">
        <button @click="moveDate('prev')" class="cursor-pointer px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600">&lt;</button>
        <button @click="setDateRange('today')" class="cursor-pointer px-3 py-1 bg-blue-50 text-blue-700 font-medium rounded dark:bg-blue-900/30 dark:text-blue-300">오늘</button>
        <button @click="moveDate('next')" class="cursor-pointer px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600">&gt;</button>
        <div class="border-l border-gray-300 h-6 mx-1 dark:border-gray-600"></div>
        <button @click="setDateRange('thisWeek')" class="cursor-pointer px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600">이번주</button>
        <button @click="setDateRange('thisMonth')" class="cursor-pointer px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600">이번달</button>
        <div class="flex-grow"></div>
        <!-- 인쇄 버튼: 공통 함수 활용 -->
        <button @click="onPrint" class="cursor-pointer px-3 py-1.5 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-sm flex items-center dark:bg-gray-700 dark:border-gray-600">
          <UIcon name="i-heroicons-printer" class="w-4 h-4 mr-1" /> 인쇄
        </button>
        <!-- 엑셀 버튼: 공통 함수 활용 (성공/녹색 가이드 적용) -->
        <button @click="onDownloadExcel" class="cursor-pointer px-3 py-1.5 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-sm flex items-center text-green-700 dark:bg-gray-700 dark:border-gray-600 dark:text-green-400">
          <UIcon name="i-heroicons-table-cells" class="w-4 h-4 mr-1" /> 엑셀
        </button>
      </div>

      <!-- 2행: 상세 필터 옵션 -->
      <div class="flex flex-wrap items-center gap-4 bg-gray-50 dark:bg-gray-900/50 p-3 rounded border border-gray-200 dark:border-gray-700">
        <div class="flex items-center space-x-2">
          <label class="text-sm font-bold text-gray-700 dark:text-gray-300">기간:</label>
          <input type="date" v-model="startDate" class="border-gray-300 rounded text-sm dark:bg-gray-700 dark:border-gray-600 p-1" />
          <span class="text-gray-500">~</span>
          <input type="date" v-model="endDate" class="border-gray-300 rounded text-sm dark:bg-gray-700 dark:border-gray-600 p-1" />
        </div>
        <div class="border-l border-gray-300 h-6 dark:border-gray-600"></div>

        <div class="flex items-center space-x-2">
           <button @click="setTypeFilter('ALL')" :class="typeFilter === 'ALL' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' : 'bg-white text-gray-700 dark:bg-gray-700 border-gray-300 dark:border-gray-600'" class="cursor-pointer px-3 py-1 border rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600">모두</button>
           <button @click="setTypeFilter('INCOME')" :class="typeFilter === 'INCOME' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' : 'bg-white text-gray-700 dark:bg-gray-700 border-gray-300 dark:border-gray-600'" class="cursor-pointer px-3 py-1 border rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600">수입</button>
           <button @click="setTypeFilter('EXPENSE')" :class="typeFilter === 'EXPENSE' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' : 'bg-white text-gray-700 dark:bg-gray-700 border-gray-300 dark:border-gray-600'" class="cursor-pointer px-3 py-1 border rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-600">지출</button>
        </div>
      </div>
      
      <!-- 3행: 계정 검색 -->
      <div class="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-2 rounded border border-gray-200 dark:border-gray-700">
         <div class="flex items-center space-x-2">
            <span class="text-sm font-bold text-gray-700 dark:text-gray-300">계정과목 :</span>
            <input type="text" v-model="searchKeyword" placeholder="코드/과목명 검색" class="w-48 border-gray-300 rounded text-sm p-1 dark:bg-gray-700 dark:border-gray-600" @keyup.enter="fetchLedger" />
         </div>
         <button @click="fetchLedger" class="cursor-pointer px-6 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-bold shadow-sm">조회</button>
      </div>
    </div>

    <!-- 데이터 테이블 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden overflow-x-auto relative">
      <div v-if="pending" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-blue-500" />
      </div>

      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
        <thead class="bg-gray-50 dark:bg-gray-900 sticky top-0 z-0">
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
          <template v-if="filteredAccounts.length === 0">
            <tr>
              <td colspan="9" class="px-4 py-8 text-center text-gray-500">조회된 데이터가 없습니다.</td>
            </tr>
          </template>
          <template v-for="(acnt, idx) in filteredAccounts" :key="idx">
            <tr class="bg-gray-50/80 dark:bg-gray-900/50">
              <td class="px-4 py-3 whitespace-nowrap font-mono text-gray-500">{{ acnt.code }}</td>
              <td class="px-4 py-3 whitespace-nowrap font-bold text-gray-900 dark:text-white" colspan="8">
                {{ acnt.name }} 
                <span class="ml-2 text-xs font-normal px-1.5 py-0.5 rounded-full" :class="acnt.type === 'INCOME' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'">{{ acnt.type === 'INCOME' ? '수입' : '지출' }}</span>
              </td>
            </tr>
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td colspan="2"></td>
              <td class="px-4 py-2 whitespace-nowrap text-center text-gray-500 bg-gray-50 dark:bg-gray-800">[이월금]</td>
              <td class="px-4 py-2 whitespace-nowrap text-right text-gray-500">{{ formatCurrency(acnt.budget) }}</td>
              <td class="px-4 py-2 whitespace-nowrap text-right text-gray-500">0</td>
              <td class="px-4 py-2 whitespace-nowrap text-right text-gray-500">0%</td>
              <td class="px-4 py-2 whitespace-nowrap text-right font-mono text-gray-500">{{ formatCurrency(acnt.carryDebit) }}</td>
              <td class="px-4 py-2 whitespace-nowrap text-right font-mono text-gray-500">{{ formatCurrency(acnt.carryCredit) }}</td>
              <td class="px-4 py-2 whitespace-nowrap text-right font-mono text-gray-500">{{ formatCurrency(acnt.budget) }}</td>
            </tr>
            <tr class="font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td colspan="2"></td>
              <td class="px-4 py-2 whitespace-nowrap text-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800">조회 기간</td>
              <td class="px-4 py-2 whitespace-nowrap text-right text-gray-700"></td>
              <td class="px-4 py-2 whitespace-nowrap text-right text-gray-700"></td>
              <td class="px-4 py-2 whitespace-nowrap text-right text-gray-700"></td>
              <td class="px-4 py-2 whitespace-nowrap text-right text-red-600 font-mono">{{ formatCurrency(acnt.monthlyDebit) }}</td>
              <td class="px-4 py-2 whitespace-nowrap text-right text-blue-600 font-mono">{{ formatCurrency(acnt.monthlyCredit) }}</td>
              <td class="px-4 py-2 whitespace-nowrap text-right font-mono"></td>
            </tr>
            <tr class="font-bold bg-blue-50/20 dark:bg-blue-900/10 border-b-2 border-gray-300 dark:border-gray-600">
              <td colspan="2"></td>
              <td class="px-4 py-3 whitespace-nowrap text-center text-blue-800 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-900/20">누 계</td>
              <td class="px-4 py-3 whitespace-nowrap text-right">{{ formatCurrency(acnt.budget) }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-right text-blue-600">{{ formatCurrency(acnt.totalExec) }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-right" :class="{'text-red-500': parseInt(acnt.rate) > 100, 'text-green-600': parseInt(acnt.rate) <= 100}">{{ acnt.rate }}%</td>
              <td class="px-4 py-3 whitespace-nowrap text-right font-mono text-red-700 dark:text-red-400">{{ formatCurrency(acnt.totalDebit) }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-right font-mono text-blue-700 dark:text-blue-400">{{ formatCurrency(acnt.totalCredit) }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-right font-mono text-gray-900 dark:text-white">{{ formatCurrency(acnt.balance) }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { downloadLedgerExcel } from '~/utils/excel'
import { printPage as printAction } from '~/utils/print'

const startDate = ref('')
const endDate = ref('')
const typeFilter = ref('ALL')
const searchKeyword = ref('')
const pending = ref(false)

const accounts = ref<any[]>([])

const filteredAccounts = computed(() => {
  if (!searchKeyword.value) return accounts.value
  
  const keyword = searchKeyword.value.toLowerCase()
  return accounts.value.filter(a => 
    a.code.toLowerCase().includes(keyword) || 
    a.name.toLowerCase().includes(keyword)
  )
})

const formatCurrency = (val: number | string) => {
  if (val === undefined || val === null) return ''
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (isNaN(num)) return '0'
  return num.toLocaleString()
}

// 날짜 초기화 로직 (로컬 타임존 반영)
const initDates = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = String(now.getDate()).padStart(2, '0')
  
  // 기본 이번달 1일부터 오늘까지
  startDate.value = `${year}-${month}-01`
  endDate.value = `${year}-${month}-${date}`
}

const setDateRange = (range: string) => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const dateStr = String(now.getDate()).padStart(2, '0')
  
  if (range === 'today') {
    startDate.value = `${year}-${month}-${dateStr}`
    endDate.value = `${year}-${month}-${dateStr}`
  } else if (range === 'thisWeek') {
    const day = now.getDay()
    const diff = now.getDate() - day + (day == 0 ? -6 : 1) // 일요일(0) 고려
    const monday = new Date(now.setDate(diff))
    
    startDate.value = `${monday.getFullYear()}-${String(monday.getMonth()+1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
    
    // 오늘로 복구
    const today = new Date()
    endDate.value = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  } else if (range === 'thisMonth') {
    startDate.value = `${year}-${month}-01`
    endDate.value = `${year}-${month}-${dateStr}`
  }
  
  fetchLedger()
}

const moveDate = (direction: 'prev' | 'next') => {
  // 간단하게 한달 전/후 이동
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  
  if (direction === 'prev') {
    start.setMonth(start.getMonth() - 1)
    end.setMonth(end.getMonth() - 1)
  } else {
    start.setMonth(start.getMonth() + 1)
    end.setMonth(end.getMonth() + 1)
  }
  
  startDate.value = `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
  endDate.value = `${end.getFullYear()}-${String(end.getMonth()+1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
  
  fetchLedger()
}

const fetchLedger = async () => {
  if (!startDate.value || !endDate.value) return
  
  pending.value = true
  try {
    const response = await $fetch('/api/ledgers/total', {
      params: {
        startDate: startDate.value,
        endDate: endDate.value,
        type: typeFilter.value
      }
    })
    
    if (response.success) {
      accounts.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch total accounts:', error)
    alert('총계정원장 데이터를 불러오는 중 오류가 발생했습니다.')
  } finally {
    pending.value = false
  }
}

const setTypeFilter = (val: string) => {
  typeFilter.value = val
}

// 인쇄 버튼 핸들러
const onPrint = () => {
  printAction()
}

// 엑셀 다운로드 핸들러
const onDownloadExcel = () => {
  downloadLedgerExcel(filteredAccounts.value, `총계정원장_${startDate.value}_${endDate.value}`)
}

// typeFilter가 변경되면 즉시 데이터 로드
watch(typeFilter, () => {
  fetchLedger()
})

onMounted(() => {
  initDates()
  fetchLedger()
})
</script>
