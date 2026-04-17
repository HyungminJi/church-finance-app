import { db } from '../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const query = getQuery(event)
  
  const startDate = query.startDate as string
  const endDate = query.endDate as string
  
  if (!startDate || !endDate) {
    throw createError({
      statusCode: 400,
      statusMessage: '조회 시작일(startDate)과 종료일(endDate)은 필수입니다.'
    })
  }

  try {
    // 1. 모든 활성 계정과목 조회
    const accounts = await db.selectFrom('accounts')
      .select(['code', 'name', 'type', 'level'])
      .where('church_id', '=', session.user.church_id)
      .where('is_active', '=', true)
      .orderBy(sql`LPAD(SPLIT_PART(code, '-', 1), 10, '0')`, 'asc')
      .orderBy('level', 'asc')
      .orderBy(sql`LPAD(code, 20, '0')`, 'asc')
      .execute()

    // 2. 계정별 총 차변/대변 합계 (전체 기간 합산)
    // 시산표는 "합계"와 "잔액"을 보여주므로 전체 거래를 집계함
    const stats = await db.selectFrom('transactions as t')
      .innerJoin('accounts as a', 't.account_code', 'a.code')
      .select([
        't.account_code',
        sql<number>`SUM(CASE WHEN a.type = 'INCOME' THEN t.amount ELSE 0 END)`.as('credit_total'),
        sql<number>`SUM(CASE WHEN a.type = 'EXPENSE' THEN t.amount ELSE 0 END)`.as('debit_total')
      ])
      .where('t.church_id', '=', session.user.church_id)
      .where('t.transaction_date', '<=', endDate) // 지정일까지의 총계
      .groupBy('t.account_code')
      .execute()

    // 3. 데이터 구성
    const results = accounts.map(acc => {
      const stat = stats.find(s => s.account_code === acc.code)
      const creditTotal = Number(stat?.credit_total || 0)
      const debitTotal = Number(stat?.debit_total || 0)
      
      let debitBalance = 0
      let creditBalance = 0

      // 잔액 계산 (수입 - 지출)
      const balance = creditTotal - debitTotal

      if (balance > 0) {
        creditBalance = balance
      } else {
        debitBalance = Math.abs(balance)
      }

      return {
        code: acc.code,
        name: acc.name,
        type: acc.type,
        level: acc.level,
        debitTotal,
        creditTotal,
        debitBalance,
        creditBalance
      }
    })

    return {
      success: true,
      data: results
    }

  } catch (error: any) {
    console.error('Fetch trial-balance error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '시산표 데이터를 집계하는 중 오류가 발생했습니다.'
    })
  }
})
