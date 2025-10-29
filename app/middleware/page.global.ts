import session from "~/utils/session.ts";

export default defineNuxtRouteMiddleware((to, from) => {
  const { authSession } = session();
  if (to.path.startsWith("/console") && authSession().get()?.role !== UserRole.ADMIN) {
    return abortNavigation();
  }
});
