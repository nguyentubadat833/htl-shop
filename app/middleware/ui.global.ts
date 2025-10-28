
export default defineNuxtRouteMiddleware(async (to, from) => {
  if (to.path.startsWith('/console')){
    setPageLayout('console')
  }
});
