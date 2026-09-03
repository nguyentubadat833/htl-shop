<script setup lang="ts">
import { useProductImport } from '~/composables/useProductImport';
import { tableColumns } from '~/composables/useProductImport/types';

const emits = defineEmits(["success"]);

const {
  tableRowItems,
  categories,
  openFolder,
  submit,
  clear,
  removeTableRow,
  createImageUrl,
  isMissingExternalLink,
  isMissingPrice,
  isMissingDesignFile,
  isMissingThumbnail,
  getStatusColor,
  getFileStatusColor,
  getThumbnails,
  getDesignFiles,
  categoryStringToArray,
  selectCategories,
} = useProductImport(() => emits("success"));
</script>

<template>
  <UModal title="Import products" fullscreen :ui="{ footer: 'flex justify-between' }">
    <UButton size="sm" icon="i-lucide-upload" color="info" />
    <template #body>
      <div class="min-h-[40vh] max-h-[60vh]">
        <UTable
          :data="tableRowItems"
          :columns="tableColumns"
          :ui="{ th: 'whitespace-nowrap', td: 'whitespace-nowrap' }"
        >
          <template #price-cell="{ row }">
            <div v-if="row.original.plan === 'PRO'">
              <UBadge v-if="isMissingPrice(row.original)" color="error" label="PRICE REQUIRED" />
              <div v-else>{{ priceToUSD(row.original.price) }}</div>
            </div>
          </template>

          <template #externalLink-cell="{ row }">
            <UBadge v-if="isMissingExternalLink(row.original)" color="error" label="LINK REQUIRED" />
            <div v-else>{{ row.original.externalLink }}</div>
          </template>

          <template #thumbnails-cell="{ row }">
            <UBadge v-if="isMissingThumbnail(row.original)" color="error" label="THUMBNAIL REQUIRED" />
            <div v-else class="flex flex-col gap-3 items-center">
              <div v-for="item in getThumbnails(row.original)" :key="item.file.name" class="w-full">
                <UButton
                  :loading="item.status === 'uploading'"
                  variant="outline"
                  :color="getFileStatusColor(item)"
                  block
                >
                  <div class="flex gap-2">
                    <img
                      v-if="item?.file && item.type === 'IMAGE'"
                      :src="createImageUrl(item.file)"
                      class="w-5 h-5 overflow-hidden"
                    />
                    Image
                  </div>
                </UButton>
              </div>
            </div>
          </template>

          <template #designFile-cell="{ row }">
            <UBadge v-if="isMissingDesignFile(row.original)" color="error" label="DESIGN FILE REQUIRED" />
            <div v-else>
              <div v-for="item in getDesignFiles(row.original)" :key="item.file.name">
                <UButton
                  :loading="item.status === 'uploading'"
                  :label="item?.file?.name"
                  icon="ic:baseline-file-present"
                  :color="getFileStatusColor(item)"
                  variant="outline"
                  block
                />
              </div>
            </div>
          </template>

          <template #categories-cell="{ row }">
            <USelectMenu
              :model-value="categoryStringToArray(row.original.categories)"
              multiple
              :items="categories ?? []"
              @update:model-value="(value) => selectCategories(value, row.index)"
              class="w-48"
            />
          </template>

          <template #status-cell="{ row }">
            <UButton
              :loading="row.original.status.type === 'processing'"
              :label="row.original.status.type"
              :color="getStatusColor(row.original)"
              variant="outline"
            />
          </template>

          <template #isDuplicate-cell="{ row }">
            <div>
              <UBadge v-if="row.original.isDuplicate" label="Duplicated" color="error" size="sm" />
            </div>
          </template>

          <template #actions-cell="{ row }">
            <UButton
              icon="ic:baseline-delete-outline"
              color="error"
              variant="soft"
              size="sm"
              @click="removeTableRow(row.index)"
            />
          </template>
        </UTable>
      </div>
    </template>

    <template #footer>
      <UButton
        to="/templates/product-import-template.zip"
        download="Product_Import_Template.zip"
        icon="i-heroicons-document-arrow-down"
        color="warning"
        variant="subtle"
        label="Example template"
        external
        size="sm"
      />
      <div class="space-x-2">
        <UButton
          v-if="!tableRowItems.length"
          :disabled="tableRowItems.some((item) => item.status.type === 'processing')"
          label="Choose folder"
          icon="i-lucide-folder-open"
          color="neutral"
          variant="outline"
          size="sm"
          @click="openFolder"
        />
        <UButton
          v-else
          :disabled="tableRowItems.some((item) => item.status.type === 'processing')"
          label="Clear"
          icon="ic:baseline-delete-sweep"
          color="error"
          variant="outline"
          @click="clear"
          size="sm"
        />
        <UButton label="Submit" icon="ic:baseline-publish" size="sm" @click="submit" />
      </div>
    </template>
  </UModal>
</template>