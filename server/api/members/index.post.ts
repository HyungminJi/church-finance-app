import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    await db.insertInto('members')
      .values({
        name: body.name,
        phone_number: body.phone_number,
        spouse_name: body.spouse_name,
        birth_date: body.birth_date ? new Date(body.birth_date) : null,
        email: body.email,
        address: body.address,
        postcode: body.postcode,
        detail_address: body.detail_address,
        church_role: body.church_role,
        cell_group_id: body.cell_group_id
      })
      .execute()

    return { success: true }
  } catch (error: any) {
    console.error('Create member error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '성도 등록 중 오류가 발생했습니다.'
    })
  }
})
