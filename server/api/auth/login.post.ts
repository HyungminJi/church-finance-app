import bcrypt from 'bcryptjs'
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { login_id, password } = body

  if (!login_id || !password) {
    throw createError({
      statusCode: 400,
      message: '아이디와 비밀번호를 모두 입력해 주세요.'
    })
  }

  try {
    // 1. 유저 기본 정보 및 비밀번호 해시 조회
    const userBase = await db.selectFrom('users')
      .select(['id', 'password_hash', 'is_active', 'role'])
      .where('login_id', '=', login_id)
      .executeTakeFirst()

    if (!userBase || !userBase.is_active) {
      throw createError({
        statusCode: 401,
        message: '아이디 또는 비밀번호가 일치하지 않습니다.'
      })
    }

    const isMatch = await bcrypt.compare(password, userBase.password_hash)
    if (!isMatch) {
      throw createError({
        statusCode: 401,
        message: '아이디 또는 비밀번호가 일치하지 않습니다.'
      })
    }

    // 2. 세션에 담을 상세 정보 조회 (users 기준 LEFT JOIN)
    const userDetail = await db.selectFrom('users')
      .leftJoin('members', 'users.member_id', 'members.id')
      .leftJoin('common_codes as cc1', (join) => join
        .onRef('members.church_role', '=', 'cc1.code')
        .on('cc1.group_code', '=', 'CHURCH_ROLE')
      )
      .leftJoin('common_codes as cc2', (join) => join
        .onRef('users.role', '=', 'cc2.code')
        .on('cc2.group_code', '=', 'SYS_ROLE')
      )
      .select([
        'users.id',
        'users.login_id',
        'users.role',
        'members.name as member_name',
        'cc1.name as church_role_name',
        'cc2.name as sys_role_name'
      ])
      .where('users.id', '=', userBase.id)
      .executeTakeFirst()

    // 세션 설정 (nuxt-auth-utils)
    await setUserSession(event, {
      user: {
        id: userDetail?.id || userBase.id,
        login_id: userDetail?.login_id || login_id,
        name: userDetail?.member_name || '관리자',
        role: userBase.role,
        church_role_name: userDetail?.church_role_name || null,
        sys_role_name: userDetail?.sys_role_name || (userBase.role === 1 ? '최고관리자' : '사용자')
      },
      loggedInAt: new Date()
    })

    // 마지막 로그인 일시 업데이트
    await db.updateTable('users')
      .set({ last_login_at: new Date() })
      .where('id', '=', userBase.id)
      .execute()

    return { success: true }
  } catch (error: any) {
    console.error('Login error details:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '로그인 처리 중 오류가 발생했습니다.'
    })
  }
})
