<template>
  <div class="space-y-6 pb-20">
    <!-- 헤더 버튼 -->
    <div class="flex justify-end space-x-2">
      <UButton 
        icon="i-heroicons-table-cells" 
        color="success" 
        variant="outline" 
        label="엑셀" 
        class="cursor-pointer bg-white dark:bg-gray-800 font-bold" 
        @click="downloadExcel"
      />
    </div>

    <!-- 테이블 영역 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden">
      <div v-if="pending" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-30 py-20">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm border-collapse">
          <thead class="bg-gray-50 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-20 shadow-sm">
            <tr>
              <th class="px-6 py-4 text-left font-bold text-gray-600 dark:text-gray-300 uppercase w-32">계정코드</th>
              <th class="px-6 py-4 text-left font-bold text-gray-600 dark:text-gray-300 uppercase">계정이름</th>
              <th class="px-6 py-4 text-right font-bold text-gray-600 dark:text-gray-300 uppercase">전년예산 ({{ parseInt(props.selectedYear) - 1 }})</th>
              <th class="px-6 py-4 text-right font-bold text-gray-600 dark:text-gray-300 uppercase">예산 ({{ isPastYear ? '조회' : '입력' }})</th>
              <th class="px-6 py-4 text-right font-bold text-gray-600 dark:text-gray-300 uppercase">증감</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="item in processedBudgets" :key="item.code" 
                :class="[
                  item.level === 0 ? 'bg-red-50/40 dark:bg-red-900/20' : 
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
                    :disabled="isPastYear"
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
              <td colspan="5" class="px-6 py-20 text-center text-gray-500 italic font-medium">표시할 지출 계정과목이 없습니다. 기초코드를 확인해 주세요.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 하단 스티키 바 (지출용) -->
    <div v-if="processedBudgets.length > 0" 
         class="fixed bottom-0 left-64 right-0 bg-slate-900/95 backdrop-blur-md text-white p-4 shadow-2xl z-40 border-t border-slate-700 transition-all duration-300">
      <div class="max-w-[1600px] mx-auto flex items-center justify-between px-8">
        <div class="flex items-center gap-12">
          <div class="flex flex-col">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">지출 총계 ({{ props.selectedYear }})</span>
            <span class="text-xl font-black font-mono text-red-500">{{ formatNumber(totalThisYear) }}</span>
          </div>
          <div class="flex flex-col border-l border-slate-700 pl-8">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">전년 대비 증감</span>
            <span class="text-xl font-black font-mono" :class="getChangeColor(totalThisYear - totalLastYear)">
              {{ totalThisYear - totalLastYear > 0 ? '+' : '' }}{{ formatNumber(totalThisYear - totalLastYear) }}
            </span>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
          <UButton 
            v-if="!isPastYear"
            color="primary" 
            size="xl"
            label="지출 예산 저장하기" 
            icon="i-heroicons-check-badge"
            class="cursor-pointer font-black px-10 shadow-xl hover:scale-105 transition-transform" 
            :loading="isSaving"
            @click="saveBudgets"
          />
          <p v-else class="text-sm text-slate-400 italic">
            * 과거 회계년도는 조회만 가능합니다.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUIStore } from '~/stores/ui'
import { downloadAsExcel } from '~/utils/excel'
import { formatNumber, displayValue, formatDate, formatPhoneNumber, getRoleInfo } from '~/utils/formatter'

const props = defineProps<{
  selectedYear: string
}>()

const ui = useUIStore()
const isSaving = ref(false)

const isPastYear = computed(() => {
  const currentYear = new Date().getFullYear()
  return parseInt(props.selectedYear) < currentYear
})

// 1. 데이터 페칭 (EXPENSE 타입)
const { data: response, refresh, pending } = await useFetch('/api/budget', {
  query: computed(() => ({
    year: props.selectedYear,
    type: 'EXPENSE'
  }))
})

const budgetData = ref<any[]>([])

watch(response, (newVal: any) => {
  if (newVal?.data) {
    budgetData.value = newVal.data.map((item: any) => ({ ...item }))
  }
}, { immediate: true })


// 2. 계층형 합계 계산 로직 (반응성 유지)
const processedBudgets = computed(() => {
  if (!budgetData.value.length) return []
  
  const totalsMap = new Map()
  const lastYearTotalsMap = new Map()
  
  budgetData.value.forEach(item => {
    if (item.level === 2) {
      totalsMap.set(item.code, parseFloat(item.thisYearBudget) || 0)
      lastYearTotalsMap.set(item.code, parseFloat(item.lastYearBudget) || 0)
    } else {
      totalsMap.set(item.code, 0)
      lastYearTotalsMap.set(item.code, 0)
    }
  })

  const sortedLevels = [2, 1]
  sortedLevels.forEach(lvl => {
    budgetData.value.filter(i => i.level === lvl).forEach(item => {
      if (item.parent_code) {
        const currentTotal = totalsMap.get(item.parent_code) || 0
        const lastYearTotal = lastYearTotalsMap.get(item.parent_code) || 0
        totalsMap.set(item.parent_code, currentTotal + (totalsMap.get(item.code) || 0))
        lastYearTotalsMap.set(item.parent_code, lastYearTotal + (lastYearTotalsMap.get(item.code) || 0))
      }
    })
  })

  return budgetData.value.map(item => {
    if (item.level < 2) {
      return {
        ...item,
        thisYearBudget: totalsMap.get(item.code),
        lastYearBudget: lastYearTotalsMap.get(item.code)
      }
    }
    return item
  })
})

const totalThisYear = computed(() => {
  return budgetData.value
    .filter(i => i.level === 2)
    .reduce((sum, i) => sum + (parseFloat(i.thisYearBudget) || 0), 0)
})

const totalLastYear = computed(() => {
  return budgetData.value
    .filter(i => i.level === 2)
    .reduce((sum, i) => sum + (parseFloat(i.lastYearBudget) || 0), 0)
})

const getChangeColor = (change: number) => {
  if (change > 0) return 'text-red-400'
  if (change < 0) return 'text-blue-400'
  return 'text-slate-400'
}

// 3. 저장 로직
const saveBudgets = async () => {
  if (isPastYear.value) return

  const confirmed = await ui.showConfirm('예산 저장', `${props.selectedYear}년도 지출 예산을 저장하시겠습니까?`, 'info')
  if (!confirmed) return

  isSaving.value = true
  try {
    const payload = budgetData.value
      .filter(i => i.level === 2)
      .map(i => ({
        code: i.code,
        amount: parseInt(i.thisYearBudget as any) || 0
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

<style scoped>
th {
  position: sticky;
  top: 0;
  z-index: 20;
}
</style>
