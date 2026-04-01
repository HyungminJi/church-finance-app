import { db } from '../../utils/db'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  try {
    // 각 자금별 현재 잔액 계산 (초기이월금 + 수입 - 지출)
    const funds = await db.selectFrom('funds as f')
      .leftJoin(
        db.selectFrom('transactions as t')
          .innerJoin('accounts as a', 't.account_code', 'a.code')
          .select([
            't.fund_id',
            // SUM 결과를 명시적으로 BIGINT로 캐스팅하여 숫자 타입 보장
            sql<number>`SUM(CASE WHEN a.type = 'INCOME' THEN t.amount ELSE -t.amount END)::BIGINT`.as('tx_balance')
          ])
          .groupBy('t.fund_id')
          .as('t_sum'),
        'f.id',
        't_sum.fund_id'
      )
      .select([
        'f.id',
        'f.name',
        'f.bank_name',
        'f.account_number',
        'f.book_type',
        'f.category',
        'f.initial_balance',
        'f.description',
        'f.is_active',
        // 최종 계산 결과도 BIGINT로 캐스팅
        sql<number>`(COALESCE(f.initial_balance, 0) + COALESCE(t_sum.tx_balance, 0))::BIGINT`.as('current_balance'),
        'f.created_at'
      ])
      .orderBy(sql`CASE WHEN f.name ~ '^[0-9]' THEN 0 ELSE 1 END`, 'asc') // 자연어 정렬 적용
      .orderBy(sql`CAST(NULLIF(regexp_replace(f.name, '[^0-9]', '', 'g'), '') AS INTEGER) ASC NULLS LAST`)
      .orderBy('f.name', 'asc')
      .execute()
    
    return {
      success: true,
      data: funds
    }
  } catch (error: any) {
    console.error('Fetch funds error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '자금 목록을 가져오는 중 오류가 발생했습니다.'
    })
  }
})
