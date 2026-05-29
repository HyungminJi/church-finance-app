import { db } from '../../utils/db'
import { UserRole, SYSTEM_CHURCH_ID } from '../../../types/auth'
import { sql } from 'kysely'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  
  const churchId = event.context.churchId || session.user.church_id
  const userRole = event.context.userRole

  try {
    // 1. 플랫폼 본사 모드 (Master & SYSTEM_CHURCH_ID)
    if (userRole === UserRole.MASTER && churchId === SYSTEM_CHURCH_ID) {
      // 전체 교회 수
      const churchesResult = await db.selectFrom('churches')
        .select(db.fn.count<string>('id').as('total_churches'))
        .where('id', '!=', SYSTEM_CHURCH_ID)
        .executeTakeFirst()

      // 전체 사용자 수 (본사 관리자 제외)
      const usersResult = await db.selectFrom('users')
        .select(db.fn.count<string>('id').as('total_users'))
        .where('church_id', '!=', SYSTEM_CHURCH_ID)
        .executeTakeFirst()

      // 최근 가입 교회 (최대 5개)
      const recentChurches = await db.selectFrom('churches')
        .select(['name', 'representative_name'])
        .select(sql<string>`to_char(created_at, 'YYYY-MM-DD')`.as('join_date'))
        .where('id', '!=', SYSTEM_CHURCH_ID)
        .orderBy('created_at', 'desc')
        .limit(5)
        .execute()

      return {
        success: true,
        mode: 'platform',
        data: {
          totalChurches: Number(churchesResult?.total_churches || 0),
          totalUsers: Number(usersResult?.total_users || 0),
          recentChurches
        }
      }
    }

    // 2. 일반 사용자 모드 (User - Level 3)
    if (userRole === UserRole.USER) {
      // 해당 사용자의 연동된 donor_id 찾기
      const currentUser = await db.selectFrom('users')
        .innerJoin('members', 'users.member_id', 'members.id')
        .select('members.donor_id')
        .where('users.id', '=', session.user.id)
        .executeTakeFirst()

      if (!currentUser?.donor_id) {
        return { success: true, mode: 'user', data: { totalDonation: 0, recentDonations: [] } }
      }

      const currentYear = new Date().getFullYear().toString()
      const startDate = `${currentYear}-01-01`
      const endDate = `${currentYear}-12-31`

      // 나의 올해 총 헌금액 (INCOME 계정만)
      const donationResult = await db.selectFrom('transactions as t')
        .innerJoin('accounts as a', 't.account_code', 'a.code')
        .select(sql<string>`sum(t.amount)`.as('total_amount'))
        .where('t.church_id', '=', churchId)
        .where('t.donor_id', '=', currentUser.donor_id)
        .where('a.type', '=', 'INCOME')
        .where('t.transaction_date', '>=', startDate)
        .where('t.transaction_date', '<=', endDate)
        .executeTakeFirst()

      // 최근 헌금 내역 5건
      const recentDonations = await db.selectFrom('transactions as t')
        .innerJoin('accounts as a', 't.account_code', 'a.code')
        .select(['a.name as account_name', 't.amount'])
        .select(sql<string>`to_char(t.transaction_date, 'YYYY-MM-DD')`.as('date'))
        .where('t.church_id', '=', churchId)
        .where('t.donor_id', '=', currentUser.donor_id)
        .where('a.type', '=', 'INCOME')
        .orderBy('t.transaction_date', 'desc')
        .orderBy('t.created_at', 'desc')
        .limit(5)
        .execute()

      return {
        success: true,
        mode: 'user',
        data: {
          totalDonation: Number(donationResult?.total_amount || 0),
          recentDonations
        }
      }
    }

    // 3. 테넌트 관리 모드 (Manager, Admin, Impersonating Master)
    const churchInfo = await db.selectFrom('churches')
      .select(['name', 'current_fiscal_year'])
      .where('id', '=', churchId)
      .executeTakeFirst()
    
    const churchName = churchInfo?.name || '우리교회'
    const targetYear = churchInfo?.current_fiscal_year || new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    const targetMonthStr = currentMonth.toString().padStart(2, '0')
    const startOfMonth = `${targetYear}-${targetMonthStr}-01`
    // 이번 달의 마지막 날 구하기
    const endOfMonthDate = new Date(targetYear, currentMonth, 0)
    const endOfMonth = `${targetYear}-${targetMonthStr}-${endOfMonthDate.getDate()}`

    // 3-1. 자산(통장) 총 잔액 계산
    // 각 통장별 (초기 잔액 + 전체 수입 - 전체 지출)
    const funds = await db.selectFrom('funds')
      .select(['id', 'initial_balance'])
      .where('church_id', '=', churchId)
      .execute()

    let totalAssets = 0
    for (const fund of funds) {
      totalAssets += Number(fund.initial_balance || 0)
    }

    // 전체 전표 합산으로 잔액 계산
    const allTransactions = await db.selectFrom('transactions as t')
      .innerJoin('accounts as a', 't.account_code', 'a.code')
      .select('a.type')
      .select(sql<string>`sum(t.amount)`.as('sum_amount'))
      .where('t.church_id', '=', churchId)
      .groupBy('a.type')
      .execute()

    for (const t of allTransactions) {
      if (t.type === 'INCOME') totalAssets += Number(t.sum_amount || 0)
      if (t.type === 'EXPENSE') totalAssets -= Number(t.sum_amount || 0)
    }

    // 3-2. 당월 수입/지출 합계
    const currentMonthTransactions = await db.selectFrom('transactions as t')
      .innerJoin('accounts as a', 't.account_code', 'a.code')
      .select('a.type')
      .select(sql<string>`sum(t.amount)`.as('sum_amount'))
      .where('t.church_id', '=', churchId)
      .where('t.transaction_date', '>=', startOfMonth)
      .where('t.transaction_date', '<=', endOfMonth)
      .groupBy('a.type')
      .execute()

    let monthlyIncome = 0
    let monthlyExpense = 0
    for (const t of currentMonthTransactions) {
      if (t.type === 'INCOME') monthlyIncome = Number(t.sum_amount || 0)
      if (t.type === 'EXPENSE') monthlyExpense = Number(t.sum_amount || 0)
    }

    return {
      success: true,
      mode: 'tenant',
      data: {
        churchName,
        totalAssets,
        monthlyIncome,
        monthlyExpense,
        targetYear,
        targetMonth: currentMonth
      }
    }

  } catch (error: any) {
    console.error('Dashboard summary error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '대시보드 데이터를 불러오는 중 오류가 발생했습니다.'
    })
  }
})
