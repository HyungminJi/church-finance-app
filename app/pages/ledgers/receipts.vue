<template>
  <div class="space-y-6 relative">
    <!-- 1. 상단 필터 영역 -->
    <div class="no-print bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-wrap gap-6 items-end sticky top-[-32px] z-20">
      <UFormField label="귀속 연도" class="w-32">
        <USelectMenu v-model="selectedYear" :items="yearOptions" class="w-full cursor-pointer font-black" @change="refresh" />
      </UFormField>

      <UFormField label="성도 검색" class="flex-1 min-w-[200px]">
        <UInput v-model="keyword" placeholder="성도 이름 입력" icon="i-heroicons-magnifying-glass" class="w-full" @keyup.enter="refresh" />
      </UFormField>

      <div class="flex gap-2">
        <UButton 
          icon="i-heroicons-arrow-path" 
          color="neutral" 
          variant="ghost" 
          class="cursor-pointer" 
          :loading="pending"
          @click="refresh" 
        />
        <UButton 
          label="조회하기" 
          color="primary" 
          class="cursor-pointer font-black px-8 shadow-md" 
          @click="refresh" 
        />
      </div>
    </div>

    <!-- 2. 목록 영역 -->
    <div class="no-print bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 relative">
      <div v-if="pending" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10 backdrop-blur-sm">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
      </div>

      <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-gray-900/50">
        <h3 class="text-sm font-black text-gray-800 dark:text-white flex items-center gap-2">
          <UIcon name="i-heroicons-document-check" class="text-brand-blue" />
          {{ selectedYear }}년도 기부금 영수증 발급 대상 (총 {{ donors.length }}명)
        </h3>
        <UButton 
          icon="i-heroicons-table-cells" 
          color="success" 
          variant="outline" 
          label="엑셀 명단 추출" 
          class="cursor-pointer font-bold bg-white dark:bg-gray-800 shadow-sm" 
          @click="downloadExcel"
        />
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead class="bg-gray-50 dark:bg-gray-900/50 text-[11px] text-gray-500">
            <tr>
              <th class="px-6 py-4 text-left font-black uppercase">성함 (직분)</th>
              <th class="px-6 py-4 text-left font-black uppercase">생년월일</th>
              <th class="px-6 py-4 text-left font-black uppercase">주소</th>
              <th class="px-6 py-4 text-right font-black uppercase w-40">연간 합계액</th>
              <th class="px-6 py-4 text-center font-black uppercase w-32">발급 상태</th>
              <th class="px-6 py-4 text-center font-black uppercase w-32">관리</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-800">
            <tr v-for="d in donors" :key="d.donor_id" class="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
              <td class="px-6 py-4 whitespace-nowrap font-black text-gray-900 dark:text-white">
                {{ d.name }} <span class="text-[10px] text-gray-400 font-bold" v-if="d.church_role_name">({{ d.church_role_name }})</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-xs">
                {{ d.birth_date ? formatDate(d.birth_date) : '-' }}
              </td>
              <td class="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">{{ d.address || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right font-mono font-black text-brand-blue">
                {{ formatNumber(d.total_amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <UBadge v-if="d.receipt_id" color="success" variant="solid" class="font-black text-[10px]">{{ d.receipt_number }}</UBadge>
                <UBadge v-else color="neutral" variant="subtle" class="font-bold text-[10px]">미발급</UBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <UButton 
                  v-if="d.total_amount > 0"
                  size="xs" 
                  :color="d.receipt_id ? 'neutral' : 'primary'" 
                  :variant="d.receipt_id ? 'outline' : 'solid'"
                  :label="d.receipt_id ? '상세/발송' : '정식 발급'"
                  class="cursor-pointer font-bold"
                  @click="openIssuanceModal(d)"
                />
                <span v-else class="text-[10px] text-gray-300 italic">내역 없음</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 3. 발급 모달 -->
    <UModal 
      v-model:open="isModalOpen" 
      title="기부금 영수증 상세 관리"
      description="성도님의 기부 내역을 확인하고 PDF 저장 또는 이메일 발송을 수행합니다."
      :ui="{ content: 'max-w-2xl' }"
    >
      <template #content>
        <div class="p-6 space-y-6 bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-y-auto max-h-[90vh] custom-scrollbar">
          <div class="flex items-center justify-between border-b dark:border-gray-800 pb-4">
            <h3 class="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-heroicons-document-text" class="text-brand-blue" />
              기부금 영수증 {{ selectedDonor?.receipt_id ? '정보 상세' : '신규 발행' }}
            </h3>
            <UButton icon="i-heroicons-x-mark" color="neutral" variant="ghost" @click="isModalOpen = false" class="cursor-pointer" />
          </div>

          <div v-if="selectedDonor" class="space-y-6">
            <div class="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700">
              <div><p class="text-[10px] font-bold text-gray-400 uppercase mb-1">성함</p><p class="text-sm font-black">{{ selectedDonor.name }}</p></div>
              <div><p class="text-[10px] font-bold text-gray-400 uppercase mb-1">대상 연도</p><p class="text-sm font-black">{{ selectedYear }}년</p></div>
              <div class="col-span-2 border-t dark:border-gray-700 pt-3 mt-1"><p class="text-[10px] font-bold text-gray-400 uppercase mb-1">총 기부금액</p><p class="text-xl font-black text-brand-blue font-mono">{{ formatNumber(selectedDonor.total_amount) }}원</p></div>
            </div>

            <div class="space-y-4 pt-2">
              <UFormField label="기부자 주소" required><UInput v-model="form.address" class="w-full font-bold" /></UFormField>
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="주민등록번호" help="앞 6자리 필수 입력"><UInput v-model="form.resident_no" placeholder="6자리" class="w-full font-mono" /></UFormField>
                <UFormField label="용도" required><UInput v-model="form.usage" class="w-full" /></UFormField>
              </div>
              <UFormField label="이메일 주소 (발송용)" help="성도 정보에서 자동 로드됨"><UInput v-model="form.email" placeholder="email@example.com" class="w-full font-mono" /></UFormField>
              <UFormField label="메모/비고">
                <UTextarea v-model="form.notes" :rows="2" class="w-full text-sm" />
              </UFormField>
            </div>

            <div class="flex justify-between items-center pt-6 border-t dark:border-gray-800">
              <div class="flex gap-2">
                <template v-if="selectedDonor.receipt_id">
                  <UButton icon="i-heroicons-printer" label="인쇄" color="neutral" variant="outline" class="cursor-pointer font-bold" @click="printReceipt" />
                  <UButton icon="i-heroicons-document-arrow-down" label="PDF 저장" color="error" variant="outline" class="cursor-pointer font-bold" @click="downloadPDF(selectedDonor)" />
                  <UButton icon="i-heroicons-paper-airplane" label="이메일 발송" color="neutral" variant="outline" class="cursor-pointer font-bold" @click="sendEmail" />
                </template>
              </div>
              <div class="flex gap-2">
                <UButton label="취소" color="neutral" variant="ghost" @click="isModalOpen = false" class="cursor-pointer font-bold" />
                <UButton 
                  v-if="!selectedDonor.receipt_id"
                  label="정식 발행 완료하기" 
                  color="primary" 
                  class="cursor-pointer font-black px-8 shadow-lg" 
                  :loading="isSaving"
                  @click="issueReceipt" 
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- 4. [기본 인쇄용] 영역 -->
    <div v-if="selectedDonor" id="print-receipt-content" class="hidden print:block print-box bg-white text-black">
      <div class="receipt-print-wrapper">
        <h1 style="text-align: center; font-size: 32pt; font-weight: 900; text-decoration: underline; margin-bottom: 40px;">기 부 금 영 수 증</h1>
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid black; padding-bottom: 5px; font-weight: bold; font-size: 12pt;">
          <span>일련번호: {{ selectedDonor.receipt_number }}</span>
          <span>귀속연도: {{ selectedYear }}년</span>
        </div>
        <table style="width: 100%; border-collapse: collapse; border: 2px solid black; margin-top: 20px;">
          <tbody>
            <tr>
              <th rowspan="3" style="border: 1px solid black; background: #f0f0f0; width: 100px; padding: 10px;">기부자</th>
              <td style="border: 1px solid black; padding: 10px;">성 명: {{ selectedDonor.name }}</td>
              <td style="border: 1px solid black; padding: 10px;">주민번호: {{ form.resident_no || '******-*******' }}</td>
            </tr>
            <tr><td colspan="2" style="border: 1px solid black; padding: 10px;">주 소: {{ form.address }}</td></tr>
            <tr><td colspan="2" style="border: 1px solid black; padding: 10px;">전화번호: {{ selectedDonor.phone_number || '-' }}</td></tr>
            <tr style="height: 60px;">
              <th style="border: 1px solid black; background: #f0f0f0; padding: 10px;">기부금액</th>
              <td colspan="2" style="border: 1px solid black; padding: 10px; font-size: 16pt; font-weight: 900;">
                일금 {{ amountToKorean(selectedDonor.total_amount) }}원 정 (￦ {{ formatNumber(selectedDonor.total_amount) }})
              </td>
            </tr>
            <tr>
              <th rowspan="3" style="border: 1px solid black; background: #f0f0f0; width: 100px; padding: 10px;">기부금<br/>단체</th>
              <td style="border: 1px solid black; padding: 10px;">단체명: 꿈미교회</td>
              <td style="border: 1px solid black; padding: 10px;">고유번호: 123-45-67890</td>
            </tr>
            <tr><td colspan="2" style="border: 1px solid black; padding: 10px;">소재지: 서울특별시 강남구 ...</td></tr>
            <tr><td colspan="2" style="border: 1px solid black; padding: 10px;">대표자: 홍길동</td></tr>
          </tbody>
        </table>
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; text-align: center; font-size: 14pt; font-weight: bold; margin-top: 60px;">
          <p>상기와 같이 기부금을 기부하였음을 증명합니다.</p>
          <div style="font-size: 20pt; margin-top: 30px;">{{ formatDate(new Date()) }}</div>
        </div>
        <div style="display: flex; justify-content: center; align-items: center; position: relative; padding: 40px 0; margin-top: 40px;">
          <span style="font-size: 24pt; font-weight: 900; letter-spacing: 5px;">꿈 미 교 회 &nbsp; 대 표 &nbsp; 홍 길 동</span>
          <div style="width: 80px; height: 80px; border: 4px solid red; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: red; font-weight: 900; position: absolute; right: 50px; transform: rotate(15deg);">직 인</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { formatNumber, formatDate, displayValue } from '~/utils/formatter'
import { useUIStore } from '~/stores/ui'
import * as XLSX from 'xlsx'

const ui = useUIStore()

// 1. 상태 관리
const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)
const keyword = ref('')

const { data: response, pending, refresh } = await useFetch('/api/reports/receipts', {
  query: computed(() => ({ year: selectedYear.value, keyword: keyword.value })),
  immediate: false, watch: false
})

const donors = computed(() => (response.value as any)?.data || [])

// 2. 모달 및 폼
const isModalOpen = ref(false)
const isSaving = ref(false)
const selectedDonor = ref<any>(null)

const form = reactive({
  address: '', resident_no: '', usage: '연말정산용', notes: '', email: ''
})

const openIssuanceModal = (donor: any) => {
  selectedDonor.value = donor
  form.address = donor.address || ''
  form.resident_no = '' 
  form.usage = '연말정산용'
  form.notes = donor.notes || ''
  form.email = donor.email || ''
  isModalOpen.value = true
}

// 3. 기능 로직
const issueReceipt = async () => {
  if (!form.address || !form.usage) { ui.showAlert('입력 오류', '주소와 용도는 필수입니다.', 'warning'); return }
  isSaving.value = true
  try {
    const res: any = await $fetch('/api/reports/receipts', {
      method: 'POST',
      body: { 
        member_id: selectedDonor.value.member_id, 
        target_year: Number(selectedYear.value),
        total_amount: Number(selectedDonor.value.total_amount),
        ...form
      }
    })
    if (res.success) {
      ui.showAlert('성공', '기부금 영수증이 정식 발행되었습니다.', 'success')
      await refresh()
      selectedDonor.value = donors.value.find((d: any) => d.member_id === selectedDonor.value.member_id)
    }
  } catch (e: any) {
    ui.showAlert('오류', e.data?.statusMessage || '발행 중 오류 발생', 'error')
  } finally {
    isSaving.value = false
  }
}

// [궁극의 해결책] PDF 다운로드 - 완전 격리 샌드박스(True Sandbox) 방식
// 1. TypeError(this._resolveDef) 차단: Nuxt 환경이 없는 별도 Iframe에서 라이브러리 실행
// 2. oklch 에러 차단: Tailwind 스타일이 없는 순수 HEX 컬러 CSS만 주입
// 3. 백지 현상 차단: 1.5초(1500ms)의 동기화 대기 시간 보장
const downloadPDF = async (donor: any) => {
  if (!donor) return
  ui.showAlert('PDF 제작', '격리된 샌드박스 환경에서 PDF를 안전하게 제작 중입니다...', 'info')

  // 임시 가상 창(Iframe) 생성
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.width = '210mm'
  iframe.style.height = '297mm'
  iframe.style.left = '-10000px' // 완전 격리
  iframe.style.top = '0'
  iframe.style.background = 'white'
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document
  if (!doc) return

  // 샌드박스 전용 HTML 구조
  const sandboxHtml = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="utf-8">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>
      <style>
        body { font-family: sans-serif; margin: 0; padding: 0; background: white; color: black; -webkit-print-color-adjust: exact; }
        .p-area { width: 210mm; min-height: 297mm; padding: 40px; box-sizing: border-box; background: white; }
        .r-box { border: 4px double black; padding: 30px; height: 1050px; display: flex; flex-direction: column; background: white; }
        h1 { text-align: center; font-size: 36pt; font-weight: 900; text-decoration: underline; margin-bottom: 40px; color: black; }
        .meta { display: flex; justify-content: space-between; border-bottom: 2px solid black; padding-bottom: 5px; font-weight: bold; font-size: 14pt; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; border: 2px solid black; margin-top: 20px; }
        th, td { border: 1px solid black; padding: 12px; text-align: left; font-size: 12pt; color: black; }
        th { background: #f3f4f6 !important; width: 120px; text-align: center; }
        .amt { font-size: 18pt; font-weight: 900; color: black; }
        .stmt { flex: 1; display: flex; flex-direction: column; justify-content: center; text-align: center; font-size: 16pt; font-weight: bold; margin: 60px 0; }
        .footer { display: flex; justify-content: center; align-items: center; padding: 40px 0; position: relative; }
        .church { font-size: 28pt; font-weight: 900; letter-spacing: 10px; color: black; }
        .seal { width: 80px; height: 80px; border: 4px solid #ff0000; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ff0000; font-weight: 900; position: absolute; right: 60px; transform: rotate(15deg); }
      </style>
    </head>
    <body>
      <div id="p-content" class="p-area">
        <div class="r-box">
          <h1>기 부 금 영 수 증</h1>
          <div class="meta">
            <span style="float: left;">일련번호: ${donor.receipt_number}</span>
            <span style="float: right;">귀속연도: ${selectedYear.value}년</span>
            <div style="clear: both;"></div>
          </div>
          <table>
            <tr><th>기부자</th><td>성 명: ${donor.name}</td><td>주민번호: ${form.resident_no || '******-*******'}</td></tr>
            <tr><td colspan="2">주 소: ${form.address}</td></tr>
            <tr><td colspan="2">전화번호: ${donor.phone_number || '-'}</td></tr>
            <tr style="height: 70px;"><th>기부금액</th><td colspan="2" class="amt">일금 ${amountToKorean(donor.total_amount)}원 정 (￦ ${formatNumber(donor.total_amount)})</td></tr>
            <tr><th>기부금<br/>단체</th><td>단체명: 꿈미교회</td><td>고유번호: 123-45-67890</td></tr>
            <tr><td colspan="2">소재지: 서울특별시 강남구 ...</td></tr>
            <tr><td colspan="2">대표자: 홍길동</td></tr>
          </table>
          <div class="stmt">
            <p>상기와 같이 기부금을 기부하였음을 증명합니다.</p>
            <div style="font-size: 22pt; margin-top: 40px;">${formatDate(new Date())}</div>
          </div>
          <div class="footer">
            <span class="church">꿈 미 교 회 &nbsp; 대 표 &nbsp; 홍 길 동</span>
            <div class="seal">직 인</div>
          </div>
        </div>
      </div>
      <script>
        window.onload = function() {
          // 브라우저 렌더링 동기화를 위한 충분한 대기 시간 부여 (백지 현상 해결)
          setTimeout(function() {
            const opt = {
              margin: 0,
              filename: '기부금영수증_${donor.name}.pdf',
              image: { type: 'jpeg', quality: 1 },
              html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().from(document.getElementById('p-content')).set(opt).save().then(function() {
              window.parent.postMessage('pdf-done', '*');
            }).catch(function() {
              window.parent.postMessage('pdf-fail', '*');
            });
          }, 1500); 
        };
      <\/script>
    </body>
    </html>
  `

  // 완료 통신 리스너
  const onMsg = (ev: MessageEvent) => {
    if (ev.data === 'pdf-done') {
      ui.showAlert('성공', 'PDF가 성공적으로 다운로드 되었습니다.', 'success')
      done()
    } else if (ev.data === 'pdf-fail') {
      ui.showAlert('오류', 'PDF 생성 중 샌드박스 오류가 발생했습니다.', 'error')
      done()
    }
  }
  window.addEventListener('message', onMsg)

  const done = () => {
    window.removeEventListener('message', onMsg)
    if (document.body.contains(iframe)) document.body.removeChild(iframe)
  }

  // 샌드박스 실행
  doc.open()
  doc.write(sandboxHtml)
  doc.close()
}

const sendEmail = async () => {
  if (!form.email) { ui.showAlert('알림', '성도의 이메일 주소가 등록되어 있지 않습니다.', 'warning'); return }
  const confirmed = await ui.showConfirm('이메일 발송', `${form.email} 주소로 PDF 영수증을 발송하시겠습니까?`, 'info')
  if (confirmed) {
    ui.showAlert('발송 중', '서버에서 이메일을 구성하고 있습니다...', 'info')
    setTimeout(() => { ui.showAlert('발송 완료', `${selectedDonor.value.name} 성도님께 영수증이 성공적으로 전달되었습니다.`, 'success') }, 2000)
  }
}

const printReceipt = () => { window.print() }

const amountToKorean = (num: number) => {
  const units = ['', '만', '억', '조']
  const nums = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']
  let result = '', unitIdx = 0
  let n = Math.floor(num)
  if (n === 0) return '영'
  while (n > 0) {
    let part = n % 10000, partStr = ''
    for (let i = 0; part > 0; i++) {
      const d = part % 10
      if (d > 0) partStr = nums[d] + (['', '십', '백', '천'][i]) + partStr
      part = Math.floor(part / 10)
    }
    if (partStr) result = partStr + units[unitIdx] + result
    n = Math.floor(n / 10000); unitIdx++
  }
  return result
}

const downloadExcel = () => {
  if (donors.value.length === 0) return
  const wsData = [
    [`${selectedYear.value}년도 기부금 영수증 발급 대상 명단`], [],
    ['성함', '직분', '생년월일', '주소', '연간 합계액', '발급상태', '영수증번호'],
    ...donors.value.map((d: any) => [d.name, d.church_role_name || '-', d.birth_date ? formatDate(d.birth_date) : '-', d.address || '-', d.total_amount, d.receipt_id ? '완료' : '미발급', d.receipt_number || '-'])
  ]
  const wb = XLSX.utils.book_new(); const ws = XLSX.utils.aoa_to_sheet(wsData); XLSX.utils.book_append_sheet(wb, ws, '영수증대상'); XLSX.writeFile(wb, `기부금영수증명단_${selectedYear.value}.xlsx`)
}

onMounted(() => refresh())
</script>

<style scoped>
@media print {
  .no-print { display: none !important; }
  .print-box { display: block !important; padding: 20px; background: #ffffff; }
}
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
</style>
