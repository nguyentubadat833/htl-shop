<template>
   <UNavigationMenu orientation="vertical" :items="items" class="data-[orientation=vertical]" />
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

type MenuItem = {
  code: string
  name: string
}

const { data: nav } = await useAsyncData('menu', () => {
  return queryCollection('ui')
    .where('stem', '=', 'nav/menu')
    .first()
}, {
  transform(value) {
    return {
      threeD: value?.meta?.["3D"] as MenuItem[],
      twoD: value?.meta?.["2D"] as MenuItem[]
    }
  }
})

const items = ref<NavigationMenuItem[][]>([
  [
    { label: "Models", type: "label" },
    {
      label: "3D",
      icon: 'cuida:box-outline',
      open: true,
      children: nav.value?.threeD?.map(item => {
        return {
          label: item.name
        }
      }) ?? [],
    },
    {
      label: "2D",
      icon: 'cuida:layers-outline',
      open: true,
      children: nav.value?.twoD?.map(item => {
        return {
          label: item.name
        }
      }) ?? [],
    },
  ],
  [
    {
      label: 'Contact',
      icon: 'ic:outline-email',
    },
    {
      label: 'Help',
      icon: 'ic:outline-contact-support',
      disabled: true
    }
  ]
])

</script>

<style>

</style>