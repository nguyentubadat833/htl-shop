import session from "~/utils/session.ts";

const loading = ref(false)
export const useGoogleButton = () => {
  const { authSession } = session();
  function click() {
    if (!authSession().get()) {
      document.getElementById("googleSigninButton")?.click();
      return;
    }
  }
  return {
    loading,
    click
  }
}
