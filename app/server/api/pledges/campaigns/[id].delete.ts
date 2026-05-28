import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID가 필요합니다.' })

  try {
    const deleted = await db.deleteFrom('pledge_campaigns')
      .where('id', '=', id)
      .$if(event.context.userRole !== 0, (qb) => qb.where('church_id', '=', event.context.churchId || session.user.church_id))
      .returningAll()
      .executeTakeFirstOrThrow()

    return {
      success: true,
      data: deleted
    }
  } catch (error: any) {
    console.error('Delete campaign error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '캠페인 삭제 중 오류가 발생했습니다.'
    })
  }
})
