import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID가 누락되었습니다.' })
  }

  try {
    const body = await readBody(event)
    
    // 1. 데이터 업데이트
    const result = await db.updateTable('funds')
      .set({
        name: body.name,
        bank_name: body.bank_name,
        account_number: body.account_number,
        book_type: body.book_type,
        category: body.category,
        initial_balance: body.initial_balance !== undefined ? Number(body.initial_balance) : undefined,
        description: body.description,
        is_active: body.is_active,
        updated_at: new Date()
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()

    if (!result) {
      throw createError({ statusCode: 404, statusMessage: '해당 자금 정보를 찾을 수 없습니다.' })
    }

    return {
      success: true,
      data: result
    }
  } catch (error: any) {
    console.error('Update fund error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '자금 정보 수정 중 오류가 발생했습니다.'
    })
  }
})
