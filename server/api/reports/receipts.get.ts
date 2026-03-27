import { db } from '../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const targetYear = parseInt(query.year as string) || new Date().getFullYear()
  const donorId = query.donorId as string
  const keyword = query.keyword as string

  try {
    // 1. 성도(MEMBER) 중심의 연간 헌금 집계 쿼리
    // donors -> members 순으로 조인하여 기본 인적 사항 확보
    let baseQuery = db.selectFrom('donors as d')
      .innerJoin('members as m', 'd.id', 'm.donor_id')
      .leftJoin('common_codes as cc', (join) => join
        .onRef('m.church_role', '=', 'cc.code')
        .on('cc.group_code', '=', 'CHURCH_ROLE')
      )
      .leftJoin('receipts as r', (join) => join
        .onRef('m.id', '=', 'r.member_id')
        .on('r.target_year', '=', targetYear)
      )
      .where('d.donor_type', '=', 'MEMBER')

    // 검색 필터 적용
    if (donorId) {
      baseQuery = baseQuery.where('d.id', '=', donorId)
    }
    if (keyword) {
      baseQuery = baseQuery.where('d.name', 'ilike', `%${keyword}%`)
    }

    // 연간 총액 합산 서브쿼리 연결 (Transactions 연동)
    const results = await baseQuery
      .leftJoin(
        db.selectFrom('transactions as t')
          .innerJoin('accounts as a', 't.account_code', 'a.code')
          .select([
            't.donor_id',
            sql<number>`SUM(t.amount)::BIGINT`.as('annual_total')
          ])
          .where('a.type', '=', 'INCOME')
          .where(sql`EXTRACT(YEAR FROM t.transaction_date)`, '=', targetYear)
          .groupBy('t.donor_id')
          .as('tx_agg'),
        'd.id',
        'tx_agg.donor_id'
      )
      .select([
        'd.id as donor_id',
        'm.id as member_id',
        'd.name',
        'cc.name as church_role_name',
        'm.address',
        'm.detail_address',
        'm.postcode',
        'm.birth_date',
        sql<number>`COALESCE(tx_agg.annual_total, 0)`.as('total_amount'),
        'r.id as receipt_id',
        'r.receipt_number',
        'r.status as receipt_status',
        'r.issued_date'
      ])
      .orderBy('d.name', 'asc')
      .execute()

    return {
      success: true,
      data: results,
      meta: {
        targetYear,
        count: results.length
      }
    }

  } catch (error: any) {
    console.error('Fetch receipts report error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '기부금 영수증 집계 데이터를 가져오는 중 오류가 발생했습니다.'
    })
  }
})
