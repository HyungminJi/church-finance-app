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

    // 전역 API 접근 제어 (Global RBAC Guard)
    const path = event.path
    
    // 실무(Manager) 이상만 접근 가능한 핵심 API 경로 목록
    const protectedRoutes = [
      '/api/donors',
      '/api/transactions',
      '/api/budget',
      '/api/reports',
      '/api/ledgers'
    ]

    // 현재 요청된 경로가 보호된 경로 중 하나로 시작하는지 확인
    const isProtected = protectedRoutes.some(route => path.startsWith(route))

    // User(3) 권한인 경우 접근 차단 (차후 본인 헌금 내역 조회를 위한 예외 경로는 허용 필요)
    if (isProtected && event.context.userRole > UserRole.MANAGER) {
      throw createError({
        statusCode: 403,
        statusMessage: '이 기능에 접근할 수 있는 권한이 없습니다. (실무자 이상)'
      })
    }
  }
})

