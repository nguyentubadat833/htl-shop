<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";

useSeoMeta({
  title: "Database Management",
});

const toast = useToast();
const { $userApi } = useNuxtApp();

const { data: backups, pending, refresh, error } = await useAsyncData(() => $userApi<BackupFileItem[]>("/api/database/backups"));
const { execute: runsqlBackup, pending: isBackingUp } = useLazyAsyncData(
  () =>
    $userApi("/api/database/backup", {
      method: "post",
      onResponse({ response }) {
        if (response.ok) {
          toast.add({
            title: "Backup completed successfully",
          });

          void refresh();
        } else {
          toast.add({
            color: "error",
            title: "Database backup failed",
          });
        }
      },
    }),
  {
    immediate: false,
  },
);

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(dateStr: Date) {
  return new Date(dateStr).toLocaleString("vi-VN");
}

const columns: TableColumn<BackupFileItem>[] = [
  { accessorKey: "name", header: "File name" },
  { accessorKey: "size", header: "Size" },
  { accessorKey: "lastModified", header: "Backup date" },
  //   { id: "actions", header: "Actions" },
];
</script>

<template>
  <UCard :ui="{ root: 'h-full', body: 'overflow-hidden flex flex-col h-full' }">
    <div class="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
      <div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">Database Backup History</h3>
        <p class="text-sm text-gray-500">Database backups are stored at: backups/database/*</p>
      </div>

      <div class="flex items-center gap-3">
        <UButton label="Refresh" icon="i-lucide-refresh-cw" color="neutral" variant="outline" :loading="pending" @click="() => refresh()" />
        <UButton label="Backup" icon="heroicons:play-circle" :loading="isBackingUp" @click="() => runsqlBackup()" />
      </div>
    </div>

    <UAlert v-if="error" color="error" variant="soft" title="Unable to load database backups" :description="error.statusMessage" class="mt-4" />

    <UTable :data="backups || []" :columns="columns" :loading="pending" :ui="{ th: 'whitespace-nowrap', td: 'whitespace-nowrap' }" class="flex-1 full">
      <template #size-cell="{ row }">
        <span class="font-mono text-xs">{{ formatBytes(row.original.size) }}</span>
      </template>

      <template #lastModified-cell="{ row }">
        <span class="text-xs text-gray-500">{{ formatDate(row.original.lastModified) }}</span>
      </template>

      <template #actions-cell="{ row }">
        <UButton
          icon="i-lucide-download"
          size="xs"
          color="info"
          variant="ghost"
          :to="`/api/backups/download?file=${encodeURIComponent(row.original.name)}`"
          target="_blank"
        >
          Download
        </UButton>
      </template>

      <template #empty-state>
        <div class="flex flex-col items-center justify-center py-6 text-gray-500">
          <UIcon name="i-lucide-database" class="w-8 h-8 mb-2" />
          <p>No database backup files found in database/.</p>
        </div>
      </template>
    </UTable>
  </UCard>
</template>
