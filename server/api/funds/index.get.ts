import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const funds = await db.selectFrom('funds')
      .selectAll()
      .where('is_active', '=', true)
      .orderBy('created_at', 'asc')
      .execute()
    
    return {
      success: true,
      data: funds
    }
  } catch (error: any) {
    console.error('Fetch funds error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '자금 목록을 가져오는 중 오류가 발생했습니다.'
    })
  }
})
