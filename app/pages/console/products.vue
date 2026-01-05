<script setup lang="ts">
import { AddProductSchema, DeleteFileRequestSchema, DeleteProductSchema, UpdateProductSchema, UploadFileRequestSchema } from '#shared/schemas/product'
import type { TableColumn, TableRow } from '@nuxt/ui';
import type z from 'zod';

type TechnicalOptions = {
  platform: string[]
  render: string[]
  colors: string[]
  style: string[]
  materials: string[]
  formfactor: string[]
}

type ProductInfo = {
  platform: string
  render: string
  size: string
  colors: string
  style: string
  materials: string
  formfactor: string
  description: string
}

type Product = {
  publicId: string | undefined
  name: string,
  price: number
  status: string
  createdAt: Date | undefined,
  updatedAt: Date | undefined,
  info: ProductInfo,
  resources: {
    thumbnails: {
      publicId: string
      link: string
    }[],
    productFile: {
      publicId: string
    } | null
  }
}

type FileUpload = {
  file: File
  percent: number
  status: 'pending' | 'progress' | 'success' | 'error'
}

type UploadResource = {
  thumbnails: FileUpload[],
  productFile: FileUpload | undefined
}

interface State {
  metadata: {
    currency: string
    technicalOptions: TechnicalOptions
  },
  products: Product[]
  productCurrent: Product
  uploadResource: UploadResource
}

const uploadResourceDefault: UploadResource = {
  thumbnails: [],
  productFile: undefined
}

const technicalOptionsDefault: TechnicalOptions = {
  platform: [],
  render: [],
  colors: [],
  style: [],
  materials: [],
  formfactor: [],
}

const productCurrentDefault: Product = {
  publicId: undefined,
  name: '',
  price: 0,
  status: '',
  createdAt: undefined,
  updatedAt: undefined,
  info: {
    platform: '',
    render: '',
    size: '',
    colors: '',
    style: '',
    materials: '',
    formfactor: '',
    description: ''
  },
  resources: {
    thumbnails: [],
    productFile: null
  }
}

const layout = {
  info: {
    ui: {
      body: 'h-full space-y-5'
    }
  },
  uploadImages: {
    ui: {
      file: 'max-h-20',
      files: 'max-h-72 overflow-y-auto'
    }
  }
}

const columns = [
  {
    id: "name",
    accessorKey: "name",
    header: "Name"
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: "Status"
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: "Created At"
  },
] satisfies TableColumn<ProductItemResponse>[]

const productResponseToProduct = (input: ProductItemResponse): Product => {
  const designFile = input.files.find(file => file.type === 'DESIGN')
  return {
    publicId: input.publicId,
    name: input.name,
    price: input.price,
    status: input.status,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
    info: input.info,
    resources: {
      thumbnails: input.files.filter(file => file.type === 'IMAGE')
        .map(file => {
          const link = () => {
            // if (!file.publicId) {
            //   return undefined
            // }
            const params = new URLSearchParams({
              publicId: file.publicId
            })
            return `/storage/image?${params.toString()}`
          }

          return {
            publicId: file.publicId,
            link: link()
          }
        }),
      productFile: designFile ? {
        publicId: designFile.publicId
      } : null
    }
  }
}

const UButton = resolveComponent('UButton')
const { createPresignedUploadTask } = useFile()
const { $userApi } = useNuxtApp()
const toast = new useAppToast()
const state = reactive<State>({
  metadata: {
    currency: 'USD',
    technicalOptions: structuredClone(technicalOptionsDefault)
  },
  products: [],
  productCurrent: structuredClone(productCurrentDefault),
  uploadResource: structuredClone(uploadResourceDefault)
})

const globalFilter = ref()
const uploadProductThumbnailsSelected = ref<File[]>()
const currency = toRef(state.metadata, 'currency')
const technicalOptions = toRef(state.metadata, 'technicalOptions')
const productCurrent = computed({
  get: () => state.productCurrent,
  set: (v) => {
    state.productCurrent = v
  }
})
const productInfoCurrent = computed({
  get: () => productCurrent.value.info,
  set: (v) => {
    productCurrent.value.info = v
  }
})
const productFileCurrent = computed({
  get: () => productCurrent.value.resources.productFile,
  set: (v) => {
    productCurrent.value.resources.productFile = v
  }
})
const productThumbnailsCurrent = computed({
  get: () => productCurrent.value.resources.thumbnails,
  set: (v) => {
    productCurrent.value.resources.thumbnails = v
  }
})
const uploadProductFile = toRef(state.uploadResource, 'productFile')
const uploadProductThumbnails = toRef(state.uploadResource, 'thumbnails')

await useAsyncData(
  () => $userApi('/api/option/all', {
    onResponse({ response }) {
      if (response.ok) {
        state.metadata.technicalOptions = response._data as unknown as TechnicalOptions
      }
    }
  })
)

const { refresh: refreshProducts, pending } = await useAsyncData(() => $userApi('/api/product/list', {
  onResponse({ response }) {
    if (response.ok) {
      state.products = (response._data as unknown as ProductItemResponse[])
        .map(product => {
          return productResponseToProduct(product)
        })
    }
  }
}))

function resetProductCurrent(publicId: string) {
  refreshProducts()
    .then(() => {
      const product = state.products.find(prd => prd.publicId === publicId)
      if (product) {
        state.productCurrent = product
      }
    })
}

function actionOnProductPublicIdOrReturn() {
  if (!state.productCurrent.publicId) {
    return
  }
}

function onSelect(row: TableRow<Product>, e?: Event) {
  state.productCurrent = row.original
}

function changeSelectImages(files: File[] | null | undefined) {
  actionOnProductPublicIdOrReturn()
  if (files) {
    uploadProductThumbnails.value = files.map(file => {
      return {
        file: file,
        percent: 0,
        status: 'pending'
      }
    })
  }
}

function changeSelectDesignFile(file: File | null | undefined) {
  if (file) {
    uploadProductFile.value = {
      file: file,
      percent: 0,
      status: 'pending'
    }

    fileActions().uploadFiles('DESIGN')
  }
}

function fileActions() {
  async function uploadFiles(type: 'IMAGE' | 'DESIGN') {
    actionOnProductPublicIdOrReturn()

    let fileUploads: FileUpload[] = []
    if (type === 'IMAGE') {
      fileUploads = uploadProductThumbnails.value
    } else {
      if (uploadProductFile.value) {
        fileUploads = [uploadProductFile.value]
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
            publicId: productCurrent.value.publicId,
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
        .then(() => {
          uploadProductFile.value = undefined
          uploadProductThumbnails.value = []
          uploadProductThumbnailsSelected.value = undefined

          refreshProducts()
            .then(() => {
              resetProductCurrent(productCurrent.value.publicId!)
              toast.toast.add({
                title: "Uploaded"
              })
            })
        })


    }
  }

  async function deleteFile(filePublicId: string) {
    actionOnProductPublicIdOrReturn()
    await $userApi('/api/product/file/delete', {
      method: 'DELETE',
      body: <z.infer<typeof DeleteFileRequestSchema>>{
        publicId: filePublicId
      },
      onResponse({ response }) {
        if (response.ok) {
          refreshProducts()
            .finally(() => {
              resetProductCurrent(productCurrent.value.publicId!)
              toast.toast.add({
                title: "Deleted"
              })
            })
        }
      }
    })
  }

  return {
    uploadFiles,
    deleteFile
  }
}

function productActions() {
  function add() {
    state.productCurrent = structuredClone(productCurrentDefault)
  }
  async function save() {
    actionOnProductPublicIdOrReturn()
    const data = state.productCurrent
    if (!data.publicId) {
      await $userApi('/api/product/add', {
        method: 'POST',
        body: <z.input<typeof AddProductSchema>>{
          name: data.name,
          price: data.price,
          info: data.info
        },
        onResponse: ({ response }) => {
          if (response.ok) {
            resetProductCurrent(response._data.publicId)
            toast.toast.add({
              title: "Created"
            })
          }
        }
      })
    } else {
      await $userApi('/api/product/update', {
        method: 'PUT',
        body: <z.input<typeof UpdateProductSchema>>{
          publicId: data.publicId,
          name: data.name,
          price: data.price,
          status: data.status,
          info: data.info
        },
        onResponse: ({ response }) => {
          if (response.ok) {
            refreshProducts()
              .then(() => {
                resetProductCurrent(response._data.publicId)
                toast.toast.add({
                  title: "Updated"
                })
              })
          }
        }
      })
    }
  }
  async function del() {
    actionOnProductPublicIdOrReturn()
    await $userApi('/api/product/delete', {
      method: 'DELETE',
      body: <z.output<typeof DeleteProductSchema>>{
        publicId: state.productCurrent.publicId
      },
      onResponse: ({ response }) => {
        if (response.ok) {
          refreshProducts()
          toast.toast.add({
            title: "Deleted"
          })
        }
      }
    })
  }
  return {
    add,
    save,
    del
  }
}

function clickById(id: string) {
  document.getElementById(id)?.click()
}

// function handleClickOutside(id: string, callback: () => void) {
//   function listener(e: MouseEvent) {
//     const el = document.getElementById(id)
//     if (!el) return
//     if (!el.contains(e.target as Node)) {
//       callback()
//     }
//   }
//   document.addEventListener('click', listener)

//   return () => document.removeEventListener('click', listener)
// }

// onMounted(() => {
//   const stop = handleClickOutside('gridData', () => {
//     if (gridState.current) {
//       gridState.current.isEdit = false
//       gridState.current = undefined
//     }
//   })
// onUnmounted(stop)
// })

</script>

<template>
  <div class="grid grid-cols-[6fr_4fr] gap-4">
    <div>
      <div class="flex px-4 py-3.5 border-b border-accented">
        <UInput v-model="globalFilter" class="max-w-sm" placeholder="Filter..." />
      </div>
      <UTable id="gridData" :loading="pending" :data="state.products" :columns="columns"
        v-model:global-filter="globalFilter" @select="(row, e) => onSelect(row, e)">
        <template #createdAt-cell="{ row }">
          <NuxtTime v-if="!row.original.createdAt" :datetime="row.original.createdAt!" />
        </template>
        <template #status-cell="{ row }">
          <UBadge :label="row.original.status" :color="row.original.status === 'INACTIVE' ? 'neutral' : undefined" />
        </template>
      </UTable>
    </div>
    <div class="space-y-5 overflow-y-auto p-3">
      <UButton icon="ic:outline-plus" label="Add Product" block @click="productActions().add()" />
      <UCard :ui="layout.info.ui">
        <UFormField label="ID">
          <UInput disabled :model-value="productCurrent.publicId" class="w-full" />
        </UFormField>
        <UFormField label="Name">
          <UInput v-model="productCurrent.name" class="w-full" />
        </UFormField>
        <UFormField label="Price">
          <div class="flex gap-2">
            <UInputNumber v-model="productCurrent.price" :format-options="{
              style: 'currency',
              currency: currency,
              currencyDisplay: 'code',
              currencySign: 'accounting'
            }" class="w-full" />
            <UInput disabled :model-value="currency" />
          </div>
        </UFormField>
        <UFormField v-if="productCurrent.publicId" label="Status">
          <USelect v-model="productCurrent.status" :items="['ACTIVE', 'INACTIVE']" class="w-full" />
        </UFormField>
        <div v-if="productCurrent.publicId">
          <USeparator label="Resources" />
          <div class="space-y-5">
            <UFormField label="Product file">
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <UButton v-if="!productFileCurrent" icon="ic:outline-upload-file" color="neutral" variant="ghost"
                    @click="clickById(`btnUDF${productCurrent.publicId}`)" />
                  <UButton v-if="productFileCurrent" icon="ic:baseline-download-for-offline" color="info"
                    variant="ghost" />
                  <UButton v-if="productFileCurrent" icon="ic:baseline-delete-forever" color="error" variant="ghost"
                    @click="fileActions().deleteFile(productFileCurrent.publicId)" />
                  <UFileUpload :id="`btnUDF${productCurrent.publicId}`" variant="button"
                    @update:model-value="(file) => changeSelectDesignFile(file)" :ui="layout.uploadImages.ui"
                    class="hidden" />
                  <p v-if="!productFileCurrent" class="text-[0.7rem] text-gray-500">
                    No design file available</p>
                </div>
              </div>
            </UFormField>
            <UFormField label="Product thumbnails">
              <div class="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                <div v-for="img in productThumbnailsCurrent" class="relative group">
                  <img :key="img.publicId" :src="img.link" class="mb-4 w-full rounded-lg" />
                  <UButton v-if="img.publicId" label="Remove" icon="ic:baseline-delete-sweep" block size="sm"
                    color="error" variant="link"
                    class="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    @click="fileActions().deleteFile(img.publicId)" />
                </div>
              </div>
              <div class="space-y-4 mt-3">
                <UFileUpload v-model="uploadProductThumbnailsSelected" variant="button" multiple
                  @update:model-value="changeSelectImages" :ui="layout.uploadImages.ui">
                </UFileUpload>
                <UButton icon="ic:outline-file-upload" label="Upload" block
                  @click="fileActions().uploadFiles('IMAGE')" />
              </div>
            </UFormField>
          </div>
        </div>
        <USeparator label="Technical information" />
        <div class="info space-y-5">
          <div class="">
            <p>Platform</p>
            <div class="flex gap-2">
              <UInput v-model="productInfoCurrent.platform" class="w-full" />
              <USelect v-model="productInfoCurrent.platform" :items="technicalOptions.platform" class="w-full" />
            </div>
          </div>
          <div>
            <p>Render</p>
            <div class="flex gap-2">
              <UInput v-model="productInfoCurrent.render" class="w-full" />
              <USelect v-model="productInfoCurrent.render" :items="technicalOptions.render" class="w-full" />
            </div>
          </div>
          <div>
            <p>Colors</p>
            <div class="flex gap-2">
              <UInput v-model="productInfoCurrent.colors" class="w-full" />
              <USelect v-model="productInfoCurrent.colors" :items="technicalOptions.colors" class="w-full" />
            </div>
          </div>
          <div>
            <p>Style</p>
            <div class="flex gap-2">
              <UInput v-model="productInfoCurrent.style" class="w-full" />
              <USelect v-model="productInfoCurrent.style" :items="technicalOptions.style" class="w-full" />
            </div>
          </div>
          <div>
            <p>Materials</p>
            <div class="flex gap-2">
              <UInput v-model="productInfoCurrent.materials" class="w-full" />
              <USelect v-model="productInfoCurrent.materials" :items="technicalOptions.materials" class="w-full" />
            </div>
          </div>
          <div>
            <p>Formfactor</p>
            <div class="flex gap-2">
              <UInput v-model="productInfoCurrent.formfactor" class="w-full" />
              <USelect v-model="productInfoCurrent.formfactor" :items="technicalOptions.formfactor" class="w-full" />
            </div>
          </div>
          <div>
            <p>Size</p>
            <UInput />
          </div>
          <div>
            <p>Description</p>
            <UTextarea />
          </div>
        </div>
      </UCard>
      <div class="flex justify-end gap-3">
        <UButton icon="ic:sharp-delete-forever" label="Delete" color="error" @click="productActions().del()" />
        <UButton icon="ic:baseline-save" label="Save" color="info" block @click="productActions().save()" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.info>div {
  display: flex;
  gap: 12px;
  align-items: center;
}

.info>div>p {
  width: 150px;
}


.info>div>*:not(p) {
  /* width: 300px; */
  width: 100%;
}

.info>div>div *+* {
  margin-left: 0.7rem;
}
</style>