<template>
  <UNavigationMenu orientation="vertical" :items="items" class="min-w-0 data-[orientation=vertical]"
    :ui="{ linkLabel: 'lg:min-w-0 lg:flex-1', linkTrailingBadge: 'shrink-0' }">
    <!-- <template #item-leading="{ item }">
      <ClientOnly>
        <UCheckbox v-if="item.isMenuItem" :model-value="selectedCategoryPublicId?.includes(item.publicId)"
          @update:model-value="(value) => onCheckboxChange(value, item.publicId)" />
      </ClientOnly>
    </template> -->

    <template #item-label="{ item }">
      <label class="lg:block lg:min-w-0 lg:w-full" :title="item.label">
        <div class="flex gap-2 lg:min-w-0 lg:items-center">
          <ClientOnly>
            <UCheckbox
              v-if="item.isMenuItem"
              class="shrink-0"
              :model-value="selectedCategoryPublicId?.includes(item.publicId)"
              @update:model-value="(value) => onCheckboxChange(value, item.publicId, item.label)"
            />
          </ClientOnly>
          <span class="lg:min-w-0 lg:truncate">{{ item.label }}</span>
        </div>
      </label>
    </template>
  </UNavigationMenu>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from "@nuxt/ui";
import { useFilter } from "~/composables/components/filter";

// type MenuItem = {
//   code: string
//   name: string
// }

// const { data: nav } = await useAsyncData('menu', () => {
//   return queryCollection('ui')
//     .where('stem', '=', 'nav/menu')
//     .first()
// }, {
//   transform(value) {
//     return {
//       threeD: value?.meta?.["3D"] as MenuItem[],
//       twoD: value?.meta?.["2D"] as MenuItem[]
//     }
//   }
// })

const { filterState, filterCategories } = useFilter();
const selectedCategoryPublicId = toRef(filterState.value, "categoryPublicIds");

const { data: nav } = await useAsyncData(() => $fetch<CategorySEOItem[]>(String("/data/categories")), {
  transform(value) {
    return {
      threeD: value.filter((i) => i.type === CategoryType.THREE_D),
      twoD: value.filter((i) => i.type === CategoryType.TWO_D),
    };
  },
});

const items = ref<NavigationMenuItem[][]>([
  [
    { label: "Models", type: "label" },
    {
      label: "3D",
      icon: "cuida:box-outline",
      open: true,
      children:
        nav.value?.threeD?.map((item) => {
          return {
            isMenuItem: true,
            publicId: item.publicId,
            label: item.name,
            // badge: item.products.count,
            badge: item.productCounts
          };
        }) ?? [],
    },
    {
      label: "2D",
      icon: "cuida:layers-outline",
      open: true,
      children:
        nav.value?.twoD?.map((item) => {
          return {
            isMenuItem: true,
            publicId: item.publicId,
            label: item.name,
            badge: item.productCounts
          };
        }) ?? [],
    },
  ],
]);

function onCheckboxChange(value: boolean | "indeterminate", publicId?: string, name?: string) {
  if (!selectedCategoryPublicId.value) {
    selectedCategoryPublicId.value = [];
  }

  if (publicId && name) {
    if (value === true) {
      filterCategories.value.push({
        publicId,
        name,
      });
      // selectedCategoryPublicId.value.push(publicId)
    } else {
      filterCategories.value = filterCategories.value.filter((ftg) => ftg.publicId !== publicId);
      // selectedCategoryPublicId.value = selectedCategoryPublicId.value.filter(pId => pId !== publicId)
    }
    selectedCategoryPublicId.value = filterCategories.value.map((ftg) => ftg.publicId);
  }
}
</script>

<style></style>
