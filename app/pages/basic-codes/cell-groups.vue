<template>
  <div class="space-y-6 relative">
    <!-- 2안 적용: 상단 헤더 및 검색 필터 고정 -->
    <div class="sticky top-0 z-30 space-y-4 pb-4 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div class="flex flex-wrap items-end gap-4">
            <div class="w-[180px] flex-shrink-0">
              <UFormField label="구역명">
                <div class="relative">
                  <input 
                    v-model="filters.name" 
                    type="text"
                    placeholder="구역명 검색" 
                    class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm h-[36px]"
                    @keyup.enter="refresh()" 
                  />
                  <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </UFormField>
            </div>
            <div class="w-[160px] flex-shrink-0">
              <UFormField label="상위 소속">
                <select v-model="filters.parent" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm cursor-pointer h-[36px]">
                  <option value="all">전체 소속</option>
                  <option v-for="p in parentGroups" :key="p" :value="p">{{ p }}</option>
                </select>
              </UFormField>
            </div>
            <div class="w-[100px] flex-shrink-0">
              <UFormField label="상태">
                <select v-model="filters.isActive" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm cursor-pointer h-[36px]">
                  <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
              </UFormField>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <UButton label="조회" color="primary" icon="i-heroicons-magnifying-glass" class="px-6 font-bold" @click="refresh()" />
            <UButton label="초기화" variant="ghost" color="neutral" @click="resetFilters" />
          </div>
        </div>

        <div class="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <div class="flex items-center space-x-2 text-sm text-gray-500">
            총 <span class="font-bold text-blue-600">{{ cellGroups.length }}</span>개의 구역이 있습니다.
          </div>
          <div class="flex items-center space-x-2">
            <UButton icon="i-heroicons-plus" color="primary" label="구역 추가" class="font-bold" @click="openModal()" />
            <UButton icon="i-heroicons-table-cells" color="success" variant="outline" label="엑셀" class="font-bold" @click="downloadExcel" />
          </div>
        </div>
      </div>
    </div>

    <!-- 목록 테이블 (3안 적용: 헤더 고정) -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg relative border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div v-if="pending" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10 py-20">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-blue-600" />
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border-collapse">
          <thead class="bg-gray-50 dark:bg-gray-900 sticky top-0 z-20 shadow-sm">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-900">구역명</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-900">상위 소속</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-900">구역장(리더)</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-900">상태</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-900">생성일</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-900">관리</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr 
              v-for="group in cellGroups" 
              :key="group.id" 
              class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              :class="{ 'bg-red-50/30 dark:bg-red-900/10': !group.is_active }"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-bold" :class="{ 'text-red-600/70 dark:text-red-400/70': !group.is_active }">{{ group.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" :class="{ 'text-red-500/50': !group.is_active }">{{ displayValue(group.parent_group) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                <div class="flex items-center space-x-2" :class="{ 'opacity-60': !group.is_active }">
                  <UIcon name="i-heroicons-user" class="w-4 h-4 text-gray-400" />
                  <span>{{ displayValue(group.leader_name) }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <UBadge :color="group.is_active ? 'success' : 'error'" variant="subtle" class="font-bold">
                  {{ group.is_active ? '활성' : '비활성' }}
                </UBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(group.created_at) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                <UButton label="수정" color="primary" variant="ghost" size="xs" @click="openModal(group)" />
                <UButton v-if="!group.is_active" label="삭제" color="error" variant="ghost" size="xs" @click="deleteGroup(group)" />
              </td>
            </tr>
            <tr v-if="cellGroups.length === 0 && !pending">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500 italic font-medium">등록된 구역 정보가 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 등록/수정 모달 -->
    <UModal 
      v-model:open="isModalOpen" 
      :title="isEditing ? '구역 정보 수정' : '신규 구역 등록'"
      description="구역의 명칭과 소속, 리더 정보를 관리합니다."
      :ui="{ content: 'max-w-md' }"
    >
      <template #content>
        <div class="p-6 space-y-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl">
          <div class="flex items-center justify-between border-b dark:border-gray-800 pb-3 mb-2">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">
              {{ isEditing ? '구역 정보 수정' : '신규 구역 등록' }}
            </h3>
            <UButton type="button" color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="isModalOpen = false" />
          </div>

          <div class="space-y-4 py-2">
            <UFormField label="구역명" required>
              <UInput v-model="form.name" placeholder="예: 믿음목장" class="w-full" />
            </UFormField>
            <UFormField label="상위 소속">
              <UInput v-model="form.parent_group" placeholder="예: 1교구, 청년부 등" class="w-full" />
            </UFormField>
            <UFormField label="구역장(리더)">
              <div class="flex space-x-2">
                <UInput :model-value="displayValue(form.leader_name)" disabled class="flex-1 bg-gray-50 dark:bg-gray-800" />
                <UButton label="검색" color="neutral" variant="outline" icon="i-heroicons-magnifying-glass" @click="isMemberSearchOpen = true" />
              </div>
            </UFormField>
            <div class="flex items-center space-x-2 pt-2">
              <UCheckbox v-model="form.is_active" label="현재 활성 구역으로 사용함" />
            </div>
          </div>

          <div class="flex justify-end space-x-2 pt-6 border-t dark:border-gray-800">
            <UButton label="취소" color="neutral" variant="ghost" @click="isModalOpen = false" />
            <UButton :label="isEditing ? '수정 완료' : '등록 하기'" color="primary" class="font-bold px-6 shadow-md" @click="saveGroup" />
          </div>
        </div>
      </template>
    </UModal>

    <!-- 성도 검색 모달 -->
    <UModal 
      v-model:open="isMemberSearchOpen" 
      title="구역장(리더) 선택"
      description="구역을 담당할 성도를 검색하여 선택합니다."
      :ui="{ content: 'max-w-lg' }"
    >
      <template #content>
        <div class="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-xl space-y-4">
          <div class="flex items-center justify-between border-b dark:border-gray-800 pb-3 mb-2">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">구역장(리더) 선택</h3>
            <UButton type="button" color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="isMemberSearchOpen = false" />
          </div>

          <UInput v-model="memberSearchTerm" placeholder="성도 이름 검색" icon="i-heroicons-magnifying-glass" class="w-full" />
          
          <div class="max-h-[300px] overflow-y-auto border rounded-lg dark:border-gray-800">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                <tr v-for="m in filteredMembers" :key="m.id" class="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors" @click="selectLeader(m)">
                  <td class="px-4 py-3 text-sm font-bold">{{ m.name }}</td>
                  <td class="px-4 py-3 text-sm text-gray-500">{{ displayValue(m.church_role_name) }}</td>
                  <td class="px-4 py-3 text-sm text-gray-500 text-right">{{ formatPhoneNumber(m.phone_number) }}</td>
                </tr>
                <tr v-if="filteredMembers.length === 0">
                  <td colspan="3" class="px-4 py-8 text-center text-sm text-gray-500">검색 결과가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex justify-end pt-2">
            <UButton label="닫기" variant="ghost" color="neutral" @click="isMemberSearchOpen = false" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { formatPhoneNumber, formatDate, displayValue } from '~/utils/formatter'
import { fetchAndDownloadExcel } from '~/utils/excel'
import { useUIStore } from '~/stores/ui'

const ui = useUIStore()

// 1. 상태 및 필터
const filters = reactive({
  name: '',
  parent: 'all',
  isActive: 'all'
})

const statusOptions = [
  { label: '전체', value: 'all' },
  { label: '활성', value: 'true' },
  { label: '비활성', value: 'false' }
]

// 2. 데이터 페칭
const { data: response, refresh, pending } = await useFetch('/api/cell-groups', {
  query: computed(() => ({
    name: filters.name,
    parent: filters.parent,
    isActive: filters.isActive
  }))
})

// 모든 성도 정보 (구역장 선택용)
const { data: membersRes } = await useFetch('/api/members', { query: { limit: 10000 } })
const allMembers = computed(() => (membersRes.value as any)?.data || [])

const cellGroups = computed(() => (response.value as any)?.data || [])
const parentGroups = computed(() => (response.value as any)?.parentGroups || [])

// 3. 필터 제어
const resetFilters = () => {
  filters.name = ''
  filters.parent = 'all'
  filters.isActive = 'all'
  refresh()
}

// 4. 모달 및 폼 제어
const isModalOpen = ref(false)
const isEditing = ref(false)
const isMemberSearchOpen = ref(false)
const memberSearchTerm = ref('')

const form = reactive({
  id: '',
  name: '',
  leader_id: null as string | null,
  leader_name: '',
  parent_group: '',
  is_active: true
})

const openModal = (group?: any) => {
  if (group) {
    isEditing.value = true
    Object.assign(form, { ...group })
  } else {
    isEditing.value = false
    Object.assign(form, {
      id: '',
      name: '',
      leader_id: null,
      leader_name: '',
      parent_group: '',
      is_active: true
    })
  }
  isModalOpen.value = true
}

// 구역장 검색 및 선택
const filteredMembers = computed(() => {
  let list = allMembers.value
  
  // 수정 중인 경우 해당 구역에 속한 성도만 필터링
  if (isEditing.value && form.id) {
    list = list.filter((m: any) => m.cell_group_id === form.id)
  }

  if (!memberSearchTerm.value) return list.slice(0, 50)
  return list.filter((m: any) => 
    m.name.includes(memberSearchTerm.value) || 
    (m.phone_number && m.phone_number.includes(memberSearchTerm.value))
  )
})

const selectLeader = (member: any) => {
  form.leader_id = member.id
  form.leader_name = member.name
  isMemberSearchOpen.value = false
}

// 5. CRUD 로직
const saveGroup = async () => {
  if (!form.name) {
    ui.showAlert('입력 오류', '구역명은 필수 입력 항목입니다.', 'warning')
    return
  }

  try {
    const url = isEditing.value ? `/api/cell-groups/${form.id}` : '/api/cell-groups'
    const method = isEditing.value ? 'PATCH' : 'POST'
    
    const res: any = await $fetch(url, { method, body: form })
    if (res.success) {
      isModalOpen.value = false
      await refresh()
      ui.showAlert('성공', '구역 정보가 저장되었습니다.', 'success')
    }
  } catch (error: any) {
    ui.showAlert('저장 오류', error.data?.statusMessage || '정보 저장 중 오류가 발생했습니다.', 'error')
  }
}

const deleteGroup = async (group: any) => {
  const confirmed = await ui.showConfirm('구역 삭제', `[${group.name}] 구역을 정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`, 'error', '영구 삭제')
  if (confirmed) {
    try {
      const res: any = await $fetch(`/api/cell-groups/${group.id}`, { method: 'DELETE' })
      if (res.success) {
        await refresh()
        ui.showAlert('완료', '삭제되었습니다.', 'success')
      }
    } catch (error: any) {
      ui.showAlert('삭제 오류', error.data?.statusMessage || '구역 삭제 중 오류가 발생했습니다.', 'error')
    }
  }
}

// 6. 엑셀 다운로드 (공통 함수 활용)
const downloadExcel = async () => {
  const mapper = (g: any) => ({
    '구역명': g.name,
    '상위 소속': displayValue(g.parent_group),
    '구역장': displayValue(g.leader_name),
    '상태': g.is_active ? '활성' : '비활성',
    '생성일': formatDate(g.created_at)
  })

  await fetchAndDownloadExcel(
    '/api/cell-groups',
    { name: filters.name, parent: filters.parent, isActive: filters.isActive },
    mapper,
    '구역목록'
  )
}
</script>
