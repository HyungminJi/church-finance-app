import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  
  // 미들웨어에서 주입된 context.churchId 사용 (Master 권한 스위칭 대응)
  const churchId = event.context.churchId || session.user.church_id

  try {
    const church = await db.selectFrom('churches')
      .selectAll()
      .where('id', '=', churchId)
      .executeTakeFirst()

    if (!church) {
      throw createError({
        statusCode: 404,
        statusMessage: '교회 정보를 찾을 수 없습니다.'
      })
    }

    return {
      success: true,
      data: church
    }
  } catch (error: any) {
    console.error('Fetch current church error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '교회 정보를 불러오는 중 오류가 발생했습니다.'
    })
  }
})
