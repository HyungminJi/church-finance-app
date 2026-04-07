import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  // 관리자 권한 확인 (role: 1 또는 2)
  const session = await requireUserSession(event)
  if (session.user.role > 2) {
    throw createError({
      statusCode: 403,
      statusMessage: '사용자 삭제 권한이 없습니다. (관리자 전용)'
    })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: '사용자 ID가 필요합니다.'
    })
  }

  try {
    // 본인 계정은 삭제 불가 (선택 사항)
    if (id === session.user.id) {
      throw createError({
        statusCode: 400,
        statusMessage: '본인의 계정은 삭제할 수 없습니다.'
      })
    }

    // 1. 사용자 정보(member_id, role) 조회 (현재 교회의 유저인지 확인)
    const userToDelete = await db.selectFrom('users')
      .select(['member_id', 'role'])
      .where('id', '=', id)
      .where('church_id', '=', session.user.church_id)
      .executeTakeFirst()

    if (!userToDelete) {
      throw createError({
        statusCode: 404,
        statusMessage: '삭제할 사용자 정보를 찾을 수 없습니다.'
      })
    }

    // 관리자(2)는 최고관리자(1)의 권한을 박탈할 수 없음
    if (session.user.role === 2 && userToDelete.role === 1) {
      throw createError({
        statusCode: 403,
        statusMessage: '관리자는 최고관리자의 권한을 박탈할 수 없습니다.'
      })
    }

    // 2. 트랜잭션 처리 (사용자 삭제 및 성도 플래그 업데이트)
    await db.transaction().execute(async (trx) => {
      await trx.deleteFrom('users')
        .where('id', '=', id)
        .where('church_id', '=', session.user.church_id)
        .execute()

      if (userToDelete.member_id) {
        await trx.updateTable('members')
          .set({ is_user: false })
          .where('id', '=', userToDelete.member_id)
          .where(({ exists, selectFrom }) => 
            exists(
              selectFrom('donors as d')
                .whereRef('d.id', '=', 'members.donor_id')
                .where('d.church_id', '=', session.user.church_id)
            )
          )
          .execute()
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
