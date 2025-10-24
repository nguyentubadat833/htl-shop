<template>
  <UHeader :ui="ui">
    <!-- <template #title>
      <img src="/logo.png" class="h-10"/>
    </template> -->
    <template #left>
      <NuxtImg src="/logo.png" class="h-10" />
      <UInput icon="i-lucide-search" variant="outline" placeholder="Search..." :ui="btnSearchUI" />
    </template>
    <template #right>
      <UButton icon="ic:outline-shopping-basket" color="neutral" variant="ghost" class="lg:mr-3 mr-0" />
      <div class="lg:flex hidden">
        <UColorModeButton />
        <UButton label="Sign in" color="neutral" variant="ghost" icon="ic:baseline-log-in" size="md" />
      </div>
    </template>
  </UHeader>
</template>

<script lang="ts" setup>
const ui = {
  left: 'items-center gap-5'
}

const btnSearchUI = {
  root: 'w-full',
  base: 'rounded-3xl h-10'
}
</script>

<style></style>