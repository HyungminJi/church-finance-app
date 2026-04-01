import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID가 필요합니다.' })

  try {
    const deleted = await db.deleteFrom('member_pledges')
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow()

    return {
      success: true,
      data: deleted
    }
  } catch (error: any) {
    console.error('Delete member pledge error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '약정 내역 삭제 중 오류가 발생했습니다.'
    })
  }
})
