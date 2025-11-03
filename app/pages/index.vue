<template>
  <UPage :ui="pageUI">
    <template #left>
      <UPageAside>
        <UiMenu />
      </UPageAside>
    </template>

    <div class="flex justify-between">
      <div class="flex gap-4">
        <UCheckbox v-model="choosePlan.free" label="FREE" />
        <UCheckbox v-model="choosePlan.pro" label="PRO" />
      </div>

      <USelect v-model="chooseSortType" :items="sortOptions" :ui="chooseSortTypeUI" />

    </div>
    <UPageGrid>
      <UPageCard v-for="(card, index) in prodcuts" :key="index" v-bind="card" :ui="cardUI">
        <!-- <template #body>test</template> -->
        <template #leading>
          <div class="flex justify-between w-full">
            <span class="font-medium" :class="[{ 'text-green-600': card.plan === ProductPlan.Pro }]">{{ card.plan }}</span>
            <div class="text-gray-500 flex items-center gap-1">
              <Icon name="material-symbols:recommend-outline" size="20" />
              16
            </div>
          </div>
        </template>
        <template #body>
          <div class="space-y-2 ">
            <div class="relative group mb-10">
              <UCarousel v-slot="{ item }" dots :items="card.imageLinks">
                <img :src="item" class="w-full rounded" />
              </UCarousel>
              <div
                class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded">
              </div>

              <div
                class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                @click="navigateTo('/view/product')">
                <span class="text-white font-semibold">View Details</span>
              </div>
            </div>

            <div class="font-medium line-clamp-1 text-gray-600 text-sm hover:underline hover:cursor-pointer" @click="navigateTo('/view/product')">{{
              card.name }}</div>
            <div class="flex justify-between">
              <div class="flex items-center gap-1 text-gray-500">
                <Icon name="ic:outline-payments" size="20" />
                <p class="font-medium"> {{ card.price }}</p>
              </div>
              <UButton icon="ic:round-shopping-cart" color="neutral" variant="soft" class="hover:cursor-pointer" />
            </div>
          </div>
        </template>
      </UPageCard>
    </UPageGrid>
  </UPage>
</template>

<script lang="ts" setup>
import { ProductPlan } from '~~/shared/types/product'


type SortType = 'Popular' | 'Newest'

const pageUI = {
  center: 'py-5 space-y-10',
  left: 'py-2!'
}

const cardUI = {
  root: 'shadow-md dark:ring-1 light:ring-0 rounded hover:shadow-2xl hover:scale-102',
  leading: 'w-full',
  body: 'w-full',
  container: 'p-2 sm:p-4'
}

const chooseSortTypeUI = {
  base: 'ring-0!'
}

const sortOptions = <SortType[]>['Newest', 'Popular']

const choosePlan = reactive({
  free: true,
  pro: true
})

const chooseSortType = ref<SortType>('Popular')

const {data: prodcuts} = useAsyncData(async () => await $fetch('/data/products'))

// const cards = ref([
//   {
//     title: 'Eagle Plushy Kids toy',
//     images: ['https://b4.3dsky.org/media/cache/sky_model_new_thumb_ang/model_images/0000/0000/8164/8164078.68fa1eadd13f4.jpeg', 'https://b5.3dsky.org/media/cache/tuk_model_custom_filter_ang_en/model_images/0000/0000/8164/8164081.68fa1eaddc953.jpeg'],
//     price: '2$',
//     plan: Plan.Pro,
//   },
//   {
//     title: 'Santa Claus Statue',
//     images: ['https://b5.3dsky.org/media/cache/sky_model_new_thumb_ang/model_images/0000/0000/8163/8163253.68f9e607058ca.jpeg'],
//     price: '3,5$',
//     plan: Plan.Free
//     // to: '/docs/getting-started/integrations/fonts'
//   },
//   {
//     title: 'Decorative set with orchid',
//     images: ['https://b6.3dsky.org/media/cache/sky_model_new_thumb_ang/model_images/0000/0000/8162/8162578.68f9594b077ce.jpeg'],
//     price: '4,25$',
//     plan: Plan.Pro
//     // to: '/docs/getting-started/integrations/color-mode'
//   },
//   {
//     title: 'Garage Display Shelf Cars Toys for Children 02',
//     images: ['https://b4.3dsky.org/media/cache/tuk_model_custom_filter_ang_en/model_images/0000/0000/8154/8154867.68f66e7fbf80c.jpeg', 'https://b4.3dsky.org/media/cache/tuk_model_custom_filter_ang_en/model_images/0000/0000/8154/8154868.68f66e7fc463f.jpeg'],
//     price: '6$',
//     plan: Plan.Free
//   },
//   {
//     title: 'Decorative Set 048',
//     images: ['https://b4.3dsky.org/media/cache/tuk_model_custom_filter_ang_en/model_images/0000/0000/8163/8163742.68fa05359fdb1.jpeg', 'https://b4.3dsky.org/media/cache/tuk_model_custom_filter_ang_en/model_images/0000/0000/8163/8163743.68fa0535a4d2a.jpeg'],
//     price: '2$',
//     plan: Plan.Free
//   },
//   {
//     title: 'Water Cooler / Water Purifier',
//     images: ['https://b5.3dsky.org/media/cache/tuk_model_custom_filter_ang_en/model_images/0000/0000/8163/8163289.68f9e96955aab.jpeg', 'https://b5.3dsky.org/media/cache/tuk_model_custom_filter_ang_en/model_images/0000/0000/8163/8163290.68f9e976cf353.jpeg'],
//     price: '4,5$',
//     plan: Plan.Pro
//   },
//   {
//     title: 'Spa and Beauty Salon No. 6',
//     images: ['https://b6.3dsky.org/media/cache/tuk_model_custom_filter_ang_en/model_images/0000/0000/8162/8162309.68f9307bea61a.jpeg', 'https://b6.3dsky.org/media/cache/tuk_model_custom_filter_ang_en/model_images/0000/0000/8162/8162313.68f9307c02021.jpeg'],
//     price: '4,5$',
//     plan: Plan.Free
//   },
//   {
//     title: 'Wooden Blinds Set 38',
//     images: ['https://b5.3dsky.org/media/cache/tuk_model_custom_filter_ang_en/model_images/0000/0000/8165/8165054.68fa63ccab23d.jpeg', 'https://b5.3dsky.org/media/cache/tuk_model_custom_filter_ang_en/model_images/0000/0000/8165/8165058.68fa63ccb5ac9.jpeg'],
//     price: '10$',
//     plan: Plan.Pro
//   },
//   {
//     title: '2026 Ford Mustang RTR',
//     images: ['https://b6.3dsky.org/media/cache/tuk_model_custom_filter_ang_en/model_images/0000/0000/8165/8165808.68faf491c8289.jpeg'],
//     price: '15$',
//     plan: Plan.Pro
//   }
// ])

</script>

<style></style>