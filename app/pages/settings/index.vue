<template>
  <div class="space-y-6 max-w-4xl mx-auto py-6">
    <div class="flex items-center space-x-2 mb-6">
      <UIcon name="i-heroicons-cog-6-tooth" class="w-8 h-8 text-blue-600" />
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">설정</h1>
    </div>

    <!-- 사용자 프로필 섹션 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center">
          <UIcon name="i-heroicons-user" class="w-5 h-5 mr-2 text-blue-500" />
          내 계정 정보
        </h2>
      </div>
      <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
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
            v-if="user?.role"
            :color="getRoleInfo(user?.role)?.color" 
            variant="solid" 
            class="font-bold px-3 py-1 rounded-md shadow-sm"
          >
            {{ getRoleInfo(user?.role)?.label }}
          </UBadge>
          <span v-else class="text-gray-300">-</span>
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

    <!-- 기수/회계 설정 섹션 (추후 구현 예정) -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden opacity-60">
      <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center">
          <UIcon name="i-heroicons-calendar" class="w-5 h-5 mr-2 text-gray-500" />
          회계 기수 및 시스템 설정 (준비 중)
        </h2>
      </div>
      <div class="p-10 text-center">
        <p class="text-gray-500 italic">현재 회계 기수 설정 및 결재선 관리 기능은 개발 중입니다.</p>
      </div>
    </div>

    <!-- 비밀번호 변경 모달 -->
    <UModal v-model:open="isPasswordModalOpen">
      <template #content>
        <div class="flex flex-col bg-white dark:bg-gray-900 shadow-2xl rounded-xl overflow-hidden max-w-md w-full mx-auto">
          <div class="px-6 py-4 border-b dark:border-gray-800 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20">
            <h3 class="text-xl font-bold text-blue-900 dark:text-blue-100 flex items-center">
              <UIcon name="i-heroicons-lock-closed" class="w-6 h-6 mr-2" />
              비밀번호 변경
            </h3>
            <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="closePasswordModal" class="cursor-pointer" />
          </div>

          <form @submit.prevent="handlePasswordChange" class="p-6 space-y-5">
            <UFormField label="현재 비밀번호" required>
              <UInput 
                v-model="passwordForm.current" 
                type="password" 
                placeholder="현재 사용 중인 비밀번호" 
                size="lg" 
                class="w-full" 
                icon="i-heroicons-shield-check" 
                required
              />
            </UFormField>

            <div class="space-y-4 border-t dark:border-gray-800 pt-4">
              <UFormField label="새 비밀번호" required>
                <UInput 
                  v-model="passwordForm.new" 
                  type="password" 
                  placeholder="새로운 비밀번호 입력" 
                  size="lg" 
                  class="w-full" 
                  icon="i-heroicons-key" 
                  required
                />
              </UFormField>

              <UFormField label="새 비밀번호 확인" required>
                <UInput 
                  v-model="passwordForm.confirm" 
                  type="password" 
                  placeholder="새로운 비밀번호 다시 입력" 
                  size="lg" 
                  class="w-full" 
                  icon="i-heroicons-check-circle" 
                  required
                />
              </UFormField>
            </div>

            <p v-if="passwordError" class="text-sm text-red-500 font-medium flex items-center">
              <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 mr-1" />
              {{ passwordError }}
            </p>
          </form>

          <div class="px-6 py-4 border-t dark:border-gray-800 flex justify-end space-x-3 bg-gray-50 dark:bg-gray-900/50">
            <UButton color="neutral" variant="ghost" size="lg" @click="closePasswordModal" label="취소" class="cursor-pointer" />
            <UButton 
              color="primary" 
              size="lg" 
              @click="handlePasswordChange" 
              label="변경 완료" 
              class="font-bold cursor-pointer px-8 shadow-md"
              :loading="isSubmitting"
            />
          </div>
        </div>
      </template>
    </UModal>

    <!-- 성공 알림 모달 -->
    <UModal v-model:open="isSuccessModalOpen">
      <template #content>
        <div class="p-8 text-center space-y-6 bg-white dark:bg-gray-900 rounded-xl">
          <div class="flex justify-center">
            <div class="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
              <UIcon name="i-heroicons-check-circle" class="w-16 h-16 text-green-600 dark:text-green-500" />
            </div>
          </div>
          <div class="space-y-2">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">변경 완료</h3>
            <p class="text-lg text-gray-600 dark:text-gray-400">
              비밀번호가 성공적으로 변경되었습니다.
            </p>
          </div>
          <div class="pt-2">
            <UButton 
              color="primary" 
              label="확인" 
              class="w-full justify-center font-bold cursor-pointer py-3 text-lg shadow-md" 
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

const { user } = useUserSession()

const isPasswordModalOpen = ref(false)
const isSuccessModalOpen = ref(false)
const isSubmitting = ref(false)
const passwordError = ref('')

const passwordForm = reactive({
  current: '',
  new: '',
  confirm: ''
})

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
      body: {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.new
      }
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
</script>
