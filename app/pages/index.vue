<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-2">
    <!-- 개인화 웰컴 배너 (초고가시성 네온 테마) -->
    <div class="bg-brand-blue rounded-2xl p-10 text-white shadow-2xl relative overflow-hidden transition-colors duration-500 border border-white/10">
      <div class="absolute right-0 top-0 w-80 h-80 bg-white/20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
      <div class="relative z-10">
        <h2 v-if="dashboardMode === 'tenant'" class="text-3xl font-black mb-4 tracking-tight text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
          반가워요! 오늘도 투명한 재정을 만들어가는 
          <span class="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] underline underline-offset-8 decoration-yellow-400/50">{{ summaryData?.churchName || '우리교회' }} 관리자님</span>
        </h2>
        <h2 v-else class="text-3xl font-black mb-4 tracking-tight text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
          반가워요! 
          <span class="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] underline underline-offset-8 decoration-yellow-400/50">{{ user?.name || '사용자' }}</span>님
        </h2>
        <p class="text-cyan-300 font-black text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
          <template v-if="dashboardMode === 'platform'">
            🚀 플랫폼 본사 환경에서 전체 시스템을 관리하고 있습니다.
          </template>
          <template v-else-if="dashboardMode === 'tenant'">
            📅 {{ summaryData?.targetYear }}년 {{ summaryData?.targetMonth }}월의 재정 현황을 한눈에 확인하세요.
          </template>
          <template v-else>
            ✨ 올해의 헌금 내역과 약정 현황을 확인하세요.
          </template>
        </p>
      </div>
    </div>

    <!-- 로딩 스켈레톤 -->
    <div v-if="pending" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <USkeleton class="h-32 rounded-2xl" v-for="i in 3" :key="i" />
    </div>

    <!-- 1. 플랫폼 본사 모드 (Master Only) -->
    <template v-else-if="dashboardMode === 'platform'">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-6">
          <div class="w-16 h-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center shrink-0">
            <UIcon name="i-heroicons-building-office-2" class="w-8 h-8 text-brand-blue" />
          </div>
          <div>
            <p class="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">등록된 총 테넌트(교회) 수</p>
            <p class="text-3xl font-black text-slate-900 dark:text-white">{{ formatNumber(summaryData?.totalChurches) }}<span class="text-lg font-bold text-slate-400 ml-1">개</span></p>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-6">
          <div class="w-16 h-16 rounded-2xl bg-brand-green/10 flex items-center justify-center shrink-0">
            <UIcon name="i-heroicons-users" class="w-8 h-8 text-brand-green" />
          </div>
          <div>
            <p class="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">시스템 활성 사용자 수</p>
            <p class="text-3xl font-black text-slate-900 dark:text-white">{{ formatNumber(summaryData?.totalUsers) }}<span class="text-lg font-bold text-slate-400 ml-1">명</span></p>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <!-- 가입 추이 차트 -->
        <div class="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 class="font-bold text-lg mb-6 flex items-center gap-2">
            <UIcon name="i-heroicons-chart-bar" class="text-brand-blue" />
            테넌트 가입 성장 추이 (최근 6개월)
          </h3>
          <div class="h-64">
            <Line :data="platformChartData" :options="chartOptions" />
          </div>
        </div>

        <!-- 최근 가입 교회 리스트 -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <h3 class="font-bold text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-brand-blue" />
              최근 가입한 테넌트
            </h3>
          </div>
          <div class="divide-y divide-slate-100 dark:divide-slate-700/50">
            <div v-for="church in summaryData?.recentChurches" :key="church.name" class="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <UIcon name="i-heroicons-building-library" class="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p class="text-sm font-bold text-slate-900 dark:text-white">{{ church.name }}</p>
                  <p class="text-[10px] text-slate-500">대표: {{ church.representative_name || '미등록' }}</p>
                </div>
              </div>
              <span class="text-[10px] font-mono text-slate-400">{{ church.join_date }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 2. 테넌트 관리 모드 (Manager, Admin, Impersonating Master) -->
    <template v-else-if="dashboardMode === 'tenant'">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <UIcon name="i-heroicons-banknotes" class="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </div>
            <UBadge color="neutral" variant="soft" class="font-bold">Total Assets</UBadge>
          </div>
          <div>
            <p class="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">현재 총 자산</p>
            <p class="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{{ formatNumber(summaryData?.totalAssets) }}<span class="text-base font-bold text-slate-400 ml-1">원</span></p>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <UIcon name="i-heroicons-arrow-trending-up" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <UBadge color="info" variant="soft" class="font-bold">{{ summaryData?.targetMonth }}월</UBadge>
          </div>
          <div>
            <p class="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">당월 수입 누계</p>
            <p class="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono tracking-tight">{{ formatNumber(summaryData?.monthlyIncome) }}<span class="text-base font-bold text-slate-400 ml-1">원</span></p>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <UIcon name="i-heroicons-arrow-trending-down" class="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <UBadge color="error" variant="soft" class="font-bold">{{ summaryData?.targetMonth }}월</UBadge>
          </div>
          <div>
            <p class="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">당월 지출 누계</p>
            <p class="text-3xl font-black text-red-600 dark:text-red-400 font-mono tracking-tight">{{ formatNumber(summaryData?.monthlyExpense) }}<span class="text-base font-bold text-slate-400 ml-1">원</span></p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <!-- 수입/지출 추이 (Cash Flow) -->
        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 class="font-bold text-lg mb-6 flex items-center gap-2">
            <UIcon name="i-heroicons-presentation-chart-line" class="text-brand-blue" />
            최근 6개월 현금 흐름 (Cash Flow)
          </h3>
          <div class="h-64">
            <Bar :data="tenantCashFlowData" :options="chartOptions" />
          </div>
        </div>

        <!-- 예산 집행률 및 자산 비중 -->
        <div class="grid grid-cols-1 gap-8">
          <!-- 예산 집행률 -->
          <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-bold text-lg flex items-center gap-2">
                <UIcon name="i-heroicons-fire" class="text-orange-500" />
                올해 예산 집행률
              </h3>
              <span class="text-sm font-black text-slate-600 dark:text-slate-400">{{ budgetPercent }}%</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-4 mb-4 overflow-hidden">
              <div 
                class="bg-orange-500 h-full rounded-full transition-all duration-1000"
                :style="{ width: budgetPercent + '%' }"
              ></div>
            </div>
            <div class="flex justify-between text-[11px] font-bold text-slate-400 uppercase">
              <span>지출: {{ formatNumber(summaryData?.totalExpense) }}원</span>
              <span>총 예산: {{ formatNumber(summaryData?.totalBudget) }}원</span>
            </div>
          </div>

          <!-- 자산 비중 -->
          <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 class="font-bold text-lg mb-6 flex items-center gap-2">
              <UIcon name="i-heroicons-chart-pie" class="text-brand-green" />
              계정(통장)별 자산 비중
            </h3>
            <div class="h-48 flex justify-center">
              <Doughnut :data="fundPieData" :options="pieOptions" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 3. 일반 사용자 모드 (User - Level 3) -->
    <template v-else-if="dashboardMode === 'user'">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="space-y-8">
          <div class="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
            <div class="w-20 h-20 mx-auto rounded-full bg-brand-green/10 flex items-center justify-center mb-6">
              <UIcon name="i-heroicons-heart" class="w-10 h-10 text-brand-green" />
            </div>
            <h3 class="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2">{{ new Date().getFullYear() }}년도 나의 총 헌금액</h3>
            <p class="text-5xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">
              {{ formatNumber(summaryData?.totalDonation) }}<span class="text-2xl font-bold text-slate-400 ml-2">원</span>
            </p>
          </div>

          <!-- 본인 헌금 추이 차트 -->
          <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 class="font-bold text-lg mb-6 flex items-center gap-2">
              <UIcon name="i-heroicons-chart-bar-square" class="text-brand-green" />
              나의 월별 헌금 추이
            </h3>
            <div class="h-48">
              <Line :data="userChartData" :options="chartOptions" />
            </div>
          </div>
        </div>

        <div class="space-y-8">
          <!-- 캠페인 약정 현황 -->
          <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 class="font-bold text-lg mb-6 flex items-center gap-2">
              <UIcon name="i-heroicons-flag" class="text-brand-blue" />
              나의 캠페인 약정 현황
            </h3>
            <div class="space-y-6">
              <div v-for="p in summaryData?.pledgeStatus" :key="p.campaign_name">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm font-bold">{{ p.campaign_name }}</span>
                  <span class="text-xs font-black text-brand-blue">{{ Math.round((p.paid_amount / p.pledge_amount) * 100) }}%</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div class="bg-brand-blue h-full rounded-full" :style="{ width: Math.min(100, (p.paid_amount / p.pledge_amount) * 100) + '%' }"></div>
                </div>
                <div class="flex justify-between text-[10px] mt-1 text-slate-400">
                  <span>납부: {{ formatNumber(p.paid_amount) }}원</span>
                  <span>약정: {{ formatNumber(p.pledge_amount) }}원</span>
                </div>
              </div>
              <div v-if="!summaryData?.pledgeStatus?.length" class="text-center py-10 text-slate-400 text-sm italic">
                현재 참여 중인 약정 캠페인이 없습니다.
              </div>
            </div>
          </div>

          <!-- 최근 헌금 내역 -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 class="font-bold text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <UIcon name="i-heroicons-clock" class="w-5 h-5 text-brand-green" />
                최근 헌금 내역
              </h3>
            </div>
            <div class="divide-y divide-slate-100 dark:divide-slate-700/50">
              <div v-for="(record, idx) in summaryData?.recentDonations" :key="idx" class="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-black text-sm">
                    {{ record.account_name.substring(0, 1) }}
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-900 dark:text-white">{{ record.account_name }}</p>
                    <p class="text-[10px] text-slate-500 font-mono mt-0.5">{{ record.date }}</p>
                  </div>
                </div>
                <span class="text-base font-bold text-brand-green font-mono">+{{ formatNumber(record.amount) }}</span>
              </div>
              <div v-if="!summaryData?.recentDonations?.length" class="p-8 text-center text-slate-400 font-medium">
                최근 헌금 내역이 없습니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatNumber } from '~/utils/formatter'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js'
import { Bar, Line, Doughnut } from 'vue-chartjs'

// Chart.js 컴포넌트 등록
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement
)

const { user } = useUserSession()
const { data: res, pending } = await useFetch<any>('/api/dashboard/summary')

const dashboardMode = computed(() => res.value?.mode || 'user')
const summaryData = computed(() => res.value?.data || null)

// --- 차트 공통 옵션 ---
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
    x: { grid: { display: false } }
  }
}

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right' as const, labels: { boxWidth: 12, font: { size: 11, weight: 'bold' as any } } }
  }
}

// --- 1. 플랫폼 차트 데이터 ---
const platformChartData = computed(() => {
  const labels = summaryData.value?.monthlyGrowth?.map((d: any) => d.month) || []
  const data = summaryData.value?.monthlyGrowth?.map((d: any) => d.count) || []
  return {
    labels,
    datasets: [{
      label: '신규 가입',
      data,
      borderColor: '#3CAFFF',
      backgroundColor: 'rgba(60, 175, 255, 0.2)',
      tension: 0.4,
      fill: true
    }]
  }
})

// --- 2. 테넌트 차트 데이터 ---
const tenantCashFlowData = computed(() => {
  const months = [...new Set(summaryData.value?.monthlyCashFlow?.map((d: any) => d.month))] as string[]
  const incomeData = months.map(m => {
    const matched = summaryData.value?.monthlyCashFlow?.find((d: any) => d.month === m && d.type === 'INCOME')
    return matched ? matched.amount : 0
  })
  const expenseData = months.map(m => {
    const matched = summaryData.value?.monthlyCashFlow?.find((d: any) => d.month === m && d.type === 'EXPENSE')
    return matched ? matched.amount : 0
  })

  return {
    labels: months.map(m => m.split('-')[1] + '월'),
    datasets: [
      { label: '수입', data: incomeData, backgroundColor: '#3CAFFF', borderRadius: 4 },
      { label: '지출', data: expenseData, backgroundColor: '#F43F5E', borderRadius: 4 }
    ]
  }
})

const fundPieData = computed(() => {
  const labels = summaryData.value?.fundBalances?.map((f: any) => f.name) || []
  const data = summaryData.value?.fundBalances?.map((f: any) => f.balance) || []
  return {
    labels,
    datasets: [{
      data,
      backgroundColor: ['#3CAFFF', '#10B981', '#A855F7', '#F59E0B', '#F43F5E'],
      borderWidth: 0
    }]
  }
})

const budgetPercent = computed(() => {
  const budget = summaryData.value?.totalBudget || 0
  const expense = summaryData.value?.totalExpense || 0
  if (budget === 0) return 0
  return Math.round((expense / budget) * 100)
})

// --- 3. 일반 사용자 차트 데이터 ---
const userChartData = computed(() => {
  const labels = summaryData.value?.monthlyDonations?.map((d: any) => d.month.split('-')[1] + '월') || []
  const data = summaryData.value?.monthlyDonations?.map((d: any) => d.amount) || []
  return {
    labels,
    datasets: [{
      label: '헌금액',
      data,
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.3,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#10B981'
    }]
  }
})
</script>
