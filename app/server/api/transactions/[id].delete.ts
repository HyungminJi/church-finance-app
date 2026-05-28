import { db } from '../../utils/db'
import { checkClosingDate } from '../../utils/closing'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  const churchId = event.context.churchId || session.user.church_id

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: '전표 ID가 필요합니다.'
    })
  }

  try {
    // 1. 기존 전표 날짜 확인 (마감일 검사용)
    const existingTransaction = await db.selectFrom('transactions')
      .select('transaction_date')
      .where('id', '=', id)
      .$if(event.context.userRole !== 0, (qb) => qb.where('church_id', '=', churchId))
      .executeTakeFirst()

    if (!existingTransaction) {
      throw createError({ statusCode: 404, statusMessage: '전표를 찾을 수 없습니다.' })
    }

    await checkClosingDate(churchId, existingTransaction.transaction_date)

    // 2. 삭제 실행
    const deletedTransaction = await db.deleteFrom('transactions')
      .where('id', '=', id)
      .$if(event.context.userRole !== 0, (qb) => qb.where('church_id', '=', churchId))
      .returningAll()
      .executeTakeFirstOrThrow()

    return {
      success: true,
      data: deletedTransaction
    }
  } catch (error: any) {
    console.error('Delete transaction error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '전표를 삭제하는 중 오류가 발생했습니다.'
    })
  }
})
