import { db } from '../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: '로그인이 필요합니다.' })
  }

  const body = await readBody(event)
  const { member_id, target_year, total_amount, address, notes } = body

  if (!member_id || !target_year) {
    throw createError({ statusCode: 400, statusMessage: '필수 정보(성도ID, 대상연도)가 누락되었습니다.' })
  }

  try {
    const result = await db.transaction().execute(async (trx) => {
      // 1. 현재 로그인한 사용자의 실제 UUID(id) 조회
      const user = await trx.selectFrom('users')
        .select('id')
        .where('login_id', '=', session.user!.login_id)
        .executeTakeFirstOrThrow()

      // 2. 해당 연도의 마지막 일련번호 확인 및 다음 번호 생성
      const lastReceipt = await trx.selectFrom('receipts')
        .select('receipt_number')
        .where('target_year', '=', target_year)
        .orderBy('receipt_number', 'desc')
        .executeTakeFirst()

      let nextSeq = 1
      if (lastReceipt && lastReceipt.receipt_number.includes('-')) {
        const lastSeq = parseInt(lastReceipt.receipt_number.split('-')[1])
        if (!isNaN(lastSeq)) nextSeq = lastSeq + 1
      }
      const receiptNumber = `${target_year}-${nextSeq.toString().padStart(4, '0')}`

      // 3. 영수증 레코드 생성
      const newReceipt = await trx.insertInto('receipts')
        .values({
          receipt_number: receiptNumber,
          member_id: member_id,
          target_year: parseInt(target_year),
          total_amount: Number(total_amount),
          status: 'ISSUED',
          notes: notes || null,
          issued_by: user.id, // 정확한 UUID 저장
          issued_date: sql`CURRENT_DATE`
        })
        .returningAll()
        .executeTakeFirstOrThrow()

      // 4. 성도 상세 정보(주소 등) 업데이트
      if (address) {
        await trx.updateTable('members')
          .set({ address })
          .where('id', '=', member_id)
          .execute()
      }

      return newReceipt
    })

    return {
      success: true,
      data: result
    }

  } catch (error: any) {
    console.error('Create receipt error:', error)
    // 외래키 제약 조건이나 데이터 타입 에러 등을 상세히 로깅
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '기부금 영수증 발급 중 오류가 발생했습니다.'
    })
  }
})
