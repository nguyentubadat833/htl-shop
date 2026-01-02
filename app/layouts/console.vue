<!-- <script setup lang="ts">
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
          <NuxtPage/>
        </div>
      </UPage>
    </UMain>
  </ClientOnly>
</template>

<style scoped></style> -->
<template>
  <ClientOnly>
    {{ routePaths }}
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
      <UCard>
        <div class="space-y-5">
          <div class="p-2 text-2xl">
            {{ navItemCurrent?.label }}
          </div>
          <USeparator />
          <div>

          </div>
        </div>
      </UCard>
    </div>
  </ClientOnly>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const routePaths = computed(() => useRoute().path.split('/'))
const navItemCurrent = ref<NavigationMenuItem>()

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

onMounted(() => {
  
})
</script>