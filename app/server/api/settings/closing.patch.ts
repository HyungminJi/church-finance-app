import { db } from '../../utils/db'
import { UserRole } from '../../../types/auth'
import { sql } from 'kysely'

// 자동 이월 전표의 적요(description)에 포함되는 식별 키워드
const CARRYFORWARD_DESCRIPTION_PREFIX = '전년이월금 (자동 마감)'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody(event)
  
  const churchId = event.context.churchId || session.user.church_id
  const userRole = event.context.userRole

  // Manager(2) 이상의 권한만 장부 마감 가능
  if (userRole > UserRole.MANAGER) {
    throw createError({
      statusCode: 403,
      statusMessage: '장부 마감 권한이 없습니다.'
    })
  }

  const { closing_date, current_fiscal_year } = body

  try {
    // 회계 기수만 변경하는 경우 (이월 로직 불필요)
    if (current_fiscal_year !== undefined && closing_date === undefined) {
      const updateData: any = {
        current_fiscal_year: current_fiscal_year || null,
        updated_at: new Date()
      }

      const result = await db.updateTable('churches')
        .set(updateData)
        .where('id', '=', churchId)
        .executeTakeFirst()

      if (Number(result.numUpdatedRows) === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: '교회 정보를 찾을 수 없습니다.'
        })
      }

      return {
        success: true,
        message: '회계 기수가 설정되었습니다.',
        data: { current_fiscal_year }
      }
    }

    // ===== 장부 마감/해제 처리 (이월 프로세스 포함) =====
    const result = await db.transaction().execute(async (trx) => {
      // 1. 현재 교회의 회계 기수 확인
      const church = await trx.selectFrom('churches')
        .select(['current_fiscal_year', 'closing_date'])
        .where('id', '=', churchId)
        .executeTakeFirst()

      if (!church) {
        throw createError({
          statusCode: 404,
          statusMessage: '교회 정보를 찾을 수 없습니다.'
        })
      }

      const fiscalYear = church.current_fiscal_year || new Date().getFullYear()
      const nextFiscalYear = fiscalYear + 1
      const carryforwardDate = `${nextFiscalYear}-01-01`
      const carryforwardDescription = `${CARRYFORWARD_DESCRIPTION_PREFIX} - ${fiscalYear}년도`

      // ===== 마감 해제(closing_date = null) 처리 =====
      if (!closing_date) {
        // 기존에 자동 생성된 이월 전표 롤백(삭제)
        const deletedRows = await trx.deleteFrom('transactions')
          .where('church_id', '=', churchId)
          .where('account_code', '=', '90-04')
          .where('description', 'like', `${CARRYFORWARD_DESCRIPTION_PREFIX}%`)
          .execute()

        const deletedCount = deletedRows.length > 0 ? Number(deletedRows[0].numDeletedRows) : 0

        // churches 테이블 마감 해제
        await trx.updateTable('churches')
          .set({
            closing_date: null,
            closed_by: null,
            updated_at: new Date()
          })
          .where('id', '=', churchId)
          .execute()

        return {
          action: 'unlock' as const,
          message: `마감이 해제되었습니다. (롤백된 이월 전표: ${deletedCount}건)`,
          deletedCarryforwards: deletedCount,
          insertedCarryforwards: 0,
          carryforwardDetails: [] as any[]
        }
      }

      // ===== 마감 적용(closing_date 설정) + 자동 이월 프로세스 =====

      // 2. 기존 자동 이월 전표가 이미 있는지 확인 (중복 방지)
      const existingAutoCarryforwards = await trx.selectFrom('transactions')
        .select('id')
        .where('church_id', '=', churchId)
        .where('account_code', '=', '90-04')
        .where('description', 'like', `${CARRYFORWARD_DESCRIPTION_PREFIX}%`)
        .where('transaction_date', '=', carryforwardDate)
        .execute()

      // 이미 존재하면 먼저 삭제 (재마감 시나리오: 날짜/금액 변경 가능성)
      if (existingAutoCarryforwards.length > 0) {
        await trx.deleteFrom('transactions')
          .where('church_id', '=', churchId)
          .where('account_code', '=', '90-04')
          .where('description', 'like', `${CARRYFORWARD_DESCRIPTION_PREFIX}%`)
          .where('transaction_date', '=', carryforwardDate)
          .execute()
      }

      // 3. 통장별 현재 회계연도의 잔액 계산
      //    잔액 = initial_balance + SUM(INCOME 전표) - SUM(EXPENSE 전표)
      //    (마감일 이전의 모든 전표를 대상으로 계산)
      const fundBalances = await trx.selectFrom('funds as f')
        .leftJoin(
          trx.selectFrom('transactions as t')
            .innerJoin('accounts as a', (join) =>
              join
                .onRef('t.account_code', '=', 'a.code')
                .on('a.church_id', '=', churchId)
            )
            .select([
              't.fund_id',
              sql<number>`SUM(CASE WHEN a.type = 'INCOME' THEN t.amount ELSE -t.amount END)::BIGINT`.as('tx_balance')
            ])
            .where('t.church_id', '=', churchId)
            .where('t.transaction_date', '<=', closing_date)
            .groupBy('t.fund_id')
            .as('t_sum'),
          'f.id',
          't_sum.fund_id'
        )
        .select([
          'f.id',
          'f.name',
          'f.initial_balance',
          sql<number>`(COALESCE(f.initial_balance, 0) + COALESCE(t_sum.tx_balance, 0))::BIGINT`.as('closing_balance')
        ])
        .where('f.church_id', '=', churchId)
        .where('f.is_active', '=', true)
        .execute()

      // 4. 잔액이 있는 통장에 대해 이월 전표 생성
      let insertedCount = 0
      const carryforwardDetails: { fundName: string; amount: number }[] = []

      for (const fund of fundBalances) {
        const balance = Number(fund.closing_balance)

        // 잔액이 0이면 이월할 필요 없음
        if (balance === 0) continue

        // 이월 전표 생성 (잔액이 양수든 음수든 모두 이월)
        // 양수: 정상적인 자산 이월 (INCOME 90-04)
        // 금액은 항상 양의 절대값으로 저장 (회계 원칙: amount는 절대값)
        await trx.insertInto('transactions')
          .values({
            id: sql`gen_random_uuid()`,
            church_id: churchId,
            transaction_date: carryforwardDate,
            account_code: '90-04',
            amount: Math.abs(balance),
            fund_id: fund.id,
            donor_id: null,
            description: carryforwardDescription
          })
          .execute()

        insertedCount++
        carryforwardDetails.push({
          fundName: fund.name,
          amount: balance
        })
      }

      // 5. churches 테이블에 마감 정보 업데이트
      await trx.updateTable('churches')
        .set({
          closing_date: closing_date,
          closed_by: session.user.id,
          updated_at: new Date()
        })
        .where('id', '=', churchId)
        .execute()

      return {
        action: 'lock' as const,
        message: `장부가 성공적으로 마감되었습니다. (생성된 이월 전표: ${insertedCount}건)`,
        deletedCarryforwards: existingAutoCarryforwards.length,
        insertedCarryforwards: insertedCount,
        carryforwardDetails
      }
    })

    return {
      success: true,
      message: result.message,
      data: {
        closing_date: closing_date || null,
        closed_by: closing_date ? session.user.id : null,
        insertedCarryforwards: result.insertedCarryforwards,
        deletedCarryforwards: result.deletedCarryforwards,
        carryforwardDetails: result.carryforwardDetails
      }
    }
  } catch (error: any) {
    console.error('Update closing date error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '장부 마감 처리 중 오류가 발생했습니다.'
    })
  }
})
