import { db } from '../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const startDate = query.startDate as string
  const endDate = query.endDate as string
  const mode = query.mode as 'ACCOUNT' | 'CELL_GROUP' | 'ORGANIZATION'

  if (!startDate || !endDate) {
    throw createError({ statusCode: 400, statusMessage: '조회 기간(startDate, endDate)은 필수입니다.' })
  }

  try {
    // 1. 기본 조회 쿼리 (수입 트랜잭션 대상)
    let baseQuery = db.selectFrom('transactions as t')
      .innerJoin('accounts as a', 't.account_code', 'a.code')
      .where('a.type', '=', 'INCOME')
      .where('t.transaction_date', '>=', startDate)
      .where('t.transaction_date', '<=', endDate)

    // 2. 모드별 집계 로직
    if (mode === 'ACCOUNT') {
      // 항목(계정과목)별 집계
      const results = await baseQuery
        .select([
          'a.name as label',
          sql<number>`COUNT(t.id)`.as('count'),
          sql<number>`SUM(t.amount)::BIGINT`.as('amount')
        ])
        .groupBy('a.name')
        .orderBy('amount', 'desc')
        .execute()
      
      return { success: true, data: results }
    }

    if (mode === 'CELL_GROUP') {
      // 구역별 집계 (성도의 구역 정보 + 구역 명의의 직접 헌금 통합)
      // 1) 성도가 속한 구역 기준 합산 + 2) 구역 자체가 donor인 경우 합산
      const results = await db.selectFrom('cell_groups as cg')
        .leftJoin('donors as d', 'cg.donor_id', 'd.id')
        .leftJoin(
          // 서브쿼리: 구역 소속 성도들의 헌금 + 구역 직접 헌금
          db.selectFrom('transactions as t')
            .innerJoin('accounts as a', 't.account_code', 'a.code')
            .leftJoin('members as m', 't.donor_id', 'm.donor_id')
            .select([
              // 거래의 donor_id가 구역 자체이거나, 성도의 cell_group_id가 현재 구역인 경우 매핑
              sql`COALESCE(m.cell_group_id, (SELECT id FROM cell_groups WHERE donor_id = t.donor_id))`.as('target_group_id'),
              sql<number>`t.amount`.as('amount'),
              't.id as tx_id'
            ])
            .where('a.type', '=', 'INCOME')
            .where('t.transaction_date', '>=', startDate)
            .where('t.transaction_date', '<=', endDate)
            .as('tx_data'),
          'cg.id',
          'tx_data.target_group_id'
        )
        .select([
          'cg.name as label',
          sql<number>`COUNT(tx_data.tx_id)`.as('count'),
          sql<number>`COALESCE(SUM(tx_data.amount), 0)::BIGINT`.as('amount')
        ])
        .groupBy(['cg.id', 'cg.name'])
        .orderBy('amount', 'desc')
        .execute()

      return { success: true, data: results }
    }

    if (mode === 'ORGANIZATION') {
      // 단체별 집계
      const results = await baseQuery
        .innerJoin('donors as d', 't.donor_id', 'd.id')
        .where('d.donor_type', '=', 'ORGANIZATION')
        .select([
          'd.name as label',
          sql<number>`COUNT(t.id)`.as('count'),
          sql<number>`SUM(t.amount)::BIGINT`.as('amount')
        ])
        .groupBy('d.name')
        .orderBy('amount', 'desc')
        .execute()

      return { success: true, data: results }
    }

    // 기본 반환 (정의되지 않은 모드)
    return { success: false, message: 'Invalid mode' }

  } catch (error: any) {
    console.error('Fetch statistics error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '통계 데이터를 집계하는 중 오류가 발생했습니다.'
    })
  }
})
