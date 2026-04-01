import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { donor_type, name, details } = body

  if (!id || !donor_type || !name) {
    throw createError({ statusCode: 400, statusMessage: '필수 정보가 누락되었습니다.' })
  }

  try {
    await db.transaction().execute(async (trx) => {
      // 1. 최상위 donors 테이블 업데이트
      await trx.updateTable('donors')
        .set({
          name,
          // donor_type은 변경하지 않는 것이 원칙이나 필요시 수정 가능하도록 구성
        })
        .where('id', '=', id)
        .execute()

      // 2. 타입에 따라 하위 테이블 상세 정보 업데이트
      if (donor_type === 'MEMBER') {
        await trx.updateTable('members')
          .set({
            name: name,
            phone_number: details.phone_number,
            spouse_name: details.spouse_name,
            birth_date: details.birth_date ? new Date(details.birth_date) : null,
            email: details.email,
            church_role: details.church_role,
            cell_group_id: details.cell_group_id,
            updated_at: new Date()
          })
          .where('donor_id', '=', id)
          .execute()
      } else if (donor_type === 'CELL_GROUP') {
        await trx.updateTable('cell_groups')
          .set({
            name: name,
            leader_id: details.leader_id,
            parent_group: details.parent_group,
            is_active: details.is_active ?? true
          })
          .where('donor_id', '=', id)
          .execute()
      } else if (donor_type === 'ORGANIZATION') {
        await trx.updateTable('organizations')
          .set({
            name: name,
            org_type: details.org_type,
            contact_info: details.contact_info,
            description: details.description,
            is_active: details.is_active ?? true
          })
          .where('donor_id', '=', id)
          .execute()
      }
    })

    return { success: true }

  } catch (error: any) {
    console.error('Update donor error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '헌금자 정보 수정 중 오류가 발생했습니다.'
    })
  }
})
