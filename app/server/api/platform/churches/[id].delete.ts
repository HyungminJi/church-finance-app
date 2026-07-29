import { db } from '../../../utils/db'
import { UserRole, SYSTEM_CHURCH_ID } from '../../../../types/auth'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  
  if (session.user.role !== UserRole.MASTER) {
    throw createError({ statusCode: 403, statusMessage: 'Master 권한이 필요합니다.' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: '교회 ID가 필요합니다.' })
  }

  // 시스템 관리 교회(본사)는 삭제 불가
  if (id === SYSTEM_CHURCH_ID) {
    throw createError({ statusCode: 403, statusMessage: '시스템 관리 교회(본사)는 삭제할 수 없습니다.' })
  }

  try {
    // 해당 교회에 연결된 전표 데이터 존재 여부 확인
    const transactionCount = await db.selectFrom('transactions')
      .select(db.fn.countAll().as('count'))
      .where('church_id', '=', id)
      .executeTakeFirst()

    if (transactionCount && Number(transactionCount.count) > 0) {
      throw createError({ 
        statusCode: 409, 
        statusMessage: `해당 교회에 ${transactionCount.count}건의 전표 데이터가 존재합니다. 데이터가 있는 교회는 영구 삭제할 수 없으며, [비활성화(서비스 정지)] 처리를 권장합니다.` 
      })
    }

    // 해당 교회의 사용자 먼저 삭제
    await db.deleteFrom('users')
      .where('church_id', '=', id)
      .execute()

    // 교회 삭제
    const deleted = await db.deleteFrom('churches')
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()

    if (!deleted) {
      throw createError({ statusCode: 404, statusMessage: '해당 교회를 찾을 수 없습니다.' })
    }

    return { success: true, message: `[${deleted.name}] 교회가 시스템에서 영구 삭제되었습니다.` }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Delete church error:', error)
    throw createError({ statusCode: 500, statusMessage: '교회 삭제 중 오류가 발생했습니다.' })
  }
})
