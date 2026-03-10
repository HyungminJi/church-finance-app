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
            <USelectMenu v-model="filters.cellGroupId" :options="cellGroups" value-attribute="id" option-attribute="name" placeholder="전체 구역" class="w-full" />
          </UFormField>
          <UFormField label="직분">
            <USelectMenu v-model="filters.role" :options="roles" value-attribute="code" option-attribute="name" placeholder="전체 직분" class="w-full" />
          </UFormField>
        </div>
        <div class="flex justify-between items-center mt-6">
          <div class="flex gap-2">
            <UButton icon="i-heroicons-magnifying-glass" color="primary" @click="refresh" class="px-8">조회하기</UButton>
            <UButton variant="ghost" color="neutral" @click="resetFilters">초기화</UButton>
          </div>
          <div class="flex gap-2">
            <UButton icon="i-heroicons-user-plus" color="primary" @click="openModal()">성도추가</UButton>
            <UButton icon="i-heroicons-table-cells" color="success" variant="outline" @click="downloadExcel">엑셀</UButton>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden relative">
        <div v-if="pending" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
        </div>
        <UTable :data="members" :columns="columns" class="w-full">
          <template #user_role-cell="{ row }">
            <UBadge v-if="row.original.user_role" :color="getRoleInfo(row.original.user_role).color" variant="solid" class="font-bold">
              {{ getRoleInfo(row.original.user_role).label }}
            </UBadge>
            <span v-else class="text-gray-300">-</span>
          </template>
          <template #actions-cell="{ row }">
            <div class="flex gap-1">
              <UButton variant="ghost" color="primary" size="xs" @click="openModal(row.original)">수정</UButton>
              <UButton v-if="activeTab === 'CURRENT'" variant="ghost" color="neutral" size="xs" @click="removeMember(row.original)">제적</UButton>
              <template v-else>
                <UButton variant="ghost" color="success" size="xs" @click="reRegisterMember(row.original)">재등록</UButton>
                <UButton variant="ghost" color="error" size="xs" @click="deleteMember(row.original)">삭제</UButton>
              </template>
            </div>
          </template>
        </UTable>
      </div>

      <div v-if="paginationInfo.totalPages > 1" class="flex justify-center mt-6">
        <UPagination v-model="currentPage" :total="paginationInfo.totalCount" :page-count="paginationInfo.limit" />
      </div>

      <UModal v-model:open="isModalOpen">
        <template #content>
          <div class="p-6 space-y-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl">
            <h3 class="text-lg font-bold">{{ isEditing ? '성도 정보 수정' : '신규 성도 추가' }}</h3>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="이름" required><UInput v-model="form.name" class="w-full" /></UFormField>
              <UFormField label="전화번호" required><UInput v-model="form.phone_number" class="w-full" /></UFormField>
              <UFormField label="직분">
                <USelectMenu v-model="form.church_role" :options="roles" value-attribute="code" option-attribute="name" class="w-full" />
              </UFormField>
              <UFormField label="구역">
                <USelectMenu v-model="form.cell_group_id" :options="cellGroups" value-attribute="id" option-attribute="name" class="w-full" />
              </UFormField>
            </div>
            <div class="flex justify-end gap-2 mt-6">
              <UButton variant="ghost" color="neutral" @click="isModalOpen = false">취소</UButton>
              <UButton color="primary" @click="saveMember">{{ isEditing ? '수정 완료' : '등록 완료' }}</UButton>
            </div>
          </div>
        </template>
      </UModal>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { formatPhoneNumber, getRoleInfo } from '~/utils/formatter'

const tabs = [
  { id: 'CURRENT', label: '출석 성도' },
  { id: 'REMOVED', label: '제적 성도' }
]

const activeTab = ref('CURRENT')
const currentPage = ref(1)
const filters = reactive({ name: '', phone: '', email: '', cellGroupId: null, role: null })

const { data: response, refresh, pending } = await useFetch('/api/members', {
  query: computed(() => ({
    page: currentPage.value,
    tab: activeTab.value,
    ...filters
  })),
  watch: [currentPage, activeTab]
})

const { data: rolesRes } = await useFetch('/api/common-codes', { query: { group: 'CHURCH_ROLE' } })
const { data: groupsRes } = await useFetch('/api/cell-groups')

const roles = computed(() => (rolesRes.value as any)?.data || [])
const cellGroups = computed(() => (groupsRes.value as any)?.data || [])
const members = computed(() => (response.value as any)?.data || [])
const stats = computed(() => (response.value as any)?.stats || { current: 0, removed: 0 })
const paginationInfo = computed(() => (response.value as any)?.pagination || { totalPages: 0, totalCount: 0, limit: 10 })

const columns = [
  { id: 'name', accessorKey: 'name', header: '이름' },
  { id: 'church_role_name', accessorKey: 'church_role_name', header: '직분' },
  { id: 'user_role', accessorKey: 'user_role', header: '시스템 권한' },
  { id: 'phone_number', accessorKey: 'phone_number', header: '전화번호' },
  { id: 'actions', header: '관리' }
]

const resetFilters = () => {
  Object.assign(filters, { name: '', phone: '', email: '', cellGroupId: null, role: null })
  refresh()
}

const isModalOpen = ref(false)
const isEditing = ref(false)
const form = reactive({ id: null, name: '', phone_number: '', church_role: null, cell_group_id: null })

const openModal = (member?: any) => {
  isEditing.value = !!member
  if (member) Object.assign(form, { ...member })
  else Object.assign(form, { id: null, name: '', phone_number: '', church_role: null, cell_group_id: null })
  isModalOpen.value = true
}

const saveMember = async () => {
  const method = isEditing.value ? 'PATCH' : 'POST'
  const url = isEditing.value ? `/api/members/${form.id}` : '/api/members'
  try {
    await $fetch(url, { method, body: form })
    isModalOpen.value = false
    refresh()
  } catch (e) {}
}

const removeMember = async (member: any) => {
  if (confirm(`${member.name} 성도를 제적 처리하시겠습니까?`)) {
    await $fetch(`/api/members/${member.id}/remove`, { method: 'PATCH', body: { removedDate: new Date().toISOString().slice(0, 10) } })
    refresh()
  }
}

const reRegisterMember = async (member: any) => {
  if (confirm(`${member.name} 성도를 재등록하시겠습니까?`)) {
    await $fetch(`/api/members/${member.id}/re-register`, { method: 'PATCH' })
    refresh()
  }
}

const deleteMember = async (member: any) => {
  if (confirm('영구 삭제하시겠습니까?')) {
    await $fetch(`/api/members/${member.id}`, { method: 'DELETE' })
    refresh()
  }
}

const downloadExcel = () => {}
</script>
