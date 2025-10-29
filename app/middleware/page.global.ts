import session from "~/utils/session.ts";

export default defineNuxtRouteMiddleware((to, from) => {
  if (to.path.startsWith("/console")) {
    const { authSession } = session();
    if (authSession().get()?.role !== UserRole.ADMIN) {
      return abortNavigation();
    }
  }
});
