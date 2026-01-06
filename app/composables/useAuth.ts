import session from "~/utils/session.ts";

export const useAuth = () => {
  const { quality: cartQuality } = useCart()
  const { authSession } = session();

  async function logout() {
    await $fetch("/api/auth/google/logout", {
      method: "DELETE"
    }).finally(() => {
      authSession().remove();
      // userAuth.value = null;
      cartQuality.value = undefined
      navigateTo('/')
    });
  }
  return {
    logout
  }
}
