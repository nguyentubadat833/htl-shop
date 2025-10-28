<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { Prisma } from '@prisma/client'

const userSelect = Prisma.validator<Prisma.UserDefaultArgs>()({
  select: {
    image: true,
    status: true,
    email: true,
    name: true,
    createdAt: true
  }
})
type User = Prisma.UserGetPayload<typeof userSelect>

const prisma = usePrismaClient()
const users = await prisma.user.findMany({
  ...userSelect
})


const columns: TableColumn<User>[] = [
  {
    accessorKey: 'image',
    header: 'Avatar',
  },
  {
    accessorKey: 'status',
    header: 'Status'
  },
  {
    accessorKey: 'email',
    header: "Email"
  },
  {
    accessorKey: 'createdAt',
    header: 'Register At'
  }
]
</script>

<template>
  <div>
    <UTable :data="users" :columns="columns">
      <template #image-cell="{ row }">
        <UAvatar :src="row.original.image ?? undefined" :alt="row.original.name" />
      </template>
      <template #status-cell="{ row }">
        <UBadge v-if="row.original.status === 'ACTIVE'" :label="row.original.status" />
        <UBadge v-else color="neutral" :label="row.original.status" />
      </template>
      <template #createdAt-cell="{row}">
        <NuxtTime :datetime="row.original.createdAt"/>
      </template>
    </UTable>
  </div>
</template>

<style scoped></style>