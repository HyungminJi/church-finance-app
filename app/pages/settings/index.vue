<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex items-center space-x-2 mb-6">
      <UIcon name="i-heroicons-cog-6-tooth" class="w-8 h-8 text-brand-blue" />
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">환경설정</h1>
    </div>

    <!-- 탭 네비게이션 -->
    <div class="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-xl px-4 pt-4">
      <nav class="-mb-px flex space-x-8 overflow-x-auto custom-scrollbar" aria-label="Tabs">
        <button
          v-for="tab in visibleTabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="whitespace-nowrap pb-4 px-1 border-b-2 font-bold text-sm cursor-pointer transition-colors"
          :class="[
            activeTab === tab.id
              ? 'border-brand-blue text-brand-blue'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
          ]"
        >
          <UIcon :name="tab.icon" class="w-5 h-5 inline-block mr-2 align-text-bottom" />
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- 탭 콘텐츠 영역 -->
    <div class="bg-white dark:bg-gray-800 shadow-sm rounded-b-xl border border-t-0 border-gray-200 dark:border-gray-700 p-6 min-h-[500px]">
      
      <!-- 1. 계정 정보 (공통) -->
      <div v-if="activeTab === 'profile'" class="space-y-8 animate-in fade-in slide-in-from-bottom-2">
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">내 계정 정보</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
            <div class="space-y-1">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">사용자 이름</p>
              <p class="text-lg font-medium text-gray-900 dark:text-white">{{ user?.name || '-' }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">로그인 ID</p>
              <p class="text-lg font-medium text-gray-900 dark:text-white">{{ user?.login_id || '-' }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">시스템 권한</p>
              <UBadge 
                v-if="user?.role !== undefined"
                :color="getRoleBadgeColor(user.role)" 
                variant="solid" 
                class="font-bold px-3 py-1 rounded-md shadow-sm"
              >
                {{ getRoleInfo(user.role).label }}
              </UBadge>
            </div>
            <div class="flex items-end">
              <UButton 
                icon="i-heroicons-key" 
                color="primary" 
                label="비밀번호 변경" 
                class="font-bold cursor-pointer shadow-sm px-6" 
                @click="isPasswordModalOpen = true"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 2. 교회 기본 정보 (Admin 이상) -->
      <div v-else-if="activeTab === 'church'" class="space-y-8 animate-in fade-in slide-in-from-bottom-2">
        <div class="flex items-center justify-between border-b pb-4 dark:border-gray-700">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">교회 기본 정보 관리</h2>
          <UButton 
            color="primary" 
            icon="i-heroicons-document-check" 
            class="font-bold cursor-pointer px-6"
            :loading="isSavingChurch"
            @click="handleSaveChurchInfo"
          >
            저장하기
          </UButton>
        </div>
        <div v-if="loadingChurch" class="py-20 flex justify-center">
          <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin text-gray-400" />
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField label="교회 이름" required>
            <UInput v-model="churchForm.name" placeholder="예: 창세교회" class="w-full" size="lg" />
          </UFormField>
          <UFormField label="대표자(담임목사)명" required>
            <UInput v-model="churchForm.representative_name" placeholder="대표자명 입력" class="w-full" size="lg" />
          </UFormField>
          <UFormField label="고유번호(사업자번호)">
            <UInput v-model="churchForm.registration_number" placeholder="000-00-00000" class="w-full" size="lg" />
          </UFormField>
          <UFormField label="전화번호">
            <UInput v-model="churchForm.phone_number" placeholder="교회 대표 연락처" class="w-full" size="lg" />
          </UFormField>
          <UFormField label="소재지 주소" class="md:col-span-2">
            <UInput v-model="churchForm.address" placeholder="교회 주소 전체 입력" class="w-full" size="lg" />
          </UFormField>
        </div>
        <div class="border-t dark:border-gray-700 pt-6">
          <h3 class="text-lg font-bold mb-4">공식 이미지 관리</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer relative overflow-hidden group">
              <div v-if="churchForm.logo_image_path" class="absolute inset-0 bg-white dark:bg-gray-900 z-10">
                <img :src="churchForm.logo_image_path" class="w-full h-full object-contain p-2" />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <UButton color="error" variant="soft" icon="i-heroicons-trash" @click.stop="churchForm.logo_image_path = null" />
                </div>
              </div>
              <UIcon name="i-heroicons-photo" class="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p class="font-bold text-sm text-gray-600">교회 로고 업로드</p>
              <p class="text-xs text-gray-400 mt-1">PNG, JPG (최대 2MB)</p>
              <input type="file" class="absolute inset-0 opacity-0 cursor-pointer" @change="(e: Event) => handleFileUpload(e, 'logo')" accept="image/*" />
            </div>
            <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer relative overflow-hidden group">
              <div v-if="churchForm.seal_image_path" class="absolute inset-0 bg-white dark:bg-gray-900 z-10">
                <img :src="churchForm.seal_image_path" class="w-full h-full object-contain p-4" />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <UButton color="error" variant="soft" icon="i-heroicons-trash" @click.stop="churchForm.seal_image_path = null" />
                </div>
              </div>
              <UIcon name="i-heroicons-stamp" class="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p class="font-bold text-sm text-gray-600">직인(도장) 이미지 업로드</p>
              <p class="text-xs text-gray-400 mt-1">배경이 투명한 PNG 권장</p>
              <input type="file" class="absolute inset-0 opacity-0 cursor-pointer" @change="(e: Event) => handleFileUpload(e, 'seal')" accept="image/*" />
            </div>
          </div>
        </div>
      </div>

      <!-- 3. 마감 관리 (Admin 이상) -->
      <div v-else-if="activeTab === 'closing'" class="space-y-8 animate-in fade-in slide-in-from-bottom-2">
        <div class="flex items-center justify-between border-b pb-4 dark:border-gray-700">
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">회계 기수 및 마감 관리</h2>
            <p class="text-sm text-gray-500 mt-1">마감된 기간 이전의 전표는 수정하거나 삭제할 수 없습니다.</p>
          </div>
        </div>
        <div class="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-200 dark:border-amber-800">
          <div class="flex items-start gap-4">
            <UIcon name="i-heroicons-lock-closed" class="w-8 h-8 text-amber-500 shrink-0 mt-1" />
            <div class="space-y-4 w-full">
              <div>
                <h3 class="font-bold text-amber-900 dark:text-amber-100 text-lg">현재 장부 마감일</h3>
                <p v-if="churchForm.closing_date" class="text-sm text-amber-700 dark:text-amber-300 font-bold mt-1">
                  {{ formatDate(churchForm.closing_date) }} 기준으로 마감되었습니다.
                </p>
                <p v-else class="text-sm text-amber-700 dark:text-amber-300 mt-1">현재 마감일이 설정되지 않았습니다. 모든 데이터 수정이 가능합니다.</p>
              </div>
              <div class="flex items-end gap-4 max-w-md">
                <UFormField label="마감 기준일 지정" class="flex-1">
                  <UInput type="date" v-model="closingDateInput" size="lg" class="w-full font-mono" />
                </UFormField>
                <UButton 
                  color="warning" 
                  icon="i-heroicons-lock-closed" 
                  class="font-bold cursor-pointer px-6" 
                  size="lg"
                  :loading="isSavingClosing"
                  @click="handleSaveClosingDate"
                >
                  마감 적용
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. 백업 관리 (Admin 이상) -->
      <div v-else-if="activeTab === 'backup'" class="space-y-8 animate-in fade-in slide-in-from-bottom-2">
        <div class="flex items-center justify-between border-b pb-4 dark:border-gray-700">
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">데이터 백업</h2>
            <p class="text-sm text-gray-500 mt-1">안전한 보관을 위해 전체 재정 데이터를 엑셀로 다운로드합니다.</p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="p-6 border rounded-xl dark:border-gray-700 flex flex-col justify-between h-48 hover:border-brand-blue transition-colors">
            <div>
              <UIcon name="i-heroicons-table-cells" class="w-10 h-10 text-brand-green mb-3" />
              <h3 class="font-bold text-lg">전체 전표 내역 백업</h3>
              <p class="text-sm text-gray-500 mt-1">시스템 시작일부터 현재까지의 모든 수입/지출 전표를 추출합니다.</p>
            </div>
            <UButton 
              color="neutral" 
              variant="outline" 
              icon="i-heroicons-arrow-down-tray" 
              class="cursor-pointer font-bold justify-center" 
              block
              :loading="isBackingUpTransactions"
              @click="handleBackupTransactions"
            >
              엑셀 다운로드
            </UButton>
          </div>
          <div class="p-6 border rounded-xl dark:border-gray-700 flex flex-col justify-between h-48 hover:border-brand-blue transition-colors">
            <div>
              <UIcon name="i-heroicons-users" class="w-10 h-10 text-brand-blue mb-3" />
              <h3 class="font-bold text-lg">전체 성도/헌금자 백업</h3>
              <p class="text-sm text-gray-500 mt-1">등록된 모든 헌금자(성도, 구역, 단체) 정보를 추출합니다.</p>
            </div>
            <UButton 
              color="neutral" 
              variant="outline" 
              icon="i-heroicons-arrow-down-tray" 
              class="cursor-pointer font-bold justify-center" 
              block
              :loading="isBackingUpDonors"
              @click="handleBackupDonors"
            >
              엑셀 다운로드
            </UButton>
          </div>
        </div>
      </div>

      <!-- 5. 플랫폼 관리 (Master 전용) -->
      <div v-else-if="activeTab === 'platform'" class="space-y-8 animate-in fade-in slide-in-from-bottom-2">
        <div class="flex items-center justify-between border-b pb-4 border-red-200 dark:border-red-900/30">
          <div>
            <h2 class="text-xl font-bold text-red-600 flex items-center">
              <UIcon name="i-heroicons-shield-exclamation" class="w-6 h-6 mr-2" />
              플랫폼 본사 전용 도구 (Master Only)
            </h2>
            <p class="text-sm text-gray-500 mt-1">기술 지원 및 고객의 소리(VOC) 해결을 위한 강력한 도구입니다.</p>
          </div>
        </div>

        <!-- 테넌트 스위처 -->
        <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 class="font-bold text-lg mb-4 flex items-center text-slate-800 dark:text-slate-200">
            <UIcon name="i-heroicons-arrow-path-rounded-square" class="w-5 h-5 mr-2 text-brand-blue" />
            작업 대상 테넌트(교회) 스위칭
          </h3>
          <div class="flex items-end gap-4 max-w-2xl">
            <UFormField label="지원할 교회 선택" class="flex-1">
              <USelectMenu 
                v-model="selectedTenantId" 
                :items="allChurches" 
                value-key="id" 
                label-key="name" 
                placeholder="교회를 선택하세요" 
                size="lg" 
                class="w-full font-bold"
                :loading="loadingChurches"
              />
            </UFormField>
            <UButton 
              color="primary" 
              icon="i-heroicons-arrow-right-circle" 
              class="font-bold cursor-pointer px-6 shadow-md" 
              size="lg"
              :disabled="!selectedTenantId || isSwitching"
              :loading="isSwitching"
              @click="switchTenant"
            >
              해당 환경으로 진입
            </UButton>
          </div>
          <p class="text-xs text-gray-500 mt-3 italic">
            * 진입 시 상단에 경고 배너가 나타나며, 원래 환경으로 돌아오려면 스위칭을 해제하거나 다시 본사를 선택하세요.
          </p>
        </div>

        <!-- 데이터 강제 보정 툴 -->
        <div class="bg-red-50 dark:bg-red-900/10 p-6 rounded-xl border border-red-100 dark:border-red-900/30 opacity-70 hover:opacity-100 transition-opacity">
          <h3 class="font-bold text-lg mb-2 text-red-800 dark:text-red-300 flex items-center">
            <UIcon name="i-heroicons-wrench-screwdriver" class="w-5 h-5 mr-2" />
            데이터 무결성 강제 보정 툴
          </h3>
          <p class="text-sm text-red-600/80 dark:text-red-400 mb-4">
            통장 기초 잔액 0원화 및 전기이월금 전표 강제 생성 등, 대차가 맞지 않는 교회의 데이터를 강제로 치료하는 일괄 스크립트를 GUI로 실행합니다.
          </p>
          <UButton 
            color="error" 
            variant="soft" 
            icon="i-heroicons-exclamation-triangle" 
            class="font-bold cursor-pointer"
            :loading="isCorrecting"
            @click="executeCorrectionScript"
          >
            치료 스크립트 실행
          </UButton>
        </div>
      </div>

    </div>

    <!-- 비밀번호 변경 모달 -->
    <UModal v-model:open="isPasswordModalOpen">
      <template #content>
        <div class="flex flex-col bg-white dark:bg-slate-900 shadow-2xl rounded-2xl overflow-hidden max-w-md w-full mx-auto border border-slate-100 dark:border-slate-800">
          <div class="px-6 py-5 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white flex items-center">
              <UIcon name="i-heroicons-lock-closed" class="w-6 h-6 mr-2 text-brand-blue" />
              비밀번호 변경
            </h3>
            <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="closePasswordModal" class="cursor-pointer" />
          </div>

          <form @submit.prevent="handlePasswordChange" class="p-6 space-y-5">
            <UFormField label="현재 비밀번호" required>
              <UInput v-model="passwordForm.current" type="password" placeholder="현재 사용 중인 비밀번호" size="lg" class="w-full" icon="i-heroicons-shield-check" required />
            </UFormField>
            <div class="space-y-4 border-t dark:border-slate-800 pt-4">
              <UFormField label="새 비밀번호" required>
                <UInput v-model="passwordForm.new" type="password" placeholder="새로운 비밀번호 입력" size="lg" class="w-full" icon="i-heroicons-key" required />
              </UFormField>
              <UFormField label="새 비밀번호 확인" required>
                <UInput v-model="passwordForm.confirm" type="password" placeholder="새로운 비밀번호 다시 입력" size="lg" class="w-full" icon="i-heroicons-check-circle" required />
              </UFormField>
            </div>
            <p v-if="passwordError" class="text-sm text-red-500 font-medium flex items-center">
              <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 mr-1" />
              {{ passwordError }}
            </p>
          </form>

          <div class="px-6 py-5 border-t dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
            <UButton color="neutral" variant="ghost" size="lg" @click="closePasswordModal" label="취소" class="cursor-pointer font-bold px-6" />
            <UButton color="primary" size="lg" @click="handlePasswordChange" label="변경 완료" class="font-bold cursor-pointer px-6 shadow-md" :loading="isSubmitting" />
          </div>
        </div>
      </template>
    </UModal>

    <!-- 성공 알림 모달 -->
    <UModal v-model:open="isSuccessModalOpen">
      <template #content>
        <div class="p-10 text-center space-y-6 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl">
          <div class="flex justify-center">
            <div class="bg-brand-green/10 dark:bg-brand-green/20 p-5 rounded-full ring-8 ring-brand-green/5">
              <UIcon name="i-heroicons-check-circle" class="w-20 h-20 text-brand-green" />
            </div>
          </div>
          <div class="space-y-2">
            <h3 class="text-2xl font-bold text-slate-900 dark:text-white">변경 완료</h3>
            <p class="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">성공적으로 처리되었습니다.</p>
          </div>
          <div class="pt-4">
            <UButton color="primary" label="확인" class="w-full justify-center font-extrabold cursor-pointer py-4 text-lg shadow-xl" @click="isSuccessModalOpen = false" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { getRoleInfo, formatDate } from '~/utils/formatter'
import { useAuthStore } from '~/stores/auth'
import { UserRole, ROLE_META, SYSTEM_CHURCH_ID } from '~/types/auth'
import { useUIStore } from '~/stores/ui'
import * as XLSX from 'xlsx'

const { user, fetch: fetchSession } = useUserSession()
const authStore = useAuthStore()
const ui = useUIStore()

// 탭 관리 로직
const activeTab = ref('profile')

watch(activeTab, (newTab) => {
  if (newTab === 'church' || newTab === 'closing') {
    fetchChurchInfo()
  }
  if (newTab === 'platform') {
    fetchAllChurches()
  }
})

// 교회 정보 관리 로직
const churchForm = reactive({
  name: '',
  representative_name: '',
  registration_number: '',
  address: '',
  phone_number: '',
  logo_image_path: null as string | null,
  seal_image_path: null as string | null,
  closing_date: null as string | Date | null
})

const loadingChurch = ref(false)
const isSavingChurch = ref(false)
const isSavingClosing = ref(false)
const closingDateInput = ref('')

const fetchChurchInfo = async () => {
  loadingChurch.value = true
  try {
    const res: any = await $fetch('/api/churches/current')
    if (res.success && res.data) {
      Object.assign(churchForm, res.data)
      if (res.data.closing_date) {
        closingDateInput.value = formatDate(res.data.closing_date)
      } else {
        closingDateInput.value = ''
      }
    }
  } catch (e) {
    console.error('Failed to fetch church info', e)
  } finally {
    loadingChurch.value = false
  }
}

const handleSaveChurchInfo = async () => {
  isSavingChurch.value = true
  try {
    const res: any = await $fetch('/api/churches/current', {
      method: 'PATCH',
      body: churchForm
    })
    if (res.success) {
      ui.showAlert('저장 완료', '교회 정보가 성공적으로 저장되었습니다.', 'success')
      if (res.data?.logo_image_path) churchForm.logo_image_path = res.data.logo_image_path
      if (res.data?.seal_image_path) churchForm.seal_image_path = res.data.seal_image_path
    }
  } catch (e: any) {
    ui.showAlert('저장 실패', e.data?.statusMessage || '오류가 발생했습니다.', 'error')
  } finally {
    isSavingChurch.value = false
  }
}

const handleSaveClosingDate = async () => {
  const confirmed = await ui.showConfirm(
    '장부 마감 설정', 
    closingDateInput.value 
      ? `${closingDateInput.value} 기준으로 장부를 마감하시겠습니까? 이 날짜 이전의 전표는 수정/삭제할 수 없게 됩니다.`
      : '장부 마감을 해제하시겠습니까? 모든 데이터의 수정/삭제가 가능해집니다.', 
    'warning'
  )
  
  if (!confirmed) return

  isSavingClosing.value = true
  try {
    const res: any = await $fetch('/api/settings/closing', {
      method: 'PATCH',
      body: { closing_date: closingDateInput.value || null }
    })
    if (res.success) {
      ui.showAlert('설정 완료', res.message, 'success')
      churchForm.closing_date = closingDateInput.value || null
    }
  } catch (e: any) {
    ui.showAlert('설정 실패', e.data?.statusMessage || '오류가 발생했습니다.', 'error')
  } finally {
    isSavingClosing.value = false
  }
}

const handleFileUpload = (event: Event, type: 'logo' | 'seal') => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    ui.showAlert('업로드 제한', '2MB 이하의 이미지만 업로드 가능합니다.', 'warning')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target?.result as string
    if (type === 'logo') churchForm.logo_image_path = base64
    else churchForm.seal_image_path = base64
  }
  reader.readAsDataURL(file)
}

const allTabs = [
  { id: 'profile', name: '내 계정', icon: 'i-heroicons-user' },
  { id: 'church', name: '교회 정보', icon: 'i-heroicons-building-office' },
  { id: 'closing', name: '장부 마감', icon: 'i-heroicons-lock-closed' },
  { id: 'backup', name: '데이터 백업', icon: 'i-heroicons-arrow-down-tray' },
  { id: 'platform', name: '플랫폼 관리', icon: 'i-heroicons-shield-exclamation' }
]

const visibleTabs = computed(() => {
  const tabs = [...allTabs]
  // 스토어 대신 세션의 user 객체를 직접 참조 (새로고침 대응)
  const isMasterAccount = user.value?.role === UserRole.MASTER || Number(user.value?.role) === 0
  
  if (!isMasterAccount) {
    return tabs.filter(t => t.id !== 'platform')
  }
  return tabs
})

const getRoleBadgeColor = (role: any): "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral" => {
  const r = Number(role) as UserRole
  return ROLE_META[r]?.color as any || 'neutral'
}

// 비밀번호 변경 로직
const isPasswordModalOpen = ref(false)
const isSuccessModalOpen = ref(false)
const isSubmitting = ref(false)
const passwordError = ref('')

const passwordForm = reactive({ current: '', new: '', confirm: '' })

const closePasswordModal = () => {
  isPasswordModalOpen.value = false
  passwordForm.current = ''
  passwordForm.new = ''
  passwordForm.confirm = ''
  passwordError.value = ''
}

const handlePasswordChange = async () => {
  if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
    passwordError.value = '모든 필드를 입력해 주세요.'
    return
  }
  if (passwordForm.new !== passwordForm.confirm) {
    passwordError.value = '새 비밀번호가 일치하지 않습니다.'
    return
  }
  if (passwordForm.new.length < 4) {
    passwordError.value = '비밀번호는 최소 4자 이상이어야 합니다.'
    return
  }

  passwordError.value = ''
  isSubmitting.value = true

  try {
    const res: any = await $fetch('/api/auth/change-password', {
      method: 'PATCH',
      body: { currentPassword: passwordForm.current, newPassword: passwordForm.new }
    })
    if (res.success) {
      closePasswordModal()
      isSuccessModalOpen.value = true
    }
  } catch (error: any) {
    console.error('Password change error:', error)
    passwordError.value = error.data?.statusMessage || '비밀번호 변경 중 오류가 발생했습니다.'
  } finally {
    isSubmitting.value = false
  }
}

// 데이터 백업 로직
const isBackingUpTransactions = ref(false)
const isBackingUpDonors = ref(false)

const handleBackupTransactions = async () => {
  isBackingUpTransactions.value = true
  try {
    const res: any = await $fetch('/api/settings/backup/transactions')
    if (res.success && res.data.length > 0) {
      const isMasterAll = authStore.isMaster && (!selectedTenantId.value || selectedTenantId.value === SYSTEM_CHURCH_ID)
      
      const wsData = [
        ['전체 전표 내역 백업'],
        [`다운로드 일시: ${formatDate(new Date())}`],
        [],
        isMasterAll 
          ? ['교회명', '일자', '계정구분', '계정과목', '통장/현금', '헌금자/대상', '금액', '적요', '입력일시']
          : ['일자', '계정구분', '계정과목', '통장/현금', '헌금자/대상', '금액', '적요', '입력일시'],
        ...res.data.map((t: any) => isMasterAll 
          ? [t.church_name || '본사/시스템', t.date, t.account_type === 'INCOME' ? '수입' : '지출', t.account_name, t.fund_name, t.donor_name || '-', t.amount, t.description || '-', t.created_at]
          : [t.date, t.account_type === 'INCOME' ? '수입' : '지출', t.account_name, t.fund_name, t.donor_name || '-', t.amount, t.description || '-', t.created_at]
        )
      ]
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(wsData)
      XLSX.utils.book_append_sheet(wb, ws, '전표내역')
      const fileName = isMasterAll ? '전체교회_전표내역_백업.xlsx' : `전표내역_백업_${formatDate(new Date())}.xlsx`
      XLSX.writeFile(wb, fileName)
      ui.showAlert('백업 완료', '전표 데이터 추출이 완료되었습니다.', 'success')
    } else {
      ui.showAlert('데이터 없음', '백업할 데이터가 없습니다.', 'warning')
    }
  } catch (e: any) {
    ui.showAlert('백업 실패', e.data?.statusMessage || '전표 백업 중 오류가 발생했습니다.', 'error')
  } finally {
    isBackingUpTransactions.value = false
  }
}

const handleBackupDonors = async () => {
  isBackingUpDonors.value = true
  try {
    const res: any = await $fetch('/api/settings/backup/donors')
    if (res.success && res.data.length > 0) {
      const isMasterAll = authStore.isMaster && (!selectedTenantId.value || selectedTenantId.value === SYSTEM_CHURCH_ID)
      
      const wsData = [
        ['전체 성도 및 헌금자 백업'],
        [`다운로드 일시: ${formatDate(new Date())}`],
        [],
        isMasterAll
          ? ['교회명', '구분', '성함/명칭', '직분', '구역명', '연락처', '배우자', '생년월일', '주소', '상세주소', '시스템접속']
          : ['구분', '성함/명칭', '직분', '구역명', '연락처', '배우자', '생년월일', '주소', '상세주소', '시스템접속'],
        ...res.data.map((d: any) => {
          const typeLabel = d.donor_type === 'MEMBER' ? '성도' : d.donor_type === 'CELL_GROUP' ? '구역/소모임' : '외부기관/단체'
          const rowData = [
            typeLabel, 
            d.name, 
            d.church_role_name || '-', 
            d.cell_group_name || '-', 
            d.phone_number || '-', 
            d.spouse_name || '-', 
            d.birth_date || '-', 
            d.address || '-', 
            d.detail_address || '-',
            d.is_user ? 'O' : 'X'
          ]
          return isMasterAll ? [d.church_name || '본사/시스템', ...rowData] : rowData
        })
      ]
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(wsData)
      XLSX.utils.book_append_sheet(wb, ws, '성도_헌금자명단')
      const fileName = isMasterAll ? '전체교회_헌금자_백업.xlsx' : `헌금자_백업_${formatDate(new Date())}.xlsx`
      XLSX.writeFile(wb, fileName)
      ui.showAlert('백업 완료', '성도 및 헌금자 데이터 추출이 완료되었습니다.', 'success')
    } else {
      ui.showAlert('데이터 없음', '백업할 데이터가 없습니다.', 'warning')
    }
  } catch (e: any) {
    ui.showAlert('백업 실패', e.data?.statusMessage || '헌금자 백업 중 오류가 발생했습니다.', 'error')
  } finally {
    isBackingUpDonors.value = false
  }
}

// Master 전용 테넌트 스위칭 로직
interface ChurchOption {
  id: string
  name: string
}
const allChurches = ref<ChurchOption[]>([])
const loadingChurches = ref(false)
const selectedTenantId = ref<string | undefined>(undefined)
const isSwitching = ref(false)

const fetchAllChurches = async () => {
  if (!authStore.isMaster) return

  loadingChurches.value = true
  try {
    const res: any = await $fetch('/api/churches')
    if (res.success) {
      // 본사 아이디를 배열 맨 앞에 강제 추가 (원상 복구용)
      allChurches.value = [
        { id: SYSTEM_CHURCH_ID, name: '★ 플랫폼 본사 (기술지원 종료/복귀)' },
        ...res.data.filter((c: any) => c.id !== SYSTEM_CHURCH_ID)
      ] as any
      
      // 현재 열람 중인 교회를 기본값으로 설정
      selectedTenantId.value = user.value?.church_id
    }
  } catch (e) {
    console.error('Failed to fetch churches', e)
  } finally {
    loadingChurches.value = false
  }
}

// 데이터 강제 보정 툴 로직
const isCorrecting = ref(false)

const executeCorrectionScript = async () => {
  const confirmed = await ui.showConfirm(
    '데이터 강제 보정', 
    '현재 열람 중인 교회의 기초 잔액을 0으로 초기화하고 전년이월금 전표로 변환하며, 누락된 통장 정보를 강제 연결합니다. 정말 실행하시겠습니까?', 
    'warning'
  )
  
  if (!confirmed) return

  isCorrecting.value = true
  try {
    const res: any = await $fetch('/api/platform/correct-data', {
      method: 'POST'
    })
    
    if (res.success) {
      ui.showAlert('보정 완료', res.message, 'success')
    }
  } catch (e: any) {
    ui.showAlert('보정 실패', e.data?.statusMessage || '오류가 발생했습니다.', 'error')
  } finally {
    isCorrecting.value = false
  }
}

const switchTenant = async () => {
  if (!selectedTenantId.value) return
  isSwitching.value = true
  try {
    const res: any = await $fetch('/api/auth/switch-tenant', {
      method: 'POST',
      body: { targetChurchId: selectedTenantId.value }
    })
    
    if (res.success) {
      ui.showAlert('전환 성공', res.message, 'success')
      await fetchSession() // 세션 정보 다시 불러오기
      setTimeout(() => {
        window.location.href = '/' // 완전히 새로고침하여 바뀐 컨텍스트 적용
      }, 1000)
    }
  } catch (e: any) {
    ui.showAlert('전환 실패', e.data?.statusMessage || '오류가 발생했습니다.', 'error')
  } finally {
    isSwitching.value = false
  }
}

onMounted(() => {
  if (authStore.isMaster) {
    fetchAllChurches()
  }
})
</script>
