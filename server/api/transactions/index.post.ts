import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // 1. Validation
    if (!body.transaction_date || !body.account_code || !body.fund_id || body.amount === undefined) {
      throw createError({ statusCode: 400, statusMessage: '필수 항목(일자, 계정코드, 자금코드, 금액)이 누락되었습니다.' })
    }

    if (Number(body.amount) <= 0) {
      throw createError({ statusCode: 400, statusMessage: '금액은 0보다 커야 합니다.' })
    }

    // 2. Insert Transaction
    const newTransaction = await db.insertInto('transactions')
      .values({
        transaction_date: body.transaction_date,
        account_code: body.account_code,
        fund_id: body.fund_id,
        amount: Number(body.amount),
        description: body.description || null,
        donor_id: body.donor_id || null
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    return {
      success: true,
      data: newTransaction,
    }
  }
  catch (error: any) {
    console.error('Create transaction error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '전표를 생성하는 중 오류가 발생했습니다.',
    })
  }
})
