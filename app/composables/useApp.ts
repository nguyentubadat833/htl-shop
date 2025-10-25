export function usePublicVariables() {
  const runtimeConfig = useRuntimeConfig();
  return {
    googleId: runtimeConfig.public.googleClientId,
  };
}

export function useNav(){
  const menuItems = [
    
  ]
}