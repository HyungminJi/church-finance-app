<template>
  <ClientOnly>
    <div class="space-y-6 p-8 relative min-h-full">
      
      <!-- 상단 필터 및 액션 영역 -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-6">
        <div class="flex justify-between items-center">
          <div class="space-y-1">
            <h2 class="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-heroicons-user-group" class="text-brand-blue" />
              작정헌금 관리 현황
            </h2>
            <p class="text-sm text-gray-500">성도별 약정 금액 대비 실제 납부 현황을 실시간으로 확인합니다.</p>
          </div>
          
          <div class="flex gap-2">
            <UButton 
              icon="i-heroicons-user-plus" 
              color="primary" 
              label="성도별 약정 등록" 
              class="font-black px-6 shadow-md cursor-pointer"
              :disabled="!selectedCampaignId"
              @click="openModal()"
            />
            <UButton 
              icon="i-heroicons-table-cells" 
              color="success" 
              variant="outline" 
              label="현황 엑셀 다운로드" 
              class="font-bold cursor-pointer"
              :disabled="!selectedCampaignId || memberPledges.length === 0"
              @click="downloadExcel"
            />
          </div>
        </div>

        <!-- 캠페인 선택 필터 -->
        <div class="flex items-center gap-4 pt-4 border-t dark:border-gray-700">
          <div class="w-80">
            <UFormField label="조회할 캠페인 선택">
              <USelectMenu 
                v-model="selectedCampaignId" 
                :items="campaigns" 
                value-key="id" 
                placeholder="진행 중인 캠페인을 선택하세요"
                class="w-full font-bold"
              />
            </UFormField>
          </div>
          <div v-if="selectedCampaign" class="flex-1 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center gap-8">
            <div class="flex flex-col">
              <span class="text-[10px] font-bold text-gray-400 uppercase">캠페인 총 목표</span>
              <span class="text-sm font-black text-gray-700 dark:text-gray-300">{{ formatNumber(selectedCampaign.target_amount) }}원</span>
            </div>
            <div class="flex flex-col border-l dark:border-gray-700 pl-8">
              <span class="text-[10px] font-bold text-gray-400 uppercase">전체 납부 총액</span>
              <span class="text-sm font-black text-brand-blue">{{ formatNumber(selectedCampaign.total_collected) }}원</span>
            </div>
            <div class="flex flex-col border-l dark:border-gray-700 pl-8">
              <span class="text-[10px] font-bold text-gray-400 uppercase">전체 달성률</span>
              <span class="text-sm font-black text-brand-green">{{ Math.round((selectedCampaign.total_collected / selectedCampaign.target_amount) * 100) || 0 }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 현황 테이블 영역 -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg relative border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div v-if="pending" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10 py-20">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border-collapse">
            <thead class="bg-gray-50 dark:bg-gray-900 sticky top-0 z-20">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">성도명</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">약정 금액</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">실제 납부액</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">미납액 (잔액)</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">달성률</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">비고</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="p in memberPledges" :key="p.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                  {{ p.member_name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-600 dark:text-gray-400 font-mono">
                  {{ formatNumber(p.pledge_amount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-black text-brand-blue font-mono">
                  {{ formatNumber(p.total_paid) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-bold font-mono" :class="p.pledge_amount - p.total_paid > 0 ? 'text-red-500' : 'text-gray-400'">
                  {{ formatNumber(Math.max(0, p.pledge_amount - p.total_paid)) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <div class="flex items-center justify-center gap-2">
                    <div class="w-16 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div class="bg-brand-green h-full" :style="{ width: getMemberPercent(p) + '%' }"></div>
                    </div>
                    <span class="text-[10px] font-black text-brand-green">{{ getMemberPercent(p) }}%</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" :title="p.notes || ''">
                  {{ displayValue(p.notes) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                  <UButton class="cursor-pointer" label="수정" color="primary" variant="ghost" size="xs" @click="openModal(p)" />
                  <UButton class="cursor-pointer" label="제외" color="error" variant="ghost" size="xs" @click="deletePledge(p)" />
                </td>
              </tr>
              <tr v-if="memberPledges.length === 0 && !pending">
                <td colspan="7" class="px-6 py-20 text-center text-gray-500 italic">
                  {{ selectedCampaignId ? '해당 캠페인에 등록된 성도 약정 정보가 없습니다.' : '조회할 캠페인을 먼저 선택해 주세요.' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 성도별 약정 등록/수정 모달 -->
      <UModal v-model:open="isModalOpen" :title="isEditing ? '약정 정보 수정' : '성도별 약정 등록'" description="캠페인에 참여하는 성도의 약정 금액을 설정합니다." :ui="{ content: 'max-w-md' }">
        <template #content>
          <div class="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-xl space-y-6">
            <div class="flex items-center justify-between border-b dark:border-gray-800 pb-4">
              <h3 class="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <UIcon name="i-heroicons-user-plus" class="text-brand-blue" />
                {{ isEditing ? '약정 수정' : '약정 등록' }}
              </h3>
              <UButton class="cursor-pointer" type="button" color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="isModalOpen = false" />
            </div>

            <div class="space-y-4 py-2">
              <UFormField label="대상 성도" required>
                <div class="flex space-x-2">
                  <UInput :model-value="form.member_name" disabled placeholder="성도를 검색하세요" class="flex-1 font-bold" icon="i-heroicons-user" />
                  <UButton class="cursor-pointer" v-if="!isEditing" label="검색" color="neutral" variant="outline" icon="i-heroicons-magnifying-glass" @click="isMemberSearchOpen = true" />
                </div>
              </UFormField>

              <UFormField label="약정 금액 (원)" required>
                <div class="relative">
                  <input 
                    v-model="formAmountStr"
                    type="text"
                    placeholder="0"
                    class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 text-right font-black font-mono text-lg text-gray-900 dark:text-white"
                    @input="onAmountInput"
                  />
                  <span class="absolute right-4 top-2.5 text-gray-500 font-bold">원</span>
                </div>
              </UFormField>

              <UFormField label="약정일" required>
                <UInput v-model="form.pledge_date" type="date" class="w-full cursor-pointer" />
              </UFormField>

              <UFormField label="비고">
                <UInput v-model="form.notes" placeholder="기타 참고 사항" class="w-full" />
              </UFormField>
            </div>

            <div class="flex justify-end gap-3 pt-6 border-t dark:border-gray-800">
              <UButton class="cursor-pointer" label="취소" color="neutral" variant="ghost" @click="isModalOpen = false" />
              <UButton label="저장 완료" color="primary" class="cursor-pointer font-black px-8 shadow-md" size="lg" :loading="isSaving" @click="savePledge" />
            </div>
          </div>
        </template>
      </UModal>

      <!-- 성도 검색 모달 -->
      <UModal v-model:open="isMemberSearchOpen" title="성도 검색" description="약정을 등록할 성도를 검색합니다." :ui="{ content: 'max-w-md' }">
        <template #content>
          <div class="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-xl space-y-4 z-[60]">
            <div class="flex items-center justify-between border-b dark:border-gray-800 pb-3 mb-2">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">성도 검색</h3>
              <UButton class="cursor-pointer" type="button" color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="isMemberSearchOpen = false" />
            </div>
            <UInput v-model="memberSearchTerm" placeholder="이름 검색" icon="i-heroicons-magnifying-glass" class="w-full" autofocus />
            <div class="max-h-[300px] overflow-y-auto border rounded-lg dark:border-gray-800 custom-scrollbar">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr v-for="m in filteredMembers" :key="m.id" class="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors" @click="selectMember(m)">
                    <td class="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">{{ m.name }}</td>
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
import { ref, reactive, computed, watch } from 'vue'
import { formatNumber, formatDate, displayValue, formatPhoneNumber } from '~/utils/formatter'
import { fetchAndDownloadExcel } from '~/utils/excel'
import { useUIStore } from '~/stores/ui'

const ui = useUIStore()
const selectedCampaignId = ref<string | null>(null)
const isModalOpen = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)

// 1. 캠페인 목록 로드 (필터용)
const { data: campaignsRes } = await useFetch('/api/pledges/campaigns')
const campaigns = computed(() => ((campaignsRes.value as any)?.data || []).map((c: any) => ({ ...c, label: c.name })))

const selectedCampaign = computed(() => campaigns.value.find((c: any) => c.id === selectedCampaignId.value))

// 2. 성도별 작정 현황 로드
const { data: pledgesRes, refresh, pending } = await useFetch('/api/pledges/members', {
  query: computed(() => ({ campaignId: selectedCampaignId.value }))
})
const memberPledges = computed(() => (pledgesRes.value as any)?.data || [])

// 3. 성도 검색 연동
const isMemberSearchOpen = ref(false)
const memberSearchTerm = ref('')
const { data: membersRes } = await useFetch('/api/members', { query: { limit: 10000, tab: 'CURRENT' } })
const allMembers = computed(() => (membersRes.value as any)?.data || [])

const filteredMembers = computed(() => {
  if (!memberSearchTerm.value) return allMembers.value.slice(0, 20)
  return allMembers.value.filter((m: any) => 
    m.name.includes(memberSearchTerm.value) || (m.phone_number && m.phone_number.includes(memberSearchTerm.value))
  )
})

// 4. 폼 상태 관리
const form = reactive({
  id: '',
  member_id: '',
  member_name: '',
  pledge_amount: 0,
  pledge_date: new Date().toISOString().split('T')[0],
  notes: ''
})
const formAmountStr = ref('')

const onAmountInput = (e: Event) => {
  const raw = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, '')
  form.pledge_amount = parseInt(raw) || 0
  formAmountStr.value = formatNumber(form.pledge_amount)
}

const openModal = (pledge?: any) => {
  if (pledge) {
    isEditing.value = true
    Object.assign(form, { ...pledge, pledge_date: pledge.pledge_date.split('T')[0] })
    formAmountStr.value = formatNumber(pledge.pledge_amount)
  } else {
    isEditing.value = false
    Object.assign(form, { id: '', member_id: '', member_name: '', pledge_amount: 0, pledge_date: new Date().toISOString().split('T')[0], notes: '' })
    formAmountStr.value = ''
  }
  isModalOpen.value = true
}

const selectMember = (m: any) => {
  form.member_id = m.id
  form.member_name = m.name
  isMemberSearchOpen.value = false
}

// 5. 비즈니스 로직 (달성률)
const getMemberPercent = (p: any) => {
  if (!p.pledge_amount || p.pledge_amount <= 0) return 0
  const pct = (p.total_paid / p.pledge_amount) * 100
  return Math.min(Math.round(pct), 100)
}

// 6. CRUD 로직
const savePledge = async () => {
  if (!selectedCampaignId.value || !form.member_id || form.pledge_amount <= 0) {
    ui.showAlert('입력 오류', '필수 항목(성도, 약정액)을 확인해 주세요.', 'warning')
    return
  }

  isSaving.value = true
  try {
    const res: any = await $fetch('/api/pledges/members', {
      method: 'POST',
      body: {
        campaign_id: selectedCampaignId.value,
        ...form
      }
    })
    if (res.success) {
      isModalOpen.value = false
      await refresh()
      ui.showAlert('성공', '약정 정보가 저장되었습니다.', 'success')
    }
  } catch (error: any) {
    ui.showAlert('오류', error.data?.statusMessage || '처리 중 오류 발생', 'error')
  } finally {
    isSaving.value = false
  }
}

const deletePledge = async (p: any) => {
  const confirmed = await ui.showConfirm('약정 취소', `[${p.member_name}] 성도의 약정 내역을 캠페인 현황에서 제외하시겠습니까?`, 'error', '현황에서 제외')
  if (confirmed) {
    await $fetch(`/api/pledges/members/${p.id}`, { method: 'DELETE' })
    await refresh()
    ui.showAlert('완료', '제외되었습니다.', 'success')
  }
}

const downloadExcel = async () => {
  const mapper = (p: any) => ({
    '성도명': p.member_name,
    '약정금액': p.pledge_amount,
    '실제납부액': p.total_paid,
    '미납액': Math.max(0, p.pledge_amount - p.total_paid),
    '달성률(%)': getMemberPercent(p),
    '비고': displayValue(p.notes)
  })
  await fetchAndDownloadExcel('/api/pledges/members', { campaignId: selectedCampaignId.value }, mapper, `약정현황_${selectedCampaign.value?.label}`)
}
</script>
