import { db } from './db'

export async function checkClosingDate(churchId: string, transactionDate: string | Date): Promise<void> {
  const church = await db.selectFrom('churches')
    .select('closing_date')
    .where('id', '=', churchId)
    .executeTakeFirst()

  if (church?.closing_date) {
    const closingDate = new Date(church.closing_date)
    const targetDate = new Date(transactionDate)
    
    // 시간 부분을 제거하고 순수 날짜만 비교
    closingDate.setHours(0, 0, 0, 0)
    targetDate.setHours(0, 0, 0, 0)

    if (targetDate <= closingDate) {
      throw createError({
        statusCode: 403,
        statusMessage: '마감된 기간의 데이터는 수정하거나 삭제할 수 없습니다.'
      })
    }
  }
}
