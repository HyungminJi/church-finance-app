import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false)
  const user = ref<any>(null)
  const token = ref<string | null>(null)

  function login(u: any, t: string) {
    isLoggedIn.value = true
    user.value = u
    token.value = t
  }

  function logout() {
    isLoggedIn.value = false
    user.value = null
    token.value = null
  }

  return {
    isLoggedIn,
    user,
    token,
    login,
    logout
  }
})
