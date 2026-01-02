<script setup lang="ts">
import { AddProductSchema, DeleteFileRequestSchema, DeleteProductSchema, UpdateProductSchema, UploadFileRequestSchema } from '#shared/schemas/product'
import type { TableColumn, TableRow } from '@nuxt/ui';
import type z from 'zod';

type FileUpload = {
  file: File
  percent: number
  status: 'pending' | 'progress' | 'success' | 'error'
}
type UploadState = {
  images: FileUpload[]
  designFile: FileUpload | null
}

type OptionKey = 'platform' | 'render' | 'colors' | 'style' | 'materials' | 'formfactor'
type GridItemData = Partial<ProductItemResponse>

interface IGridItem {
  data: GridItemData,
  isEdit: boolean
  isProcessing: boolean,
  upload?: UploadState,
  isNewItem: boolean,
  designFile: {
    publicId: string,
    delete: () => void
  } | null
  images: {
    link: string
    filePublicId: string,
    delete: () => void
  }[] | null
  save: () => void
  delete: () => void
}

class GridItem implements IGridItem {
  id: number
  isEdit = false
  isProcessing = false
  upload?: UploadState
  private static counter = 0
  constructor(public data: GridItemData) {
    this.id = Date.now() + ++GridItem.counter
  }

  private async deleteFile(filePublicId: string) {
    await $userApi('/api/product/file/delete', {
      method: 'DELETE',
      body: <z.infer<typeof DeleteFileRequestSchema>>{
        publicId: filePublicId
      },
      onResponse({ response }) {
        if (response.ok) {
          GridItem.resetDataCurrent()
          toast.success()
        }
      }
    })
  }

  get isNewItem() {
    return !this.data?.publicId
  }

  get designFile() {
    const data = this.data.files?.find(file => file.type === 'DESIGN')
    if (data) {
      return {
        publicId: data.publicId,
        delete: () => this.deleteFile(data.publicId)
      }
    }
    return null
  }

  get images() {
    return this.data.files?.filter(file => file.type === 'IMAGE')
      .map((file, index) => {
        const params = new URLSearchParams({
          publicId: file.publicId
        })
        return {
          link: `/storage/image?${params.toString()}`,
          filePublicId: file.publicId,
          delete: () => {
            this.deleteFile(file.publicId)
          }
        }
      }) ?? null
  }

  static successCallback() {
    resetGridItemCurrent()
    refresh()
    toast.success()
  }

  static resetDataCurrent() {
    const currentId = gridState.current?.data.publicId
    refresh().then(() => {
      const newCurrent = gridState.data.find(item => item.data.publicId === currentId)
      if (newCurrent) {
        initGridItemCurrent(newCurrent)
      }
    })
  }

  save() {
    if (!this.data.publicId) {
      $userApi('/api/product/add', {
        method: 'POST',
        body: <z.infer<typeof AddProductSchema>>{
          name: this.data.name,
          price: this.data.price,
          info: this.data.info
        },
        onResponse: ({ response }) => {
          response.ok && GridItem.successCallback()
        }
      }).finally(() => {

      })
    } else {
      $userApi('/api/product/update', {
        method: 'PUT',
        body: <z.infer<typeof UpdateProductSchema>>{
          publicId: this.data.publicId,
          name: this.data.name,
          price: this.data.price,
          status: this.data.status,
          info: this.data.info
        },
        onResponse: ({ response }) => {
          response.ok && GridItem.successCallback()
        }
      })
    }
  }

  delete() {
    $userApi('/api/product/delete', {
      method: 'DELETE',
      body: <z.output<typeof DeleteProductSchema>>{
        publicId: this.data.publicId
      },
      onResponse: ({ response }) => {
        response.ok && GridItem.successCallback()
      }
    })
  }

}

type GridState = {
  data: IGridItem[],
  current?: IGridItem
}

const UButton = resolveComponent('UButton')
const uploadImagesUI = {
  file: 'max-h-20',
  files: 'max-h-72 overflow-y-auto'
}

const initUploadState: UploadState = {
  images: [],
  designFile: null
}

const { createPresignedUploadTask } = useFile()
const currency = ref('USD')
const { $userApi } = useNuxtApp()
const toast = new useAppToast()
const expanded = ref({})

const gridState = reactive<GridState>({
  data: [],
  current: undefined
})

const getOptionByKey = async (key: OptionKey): Promise<string[]> => {
  return await $fetch(`/api/option/${key}`)
}


const addOptionState = reactive<Partial<{
  key: OptionKey,
  value: string
}>>({
  key: undefined,
  value: undefined
})

const addOption = async () => {
  if (!addOptionState.key || !addOptionState.value) {
    return
  }

  await $fetch('/api/option/add', {
    method: 'POST',
    body: {
      key: addOptionState.key,
      value: addOptionState.value
    },
    onResponse({ response }) {
      if (response.ok) {
        toast.success()
      }
    }
  })
}

const options = reactive({
  platform: await getOptionByKey('platform'),
  render: await getOptionByKey('render'),
  colors: await getOptionByKey('colors'),
  style: await getOptionByKey('style'),
  materials: await getOptionByKey('materials'),
  formfactor: await getOptionByKey('formfactor'),
})

const initGridItemCurrent = (item: IGridItem) => {
  gridState.current = item
  return gridState.current
}

const resetGridItemCurrent = () => {
  gridState.current = undefined
}

const { pending, refresh } = useAsyncData(async () => await $userApi('/api/product/list', {
  onResponse({ response }) {
    if (response.ok) {
      const data = response._data as ProductItemResponse[]
      gridState.data = [
        new GridItem({
          name: "",
          price: 0
        })
        , ...data.map(item => new GridItem(item))]
      resetGridItemCurrent()
    }
  }
}))

const columns = [
  {
    id: "name",
    accessorKey: "data.name",
    header: "Name"
  },
  // {
  //   id: 'price',
  //   accessorKey: 'data.price',
  //   header: "Price"
  // },
  // {
  //   id: 'images',
  //   header: 'Images'
  // },
  // {
  //   id: 'file',
  //   header: "File"
  // },
  {
    id: 'status',
    accessorKey: 'data.status',
    header: "Status"
  },
  {
    id: 'createdAt',
    accessorKey: 'data.createdAt',
    header: "Created At"
  },
  {
    id: 'action'
  }
] satisfies TableColumn<IGridItem>[]

function watchActiveRowInput(row?: TableRow<IGridItem>) {
  return gridState.current && gridState.current.isEdit && (row?.original.data.publicId === gridState.current?.data.publicId)
}

function changeSelectImages(files: File[] | null | undefined) {
  console.log(gridState.current)
  if (!gridState.current) {
    return
  }

  if (files) {
    const uploadState = toRef(gridState.current, 'upload')
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

function changeSelectDesignFile(file: File | null | undefined, item: IGridItem) {
  initGridItemCurrent(item)

  if (file) {
    const uploadState = toRef(gridState.current!, 'upload')
    if (!uploadState.value) {
      uploadState.value = initUploadState
    }

    uploadState.value.designFile = {
      file: file,
      percent: 0,
      status: 'pending'
    }

    uploadFiles('DESIGN').then(() => GridItem.successCallback())
  }
}

async function uploadFiles(type: 'IMAGE' | 'DESIGN') {
  if (gridState.current?.upload) {
    console.log(gridState.current.upload)
    let fileUploads: FileUpload[] = []
    if (type === 'IMAGE') {
      fileUploads = [...toRef(gridState.current.upload, 'images').value]
    } else {
      const file = toRef(gridState.current.upload, 'designFile')
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
            publicId: gridState.current!.data.publicId,
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

      GridItem.resetDataCurrent()
      toast.success()
    }
  }
}

function clickById(id: string) {
  document.getElementById(id)?.click()
}

function activeEdit(item: IGridItem) {
  if (gridState.current) {
    item.isEdit = false
    gridState.current = undefined
  } else {
    initGridItemCurrent(item).isEdit = true
  }
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
  <div class="space-y-3 h-full">
    <!-- <div class="space-x-3"> -->
    <!-- <USelect v-model="addOptionState.key"
        :items="['colors', 'formfactor', 'materials', 'platform', 'render', 'style']" class="w-32" />
      <UInput v-model="addOptionState.value" placeholder="option value" />
      <UButton label="Save" @click="addOption" />
    </div> -->
    <div class="grid grid-cols-[7fr_3fr] gap-4">
      <UTable v-model:expanded="expanded" id="gridData" :loading="pending" :data="gridState.data" :columns="columns"
        :ui="{ tr: 'data-[expanded=true]:bg-elevated/50' }">
        <template #createdAt-cell="{ row }">
          <NuxtTime v-if="!row.original.isNewItem" :datetime="row.original.data.createdAt!" />
        </template>
        <template #action-cell="{ row }">
          <div class="space-x-3">
            <UButton icon="ic:outline-edit" @click="activeEdit(row.original)" color="neutral" />
            <UButton v-if="watchActiveRowInput(row)" :loading="gridState.current?.isProcessing" color="info"
              icon="ic:baseline-save" @click="row.original.save()" />
            <UButton v-if="row.original.data.publicId" :loading="gridState.current?.isProcessing" color="error"
              icon="ic:baseline-delete-forever" @click="row.original.delete()" />
          </div>
        </template>
        <template #status-cell="{ row }">
          <div v-if="!row.original.isNewItem">
            <USelect v-if="watchActiveRowInput(row) && row.original.isEdit" v-model="row.original.data.status"
              :items="['ACTIVE', 'INACTIVE']" />
            <UBadge v-else :label="row.original.data.status"
              :color="row.original.data.status === 'INACTIVE' ? 'neutral' : undefined" />
          </div>
        </template>
        <template #name-cell="{ row }">
          <UInput v-if="watchActiveRowInput(row)" v-model="row.original.data.name" class="w-72" />
          <p v-else>{{ row.original.data.name }}</p>
        </template>
        <!-- <template #images-cell="{ row }">
        <UModal v-if="row.original.data.publicId">
          <div class="flex gap-2 items-center">
            <UButton icon="ic:baseline-add-photo-alternate" color="neutral" variant="subtle"
              @click="initGridItemCurrent(row.original)" />
            <p v-if="!row.original.images?.length" class="text-[0.7rem] text-gray-500">No
              images available</p>
          </div>
          <template #content>
            <div class="p-5 space-y-4">
              <UCarousel v-slot="{ item }" loop wheel-gestures :items="gridState.current?.images ?? []"
                :ui="{ item: 'basis-1/3' }" class="w-96">
                <div class="relative group grid place-items-center">
                  <img :src="item.link" class="rounded-lg object-cover mb-8" />

                  <UButton label="Remove" icon="ic:baseline-delete-sweep" block size="sm" color="neutral"
                    variant="ghost"
                    class="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    @click="item.delete()" />
                </div>
              </UCarousel>
              <div class="space-y-4">
                <UFileUpload :id="`btnUpload${row.original.data.publicId}`" variant="button" multiple
                  @update:model-value="changeSelectImages" :ui="uploadImagesUI" />
                <UButton icon="ic:outline-file-upload" label="Upload" block @click="uploadFiles('IMAGE')" />
              </div>
            </div>
          </template>
        </UModal>
      </template> -->
        <!-- <template #file-cell="{ row }">
        <div class="flex items-center" @click="initGridItemCurrent(row.original)">
          <UButton v-if="!row.original.isNewItem && !row.original.designFile" icon="ic:outline-upload-file"
            color="neutral" variant="ghost" @click="clickById(`btnUDF${row.original.data.publicId}`)" />
          <UButton v-if="row.original.designFile" icon="ic:baseline-download-for-offline" color="info"
            variant="ghost" />
          <UButton v-if="row.original.designFile" icon="ic:baseline-delete-forever" color="error" variant="ghost"
            @click="row.original.designFile.delete()" />
          <UFileUpload :id="`btnUDF${row.original.data.publicId}`" variant="button"
            @update:model-value="(file) => changeSelectDesignFile(file, row.original)" :ui="uploadImagesUI"
            class="hidden" />
          <p v-if="!row.original.isNewItem && !row.original.designFile" class="text-[0.7rem] text-gray-500">No
            file available</p>
        </div>
      </template> -->
        <template #price-cell="{ row }">
          <UInputNumber v-if="watchActiveRowInput(row)" v-model="row.original.data.price" :format-options="{
            style: 'currency',
            currency: currency,
            currencyDisplay: 'code',
            currencySign: 'accounting'
          }" />

          <div v-else>
            <p v-if="row.original?.data.publicId">{{ row.original?.data.price }} {{ currency }}</p>
          </div>
        </template>
        <!-- <template #expanded="{ row }">
        <div class="info space-y-5">
          <div>
            <p>Platform</p>
            <USelect v-model="row.original.data.info!.platform" :items="options.platform" />
          </div>
          <div>
            <p>Render</p>
            <USelect v-model="row.original.data.info!.render" :items="options.render" />
          </div>
          <div>
            <p>Colors</p>
            <USelect v-model="row.original.data.info!.colors" :items="options.colors" />
          </div>
          <div>
            <p>Style</p>
            <USelect v-model="row.original.data.info!.style" :items="options.style" />
          </div>
          <div>
            <p>Materials</p>
            <USelect v-model="row.original.data.info!.materials" :items="options.materials" />
          </div>
          <div>
            <p>Formfactor</p>
            <USelect v-model="row.original.data.info!.formfactor" :items="options.formfactor" />
          </div>
          <div>
            <p>Size</p>
            <UInput />
          </div>
          <div>
            <p>description</p>
            <UTextarea />
          </div>
        </div>
      </template> -->
      </UTable>
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
  width: 300px;
}

.info>div>div *+* {
  margin-left: 0.7rem;
}
</style>
