<template>
  <div class="space-y-6">
    <!-- 상단 필터 섹션 -->
    <div class="no-print bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-center sticky top-[-32px] z-20">
      <div class="flex items-center space-x-2">
        <UButton color="neutral" variant="outline" icon="i-heroicons-chevron-left" size="sm" class="cursor-pointer" @click="moveDate(-7)" />
        <UButton color="primary" variant="solid" label="이번주" size="sm" class="cursor-pointer font-bold px-6" @click="setPreset('thisWeek')" />
        <UButton color="neutral" variant="outline" icon="i-heroicons-chevron-right" size="sm" class="cursor-pointer" @click="moveDate(7)" />
        
        <div class="border-l border-gray-300 h-6 mx-2 dark:border-gray-600"></div>
        
        <UButton label="오늘" color="neutral" variant="ghost" size="sm" class="cursor-pointer" @click="setPreset('today')" />
        <UButton label="이번달" color="neutral" variant="ghost" size="sm" class="cursor-pointer" @click="setPreset('thisMonth')" />
        <UButton label="올해" color="neutral" variant="ghost" size="sm" class="cursor-pointer" @click="setPreset('thisYear')" />
      </div>
      
      <div class="flex items-center gap-2">
        <UInput v-model="startDate" type="date" class="w-36 font-mono text-sm cursor-pointer" @change="fetchData" />
        <span class="text-gray-500 font-bold">~</span>
        <UInput v-model="endDate" type="date" class="w-36 font-mono text-sm cursor-pointer" @change="fetchData" />
      </div>

      <div class="w-48 relative">
        <UInput v-model="keyword" placeholder="성도명 또는 적요 검색" icon="i-heroicons-magnifying-glass" @keyup.enter="fetchData" />
      </div>

      <div class="flex-grow"></div>
      
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
          icon="i-heroicons-printer" 
          color="neutral" 
          variant="outline" 
          label="인쇄" 
          class="cursor-pointer font-bold bg-white dark:bg-gray-800" 
          @click="printReport"
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

    <!-- 요약 카드 -->
    <div v-if="meta" class="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
      <div class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
        <div class="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full">
          <UIcon name="i-heroicons-users" class="w-6 h-6 text-brand-blue" />
        </div>
        <div>
          <p class="text-xs text-gray-500 font-bold">총 헌금 건수</p>
          <p class="text-xl font-black font-mono">{{ formatNumber(meta.totalCount) }}<span class="text-xs ml-1">건</span></p>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
        <div class="p-3 bg-green-50 dark:bg-green-900/30 rounded-full">
          <UIcon name="i-heroicons-banknotes" class="w-6 h-6 text-brand-green" />
        </div>
        <div>
          <p class="text-xs text-gray-500 font-bold">기간 합계 금액</p>
          <p class="text-xl font-black font-mono text-brand-blue">{{ formatNumber(meta.totalAmount) }}<span class="text-xs ml-1">원</span></p>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
        <div class="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-full">
          <UIcon name="i-heroicons-calendar" class="w-6 h-6 text-yellow-500" />
        </div>
        <div>
          <p class="text-xs text-gray-500 font-bold">조회 기준일</p>
          <p class="text-sm font-bold text-gray-700 dark:text-gray-300">{{ startDate }} ~ {{ endDate }}</p>
        </div>
      </div>
    </div>

    <!-- 리스트 테이블 영역 -->
    <div id="printable-donors" class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <!-- 인쇄 전용 헤더 -->
      <div class="hidden print:block text-center p-8 border-b">
        <h1 class="text-2xl font-black underline decoration-double underline-offset-8">헌 금 자 리 스 트</h1>
        <p class="mt-2 text-sm text-gray-500 font-mono">{{ startDate }} ~ {{ endDate }}</p>
      </div>

      <div class="overflow-x-auto w-full relative">
        <div v-if="pending" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
        </div>

        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">일자</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">성도명</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">직분</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">헌금종류 (계정)</th>
              <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">금액</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">적요/비고</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-800">
            <tr v-for="t in donorsData" :key="t.id" class="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{{ formatDate(t.transaction_date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                <div class="flex items-center gap-2">
                  <UIcon v-if="t.donor_name" :name="t.donor_type === 'MEMBER' ? 'i-heroicons-user' : 'i-heroicons-user-group'" class="w-3 h-3 text-gray-400" />
                  {{ t.donor_name || '(무명)' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <UBadge v-if="t.church_role_name" variant="subtle" size="xs" color="neutral" class="font-medium">
                  {{ t.church_role_name }}
                </UBadge>
                <span v-else>-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-medium">
                {{ t.account_name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-black font-mono text-brand-blue">
                {{ formatNumber(t.amount) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" :title="t.description || ''">
                {{ t.description || '-' }}
              </td>
            </tr>
            <tr v-if="donorsData.length === 0 && !pending">
              <td colspan="6" class="px-6 py-20 text-center text-gray-500 italic">조회된 헌금 내역이 없습니다.</td>
            </tr>
          </tbody>
          <!-- 인쇄 시 하단 합계 표시 -->
          <tfoot v-if="donorsData.length > 0" class="bg-gray-50 dark:bg-gray-900/50 font-bold border-t-2">
            <tr>
              <td colspan="4" class="px-6 py-4 text-center text-sm uppercase tracking-widest">합 계</td>
              <td class="px-6 py-4 text-right text-sm font-mono text-brand-blue">{{ formatNumber(meta?.totalAmount) }}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- 페이징 -->
    <div v-if="meta && meta.totalPages > 1" class="flex justify-center no-print">
      <UPagination v-model:page="currentPage" :total="meta.totalCount" :items-per-page="limit" @change="fetchData" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { formatNumber, formatDate } from '~/utils/formatter'
import { useUIStore } from '~/stores/ui'
import * as XLSX from 'xlsx'

const ui = useUIStore()

// 1. 상태 관리
const today = new Date()
const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
const startDate = ref(startOfWeek.toISOString().split('T')[0])
const endDate = ref(today.toISOString().split('T')[0])
const keyword = ref('')
const currentPage = ref(1)
const limit = 20

// 2. API 연동
const { data: response, pending, refresh } = await useFetch('/api/reports/donors', {
  query: computed(() => ({
    startDate: startDate.value,
    endDate: endDate.value,
    keyword: keyword.value,
    page: currentPage.value,
    limit
  })),
  immediate: false,
  watch: false
})

const donorsData = computed(() => (response.value as any)?.data || [])
const meta = computed(() => (response.value as any)?.meta || null)

// 3. 기능 함수
const fetchData = () => {
  currentPage.value = 1
  refresh()
}

// 페이지 변경 시 자동 리프레시
watch(currentPage, () => {
  refresh()
})

const moveDate = (days: number) => {
  const d1 = new Date(startDate.value)
  d1.setDate(d1.getDate() + days)
  startDate.value = d1.toISOString().split('T')[0]
  
  const d2 = new Date(endDate.value)
  d2.setDate(d2.getDate() + days)
  endDate.value = d2.toISOString().split('T')[0]
  
  fetchData()
}

const setPreset = (type: 'today' | 'thisWeek' | 'thisMonth' | 'thisYear') => {
  const now = new Date()
  let start, end = now
  
  if (type === 'today') {
    start = now
  } else if (type === 'thisWeek') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
  } else if (type === 'thisMonth') {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
  } else if (type === 'thisYear') {
    start = new Date(now.getFullYear(), 0, 1)
  }
  
  if (start) {
    startDate.value = start.toISOString().split('T')[0]
    endDate.value = end.toISOString().split('T')[0]
    fetchData()
  }
}

const printReport = () => {
  window.print()
}

const downloadExcel = () => {
  if (!donorsData.value.length) return
  
  const wsData = [
    ['헌금자 리스트'],
    [`기간: ${startDate.value} ~ ${endDate.value}`],
    [],
    ['일자', '성도명', '직분', '헌금종류', '금액', '적요'],
    ...donorsData.value.map((t: any) => [
      formatDate(t.transaction_date),
      t.member_name || '(무명)',
      t.church_role_name || '-',
      t.account_name,
      t.amount,
      t.description || ''
    ]),
    [],
    ['합계', '', '', '', meta.value?.totalAmount, '']
  ]
  
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  XLSX.utils.book_append_sheet(wb, ws, '헌금자리스트')
  XLSX.writeFile(wb, `헌금자리스트_${startDate.value}_${endDate.value}.xlsx`)
}

onMounted(() => {
  refresh()
})
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
  #printable-donors {
    border: none !important;
    box-shadow: none !important;
  }
  table {
    font-size: 10pt;
  }
  th, td {
    padding: 8px 4px !important;
  }
}
</style>
