import { db } from '../../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const campaignId = query.campaignId as string

  if (!campaignId) {
    return { success: true, data: [] }
  }

  try {
    // 1. 캠페인의 계정 코드 및 기간 확인
    const campaign = await db.selectFrom('pledge_campaigns')
      .select(['account_code', 'start_date', 'end_date'])
      .where('id', '=', campaignId)
      .executeTakeFirstOrThrow()

    // 2. 성도별 납부액을 캠페인 기간 내에서만 합산 (Subquery)
    let paidSubquery = db.selectFrom('transactions')
      .select([
        'member_id',
        sql<number>`SUM(amount)`.as('total_paid')
      ])
      .where('account_code', '=', campaign.account_code)
      .where('member_id', 'is not', null)
      .where('transaction_date', '>=', campaign.start_date)

    if (campaign.end_date) {
      paidSubquery = paidSubquery.where('transaction_date', '<=', campaign.end_date)
    }

    const finalPaidSubquery = paidSubquery.groupBy('member_id').as('paid_stats')

    // 3. 약정 정보와 합산된 납부액을 조인
    const results = await db.selectFrom('member_pledges as mp')
      .innerJoin('members as m', 'mp.member_id', 'm.id')
      .leftJoin(finalPaidSubquery, 'mp.member_id', 'paid_stats.member_id')
      .select([
        'mp.id',
        'mp.member_id',
        'm.name as member_name',
        'mp.pledge_amount',
        'mp.pledge_date',
        'mp.notes',
        sql<number>`COALESCE(paid_stats.total_paid, 0)`.as('total_paid')
      ])
      .where('mp.campaign_id', '=', campaignId)
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
      statusMessage: '작정 현황을 정확히 집계하는 중 오류가 발생했습니다.'
    })
  }
})
