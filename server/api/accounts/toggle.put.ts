import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
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
      .execute()

    // 2. 하위 코드들도 함께 업데이트 (parent_code가 대상 코드들 중 하나인 경우)
    await db
      .updateTable('accounts')
      .set({ is_active })
      .where('parent_code', 'in', targetCodes)
      .execute()

    return { success: true }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
})
