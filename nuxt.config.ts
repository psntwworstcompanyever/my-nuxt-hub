// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    apiUrl: process.env.NUXT_API_URL
  },
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@formkit/nuxt'],
  nitro: {
    experimental: {
      openAPI: true
    }
  },
  ssr: false
})