import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: '구역 ID가 필요합니다.'
    })
  }

  try {
    // 1. 활성 상태인지 확인
    const group = await db.selectFrom('cell_groups')
      .where('id', '=', id)
      .select('is_active')
      .executeTakeFirst()
    
    if (group?.is_active) {
      throw createError({
        statusCode: 400,
        statusMessage: '활성 상태의 구역은 삭제할 수 없습니다. 먼저 비활성 상태로 변경해 주세요.'
      })
    }

    // 2. 성도 테이블에서 해당 구역을 참조하고 있는지 확인
    const memberCount = await db.selectFrom('members')
      .where('cell_group_id', '=', id)
      .select(({ fn }) => fn.countAll().as('total'))
      .executeTakeFirst()
    
    if (parseInt(memberCount?.total as string || '0') > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '해당 구역에 소속된 성도가 있어 삭제할 수 없습니다. 소속 성도를 먼저 정리해 주세요.'
      })
    }

    await db.deleteFrom('cell_groups')
      .where('id', '=', id)
      .execute()

    return { success: true }
  } catch (error: any) {
    console.error('Delete cell group error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '구역 삭제 중 오류가 발생했습니다.'
    })
  }
})
