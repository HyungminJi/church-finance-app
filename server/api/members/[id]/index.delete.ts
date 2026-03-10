import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: '성도 ID가 필요합니다.'
    })
  }

  try {
    await db.deleteFrom('members')
      .where('id', '=', id)
      .execute()

    return { success: true }
  } catch (error: any) {
    console.error('Delete member error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '성도 삭제 중 오류가 발생했습니다.'
    })
  }
})
