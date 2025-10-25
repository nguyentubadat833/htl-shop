<template>
  <UPage :ui="pageUI">
    <template #left>
      <UPageAside>
        <UNavigationMenu orientation="vertical" :items="items" class="data-[orientation=vertical]" />
      </UPageAside>
    </template>

    <UPageGrid>
      <UPageCard v-for="(card, index) in cards" :key="index" v-bind="card" :ui="cardUI">
        <!-- <template #body>test</template> -->
        <template #leading>
          <div class="flex justify-between w-full">
            <span class="text-green-600 font-medium">PRO</span>
            <div class="text-gray-500 flex items-center gap-1">
              <Icon name="material-symbols:recommend-outline" size="20" />
              16
            </div>
          </div>
        </template>
        <template #body>
          <div class="bg-amber-100">
            <NuxtImg :src="getURLFromString(card.description)[0]" class="w-full" />
          </div>
        </template>
      </UPageCard>
    </UPageGrid>
  </UPage>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

type MenuItem = {
  code: string
  name: string
}

const pageUI = {
  center: 'py-10',
}

const cardUI = {
  leading: 'w-full',
  body: 'w-full'
}

const { data: nav } = await useAsyncData('menu', () => {
  return queryCollection('ui')
    .where('stem', '=', 'nav/menu')
    .first()
}, {
  transform(value) {
    return {
      threeD: value?.meta?.["3d"] as MenuItem[],
      twoD: value?.meta?.["2d"] as MenuItem[]
    }
  }
})

const items = ref<NavigationMenuItem[][]>([
  [
    { label: "Products", type: "label" },
    {
      label: "3D",
      icon: 'cuida:box-outline',
      open: true,
      children: nav.value?.threeD.map(item => {
        return {
          label: item.name
        }
      }) ?? [],
    },
    {
      label: "2D",
      icon: 'cuida:layers-outline',
      open: true,
      children: nav.value?.twoD.map(item => {
        return {
          label: item.name
        }
      }) ?? [],
    },
  ],
  [
    {
      label: 'Contact',
      icon: 'ic:baseline-contactless',
      to: '/contact',
    },
    {
      label: 'Help',
      icon: 'ic:outline-contact-support',
      disabled: true
    }
  ]
])

const cards = ref([
  {
    title: 'Eagle Plushy Kids toy',
    description: 'https://b4.3dsky.org/media/cache/sky_model_new_thumb_ang/model_images/0000/0000/8164/8164078.68fa1eadd13f4.jpeg',
    // to: '/docs/getting-started/integrations/icons'
  },
  {
    title: 'Santa Claus Statue',
    description: 'https://b5.3dsky.org/media/cache/sky_model_new_thumb_ang/model_images/0000/0000/8163/8163253.68f9e607058ca.jpeg',
    // to: '/docs/getting-started/integrations/fonts'
  },
  {
    title: 'Decorative set with orchid',
    description: 'https://b6.3dsky.org/media/cache/sky_model_new_thumb_ang/model_images/0000/0000/8162/8162578.68f9594b077ce.jpeg',
    // to: '/docs/getting-started/integrations/color-mode'
  },
  {
    title: 'Decorative set with orchid',
    description: 'https://b6.3dsky.org/media/cache/sky_model_new_thumb_ang/model_images/0000/0000/8162/8162578.68f9594b077ce.jpeg',
    // to: '/docs/getting-started/integrations/color-mode'
  },
])

function getURLFromString(input: string) {
  return input.split(',')
}
</script>

<style></style>