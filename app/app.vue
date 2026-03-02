<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
<script setup lang="ts">
useSeoMeta({
  titleTemplate: "%s - 3d2ds Architecture",
  description: '3d2ds.com is a Vietnam-based 3D model marketplace created for architects, interior designers, and visualization artists worldwide.',
  ogImage: '/images/logo.jpg',
  ogImageAlt: 'img'
})
</script>