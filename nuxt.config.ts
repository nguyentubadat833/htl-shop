// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxt/ui",
    "@nuxt/image", // "@nuxtjs/ngrok"
    "@nuxt/content",
    "@nuxtjs/device",
  ],
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
      clientSecret: process.env.NUXT_GOOGLE_CLIENT_SECRET,
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
        pass: process.env.NUXT_MAIL_AUTH_PASS,
      },
    },
    sepay: {
      id: process.env.NUXT_SEPAY_ID,
      key: process.env.NUXT_SEPAY_KEY,
      env: process.env.NUXT_SEPAY_ENV,
    },
    db: {
      host: process.env.NUXT_DB_HOST,
      port: process.env.NUXT_DB_PORT,
      name: process.env.NUXT_DB_NAME,
      user: process.env.NUXT_DB_USER,
      pass: process.env.NUXT_DB_PASS
    },
    siteUrl: "",
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
    "/library": {
      ssr: false,
    },
    "/payment": {
      ssr: false,
    },
  },

  devServer: {
    port: 4002,
    host: "0.0.0.0",
  },

  vite: {
    server: {
      allowedHosts: true,
    },
  },

  app: {
    pageTransition: { name: "page", mode: "out-in" },
  },
  hooks: {
    "pages:extend"(pages) {

      const categoryPage = pages.find((p) => p.path === "/console/categories");
      if (categoryPage) {
        categoryPage.file = "~/pages/console/v2/categories.vue";
      }

      const productPage = pages.find((p) => p.path === "/console/products");
      if (productPage) {
        productPage.file = "~/pages/console/v2/products.vue";
      }
    },
  },
  // ngrok: {
  //   authtoken_from_env: true,
  // },

  // alias: {
  //   '@prisma/client/index-browser': '@prisma/client', // Alias for correct entry
  // },

  // alias: {
  //   '@prisma-generated': fileURLToPath(
  //     new URL('./prisma/generated', import.meta.url)
  //   )
  // },
  //
  // nitro: {
  //   externals: {
  //     external: ['@prisma/client', '.prisma', 'process']
  //   }
  // }
});
