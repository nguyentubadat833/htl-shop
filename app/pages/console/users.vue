<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { SerializeObject } from 'nitropack'

const { $userApi } = useNuxtApp()
const globalFilter = ref()

const { data: users } = await useAsyncData(() => $userApi('/api/user/data'))

const columns: TableColumn<SerializeObject<UserItem>>[] = [
  {
    accessorKey: 'publicId',
    header: 'Id',
  },
  {
    accessorKey: 'provider',
    header: 'Provider',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: "Email"
  },
  {
    accessorKey: 'status',
    header: 'Status'
  },
  {
    accessorKey: 'createdAt',
    header: 'Register At'
  },
  {
    accessorKey: 'image',
    header: 'Avatar',
  },
]
</script>

<template>
  <div>
    <div class="flex px-4 py-3.5 border-b border-accented">
      <UInput v-model="globalFilter" class="max-w-sm" placeholder="Filter..." />
    </div>
    <UTable :data="users" :columns="columns" v-model:global-filter="globalFilter">
      <template #image-cell="{ row }">
        <UAvatar :src="row.original.image ?? undefined" :alt="row.original.name" />
      </template>
      <template #status-cell="{ row }">
        <UBadge v-if="row.original.status === 'ACTIVE'" :label="row.original.status" />
        <UBadge v-else color="neutral" :label="row.original.status" />
      </template>
      <template #createdAt-cell="{ row }">
        <NuxtTime :datetime="row.original.createdAt" />
      </template>
    </UTable>
  </div>
</template>

<style scoped></style>