<template>
  <ClientOnly>
    <!-- 패딩 8을 주어 레이아웃과 조화롭게 -->
    <div class="space-y-6 relative p-8">
      
      <!-- 상단 필터 영역 (안전한 스티키 고정) -->
      <div class="sticky top-[-32px] z-30 pt-4 pb-4 bg-slate-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between mb-4">
          <div class="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg w-fit shadow-inner">
            <UButton
              v-for="t in typeTabs"
              :key="t.value"
              @click="filters.type = t.value"
              :variant="filters.type === t.value ? 'solid' : 'ghost'"
              :color="filters.type === t.value ? t.color : 'neutral'"
              class="px-6 py-1.5 font-bold transition-all duration-200"
            >
              {{ t.label }}
            </UButton>
          </div>

          <div class="flex items-center space-x-2 text-sm font-bold text-gray-500 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-sm border dark:border-gray-700">
            <UIcon name="i-heroicons-list-bullet" class="w-4 h-4 text-brand-blue" />
            <span>목록 개수</span>
            <USelectMenu v-model="pageSize" :items="pageSizeOptions" variant="none" class="w-16 font-mono font-black" size="sm" />
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <UFormField label="시작일"><UInput v-model="filters.startDate" type="date" class="w-full cursor-pointer" /></UFormField>
            <UFormField label="종료일"><UInput v-model="filters.endDate" type="date" class="w-full cursor-pointer" /></UFormField>
            <UFormField label="검색어 (적요, 성도명)">
              <UInput v-model="filters.keyword" placeholder="검색어 입력" icon="i-heroicons-magnifying-glass" class="w-full" @keyup.enter="refresh()" />
            </UFormField>
          </div>
          <div class="flex justify-between items-center mt-6">
            <div class="flex gap-2">
              <UButton icon="i-heroicons-magnifying-glass" color="primary" @click="refresh()" class="px-8 font-bold">조회하기</UButton>
              <UButton variant="ghost" color="neutral" @click="resetFilters">초기화</UButton>
            </div>
            <div class="flex gap-2 items-center">
              <UButton icon="i-heroicons-pencil-square" color="primary" @click="openModal()" class="font-bold shadow-md">새 전표 작성</UButton>
              <UButton icon="i-heroicons-table-cells" color="success" variant="outline" @click="downloadExcel" class="font-bold">엑셀</UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- 테이블 영역 (Native Scroll) -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg relative border border-gray-200 dark:border-gray-700">
        <div v-if="pending" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-40 py-20">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border-collapse">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">일자</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">구분</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">계정과목</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">금액</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">헌금자(성도)</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">적요</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="t in transactions" :key="t.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{{ formatDate(t.transaction_date) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <UBadge :color="t.account_type === 'INCOME' ? 'primary' : 'error'" variant="subtle" class="font-bold">
                    {{ t.account_type === 'INCOME' ? '수입' : '지출' }}
                  </UBadge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  <div class="flex flex-col">
                    <span>{{ t.account_name }}</span>
                    <span class="text-xs text-gray-400 font-mono">{{ t.account_code }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-black font-mono" :class="t.account_type === 'INCOME' ? 'text-brand-blue' : 'text-red-500'">
                  {{ formatNumber(t.amount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span v-if="t.member_name" class="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                    <UIcon name="i-heroicons-user" class="w-3 h-3" />
                    {{ t.member_name }}
                  </span>
                  <span v-else class="text-gray-300">-</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" :title="t.description || ''">
                  {{ displayValue(t.description) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <UButton label="삭제" color="error" variant="ghost" size="xs" @click="deleteTransaction(t)" />
                </td>
              </tr>
              <tr v-if="transactions.length === 0 && !pending">
                <td colspan="7" class="px-6 py-12 text-center text-gray-500 italic font-medium">조회된 전표 내역이 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="paginationInfo.totalPages > 1" class="flex justify-center mt-6 pb-8">
        <UPagination v-model:page="currentPage" :total="paginationInfo.totalCount" :items-per-page="parseInt(pageSize)" />
      </div>

      <!-- 새 전표 작성 모달 -->
      <UModal v-model:open="isModalOpen" title="새 전표 작성" description="수입(헌금) 또는 지출 내역을 입력합니다." :ui="{ content: 'max-w-xl' }">
        <template #content>
          <div class="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-xl space-y-6">
            <div class="flex items-center justify-between border-b dark:border-gray-800 pb-4">
              <h3 class="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <UIcon name="i-heroicons-pencil-square" class="text-brand-blue" />
                새 전표 작성
              </h3>
              <UButton type="button" color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="isModalOpen = false" />
            </div>

            <!-- 전표 유형 선택 (수입/지출) -->
            <div class="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-full">
              <UButton
                class="flex-1 justify-center py-2 font-bold"
                :variant="form.type === 'INCOME' ? 'solid' : 'ghost'"
                :color="form.type === 'INCOME' ? 'primary' : 'neutral'"
                @click="changeFormType('INCOME')"
              >
                수입 (헌금 등)
              </UButton>
              <UButton
                class="flex-1 justify-center py-2 font-bold"
                :variant="form.type === 'EXPENSE' ? 'solid' : 'ghost'"
                :color="form.type === 'EXPENSE' ? 'error' : 'neutral'"
                @click="changeFormType('EXPENSE')"
              >
                지출 (운영비 등)
              </UButton>
            </div>

            <div class="grid grid-cols-2 gap-5">
              <UFormField label="전표 일자" required>
                <UInput v-model="form.transaction_date" type="date" class="w-full cursor-pointer" />
              </UFormField>
              
              <UFormField label="계정과목" required>
                <USelectMenu 
                  v-model="form.account_code" 
                  :items="filteredAccounts" 
                  value-key="code" 
                  label-key="name"
                  class="w-full cursor-pointer"
                  placeholder="계정 선택"
                />
              </UFormField>

              <!-- 수입일 때만 노출되는 성도 검색 -->
              <div v-if="form.type === 'INCOME'" class="col-span-2 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <UFormField label="헌금자 (성도 매핑)">
                  <div class="flex space-x-2">
                    <div class="relative flex-1">
                      <UInput :model-value="form.member_name" disabled placeholder="성도를 검색하여 선택하세요" class="w-full" icon="i-heroicons-user" />
                      <UButton v-if="form.member_id" icon="i-heroicons-x-mark" color="neutral" variant="ghost" class="absolute right-1 top-1 w-6 h-6 p-0" @click="clearMember" />
                    </div>
                    <UButton label="검색" color="neutral" variant="outline" icon="i-heroicons-magnifying-glass" @click="isMemberSearchOpen = true" />
                  </div>
                  <p class="text-xs text-gray-500 mt-1">* 헌금자 매핑을 해야 기부금 영수증 발급이 가능합니다.</p>
                </UFormField>
              </div>

              <UFormField label="금액" required class="col-span-2">
                <div class="relative">
                  <input 
                    v-model="formAmountStr"
                    type="text"
                    placeholder="0"
                    class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 text-right font-black font-mono text-lg text-gray-900 dark:text-white"
                    @input="onAmountInput"
                  />
                  <span class="absolute right-4 top-2.5 text-gray-500 font-bold">원</span>
                </div>
              </UFormField>

              <UFormField label="적요" class="col-span-2">
                <UInput v-model="form.description" placeholder="상세 내역 또는 비고 입력" class="w-full" />
              </UFormField>
            </div>

            <div class="flex justify-end gap-3 pt-6 border-t dark:border-gray-800">
              <UButton label="취소" color="neutral" variant="ghost" @click="isModalOpen = false" />
              <UButton label="전표 저장하기" color="primary" class="font-black px-8 shadow-md" size="lg" :loading="isSaving" @click="saveTransaction" />
            </div>
          </div>
        </template>
      </UModal>

      <!-- 성도 검색 모달 (모달 안의 모달) -->
      <UModal v-model:open="isMemberSearchOpen" title="성도 검색" description="이름이나 전화번호로 성도를 검색합니다." :ui="{ content: 'max-w-md' }">
        <template #content>
          <div class="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-xl space-y-4 z-[60]">
            <div class="flex items-center justify-between border-b dark:border-gray-800 pb-3 mb-2">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">성도 검색</h3>
              <UButton type="button" color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="isMemberSearchOpen = false" />
            </div>
            <UInput v-model="memberSearchTerm" placeholder="성도 이름 검색" icon="i-heroicons-magnifying-glass" class="w-full" autofocus />
            <div class="max-h-[300px] overflow-y-auto border rounded-lg dark:border-gray-800 custom-scrollbar">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr v-for="m in filteredMembers" :key="m.id" class="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors" @click="selectMember(m)">
                    <td class="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">{{ m.name }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500">{{ displayValue(m.church_role_name) }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500 text-right">{{ formatPhoneNumber(m.phone_number) }}</td>
                  </tr>
                  <tr v-if="filteredMembers.length === 0">
                    <td colspan="3" class="px-4 py-8 text-center text-sm text-gray-500 italic">검색 결과가 없습니다.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>
      </UModal>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { formatNumber, formatDate, displayValue, formatPhoneNumber } from '~/utils/formatter'
import { fetchAndDownloadExcel } from '~/utils/excel'
import { useUIStore } from '~/stores/ui'

const ui = useUIStore()

const typeTabs = [
  { label: '전체', value: 'ALL', color: 'neutral' as const },
  { label: '수입 (헌금)', value: 'INCOME', color: 'primary' as const },
  { label: '지출', value: 'EXPENSE', color: 'error' as const }
]

const currentPage = ref(1)
const pageSize = ref('10')
const pageSizeOptions = ['10', '20', '50', '100']

// 1. 목록 조회 필터 및 상태
const filters = reactive({
  type: 'ALL',
  startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // 이번달 1일
  endDate: new Date().toISOString().split('T')[0], // 오늘
  keyword: ''
})

const { data: response, refresh, pending } = await useFetch('/api/transactions', {
  query: computed(() => ({
    page: currentPage.value,
    limit: pageSize.value,
    ...filters
  }))
})

const transactions = computed(() => (response.value as any)?.data || [])
const paginationInfo = computed(() => (response.value as any)?.pagination || { totalPages: 0, totalCount: 0, limit: 10 })

const resetFilters = () => {
  Object.assign(filters, {
    type: 'ALL',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    keyword: ''
  })
  refresh()
}

// 2. 모달 및 폼 제어
const isModalOpen = ref(false)
const isSaving = ref(false)
const isMemberSearchOpen = ref(false)
const memberSearchTerm = ref('')

const form = reactive({
  transaction_date: new Date().toISOString().split('T')[0],
  type: 'INCOME' as 'INCOME' | 'EXPENSE',
  account_code: null as string | null,
  amount: 0,
  description: '',
  member_id: null as string | null,
  member_name: ''
})

const formAmountStr = ref('') // 콤마 포맷팅용 String 바인딩

// 반응형 감시자들
watch([() => filters.type, pageSize], () => {
  currentPage.value = 1
})

// 성도 검색 모달이 닫힐 때 검색어 초기화 (변수 선언 이후로 이동하여 호이스팅 에러 해결)
watch(isMemberSearchOpen, (newVal) => {
  if (!newVal) {
    memberSearchTerm.value = ''
  }
})

const onAmountInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  // 숫자 이외 제거
  let raw = target.value.replace(/[^0-9]/g, '')
  if (!raw) raw = '0'
  
  // 실제 숫자 값 업데이트
  form.amount = parseInt(raw, 10)
  
  // 화면 표시용 콤마 포맷팅 업데이트
  formAmountStr.value = formatNumber(form.amount)
}

const openModal = () => {
  // 폼 초기화
  form.transaction_date = new Date().toISOString().split('T')[0]
  form.type = 'INCOME'
  form.account_code = null
  form.amount = 0
  form.description = ''
  form.member_id = null
  form.member_name = ''
  formAmountStr.value = ''
  isModalOpen.value = true
}

const changeFormType = (type: 'INCOME' | 'EXPENSE') => {
  form.type = type
  form.account_code = null // 유형 변경 시 계정 초기화
}

// 3. 계정과목 데이터 연동 (캐싱)
const { data: accountsRes } = await useFetch('/api/accounts')
const allAccounts = computed(() => (accountsRes.value as any)?.data || [])

// 현재 선택된 타입과 Level=2(입력가능 계정)만 필터링
const filteredAccounts = computed(() => {
  return allAccounts.value.filter((a: any) => a.type === form.type && a.level === 2 && a.is_active)
})

const selectedAccount = computed(() => {
  return filteredAccounts.value.find((a: any) => a.code === form.account_code)
})

// 4. 성도 검색 연동
const { data: membersRes } = await useFetch('/api/members', { query: { limit: 10000, tab: 'CURRENT' } })
const allMembers = computed(() => (membersRes.value as any)?.data || [])

const filteredMembers = computed(() => {
  if (!memberSearchTerm.value) return allMembers.value.slice(0, 30)
  return allMembers.value.filter((m: any) => 
    m.name.includes(memberSearchTerm.value) || 
    (m.phone_number && m.phone_number.includes(memberSearchTerm.value))
  )
})

const selectMember = (m: any) => {
  form.member_id = m.id
  form.member_name = m.name
  isMemberSearchOpen.value = false
}

const clearMember = () => {
  form.member_id = null
  form.member_name = ''
}

// 5. CRUD 로직
const saveTransaction = async () => {
  if (!form.transaction_date) { ui.showAlert('입력 오류', '전표 일자를 선택해주세요.', 'warning'); return }
  if (!form.account_code) { ui.showAlert('입력 오류', '계정과목을 선택해주세요.', 'warning'); return }
  if (form.amount <= 0) { ui.showAlert('입력 오류', '금액은 0보다 커야 합니다.', 'warning'); return }
  if (form.type === 'INCOME' && !form.member_id) {
    const confirmNoMember = await ui.showConfirm('확인', '헌금자를 지정하지 않고 무명으로 저장하시겠습니까?', 'info')
    if (!confirmNoMember) return
  }

  isSaving.value = true
  try {
    const payload = {
      transaction_date: form.transaction_date,
      account_code: form.account_code,
      amount: form.amount,
      description: form.description,
      member_id: form.type === 'INCOME' ? form.member_id : null // 지출이면 성도 정보 NULL
    }

    const res: any = await $fetch('/api/transactions', { method: 'POST', body: payload })
    if (res.success) {
      isModalOpen.value = false
      await refresh()
      ui.showAlert('성공', '전표가 성공적으로 등록되었습니다.', 'success')
    }
  } catch (error: any) {
    ui.showAlert('저장 오류', error.data?.statusMessage || '전표 저장 중 오류가 발생했습니다.', 'error')
  } finally {
    isSaving.value = false
  }
}

const deleteTransaction = async (t: any) => {
  const typeLabel = t.account_type === 'INCOME' ? '수입' : '지출'
  const confirmed = await ui.showConfirm('전표 삭제', `해당 ${typeLabel} 전표(${formatNumber(t.amount)}원)를 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.`, 'error', '영구 삭제')
  
  if (confirmed) {
    try {
      const res: any = await $fetch(`/api/transactions/${t.id}`, { method: 'DELETE' })
      if (res.success) {
        await refresh()
        ui.showAlert('성공', '전표가 삭제되었습니다.', 'success')
      }
    } catch (e: any) {
      ui.showAlert('오류', e.data?.statusMessage || '삭제 중 오류가 발생했습니다.', 'error')
    }
  }
}

const downloadExcel = async () => {
  const mapper = (t: any) => ({
    '일자': formatDate(t.transaction_date),
    '구분': t.account_type === 'INCOME' ? '수입' : '지출',
    '계정코드': t.account_code,
    '계정과목': t.account_name,
    '금액': t.amount,
    '성도명': displayValue(t.member_name),
    '적요': displayValue(t.description)
  })
  await fetchAndDownloadExcel('/api/transactions', filters, mapper, '전표목록')
}
</script>

<style scoped>
.sticky {
  position: sticky;
  top: -32px;
  z-index: 30;
}
</style>
