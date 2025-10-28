<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const pageUI = {
  left: 'py-2!',
  // center: 'bg-orange-500',
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
  <div>
    <UMain>
      <UContainer>
        <UPage :ui="pageUI">
          <template #left>
            <UPageAside>
              <UNavigationMenu orientation="vertical" :items="navItems" class="data-[orientation=vertical]" />
            </UPageAside>
          </template>
          <div class="w-full h-full p-4">
            <NuxtPage />
          </div>
        </UPage>
      </UContainer>
    </UMain>
  </div>
</template>

<style scoped></style>