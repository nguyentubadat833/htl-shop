<script setup lang="ts">
import { AddProductSchema, UpdateProductSchema } from '#shared/schemas/product'
import type { TableColumn } from '@nuxt/ui';
import type z from 'zod';

type Product = ProductItemResponse | Partial<ProductItemResponse>
type UploadState = {
  index: number
  percent: number
  status: 'progress' | 'success' | 'error'
}

const fileUploadUI = {
  files: 'max-h-96 overflow-y-auto'
}

const currency = ref('USD')
const { $userApi } = useNuxtApp()
const toast = useToast()
const selectFiles = ref<File[]>()
const uploadStates = ref<UploadState[]>([])

const products = ref<Product[]>([{}])
const productIndexSelected = ref<number>()
const productIndexProgress = ref<number>()

const { pending, refresh } = useAsyncData(async () => await $userApi('/api/product/list', {
  onResponse({ response }) {
    if (response.ok) {
      const data = response._data as ProductItemResponse[]
      products.value = [{}, ...data]
    }
  }
}))

const columns: TableColumn<Product>[] = [
  {
    id: 'no',
    header: "No",
  },
  {
    accessorKey: 'status',
    header: "Status"
  },
  {
    accessorKey: "name",
    header: "Name"
  },
  {
    accessorKey: 'price',
    header: "Price"
  },
  {
    accessorKey: 'images',
    header: "Images"
  },
  {
    accessorKey: 'createdAt',
    header: "Created At"
  },
  {
    id: 'action'
  }
]

watchEffect(() => {
  console.log(selectFiles.value)
})

function getImgUrlFromFile(file: File) {
  return URL.createObjectURL(file)
}

function getUploadStateWithIndex(index: number) {
  return uploadStates.value.find(e => e.index === index)
}

function addProduct() {
  if (!products.value[1]?.publicId) {
    return
  }
  products.value.splice(1, 0, {})
  productIndexSelected.value = 1
}

function saveProduct(index: number) {
  const product = products.value[index]
  if (!product) return

  productIndexProgress.value = index
  if (!product.publicId) {
    $userApi('/api/product/add', {
      method: 'POST',
      body: <z.infer<typeof AddProductSchema>>{
        name: product.name,
        price: product.price
      },
      onResponse({ response }) {
        if (response.ok) {
          refresh()
          toast.add({
            title: "Success"
          })
        }
      }
    }).finally(() => {
      productIndexProgress.value = undefined
    })
  } else {
    $userApi('/api/product/update', {
      method: 'PUT',
      body: <z.infer<typeof UpdateProductSchema>>{
        publicId: product.publicId,
        name: product.name,
        price: product.price,
        status: product.status
      },
      onResponse({ response }) {
        if (response.ok) {
          refresh()
          toast.add({
            title: "Success"
          })
        }
      }
    }).finally(() => {
      productIndexProgress.value = undefined
    })
  }
}

</script>

<template>
  <div class="space-y-3">
    <UTable :loading="pending" :data="products" :columns="columns">
      <template #no-cell="{ row }">
        <UButton v-if="!row.index" label="Add" icon="ic:baseline-plus" color="neutral" variant="soft"
          @click="addProduct()" />
      </template>
      <template #createdAt-cell="{ row }">
        <NuxtTime v-if="row.original.publicId" :datetime="row.original.createdAt!" />
      </template>
      <template #action-cell="{ row }">
        <div v-if="row.index" class="space-x-3">
          <UButton icon="ic:outline-edit"
            @click="!productIndexSelected ? productIndexSelected = row.index : productIndexSelected = undefined"
            color="neutral" />
          <UButton v-if="productIndexSelected && productIndexSelected === row.index"
            :loading="row.index === productIndexProgress" icon="ic:baseline-save" @click="saveProduct(row.index)" />
        </div>
      </template>
      <template #status-cell="{ row }">
        <div v-if="row.index && row.original.publicId">
          <USelect v-if="productIndexSelected === row.index && row.original.publicId" v-model="row.original.status"
            :items="['ACTIVE', 'INACTIVE']" />
          <UBadge v-else :label="row.original.status"
            :color="row.original.status === 'INACTIVE' ? 'neutral' : undefined" />
        </div>
      </template>
      <template #name-cell="{ row }">
        <div v-if="row.index">
          <UInput v-if="productIndexSelected === row.index" v-model="row.original.name" class="w-72" />
          <p v-else>{{ row.original.name }}</p>
        </div>
      </template>
      <template #images-cell="{ row }">
        <div v-if="row.index">
          <USlideover>
            <UButton icon="ic:baseline-more-horiz" color="neutral" variant="subtle" />
            <template #content>
              <div class="space-y-4 p-4">
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="font-medium">Images</span>
                  </div>
                  <USeparator />
                  <div class="max-h-72">
                    <UFileUpload v-model="selectFiles" icon="i-lucide-image" label="Drop your images here" layout="list"
                      accept="image/*" multiple :interactive="false" class="w-full min-h-48" :ui="fileUploadUI">
                      <template #actions="{ open }">
                        <UButton label="Select images" icon="i-lucide-upload" color="neutral" variant="outline"
                          @click="open()" />
                      </template>
                      <template #file="{ file, index }">
                        <div class="flex items-center gap-2">
                          <div class="flex items-center h-10 w-10 p-1 rounded-full border border-gray-200">
                            <img :src="getImgUrlFromFile(file)" />
                          </div>
                          <div class="text-[0.7rem] flex flex-col gap-1 h-10">
                            <div class="flex justify-between gap-2">
                              <span>{{ file.name }}</span>
                              <!-- <Icon name="material-symbols:cancel-outline" size="15" class="hover:cursor-pointer"
                                @click="
                                  () => {
                                    selectFiles?.splice(index, 1)
                                  }
                                " /> -->
                            </div>
                            <div v-if="uploadStates.some(e => e.index === index)">
                              <UProgress v-if="getUploadStateWithIndex(index)?.status === 'progress'"
                                :model-value="getUploadStateWithIndex(index)!.percent" />
                              <UProgress v-else-if="getUploadStateWithIndex(index)?.status === 'error'"
                                :model-value="100" color="error" />
                              <UProgress v-else-if="getUploadStateWithIndex(index)?.status === 'success'"
                                :model-value="100" />
                            </div>
                          </div>
                        </div>
                      </template>
                      <template #files-bottom="{ removeFile, files }">
                        <div class="flex w-full gap-3">
                          <UButton v-if="files?.length" label="Remove all files" color="neutral"
                            @click="removeFile()" />
                          <UButton icon="ic:sharp-cloud-upload" label="Upload" block />
                        </div>
                      </template>
                    </UFileUpload>
                  </div>

                </div>
              </div>
            </template>
          </USlideover>
        </div>
      </template>
      <template #price-cell="{ row }">
        <div v-if="row.index">
          <UInputNumber v-if="productIndexSelected === row.index" v-model="row.original.price" :format-options="{
            style: 'currency',
            currency: currency,
            currencyDisplay: 'code',
            currencySign: 'accounting'
          }" />

          <p v-else>{{ row.original.price }} {{ currency }}</p>
        </div>
      </template>
    </UTable>
  </div>
</template>

<style scoped></style>