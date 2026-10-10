<template>
  <div v-if="chips.length" class="flex flex-wrap items-center gap-2" aria-label="Active filters">
    <UButton v-for="chip in chips.slice(0, 3)" :key="chip.key" :label="chip.label"
      trailing-icon="i-lucide-x" color="neutral" variant="soft" size="xs" class="rounded-full"
      :aria-label="`Remove filter: ${chip.label}`" @click="remove(chip)" />
    <UPopover v-if="chips.length > 3">
      <UButton :label="`+${chips.length - 3} filters`" color="neutral" variant="soft" size="xs" class="rounded-full" />
      <template #content>
        <div class="flex max-w-sm max-h-64 flex-wrap gap-2 overflow-y-auto p-3">
          <UButton v-for="chip in chips.slice(3)" :key="chip.key" :label="chip.label"
            trailing-icon="i-lucide-x" color="neutral" variant="soft" size="xs" class="rounded-full"
            :aria-label="`Remove filter: ${chip.label}`" @click="remove(chip)" />
        </div>
      </template>
    </UPopover>
    <UButton label="Clear all" color="neutral" variant="link" size="xs" @click="resetFilter" />
  </div>
</template>

<script setup lang="ts">
import { ProductPlan } from '~~/prisma/generated/browser';
import { useFilter } from '~/composables/components/filter';

type Chip = { key: string; label: string; kind: 'plan' | 'type' | 'category' | 'search'; id?: string };
const { filterState, filterCategories, resetFilter } = useFilter();
const chips = computed<Chip[]>(() => {
  const state = filterState.value;
  const result: Chip[] = [];
  if (state.keyWork?.trim()) result.push({ key: 'search', label: `Search: ${state.keyWork.trim()}`, kind: 'search' });
  if (state.plans.length !== 2) result.push({ key: 'plan', label: state.plans.join(', ') || 'No plans selected', kind: 'plan' });
  if (state.categoryTypes.length !== 2) result.push({ key: 'type', label: state.categoryTypes.join(', ') || 'No model types selected', kind: 'type' });
  result.push(...filterCategories.value.map(category => ({
    key: `category:${category.publicId}`, label: category.name, kind: 'category' as const, id: category.publicId,
  })));
  return result;
});

function remove(chip: Chip) {
  const state = filterState.value;
  if (chip.kind === 'search') state.keyWork = undefined;
  if (chip.kind === 'plan') state.plans = [ProductPlan.FREE, ProductPlan.PRO];
  if (chip.kind === 'type') state.categoryTypes = [CategoryType.TWO_D, CategoryType.THREE_D];
  if (chip.kind === 'category') {
    filterCategories.value = filterCategories.value.filter(category => category.publicId !== chip.id);
    const ids = filterCategories.value.map(category => category.publicId);
    state.categoryPublicIds = ids.length ? ids : undefined;
  }
}
</script>
