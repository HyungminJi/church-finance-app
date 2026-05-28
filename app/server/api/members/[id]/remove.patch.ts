import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
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
      .where(({ exists, selectFrom }) => 
        exists(
          selectFrom('donors as d')
            .whereRef('d.id', '=', 'members.donor_id')
            .$if(event.context.userRole !== 0, (qb) => qb.where('d.church_id', '=', event.context.churchId || session.user.church_id))
        )
      )
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
