import { db } from '../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const type = query.type as 'MEMBER' | 'CELL_GROUP' | 'ORGANIZATION' | 'ALL'
  
  try {
    let baseQuery = db.selectFrom('donors as d')

    if (type === 'MEMBER') {
      return await db.selectFrom('donors as d')
        .innerJoin('members as m', 'd.id', 'm.donor_id')
        .leftJoin('common_codes as cc', (join) => join
          .onRef('m.church_role', '=', 'cc.code')
          .on('cc.group_code', '=', 'CHURCH_ROLE')
        )
        .select([
          'd.id as donor_id',
          'd.donor_type',
          'm.id as member_id',
          'm.name',
          'm.phone_number',
          'cc.name as church_role_name',
          'm.cell_group_id',
          'd.created_at'
        ])
        .where('d.donor_type', '=', 'MEMBER')
        .orderBy('m.name', 'asc')
        .execute()
    }

    if (type === 'CELL_GROUP') {
      return await db.selectFrom('donors as d')
        .innerJoin('cell_groups as cg', 'd.id', 'cg.donor_id')
        .select([
          'd.id as donor_id',
          'd.donor_type',
          'cg.id as group_id',
          'cg.name',
          'cg.leader_id',
          'd.created_at'
        ])
        .where('d.donor_type', '=', 'CELL_GROUP')
        .orderBy('cg.name', 'asc')
        .execute()
    }

    if (type === 'ORGANIZATION') {
      return await db.selectFrom('donors as d')
        .innerJoin('organizations as o', 'd.id', 'o.donor_id')
        .select([
          'd.id as donor_id',
          'd.donor_type',
          'o.id as org_id',
          'o.name',
          'o.org_type',
          'o.contact_info',
          'o.is_active',
          'd.created_at'
        ])
        .where('d.donor_type', '=', 'ORGANIZATION')
        .orderBy('o.name', 'asc')
        .execute()
    }

    // ALL 또는 기본값: 간단한 목록만 반환
    const donors = await db.selectFrom('donors')
      .selectAll()
      .orderBy('name', 'asc')
      .execute()

    return {
      success: true,
      data: donors
    }

  } catch (error: any) {
    console.error('Fetch donors error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '헌금자 목록을 가져오는 중 오류가 발생했습니다.'
    })
  }
})
