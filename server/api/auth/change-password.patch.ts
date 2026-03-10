import bcrypt from 'bcryptjs'
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  // 1. 세션 확인
  const session = await getUserSession(event)
  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: '로그인이 필요합니다.'
    })
  }

  const body = await readBody(event)
  const { currentPassword, newPassword } = body

  if (!currentPassword || !newPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: '현재 비밀번호와 새 비밀번호를 모두 입력해 주세요.'
    })
  }

  // 2. DB에서 현재 사용자 정보 조회
  const user = await db.selectFrom('users')
    .select(['id', 'password_hash'])
    .where('id', '=', session.user.id)
    .executeTakeFirst()

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: '사용자 정보를 찾을 수 없습니다.'
    })
  }

  // 3. 현재 비밀번호 검증
  const isCorrect = await bcrypt.compare(currentPassword, user.password_hash)
  if (!isCorrect) {
    throw createError({
      statusCode: 400,
      statusMessage: '현재 비밀번호가 일치하지 않습니다.'
    })
  }

  // 4. 새 비밀번호 해싱 및 업데이트
  const newPasswordHash = await bcrypt.hash(newPassword, 10)
  
  try {
    await db.updateTable('users')
      .set({ password_hash: newPasswordHash })
      .where('id', '=', user.id)
      .execute()

    return { success: true, message: '비밀번호가 성공적으로 변경되었습니다.' }
  } catch (error: any) {
    console.error('Change password error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '비밀번호 변경 중 오류가 발생했습니다.'
    })
  }
})
