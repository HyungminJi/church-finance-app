import { db } from '../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  // 1. 권한 체크 (Admin 이상만 가능)
  const session = await getUserSession(event)
  if (!session.user || Number(session.user.role) > 2) {
    throw createError({
      statusCode: 403,
      statusMessage: '헌금자 순위 조회 권한이 없습니다.'
    })
  }

  const query = getQuery(event)
  const startDate = query.startDate as string
  const endDate = query.endDate as string
  const accountCodes = query.accountCodes ? (query.accountCodes as string).split(',') : []
  const limit = parseInt(query.limit as string) || 50

  if (!startDate || !endDate) {
    throw createError({ statusCode: 400, statusMessage: '조회 기간은 필수입니다.' })
  }

  try {
    // 2. 통합 순위 쿼리 (Donor Supertype 기반)
    let baseQuery = db.selectFrom('transactions as t')
      .innerJoin('donors as d', 't.donor_id', 'd.id')
      .innerJoin('accounts as a', 't.account_code', 'a.code')
      // 성도 정보 조인 (직분, 교구 표시용)
      .leftJoin('members as m', 'd.id', 'm.donor_id')
      .leftJoin('common_codes as cc_role', (join) => join
        .onRef('m.church_role', '=', 'cc_role.code')
        .on('cc_role.group_code', '=', 'CHURCH_ROLE')
      )
      .leftJoin('cell_groups as cg', 'm.cell_group_id', 'cg.id')
      .where('a.type', '=', 'INCOME')
      .where('t.transaction_date', '>=', startDate)
      .where('t.transaction_date', '<=', endDate)

    if (accountCodes.length > 0) {
      baseQuery = baseQuery.where('t.account_code', 'in', accountCodes)
    }

    const results = await baseQuery
      .select([
        'd.id as donor_id',
        'd.name',
        'd.donor_type',
        'cc_role.name as church_role_name',
        'cg.name as cell_group_name',
        sql<number>`COUNT(t.id)`.as('tx_count'),
        sql<number>`SUM(t.amount)::BIGINT`.as('total_amount')
      ])
      .groupBy(['d.id', 'd.name', 'd.donor_type', 'cc_role.name', 'cg.name'])
      .orderBy('total_amount', 'desc')
      .limit(limit)
      .execute()

    // 전체 총액 계산 (비율 산출용)
    const totalSumRes = await baseQuery
      .select(sql<number>`SUM(t.amount)::BIGINT`.as('grand_total'))
      .executeTakeFirst()
    
    const grandTotal = Number(totalSumRes?.grand_total || 0)

    return {
      success: true,
      data: results.map(r => ({
        ...r,
        rate: grandTotal > 0 ? ((Number(r.total_amount) / grandTotal) * 100).toFixed(1) : '0.0'
      })),
      meta: {
        grandTotal,
        count: results.length
      }
    }

  } catch (error: any) {
    console.error('Fetch ranking error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '순위 데이터를 가져오는 중 오류가 발생했습니다.'
    })
  }
})
