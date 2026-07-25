<template>
  <UApp :toaster="(toaster as any)">
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
<script setup lang="ts">
const requestUrl = useRequestURL();
const toaster = { position: 'top-center' }

useSeoMeta({
  titleTemplate: (title) => {
    return title ? `${title} - 3d2ds Architecture` : '3d2ds Architecture';
  },
  description: "3d2ds.com is a Vietnam-based 3D model marketplace created for architects, interior designers, and visualization artists worldwide.",
  ogImage: `${requestUrl.origin}/images/logo.jpg`,
  ogImageAlt: "img",
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
