import bcrypt from 'bcryptjs'
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { login_id, name, phone_number, newPassword } = body

  if (!login_id || !name || !phone_number || !newPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: '모든 정보를 입력해 주세요.'
    })
  }

  // 1. 사용자 및 연결된 성도 정보 조회
  const user = await db.selectFrom('users')
    .innerJoin('members', 'users.member_id', 'members.id')
    .select(['users.id', 'members.name', 'members.phone_number'])
    .where('users.login_id', '=', login_id)
    .executeTakeFirst()

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: '일치하는 사용자 정보를 찾을 수 없습니다.'
    })
  }

  // 2. 본인 확인 (이름과 전화번호 대조)
  // 하이픈 제거 후 비교하여 입력 편의성 제공
  const dbPhone = user.phone_number.replace(/[^0-9]/g, '')
  const inputPhone = phone_number.replace(/[^0-9]/g, '')

  if (user.name !== name || dbPhone !== inputPhone) {
    throw createError({
      statusCode: 400,
      statusMessage: '입력하신 정보가 성도 등록 정보와 일치하지 않습니다.'
    })
  }

  // 3. 새 비밀번호 해싱 및 업데이트
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  try {
    await db.updateTable('users')
      .set({ password_hash: hashedPassword })
      .where('id', '=', user.id)
      .execute()

    return { success: true, message: '비밀번호가 성공적으로 재설정되었습니다.' }
  } catch (error: any) {
    console.error('Password reset error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '비밀번호 재설정 중 오류가 발생했습니다.'
    })
  }
})
