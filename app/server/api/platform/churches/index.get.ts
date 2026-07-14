import { db } from '../../../utils/db'
import { UserRole } from '../../../../types/auth'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  
  if (session.user.role !== UserRole.MASTER) {
    throw createError({ statusCode: 403, statusMessage: 'Master 권한이 필요합니다.' })
  }

  try {
    const churches = await db.selectFrom('churches')
      .selectAll()
      .orderBy('created_at', 'desc')
      .execute()

    return { success: true, data: churches }
  } catch (error: any) {
    console.error('Fetch churches error:', error)
    throw createError({ statusCode: 500, statusMessage: '조회 중 오류가 발생했습니다.' })
  }
})
