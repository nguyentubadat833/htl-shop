import { fileURLToPath } from 'node:url';
const project = fileURLToPath(new URL('../../', import.meta.url));
export default defineNuxtConfig({
  extends: [project],
  srcDir: `${project}app`,
  serverDir: fileURLToPath(new URL('./server', import.meta.url)),
  buildDir: `${project}.nuxt-browser-test`,
  alias: { '~~': project, '@@': project, '#shared': `${project}shared` },
  devtools: { enabled: false },
  fonts: { providers: { google: false, googleicons: false } },
  runtimeConfig: { public: { siteUrl: 'https://3d2ds.com', googleClientId: '', adsenseEnabled: false } },
  hooks: {
    'nitro:config'(config) {
      config.scanDirs = [fileURLToPath(new URL('./server', import.meta.url))];
      config.plugins = config.plugins?.filter(path => !path.startsWith(`${project}server/`));
      config.handlers = config.handlers?.filter(handler => !handler.handler?.startsWith(`${project}server/`));
      if (config.imports && typeof config.imports === 'object') {
        config.imports.dirs = config.imports.dirs?.filter(path => !path.startsWith(`${project}server/`));
      }
    },
    'pages:extend'(pages) {
      const allowed = new Set(['/', '/model/:alias()', '/about', '/cart', '/payment']);
      for (let index = pages.length - 1; index >= 0; index--) {
        if (!allowed.has(pages[index]!.path) && !pages[index]!.path.startsWith('/policies/')) pages.splice(index, 1);
      }
    },
  },
});
