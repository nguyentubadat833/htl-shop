<template>
  <UHeader :ui="ui" mode="slideover" :toggle="false" :open="openToogleStatus">
    <template #left>
      <UiLogo />
      <!-- <UiGoogleButton class="lg:hidden" /> -->
      <UInput v-model="input" :loading="filterStatus" icon="i-lucide-search" variant="outline" placeholder="Search..." :ui="btnSearchUI" />
    </template>
    <template #right>
      <div class="lg:flex gap-3 hidden">
        <!-- <UColorModeButton class="hover:scale-110" /> -->
        <BtnColorMode class="hover:scale-110" />
        <BtnCart />
        <BtnGoogle />
      </div>
    </template>
    <template #body>
      <div class="flex justify-between">
        <FilterModelTypes />
        <FilterPlans />
      </div>
      <div class="flex-1 overflow-y-auto">
        <FilterModels />
      </div>
      <div>
        <UButton label="View Results" icon="ic:twotone-playlist-add-check" class="font-bold rounded-full" block @click="openToogleStatus = false" />
      </div>
    </template>
  </UHeader>
</template>

<script lang="ts" setup>
import { refDebounced } from "@vueuse/core";
import { useFilter } from "~/composables/components/filter";

const ui = {
  container: "lg:gap-3 gap-0",
  left: "items-center w-full flex lg:gap-4 gap-2",
  right: "space-x-1",
  body: "h-full flex flex-col gap-5 py-5",
};

const btnSearchUI = {
  root: "w-full",
  base: "rounded-3xl h-9",
};

const { openToogleStatus } = useFilter();
const input = ref<string>();
const inputDebounced = refDebounced(input, 1000);

const { filterState, filterStatus } = useFilter();

watchEffect(() => {
  if (filterState.value.keyWork === undefined) {
    input.value = "";
  }

  if (typeof inputDebounced.value === "string") {
    filterState.value.keyWork = inputDebounced.value;
    // filterState.value.loading = true
  }
});

// import type { NavigationMenuItem } from "@nuxt/ui";

// const route = useRoute();

// const items = computed<NavigationMenuItem[]>(() => [{
//   label: "Docs",
//   to: "/docs/getting-started",
//   icon: "i-lucide-book-open",
//   active: route.path.startsWith("/docs/getting-started")
// }, {
//   label: "Components",
//   to: "/docs/components",
//   icon: "i-lucide-box",
//   active: route.path.startsWith("/docs/components")
// }, {
//   label: "Figma",
//   icon: "i-simple-icons-figma",
//   to: "https://go.nuxt.com/figma-ui",
//   target: "_blank"
// }, {
//   label: "Releases",
//   icon: "i-lucide-rocket",
//   to: "https://github.com/nuxt/ui/releases",
//   target: "_blank"
// }]);
</script>

<style></style>
