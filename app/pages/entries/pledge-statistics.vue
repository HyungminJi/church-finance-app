<template>
  <ClientOnly>
    <div class="space-y-6 p-8 relative min-h-full">
      
      <!-- 상단 필터 영역 -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div class="flex flex-wrap items-end gap-4 flex-1">
            <div class="w-80">
              <UFormField label="캠페인 선택">
                <USelectMenu 
                  v-model="selectedCampaignId" 
                  :items="campaigns" 
                  value-key="id" 
                  placeholder="통계를 조회할 캠페인 선택"
                  class="font-bold"
                />
              </UFormField>
            </div>
            <div class="w-32">
              <UFormField label="조회 연도">
                <USelectMenu 
                  v-model="selectedYear" 
                  :items="yearOptions" 
                  placeholder="연도"
                  class="font-mono font-bold"
                />
              </UFormField>
            </div>
            <UButton 
              icon="i-heroicons-magnifying-glass" 
              color="primary" 
              label="통계 조회" 
              class="font-black px-8"
              @click="refresh"
            />
          </div>
          
          <div v-if="meta" class="flex gap-6 items-center">
            <div class="text-right">
              <span class="text-[10px] font-bold text-gray-400 block uppercase">연간 누적 총액</span>
              <span class="text-xl font-black text-brand-blue font-mono">{{ formatNumber(meta.total_collected) }}원</span>
            </div>
            <div class="text-right border-l dark:border-gray-700 pl-6">
              <span class="text-[10px] font-bold text-gray-400 block uppercase">목표 달성률</span>
              <span class="text-xl font-black text-brand-green font-mono">{{ Math.round((meta.total_collected / meta.target_amount) * 100) || 0 }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 시각화 차트 영역 -->
      <div v-if="statsData.length > 0" class="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 class="text-sm font-bold text-gray-500 mb-8 flex items-center gap-2 uppercase tracking-widest">
          <UIcon name="i-heroicons-chart-bar" />
          Monthly Collection Trend ({{ selectedYear }})
        </h3>
        
        <div class="h-64 flex items-end justify-between gap-2 px-4 border-b border-gray-100 dark:border-gray-700 pb-2">
          <div v-for="s in statsData" :key="s.month" class="flex-1 flex flex-col items-center group relative">
            <!-- 툴팁 -->
            <div class="absolute -top-12 scale-0 group-hover:scale-100 transition-transform bg-slate-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10 font-bold shadow-xl">
              {{ formatNumber(s.amount) }}원
            </div>
            <!-- 막대 -->
            <div 
              class="w-full max-w-[40px] bg-brand-blue/20 group-hover:bg-brand-blue rounded-t-sm transition-all duration-500 relative"
              :style="{ height: getBarHeight(s.amount) + '%' }"
            >
              <div v-if="s.amount > 0" class="absolute inset-x-0 top-0 h-1 bg-brand-blue shadow-[0_0_10px_#3cafff]"></div>
            </div>
            <span class="text-[10px] font-bold text-gray-400 mt-3 group-hover:text-brand-blue transition-colors">{{ s.month }}</span>
          </div>
        </div>
      </div>

      <!-- 상세 데이터 테이블 -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div v-if="pending" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10 py-20">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
        </div>

        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border-collapse">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">월별</th>
              <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">당월 모금액</th>
              <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">연간 누적액</th>
              <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">누적 달성률</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">비고</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="s in statsData" :key="s.month" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-900 dark:text-white">{{ s.month }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-700 dark:text-gray-300 font-mono">
                {{ formatNumber(s.amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-black text-brand-blue font-mono">
                {{ formatNumber(s.cumulative_amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                <UBadge :color="s.percent >= 100 ? 'success' : s.percent > 0 ? 'primary' : 'neutral'" variant="subtle" class="font-bold font-mono">
                  {{ s.percent }}%
                </UBadge>
              </td>
              <td class="px-6 py-4 text-xs text-gray-400 italic">
                {{ s.amount > 0 ? '활동 데이터 있음' : '-' }}
              </td>
            </tr>
            <tr v-if="statsData.length === 0 && !pending">
              <td colspan="5" class="px-6 py-20 text-center text-gray-500 italic">조회할 캠페인을 먼저 선택해 주세요.</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { formatNumber, displayValue } from '~/utils/formatter'
import { useUIStore } from '~/stores/ui'

const ui = useUIStore()
const selectedCampaignId = ref<string | null>(null)
const selectedYear = ref(new Date().getFullYear().toString())

// 1. 연도 옵션 (현재 기준 전후 3년)
const yearOptions = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 3 + i).toString())

// 2. 캠페인 목록 로드
const { data: campaignsRes } = await useFetch('/api/pledges/campaigns')
const campaigns = computed(() => ((campaignsRes.value as any)?.data || []).map((c: any) => ({ ...c, label: c.name })))

// 3. 월별 통계 데이터 로드
const { data: statsRes, refresh, pending } = await useFetch('/api/pledges/statistics/monthly', {
  query: computed(() => ({
    campaignId: selectedCampaignId.value,
    year: selectedYear.value
  })),
  immediate: false // 선택 전까지 호출 방지
})

const statsData = computed(() => (statsRes.value as any)?.data || [])
const meta = computed(() => (statsRes.value as any)?.meta)

// 4. 차트 막대 높이 계산
const getBarHeight = (amount: number) => {
  if (statsData.value.length === 0) return 0
  const max = Math.max(...statsData.value.map((s: any) => s.amount))
  if (max === 0) return 0
  return (amount / max) * 100
}

// 처음 렌더링 시 캠페인이 있다면 첫 번째 선택
watch(campaigns, (newVal) => {
  if (newVal.length > 0 && !selectedCampaignId.value) {
    selectedCampaignId.value = newVal[0].id
    refresh()
  }
}, { immediate: true })
</script>
