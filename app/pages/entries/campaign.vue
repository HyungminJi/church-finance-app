<template>
  <ClientOnly>
    <div class="space-y-6 p-8 relative min-h-full">
      
      <!-- 헤더 영역 -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div class="space-y-1">
          <h2 class="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-heroicons-flag" class="text-brand-blue" />
            작정헌금 캠페인 관리
          </h2>
          <p class="text-sm text-gray-500">건축, 선교 등 목적이 있는 작정헌금 캠페인을 생성하고 관리합니다.</p>
        </div>
        
        <UButton 
          icon="i-heroicons-plus-circle" 
          color="primary" 
          label="새 캠페인 등록" 
          class="font-black px-6 shadow-md cursor-pointer"
          @click="openModal()"
        />
      </div>

      <!-- 캠페인 목록 (Grid Card 레이아웃) -->
      <div v-if="pending" class="flex justify-center py-20">
        <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin text-primary" />
      </div>

      <div v-else-if="campaigns.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="c in campaigns" :key="c.id" 
             class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all p-6 flex flex-col space-y-4"
             :class="{ 'opacity-60 grayscale-[0.5]': !c.is_active }">
          
          <div class="flex justify-between items-start">
            <div class="space-y-1">
              <h3 class="text-lg font-black text-gray-900 dark:text-white truncate max-w-[200px]" :title="c.name">{{ c.name }}</h3>
              <UBadge :color="c.is_active ? 'success' : 'neutral'" variant="subtle" size="xs" class="font-bold">
                {{ c.is_active ? '진행 중' : '종료됨' }}
              </UBadge>
            </div>
            <div class="flex gap-1">
              <UButton class="cursor-pointer" icon="i-heroicons-pencil" color="neutral" variant="ghost" size="xs" @click="openModal(c)" />
              <UButton class="cursor-pointer" icon="i-heroicons-trash" color="error" variant="ghost" size="xs" @click="deleteCampaign(c)" />
            </div>
          </div>

          <div class="text-sm text-gray-500 line-clamp-2 min-h-[40px] italic">
            {{ c.description || '상세 설명이 없습니다.' }}
          </div>

          <div class="pt-2 border-t dark:border-gray-700 space-y-3">
            <div class="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
              <span>목표액: {{ formatNumber(c.target_amount) }}원</span>
              <span class="text-brand-blue">{{ getPercent(c) }}%</span>
            </div>
            <!-- 프로그레스 바 -->
            <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div class="bg-brand-blue h-full transition-all duration-1000 shadow-[0_0_8px_rgba(60,175,255,0.5)]" 
                   :style="{ width: getPercent(c) + '%' }"></div>
            </div>
            <div class="flex justify-between items-center text-[11px] font-mono text-gray-500">
              <span class="flex items-center gap-1"><UIcon name="i-heroicons-calendar" /> {{ formatDate(c.start_date) }} ~ {{ c.end_date ? formatDate(c.end_date) : '계속' }}</span>
              <span class="font-bold text-gray-700 dark:text-gray-300">누적: {{ formatNumber(c.total_collected) }}원</span>
            </div>
          </div>

          <div class="pt-2">
            <div class="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span class="text-[10px] font-bold text-gray-400">연결된 계정</span>
              <span class="text-xs font-bold text-blue-600 truncate">{{ c.account_name }} ({{ c.account_code }})</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 빈 화면 -->
      <div v-else class="bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-32 flex flex-col items-center justify-center space-y-4">
        <UIcon name="i-heroicons-flag" class="w-16 h-16 text-gray-200" />
        <div class="text-center">
          <p class="text-lg font-bold text-gray-900 dark:text-white">등록된 캠페인이 없습니다.</p>
          <p class="text-sm text-gray-500">새로운 작정헌금 캠페인을 시작해 보세요.</p>
        </div>
        <UButton variant="outline" color="primary" label="첫 캠페인 만들기" class="cursor-pointer font-bold" @click="openModal()" />
      </div>

      <!-- 등록/수정 모달 -->
      <UModal v-model:open="isModalOpen" :title="isEditing ? '캠페인 정보 수정' : '새 캠페인 등록'" description="작정헌금 캠페인의 목표와 기간을 설정합니다." :ui="{ content: 'max-w-md' }">
        <template #content>
          <div class="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-xl space-y-6">
            <div class="flex items-center justify-between border-b dark:border-gray-800 pb-4">
              <h3 class="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <UIcon name="i-heroicons-flag" class="text-brand-blue" />
                {{ isEditing ? '캠페인 수정' : '새 캠페인 등록' }}
              </h3>
              <UButton class="cursor-pointer" type="button" color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="isModalOpen = false" />
            </div>

            <div class="space-y-4 py-2">
              <UFormField label="캠페인 명칭" required>
                <UInput v-model="form.name" placeholder="예: 성전 건축 헌금" class="w-full font-bold" />
              </UFormField>
              
              <UFormField label="상세 설명">
                <UTextarea v-model="form.description" placeholder="캠페인의 목적 및 안내 문구를 입력하세요." :rows="3" class="w-full" />
              </UFormField>

              <div class="grid grid-cols-2 gap-4">
                <UFormField label="시작일" required>
                  <UInput v-model="form.start_date" type="date" class="w-full cursor-pointer" />
                </UFormField>
                <UFormField label="종료일 (선택)">
                  <UInput v-model="form.end_date" type="date" class="w-full cursor-pointer" />
                </UFormField>
              </div>

              <UFormField label="목표 금액 (원)" required>
                <UInput v-model="form.target_amount" type="number" placeholder="0" class="w-full font-mono font-bold" icon="i-heroicons-banknotes" />
              </UFormField>

              <UFormField label="집계 계정과목" required>
                <USelectMenu 
                  v-model="form.account_code" 
                  :items="filteredAccounts" 
                  value-key="code" 
                  label-key="name"
                  class="w-full cursor-pointer"
                  placeholder="계정 선택"
                />
                <p class="text-[10px] text-gray-500 mt-1">* 해당 계정으로 들어온 모든 헌금이 실시간 자동 집계됩니다.</p>
              </UFormField>

              <div v-if="isEditing" class="flex items-center space-x-2 pt-2">
                <UCheckbox v-model="form.is_active" label="현재 캠페인 활성화 (진행 중)" class="font-bold" />
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-6 border-t dark:border-gray-800">
              <UButton class="cursor-pointer" label="취소" color="neutral" variant="ghost" @click="isModalOpen = false" />
              <UButton :label="isEditing ? '정보 수정' : '캠페인 시작'" color="primary" class="cursor-pointer font-black px-8 shadow-md" size="lg" :loading="isSaving" @click="saveCampaign" />
            </div>
          </div>
        </template>
      </UModal>

    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { formatNumber, formatDate, displayValue } from '~/utils/formatter'
import { useUIStore } from '~/stores/ui'

const ui = useUIStore()
const isModalOpen = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)

// 1. 캠페인 데이터 로드
const { data: response, refresh, pending } = await useFetch('/api/pledges/campaigns')
const campaigns = computed(() => (response.value as any)?.data || [])

// 2. 기초 데이터 (계정과목) 로드
const { data: accountsRes } = await useFetch('/api/accounts')
const filteredAccounts = computed(() => {
  const all = (accountsRes.value as any)?.data || []
  return all.filter((a: any) => a.type === 'INCOME' && a.level === 2 && a.is_active)
})

// 3. 폼 상태
const form = reactive({
  id: '',
  name: '',
  description: '',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  target_amount: 0,
  account_code: null as string | null,
  is_active: true
})

const openModal = (campaign?: any) => {
  if (campaign) {
    isEditing.value = true
    Object.assign(form, { 
      ...campaign, 
      start_date: formatDate(campaign.start_date),
      end_date: campaign.end_date ? formatDate(campaign.end_date) : ''
    })
  } else {
    isEditing.value = false
    Object.assign(form, {
      id: '', name: '', description: '', 
      start_date: new Date().toISOString().split('T')[0], 
      end_date: '', target_amount: 0, account_code: null, is_active: true
    })
  }
  isModalOpen.value = true
}

// 4. 합계 및 퍼센트 계산
const getPercent = (c: any) => {
  if (!c.target_amount || c.target_amount <= 0) return 0
  const pct = (c.total_collected / c.target_amount) * 100
  return Math.min(Math.round(pct), 100) // 최대 100% 표시
}

// 5. CRUD 로직
const saveCampaign = async () => {
  if (!form.name || !form.start_date || !form.account_code) {
    ui.showAlert('입력 오류', '필수 항목(명칭, 시작일, 계정)을 입력해 주세요.', 'warning')
    return
  }

  isSaving.value = true
  try {
    const url = isEditing.value ? `/api/pledges/campaigns/${form.id}` : '/api/pledges/campaigns'
    const method = isEditing.value ? 'PATCH' : 'POST'
    
    const res: any = await $fetch(url, { method, body: form })
    if (res.success) {
      isModalOpen.value = false
      await refresh()
      ui.showAlert('성공', `캠페인이 ${isEditing.value ? '수정' : '생성'}되었습니다.`, 'success')
    }
  } catch (error: any) {
    ui.showAlert('오류', error.data?.statusMessage || '처리 중 오류 발생', 'error')
  } finally {
    isSaving.value = false
  }
}

const deleteCampaign = async (c: any) => {
  const confirmed = await ui.showConfirm('캠페인 삭제', `[${c.name}] 캠페인을 삭제하시겠습니까?\n연결된 성도별 작정 정보도 모두 삭제됩니다.`, 'error', '영구 삭제')
  if (confirmed) {
    try {
      const res: any = await $fetch(`/api/pledges/campaigns/${c.id}`, { method: 'DELETE' })
      if (res.success) {
        await refresh()
        ui.showAlert('완료', '캠페인이 삭제되었습니다.', 'success')
      }
    } catch (e: any) {
      ui.showAlert('오류', '삭제 중 오류 발생', 'error')
    }
  }
}
</script>
