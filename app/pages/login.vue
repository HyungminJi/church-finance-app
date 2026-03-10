<template>
  <div class="min-h-screen flex flex-col justify-center bg-slate-50 dark:bg-slate-900 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- 브랜드 배경 장식 (점과 선의 은유) -->
    <div class="absolute -top-20 -left-20 w-80 h-80 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-20 -right-20 w-80 h-80 bg-brand-green/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
      <div class="flex flex-col items-center">
        <AppLogo :compact="false" class="mb-6 drop-shadow-sm" />
        <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">"From Chaos to Clarity"</h2>
        <p class="mt-2 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
          숫자에 생명을 불어넣다 <span class="text-brand-green font-bold italic ml-1">Ledgerrection</span>
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
      <div class="bg-white dark:bg-slate-800 py-10 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-100 dark:border-slate-700">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div>
            <label for="loginId" class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">로그인 아이디</label>
            <UInput 
              id="loginId" 
              v-model="form.login_id" 
              placeholder="아이디를 입력하세요" 
              icon="i-heroicons-user"
              size="lg"
              class="w-full"
              required
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label for="password" class="block text-sm font-bold text-slate-700 dark:text-slate-300">비밀번호</label>
              <div class="text-sm">
                <span class="text-brand-blue hover:text-blue-600 font-bold cursor-pointer transition-colors" @click="isResetModalOpen = true">
                  비밀번호를 잊으셨나요?
                </span>
              </div>
            </div>
            <UInput 
              id="password" 
              v-model="form.password" 
              type="password" 
              placeholder="비밀번호를 입력하세요" 
              icon="i-heroicons-lock-closed"
              size="lg"
              class="w-full"
              required
            />
          </div>

          <div v-if="error" class="text-error text-sm font-bold flex items-center gap-1 animate-pulse">
            <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4" />
            {{ error }}
          </div>

          <div>
            <!-- 로그인 버튼: Brand Green (실행/생명) -->
            <UButton 
              type="submit" 
              class="w-full justify-center py-3 font-extrabold text-lg cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5" 
              :style="{ backgroundColor: '#91D700', color: '#FFFFFF' }"
              :loading="loading"
              label="로그인 하기"
            />
          </div>
        </form>

        <div class="mt-8 border-t border-slate-100 dark:border-slate-700 pt-6">
          <p class="text-xs text-center text-slate-400 dark:text-slate-500 font-medium">
            아이디 및 비밀번호 분실 시 관리자에게 문의해 주세요.
          </p>
        </div>
      </div>
    </div>

    <!-- 비밀번호 재설정 모달 (브랜드 테마 적용) -->
    <UModal v-model:open="isResetModalOpen">
      <template #content>
        <div class="flex flex-col bg-white dark:bg-slate-900 shadow-2xl rounded-2xl overflow-hidden max-w-md w-full mx-auto border border-slate-100 dark:border-slate-800">
          <div class="px-6 py-5 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white flex items-center">
              <UIcon name="i-heroicons-key" class="w-6 h-6 mr-2 text-brand-blue" />
              비밀번호 재설정
            </h3>
            <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="isResetModalOpen = false" class="cursor-pointer" />
          </div>

          <div class="p-6 space-y-5">
            <div class="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 leading-relaxed font-medium">
              본인 확인을 위해 성도 등록 시 입력한 정보를 정확히 입력해 주세요.
            </div>

            <UFormField label="로그인 아이디" required>
              <UInput v-model="resetForm.login_id" placeholder="로그인 아이디 입력" size="lg" class="w-full" icon="i-heroicons-identification" />
            </UFormField>

            <UFormField label="성도 이름" required>
              <UInput v-model="resetForm.name" placeholder="등록된 성함 입력" size="lg" class="w-full" icon="i-heroicons-user" />
            </UFormField>

            <UFormField label="전화번호" required>
              <UInput 
                v-model="resetForm.phone_number" 
                placeholder="010-0000-0000" 
                size="lg" 
                class="w-full" 
                icon="i-heroicons-phone"
                @update:model-value="(val) => resetForm.phone_number = formatPhoneNumber(val)"
              />
            </UFormField>

            <div class="pt-4 border-t dark:border-slate-800 mt-2">
              <UFormField label="새 비밀번호 설정" required>
                <UInput v-model="resetForm.newPassword" type="password" placeholder="변경할 새 비밀번호" size="lg" class="w-full" icon="i-heroicons-lock-closed" />
              </UFormField>
            </div>

            <p v-if="resetError" class="text-sm text-error font-bold text-center">
              {{ resetError }}
            </p>
          </div>

          <div class="px-6 py-5 border-t dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
            <UButton color="neutral" variant="ghost" size="lg" @click="isResetModalOpen = false" label="취소" class="cursor-pointer font-bold px-6" />
            <UButton 
              color="primary" 
              size="lg" 
              @click="handleResetPassword" 
              label="비밀번호 재설정" 
              class="font-bold cursor-pointer px-6 shadow-md"
              :loading="resetLoading"
            />
          </div>
        </div>
      </template>
    </UModal>

    <!-- 성공 알림 모달 (브랜드 테마 적용) -->
    <UModal v-model:open="isSuccessModalOpen">
      <template #content>
        <div class="p-10 text-center space-y-6 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl">
          <div class="flex justify-center">
            <div class="bg-brand-green/10 dark:bg-brand-green/20 p-5 rounded-full ring-8 ring-brand-green/5">
              <UIcon name="i-heroicons-check-circle" class="w-20 h-20 text-brand-green" />
            </div>
          </div>
          <div class="space-y-2">
            <h3 class="text-2xl font-bold text-slate-900 dark:text-white">비밀번호 재설정 완료</h3>
            <p class="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              비밀번호가 성공적으로 변경되었습니다.<br/>새로운 비밀번호로 로그인해 주세요.
            </p>
          </div>
          <div class="pt-4">
            <UButton 
              color="primary" 
              label="확인하고 로그인하기" 
              class="w-full justify-center font-extrabold cursor-pointer py-4 text-lg shadow-xl" 
              @click="isSuccessModalOpen = false" 
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { formatPhoneNumber } from '~/utils/formatter'

definePageMeta({
  layout: false
})

const { fetch: fetchSession } = useUserSession()

const form = reactive({
  login_id: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const isResetModalOpen = ref(false)
const isSuccessModalOpen = ref(false)
const resetLoading = ref(false)
const resetError = ref('')

const resetForm = reactive({
  login_id: '',
  name: '',
  phone_number: '',
  newPassword: ''
})

const handleLogin = async () => {
  if (!form.login_id || !form.password) return
  
  loading.value = true
  error.value = ''
  
  try {
    const res: any = await $fetch('/api/auth/login', {
      method: 'POST',
      body: form
    })
    
    if (res.success) {
      await fetchSession()
      window.location.href = '/'
    }
  } catch (err: any) {
    error.value = err.data?.message || '로그인 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

const handleResetPassword = async () => {
  if (!resetForm.login_id || !resetForm.name || !resetForm.phone_number || !resetForm.newPassword) {
    resetError.value = '모든 정보를 입력해 주세요.'
    return
  }

  if (resetForm.newPassword.length < 4) {
    resetError.value = '비밀번호는 최소 4자 이상이어야 합니다.'
    return
  }

  resetLoading.value = true
  resetError.value = ''

  try {
    const res: any = await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: resetForm
    })

    if (res.success) {
      isResetModalOpen.value = false
      isSuccessModalOpen.value = true
      resetForm.login_id = ''
      resetForm.name = ''
      resetForm.phone_number = ''
      resetForm.newPassword = ''
    }
  } catch (err: any) {
    resetError.value = err.data?.message || '비밀번호 재설정 중 오류가 발생했습니다.'
  } finally {
    resetLoading.value = false
  }
}
</script>

<style scoped>
.text-brand-blue { color: #3CAFFF; }
.text-brand-green { color: #91D700; }
.bg-brand-blue\/10 { background-color: rgba(60, 175, 255, 0.1); }
.bg-brand-green\/10 { background-color: rgba(145, 215, 0, 0.1); }
</style>
