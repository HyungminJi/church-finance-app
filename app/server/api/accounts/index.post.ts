import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    if (!body.code || !body.name || !body.type) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields',
      })
    }

    const newAccount = await db.insertInto('accounts')
      .values({
        code: body.code,
        name: body.name,
        type: body.type,
        parent_code: body.parent_code || null,
        level: body.level || 1,
        is_active: body.is_active !== undefined ? body.is_active : true
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    return {
      success: true,
      data: newAccount,
    }
  }
  catch (error: any) {
    console.error('API Error:', error)
    return {
      success: false,
      error: error.message || 'Failed to create account',
    }
  }
})
