import { db } from '../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const startDate = query.startDate as string
  const endDate = query.endDate as string
  const fiscalYear = parseInt(query.fiscalYear as string) || new Date(startDate || new Date()).getFullYear()

  if (!startDate || !endDate) {
    throw createError({
      statusCode: 400,
      statusMessage: '시작일(startDate)과 종료일(endDate)은 필수입니다.'
    })
  }

  try {
    // 1. 기초 이월 잔액 (조회 시작일 이전 전체 수입 - 전체 지출)
    const prevResult = await db.selectFrom('transactions as t')
      .leftJoin('accounts as a', 't.account_code', 'a.code')
      .where('t.transaction_date', '<', startDate)
      .select([
        sql<number>`COALESCE(SUM(CASE WHEN a.type = 'INCOME' THEN t.amount ELSE 0 END), 0)`.as('prev_income'),
        sql<number>`COALESCE(SUM(CASE WHEN a.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0)`.as('prev_expense')
      ])
      .executeTakeFirst()

    const previousBalance = Number(prevResult?.prev_income || 0) - Number(prevResult?.prev_expense || 0)

    // 2. 계정별 실적(Transactions) + 예산(Budgets) 통합 조회
    // 모든 활성 계정을 가져오고, 해당 기간의 트랜잭션 합계와 해당 년도의 예산을 붙임
    const reportData = await db.selectFrom('accounts as a')
      .leftJoin('budgets as b', (join) => join
        .onRef('a.code', '=', 'b.account_code')
        .on('b.fiscal_year', '=', fiscalYear)
      )
      .leftJoin(
        db.selectFrom('transactions as t')
          .select([
            't.account_code',
            sql<number>`SUM(t.amount)`.as('period_amount')
          ])
          .where('t.transaction_date', '>=', startDate)
          .where('t.transaction_date', '<=', endDate)
          .groupBy('t.account_code')
          .as('t_period'),
        'a.code',
        't_period.account_code'
      )
      .select([
        'a.code',
        'a.name',
        'a.type',
        'a.level',
        'a.parent_code',
        sql<number>`COALESCE(b.amount, 0)`.as('budget_amount'),
        sql<number>`COALESCE(t_period.period_amount, 0)`.as('actual_amount')
      ])
      .where('a.is_active', '=', true)
      .orderBy(sql`LPAD(SPLIT_PART(a.code, '-', 1), 10, '0')`, 'asc')
      .orderBy('a.level', 'asc')
      .orderBy(sql`LPAD(a.code, 20, '0')`, 'asc')
      .execute()

    // 3. 수지 요약 계산 (기간 내 총 수입/지출)
    const summary = reportData.reduce((acc, curr) => {
      if (curr.level === 2) { // 최하위 계정 기준 합산 (중복 합산 방지)
        if (curr.type === 'INCOME') {
          acc.total_income_actual += Number(curr.actual_amount)
          acc.total_income_budget += Number(curr.budget_amount)
        } else {
          acc.total_expense_actual += Number(curr.actual_amount)
          acc.total_expense_budget += Number(curr.budget_amount)
        }
      }
      return acc
    }, {
      total_income_actual: 0,
      total_income_budget: 0,
      total_expense_actual: 0,
      total_expense_budget: 0
    })

    return {
      success: true,
      data: reportData,
      meta: {
        startDate,
        endDate,
        fiscalYear,
        previousBalance,
        ...summary,
        endingBalance: previousBalance + summary.total_income_actual - summary.total_expense_actual
      }
    }

  } catch (error: any) {
    console.error('Fetch settlement report error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '결산 보고서 데이터를 가져오는 중 오류가 발생했습니다.'
    })
  }
})
