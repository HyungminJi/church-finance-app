import { UserRole } from '~/types/auth'

export default defineNuxtRouteMiddleware((to) => {
  const { user, loggedIn } = useUserSession()
  
  if (!loggedIn.value) {
    return navigateTo('/auth/login')
  }

  // Master 권한(0)이 아니면 메인으로 강제 이동
  if (user.value?.role !== UserRole.MASTER) {
    return navigateTo('/')
  }
})
