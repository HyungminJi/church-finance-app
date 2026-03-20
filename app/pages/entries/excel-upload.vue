<template>
  <ClientOnly>
    <div class="space-y-6 p-8 relative min-h-full">
      
      <!-- 헤더 및 안내 영역: 양식 다운로드만 유지 -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div class="space-y-1">
          <h2 class="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-heroicons-cloud-arrow-up" class="text-brand-blue" />
            헌금 전표 대량 업로드
          </h2>
          <p class="text-sm text-gray-500">엑셀 파일을 활용하여 다수의 헌금 내역을 한 번에 등록하세요.</p>
        </div>
        
        <div class="flex gap-2">
          <UButton 
            icon="i-heroicons-document-arrow-down" 
            color="neutral" 
            variant="ghost" 
            label="업로드용 표준 양식 받기" 
            class="font-bold cursor-pointer"
            @click="downloadTemplate"
          />
        </div>
      </div>

      <!-- 데이터 프리뷰 영역: 파일이 이미 로드되었을 때 -->
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
          
          <div class="flex gap-2">
            <UButton 
              color="neutral" 
              variant="outline" 
              label="파일 다시 선택" 
              icon="i-heroicons-arrow-path"
              class="font-bold cursor-pointer"
              @click="parsedData = []"
            />
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

      <!-- Drag & Drop 영역: 파일 선택만 유지 -->
      <div 
        v-else 
        class="group bg-white dark:bg-gray-800 rounded-2xl border-4 border-dashed py-32 flex flex-col items-center justify-center space-y-6 transition-all duration-300 relative overflow-hidden"
        :class="[
          isDragging 
            ? 'border-brand-blue bg-blue-50/50 dark:bg-blue-900/20 scale-[1.01]' 
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        ]"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
      >
        <!-- 배경 장식 아이콘 -->
        <UIcon 
          name="i-heroicons-document-arrow-up" 
          class="absolute -bottom-8 -right-8 w-48 h-48 text-gray-50 dark:text-gray-900 pointer-events-none group-hover:scale-110 transition-transform" 
        />

        <div class="w-20 h-20 rounded-full bg-slate-50 dark:bg-gray-900 flex items-center justify-center border border-gray-100 dark:border-gray-800 shadow-inner group-hover:scale-110 transition-transform duration-500">
          <UIcon 
            :name="isDragging ? 'i-heroicons-arrow-down-tray' : 'i-heroicons-document-text'" 
            class="w-10 h-10 transition-colors duration-300"
            :class="isDragging ? 'text-brand-blue' : 'text-gray-300'"
          />
        </div>

        <div class="text-center space-y-2 relative z-10">
          <p class="text-xl font-black text-gray-900 dark:text-white">
            {{ isDragging ? '여기에 파일을 놓아주세요' : '엑셀 파일을 여기에 끌어다 놓으세요' }}
          </p>
          <p class="text-sm text-gray-500">또는 아래 버튼을 눌러 파일을 직접 선택하세요.</p>
        </div>

        <div class="relative z-10">
          <input type="file" ref="fileInput" class="hidden" accept=".xlsx, .xls" @change="handleFileSelection" />
          <UButton 
            color="primary" 
            label="컴퓨터에서 파일 선택" 
            icon="i-heroicons-folder-open" 
            class="font-black px-10 py-3 shadow-lg cursor-pointer"
            @click="fileInput?.click()"
          />
        </div>
      </div>

    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { formatNumber, displayValue } from '~/utils/formatter'
import { useUIStore } from '~/stores/ui'
import * as XLSX from 'xlsx'

const ui = useUIStore()
const fileInput = ref<HTMLInputElement | null>(null)
const isSaving = ref(false)
const isDragging = ref(false)
const parsedData = ref<any[]>([])

// 1. 기초 데이터 로드
const { data: accountsRes } = await useFetch('/api/accounts')
const { data: membersRes } = await useFetch('/api/members', { query: { limit: 10000, tab: 'CURRENT' } })

const accounts = computed(() => (accountsRes.value as any)?.data || [])
const members = computed(() => (membersRes.value as any)?.data || [])

const totalAmount = computed(() => parsedData.value.reduce((sum, row) => sum + (Number(row.amount) || 0), 0))

// 2. 파일 처리 통합 로직
const handleFileSelection = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) processFile(file)
  target.value = ''
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      ui.showAlert('형식 오류', '엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.', 'warning')
      return
    }
    processFile(file)
  }
}

const processFile = async (file: File) => {
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

      parsedData.value = jsonData.map(row => {
        const excelName = String(row['성함'] || row['이름'] || row['이름 (성도매칭)'] || '').trim()
        const excelType = String(row['헌금종류'] || '').trim()
        const excelDate = row['일자'] || row['날짜']
        const excelAmount = row['금액']
        
        const matchedMember = members.value.find((m: any) => m.name === excelName)
        const matchedAccount = accounts.value.find((a: any) => a.name === excelType && a.type === 'INCOME')

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
          formattedDate = '날짜오류'; dateError = true
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

      ui.showAlert('성공', `${parsedData.value.length}건의 데이터를 읽었습니다.`, 'success')
    } catch (err: any) {
      ui.showAlert('오류', '엑셀 파일 처리 중 오류가 발생했습니다.', 'error')
    }
  }
  reader.readAsArrayBuffer(file)
}

// 3. 양식 다운로드 및 제출 로직
const downloadTemplate = () => {
  const header = [['일자', '성함', '헌금종류', '금액', '적요']]
  const sample = [['2026-03-15', '홍길동', '십일조', '100000', '3월 3주차']]
  const worksheet = XLSX.utils.aoa_to_sheet([...header, ...sample])
  
  // 모든 셀 표시형식을 '텍스트(@)'로 강제 지정
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = { c: C, r: R }
      const cell_ref = XLSX.utils.encode_cell(cell_address)
      if (!worksheet[cell_ref]) continue
      worksheet[cell_ref].z = '@' // 텍스트 형식
    }
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '헌금전표양식')
  XLSX.writeFile(workbook, '헌금전표_업로드양식.xlsx')
}

const submitBulk = async () => {
  const confirmed = await ui.showConfirm('일괄 등록', `총 ${parsedData.value.length}건을 정식 전표로 등록하시겠습니까?`, 'info')
  if (!confirmed) return
  isSaving.value = true
  try {
    const res: any = await $fetch('/api/transactions/bulk', { method: 'POST', body: { transactions: parsedData.value } })
    if (res.success) {
      ui.showAlert('등록 완료', `${res.count}건이 성공적으로 등록되었습니다.`, 'success')
      parsedData.value = []
    }
  } catch (error: any) {
    ui.showAlert('오류', '등록 중 오류가 발생했습니다.', 'error')
  } finally {
    isSaving.value = false
  }
}
</script>
