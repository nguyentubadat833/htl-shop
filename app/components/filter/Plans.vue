<template>
  <div class="flex gap-4">
    <UCheckbox :model-value="filterState.plans.includes(freePlan)" label="FREE"
      @update:model-value="(value) => choosePlan(value, freePlan)" />
    <UCheckbox :model-value="filterState.plans.includes(proPlan)" label="PRO"
      @update:model-value="(value) => choosePlan(value, proPlan)" />
  </div>

</template>

<script lang="ts" setup>
import { ProductPlan } from '~~/prisma/generated/browser'
import { useFilter } from '~/composables/components/filter';


const freePlan = ProductPlan.FREE;
const proPlan = ProductPlan.PRO;

const { filterState } = useFilter()
const plans = toRef(filterState.value, 'plans')

function choosePlan(value: boolean | "indeterminate", plan: ProductPlan) {
  if (value === true) {
    plans.value.push(plan)
  } else {
    plans.value = plans.value.filter(pl => pl !== plan)
  }
}
</script>

<style></style>