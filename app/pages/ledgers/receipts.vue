<template>
  <div class="space-y-6">
    <!-- 검색 필터 영역 -->
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">헌금자 검색</label>
          <div class="flex flex-col space-y-2">
            <div class="flex items-center space-x-4">
               <label class="flex items-center space-x-1 cursor-pointer"><input type="radio" name="searchType" checked class="text-blue-600" /> <span class="text-sm">성도</span></label>
               <label class="flex items-center space-x-1 cursor-pointer"><input type="radio" name="searchType" class="text-blue-600" /> <span class="text-sm">거래처</span></label>
               <label class="flex items-center space-x-1 cursor-pointer"><input type="radio" name="searchType" class="text-blue-600" /> <span class="text-sm">구역</span></label>
            </div>
            <div class="flex items-center space-x-2">
              <UInput placeholder="이름 입력" class="flex-1" />
              <UButton color="primary" label="조회" class="cursor-pointer" />
            </div>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">헌금기간 (귀속연도)</label>
          <div class="flex items-center space-x-2">
            <UInput type="date" class="flex-1" />
            <span class="text-gray-500">~</span>
            <UInput type="date" class="flex-1" />
          </div>
        </div>
      </div>
    </div>

    <!-- 목록 영역 -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-gray-900">
        <h3 class="text-sm font-bold text-gray-800 dark:text-gray-200">기부금 영수증 발급내역</h3>
        <div class="flex flex-wrap items-center gap-2">
          <UButton color="primary" @click="isModalOpen = true" label="기부금영수증 신청" class="font-bold cursor-pointer shadow-sm" />
          <UButton icon="i-heroicons-envelope" color="neutral" variant="outline" label="이메일" class="cursor-pointer bg-white" />
          <!-- PDF: Red -->
          <UButton icon="i-heroicons-document-arrow-down" color="error" variant="outline" label="PDF" class="cursor-pointer bg-white" />
          <!-- Excel: Green -->
          <UButton icon="i-heroicons-table-cells" color="success" variant="outline" label="엑셀" class="cursor-pointer bg-white" />
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead class="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th class="w-8 px-4 py-3"><input type="checkbox" class="rounded border-gray-300 text-blue-600" /></th>
              <th class="px-4 py-3 text-left font-bold text-gray-600 dark:text-gray-300">날짜</th>
              <th class="px-4 py-3 text-left font-bold text-gray-600 dark:text-gray-300">계정</th>
              <th class="px-4 py-3 text-right font-bold text-gray-600 dark:text-gray-300">금액</th>
              <th class="px-4 py-3 text-left font-bold text-gray-600 dark:text-gray-300">헌금자</th>
              <th class="px-4 py-3 text-center font-bold text-gray-600 dark:text-gray-300">발행</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
            <tr v-for="(item, idx) in receipts" :key="idx" class="hover:bg-blue-50/30 transition-colors">
              <td class="px-4 py-3"><input type="checkbox" class="rounded border-gray-300" /></td>
              <td class="px-4 py-3">{{ item.date }}</td>
              <td class="px-4 py-3 font-medium">{{ item.account }}</td>
              <td class="px-4 py-3 text-right font-bold text-blue-600">{{ item.amount }}</td>
              <td class="px-4 py-3 font-bold">{{ item.donor }}</td>
              <td class="px-4 py-3 text-center">
                <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-bold">{{ item.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 기부금영수증 신청 모달 (완전한 반응형 구조) -->
    <UModal :open="isModalOpen" @update:open="val => isModalOpen = val" :ui="{ content: 'max-w-4xl' }">
      <template #content>
        <div class="flex flex-col bg-white dark:bg-gray-900 shadow-2xl rounded-lg overflow-hidden h-auto max-h-[95vh]">
          <!-- Header -->
          <div class="px-6 py-4 border-b dark:border-gray-800 flex items-center justify-between shrink-0 bg-gray-50 dark:bg-gray-900/50">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">기부금영수증 신청하기</h3>
            <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="isModalOpen = false" class="cursor-pointer" />
          </div>

          <!-- Scrollable Body -->
          <div class="p-6 overflow-y-auto space-y-8 flex-1">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormField label="표기명" required>
                <UInput placeholder="성함 입력" size="lg" class="w-full" />
              </UFormField>
              <UFormField label="생년월일">
                <div class="flex items-center space-x-2">
                  <UInput placeholder="YYMMDD" size="lg" class="flex-1" />
                  <UButton color="neutral" variant="subtle" label="자동입력" class="cursor-pointer whitespace-nowrap" />
                </div>
              </UFormField>

              <UFormField label="신청 종류" class="md:col-span-2">
                <div class="flex space-x-6 pt-1">
                  <label class="flex items-center space-x-3 cursor-pointer"><input type="radio" name="rType" checked class="w-5 h-5 text-blue-600" /> <span class="text-base">개인</span></label>
                  <label class="flex items-center space-x-3 cursor-pointer"><input type="radio" name="rType" class="w-5 h-5 text-blue-600" /> <span class="text-base">사업자</span></label>
                  <label class="flex items-center space-x-3 cursor-pointer"><input type="radio" name="rType" class="w-5 h-5 text-blue-600" /> <span class="text-base">익명</span></label>
                </div>
              </UFormField>

              <UFormField label="주민번호 / 사업자번호" required class="md:col-span-2">
                <div class="flex flex-col space-y-3">
                  <div class="flex items-center space-x-3">
                    <UInput maxlength="6" size="lg" class="w-full sm:w-1/3" placeholder="6자리" />
                    <span class="text-gray-400 font-bold">-</span>
                    <UInput type="password" maxlength="7" size="lg" class="w-full sm:w-1/2" placeholder="7자리" />
                  </div>
                  <div class="flex space-x-6">
                     <label class="flex items-center space-x-2 cursor-pointer"><input type="radio" name="masking" checked class="w-4 h-4 text-blue-600" /> <span class="text-sm text-gray-500">뒷자리 마스킹 (*표기)</span></label>
                     <label class="flex items-center space-x-2 cursor-pointer"><input type="radio" name="masking" class="w-4 h-4 text-blue-600" /> <span class="text-sm text-gray-500">전체 번호 표기</span></label>
                  </div>
                </div>
              </UFormField>

              <!-- 주소 영역 -->
              <div class="md:col-span-2 space-y-4 border-t dark:border-gray-800 pt-6">
                <div class="flex flex-col sm:flex-row sm:items-end gap-3">
                  <UFormField label="우편번호" class="w-full sm:w-1/3">
                    <UInput v-model="selectedZipNo" readonly size="lg" class="bg-gray-50 dark:bg-gray-800" />
                  </UFormField>
                  <UButton color="primary" icon="i-heroicons-magnifying-glass" @click="isAddressModalOpen = true" label="우편번호 찾기" size="lg" class="cursor-pointer" />
                </div>
                <UFormField label="도로명 주소">
                  <div class="space-y-3">
                    <UInput v-model="selectedRoadAddr" readonly size="lg" class="bg-gray-50 dark:bg-gray-800 w-full" />
                    <UInput v-model="detailAddr" placeholder="상세주소를 입력해 주세요." size="lg" class="w-full" />
                  </div>
                </UFormField>
              </div>

              <UFormField label="금액 수정">
                <UInput placeholder="0" size="lg" class="text-right w-full font-mono text-blue-600 font-bold" />
              </UFormField>
              <UFormField label="비고 / 메모">
                <UInput placeholder="특이사항 입력" size="lg" class="w-full" />
              </UFormField>
            </div>
          </div>

          <!-- Footer (고정) -->
          <div class="px-6 py-4 border-t dark:border-gray-800 flex justify-end space-x-3 shrink-0 bg-gray-50 dark:bg-gray-900/50">
            <UButton color="neutral" variant="ghost" size="lg" @click="isModalOpen = false" label="취소" class="cursor-pointer" />
            <UButton color="primary" size="lg" @click="isModalOpen = false" label="신청 완료하기" class="font-bold cursor-pointer px-6 shadow-md" />
          </div>
        </div>
      </template>
    </UModal>

    <!-- 우편번호 검색 팝업 -->
    <AddressSearchModal v-model:open="isAddressModalOpen" @select="handleAddressSelect" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isModalOpen = ref(false)
const isAddressModalOpen = ref(false)
const selectedZipNo = ref('')
const selectedRoadAddr = ref('')
const detailAddr = ref('')

const handleAddressSelect = (addressData: any) => {
  selectedZipNo.value = addressData.zipNo
  selectedRoadAddr.value = addressData.roadAddr
}

const receipts = ref([
  { date: '2026-02-15', account: '주일헌금', amount: '100,000', donor: '김철수', status: '발급완료' },
  { date: '2026-02-25', account: '십일조', amount: '500,000', donor: '김철수', status: '대기' },
])
</script>
