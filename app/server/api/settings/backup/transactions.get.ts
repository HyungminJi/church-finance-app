import { db } from '../../../utils/db'
import { UserRole, SYSTEM_CHURCH_ID } from '../../../../types/auth'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  
  // 미들웨어에서 주입된 context 정보
  const churchId = event.context.churchId || session.user.church_id
  const userRole = event.context.userRole

  // Admin(1) 이상의 권한만 데이터 백업 가능
  if (userRole > UserRole.ADMIN) {
    throw createError({
      statusCode: 403,
      statusMessage: '데이터 백업 권한이 없습니다.'
    })
  }

  try {
    let baseQuery = db.selectFrom('transactions as t')
      .leftJoin('accounts as a', 't.account_code', 'a.code')
      .leftJoin('funds as f', 't.fund_id', 'f.id')
      .leftJoin('donors as d', 't.donor_id', 'd.id')
      .select([
        't.id',
        sql<string>`to_char(t.transaction_date, 'YYYY-MM-DD')`.as('date'),
        'a.name as account_name',
        'a.type as account_type',
        'f.name as fund_name',
        'd.name as donor_name',
        't.amount',
        't.description',
        sql<string>`to_char(t.created_at, 'YYYY-MM-DD HH24:MI:SS')`.as('created_at')
      ])
      .orderBy('t.transaction_date', 'asc')

    // Master 권한이고 특정 교회로 스위칭하지 않은 상태(SYSTEM_CHURCH_ID)라면 전체 교회의 데이터를 추출
    if (userRole === UserRole.MASTER && churchId === SYSTEM_CHURCH_ID) {
      baseQuery = baseQuery
        .innerJoin('churches as c', 't.church_id', 'c.id')
        .select('c.name as church_name') as any // 본사일 경우 소속 교회 이름 추가
    } else {
      // 일반 Admin이거나 Master가 특정 교회로 스위칭한 경우
      baseQuery = baseQuery.where('t.church_id', '=', churchId)
    }

    const transactions = await baseQuery.execute()

    return {
      success: true,
      data: transactions
    }
  } catch (error: any) {
    console.error('Backup transactions error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '전표 데이터 백업 중 오류가 발생했습니다.'
    })
  }
})
