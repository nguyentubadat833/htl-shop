<template>
  <UPage :ui="pageUI">
    <template #left>
      <UPageAside>
        <FilterModels />
      </UPageAside>
    </template>
    <div class="lg:flex justify-between hidden">
      <FilterModelTypes />
      <FilterPlans />
    </div>
    <div class="flex flex-col gap-5">
      <div class="flex gap-3 lg:hidden"">
        <FilterOptions/>
        <FilterReset/>
      </div>
      <div class="hidden lg:block">
       <FilterReset/>
      </div>      
      <div class="flex flex-wrap gap-3">
        <UBadge v-for="item in filterTags" :label="item" color="neutral" variant="soft" class="rounded-full max-w-20" />
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
import { ProductPlan } from '~~/prisma/generated/browser'
import { useFilter } from '~/composables/components/filter'

useSeoMeta({
  title: 'Home'
})

const pageUI = {
  center: 'py-5 flex flex-col gap-10',
  left: 'px-4! py-1!'
}

const cardUI = {
  root: 'shadow-md dark:ring-1 light:ring-0 rounded hover:shadow-2xl hover:scale-102',
  leading: 'w-full',
  body: 'w-full',
  container: 'p-2 sm:p-4'
}

// const chooseSortTypeUI = {
//   base: 'ring-0!'
// }

const { addProduct } = useCart()
const { filterState, filterStatus, filterTags } = useFilter()

const { data: productList, pending } = await useAsyncData(
  () => $fetch('/data/products', {
    query: filterState.value,
  }),
  {
    watch: [filterState.value],
    transform(response) {
      return response.filter(prd => filterState.value.plans.includes(prd.plan))
    }
  }
)

watch(pending, (newValue) => {
  filterStatus.value = newValue
})
</script>

<style></style>