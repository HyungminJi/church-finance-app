import bcrypt from 'bcryptjs'
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  // 관리자 권한 확인 (role: 1 또는 2)
  const session = await getUserSession(event)
  if (!session?.user || session.user.role > 2) {
    throw createError({
      statusCode: 403,
      statusMessage: '사용자 등록 권한이 없습니다. (관리자 전용)'
    })
  }

  const body = await readBody(event)
  const { member_id, login_id, password, role } = body

  if (!member_id || !login_id || !password || !role) {
    throw createError({
      statusCode: 400,
      statusMessage: '필수 입력 항목이 누락되었습니다.'
    })
  }

  // 관리자(2)는 최고관리자(1) 권한을 부여할 수 없음
  if (session.user.role === 2 && Number(role) === 1) {
    throw createError({
      statusCode: 403,
      statusMessage: '관리자는 최고관리자 권한을 부여할 수 없습니다.'
    })
  }

  // 중복 아이디 확인
  const existingUser = await db.selectFrom('users')
    .select('id')
    .where('login_id', '=', login_id)
    .executeTakeFirst()

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: '이미 사용 중인 아이디입니다.'
    })
  }

  // 성도 정보 조회
  const member = await db.selectFrom('members')
    .selectAll()
    .where('id', '=', member_id)
    .executeTakeFirst()

  if (!member) {
    throw createError({
      statusCode: 404,
      statusMessage: '해당 성도 정보를 찾을 수 없습니다.'
    })
  }

  // 비밀번호 해싱
  const password_hash = await bcrypt.hash(password, 10)

  try {
    const result = await db.transaction().execute(async (trx) => {
      const newUser = await trx.insertInto('users')
        .values({
          login_id,
          password_hash,
          role: Number(role),
          member_id: member.id,
          is_active: true
        })
        .returning(['id', 'login_id'])
        .executeTakeFirst()

      // 성도 정보에 사용자 여부 업데이트
      await trx.updateTable('members')
        .set({ is_user: true })
        .where('id', '=', member.id)
        .execute()

      return newUser
    })

    return {
      success: true,
      user: {
        ...result,
        name: member.name // 응답에는 성도 이름을 포함시켜서 프론트에 전달
      }
    }
  } catch (error: any) {
    console.error('User registration error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '사용자 등록 중 오류가 발생했습니다.'
    })
  }
})
