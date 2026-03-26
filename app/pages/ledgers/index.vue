<template>
  <div>
    <ClientOnly>
      <div class="h-[calc(100vh-16rem)] flex flex-col md:flex-row gap-4">
        <!-- 좌측 계정 트리 (아코디언 고도화) -->
        <div class="w-full md:w-64 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700 shrink-0">
        <div class="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <span class="text-sm font-black text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <UIcon name="i-heroicons-tag" class="text-brand-blue" />
            계정과목별 원장
          </span>
          <UButton 
            v-if="selectedAccountCode || selectedAccountType"
            label="전체" 
            color="neutral" 
            variant="ghost" 
            size="xs" 
            class="cursor-pointer font-black" 
            @click="resetAccountFilter"
          />
        </div>
        <div class="flex-1 overflow-y-auto p-2 custom-scrollbar">
          <ul class="text-sm space-y-2">
            <li v-for="group in accountTree" :key="group.name" class="space-y-1">
              <!-- 그룹(수입/지출) 헤더: 아코디언과 조회를 명확히 분리 -->
              <div 
                class="flex items-center p-1 rounded-lg transition-all duration-200"
                :class="selectedAccountType === group.type && !selectedAccountCode ? 'bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-100 dark:ring-blue-800' : ''"
              >
                <!-- 1. 아코디언 토글 전용 영역 (좌측 아이콘들) -->
                <div 
                  class="flex items-center gap-1.5 p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md cursor-pointer transition-colors"
                  @click.stop="group.expanded = !group.expanded"
                  title="접기/펼치기"
                >
                  <UIcon 
                    :name="group.expanded ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'" 
                    class="w-3.5 h-3.5 text-gray-400"
                  />
                  <UIcon 
                    :name="group.expanded ? 'i-heroicons-folder-open' : 'i-heroicons-folder'" 
                    class="w-5 h-5" 
                    :class="group.type === 'INCOME' ? 'text-blue-500' : 'text-red-500'" 
                  />
                </div>

                <!-- 2. 통합 원장 조회 전용 영역 (중앙 텍스트) -->
                <div 
                  class="flex-1 py-1.5 px-2 font-black text-sm cursor-pointer hover:text-brand-blue hover:underline underline-offset-4 decoration-2 decoration-brand-blue/30 transition-all"
                  :class="selectedAccountType === group.type && !selectedAccountCode ? 'text-brand-blue' : 'text-gray-800 dark:text-gray-200'"
                  @click="selectGroup(group)"
                  title="통합 원장 조회"
                >
                  {{ group.name }}
                </div>
              </div>

              <!-- 하위 계정 목록 (아코디언 내용) -->
              <ul v-if="group.expanded" class="pl-4 mt-1 border-l-2 border-gray-100 dark:border-gray-700 ml-4 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
                <li 
                  v-for="acc in group.children" 
                  :key="acc.code" 
                  class="flex items-center p-2 hover:bg-blue-50 dark:hover:bg-gray-700/50 rounded-md cursor-pointer text-gray-600 dark:text-gray-400 transition-all" 
                  :class="{'bg-brand-blue/10 font-bold text-brand-blue dark:text-brand-blue ring-1 ring-brand-blue/20': selectedAccountCode === acc.code}"
                  @click="selectAccount(acc.code)"
                >
                   <UIcon name="i-heroicons-document-text" class="w-4 h-4 mr-2" :class="selectedAccountCode === acc.code ? 'text-brand-blue' : 'text-gray-300'" />
                   <span class="font-mono text-[10px] opacity-50 mr-2 shrink-0">{{ acc.code }}</span>
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
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-2 flex-wrap">
              <UInput v-model="startDate" type="date" class="w-36 font-mono text-sm cursor-pointer shadow-sm" @change="fetchData" />
              <span class="text-gray-500 font-bold">~</span>
              <UInput v-model="endDate" type="date" class="w-36 font-mono text-sm cursor-pointer shadow-sm" @change="fetchData" />
              
              <div class="border-l border-gray-300 h-6 mx-2 dark:border-gray-600"></div>
              
              <div class="flex items-center gap-1">
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
                <UButton 
                  v-if="selectedFundId"
                  icon="i-heroicons-x-mark" 
                  color="neutral" 
                  variant="ghost" 
                  size="xs" 
                  class="cursor-pointer" 
                  @click="() => { selectedFundId = null; fetchData(); }"
                />
              </div>

              <div class="border-l border-gray-300 h-6 mx-2 dark:border-gray-600"></div>

              <div class="flex space-x-1">
                <UButton label="이번달" color="neutral" variant="outline" size="xs" class="cursor-pointer font-bold bg-white dark:bg-gray-700" @click="setPreset('thisMonth')" />
                <UButton label="올해" color="neutral" variant="outline" size="xs" class="cursor-pointer font-bold bg-white dark:bg-gray-700" @click="setPreset('thisYear')" />
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
                class="cursor-pointer font-bold bg-white dark:bg-gray-800 shadow-sm" 
                :disabled="!transactions || transactions.length === 0"
                @click="downloadExcel"
              />
            </div>
          </div>
          
          <div class="flex justify-between items-end">
            <div class="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
               <UIcon name="i-heroicons-book-open" class="text-brand-blue w-6 h-6" />
               {{ currentViewLabel }}
               <span v-if="selectedFund" class="text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-1 rounded-md ml-2">
                 {{ selectedFund.name }}
               </span>
            </div>
            
            <div v-if="meta" class="flex gap-6 text-right animate-in fade-in duration-500">
              <div class="group">
                <span class="text-[10px] font-black text-gray-400 block uppercase tracking-widest group-hover:text-blue-500 transition-colors">기간 수입</span>
                <span class="text-base font-black text-brand-blue font-mono">{{ formatNumber(meta.period_income) }}</span>
              </div>
              <div class="group">
                <span class="text-[10px] font-black text-gray-400 block uppercase tracking-widest group-hover:text-red-500 transition-colors">기간 지출</span>
                <span class="text-base font-black text-red-500 font-mono">{{ formatNumber(meta.period_expense) }}</span>
              </div>
              <div class="border-l-2 dark:border-gray-700 pl-6 group">
                <span class="text-[10px] font-black text-gray-400 block uppercase tracking-widest group-hover:text-gray-900 dark:group-hover:text-white transition-colors">현재 잔액</span>
                <span class="text-lg font-black text-gray-900 dark:text-white font-mono">{{ formatNumber(meta.ending_balance) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 테이블 영역 -->
        <div class="flex-1 overflow-x-auto overflow-y-auto relative custom-scrollbar bg-slate-50/30 dark:bg-slate-900/10">
          <div v-if="pending" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-20 backdrop-blur-sm">
            <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin text-primary" />
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
              <tr v-if="meta" class="bg-blue-50/30 dark:bg-blue-900/5 font-black border-b-2 border-blue-50 dark:border-blue-900/20">
                <td colspan="3" class="px-4 py-3 text-center text-[11px] text-gray-500 dark:text-gray-400 tracking-[0.5em] pl-[0.5em]">전기이월 ({{ startDate }} 이전)</td>
                <td class="px-4 py-3 text-right text-sm text-brand-blue font-mono">{{ formatNumber(meta.previous_income) }}</td>
                <td class="px-4 py-3 text-right text-sm text-red-500 font-mono">{{ formatNumber(meta.previous_expense) }}</td>
                <td class="px-4 py-3 text-right text-sm text-gray-900 dark:text-white font-mono bg-blue-50/50 dark:bg-blue-900/20">{{ formatNumber(meta.previous_balance) }}</td>
              </tr>

              <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors border-l-4 border-transparent hover:border-brand-blue">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">{{ tx.date_str }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  <div class="flex flex-col">
                    <span class="font-bold tracking-tight text-xs">{{ tx.account_name }}</span>
                    <span class="text-[9px] text-gray-400 font-mono">{{ tx.account_code }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  <div class="flex flex-col">
                    <span class="font-medium text-xs">{{ tx.description || '-' }}</span>
                    <span v-if="tx.donor_name" class="mt-1 inline-flex items-center text-[10px] font-bold text-gray-400">
                      <UIcon :name="tx.donor_type === 'MEMBER' ? 'i-heroicons-user' : 'i-heroicons-user-group'" class="w-2.5 h-2.5 mr-1" />
                      {{ tx.donor_name }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-right text-brand-blue font-mono font-black">
                  {{ tx.income > 0 ? formatNumber(tx.income) : '' }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-right text-red-500 font-mono font-black">
                  {{ tx.expense > 0 ? formatNumber(tx.expense) : '' }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-right font-black text-gray-900 dark:text-white font-mono">
                  {{ formatNumber(tx.balance) }}
                </td>
              </tr>
              
              <tr v-if="transactions && transactions.length === 0 && !pending">
                <td colspan="6" class="px-4 py-24 text-center text-sm text-gray-400 italic font-black bg-gray-50/20 dark:bg-gray-900/10">
                  데이터가 존재하지 않습니다.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { formatNumber, displayValue } from '~/utils/formatter'
import { fetchAndDownloadExcel } from '~/utils/excel'
import { useUIStore } from '~/stores/ui'

const ui = useUIStore()
const route = useRoute()

// 1. 상태 관리
const selectedAccountCode = ref<string | null>(null)
const selectedAccountType = ref<'INCOME' | 'EXPENSE' | null>(null) // [추가] 그룹 필터 상태
const selectedFundId = ref<string | null>(null)
const accounts = ref<any[]>([])
const funds = ref<any[]>([])

const today = new Date()
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
const startDate = ref(firstDay.toISOString().split('T')[0])
const endDate = ref(lastDay.toISOString().split('T')[0])

// 2. 데이터 페칭
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

const accountTree = ref([
  { name: '수입 (INCOME)', type: 'INCOME', expanded: true, children: [] as any[] },
  { name: '지출 (EXPENSE)', type: 'EXPENSE', expanded: true, children: [] as any[] }
])

const buildTree = () => {
  accountTree.value[0].children = accounts.value.filter(a => a.type === 'INCOME')
  accountTree.value[1].children = accounts.value.filter(a => a.type === 'EXPENSE')
}

// 3. 필터 제어 로직
const currentViewLabel = computed(() => {
  if (selectedAccountCode.value) {
    const acc = accounts.value.find(a => a.code === selectedAccountCode.value)
    return acc ? `${acc.name} 원장` : '계정 원장'
  }
  if (selectedAccountType.value) {
    return selectedAccountType.value === 'INCOME' ? '수입부 전체 원장' : '지출부 전체 원장'
  }
  return '총계정원장 (전체)'
})

const selectedFund = computed(() => funds.value.find(f => f.id === selectedFundId.value))

const selectAccount = (code: string) => {
  selectedAccountCode.value = code
  selectedAccountType.value = null // 계정 코드 선택 시 그룹 필터 해제
  fetchData()
}

const selectGroup = (group: any) => {
  selectedAccountType.value = group.type as 'INCOME' | 'EXPENSE'
  selectedAccountCode.value = null // 그룹 선택 시 개별 계정 필터 해제
  // 아코디언 토글 (이미 선택된 그룹을 다시 누르면 접기/펼치기만 수행)
  group.expanded = !group.expanded
  fetchData()
}

const resetAccountFilter = () => {
  selectedAccountCode.value = null
  selectedAccountType.value = null
  fetchData()
}

const { data: ledgerRes, pending, refresh } = await useFetch('/api/ledgers', {
  query: computed(() => ({
    startDate: startDate.value,
    endDate: endDate.value,
    accountCode: selectedAccountCode.value || undefined,
    type: selectedAccountType.value || undefined, // [추가] 타입 파라미터 전달
    fundId: selectedFundId.value || undefined
  })),
  immediate: false,
  watch: false
})

const transactions = computed(() => (ledgerRes.value as any)?.data || [])
const meta = computed(() => (ledgerRes.value as any)?.meta || null)

const fetchData = () => {
  if (!startDate.value || !endDate.value) return
  refresh()
}

const setPreset = (type: 'thisMonth' | 'thisYear') => {
  const now = new Date()
  let start = now, end = now
  if (type === 'thisMonth') {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  } else if (type === 'thisYear') {
    start = new Date(now.getFullYear(), 0, 1)
    end = new Date(now.getFullYear(), 11, 31)
  }
  startDate.value = start.toISOString().split('T')[0]
  endDate.value = end.toISOString().split('T')[0]
  fetchData()
}

const downloadExcel = async () => {
  const mapper = (tx: any) => ({
    '일자': tx.date_str,
    '계정': tx.account_name,
    '적요/헌금자': displayValue(tx.donor_name || tx.description),
    '수입': tx.income,
    '지출': tx.expense,
    '잔액': tx.balance
  })
  await fetchAndDownloadExcel('/api/ledgers', { 
    startDate: startDate.value, 
    endDate: endDate.value, 
    accountCode: selectedAccountCode.value || undefined,
    type: selectedAccountType.value || undefined,
    fundId: selectedFundId.value || undefined
  }, mapper, `원장_${currentViewLabel.value}`)
}

onMounted(async () => {
  await Promise.all([loadAccounts(), loadFunds()])
  buildTree()
  if (route.query.fundId) {
    selectedFundId.value = route.query.fundId as string
  }
  await refresh()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
</style>
