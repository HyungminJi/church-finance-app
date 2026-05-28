import { db } from '../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const query = getQuery(event)
  
  const startDate = query.startDate as string
  const endDate = query.endDate as string
  const typeFilter = query.type as 'INCOME' | 'EXPENSE' | 'ALL'
  
  if (!startDate || !endDate) {
    throw createError({
      statusCode: 400,
      statusMessage: '조회 시작일(startDate)과 종료일(endDate)은 필수입니다.'
    })
  }

  const fiscalYear = new Date(startDate).getFullYear()

  try {
    // 1. 모든 활성 계정과목 조회
    let accountsQuery = db.selectFrom('accounts')
      .select(['code', 'name', 'type', 'level', 'parent_code'])
      .$if(event.context.userRole !== 0, (qb) => qb.where('church_id', '=', event.context.churchId || session.user.church_id))
      .where('is_active', '=', true)

    if (typeFilter && typeFilter !== 'ALL') {
      accountsQuery = accountsQuery.where('type', '=', typeFilter)
    }

    const accounts = await accountsQuery
      .orderBy(sql`LPAD(SPLIT_PART(code, '-', 1), 10, '0')`, 'asc')
      .orderBy('level', 'asc')
      .orderBy(sql`LPAD(code, 20, '0')`, 'asc')
      .execute()

    // 2. 계정별 기초 이월금 (startDate 이전 합계)
    const carryOvers = await db.selectFrom('transactions as t')
      .innerJoin('accounts as a', 't.account_code', 'a.code')
      .select([
        't.account_code',
        sql<number>`SUM(CASE WHEN a.type = 'INCOME' THEN t.amount ELSE 0 END)`.as('income_sum'),
        sql<number>`SUM(CASE WHEN a.type = 'EXPENSE' THEN t.amount ELSE 0 END)`.as('expense_sum')
      ])
      .$if(event.context.userRole !== 0, (qb) => qb.where('t.church_id', '=', event.context.churchId || session.user.church_id))
      .where('t.transaction_date', '<', startDate)
      .groupBy('t.account_code')
      .execute()

    // 3. 해당 기간 내 발생액 (startDate ~ endDate)
    const periodStats = await db.selectFrom('transactions as t')
      .innerJoin('accounts as a', 't.account_code', 'a.code')
      .select([
        't.account_code',
        sql<number>`SUM(CASE WHEN a.type = 'INCOME' THEN t.amount ELSE 0 END)`.as('income_sum'),
        sql<number>`SUM(CASE WHEN a.type = 'EXPENSE' THEN t.amount ELSE 0 END)`.as('expense_sum')
      ])
      .$if(event.context.userRole !== 0, (qb) => qb.where('t.church_id', '=', event.context.churchId || session.user.church_id))
      .where('t.transaction_date', '>=', startDate)
      .where('t.transaction_date', '<=', endDate)
      .groupBy('t.account_code')
      .execute()

    // 4. 예산 데이터 (해당 회계연도)
    const budgets = await db.selectFrom('budgets')
      .select(['account_code', 'amount'])
      .$if(event.context.userRole !== 0, (qb) => qb.where('church_id', '=', event.context.churchId || session.user.church_id))
      .where('fiscal_year', '=', fiscalYear)
      .execute()

    // 5. 데이터 병합 및 결과 구성
    const results = accounts.map(acc => {
      const carry = carryOvers.find(c => c.account_code === acc.code)
      const period = periodStats.find(p => p.account_code === acc.code)
      const budget = budgets.find(b => b.account_code === acc.code)

      const carryIncome = Number(carry?.income_sum || 0)
      const carryExpense = Number(carry?.expense_sum || 0)
      
      const periodIncome = Number(period?.income_sum || 0)
      const periodExpense = Number(period?.expense_sum || 0)
      
      const budgetAmount = Number(budget?.amount || 0)

      // 단식부기 특성상 수입 계정은 대변(Credit), 지출 계정은 차변(Debit)에 발생액 표시
      // 잔액 계산: 수입은 (+), 지출은 (-)
      const carryBalance = carryIncome - carryExpense
      const totalExec = acc.type === 'INCOME' ? periodIncome : periodExpense
      const endingBalance = carryBalance + (periodIncome - periodExpense)

      return {
        code: acc.code,
        name: acc.name,
        type: acc.type,
        level: acc.level,
        budget: budgetAmount,
        carryBalance,
        // UI 대응을 위한 필드 매핑
        carryDebit: carryExpense,
        carryCredit: carryIncome,
        monthlyDebit: periodExpense,
        monthlyCredit: periodIncome,
        totalExec,
        totalDebit: carryExpense + periodExpense,
        totalCredit: carryIncome + periodIncome,
        balance: endingBalance,
        rate: budgetAmount > 0 ? Math.round((totalExec / budgetAmount) * 100) : 0
      }
    })

    return {
      success: true,
      data: results,
      meta: {
        startDate,
        endDate,
        fiscalYear
      }
    }

  } catch (error: any) {
    console.error('Fetch total-account error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '총계정원장 데이터를 집계하는 중 오류가 발생했습니다.'
    })
  }
})
