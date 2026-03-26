<template>
  <div>
    <ClientOnly>
      <div class="h-[calc(100vh-16rem)] flex flex-col md:flex-row gap-4">
        <!-- 좌측 계정 트리 -->
        <div class="w-full md:w-64 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700 shrink-0">
        <div class="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <span class="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <UIcon name="i-heroicons-tag" class="text-brand-blue" />
            계정과목
          </span>
          <UButton 
            v-if="selectedAccountCode"
            label="전체" 
            color="neutral" 
            variant="ghost" 
            size="xs" 
            class="cursor-pointer font-bold" 
            @click="selectAccount(null)"
          />
        </div>
        <div class="flex-1 overflow-y-auto p-2 custom-scrollbar">
          <ul class="text-sm space-y-1">
            <li v-for="group in accountTree" :key="group.name" >
              <div 
                class="flex items-center p-1.5 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors" 
                @click="group.expanded = !group.expanded"
              >
                <UIcon :name="group.expanded ? 'i-heroicons-folder-open' : 'i-heroicons-folder'" class="w-4 h-4 mr-2 text-yellow-500" />
                <span class="font-bold text-gray-800 dark:text-gray-200">{{ group.name }}</span>
              </div>
              <ul v-if="group.expanded" class="pl-4 mt-1 border-l border-gray-200 dark:border-gray-600 ml-2">
                <li 
                  v-for="acc in group.children" 
                  :key="acc.code" 
                  class="flex items-center p-1.5 hover:bg-blue-50 dark:hover:bg-gray-700 rounded cursor-pointer text-gray-700 dark:text-gray-300 transition-colors" 
                  :class="{'bg-brand-blue/10 font-bold text-brand-blue dark:text-brand-blue': selectedAccountCode === acc.code}"
                  @click="selectAccount(acc.code)"
                >
                   <UIcon name="i-heroicons-document-text" class="w-4 h-4 mr-2" :class="selectedAccountCode === acc.code ? 'text-brand-blue' : 'text-gray-400'" />
                   <span class="font-mono text-[10px] text-gray-400 mr-2 shrink-0">{{ acc.code }}</span>
                   <span class="text-sm truncate">{{ acc.name }}</span>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>

      <!-- 우측 상세 내역 -->
      <div class="flex-1 flex flex-col bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 min-w-0">
        <!-- 상단 컨트롤 패널 -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col gap-4">
          <!-- 1행: 기간 설정, 자금 필터 및 버튼 -->
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-2 flex-wrap">
              <UInput v-model="startDate" type="date" class="w-36 font-mono text-sm cursor-pointer" @change="fetchData" />
              <span class="text-gray-500 font-bold">~</span>
              <UInput v-model="endDate" type="date" class="w-36 font-mono text-sm cursor-pointer" @change="fetchData" />
              
              <div class="border-l border-gray-300 h-6 mx-2 dark:border-gray-600"></div>
              
              <!-- [추가] 자금(통장) 필터 드롭다운 -->
              <USelectMenu 
                v-model="selectedFundId" 
                :items="funds" 
                value-key="id" 
                label-key="name" 
                placeholder="전체 자금/통장" 
                class="w-48 cursor-pointer shadow-sm bg-white dark:bg-gray-800"
                @change="fetchData"
              >
                <template #label>
                  <span v-if="selectedFund" class="flex items-center gap-2 truncate">
                    <UIcon name="i-heroicons-banknotes" class="text-brand-blue shrink-0" />
                    {{ selectedFund.name }}
                  </span>
                  <span v-else class="text-gray-400">전체 자금/통장</span>
                </template>
              </USelectMenu>

              <div class="border-l border-gray-300 h-6 mx-2 dark:border-gray-600"></div>

              <div class="flex space-x-1">
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
                icon="i-heroicons-table-cells" 
                color="success" 
                variant="outline" 
                label="엑셀 다운로드" 
                class="cursor-pointer font-bold bg-white dark:bg-gray-800" 
                :disabled="!transactions || transactions.length === 0"
                @click="downloadExcel"
              />
            </div>
          </div>
          
          <!-- 2행: 현재 선택 정보 및 요약 -->
          <div class="flex justify-between items-end">
            <div class="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
               <UIcon name="i-heroicons-book-open" class="text-brand-blue" />
               {{ selectedAccountName }}
               <span v-if="selectedFund" class="text-sm font-bold text-gray-400 ml-2">
                 [ 자금: {{ selectedFund.name }} ]
               </span>
            </div>
            
            <div v-if="meta" class="flex gap-6 text-right animate-in fade-in">
              <div>
                <span class="text-[10px] font-bold text-gray-400 block uppercase">기간 수입</span>
                <span class="text-sm font-black text-brand-blue font-mono">{{ formatNumber(meta.period_income) }}</span>
              </div>
              <div>
                <span class="text-[10px] font-bold text-gray-400 block uppercase">기간 지출</span>
                <span class="text-sm font-black text-red-500 font-mono">{{ formatNumber(meta.period_expense) }}</span>
              </div>
              <div class="border-l dark:border-gray-700 pl-6">
                <span class="text-[10px] font-bold text-gray-400 block uppercase">기말 잔액</span>
                <span class="text-base font-black text-gray-900 dark:text-white font-mono">{{ formatNumber(meta.ending_balance) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 테이블 영역 -->
        <div class="flex-1 overflow-x-auto overflow-y-auto relative custom-scrollbar">
          <div v-if="pending" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-20">
            <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
          </div>
          
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border-collapse">
            <thead class="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10 shadow-sm text-[11px] text-gray-500">
              <tr>
                <th class="px-4 py-3 text-left font-black uppercase whitespace-nowrap">일자</th>
                <th class="px-4 py-3 text-left font-black uppercase whitespace-nowrap">계정</th>
                <th class="px-4 py-3 text-left font-black uppercase">적요 / 헌금자·지출처</th>
                <th class="px-4 py-3 text-right font-black uppercase whitespace-nowrap">수입 (대변)</th>
                <th class="px-4 py-3 text-right font-black uppercase whitespace-nowrap">지출 (차변)</th>
                <th class="px-4 py-3 text-right font-black uppercase whitespace-nowrap">잔액</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-800">
              <!-- 이월 잔액 행 -->
              <tr v-if="meta" class="bg-blue-50/50 dark:bg-blue-900/10 font-bold border-b-2 border-blue-100 dark:border-blue-900/30">
                <td colspan="3" class="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400 tracking-widest">전기 이월 ({{ startDate }} 이전)</td>
                <td class="px-4 py-3 text-right text-sm text-brand-blue font-mono">{{ formatNumber(meta.previous_income) }}</td>
                <td class="px-4 py-3 text-right text-sm text-red-500 font-mono">{{ formatNumber(meta.previous_expense) }}</td>
                <td class="px-4 py-3 text-right text-sm font-black text-gray-900 dark:text-white font-mono">{{ formatNumber(meta.previous_balance) }}</td>
              </tr>

              <!-- 데이터 행 -->
              <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono">{{ tx.date_str }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  <div class="flex flex-col">
                    <span class="font-bold">{{ tx.account_name }}</span>
                    <span class="text-[10px] text-gray-400 font-mono">{{ tx.account_code }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {{ tx.description || '-' }}
                  <span v-if="tx.donor_name" class="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    <UIcon :name="tx.donor_type === 'MEMBER' ? 'i-heroicons-user' : 'i-heroicons-user-group'" class="w-2.5 h-2.5 mr-1 text-gray-400" />
                    {{ tx.donor_name }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-right text-brand-blue font-mono font-bold">
                  {{ tx.income > 0 ? formatNumber(tx.income) : '' }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-right text-red-500 font-mono font-bold">
                  {{ tx.expense > 0 ? formatNumber(tx.expense) : '' }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-right font-black text-gray-900 dark:text-white font-mono">
                  {{ formatNumber(tx.balance) }}
                </td>
              </tr>
              
              <!-- 빈 데이터 안내 -->
              <tr v-if="transactions && transactions.length === 0">
                <td colspan="6" class="px-4 py-20 text-center text-sm text-gray-500 italic font-medium">
                  해당 조건으로 기록된 전표 데이터가 없습니다.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- 메인 레이아웃 닫기 -->
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { formatNumber } from '~/utils/formatter'
import { fetchAndDownloadExcel } from '~/utils/excel'
import { useUIStore } from '~/stores/ui'

const ui = useUIStore()
const route = useRoute()

// 상태 관리
const selectedAccountCode = ref<string | null>(null)
const selectedFundId = ref<string | null>(null) // 자금 필터 상태
const accounts = ref<any[]>([])
const funds = ref<any[]>([])

// 날짜 초기화 (이번 달 1일 ~ 말일)
const today = new Date()
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

const startDate = ref(firstDay.toISOString().split('T')[0])
const endDate = ref(lastDay.toISOString().split('T')[0])

// 1. 기초 데이터 로드
const loadAccounts = async () => {
  try {
    const res: any = await $fetch('/api/accounts')
    if (res.success) accounts.value = res.data
  } catch (e) { console.error(e) }
}

const loadFunds = async () => {
  try {
    const res: any = await $fetch('/api/funds')
    if (res.success) funds.value = res.data
  } catch (e) { console.error(e) }
}

const accountTree = computed(() => {
  const groups = [
    { name: '수입 (INCOME)', type: 'INCOME', expanded: true, children: [] as any[] },
    { name: '지출 (EXPENSE)', type: 'EXPENSE', expanded: true, children: [] as any[] }
  ]
  accounts.value.forEach(acc => {
    const group = groups.find(g => g.type === acc.type)
    if (group) group.children.push(acc)
  })
  return groups
})

const selectedAccountName = computed(() => {
  if (!selectedAccountCode.value) return '총계정원장 (전체)'
  const acc = accounts.value.find(a => a.code === selectedAccountCode.value)
  return acc ? `${acc.name} 원장` : '계정 원장'
})

const selectedFund = computed(() => {
  return funds.value.find(f => f.id === selectedFundId.value)
})

const selectAccount = (code: string | null) => {
  selectedAccountCode.value = code
  fetchData()
}

// 2. 장부 데이터 로드
const { data: ledgerRes, pending, refresh } = await useFetch('/api/ledgers', {
  query: computed(() => ({
    startDate: startDate.value,
    endDate: endDate.value,
    accountCode: selectedAccountCode.value || undefined,
    fundId: selectedFundId.value || undefined
  })),
  immediate: false,
  watch: false
})

const transactions = computed(() => (ledgerRes.value as any)?.data || [])
const meta = computed(() => (ledgerRes.value as any)?.meta || null)

const fetchData = () => {
  if (!startDate.value || !endDate.value) {
    ui.showAlert('알림', '시작일과 종료일을 모두 지정해주세요.', 'warning')
    return
  }
  refresh()
}

const setPreset = (type: 'thisMonth' | 'thisYear') => {
  const now = new Date()
  let start, end
  if (type === 'thisMonth') {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  } else if (type === 'thisYear') {
    start = new Date(now.getFullYear(), 0, 1)
    end = new Date(now.getFullYear(), 11, 31)
  }
  if (start && end) {
    startDate.value = start.toISOString().split('T')[0]
    endDate.value = end.toISOString().split('T')[0]
    fetchData()
  }
}

// 3. 엑셀 다운로드
const downloadExcel = async () => {
  const mapper = (tx: any) => ({
    '일자': tx.date_str,
    '계정': tx.account_name,
    '적요/헌금자': displayValue(tx.donor_name || tx.description),
    '수입': tx.income,
    '지출': tx.expense,
    '잔액': tx.balance
  })
  const fileName = `원장_${selectedAccountName.value}_${startDate.value}`
  await fetchAndDownloadExcel('/api/ledgers', { 
    startDate: startDate.value, 
    endDate: endDate.value, 
    accountCode: selectedAccountCode.value || undefined,
    fundId: selectedFundId.value || undefined
  }, mapper, fileName)
}

onMounted(async () => {
  await Promise.all([loadAccounts(), loadFunds()])
  
  // [핵심] URL 파라미터(fundId) 수신 처리
  if (route.query.fundId) {
    selectedFundId.value = route.query.fundId as string
  }
  
  await refresh()
})
</script>
