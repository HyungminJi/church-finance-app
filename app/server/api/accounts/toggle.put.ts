import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody(event)
  const { code, codes, is_active } = body
  
  const targetCodes = codes || (code ? [code] : [])

  if (targetCodes.length === 0 || is_active === undefined) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request' })
  }

  try {
    // 1. 대상 코드들 업데이트
    await db
      .updateTable('accounts')
      .set({ is_active })
      .where('code', 'in', targetCodes)
      .$if(event.context.userRole !== 0, (qb) => qb.where('church_id', '=', event.context.churchId || session.user.church_id))
      .execute()

    // 2. 하위 코드들도 함께 업데이트 (parent_code가 대상 코드들 중 하나인 경우)
    await db
      .updateTable('accounts')
      .set({ is_active })
      .where('parent_code', 'in', targetCodes)
      .$if(event.context.userRole !== 0, (qb) => qb.where('church_id', '=', event.context.churchId || session.user.church_id))
      .execute()

    return { success: true }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})
