<template>
  <ClientOnly>
    <div class="space-y-6 relative">
      <!-- 상단 고정 영역: 탭 및 통계 (Stacked Sticky 1) -->
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

            <div class="flex items-center space-x-2 text-sm font-bold text-gray-500 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-sm border dark:border-gray-700">
              <UIcon name="i-heroicons-list-bullet" class="w-4 h-4 text-brand-blue" />
              <span>목록 개수</span>
              <USelectMenu v-model="pageSize" :items="pageSizeOptions" variant="none" class="w-16 font-mono font-black" size="sm" />
            </div>
          </div>

          <!-- 요약 통계 카드 (개선된 대시보드형) -->
          <div v-if="activeDonorTab === 'MEMBER'" class="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
            <div class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div class="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <UIcon name="i-heroicons-users" class="w-5 h-5 text-brand-blue" />
              </div>
              <div>
                <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">누적 등록</p>
                <p class="text-lg font-black font-mono">{{ formatNumber(globalStats?.total || 0) }}</p>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div class="p-2.5 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-brand-green" />
              </div>
              <div>
                <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">출석 성도</p>
                <p class="text-lg font-black font-mono text-brand-blue">{{ formatNumber(globalStats?.current || 0) }}</p>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div class="p-2.5 bg-red-50 dark:bg-red-900/30 rounded-lg">
                <UIcon name="i-heroicons-minus-circle" class="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">제적 인원</p>
                <p class="text-lg font-black font-mono text-red-500">{{ formatNumber(globalStats?.removed || 0) }}</p>
              </div>
            </div>
            <div class="bg-brand-blue/5 dark:bg-blue-900/10 p-4 rounded-xl border-2 border-brand-blue/20 shadow-sm flex items-center gap-4">
              <div class="p-2.5 bg-brand-blue rounded-lg">
                <UIcon name="i-heroicons-magnifying-glass" class="w-5 h-5 text-white" />
              </div>
              <div>
                <p class="text-[10px] text-brand-blue font-black uppercase tracking-wider">현재 조회 결과</p>
                <p class="text-lg font-black font-mono text-brand-blue">{{ formatNumber(paginationInfo.totalCount) }}</p>
              </div>
            </div>
          </div>

          <!-- 통합 검색 필터 -->
          <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <UFormField label="명칭/이름">
                <UInput v-model="filters.keyword" placeholder="이름 또는 키워드" icon="i-heroicons-magnifying-glass" class="w-full" @keyup.enter="refresh" />
              </UFormField>
              
              <template v-if="activeDonorTab === 'MEMBER'">
                <UFormField label="전화번호">
                  <UInput v-model="filters.phone" placeholder="번호 검색" icon="i-heroicons-phone" class="w-full" @keyup.enter="refresh" />
                </UFormField>
                <UFormField label="직분">
                  <USelectMenu v-model="filters.role" :items="roles" value-key="code" placeholder="전체 직분" class="w-full" />
                </UFormField>
                <UFormField label="구역">
                  <USelectMenu v-model="filters.cellGroupId" :items="cellGroups" value-key="id" placeholder="전체 구역" class="w-full" />
                </UFormField>
                <UFormField label="상태">
                  <USelectMenu v-model="filters.status" :items="memberStatusOptions" value-key="id" class="w-full" />
                </UFormField>
              </template>

              <template v-if="activeDonorTab === 'CELL_GROUP'">
                <UFormField label="상위 소속">
                  <USelectMenu v-model="filters.parent" :items="parentGroups" placeholder="전체 소속" class="w-full" />
                </UFormField>
                <UFormField label="상태">
                  <USelectMenu v-model="filters.isActive" :items="statusOptions" value-key="value" class="w-full" />
                </UFormField>
              </template>

              <template v-if="activeDonorTab === 'ORGANIZATION'">
                <UFormField label="단체 유형">
                  <UInput v-model="filters.orgType" placeholder="유형 입력" class="w-full" />
                </UFormField>
              </template>
            </div>

            <div class="flex justify-between items-center mt-6 pt-4 border-t dark:border-gray-800">
              <div class="flex gap-2">
                <UButton icon="i-heroicons-magnifying-glass" color="primary" @click="() => refresh()" class="cursor-pointer px-8 font-bold">조회하기</UButton>
                <UButton class="cursor-pointer" variant="ghost" color="neutral" @click="resetFilters">초기화</UButton>
              </div>
              <div class="flex gap-2 items-center">
                <template v-if="activeDonorTab === 'MEMBER'">
                  <UButton icon="i-heroicons-document-arrow-down" color="neutral" variant="ghost" @click="downloadTemplate" class="cursor-pointer font-bold">양식받기</UButton>
                  <input type="file" ref="fileInput" class="hidden" accept=".xlsx, .xls" @change="handleFileUpload" />
                  <UButton icon="i-heroicons-cloud-arrow-up" color="neutral" variant="outline" @click="() => fileInput?.click()" class="cursor-pointer font-bold">대량등록</UButton>
                </template>
                <UButton icon="i-heroicons-plus-circle" color="primary" @click="() => openModal()" class="cursor-pointer font-bold px-6 shadow-md">
                  {{ activeDonorLabel }} 추가
                </UButton>
                <UButton icon="i-heroicons-table-cells" color="success" variant="outline" @click="downloadExcel" class="cursor-pointer font-bold">엑셀</UButton>
              </div>
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
          <UTable :data="donors" :columns="currentColumns" class="w-full sticky-header-table">
            <!-- 성도 전용 슬롯 -->
            <template #church_role_name-cell="{ row }">
              <UBadge v-if="row.original.church_role_name" variant="subtle" color="neutral" class="font-medium">
                {{ row.original.church_role_name }}
              </UBadge>
              <span v-else class="text-gray-300">-</span>
            </template>
            
            <template #user_role-cell="{ row }">
              <UBadge 
                v-if="row.original.user_role" 
                :color="getRoleBadgeColor(row.original.user_role as number)" 
                variant="solid" 
                class="font-bold px-2.5 py-0.5"
              >
                {{ getRoleInfo(row.original.user_role as number).label }}
              </UBadge>
              <span v-else class="text-gray-300">-</span>
            </template>

            <template #phone_number-cell="{ row }">
              {{ formatPhoneNumber(row.original.phone_number as string) }}
            </template>

            <template #is_active-cell="{ row }">
              <UBadge :color="row.original.is_active ? 'success' : 'neutral'" variant="solid">
                {{ row.original.is_active ? '활성' : '비활성' }}
              </UBadge>
            </template>

            <template #removed_date-cell="{ row }">
              <span v-if="row.original.removed_date" class="text-red-600 dark:text-red-400 font-bold">
                {{ formatDate(row.original.removed_date as string) }}
              </span>
              <span v-else>-</span>
            </template>

            <!-- 공통 관리 액션 -->
            <template #actions-cell="{ row }">
              <div class="flex gap-1">
                <UButton class="cursor-pointer" variant="ghost" color="primary" size="xs" @click="() => openModal(row.original)">수정</UButton>
                
                <!-- 성도 전용 액션 (제적/재등록) -->
                <template v-if="activeDonorTab === 'MEMBER'">
                  <UButton v-if="!row.original.removed_date" class="cursor-pointer" variant="ghost" color="warning" size="xs" @click="() => removeMember(row.original)">제적</UButton>
                  <UButton v-else class="cursor-pointer" variant="ghost" color="success" size="xs" @click="() => reRegisterMember(row.original)">재등록</UButton>
                </template>

                <!-- 삭제 버튼 (성도는 제적된 상태에서만, 나머지는 항상 노출) -->
                <UButton 
                  v-if="activeDonorTab !== 'MEMBER' || row.original.removed_date"
                  class="cursor-pointer" 
                  variant="ghost" 
                  color="error" 
                  size="xs" 
                  @click="() => deleteDonor(row.original)"
                >
                  삭제
                </UButton>
              </div>
            </template>
          </UTable>
        </div>
      </div>

      <!-- 페이징 -->
      <div v-if="paginationInfo.totalPages > 1" class="flex justify-center mt-6 pb-8">
        <UPagination v-model:page="currentPage" :total="paginationInfo.totalCount" :items-per-page="parseInt(pageSize)" />
      </div>

      <!-- 통합 등록/수정 모달 -->
      <UModal v-model:open="isModalOpen" :title="`${activeDonorLabel} ${isEditing ? '수정' : '등록'}`" description="상세 정보를 입력하거나 수정할 수 있습니다." :ui="{ content: 'max-w-2xl' }">
        <template #content>
          <div class="p-6 space-y-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl">
            <div class="flex items-center justify-between border-b dark:border-gray-800 pb-3 mb-2">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                <UIcon :name="activeDonorTab === 'MEMBER' ? 'i-heroicons-user' : 'i-heroicons-user-group'" class="mr-2 text-brand-blue" />
                {{ activeDonorLabel }} {{ isEditing ? '정보 수정' : '신규 등록' }}
              </h3>
              <UButton class="cursor-pointer" type="button" color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="isModalOpen = false" />
            </div>

            <div class="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
              <UFormField label="이름/명칭" required class="col-span-2">
                <UInput v-model="form.name" placeholder="명칭 입력" class="w-full font-bold" />
              </UFormField>

              <!-- 1. 성도 상세 필드 -->
              <template v-if="activeDonorTab === 'MEMBER'">
                <UFormField label="전화번호" required><UInput v-model="form.details.phone_number" placeholder="010-0000-0000" class="w-full" /></UFormField>
                <UFormField label="이메일"><UInput v-model="form.details.email" type="email" placeholder="email@example.com" class="w-full" /></UFormField>
                <UFormField label="직분"><USelectMenu v-model="form.details.church_role" :items="roles" value-key="code" class="w-full" /></UFormField>
                <UFormField label="구역"><USelectMenu v-model="form.details.cell_group_id" :items="cellGroups" value-key="id" class="w-full" /></UFormField>
                <UFormField label="배우자"><UInput v-model="form.details.spouse_name" placeholder="배우자 성함" class="w-full" /></UFormField>
                <UFormField label="생년월일"><UInput v-model="form.details.birth_date" type="date" class="w-full" /></UFormField>
                
                <!-- 시스템 권한 설정 (복원) -->
                <div v-if="isEditing" class="col-span-2 border-t dark:border-gray-800 pt-4 mt-2 space-y-4">
                  <div class="flex items-center justify-between">
                    <label class="text-sm font-bold flex items-center gap-2">
                      <UIcon name="i-heroicons-shield-check" class="text-brand-blue" />
                      시스템 로그인 권한
                    </label>
                    <UCheckbox v-model="hasAuth" :disabled="isRoleLocked" label="권한 부여됨" />
                  </div>

                  <div v-if="hasAuth" class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-1">
                    <div class="grid grid-cols-2 gap-4">
                      <UFormField label="로그인 아이디" required>
                        <UInput v-model="form.login_id" :disabled="!!form.user_id || isRoleLocked" placeholder="아이디 입력" icon="i-heroicons-identification" />
                      </UFormField>
                      <UFormField label="권한 등급" required>
                        <USelectMenu v-model="form.user_role" :items="dynamicSysRoles" value-key="code" :disabled="isRoleLocked" class="w-full" />
                      </UFormField>
                      <UFormField v-if="!form.user_id" label="초기 비밀번호" required class="col-span-2">
                        <UInput v-model="form.new_password" type="password" placeholder="최소 4자 이상" icon="i-heroicons-lock-closed" />
                      </UFormField>
                    </div>
                  </div>
                </div>
              </template>

              <!-- 2. 구역/조직 상세 필드 -->
              <template v-if="activeDonorTab === 'CELL_GROUP'">
                <UFormField label="상위 소속" class="col-span-2">
                  <UInput v-model="form.details.parent_group" placeholder="예: 1교구, 청년부 등" class="w-full" />
                </UFormField>
                <UFormField label="구역장(리더)" class="col-span-2">
                  <div class="flex space-x-2">
                    <UInput :model-value="displayValue(form.details.leader_name)" disabled class="flex-1 bg-gray-50 dark:bg-gray-800" />
                    <UButton class="cursor-pointer" label="검색" color="neutral" variant="outline" icon="i-heroicons-magnifying-glass" @click="isLeaderSearchOpen = true" />
                  </div>
                </UFormField>
                <UFormField label="활성 여부" class="col-span-2">
                  <UCheckbox v-model="form.details.is_active" label="현재 활성 구역으로 사용함" />
                </UFormField>
              </template>

              <!-- 3. 단체 상세 필드 -->
              <template v-if="activeDonorTab === 'ORGANIZATION'">
                <UFormField label="단체 유형"><UInput v-model="form.details.org_type" placeholder="예: 선교단체, 타교회" class="w-full" /></UFormField>
                <UFormField label="연락처"><UInput v-model="form.details.contact_info" class="w-full" /></UFormField>
                <UFormField label="설명" class="col-span-2"><UTextarea v-model="form.details.description" class="w-full" /></UFormField>
                <UFormField label="활성 여부"><UCheckbox v-model="form.details.is_active" label="현재 활동 중인 단체임" /></UFormField>
              </template>
            </div>

            <div class="flex justify-end gap-2 mt-6 pt-4 border-t dark:border-gray-800">
              <UButton class="cursor-pointer" variant="ghost" color="neutral" @click="isModalOpen = false">취소</UButton>
              <UButton class="cursor-pointer px-8 font-black" color="primary" :loading="isSaving" @click="saveDonor">정보 저장</UButton>
            </div>
          </div>
        </template>
      </UModal>

      <!-- 구역장 검색 모달 (복원) -->
      <UModal v-model:open="isLeaderSearchOpen" title="구역장 선택" description="리스트에서 성도를 선택하여 구역장으로 지정합니다.">
        <template #content>
          <div class="p-6 space-y-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl">
            <div class="flex items-center justify-between border-b dark:border-gray-800 pb-3 mb-2">
              <h3 class="text-lg font-bold">구역장(리더) 선택</h3>
              <UButton class="cursor-pointer" type="button" color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="isLeaderSearchOpen = false" />
            </div>
            <UInput v-model="leaderSearchTerm" placeholder="성도 이름 검색" icon="i-heroicons-magnifying-glass" class="w-full" autofocus />
            <div class="max-h-[300px] overflow-y-auto border rounded-lg dark:border-gray-800 custom-scrollbar">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr v-for="m in filteredLeaders" :key="m.id" class="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors" @click="selectLeader(m)">
                    <td class="px-4 py-3 text-sm font-bold">{{ m.name }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500">{{ displayValue(m.church_role_name) }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500 text-right">{{ formatPhoneNumber(m.phone_number) }}</td>
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
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { formatPhoneNumber, getRoleInfo, formatDate, displayValue } from '~/utils/formatter'
import { fetchAndDownloadExcel } from '~/utils/excel'
import { useUIStore } from '~/stores/ui'
import * as XLSX from 'xlsx'

const ui = useUIStore()
const { user: currentUser } = useUserSession()
const currentUserRole = computed(() => currentUser.value?.role || 4)

const donorTabs = [
  { id: 'MEMBER', label: '성도 관리' },
  { id: 'CELL_GROUP', label: '구역/조직 관리' },
  { id: 'ORGANIZATION', label: '단체 관리' }
]

const activeDonorTab = ref('MEMBER')
const activeDonorLabel = computed(() => donorTabs.find(t => t.id === activeDonorTab.value)?.label.replace(' 관리', '') || '')

// 1. 상태 및 필터 관리
const currentPage = ref(1)
const pageSize = ref('10')
const pageSizeOptions = ['10', '20', '50', '100']
const filters = reactive({
  keyword: '',
  phone: '',
  email: '',
  cellGroupId: null,
  role: null,
  status: 'CURRENT', // MEMBER 전역: CURRENT, REMOVED, ALL
  orgType: '',
  parent: 'all', // CELL_GROUP 전용
  isActive: 'all' // CELL_GROUP 전용
})

const statusOptions = [
  { label: '전체', value: 'all' },
  { label: '활성', value: 'true' },
  { label: '비활성', value: 'false' }
]

const memberStatusOptions = [
  { id: 'CURRENT', label: '출석 성도' },
  { id: 'REMOVED', label: '제적 성도' },
  { id: 'ALL', label: '전체 보기' }
]

// 2. 데이터 페칭
const { data: response, refresh, pending } = await useFetch('/api/donors', {
  query: computed(() => ({
    type: activeDonorTab.value,
    page: currentPage.value,
    limit: pageSize.value,
    ...filters
  }))
})

const donors = computed(() => (response.value as any)?.data || [])
const paginationInfo = computed(() => (response.value as any)?.pagination || { totalCount: 0, totalPages: 0, page: 1, limit: 10 })
const globalStats = computed(() => (response.value as any)?.stats || { total: 0, current: 0, removed: 0 })
const parentGroups = computed(() => ['all', ...((response.value as any)?.parentGroups || [])])

// 기초 데이터 (직분, 구역 등)
const { data: rolesRes } = await useFetch('/api/common-codes', { query: { group: 'CHURCH_ROLE' } })
const { data: sysRolesRes } = await useFetch('/api/common-codes', { query: { group: 'SYS_ROLE' } })
const { data: groupsRes } = await useFetch('/api/cell-groups')

const roles = computed(() => ((rolesRes.value as any)?.data || []).map((r: any) => ({ ...r, label: r.name })))
const sysRoles = computed(() => ((sysRolesRes.value as any)?.data || []).map((r: any) => ({ ...r, label: r.name, code: parseInt(r.code) })))
const cellGroups = computed(() => ((groupsRes.value as any)?.data || []).map((g: any) => ({ ...g, label: g.name })))

// 3. 컬럼 정의 (동적)
const currentColumns = computed(() => {
  if (activeDonorTab.value === 'MEMBER') {
    const cols = [
      { accessorKey: 'name', header: '이름' },
      { accessorKey: 'church_role_name', header: '직분' },
      { accessorKey: 'cell_group_name', header: '구역' },
      { accessorKey: 'phone_number', header: '전화번호' },
      { accessorKey: 'user_role', header: '권한' }
    ]
    if (filters.status === 'REMOVED') cols.push({ accessorKey: 'removed_date', header: '제적일' })
    cols.push({ accessorKey: 'actions', header: '관리' })
    return cols
  } else if (activeDonorTab.value === 'CELL_GROUP') {
    return [
      { accessorKey: 'name', header: '조직/구역명' },
      { accessorKey: 'parent_group', header: '상위 소속' },
      { accessorKey: 'leader_name', header: '구역장(리더)' },
      { accessorKey: 'is_active', header: '상태' },
      { accessorKey: 'actions', header: '관리' }
    ]
  } else {
    return [
      { accessorKey: 'name', header: '단체명' },
      { accessorKey: 'org_type', header: '유형' },
      { accessorKey: 'contact_info', header: '연락처' },
      { accessorKey: 'is_active', header: '상태' },
      { accessorKey: 'actions', header: '관리' }
    ]
  }
})

// 4. 모달 및 폼 로직
const isModalOpen = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const hasAuth = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const form = reactive({
  id: null,
  donor_type: 'MEMBER',
  name: '',
  details: {} as any,
  // 로그인 권한 관련
  user_id: null,
  login_id: '',
  user_role: null as number | null,
  new_password: ''
})

const openModal = (donor?: any) => {
  isEditing.value = !!donor
  form.donor_type = activeDonorTab.value
  
  if (donor) {
    form.id = donor.donor_id
    form.name = donor.name
    form.details = { ...donor }
    
    // 성도 권한 복원
    if (activeDonorTab.value === 'MEMBER') {
      hasAuth.value = !!donor.user_id
      form.user_id = donor.user_id
      form.login_id = donor.login_id || ''
      form.user_role = donor.user_role || 4
      if (form.details.birth_date) {
        form.details.birth_date = new Date(form.details.birth_date).toISOString().split('T')[0]
      }
    }
  } else {
    form.id = null
    form.name = ''
    form.details = activeDonorTab.value === 'ORGANIZATION' ? { is_active: true } : {}
    form.user_id = null
    form.login_id = ''
    form.user_role = 4
    hasAuth.value = false
  }
  isModalOpen.value = true
}

const saveDonor = async () => {
  if (!form.name) { ui.showAlert('알림', '명칭을 입력해 주세요.', 'warning'); return }
  
  // 권한 체크 (MEMBER)
  if (activeDonorTab.value === 'MEMBER' && hasAuth.value && !form.user_id) {
    if (!form.login_id) { ui.showAlert('입력 오류', '부여할 로그인 아이디를 입력해 주세요.', 'warning'); return }
    if (!form.new_password) { ui.showAlert('입력 오류', '초기 비밀번호를 입력해 주세요.', 'warning'); return }
  }

  const payload: any = { ...form }
  // 권한 액션 설정
  if (activeDonorTab.value === 'MEMBER' && isEditing.value) {
    if (hasAuth.value && !form.user_id) payload.auth_action = 'GRANT'
    else if (!hasAuth.value && !!form.user_id) payload.auth_action = 'REVOKE'
    else if (hasAuth.value && !!form.user_id) payload.auth_action = 'UPDATE'
  }

  isSaving.value = true
  const method = isEditing.value ? 'PATCH' : 'POST'
  const url = isEditing.value ? `/api/donors/${form.id}` : '/api/donors'
  
  try {
    const res: any = await $fetch(url, { method, body: payload })
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

// 5. 구역장 검색 로직 (복원)
const isLeaderSearchOpen = ref(false)
const leaderSearchTerm = ref('')
const { data: allMembersRes } = await useFetch('/api/donors', { query: { type: 'MEMBER', limit: 1000 } })
const allMembers = computed(() => (allMembersRes.value as any)?.data || [])

const filteredLeaders = computed(() => {
  if (!leaderSearchTerm.value) return allMembers.value.slice(0, 30)
  return allMembers.value.filter((m: any) => m.name.includes(leaderSearchTerm.value))
})

const selectLeader = (m: any) => {
  form.details.leader_id = m.member_id
  form.details.leader_name = m.name
  isLeaderSearchOpen.value = false
}

// 6. 기타 기능 (삭제, 제적, 엑셀)
const deleteDonor = async (donor: any) => {
  const confirmed = await ui.showConfirm('영구 삭제', `${donor.name} 정보를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`, 'error')
  if (confirmed) {
    try {
      await $fetch(`/api/donors/${donor.donor_id}`, { method: 'DELETE' })
      refresh()
      ui.showAlert('성공', '삭제되었습니다.', 'success')
    } catch (e: any) { ui.showAlert('오류', e.data?.statusMessage, 'error') }
  }
}

const removeMember = async (member: any) => {
  const confirmed = await ui.showConfirm('제적 처리', `${member.name} 성도를 제적 처리하시겠습니까?`, 'warning')
  if (confirmed) {
    await $fetch(`/api/members/${member.member_id}/remove`, { method: 'PATCH', body: { removedDate: new Date().toISOString().slice(0, 10) } })
    refresh(); ui.showAlert('완료', '제적 처리되었습니다.', 'success')
  }
}

const reRegisterMember = async (member: any) => {
  const confirmed = await ui.showConfirm('재등록', `${member.name} 성도를 재등록하시겠습니까?`, 'success')
  if (confirmed) {
    await $fetch(`/api/members/${member.member_id}/re-register`, { method: 'PATCH' })
    refresh(); ui.showAlert('완료', '재등록되었습니다.', 'success')
  }
}

// 헬퍼 함수
const resetFilters = () => {
  filters.keyword = ''; 
  filters.phone = ''; 
  filters.email = ''; 
  filters.cellGroupId = null; 
  filters.role = null; 
  filters.status = 'CURRENT'; 
  filters.orgType = '';
  filters.parent = 'all'; // 구역 초기화 추가
  filters.isActive = 'all'; // 구역 상태 초기화 추가
  refresh()
}

const getRoleBadgeColor = (role: any) => {
  const r = parseInt(role); if (r === 1) return 'primary'; if (r === 2) return 'success'; if (r === 3) return 'warning'; return 'neutral'
}

const dynamicSysRoles = computed(() => {
  const currentVal = form.user_role ? parseInt(form.user_role as any) : null
  let filtered = sysRoles.value.filter((r: any) => r.code >= currentUserRole.value)
  if (currentVal !== null && !filtered.some((r: any) => r.code === currentVal)) {
    const originalRole = sysRoles.value.find((r: any) => r.code === currentVal)
    if (originalRole) filtered = [originalRole, ...filtered]
  }
  return filtered
})

const isRoleLocked = computed(() => form.user_role ? parseInt(form.user_role as any) < currentUserRole.value : false)

// 엑셀 템플릿 및 대량등록 (복원)
const downloadTemplate = () => {
  const header = [['성함', '연락처', '배우자', '생년월일', '이메일', '직분', '구역명', '우편번호', '주소', '상세주소']]
  const sampleData = [['홍길동', '010-1234-5678', '김영희', '1980-01-01', 'hong@example.com', '집사', '믿음목장', '12345', '서울시 강남구...', '101호']]
  const worksheet = XLSX.utils.aoa_to_sheet([...header, ...sampleData])
  const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, '성도대량등록양식')
  XLSX.writeFile(workbook, '성도대량등록_양식.xlsx')
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement; const file = target.files?.[0]; if (!file) return
  const confirmed = await ui.showConfirm('대량 등록', '선택한 엑셀 파일의 데이터를 일괄 등록하시겠습니까?', 'info')
  if (!confirmed) { target.value = ''; return }
  const reader = new FileReader(); reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' }); const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      if (jsonData.length === 0) { ui.showAlert('오류', '엑셀 파일에 데이터가 없습니다.', 'error'); return }
      const res: any = await $fetch('/api/donors/bulk', { method: 'POST', body: { donors: jsonData, type: 'MEMBER' } }) // 통합 대량등록 API 필요
      if (res.success) { ui.showAlert('성공', `${res.count}명의 성도가 등록되었습니다.`, 'success'); refresh() }
    } catch (err: any) { ui.showAlert('오류', '엑셀 파일 처리 중 오류가 발생했습니다.', 'error') }
    finally { target.value = '' }
  }
  reader.readAsArrayBuffer(file)
}

const downloadExcel = async () => {
  const mapper = (d: any) => {
    if (activeDonorTab.value === 'MEMBER') return { '이름': d.name, '직분': d.church_role_name, '구역': d.cell_group_name, '연락처': d.phone_number }
    if (activeDonorTab.value === 'CELL_GROUP') return { '구역명': d.name, '리더': d.leader_name }
    return { '단체명': d.name, '유형': d.org_type, '연락처': d.contact_info }
  }
  await fetchAndDownloadExcel('/api/donors', { ...filters, type: activeDonorTab.value }, mapper, `${activeDonorLabel.value}명단`)
}

watch([activeDonorTab, pageSize], () => { currentPage.value = 1; refresh() })
watch(isLeaderSearchOpen, (v) => { if (!v) leaderSearchTerm.value = '' })

onMounted(() => { refresh() })
</script>

<style scoped>
.sticky-header-table :deep(thead) {
  position: sticky; top: 0; z-index: 20; background-color: var(--ui-bg);
}
.dark .sticky-header-table :deep(thead) { background-color: #1e293b; }
</style>
