import { defineStore } from 'pinia'

export type ModalType = 'info' | 'success' | 'warning' | 'error' | 'prompt'

interface ModalState {
  isOpen: boolean
  type: ModalType
  title: string
  message: string
  confirmText: string
  cancelText: string
  inputValue: string
  inputPlaceholder: string
  resolve: ((value: any) => void) | null
  reject: ((reason?: any) => void) | null
}

export const useUIStore = defineStore('ui', {
  state: (): ModalState => ({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: '확인',
    cancelText: '취소',
    inputValue: '',
    inputPlaceholder: '',
    resolve: null,
    reject: null
  }),

  actions: {
    showAlert(title: string, message: string, type: ModalType = 'info') {
      return new Promise((resolve) => {
        this.isOpen = true
        this.type = type
        this.title = title
        this.message = message
        this.confirmText = '확인'
        this.cancelText = ''
        this.resolve = resolve
      })
    },

    showConfirm(title: string, message: string, type: ModalType = 'info', confirmText = '확인', cancelText = '취소') {
      return new Promise((resolve) => {
        this.isOpen = true
        this.type = type
        this.title = title
        this.message = message
        this.confirmText = confirmText
        this.cancelText = cancelText
        this.resolve = resolve
      })
    },

    showPrompt(title: string, message: string, placeholder = '') {
      return new Promise((resolve) => {
        this.isOpen = true
        this.type = 'prompt'
        this.title = title
        this.message = message
        this.confirmText = '확인'
        this.cancelText = '취소'
        this.inputValue = ''
        this.inputPlaceholder = placeholder
        this.resolve = resolve
      })
    },

    close(result: any = false) {
      this.isOpen = false
      if (this.resolve) {
        if (this.type === 'prompt') {
          this.resolve(result ? this.inputValue : null)
        } else {
          this.resolve(result)
        }
      }
      // 초기화
      this.resolve = null
      this.reject = null
    }
  }
})
