<template>
  <div class="flex justify-between items-center gap-3">
    <div class="flex md:justify-start justify-center gap-1">
      <UButton v-for="item in nav" :label="item.label" :icon="item.icon" color="neutral" variant="link"
        @click="navigateTo(item.to)" />
    </div>
  </div>
</template>

<script lang="ts" setup>
const nav = [
  { label: 'Home', icon: 'ic:outline-house', to: '/' },
  { label: 'Contact', icon: 'ic:outline-email', to: '/contact' },
]
</script>

<style></style>