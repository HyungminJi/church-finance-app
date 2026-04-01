import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { budgets, fiscal_year } = body

  if (!Array.isArray(budgets) || !fiscal_year) {
    throw createError({
      statusCode: 400,
      statusMessage: '올바른 예산 데이터와 회계년도가 필요합니다.'
    })
  }

  try {
    await db.transaction().execute(async (trx) => {
      for (const item of budgets) {
        // 금액이 있는 항목만 처리 (또는 0으로 명시적 업데이트)
        const amount = parseInt(item.amount as any) || 0
        
        await trx.insertInto('budgets')
          .values({
            account_code: item.code,
            fiscal_year: parseInt(fiscal_year),
            amount: amount
          })
          .onConflict((oc) => oc
            .columns(['account_code', 'fiscal_year'])
            .doUpdateSet({
              amount: amount
            })
          )
          .execute()
      }
    })

    return { success: true }
  } catch (error: any) {
    console.error('Save budget error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '예산 데이터를 저장하는 중 오류가 발생했습니다.'
    })
  }
})
