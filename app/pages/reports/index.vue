<template>
  <div class="space-y-6">
    <!-- 상단 필터 섹션 (인쇄 시 제외) -->
    <div class="no-print bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-center justify-between sticky top-[-32px] z-20">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-3">
          <span class="text-sm font-bold text-gray-700 dark:text-gray-300">회계연도</span>
          <USelectMenu v-model="selectedYear" :items="yearOptions" class="w-28 font-bold" @change="updatePeriod" />
          
          <span class="text-sm font-bold text-gray-700 dark:text-gray-300 ml-2">보고서 종류</span>
          <USelectMenu v-model="selectedPeriod" :items="periodOptions" value-key="value" label-key="label" class="w-44 font-bold" @change="updatePeriod" />
        </div>

        <div class="border-l border-gray-300 h-6 mx-2 dark:border-gray-600"></div>

        <UCheckbox v-model="showAccountCode" label="계정코드 표시" class="cursor-pointer" />
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
          label="인쇄하기" 
          class="cursor-pointer font-bold bg-white dark:bg-gray-800" 
          @click="printReport"
        />
        <UButton 
          icon="i-heroicons-table-cells" 
          color="success" 
          variant="outline" 
          label="엑셀저장" 
          class="cursor-pointer font-bold bg-white dark:bg-gray-800" 
          :disabled="!reportData.length"
          @click="downloadExcel"
        />
      </div>
    </div>

    <!-- 보고서 본문 -->
    <ClientOnly>
      <div id="printable-report" class="bg-white text-black p-[8mm] min-h-[285mm] shadow-lg mx-auto print:shadow-none print:p-0 print:m-0" style="width: 210mm; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif;">
        <!-- 문서 헤더 -->
        <div class="text-center mb-4 relative">
          <h1 class="text-3xl font-normal tracking-[15px] mb-2">회 계 보 고 서 (상세)</h1>
          <div class="flex justify-between items-end text-[9pt] font-bold px-1">
            <!-- 기간은 해당 년의 전체로 고정 표시 -->
            <div>기 간 : {{ selectedYear }}/01/01 - {{ selectedYear }}/12/31</div>
            <div class="absolute left-1/2 -translate-x-1/2 bottom-0 text-gray-400">******************************</div>
            <!-- 분기 부분에 실제 선택된 날짜 범위 표시 -->
            <div>분 기 : {{ startDate.replace(/-/g, '/') }} - {{ endDate.replace(/-/g, '/') }}</div>
          </div>
        </div>

        <!-- 메인 데이터 테이블 -->
        <div class="grid grid-cols-2 border-t-2 border-black border-b border-l border-r">
          <!-- 수입부 (좌측) -->
          <div class="border-r border-black flex flex-col">
            <table class="w-full border-collapse text-[7.5pt]">
              <thead>
                <tr class="border-b border-black bg-gray-50">
                  <th class="border-r border-black py-1 font-bold w-[25%]">항 목</th>
                  <th class="border-r border-black py-1 font-bold w-[22%] text-right pr-1">예 산</th>
                  <th class="border-r border-black py-1 font-bold w-[22%] text-right pr-1">분기누계</th>
                  <th class="border-r border-black py-1 font-bold w-[22%] text-right pr-1">수입누계</th>
                  <th class="py-1 font-bold w-[9%]">율</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in incomeItemsWithGroup" :key="item.code" class="border-b border-gray-300">
                  <td class="border-r border-black px-1 py-0.5 leading-tight" :class="{'font-bold text-center bg-gray-50/50': item.isGroup}">
                    {{ formatItemName(item) }}
                  </td>
                  <td class="border-r border-black px-1 py-0.5 text-right font-mono">{{ formatNumber(item.budget_amount) }}</td>
                  <td class="border-r border-black px-1 py-0.5 text-right font-mono">{{ formatNumber(item.period_amount) }}</td>
                  <td class="border-r border-black px-1 py-0.5 text-right font-mono">{{ formatNumber(item.annual_amount) }}</td>
                  <td class="px-1 py-0.5 text-right font-mono">{{ calculateRate(item.annual_amount, item.budget_amount) }}</td>
                </tr>
                <tr v-for="n in Math.max(0, expenseItemsWithGroup.length - incomeItemsWithGroup.length)" :key="'empty-inc-'+n" class="border-b border-gray-200 h-[22px]">
                  <td class="border-r border-black"></td><td class="border-r border-black"></td><td class="border-r border-black"></td><td class="border-r border-black"></td><td></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 지출부 (우측) -->
          <div class="flex flex-col">
            <table class="w-full border-collapse text-[7.5pt]">
              <thead>
                <tr class="border-b border-black bg-gray-50">
                  <th class="border-r border-black py-1 font-bold w-[25%]">항 목</th>
                  <th class="border-r border-black py-1 font-bold w-[22%] text-right pr-1">예 산</th>
                  <th class="border-r border-black py-1 font-bold w-[22%] text-right pr-1">분기누계</th>
                  <th class="border-r border-black py-1 font-bold w-[22%] text-right pr-1">지출누계</th>
                  <th class="py-1 font-bold w-[9%]">율</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in expenseItemsWithGroup" :key="item.code" class="border-b border-gray-300">
                  <td class="border-r border-black px-1 py-0.5 leading-tight" :class="{'font-bold text-center bg-gray-50/50': item.isGroup}">
                    {{ formatItemName(item) }}
                  </td>
                  <td class="border-r border-black px-1 py-0.5 text-right font-mono">{{ formatNumber(item.budget_amount) }}</td>
                  <td class="border-r border-black px-1 py-0.5 text-right font-mono">{{ formatNumber(item.period_amount) }}</td>
                  <td class="border-r border-black px-1 py-0.5 text-right font-mono">{{ formatNumber(item.annual_amount) }}</td>
                  <td class="px-1 py-0.5 text-right font-mono">{{ calculateRate(item.annual_amount, item.budget_amount) }}</td>
                </tr>
                <tr v-for="n in Math.max(0, incomeItemsWithGroup.length - expenseItemsWithGroup.length)" :key="'empty-exp-'+n" class="border-b border-gray-200 h-[22px]">
                  <td class="border-r border-black"></td><td class="border-r border-black"></td><td class="border-r border-black"></td><td class="border-r border-black"></td><td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 수지 합계 라인 -->
        <div class="grid grid-cols-2 border-l border-r border-b border-black font-bold text-[7.5pt] bg-gray-50">
          <div class="grid grid-cols-[25%_22%_22%_22%_9%] border-r border-black">
            <div class="border-r border-black px-1 py-1 text-center">[ 합 계 ]</div>
            <div class="border-r border-black px-1 py-1 text-right font-mono">{{ formatNumber(meta?.total_income_budget) }}</div>
            <div class="border-r border-black px-1 py-1 text-right font-mono">{{ formatNumber(meta?.total_income_period) }}</div>
            <div class="border-r border-black px-1 py-1 text-right font-mono">{{ formatNumber(meta?.total_income_annual) }}</div>
            <div class="px-1 py-1 text-right font-mono">{{ calculateRate(meta?.total_income_annual, meta?.total_income_budget) }}</div>
          </div>
          <div class="grid grid-cols-[25%_22%_22%_22%_9%]">
            <div class="border-r border-black px-1 py-1 text-center">[ 합 계 ]</div>
            <div class="border-r border-black px-1 py-1 text-right font-mono">{{ formatNumber(meta?.total_expense_budget) }}</div>
            <div class="border-r border-black px-1 py-1 text-right font-mono">{{ formatNumber(meta?.total_expense_period) }}</div>
            <div class="border-r border-black px-1 py-1 text-right font-mono">{{ formatNumber(meta?.total_expense_annual) }}</div>
            <div class="px-1 py-1 text-right font-mono">{{ calculateRate(meta?.total_expense_annual, meta?.total_expense_budget) }}</div>
          </div>
        </div>

        <!-- 하단 결산 요약 -->
        <div class="mt-6 flex justify-between items-start">
          <div class="w-[65%]">
            <div class="text-center font-bold mb-1 text-[10pt] tracking-[5px]">&lt;&lt; 결 산 총 액 &gt;&gt;</div>
            <table class="w-full border-collapse border border-black text-center text-[9pt]">
              <thead>
                <tr class="border-b border-black bg-gray-50">
                  <th class="border-r border-black py-1 font-bold w-1/3">총 수 입 (A+B)</th>
                  <th class="border-r border-black py-1 font-bold w-1/3">총 지 출 (C)</th>
                  <th class="py-1 font-bold w-1/3">현 잔 액 (A+B-C)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="border-r border-black py-2 font-mono font-bold text-[11pt]">{{ formatNumber(Number(meta?.previousBalance || 0) + Number(meta?.total_income_annual || 0)) }}</td>
                  <td class="border-r border-black py-2 font-mono font-bold text-[11pt]">{{ formatNumber(meta?.total_expense_annual) }}</td>
                  <td class="py-2 font-mono font-bold text-[11pt]">{{ formatNumber(meta?.endingBalance) }}</td>
                </tr>
              </tbody>
            </table>
            <div class="text-[8pt] text-gray-500 mt-1 italic text-right">* 총수입은 [전기이월금(A) + 당기수입누계(B)] 합계입니다.</div>
          </div>

          <div class="w-[30%] text-right pt-8">
            <div class="text-[9pt] font-bold">Page : 1 / 1</div>
          </div>
        </div>

        <div class="mt-12 text-center">
          <h2 class="text-2xl font-black tracking-[12px]">{{ churchName }}</h2>
        </div>
      </div>
      
      <template #fallback>
        <div class="h-96 flex items-center justify-center">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { formatNumber } from '~/utils/formatter'
import { useUIStore } from '~/stores/ui'
import * as XLSX from 'xlsx'

const ui = useUIStore()

// 1. 상태 및 옵션 설정
const selectedYear = ref(new Date().getFullYear().toString())
const selectedPeriod = ref('all') // '1q', '2q', '3q', '4q', 'all'

const yearOptions = computed(() => {
  const current = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => (current - 3 + i).toString()).reverse()
})

const periodOptions = [
  { label: '전체 (1월~12월)', value: 'all' },
  { label: '1분기 (1월~3월)', value: '1q' },
  { label: '2분기 (4월~6월)', value: '2q' },
  { label: '3분기 (7월~9월)', value: '3q' },
  { label: '4분기 (10월~12월)', value: '4q' }
]

const startDate = ref('')
const endDate = ref('')
const showAccountCode = ref(true)

// 2. 일자 계산 로직
const updatePeriod = () => {
  const year = parseInt(selectedYear.value)
  switch (selectedPeriod.value) {
    case '1q':
      startDate.value = `${year}-01-01`; endDate.value = `${year}-03-31`; break
    case '2q':
      startDate.value = `${year}-04-01`; endDate.value = `${year}-06-30`; break
    case '3q':
      startDate.value = `${year}-07-01`; endDate.value = `${year}-09-30`; break
    case '4q':
      startDate.value = `${year}-10-01`; endDate.value = `${year}-12-31`; break
    case 'all':
    default:
      startDate.value = `${year}-01-01`; endDate.value = `${year}-12-31`; break
  }
  fetchData()
}

// 3. API 호출
const { data: reportRes, pending, refresh } = await useFetch('/api/reports/settlement', {
  query: computed(() => ({
    startDate: startDate.value,
    endDate: endDate.value,
    fiscalYear: parseInt(selectedYear.value)
  })),
  immediate: false,
  watch: false
})

const reportData = computed(() => (reportRes.value as any)?.data || [])
const meta = computed(() => (reportRes.value as any)?.meta || null)
const churchName = computed(() => (reportRes.value as any)?.church?.name || '교 회 명')

// 4. 데이터 가공
const processItems = (items: any[]) => {
  const result: any[] = []
  let currentGroup: any = null
  let groupBudget = 0; let groupPeriod = 0; let groupAnnual = 0

  items.forEach(item => {
    if (item.level === 1) {
      if (currentGroup) {
        result.push({
          code: currentGroup.code + '-sum',
          name: `[ ${currentGroup.name} 소계 ]`,
          isGroup: true,
          budget_amount: groupBudget,
          period_amount: groupPeriod,
          annual_amount: groupAnnual,
          level: 1
        })
      }
      currentGroup = { ...item }
      groupBudget = 0; groupPeriod = 0; groupAnnual = 0
    } else if (item.level === 2) {
      result.push(item)
      groupBudget += Number(item.budget_amount)
      groupPeriod += Number(item.period_amount)
      groupAnnual += Number(item.annual_amount)
    }
  })

  if (currentGroup) {
    result.push({
      code: currentGroup.code + '-sum',
      name: `[ ${currentGroup.name} 소계 ]`,
      isGroup: true,
      budget_amount: groupBudget,
      period_amount: groupPeriod,
      annual_amount: groupAnnual,
      level: 1
    })
  }
  return result
}

const incomeItemsWithGroup = computed(() => processItems(reportData.value.filter((a: any) => a.type === 'INCOME')))
const expenseItemsWithGroup = computed(() => processItems(reportData.value.filter((a: any) => a.type === 'EXPENSE')))

const fetchData = () => refresh()

const formatItemName = (item: any) => {
  if (item.isGroup) return item.name
  return showAccountCode.value ? `(${item.code}) ${item.name}` : item.name
}

const calculateRate = (annual: number, budget: number) => {
  if (!budget || Number(budget) === 0 || !annual || Number(annual) === 0) return ' '
  const rate = (Number(annual) / Number(budget)) * 100
  const rounded = Math.round(rate)
  if (rounded === 0) return ' '
  return rounded > 999 ? '>999%' : `${rounded}%`
}

const printReport = () => window.print()

const downloadExcel = () => {
  if (!reportData.value.length) return
  const wsData = [
    ['회계 보고서 (상세)'],
    [`기간: ${startDate.value} ~ ${endDate.value}`],
    [],
    ['구분', '계정코드', '계정명', '예산', '분기누계', '수입/지출누계', '율(%)'],
    ...reportData.value.map((item: any) => [
      item.type === 'INCOME' ? '수입' : '지출',
      item.code,
      item.name,
      item.budget_amount,
      item.period_amount,
      item.annual_amount,
      calculateRate(item.annual_amount, item.budget_amount)
    ])
  ]
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  XLSX.utils.book_append_sheet(wb, ws, '재정보고서')
  XLSX.writeFile(wb, `재무보고서_${startDate.value}_${endDate.value}.xlsx`)
}

onMounted(() => {
  updatePeriod()
})
</script>

<style scoped>
@media screen {
  #printable-report {
    border: 1px solid #e5e7eb;
    margin-top: 2rem;
    margin-bottom: 2rem;
  }
}

@media print {
  @page {
    size: A4 portrait;
    margin: 10mm !important;
  }
  body * { visibility: hidden !important; }
  #printable-report, #printable-report * { visibility: visible !important; }
  #printable-report {
    position: absolute !important;
    left: 0 !important; top: 0 !important;
    width: 100% !important;
    margin: 0 !important; padding: 0 !important;
    box-shadow: none !important; border: none !important;
  }
  .no-print { display: none !important; }
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color: black !important;
    border-color: black !important;
  }
  td { padding-top: 2px !important; padding-bottom: 2px !important; }
}
table { border-spacing: 0; border-collapse: collapse; }
th, td { border: 1px solid black; }
</style>
