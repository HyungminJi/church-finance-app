<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
    <!-- 사이드바 (LNB) -->
    <aside class="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0 relative z-20 shadow-sm">
      <div class="p-6 border-b border-slate-100 dark:border-slate-700/50">
        <NuxtLink to="/" class="cursor-pointer">
          <AppLogo compact />
        </NuxtLink>
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

      <!-- 상단바 (제목만 표시) -->
      <header class="h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex items-center px-8 shrink-0 relative z-10">
        <div class="flex items-center gap-3">
          <div class="w-1 h-6 bg-brand-blue rounded-full"></div>
          <h1 class="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">{{ currentPathLabel }}</h1>
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
.text-brand-blue { color: #3CAFFF; }
.text-brand-green { color: #91D700; }
.bg-brand-blue { background-color: #3CAFFF; }
.bg-brand-green { background-color: #91D700; }
.bg-brand-blue\/10 { background-color: rgba(60, 175, 255, 0.1); }

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
