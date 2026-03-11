import { db } from '../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const fiscalYear = parseInt(query.year as string) || new Date().getFullYear()
  const type = (query.type as string) || 'INCOME'

  try {
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
      /* 
        자연스러운 계층형 숫자 정렬 로직:
        1. 코드의 첫 번째 숫자 뭉치(하이픈 전까지)를 10자리 0으로 채워 정렬 (60 -> 0000000060, 100 -> 0000000100)
        2. 그 안에서 레벨 순서로 정렬 (부모가 자식보다 위로)
        3. 전체 코드를 다시 한번 보정하여 정렬하여 자식들 간의 순서 보장
      */
      .orderBy(sql`LPAD(SPLIT_PART(a.code, '-', 1), 10, '0')`, 'asc')
      .orderBy('a.level', 'asc')
      .orderBy(sql`LPAD(a.code, 20, '0')`, 'asc')
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
