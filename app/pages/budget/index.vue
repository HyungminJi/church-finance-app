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
                item.level === 0 ? 'bg-blue-50/40 dark:bg-blue-900/20' : 
                item.level === 1 ? 'bg-gray-50/50 dark:bg-gray-900/30' : ''
              ]">
            <td class="px-6 py-4 whitespace-nowrap font-mono text-gray-500">{{ item.code }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div :style="{ paddingLeft: (item.level * 24) + 'px' }" class="flex items-center">
                <UIcon :name="item.level < 2 ? 'i-heroicons-folder' : 'i-heroicons-document-text'" 
                       class="w-4 h-4 mr-2" 
                       :class="item.level < 2 ? 'text-brand-blue' : 'text-gray-400'" />
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
                  @update:model-value="() => {}"
                />
              </div>
              <span v-else class="font-bold font-mono text-brand-blue">{{ formatNumber(item.thisYearBudget) }}</span>
            </td>
            <td class="px-6 py-4 text-right font-mono font-bold" :class="getChangeColor(item.thisYearBudget - item.lastYearBudget)">
              {{ formatNumber(item.thisYearBudget - item.lastYearBudget) }}
            </td>
          </tr>
          <tr v-if="processedBudgets.length === 0 && !pending">
            <td colspan="5" class="px-6 py-20 text-center text-gray-500 italic">표시할 수입 계정과목이 없습니다. 기초코드를 확인해 주세요.</td>
          </tr>
        </tbody>
        <!-- 총합계 -->
        <tfoot v-if="processedBudgets.length > 0">
          <tr class="bg-slate-900 text-white font-bold">
            <td colspan="2" class="px-6 py-4 text-center text-sm uppercase">수입 총계</td>
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

// 1. 데이터 페칭
const { data: response, refresh, pending } = await useFetch('/api/budget', {
  query: computed(() => ({
    year: props.selectedYear,
    type: 'INCOME'
  }))
})

// 로컬 편집용 데이터 상태
const budgetData = ref<any[]>([])

// 데이터 로드 시 로컬 상태 초기화
watch(response, (newVal) => {
  if (newVal?.data) {
    budgetData.value = JSON.parse(JSON.stringify(newVal.data))
  }
}, { immediate: true })

// 2. 계층형 합계 계산 로직이 포함된 가공 데이터
const processedBudgets = computed(() => {
  const list = [...budgetData.value]
  
  // 하위(Level 2) -> 상위(Level 1) -> 최상위(Level 0) 순으로 합산
  // (이미 code 순으로 정렬되어 있음을 가정)
  
  // Level 1 합산
  list.forEach(parent => {
    if (parent.level === 1) {
      parent.thisYearBudget = list
        .filter(child => child.parent_code === parent.code)
        .reduce((sum, child) => sum + (parseInt(child.thisYearBudget) || 0), 0)
      
      parent.lastYearBudget = list
        .filter(child => child.parent_code === parent.code)
        .reduce((sum, child) => sum + (parseInt(child.lastYearBudget) || 0), 0)
    }
  })

  // Level 0 합산
  list.forEach(root => {
    if (parent.level === 0) {
      root.thisYearBudget = list
        .filter(child => child.parent_code === root.code)
        .reduce((sum, child) => sum + (parseInt(child.thisYearBudget) || 0), 0)
      
      root.lastYearBudget = list
        .filter(child => child.parent_code === root.code)
        .reduce((sum, child) => sum + (parseInt(child.lastYearBudget) || 0), 0)
    }
  })

  // 단, 위 방식은 복잡하므로 더 단순하게: 모든 하위 항목(level 2)의 합계를 상위로 전파
  const finalMap = new Map()
  list.forEach(item => finalMap.set(item.code, { ...item }))

  // 역순(레벨 큰 순)으로 합산 전파
  [2, 1].forEach(lvl => {
    list.filter(item => item.level === lvl).forEach(item => {
      if (item.parent_code) {
        const parent = finalMap.get(item.parent_code)
        if (parent) {
          // 초기화 (첫 자식 처리 시)
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
  if (change > 0) return 'text-blue-600'
  if (change < 0) return 'text-red-600'
  return 'text-gray-400'
}

// 3. 저장 로직
const saveBudgets = async () => {
  const confirmed = await ui.showConfirm('예산 저장', `${props.selectedYear}년도 수입 예산을 저장하시겠습니까?`, 'info')
  if (!confirmed) return

  isSaving.value = true
  try {
    // 레벨 2(입력 항목) 데이터만 추출하여 저장
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
      ui.showAlert('성공', '예산이 저장되었습니다.', 'success')
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
  
  downloadAsExcel(excelData, `${props.selectedYear}_수입예산안`)
}
</script>
