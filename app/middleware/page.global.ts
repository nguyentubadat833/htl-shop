import session from "~/utils/session.ts";
import { UserRole } from "~~/shared/types/auth";

export default defineNuxtRouteMiddleware((to, from) => {
  const { authSession } = session();
  if (to.path.startsWith("/console")) {
    if (authSession().get()?.role !== UserRole.ADMIN) {
      return abortNavigation();
    }
  }

  if(to.path.startsWith('/cart') || to.path.startsWith('/payment')){
    if(!authSession().get()){
      return navigateTo('/')
    }
  }
});
