<template>
  <ClientOnly>
    <div class="space-y-6 relative">
      <!-- 상단 고정 영역: 필터 및 액션 버튼 -->
      <div class="sticky top-[-32px] z-30 pt-8 pb-4 bg-slate-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between">
          <div class="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg w-fit shadow-inner">
            <UButton
              v-for="status in statusTabs"
              :key="status.value"
              @click="activeStatus = status.value"
              :variant="activeStatus === status.value ? 'solid' : 'ghost'"
              :color="activeStatus === status.value ? (status.value === 'active' ? 'primary' : 'neutral') : 'neutral'"
              class="cursor-pointer px-6 py-1.5 font-bold transition-all duration-200"
            >
              {{ status.label }} ({{ status.value === 'active' ? activeFunds.length : inactiveFunds.length }})
            </UButton>
          </div>

          <div class="flex gap-2 items-center">
            <UButton icon="i-heroicons-plus-circle" color="primary" @click="() => openModal()" class="cursor-pointer font-bold px-6 shadow-md text-sm">
              자금/통장 추가
            </UButton>
            <UButton icon="i-heroicons-arrow-path" color="neutral" variant="ghost" :loading="pending" @click="refresh" class="cursor-pointer" />
          </div>
        </div>
      </div>

      <!-- 고도화된 요약 대시보드 -->
      <div v-if="activeStatus === 'active'" class="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div class="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
            <UIcon name="i-heroicons-banknotes" class="w-6 h-6 text-brand-blue" />
          </div>
          <div>
            <p class="text-[11px] text-gray-500 font-black uppercase tracking-widest mb-1">활성 자산 총액</p>
            <p class="text-2xl font-black font-mono text-gray-900 dark:text-white leading-none">
              {{ formatNumber(totalCurrentBalance) }}<span class="text-xs ml-1 font-bold text-gray-400">원</span>
            </p>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div class="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl">
            <UIcon name="i-heroicons-home" class="w-6 h-6 text-brand-green" />
          </div>
          <div>
            <p class="text-[11px] text-gray-500 font-black uppercase tracking-widest mb-1">현금 보유고</p>
            <p class="text-xl font-black font-mono text-brand-blue leading-none">
              {{ formatNumber(cashBalance) }}<span class="text-xs ml-1 font-bold">원</span>
            </p>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div class="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
            <UIcon name="i-heroicons-building-library" class="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p class="text-[11px] text-gray-500 font-black uppercase tracking-widest mb-1">예금/통장 총액</p>
            <p class="text-xl font-black font-mono text-purple-600 leading-none">
              {{ formatNumber(bankBalance) }}<span class="text-xs ml-1 font-bold">원</span>
            </p>
          </div>
        </div>
      </div>

      <!-- 자금/통장 목록 테이블 (고도화 UI) -->
      <div class="bg-white dark:bg-gray-800 shadow-xl rounded-2xl relative border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div v-if="pending" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-40 py-20">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
        </div>
        
        <div class="overflow-x-auto">
          <UTable :data="filteredFunds" :columns="columns" class="w-full sticky-header-table">
            <!-- 자금명 및 아이콘 커스텀 -->
            <template #name-cell="{ row }">
              <div class="flex items-center gap-3 py-1">
                <div :class="getFundIconBg(row.original)" class="p-2 rounded-lg shrink-0">
                  <UIcon :name="getFundIcon(row.original)" class="w-4 h-4 text-white" />
                </div>
                <div>
                  <div class="font-black text-gray-900 dark:text-white text-sm">{{ row.original.name }}</div>
                  <div class="text-[10px] text-gray-400 font-medium">{{ row.original.book_type }}</div>
                </div>
              </div>
            </template>

            <template #category-cell="{ row }">
              <UBadge variant="subtle" :color="getCategoryColor(row.original.category)" class="font-bold px-2 py-0.5">
                {{ row.original.category || '미분류' }}
              </UBadge>
            </template>
            
            <template #current_balance-cell="{ row }">
              <div class="text-left">
                <div class="font-mono font-black text-sm text-gray-900 dark:text-white">
                  {{ formatNumber(row.original.current_balance) }}
                </div>
                <div class="text-[9px] text-gray-400">초기: {{ formatNumber(row.original.initial_balance) }}</div>
              </div>
            </template>

            <template #account_number-cell="{ row }">
              <div class="font-mono text-xs text-gray-500">
                <div v-if="row.original.bank_name" class="font-bold text-[10px] text-gray-400 mb-0.5">{{ row.original.bank_name }}</div>
                {{ row.original.account_number || '-' }}
              </div>
            </template>

            <template #is_active-cell="{ row }">
              <div class="flex items-center gap-1.5">
                <span :class="row.original.is_active ? 'bg-green-500' : 'bg-gray-300'" class="w-2 h-2 rounded-full"></span>
                <span class="text-xs font-bold" :class="row.original.is_active ? 'text-green-600' : 'text-gray-400'">
                  {{ row.original.is_active ? '사용중' : '미사용' }}
                </span>
              </div>
            </template>

            <template #actions-cell="{ row }">
              <div class="flex gap-1 justify-start">
                <UTooltip text="상세 장부 보기">
                  <UButton class="cursor-pointer" variant="ghost" color="neutral" icon="i-heroicons-list-bullet" size="xs" @click="goToLedger(row.original)" />
                </UTooltip>
                <UButton class="cursor-pointer" variant="ghost" color="primary" size="xs" @click="() => openModal(row.original)">수정</UButton>
                
                <template v-if="activeStatus === 'active'">
                  <UButton class="cursor-pointer" variant="ghost" color="warning" size="xs" @click="() => toggleStatus(row.original)">비활성화</UButton>
                </template>
                <template v-else>
                  <UButton class="cursor-pointer" variant="ghost" color="success" size="xs" @click="() => toggleStatus(row.original)">활성화</UButton>
                  <UButton class="cursor-pointer" variant="ghost" color="error" size="xs" @click="() => deleteFund(row.original)">영구삭제</UButton>
                </template>
              </div>
            </template>
          </UTable>
        </div>
        
        <div v-if="filteredFunds.length === 0 && !pending" class="py-24 text-center bg-gray-50/50 dark:bg-gray-900/20">
          <UIcon name="i-heroicons-inbox" class="w-12 h-12 text-gray-200 dark:text-gray-700 mb-3 mx-auto" />
          <p class="text-sm text-gray-400 font-bold italic">해당 조건의 자금 데이터가 없습니다.</p>
        </div>
      </div>

      <!-- 등록/수정 모달 -->
      <UModal 
        v-model:open="isModalOpen" 
        :title="isEditing ? '자금 정보 수정' : '신규 자금 등록'" 
        description="통장이나 현금 등의 기초 정보를 입력하고 관리합니다."
        :ui="{ content: 'max-w-md' }"
      >
        <template #content>
          <div class="p-6 space-y-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl">
            <div class="flex items-center justify-between border-b dark:border-gray-800 pb-3 mb-2">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <UIcon name="i-heroicons-banknotes" class="text-brand-blue" />
                자금 정보 {{ isEditing ? '수정' : '등록' }}
              </h3>
              <UButton class="cursor-pointer" type="button" color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="isModalOpen = false" />
            </div>

            <div class="space-y-4 py-2 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
              <UFormField label="자금명 (별칭)" required help="예: 일반회계통장, 교육부현금">
                <UInput v-model="form.name" placeholder="명칭 입력" class="w-full font-bold" />
              </UFormField>

              <div class="grid grid-cols-2 gap-4">
                <UFormField label="은행명" help="현금인 경우 '현금' 입력">
                  <UInput v-model="form.bank_name" placeholder="예: 우리은행" class="w-full" />
                </UFormField>
                <UFormField label="계좌분류" help="예: 보통예금, 적금, 현금">
                  <UInput v-model="form.category" placeholder="분류 입력" class="w-full" />
                </UFormField>
              </div>

              <UFormField label="계좌번호" help="하이픈(-) 포함 가능">
                <UInput v-model="form.account_number" placeholder="계좌번호 입력" class="w-full font-mono text-sm" />
              </UFormField>

              <UFormField label="기초 이월금" required help="시스템 도입 시점의 통장 잔액">
                <div class="relative">
                  <input 
                    v-model="initialBalanceStr"
                    type="text"
                    placeholder="0"
                    class="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 text-right font-black font-mono text-xl text-gray-900 dark:text-white"
                    @input="onBalanceInput"
                  />
                  <span class="absolute right-4 top-3 text-gray-500 font-bold">원</span>
                </div>
              </UFormField>

              <div class="grid grid-cols-2 gap-4 pt-2">
                <UFormField label="장부 구분">
                  <UInput v-model="form.book_type" placeholder="재정부" class="w-full" />
                </UFormField>
                <UFormField label="사용 상태">
                  <div class="mt-2">
                    <UCheckbox v-model="form.is_active" label="현재 사용함" />
                  </div>
                </UFormField>
              </div>

              <UFormField label="설명/비고">
                <UTextarea v-model="form.description" placeholder="관리 목적이나 특징을 기록하세요." class="w-full text-sm" />
              </UFormField>
            </div>

            <div class="flex justify-end gap-2 mt-6 pt-4 border-t dark:border-gray-800">
              <UButton class="cursor-pointer px-6" variant="ghost" color="neutral" @click="isModalOpen = false">취소</UButton>
              <UButton class="cursor-pointer px-10 font-black" color="primary" :loading="isSaving" @click="saveFund">정보 저장 완료</UButton>
            </div>
          </div>
        </template>
      </UModal>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { formatNumber, displayValue } from '~/utils/formatter'
import { useUIStore } from '~/stores/ui'

const ui = useUIStore()
const router = useRouter()

const statusTabs = [
  { label: '사용중인 자금', value: 'active' },
  { label: '미사용 자금', value: 'inactive' }
]
const activeStatus = ref('active')

// 1. API 연동
const { data: fundsRes, refresh, pending } = await useFetch('/api/funds')
const allFunds = computed(() => (fundsRes.value as any)?.data || [])

const activeFunds = computed(() => allFunds.value.filter((f: any) => f.is_active))
const inactiveFunds = computed(() => allFunds.value.filter((f: any) => !f.is_active))

const filteredFunds = computed(() => {
  return activeStatus.value === 'active' ? activeFunds.value : inactiveFunds.value
})

// 통계 계산
const totalCurrentBalance = computed(() => {
  return activeFunds.value.reduce((acc: number, curr: any) => acc + Number(curr.current_balance || 0), 0)
})

const cashBalance = computed(() => {
  return activeFunds.value
    .filter((f: any) => f.name.includes('현금') || f.category?.includes('현금'))
    .reduce((acc: number, curr: any) => acc + Number(curr.current_balance || 0), 0)
})

const bankBalance = computed(() => totalCurrentBalance.value - cashBalance.value)

// 2. 테이블 정의
const columns = [
  { accessorKey: 'name', header: '자금/통장명' },
  { accessorKey: 'category', header: '분류' },
  { accessorKey: 'account_number', header: '계좌번호' },
  { accessorKey: 'current_balance', header: '현재 잔액' },
  { accessorKey: 'is_active', header: '상태' },
  { accessorKey: 'actions', header: '관리' }
]

// 3. 폼 및 모달 제어
const isModalOpen = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const initialBalanceStr = ref('')

const form = reactive({
  id: null,
  name: '',
  bank_name: '',
  account_number: '',
  category: '',
  book_type: '재정부',
  initial_balance: 0,
  description: '',
  is_active: true
})

const onBalanceInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  let raw = target.value.replace(/[^0-9]/g, '')
  if (!raw) raw = '0'
  form.initial_balance = parseInt(raw, 10)
  initialBalanceStr.value = formatNumber(form.initial_balance)
}

const openModal = (fund?: any) => {
  isEditing.value = !!fund
  if (fund) {
    Object.assign(form, fund)
    initialBalanceStr.value = formatNumber(fund.initial_balance)
  } else {
    Object.assign(form, {
      id: null, name: '', bank_name: '', account_number: '', category: '', 
      book_type: '재정부', initial_balance: 0, description: '', is_active: true
    })
    initialBalanceStr.value = ''
  }
  isModalOpen.value = true
}

// 4. 기능 로직
const goToLedger = (fund: any) => {
  // TODO: 장부 화면으로 이동하면서 해당 fund_id 필터링 전달 로직
  router.push(`/ledgers?fundId=${fund.id}`)
}

const saveFund = async () => {
  if (!form.name) { ui.showAlert('입력 오류', '자금명은 필수입니다.', 'warning'); return }
  
  isSaving.value = true
  const method = isEditing.value ? 'PATCH' : 'POST'
  const url = isEditing.value ? `/api/funds/${form.id}` : '/api/funds'
  
  try {
    const res: any = await $fetch(url, { method, body: form })
    if (res.success) {
      isModalOpen.value = false
      refresh()
      ui.showAlert('성공', '자금 정보가 저장되었습니다.', 'success')
    }
  } catch (e: any) {
    ui.showAlert('오류', e.data?.statusMessage || '처리 중 오류 발생', 'error')
  } finally {
    isSaving.value = false
  }
}

const toggleStatus = async (fund: any) => {
  const action = fund.is_active ? '비활성화' : '활성화'
  const confirmed = await ui.showConfirm('상태 변경', `${fund.name}을(를) ${action} 하시겠습니까?`, 'info')
  if (confirmed) {
    try {
      await $fetch(`/api/funds/${fund.id}`, { method: 'PATCH', body: { ...fund, is_active: !fund.is_active } })
      refresh()
      ui.showAlert('성공', '상태가 변경되었습니다.', 'success')
    } catch (e: any) { ui.showAlert('오류', '변경 실패', 'error') }
  }
}

const deleteFund = async (fund: any) => {
  const confirmed = await ui.showConfirm('영구 삭제', `${fund.name} 정보를 영구 삭제하시겠습니까?\n관련된 전표 데이터가 있는 경우 삭제되지 않습니다.`, 'error')
  if (confirmed) {
    try {
      await $fetch(`/api/funds/${fund.id}`, { method: 'DELETE' })
      refresh()
      ui.showAlert('성공', '삭제되었습니다.', 'success')
    } catch (e: any) { ui.showAlert('오류', e.data?.statusMessage || '삭제 실패', 'error') }
  }
}

// UI 헬퍼
const getFundIcon = (f: any) => {
  if (f.name.includes('현금') || f.category?.includes('현금')) return 'i-heroicons-banknotes'
  if (f.category?.includes('적금') || f.category?.includes('예금')) return 'i-heroicons-building-library'
  return 'i-heroicons-credit-card'
}

const getFundIconBg = (f: any) => {
  if (f.name.includes('현금') || f.category?.includes('현금')) return 'bg-green-500'
  if (f.category?.includes('적금') || f.category?.includes('예금')) return 'bg-blue-500'
  return 'bg-purple-500'
}

const getCategoryColor = (cat: string) => {
  if (!cat) return 'neutral'
  if (cat.includes('현금')) return 'success'
  if (cat.includes('예금')) return 'primary'
  if (cat.includes('적금')) return 'info'
  return 'warning'
}

onMounted(() => { refresh() })
</script>

<style scoped>
.sticky-header-table :deep(thead) {
  position: sticky; top: 0; z-index: 20; background-color: var(--ui-bg);
}
.dark .sticky-header-table :deep(thead) { background-color: #1e293b; }
</style>
