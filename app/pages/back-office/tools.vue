<template>
  <div class="space-y-8 text-slate-100">
    <div class="flex items-center space-x-2 mb-6">
      <h2 class="text-xl font-bold text-red-500 flex items-center">
        <UIcon name="i-heroicons-shield-exclamation" class="w-6 h-6 mr-2" />
        플랫폼 진단 및 보정 도구 (Master Only)
      </h2>
    </div>
    
    <p class="text-sm text-slate-400 mt-1 mb-6">
      기술 지원 및 고객의 소리(VOC) 해결을 위한 강력한 플랫폼 전용 도구입니다.
    </p>

    <!-- 시스템 원상 복귀 (기술지원 종료) -->
    <UCard v-if="user?.church_id !== SYSTEM_CHURCH_ID" class="bg-slate-900 border border-slate-800 shadow-xl" :ui="{ body: { padding: 'p-6' }, ring: '' }">
      <h3 class="font-bold text-lg mb-4 flex items-center text-slate-100">
        <UIcon name="i-heroicons-arrow-uturn-left" class="w-5 h-5 mr-2 text-brand-blue" />
        기술지원 모드 종료 (본사 환경으로 복귀)
      </h3>
      <p class="text-sm text-slate-400 mb-4">
        현재 [ <strong class="text-white">{{ user?.impersonating_church_name }}</strong> ] 교회의 데이터망에 접속 중입니다. 작업을 마치고 플랫폼 본사 시스템으로 돌아갑니다.
      </p>
      <UButton 
        color="primary" 
        icon="i-heroicons-arrow-path-rounded-square" 
        class="font-bold cursor-pointer shadow-md px-6" 
        size="lg"
        :loading="isSwitching"
        @click="returnToHQ"
      >
        본사 환경으로 복귀
      </UButton>
    </UCard>

    <!-- 데이터 강제 보정 툴 -->
    <UCard class="bg-red-950/20 border border-red-900/50 shadow-xl mt-8" :ui="{ body: { padding: 'p-6' }, ring: '' }">
      <h3 class="font-bold text-lg mb-2 text-red-400 flex items-center">
        <UIcon name="i-heroicons-wrench-screwdriver" class="w-5 h-5 mr-2" />
        데이터 무결성 강제 보정 툴
      </h3>
      <p class="text-sm text-red-400/80 mb-2">
        통장 기초 잔액 0원화 및 전기이월금 전표 강제 생성 등, 대차가 맞지 않는 교회의 데이터를 강제로 치료하는 일괄 스크립트를 GUI로 실행합니다.
      </p>
      <div class="bg-red-900/40 p-3 rounded-lg mb-4 text-xs font-bold text-red-200 border border-red-800/50">
        ⚠️ 대상: 현재 [<span class="underline underline-offset-2">{{ user?.impersonating_church_name || '본사/시스템' }}</span>] 데이터에 대해 보정 스크립트를 실행합니다. (중복 방지 및 마감 예외 적용됨)
      </div>
      <UButton 
        color="error" 
        variant="soft" 
        icon="i-heroicons-exclamation-triangle" 
        class="font-bold cursor-pointer"
        :loading="isCorrecting"
        :disabled="user?.church_id === SYSTEM_CHURCH_ID"
        @click="executeCorrectionScript"
      >
        치료 스크립트 실행
      </UButton>
      <p v-if="user?.church_id === SYSTEM_CHURCH_ID" class="text-xs text-red-500 mt-2 font-bold">
        * 플랫폼 본사 환경에서는 실행할 수 없습니다. 특정 교회를 먼저 선택하여 '진입'한 후 실행해 주세요.
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { SYSTEM_CHURCH_ID } from '~/types/auth'
import { useUIStore } from '~/stores/ui'

definePageMeta({
  layout: 'back-office',
  middleware: 'master'
})

const { user, fetch: fetchSession } = useUserSession()
const authStore = useAuthStore()
const ui = useUIStore()

const isSwitching = ref(false)

// 데이터 강제 보정 툴 로직
const isCorrecting = ref(false)

const executeCorrectionScript = async () => {
  if (user.value?.church_id === SYSTEM_CHURCH_ID) {
    ui.showAlert('실행 불가', '플랫폼 본사 환경에서는 이 툴을 실행할 수 없습니다. 보정할 특정 교회를 선택하여 진입한 후 실행해 주세요.', 'warning')
    return
  }

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

const returnToHQ = async () => {
  isSwitching.value = true
  try {
    const res: any = await $fetch('/api/auth/switch-tenant', {
      method: 'POST',
      body: { targetChurchId: SYSTEM_CHURCH_ID }
    })
    
    if (res.success) {
      ui.showAlert('복귀 성공', '플랫폼 본사 환경으로 복귀했습니다.', 'success')
      await fetchSession() // 세션 정보 다시 불러오기
      setTimeout(() => {
        window.location.href = '/back-office/tools' // 본사 모드로 도구 페이지 다시 로드
      }, 1000)
    }
  } catch (e: any) {
    ui.showAlert('복귀 실패', e.data?.statusMessage || '오류가 발생했습니다.', 'error')
  } finally {
    isSwitching.value = false
  }
}
</script>
