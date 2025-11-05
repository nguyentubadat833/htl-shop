import session from "~/utils/session.ts";

export default defineNuxtRouteMiddleware((to, from) => {
  const { authSession } = session();
  if (to.path.startsWith("/console")) {
    if (authSession().get()?.role !== UserRole.ADMIN) {
      return abortNavigation();
    }
  }

  if(to.path.includes('/cart')){
    if(!authSession().get()){
      return navigateTo('/')
    }
  }
});
