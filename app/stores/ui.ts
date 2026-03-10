import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ModalType = 'info' | 'success' | 'warning' | 'error' | 'prompt'

export const useUIStore = defineStore('ui', () => {
  const isOpen = ref(false)
  const type = ref<ModalType>('info')
  const title = ref('')
  const message = ref('')
  const confirmText = ref('확인')
  const cancelText = ref('취소')
  const inputValue = ref('')
  const inputPlaceholder = ref('')
  
  const resolvePromise = ref<((value: any) => void) | null>(null)

  const showAlert = (t: string, msg: string, mt: ModalType = 'info') => {
    return new Promise((resolve) => {
      isOpen.value = true
      type.value = mt
      title.value = t
      message.value = msg
      confirmText.value = '확인'
      cancelText.value = ''
      resolvePromise.value = resolve
    })
  }

  const showConfirm = (t: string, msg: string, mt: ModalType = 'info', okText = '확인', canText = '취소') => {
    return new Promise((resolve) => {
      isOpen.value = true
      type.value = mt
      title.value = t
      message.value = msg
      confirmText.value = okText
      cancelText.value = canText
      resolvePromise.value = resolve
    })
  }

  const showPrompt = (t: string, msg: string, placeholder = '') => {
    return new Promise((resolve) => {
      isOpen.value = true
      type.value = 'prompt'
      title.value = t
      message.value = msg
      confirmText.value = '확인'
      cancelText.value = '취소'
      inputValue.value = ''
      inputPlaceholder.value = placeholder
      resolvePromise.value = resolve
    })
  }

  const close = (result: any = false) => {
    isOpen.value = false
    if (resolvePromise.value) {
      if (type.value === 'prompt') {
        resolvePromise.value(result ? inputValue.value : null)
      } else {
        resolvePromise.value(result)
      }
    }
    resolvePromise.value = null
  }

  return {
    isOpen,
    type,
    title,
    message,
    confirmText,
    cancelText,
    inputValue,
    inputPlaceholder,
    showAlert,
    showConfirm,
    showPrompt,
    close
  }
})
