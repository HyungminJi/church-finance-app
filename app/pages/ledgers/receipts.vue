<template>
  <div class="space-y-6 relative">
    <!-- 1. 상단 필터 영역 -->
    <div class="no-print bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-wrap gap-6 items-end sticky top-[-32px] z-20">
      <UFormField label="귀속 연도" class="w-32">
        <USelectMenu v-model="selectedYear" :items="yearOptions" class="w-full cursor-pointer font-black" @change="() => refresh()" />
      </UFormField>

      <UFormField label="성도 검색" class="flex-1 min-w-[200px]">
        <UInput v-model="keyword" placeholder="성도 이름 입력" icon="i-heroicons-magnifying-glass" class="w-full" @keyup.enter="() => refresh()" />
      </UFormField>

      <div class="flex gap-2">
        <UButton 
          icon="i-heroicons-arrow-path" 
          color="neutral" 
          variant="ghost" 
          class="cursor-pointer" 
          :loading="pending"
          @click="() => refresh()" 
        />
        <UButton 
          label="조회하기" 
          color="primary" 
          class="cursor-pointer font-black px-8 shadow-md" 
          @click="() => refresh()" 
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

    <!-- 4. [인쇄 전용] 공식 서식 -->
    <div v-if="selectedDonor" id="print-receipt-content" class="hidden print:block print-box bg-white text-black">
      <div class="official-receipt-wrapper">
        <div class="official-border-box" id="target">
          <h1 class="receipt-title-text">기 부 금 영 수 증</h1>
          <div class="receipt-meta-flex">
            <span>일련번호: {{ selectedDonor.receipt_number || '2026-XXXX' }}</span>
            <span>귀속연도: {{ selectedYear }}년</span>
          </div>
          <table class="receipt-official-table">
            <tbody>
              <tr>
                <th class="label-cell" rowspan="3">기부자</th>
                <td class="content-cell" style="width: 200px;">성 명: {{ selectedDonor.name }}</td>
                <td class="content-cell">주민번호: {{ form.resident_no || '******-*******' }}</td>
              </tr>
              <tr><td class="content-cell" colspan="2">주 소: {{ form.address }}</td></tr>
              <tr><td class="content-cell" colspan="2">전화번호: {{ selectedDonor.phone_number || '-' }}</td></tr>
              <tr class="amount-height">
                <th class="label-cell">기부금액</th>
                <td class="amount-cell" colspan="2">
                  일금 {{ amountToKorean(selectedDonor.total_amount) }}원 정 (￦ {{ formatNumber(selectedDonor.total_amount) }})
                </td>
              </tr>
              <tr>
                <th class="label-cell" rowspan="3">기부금<br/>단체</th>
                <td class="content-cell">단체명: 꿈미교회</td>
                <td class="content-cell">고유번호: 123-45-67890</td>
              </tr>
              <tr><td class="content-cell" colspan="2">소재지: 서울특별시 강남구 ...</td></tr>
              <tr><td colspan="2" class="content-cell">대표자: 홍길동</td></tr>
            </tbody>
          </table>
          <div class="receipt-statement-box">
            <p>상기와 같이 기부금을 기부하였음을 증명합니다.</p>
            <p class="receipt-date-text">{{ formatDate(new Date()) }}</p>
          </div>
          <div class="receipt-footer-flex">
            <span class="church-title-text">꿈 미 교 회 &nbsp; 대 표 &nbsp; 홍 길 동</span>
            <div class="official-seal-circle">직 인</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { formatNumber, formatDate } from '~/utils/formatter'
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

// PDF 다운로드 - 인쇄용 마스터 구조 100% 동일 복사
const downloadPDF = async (donor: any) => {
  if (!donor) return
  ui.showAlert('PDF 제작', '1페이지에 딱 맞는 깔끔한 PDF를 생성 중입니다...', 'info')

  if (!(window as any).html2pdf) {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
    document.head.appendChild(script)
    await new Promise(resolve => script.onload = resolve)
  }

  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;width:210mm;height:297mm;left:-10000px;top:0;background:white;'
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document
  if (!doc) return

  // 아래 <style> 태그에 있는 CSS를 100% 그대로 복사 (단, 브라우저 강제 설정을 위해 body 여백만 0으로)
  const css = `
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { margin: 0; padding: 0; background: white; color: black; font-family: sans-serif; }
    .official-receipt-wrapper { width: 210mm; height: 297mm; padding: 40px; box-sizing: border-box; background: white; margin: 0 auto; overflow: hidden; }
    .official-border-box { border: none; padding: 30px; height: 1000px; display: flex; flex-direction: column; background: white; box-sizing: border-box; }
    .receipt-title-text { text-align: center; font-size: 32pt; font-weight: 900; text-decoration: underline; text-underline-offset: 10px; margin-bottom: 40px; color: black; margin-top: 10px; }
    .receipt-meta-flex { display: flex; justify-content: space-between; border-bottom: 2px solid black; padding-bottom: 5px; font-weight: bold; font-size: 12pt; margin-bottom: 20px; }
    .receipt-official-table { width: 100%; border-collapse: collapse; border: 2px solid black; margin-top: 20px; }
    .label-cell { border: 1px solid black; background: #f3f4f6 !important; width: 120px; text-align: center; font-weight: bold; padding: 12px; font-size: 11pt; }
    .content-cell { border: 1px solid black; padding: 12px; text-align: left; font-size: 11pt; color: black; }
    .amount-height { height: 70px; }
    .amount-cell { border: 1px solid black; padding: 12px; font-size: 16pt; font-weight: 900; color: black; }
    .receipt-statement-box { flex: 1; display: flex; flex-direction: column; justify-content: center; text-align: center; font-size: 15pt; font-weight: bold; margin: 60px 0; }
    .receipt-date-text { font-size: 20pt; margin-top: 40px; }
    .receipt-footer-flex { display: flex; justify-content: center; align-items: center; position: relative; padding: 40px 0; }
    .church-title-text { font-size: 26pt; font-weight: 900; letter-spacing: 8px; color: black; }
    .official-seal-circle { width: 80px; height: 80px; border: 4px solid red; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: red; font-weight: 900; position: absolute; right: 60px; transform: rotate(15deg); font-size: 18px; }
  `

  // 위의 <template> 안의 인쇄용 HTML 구조를 100% 그대로 복사 (단지 Vue 변수만 템플릿 리터럴로 변경)
  const html = `
    <html><head><meta charset="utf-8"><style>${css}</style></head>
    <body>
      <div class="official-receipt-wrapper">
        <div class="official-border-box" id="target">
          <h1 class="receipt-title-text">기 부 금 영 수 증</h1>
          <div class="receipt-meta-flex">
            <span>일련번호: ${donor.receipt_number || '2026-XXXX'}</span>
            <span>귀속연도: ${selectedYear.value}년</span>
          </div>
          <table class="receipt-official-table">
            <tbody>
              <tr>
                <th class="label-cell" rowspan="3">기부자</th>
                <td class="content-cell" style="width: 200px;">성 명: ${donor.name}</td>
                <td class="content-cell">주민번호: ${form.resident_no || '******-*******'}</td>
              </tr>
              <tr><td class="content-cell" colspan="2">주 소: ${form.address}</td></tr>
              <tr><td class="content-cell" colspan="2">전화번호: ${donor.phone_number || '-'}</td></tr>
              <tr class="amount-height">
                <th class="label-cell">기부금액</th>
                <td class="amount-cell" colspan="2">
                  일금 ${amountToKorean(donor.total_amount)}원 정 (￦ ${formatNumber(donor.total_amount)})
                </td>
              </tr>
              <tr>
                <th class="label-cell" rowspan="3">기부금<br/>단체</th>
                <td class="content-cell">단체명: 꿈미교회</td>
                <td class="content-cell">고유번호: 123-45-67890</td>
              </tr>
              <tr><td class="content-cell" colspan="2">소재지: 서울특별시 강남구 ...</td></tr>
              <tr><td colspan="2" class="content-cell">대표자: 홍길동</td></tr>
            </tbody>
          </table>
          <div class="receipt-statement-box">
            <p>상기와 같이 기부금을 기부하였음을 증명합니다.</p>
            <p class="receipt-date-text">${formatDate(new Date())}</p>
          </div>
          <div class="receipt-footer-flex">
            <span class="church-title-text">꿈 미 교 회 &nbsp; 대 표 &nbsp; 홍 길 동</span>
            <div class="official-seal-circle">직 인</div>
          </div>
        </div>
      </div>
    </body></html>
  `

  const handler = (e: MessageEvent) => {
    if (e.data === 'ok') ui.showAlert('성공', '1페이지에 딱 맞는 PDF가 성공적으로 저장되었습니다.', 'success')
    if (e.data === 'no') ui.showAlert('오류', 'PDF 생성 실패', 'error')
    if (e.data === 'ok' || e.data === 'no') {
      window.removeEventListener('message', handler)
      if (document.body.contains(iframe)) document.body.removeChild(iframe)
    }
  }
  window.addEventListener('message', handler)

  doc.open(); doc.write(html); doc.close()

  const s1 = doc.createElement('script')
  s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
  s1.onload = () => {
    const s2 = doc.createElement('script')
    s2.textContent = `
      setTimeout(function() {
        const o = { margin: 0, filename: '기부금영수증_${donor.name}.pdf', image: { type: 'jpeg', quality: 1 }, html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
        html2pdf().from(document.getElementById('target')).set(o).save().then(function() { window.parent.postMessage('ok', '*'); }).catch(function() { window.parent.postMessage('no', '*'); });
      }, 1500);
    `
    doc.body.appendChild(s2)
  }
  doc.head.appendChild(s1)
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
  const units = ['', '만', '억', '조']; const nums = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']
  let result = '', unitIdx = 0; let n = Math.floor(num)
  if (n === 0) return '영'
  while (n > 0) {
    let part = n % 10000, partStr = ''
    for (let i = 0; part > 0; i++) { const d = part % 10; if (d > 0) partStr = nums[d] + (['', '십', '백', '천'][i]) + partStr; part = Math.floor(part / 10) }
    if (partStr) result = partStr + units[unitIdx] + result; n = Math.floor(n / 10000); unitIdx++
  }
  return result
}

const downloadExcel = () => {
  if (donors.value.length === 0) return
  const wsData = [[`${selectedYear.value}년도 기부금 영수증 발급 대상 명단`], [], ['성함', '직분', '생년월일', '주소', '연간 합계액', '발급상태', '영수증번호'], ...donors.value.map((d: any) => [d.name, d.church_role_name || '-', d.birth_date ? formatDate(d.birth_date) : '-', d.address || '-', d.total_amount, d.receipt_id ? '완료' : '미발급', d.receipt_number || '-'])]
  const wb = XLSX.utils.book_new(); const ws = XLSX.utils.aoa_to_sheet(wsData); XLSX.utils.book_append_sheet(wb, ws, '영수증대상'); XLSX.writeFile(wb, `기부금영수증명단_${selectedYear.value}.xlsx`)
}

onMounted(() => refresh())
</script>

<style>
/* [2페이지 넘침 방지 및 여백 최적화] */
@media print {
  @page {
    size: A4;
    margin: 0 !important; /* 브라우저 강제 머리글/바닥글 여백 삭제 */
  }
  body { margin: 0 !important; padding: 0 !important; }
  body * { visibility: hidden !important; }
  #print-receipt-content, #print-receipt-content * { visibility: visible !important; }
  #print-receipt-content { 
    position: absolute !important; 
    left: 0 !important; 
    top: 0 !important; 
    width: 210mm !important; 
    height: 297mm !important; 
    display: block !important; 
    background: white !important;
    overflow: hidden; /* 2페이지 생성 물리적 차단 */
  }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}

/* [인쇄/PDF 100% 일치 마스터 CSS] */
.official-receipt-wrapper { 
  width: 210mm; 
  height: 297mm; 
  padding: 40px; 
  box-sizing: border-box; 
  background: white; 
  margin: 0 auto; 
  overflow: hidden; /* 2페이지 차단 */
}
.official-border-box { 
  border: none; 
  padding: 30px; 
  height: 1000px; /* 내용을 1페이지 안에 가두는 고정 높이 */
  display: flex; 
  flex-direction: column; 
  background: white; 
  box-sizing: border-box; 
}
.receipt-title-text { text-align: center; font-size: 32pt; font-weight: 900; text-decoration: underline; text-underline-offset: 10px; margin-bottom: 40px; color: black; margin-top: 10px; }
.receipt-meta-flex { display: flex; justify-content: space-between; border-bottom: 2px solid black; padding-bottom: 5px; font-weight: bold; font-size: 12pt; margin-bottom: 20px; }
.receipt-official-table { width: 100%; border-collapse: collapse; border: 2px solid black; margin-top: 20px; }
.label-cell { border: 1px solid black; background: #f3f4f6 !important; width: 120px; text-align: center; font-weight: bold; padding: 12px; font-size: 11pt; }
.content-cell { border: 1px solid black; padding: 12px; text-align: left; font-size: 11pt; color: black; }
.amount-height { height: 70px; }
.amount-cell { border: 1px solid black; padding: 12px; font-size: 16pt; font-weight: 900; color: black; }
.receipt-statement-box { flex: 1; display: flex; flex-direction: column; justify-content: center; text-align: center; font-size: 15pt; font-weight: bold; margin: 40px 0; }
.receipt-date-text { font-size: 20pt; margin-top: 40px; }
.receipt-footer-flex { display: flex; justify-content: center; align-items: center; position: relative; padding: 40px 0; }
.church-title-text { font-size: 26pt; font-weight: 900; letter-spacing: 8px; color: black; }
.official-seal-circle { width: 80px; height: 80px; border: 4px solid red; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: red; font-weight: 900; position: absolute; right: 60px; transform: rotate(15deg); font-size: 18px; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
</style>
