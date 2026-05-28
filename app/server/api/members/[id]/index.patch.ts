import { db } from '../../../utils/db'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: '성도 ID가 필요합니다.' })
  }

  try {
    await db.transaction().execute(async (trx) => {
      // 1. 성도 기본 정보 업데이트
      // JOIN이 있는 경우 set 절에서 컬럼명 지칭 방식 주의
      await trx.updateTable('members')
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
        .where(({ exists, selectFrom }) => 
          exists(
            selectFrom('donors as d')
              .whereRef('d.id', '=', 'members.donor_id')
              .$if(event.context.userRole !== 0, (qb) => qb.where('d.church_id', '=', event.context.churchId || session.user.church_id))
          )
        )
        .execute()

      // 2. 시스템 권한 관리 로직
      if (body.auth_action === 'GRANT') {
        const hashedPassword = await bcrypt.hash(body.new_password || '1234', 10)
        await trx.insertInto('users')
          .values({
            church_id: event.context.churchId || session.user.church_id,
            login_id: body.login_id,
            password_hash: hashedPassword,
            role: parseInt(body.user_role) || 4,
            member_id: id as any
          })
          .execute()
      } 
      else if (body.auth_action === 'REVOKE') {
        await trx.deleteFrom('users')
          .where('member_id', '=', id)
          .$if(event.context.userRole !== 0, (qb) => qb.where('church_id', '=', event.context.churchId || session.user.church_id))
          .execute()
      } 
      else if (body.auth_action === 'UPDATE' && body.user_role !== undefined) {
        await trx.updateTable('users')
          .set({ role: parseInt(body.user_role) })
          .where('member_id', '=', id)
          .$if(event.context.userRole !== 0, (qb) => qb.where('church_id', '=', event.context.churchId || session.user.church_id))
          .execute()
      }
    })

    return { success: true }
  } catch (error: any) {
    console.error('Update member error:', error)
    if (error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: '이미 사용 중인 아이디입니다.' })
    }
    throw createError({ statusCode: 500, statusMessage: '성도 정보 수정 중 오류가 발생했습니다.' })
  }
})
