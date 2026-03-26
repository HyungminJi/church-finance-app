import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // 1. 필수 유효성 검사
    if (!body.name) {
      throw createError({ statusCode: 400, statusMessage: '자금명은 필수 입력 항목입니다.' })
    }

    // 2. 데이터 삽입
    const result = await db.insertInto('funds')
      .values({
        name: body.name,
        bank_name: body.bank_name || null,
        account_number: body.account_number || null,
        book_type: body.book_type || '재정부',
        category: body.category || null,
        initial_balance: Number(body.initial_balance || 0),
        description: body.description || null,
        is_active: body.is_active ?? true
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    return {
      success: true,
      data: result
    }
  } catch (error: any) {
    console.error('Create fund error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '자금 등록 중 오류가 발생했습니다.'
    })
  }
})
