<template>
  <div class="flex gap-4">
    <UCheckbox :model-value="filterState.categoryTypes.includes(CategoryType.THREE_D)" :label="CategoryType.THREE_D"
      @update:model-value="(value) => chooseCategoryType(value, CategoryType.THREE_D)" />
    <UCheckbox :model-value="filterState.categoryTypes.includes(CategoryType.TWO_D)" :label="CategoryType.TWO_D"
      @update:model-value="(value) => chooseCategoryType(value, CategoryType.TWO_D)" />
  </div>

</template>

<script lang="ts" setup>
import { useFilter } from '~/composables/components/filter';


const { filterState } = useFilter()
const categoryTypes = toRef(filterState.value, 'categoryTypes')

function chooseCategoryType(value: boolean | "indeterminate", type: CategoryType) {
  if (value === true) {
    categoryTypes.value.push(type)
  } else {
    categoryTypes.value = categoryTypes.value.filter(pl => pl !== type)
  }
}
</script>

<style></style>