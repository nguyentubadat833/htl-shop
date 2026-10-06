<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-semibold">About 3d2ds</h1>
    <p>3d2ds is a Vietnam-based marketplace for free and premium 3D and 2D models, serving architects, interior designers and visualization artists worldwide.</p>
    <ClientOnly>
      <div class="flex justify-center">
        <img v-if="!isDark" src="/images/about.png" alt="About the 3d2ds model marketplace" class="w-full md:w-[50%]" />
        <img v-else src="/images/about_dark.png" alt="About the 3d2ds model marketplace" class="w-full md:w-[49%]" />
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "About 3d2ds",
  description: "Learn about 3d2ds, a Vietnam-based marketplace for 3D and 2D architecture and interior design models.",
});

const { isDark } = useLayout();
</script>
