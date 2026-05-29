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
      
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mt-8">
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
                <p class="font-bold text-slate-900 dark:text-white">{{ church.name }}</p>
                <p class="text-xs text-slate-500">대표자: {{ church.representative_name || '미등록' }}</p>
              </div>
            </div>
            <span class="text-sm font-mono text-slate-400">{{ church.join_date }}</span>
          </div>
          <div v-if="!summaryData?.recentChurches?.length" class="p-8 text-center text-slate-400 font-medium">
            최근 가입한 교회가 없습니다.
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
            <p class="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">현재 총 자산 (모든 통장 잔액 합산)</p>
            <p class="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{{ formatNumber(summaryData?.totalAssets) }}<span class="text-base font-bold text-slate-400 ml-1">원</span></p>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <UIcon name="i-heroicons-arrow-trending-up" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <UBadge color="primary" variant="soft" class="font-bold">{{ summaryData?.targetMonth }}월</UBadge>
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
    </template>

    <!-- 3. 일반 사용자 모드 (User - Level 3) -->
    <template v-else-if="dashboardMode === 'user'">
      <div class="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
        <div class="w-20 h-20 mx-auto rounded-full bg-brand-green/10 flex items-center justify-center mb-6">
          <UIcon name="i-heroicons-heart" class="w-10 h-10 text-brand-green" />
        </div>
        <h3 class="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2">{{ new Date().getFullYear() }}년도 나의 총 헌금액</h3>
        <p class="text-5xl font-black text-slate-900 dark:text-white font-mono tracking-tighter mb-8">
          {{ formatNumber(summaryData?.totalDonation) }}<span class="text-2xl font-bold text-slate-400 ml-2">원</span>
        </p>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mt-8">
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
                <p class="font-bold text-slate-900 dark:text-white">{{ record.account_name }}</p>
                <p class="text-xs text-slate-500 font-mono mt-0.5">{{ record.date }}</p>
              </div>
            </div>
            <span class="text-lg font-bold text-brand-green font-mono">+{{ formatNumber(record.amount) }}</span>
          </div>
          <div v-if="!summaryData?.recentDonations?.length" class="p-8 text-center text-slate-400 font-medium">
            최근 헌금 내역이 없습니다.
          </div>
        </div>
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatNumber } from '~/utils/formatter'

const { user } = useUserSession()

const { data: res, pending } = await useFetch<any>('/api/dashboard/summary')

const dashboardMode = computed(() => res.value?.mode || 'user')
const summaryData = computed(() => res.value?.data || null)

</script>
