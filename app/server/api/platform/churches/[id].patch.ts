import { db } from '../../../utils/db'
import { UserRole } from '../../../../types/auth'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  
  if (session.user.role !== UserRole.MASTER) {
    throw createError({ statusCode: 403, statusMessage: 'Master 권한이 필요합니다.' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: '교회 ID가 필요합니다.' })
  }

  const body = await readBody(event)
  const { is_active } = body

  if (typeof is_active !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: '변경할 상태(is_active) 값이 필요합니다.' })
  }

  try {
    const updated = await db.updateTable('churches')
      .set({ is_active, updated_at: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()

    if (!updated) {
      throw createError({ statusCode: 404, statusMessage: '해당 교회를 찾을 수 없습니다.' })
    }

    const statusText = is_active ? '활성화(운영 재개)' : '비활성화(서비스 정지)'
    return { success: true, data: updated, message: `[${updated.name}] 교회가 ${statusText} 처리되었습니다.` }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Update church error:', error)
    throw createError({ statusCode: 500, statusMessage: '교회 상태 변경 중 오류가 발생했습니다.' })
  }
})
