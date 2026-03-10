import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const members = body.members

  if (!Array.isArray(members) || members.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: '등록할 데이터가 없습니다.'
    })
  }

  try {
    // 1. 구역 및 직분 정보 미리 조회 (매핑용)
    const [cellGroups, roles] = await Promise.all([
      db.selectFrom('cell_groups').selectAll().execute(),
      db.selectFrom('common_codes')
        .where('group_code', '=', 'CHURCH_ROLE')
        .selectAll()
        .execute()
    ])

    // 2. 이름 -> ID/코드 매핑 맵 생성
    const groupMap = new Map(cellGroups.map(g => [g.name, g.id]))
    const roleMap = new Map(roles.map(r => [r.name, r.code]))

    // 3. 데이터 가공 (batch insert용)
    const insertData = members.map((m: any) => ({
      name: m['성함'] || m['이름'],
      phone_number: m['연락처'] || m['전화번호'],
      spouse_name: m['배우자'] || null,
      birth_date: m['생년월일'] ? new Date(m['생년월일']) : null,
      email: m['이메일'] || null,
      address: m['주소'] || null,
      postcode: m['우편번호'] || null,
      detail_address: m['상세주소'] || null,
      church_role: roleMap.get(m['직분']) || null,
      cell_group_id: groupMap.get(m['구역명']) || null
    })).filter(m => m.name && m.phone_number) // 필수값 없는 행 제외

    if (insertData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '유효한 성도 데이터가 없습니다. 성함과 연락처를 확인해 주세요.'
      })
    }

    // 4. Batch Insert 실행
    await db.insertInto('members')
      .values(insertData)
      .execute()

    return {
      success: true,
      count: insertData.length
    }
  } catch (error: any) {
    console.error('Bulk insert error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '데이터 저장 중 오류가 발생했습니다.'
    })
  }
})
