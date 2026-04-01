import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { data, roleMap: rawRoleMap, groupMap: rawGroupMap } = body

  const roleMap = new Map(Object.entries(rawRoleMap))
  const groupMap = new Map(Object.entries(rawGroupMap))

  try {
    const finalCount = await db.transaction().execute(async (trx) => {
      const results = []
      for (const m of data) {
        const name = m['성함'] || m['이름']
        const phone = m['연락처'] || m['전화번호']
        if (!name || !phone) continue

        // 1. 도너 수퍼타입 레코드 생성
        const donor = await trx.insertInto('donors')
          .values({ 
            donor_type: 'MEMBER',
            name: name
          })
          .returning('id')
          .executeTakeFirstOrThrow()

        // 2. 성도 데이터 구성
        results.push({
          donor_id: donor.id,
          name: name,
          phone_number: phone,
          spouse_name: m['배우자'] || null,
          birth_date: m['생년월일'] ? new Date(m['생년월일']) : null,
          email: m['이메일'] || null,
          address: m['주소'] || null,
          postcode: m['우편번호'] || null,
          detail_address: m['상세주소'] || null,
          church_role: (roleMap.get(m['직분']) as number) || null,
          cell_group_id: (groupMap.get(m['구역명']) as string) || null
        })
      }

      if (results.length > 0) {
        await trx.insertInto('members').values(results as any).execute()
      }
      return results.length
    })

    return {
      success: true,
      count: finalCount
    }
  } catch (error: any) {
    console.error('Bulk insert error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '대량 등록 중 오류가 발생했습니다.'
    })
  }
})
