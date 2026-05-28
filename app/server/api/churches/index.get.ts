import { db } from '../../utils/db'
import { UserRole } from '../../../types/auth'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  
  // Master 권한만 전체 교회 목록 조회 가능
  if (event.context.userRole !== UserRole.MASTER) {
    throw createError({
      statusCode: 403,
      statusMessage: '플랫폼 교회 목록 조회 권한이 없습니다.'
    })
  }

  try {
    const churches = await db.selectFrom('churches')
      .select(['id', 'name', 'created_at'])
      .orderBy('name', 'asc')
      .execute()

    return {
      success: true,
      data: churches
    }
  } catch (error: any) {
    console.error('Fetch all churches error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '교회 목록을 불러오는 중 오류가 발생했습니다.'
    })
  }
})
