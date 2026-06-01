import { db } from '../../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const query = getQuery(event)
  const campaignId = query.campaignId as string

  if (!campaignId) {
    return { success: true, data: [] }
  }

  try {
    // 1. 캠페인 정보 조회 (계정과목 코드 및 기간 확보)
    const campaign = await db.selectFrom('pledge_campaigns')
      .select(['account_code', 'start_date', 'end_date'])
      .where('id', '=', campaignId)
      .$if(event.context.userRole !== 0, (qb) => qb.where('church_id', '=', event.context.churchId || session.user.church_id))
      .executeTakeFirstOrThrow()

    // 2. 성도별 납부액을 캠페인 기간 내에서만 합산 (Subquery)
    // 리팩토링 반영: transactions 테이블의 donor_id 사용
    let paidSubquery = db.selectFrom('transactions')
      .select([
        'donor_id',
        sql<number>`SUM(amount)`.as('total_paid')
      ])
      .$if(event.context.userRole !== 0, (qb) => qb.where('church_id', '=', event.context.churchId || session.user.church_id))
      .where('account_code', '=', campaign.account_code)
      .where('donor_id', 'is not', null)
      .where('transaction_date', '>=', campaign.start_date)

    if (campaign.end_date) {
      paidSubquery = paidSubquery.where('transaction_date', '<=', campaign.end_date)
    }

    const finalPaidSubquery = paidSubquery.groupBy('donor_id').as('paid_stats')

    // 3. 약정 정보와 합산된 납부액을 조인
    const results = await db.selectFrom('member_pledges as mp')
      .innerJoin('members as m', 'mp.member_id', 'm.id')
      .leftJoin(finalPaidSubquery, 'm.donor_id', 'paid_stats.donor_id')
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
      .$if(event.context.userRole !== 0, (qb) => qb.where('mp.church_id', '=', event.context.churchId || session.user.church_id))
      .orderBy('m.name', 'asc')
      .execute()

    return {
      success: true,
      data: results
    }
  } catch (error: any) {
    console.error('Fetch pledge members error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '약정 성도 목록을 불러오는 중 오류가 발생했습니다.'
    })
  }
})
