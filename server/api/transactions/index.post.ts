import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const newTransaction = await db.insertInto('transactions').values(body).returningAll().executeTakeFirstOrThrow()
    return {
      success: true,
      data: newTransaction,
    }
  }
  catch (error) {
    console.error(error)
    return {
      success: false,
      error: 'Failed to create transaction',
    }
  }
})
