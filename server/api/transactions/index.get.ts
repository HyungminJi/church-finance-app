import { db } from '../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const offset = (page - 1) * limit
  
  const type = query.type as string // 'INCOME' | 'EXPENSE' | 'ALL'
  const startDate = query.startDate as string
  const endDate = query.endDate as string
  const keyword = query.keyword as string // 검색어 (적요, 성도이름)
  const accountCode = query.accountCode as string

  try {
    let baseQuery = db.selectFrom('transactions as t')
      .leftJoin('accounts as a', 't.account_code', 'a.code')
      .leftJoin('members as m', 't.member_id', 'm.id')

    // 1. 유형 필터 (수입/지출)
    if (type && type !== 'ALL') {
      baseQuery = baseQuery.where('a.type', '=', type as any)
    }

    // 2. 날짜 필터
    if (startDate) {
      baseQuery = baseQuery.where('t.transaction_date', '>=', startDate)
    }
    if (endDate) {
      baseQuery = baseQuery.where('t.transaction_date', '<=', endDate)
    }

    // 3. 계정코드 필터
    if (accountCode) {
      baseQuery = baseQuery.where('t.account_code', '=', accountCode)
    }

    // 4. 검색어 필터 (적요 또는 헌금자 이름)
    if (keyword) {
      baseQuery = baseQuery.where((eb) => eb.or([
        eb('t.description', 'ilike', `%${keyword}%`),
        eb('m.name', 'ilike', `%${keyword}%`)
      ]))
    }

    // 총 개수 조회
    const { count } = await baseQuery
      .select(sql<number>`COUNT(t.id)`.as('count'))
      .executeTakeFirstOrThrow()

    // 데이터 조회
    const results = await baseQuery
      .select([
        't.id',
        't.transaction_date',
        't.account_code',
        'a.name as account_name',
        'a.type as account_type',
        't.amount',
        't.description',
        't.member_id',
        'm.name as member_name',
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
      pagination: {
        page,
        limit,
        totalCount: Number(count),
        totalPages: Math.ceil(Number(count) / limit)
      }
    }
  } catch (error: any) {
    console.error('Fetch transactions error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '전표 목록을 가져오는 중 오류가 발생했습니다.'
    })
  }
})
