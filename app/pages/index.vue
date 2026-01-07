<template>
  <UPage :ui="pageUI">
    <template #left>
      <UPageAside>
        <UiMenu @selected-items="handlerSelectMenuItem" />
      </UPageAside>
    </template>
    <div class="flex justify-between">
      <div class="flex gap-4">
        <UCheckbox :model-value="choosePlans.includes(ProductPlan.Free)" label="FREE"
          @update:model-value="(value) => choosePlan(value, ProductPlan.Free)" />
        <UCheckbox :model-value="choosePlans.includes(ProductPlan.Pro)" label="PRO"
          @update:model-value="(value) => choosePlan(value, ProductPlan.Pro)" />
      </div>
      <USelect v-model="chooseSortType" :items="sortOptions" :ui="chooseSortTypeUI" />
    </div>
    <UPageGrid>
      <UPageCard v-for="(card, index) in products" :key="index" v-bind="card" :ui="cardUI">
        <template #leading>
          <div class="flex justify-between w-full">
            <span class="font-medium" :class="[card.plan === ProductPlan.Pro ? 'text-green-600' : 'text-gray-400']">{{
              card.plan.toUpperCase()
              }}</span>
          </div>
        </template>
        <template #body>
          <div class="space-y-2 ">
            <div class="relative group mb-10">
              <UCarousel v-slot="{ item }" dots :items="card.imageLinks">
                <div class="flex flex-col items-center justify-center h-48">
                  <img :src="item" class="rounded" />
                </div>
              </UCarousel>
              <div
                class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded">
              </div>

              <div
                class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                @click="navigateTo(`/model/${card.alias}`)">
                <span class="text-white font-semibold">View Details</span>
              </div>
            </div>

            <div class="font-medium line-clamp-1 text-gray-600 text-sm hover:underline hover:cursor-pointer"
              @click="navigateTo(`/model/${card.alias}`)">{{
                card.name }}</div>
            <div class="flex justify-between">
              <div class="flex items-center gap-2 text-gray-500">
                <Icon name="ic:outline-payments" size="20" />
                <p class="font-medium"> {{ convertMoney(card.price) }}</p>
              </div>
              <UButton icon="ic:round-shopping-cart" color="neutral" variant="soft" class="hover:cursor-pointer"
                @click="addProduct(card.publicId)" />
            </div>
          </div>
        </template>
      </UPageCard>
    </UPageGrid>
  </UPage>
</template>

<script lang="ts" setup>
import { ProductPlan, type ProductSEOItemResponse } from '#shared/types/product'

type SortType = 'Popular' | 'Newest'

const pageUI = {
  center: 'py-5 space-y-10',
  left: 'px-4! py-1!'
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

const { addProduct } = useCart()
const sortOptions = <SortType[]>['Newest', 'Popular']
const products = useState<ProductSEOItemResponse[]>('products', () => [])
const categoryPublicIds = ref<string[]>([])
const chooseSortType = ref<SortType>('Popular')
const choosePlans = useState<ProductPlan[]>(() => [ProductPlan.Free, ProductPlan.Pro])

const { data: productList } = await useAsyncData(() => $fetch('/data/products', {
  onResponse({ response }) {
    if (response.ok) {
      products.value = response._data
    }
  }
}))

function setProductsWithCategories(publicIds: string[]) {
  if (publicIds.length) {
    const setCategoryPublicIds = new Set(publicIds)
    products.value = productList.value?.filter(prd =>
      prd.categories.some(ctg =>
        setCategoryPublicIds.has(ctg.publicId)
      )
    ) ?? []
  } else {
    products.value = productList.value ?? []
  }

  // if (!planValues.free) {
  //   products.value = products.value.filter(prd => prd.plan !== ProductPlan.Free)
  // }
  // if (!planValues.pro) {
  //   products.value = products.value.filter(prd => prd.plan !== ProductPlan.Pro)
  // }
}

function handlerSelectMenuItem(publicIds: string[]) {
  categoryPublicIds.value = publicIds
  setProductsWithCategories(publicIds)
}

// function isProductPlan(value: unknown): value is ProductPlan {
//   return Object.values(ProductPlan).includes(value as ProductPlan)
// }

function choosePlan(value: boolean | "indeterminate", plan: ProductPlan) {
  if (value === true) {
    setProductsWithCategories(categoryPublicIds.value)
    choosePlans.value.push(plan)
  } else {
    products.value = products.value.filter(prd => prd.plan !== plan)
    choosePlans.value = choosePlans.value.filter(pl => pl !== plan)
  }
}

// const planQueries = router.currentRoute.value.query['plans']
// if (planQueries) {
//   if (typeof planQueries === 'string') {
//     if (isProductPlan(planQueries)) {
//       choosePlans.value.push(planQueries)
//     }
//   } else if (Array.isArray(planQueries)) {
//     choosePlans.value.push(
//       ...planQueries.filter(isProductPlan)
//     )
//   }
// } else {
//   choosePlans.value = [ProductPlan.Free, ProductPlan.Pro]
//   router.replace({
//     query: {
//       plans: choosePlans.value
//     }
//   })
// }

</script>

<style></style>