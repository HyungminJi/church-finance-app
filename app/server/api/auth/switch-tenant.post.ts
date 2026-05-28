import { db } from '../../utils/db'
import { UserRole } from '../../../types/auth'

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
    // 대상 교회가 실제로 존재하는지 확인
    const targetChurch = await db.selectFrom('churches')
      .select(['id', 'name'])
      .where('id', '=', targetChurchId)
      .executeTakeFirst()

    if (!targetChurch) {
      throw createError({ statusCode: 404, statusMessage: '대상을 찾을 수 없습니다.' })
    }

    // 세션 덮어쓰기 (기존 세션 정보는 유지하되 church_id와 church_name만 변경)
    // 원래의 로그인 ID와 Master Role은 그대로 유지됨
    await setUserSession(event, {
      ...session,
      user: {
        ...session.user,
        church_id: targetChurch.id,
        impersonating_church_name: targetChurch.name // 경고 배너 표시용 플래그
      }
    })

    return { 
      success: true, 
      message: `[${targetChurch.name}] 환경으로 전환되었습니다.`,
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
