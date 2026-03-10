<template>
  <div class="space-y-6">
    <!-- 헤더 버튼 -->
    <div class="flex justify-end space-x-2">
      <UButton 
        icon="i-heroicons-table-cells" 
        color="success" 
        variant="outline" 
        label="엑셀" 
        class="bg-white dark:bg-gray-800 font-bold" 
        @click="downloadExcel"
      />
      <UButton 
        color="primary" 
        label="저장하기" 
        class="font-bold px-8 shadow-md" 
        :loading="isSaving"
        @click="saveBudgets"
      />
    </div>

    <!-- 테이블 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative">
      <div v-if="pending" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10 py-20">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
      </div>

      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
        <thead class="bg-gray-50 dark:bg-gray-900/50">
          <tr>
            <th class="px-6 py-3 text-left font-bold text-gray-500 uppercase">계정코드</th>
            <th class="px-6 py-3 text-left font-bold text-gray-500 uppercase">계정이름</th>
            <th class="px-6 py-3 text-right font-bold text-gray-500 uppercase">전년예산 ({{ props.selectedYear - 1 }})</th>
            <th class="px-6 py-3 text-right font-bold text-gray-500 uppercase">예산 (입력)</th>
            <th class="px-6 py-3 text-right font-bold text-gray-500 uppercase">증감</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="item in processedBudgets" :key="item.code" 
              :class="[
                item.level === 0 ? 'bg-red-50/40 dark:bg-red-900/10' : 
                item.level === 1 ? 'bg-gray-50/50 dark:bg-gray-900/30' : ''
              ]">
            <td class="px-6 py-4 whitespace-nowrap font-mono text-gray-500">{{ item.code }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div :style="{ paddingLeft: (item.level * 24) + 'px' }" class="flex items-center">
                <UIcon :name="item.level < 2 ? 'i-heroicons-folder' : 'i-heroicons-document-text'" 
                       class="w-4 h-4 mr-2" 
                       :class="item.level < 2 ? 'text-red-500' : 'text-gray-400'" />
                <span :class="{'font-bold': item.level < 2}">{{ item.name }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-right font-mono text-gray-500">{{ formatNumber(item.lastYearBudget) }}</td>
            <td class="px-6 py-4 text-right">
              <div v-if="item.level === 2" class="flex justify-end">
                <UInput 
                  v-model="item.thisYearBudget" 
                  type="number"
                  class="w-40 text-right font-bold font-mono" 
                  size="sm"
                />
              </div>
              <span v-else class="font-bold font-mono text-red-600">{{ formatNumber(item.thisYearBudget) }}</span>
            </td>
            <td class="px-6 py-4 text-right font-mono font-bold" :class="getChangeColor(item.thisYearBudget - item.lastYearBudget)">
              {{ formatNumber(item.thisYearBudget - item.lastYearBudget) }}
            </td>
          </tr>
          <tr v-if="processedBudgets.length === 0 && !pending">
            <td colspan="5" class="px-6 py-20 text-center text-gray-500 italic">표시할 지출 계정과목이 없습니다. 기초코드를 확인해 주세요.</td>
          </tr>
        </tbody>
        <!-- 총합계 -->
        <tfoot v-if="processedBudgets.length > 0">
          <tr class="bg-slate-900 text-white font-bold">
            <td colspan="2" class="px-6 py-4 text-center text-sm uppercase">지출 총계</td>
            <td class="px-6 py-4 text-right font-mono">{{ formatNumber(totalLastYear) }}</td>
            <td class="px-6 py-4 text-right font-mono">{{ formatNumber(totalThisYear) }}</td>
            <td class="px-6 py-4 text-right font-mono" :class="getChangeColor(totalThisYear - totalLastYear)">
              {{ formatNumber(totalThisYear - totalLastYear) }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUIStore } from '~/stores/ui'
import { downloadAsExcel } from '~/utils/excel'

const props = defineProps<{
  selectedYear: string
}>()

const ui = useUIStore()
const isSaving = ref(false)

// 1. 데이터 페칭 (EXPENSE 타입)
const { data: response, refresh, pending } = await useFetch('/api/budget', {
  query: computed(() => ({
    year: props.selectedYear,
    type: 'EXPENSE'
  }))
})

const budgetData = ref<any[]>([])

watch(response, (newVal) => {
  if (newVal?.data) {
    budgetData.value = JSON.parse(JSON.stringify(newVal.data))
  }
}, { immediate: true })

// 2. 계층형 합계 계산 로직 (지출용)
const processedBudgets = computed(() => {
  const list = [...budgetData.value]
  const finalMap = new Map()
  list.forEach(item => finalMap.set(item.code, { ...item }))

  // 역순 합산 전파
  [2, 1].forEach(lvl => {
    list.filter(item => item.level === lvl).forEach(item => {
      if (item.parent_code) {
        const parent = finalMap.get(item.parent_code)
        if (parent) {
          if (lvl === 2 && !parent._summed) {
            parent.thisYearBudget = 0
            parent.lastYearBudget = 0
            parent._summed = true
          }
          parent.thisYearBudget += (parseInt(item.thisYearBudget) || 0)
          parent.lastYearBudget += (parseInt(item.lastYearBudget) || 0)
        }
      }
    })
  })

  return Array.from(finalMap.values())
})

const totalThisYear = computed(() => {
  return budgetData.value
    .filter(i => i.level === 2)
    .reduce((sum, i) => sum + (parseInt(i.thisYearBudget) || 0), 0)
})

const totalLastYear = computed(() => {
  return budgetData.value
    .filter(i => i.level === 2)
    .reduce((sum, i) => sum + (parseInt(i.lastYearBudget) || 0), 0)
})

const formatNumber = (val: number) => {
  return new Intl.NumberFormat().format(val)
}

const getChangeColor = (change: number) => {
  if (change > 0) return 'text-red-600' // 지출 증가는 빨간색
  if (change < 0) return 'text-blue-600' // 지출 감소는 파란색
  return 'text-gray-400'
}

// 3. 저장 로직
const saveBudgets = async () => {
  const confirmed = await ui.showConfirm('예산 저장', `${props.selectedYear}년도 지출 예산을 저장하시겠습니까?`, 'info')
  if (!confirmed) return

  isSaving.value = true
  try {
    const payload = budgetData.value
      .filter(i => i.level === 2)
      .map(i => ({
        code: i.code,
        amount: parseInt(i.thisYearBudget) || 0
      }))

    const res: any = await $fetch('/api/budget', {
      method: 'POST',
      body: {
        fiscal_year: props.selectedYear,
        budgets: payload
      }
    })

    if (res.success) {
      ui.showAlert('성공', '지출 예산이 저장되었습니다.', 'success')
      await refresh()
    }
  } catch (error: any) {
    ui.showAlert('오류', '예산 저장 중 오류가 발생했습니다.', 'error')
  } finally {
    isSaving.value = false
  }
}

// 4. 엑셀 다운로드
const downloadExcel = () => {
  const excelData = processedBudgets.value.map(i => ({
    '계정코드': i.code,
    '계정이름': '  '.repeat(i.level) + i.name,
    '전년예산': i.lastYearBudget,
    '본년예산': i.thisYearBudget,
    '증감': i.thisYearBudget - i.lastYearBudget
  }))
  
  downloadAsExcel(excelData, `${props.selectedYear}_지출예산안`)
}
</script>
