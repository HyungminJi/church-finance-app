<template>
  <div class="space-y-6 text-slate-100">
    <!-- 헤더 컨트롤 -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-white">교회(Tenant) 관리</h2>
        <p class="text-sm text-slate-400 mt-1">시스템에 등록된 모든 교회 및 라이선스를 관리합니다.</p>
      </div>
      <UButton 
        icon="i-heroicons-plus" 
        color="primary" 
        label="새로운 교회 등록" 
        class="cursor-pointer font-bold shadow-md"
        @click="openCreateModal"
      />
    </div>

    <!-- 목록 데이터 테이블 -->
    <UCard class="bg-slate-900 border border-slate-800 shadow-xl" :ui="{ body: { padding: '' }, ring: '', divide: 'divide-y divide-slate-800' }">
      <UTable 
        :columns="columns" 
        :data="churches" 
        :loading="pending"
        class="w-full"
        :ui="{ th: { color: 'text-slate-400' }, td: { color: 'text-slate-200' } }"
      >
        <template #is_active-cell="{ row }">
          <UBadge :color="row.original.is_active ? 'green' : 'red'" variant="subtle" size="sm">
            {{ row.original.is_active ? '운영 중' : '비활성' }}
          </UBadge>
        </template>
        <template #created_at-cell="{ row }">
          {{ formatDate(row.original.created_at) }}
        </template>
        <template #actions-cell="{ row }">
          <div v-if="row.original.id !== '00000000-0000-0000-0000-000000000000'" class="flex gap-1">
            <UButton 
              icon="i-heroicons-arrow-right-on-rectangle" 
              color="neutral" 
              variant="ghost" 
              size="xs" 
              label="접속" 
              class="cursor-pointer text-brand-blue"
              title="해당 교회의 데이터로 직접 접속합니다."
              @click="impersonateChurch(row.original)"
            />
            <UButton 
              :icon="row.original.is_active ? 'i-heroicons-pause-circle' : 'i-heroicons-play-circle'"
              :color="row.original.is_active ? 'warning' : 'success'"
              variant="ghost" 
              size="xs" 
              :label="row.original.is_active ? '정지' : '활성화'"
              class="cursor-pointer"
              :title="row.original.is_active ? '서비스를 정지합니다. 해당 교회 사용자의 로그인이 차단됩니다.' : '서비스를 재개합니다.'"
              @click="toggleChurchStatus(row.original)"
            />
            <UButton 
              icon="i-heroicons-trash"
              color="error" 
              variant="ghost" 
              size="xs" 
              label="삭제"
              class="cursor-pointer"
              title="교회를 시스템에서 영구 삭제합니다."
              @click="deleteChurch(row.original)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- 교회 등록 모달 -->
    <UModal 
      v-model:open="isModalOpen" 
      title="새로운 교회 등록" 
      description="플랫폼에 새로운 교회(Tenant)를 개설합니다." 
      :ui="{ content: 'max-w-xl' }"
    >
      <template #content>
        <div class="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-xl space-y-6">
          <!-- 모달 헤더 -->
          <div class="flex items-center justify-between border-b dark:border-gray-800 pb-4">
            <h3 class="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-heroicons-building-office-2" class="text-primary-500" />
              새로운 교회 등록
            </h3>
            <UButton class="cursor-pointer" type="button" color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="isModalOpen = false" />
          </div>

          <!-- 폼 본문 -->
          <div class="space-y-4 py-2">
            <UFormField label="교회명" required>
              <UInput v-model="form.name" placeholder="예: 서울희망교회" class="w-full font-bold" autofocus />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="대표자(담임목사)명">
                <UInput v-model="form.representative_name" placeholder="예: 홍길동" class="w-full" />
              </UFormField>
              <UFormField label="사업자등록번호">
                <UInput v-model="form.registration_number" placeholder="예: 123-45-67890" class="w-full font-mono" />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="전화번호">
                <UInput v-model="form.phone_number" placeholder="예: 02-1234-5678" class="w-full" icon="i-heroicons-phone" />
              </UFormField>
              <UFormField label="회계 기수 (시작 연도)">
                <UInput v-model="form.current_fiscal_year" type="number" :placeholder="String(new Date().getFullYear())" class="w-full font-mono" icon="i-heroicons-calendar-days" />
              </UFormField>
            </div>

            <UFormField label="교회 주소">
              <UInput v-model="form.address" placeholder="예: 서울특별시 강남구 테헤란로 123" class="w-full" icon="i-heroicons-map-pin" />
            </UFormField>

            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p class="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                <UIcon name="i-heroicons-information-circle" class="w-4 h-4 mt-0.5 shrink-0" />
                <span>교회가 등록되면, 해당 교회의 초기 관리자(Admin) 계정은 추후 <strong>[데이터 보정 센터]</strong> 또는 직접 DB 설정을 통해 부여할 수 있습니다.</span>
              </p>
            </div>
          </div>

          <!-- 모달 하단 버튼 -->
          <div class="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
            <UButton 
              class="cursor-pointer" 
              label="취소" 
              color="neutral" 
              variant="ghost" 
              @click="isModalOpen = false" 
            />
            <UButton 
              label="교회 등록" 
              color="primary" 
              class="cursor-pointer font-black px-8 shadow-md" 
              size="lg"
              icon="i-heroicons-check"
              :loading="isSubmitting"
              :disabled="!form.name.trim()"
              @click="submitCreateChurch"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUIStore } from '~/stores/ui'

definePageMeta({
  layout: 'back-office',
  middleware: 'master'
})

const ui = useUIStore()
const { fetch: fetchSession } = useUserSession()

// 테이블 컬럼 설정
const columns = [
  { accessorKey: 'name', header: '교회명' },
  { accessorKey: 'id', header: 'Tenant ID' },
  { accessorKey: 'current_fiscal_year', header: '회계 기수' },
  { accessorKey: 'is_active', header: '상태' },
  { accessorKey: 'created_at', header: '등록일자' },
  { accessorKey: 'actions', header: '관리' }
]

// 데이터 페칭
const { data: fetchRes, pending, refresh } = await useFetch('/api/platform/churches')
const churches = computed(() => (fetchRes.value as any)?.data || [])

// 포맷터
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

// 등록 모달 상태
const isModalOpen = ref(false)
const isSubmitting = ref(false)
const form = reactive({
  name: '',
  representative_name: '',
  registration_number: '',
  phone_number: '',
  address: '',
  current_fiscal_year: new Date().getFullYear()
})

const openCreateModal = () => {
  form.name = ''
  form.representative_name = ''
  form.registration_number = ''
  form.phone_number = ''
  form.address = ''
  form.current_fiscal_year = new Date().getFullYear()
  isModalOpen.value = true
}

const submitCreateChurch = async () => {
  if (!form.name.trim()) return

  isSubmitting.value = true
  try {
    const res: any = await $fetch('/api/platform/churches', {
      method: 'POST',
      body: {
        name: form.name.trim(),
        representative_name: form.representative_name.trim() || null,
        registration_number: form.registration_number.trim() || null,
        phone_number: form.phone_number.trim() || null,
        address: form.address.trim() || null,
        current_fiscal_year: form.current_fiscal_year || null
      }
    })

    if (res.success) {
      ui.showAlert('등록 완료', res.message, 'success')
      isModalOpen.value = false
      await refresh()
    }
  } catch (err: any) {
    ui.showAlert('오류', err.data?.statusMessage || '교회 등록에 실패했습니다.', 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 타 교회 데이터망 접속 (테넌트 스위칭)
const impersonateChurch = async (church: any) => {
  const confirmed = await ui.showConfirm(
    '데이터망 접속',
    `[${church.name}] 데이터 환경으로 접속하시겠습니까?\n작업을 마치면 백오피스(진단 및 보정 도구)에서 언제든 원래 환경으로 복귀할 수 있습니다.`,
    'info'
  )
  if (!confirmed) return

  try {
    const res: any = await $fetch('/api/auth/switch-tenant', {
      method: 'POST',
      body: { targetChurchId: church.id }
    })
    
    if (res.success) {
      ui.showAlert('전환 성공', res.message, 'success')
      await fetchSession() // 세션 갱신
      setTimeout(() => {
        window.location.href = '/' // 앱 메인 화면으로 리다이렉트 및 새로고침
      }, 1000)
    }
  } catch (err: any) {
    ui.showAlert('접속 실패', err.data?.statusMessage || '오류가 발생했습니다.', 'error')
  }
}

// 교회 상태 토글 (운영 중 ↔ 비활성화)
const toggleChurchStatus = async (church: any) => {
  const newStatus = !church.is_active
  const actionText = newStatus ? '서비스를 재개(활성화)' : '서비스를 정지(비활성화)'
  const warningText = newStatus 
    ? `[${church.name}] 교회의 서비스를 재개하시겠습니까?\n해당 교회 사용자들이 다시 로그인할 수 있게 됩니다.`
    : `[${church.name}] 교회의 서비스를 정지하시겠습니까?\n해당 교회의 모든 사용자가 로그인할 수 없게 됩니다.`

  const confirmed = await ui.showConfirm(
    `교회 ${actionText}`,
    warningText,
    newStatus ? 'info' : 'warning',
    actionText
  )
  if (!confirmed) return

  try {
    const res: any = await $fetch(`/api/platform/churches/${church.id}`, {
      method: 'PATCH',
      body: { is_active: newStatus }
    })
    if (res.success) {
      ui.showAlert('처리 완료', res.message, 'success')
      await refresh()
    }
  } catch (err: any) {
    ui.showAlert('오류', err.data?.statusMessage || '상태 변경에 실패했습니다.', 'error')
  }
}

// 교회 영구 삭제
const deleteChurch = async (church: any) => {
  const confirmed = await ui.showConfirm(
    '교회 영구 삭제',
    `[${church.name}] 교회를 시스템에서 영구 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없으며, 해당 교회의 사용자 계정도 함께 삭제됩니다.\n(전표 데이터가 존재하는 교회는 삭제할 수 없습니다.)`,
    'error',
    '영구 삭제'
  )
  if (!confirmed) return

  try {
    const res: any = await $fetch(`/api/platform/churches/${church.id}`, {
      method: 'DELETE'
    })
    if (res.success) {
      ui.showAlert('삭제 완료', res.message, 'success')
      await refresh()
    }
  } catch (err: any) {
    ui.showAlert('삭제 실패', err.data?.statusMessage || '교회 삭제에 실패했습니다.', 'error')
  }
}
</script>

<style scoped>
/* Nuxt UI 테이블 다크모드 대응 커스텀 */
:deep(th) {
  background-color: #0f172a !important; /* slate-900 */
  color: #94a3b8 !important; /* slate-400 */
  border-bottom: 1px solid #1e293b !important; /* slate-800 */
}
:deep(td) {
  background-color: #0f172a !important;
  color: #e2e8f0 !important; /* slate-200 */
  border-bottom: 1px solid #1e293b !important;
}
:deep(tr:hover td) {
  background-color: #1e293b !important; /* hover: slate-800 */
}
</style>
