import { db } from '../../utils/db'
import { sql } from 'kysely'
import bcrypt from 'bcryptjs'
import { UserRole } from '../../../types/auth'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody(event)
  
  // 미들웨어에서 주입된 컨텍스트
  const churchId = event.context.churchId
  const userRole = event.context.userRole as UserRole

  // 권한 확인 (UserRole.ADMIN 이상의 권한만 사용자 관리 가능)
  if (userRole > UserRole.ADMIN) {
    throw createError({
      statusCode: 403,
      statusMessage: '사용자 등록 권한이 없습니다. (관리자 전용)'
    })
  }

  const { member_id, login_id, password, role } = body

  if (!member_id || !login_id || !password || role === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: '필수 정보가 누락되었습니다.'
    })
  }

  // Admin(1)은 Master(0) 권한을 부여할 수 없음
  if (userRole === UserRole.ADMIN && Number(role) === UserRole.MASTER) {
    throw createError({
      statusCode: 403,
      statusMessage: '관리자는 본사 최고관리자 권한을 부여할 수 없습니다.'
    })
  }

  try {
    // 트랜잭션 처리: user 생성 + member 업데이트
    await db.transaction().execute(async (trx) => {
      // 1. users 테이블에 등록
      const hashedPassword = await bcrypt.hash(password, 10)
      await trx.insertInto('users')
        .values({
          id: sql`gen_random_uuid()`,
          church_id: churchId,
          member_id,
          login_id,
          password_hash: hashedPassword,
          role: Number(role),
          is_active: true
        })
        .execute()

      // 2. members 테이블의 is_user 플래그 업데이트
      let updateQuery = trx.updateTable('members')
        .set({ is_user: true })
        .where('id', '=', member_id)
        
      // Master가 아니면 본인 교회 성도만 업데이트 가능하도록 격리
      if (userRole !== UserRole.MASTER) {
        updateQuery = updateQuery.where(({ exists, selectFrom }) => 
          exists(
            selectFrom('donors as d')
              .whereRef('d.id', '=', 'members.donor_id')
              .where('d.church_id', '=', churchId)
          )
        )
      }
      
      const updateResult = await updateQuery.executeTakeFirst()
      
      // 만약 업데이트된 행이 없다면 권한이 없거나 존재하지 않는 성도임
      if (Number(updateResult.numUpdatedRows) === 0 && userRole !== UserRole.MASTER) {
         throw new Error('권한이 없거나 유효하지 않은 성도입니다.')
      }
    })

    return {
      success: true,
      message: '사용자 권한이 성공적으로 부여되었습니다.'
    }

  } catch (error: any) {
    console.error('Create user error:', error)
    // UNIQUE 제약조건 위반 (중복 아이디)
    if (error.code === '23505') {
      throw createError({
        statusCode: 409,
        statusMessage: '이미 사용 중인 아이디입니다.'
      })
    }
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || '사용자 등록 중 오류가 발생했습니다.'
    })
  }
})
