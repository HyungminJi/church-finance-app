
import { ref } from 'vue'

export const useFinanceStore = defineStore('finance', () => {
  const accounts = ref<any[]>([])
  const _fetched = ref(false)

  async function fetchAccounts() {
    if (_fetched.value) return
    
    const { data, error } = await useFetch('/api/accounts')
    if (error.value) {
      console.error('Failed to fetch accounts:', error.value)
      return
    }
    
    const res = data.value as any
    if (res?.success) {
      accounts.value = res.data
      _fetched.value = true
    }
  }

  return {
    accounts,
    _fetched,
    fetchAccounts
  }
})
