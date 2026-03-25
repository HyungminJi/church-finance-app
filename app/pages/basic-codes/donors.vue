<template>
  <ClientOnly>
    <div class="space-y-6 relative">
      <!-- 상단 고정 영역: 탭 및 필터 (Stacked Sticky 1) -->
      <div class="sticky top-[-32px] z-30 pt-8 pb-4 bg-slate-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg w-fit shadow-inner">
              <UButton
                v-for="t in donorTabs"
                :key="t.id"
                @click="activeDonorTab = t.id"
                :variant="activeDonorTab === t.id ? 'solid' : 'ghost'"
                :color="activeDonorTab === t.id ? 'primary' : 'neutral'"
                class="cursor-pointer px-6 py-1.5 font-bold transition-all duration-200"
              >
                {{ t.label }}
              </UButton>
            </div>

            <div class="flex gap-2 items-center">
              <UButton icon="i-heroicons-plus-circle" color="primary" @click="() => openModal()" class="cursor-pointer font-bold px-6 shadow-md">
                {{ activeDonorTab === 'MEMBER' ? '성도 추가' : activeDonorTab === 'CELL_GROUP' ? '구역/조직 추가' : '외부기관 추가' }}
              </UButton>
              <UButton icon="i-heroicons-table-cells" color="success" variant="outline" @click="downloadExcel" class="cursor-pointer font-bold">엑셀</UButton>
            </div>
          </div>

          <!-- 검색 필터 (타입별 상이할 수 있으나 공통 필드 우선) -->
          <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <UFormField label="이름">
                <UInput v-model="keyword" :placeholder="activeDonorTab === 'ORGANIZATION' ? '기관/단체명 입력' : '이름 입력'" icon="i-heroicons-magnifying-glass" class="w-full" @keyup.enter="refresh" />
              </UFormField>
              <!-- 성도 전용 필터 예시 -->
              <UFormField v-if="activeDonorTab === 'MEMBER'" label="직분">
                <USelectMenu v-model="roleFilter" :items="roles" value-key="code" placeholder="전체 직분" class="w-full" />
              </UFormField>
            </div>
            <div class="flex justify-start gap-2 mt-4">
              <UButton icon="i-heroicons-magnifying-glass" color="primary" @click="refresh" class="cursor-pointer px-8 font-bold">조회하기</UButton>
              <UButton class="cursor-pointer" variant="ghost" color="neutral" @click="resetFilters">초기화</UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- 테이블 영역 -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg relative border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div v-if="pending" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-40 py-20">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
        </div>
        
        <div class="overflow-x-auto">
          <!-- 1. 성도 목록 -->
          <UTable v-if="activeDonorTab === 'MEMBER'" :data="donors" :columns="memberColumns" class="w-full">
            <template #church_role_name-cell="{ row }">
              <UBadge variant="subtle" color="neutral" class="font-medium">{{ row.original.church_role_name || '-' }}</UBadge>
            </template>
            <template #phone_number-cell="{ row }">
              {{ formatPhoneNumber(row.original.phone_number) }}
            </template>
            <template #actions-cell="{ row }">
              <div class="flex gap-1">
                <UButton class="cursor-pointer" variant="ghost" color="primary" size="xs" @click="() => openModal(row.original)">수정</UButton>
                <UButton class="cursor-pointer" variant="ghost" color="error" size="xs" @click="() => deleteDonor(row.original)">삭제</UButton>
              </div>
            </template>
          </UTable>

          <!-- 2. 구역/조직 목록 -->
          <UTable v-if="activeDonorTab === 'CELL_GROUP'" :data="donors" :columns="groupColumns" class="w-full">
            <template #actions-cell="{ row }">
              <div class="flex gap-1">
                <UButton class="cursor-pointer" variant="ghost" color="primary" size="xs" @click="() => openModal(row.original)">수정</UButton>
                <UButton class="cursor-pointer" variant="ghost" color="error" size="xs" @click="() => deleteDonor(row.original)">삭제</UButton>
              </div>
            </template>
          </UTable>

          <!-- 3. 외부기관 목록 -->
          <UTable v-if="activeDonorTab === 'ORGANIZATION'" :data="donors" :columns="orgColumns" class="w-full">
            <template #is_active-cell="{ row }">
              <UBadge :color="row.original.is_active ? 'success' : 'neutral'" variant="solid">{{ row.original.is_active ? '활성' : '비활성' }}</UBadge>
            </template>
            <template #actions-cell="{ row }">
              <div class="flex gap-1">
                <UButton class="cursor-pointer" variant="ghost" color="primary" size="xs" @click="() => openModal(row.original)">수정</UButton>
                <UButton class="cursor-pointer" variant="ghost" color="error" size="xs" @click="() => deleteDonor(row.original)">삭제</UButton>
              </div>
            </template>
          </UTable>
        </div>
      </div>

      <!-- 등록/수정 모달 -->
      <UModal v-model:open="isModalOpen" :title="isEditing ? '정보 수정' : '신규 등록'">
        <template #content>
          <div class="p-6 space-y-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl">
            <div class="flex items-center justify-between border-b dark:border-gray-800 pb-3 mb-2">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                {{ activeDonorTab === 'MEMBER' ? '성도' : activeDonorTab === 'CELL_GROUP' ? '구역/조직' : '외부기관' }} 
                {{ isEditing ? '정보 수정' : '신규 등록' }}
              </h3>
              <UButton class="cursor-pointer" type="button" color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="isModalOpen = false" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="이름/명칭" required class="col-span-2">
                <UInput v-model="form.name" placeholder="명칭 입력" class="w-full" />
              </UFormField>

              <!-- 타입별 상세 필드 -->
              <template v-if="activeDonorTab === 'MEMBER'">
                <UFormField label="전화번호"><UInput v-model="form.details.phone_number" class="w-full" /></UFormField>
                <UFormField label="직분">
                  <USelectMenu v-model="form.details.church_role" :items="roles" value-key="code" class="w-full" />
                </UFormField>
              </template>

              <template v-if="activeDonorTab === 'ORGANIZATION'">
                <UFormField label="기관 유형">
                  <UInput v-model="form.details.org_type" placeholder="예: 선교단체, 타교회" class="w-full" />
                </UFormField>
                <UFormField label="연락처">
                  <UInput v-model="form.details.contact_info" class="w-full" />
                </UFormField>
                <UFormField label="설명" class="col-span-2">
                  <UTextarea v-model="form.details.description" class="w-full" />
                </UFormField>
              </template>
            </div>

            <div class="flex justify-end gap-2 mt-6">
              <UButton class="cursor-pointer" variant="ghost" color="neutral" @click="isModalOpen = false">취소</UButton>
              <UButton class="cursor-pointer" color="primary" :loading="isSaving" @click="saveDonor">저장 완료</UButton>
            </div>
          </div>
        </template>
      </UModal>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { formatPhoneNumber, displayValue } from '~/utils/formatter'
import { useUIStore } from '~/stores/ui'

const ui = useUIStore()
const donorTabs = [
  { id: 'MEMBER', label: '성도 관리' },
  { id: 'CELL_GROUP', label: '구역/조직 관리' },
  { id: 'ORGANIZATION', label: '외부기관 관리' }
]

const activeDonorTab = ref('MEMBER')
const keyword = ref('')
const roleFilter = ref(null)

const { data: donorsRes, refresh, pending } = await useFetch('/api/donors', {
  query: computed(() => ({
    type: activeDonorTab.value,
    keyword: keyword.value,
    role: roleFilter.value
  }))
})

const donors = computed(() => donorsRes.value || [])

// 컬럼 정의
const memberColumns = [
  { accessorKey: 'name', header: '이름' },
  { accessorKey: 'church_role_name', header: '직분' },
  { accessorKey: 'phone_number', header: '전화번호' },
  { accessorKey: 'actions', header: '관리' }
]
const groupColumns = [
  { accessorKey: 'name', header: '조직명' },
  { accessorKey: 'actions', header: '관리' }
]
const orgColumns = [
  { accessorKey: 'name', header: '기관/단체명' },
  { accessorKey: 'org_type', header: '유형' },
  { accessorKey: 'contact_info', header: '연락처' },
  { accessorKey: 'is_active', header: '상태' },
  { accessorKey: 'actions', header: '관리' }
]

const { data: rolesRes } = await useFetch('/api/common-codes', { query: { group: 'CHURCH_ROLE' } })
const roles = computed(() => ((rolesRes.value as any)?.data || []).map((r: any) => ({ ...r, label: r.name })))

const resetFilters = () => {
  keyword.value = ''
  roleFilter.value = null
  refresh()
}

// 모달 및 폼
const isModalOpen = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const form = reactive({
  id: null,
  donor_type: 'MEMBER',
  name: '',
  details: {} as any
})

const openModal = (donor?: any) => {
  isEditing.value = !!donor
  form.donor_type = activeDonorTab.value
  if (donor) {
    form.id = donor.donor_id
    form.name = donor.name
    form.details = { ...donor } // 실제로는 매핑 로직 필요
  } else {
    form.id = null
    form.name = ''
    form.details = {}
  }
  isModalOpen.value = true
}

const saveDonor = async () => {
  if (!form.name) { ui.showAlert('알림', '명칭을 입력해 주세요.', 'warning'); return }
  
  isSaving.value = true
  const method = isEditing.value ? 'PATCH' : 'POST'
  const url = isEditing.value ? `/api/donors/${form.id}` : '/api/donors'
  
  try {
    const res: any = await $fetch(url, { method, body: form })
    if (res.success) {
      isModalOpen.value = false
      refresh()
      ui.showAlert('성공', '정보가 저장되었습니다.', 'success')
    }
  } catch (e: any) {
    ui.showAlert('오류', e.data?.statusMessage || '처리 중 오류가 발생했습니다.', 'error')
  } finally {
    isSaving.value = false
  }
}

const deleteDonor = async (donor: any) => {
  const confirmed = await ui.showConfirm('삭제 확인', `${donor.name} 정보를 영구 삭제하시겠습니까?`, 'error')
  if (confirmed) {
    try {
      const res: any = await $fetch(`/api/donors/${donor.donor_id}`, { method: 'DELETE' })
      if (res.success) {
        refresh()
        ui.showAlert('성공', '삭제되었습니다.', 'success')
      }
    } catch (e: any) {
      ui.showAlert('오류', e.data?.statusMessage || '삭제 중 오류가 발생했습니다.', 'error')
    }
  }
}

const downloadExcel = () => {
  ui.showAlert('알림', '엑셀 다운로드 기능은 준비 중입니다.', 'info')
}

watch(activeDonorTab, () => {
  resetFilters()
})
</script>
