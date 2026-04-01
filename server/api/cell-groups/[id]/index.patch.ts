import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: '구역 ID가 필요합니다.'
    })
  }

  try {
    await db.updateTable('cell_groups')
      .set({
        name: body.name,
        leader_id: body.leader_id || null,
        parent_group: body.parent_group || null,
        is_active: body.is_active !== undefined ? body.is_active : true
      })
      .where('id', '=', id)
      .execute()

    return { success: true }
  } catch (error: any) {
    console.error('Update cell group error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '구역 정보 수정 중 오류가 발생했습니다.'
    })
  }
})
