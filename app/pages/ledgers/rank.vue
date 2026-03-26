<template>
  <div class="space-y-6">
    <!-- 상단 필터 섹션 -->
    <div class="no-print bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col gap-6 sticky top-[-32px] z-20">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm font-black text-gray-700 dark:text-gray-300">조회 기간</span>
            <UInput v-model="startDate" type="date" class="w-36 font-mono text-sm cursor-pointer" @change="fetchData" />
            <span class="text-gray-500 font-bold">~</span>
            <UInput v-model="endDate" type="date" class="w-36 font-mono text-sm cursor-pointer" @change="fetchData" />
          </div>
          
          <div class="flex space-x-1">
            <UButton label="이번달" color="neutral" variant="outline" size="xs" class="cursor-pointer" @click="setPreset('thisMonth')" />
            <UButton label="올해" color="neutral" variant="outline" size="xs" class="cursor-pointer" @click="setPreset('thisYear')" />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <UButton 
            icon="i-heroicons-arrow-path" 
            color="neutral" 
            variant="ghost" 
            class="cursor-pointer" 
            :loading="pending"
            @click="fetchData" 
          />
          <UButton 
            icon="i-heroicons-table-cells" 
            color="success" 
            variant="outline" 
            label="엑셀" 
            class="cursor-pointer font-bold bg-white dark:bg-gray-800" 
            @click="downloadExcel"
          />
          <UButton 
            label="조회하기" 
            color="primary" 
            class="cursor-pointer font-black px-8" 
            @click="fetchData" 
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t dark:border-gray-700">
        <UFormField label="헌금 종류 (필터)" help="비워두면 전체 항목을 합산합니다.">
          <USelectMenu 
            v-model="selectedAccountCodes" 
            :items="incomeAccounts" 
            multiple 
            value-key="code" 
            label-key="name"
            placeholder="항목 선택 (다중 가능)"
            class="w-full cursor-pointer shadow-sm"
            @update:model-value="fetchData"
          />
        </UFormField>
        
        <UFormField label="표시 제한" help="상위 몇 명까지 표시할지 설정합니다.">
          <USelectMenu 
            v-model="limit" 
            :items="limitOptions" 
            class="w-full cursor-pointer shadow-sm" 
            @update:model-value="fetchData"
          />
        </UFormField>
      </div>
    </div>

    <!-- 순위 테이블 영역 -->
    <div class="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 relative">
      <div v-if="pending" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
      </div>

      <div class="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 class="text-sm font-black text-gray-800 dark:text-white flex items-center gap-2">
          <UIcon name="i-heroicons-trophy" class="text-yellow-500" />
          통합 헌금자 순위 분석 결과
        </h3>
        <div v-if="meta" class="text-[10px] font-bold text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border dark:border-gray-700">
          대상 총액: {{ formatNumber(meta.grandTotal) }}원
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-100 dark:bg-gray-900/50 text-[11px] text-gray-500">
            <tr>
              <th class="px-6 py-4 text-center font-black uppercase w-20">순위</th>
              <th class="px-6 py-4 text-left font-black uppercase">이름/명칭</th>
              <th class="px-6 py-4 text-left font-black uppercase">구분</th>
              <th class="px-6 py-4 text-left font-black uppercase">소속/직분</th>
              <th class="px-6 py-4 text-right font-black uppercase w-24">건수</th>
              <th class="px-6 py-4 text-right font-black uppercase w-40">총 납부액</th>
              <th class="px-6 py-4 text-left font-black uppercase min-w-[150px]">기여 비중</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-800">
            <tr v-for="(item, idx) in rankData" :key="item.donor_id" 
                class="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <div class="inline-flex items-center justify-center w-8 h-8 rounded-xl font-black text-sm shadow-sm"
                     :class="getRankStyle(idx)">
                  {{ idx + 1 }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div :class="getDonorIconBg(item.donor_type)" class="p-1.5 rounded-lg shrink-0">
                    <UIcon :name="getDonorIcon(item.donor_type)" class="w-4 h-4 text-white" />
                  </div>
                  <span class="text-sm font-black text-gray-900 dark:text-white">{{ item.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge variant="subtle" color="neutral" class="font-bold">
                  {{ item.donor_type === 'MEMBER' ? '성도' : item.donor_type === 'CELL_GROUP' ? '구역' : '단체' }}
                </UBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span v-if="item.cell_group_name" class="font-medium">{{ item.cell_group_name }}</span>
                <span v-if="item.church_role_name" class="ml-1 text-[11px] text-gray-400">({{ item.church_role_name }})</span>
                <span v-if="!item.cell_group_name && !item.church_role_name">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 font-mono">{{ formatNumber(item.tx_count) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-brand-blue font-black">
                {{ formatNumber(item.total_amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden shadow-inner w-32">
                    <div class="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000 ease-out" 
                         :style="{ width: item.rate + '%' }"></div>
                  </div>
                  <span class="text-[11px] font-black font-mono text-gray-400 w-10 text-right">{{ item.rate }}%</span>
                </div>
              </td>
            </tr>
            <tr v-if="rankData.length === 0 && !pending">
              <td colspan="7" class="px-6 py-24 text-center text-gray-400 italic font-medium bg-gray-50/30">
                조회된 순위 데이터가 없습니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { formatNumber, displayValue } from '~/utils/formatter'
import { useUIStore } from '~/stores/ui'
import * as XLSX from 'xlsx'

const ui = useUIStore()

// 1. 상태 관리
const today = new Date()
const firstDayOfYear = new Date(today.getFullYear(), 0, 1)
const startDate = ref(firstDayOfYear.toISOString().split('T')[0])
const endDate = ref(today.toISOString().split('T')[0])
const limit = ref(50)
const limitOptions = [10, 30, 50, 100]
const selectedAccountCodes = ref([])

// 2. 기초 데이터 로드 (계정과목)
const { data: accountsRes } = await useFetch('/api/accounts')
const incomeAccounts = computed(() => {
  return ((accountsRes.value as any)?.data || []).filter((a: any) => a.type === 'INCOME' && a.level === 2)
})

// 3. 순위 데이터 API 연동
const { data: response, pending, refresh } = await useFetch('/api/reports/ranking', {
  query: computed(() => ({
    startDate: startDate.value,
    endDate: endDate.value,
    limit: limit.value,
    accountCodes: selectedAccountCodes.value.join(',')
  })),
  immediate: false,
  watch: false
})

const rankData = computed(() => (response.value as any)?.data || [])
const meta = computed(() => (response.value as any)?.meta || null)

// 4. 기능 함수
const fetchData = () => {
  if (!startDate.value || !endDate.value) {
    ui.showAlert('알림', '조회 기간을 선택해 주세요.', 'warning')
    return
  }
  refresh()
}

const setPreset = (type: 'thisMonth' | 'thisYear') => {
  const now = new Date()
  let start = now
  if (type === 'thisMonth') start = new Date(now.getFullYear(), now.getMonth(), 1)
  else if (type === 'thisYear') start = new Date(now.getFullYear(), 0, 1)
  
  startDate.value = start.toISOString().split('T')[0]
  endDate.value = now.toISOString().split('T')[0]
  fetchData()
}

const getRankStyle = (idx: number) => {
  if (idx === 0) return 'bg-yellow-400 text-white ring-4 ring-yellow-100 dark:ring-yellow-900/30'
  if (idx === 1) return 'bg-slate-300 text-white ring-4 ring-slate-100 dark:ring-slate-800/30'
  if (idx === 2) return 'bg-amber-600 text-white ring-4 ring-amber-100 dark:ring-amber-900/30'
  return 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
}

const getDonorIcon = (type: string) => {
  if (type === 'MEMBER') return 'i-heroicons-user'
  if (type === 'CELL_GROUP') return 'i-heroicons-user-group'
  return 'i-heroicons-building-office'
}

const getDonorIconBg = (type: string) => {
  if (type === 'MEMBER') return 'bg-blue-500'
  if (type === 'CELL_GROUP') return 'bg-green-500'
  return 'bg-purple-500'
}

const downloadExcel = () => {
  if (rankData.value.length === 0) return
  const wsData = [
    [`헌금자 순위 분석 (${startDate.value} ~ ${endDate.value})`],
    [],
    ['순위', '성함/명칭', '구분', '소속/직분', '건수', '총금액', '비율(%)'],
    ...rankData.value.map((item: any, idx: number) => [
      idx + 1,
      item.name,
      item.donor_type === 'MEMBER' ? '성도' : item.donor_type === 'CELL_GROUP' ? '구역' : '단체',
      `${item.cell_group_name || ''} ${item.church_role_name || ''}`,
      item.tx_count,
      item.total_amount,
      item.rate
    ])
  ]
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  XLSX.utils.book_append_sheet(wb, ws, '순위데이터')
  XLSX.writeFile(wb, `헌금자순위_${startDate.value}.xlsx`)
}

onMounted(() => {
  fetchData()
})
</script>
