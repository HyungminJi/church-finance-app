import { db } from '../../utils/db'
import { UserRole, SYSTEM_CHURCH_ID } from '../../../types/auth'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody(event)
  const { targetChurchId } = body

  // 오직 Master 권한만 스위칭 가능
  if (event.context.userRole !== UserRole.MASTER) {
    throw createError({
      statusCode: 403,
      statusMessage: '테넌트 변경 권한이 없습니다.'
    })
  }

  if (!targetChurchId) {
    throw createError({ statusCode: 400, statusMessage: '대상 교회 ID가 필요합니다.' })
  }

  try {
    let targetChurchName = null

    // 대상이 본사(시스템 초기 상태)로 돌아가는 경우
    if (targetChurchId === SYSTEM_CHURCH_ID) {
      // 본사의 경우 별도의 교회 테이블을 조회할 필요 없이 복귀 처리
      await setUserSession(event, {
        ...session,
        user: {
          ...session.user,
          church_id: targetChurchId,
          impersonating_church_name: '' // 경고 배너 숨김 처리를 위해 확실하게 빈 문자열 할당
        }
      })
      
      return { 
        success: true, 
        message: '플랫폼 본사 환경으로 복귀했습니다.',
        churchId: targetChurchId 
      }
    }

    // 일반 테넌트 교회로 스위칭하는 경우
    const targetChurch = await db.selectFrom('churches')
      .select(['id', 'name'])
      .where('id', '=', targetChurchId)
      .executeTakeFirst()

    if (!targetChurch) {
      throw createError({ statusCode: 404, statusMessage: '대상을 찾을 수 없습니다.' })
    }

    targetChurchName = targetChurch.name

    // 세션 덮어쓰기 (기존 세션 정보는 유지하되 church_id와 impersonating_church_name 변경)
    await setUserSession(event, {
      ...session,
      user: {
        ...session.user,
        church_id: targetChurch.id,
        impersonating_church_name: targetChurchName // 경고 배너 표시용 플래그 설정
      }
    })

    return { 
      success: true, 
      message: `[${targetChurchName}] 환경으로 전환되었습니다.`,
      churchId: targetChurch.id 
    }

  } catch (error: any) {
    console.error('Switch tenant error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '테넌트 변경 중 오류가 발생했습니다.'
    })
  }
})
