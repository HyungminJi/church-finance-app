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
    // 1. 자산(FUNDS) 데이터 조회 및 집계
    // 가이드에 따라 accounts 테이블과 조인하여 INCOME은 더하고 EXPENSE는 빼도록 수정
    const funds = await db.selectFrom('funds')
      .select(['id', 'name', 'bank_name', 'initial_balance'])
      .where('church_id', '=', session.user.church_id)
      .execute()

    const fundStats = await db.selectFrom('transactions as t')
      .innerJoin('accounts as a', 't.account_code', 'a.code')
      .select([
        't.fund_id',
        // 수입 합계 (차변 입금)
        sql<number>`SUM(CASE WHEN a.type = 'INCOME' THEN t.amount ELSE 0 END)`.as('in_total'),
        // 지출 합계 (대변 출금)
        sql<number>`SUM(CASE WHEN a.type = 'EXPENSE' THEN t.amount ELSE 0 END)`.as('out_total')
      ])
      .where('t.church_id', '=', session.user.church_id)
      .where('t.transaction_date', '<=', endDate)
      .groupBy('t.fund_id')
      .execute()

    const assetResults = funds.map(f => {
      const stat = fundStats.find(s => s.fund_id === f.id)
      const inTotal = Number(stat?.in_total || 0)
      const outTotal = Number(stat?.out_total || 0)
      const initial = Number(f.initial_balance || 0)
      
      // 자산 차변 합계 = 기초잔액 + 총입금액
      const debitTotal = initial + inTotal
      // 자산 대변 합계 = 총출금액
      const creditTotal = outTotal
      // 자산 잔액 = 차변 - 대변
      const debitBalance = debitTotal - creditTotal

      return {
        code: `ASSET-${f.id.substring(0, 4)}`,
        name: f.bank_name ? `${f.bank_name} (${f.name})` : f.name,
        type: 'ASSET',
        level: 2,
        debitTotal,
        creditTotal,
        debitBalance,
        creditBalance: 0
      }
    })

    // 2. 수입/지출(ACCOUNTS) 데이터 조회 및 집계
    const accounts = await db.selectFrom('accounts')
      .select(['code', 'name', 'type', 'level'])
      .where('church_id', '=', session.user.church_id)
      .where('is_active', '=', true)
      .orderBy(sql`LPAD(SPLIT_PART(code, '-', 1), 10, '0')`, 'asc')
      .orderBy('level', 'asc')
      .orderBy(sql`LPAD(code, 20, '0')`, 'asc')
      .execute()

    const accountStats = await db.selectFrom('transactions')
      .select([
        'account_code',
        sql<number>`SUM(amount)`.as('total_amount') // transactions.amount는 항상 양수이므로 ABS 불필요
      ])
      .where('church_id', '=', session.user.church_id)
      .where('transaction_date', '<=', endDate)
      .groupBy('account_code')
      .execute()

    const incomeExpenseResults = accounts.map(acc => {
      const stat = accountStats.find(s => s.account_code === acc.code)
      const totalAmount = Number(stat?.total_amount || 0)
      
      if (acc.type === 'INCOME') {
        return {
          code: acc.code,
          name: acc.name,
          type: acc.type,
          level: acc.level,
          debitTotal: 0,
          creditTotal: totalAmount,
          debitBalance: 0,
          creditBalance: totalAmount
        }
      } else {
        return {
          code: acc.code,
          name: acc.name,
          type: acc.type,
          level: acc.level,
          debitTotal: totalAmount,
          creditTotal: 0,
          debitBalance: totalAmount,
          creditBalance: 0
        }
      }
    })

    // 3. 최종 데이터 통합 (자산 -> 수입 -> 지출 순)
    const finalData = [...assetResults, ...incomeExpenseResults]

    // 4. 교회 정보 조회
    const church = await db.selectFrom('churches')
      .selectAll()
      .where('id', '=', session.user.church_id)
      .executeTakeFirst()

    return {
      success: true,
      data: finalData,
      church
    }

  } catch (error: any) {
    console.error('Fetch trial-balance error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '시산표 데이터를 집계하는 중 오류가 발생했습니다.'
    })
  }
})
