<template>
  <UPage :ui="pageUI">
    <template #left>
      <UPageAside>
        <FilterModels />
      </UPageAside>
    </template>
    <h1 class="text-xl font-semibold">3D &amp; 2D Models for Architecture</h1>
    <div class="lg:flex justify-between hidden">
      <FilterModelTypes />
      <FilterPlans />
    </div>
    <div class="flex flex-col gap-5">
      <div class="flex gap-3 lg:hidden">
        <FilterOptions />
        <FilterReset />
      </div>
      <div class="hidden lg:block">
        <FilterReset />
      </div>
      <div class="flex flex-wrap gap-3">
        <UBadge v-for="item in filterTags" :label="item" color="neutral" variant="soft" class="rounded-full max-w-20" />
      </div>
    </div>
    <UPageGrid>
      <UPageCard v-for="(card, index) in productList" :key="card.publicId" :ui="cardUI">
        <template #leading>
          <div class="flex justify-between items-center w-full">
            <!-- <span class="font-medium" :class="[card.plan === ProductPlan.PRO ? 'text-green-600' : 'text-gray-400']">{{
              card.plan.toUpperCase()
            }}</span> -->
            <Icon v-if="card.categories.some((ct) => ct.type === CategoryType.THREE_D)" name="cuida:box-outline"
              size="25" class="text-gray-400" />
            <Icon v-else name="cuida:layers-outline" size="25" class="text-gray-400" />
            <UBadge v-if="card.plan === ProductPlan.PRO" class="font-bold rounded-full">PRO</UBadge>
            <UBadge v-else class="font-bold rounded-full" color="neutral" variant="outline">FREE</UBadge>
          </div>
        </template>
        <template #body>
          <div class="flex flex-col gap-3">
            <ProductGallery :images="card.imageLinks" :name="card.name" compact :lazy="index > 2" />
            <NuxtLink :to="`/model/${card.alias}`" class="font-medium line-clamp-1 text-sm hover:underline">
              {{ card.name }}
            </NuxtLink>
            <div class="flex justify-between">
              <div class="flex items-center gap-1 text-gray-500">
                <!-- <Icon name="ic:outline-payments" size="20" /> -->
                <p class="font-medium">{{ priceToUSD(card.price) }}</p>
                <p class="text-gray-500 text-sm">{{ `(≈${priceToVND(card.priceVND)})` }}</p>
              </div>
              <!-- <UButton icon="ic:round-shopping-cart" color="neutral" variant="soft" class="hover:cursor-pointer" @click="addProduct(card.publicId, card.name)" /> -->
            </div>
            <div class="flex gap-2">
              <UButton :label="card.plan === ProductPlan.FREE ? 'Download free' : 'Buy now'" icon="ic:outline-payments" color="warning" block
                @click="buyNow(card.publicId)" />
              <UButton icon="ic:baseline-add-shopping-cart" color="neutral" variant="soft" class="hover:cursor-pointer"
                @click="() => void addProduct(card.publicId, card.name)" />
            </div>
          </div>
        </template>
      </UPageCard>
    </UPageGrid>
  </UPage>
</template>

<script lang="ts" setup>
import { ProductPlan } from "~~/prisma/generated/browser";
import { useFilter } from "~/composables/components/filter";

useSeoMeta({
  title: "3D & 2D Models for Architecture and Interior Design",
  ogTitle: "3D & 2D Models for Architecture and Interior Design",
  description: "Explore free and premium 3D and 2D models for architecture, interior design and visualization at 3d2ds.",
});

const pageUI = {
  center: "min-w-0 py-5 flex flex-col gap-10",
  left: "px-4! py-1!",
};

const cardUI = {
  root: "min-w-0 max-w-full shadow-md dark:ring-1 light:ring-0 rounded hover:shadow-2xl hover:scale-102",
  leading: "w-full",
  wrapper: "min-w-0 w-full",
  body: "w-full min-w-0",
  container: "min-w-0 p-2 sm:p-4 lg:flex",
};

// const chooseSortTypeUI = {
//   base: 'ring-0!'
// }

const { addProduct, buyNow } = useCart();
const { filterState, filterStatus, filterTags } = useFilter();

const { data: productList, pending } = await useAsyncData(
  () =>
    $fetch<ProductSEOListItemResponse[]>("/data/products", {
      query: filterState.value,
    }),
  {
    watch: [filterState],
    transform(response) {
      return response.filter((prd) => filterState.value.plans.includes(prd.plan));
    },
  },
);

watch(pending, (newValue) => {
  filterStatus.value = newValue;
});
</script>

<style></style>
