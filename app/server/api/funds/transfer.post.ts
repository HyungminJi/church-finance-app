import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    const { transaction_date, from_fund_id, to_fund_id, amount, description } = body

    if (!transaction_date || !from_fund_id || !to_fund_id || !amount) {
      throw createError({ statusCode: 400, statusMessage: '필수 항목이 누락되었습니다.' })
    }

    if (from_fund_id === to_fund_id) {
      throw createError({ statusCode: 400, statusMessage: '출금 계좌와 입금 계좌가 같을 수 없습니다.' })
    }

    if (Number(amount) <= 0) {
      throw createError({ statusCode: 400, statusMessage: '이체 금액은 0보다 커야 합니다.' })
    }

    // 1. 통장 정보 확인
    const fromFund = await db.selectFrom('funds').where('id', '=', from_fund_id).selectAll().executeTakeFirst()
    const toFund = await db.selectFrom('funds').where('id', '=', to_fund_id).selectAll().executeTakeFirst()

    if (!fromFund || !toFund) {
      throw createError({ statusCode: 404, statusMessage: '계좌 정보를 찾을 수 없습니다.' })
    }

    const transferDesc = description ? `[자금이체] ${description}` : `[자금이체] ${fromFund.name} -> ${toFund.name}`

    // 트랜잭션 처리 (원자성 보장)
    await db.transaction().execute(async (trx) => {
      // 출금 전표 (지출) - 임시로 기타지출(50-03) 사용, 혹은 적절한 지출 계정
      await trx.insertInto('transactions')
        .values({
          transaction_date,
          account_code: '50-03', // 기타지출 (임시)
          fund_id: from_fund_id,
          amount: Number(amount),
          description: transferDesc
        })
        .execute()

      // 입금 전표 (수입) - 임시로 기타수입(90-03) 사용
      await trx.insertInto('transactions')
        .values({
          transaction_date,
          account_code: '90-03', // 기타수입 (임시)
          fund_id: to_fund_id,
          amount: Number(amount),
          description: transferDesc
        })
        .execute()
    })

    return {
      success: true,
      message: '자금 이체가 완료되었습니다.'
    }
  }
  catch (error: any) {
    console.error('Fund transfer error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '자금 이체 처리 중 오류가 발생했습니다.',
    })
  }
})
