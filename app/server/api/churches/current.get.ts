import { db } from '../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  
  // 미들웨어에서 주입된 context.churchId 사용 (Master 권한 스위칭 대응)
  const churchId = event.context.churchId || session.user.church_id

  try {
    const church = await db.selectFrom('churches as c')
      .select([
        'c.id', 'c.name', 'c.representative_name', 'c.registration_number', 
        'c.address', 'c.phone_number', 'c.seal_image_path', 'c.logo_image_path', 
        'c.current_fiscal_year', 'c.closing_date', 'c.closed_by', 'c.is_active', 'c.created_at', 'c.updated_at',
      ])
      .where('c.id', '=', churchId)
      .executeTakeFirst()

    if (!church) {
      throw createError({
        statusCode: 404,
        statusMessage: '교회 정보를 찾을 수 없습니다.'
      })
    }

    let closedByName = '관리자'
    if (church.closed_by) {
      const user = await db.selectFrom('users as u')
        .leftJoin('members as m', 'u.member_id', 'm.id')
        .select(['u.login_id', 'm.name as member_name'])
        .where('u.id', '=', church.closed_by as any) // UUID
        .executeTakeFirst()
        
      if (user) {
        closedByName = user.member_name || user.login_id
      }
    }

    return {
      success: true,
      data: {
        ...church,
        closedByName
      }
    }
  } catch (error: any) {
    console.error('Fetch current church error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '교회 정보를 불러오는 중 오류가 발생했습니다.'
    })
  }
})
