import { db } from '../../utils/db'
import { UserRole } from '../../../types/auth'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  
  // 미들웨어에서 주입된 컨텍스트(테넌트 격리 정보)
  const churchId = event.context.churchId
  const userRole = event.context.userRole as UserRole

  // 권한 확인 (UserRole.ADMIN 이상의 권한만 사용자 관리 가능)
  // 숫자가 낮을수록 권한이 높음 (0: Master, 1: Admin)
  if (userRole > UserRole.ADMIN) {
    throw createError({
      statusCode: 403,
      statusMessage: '사용자 삭제 권한이 없습니다. (관리자 전용)'
    })
  }

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: '사용자 ID가 필요합니다.'
    })
  }

  try {
    // 본인 계정은 삭제 불가
    if (id === session.user.id) {
      throw createError({
        statusCode: 400,
        statusMessage: '본인의 계정은 삭제할 수 없습니다.'
      })
    }

    // 1. 사용자 정보(member_id, role) 조회
    let query = db.selectFrom('users')
      .select(['member_id', 'role'])
      .where('id', '=', id)

    // Master(0)가 아니면 본인 소속 교회의 유저인지 확인
    if (userRole !== UserRole.MASTER) {
      query = query.where('church_id', '=', churchId)
    }

    const userToDelete = await query.executeTakeFirst()

    if (!userToDelete) {
      throw createError({
        statusCode: 404,
        statusMessage: '삭제할 사용자 정보를 찾을 수 없습니다.'
      })
    }

    // Admin(1)은 Master(0)의 권한을 박탈할 수 없음
    if (userRole === UserRole.ADMIN && userToDelete.role === UserRole.MASTER) {
      throw createError({
        statusCode: 403,
        statusMessage: '본사 최고관리자의 계정은 삭제할 수 없습니다.'
      })
    }

    // 2. 트랜잭션 처리 (사용자 삭제 및 성도 플래그 업데이트)
    await db.transaction().execute(async (trx) => {
      let deleteQuery = trx.deleteFrom('users').where('id', '=', id)
      
      // Master가 아니면 타 교회 삭제 방지
      if (userRole !== UserRole.MASTER) {
         deleteQuery = deleteQuery.where('church_id', '=', churchId)
      }
      
      await deleteQuery.execute()

      if (userToDelete.member_id) {
        let updateQuery = trx.updateTable('members')
          .set({ is_user: false })
          .where('id', '=', userToDelete.member_id)
          
        // Master가 아니면 타 교회 멤버 수정 방지
        if (userRole !== UserRole.MASTER) {
           updateQuery = updateQuery.where(({ exists, selectFrom }) => 
            exists(
              selectFrom('donors as d')
                .whereRef('d.id', '=', 'members.donor_id')
                .where('d.church_id', '=', churchId)
            )
          )
        }
        await updateQuery.execute()
      }
    })

    return {
      success: true,
      message: '사용자 권한이 성공적으로 박탈되었습니다.'
    }
  } catch (error: any) {
    console.error('User deletion error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '사용자 삭제 중 오류가 발생했습니다.'
    })
  }
})
