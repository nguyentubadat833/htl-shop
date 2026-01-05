// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxt/image", "@nuxt/content"],
  css: ["~/assets/css/main.css"],
  // prisma: {
  //   runMigration: false,
  //   installStudio: false,
  //   generateClient: false,
  //   autoSetupPrisma: false,
  // },
  runtimeConfig: {
    public: {
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_ID,
    },
    nodeProduction: process.env.NODE_ENV === "production",
    google: {
      clientId: process.env.NUXT_PUBLIC_GOOGLE_ID,
      clientSecret: process.env.NUXT_GOOGLE_SECRET_KEY,
      redirectURI: process.env.NUXT_GOOGLE_REDIRECT_URI,
    },
    s3: {
      host: process.env.NUXT_S3_HOST,
      port: process.env.NUXT_S3_PORT,
      accessKey: process.env.NUXT_S3_ACCESS_KEY,
      secretKey: process.env.NUXT_S3_SECRET_KEY,
      bucketDefault: process.env.NUXT_S3_BUCKET_DEFAULT,
      useSSL: process.env.NUXT_S3_USE_SSL,
    },
    mail: {
      host: process.env.NUXT_MAIL_HOST,
        port: process.env.NUXT_MAIL_PORT,
        secure: process.env.NUXT_MAIL_SECURE,
        auth: {
            user: process.env.NUXT_MAIL_AUTH_USER,
            pass: process.env.NUXT_MAIL_AUTH_PASSWORD,
        },
    }
  },
  content: {
    experimental: {
      sqliteConnector: "native",
    },
  },

  routeRules: {
    "/console/**": {
      ssr: false,
    },
    "/auth/**": {
      ssr: false,
    },
    "/profile": {
      ssr: false,
    },
    "/cart": {
      ssr: false,
    },
  },
  // alias: {
  //   '@prisma/client/index-browser': '@prisma/client', // Alias for correct entry
  // },
});
