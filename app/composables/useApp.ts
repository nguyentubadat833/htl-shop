export function usePublicVariables() {
  const runtimeConfig = useRuntimeConfig();
  return {
    googleId: runtimeConfig.public.googleClientId,
  };
}

export class useAppToast {
  toast = useToast()
  constructor() { }

  success(input?: {
    title?: string,
    description?: string
  }) {
    this.toast.add({
      title: input?.title ?? "Success",
      description: input?.description
    })
  }
}
