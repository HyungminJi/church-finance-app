import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: '성도 ID가 필요합니다.'
    })
  }

  try {
    await db.updateTable('members')
      .set({
        name: body.name,
        phone_number: body.phone_number,
        spouse_name: body.spouse_name,
        birth_date: body.birth_date ? new Date(body.birth_date) : null,
        email: body.email,
        address: body.address,
        postcode: body.postcode,
        detail_address: body.detail_address,
        church_role: body.church_role,
        cell_group_id: body.cell_group_id,
        updated_at: new Date()
      })
      .where('id', '=', id)
      .execute()

    return { success: true }
  } catch (error: any) {
    console.error('Update member error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '성도 정보 수정 중 오류가 발생했습니다.'
    })
  }
})
