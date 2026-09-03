<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex items-center space-x-2 mb-6">
      <UIcon name="i-heroicons-cog-6-tooth" class="w-8 h-8 text-primary-500" />
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
              ? 'border-primary-500 text-primary-500'
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
        <div v-else class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div class="flex gap-2">
                <UInput v-model="churchForm.address" placeholder="주소 검색 버튼을 눌러 입력하세요" class="flex-1" size="lg" readonly />
                <UButton 
                  color="primary" 
                  icon="i-heroicons-magnifying-glass" 
                  label="주소 검색" 
                  class="font-bold cursor-pointer px-6"
                  @click="isAddressModalOpen = true"
                />
              </div>
            </UFormField>
          </div>

          <!-- 테마 색상 설정 (항상 보이도록 보장) -->
          <div class="border-t dark:border-gray-700 pt-8">
            <div class="flex items-center gap-2 mb-4">
              <UIcon name="i-heroicons-paint-brush" class="w-6 h-6 text-primary-500" />
              <h3 class="text-lg font-black">시스템 테마 색상 (Theme Color)</h3>
            </div>
            <p class="text-sm text-gray-500 mb-6 font-medium">우리 교회 시스템의 주요 버튼 및 강조 색상을 교회의 상징 색으로 변경합니다.</p>
            <div class="flex flex-wrap gap-6 items-center">
              <div v-for="color in ['blue', 'green', 'purple', 'rose', 'amber']" :key="color" class="flex flex-col items-center gap-2">
                <button 
                  type="button" 
                  @click="churchForm.theme_color = color" 
                  :class="[
                    'w-12 h-12 rounded-full transition-all cursor-pointer border-4 border-white dark:border-slate-800 shadow-lg',
                    color === 'blue' ? 'bg-blue-500' : 
                    color === 'green' ? 'bg-emerald-500' : 
                    color === 'purple' ? 'bg-purple-500' : 
                    color === 'rose' ? 'bg-rose-500' : 'bg-amber-500',
                    churchForm.theme_color === color ? 'ring-4 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'
                  ]"
                ></button>
                <span class="text-[10px] font-bold uppercase text-slate-400">{{ color }}</span>
              </div>
            </div>
          </div>
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

      <!-- 3. 마감 관리 (Manager 이상) -->
      <div v-else-if="activeTab === 'closing'" class="space-y-8 animate-in fade-in slide-in-from-bottom-2">
        <div class="flex items-center justify-between border-b pb-4 dark:border-gray-700">
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">회계 기수 및 마감 관리</h2>
            <p class="text-sm text-gray-500 mt-1">현재 회계 기수(연도)를 지정하거나 장부 마감일을 설정합니다. 마감 시 차기 연도로 전년이월금 전표가 자동 생성됩니다.</p>
          </div>
        </div>
        
        <div class="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-xl border border-primary-200 dark:border-primary-800">
          <div class="flex items-start gap-4">
            <UIcon name="i-heroicons-calendar-days" class="w-8 h-8 text-primary-500 shrink-0 mt-1" />
            <div class="space-y-4 w-full">
              <div>
                <h3 class="font-bold text-primary-900 dark:text-primary-100 text-lg">현재 회계 기수(연도) 설정</h3>
                <p class="text-sm text-primary-700 dark:text-primary-300 mt-1">
                  모든 화면 상단에 표시되는 회계 연도를 지정합니다. 
                  <span class="font-bold">(현재: {{ churchForm.current_fiscal_year || new Date().getFullYear() }}년도)</span>
                </p>
              </div>
              <div class="flex items-end gap-4 max-w-md">
                <UFormField label="회계 연도" class="flex-1">
                  <UInput type="number" v-model="fiscalYearInput" size="lg" class="w-full font-mono" />
                </UFormField>
                <UButton 
                  color="primary" 
                  icon="i-heroicons-check" 
                  class="font-bold cursor-pointer px-6" 
                  size="lg"
                  :loading="isSavingFiscalYear"
                  @click="handleSaveFiscalYear"
                >
                  기수 저장
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-200 dark:border-amber-800">
          <div class="flex items-start gap-4">
            <UIcon name="i-heroicons-lock-closed" class="w-8 h-8 text-amber-500 shrink-0 mt-1" />
            <div class="space-y-4 w-full">
              <div>
                <h3 class="font-bold text-amber-900 dark:text-amber-100 text-lg">장부 마감 및 자동 이월</h3>
                <p v-if="churchForm.closing_date" class="text-sm text-amber-700 dark:text-amber-300 font-bold mt-1">
                  현재 [ <span class="text-amber-900 dark:text-amber-50">{{ churchForm.closedByName || '관리자' }}</span> ] 담당자에 의해 {{ formatDate(churchForm.closing_date) }} 기준으로 마감되었습니다.
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
              <div class="bg-amber-100/60 dark:bg-amber-900/30 p-3 rounded-lg mt-2">
                <p class="text-xs text-amber-800 dark:text-amber-200 font-medium">
                  <UIcon name="i-heroicons-information-circle" class="w-4 h-4 inline-block mr-1 align-text-bottom" />
                  마감 적용 시 마감 기준일까지의 통장별 잔액을 자동 합산하여, 차기 회계 연도({{ (churchForm.current_fiscal_year || new Date().getFullYear()) + 1 }}년) 시작일에 <strong>'전년이월금'</strong> 전표가 자동 생성됩니다. 마감 해제 시 해당 이월 전표는 자동으로 삭제됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 최근 이월 결과 표시 -->
        <div v-if="carryforwardResult && carryforwardResult.details.length > 0" class="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-all">
          <div class="flex items-start gap-4">
            <UIcon name="i-heroicons-check-badge" class="w-8 h-8 text-emerald-500 shrink-0 mt-1" />
            <div class="w-full">
              <h3 class="font-bold text-emerald-900 dark:text-emerald-100 text-lg mb-3">자동 이월 전표 생성 결과</h3>
              <div class="overflow-hidden rounded-lg border border-emerald-200 dark:border-emerald-700">
                <table class="w-full text-sm">
                  <thead class="bg-emerald-100 dark:bg-emerald-900/40">
                    <tr>
                      <th class="text-left px-4 py-2 font-bold text-emerald-800 dark:text-emerald-200">통장명</th>
                      <th class="text-right px-4 py-2 font-bold text-emerald-800 dark:text-emerald-200">이월 금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, idx) in carryforwardResult.details" :key="idx" class="border-t border-emerald-100 dark:border-emerald-800">
                      <td class="px-4 py-2 text-emerald-900 dark:text-emerald-100 font-medium">{{ item.fundName }}</td>
                      <td class="px-4 py-2 text-right font-mono font-bold text-emerald-700 dark:text-emerald-300">{{ Number(item.amount).toLocaleString() }}원</td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-emerald-100/50 dark:bg-emerald-900/30 border-t-2 border-emerald-300 dark:border-emerald-600">
                    <tr>
                      <td class="px-4 py-2 font-black text-emerald-900 dark:text-emerald-100">합계 ({{ carryforwardResult.details.length }}건)</td>
                      <td class="px-4 py-2 text-right font-mono font-black text-emerald-700 dark:text-emerald-300">
                        {{ carryforwardResult.details.reduce((sum: number, d: any) => sum + Number(d.amount), 0).toLocaleString() }}원
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <p class="text-xs text-emerald-600 dark:text-emerald-400 mt-2 italic">
                * 위 이월 전표는 {{ (churchForm.current_fiscal_year || new Date().getFullYear()) + 1 }}년 1월 1일 자로 자동 생성되었습니다. 전표관리 및 원장 화면에서 확인할 수 있습니다.
              </p>
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
          <div class="p-6 border rounded-xl dark:border-gray-700 flex flex-col justify-between h-48 hover:border-primary-500 transition-colors">
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
          <div class="p-6 border rounded-xl dark:border-gray-700 flex flex-col justify-between h-48 hover:border-primary-500 transition-colors">
            <div>
              <UIcon name="i-heroicons-users" class="w-10 h-10 text-primary-500 mb-3" />
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



    </div>

    <!-- 비밀번호 변경 모달 -->
    <UModal v-model:open="isPasswordModalOpen">
      <template #content>
        <div class="flex flex-col bg-white dark:bg-slate-900 shadow-2xl rounded-2xl overflow-hidden max-w-md w-full mx-auto border border-slate-100 dark:border-slate-800">
          <div class="px-6 py-5 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white flex items-center">
              <UIcon name="i-heroicons-lock-closed" class="w-6 h-6 mr-2 text-primary-500" />
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
    <!-- 주소 검색 모달 -->
    <AddressSearchModal v-model:open="isAddressModalOpen" @select="handleAddressSelect" />
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

// 주소 검색 관련
const isAddressModalOpen = ref(false)
const handleAddressSelect = (addressData: any) => {
  churchForm.address = addressData.roadAddr
}

// 탭 관리 로직
const activeTab = ref('profile')

watch(activeTab, (newTab) => {
  if (newTab === 'church' || newTab === 'closing') {
    fetchChurchInfo()
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
  theme_color: 'blue' as string,
  closing_date: null as string | Date | null,
  closedByName: '',
  current_fiscal_year: null as number | null
})

const loadingChurch = ref(false)
const isSavingChurch = ref(false)
const isSavingClosing = ref(false)
const isSavingFiscalYear = ref(false)
const closingDateInput = ref('')
const fiscalYearInput = ref<number>(new Date().getFullYear())

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
      if (res.data.current_fiscal_year) {
        fiscalYearInput.value = res.data.current_fiscal_year
      } else {
        fiscalYearInput.value = new Date().getFullYear()
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
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  } catch (e: any) {
    ui.showAlert('저장 실패', e.data?.statusMessage || '오류가 발생했습니다.', 'error')
  } finally {
    isSavingChurch.value = false
  }
}

const handleSaveFiscalYear = async () => {
  if (!fiscalYearInput.value) return

  isSavingFiscalYear.value = true
  try {
    const res: any = await $fetch('/api/settings/closing', {
      method: 'PATCH',
      body: { current_fiscal_year: fiscalYearInput.value }
    })
    if (res.success) {
      ui.showAlert('설정 완료', '회계 기수가 성공적으로 설정되었습니다.', 'success')
      churchForm.current_fiscal_year = fiscalYearInput.value
      // 글로벌 레이아웃 헤더에 즉각 반영하기 위해 새로고침
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  } catch (e: any) {
    ui.showAlert('설정 실패', e.data?.statusMessage || '오류가 발생했습니다.', 'error')
  } finally {
    isSavingFiscalYear.value = false
  }
}

// 자동 이월 결과 상태
const carryforwardResult = ref<{ details: { fundName: string; amount: number }[] } | null>(null)

const handleSaveClosingDate = async () => {
  const fiscalYear = churchForm.current_fiscal_year || new Date().getFullYear()
  const nextFiscalYear = fiscalYear + 1

  const confirmed = await ui.showConfirm(
    '장부 마감 설정', 
    closingDateInput.value 
      ? `${closingDateInput.value} 기준으로 장부를 마감하시겠습니까?\n\n• 이 날짜 이전의 전표는 수정/삭제할 수 없게 됩니다.\n• 통장별 잔액이 자동 계산되어 ${nextFiscalYear}년 1월 1일자로 '전년이월금' 전표가 자동 생성됩니다.`
      : '장부 마감을 해제하시겠습니까?\n\n• 모든 데이터의 수정/삭제가 가능해집니다.\n• 자동 생성된 전년이월금 전표가 함께 삭제(롤백)됩니다.', 
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
      // 마감을 설정한 경우 현재 세션의 사용자 이름으로 즉시 업데이트
      if (closingDateInput.value) {
        churchForm.closedByName = user.value?.name || user.value?.login_id || '관리자'
        // 이월 결과 저장 (UI 표시용)
        if (res.data?.carryforwardDetails && res.data.carryforwardDetails.length > 0) {
          carryforwardResult.value = { details: res.data.carryforwardDetails }
        } else {
          carryforwardResult.value = null
        }
      } else {
        churchForm.closedByName = ''
        carryforwardResult.value = null
      }
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
  { id: 'backup', name: '데이터 백업', icon: 'i-heroicons-arrow-down-tray' }
]

const visibleTabs = computed(() => {
  let tabs = [...allTabs]
  const currentRole = Number(user.value?.role) as UserRole

  // 1. 교회 정보 탭: Admin(1) 이상의 권한 전용
  if (currentRole > UserRole.ADMIN) {
    tabs = tabs.filter(t => t.id !== 'church')
  }

  // 3. 장부 마감 및 데이터 백업 탭: Manager(2) 이상의 권한 전용
  if (currentRole > UserRole.MANAGER) {
    tabs = tabs.filter(t => t.id !== 'closing' && t.id !== 'backup')
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
      const isMasterAll = authStore.isMaster && (!user.value?.church_id || user.value?.church_id === SYSTEM_CHURCH_ID)
      
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
      const isMasterAll = authStore.isMaster && (!user.value?.church_id || user.value?.church_id === SYSTEM_CHURCH_ID)
      
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


</script>
