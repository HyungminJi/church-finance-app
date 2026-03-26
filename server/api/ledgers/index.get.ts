import { db } from '../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  const startDate = query.startDate as string
  const endDate = query.endDate as string
  const accountCode = query.accountCode as string // 특정 계정코드 선택 시
  const fundId = query.fundId as string // 특정 자금(통장) 선택 시
  
  if (!startDate || !endDate) {
    throw createError({
      statusCode: 400,
      statusMessage: '조회 시작일(startDate)과 종료일(endDate)은 필수입니다.'
    })
  }

  try {
    // 1. 이월 잔액(조회 시작일 이전) 계산
    let previousBalanceQuery = db.selectFrom('transactions as t')
      .leftJoin('accounts as a', 't.account_code', 'a.code')
      .where('t.transaction_date', '<', startDate)
      
    if (accountCode) {
      previousBalanceQuery = previousBalanceQuery.where('t.account_code', '=', accountCode)
    }

    if (fundId) {
      previousBalanceQuery = previousBalanceQuery.where('t.fund_id', '=', fundId)
    }

    const prevResult = await previousBalanceQuery
      .select([
        sql<number>`COALESCE(SUM(CASE WHEN a.type = 'INCOME' THEN t.amount ELSE 0 END), 0)`.as('prev_income'),
        sql<number>`COALESCE(SUM(CASE WHEN a.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0)`.as('prev_expense')
      ])
      .executeTakeFirst()

    const prevIncome = Number(prevResult?.prev_income || 0)
    const prevExpense = Number(prevResult?.prev_expense || 0)
    let previousBalance = prevIncome - prevExpense

    // 2. 해당 기간 내의 트랜잭션 조회
    let txQuery = db.selectFrom('transactions as t')
      .leftJoin('accounts as a', 't.account_code', 'a.code')
      .leftJoin('donors as d', 't.donor_id', 'd.id')
      .where('t.transaction_date', '>=', startDate)
      .where('t.transaction_date', '<=', endDate)

    if (accountCode) {
      txQuery = txQuery.where('t.account_code', '=', accountCode)
    }

    if (fundId) {
      txQuery = txQuery.where('t.fund_id', '=', fundId)
    }

    const transactions = await txQuery
      .select([
        't.id',
        't.transaction_date',
        't.account_code',
        'a.name as account_name',
        'a.type as account_type',
        't.amount',
        't.description',
        'd.name as donor_name',
        'd.donor_type'
      ])
      .orderBy('t.transaction_date', 'asc')
      .orderBy('t.created_at', 'asc')
      .execute()

    // 3. 런타임 잔액 계산
    let currentBalance = previousBalance
    let totalIncome = 0
    let totalExpense = 0

    const formattedTransactions = transactions.map(tx => {
      const amount = Number(tx.amount)
      let income = 0
      let expense = 0

      if (tx.account_type === 'INCOME') {
        income = amount
        currentBalance += amount
        totalIncome += amount
      } else if (tx.account_type === 'EXPENSE') {
        expense = amount
        currentBalance -= amount
        totalExpense += amount
      }

      return {
        ...tx,
        income,
        expense,
        balance: currentBalance,
        date_str: new Date(tx.transaction_date).toISOString().split('T')[0]
      }
    })

    return {
      success: true,
      meta: {
        previous_balance: previousBalance,
        previous_income: prevIncome,
        previous_expense: prevExpense,
        period_income: totalIncome,
        period_expense: totalExpense,
        ending_balance: currentBalance
      },
      data: formattedTransactions
    }

  } catch (error: any) {
    console.error('Fetch ledger error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '장부 데이터를 가져오는 중 오류가 발생했습니다.'
    })
  }
})
