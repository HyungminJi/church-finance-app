import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID가 필요합니다.' })

  try {
    const body = await readBody(event)
    
    const updated = await db.updateTable('pledge_campaigns')
      .set({
        name: body.name,
        description: body.description,
        start_date: body.start_date,
        end_date: body.end_date,
        target_amount: Number(body.target_amount),
        account_code: body.account_code,
        is_active: body.is_active,
        updated_at: new Date()
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow()

    return {
      success: true,
      data: updated
    }
  } catch (error: any) {
    console.error('Update campaign error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '캠페인 수정 중 오류가 발생했습니다.'
    })
  }
})
