import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const removedDate = body.removedDate || new Date().toISOString().slice(0, 10)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: '성도 ID가 필요합니다.'
    })
  }

  try {
    await db.updateTable('members')
      .set({
        removed_date: new Date(removedDate),
        updated_at: new Date()
      })
      .where('id', '=', id)
      .execute()

    return { success: true }
  } catch (error: any) {
    console.error('Remove member error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '성도 제적 처리 중 오류가 발생했습니다.'
    })
  }
})
