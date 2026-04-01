import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    if (!body.name || !body.start_date || !body.account_code) {
      throw createError({ statusCode: 400, statusMessage: '필수 항목(캠페인명, 시작일, 계정과목)이 누락되었습니다.' })
    }

    const newCampaign = await db.insertInto('pledge_campaigns')
      .values({
        name: body.name,
        description: body.description || null,
        start_date: body.start_date,
        end_date: body.end_date || null,
        target_amount: Number(body.target_amount) || 0,
        account_code: body.account_code,
        is_active: true
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    return {
      success: true,
      data: newCampaign
    }
  } catch (error: any) {
    console.error('Create campaign error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '캠페인을 생성하는 중 오류가 발생했습니다.'
    })
  }
})
