import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { transactions } = body

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      throw createError({ statusCode: 400, statusMessage: '등록할 데이터가 없습니다.' })
    }

    // 트랜잭션으로 일괄 처리
    const result = await db.transaction().execute(async (trx) => {
      const inserted = await trx.insertInto('transactions')
        .values(transactions.map(t => ({
          transaction_date: t.transaction_date,
          account_code: t.account_code,
          amount: Number(t.amount),
          description: t.description || null,
          member_id: t.member_id || null
        })))
        .returningAll()
        .execute()
      
      return inserted
    })

    return {
      success: true,
      count: result.length,
      data: result
    }
  } catch (error: any) {
    console.error('Bulk transaction error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '대량 등록 중 오류가 발생했습니다.'
    })
  }
})
