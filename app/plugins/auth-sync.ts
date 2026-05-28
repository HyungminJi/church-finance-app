export default defineNuxtPlugin(async (nuxtApp) => {
  const { loggedIn, user } = useUserSession()
  const authStore = useAuthStore()

  // App 초기화 시 세션 데이터가 있다면 Store에 강제로 주입 (Hydration)
  if (loggedIn.value && user.value) {
    authStore.isLoggedIn = true
    authStore.user = user.value
  }

  // 이후 세션이 변경될 때마다 Store도 동기화되도록 설정
  watch(user, (newUser) => {
    if (newUser) {
      authStore.isLoggedIn = true
      authStore.user = newUser
    } else {
      authStore.isLoggedIn = false
      authStore.user = null
    }
  }, { deep: true })
})
