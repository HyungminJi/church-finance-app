<template>
  <div class="space-y-6">
    <!-- 검색 및 필터 옵션 -->
    <div class="no-print bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-center justify-between sticky top-[-32px] z-20">
      <div class="flex flex-wrap items-center gap-4">
        <!-- 기간 선택 -->
        <div class="flex items-center space-x-2">
          <label class="text-sm font-bold text-gray-700 dark:text-gray-300">조회 기간:</label>
          <UInput v-model="startDate" type="date" class="w-36 font-mono text-sm cursor-pointer" @change="refresh" />
          <span class="text-gray-500 font-bold">~</span>
          <UInput v-model="endDate" type="date" class="w-36 font-mono text-sm cursor-pointer" @change="refresh" />
        </div>
        
        <div class="border-l border-gray-300 h-6 dark:border-gray-600"></div>
        
        <div class="flex space-x-1">
          <UButton label="이번달" color="neutral" variant="outline" size="xs" class="cursor-pointer bg-white dark:bg-gray-700" @click="setPreset('thisMonth')" />
          <UButton label="올해" color="neutral" variant="outline" size="xs" class="cursor-pointer bg-white dark:bg-gray-700" @click="setPreset('thisYear')" />
        </div>
      </div>
      
      <!-- 액션 버튼 -->
      <div class="flex items-center space-x-2">
        <UButton 
          icon="i-heroicons-arrow-path" 
          color="neutral" 
          variant="ghost" 
          class="cursor-pointer" 
          :loading="pending"
          @click="refresh" 
        />
        <UButton 
          icon="i-heroicons-table-cells" 
          color="success" 
          variant="outline" 
          label="엑셀" 
          class="cursor-pointer font-bold bg-white dark:bg-gray-800" 
          @click="downloadExcel"
        />
      </div>
    </div>

    <!-- 통계 결과 컨테이너 -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- 좌측: 기준 선택 리스트 -->
      <div class="lg:col-span-3 bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col h-fit">
        <div class="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <span class="text-sm font-black text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <UIcon name="i-heroicons-funnel" class="text-brand-blue" />
            집계 기준 선택
          </span>
        </div>
        <div class="p-2">
          <ul class="space-y-1">
            <li v-for="m in statModes" :key="m.id" 
                class="p-3 flex items-center gap-3 rounded-lg cursor-pointer transition-all duration-200 group"
                :class="mode === m.id ? 'bg-blue-50 dark:bg-blue-900/30 text-brand-blue font-black border border-blue-100 dark:border-blue-800' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'"
                @click="changeMode(m.id)"
            >
              <UIcon :name="m.icon" class="w-5 h-5" :class="mode === m.id ? 'text-brand-blue' : 'text-gray-400 group-hover:text-gray-600'" />
              <span class="text-sm">{{ m.label }}</span>
              <UIcon v-if="mode === m.id" name="i-heroicons-check-circle" class="ml-auto w-4 h-4" />
            </li>
          </ul>
        </div>
      </div>

      <!-- 우측: 통계 데이터 및 차트 -->
      <div class="lg:col-span-9 flex flex-col gap-6">
        <!-- 상단 요약 카드 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-6">
            <div class="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
              <UIcon name="i-heroicons-banknotes" class="w-8 h-8 text-brand-blue" />
            </div>
            <div>
              <p class="text-xs text-gray-500 font-black uppercase tracking-widest mb-1">기간 총 헌금액</p>
              <p class="text-3xl font-black font-mono text-gray-900 dark:text-white leading-none">
                {{ formatNumber(totalAmount) }}<span class="text-sm ml-1 font-bold text-gray-400">원</span>
              </p>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-6">
            <div class="p-4 bg-green-50 dark:bg-green-900/30 rounded-2xl">
              <UIcon name="i-heroicons-ticket" class="w-8 h-8 text-brand-green" />
            </div>
            <div>
              <p class="text-xs text-gray-500 font-black uppercase tracking-widest mb-1">전체 집계 건수</p>
              <p class="text-3xl font-black font-mono text-brand-blue leading-none">
                {{ formatNumber(totalCount) }}<span class="text-sm ml-1 font-bold text-gray-400">건</span>
              </p>
            </div>
          </div>
        </div>

        <!-- 상세 통계 테이블 -->
        <div class="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 relative">
          <div v-if="pending" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10">
            <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
          </div>

          <div class="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 class="text-sm font-black text-gray-800 dark:text-white flex items-center gap-2">
              <UIcon name="i-heroicons-chart-bar" class="text-brand-blue" />
              {{ currentModeLabel }}별 분석 결과
            </h3>
            <span class="text-[10px] font-bold text-gray-400 px-2 py-1 bg-white dark:bg-gray-800 rounded border dark:border-gray-700">단위: 원, 건</span>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-100 dark:bg-gray-900/50">
                <tr>
                  <th class="px-6 py-4 text-left text-[11px] font-black text-gray-500 uppercase tracking-tighter">항목/명칭</th>
                  <th class="px-6 py-4 text-right text-[11px] font-black text-gray-500 uppercase tracking-tighter w-24">건수</th>
                  <th class="px-6 py-4 text-right text-[11px] font-black text-gray-500 uppercase tracking-tighter w-40">금액</th>
                  <th class="px-6 py-4 text-right text-[11px] font-black text-gray-500 uppercase tracking-tighter w-20">비율</th>
                  <th class="px-6 py-4 text-left text-[11px] font-black text-gray-500 uppercase tracking-tighter min-w-[150px]">분포 그래프</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-800">
                <tr v-for="(item, idx) in statData" :key="idx" class="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{{ item.label }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 font-mono">{{ formatNumber(item.count) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-brand-blue font-black">{{ formatNumber(item.amount) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-mono font-bold text-gray-700 dark:text-gray-300">
                    {{ calculateRate(item.amount) }}%
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                      <div class="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000 ease-out group-hover:brightness-110" 
                           :style="{ width: calculateRate(item.amount) + '%' }"></div>
                    </div>
                  </td>
                </tr>
                <tr v-if="statData.length === 0 && !pending">
                  <td colspan="5" class="px-6 py-20 text-center text-gray-400 italic font-medium bg-gray-50/30">
                    선택한 기간 및 기준에 해당하는 데이터가 없습니다.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 시각화 차트 영역 -->
        <div v-if="statData.length > 0" class="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-8 flex flex-col md:flex-row items-center gap-12">
          <div class="relative w-56 h-56 shrink-0 shadow-2xl rounded-full">
            <div class="absolute inset-0 rounded-full" 
                 :style="{ background: generateConicGradient() }"></div>
            <div class="absolute inset-8 bg-white dark:bg-gray-800 rounded-full flex flex-col items-center justify-center shadow-inner">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">비중 분석</span>
              <span class="text-xl font-black text-brand-blue">TOP {{ statData.length > 5 ? 5 : statData.length }}</span>
            </div>
          </div>
          
          <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div v-for="(item, idx) in statData.slice(0, 6)" :key="idx" class="flex items-center gap-3">
              <span class="w-3 h-3 rounded-full shrink-0 shadow-sm" :style="{ backgroundColor: chartColors[idx % chartColors.length] }"></span>
              <span class="text-xs font-bold text-gray-600 dark:text-gray-300 truncate max-w-[120px]">{{ item.label }}</span>
              <span class="text-xs font-black font-mono text-gray-400 ml-auto">{{ calculateRate(item.amount) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { formatNumber } from '~/utils/formatter'
import { useUIStore } from '~/stores/ui'
import * as XLSX from 'xlsx'

const ui = useUIStore()

// 1. 상태 관리
const today = new Date()
const firstDayOfYear = new Date(today.getFullYear(), 0, 1)
const startDate = ref(firstDayOfYear.toISOString().split('T')[0])
const endDate = ref(today.toISOString().split('T')[0])
const mode = ref<'ACCOUNT' | 'CELL_GROUP' | 'ORGANIZATION'>('ACCOUNT')

const statModes = [
  { id: 'ACCOUNT', label: '항목별 비중', icon: 'i-heroicons-tag', color: 'blue' },
  { id: 'CELL_GROUP', label: '구역별 분포', icon: 'i-heroicons-user-group', color: 'green' },
  { id: 'ORGANIZATION', label: '단체별 분석', icon: 'i-heroicons-building-office', color: 'purple' }
]

const currentModeLabel = computed(() => statModes.find(m => m.id === mode.value)?.label || '')

const chartColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']

// 2. API 연동
const { data: response, pending, refresh } = await useFetch('/api/reports/statistics', {
  query: computed(() => ({
    startDate: startDate.value,
    endDate: endDate.value,
    mode: mode.value
  })),
  immediate: false,
  watch: false
})

const statData = computed(() => (response.value as any)?.data || [])

const totalAmount = computed(() => statData.value.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0))
const totalCount = computed(() => statData.value.reduce((acc: number, curr: any) => acc + Number(curr.count), 0))

// 3. 기능 함수
const calculateRate = (amount: number) => {
  if (totalAmount.value === 0) return '0.0'
  return ((Number(amount) / totalAmount.value) * 100).toFixed(1)
}

const changeMode = (newMode: any) => {
  mode.value = newMode
  refresh()
}

const setPreset = (type: 'thisMonth' | 'thisYear') => {
  const now = new Date()
  let start, end = now
  if (type === 'thisMonth') {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
  } else if (type === 'thisYear') {
    start = new Date(now.getFullYear(), 0, 1)
  }
  if (start) {
    startDate.value = start.toISOString().split('T')[0]
    endDate.value = end.toISOString().split('T')[0]
    refresh()
  }
}

const generateConicGradient = () => {
  if (statData.value.length === 0) return '#e5e7eb'
  let current = 0
  const slices = statData.value.slice(0, 7).map((item: any, idx: number) => {
    const rate = (Number(item.amount) / totalAmount.value) * 100
    const start = current
    current += rate
    return `${chartColors[idx % chartColors.length]} ${start}% ${current}%`
  })
  if (current < 100) {
    slices.push(`#e5e7eb ${current}% 100%`)
  }
  return `conic-gradient(${slices.join(', ')})`
}

const downloadExcel = () => {
  if (statData.value.length === 0) return
  const wsData = [
    [`${currentModeLabel.value} 분석 (${startDate.value} ~ ${endDate.value})`],
    [],
    ['항목/명칭', '건수', '금액', '비율(%)'],
    ...statData.value.map((item: any) => [
      item.label,
      item.count,
      item.amount,
      calculateRate(item.amount)
    ]),
    [],
    ['합계', totalCount.value, totalAmount.value, '100.0']
  ]
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  XLSX.utils.book_append_sheet(wb, ws, '통계데이터')
  XLSX.writeFile(wb, `헌금통계_${mode.value}_${startDate.value}.xlsx`)
}

onMounted(() => {
  refresh()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E2E8F0;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
}
</style>
