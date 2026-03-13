import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: '전표 ID가 필요합니다.'
    })
  }

  try {
    const deletedTransaction = await db.deleteFrom('transactions')
      .where('id', '=', id)
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
