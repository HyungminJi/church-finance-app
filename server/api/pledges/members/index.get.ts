import { db } from '../../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const campaignId = query.campaignId as string

  if (!campaignId) {
    return { success: true, data: [] }
  }

  try {
    // 1. 캠페인의 계정 코드 확인
    const campaign = await db.selectFrom('pledge_campaigns')
      .select(['account_code'])
      .where('id', '=', campaignId)
      .executeTakeFirstOrThrow()

    // 2. 성도별 약정 정보와 실제 납부액(Transactions)을 조인하여 조회
    const results = await db.selectFrom('member_pledges as mp')
      .innerJoin('members as m', 'mp.member_id', 'm.id')
      .leftJoin('transactions as t', (join) => join
        .onRef('mp.member_id', '=', 't.member_id')
        .on('t.account_code', '=', campaign.account_code)
      )
      .select([
        'mp.id',
        'mp.member_id',
        'm.name as member_name',
        'mp.pledge_amount',
        'mp.pledge_date',
        'mp.notes',
        // 실제 납부 총액 계산 (해당 캠페인 계정으로 들어온 것만)
        sql<number>`COALESCE(SUM(t.amount), 0)`.as('total_paid')
      ])
      .where('mp.campaign_id', '=', campaignId)
      .groupBy(['mp.id', 'mp.member_id', 'm.name', 'mp.pledge_amount', 'mp.pledge_date', 'mp.notes'])
      .orderBy('m.name', 'asc')
      .execute()

    return {
      success: true,
      data: results
    }
  } catch (error: any) {
    console.error('Fetch member pledges error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '작정 현황을 가져오는 중 오류가 발생했습니다.'
    })
  }
})
