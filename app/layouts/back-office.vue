<template>
  <div class="min-h-screen bg-slate-900 flex text-slate-100">
    <!-- 백오피스 전용 사이드바 -->
    <aside class="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 relative z-20 shadow-xl">
      <div class="p-6 border-b border-slate-800 space-y-4">
        <NuxtLink to="/back-office" class="cursor-pointer block flex items-center gap-3">
          <div class="w-8 h-8 rounded-md bg-brand-blue flex items-center justify-center">
            <UIcon name="i-heroicons-globe-alt" class="text-white w-5 h-5" />
          </div>
          <span class="font-black text-lg tracking-tight text-white">Back Office</span>
        </NuxtLink>
        <div class="px-2 py-1 bg-slate-900 rounded-lg border border-slate-800">
          <span class="text-[10px] text-brand-blue font-bold tracking-widest uppercase">Platform Master</span>
        </div>
      </div>
      
      <nav class="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        <template v-for="item in menuItems" :key="item.path">
          <NuxtLink 
            :to="item.path" 
            class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer"
            :class="[
              isPathActive(item.path) 
                ? 'bg-brand-blue text-white font-bold shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            ]"
          >
            <UIcon 
              :name="item.icon" 
              class="w-6 h-6 transition-transform duration-200 group-hover:scale-110"
              :class="isPathActive(item.path) ? 'text-white' : 'text-slate-500 group-hover:text-brand-blue'"
            />
            <span class="text-[15px]">{{ item.label }}</span>
          </NuxtLink>
        </template>
      </nav>

      <div class="p-4 border-t border-slate-800">
        <div class="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <UIcon name="i-heroicons-shield-check" class="w-6 h-6 text-brand-blue" />
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-sm font-bold text-white truncate">{{ user?.name || '최고관리자' }}</span>
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">MASTER</span>
            </div>
          </div>
          <UButton 
            variant="ghost" 
            color="neutral" 
            icon="i-heroicons-arrow-left-on-rectangle" 
            label="일반 화면으로" 
            block 
            class="cursor-pointer hover:bg-slate-800 shadow-sm border border-transparent hover:border-slate-700 transition-all font-bold text-xs py-2"
            @click="() => navigateTo('/')"
          />
        </div>
      </div>
    </aside>

    <!-- 메인 콘텐츠 영역 -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-slate-900">
      <header class="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center px-8 shrink-0 relative z-10 justify-between">
        <div class="flex items-center gap-3">
          <div class="w-1 h-6 bg-brand-blue rounded-full"></div>
          <h1 class="text-lg font-bold text-white tracking-tight">{{ currentPathLabel }}</h1>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { user } = useUserSession()
const route = useRoute()

const menuItems = computed(() => [
  { path: '/back-office', label: '대시보드', icon: 'i-heroicons-squares-2x2' },
  { path: '/back-office/churches', label: '교회(Tenant) 관리', icon: 'i-heroicons-building-office-2' },
  { path: '/back-office/tools', label: '진단 및 보정', icon: 'i-heroicons-wrench-screwdriver' }
])

const isPathActive = (path: string) => {
  const currentPath = route.path
  if (path === '/back-office') return currentPath === '/back-office'
  return currentPath === path || currentPath.startsWith(path + '/')
}

const currentPathLabel = computed(() => {
  const item = menuItems.value.find(i => isPathActive(i.path))
  return item ? item.label : '백오피스'
})
</script>

<style scoped>
.text-brand-blue { color: #3CAFFF; }
.bg-brand-blue { background-color: #3CAFFF; }
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
</style>
