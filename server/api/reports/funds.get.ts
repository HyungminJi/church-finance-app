import { db } from '../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const startDate = query.startDate as string
  const endDate = query.endDate as string

  if (!startDate || !endDate) {
    throw createError({
      statusCode: 400,
      statusMessage: '시작일(startDate)과 종료일(endDate)은 필수입니다.'
    })
  }

  try {
    // 1. 모든 활성 자금(Fund) 목록 조회
    const funds = await db.selectFrom('funds')
      .selectAll()
      .where('is_active', '=', true)
      .execute()

    // 2. 각 자금별 기초 이월금 (startDate 이전 transactions 합계)
    const carryOvers = await db.selectFrom('transactions as t')
      .leftJoin('accounts as a', 't.account_code', 'a.code')
      .select([
        't.fund_id',
        sql<number>`SUM(CASE WHEN a.type = 'INCOME' THEN t.amount ELSE -t.amount END)`.as('prev_balance')
      ])
      .where('t.transaction_date', '<', startDate)
      .where('t.fund_id', 'is not', null)
      .groupBy('t.fund_id')
      .execute()

    // 3. 해당 기간 내 자금별 수입/지출 합계
    const periodStats = await db.selectFrom('transactions as t')
      .leftJoin('accounts as a', 't.account_code', 'a.code')
      .select([
        't.fund_id',
        sql<number>`SUM(CASE WHEN a.type = 'INCOME' THEN t.amount ELSE 0 END)`.as('income'),
        sql<number>`SUM(CASE WHEN a.type = 'EXPENSE' THEN t.amount ELSE 0 END)`.as('expense')
      ])
      .where('t.transaction_date', '>=', startDate)
      .where('t.transaction_date', '<=', endDate)
      .where('t.fund_id', 'is not', null)
      .groupBy('t.fund_id')
      .execute()

    // 4. 데이터 병합
    const reportData = funds.map(fund => {
      const prev = carryOvers.find(c => c.fund_id === fund.id)
      const period = periodStats.find(p => p.fund_id === fund.id)

      const initial_carry_over = Number(fund.initial_balance) + Number(prev?.prev_balance || 0)
      const income = Number(period?.income || 0)
      const expense = Number(period?.expense || 0)
      const balance = initial_carry_over + income - expense

      return {
        ...fund,
        carryOver: initial_carry_over,
        income,
        expense,
        balance
      }
    })

    return {
      success: true,
      data: reportData,
      meta: {
        startDate,
        endDate
      }
    }
  } catch (error: any) {
    console.error('Fetch funds report error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '자금명세서 데이터를 집계하는 중 오류가 발생했습니다.'
    })
  }
})
