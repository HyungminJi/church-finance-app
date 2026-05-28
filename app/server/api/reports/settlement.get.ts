import { db } from '../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const query = getQuery(event)
  const startDate = query.startDate as string
  const endDate = query.endDate as string
  const fiscalYear = parseInt(query.fiscalYear as string) || new Date(startDate || new Date()).getFullYear()

  if (!startDate || !endDate) {
    throw createError({
      statusCode: 400,
      statusMessage: '조회 시작일(startDate)과 종료일(endDate)은 필수입니다.'
    })
  }

  // 회계년도 시작일 (1월 1일)
  const yearStart = `${fiscalYear}-01-01`

  try {
    // 1. 기초 이월 잔액 (조회 시작일 이전 전체 수입 - 전체 지출)
    const prevResult = await db.selectFrom('transactions as t')
      .leftJoin('accounts as a', 't.account_code', 'a.code')
      .$if(event.context.userRole !== 0, (qb) => qb.where('t.church_id', '=', event.context.churchId || session.user.church_id))
      .where('t.transaction_date', '<', startDate)
      .select([
        sql<number>`COALESCE(SUM(CASE WHEN a.type = 'INCOME' THEN t.amount ELSE 0 END), 0)`.as('prev_income'),
        sql<number>`COALESCE(SUM(CASE WHEN a.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0)`.as('prev_expense')
      ])
      .executeTakeFirst()

    const previousBalance = Number(prevResult?.prev_income || 0) - Number(prevResult?.prev_expense || 0)

    // 2. 계정별 실적(Transactions) + 예산(Budgets) 통합 조회
    const reportData = await db.selectFrom('accounts as a')
      .leftJoin('budgets as b', (join) => join
        .onRef('a.code', '=', 'b.account_code')
        .on('b.fiscal_year', '=', fiscalYear)
        .on('b.church_id', '=', session.user.church_id)
      )
      // 분기/조회기간 누계 (startDate ~ endDate)
      .leftJoin(
        db.selectFrom('transactions as t')
          .select([
            't.account_code',
            sql<number>`SUM(t.amount)`.as('period_amount')
          ])
          .$if(event.context.userRole !== 0, (qb) => qb.where('t.church_id', '=', event.context.churchId || session.user.church_id))
          .where('t.transaction_date', '>=', startDate)
          .where('t.transaction_date', '<=', endDate)
          .groupBy('t.account_code')
          .as('t_period'),
        'a.code',
        't_period.account_code'
      )
      // 연간 누계 (yearStart ~ endDate)
      .leftJoin(
        db.selectFrom('transactions as t')
          .select([
            't.account_code',
            sql<number>`SUM(t.amount)`.as('annual_amount')
          ])
          .$if(event.context.userRole !== 0, (qb) => qb.where('t.church_id', '=', event.context.churchId || session.user.church_id))
          .where('t.transaction_date', '>=', yearStart)
          .where('t.transaction_date', '<=', endDate)
          .groupBy('t.account_code')
          .as('t_annual'),
        'a.code',
        't_annual.account_code'
      )
      .select([
        'a.code',
        'a.name',
        'a.type',
        'a.level',
        'a.parent_code',
        sql<number>`COALESCE(b.amount, 0)`.as('budget_amount'),
        sql<number>`COALESCE(t_period.period_amount, 0)`.as('period_amount'),
        sql<number>`COALESCE(t_annual.annual_amount, 0)`.as('annual_amount')
      ])
      .$if(event.context.userRole !== 0, (qb) => qb.where('a.church_id', '=', event.context.churchId || session.user.church_id))
      .where('a.is_active', '=', true)
      .orderBy(sql`LPAD(SPLIT_PART(a.code, '-', 1), 10, '0')`, 'asc')
      .orderBy('a.level', 'asc')
      .orderBy(sql`LPAD(a.code, 20, '0')`, 'asc')
      .execute()

    // 3. 수지 요약 계산
    const summary = reportData.reduce((acc, curr) => {
      if (curr.level === 2) { 
        if (curr.type === 'INCOME') {
          acc.total_income_period += Number(curr.period_amount)
          acc.total_income_annual += Number(curr.annual_amount)
          acc.total_income_budget += Number(curr.budget_amount)
        } else {
          acc.total_expense_period += Number(curr.period_amount)
          acc.total_expense_annual += Number(curr.annual_amount)
          acc.total_expense_budget += Number(curr.budget_amount)
        }
      }
      return acc
    }, {
      total_income_period: 0,
      total_income_annual: 0,
      total_income_budget: 0,
      total_expense_period: 0,
      total_expense_annual: 0,
      total_expense_budget: 0
    })

    // 교회 정보 조회 (인쇄용)
    const church = await db.selectFrom('churches')
      .selectAll()
      .where('id', '=', session.user.church_id)
      .executeTakeFirst()

    return {
      success: true,
      data: reportData,
      church,
      meta: {
        startDate,
        endDate,
        yearStart,
        fiscalYear,
        previousBalance,
        ...summary,
        // 현잔액은 (연간수입총계 + 기초이월) - 연간지출총계가 아니라 
        // 단순히 현재까지의 모든 수입 - 지출입니다. 
        // 하지만 보고서의 "현잔액"은 보통 (연간수입누계 - 연간지출누계)를 의미하기도 합니다.
        // 이미지의 "현잔액" 수식을 보면 총수입(연간누계) - 총지출(연간누계) = 현잔액 입니다.
        endingBalance: summary.total_income_annual - summary.total_expense_annual
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
