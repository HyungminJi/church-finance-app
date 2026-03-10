<template>
  <div class="flex items-center gap-3 font-bold select-none" :class="compact ? 'text-lg' : 'text-3xl'">
    <!-- 디자인 가이드 기반 추상 로고 (SVG) -->
    <svg 
      :class="compact ? 'w-8 h-8' : 'w-12 h-12'" 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- 좌측: 흩어진 점들 (과거/혼돈) - Brand Blue -->
      <circle cx="15" cy="35" r="4" fill="#3CAFFF" fill-opacity="0.6" />
      <circle cx="28" cy="25" r="3" fill="#3CAFFF" fill-opacity="0.4" />
      <circle cx="22" cy="45" r="5" fill="#3CAFFF" fill-opacity="0.8" />
      <circle cx="35" cy="40" r="2" fill="#3CAFFF" fill-opacity="0.3" />
      
      <!-- 중앙: 깨끗한 여백 (변화/연결) - 투명 공간 유지 -->
      
      <!-- 우측: 우상향하는 굵은 선 (미래/생명) - Brand Green -->
      <path 
        d="M55 70L85 30" 
        stroke="#91D700" 
        stroke-width="12" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
      />
      <circle cx="85" cy="30" r="6" fill="#91D700" />
    </svg>
    
    <span class="tracking-tight flex items-baseline">
      <span class="text-brand-blue">Ledger</span>
      <span class="text-brand-green">rection</span>
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  compact?: boolean
}>()
</script>

<style scoped>
.text-brand-blue { color: #3CAFFF; }
.text-brand-green { color: #91D700; }
</style>
