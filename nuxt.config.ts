// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    "@nuxt/ui",
    "@pinia/nuxt",
    "@nuxt/eslint",
    "nuxt-auth-utils"
  ],
  css: ["~/assets/css/main.css"],
  srcDir: "app",
  compatibilityDate: "2024-11-01",
  app: {
    head: {
      title: 'Ledgerrection - 교회 재정 관리 시스템',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '회계 데이터에 생명을 불어넣는 지능형 교회 재정 관리 시스템' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  },
  runtimeConfig: {
    session: {
      password: process.env.NUXT_SESSION_PASSWORD,
      cookie: {
        secure: false
      }
    }
  },
  nitro: {
    experimental: {
      openAPI: true
    }
  }
})
