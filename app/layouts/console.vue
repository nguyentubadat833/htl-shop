<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const pageUI = {
  root: 'p-2',
  left: 'py-2! lg:col-span-1',
  center: 'lg:col-span-9',
}
const navItems = ref<NavigationMenuItem[][]>([
  [
    {
      label: 'Console',
      icon: 'ic:sharp-view-comfy-alt',
      to: '/console'
    },
  ],
  [
    {
      label: 'System manager',
      type: 'label'
    },
    {
      label: 'Users',
      icon: 'ic:sharp-manage-accounts',
      to: '/console/users'
    },
    {
      label: 'Products',
      icon: 'ic:round-layers',
      to: '/console/products'
    },
    {
      label: 'Orders',
      icon: 'ic:baseline-chrome-reader-mode',
      to: '/console/orders'
    },
    {
      label: 'Library',
      icon: 'ic:baseline-photo-library',
      to: '/console/library'
    }
  ],
  [
    {
      label: 'Setting',
      type: 'label'
    },
    {
      label: 'Logout',
      icon: 'ic:outline-logout'
    }
  ],
  [
    {
      label: 'Guest mode',
      icon: 'ic:sharp-remove-red-eye',
      to: '/'
    },
  ]
])
</script>

<template>
  <ClientOnly>
    <UMain>
      <UPage :ui="pageUI">
        <template #left>
          <UPageAside>
            <UNavigationMenu orientation="vertical" :items="navItems" class="data-[orientation=vertical]" />
          </UPageAside>
        </template>
        <div class="w-full h-full">
          <NuxtPage class=""/>
        </div>
      </UPage>
    </UMain>
  </ClientOnly>
</template>

<style scoped></style>