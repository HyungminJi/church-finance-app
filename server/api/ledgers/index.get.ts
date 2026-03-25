import { db } from '../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  const startDate = query.startDate as string
  const endDate = query.endDate as string
  const accountCode = query.accountCode as string // 특정 계정코드 선택 시
  
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
      // 특정 계정인 경우 해당 계정의 총합만 계산 (단식부기에서 수입은 +, 지출은 +로 저장되지만 잔액은 수입-지출)
      previousBalanceQuery = previousBalanceQuery.where('t.account_code', '=', accountCode)
    }

    const prevResult = await previousBalanceQuery
      .select([
        sql<number>`COALESCE(SUM(CASE WHEN a.type = 'INCOME' THEN t.amount ELSE 0 END), 0)`.as('prev_income'),
        sql<number>`COALESCE(SUM(CASE WHEN a.type = 'EXPENSE' THEN t.amount ELSE 0 END), 0)`.as('prev_expense')
      ])
      .executeTakeFirst()

    const prevIncome = Number(prevResult?.prev_income || 0)
    const prevExpense = Number(prevResult?.prev_expense || 0)
    // 계정에 상관없이 잔액은 수입 누적 - 지출 누적
    let previousBalance = prevIncome - prevExpense

    // 단, 지출 전용 계정만 조회할 때는 누적 지출액을 잔액으로 표기하는 것이 자연스러울 수 있으나
    // 일반적인 단식부기 원장에서는 "전체 현금 잔액" 또는 "해당 계정의 발생 누적"을 의미합니다.
    // 여기서는 수입-지출을 기본 잔액으로 하되 클라이언트에서 유연하게 사용할 수 있도록 값을 모두 넘겨줍니다.

    // 2. 해당 기간 내의 트랜잭션 조회
    let txQuery = db.selectFrom('transactions as t')
      .leftJoin('accounts as a', 't.account_code', 'a.code')
      .leftJoin('donors as d', 't.donor_id', 'd.id')
      .where('t.transaction_date', '>=', startDate)
      .where('t.transaction_date', '<=', endDate)

    if (accountCode) {
      txQuery = txQuery.where('t.account_code', '=', accountCode)
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
      .orderBy('t.transaction_date', 'asc') // 시간순 정렬 (원장 표시용)
      .orderBy('t.created_at', 'asc')
      .execute()

    // 3. 런타임 잔액 계산 (서버에서 미리 계산하여 전달)
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
