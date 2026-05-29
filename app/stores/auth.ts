import { ref, computed } from 'vue'
import { UserRole } from '../types/auth'

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false)
  const user = ref<any>(null)
  const token = ref<string | null>(null)

  const isMaster = computed(() => Number(user.value?.role) === UserRole.MASTER)
  const isAdmin = computed(() => Number(user.value?.role) <= UserRole.ADMIN) // MASTER도 ADMIN 권한 가짐
  const canEdit = computed(() => Number(user.value?.role) <= UserRole.MANAGER)

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
    isMaster,
    isAdmin,
    canEdit,
    login,
    logout
  }
})
