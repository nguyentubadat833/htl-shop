<script setup lang="ts">
import { AddProductSchema, DeleteFileRequestSchema, DeleteProductSchema, UpdateProductSchema, UploadFileRequestSchema } from '#shared/schemas/product'
import type { TableColumn, TableRow } from '@nuxt/ui';
import type z from 'zod';

const UButton = resolveComponent('UButton')
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

type GridItemData = ProductItemResponse
type TechnicalOptionsQuery = {
  platform: string[]
  render: string[]
  colors: string[]
  style: string[]
  materials: string[]
  formfactor: string[]
}
type FileUpload = {
  file: File
  percent: number
  status: 'pending' | 'progress' | 'success' | 'error'
}
type UploadResourcesState = {
  images: FileUpload[]
  designFile: FileUpload | null
}

const gridItemCurrentDefaultState: GridItemData = {
  publicId: '',
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
  files: []
}

const uploadResourceDefaultState: UploadResourcesState = {
  images: [],
  designFile: null
}

const emptyOptions: TechnicalOptionsQuery = {
  platform: [],
  render: [],
  colors: [],
  style: [],
  materials: [],
  formfactor: [],
}

const { createPresignedUploadTask } = useFile()
const { $userApi } = useNuxtApp()
const toast = new useAppToast()
const currency = ref('USD')
const gridItemCurrent = ref<GridItemData>(gridItemCurrentDefaultState)
const gridItemResourcesCurrent = computed(() => {
  return {
    productImages: gridItemCurrent.value.files
      .filter(file => file.type === 'IMAGE')
      .map(file => {
        const link = () => {
          if (!file.publicId) {
            return undefined
          }
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
    designFile: gridItemCurrent.value.files.find(file => file.type === 'DESIGN'),
  }
})
const uploadResourcesState = reactive<UploadResourcesState>(uploadResourceDefaultState)

const { data: technicalOptions } = useLazyAsyncData(
  'technical-options',
  () => $userApi('/api/option/all'),
  {
    default: () => emptyOptions,
  }
)
const { pending, refresh: refreshProducts, data } = await useAsyncData(() => $userApi('/api/product/list'), {
  transform: (value) => {
    if (value && Array.isArray(value)) {
      return value as unknown as ProductItemResponse[]
    } else {
      return []
    }
  }
})

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

function onSelect(row: TableRow<GridItemData>, e?: Event) {
  gridItemCurrent.value = {
    ...row.original,
    status: row.original.status.toString()
  }
}

function changeSelectImages(files: File[] | null | undefined) {
  if (files) {
    uploadResourcesState.images = files.map(file => {
      return {
        file: file,
        percent: 0,
        status: 'pending'
      }
    })
  }
}

function changeSelectDesignFile(file: File | null | undefined) {
  if (uploadResourcesState.designFile) {
    return
  }
  if (file) {
    // const uploadState = toRef(gridState.current!, 'upload')
    uploadResourcesState.designFile = {
      file: file,
      percent: 0,
      status: 'pending'
    }

    // uploadFiles('DESIGN')
    // .then(() => GridItem.successCallback())
  }
}

function fileActions() {
  async function uploadFiles(type: 'IMAGE' | 'DESIGN') {
    let fileUploads: FileUpload[] = []
    if (type === 'IMAGE') {
      fileUploads = uploadResourcesState.images
    } else {
      const designFile = uploadResourcesState.designFile
      if (designFile) {
        fileUploads = [designFile]
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
            publicId: gridItemCurrent.value.publicId,
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

      refreshProducts()
      toast.success()
    }
  }

  async function deleteFile(filePublicId: string) {
    await $userApi('/api/product/file/delete', {
      method: 'DELETE',
      body: <z.infer<typeof DeleteFileRequestSchema>>{
        publicId: filePublicId
      },
      onResponse({ response }) {
        if (response.ok) {
          toast.success()
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
  function uploadResources() {
    if (uploadResourcesState.designFile) {
      fileActions().uploadFiles('DESIGN').then(() => {
        toast.toast.add({
          title: "Successfully upload file design"
        })
      })
    }
    if (uploadResourcesState.images.length) {
      fileActions().uploadFiles('IMAGE').then(() => {
        toast.toast.add({
          title: "Successfully upload images"
        })
      })
    }
  }
  function add() {
    gridItemCurrent.value = gridItemCurrentDefaultState
    uploadResourcesState.designFile = uploadResourceDefaultState.designFile
    uploadResourceDefaultState.images = uploadResourceDefaultState.images
  }
  function save() {
    const data = gridItemCurrent.value
    if (!data.publicId) {
      $userApi('/api/product/add', {
        method: 'POST',
        body: <z.input<typeof AddProductSchema>>{
          name: data.name,
          price: data.price,
          info: data.info
        },
        onResponse: ({ response }) => {
          if (response.ok) {
            uploadResources()
            refreshProducts()
            toast.toast.add({
              title: "Created"
            })
          }
        }
      })
    } else {
      $userApi('/api/product/update', {
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
            uploadResources()
            refreshProducts()
            toast.toast.add({
              title: "Updated"
            })
          }
        }
      })
    }
  }

  function del() {
    if (!gridItemCurrent.value.publicId) {
      return
    }
    $userApi('/api/product/delete', {
      method: 'DELETE',
      body: <z.output<typeof DeleteProductSchema>>{
        publicId: gridItemCurrent.value.publicId
      },
      onResponse: ({ response }) => {
        if (response.ok) {
          refreshProducts()
          toast.success()
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

function handleClickOutside(id: string, callback: () => void) {
  function listener(e: MouseEvent) {
    const el = document.getElementById(id)
    if (!el) return
    if (!el.contains(e.target as Node)) {
      callback()
    }
  }
  document.addEventListener('click', listener)

  return () => document.removeEventListener('click', listener)
}

// onMounted(() => {
//   const stop = handleClickOutside('gridData', () => {
//     if (gridState.current) {
//       gridState.current.isEdit = false
//       gridState.current = undefined
//     }
//   })
//   onUnmounted(stop)
// })

</script>

<template>
  <div class="grid grid-cols-[6fr_4fr] gap-4">
    <UTable id="gridData" :loading="pending" :data="data" :columns="columns"
      :ui="{ tr: 'data-[expanded=true]:bg-elevated/50' }" @select="(row, e) => onSelect(row, e)">
      <template #createdAt-cell="{ row }">
        <NuxtTime v-if="!row.original.createdAt" :datetime="row.original.createdAt!" />
      </template>
      <template #status-cell="{ row }">
        <UBadge :label="row.original.status" :color="row.original.status === 'INACTIVE' ? 'neutral' : undefined" />
      </template>
    </UTable>
    <div class="space-y-5 overflow-y-auto p-3">
      <UButton icon="ic:outline-plus" label="Add Product" block @click="productActions().add()" />
      <UCard :ui="layout.info.ui">
        <UFormField label="ID">
          <UInput disabled :model-value="gridItemCurrent.publicId" class="w-full" />
        </UFormField>
        <UFormField label="Name">
          <UInput v-model="gridItemCurrent.name" class="w-full" />
        </UFormField>
        <UFormField label="Price">
          <div class="flex gap-2">
            <UInputNumber v-model="gridItemCurrent.price" :format-options="{
              style: 'currency',
              currency: currency,
              currencyDisplay: 'code',
              currencySign: 'accounting'
            }" class="w-full" />
            <UInput disabled :model-value="currency" />
          </div>
        </UFormField>
        <UFormField label="Status">
          <USelect v-model="gridItemCurrent.status" :items="['ACTIVE', 'INACTIVE']" class="w-full" />
        </UFormField>
        <USeparator label="Resources" />
        <div class="space-y-5">
          <UFormField label="Design file">
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <UButton v-if="!gridItemResourcesCurrent.designFile" icon="ic:outline-upload-file" color="neutral"
                  variant="ghost" @click="clickById(`btnUDF${gridItemCurrent.publicId}`)" />
                <UButton v-if="gridItemResourcesCurrent.designFile" icon="ic:baseline-download-for-offline" color="info"
                  variant="ghost" />
                <UButton v-if="gridItemResourcesCurrent.designFile && gridItemResourcesCurrent.designFile.publicId"
                  icon="ic:baseline-delete-forever" color="error" variant="ghost"
                  @click="fileActions().deleteFile(gridItemResourcesCurrent.designFile.publicId)" />
                <UFileUpload :id="`btnUDF${gridItemCurrent.publicId}`" variant="button"
                  @update:model-value="(file) => changeSelectDesignFile(file)" :ui="layout.uploadImages.ui"
                  class="hidden" />
                <p v-if="!gridItemResourcesCurrent.designFile" class="text-[0.7rem] text-gray-500">
                  No design file available</p>
              </div>
              <UButton v-if="uploadResourcesState.designFile" :label="uploadResourcesState.designFile?.file.name"
                color="neutral" variant="outline" block @click="() => uploadResourcesState.designFile = null" />

            </div>
          </UFormField>
          <UFormField label="Product images">
            <!-- <UCarousel v-slot="{ item }" loop wheel-gestures :items="gridItemResourcesCurrent.productImages"
              :ui="{ item: 'basis-1/3' }" class="w-96">
              <div class="relative group grid place-items-center">
                <img :src="item.link" class="rounded-lg object-cover mb-8" />

                <UButton v-if="item.publicId" label="Remove" icon="ic:baseline-delete-sweep" block size="sm"
                  color="neutral" variant="ghost"
                  class="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  @click="fileActions().deleteFile(item.publicId)" />
              </div>
            </UCarousel> -->
            <div class="space-y-4 mt-3">
              <UFileUpload variant="button" multiple @update:model-value="changeSelectImages"
                :ui="layout.uploadImages.ui" />
              <!-- <UButton icon="ic:outline-file-upload" label="Upload" block @click="uploadFiles('IMAGE')" /> -->
            </div>
          </UFormField>
        </div>
        <USeparator label="Technical information" />
        <div class="info space-y-5">
          <div class="">
            <p>Platform</p>
            <div class="flex gap-2">
              <UInput v-model="gridItemCurrent.info.platform" class="w-full" />
              <USelect v-model="gridItemCurrent.info.platform" :items="technicalOptions.platform" class="w-full" />
            </div>
          </div>
          <div>
            <p>Render</p>
            <div class="flex gap-2">
              <UInput v-model="gridItemCurrent.info.render" class="w-full" />
              <USelect v-model="gridItemCurrent.info.render" :items="technicalOptions.render" class="w-full" />
            </div>
          </div>
          <div>
            <p>Colors</p>
            <div class="flex gap-2">
              <UInput v-model="gridItemCurrent.info.colors" class="w-full" />
              <USelect v-model="gridItemCurrent.info.colors" :items="technicalOptions.colors" class="w-full" />
            </div>
          </div>
          <div>
            <p>Style</p>
            <div class="flex gap-2">
              <UInput v-model="gridItemCurrent.info.style" class="w-full" />
              <USelect v-model="gridItemCurrent.info.style" :items="technicalOptions.style" class="w-full" />
            </div>
          </div>
          <div>
            <p>Materials</p>
            <div class="flex gap-2">
              <UInput v-model="gridItemCurrent.info.materials" class="w-full" />
              <USelect v-model="gridItemCurrent.info.materials" :items="technicalOptions.materials" class="w-full" />
            </div>
          </div>
          <div>
            <p>Formfactor</p>
            <div class="flex gap-2">
              <UInput v-model="gridItemCurrent.info.formfactor" class="w-full" />
              <USelect v-model="gridItemCurrent.info.formfactor" :items="technicalOptions.formfactor" class="w-full" />
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
        <UButton icon="ic:sharp-delete-forever" label="Delete" color="error" />
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
