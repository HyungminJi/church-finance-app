import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID가 누락되었습니다.' })
  }

  try {
    // 1. 해당 자금에 연결된 전표 데이터가 있는지 확인 (데이터 정합성 보호)
    const txCount = await db.selectFrom('transactions')
      .select(db.fn.count('id').as('count'))
      .where('fund_id', '=', id)
      .executeTakeFirstOrThrow()

    if (Number(txCount.count) > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '해당 통장/자금으로 등록된 전표 내역이 존재하여 삭제할 수 없습니다. 대신 비활성화(미사용) 처리해 주세요.'
      })
    }

    // 2. 삭제 수행
    const result = await db.deleteFrom('funds')
      .where('id', '=', id)
      .executeTakeFirst()

    return {
      success: true,
      message: '자금 정보가 삭제되었습니다.'
    }
  } catch (error: any) {
    console.error('Delete fund error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '자금 정보 삭제 중 오류가 발생했습니다.'
    })
  }
})
