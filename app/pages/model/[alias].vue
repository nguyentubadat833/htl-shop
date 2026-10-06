<template>
  <div class="flex flex-col gap-5">
    <div class="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
      <div class="min-w-0 w-full lg:px-8">
        <ProductGallery :images="info?.images ?? []" :name="info?.name ?? ''" />
      </div>
      <div class="flex flex-col gap-6">
        <div class="pb-2 lg:mt-0 mt-10">
          <h1 class="font-bold text-xl">{{ info?.name }}</h1>
        </div>

        <div class="flex flex-col gap-5">
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
            <!-- <UButton
              label="Add to cart"
              icon="ic:outline-add-shopping-cart"
              color="secondary"
              variant="soft"
              :ui="btnAddToCartUI"
              block
              class="hover:cursor-pointer"
              @click="
                () => {
                  info?.id && addProduct(info.id, info.name);
                }
              "
            /> -->
            <UButton label="Add to cart" icon="ic:outline-add-shopping-cart" color="secondary" :ui="btnAddToCartUI"
              block class="hover:cursor-pointer" @click="
                () => {
                  info?.id && addProduct(info.id, info.name);
                }
              " />
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
import { ProductPlan } from "~~/prisma/generated/browser";

const btnAddToCartUI = {
  root: "w-full",
  base: "rounded-3xl h-10",
};

const { siteUrl } = useRuntimeConfig().public;
const requestUrl = useRequestURL();
const siteOrigin = siteUrl || requestUrl.origin;
const route = useRoute();
const { addProduct } = useCart();

const { data: info, error } = await useFetch(() => `/data/product/${encodeURIComponent(String(route.params.alias))}`, {
  transform(value) {
    return {
      id: value.publicId,
      name: value.name,
      price: value.price + " $",
      amount: value.price,
      indexable: value.indexable,
      plan: value.plan,
      images: value.imageLinks,
      specs: [
        {
          name: "Platform",
          value: value.info.platform,
        },
        {
          name: "Render",
          value: value.info.render,
        },
        {
          name: "Size",
          value: value.info.size,
        },
        {
          name: "Colors",
          value: value.info.colors,
        },
        {
          name: "Style",
          value: value.info.style,
        },
        {
          name: "Materials",
          value: value.info.materials,
        },
        {
          name: "Formfactor",
          value: value.info.formfactor,
        },
      ],
      description: value.info.description,
    };
  },
});

if (!info.value) {
  throw createError({
    statusCode: error.value?.statusCode || 404,
    statusMessage: error.value?.statusCode === 404 ? "Product not found" : "Unable to load product",
  });
}

const description = computed(() => info.value?.description || `Download ${info.value?.name} for architecture and interior visualization at 3d2ds.`);
useSeoMeta({
  title: () => info.value?.name,
  description: () => description.value,
  ogTitle: () => info.value?.name,
  ogType: "website",
  ogImage: () => info.value?.images[0] ? new URL(info.value.images[0], siteOrigin).href : new URL("/images/logo.jpg", siteOrigin).href,
  ogImageAlt: () => info.value?.name,
  ogDescription: () => description.value,
  twitterCard: "summary_large_image",
  robots: () => info.value?.indexable === false ? "noindex, nofollow" : "index, follow",
});
useHead(() => ({
  script: info.value?.indexable === false ? [] : [{
    key: "product-jsonld",
    type: "application/ld+json",
    textContent: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: info.value?.name,
      description: description.value,
      image: info.value?.images.map(image => new URL(image, siteOrigin).href),
      sku: info.value?.id,
      offers: {
        "@type": "Offer",
        url: new URL(route.path, siteOrigin).href,
        priceCurrency: "USD",
        price: info.value?.amount,
        availability: "https://schema.org/InStock",
      },
    }).replace(/</g, "\\u003c"),
  }],
}));
</script>
