<template>
  <div class="space-y-6">
    <div class="no-print bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col gap-4">
      <!-- 1행: 기간 및 기본 버튼 -->
      <div class="flex flex-wrap items-center gap-2">
        <UButton color="neutral" variant="outline" icon="i-heroicons-chevron-left" size="xs" class="cursor-pointer" @click="moveDate('prev')" />
        <UButton color="primary" variant="solid" label="오늘" size="sm" class="cursor-pointer font-bold" @click="setDateRange('today')" />
        <UButton color="neutral" variant="outline" icon="i-heroicons-chevron-right" size="xs" class="cursor-pointer" @click="moveDate('next')" />
        
        <div class="border-l border-gray-300 h-6 mx-1 dark:border-gray-600"></div>
        
        <UButton label="이번주" color="neutral" variant="outline" size="xs" class="cursor-pointer bg-white dark:bg-gray-700" @click="setDateRange('thisWeek')" />
        <UButton label="이번달" color="neutral" variant="outline" size="xs" class="cursor-pointer bg-white dark:bg-gray-700" @click="setDateRange('thisMonth')" />
        
        <div class="flex-grow"></div>
        
        <UButton icon="i-heroicons-printer" color="neutral" variant="outline" label="인쇄" class="cursor-pointer font-bold" @click="onPrint" />
        <UButton icon="i-heroicons-table-cells" color="success" variant="outline" label="엑셀" class="cursor-pointer font-bold" @click="onDownloadExcel" />
      </div>

      <!-- 2행: 상세 필터 옵션 -->
      <div class="flex flex-wrap items-center gap-4 bg-gray-50 dark:bg-gray-900/50 p-3 rounded border border-gray-200 dark:border-gray-700">
        <div class="flex items-center space-x-2">
          <label class="text-sm font-bold text-gray-700 dark:text-gray-300">기간:</label>
          <UInput type="date" v-model="startDate" size="sm" class="w-36 font-mono cursor-pointer" @change="fetchLedger" />
          <span class="text-gray-500 font-bold">~</span>
          <UInput type="date" v-model="endDate" size="sm" class="w-36 font-mono cursor-pointer" @change="fetchLedger" />
        </div>
        
        <div class="border-l border-gray-300 h-6 dark:border-gray-600"></div>

        <div class="flex items-center space-x-1">
           <UButton 
             v-for="f in [{l:'모두', v:'ALL'}, {l:'수입', v:'INCOME'}, {l:'지출', v:'EXPENSE'}]" 
             :key="f.v"
             :label="f.l"
             :color="typeFilter === f.v ? 'primary' : 'neutral'"
             :variant="typeFilter === f.v ? 'solid' : 'outline'"
             size="xs"
             class="cursor-pointer px-3"
             @click="setTypeFilter(f.v)"
           />
        </div>
      </div>
      
      <!-- 3행: 계정 검색 -->
      <div class="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-2 rounded border border-gray-200 dark:border-gray-700">
         <div class="flex items-center space-x-2">
            <span class="text-sm font-bold text-gray-700 dark:text-gray-300">계정과목 :</span>
            <UInput v-model="searchKeyword" placeholder="코드/과목명 검색" size="sm" class="w-64" @keyup.enter="fetchLedger" />
         </div>
         <UButton label="데이터 조회" icon="i-heroicons-magnifying-glass" color="primary" class="cursor-pointer font-bold px-6" @click="fetchLedger" :loading="pending" />
      </div>
    </div>

    <!-- 데이터 테이블 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative">
      <div class="overflow-x-auto custom-scrollbar">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead class="bg-gray-100 dark:bg-gray-900 sticky top-0 z-10 shadow-sm">
            <tr>
              <th class="px-4 py-3 text-left font-black text-gray-600 dark:text-gray-400 uppercase w-24">계정코드</th>
              <th class="px-4 py-3 text-left font-black text-gray-600 dark:text-gray-400 uppercase w-48">계정명</th>
              <th class="px-4 py-3 text-center font-black text-gray-600 dark:text-gray-400 uppercase">구분</th>
              <th class="px-4 py-3 text-right font-black text-gray-600 dark:text-gray-400 uppercase">예산금액</th>
              <th class="px-4 py-3 text-right font-black text-gray-600 dark:text-gray-400 uppercase">집행(누계)</th>
              <th class="px-4 py-3 text-right font-black text-gray-600 dark:text-gray-400 uppercase">집행비율</th>
              <th class="px-4 py-3 text-right font-black text-gray-600 dark:text-gray-400 uppercase">차변(지출)</th>
              <th class="px-4 py-3 text-right font-black text-gray-600 dark:text-gray-400 uppercase">대변(수입)</th>
              <th class="px-4 py-3 text-right font-black text-gray-600 dark:text-gray-400 uppercase">기말잔액</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
            <template v-if="filteredAccounts.length === 0">
              <tr>
                <td colspan="9" class="px-4 py-20 text-center text-gray-500 italic">
                  {{ pending ? '데이터를 가져오는 중입니다...' : '조회된 데이터가 없습니다.' }}
                </td>
              </tr>
            </template>
            <template v-for="acnt in filteredAccounts" :key="acnt.code">
              <!-- 계정 헤더 (Level 1은 더 강조) -->
              <tr :class="acnt.level === 1 ? 'bg-slate-100/80 dark:bg-slate-900/80' : 'bg-gray-50/50 dark:bg-gray-900/30'">
                <td class="px-4 py-3 whitespace-nowrap font-mono font-bold text-gray-500">{{ acnt.code }}</td>
                <td class="px-4 py-3 whitespace-nowrap font-black text-gray-900 dark:text-white" colspan="8">
                  <div class="flex items-center gap-2">
                    <UIcon :name="acnt.level === 1 ? 'i-heroicons-folder' : 'i-heroicons-document-text'" :class="acnt.level === 1 ? 'text-yellow-500' : 'text-primary-400'" />
                    {{ acnt.name }}
                    <span class="text-[10px] font-bold px-1.5 py-0.5 rounded border" :class="acnt.type === 'INCOME' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-red-50 text-red-600 border-red-200'">
                      {{ acnt.type === 'INCOME' ? '수입' : '지출' }}
                    </span>
                  </div>
                </td>
              </tr>
              
              <!-- 상세 수치 (누계 행) -->
              <tr class="hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors">
                <td colspan="2"></td>
                <td class="px-4 py-2 text-center text-xs font-bold text-gray-400 uppercase">이월/기간/누계</td>
                <td class="px-4 py-2 text-right font-mono font-bold text-slate-600 dark:text-slate-400">
                  {{ formatCurrency(acnt.budget) }}
                </td>
                <td class="px-4 py-2 text-right font-mono font-bold text-blue-600">
                  {{ formatCurrency(acnt.totalExec) }}
                </td>
                <td class="px-4 py-2 text-right font-mono font-bold" :class="acnt.rate > 100 ? 'text-red-500' : 'text-green-600'">
                  {{ acnt.rate }}%
                </td>
                <td class="px-4 py-2 text-right font-mono font-bold text-red-500">
                  {{ formatCurrency(acnt.totalDebit) }}
                </td>
                <td class="px-4 py-2 text-right font-mono font-bold text-primary-500">
                  {{ formatCurrency(acnt.totalCredit) }}
                </td>
                <td class="px-4 py-2 text-right font-mono font-black text-gray-900 dark:text-white bg-slate-50/50 dark:bg-slate-900/20">
                  {{ formatCurrency(acnt.balance) }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { downloadLedgerExcel } from '~/utils/excel'
import { printPage as printAction } from '~/utils/print'

// 상태 관리
const startDate = ref('')
const endDate = ref('')
const typeFilter = ref('ALL')
const searchKeyword = ref('')
const pending = ref(false)
const accounts = ref<any[]>([])

// 금액 포맷터
const formatCurrency = (val: number | string) => {
  if (val === undefined || val === null) return '-'
  const num = typeof val === 'string' ? parseFloat(val) : val
  return num.toLocaleString()
}

// 필터링된 계정 목록 (검색어 기준)
const filteredAccounts = computed(() => {
  if (!searchKeyword.value) return accounts.value
  const keyword = searchKeyword.value.toLowerCase()
  return accounts.value.filter(a => 
    a.code.toLowerCase().includes(keyword) || 
    a.name.toLowerCase().includes(keyword)
  )
})

// 날짜 초기화 (이번 달 1일 ~ 오늘)
const initDates = () => {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  
  startDate.value = firstDay.toISOString().split('T')[0]
  endDate.value = now.toISOString().split('T')[0]
}

const setDateRange = (range: string) => {
  const now = new Date()
  if (range === 'today') {
    const todayStr = now.toISOString().split('T')[0]
    startDate.value = todayStr
    endDate.value = todayStr
  } else if (range === 'thisWeek') {
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    startDate.value = new Date(now.setDate(diff)).toISOString().split('T')[0]
    endDate.value = new Date().toISOString().split('T')[0]
  } else if (range === 'thisMonth') {
    startDate.value = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    endDate.value = new Date().toISOString().split('T')[0]
  }
  fetchLedger()
}

const moveDate = (direction: 'prev' | 'next') => {
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  const offset = direction === 'prev' ? -1 : 1
  
  startDate.value = new Date(start.setMonth(start.getMonth() + offset)).toISOString().split('T')[0]
  endDate.value = new Date(end.setMonth(end.getMonth() + offset)).toISOString().split('T')[0]
  fetchLedger()
}

const fetchLedger = async () => {
  if (!startDate.value || !endDate.value) return
  
  pending.value = true
  try {
    const response: any = await $fetch('/api/ledgers/total-account', {
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
  } finally {
    pending.value = false
  }
}

const setTypeFilter = (val: string) => {
  typeFilter.value = val
  fetchLedger()
}

const onPrint = () => {
  printAction()
}

const onDownloadExcel = () => {
  downloadLedgerExcel(filteredAccounts.value, `총계정원장_${startDate.value}_${endDate.value}`)
}

onMounted(() => {
  initDates()
  fetchLedger()
})
</script>
t>
