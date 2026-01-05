<template>
  <ClientOnly>
    <div class="p-4 h-screen w-full grid grid-cols-[2fr_11fr] gap-4">
      <div class="p-2 space-y-6">
        <div class="flex items-center gap-4">
          <img src="/logo.png" class="h-10" />
          <p class="text-xl font-medium">HTL Architects</p>
        </div>
        <UInput icon="i-lucide-search" size="xl" variant="outline" placeholder="Search..." class="w-full" />
        <div>
          <div v-for="(array, index) in navItems">
            <div class="space-y-4">
              <div v-for="item in array">
                <UButton :label="item.label" :icon="item.icon" color="neutral" variant="ghost" class="w-full" size="xl"
                  @click="async () => await navItemClick(item)" />
              </div>
            </div>
            <USeparator v-if="index < navItems.length - 1" class="my-4" />
          </div>
        </div>
      </div>
      <UCard :ui="layout.main.ui">
        <div class="p-2 text-2xl">
          <UBreadcrumb :items="breadItems" :ui="layout.breadItems.ui" />
        </div>
        <USeparator />
        <div class="flex-1 overflow-hidden">
          <NuxtPage class="h-full" />
        </div>
      </UCard>
    </div>
  </ClientOnly>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const layout = {
  main: {
    ui: {
      body: 'h-full flex flex-col',
    }
  },
  breadItems: {
    ui: {
      linkLabel: 'text-xl'
    }
  }
}

const navItemCurrent = ref<NavigationMenuItem>()
const routePaths = computed(() => useRouter().currentRoute.value.path)
const breadItems = computed(() => routePaths.value.split('/').slice(1).map(item => {
  return {
    label: item.toUpperCase()
  }
}))

const navItems: NavigationMenuItem[][] = [
  [
    {
      label: 'Console',
      icon: 'ic:sharp-view-comfy-alt',
      to: '/console'
    },
  ],
  [
    {
      label: 'Users',
      icon: 'ic:sharp-manage-accounts',
      to: '/console/users'
    },
    {
      label: 'Categories',
      icon: 'ic:twotone-menu',
      to: '/console/categories'
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
    // {
    //   label: 'Library',
    //   icon: 'ic:baseline-photo-library',
    //   to: '/console/library'
    // }
  ],
  [
    // {
    //   label: 'Setting',
    //   type: 'label'
    // },
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
]

async function navItemClick(data: NavigationMenuItem) {
  if (data.to) {
    await navigateTo(data.to)
  }
  navItemCurrent.value = data
}
</script>bg-orange-200'