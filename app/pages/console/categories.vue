<template>
  <div class="grid grid-cols-[6fr_4fr] gap-4">
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
    <div class="space-y-5 overflow-y-auto p-3">
      <UCard :ui="layout.orderItems.ui">
        <UButton icon="ic:outline-plus" label="Add Category" block @click="add()" />
        <UFormField label="ID">
          <UInput v-model="state.current.publicId" class="w-full" />
        </UFormField>
        <UFormField label="Name">
          <UInput v-model="state.current.name" class="w-full" />
        </UFormField>
        <UFormField label="Status">
          <USelect v-model="state.current.status" :items="statusValues" class="w-full" />
        </UFormField>
        <UFormField label="Group">
          <USelect v-model="state.current.type" :items="groupValues" class="w-full" />
        </UFormField>
        <UFormField label="Products">
          <UTable :data="state.current.products" :columns="productColumns" />
        </UFormField>
        <div class="flex justify-end gap-3">
          <UButton icon="ic:sharp-delete-forever" label="Delete" color="error" @click="del()" />
          <UButton icon="ic:baseline-save" label="Save" color="info" block @click="save()" />
        </div>
      </UCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn, TableRow } from '@nuxt/ui';
import { CategoryType, type CategoryItemResponse, type CategoryProductItemResponse } from '#shared/types/category';

type CategoryStatus = 'ACTIVE' | 'INACTIVE'
type Category = {
  publicId: string | undefined
  name: string
  type: CategoryType
  status: CategoryStatus
  products: {
    publicId: string
    name: string
  }[]
}

interface State {
  data: CategoryItemResponse[],
  current: Category
}

const layout = {
  orderItems: {
    ui: {
      body: 'h-full space-y-5'
    }
  },
}

const statusValues: CategoryStatus[] = ['ACTIVE', 'INACTIVE']
const groupValues: CategoryType[] = [CategoryType.THREE_D, CategoryType.TWO_D]

const columns = [
  {
    accessorKey: "name",
    header: "Name"
  },
  {
    accessorKey: 'type',
    header: "Group"
  },
  {
    accessorKey: 'active',
    header: 'Status'
  },
  {
    id: 'action'
  }
] satisfies TableColumn<CategoryItemResponse>[]

const productColumns = [
  {
    accessorKey: "publicId",
    header: "ID"
  },
  {
    accessorKey: "name",
    header: "Name"
  },
] satisfies TableColumn<CategoryProductItemResponse>[]

const categoryDefaultState: Category = {
  publicId: undefined,
  name: '',
  type: CategoryType.THREE_D,
  status: 'INACTIVE',
  products: []
}

const globalFilter = ref()
const state = reactive<State>({
  data: [],
  current: structuredClone(categoryDefaultState)
})

const appToast = new useAppToast()
const { $userApi } = useNuxtApp()
const { refresh, pending } = await useAsyncData(() => $userApi('/api/category/list', {
  onResponse({ response }) {
    if (response.ok) {
      state.data = response._data
    }
  }
}))

function categoryRowToProduct(category: CategoryItemResponse) {
  state.current.publicId = category.publicId
  state.current.name = category.name
  state.current.type = category.type as CategoryType
  state.current.status = category.active ? 'ACTIVE' : "INACTIVE"
  state.current.products = category.products
}

function onSelect(row: TableRow<CategoryItemResponse>, e?: Event) {
  categoryRowToProduct(row.original)
}

function generateStatus(value: boolean): {
  label: CategoryStatus,
  color: any
} {
  return {
    label: value ? 'ACTIVE' : 'INACTIVE',
    color: (value ? 'success' : 'neutral') as any
  }
}

// function selectStatus(input: string) {
//   state.current.status = input as CategoryStatus
// }

// function selectGroup(input: string) {
//   state.current.type = input as CategoryType
// }

function add() {
  state.current = structuredClone(categoryDefaultState)
}

async function save() {
  if (state.current.publicId) {
    await $userApi('/api/category/update', {
      method: 'PUT',
      body: {
        publicId: state.current.publicId,
        data: {
          name: state.current.name,
          type: state.current.type,
          active: state.current.status === 'ACTIVE'
        }
      },
      onResponse({ response }) {
        if (response.ok) {
          refresh()
            .then(() => {
              const publicId = response._data.publicId
              const category = state.data.find(c => c.publicId === publicId)
              if (category) {
                categoryRowToProduct(category)
              }
            })
          appToast.toast.add({
            title: "Updated"
          })
        }
      }
    })
  } else {
    await $userApi('/api/category/add', {
      method: 'POST',
      body: {
        name: state.current.name,
        type: state.current.type,
        active: state.current.status === 'ACTIVE'
      },
      onResponse({ response }) {
        if (response.ok) {
          refresh()
            .then(() => {
              const publicId = response._data.publicId
              const category = state.data.find(c => c.publicId === publicId)
              if (category) {
                categoryRowToProduct(category)
              }
            })
          appToast.toast.add({
            title: "Created"
          })
        }
      }
    })
  }
}

function del() {
  if (!state.current.publicId) {
    return
  }

  $userApi('/api/category/delete', {
    method: 'DELETE',
    query: {
      publicId: state.current.publicId
    },
    onResponse({ response }) {
      if (response.ok) {
        refresh()
          .then(() => {
            state.current = structuredClone(categoryDefaultState)
          })
        appToast.toast.add({
          title: "Deleted"
        })
      }
    }
  })
}
</script>

<style></style>