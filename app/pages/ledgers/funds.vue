<template>
  <div class="space-y-6">
    <!-- 상단 필터 섹션 -->
    <div class="no-print bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-center sticky top-[-32px] z-20">
      <div class="flex items-center space-x-2">
        <UButton color="neutral" variant="outline" icon="i-heroicons-chevron-left" size="sm" class="cursor-pointer" @click="moveDate(-1)" />
        <UButton color="primary" variant="solid" label="오늘" size="sm" class="cursor-pointer font-bold px-6" @click="setPreset('today')" />
        <UButton color="neutral" variant="outline" icon="i-heroicons-chevron-right" size="sm" class="cursor-pointer" @click="moveDate(1)" />
        
        <div class="border-l border-gray-300 h-6 mx-2 dark:border-gray-600"></div>
        
        <UButton label="이번주" color="neutral" variant="ghost" size="sm" class="cursor-pointer" @click="setPreset('thisWeek')" />
        <UButton label="이번달" color="neutral" variant="ghost" size="sm" class="cursor-pointer" @click="setPreset('thisMonth')" />
        <UButton label="이번년도" color="neutral" variant="ghost" size="sm" class="cursor-pointer" @click="setPreset('thisYear')" />
      </div>
      
      <div class="flex items-center gap-2">
        <UInput v-model="startDate" type="date" class="w-36 font-mono text-sm cursor-pointer" @change="fetchData" />
        <span class="text-gray-500 font-bold">~</span>
        <UInput v-model="endDate" type="date" class="w-36 font-mono text-sm cursor-pointer" @change="fetchData" />
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
          icon="i-heroicons-arrows-right-left" 
          color="primary" 
          label="자금 이체" 
          class="cursor-pointer font-bold shadow-sm" 
          @click="isTransferModalOpen = true"
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

    <!-- 자금 이체 모달 -->
    <UModal v-model:open="isTransferModalOpen" title="자금 이체" description="통장 간 자금을 이동합니다.">
      <template #content>
        <div class="p-6 space-y-4">
          <UFormField label="이체 일자" required>
            <UInput v-model="transferForm.transaction_date" type="date" class="w-full cursor-pointer" />
          </UFormField>
          
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="출금 계좌" required>
              <USelectMenu 
                v-model="transferForm.from_fund_id" 
                :items="fundsList" 
                value-key="id" 
                label-key="name" 
                placeholder="출금할 통장 선택"
                class="cursor-pointer"
              />
            </UFormField>
            <UFormField label="입금 계좌" required>
              <USelectMenu 
                v-model="transferForm.to_fund_id" 
                :items="fundsList" 
                value-key="id" 
                label-key="name" 
                placeholder="입금할 통장 선택"
                class="cursor-pointer"
              />
            </UFormField>
          </div>

          <UFormField label="이체 금액" required>
            <div class="relative">
              <input 
                v-model="transferAmountStr"
                type="text"
                placeholder="0"
                class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 text-right font-black font-mono text-lg text-gray-900 dark:text-white"
                @input="onTransferAmountInput"
              />
              <span class="absolute right-4 top-2.5 text-gray-500 font-bold">원</span>
            </div>
          </UFormField>

          <UFormField label="적요 (선택)">
            <UInput v-model="transferForm.description" placeholder="이체 사유 입력" class="w-full" />
          </UFormField>

          <div class="flex justify-end gap-2 mt-6 pt-4 border-t dark:border-gray-800">
            <UButton class="cursor-pointer" label="취소" color="neutral" variant="ghost" @click="isTransferModalOpen = false" />
            <UButton class="cursor-pointer font-bold" label="이체 실행" color="primary" :loading="isTransferring" @click="submitTransfer" />
          </div>
        </div>
      </template>
    </UModal>

    <!-- 와이드 테이블 영역 -->
    <div id="printable-funds" class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
        <h3 class="text-sm font-black text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <UIcon name="i-heroicons-banknotes" class="text-brand-blue" />
          자금명세서 ({{ startDate }} ~ {{ endDate }})
        </h3>
        <div v-if="reportItems.length > 0" class="text-xs font-bold text-gray-500">
          대상 자금: {{ reportItems.length }}건
        </div>
      </div>
      
      <div class="overflow-x-auto w-full relative">
        <div v-if="pending" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
        </div>

        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
          <thead class="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th class="px-4 py-3 text-left font-black text-gray-600 dark:text-gray-300 uppercase tracking-tighter">장부구분</th>
              <th class="px-4 py-3 text-left font-black text-gray-600 dark:text-gray-300 uppercase tracking-tighter">계좌분류</th>
              <th class="px-4 py-3 text-left font-black text-gray-600 dark:text-gray-300 uppercase tracking-tighter">은행명</th>
              <th class="px-4 py-3 text-left font-black text-gray-600 dark:text-gray-300 uppercase tracking-tighter">계좌별칭</th>
              <th class="px-4 py-3 text-right font-black text-gray-600 dark:text-gray-300 uppercase tracking-tighter">이월금</th>
              <th class="px-4 py-3 text-right font-black text-gray-600 dark:text-gray-300 uppercase tracking-tighter">수입</th>
              <th class="px-4 py-3 text-right font-black text-gray-600 dark:text-gray-300 uppercase tracking-tighter">지출</th>
              <th class="px-4 py-3 text-right font-black text-gray-600 dark:text-gray-300 uppercase tracking-tighter">잔액</th>
              <th class="px-4 py-3 text-left font-black text-gray-600 dark:text-gray-300 uppercase tracking-tighter">계좌번호</th>
              <th class="px-4 py-3 text-left font-black text-gray-600 dark:text-gray-300 uppercase tracking-tighter">계좌설명</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-800">
            <tr v-for="item in reportItems" :key="item.id" class="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
              <td class="px-4 py-3 whitespace-nowrap text-gray-500 font-medium">{{ item.book_type }}</td>
              <td class="px-4 py-3 whitespace-nowrap font-bold text-gray-900 dark:text-white">{{ item.category }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-gray-500">{{ item.bank_name }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-gray-900 dark:text-gray-300 font-bold">{{ item.name }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-right font-mono font-bold">{{ formatNumber(item.carryOver) }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-right font-mono font-bold text-brand-blue">{{ formatNumber(item.income) }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-right font-mono font-bold text-red-500">{{ formatNumber(item.expense) }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-right font-mono font-black text-gray-900 dark:text-white">{{ formatNumber(item.balance) }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-gray-500 font-mono">{{ item.account_number }}</td>
              <td class="px-4 py-3 whitespace-nowrap text-gray-400 italic text-[10px]">{{ item.description }}</td>
            </tr>
            <tr v-if="reportItems.length === 0 && !pending">
              <td colspan="10" class="px-4 py-20 text-center text-gray-500 italic">등록된 자금 정보가 없습니다.</td>
            </tr>
            
            <!-- 총계 영역 -->
            <tr v-if="reportItems.length > 0" class="bg-gray-50 dark:bg-gray-900/80 font-black border-t-2 border-gray-200 dark:border-gray-700 shadow-inner">
              <td colspan="4" class="px-4 py-4 text-center text-gray-900 dark:text-white text-sm tracking-[0.5em] pl-[0.5em]">총 계</td>
              <td class="px-4 py-4 text-right font-mono text-sm">{{ formatNumber(totals.carryOver) }}</td>
              <td class="px-4 py-4 text-right font-mono text-sm text-brand-blue">{{ formatNumber(totals.income) }}</td>
              <td class="px-4 py-4 text-right font-mono text-sm text-red-500">{{ formatNumber(totals.expense) }}</td>
              <td class="px-4 py-4 text-right font-mono text-base bg-white dark:bg-gray-800 rounded shadow-sm">{{ formatNumber(totals.balance) }}</td>
              <td colspan="2"></td>
            </tr>
          </tbody>
        </table>
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

// 1. 날짜 제어 및 필터 상태
const today = new Date()
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
const startDate = ref(firstDay.toISOString().split('T')[0])
const endDate = ref(today.toISOString().split('T')[0])

// 2. API 호출
const { data: reportRes, pending, refresh } = await useFetch('/api/reports/funds', {
  query: computed(() => ({
    startDate: startDate.value,
    endDate: endDate.value
  })),
  immediate: false,
  watch: false
})

const reportItems = computed(() => (reportRes.value as any)?.data || [])
const fundsList = computed(() => reportItems.value) // 이체 시 선택할 통장 목록

// --- 자금 이체 로직 ---
const isTransferModalOpen = ref(false)
const isTransferring = ref(false)
const transferAmountStr = ref('')

const transferForm = ref({
  transaction_date: new Date().toISOString().split('T')[0],
  from_fund_id: null,
  to_fund_id: null,
  amount: 0,
  description: ''
})

const onTransferAmountInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  let raw = target.value.replace(/[^0-9]/g, '')
  if (!raw) raw = '0'
  transferForm.value.amount = parseInt(raw, 10)
  transferAmountStr.value = formatNumber(transferForm.value.amount)
}

const submitTransfer = async () => {
  if (!transferForm.value.transaction_date) { ui.showAlert('알림', '이체 일자를 선택해주세요.', 'warning'); return }
  if (!transferForm.value.from_fund_id) { ui.showAlert('알림', '출금 계좌를 선택해주세요.', 'warning'); return }
  if (!transferForm.value.to_fund_id) { ui.showAlert('알림', '입금 계좌를 선택해주세요.', 'warning'); return }
  if (transferForm.value.from_fund_id === transferForm.value.to_fund_id) { ui.showAlert('알림', '출금 계좌와 입금 계좌가 같을 수 없습니다.', 'warning'); return }
  if (transferForm.value.amount <= 0) { ui.showAlert('알림', '이체 금액을 입력해주세요.', 'warning'); return }

  isTransferring.value = true
  try {
    const res: any = await $fetch('/api/funds/transfer', {
      method: 'POST',
      body: transferForm.value
    })
    
    if (res.success) {
      ui.showAlert('성공', '자금 이체가 완료되었습니다.', 'success')
      isTransferModalOpen.value = false
      // 초기화
      transferForm.value.amount = 0
      transferForm.value.description = ''
      transferAmountStr.value = ''
      
      // 목록 새로고침
      await refresh()
    }
  } catch (error: any) {
    ui.showAlert('오류', error.data?.statusMessage || '이체 중 오류가 발생했습니다.', 'error')
  } finally {
    isTransferring.value = false
  }
}
// -------------------

// 3. 합계 계산
const totals = computed(() => {
  return reportItems.value.reduce((acc: any, curr: any) => ({
    carryOver: acc.carryOver + Number(curr.carryOver),
    income: acc.income + Number(curr.income),
    expense: acc.expense + Number(curr.expense),
    balance: acc.balance + Number(curr.balance)
  }), { carryOver: 0, income: 0, expense: 0, balance: 0 })
})

// 4. 기능 함수
const fetchData = () => {
  if (startDate.value > endDate.value) {
    ui.showAlert('알림', '시작일이 종료일보다 늦을 수 없습니다.', 'warning')
    return
  }
  refresh()
}

const moveDate = (days: number) => {
  const d = new Date(startDate.value)
  d.setDate(d.getDate() + days)
  startDate.value = d.toISOString().split('T')[0]
  
  const d2 = new Date(endDate.value)
  d2.setDate(d2.getDate() + days)
  endDate.value = d2.toISOString().split('T')[0]
  
  fetchData()
}

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

const printReport = () => {
  window.print()
}

const downloadExcel = () => {
  if (!reportItems.value.length) return
  
  const wsData = [
    ['자금명세서'],
    [`기간: ${startDate.value} ~ ${endDate.value}`],
    [],
    ['장부구분', '계좌분류', '은행명', '계좌별칭', '이월금', '수입', '지출', '잔액', '계좌번호', '계좌설명'],
    ...reportItems.value.map((item: any) => [
      item.book_type,
      item.category,
      item.bank_name,
      item.name,
      item.carryOver,
      item.income,
      item.expense,
      item.balance,
      item.account_number,
      item.description
    ]),
    [],
    ['총계', '', '', '', totals.value.carryOver, totals.value.income, totals.value.expense, totals.value.balance]
  ]
  
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  XLSX.utils.book_append_sheet(wb, ws, '자금명세서')
  XLSX.writeFile(wb, `자금명세서_${startDate.value}_${endDate.value}.xlsx`)
}

onMounted(() => {
  refresh()
})
</script>

<style scoped>
@media print {
  #printable-funds {
    border: none !important;
    box-shadow: none !important;
  }
  .sticky {
    position: static !important;
  }
}
</style>
