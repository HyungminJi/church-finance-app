import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.name) {
    throw createError({
      statusCode: 400,
      statusMessage: '구역명은 필수 입력 항목입니다.'
    })
  }

  try {
    const newGroup = await db.insertInto('cell_groups')
      .values({
        name: body.name,
        leader_id: body.leader_id || null,
        parent_group: body.parent_group || null,
        is_active: body.is_active !== undefined ? body.is_active : true
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    return {
      success: true,
      data: newGroup
    }
  } catch (error: any) {
    console.error('Create cell group error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '구역 등록 중 오류가 발생했습니다.'
    })
  }
})
