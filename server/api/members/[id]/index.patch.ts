import { db } from '../../../utils/db'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: '성도 ID가 필요합니다.' })
  }

  try {
    await db.transaction().execute(async (trx) => {
      // 1. 성도 기본 정보 업데이트
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
        .execute()

      // 2. 시스템 권한 관리 로직
      if (body.auth_action === 'GRANT') {
        // 유저 계정 신규 생성
        const hashedPassword = await bcrypt.hash(body.new_password || '1234', 10)
        await trx.insertInto('users')
          .values({
            login_id: body.login_id,
            password_hash: hashedPassword,
            role: parseInt(body.user_role) || 4,
            member_id: id as any
          })
          .execute()
      } 
      else if (body.auth_action === 'REVOKE') {
        // 유저 계정 삭제
        await trx.deleteFrom('users')
          .where('member_id', '=', id)
          .execute()
      } 
      else if (body.auth_action === 'UPDATE' && body.user_role !== undefined) {
        // 기존 유저 권한만 변경
        await trx.updateTable('users')
          .set({ role: parseInt(body.user_role) })
          .where('member_id', '=', id)
          .execute()
      }
    })

    return { success: true }
  } catch (error: any) {
    console.error('Update member error:', error)
    if (error.code === '23505') { // Unique violation
      throw createError({ statusCode: 409, statusMessage: '이미 사용 중인 아이디입니다.' })
    }
    throw createError({ statusCode: 500, statusMessage: '성도 정보 수정 중 오류가 발생했습니다.' })
  }
})
