import { db } from '../../../utils/db'
import { UserRole } from '../../../../types/auth'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  
  if (session.user.role !== UserRole.MASTER) {
    throw createError({ statusCode: 403, statusMessage: 'Master 권한이 필요합니다.' })
  }

  const body = await readBody(event)
  const { name, representative_name, registration_number, phone_number, address, current_fiscal_year } = body

  if (!name || name.trim() === '') {
    throw createError({ statusCode: 400, statusMessage: '교회 이름을 입력해 주세요.' })
  }

  try {
    const newChurch = await db.insertInto('churches')
      .values({
        name: name.trim(),
        representative_name: representative_name || null,
        registration_number: registration_number || null,
        phone_number: phone_number || null,
        address: address || null,
        current_fiscal_year: current_fiscal_year || null,
        is_active: true
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    return { success: true, data: newChurch, message: '새로운 교회가 성공적으로 등록되었습니다.' }
  } catch (error: any) {
    console.error('Create church error:', error)
    throw createError({ statusCode: 500, statusMessage: '교회 등록 중 오류가 발생했습니다.' })
  }
})
