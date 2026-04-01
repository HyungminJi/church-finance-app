import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    await db.transaction().execute(async (trx) => {
      // 1. 도너 수퍼타입 레코드 생성
      const donor = await trx.insertInto('donors')
        .values({
          donor_type: 'MEMBER',
          name: body.name
        })
        .returning('id')
        .executeTakeFirstOrThrow()

      // 2. 성도 서브타입 레코드 생성
      await trx.insertInto('members')
        .values({
          donor_id: donor.id,
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
    })

    return { success: true }
  } catch (error: any) {
    console.error('Create member error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '성도 등록 중 오류가 발생했습니다.'
    })
  }
})
