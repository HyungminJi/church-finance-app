import { db } from '../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  const startDate = query.startDate as string
  const endDate = query.endDate as string
  const accountCode = query.accountCode as string
  const type = query.type as string // INCOME, EXPENSE 등
  
  if (!startDate || !endDate) {
    throw createError({
      statusCode: 400,
      statusMessage: '조회 시작일(startDate)과 종료일(endDate)은 필수입니다.'
    })
  }

  const fiscalYear = parseInt(startDate.substring(0, 4))
  // 이월 기준: 보통 해당 연도의 1월 1일부터 startDate 이전까지의 누적을 "이월"로 볼지,
  // 아니면 "과거 전체"부터 startDate 이전까지 누적을 볼지 결정해야 합니다.
  // 재정 보고에서는 당해 연도 1월 1일부터의 누적 이월(전월 이월 등)을 많이 씁니다.
  // 여기서는 시스템 전체 누적 이월을 하거나 당해 연도 이월을 할 수 있습니다. 당해 연도 1.1부터 startDate 전일까지로 합시다.
  const startOfYear = `${fiscalYear}-01-01`

  try {
    let baseQuery = db.selectFrom('accounts as a')
      .leftJoin('budgets as b', join => 
        join.onRef('a.code', '=', 'b.account_code')
            .on('b.fiscal_year', '=', fiscalYear)
      )
      .where('a.is_active', '=', true)

    if (accountCode) {
      baseQuery = baseQuery.where('a.code', '=', accountCode)
    }
    if (type && type !== 'ALL') {
      baseQuery = baseQuery.where('a.type', '=', type as any)
    }

    // 하위 계정이 없는(최하위) 계정만 트랜잭션이 발생하므로 필터링할지 여부
    // 여기서는 일단 트랜잭션이 매핑되는 코드만 집계

    const accountsData = await baseQuery
      .select([
        'a.code',
        'a.name',
        'a.type',
        sql<number>`COALESCE(b.amount, 0)`.as('budget')
      ])
      .orderBy('a.code', 'asc')
      .execute()

    // 1. 기간 내 트랜잭션 집계
    const periodQuery = db.selectFrom('transactions as t')
      .select([
        't.account_code',
        sql<number>`SUM(t.amount)`.as('period_amount')
      ])
      .where('t.transaction_date', '>=', startDate)
      .where('t.transaction_date', '<=', endDate)
      .groupBy('t.account_code')

    // 2. 이월 트랜잭션 (당해 연도 시작일 ~ startDate 이전) 집계
    const carryQuery = db.selectFrom('transactions as t')
      .select([
        't.account_code',
        sql<number>`SUM(t.amount)`.as('carry_amount')
      ])
      .where('t.transaction_date', '>=', startOfYear)
      .where('t.transaction_date', '<', startDate)
      .groupBy('t.account_code')

    const [periodRows, carryRows] = await Promise.all([
      periodQuery.execute(),
      carryQuery.execute()
    ])

    const periodMap = new Map(periodRows.map(r => [r.account_code, Number(r.period_amount || 0)]))
    const carryMap = new Map(carryRows.map(r => [r.account_code, Number(r.carry_amount || 0)]))

    // 데이터 병합 및 계산
    const result = accountsData.map(acc => {
      const budget = Number(acc.budget)
      const carryAmount = carryMap.get(acc.code) || 0
      const periodAmount = periodMap.get(acc.code) || 0
      
      let carryDebit = 0
      let carryCredit = 0
      let monthlyDebit = 0
      let monthlyCredit = 0

      // 수입은 대변(Credit), 지출은 차변(Debit)으로 기록 (단식부기를 복식뷰로 보여줄 때)
      if (acc.type === 'INCOME') {
        carryCredit = carryAmount
        monthlyCredit = periodAmount
      } else if (acc.type === 'EXPENSE') {
        carryDebit = carryAmount
        monthlyDebit = periodAmount
      }

      const totalDebit = carryDebit + monthlyDebit
      const totalCredit = carryCredit + monthlyCredit
      
      const totalExec = carryAmount + periodAmount // 집행 누계
      const rate = budget > 0 ? ((totalExec / budget) * 100).toFixed(1) : '0.0'
      const balance = budget > 0 ? (budget - totalExec) : (totalExec * -1) // 수입은 목표대비 초과/미달, 지출은 예산 잔액 등

      return {
        code: acc.code,
        name: acc.name,
        type: acc.type,
        budget,
        carryDebit,
        carryCredit,
        monthlyDebit,
        monthlyCredit,
        totalExec,
        rate,
        totalDebit,
        totalCredit,
        balance
      }
    })

    // 금액이 있거나 예산이 있는 항목만 필터링 (선택적)
    const filteredResult = result.filter(r => 
      r.budget > 0 || r.totalExec > 0
    )

    return {
      success: true,
      data: filteredResult
    }
  } catch (error: any) {
    console.error('Fetch total-account ledger error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '총계정원장 데이터를 가져오는 중 오류가 발생했습니다.'
    })
  }
})
