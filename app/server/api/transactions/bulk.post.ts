import { db } from '../../utils/db'
import { checkClosingDate } from '../../utils/closing'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  try {
    const body = await readBody(event)
    const { transactions } = body
    const churchId = event.context.churchId || session.user.church_id

    if (!Array.isArray(transactions) || transactions.length === 0) {
      throw createError({ statusCode: 400, statusMessage: '데이터가 없습니다.' })
    }

    // 마감일 확인 (가장 오래된 날짜 하나만 확인해도 됨, 혹은 전체 순회)
    for (const t of transactions) {
       await checkClosingDate(churchId, t.transaction_date)
    }

    const result = await db.transaction().execute(async (trx) => {
      // 대량 삽입 수행
      await trx.insertInto('transactions')
        .values(transactions.map(t => ({
          church_id: churchId,
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
