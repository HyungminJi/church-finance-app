import { db } from '../../utils/db'
import { sql } from 'kysely'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { donor_type, name, details, auth_action, login_id, new_password, user_role, user_id } = body

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
        .$if(event.context.userRole !== 0, (qb) => qb.where('church_id', '=', event.context.churchId || session.user.church_id))
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
            postcode: details.postcode,
            address: details.address,
            detail_address: details.detail_address,
            updated_at: new Date()
          })
          .where('donor_id', '=', id)
          .where(({ exists, selectFrom }) => 
            exists(
              selectFrom('donors as d')
                .whereRef('d.id', '=', 'members.donor_id')
                .$if(event.context.userRole !== 0, (qb) => qb.where('d.church_id', '=', event.context.churchId || session.user.church_id))
            )
          )
          .execute()
          
        // 3. 권한 액션(GRANT, UPDATE, REVOKE) 처리
        if (auth_action && user_role !== undefined && Number(user_role) === 0) {
          throw createError({
            statusCode: 403,
            statusMessage: '본사 계정(Master) 권한은 성도에게 부여할 수 없습니다.'
          })
        }

        if (auth_action === 'GRANT' && login_id && new_password && user_role !== undefined) {
          const hashedPassword = await bcrypt.hash(new_password, 10)
          const memberRes = await trx.selectFrom('members')
            .innerJoin('donors', 'members.donor_id', 'donors.id')
            .select(['members.id', 'donors.church_id'])
            .where('donors.id', '=', id)
            .executeTakeFirst()
            
          if (memberRes) {
            await trx.insertInto('users')
              .values({
                id: sql`gen_random_uuid()`,
                church_id: memberRes.church_id,
                member_id: memberRes.id,
                login_id: login_id,
                password_hash: hashedPassword,
                role: Number(user_role),
                is_active: true
              })
              .execute()
              
            await trx.updateTable('members').set({ is_user: true }).where('donor_id', '=', id).execute()
          }
        } else if (auth_action === 'UPDATE' && user_id) {
          const updateData: any = { role: Number(user_role) }
          if (new_password) {
            updateData.password_hash = await bcrypt.hash(new_password, 10)
          }
          await trx.updateTable('users').set(updateData).where('id', '=', user_id).execute()
        } else if (auth_action === 'REVOKE' && user_id) {
          await trx.deleteFrom('users').where('id', '=', user_id).execute()
          await trx.updateTable('members').set({ is_user: false }).where('donor_id', '=', id).execute()
        }
      } else if (donor_type === 'CELL_GROUP') {
        await trx.updateTable('cell_groups')
          .set({
            name: name,
            leader_id: details.leader_id,
            parent_group: details.parent_group,
            is_active: details.is_active ?? true
          })
          .where('donor_id', '=', id)
          .where(({ exists, selectFrom }) => 
            exists(
              selectFrom('donors as d')
                .whereRef('d.id', '=', 'cell_groups.donor_id')
                .$if(event.context.userRole !== 0, (qb) => qb.where('d.church_id', '=', event.context.churchId || session.user.church_id))
            )
          )
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
          .where(({ exists, selectFrom }) => 
            exists(
              selectFrom('donors as d')
                .whereRef('d.id', '=', 'organizations.donor_id')
                .$if(event.context.userRole !== 0, (qb) => qb.where('d.church_id', '=', event.context.churchId || session.user.church_id))
            )
          )
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
