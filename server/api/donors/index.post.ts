import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { donor_type, name, details } = body

  if (!donor_type || !name) {
    throw createError({ statusCode: 400, statusMessage: '필수 정보(유형, 이름)가 누락되었습니다.' })
  }

  try {
    const result = await db.transaction().execute(async (trx) => {
      // 1. 최상위 donors 테이블 생성
      const donor = await trx.insertInto('donors')
        .values({
          donor_type,
          name
        })
        .returningAll()
        .executeTakeFirstOrThrow()

      // 2. 타입에 따라 하위 테이블 상세 정보 생성
      if (donor_type === 'MEMBER') {
        await trx.insertInto('members')
          .values({
            donor_id: donor.id,
            name: name,
            phone_number: details.phone_number || '',
            spouse_name: details.spouse_name,
            birth_date: details.birth_date ? new Date(details.birth_date) : null,
            email: details.email,
            church_role: details.church_role,
            cell_group_id: details.cell_group_id
          })
          .execute()
      } else if (donor_type === 'CELL_GROUP') {
        await trx.insertInto('cell_groups')
          .values({
            donor_id: donor.id,
            name: name,
            leader_id: details.leader_id
          })
          .execute()
      } else if (donor_type === 'ORGANIZATION') {
        await trx.insertInto('organizations')
          .values({
            donor_id: donor.id,
            name: name,
            org_type: details.org_type,
            contact_info: details.contact_info,
            description: details.description,
            is_active: details.is_active ?? true
          })
          .execute()
      }

      return donor
    })

    return {
      success: true,
      data: result
    }

  } catch (error: any) {
    console.error('Create donor error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '헌금자 등록 중 오류가 발생했습니다.'
    })
  }
})
