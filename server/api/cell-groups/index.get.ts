import { db } from '../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const searchName = query.name as string
  const searchParent = query.parent as string
  const isActive = query.isActive as string

  try {
    let baseQuery = db.selectFrom('cell_groups')
      .leftJoin('members as leader', 'cell_groups.leader_id', 'leader.id')
      .select([
        'cell_groups.id',
        'cell_groups.name',
        'cell_groups.leader_id',
        'cell_groups.parent_group',
        'cell_groups.is_active',
        'cell_groups.created_at',
        'leader.name as leader_name'
      ])

    if (searchName) {
      baseQuery = baseQuery.where('cell_groups.name', 'ilike', `%${searchName}%`)
    }
    if (searchParent && searchParent !== 'all') {
      baseQuery = baseQuery.where('cell_groups.parent_group', '=', searchParent)
    }
    if (isActive !== undefined && isActive !== 'all') {
      baseQuery = baseQuery.where('cell_groups.is_active', '=', isActive === 'true')
    }

    const cellGroups = await baseQuery
      .orderBy('cell_groups.parent_group', 'asc')
      .orderBy(sql`CASE WHEN cell_groups.name ~ '[0-9]' THEN CAST(regexp_replace(cell_groups.name, '[^0-9]', '', 'g') AS NUMERIC) ELSE NULL END ASC NULLS LAST`)
      .orderBy('cell_groups.name', 'asc')
      .execute()

    // 상위 소속(parent_group) 목록 추출 (필터용)
    const parentGroupsResult = await db.selectFrom('cell_groups')
      .select([
        'parent_group',
        sql`CASE WHEN parent_group ~ '[0-9]' THEN CAST(regexp_replace(parent_group, '[^0-9]', '', 'g') AS NUMERIC) ELSE NULL END`.as('sort_val')
      ])
      .distinct()
      .where('parent_group', 'is not', null)
      .orderBy('sort_val', 'asc')
      .orderBy('parent_group', 'asc')
      .execute()
    const parentGroups = parentGroupsResult.map(r => r.parent_group)

    return {
      success: true,
      data: cellGroups,
      parentGroups
    }
  } catch (error: any) {
    console.error('Fetch cell groups error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '구역 목록 조회 중 오류가 발생했습니다.'
    })
  }
})
