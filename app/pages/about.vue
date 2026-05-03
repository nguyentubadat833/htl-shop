<template>
  <ClientOnly>
    <div class="flex justify-center">
      <img v-if="!isDark" src="/images/about.png" class="w-full md:w-[50%]" />
      <img v-else src="/images/about_dark.png" class="w-full md:w-[49%]" />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "About",
});

const { isDark } = useLayout();
</script>
