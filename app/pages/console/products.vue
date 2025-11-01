<script setup lang="ts">
import { AddProductSchema, UpdateProductSchema, UploadFileRequestSchema } from '#shared/schemas/product'
import type { TableColumn, TableRow } from '@nuxt/ui';
import type z from 'zod';
import { file } from 'zod';

type Product = ProductItemResponse | Partial<ProductItemResponse>
type FileUpload = {
  file: File
  percent: number
  status: 'pending' | 'progress' | 'success' | 'error'
}
type UploadState = {
  images: FileUpload[]
  designFile: FileUpload | null
}
type ProductCurrent = {
  isProcessing: boolean
  data: Product,
  attachments: {
    imageLinks: string[]
    designLinks: string[]
  },
  upload?: UploadState
}
type ProductState = {
  data: Product[],
  current?: ProductCurrent
}

const UButton = resolveComponent('UButton')
const uploadImagesUI = {
  file: 'max-h-20'
}

const initProductCurrent = (product: Product): ProductCurrent => {
  return {
    isProcessing: false,
    data: product,
    attachments: {
      imageLinks: [],
      designLinks: []
    }
  }
}
const removeProductCurrent = () => productState.current = undefined
const initUploadState: UploadState = {
  images: [],
  designFile: null
}

const { createPresignedUploadTask } = useFile()
const currency = ref('USD')
const { $userApi } = useNuxtApp()
const toast = useToast()

const productState = reactive<ProductState>({
  data: [],
  current: undefined
})

const { pending, refresh } = useAsyncData(async () => await $userApi('/api/product/list', {
  onResponse({ response }) {
    if (response.ok) {
      const data = response._data as ProductItemResponse[]
      productState.data = [{}, ...data]
    }
  }
}))

const columns: TableColumn<Product>[] = [
  {
    accessorKey: 'createdAt',
    header: "Created At"
  },
  {
    id: 'images',
    header: 'Images'
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
    id: 'file',
    header: "File"
  },
  {
    accessorKey: 'status',
    header: "Status"
  },
  {
    id: 'action'
  }
]

function watchActiveRowInput(row?: TableRow<Product>) {
  return computed(() => row?.original?.publicId === productState.current?.data.publicId)
}

function rowImageLinks(row: TableRow<Product>) {
  if (!row.original) {
    return
  }

  return row.original.files?.filter(file => file.type === 'IMAGE')
    .map(file => {
      const params = new URLSearchParams({
        publicId: file.publicId
      })
      return `/storage/image?${params.toString()}`
    })
}

function changeSelectImages(files: File[] | null | undefined) {
  if (!productState.current) {
    return
  }

  if (files) {
    const uploadState = toRef(productState.current, 'upload')
    if (!uploadState.value) {
      uploadState.value = initUploadState
    }

    uploadState.value.images = files.map(file => {
      return {
        file: file,
        percent: 0,
        status: 'pending'
      }
    })
  }
}

function changeSelectDesignFile(file: File | null | undefined, product: Product) {
  productState.current = initProductCurrent(product)

  if (file) {
    const uploadState = toRef(productState.current, 'upload')
    if (!uploadState.value) {
      uploadState.value = initUploadState
    }

    uploadState.value.designFile = {
      file: file,
      percent: 0,
      status: 'pending'
    }

    uploadFiles('DESIGN')
  }
}

function addProduct() {
  if (productState.data[1] && !productState.data[1]?.publicId) {
    return
  }
  productState.data.splice(1, 0, {})
  const current = toRef(productState.data, 1)
  if (current.value) {
    productState.current = initProductCurrent(current.value)
  }
}

function saveProduct() {
  function successCallback() {
    removeProductCurrent()
    refresh()
    toast.add({
      title: "Success"
    })
  }

  const productCurrent = toRef(productState, 'current')
  if (!productCurrent.value) return

  const data = productCurrent.value.data
  if (!data.publicId) {
    $userApi('/api/product/add', {
      method: 'POST',
      body: <z.infer<typeof AddProductSchema>>{
        name: data.name,
        price: data.price
      },
      onResponse({ response }) {
        response.ok && successCallback()
      }
    }).finally(() => {

    })
  } else {
    $userApi('/api/product/update', {
      method: 'PUT',
      body: <z.infer<typeof UpdateProductSchema>>{
        publicId: data.publicId,
        name: data.name,
        price: data.price,
        status: data.status
      },
      onResponse({ response }) {
        response.ok && successCallback()
      }
    })
  }
}

async function uploadFiles(type: 'IMAGE' | 'DESIGN') {
  if (productState.current?.upload) {
    let fileUploads: FileUpload[] = []
    if (type === 'IMAGE') {
      fileUploads = [...toRef(productState.current.upload, 'images').value]
    } else {
      const file = toRef(productState.current.upload, 'designFile')
      if (file.value) {
        fileUploads = [file.value]
      }
    }

    if (fileUploads.length) {
      fileUploads.forEach(file => {
        file.status = 'progress'
      })

      await Promise.all(fileUploads.map(fileUpload => {
        return $userApi('/api/product/file/upload', {
          method: "POST",
          body: <z.infer<typeof UploadFileRequestSchema>>{
            publicId: productState.current!.data.publicId,
            file: {
              filename: fileUpload.file.name,
              size: fileUpload.file.size,
              type: type
            }
          },
          onResponse({ response }) {
            if (response.ok) {
              const data = response._data
              createPresignedUploadTask(fileUpload.file, data.uploadLink, (percent) => {
                fileUpload.percent = percent
                if (percent === 100) {
                  fileUpload.status = 'success'
                }
              })
                .catch(() => {
                  fileUpload.status = 'error'
                })
            }
          }
        }).catch(() => {
          fileUpload.status = 'error'
        })
      }))

      toast.add({
        title: "Success"
      })
    }
  }
}

function clickById(id: string) {
  document.getElementById(id)?.click()
}
</script>

<template>
  <div class="space-y-3">
    <UTable :loading="pending" :data="productState.data" :columns="columns"
      :ui="{ tr: 'data-[expanded=true]:bg-elevated/50' }">
      <template #createdAt-cell="{ row }">
        <NuxtTime v-if="row.original.publicId" :datetime="row.original.createdAt!" />
      </template>
      <template #action-cell="{ row }">
        <div v-if="row.index" class="space-x-3">
          <UButton icon="ic:outline-edit"
            @click="!productState.current ? productState.current = initProductCurrent(row.original) : removeProductCurrent()"
            color="neutral" />
          <UButton v-if="watchActiveRowInput(row).value" :loading="productState.current?.isProcessing"
            icon="ic:baseline-save" @click="saveProduct()" />
        </div>
        <div v-else>
          <UButton v-if="!row.index" icon="ic:baseline-plus" color="neutral" variant="soft" @click="addProduct()" />
        </div>
      </template>
      <template #status-cell="{ row }">
        <div v-if="row.index && row.original.publicId">
          <USelect v-if="watchActiveRowInput(row).value" v-model="row.original.status"
            :items="['ACTIVE', 'INACTIVE']" />
          <UBadge v-else :label="row.original.status"
            :color="row.original.status === 'INACTIVE' ? 'neutral' : undefined" />
        </div>
      </template>
      <template #name-cell="{ row }">
        <div v-if="row.index">
          <UInput v-if="watchActiveRowInput(row).value" v-model="row.original.name" class="w-72" />
          <p v-else>{{ row.original.name }}</p>
        </div>
      </template>
      <template #images-cell="{ row }">
        <UPopover v-if="row.index && row.original.publicId">
          <div class="flex gap-2 items-center">
            <UButton icon="ic:baseline-add-photo-alternate" color="neutral" variant="subtle"
            @click="productState.current = initProductCurrent(row.original)" />
            <p v-if="!row.original.files?.some(file => file.type === 'IMAGE')" class="text-[0.7rem] text-gray-500">No images available</p>
          </div>
          <template #content>
            <div class="p-4 space-y-4">
              <UCarousel v-slot="{ item }" loop wheel-gestures :items="rowImageLinks(row)" :ui="{ item: 'basis-1/3' }">
                <div class="relative group inline-block">
                  <img :src="item" class="rounded-lg h-28 object-cover mb-8" />

                  <UButton label="Remove" icon="ic:baseline-delete-sweep" block size="sm" color="neutral"
                    variant="ghost"
                    class="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </UCarousel>
              <div class="space-y-4">
                <UFileUpload :id="useId()" variant="button" multiple @update:model-value="changeSelectImages"
                  :ui="uploadImagesUI" />
                <UButton icon="ic:outline-file-upload" label="Upload" block @click="uploadFiles('IMAGE')" />
              </div>
            </div>
          </template>
        </UPopover>
      </template>
      <template #file-cell="{ row }">
        <div class="flex items-center">
          <UButton v-if="row.index && row.original.publicId" icon="ic:outline-upload-file" color="neutral" variant="ghost" @click="clickById(`btnUDF${row.original.publicId}`)"/>
          <UButton v-if="row.original.files?.find(file => file.type === 'DESIGN')"
            icon="ic:baseline-download-for-offline" color="info" variant="ghost" />
          <UButton v-if="row.original.files?.find(file => file.type === 'DESIGN')" icon="ic:baseline-delete-forever"
            color="error" variant="ghost" />
          <UFileUpload :id="`btnUDF${row.original.publicId}`" variant="button" @update:model-value="(file) => changeSelectDesignFile(file, row.original)"
            :ui="uploadImagesUI" class="hidden"/>
            <p v-if="!row.original.files?.find(file => file.type === 'DESIGN')" class="text-[0.7rem] text-gray-500">No file available</p>
        </div>
      </template>
      <template #price-cell="{ row }">
        <div v-if="row.index">
          <UInputNumber v-if="watchActiveRowInput(row).value" v-model="row.original.price" :format-options="{
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
