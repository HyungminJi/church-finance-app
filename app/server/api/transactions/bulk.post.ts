import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  try {
    const body = await readBody(event)
    const { transactions } = body

    if (!Array.isArray(transactions) || transactions.length === 0) {
      throw createError({ statusCode: 400, statusMessage: '데이터가 없습니다.' })
    }

    const result = await db.transaction().execute(async (trx) => {
      // 대량 삽입 수행
      await trx.insertInto('transactions')
        .values(transactions.map(t => ({
          church_id: session.user.church_id,
          transaction_date: t.transaction_date,
          account_code: t.account_code,
          fund_id: t.fund_id,
          amount: Number(t.amount),
          description: t.description || null,
          donor_id: t.donor_id || null
        })))
        .execute()

      return { count: transactions.length }
    })

    return {
      success: true,
      data: result
    }
  }
  catch (error: any) {
    console.error('Bulk create transactions error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '전표 대량 등록 중 오류가 발생했습니다.'
    })
  }
})
