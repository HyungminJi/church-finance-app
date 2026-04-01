import bcrypt from 'bcryptjs'
import { db } from '../../utils/db'

export default defineEventHandler(async () => {
  try {
    const existing = await db.selectFrom('users')
      .where('login_id', '=', 'admin')
      .executeTakeFirst()

    if (existing) {
      return { success: true, message: 'Admin already exists' }
    }

    const hashedPassword = await bcrypt.hash('admin123!', 10)
    
    await db.insertInto('users')
      .values({
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
