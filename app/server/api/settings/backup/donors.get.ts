import { db } from '../../../utils/db'
import { UserRole, SYSTEM_CHURCH_ID } from '../../../../types/auth'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  
  // 미들웨어에서 주입된 context 정보
  const churchId = event.context.churchId || session.user.church_id
  const userRole = event.context.userRole

  // Manager(2) 이상의 권한만 데이터 백업 가능
  if (userRole > UserRole.MANAGER) {
    throw createError({
      statusCode: 403,
      statusMessage: '데이터 백업 권한이 없습니다.'
    })
  }

  try {
    let baseQuery = db.selectFrom('donors as d')
      .leftJoin('members as m', 'd.id', 'm.donor_id')
      .leftJoin('cell_groups as cg', 'm.cell_group_id', 'cg.id')
      .leftJoin('common_codes as cc_role', (join: any) => join
        .onRef('m.church_role', '=', 'cc_role.code')
        .on('cc_role.group_code', '=', 'CHURCH_ROLE')
      )
      .select([
        'd.id',
        'd.donor_type',
        'd.name',
        'm.phone_number',
        'm.spouse_name',
        sql<string>`to_char(m.birth_date, 'YYYY-MM-DD')`.as('birth_date'),
        'm.address',
        'm.detail_address',
        'cc_role.name as church_role_name',
        'cg.name as cell_group_name',
        'm.is_user'
      ])
      .orderBy('d.name', 'asc')

    // Master 권한이고 특정 교회로 스위칭하지 않은 상태(SYSTEM_CHURCH_ID)라면 전체 교회의 데이터를 추출
    if (userRole === UserRole.MASTER && churchId === SYSTEM_CHURCH_ID) {
      baseQuery = baseQuery
        .innerJoin('churches as c', 'd.church_id', 'c.id')
        .select('c.name as church_name') as any // 본사일 경우 소속 교회 이름 추가
    } else {
      // 일반 Admin이거나 Master가 특정 교회로 스위칭한 경우
      baseQuery = baseQuery.where('d.church_id', '=', churchId)
    }

    const donors = await baseQuery.execute()

    return {
      success: true,
      data: donors
    }
  } catch (error: any) {
    console.error('Backup donors error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '성도/헌금자 데이터 백업 중 오류가 발생했습니다.'
    })
  }
})
