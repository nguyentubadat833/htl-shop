<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
<script setup lang="ts">
const requestUrl = useRequestURL();

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
