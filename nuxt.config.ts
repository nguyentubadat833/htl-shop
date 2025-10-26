// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxt/image", "@nuxt/content", "@prisma/nuxt"],
  css: ["~/assets/css/main.css"],
  prisma: {
    runMigration: false,
    installStudio: false,
    // generateClient: false,
    // autoSetupPrisma: false,
  },
  runtimeConfig: {
    public: {
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_ID,
    },
  },
  content: {
    experimental: {
      sqliteConnector: "native",
    },
  },
});
