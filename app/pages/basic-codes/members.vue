<template>
  <ClientOnly>
    <div class="space-y-6">
      <div class="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg w-fit">
        <UButton
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :variant="activeTab === tab.id ? 'solid' : 'ghost'"
          :color="activeTab === tab.id ? (tab.id === 'CURRENT' ? 'primary' : 'error') : 'neutral'"
          class="px-6 py-1.5 font-bold transition-all duration-200"
        >
          {{ tab.label }} ({{ stats[tab.id === 'CURRENT' ? 'current' : 'removed'] }})
        </UButton>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <UFormField label="이름">
            <UInput v-model="filters.name" placeholder="이름 입력" icon="i-heroicons-user" class="w-full" @keyup.enter="refresh" />
          </UFormField>
          <UFormField label="전화번호">
            <UInput v-model="filters.phone" placeholder="전화번호 입력" icon="i-heroicons-phone" class="w-full" @keyup.enter="refresh" />
          </UFormField>
          <UFormField label="이메일">
            <UInput v-model="filters.email" placeholder="이메일 입력" icon="i-heroicons-envelope" class="w-full" @keyup.enter="refresh" />
          </UFormField>
          <UFormField label="구역">
            <USelectMenu v-model="filters.cellGroupId" :items="cellGroups" value-key="id" placeholder="전체 구역" class="w-full" />
          </UFormField>
          <UFormField label="직분">
            <USelectMenu v-model="filters.role" :items="roles" value-key="code" placeholder="전체 직분" class="w-full" />
          </UFormField>
        </div>
        <div class="flex justify-between items-center mt-6">
          <div class="flex gap-2">
            <UButton icon="i-heroicons-magnifying-glass" color="primary" @click="refresh" class="px-8">조회하기</UButton>
            <UButton variant="ghost" color="neutral" @click="resetFilters">초기화</UButton>
          </div>
          <div class="flex gap-2 items-center">
            <UButton icon="i-heroicons-document-arrow-down" color="neutral" variant="ghost" @click="downloadTemplate" class="font-bold">양식받기</UButton>
            <input type="file" ref="fileInput" class="hidden" accept=".xlsx, .xls" @change="handleFileUpload" />
            <UButton icon="i-heroicons-cloud-arrow-up" color="neutral" variant="outline" @click="$refs.fileInput.click()" class="font-bold">대량등록</UButton>
            <UButton icon="i-heroicons-user-plus" color="primary" @click="openModal()" class="font-bold">성도추가</UButton>
            <UButton icon="i-heroicons-table-cells" color="success" variant="outline" @click="downloadExcel" class="font-bold">엑셀</UButton>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden relative">
        <div v-if="pending" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
        </div>
        <UTable :data="members" :columns="columns" class="w-full">
          <template #name-cell="{ row }">
            {{ displayValue(row.original.name) }}
          </template>
          <template #church_role_name-cell="{ row }">
            {{ displayValue(row.original.church_role_name) }}
          </template>
          <template #spouse_name-cell="{ row }">
            {{ displayValue(row.original.spouse_name) }}
          </template>
          <template #cell_group_name-cell="{ row }">
            {{ displayValue(row.original.cell_group_name) }}
          </template>
          <template #user_role-cell="{ row }">
            <UBadge 
              v-if="row.original.user_role" 
              :color="getRoleBadgeColor(row.original.user_role)" 
              variant="solid" 
              class="font-bold px-2.5 py-0.5"
            >
              {{ getRoleInfo(row.original.user_role).label }}
            </UBadge>
            <span v-else class="text-gray-300">-</span>
          </template>
          <template #birth_date-cell="{ row }">
            {{ formatDate(row.original.birth_date) }}
          </template>
          <template #removed_date-cell="{ row }">
            <span class="text-red-600 dark:text-red-400 font-bold">
              {{ formatDate(row.original.removed_date) }}
            </span>
          </template>
          <template #phone_number-cell="{ row }">
            {{ formatPhoneNumber(row.original.phone_number) }}
          </template>
          <template #email-cell="{ row }">
            {{ displayValue(row.original.email) }}
          </template>
          <template #actions-cell="{ row }">
            <div class="flex gap-1">
              <UButton variant="ghost" color="primary" size="xs" @click="openModal(row.original)">수정</UButton>
              <UButton v-if="activeTab === 'CURRENT'" variant="ghost" color="warning" size="xs" @click="removeMember(row.original)">제적</UButton>
              <template v-else>
                <UButton variant="ghost" color="success" size="xs" @click="reRegisterMember(row.original)">재등록</UButton>
                <UButton variant="ghost" color="error" size="xs" @click="deleteMember(row.original)">삭제</UButton>
              </template>
            </div>
          </template>
        </UTable>
      </div>

      <div v-if="paginationInfo.totalPages > 1" class="flex justify-center mt-6">
        <UPagination v-model:page="currentPage" :total="paginationInfo.totalCount" :items-per-page="paginationInfo.limit" />
      </div>

      <!-- 접근성 경고 해결: title 및 description 속성 추가 -->
      <UModal 
        v-model:open="isModalOpen" 
        :title="isEditing ? '성도 정보 수정' : '신규 성도 추가'"
        description="성도의 인적 사항 및 시스템 권한을 관리합니다."
      >
        <template #content>
          <div class="p-6 space-y-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl">
            <div class="flex items-center justify-between border-b dark:border-gray-800 pb-3 mb-2">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                {{ isEditing ? '성도 정보 수정' : '신규 성도 추가' }}
              </h3>
              <UButton type="button" color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="isModalOpen = false" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="이름" required><UInput v-model="form.name" placeholder="이름 입력" class="w-full" /></UFormField>
              <UFormField label="전화번호" required><UInput v-model="form.phone_number" placeholder="010-0000-0000" class="w-full" /></UFormField>
              <UFormField label="이메일">
                <UInput v-model="form.email" type="email" placeholder="email@example.com" class="w-full" />
              </UFormField>
              <UFormField label="배우자">
                <UInput v-model="form.spouse_name" placeholder="배우자 성함" class="w-full" />
              </UFormField>
              <UFormField label="생년월일">
                <UInput v-model="form.birth_date" type="date" class="w-full" />
              </UFormField>
              <UFormField label="직분">
                <USelectMenu v-model="form.church_role" :items="roles" value-key="code" class="w-full" />
              </UFormField>
              <UFormField label="구역">
                <USelectMenu v-model="form.cell_group_id" :items="cellGroups" value-key="id" class="w-full" />
              </UFormField>
              
              <div v-if="isEditing" class="col-span-2 border-t dark:border-gray-800 pt-4 mt-2 space-y-4">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-bold flex items-center gap-2">
                    <UIcon name="i-heroicons-shield-check" class="text-brand-blue" />
                    시스템 로그인 권한
                  </label>
                  <UCheckbox 
                    v-model="hasAuth" 
                    :disabled="isRoleLocked" 
                    label="권한 부여됨" 
                    class="font-medium"
                  />
                </div>

                <div v-if="hasAuth" class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-1">
                  <div class="grid grid-cols-2 gap-4">
                    <UFormField label="로그인 아이디" required>
                      <UInput 
                        v-model="form.login_id" 
                        :disabled="!!form.user_id || isRoleLocked" 
                        placeholder="아이디 입력" 
                        icon="i-heroicons-identification"
                      />
                    </UFormField>
                    <UFormField label="권한 등급" required>
                      <USelectMenu 
                        v-model="form.user_role" 
                        :items="dynamicSysRoles" 
                        value-key="code" 
                        :disabled="isRoleLocked"
                        class="w-full" 
                      />
                    </UFormField>
                    <UFormField v-if="!form.user_id" label="초기 비밀번호" required class="col-span-2">
                      <UInput v-model="form.new_password" type="password" placeholder="최소 4자 이상" icon="i-heroicons-lock-closed" />
                    </UFormField>
                  </div>
                  <p v-if="isRoleLocked" class="text-xs text-error font-bold italic">
                    * 자신보다 높은 권한을 가진 사용자의 권한은 관리할 수 없습니다.
                  </p>
                </div>
                <div v-else-if="!!form.user_id" class="text-xs text-error font-bold p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  * 주의: 체크를 해제하고 저장하면 해당 사용자의 로그인 권한이 즉시 박탈(삭제)됩니다.
                </div>
              </div>
            </div>
            <div class="flex justify-end gap-2 mt-6">
              <UButton variant="ghost" color="neutral" @click="isModalOpen = false">취소</UButton>
              <UButton color="primary" :loading="isSaving" @click="saveMember">{{ isEditing ? '수정 완료' : '등록 완료' }}</UButton>
            </div>
          </div>
        </template>
      </UModal>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { formatPhoneNumber, getRoleInfo, formatDate, displayValue } from '~/utils/formatter'
import { fetchAndDownloadExcel } from '~/utils/excel'
import { useUIStore } from '~/stores/ui'
import * as XLSX from 'xlsx'

const tabs = [
  { id: 'CURRENT', label: '출석 성도' },
  { id: 'REMOVED', label: '제적 성도' }
]

const activeTab = ref('CURRENT')
const currentPage = ref(1)
const filters = reactive({ name: '', phone: '', email: '', cellGroupId: null, role: null })
const ui = useUIStore()
const { user: currentUser } = useUserSession()
const fileInput = ref<HTMLInputElement | null>(null)

const currentUserRole = computed(() => currentUser.value?.role || 4)

watch([activeTab, filters], () => {
  currentPage.value = 1
}, { deep: true })

const { data: response, refresh, pending } = await useFetch('/api/members', {
  query: computed(() => ({
    page: currentPage.value,
    tab: activeTab.value,
    name: filters.name,
    phone: filters.phone,
    email: filters.email,
    cellGroupId: filters.cellGroupId,
    role: filters.role
  }))
})

const { data: rolesRes } = await useFetch('/api/common-codes', { query: { group: 'CHURCH_ROLE' } })
const { data: sysRolesRes } = await useFetch('/api/common-codes', { query: { group: 'SYS_ROLE' } })
const { data: groupsRes } = await useFetch('/api/cell-groups')

const roles = computed(() => ((rolesRes.value as any)?.data || []).map((r: any) => ({ ...r, label: r.name })))
const sysRoles = computed(() => ((sysRolesRes.value as any)?.data || []).map((r: any) => ({ ...r, label: r.name, code: parseInt(r.code) })))
const cellGroups = computed(() => ((groupsRes.value as any)?.data || []).map((g: any) => ({ ...g, label: g.name })))
const members = computed(() => (response.value as any)?.data || [])
const stats = computed(() => (response.value as any)?.stats || { current: 0, removed: 0 })
const paginationInfo = computed(() => (response.value as any)?.pagination || { totalPages: 0, totalCount: 0, limit: 10 })

// 권한 등급별 뱃지 색상 매핑 함수
const getRoleBadgeColor = (role: number) => {
  switch (role) {
    case 1: return 'primary' // 최고관리자 (Blue)
    case 2: return 'success' // 관리자 (Green)
    case 3: return 'warning' // 재정담당 (Yellow)
    default: return 'neutral' // 사용자 (Gray)
  }
}

const dynamicSysRoles = computed(() => {
  const currentVal = form.user_role ? parseInt(form.user_role as any) : null
  let filtered = sysRoles.value.filter(r => r.code >= currentUserRole.value)
  if (currentVal !== null && !filtered.some(r => r.code === currentVal)) {
    const originalRole = sysRoles.value.find(r => r.code === currentVal)
    if (originalRole) {
      filtered = [originalRole, ...filtered]
    }
  }
  return filtered
})

const isRoleLocked = computed(() => {
  if (!form.user_role) return false
  return parseInt(form.user_role as any) < currentUserRole.value
})

const columns = computed(() => {
  const cols = [
    { id: 'name', accessorKey: 'name', header: '이름' },
    { id: 'church_role_name', accessorKey: 'church_role_name', header: '직분' },
    { id: 'spouse_name', accessorKey: 'spouse_name', header: '배우자' },
    { id: 'cell_group_name', accessorKey: 'cell_group_name', header: '구역' },
    { id: 'birth_date', accessorKey: 'birth_date', header: '생년월일' },
    { id: 'phone_number', accessorKey: 'phone_number', header: '전화번호' },
    { id: 'email', accessorKey: 'email', header: '이메일' }
  ]

  if (activeTab.value === 'CURRENT') {
    cols.push({ id: 'user_role', accessorKey: 'user_role', header: '시스템 권한' })
  }

  if (activeTab.value === 'REMOVED') {
    cols.push({ id: 'removed_date', accessorKey: 'removed_date', header: '제적일' })
  }

  cols.push({ id: 'actions', header: '관리' })
  return cols
})

const resetFilters = () => {
  Object.assign(filters, { name: '', phone: '', email: '', cellGroupId: null, role: null })
  refresh()
}

const isModalOpen = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const hasAuth = ref(false) 

const form = reactive({ 
  id: null, 
  name: '', 
  phone_number: '', 
  email: '', 
  spouse_name: '',
  church_role: null, 
  cell_group_id: null, 
  birth_date: null,
  user_id: null,
  login_id: '',
  user_role: null as number | null,
  new_password: ''
})

const openModal = (member?: any) => {
  isEditing.value = !!member
  if (member) {
    Object.assign(form, { ...member, new_password: '' })
    hasAuth.value = !!member.user_id
    if (form.birth_date) {
      form.birth_date = new Date(form.birth_date).toISOString().split('T')[0] as any
    }
  }
  else {
    Object.assign(form, { 
      id: null, name: '', phone_number: '', email: '', spouse_name: '',
      church_role: null, cell_group_id: null, birth_date: null,
      user_id: null, login_id: '', user_role: 4, new_password: ''
    })
    hasAuth.value = false
  }
  isModalOpen.value = true
}

const saveMember = async () => {
  if (hasAuth.value && !form.user_id) {
    if (!form.login_id) { ui.showAlert('입력 오류', '부여할 로그인 아이디를 입력해 주세요.', 'warning'); return }
    if (!form.new_password) { ui.showAlert('입력 오류', '초기 비밀번호를 입력해 주세요.', 'warning'); return }
  }

  const payload: any = { ...form }
  if (isEditing.value) {
    if (hasAuth.value && !form.user_id) payload.auth_action = 'GRANT'
    else if (!hasAuth.value && !!form.user_id) payload.auth_action = 'REVOKE'
    else if (hasAuth.value && !!form.user_id) payload.auth_action = 'UPDATE'
  }

  isSaving.value = true
  const method = isEditing.value ? 'PATCH' : 'POST'
  const url = isEditing.value ? `/api/members/${form.id}` : '/api/members'
  
  try {
    const res: any = await $fetch(url, { method, body: payload })
    if (res.success) {
      isModalOpen.value = false
      refresh()
      ui.showAlert('성공', `성도 정보가 ${isEditing.value ? '수정' : '등록'}되었습니다.`, 'success')
    }
  } catch (e: any) {
    ui.showAlert('오류', e.data?.statusMessage || '처리 중 오류가 발생했습니다.', 'error')
  } finally {
    isSaving.value = false
  }
}

const downloadTemplate = () => {
  const header = [['성함', '연락처', '배우자', '생년월일', '이메일', '직분', '구역명', '우편번호', '주소', '상세주소']]
  const sampleData = [['홍길동', '010-1234-5678', '김영희', '1980-01-01', 'hong@example.com', '집사', '믿음목장', '12345', '서울시 강남구...', '101호']]
  
  const worksheet = XLSX.utils.aoa_to_sheet([...header, ...sampleData])
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = { c: C, r: R }
      const cell_ref = XLSX.utils.encode_cell(cell_address)
      if (!worksheet[cell_ref]) continue
      worksheet[cell_ref].z = '@'
    }
  }
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '성도대량등록양식')
  XLSX.writeFile(workbook, '성도대량등록_양식.xlsx')
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  const confirmed = await ui.showConfirm('대량 등록', '선택한 엑셀 파일의 데이터를 일괄 등록하시겠습니까?', 'info')
  if (!confirmed) { target.value = ''; return }
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      if (jsonData.length === 0) { ui.showAlert('오류', '엑셀 파일에 데이터가 없습니다.', 'error'); return }
      const res: any = await $fetch('/api/members/bulk', { method: 'POST', body: { members: jsonData } })
      if (res.success) { ui.showAlert('성공', `${res.count}명의 성도가 등록되었습니다.`, 'success'); refresh() }
    } catch (err: any) { ui.showAlert('오류', '엑셀 파일 처리 중 오류가 발생했습니다.', 'error') }
    finally { target.value = '' }
  }
  reader.readAsArrayBuffer(file)
}

const removeMember = async (member: any) => {
  const confirmed = await ui.showConfirm('제적 처리', `${member.name} 성도를 제적 처리하시겠습니까?`, 'warning')
  if (confirmed) {
    await $fetch(`/api/members/${member.id}/remove`, { method: 'PATCH', body: { removedDate: new Date().toISOString().slice(0, 10) } })
    refresh()
    ui.showAlert('완료', '제적 처리가 완료되었습니다.', 'success')
  }
}

const reRegisterMember = async (member: any) => {
  const confirmed = await ui.showConfirm('재등록', `${member.name} 성도를 재등록하시겠습니까?`, 'success')
  if (confirmed) {
    await $fetch(`/api/members/${member.id}/re-register`, { method: 'PATCH' })
    refresh()
    ui.showAlert('완료', '재등록이 완료되었습니다.', 'success')
  }
}

const deleteMember = async (member: any) => {
  const confirmed = await ui.showConfirm('영구 삭제', '성도 정보를 영구 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.', 'error')
  if (confirmed) {
    await $fetch(`/api/members/${member.id}`, { method: 'DELETE' })
    refresh()
    ui.showAlert('완료', '삭제되었습니다.', 'success')
  }
}

const downloadExcel = async () => {
  const mapper = (m: any) => {
    const row: any = {
      '이름': displayValue(m.name),
      '직분': displayValue(m.church_role_name),
      '배우자': displayValue(m.spouse_name),
      '구역': displayValue(m.cell_group_name),
      '생년월일': formatDate(m.birth_date),
      '전화번호': formatPhoneNumber(m.phone_number),
      '이메일': displayValue(m.email),
      '상태': activeTab.value === 'CURRENT' ? '출석' : '제적'
    }
    if (activeTab.value === 'REMOVED') { row['제적일'] = formatDate(m.removed_date) }
    return row
  }
  await fetchAndDownloadExcel('/api/members', { ...filters, tab: activeTab.value }, mapper, `성도명단_${activeTab.value === 'CURRENT' ? '출석' : '제적'}`)
}
</script>
