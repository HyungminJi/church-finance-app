import { db } from '../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const type = query.type as 'MEMBER' | 'CELL_GROUP' | 'ORGANIZATION' | 'ALL'
  
  // 페이징 및 필터 파라미터 추출
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const offset = (page - 1) * limit
  const keyword = query.keyword as string
  const phone = query.phone as string
  const status = query.status as 'CURRENT' | 'REMOVED' | 'ALL'
  const cellGroupId = query.cellGroupId as string
  const role = query.role as string
  const orgType = query.orgType as string

  try {
    // 1. 성도(MEMBER) 조회 로직
    if (type === 'MEMBER') {
      let baseQuery = db.selectFrom('donors as d')
        .innerJoin('members as m', 'd.id', 'm.donor_id')
        .leftJoin('common_codes as cc', (join) => join
          .onRef('m.church_role', '=', 'cc.code')
          .on('cc.group_code', '=', 'CHURCH_ROLE')
        )
        .leftJoin('cell_groups as cg', 'm.cell_group_id', 'cg.id')
        .leftJoin('users as u', 'm.id', 'u.member_id')
        .where('d.donor_type', '=', 'MEMBER')

      // 필터 적용
      if (keyword) {
        // 이름 또는 전화번호(하이픈 무시)로 검색 범위 확대
        const rawKeyword = keyword.replace(/[^0-9]/g, '')
        baseQuery = baseQuery.where((eb) => eb.or([
          eb('d.name', 'ilike', `%${keyword}%`),
          eb(sql`REPLACE(m.phone_number, '-', '')`, 'like', `%${rawKeyword}%`)
        ]))
      }

      if (phone) {
        // 명시적 전화번호 필터 (하이픈 무시)
        const rawPhone = phone.replace(/[^0-9]/g, '')
        baseQuery = baseQuery.where(sql`REPLACE(m.phone_number, '-', '')`, 'like', `%${rawPhone}%`)
      }
      
      // 출석/제적 필터 (매우 정교한 처리)
      if (!status || status === 'CURRENT') {
        baseQuery = baseQuery.where('m.removed_date', 'is', null)
      } else if (status === 'REMOVED') {
        baseQuery = baseQuery.where('m.removed_date', 'is not', null)
      }
      // status === 'ALL' 이면 추가 필터 없음

      if (cellGroupId) {
        baseQuery = baseQuery.where('m.cell_group_id', '=', cellGroupId)
      }
      if (role) {
        baseQuery = baseQuery.where('m.church_role', '=', parseInt(role))
      }

      // 총 개수 조회 (페이징용)
      const totalRes = await baseQuery.select(db.fn.count('d.id').as('count')).executeTakeFirstOrThrow()
      const totalCount = Number(totalRes.count)

      // 데이터 조회
      const results = await baseQuery
        .select([
          'd.id as donor_id',
          'd.donor_type',
          'm.id as member_id',
          'm.name',
          'm.phone_number',
          'm.email',
          'm.spouse_name',
          'm.birth_date',
          'm.church_role',
          'cc.name as church_role_name',
          'm.cell_group_id',
          'cg.name as cell_group_name',
          'm.removed_date',
          'u.id as user_id',
          'u.login_id',
          'u.role as user_role',
          'd.created_at'
        ])
        .orderBy('m.name', 'asc')
        .limit(limit)
        .offset(offset)
        .execute()

      // [추가] 전체 성도 통계 (필터와 무관)
      const globalStats = await db.selectFrom('members')
        .select([
          db.fn.count('id').as('total'),
          sql<number>`COUNT(CASE WHEN removed_date IS NULL THEN 1 END)`.as('current'),
          sql<number>`COUNT(CASE WHEN removed_date IS NOT NULL THEN 1 END)`.as('removed')
        ])
        .executeTakeFirstOrThrow()

      return {
        success: true,
        data: results,
        pagination: {
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          page,
          limit
        },
        stats: {
          total: Number(globalStats.total),
          current: Number(globalStats.current),
          removed: Number(globalStats.removed)
        }
      }
    }

    // 2. 구역/조직(CELL_GROUP) 조회 로직
    if (type === 'CELL_GROUP') {
      let baseQuery = db.selectFrom('donors as d')
        .innerJoin('cell_groups as cg', 'd.id', 'cg.donor_id')
        .leftJoin('members as m', 'cg.leader_id', 'm.id')
        .leftJoin('donors as ld', 'm.donor_id', 'ld.id')
        .where('d.donor_type', '=', 'CELL_GROUP')

      if (keyword) {
        baseQuery = baseQuery.where('d.name', 'ilike', `%${keyword}%`)
      }
      
      const parent = query.parent as string
      if (parent && parent !== 'all') {
        baseQuery = baseQuery.where('cg.parent_group', '=', parent)
      }

      const isActive = query.isActive as string
      if (isActive && isActive !== 'all') {
        baseQuery = baseQuery.where('cg.is_active', '=', isActive === 'true')
      }

      const totalRes = await baseQuery.select(db.fn.count('d.id').as('count')).executeTakeFirstOrThrow()
      const totalCount = Number(totalRes.count)

      const results = await baseQuery
        .select([
          'd.id as donor_id',
          'd.donor_type',
          'cg.id as group_id',
          'cg.name',
          'cg.parent_group',
          'cg.is_active',
          'cg.leader_id',
          'ld.name as leader_name',
          'd.created_at'
        ])
        // 1차: 구역 명칭 패턴 가중치 (숫자+구역 형태 최우선)
        .orderBy(sql`CASE 
          WHEN cg.name ~ '^[0-9]+구역' THEN 0 
          WHEN cg.name ~ '[0-9]' THEN 1 
          ELSE 2 END`, 'asc')
        // 2차: 숫자 크기 정렬
        .orderBy(sql`CAST(NULLIF(regexp_replace(cg.name, '[^0-9]', '', 'g'), '') AS INTEGER) ASC NULLS LAST`)
        // 3차: 이진 유니코드 순서(C)로 가나다 정렬 강제
        .orderBy(sql`TRIM(cg.name) COLLATE "C"`, 'asc')
        .limit(limit)
        .offset(offset)
        .execute()

      // [추가] 필터용 상위 소속 목록 추출
      const parentGroupsRes = await db.selectFrom('cell_groups')
        .select('parent_group')
        .distinct()
        .where('parent_group', 'is not', null)
        .where('parent_group', '!=', '')
        .execute()
      const parentGroups = parentGroupsRes.map(r => r.parent_group)

      return {
        success: true,
        data: results,
        pagination: { totalCount, totalPages: Math.ceil(totalCount / limit), page, limit },
        parentGroups // 필터 UI용
      }
    }

    // 3. 외부기관(ORGANIZATION) 조회 로직
    if (type === 'ORGANIZATION') {
      let baseQuery = db.selectFrom('donors as d')
        .innerJoin('organizations as o', 'd.id', 'o.donor_id')
        .where('d.donor_type', '=', 'ORGANIZATION')

      if (keyword) {
        baseQuery = baseQuery.where('d.name', 'ilike', `%${keyword}%`)
      }
      if (orgType) {
        baseQuery = baseQuery.where('o.org_type', 'ilike', `%${orgType}%`)
      }

      const totalRes = await baseQuery.select(db.fn.count('d.id').as('count')).executeTakeFirstOrThrow()
      const totalCount = Number(totalRes.count)

      const results = await baseQuery
        .select([
          'd.id as donor_id',
          'd.donor_type',
          'o.id as org_id',
          'o.name',
          'o.org_type',
          'o.contact_info',
          'o.description',
          'o.is_active',
          'd.created_at'
        ])
        // 1차: 한글 우선 정렬 (가나다순 강제 가중치)
        .orderBy(sql`CASE 
          WHEN TRIM(o.name) ~ '^[가-힣]' THEN 0 
          ELSE 1 END`, 'asc')
        // 2차: 공백 제거 후 이진 유니코드 순서(C)로 가나다 정렬 강제
        .orderBy(sql`TRIM(o.name) COLLATE "C"`, 'asc')
        // 3차: 자연어 정렬 (숫자 포함 명칭 대응)
        .orderBy(sql`CAST(NULLIF(regexp_replace(o.name, '[^0-9]', '', 'g'), '') AS INTEGER) ASC NULLS LAST`)
        .limit(limit)
        .offset(offset)
        .execute()

      return {
        success: true,
        data: results,
        pagination: { totalCount, totalPages: Math.ceil(totalCount / limit), page, limit }
      }
    }

    // 기본값 (ALL 등): 슈퍼타입만 조회
    const results = await db.selectFrom('donors').selectAll().orderBy('name', 'asc').execute()
    return { success: true, data: results }

  } catch (error: any) {
    console.error('Fetch donors error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '헌금자 정보를 가져오는 중 오류가 발생했습니다.'
    })
  }
})
