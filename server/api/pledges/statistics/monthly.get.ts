import { db } from '../../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const campaignId = query.campaignId as string
  const year = query.year as string || new Date().getFullYear().toString()

  if (!campaignId) {
    return { success: true, data: [] }
  }

  try {
    // 1. 캠페인 정보 및 목표액 확인
    const campaign = await db.selectFrom('pledge_campaigns')
      .select(['account_code', 'target_amount'])
      .where('id', '=', campaignId)
      .executeTakeFirstOrThrow()

    // 2. 월별 집계 쿼리 (1월~12월)
    // 헌금 데이터(Transactions)를 해당 연도의 월별로 합산
    const monthlyStats = await db.selectFrom('transactions as t')
      .select([
        sql<string>`TO_CHAR(t.transaction_date, 'MM')`.as('month'),
        sql<number>`SUM(t.amount)`.as('amount')
      ])
      .where('t.account_code', '=', campaign.account_code)
      .where(sql`EXTRACT(YEAR FROM t.transaction_date)`, '=', year)
      .groupBy(sql`TO_CHAR(t.transaction_date, 'MM')`)
      .orderBy(sql`TO_CHAR(t.transaction_date, 'MM')`, 'asc')
      .execute()

    // 3. 1월부터 12월까지 빈 달을 0으로 채운 최종 데이터 구성
    let cumulativeSum = 0
    const fullYearStats = Array.from({ length: 12 }, (_, i) => {
      const monthStr = (i + 1).toString().padStart(2, '0')
      const matched = monthlyStats.find(s => s.month === monthStr)
      const amount = Number(matched?.amount || 0)
      cumulativeSum += amount

      return {
        month: `${i + 1}월`,
        amount,
        cumulative_amount: cumulativeSum,
        percent: campaign.target_amount > 0 ? Math.round((cumulativeSum / campaign.target_amount) * 100) : 0
      }
    })

    return {
      success: true,
      data: fullYearStats,
      meta: {
        target_amount: campaign.target_amount,
        total_collected: cumulativeSum
      }
    }
  } catch (error: any) {
    console.error('Fetch monthly stats error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '월별 통계를 가져오는 중 오류가 발생했습니다.'
    })
  }
})
