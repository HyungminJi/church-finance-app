import { db } from '../../utils/db'
import { UserRole } from '../../../types/auth'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  
  // 미들웨어에서 주입된 context 정보
  const churchId = event.context.churchId || session.user.church_id
  const userRole = event.context.userRole

  // 오직 Master 권한만 실행 가능
  if (userRole !== UserRole.MASTER) {
    throw createError({
      statusCode: 403,
      statusMessage: '데이터 강제 보정 권한이 없습니다. (Master 전용)'
    })
  }

  try {
    const result = await db.transaction().execute(async (trx) => {
      let stats = {
        updatedTransactions: 0,
        insertedCarryovers: 0,
        zeroedFunds: 0
      }

      // 1. 통장 정보가 누락된 전표를 주 통장(가장 오래된 통장)으로 강제 연결
      // 주 통장 찾기
      const mainFund = await trx.selectFrom('funds')
        .select('id')
        .where('church_id', '=', churchId)
        .where('is_active', '=', true)
        .orderBy('created_at', 'asc')
        .executeTakeFirst()

      if (mainFund) {
        const updateResult = await trx.updateTable('transactions')
          .set({ fund_id: mainFund.id })
          .where('fund_id', 'is', null)
          .where('church_id', '=', churchId)
          .executeTakeFirst()
        
        stats.updatedTransactions = Number(updateResult.numUpdatedRows)
      }

      // 2. 통장 기초 잔액을 전년이월금(90-04) 전표로 전환
      const fundsWithBalance = await trx.selectFrom('funds')
        .select(['id', 'initial_balance'])
        .where('church_id', '=', churchId)
        .where('initial_balance', '>', 0)
        .execute()

      if (fundsWithBalance.length > 0) {
        // 현재 연도의 1월 1일을 기준으로 설정
        const currentYear = new Date().getFullYear()
        const carryoverDate = `${currentYear}-01-01`

        await trx.insertInto('transactions')
          .values(fundsWithBalance.map(fund => ({
            id: sql`gen_random_uuid()`,
            church_id: churchId,
            transaction_date: carryoverDate,
            account_code: '90-04',
            amount: fund.initial_balance,
            fund_id: fund.id,
            description: '기초 자산 이월 (시스템 자동보정)'
          })))
          .execute()
          
        stats.insertedCarryovers = fundsWithBalance.length

        // 3. 모든 통장의 기초 잔액을 0으로 초기화
        const updateFundsResult = await trx.updateTable('funds')
          .set({ initial_balance: 0 })
          .where('church_id', '=', churchId)
          .executeTakeFirst()
          
        stats.zeroedFunds = Number(updateFundsResult.numUpdatedRows)
      }

      return stats
    })

    return {
      success: true,
      message: `데이터 보정이 완료되었습니다. (연결된 전표: ${result.updatedTransactions}건, 생성된 이월금 전표: ${result.insertedCarryovers}건)`,
      data: result
    }
  } catch (error: any) {
    console.error('Data correction error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || '데이터 강제 보정 중 오류가 발생했습니다.'
    })
  }
})
