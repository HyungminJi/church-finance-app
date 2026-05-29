export default defineNuxtPlugin(async (nuxtApp) => {
  const { loggedIn, user } = useUserSession()
  const authStore = useAuthStore()

  // 세션이 변경되거나 초기화될 때 Store도 동기화되도록 설정
  watch(user, (newUser) => {
    if (newUser) {
      authStore.isLoggedIn = true
      authStore.user = newUser
    } else {
      authStore.isLoggedIn = false
      authStore.user = null
    }
  }, { deep: true, immediate: true })
})
