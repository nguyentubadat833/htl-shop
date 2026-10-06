import { isAdsenseClientId, isEnabled } from "#shared/utils/site";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public;
  if (!isEnabled(config.adsenseEnabled) || !isAdsenseClientId(config.adsenseClientId)) return;
  const router = useRouter();
  function load(path: string) {
    if (path !== "/" && path !== "/about" && !path.startsWith("/model/")) return;
    if (document.getElementById("google-adsense")) return;
    const script = document.createElement("script");
    script.id = "google-adsense";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.adsenseClientId}`;
    document.head.appendChild(script);
  }
  router.afterEach(to => load(to.path));
  load(router.currentRoute.value.path);
});
