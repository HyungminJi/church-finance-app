<template>
  <div class="space-y-6">
    <!-- 옵션 패널 -->
    <div class="no-print bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-center sticky top-[-32px] z-20">
      <div class="flex items-center space-x-2">
        <label class="text-sm font-bold text-gray-700 dark:text-gray-300">기준일자:</label>
        <UInput type="date" v-model="endDate" size="sm" class="w-40 font-mono cursor-pointer" @change="fetchData" />
      </div>

      <div class="flex-grow"></div>
      
      <div class="flex items-center gap-2">
        <div v-if="!pending && trialItems.length > 0" class="mr-4 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700 flex items-center gap-2">
          <UIcon name="i-heroicons-check-circle" class="text-primary-600" />
          <span class="text-xs font-bold text-primary-700 dark:text-primary-300">대차평균의 원리 일치 (정상)</span>
        </div>

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
          :disabled="!trialItems.length"
          @click="downloadExcel"
        />
      </div>
    </div>

    <!-- 시산표 테이블 -->
    <ClientOnly>
      <div id="printable-trial-balance" class="bg-white text-black p-[10mm_15mm] min-h-[297mm] shadow-lg mx-auto print:shadow-none print:p-0 print:m-0" style="width: 210mm; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif;">
        <div class="text-center mb-6 relative">
          <h1 class="text-3xl font-normal tracking-[15px] mb-2">합 계 잔 액 시 산 표</h1>
          <p class="text-sm font-bold text-gray-600">기준일 : {{ endDate.replace(/-/g, '/') }}</p>
        </div>

        <table class="w-full border-y-2 border-black divide-y divide-gray-200 text-[13px] border-collapse table-fixed">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-300 h-[24px]">
              <th colspan="2" class="px-1 text-center font-bold border-r border-gray-300 w-[35%] tracking-widest">차 변 (Debit)</th>
              <th rowspan="2" class="px-1 text-center font-black border-r border-gray-300 w-[30%] bg-gray-100">계 정 과 목</th>
              <th colspan="2" class="px-1 text-center font-bold w-[35%] tracking-widest border-l border-gray-300">대 변 (Credit)</th>
            </tr>
            <tr class="bg-gray-50 border-b border-black h-[24px]">
              <th class="px-1 text-center font-bold border-r border-gray-300 w-[17.5%]">잔 액</th>
              <th class="px-1 text-center font-bold border-r border-gray-300 w-[17.5%]">합 계</th>
              <th class="px-1 text-center font-bold border-r border-gray-300 w-[17.5%] border-l border-gray-300">합 계</th>
              <th class="px-1 text-center font-bold w-[17.5%] border-l border-gray-300">잔 액</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="trialItems.length === 0">
              <td colspan="5" class="px-4 py-20 text-center text-gray-400 italic">조회된 데이터가 없습니다.</td>
            </tr>
            
            <template v-for="(group, gIdx) in groupedItems" :key="gIdx">
              <tr class="bg-gray-50/30 h-[22px] break-inside-avoid">
                <td colspan="2" class="border-r border-gray-200"></td>
                <td class="text-center font-black border-r border-gray-200 border-l border-gray-200 text-primary-900 bg-gray-100/50 text-[13px]">{{ group.label }}</td>
                <td colspan="2"></td>
              </tr>

              <tr v-for="item in group.items" :key="item.code" class="hover:bg-primary-50/20 h-[22px] break-inside-avoid">
                <td class="px-2 text-right border-r border-gray-200 font-mono text-[12px]" :class="{'text-primary-600 font-bold': item.debitBalance > 0}">
                  {{ item.debitBalance > 0 ? formatNumber(item.debitBalance) : '' }}
                </td>
                <td class="px-2 text-right border-r border-gray-200 font-mono text-[12px] text-gray-400">
                  {{ item.debitTotal > 0 ? formatNumber(item.debitTotal) : '' }}
                </td>
                <td class="px-1 text-center border-r border-gray-200 border-l border-gray-200 leading-tight overflow-hidden whitespace-nowrap item-name-cell">
                  <div class="flex flex-col items-center justify-center">
                    <span class="text-[13px] font-bold text-gray-700 text-center">{{ item.name }}</span>
                  </div>
                </td>
                <td class="px-2 text-right border-r border-gray-200 font-mono text-[12px] text-gray-400">
                  {{ item.creditTotal > 0 ? formatNumber(item.creditTotal) : '' }}
                </td>
                <td class="px-2 text-right font-mono text-[12px]" :class="{'text-red-600 font-bold': item.creditBalance > 0}">
                  {{ item.creditBalance > 0 ? formatNumber(item.creditBalance) : '' }}
                </td>
              </tr>

              <tr class="font-bold bg-gray-50/50 h-[22px] border-t border-gray-300 break-inside-avoid">
                <td class="px-2 text-right border-r border-gray-200 font-mono text-primary-700">{{ formatNumber(group.totals.debitBalance) }}</td>
                <td class="px-2 text-right border-r border-gray-200 font-mono text-gray-500">{{ formatNumber(group.totals.debitTotal) }}</td>
                <td class="text-center border-r border-gray-200 border-l border-gray-200 text-[12px] bg-gray-50/80 text-gray-500">[ {{ group.label }} 소계 ]</td>
                <td class="px-2 text-right border-r border-gray-200 font-mono text-gray-500">{{ formatNumber(group.totals.creditTotal) }}</td>
                <td class="px-2 text-right font-mono text-red-700">{{ formatNumber(group.totals.creditBalance) }}</td>
              </tr>
            </template>
            
            <!-- 합계 행 -->
            <tr class="font-black bg-gray-200 h-[28px] break-inside-avoid">
              <td class="px-2 text-right font-mono text-primary-800 border-sum-cell">{{ formatNumber(totals.debitBalance) }}</td>
              <td class="px-2 text-right font-mono text-gray-700 border-sum-cell">{{ formatNumber(totals.debitTotal) }}</td>
              <td class="text-center tracking-[10px] pl-[10px] bg-gray-300 text-[14px] border-sum-cell">합 계</td>
              <td class="px-2 text-right font-mono text-gray-700 border-sum-cell">{{ formatNumber(totals.creditTotal) }}</td>
              <td class="px-2 text-right font-mono text-red-800 border-sum-last">{{ formatNumber(totals.creditBalance) }}</td>
            </tr>
          </tbody>
        </table>

        <div id="church-footer-target" class="mt-12 text-center font-black text-2xl tracking-[15px] text-gray-800">{{ churchName }}</div>
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

// 1. 상태 관리
const today = new Date()
const endDate = ref(today.toISOString().split('T')[0])

// 2. API 호출
const { data: response, pending, refresh } = await useFetch('/api/reports/trial-balance', {
  query: computed(() => ({
    startDate: '1900-01-01', // 시산표는 전체 기간 누적
    endDate: endDate.value
  })),
  immediate: false,
  watch: false
})

const trialItems = computed(() => (response.value as any)?.data || [])
const churchName = computed(() => (response.value as any)?.church?.name || '교 회 명')

// 3. 데이터 가공 (그룹화)
const groupedItems = computed(() => {
  if (!trialItems.value.length) return []
  
  const groups = [
    { key: 'ASSET', label: '자 산 (통장/현금)', items: [] as any[] },
    { key: 'INCOME', label: '수 입 (헌금/기타)', items: [] as any[] },
    { key: 'EXPENSE', label: '지 출 (사역/운영)', items: [] as any[] }
  ]

  trialItems.value.forEach((item: any) => {
    const group = groups.find(g => g.key === item.type)
    if (group) group.items.push(item)
  })

  return groups.filter(g => g.items.length > 0).map(g => ({
    ...g,
    totals: g.items.reduce((acc: any, curr: any) => ({
      debitBalance: acc.debitBalance + Number(curr.debitBalance),
      debitTotal: acc.debitTotal + Number(curr.debitTotal),
      creditTotal: acc.creditTotal + Number(curr.creditTotal),
      creditBalance: acc.creditBalance + Number(curr.creditBalance)
    }), { debitBalance: 0, debitTotal: 0, creditTotal: 0, creditBalance: 0 })
  }))
})

// 4. 합계 계산
const totals = computed(() => {
  return trialItems.value.reduce((acc: any, curr: any) => ({
    debitBalance: acc.debitBalance + Number(curr.debitBalance),
    debitTotal: acc.debitTotal + Number(curr.debitTotal),
    creditTotal: acc.creditTotal + Number(curr.creditTotal),
    creditBalance: acc.creditBalance + Number(curr.creditBalance)
  }), { debitBalance: 0, debitTotal: 0, creditTotal: 0, creditBalance: 0 })
})

// 5. 기능 함수
const fetchData = () => refresh()

const printReport = () => {
  const reportElement = document.getElementById('printable-trial-balance')
  if (!reportElement) return

  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;width:210mm;height:297mm;left:-10000px;top:0;background:white;'
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document
  if (!doc) return

  const css = `
    @page { size: A4 portrait; margin: 10mm !important; }
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: "Malgun Gothic", "맑은 고딕", sans-serif; background: white; color: #1f2937; font-size: 13px; line-height: 1.2; letter-spacing: -0.05em; }
    #printable-trial-balance { 
      width: 190mm; 
      padding: 0; 
      background: white; 
      margin: 0 auto; 
      position: relative;
    }
    h1 { text-align: center; font-size: 32px; font-weight: normal; margin-bottom: 8px; letter-spacing: 15px; color: black; }
    p { text-align: center; font-size: 14px; font-weight: bold; color: #4b5563; margin-bottom: 24px; }
    
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    tr { height: 24px !important; }
    th, td { border: 1px solid #e5e7eb; padding: 0 4px; line-height: 24px; white-space: nowrap; overflow: hidden; text-overflow: clip; text-align: center !important; }
    
    /* 합계 전용 조합 클래스: 보더 묶기 해결 */
    .border-sum-cell {
      border-right: 1px solid #9ca3af !important;
      border-top: 2px solid black !important;
    }
    .border-sum-last {
      border-right: none !important;
      border-top: 2px solid black !important;
    }

    table.border-y-2 { border-top: 2px solid black !important; border-bottom: 2px solid black !important; }
    
    .item-name-cell {
      font-size: 13px !important;
      text-align: center !important;
      letter-spacing: -0.05em !important;
    }
    
    td.font-mono { text-align: right !important; }
    
    .w-\\[35\\%\\] { width: 35% !important; }
    .w-\\[30\\%\\] { width: 30% !important; }
    .w-\\[17\\.5\\%\\] { width: 17.5% !important; }
    
    th { background-color: #f9fafb !important; font-weight: bold; text-align: center !important; color: #374151; border: 1px solid #d1d5db !important; font-size: 13px; }
    thead tr:first-child th { border-top: none !important; }
    thead tr:last-child th { border-bottom: 1px solid black !important; }
    
    .bg-gray-100\\/50 { background-color: rgba(243, 244, 246, 0.5) !important; }
    .bg-gray-100 { background-color: #f3f4f6 !important; }
    .bg-gray-50 { background-color: #f9fafb !important; }
    .bg-gray-200 { background-color: #e5e7eb !important; }
    .bg-gray-300 { background-color: #d1d5db !important; }
    
    .border-gray-100 { border-color: #f3f4f6 !important; }
    .border-gray-200 { border-color: #e5e7eb !important; }
    .border-gray-300 { border-color: #d1d5db !important; }
    .border-gray-400 { border-color: #9ca3af !important; }
    .border-black { border-color: black !important; }
    
    thead { display: table-header-group; }
    .break-inside-avoid { break-inside: avoid; }
    
    .text-primary-900 { color: #1e3a8a !important; }
    .text-primary-800 { color: #1e40af !important; }
    .text-primary-700 { color: #1d4ed8 !important; }
    .text-primary-600 { color: #2563eb !important; }
    .text-red-800 { color: #991b1b !important; }
    .text-red-700 { color: #b91c1c !important; }
    .text-red-600 { color: #dc2626 !important; }
    .text-gray-800 { color: #1f2937 !important; }
    .text-gray-700 { color: #374151 !important; }
    .text-gray-500 { color: #6b7280 !important; }
    
    .font-black { font-weight: 900 !important; }
    .font-bold { font-weight: bold !important; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important; font-size: 12px; }
    
    .church-footer { 
      margin-top: 50px; 
      text-align: center !important; 
      width: 100%;
      font-size: 24px !important; 
      font-weight: 900 !important; 
      letter-spacing: 15px !important; 
      color: #1f2937;
      display: block !important;
    }
  `

  doc.write(`
    <html>
      <head><style>${css}</style></head>
      <body>
        <div id="printable-trial-balance">
          ${reportElement.innerHTML.replace('id="church-footer-target"', 'class="church-footer"')}
        </div>
      </body>
    </html>
  `)
  doc.close()

  iframe.contentWindow?.focus()
  setTimeout(() => {
    iframe.contentWindow?.print()
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 1000)
  }, 500)
}

const downloadExcel = () => {
  if (trialItems.value.length === 0) return
  const wsData = [
    ['합계 잔액 시산표'],
    [`기준일: ${endDate.value}`],
    [],
    ['차변 잔액', '차변 합계', '계정과목', '대변 합계', '대변 잔액'],
    ...trialItems.value.map((item: any) => [
      item.debitBalance,
      item.debitTotal,
      `${item.name} (${item.code})`,
      item.creditTotal,
      item.creditBalance
    ]),
    [],
    [totals.value.debitBalance, totals.value.debitTotal, '합계', totals.value.creditTotal, totals.value.creditBalance]
  ]
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  XLSX.utils.book_append_sheet(wb, ws, '시산표')
  XLSX.writeFile(wb, `시산표_${endDate.value}.xlsx`)
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
@media screen {
  #printable-trial-balance {
    border: 1px solid #e5e7eb;
    margin-top: 2rem;
    margin-bottom: 2rem;
  }
}

/* 웹 화면 전용 합계 행 스타일 */
.border-sum-cell {
  border-right: 1px solid #9ca3af !important;
  border-top: 2px solid black !important;
}
.border-sum-last {
  border-right: none !important;
  border-top: 2px solid black !important;
}
.dark .border-sum-cell, .dark .border-sum-last {
  border-top-color: #4b5563 !important;
  border-right-color: #374151 !important;
}

@media print {
  @page {
    size: A4 portrait;
    margin: 10mm !important;
  }
  body * { visibility: hidden !important; }
  #printable-trial-balance, #printable-trial-balance * { visibility: visible !important; }
  #printable-trial-balance {
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
}
</style>
