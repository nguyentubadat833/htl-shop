export function usePublicVariables() {
  const runtimeConfig = useRuntimeConfig();
  return {
    googleId: runtimeConfig.public.googleClientId,
  };
}

export class useAppToast {
  toast = useToast()
  constructor(){}

  success(){
    this.toast.add({
      title: "Success"
    })
  }
}
