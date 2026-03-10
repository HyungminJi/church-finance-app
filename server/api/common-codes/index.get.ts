import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const groupCode = (query.group as string) || 'CHURCH_ROLE'

  try {
    const codes = await db.selectFrom('common_codes')
      .selectAll()
      .where('group_code', '=', groupCode)
      .where('is_active', '=', true)
      .orderBy('code', 'asc')
      .execute()

    return {
      success: true,
      data: codes
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: '공통 코드 조회 중 오류가 발생했습니다.'
    })
  }
})
