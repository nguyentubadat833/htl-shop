<template>
  <div class="space-y-5">
    <div class="lg:grid grid-cols-[7fr_3fr] space-y-5">
      <div class="flex-1 w-full lg:px-20">
        <UCarousel ref="carousel" v-slot="{ item }" arrows :items="info?.images" :prev="{ onClick: onClickPrev }"
          :next="{ onClick: onClickNext }" class="w-full" @select="onSelect">
          <!-- <img :src="item" class="w-full"> -->
          <div class="bg-gray-100 dark:bg-gray-800 p-2 rounded-xl">
            <div class="relative rounded-lg overflow-hidden">
              <img :src="item" class="w-full">
              <div class="hidden dark:block absolute inset-0 bg-black/10"></div>
            </div>
          </div>
        </UCarousel>

        <div class="flex gap-1 justify-between pt-4 max-w-xs mx-auto">
          <div v-for="(item, index) in info?.images" :key="index"
            class="size-11 opacity-25 hover:opacity-100 transition-opacity"
            :class="{ 'opacity-100': activeIndex === index }" @click="select(index)">
            <img :src="item" width="44" height="44" class="rounded-lg">
          </div>
        </div>
      </div>
      <div class="space-y-10">
        <div class="pb-2">
          <span class="text-gray-600 font-bold text-xl">{{ info?.name }}</span>
        </div>

        <div class="space-y-5">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-3">
              <UBadge :label="info?.plan.toUpperCase()"
                :color="info?.plan === ProductPlan.FREE ? 'neutral' : 'success'" />
              <span class="text-gray-500 font-bold text-xl">{{ info?.price }}</span>
            </div>
            <div class="text-gray-400 font-medium">
              Royalty free
              <Icon name="ic:outline-info" />
            </div>
          </div>
          <div>
            <UButton label="Add to cart" icon="ic:outline-add-shopping-cart" color="secondary" variant="soft"
              :ui="btnAddToCartUI" block class="hover:cursor-pointer"
              @click="() => { info?.id && addProduct(info.id, info.name) }" />
          </div>
        </div>
        <div class="space-y-2">
          <div v-for="item in info?.specs" class="flex">
            <div class="w-28 text-gray-400 font-medium">{{ item.name }}:</div>
            <div class="text-gray-600 font-medium">{{ item.value }}</div>
          </div>
        </div>
        <div>{{ info?.description }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ProductPlan } from '~~/prisma/generated/browser'


const btnAddToCartUI = {
  root: 'w-full',
  base: 'rounded-3xl h-10'
}

const { addProduct } = useCart()
const route = useRoute()

const { data: info } = await useFetch(`/data/product/${route.params.alias}`, {
  transform(value) {
    return {
      id: value.publicId,
      name: value.name,
      price: value.price + ' $',
      plan: value.plan,
      images: value.imageLinks,
      specs: [
        {
          name: "Platform",
          value: "3dsMax 2016 + obj"
        },
        {
          name: "Render",
          value: "V-Ray"
        },
        {
          name: "Size",
          value: "44 MB"
        },
        {
          name: "Colors",
          value: "White"
        },
        {
          name: "Style",
          value: "Modern"
        },
        {
          name: "Materials",
          value: "Fabric"
        },
        {
          name: "Formfactor",
          value: "none"
        }
      ],
      description: "Soft and adorable eagle plush toy designed especially for kids – perfect for cozy bedrooms, nurseries, and playful interior scenes. High-quality 3D model with realistic fabric details and cute proportions."
    }
  }
})

if (!info.value) {
  throw createError({
    statusCode: 404
  })
}

// const info = reactive({
//   name: 'Eagle Plushy Kids toy',
//   price: '2$',
//   plan: 'Pro',
//   images: ['https://b5.3dsky.org/media/cache/tuk_model_custom_filter_ang_en/model_images/0000/0000/8164/8164078.68fa1eadd13f4.jpeg', 'https://b5.3dsky.org/media/cache/tuk_model_custom_filter_ang_en/model_images/0000/0000/8164/8164079.68fa1eadd5cd2.jpeg'],
//   specs: [
//     {
//       name: "Platform",
//       value: "3dsMax 2016 + obj"
//     },
//     {
//       name: "Render",
//       value: "V-Ray"
//     },
//     {
//       name: "Size",
//       value: "44 MB"
//     },
//     {
//       name: "Colors",
//       value: "White"
//     },
//     {
//       name: "Style",
//       value: "Modern"
//     },
//     {
//       name: "Materials",
//       value: "Fabric"
//     },
//     {
//       name: "Formfactor",
//       value: "none"
//     }
//   ],
//   description: "Soft and adorable eagle plush toy designed especially for kids – perfect for cozy bedrooms, nurseries, and playful interior scenes. High-quality 3D model with realistic fabric details and cute proportions."
// })

const carousel = useTemplateRef('carousel')
const activeIndex = ref(0)

function onClickPrev() {
  activeIndex.value--
}
function onClickNext() {
  activeIndex.value++
}
function onSelect(index: number) {
  activeIndex.value = index
}

function select(index: number) {
  activeIndex.value = index

  carousel.value?.emblaApi?.scrollTo(index)
}
</script>

<style></style>