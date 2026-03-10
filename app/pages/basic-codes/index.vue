<template>
  <div class="space-y-6">
    <!-- 서브 탭 및 필터 영역 -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="flex items-center space-x-4">
        <!-- 수입/지출 탭 -->
        <div class="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg w-fit space-x-1">
          <UButton 
            @click="changeType('INCOME')" 
            :variant="typeTab === 'INCOME' ? 'solid' : 'ghost'" 
            color="primary" 
            label="수입" 
            class="px-6 py-1.5 font-bold cursor-pointer" 
          />
          <UButton 
            @click="changeType('EXPENSE')" 
            :variant="typeTab === 'EXPENSE' ? 'solid' : 'ghost'" 
            color="error" 
            label="지출" 
            class="px-6 py-1.5 font-bold cursor-pointer" 
          />
        </div>

        <!-- 사용 여부 필터 -->
        <div class="flex items-center space-x-4 text-sm border-l pl-4 dark:border-gray-700">
          <label class="flex items-center space-x-2 cursor-pointer group">
            <input type="radio" v-model="activeFilter" value="ACTIVE" class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer" />
            <span class="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">사용중</span>
          </label>
          <label class="flex items-center space-x-2 cursor-pointer group">
            <input type="radio" v-model="activeFilter" value="ALL" class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer" />
            <span class="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">모두 보기</span>
          </label>
        </div>
      </div>

      <!-- 일괄 처리 버튼 (조건부 노출) -->
      <div v-if="selectedCodes.length >= 2" class="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800 animate-in fade-in slide-in-from-top-1">
        <span class="text-sm font-bold text-blue-700 dark:text-blue-300 mr-2">{{ selectedCodes.length }}개 선택됨:</span>
        
        <!-- 모두 사용중인 경우: 일괄 사용안함 노출 -->
        <UButton v-if="isAllActiveSelected" size="xs" color="error" variant="subtle" label="일괄 사용안함" @click="bulkToggle(false)" class="cursor-pointer font-bold" />
        
        <!-- 모두 미사용인 경우: 일괄 사용 / 일괄 영구삭제 노출 -->
        <template v-if="isAllInactiveSelected">
          <UButton size="xs" color="primary" variant="subtle" label="일괄 사용" @click="bulkToggle(true)" class="cursor-pointer font-bold" />
          <UButton size="xs" color="error" variant="solid" label="일괄 영구삭제" @click="bulkDelete()" class="cursor-pointer font-bold" />
        </template>

        <!-- 섞여있는 경우 안내 -->
        <span v-if="!isAllActiveSelected && !isAllInactiveSelected" class="text-xs text-gray-500 italic">상태가 같은 항목들끼리만 일괄 처리가 가능합니다.</span>
      </div>

      <!-- 기본 액션 버튼 -->
      <div v-else class="flex space-x-2">
        <UButton icon="i-heroicons-plus" color="primary" @click="openModal()" label="추가" class="font-bold cursor-pointer" />
      </div>
    </div>

    <!-- 테이블 영역 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900/50 text-xs font-bold text-gray-500 uppercase">
          <tr>
            <th scope="col" class="px-4 py-3 w-10 text-center">
              <input type="checkbox" :checked="isAllSelected" @change="toggleAll" class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" />
            </th>
            <th scope="col" class="px-6 py-3 text-left w-32">계정코드</th>
            <th scope="col" class="px-6 py-3 text-left">계정명</th>
            <th scope="col" class="px-6 py-3 text-center w-24">상태</th>
            <th scope="col" class="px-6 py-3 text-left">관리</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="item in filteredItems" :key="item.code" 
              class="transition-colors"
              :class="[
                selectedCodes.includes(item.code) ? 'bg-blue-50 dark:bg-blue-900/30' : 
                item.level === 0 ? 'bg-blue-50/40 dark:bg-blue-900/20 hover:bg-blue-50/60 dark:hover:bg-blue-900/30' : 
                'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              ]">
            <td class="px-4 py-4 text-center">
              <input 
                type="checkbox" 
                :checked="selectedCodes.includes(item.code)" 
                @change="handleCheckboxChange(item, $event)" 
                class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" 
              />
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{{ item.code }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
              <div :style="{ paddingLeft: (item.level * 24) + 'px' }" class="flex items-center">
                <UIcon :name="item.hasChildren ? 'i-heroicons-folder' : 'i-heroicons-document-text'" class="w-4 h-4 mr-2" :class="[item.hasChildren ? 'text-yellow-500' : 'text-gray-400', item.level === 0 ? 'w-5 h-5' : '']" />
                <span :class="{'font-bold': item.level === 0}">{{ item.name }}</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span :class="item.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'" class="px-2.5 py-0.5 rounded-full text-xs font-bold">
                {{ item.is_active ? '사용' : '미사용' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
              <UButton size="xs" :color="item.is_active ? 'error' : 'primary'" variant="ghost" @click="toggleStatus(item)" :label="item.is_active ? '사용안함' : '사용'" class="font-bold cursor-pointer" />
              <UButton v-if="item.level === 0" size="xs" color="info" variant="ghost" @click="openModal(item)" label="하위항목추가" class="font-bold cursor-pointer" />
              <UButton v-if="!item.is_active" size="xs" color="error" variant="subtle" @click="openDeleteConfirm(item)" label="영구삭제" class="font-bold cursor-pointer" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 삭제 확인 모달 -->
    <UModal v-model:open="isDeleteModalOpen" :ui="{ content: 'max-w-md' }">
      <template #content>
        <div class="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-xl">
          <div class="flex items-center space-x-3 text-error-600 mb-4">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-red-500" />
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ isBulkDelete ? '일괄 영구 삭제' : '계정 영구 삭제' }}</h3>
          </div>
          <div class="py-2 space-y-3">
            <p class="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">삭제하시면 복구할 수 없습니다.<br/>정말 삭제하시겠습니까?</p>
            <div v-if="isBulkDelete" class="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-100 dark:border-red-800 text-sm">
              <p class="text-red-800 dark:text-red-400 font-bold">선택된 {{ selectedCodes.length }}개의 항목이 모두 삭제됩니다.</p>
            </div>
            <div v-else-if="accountToDelete" class="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-100 dark:border-red-800 text-sm">
              <p class="text-red-800 dark:text-red-400 font-bold">삭제 대상: [{{ accountToDelete.code }}] {{ accountToDelete.name }}</p>
            </div>
          </div>
          <div class="flex justify-end space-x-3 pt-6 mt-4 border-t dark:border-gray-700">
            <UButton color="neutral" variant="ghost" @click="isDeleteModalOpen = false" label="취소" class="cursor-pointer" />
            <UButton color="error" :loading="isDeleting" @click="confirmDelete" label="영구 삭제" class="font-bold cursor-pointer shadow-sm" />
          </div>
        </div>
      </template>
    </UModal>

    <!-- 등록 모달 -->
    <UModal v-model:open="isModalOpen" :ui="{ content: 'max-w-xl' }">
      <template #content>
        <form @submit.prevent="saveAccount" class="p-6 space-y-4 min-w-[500px] bg-white dark:bg-gray-900 rounded-lg shadow-xl">
          <div class="flex items-center justify-between border-b dark:border-gray-800 pb-3 mb-2">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">계정과목 등록/수정</h3>
            <UButton type="button" color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="isModalOpen = false" class="cursor-pointer" />
          </div>
          <div class="space-y-4">
            <UFormField label="구분">
              <UInput :model-value="form.type === 'INCOME' ? '수입' : '지출'" disabled class="w-full bg-gray-50 dark:bg-gray-800/50" />
            </UFormField>
            <UFormField label="상위 계정">
              <UInput :model-value="form.parent_code ? `[${form.parent_code}] ${form.parent_name}` : form.parent_name" disabled class="w-full bg-gray-50 dark:bg-gray-800/50" />
            </UFormField>
            <UFormField label="계정코드" required><UInput id="account-code" v-model="form.code" placeholder="예: 1100" class="w-full" /></UFormField>
            <UFormField label="계정명" required><UInput id="account-name" v-model="form.name" placeholder="예: 십일조헌금" class="w-full" /></UFormField>
          </div>
          <div class="flex justify-end space-x-2 pt-4 border-t dark:border-gray-800">
            <UButton type="button" color="neutral" variant="ghost" @click="isModalOpen = false" label="취소" class="cursor-pointer" />
            <UButton id="save-button" type="submit" color="primary" :loading="isSaving" label="저장" class="font-bold cursor-pointer shadow-md" />
          </div>
        </form>
      </template>
    </UModal>

    <!-- 일반 알림 모달 (가장 마지막에 배치하여 최상단 노출 보장) -->
    <UModal v-model:open="isAlertModalOpen" :ui="{ content: 'max-w-sm' }">
      <template #content>
        <div class="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-2xl text-center">
          <UIcon name="i-heroicons-information-circle" class="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 class="text-lg font-bold mb-2">{{ alertConfig.title }}</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6 whitespace-pre-line">{{ alertConfig.message }}</p>
          <UButton color="neutral" @click="isAlertModalOpen = false" label="확인" class="w-full cursor-pointer font-bold" />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'

const { data: accounts, refresh, pending } = await useFetch('/api/accounts', {
  transform: (res: any) => res.data || []
})

// 필터 및 선택 상태
const typeTab = ref<'INCOME' | 'EXPENSE'>('INCOME')
const activeFilter = ref<'ACTIVE' | 'ALL'>('ACTIVE')
const selectedCodes = ref<string[]>([])

// 모달 상태
const isModalOpen = ref(false)
const isSaving = ref(false)
const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)
const isBulkDelete = ref(false)
const isAlertModalOpen = ref(false)
const alertConfig = reactive({ title: '', message: '' })
const accountToDelete = ref<any>(null)

// 폼 데이터
const form = reactive({ 
  type: 'INCOME' as 'INCOME' | 'EXPENSE', 
  code: '', 
  name: '', 
  parent_code: null as string | null, 
  parent_name: '',
  level: 1, 
  is_active: true 
})

const filteredItems = computed(() => {
  if (!accounts.value || !Array.isArray(accounts.value)) return []
  
  const filtered = accounts.value.filter((acc: any) => (acc.type === typeTab.value) && (activeFilter.value === 'ALL' || acc.is_active))
  
  return filtered
    .map((acc: any) => ({ 
      ...acc, 
      level: acc.level - 1, 
      hasChildren: (accounts.value as any[]).some((child: any) => child.parent_code === acc.code) || false 
    }))
    .sort((a: any, b: any) => {
      // 1. 하이픈으로 구분된 각 세그먼트 비교
      const partsA = a.code.split('-')
      const partsB = b.code.split('-')
      
      const maxLen = Math.max(partsA.length, partsB.length)
      
      for (let i = 0; i < maxLen; i++) {
        const segA = partsA[i]
        const segB = partsB[i]
        
        // 한쪽이 세그먼트가 없는 경우 (부모 vs 자식 관계)
        if (segA === undefined) return -1 // A가 부모이므로 위로
        if (segB === undefined) return 1  // B가 부모이므로 위로
        
        // 세그먼트 간 자연 정렬 비교 (문자+숫자 대응)
        if (segA !== segB) {
          return segA.localeCompare(segB, undefined, { numeric: true, sensitivity: 'base' })
        }
      }
      return 0
    })
})

// 일괄 버튼 노출 조건
const isAllActiveSelected = computed(() => {
  if (selectedCodes.value.length === 0 || !accounts.value) return false
  return selectedCodes.value.every(code => (accounts.value as any[]).find((a: any) => a.code === code)?.is_active)
})

const isAllInactiveSelected = computed(() => {
  if (selectedCodes.value.length === 0 || !accounts.value) return false
  return selectedCodes.value.every(code => !(accounts.value as any[]).find((a: any) => a.code === code)?.is_active)
})

// 레벨 체크 로직이 포함된 체크박스 핸들러
const handleCheckboxChange = (item: any, event: any) => {
  const isChecked = event.target.checked
  const index = selectedCodes.value.indexOf(item.code)
  
  if (!isChecked) {
    // 체크 해제 시
    if (index > -1) selectedCodes.value.splice(index, 1)
  } else {
    // 체크 시 레벨 검사
    if (selectedCodes.value.length > 0 && accounts.value) {
      const firstItem = (accounts.value as any[]).find((a: any) => a.code === selectedCodes.value[0])
      if (firstItem && firstItem.level !== (item.level + 1)) {
        // 레벨이 다르면 즉시 UI 원복 및 경고 모달
        event.target.checked = false
        alertConfig.title = '선택 제한'
        alertConfig.message = '같은 단계의 항목들만 선택이 가능합니다.'
        isAlertModalOpen.value = true
        return
      }
    }
    selectedCodes.value.push(item.code)
  }
}

// 전체 선택 관리 (Level 1 항목들만 대상으로 함)
const isAllSelected = computed(() => {
  const level1Items = filteredItems.value.filter(item => item.level === 0)
  return level1Items.length > 0 && level1Items.every(item => selectedCodes.value.includes(item.code))
})

const toggleAll = () => {
  const level1Items = filteredItems.value.filter(item => item.level === 0)
  if (isAllSelected.value) {
    selectedCodes.value = []
  } else {
    selectedCodes.value = level1Items.map(item => item.code)
  }
}

const changeType = (newType: 'INCOME' | 'EXPENSE') => { typeTab.value = newType; selectedCodes.value = [] }

// 공통 로직
const refreshData = async () => { await refresh(); selectedCodes.value = [] }

const openModal = (parent?: any) => {
  form.type = typeTab.value; form.name = ''; form.is_active = true
  if (parent) { 
    form.parent_code = parent.code; 
    form.parent_name = parent.name;
    form.level = parent.level + 2 
    
    // 다음 사용 가능한 코드 자동 계산 (부모코드 + 다음 번호)
    const children = (accounts.value as any[]).filter(a => a.parent_code === parent.code)
    if (children.length > 0) {
      // 마지막 파트에서 숫자만 추출
      const lastNums = children.map(c => {
        const lastPart = c.code.split('-').pop() || '0'
        const matched = lastPart.match(/\d+/)
        return matched ? parseInt(matched[0], 10) : 0
      })
      const maxNum = Math.max(...lastNums, 0)
      form.code = `${parent.code}-${(maxNum + 1).toString().padStart(2, '0')}`
    } else {
      form.code = `${parent.code}-01`
    }
  }
  else { 
    form.parent_code = null; 
    form.parent_name = '없음 (최상위 항목)';
    form.level = 1 
    
    // 최상위 항목의 경우 기존 항목들 중 최대값 + 100
    const roots = (accounts.value as any[]).filter(a => !a.parent_code && a.type === typeTab.value)
    if (roots.length > 0) {
      const maxCode = Math.max(...roots.map(r => parseInt(r.code, 10) || 0))
      form.code = (Math.floor(maxCode / 100) * 100 + 100).toString()
    } else {
      form.code = typeTab.value === 'INCOME' ? '1000' : '5000'
    }
  }
  isModalOpen.value = true
}

const saveAccount = async () => {
  if (!form.code || !form.name) { 
    alertConfig.title = '입력 오류'
    alertConfig.message = '계정코드와 계정명을 입력해주세요.'
    isAlertModalOpen.value = true
    return 
  }
  isSaving.value = true
  
  // 에러 메시지 변환 함수
  const getFriendlyErrorMessage = (rawError: string) => {
    if (rawError.includes('duplicate key') || rawError.includes('accounts_pkey')) {
      return '이미 등록된 계정코드입니다.\n다른 코드를 사용하거나 기존 항목을 확인해 주세요.'
    }
    return rawError || '알 수 없는 오류가 발생했습니다.'
  }

  try {
    const res = await $fetch('/api/accounts', { method: 'POST', body: { ...form, level: Number(form.level) } })
    if ((res as any).success) { 
      isModalOpen.value = false
      await refreshData() 
    } else { 
      alertConfig.title = '저장 실패'
      alertConfig.message = getFriendlyErrorMessage((res as any).error)
      isAlertModalOpen.value = true
    }
  } catch (error: any) { 
    const errorMsg = error.data?.statusMessage || error.data?.message || error.message || ''
    alertConfig.title = '오류 발생'
    alertConfig.message = getFriendlyErrorMessage(errorMsg)
    isAlertModalOpen.value = true
  } finally { 
    isSaving.value = false 
  }
}

const toggleStatus = async (item: any) => {
  try {
    await $fetch('/api/accounts/toggle', { method: 'PUT', body: { code: item.code, is_active: !item.is_active } })
    await refreshData()
  } catch (error) { alert('상태 변경 실패') }
}

const bulkToggle = async (status: boolean) => {
  try {
    await $fetch('/api/accounts/toggle', { method: 'PUT', body: { codes: selectedCodes.value, is_active: status } })
    await refreshData()
  } catch (error) { alert('일괄 변경 실패') }
}

const openDeleteConfirm = (item: any) => { isBulkDelete.value = false; accountToDelete.value = item; isDeleteModalOpen.value = true }
const bulkDelete = () => { isBulkDelete.value = true; isDeleteModalOpen.value = true }

const confirmDelete = async () => {
  isDeleting.value = true
  try {
    const body = isBulkDelete.value ? { codes: selectedCodes.value } : { code: accountToDelete.value.code }
    const res = await $fetch('/api/accounts', { method: 'DELETE', body })
    if ((res as any).success) { isDeleteModalOpen.value = false; await refreshData() }
  } catch (error: any) { alert('삭제 실패: ' + (error.data?.message || error.message)) } finally { isDeleting.value = false; accountToDelete.value = null }
}
</script>