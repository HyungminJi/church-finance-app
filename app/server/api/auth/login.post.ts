import bcrypt from 'bcryptjs'
import { db } from '../../utils/db'
import { UserRole, ROLE_META, SYSTEM_CHURCH_ID } from '../../../types/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { login_id, password } = body

  if (!login_id || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: '아이디와 비밀번호를 모두 입력해 주세요.'
    })
  }

  try {
    // 1. 유저 기본 정보 및 비밀번호 해시 조회
    const userBase = await db.selectFrom('users')
      .select(['id', 'password_hash', 'is_active', 'role', 'church_id'])
      .where('login_id', '=', login_id)
      .executeTakeFirst()

    if (!userBase || !userBase.is_active) {
      console.log('Login failed: user not found or inactive', { login_id })
      throw createError({
        statusCode: 401,
        statusMessage: '아이디 또는 비밀번호가 일치하지 않습니다.'
      })
    }

    const isMatch = await bcrypt.compare(password, userBase.password_hash)
    if (!isMatch) {
      console.log('Login failed: password mismatch', { login_id })
      throw createError({
        statusCode: 401,
        statusMessage: '아이디 또는 비밀번호가 일치하지 않습니다.'
      })
    }

    // 2. 세션에 담을 상세 정보 조회 (users 기준 LEFT JOIN)
    const userDetail = await db.selectFrom('users')
      .leftJoin('members', 'users.member_id', 'members.id')
      .leftJoin('common_codes as cc1', (join) => join
        .onRef('members.church_role', '=', 'cc1.code')
        .on('cc1.group_code', '=', 'CHURCH_ROLE')
      )
      .select([
        'users.id',
        'users.login_id',
        'users.role',
        'users.church_id',
        'members.name as member_name',
        'cc1.name as church_role_name'
      ])
      .where('users.id', '=', userBase.id)
      .executeTakeFirst()

    let roleNumber = Number(userBase.role) as UserRole
    
    // 기존 DB 데이터 하위 호환성 보장: 본사 소속은 무조건 MASTER로 취급
    if (userBase.church_id === SYSTEM_CHURCH_ID) {
      roleNumber = UserRole.MASTER
    }

    const fallbackRoleName = ROLE_META[roleNumber]?.label || ROLE_META[UserRole.USER].label

    // 세션 설정 (nuxt-auth-utils)
    await setUserSession(event, {
      user: {
        id: userDetail?.id || userBase.id,
        church_id: userDetail?.church_id || userBase.church_id,
        login_id: userDetail?.login_id || login_id,
        name: userDetail?.member_name || '관리자',
        role: roleNumber,
        church_role_name: userDetail?.church_role_name || null,
        sys_role_name: fallbackRoleName
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
