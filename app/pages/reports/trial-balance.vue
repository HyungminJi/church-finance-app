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
      <div id="printable-trial-balance" class="bg-white text-black p-[10mm] min-h-[297mm] shadow-lg mx-auto print:shadow-none print:p-0" style="width: 210mm;">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-normal tracking-[15px] mb-2">합 계 잔 액 시 산 표</h1>
          <p class="text-sm font-bold text-gray-600">기준일 : {{ endDate.replace(/-/g, '/') }}</p>
        </div>

        <div class="border-t-2 border-black border-b-2">
          <table class="min-w-full divide-y divide-black text-[10pt] border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-black">
                <th colspan="2" class="px-2 py-2 text-center font-bold border-r border-black w-[35%] tracking-widest">차 변 (Debit)</th>
                <th rowspan="2" class="px-2 py-2 text-center font-black border-r border-black w-[30%] bg-gray-100">계 정 과 목</th>
                <th colspan="2" class="px-2 py-2 text-center font-bold w-[35%] tracking-widest">대 변 (Credit)</th>
              </tr>
              <tr class="bg-gray-50 border-b border-black">
                <th class="px-2 py-1 text-center font-bold border-r border-black w-[17.5%]">잔 액</th>
                <th class="px-2 py-1 text-center font-bold border-r border-black w-[17.5%]">합 계</th>
                <th class="px-2 py-1 text-center font-bold border-r border-black w-[17.5%]">합 계</th>
                <th class="px-2 py-1 text-center font-bold w-[17.5%]">잔 액</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-300">
              <tr v-if="trialItems.length === 0">
                <td colspan="5" class="px-4 py-20 text-center text-gray-400 italic">조회된 데이터가 없습니다.</td>
              </tr>
              <tr v-for="item in trialItems" :key="item.code" class="hover:bg-gray-50/50 transition-colors">
                <td class="px-2 py-2 text-right border-r border-black font-mono" :class="{'text-blue-600 font-bold': item.debitBalance > 0}">
                  {{ item.debitBalance > 0 ? formatNumber(item.debitBalance) : '' }}
                </td>
                <td class="px-2 py-2 text-right border-r border-black font-mono text-gray-500">
                  {{ item.debitTotal > 0 ? formatNumber(item.debitTotal) : '' }}
                </td>
                <td class="px-2 py-2 text-center border-r border-black" :class="{'font-black': item.level < 2}">
                  <div class="flex flex-col">
                    <span>{{ item.name }}</span>
                    <span class="text-[8pt] text-gray-400 font-mono">({{ item.code }})</span>
                  </div>
                </td>
                <td class="px-2 py-2 text-right border-r border-black font-mono text-gray-500">
                  {{ item.creditTotal > 0 ? formatNumber(item.creditTotal) : '' }}
                </td>
                <td class="px-2 py-2 text-right font-mono" :class="{'text-red-600 font-bold': item.creditBalance > 0}">
                  {{ item.creditBalance > 0 ? formatNumber(item.creditBalance) : '' }}
                </td>
              </tr>
              
              <!-- 합계 -->
              <tr class="font-black bg-gray-100 border-t-2 border-black">
                <td class="px-2 py-3 text-right border-r border-black font-mono text-blue-800">{{ formatNumber(totals.debitBalance) }}</td>
                <td class="px-2 py-3 text-right border-r border-black font-mono text-gray-700">{{ formatNumber(totals.debitTotal) }}</td>
                <td class="px-2 py-3 text-center border-r border-black tracking-[10px] pl-[10px]">합 계</td>
                <td class="px-2 py-3 text-right border-r border-black font-mono text-gray-700">{{ formatNumber(totals.creditTotal) }}</td>
                <td class="px-2 py-3 text-right font-mono text-red-800">{{ formatNumber(totals.creditBalance) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-20 text-center font-black text-2xl tracking-[15px]">창 세 교 회</div>
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
const startDate = ref(new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0])
const endDate = ref(today.toISOString().split('T')[0])

// 2. API 호출
const { data: response, pending, refresh } = await useFetch('/api/reports/trial-balance', {
  query: computed(() => ({
    startDate: startDate.value,
    endDate: endDate.value
  })),
  immediate: false,
  watch: false
})

const trialItems = computed(() => (response.value as any)?.data || [])

// 3. 합계 계산
const totals = computed(() => {
  return trialItems.value.reduce((acc: any, curr: any) => ({
    debitBalance: acc.debitBalance + Number(curr.debitBalance),
    debitTotal: acc.debitTotal + Number(curr.debitTotal),
    creditTotal: acc.creditTotal + Number(curr.creditTotal),
    creditBalance: acc.creditBalance + Number(curr.creditBalance)
  }), { debitBalance: 0, debitTotal: 0, creditTotal: 0, creditBalance: 0 })
})

// 4. 기능 함수
const fetchData = () => {
  refresh()
}

const printReport = () => {
  window.print()
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
@media print {
  @page {
    size: A4;
    margin: 15mm;
  }
  .no-print {
    display: none !important;
  }
  #printable-trial-balance {
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    width: 100% !important;
  }
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color: black !important;
    border-color: black !important;
  }
}
</style>
