import { db } from '../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const fiscalYear = parseInt(query.year as string) || new Date().getFullYear()
  const type = (query.type as string) || 'INCOME'

  try {
    // 1. 모든 활성 계정과목 조회 (수입/지출 구분)
    // 2. 현재 연도 예산 조인
    // 3. 전년도 예산 조인
    const results = await db.selectFrom('accounts as a')
      .leftJoin('budgets as b_current', (join) => join
        .onRef('a.code', '=', 'b_current.account_code')
        .on('b_current.fiscal_year', '=', fiscalYear)
      )
      .leftJoin('budgets as b_last', (join) => join
        .onRef('a.code', '=', 'b_last.account_code')
        .on('b_last.fiscal_year', '=', fiscalYear - 1)
      )
      .select([
        'a.code',
        'a.name',
        'a.level',
        'a.parent_code',
        'a.type',
        sql<number>`COALESCE(b_current.amount, 0)`.as('thisYearBudget'),
        sql<number>`COALESCE(b_last.amount, 0)`.as('lastYearBudget')
      ])
      .where('a.type', '=', type)
      .where('a.is_active', '=', true)
      .orderBy('a.code', 'asc')
      .execute()

    return {
      success: true,
      data: results,
      meta: {
        fiscalYear,
        lastYear: fiscalYear - 1
      }
    }
  } catch (error: any) {
    console.error('Fetch budget error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '예산 데이터를 가져오는 중 오류가 발생했습니다.'
    })
  }
})
