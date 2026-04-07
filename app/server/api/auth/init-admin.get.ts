import bcrypt from 'bcryptjs'
import { db } from '../../utils/db'

export default defineEventHandler(async () => {
  try {
    // 1. 초기 시스템 교회(Tenant) 생성 또는 확인
    let church = await db.selectFrom('churches')
      .where('name', '=', '시스템 관리 교회')
      .selectAll()
      .executeTakeFirst()

    if (!church) {
      church = await db.insertInto('churches')
        .values({
          name: '시스템 관리 교회',
          is_active: true
        })
        .returningAll()
        .executeTakeFirstOrThrow()
    }

    // 2. 관리자 계정 생성 또는 확인
    const existing = await db.selectFrom('users')
      .where('login_id', '=', 'admin')
      .where('church_id', '=', church.id)
      .executeTakeFirst()

    if (existing) {
      return { success: true, message: 'Admin already exists' }
    }

    const hashedPassword = await bcrypt.hash('admin123!', 10)
    
    await db.insertInto('users')
      .values({
        church_id: church.id,
        login_id: 'admin',
        password_hash: hashedPassword,
        role: 1, // 최고관리자 (MASTER)
        is_active: true
      })
      .execute()

    return { success: true, message: 'Admin created: admin / admin123!' }
  } catch (error: any) {
    console.error('Init admin error:', error)
    return { success: false, error: error.message }
  }
})
