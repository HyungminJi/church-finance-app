import { db } from '../../utils/db'
import { sql } from 'kysely'
import { UserRole } from '../../../types/auth'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const query = getQuery(event)
  
  // 미들웨어에서 주입된 컨텍스트
  const churchId = event.context.churchId
  const userRole = event.context.userRole as UserRole

  // 헌금자 순위는 Manager 이상의 권한(0, 1, 2)만 접근 가능
  if (userRole > UserRole.MANAGER) {
    throw createError({
      statusCode: 403,
      statusMessage: '헌금자 순위 조회 권한이 없습니다.'
    })
  }

  const startDate = query.startDate as string
  const endDate = query.endDate as string
  const limit = Number(query.limit) || 10
  const order = query.order === 'asc' ? 'asc' : 'desc'

  if (!startDate || !endDate) {
    throw createError({
      statusCode: 400,
      statusMessage: '조회 시작일(startDate)과 종료일(endDate)은 필수입니다.'
    })
  }

  try {
    let baseQuery = db.selectFrom('donors as d')
      // Transactions 조인 (수입 전표만, 해당 기간 내)
      .innerJoin('transactions as t', (join) => join
        .onRef('t.donor_id', '=', 'd.id')
        .on('t.transaction_date', '>=', startDate)
        .on('t.transaction_date', '<=', endDate)
      )
      // 계정 조인 (수입 계정인지 확인용)
      .innerJoin('accounts as a', (join) => join
        .onRef('t.account_code', '=', 'a.code')
        .on('a.type', '=', 'INCOME')
      )
      // 성도 정보 조인 (옵션)
      .leftJoin('members as m', 'd.id', 'm.donor_id')
      // 소속 구역 정보 조인 (옵션)
      .leftJoin('cell_groups as cg', 'm.cell_group_id', 'cg.id')
      // 직분 이름 조인 (옵션)
      .leftJoin('common_codes as cc_role', (join) => join
        .onRef('m.church_role', '=', 'cc_role.code')
        .on('cc_role.group_code', '=', 'CHURCH_ROLE')
      )
      .select([
        'd.id',
        'd.name',
        'd.donor_type',
        'cc_role.name as church_role_name',
        'cg.name as cell_group_name',
        sql<number>`SUM(t.amount)`.as('total_amount')
      ])
      
    // Master가 아니면 소속 교회 데이터만 조회
    if (userRole !== UserRole.MASTER) {
      baseQuery = baseQuery.where('d.church_id', '=', churchId)
    }

    const results = await baseQuery
      .groupBy(['d.id', 'd.name', 'd.donor_type', 'cc_role.name', 'cg.name'])
      .orderBy('total_amount', order)
      .limit(limit)
      .execute()

    return {
      success: true,
      data: results
    }

  } catch (error: any) {
    console.error('Fetch donor ranking error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '헌금자 순위 통계를 집계하는 중 오류가 발생했습니다.'
    })
  }
})
