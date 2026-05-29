<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 flex" :style="themeStyle">
    <!-- 사이드바 (LNB) -->
    <aside class="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0 relative z-20 shadow-sm">
      <div class="p-6 border-b border-slate-100 dark:border-slate-700/50 space-y-4">
        <NuxtLink to="/" class="cursor-pointer block">
          <AppLogo compact />
        </NuxtLink>
        
        <!-- 교회 맞춤형 프로필 (사이드바) -->
        <div v-if="churchInfo" class="flex items-center gap-3 px-2 py-1 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700">
          <div class="w-8 h-8 rounded-md overflow-hidden bg-white flex-shrink-0 border border-slate-200 dark:border-slate-700">
            <img v-if="churchInfo.logo_image_path" :src="churchInfo.logo_image_path" class="w-full h-full object-contain" />
            <div v-else class="w-full h-full flex items-center justify-center bg-brand-blue/10">
              <UIcon name="i-heroicons-building-library" class="text-brand-blue w-4 h-4" />
            </div>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-xs font-black text-slate-900 dark:text-slate-100 truncate">{{ churchInfo.name }}</span>
            <span class="text-[10px] text-slate-400 font-bold tracking-tight">재정관리 시스템</span>
          </div>
        </div>
      </div>
      
      <nav class="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        <template v-for="item in menuItems" :key="item.path">
          <NuxtLink 
            :to="item.path" 
            class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer"
            :class="[
              isPathActive(item.path) 
                ? 'bg-brand-blue/10 text-brand-blue font-bold shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100'
            ]"
          >
            <UIcon 
              :name="item.icon" 
              class="w-6 h-6 transition-transform duration-200 group-hover:scale-110"
              :class="isPathActive(item.path) ? 'text-brand-blue' : 'text-slate-400 dark:text-slate-500 group-hover:text-brand-blue'"
            />
            <span class="text-[15px]">{{ item.label }}</span>
            <div v-if="isPathActive(item.path)" class="ml-auto w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse"></div>
          </NuxtLink>
        </template>
      </nav>

      <div class="p-4 border-t border-slate-100 dark:border-slate-700">
        <div class="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-full bg-brand-blue/20 flex items-center justify-center border border-brand-blue/30 shadow-inner">
              <UIcon name="i-heroicons-user" class="w-6 h-6 text-brand-blue" />
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{{ user?.name || '사용자' }}</span>
              <div class="flex items-center gap-1.5 mt-0.5">
                <div class="w-2 h-2 rounded-full" :class="roleInfo.colorClass"></div>
                <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">{{ roleInfo.label }}</span>
              </div>
            </div>
          </div>
          <UButton 
            variant="ghost" 
            color="neutral" 
            icon="i-heroicons-arrow-left-on-rectangle" 
            label="로그아웃" 
            block 
            class="cursor-pointer hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all font-bold text-xs py-2"
            @click="handleLogout"
          />
        </div>
      </div>
    </aside>

    <!-- 메인 콘텐츠 영역 -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      <!-- Master Impersonation Warning Banner -->
      <div v-if="(user?.role === 0 || Number(user?.role) === 0) && user?.impersonating_church_name" class="bg-amber-500 text-white px-4 py-2 text-sm font-bold text-center flex items-center justify-center gap-2 z-50">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 animate-pulse" />
        <span>⚠️ 현재 [{{ user.impersonating_church_name }}]의 데이터를 기술 지원 모드로 열람/수정 중입니다. 조작에 각별히 주의해 주십시오.</span>
      </div>

      <!-- 상단바 (제목 및 교회 요약 정보) -->
      <header class="h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex items-center px-8 shrink-0 relative z-10 justify-between">
        <div class="flex items-center gap-3">
          <div class="w-1 h-6 bg-brand-blue rounded-full"></div>
          <h1 class="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">{{ currentPathLabel }}</h1>
        </div>

        <!-- 헤더 교회 정보 요약 바 -->
        <div v-if="churchInfo" class="flex items-center gap-4 text-xs">
          <div class="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-full border border-slate-200 dark:border-slate-600">
            <UIcon name="i-heroicons-building-office" class="text-slate-500 w-3.5 h-3.5" />
            <span class="font-bold text-slate-700 dark:text-slate-300">{{ churchInfo.name }}</span>
          </div>
          <div class="flex items-center gap-2 px-3 py-1.5 bg-brand-blue/10 rounded-full border border-brand-blue/20">
            <UIcon name="i-heroicons-calendar-days" class="text-brand-blue w-3.5 h-3.5" />
            <span class="font-bold text-brand-blue">{{ churchInfo.current_fiscal_year || new Date().getFullYear() }}년도 기수</span>
          </div>
        </div>
      </header>

      <!-- 콘텐츠 스크롤 영역 -->
      <div class="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
        <div class="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getRoleInfo } from '~/utils/formatter'
import { useUIStore } from '~/stores/ui'

import { useAuthStore } from '~/stores/auth'

const { user, clear: clearSession } = useUserSession()
const authStore = useAuthStore()
const route = useRoute()
const ui = useUIStore()

// 현재 교회 정보 조회
const { data: churchRes } = await useFetch('/api/churches/current')
const churchInfo = computed(() => (churchRes.value as any)?.data || null)

const menuItems = computed(() => {
  const allMenus = [
    { path: '/', label: '대시보드', icon: 'i-heroicons-squares-2x2', requiresAuth: false },
    { path: '/basic-codes', label: '기초코드', icon: 'i-heroicons-command-line', requiresAuth: true },
    { path: '/budget', label: '예산관리', icon: 'i-heroicons-chart-bar', requiresAuth: true },
    { path: '/entries', label: '전표입력', icon: 'i-heroicons-pencil-square', requiresAuth: true },
    { path: '/ledgers', label: '장부관리', icon: 'i-heroicons-book-open', requiresAuth: true },
    { path: '/reports', label: '재무보고서', icon: 'i-heroicons-document-chart-bar', requiresAuth: true },
    { path: '/settings', label: '환경설정', icon: 'i-heroicons-cog-8-tooth', requiresAuth: false },
  ]

  // authStore.canEdit (Manager 이상) 권한이 없으면 requiresAuth가 true인 메뉴 숨김
  return allMenus.filter(menu => !menu.requiresAuth || authStore.canEdit)
})

const isPathActive = (path: string) => {
  const currentPath = route.path
  if (path === '/') return currentPath === '/'
  return currentPath === path || currentPath.startsWith(path + '/')
}

const currentPathLabel = computed(() => {
  const item = menuItems.value.find(i => isPathActive(i.path))
  return item ? item.label : '홈'
})

const themeColor = computed(() => churchInfo.value?.theme_color || 'blue')

const themeStyle = computed(() => {
  const themes: Record<string, any> = {
    blue: {
      main: '#3CAFFF', rgb: '60, 175, 255',
      '50': '#F0F9FF', '100': '#E0F2FE', '200': '#BAE6FD', '300': '#7DD3FC', '400': '#38BDF8', '600': '#0284C7', '700': '#0369A1', '800': '#075985', '900': '#0C4A6E', '950': '#082F49'
    },
    green: {
      main: '#10B981', rgb: '16, 185, 129',
      '50': '#ECFDF5', '100': '#D1FAE5', '200': '#A7F3D0', '300': '#6EE7B7', '400': '#34D399', '600': '#059669', '700': '#047857', '800': '#065F46', '900': '#064E3B', '950': '#022C22'
    },
    purple: {
      main: '#A855F7', rgb: '168, 85, 247',
      '50': '#FAF5FF', '100': '#F3E8FF', '200': '#E9D5FF', '300': '#D8B4FE', '400': '#C084FC', '600': '#9333EA', '700': '#7E22CE', '800': '#6B21A8', '900': '#581C87', '950': '#3B0764'
    },
    rose: {
      main: '#F43F5E', rgb: '244, 63, 94',
      '50': '#FFF1F2', '100': '#FFE4E6', '200': '#FECDD3', '300': '#FDA4AF', '400': '#FB7185', '600': '#E11D48', '700': '#BE123C', '800': '#9F1239', '900': '#881337', '950': '#4C0519'
    },
    amber: {
      main: '#F59E0B', rgb: '245, 158, 11',
      '50': '#FFFBEB', '100': '#FEF3C7', '200': '#FDE68A', '300': '#FCD34D', '400': '#FBBF24', '600': '#D97706', '700': '#B45309', '800': '#92400E', '900': '#78350F', '950': '#451A03'
    },
  }
  
  const s = themes[themeColor.value] || themes.blue
  return {
    '--theme-main': s.main,
    '--theme-rgb': s.rgb,
    '--theme-50': s['50'],
    '--theme-100': s['100'],
    '--theme-200': s['200'],
    '--theme-300': s['300'],
    '--theme-400': s['400'],
    '--theme-600': s['600'],
    '--theme-700': s['700'],
    '--theme-800': s['800'],
    '--theme-900': s['900'],
    '--theme-950': s['950'],
  }
})

const roleInfo = computed(() => {
  const info = getRoleInfo(user.value?.role ?? null)
  let colorClass = 'bg-gray-100 dark:bg-gray-800'

  // ROLE_META에서 반환된 color (primary, success, warning, neutral) 매핑
  if (info.color === 'primary') colorClass = 'bg-brand-blue'
  else if (info.color === 'success') colorClass = 'bg-brand-green'
  else if (info.color === 'warning') colorClass = 'bg-yellow-400'

  return { ...info, colorClass }
})

const handleLogout = async () => {
  const confirmed = await ui.showConfirm('로그아웃', '정말 로그아웃 하시겠습니까?', 'info')
  if (confirmed) {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await clearSession()
    window.location.href = '/auth/login'
  }
}
</script>

<style>
.text-brand-blue { color: var(--theme-main); }
.text-brand-green { color: #91D700; }
.bg-brand-blue { background-color: var(--theme-main); }
.bg-brand-green { background-color: #91D700; }
.bg-brand-blue\/10 { background-color: rgba(var(--theme-rgb), 0.1); }
.bg-brand-blue\/20 { background-color: rgba(var(--theme-rgb), 0.2); }
.border-brand-blue\/30 { border-color: rgba(var(--theme-rgb), 0.3); }
.border-brand-blue\/20 { border-color: rgba(var(--theme-rgb), 0.2); }

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E2E8F0;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
}
</style>
