import { sql } from 'kysely'
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const codes = body.codes || (body.code ? [body.code] : [])
    
    if (!codes || codes.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Code(s) required',
      })
    }

    // 재귀적으로 삭제 대상 코드와 모든 하위 코드들을 추출하여 삭제
    const result = await sql`
      WITH RECURSIVE descendants AS (
        -- 초기 선택: 삭제 요청된 코드들
        SELECT code FROM accounts WHERE code IN (${sql.join(codes)})
        UNION ALL
        -- 재귀 선택: descendants에 포함된 코드를 parent_code로 가지는 항목들
        SELECT a.code FROM accounts a
        JOIN descendants d ON a.parent_code = d.code
      )
      DELETE FROM accounts 
      WHERE code IN (SELECT code FROM descendants)
    `.execute(db)

    // 삭제된 총 로우 수 계산
    const deletedCount = Number(result.numAffectedRows || 0)

    return {
      success: true,
      deletedCount
    }
  }
  catch (error: any) {
    console.error('API Error:', error)
    return {
      success: false,
      error: error.message || 'Failed to delete account(s)',
    }
  }
})
