import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const tab = (query.tab as string) || 'CURRENT'
  const offset = (page - 1) * limit

  // 검색 파라미터 추출
  const searchName = query.name as string
  const searchPhone = query.phone as string
  const searchEmail = query.email as string
  const searchCellGroupId = query.cellGroupId as string
  const searchRole = query.role as string // 'null' 문자열 또는 숫자 문자열

  try {
    let baseQuery = db.selectFrom('members')
      .leftJoin('cell_groups', 'members.cell_group_id', 'cell_groups.id')
      .leftJoin('users', 'members.id', 'users.member_id')
      .leftJoin('common_codes', (join) => join
        .onRef('members.church_role', '=', 'common_codes.code')
        .on('common_codes.group_code', '=', 'CHURCH_ROLE')
      )
    
    // 탭 필터링
    if (tab === 'CURRENT') {
      baseQuery = baseQuery.where('members.removed_date', 'is', null)
    } else {
      baseQuery = baseQuery.where('members.removed_date', 'is not', null)
    }

    // 상세 검색 필터링 (LIKE 및 일치 검색)
    if (searchName) {
      baseQuery = baseQuery.where('members.name', 'ilike', `%${searchName}%`)
    }
    if (searchPhone) {
      baseQuery = baseQuery.where('members.phone_number', 'ilike', `%${searchPhone}%`)
    }
    if (searchEmail) {
      baseQuery = baseQuery.where('members.email', 'ilike', `%${searchEmail}%`)
    }
    if (searchCellGroupId && searchCellGroupId !== 'all') {
      baseQuery = baseQuery.where('members.cell_group_id', '=', searchCellGroupId)
    }
    if (searchRole) {
      if (searchRole === 'none') {
        baseQuery = baseQuery.where('members.church_role', 'is', null)
      } else if (searchRole !== 'all') {
        baseQuery = baseQuery.where('members.church_role', '=', parseInt(searchRole))
      }
    }

    // 전체 개수 조회
    const countResult = await baseQuery
      .select(({ fn }) => [fn.countAll().as('total')])
      .executeTakeFirst()
    
    const totalCount = parseInt(countResult?.total as string) || 0

    // 페이징된 데이터 조회
    const members = await baseQuery
      .select([
        'members.id',
        'members.name',
        'members.phone_number',
        'members.spouse_name',
        'members.birth_date',
        'members.address',
        'members.postcode',
        'members.detail_address',
        'members.is_user',
        'members.removed_date',
        'members.email',
        'members.church_role',
        'members.cell_group_id',
        'cell_groups.name as cell_group_name',
        'common_codes.name as church_role_name',
        'users.id as user_id',
        'users.role as user_role'
      ])
      .orderBy('members.created_at', 'desc')
      .orderBy('members.name', 'asc')
      .limit(limit)
      .offset(offset)
      .execute()

    // 통계 조회
    const statsResult = await db.selectFrom('members')
      .select((eb) => [
        eb.selectFrom('members')
          .where('removed_date', 'is', null)
          .select((eb) => eb.fn.countAll().as('count'))
          .as('currentCount'),
        eb.selectFrom('members')
          .where('removed_date', 'is not', null)
          .select((eb) => eb.fn.countAll().as('count'))
          .as('removedCount')
      ])
      .executeTakeFirst()

    return {
      success: true,
      data: members,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      stats: {
        current: parseInt(statsResult?.currentCount as string) || 0,
        removed: parseInt(statsResult?.removedCount as string) || 0
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || '데이터베이스 조회 중 오류가 발생했습니다.'
    })
  }
})
