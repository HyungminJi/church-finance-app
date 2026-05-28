import { db } from '../../utils/db'
import { UserRole } from '../../../types/auth'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody(event)
  
  const churchId = event.context.churchId || session.user.church_id
  const userRole = event.context.userRole

  // Admin(1) 또는 Master(0) 권한만 장부 마감 가능
  if (userRole > UserRole.ADMIN) {
    throw createError({
      statusCode: 403,
      statusMessage: '장부 마감 권한이 없습니다.'
    })
  }

  const { closing_date } = body

  try {
    const result = await db.updateTable('churches')
      .set({
        closing_date: closing_date || null,
        updated_at: new Date()
      })
      .where('id', '=', churchId)
      .executeTakeFirst()

    if (Number(result.numUpdatedRows) === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '교회 정보를 찾을 수 없습니다.'
      })
    }

    return {
      success: true,
      message: closing_date ? '장부가 성공적으로 마감되었습니다.' : '마감이 해제되었습니다.',
      data: {
        closing_date
      }
    }
  } catch (error: any) {
    console.error('Update closing date error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '장부 마감 처리 중 오류가 발생했습니다.'
    })
  }
})
