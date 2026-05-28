import { UserRole, SYSTEM_CHURCH_ID } from '../../types/auth'

export default defineEventHandler(async (event) => {
  // nuxt-auth-utils를 사용하여 세션 가져오기
  const session = await getUserSession(event)
  const user = session?.user as any

  if (user) {
    // 세션 정보를 기반으로 context에 권한 정보 주입
    event.context.churchId = user.church_id
    
    // DB의 기존 권한 체계(1=최고관리자)와 충돌을 방지하기 위해, 
    // 본사(SYSTEM_CHURCH_ID) 소속인 경우 무조건 MASTER(0) 권한 부여
    if (user.church_id === SYSTEM_CHURCH_ID) {
      event.context.userRole = UserRole.MASTER
    } else {
      event.context.userRole = Number(user.role) as UserRole
    }
  }
})
