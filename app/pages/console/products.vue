<script setup lang="ts">
import { AddProductSchema, UpdateProductSchema, UploadFileRequestSchema } from '#shared/schemas/product'
import type { TableColumn, TableRow } from '@nuxt/ui';
import type z from 'zod';

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

const openUploadSlideover = ref(false)
const expanded = ref({})
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
    id: 'no',
    header: "No",
  },
  {
    accessorKey: 'createdAt',
    header: "Created At"
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
    id: 'expand',
    header: "Images",
    cell: ({ row }) => {
      if (row.index) {
        return h(UButton, {
          color: 'neutral',
          variant: 'ghost',
          icon: 'i-lucide-chevron-down',
          square: true,
          'aria-label': 'Expand',
          ui: {
            leadingIcon: [
              'transition-transform',
              row.getIsExpanded() ? 'duration-200 rotate-180' : ''
            ]
          },
          onClick: () => {
            productState.current = initProductCurrent(row.original)
            productState.current.attachments.imageLinks = row.original.files?.filter(file => file.type === 'IMAGE').map(fi => {
              const params = new URLSearchParams({
                publicId: fi.publicId
              })
              return `/storage/image?${params.toString()}`
            }) ?? []
            row.toggleExpanded()
          }
        })
      } else {
        return h('span')
      }
    }

  },
  {
    id: 'designFile',
    header: "Design file"
  },
  {
    id: 'action'
  }
]

function watchActiveRowInput(row?: TableRow<Product>) {
  return computed(() => row?.original?.publicId === productState.current?.data.publicId)
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

function changeSelectDesignFile(file: File | null | undefined) {
  if (!productState.current) {
    return
  }

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
</script>

<template>
  <div class="space-y-3">
    <UTable v-model:expanded="expanded" :loading="pending" :data="productState.data" :columns="columns"
      :ui="{ tr: 'data-[expanded=true]:bg-elevated/50' }">
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
            @click="!productState.current ? productState.current = initProductCurrent(row.original) : removeProductCurrent()"
            color="neutral" />
          <UButton v-if="watchActiveRowInput(row).value" :loading="productState.current?.isProcessing"
            icon="ic:baseline-save" @click="saveProduct()" />
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
      <template #designFile-cell="{ row }">
        <div v-if="row.index && row.original.publicId" class="flex items-center gap-3">
          <Icon name="ic:sharp-file-present" size="33" />
          <UFileUpload v-if="productState.current" variant="button" @update:model-value="changeSelectDesignFile" />
        </div>
      </template>
      <template #expanded="{ row }">
        <div v-if="row.index" class="flex justify-center gap-4">
          <div class="w-96 space-y-4">
            <UFileUpload variant="button" multiple @update:model-value="changeSelectImages" class="h-36"/>
            <!-- <div>
              <UButton label="Upload" icon="ic:outline-file-upload" block @click="uploadFiles('IMAGE')" />
            </div> -->
          </div>
          <div v-for="imageLink in productState.current?.attachments.imageLinks ?? []">
            <img :src="imageLink" class="h-36 overflow-hidden"/>
          </div>
          <!-- <UButton icon="ic:baseline-more-horiz" color="neutral" variant="subtle"
            @click="toggleImageSlideover(row.original.publicId!)" /> -->
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