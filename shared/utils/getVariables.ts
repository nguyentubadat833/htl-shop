import { useRuntimeConfig } from "nuxt/app";

export function getPublicVariables() {
  const runtimeConfig = useRuntimeConfig();
  return {
    googleId: runtimeConfig.public.googleClientId,
  };
}
