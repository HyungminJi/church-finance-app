import { db } from '../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  try {
    const { fiscal_year } = getQuery(event)

    if (!fiscal_year) {
      return {
        success: false,
        error: 'Fiscal year is required',
      }
    }

    const summary = await db
      .selectFrom('budgets')
      .leftJoin('transactions', (join) =>
        join
          .onRef('budgets.account_code', '=', 'transactions.account_code')
          .on(sql`EXTRACT(YEAR FROM transactions.transaction_date) = ${fiscal_year}`)
      )
      .where('budgets.fiscal_year', '=', Number(fiscal_year))
      .select([
        'budgets.account_code',
        'budgets.amount as budget_amount',
        sql<bigint>`SUM(transactions.amount)`.as('actual_amount')
      ])
      .groupBy(['budgets.account_code', 'budgets.amount'])
      .execute()

    return {
      success: true,
      data: summary,
    }
  }
  catch (error) {
    console.error(error)
    return {
      success: false,
      error: 'Failed to fetch summary report',
    }
  }
})
