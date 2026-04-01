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
    const result = await db.transaction().execute(async (trx) => {
      // 1. 도너 수퍼타입 레코드 생성
      const donor = await trx.insertInto('donors')
        .values({
          donor_type: 'CELL_GROUP',
          name: body.name
        })
        .returning('id')
        .executeTakeFirstOrThrow()

      // 2. 구역 서브타입 레코드 생성
      return await trx.insertInto('cell_groups')
        .values({
          donor_id: donor.id,
          name: body.name,
          leader_id: body.leader_id || null,
          parent_group: body.parent_group || null,
          is_active: body.is_active !== undefined ? body.is_active : true
        })
        .returningAll()
        .executeTakeFirstOrThrow()
    })

    return {
      success: true,
      data: result
    }
  } catch (error: any) {
    console.error('Create cell group error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '구역 등록 중 오류가 발생했습니다.'
    })
  }
})
