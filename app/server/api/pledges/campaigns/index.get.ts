import { db } from '../../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  try {
    // 캠페인 정보와 연결된 수입 계정의 실제 모금액(Transactions)을 합산하여 조회
    const campaigns = await db.selectFrom('pledge_campaigns as pc')
      .leftJoin('accounts as a', 'pc.account_code', 'a.code')
      // [핵심 수정] 조인 시 해당 캠페인의 시작일과 종료일 사이에 발생한 전표만 합산하도록 필터 추가
      .leftJoin('transactions as t', (join) => join
        .onRef('pc.account_code', '=', 't.account_code')
        .onRef('t.transaction_date', '>=', 'pc.start_date')
        .on((eb) => eb.or([
          eb('pc.end_date', 'is', null),
          eb('t.transaction_date', '<=', eb.ref('pc.end_date'))
        ]))
      )
      .select([
        'pc.id',
        'pc.name',
        'pc.description',
        'pc.start_date',
        'pc.end_date',
        'pc.target_amount',
        'pc.account_code',
        'a.name as account_name',
        'pc.is_active',
        // 해당 캠페인 기간 내에 계정으로 들어온 트랜잭션 합계
        sql<number>`COALESCE(SUM(t.amount), 0)`.as('total_collected')
      ])
      .groupBy(['pc.id', 'pc.name', 'pc.description', 'pc.start_date', 'pc.end_date', 'pc.target_amount', 'pc.account_code', 'a.name', 'pc.is_active'])
      .orderBy('pc.created_at', 'desc')
      .execute()

    return {
      success: true,
      data: campaigns
    }
  } catch (error: any) {
    console.error('Fetch campaigns error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '캠페인 목록을 가져오는 중 오류가 발생했습니다.'
    })
  }
})
