<template>
  <UModal 
    v-model:open="ui.isOpen" 
    :prevent-close="ui.type === 'prompt'"
    :title="ui.title || defaultTitle"
    :description="ui.message"
    :ui="{ 
      wrapper: 'z-[10000]',
      overlay: 'z-[10000]',
      content: 'z-[10000]'
    }"
  >
    <template #content>
      <div class="p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <!-- 아이콘 영역 -->
        <div class="flex justify-center mb-6">
          <div :class="[iconBgClass, 'p-5 rounded-full ring-8 ring-opacity-10']" :style="{ ringColor: iconHexColor }">
            <UIcon :name="iconName" class="w-12 h-12" :class="iconTextClass" />
          </div>
        </div>

        <!-- 텍스트 영역 -->
        <div class="text-center space-y-3">
          <h3 class="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {{ ui.title || defaultTitle }}
          </h3>
          <p class="text-base text-slate-500 dark:text-slate-400 font-medium whitespace-pre-line leading-relaxed">
            {{ ui.message }}
          </p>
        </div>

        <!-- Prompt 입력창 -->
        <div v-if="ui.type === 'prompt'" class="mt-6">
          <UInput 
            v-model="ui.inputValue" 
            :placeholder="ui.inputPlaceholder" 
            size="lg" 
            autofocus 
            @keyup.enter="ui.close(true)"
            class="w-full"
          />
        </div>

        <!-- 버튼 영역 -->
        <div class="mt-8 flex gap-3">
          <UButton 
            v-if="ui.cancelText" 
            variant="ghost" 
            color="neutral" 
            size="lg" 
            class="flex-1 justify-center font-bold py-3 cursor-pointer border border-slate-200 dark:border-slate-700" 
            @click="ui.close(false)"
          >
            {{ ui.cancelText }}
          </UButton>
          <UButton 
            size="lg" 
            class="flex-1 justify-center font-bold py-3 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200" 
            :color="confirmButtonColor"
            @click="ui.close(true)"
          >
            {{ ui.confirmText }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUIStore } from '~/stores/ui'

const ui = useUIStore()

const defaultTitle = computed(() => {
  switch (ui.type) {
    case 'error': return '오류 발생'
    case 'warning': return '주의 필요'
    case 'success': return '성공'
    case 'prompt': return '입력 대기'
    default: return '알림'
  }
})

const iconName = computed(() => {
  switch (ui.type) {
    case 'success': return 'i-heroicons-check-circle'
    case 'error': return 'i-heroicons-x-circle'
    case 'warning': return 'i-heroicons-exclamation-triangle'
    case 'prompt': return 'i-heroicons-pencil-square'
    default: return 'i-heroicons-information-circle'
  }
})

const iconBgClass = computed(() => {
  switch (ui.type) {
    case 'success': return 'bg-green-100 dark:bg-green-900/30'
    case 'error': return 'bg-red-100 dark:bg-red-900/30'
    case 'warning': return 'bg-yellow-100 dark:bg-yellow-900/30'
    case 'prompt': return 'bg-brand-blue/10'
    default: return 'bg-blue-100 dark:bg-blue-900/30'
  }
})

const iconTextClass = computed(() => {
  switch (ui.type) {
    case 'success': return 'text-green-600'
    case 'error': return 'text-red-600'
    case 'warning': return 'text-yellow-600'
    case 'prompt': return 'text-brand-blue'
    default: return 'text-blue-600'
  }
})

const iconHexColor = computed(() => {
  switch (ui.type) {
    case 'success': return '#16A34A'
    case 'error': return '#DC2626'
    case 'warning': return '#D97706'
    case 'prompt': return '#3CAFFF'
    default: return '#2563EB'
  }
})

const confirmButtonColor = computed(() => {
  switch (ui.type) {
    case 'error': return 'error'
    case 'warning': return 'warning'
    case 'success': return 'success'
    default: return 'primary'
  }
})
</script>

<style scoped>
.bg-brand-blue\/10 { background-color: rgba(60, 175, 255, 0.1); }
.text-brand-blue { color: #3CAFFF; }
</style>
