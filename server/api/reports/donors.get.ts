import { db } from '../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20
  const offset = (page - 1) * limit
  
  const startDate = query.startDate as string
  const endDate = query.endDate as string
  const memberId = query.memberId as string
  const keyword = query.keyword as string

  try {
    let baseQuery = db.selectFrom('transactions as t')
      .innerJoin('accounts as a', 't.account_code', 'a.code')
      .leftJoin('donors as d', 't.donor_id', 'd.id')
      // 성도인 경우에만 직분 정보를 위해 추가 조인
      .leftJoin('members as m', 'd.id', 'm.donor_id')
      .leftJoin('common_codes as cc', (join) => join
        .onRef('m.church_role', '=', 'cc.code')
        .on('cc.group_code', '=', 'CHURCH_ROLE')
      )
      .where('a.type', '=', 'INCOME') // 헌금자리스트는 수입만 표시

    // 1. 날짜 필터
    if (startDate) {
      baseQuery = baseQuery.where('t.transaction_date', '>=', startDate)
    }
    if (endDate) {
      baseQuery = baseQuery.where('t.transaction_date', '<=', endDate)
    }

    // 2. 특정 헌금자 필터
    if (memberId) { // 클라이언트에서 memberId라는 이름으로 보내고 있으므로 변수명 유지 (실제론 donor_id)
      baseQuery = baseQuery.where('t.donor_id', '=', memberId)
    }

    // 3. 키워드 검색 (헌금자명 또는 적요)
    if (keyword) {
      baseQuery = baseQuery.where((eb) => eb.or([
        eb('d.name', 'ilike', `%${keyword}%`),
        eb('t.description', 'ilike', `%${keyword}%`)
      ]))
    }

    // 총 개수 및 총 금액 합계 조회
    const stats = await baseQuery
      .select([
        sql<number>`COUNT(t.id)`.as('total_count'),
        sql<number>`COALESCE(SUM(t.amount), 0)`.as('total_amount')
      ])
      .executeTakeFirstOrThrow()

    // 데이터 조회
    const results = await baseQuery
      .select([
        't.id',
        't.transaction_date',
        't.account_code',
        'a.name as account_name',
        't.amount',
        't.description',
        'd.name as donor_name',
        'd.donor_type',
        'cc.name as church_role_name',
        't.created_at'
      ])
      .orderBy('t.transaction_date', 'desc')
      .orderBy('t.created_at', 'desc')
      .limit(limit)
      .offset(offset)
      .execute()

    return {
      success: true,
      data: results,
      meta: {
        totalCount: Number(stats.total_count),
        totalAmount: Number(stats.total_amount),
        page,
        limit,
        totalPages: Math.ceil(Number(stats.total_count) / limit)
      }
    }
  } catch (error: any) {
    console.error('Fetch donors report error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '헌금자 내역을 가져오는 중 오류가 발생했습니다.'
    })
  }
})
