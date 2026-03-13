<template>
  <ClientOnly>
    <div class="space-y-6 p-8 relative min-h-full">
      
      <!-- 헤더 및 안내 영역 -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div class="space-y-1">
          <h2 class="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-heroicons-cloud-arrow-up" class="text-brand-blue" />
            헌금 전표 대량 업로드
          </h2>
          <p class="text-sm text-gray-500">엑셀 파일을 활용하여 다수의 헌금 내역을 한 번에 등록할 수 있습니다.</p>
        </div>
        
        <div class="flex gap-2">
          <UButton 
            icon="i-heroicons-document-arrow-down" 
            color="neutral" 
            variant="ghost" 
            label="업로드 양식 다운로드" 
            class="font-bold cursor-pointer"
            @click="downloadTemplate"
          />
          <input type="file" ref="fileInput" class="hidden" accept=".xlsx, .xls" @change="handleFileUpload" />
          <UButton 
            icon="i-heroicons-folder-open" 
            color="primary" 
            label="엑셀 파일 선택" 
            class="font-black px-6 shadow-md cursor-pointer"
            @click="fileInput?.click()"
          />
        </div>
      </div>

      <!-- 데이터 프리뷰 영역 -->
      <div v-if="parsedData.length > 0" class="space-y-4 animate-in fade-in slide-in-from-top-2">
        <div class="flex justify-between items-end">
          <div class="flex gap-4">
            <div class="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-800">
              <span class="text-xs text-blue-600 dark:text-blue-400 font-bold block mb-1">총 건수</span>
              <span class="text-lg font-black font-mono">{{ formatNumber(parsedData.length) }}건</span>
            </div>
            <div class="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg border border-green-100 dark:border-green-800">
              <span class="text-xs text-green-600 dark:text-green-400 font-bold block mb-1">총 금액</span>
              <span class="text-lg font-black font-mono text-brand-green">{{ formatNumber(totalAmount) }}원</span>
            </div>
          </div>
          
          <UButton 
            color="success" 
            size="lg" 
            label="검증 완료 - 일괄 등록 실행" 
            icon="i-heroicons-check-badge"
            class="font-black px-10 shadow-xl hover:scale-105 transition-transform cursor-pointer"
            :loading="isSaving"
            @click="submitBulk"
          />
        </div>

        <div class="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">No</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">일자</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">이름 (성도매칭)</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">헌금종류</th>
                <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">금액</th>
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">적요</th>
                <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">상태</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr v-for="(row, idx) in parsedData" :key="idx" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{{ idx + 1 }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono" :class="row.dateError ? 'text-red-500 font-bold' : ''">
                  {{ row.transaction_date }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex flex-col">
                    <span class="font-bold">{{ row.excel_name }}</span>
                    <span v-if="row.member_id" class="text-[10px] text-brand-green flex items-center gap-0.5">
                      <UIcon name="i-heroicons-check-circle" class="w-3 h-3" /> 매칭됨: {{ row.member_name }}
                    </span>
                    <span v-else class="text-[10px] text-gray-400 flex items-center gap-0.5">
                      <UIcon name="i-heroicons-question-mark-circle" class="w-3 h-3" /> 미매칭 (무명 처리)
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex flex-col">
                    <span :class="!row.account_code ? 'text-red-500 font-bold' : ''">{{ row.excel_type }}</span>
                    <span v-if="row.account_code" class="text-[10px] text-blue-500">{{ row.account_name }} ({{ row.account_code }})</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-bold font-mono">
                  {{ formatNumber(row.amount) }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{{ displayValue(row.description) }}</td>
                <td class="px-6 py-4 text-center">
                  <UIcon 
                    :name="row.isValid ? 'i-heroicons-check-circle' : 'i-heroicons-exclamation-triangle'" 
                    :class="row.isValid ? 'text-green-500' : 'text-red-500'" 
                    class="w-5 h-5"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 초기 빈 화면 -->
      <div v-else class="bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-32 flex flex-col items-center justify-center space-y-4">
        <UIcon name="i-heroicons-document-text" class="w-16 h-16 text-gray-300" />
        <div class="text-center">
          <p class="text-lg font-bold text-gray-900 dark:text-white">파일이 업로드되지 않았습니다.</p>
          <p class="text-sm text-gray-500">양식을 내려받아 작성한 후, 파일을 선택해 주세요.</p>
        </div>
        <UButton variant="outline" color="neutral" label="양식 다시 보기" class="cursor-pointer" @click="downloadTemplate" />
      </div>

    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { formatNumber, displayValue, formatDate } from '~/utils/formatter'
import { useUIStore } from '~/stores/ui'
import * as XLSX from 'xlsx'

const ui = useUIStore()
const fileInput = ref<HTMLInputElement | null>(null)
const isSaving = ref(false)
const parsedData = ref<any[]>([])

// 1. 기초 데이터 로드 (성도 및 계정과목 대조용)
const { data: accountsRes } = await useFetch('/api/accounts')
const { data: membersRes } = await useFetch('/api/members', { query: { limit: 10000, tab: 'CURRENT' } })

const accounts = computed(() => (accountsRes.value as any)?.data || [])
const members = computed(() => (membersRes.value as any)?.data || [])

const totalAmount = computed(() => parsedData.value.reduce((sum, row) => sum + (Number(row.amount) || 0), 0))

// 2. 엑셀 업로드 및 파싱 로직
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array', cellDates: true })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet)

      if (jsonData.length === 0) {
        ui.showAlert('오류', '엑셀 파일에 데이터가 없습니다.', 'error')
        return
      }

      // 데이터 가공 및 매핑
      parsedData.value = jsonData.map(row => {
        const excelName = String(row['성함'] || row['이름'] || '').trim()
        const excelType = String(row['헌금종류'] || '').trim()
        const excelDate = row['일자'] || row['날짜']
        const excelAmount = row['금액']
        
        // 성도 매핑 (이름 기준)
        const matchedMember = members.value.find((m: any) => m.name === excelName)
        
        // 계정과목 매핑 (이름 기준, 수입 타입만)
        const matchedAccount = accounts.value.find((a: any) => a.name === excelType && a.type === 'INCOME')

        // 날짜 처리
        let formattedDate = ''
        let dateError = false
        try {
          if (excelDate instanceof Date) {
            formattedDate = excelDate.toISOString().split('T')[0]
          } else if (typeof excelDate === 'string') {
            formattedDate = new Date(excelDate).toISOString().split('T')[0]
          } else {
            formattedDate = new Date().toISOString().split('T')[0]
          }
        } catch {
          formattedDate = '날짜오류'
          dateError = true
        }

        return {
          transaction_date: formattedDate,
          excel_name: excelName,
          excel_type: excelType,
          member_id: matchedMember?.id || null,
          member_name: matchedMember?.name || '',
          account_code: matchedAccount?.code || null,
          account_name: matchedAccount?.name || '',
          amount: Number(excelAmount) || 0,
          description: row['적요'] || '',
          dateError,
          isValid: !dateError && !!matchedAccount && Number(excelAmount) > 0
        }
      })

      ui.showAlert('성공', `${parsedData.value.length}건의 데이터를 읽었습니다. 검증 결과를 확인해 주세요.`, 'success')
    } catch (err: any) {
      console.error(err)
      ui.showAlert('오류', '엑셀 파일 처리 중 오류가 발생했습니다. 양식을 확인해 주세요.', 'error')
    } finally {
      target.value = ''
    }
  }
  reader.readAsArrayBuffer(file)
}

// 3. 양식 다운로드
const downloadTemplate = () => {
  const header = [['일자', '성함', '헌금종류', '금액', '적요']]
  const sample = [['2026-03-15', '홍길동', '십일조', '100000', '3월 3주차']]
  const worksheet = XLSX.utils.aoa_to_sheet([...header, ...sample])
  
  // 모든 셀 텍스트 포맷 강제 (날짜 변형 방지)
  const range = XLSX.utils.decode_range(worksheet['!ref']!)
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: R, c: C })]
      if (cell) cell.z = '@'
    }
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '헌금전표양식')
  XLSX.writeFile(workbook, '헌금전표_업로드양식.xlsx')
}

// 4. 서버 전송 (Bulk Submit)
const submitBulk = async () => {
  const invalidRows = parsedData.value.filter(r => !rowIsValid(r))
  if (invalidRows.length > 0) {
    ui.showAlert('검증 실패', `유효하지 않은 데이터가 ${invalidRows.length}건 포함되어 있습니다. 수정 후 다시 시도해 주세요.`, 'error')
    return
  }

  const confirmed = await ui.showConfirm('일괄 등록', `총 ${parsedData.value.length}건, ${formatNumber(totalAmount.value)}원을 정식 전표로 등록하시겠습니까?`, 'info')
  if (!confirmed) return

  isSaving.value = true
  try {
    const res: any = await $fetch('/api/transactions/bulk', {
      method: 'POST',
      body: { transactions: parsedData.value }
    })

    if (res.success) {
      ui.showAlert('등록 완료', `${res.count}건의 헌금 전표가 성공적으로 등록되었습니다.`, 'success')
      parsedData.value = [] // 데이터 초기화
    }
  } catch (error: any) {
    ui.showAlert('서버 오류', error.data?.statusMessage || '등록 처리 중 오류가 발생했습니다.', 'error')
  } finally {
    isSaving.value = false
  }
}

const rowIsValid = (row: any) => {
  return row.isValid && row.account_code
}
</script>
