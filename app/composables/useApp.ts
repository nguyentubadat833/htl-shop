export function usePublicVariables() {
  const runtimeConfig = useRuntimeConfig();
  return {
    googleId: runtimeConfig.public.googleClientId,
  };
}