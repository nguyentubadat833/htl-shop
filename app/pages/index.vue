<template>
  <UPage :ui="pageUI">
    <template #left>
      <UPageAside>
        <UiMenu />
      </UPageAside>
    </template>
    <div class="flex justify-between">

      <div class="flex gap-4">
        <UCheckbox :model-value="filterState.categoryTypes.includes(CategoryType.THREE_D)" :label="CategoryType.THREE_D"
          @update:model-value="(value) => chooseCategoryType(value, CategoryType.THREE_D)" />
        <UCheckbox :model-value="filterState.categoryTypes.includes(CategoryType.TWO_D)" :label="CategoryType.TWO_D"
          @update:model-value="(value) => chooseCategoryType(value, CategoryType.TWO_D)" />
      </div>

      <div class="flex gap-4">
        <UCheckbox :model-value="filterState.plans.includes(ProductPlan.FREE)" label="FREE"
          @update:model-value="(value) => choosePlan(value, ProductPlan.FREE)" />
        <UCheckbox :model-value="filterState.plans.includes(ProductPlan.PRO)" label="PRO"
          @update:model-value="(value) => choosePlan(value, ProductPlan.PRO)" />
      </div>


    </div>
    <UPageGrid>
      <UPageCard v-for="(card, index) in productList" :key="useId()" v-bind="card" :ui="cardUI">
        <template #leading>
          <div class="flex justify-between items-center w-full">
            <!-- <span class="font-medium" :class="[card.plan === ProductPlan.PRO ? 'text-green-600' : 'text-gray-400']">{{
              card.plan.toUpperCase()
            }}</span> -->
            <Icon v-if="card.categories.some(ct => ct.type === CategoryType.THREE_D)" name="cuida:box-outline" size="25"
              class="text-gray-400" />
            <Icon v-else name="cuida:layers-outline" size="25" class="text-gray-400" />
            <UBadge v-if="card.plan === ProductPlan.PRO" class="font-bold rounded-full">PRO</UBadge>
            <UBadge v-else class="font-bold rounded-full" color="neutral" variant="outline">FREE</UBadge>
          </div>
        </template>
        <template #body>
          <div class="space-y-2 ">
            <div class="relative group mb-10">
              <UCarousel v-slot="{ item }" dots :items="card.imageLinks">
                <div class="flex flex-col items-center justify-center h-48">
                  <img :src="item" class="rounded" alt="image" />
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
                <!-- <Icon name="ic:outline-payments" size="20" /> -->
                <p class="font-medium"> {{ priceToUSD(card.price) }}</p>
                <p class="text-gray-500 text-sm">{{ `(≈${priceToVND(card.priceVND)})` }}</p>
              </div>
              <UButton icon="ic:round-shopping-cart" color="neutral" variant="soft" class="hover:cursor-pointer"
                @click="addProduct(card.publicId, card.name)" />
            </div>
          </div>
        </template>
      </UPageCard>
    </UPageGrid>
  </UPage>
</template>

<script lang="ts" setup>
import { useIndex } from '~/composables/pages'
import { ProductPlan } from '~~/prisma/generated/browser'

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
const { filterState } = useIndex()
const plans = toRef(filterState.value, 'plans')
const categoryTypes = toRef(filterState.value, 'categoryTypes')

const { data: productList } = await useAsyncData(
  () => $fetch('/data/products', {
    query: filterState.value
  }),
  {
    watch: [filterState.value],
    transform(response) {
      return response.filter(prd => filterState.value.plans.includes(prd.plan))
    }
  }
)

function choosePlan(value: boolean | "indeterminate", plan: ProductPlan) {
  if (value === true) {
    plans.value.push(plan)
  } else {
    plans.value = plans.value.filter(pl => pl !== plan)
  }
}

function chooseCategoryType(value: boolean | "indeterminate", type: CategoryType) {
  if (value === true) {
    categoryTypes.value.push(type)
  } else {
    categoryTypes.value = categoryTypes.value.filter(pl => pl !== type)
  }
}

</script>

<style></style>