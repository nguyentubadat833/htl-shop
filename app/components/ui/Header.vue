<template>
  <UHeader :ui="ui" mode="slideover">
    <template #left>
      <NuxtImg src="/logo.png" class="h-10" />
      <UInput icon="i-lucide-search" variant="outline" placeholder="Search..." :ui="btnSearchUI" />
    </template>
    <template #right>
      <UButton icon="ic:outline-shopping-basket" color="neutral" variant="ghost" class="lg:mr-3 mr-0" />
      <div class="lg:flex gap-3 hidden">
        <UColorModeButton />
        <!-- <UButton label="Sign in" color="neutral" variant="ghost" icon="ic:baseline-log-in" size="md" /> -->
        <UiGoogleLoginButton />
      </div>
    </template>
    <template #body>
      <UiMenu />
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

import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [{
  label: 'Docs',
  to: '/docs/getting-started',
  icon: 'i-lucide-book-open',
  active: route.path.startsWith('/docs/getting-started')
}, {
  label: 'Components',
  to: '/docs/components',
  icon: 'i-lucide-box',
  active: route.path.startsWith('/docs/components')
}, {
  label: 'Figma',
  icon: 'i-simple-icons-figma',
  to: 'https://go.nuxt.com/figma-ui',
  target: '_blank'
}, {
  label: 'Releases',
  icon: 'i-lucide-rocket',
  to: 'https://github.com/nuxt/ui/releases',
  target: '_blank'
}])
</script>

<style></style>