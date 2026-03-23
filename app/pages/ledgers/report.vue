<template>
  <div class="space-y-6">
    <!-- 상단 필터 섹션 -->
    <div class="no-print bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4 sticky top-[-32px] z-20">
      <div class="flex items-center gap-2">
        <UInput v-model="startDate" type="date" class="w-36 font-mono text-sm cursor-pointer" @change="fetchData" />
        <span class="text-gray-500 font-bold">~</span>
        <UInput v-model="endDate" type="date" class="w-36 font-mono text-sm cursor-pointer" @change="fetchData" />
        
        <div class="border-l border-gray-300 h-6 mx-2 dark:border-gray-600"></div>
        
        <div class="flex space-x-1">
          <UButton label="오늘" color="neutral" variant="outline" size="xs" class="cursor-pointer bg-white dark:bg-gray-700" @click="setPreset('today')" />
          <UButton label="이번주" color="neutral" variant="outline" size="xs" class="cursor-pointer bg-white dark:bg-gray-700" @click="setPreset('thisWeek')" />
          <UButton label="이번달" color="neutral" variant="outline" size="xs" class="cursor-pointer bg-white dark:bg-gray-700" @click="setPreset('thisMonth')" />
          <UButton label="올해" color="neutral" variant="outline" size="xs" class="cursor-pointer bg-white dark:bg-gray-700" @click="setPreset('thisYear')" />
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <UButton 
          icon="i-heroicons-arrow-path" 
          color="neutral" 
          variant="ghost" 
          class="cursor-pointer" 
          :loading="pending"
          @click="fetchData" 
        />
        <UButton 
          icon="i-heroicons-printer" 
          color="neutral" 
          variant="outline" 
          label="인쇄" 
          class="cursor-pointer font-bold bg-white dark:bg-gray-800" 
          @click="printReport"
        />
        <UButton 
          icon="i-heroicons-table-cells" 
          color="success" 
          variant="outline" 
          label="엑셀" 
          class="cursor-pointer font-bold bg-white dark:bg-gray-800" 
          @click="downloadExcel"
        />
      </div>
    </div>

    <!-- 보고서 본문 -->
    <div id="printable-report" class="space-y-6">
      <!-- 제목 (인쇄 전용) -->
      <div class="hidden print:block text-center space-y-2 mb-8">
        <h1 class="text-2xl font-black underline decoration-double underline-offset-8">재 정 보 고 서</h1>
        <p class="text-sm text-gray-600 font-mono">{{ startDate }} ~ {{ endDate }}</p>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-gray-700">
          
          <!-- [수입부] -->
          <div class="flex flex-col">
            <div class="bg-blue-50 dark:bg-blue-900/30 px-4 py-3 font-black text-center text-blue-800 dark:text-blue-300 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span>수 입 부 (INCOME)</span>
              <span v-if="meta" class="text-xs font-mono">합계: {{ formatNumber(meta.total_income_actual) }}</span>
            </div>
            <div class="flex-1 overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                <thead class="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th class="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase">계정항목</th>
                    <th class="px-3 py-2 text-right text-[11px] font-bold text-gray-500 uppercase">예산액</th>
                    <th class="px-3 py-2 text-right text-[11px] font-bold text-gray-500 uppercase">실적액</th>
                    <th class="px-3 py-2 text-right text-[11px] font-bold text-gray-500 uppercase">비고(%)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
                  <tr v-for="item in incomeItems" :key="item.code" :class="getRowClass(item)">
                    <td class="px-3 py-2 text-sm" :style="{ paddingLeft: (item.level * 12 + 12) + 'px' }">
                      <span :class="{'font-bold text-gray-900 dark:text-white': item.level < 2}">{{ item.name }}</span>
                      <span v-if="item.level === 2" class="text-[10px] text-gray-400 font-mono ml-1">{{ item.code }}</span>
                    </td>
                    <td class="px-3 py-2 text-right text-sm font-mono text-gray-500">{{ formatNumber(item.budget_amount) }}</td>
                    <td class="px-3 py-2 text-right text-sm font-mono font-bold" :class="item.actual_amount > 0 ? 'text-brand-blue' : 'text-gray-400'">
                      {{ formatNumber(item.actual_amount) }}
                    </td>
                    <td class="px-3 py-2 text-right text-xs font-mono text-gray-400">
                      {{ calculatePercent(item.actual_amount, item.budget_amount) }}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- [지출부] -->
          <div class="flex flex-col">
            <div class="bg-red-50 dark:bg-red-900/30 px-4 py-3 font-black text-center text-red-800 dark:text-red-300 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span>지 출 부 (EXPENSE)</span>
              <span v-if="meta" class="text-xs font-mono">합계: {{ formatNumber(meta.total_expense_actual) }}</span>
            </div>
            <div class="flex-1 overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                <thead class="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th class="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase">계정항목</th>
                    <th class="px-3 py-2 text-right text-[11px] font-bold text-gray-500 uppercase">예산액</th>
                    <th class="px-3 py-2 text-right text-[11px] font-bold text-gray-500 uppercase">실적액</th>
                    <th class="px-3 py-2 text-right text-[11px] font-bold text-gray-500 uppercase">비고(%)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
                  <tr v-for="item in expenseItems" :key="item.code" :class="getRowClass(item)">
                    <td class="px-3 py-2 text-sm" :style="{ paddingLeft: (item.level * 12 + 12) + 'px' }">
                      <span :class="{'font-bold text-gray-900 dark:text-white': item.level < 2}">{{ item.name }}</span>
                      <span v-if="item.level === 2" class="text-[10px] text-gray-400 font-mono ml-1">{{ item.code }}</span>
                    </td>
                    <td class="px-3 py-2 text-right text-sm font-mono text-gray-500">{{ formatNumber(item.budget_amount) }}</td>
                    <td class="px-3 py-2 text-right text-sm font-mono font-bold" :class="item.actual_amount > 0 ? 'text-red-500' : 'text-gray-400'">
                      {{ formatNumber(item.actual_amount) }}
                    </td>
                    <td class="px-3 py-2 text-right text-xs font-mono text-gray-400">
                      {{ calculatePercent(item.actual_amount, item.budget_amount) }}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- [하단 요약 섹션] -->
        <div class="bg-gray-50 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-700 p-6 print:py-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 print:gap-4 text-center">
            <div class="space-y-1">
              <div class="text-[10px] font-black text-gray-500 uppercase tracking-widest">전기 이월금</div>
              <div class="text-xl font-mono font-black text-gray-700 dark:text-gray-300">
                {{ formatNumber(meta?.previousBalance || 0) }}
              </div>
            </div>
            <div class="space-y-1">
              <div class="text-[10px] font-black text-blue-500 uppercase tracking-widest">당기 수입액</div>
              <div class="text-xl font-mono font-black text-brand-blue">
                {{ formatNumber(meta?.total_income_actual || 0) }}
              </div>
            </div>
            <div class="space-y-1">
              <div class="text-[10px] font-black text-red-500 uppercase tracking-widest">당기 지출액</div>
              <div class="text-xl font-mono font-black text-red-500">
                {{ formatNumber(meta?.total_expense_actual || 0) }}
              </div>
            </div>
            <div class="space-y-1 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-inner border border-gray-200 dark:border-gray-700">
              <div class="text-[10px] font-black text-green-600 uppercase tracking-widest">차인 차기 이월금</div>
              <div class="text-2xl font-mono font-black text-gray-900 dark:text-white">
                {{ formatNumber(meta?.endingBalance || 0) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 인쇄용 날인 공간 (하단 고정) -->
      <div class="hidden print:grid grid-cols-3 gap-4 mt-12 text-center">
        <div class="border border-gray-300 h-24 flex flex-col items-center justify-center">
          <span class="text-xs mb-8 text-gray-500">담당자</span>
          <span class="text-sm">(인)</span>
        </div>
        <div class="border border-gray-300 h-24 flex flex-col items-center justify-center">
           <span class="text-xs mb-8 text-gray-500">재정위원장</span>
           <span class="text-sm">(인)</span>
        </div>
        <div class="border border-gray-300 h-24 flex flex-col items-center justify-center">
           <span class="text-xs mb-8 text-gray-500">담임목사</span>
           <span class="text-sm">(인)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { formatNumber } from '~/utils/formatter'
import { useUIStore } from '~/stores/ui'
import * as XLSX from 'xlsx'

const ui = useUIStore()

// 날짜 초기화 (이번 달 1일 ~ 오늘)
const today = new Date()
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
const startDate = ref(firstDay.toISOString().split('T')[0])
const endDate = ref(today.toISOString().split('T')[0])

// API 호출
const { data: reportRes, pending, refresh } = await useFetch('/api/reports/settlement', {
  query: computed(() => ({
    startDate: startDate.value,
    endDate: endDate.value,
    fiscalYear: new Date(startDate.value).getFullYear()
  })),
  immediate: false,
  watch: false
})

const reportData = computed(() => (reportRes.value as any)?.data || [])
const meta = computed(() => (reportRes.value as any)?.meta || null)

// 데이터 분류
const incomeItems = computed(() => reportData.value.filter((a: any) => a.type === 'INCOME'))
const expenseItems = computed(() => reportData.value.filter((a: any) => a.type === 'EXPENSE'))

const fetchData = () => {
  if (startDate.value > endDate.value) {
    ui.showAlert('알림', '시작일이 종료일보다 늦을 수 없습니다.', 'warning')
    return
  }
  refresh()
}

// 프리셋 설정
const setPreset = (type: 'today' | 'thisWeek' | 'thisMonth' | 'thisYear') => {
  const now = new Date()
  let start, end = now
  
  if (type === 'today') {
    start = now
  } else if (type === 'thisWeek') {
    const day = now.getDay()
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day)
  } else if (type === 'thisMonth') {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
  } else if (type === 'thisYear') {
    start = new Date(now.getFullYear(), 0, 1)
  }
  
  if (start) {
    startDate.value = start.toISOString().split('T')[0]
    endDate.value = end.toISOString().split('T')[0]
    fetchData()
  }
}

// 헬퍼 함수
const getRowClass = (item: any) => {
  if (item.level === 0) return 'bg-gray-100/50 dark:bg-gray-800/50'
  if (item.level === 1) return 'bg-gray-50/30 dark:bg-gray-900/30'
  return ''
}

const calculatePercent = (actual: number, budget: number) => {
  if (!budget || budget === 0) return '-'
  return ((actual / budget) * 100).toFixed(1)
}

// 인쇄 및 엑셀
const printReport = () => {
  window.print()
}

const downloadExcel = () => {
  if (!reportData.value.length) return
  
  const wsData = [
    ['재정 보고서'],
    [`기간: ${startDate.value} ~ ${endDate.value}`],
    [],
    ['구분', '계정코드', '계정항목', '예산액', '실적액', '달성률(%)'],
    ...reportData.value.map((item: any) => [
      item.type === 'INCOME' ? '수입' : '지출',
      item.code,
      item.name,
      item.budget_amount,
      item.actual_amount,
      calculatePercent(item.actual_amount, item.budget_amount)
    ]),
    [],
    ['요약'],
    ['전기이월금', meta.value?.previousBalance],
    ['당기수입액', meta.value?.total_income_actual],
    ['당기지출액', meta.value?.total_expense_actual],
    ['차기이월금', meta.value?.endingBalance]
  ]
  
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  XLSX.utils.book_append_sheet(wb, ws, '재정보고서')
  XLSX.writeFile(wb, `재정보고서_${startDate.value}_${endDate.value}.xlsx`)
}

onMounted(() => {
  refresh()
})
</script>

<style scoped>
@media print {
  #printable-report {
    padding: 0 !important;
    margin: 0 !important;
  }
}
</style>
