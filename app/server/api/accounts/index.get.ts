import { sql } from 'kysely'
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  try {
    const accounts = await db.selectFrom('accounts')
      .selectAll()
      .where('church_id', '=', session.user.church_id)
      .orderBy(sql`CAST(NULLIF(regexp_replace(code, '[^0-9]', '', 'g'), '') AS INTEGER) ASC NULLS LAST`)
      .execute()
    return {
      success: true,
      data: accounts,
    }
  }
  catch (error: any) {
    console.error(error)
    return {
      success: false,
      error: error.message || 'Failed to fetch accounts',
    }
  }
})
