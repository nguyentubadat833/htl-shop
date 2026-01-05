<template>
  <div :class="[{ 'grid grid-cols-[6fr_4fr] gap-4': state.current }]">
    <div>
      <div class="flex px-4 py-3.5 border-b border-accented">
        <UInput v-model="globalFilter" class="max-w-sm" placeholder="Filter..." />
      </div>
      <UTable id="gridData" :loading="pending" :data="state.data" :columns="columns"
        v-model:global-filter="globalFilter" @select="(row, e) => onSelect(row, e)">
        <template #active-cell="{ row }">
          <UBadge :label="generateStatus(row.original.active).label"
            :color="generateStatus(row.original.active).color" />
        </template>
      </UTable>
    </div>
    <div v-if="state.current" class="space-y-5 overflow-y-auto p-3">
      <UCard :ui="layout.orderItems.ui">
        <UFormField label="Product">
          <!-- <UTable :data="state.current.products ?? []" :columns="orderItemsColumns">
            <template #price-cell="{ row }">
              {{ row.original.price }} {{ state.currency }}
            </template>
          </UTable> -->
        </UFormField>
        <UFormField label="Payments">

        </UFormField>
      </UCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn, TableRow } from '@nuxt/ui';
import type { CategoryItemResponse } from '#shared/types/category';

interface State {
  data: CategoryItemResponse[],
  current: CategoryItemResponse | undefined
}

const layout = {
  orderItems: {
    ui: {
      body: 'h-full space-y-5'
    }
  },
}

const columns = [
  {
    accessorKey: 'publicId',
    header: "ID"
  },
  {
    accessorKey: "name",
    header: "Name"
  },
  {
    accessorKey: 'type',
    header: "Type"
  },
  {
    accessorKey: 'active',
    header: 'Status'
  }
] satisfies TableColumn<CategoryItemResponse>[]

const globalFilter = ref()
const state = reactive<State>({
  data: [],
  current: undefined
})

const { $userApi } = useNuxtApp()
const { refresh, pending } = await useAsyncData(() => $userApi('/api/category/list', {
  onResponse({ response }) {
    if (response.ok) {
      state.data = response._data
    }
  }
}))

function onSelect(row: TableRow<CategoryItemResponse>, e?: Event) {
  state.current = row.original
}

function generateStatus(value: boolean) {
  return {
    label: value ? 'ACTIVE' : 'INACTIVE',
    color: (value ? 'success' : 'neutral') as any
  }
}

</script>

<style></style>