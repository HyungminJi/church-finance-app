import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    if (!body.campaign_id || !body.member_id || body.pledge_amount === undefined) {
      throw createError({ statusCode: 400, statusMessage: '필수 항목(캠페인, 성도, 약정액)이 누락되었습니다.' })
    }

    const result = await db.insertInto('member_pledges')
      .values({
        campaign_id: body.campaign_id,
        member_id: body.member_id,
        pledge_amount: Number(body.pledge_amount),
        pledge_date: body.pledge_date || new Date().toISOString().split('T')[0],
        notes: body.notes || null
      })
      .onConflict((oc) => oc
        .columns(['campaign_id', 'member_id'])
        .doUpdateSet({
          pledge_amount: Number(body.pledge_amount),
          pledge_date: body.pledge_date || new Date().toISOString().split('T')[0],
          notes: body.notes || null
        })
      )
      .returningAll()
      .executeTakeFirstOrThrow()

    return {
      success: true,
      data: result
    }
  } catch (error: any) {
    console.error('Save member pledge error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '약정 정보 저장 중 오류가 발생했습니다.'
    })
  }
})
