<template>
  <UModal :open="isOpen" @update:open="val => isOpen = val" :ui="{ content: 'max-w-4xl' }">
    <template #content>
      <div class="flex flex-col bg-white dark:bg-gray-900 shadow-2xl rounded-lg overflow-hidden h-auto max-h-[90vh]">
        <!-- Header -->
        <div class="px-6 py-4 border-b dark:border-gray-800 flex items-center justify-between shrink-0 bg-gray-50 dark:bg-gray-900/50">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <UIcon name="i-heroicons-magnifying-glass" class="w-6 h-6 mr-2 text-blue-500" />
            우편번호 찾기
          </h3>
          <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" @click="isOpen = false" class="cursor-pointer" />
        </div>

        <!-- Body (Search & Results) -->
        <div class="p-6 flex flex-col space-y-6 flex-1 overflow-hidden">
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 shrink-0">
            <UInput 
              v-model="keyword" 
              @keyup.enter="searchAddress(1)"
              placeholder="도로명, 건물명, 지번 입력 (예: 판교역로 235)" 
              size="xl"
              class="flex-1"
            />
            <UButton 
              @click="searchAddress(1)"
              color="primary"
              size="xl"
              label="검색하기"
              :loading="isLoading"
              class="cursor-pointer font-bold px-8 shadow-md"
            />
          </div>
          
          <!-- Results Area (Scrollable) -->
          <div class="border border-gray-200 dark:border-gray-700 rounded-lg flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 min-h-[350px] shadow-inner relative">
            <div v-if="isLoading" class="absolute inset-0 flex flex-col items-center justify-center p-12 bg-white/50 dark:bg-gray-900/50 z-10">
               <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 text-blue-500 animate-spin mb-4" />
               <p class="text-gray-500 font-medium">검색 중...</p>
            </div>
            
            <div v-else-if="errorMsg" class="flex flex-col items-center justify-center p-12 text-red-500 text-center">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-10 h-10 mb-2" />
              <p class="font-bold text-base">{{ errorMsg }}</p>
            </div>
            
            <div v-else-if="results.length > 0">
               <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                 <li v-for="(item, idx) in results" :key="idx" 
                     class="p-5 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition-all group" 
                     @click="selectAddress(item)">
                   <div class="flex justify-between items-center mb-2">
                     <span class="font-bold text-blue-600 dark:text-blue-400 text-base font-mono bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded">{{ item.zipNo }}</span>
                     <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                   </div>
                   <div class="space-y-1">
                     <div class="text-gray-900 dark:text-gray-100 flex items-start text-sm sm:text-base">
                       <span class="inline-block px-2 py-0.5 text-[10px] font-bold border border-blue-200 text-blue-600 rounded bg-blue-50 mr-2 mt-0.5 shrink-0">도로명</span>
                       <span class="font-medium">{{ item.roadAddr }}</span>
                     </div>
                     <div class="text-gray-500 dark:text-gray-400 flex items-start text-sm">
                       <span class="inline-block px-2 py-0.5 text-[10px] font-bold border border-gray-200 text-gray-500 rounded bg-gray-100 mr-2 mt-0.5 shrink-0">지번</span>
                       <span>{{ item.jibunAddr }}</span>
                     </div>
                   </div>
                 </li>
               </ul>
            </div>
            
            <div v-else class="flex flex-col items-center justify-center p-12 text-gray-400 text-center">
              <UIcon name="i-heroicons-magnifying-glass" class="w-16 h-16 text-gray-200 mb-4" />
              <p class="text-lg font-bold">검색 결과가 여기에 표시됩니다.</p>
            </div>
          </div>
        </div>

        <!-- Footer (고정) -->
        <div class="px-6 py-4 border-t dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center bg-gray-50 dark:bg-gray-900/50 shrink-0 space-y-4 sm:space-y-0">
          <div v-if="results.length > 0" class="flex items-center space-x-4">
            <UButton icon="i-heroicons-chevron-left" color="neutral" variant="outline" @click="searchAddress(currentPage - 1)" :disabled="currentPage === 1" class="cursor-pointer" />
            <span class="text-sm font-bold text-gray-700 dark:text-gray-300">{{ currentPage }} / {{ totalPages || 1 }} 페이지</span>
            <UButton icon="i-heroicons-chevron-right" color="neutral" variant="outline" @click="searchAddress(currentPage + 1)" :disabled="currentPage >= totalPages" class="cursor-pointer" />
          </div>
          <div v-else></div>
          <UButton color="neutral" variant="ghost" size="lg" @click="isOpen = false" label="닫기" class="cursor-pointer font-bold px-10" />
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  open: { type: Boolean, default: false } // 이전 호환성을 위해 유지
})

const emit = defineEmits(['update:modelValue', 'update:open', 'select'])

const isOpen = computed({
  get: () => props.modelValue || props.open,
  set: (value) => {
    emit('update:modelValue', value)
    emit('update:open', value)
  }
})

// 모달이 닫힐 때 데이터 초기화 (watch 사용으로 모든 상황 대응)
watch(isOpen, (newVal) => {
  if (!newVal) {
    keyword.value = ''
    results.value = []
    errorMsg.value = ''
    totalCount.value = 0
    currentPage.value = 1
  }
})

const keyword = ref('')
const results = ref<any[]>([])
const isLoading = ref(false)
const errorMsg = ref('')
const currentPage = ref(1)
const totalCount = ref(0)
const countPerPage = 10

const totalPages = computed(() => Math.ceil(totalCount.value / countPerPage))

const selectAddress = (addressData: any) => {
  emit('select', addressData)
  isOpen.value = false
}

const searchAddress = async (page: number) => {
  if (!keyword.value.trim()) {
    errorMsg.value = '검색어를 입력해 주세요.'
    return
  }
  errorMsg.value = ''
  isLoading.value = true
  currentPage.value = page
  try {
    const response = (await $fetch('/api/address', {
      params: { keyword: keyword.value, currentPage: page, countPerPage: countPerPage }
    })) as any
    if (response?.results?.common?.errorCode === '0') {
      results.value = response.results.juso || []
      totalCount.value = parseInt(response.results.common.totalCount) || 0
      if (results.value.length === 0) errorMsg.value = '검색 결과가 없습니다.'
    } else {
      errorMsg.value = response?.results?.common?.errorMessage || '검색 중 오류가 발생했습니다.'
      results.value = []
      totalCount.value = 0
    }
  } catch (err) {
    errorMsg.value = '서버 통신 오류가 발생했습니다.'
    results.value = []
    totalCount.value = 0
  } finally {
    isLoading.value = false
  }
}
</script>