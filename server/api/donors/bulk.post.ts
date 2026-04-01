import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { donors, type } = body

  if (!donors || !Array.isArray(donors) || donors.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '등록할 데이터가 없습니다.' })
  }

  try {
    const count = await db.transaction().execute(async (trx) => {
      let successCount = 0

      for (const item of donors) {
        if (type === 'MEMBER') {
          // 1. donor 생성
          const donor = await trx.insertInto('donors')
            .values({
              donor_type: 'MEMBER',
              name: item['성함'] || item['이름']
            })
            .returning('id')
            .executeTakeFirstOrThrow()

          // 2. member 상세 생성
          await trx.insertInto('members')
            .values({
              donor_id: donor.id,
              name: item['성함'] || item['이름'],
              phone_number: item['연락처'] || '',
              spouse_name: item['배우자'],
              birth_date: item['생년월일'] ? new Date(item['생년월일']) : null,
              email: item['이메일'],
              address: item['주소'],
              postcode: item['우편번호'],
              detail_address: item['상세주소']
              // 직분, 구역 등은 이름 기반 매핑 로직 추가 가능 (우선 기본 필드 중심)
            })
            .execute()
          
          successCount++
        }
      }
      return successCount
    })

    return {
      success: true,
      count
    }

  } catch (error: any) {
    console.error('Bulk donor error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '대량 등록 중 오류가 발생했습니다.'
    })
  }
})
