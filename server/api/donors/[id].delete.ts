import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID가 누락되었습니다.' })
  }

  try {
    // 1. 해당 헌금자에게 연결된 전표(Transactions)가 있는지 확인
    const txCount = await db.selectFrom('transactions')
      .select(db.fn.count('id').as('count'))
      .where('donor_id', '=', id)
      .executeTakeFirstOrThrow()

    if (Number(txCount.count) > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '해당 헌금자로 등록된 전표 내역이 존재하여 삭제할 수 없습니다. 먼저 전표를 삭제하거나 다른 헌금자로 변경해 주세요.'
      })
    }

    // 2. 삭제 처리 (트랜잭션 권장)
    await db.transaction().execute(async (trx) => {
      // donors 테이블 삭제 (CASCADE 설정에 의해 하위 테이블 자동 삭제됨)
      await trx.deleteFrom('donors')
        .where('id', '=', id)
        .execute()
    })

    return { success: true }

  } catch (error: any) {
    console.error('Delete donor error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '헌금자 삭제 중 오류가 발생했습니다.'
    })
  }
})
