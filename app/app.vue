<template>
  <UApp :toaster="(toaster as any)">
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
<script setup lang="ts">
import { policyPaths } from '#shared/utils/policies';
const requestUrl = useRequestURL();
const route = useRoute();
const config = useRuntimeConfig().public;
const siteOrigin = config.siteUrl || requestUrl.origin;
const publicPage = computed(() => route.path === "/" || route.path === "/about" || route.path.startsWith("/model/") || policyPaths.includes(route.path));
const canonical = computed(() => new URL(route.path, siteOrigin).href);
useHead(() => ({
  link: publicPage.value ? [{ rel: "canonical", href: canonical.value }] : [],
  script: route.path === "/" ? [{
    key: "website-jsonld", type: "application/ld+json",
    textContent: JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "3d2ds Architecture", url: new URL("/", siteOrigin).href }).replace(/</g, "\\u003c"),
  }] : [],
  meta: config.googleSiteVerification ? [{ name: "google-site-verification", content: config.googleSiteVerification }] : [],
}));
useSeoMeta({
  robots: () => publicPage.value ? "index, follow" : "noindex, nofollow",
  ogUrl: () => canonical.value,
  ogSiteName: "3d2ds Architecture",
  ogType: "website",
  twitterCard: "summary_large_image",
});
const toaster = { position: 'top-center' }

useSeoMeta({
  titleTemplate: (title) => {
    return title ? `${title} - 3d2ds Architecture` : '3d2ds Architecture';
  },
  description: "3d2ds.com is a Vietnam-based 3D model marketplace created for architects, interior designers, and visualization artists worldwide.",
  ogImage: new URL("/images/logo.jpg", siteOrigin).href,
  ogImageAlt: "3d2ds Architecture",
  ogDescription: "3d2ds.com is a Vietnam-based 3D model marketplace created for architects, interior designers, and visualization artists worldwide.",
});
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
