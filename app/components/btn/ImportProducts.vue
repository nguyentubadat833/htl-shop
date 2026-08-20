<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { useProductImport, type ProductWithFiles } from "~/composables/useProductImport";

const { isLoading, products, errorMessage, pickFolderAndBuild } = useProductImport();

const columns: TableColumn<ProductWithFiles>[] = [
  { accessorKey: "no", header: "No" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "plan", header: "Plan" },
  { accessorKey: "price", header: "Price" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "categories", header: "Categories" },
  {
    id: "images",
    header: "Thumbnails",
    cell: ({ row }) => `${row.original.images.length} Image`,
  },
  {
    id: "designFile",
    header: "File design",
    cell: ({ row }) => row.original.designFile?.name ?? "—",
  },
];
</script>

<template>
  <UModal title="Import product" :ui="{ content: 'min-w-[70vw]' }">
    <UButton icon="i-lucide-upload" color="info" />
    <template #body>
      <div class="min-h-[40vh] max-h-[60vh]">
        <UAlert v-if="errorMessage" color="error" variant="soft" :title="errorMessage" />

        <UTable v-if="products.length" :data="products" :columns="columns" />

        <p v-else-if="!isLoading" class="text-sm text-gray-500">Empty data.</p>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-between">
        <UButton label="Choose folder" icon="i-lucide-folder-open" :loading="isLoading" @click="pickFolderAndBuild" />
        <div></div>
      </div>
    </template>
  </UModal>
</template>
