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

type GridItemData = Partial<ProductItemResponse>


class GridItem {
  isEdit = false
  isProcessing = false
  upload?: UploadState
  constructor(public data: GridItemData) { }

  private async deleteFile(filePublicId: string) {
    await $userApi('/api/product/file/delete', {
      method: 'DELETE',
      body: <z.infer<typeof DeleteFileRequestSchema>>{
        publicId: filePublicId
      },
      onResponse({ response }) {
        if (response.ok) {
          GridItem.successCallback()
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
            this.deleteFile(file.publicId).then(() => {
              this.images?.splice(index, 1)
            })
          }
        }
      }) ?? null
  }

  static successCallback() {
    resetGridItemCurrent()
    refresh()
    toast.success()
  }

  save() {
    if (!this.data.publicId) {
      $userApi('/api/product/add', {
        method: 'POST',
        body: <z.infer<typeof AddProductSchema>>{
          name: this.data.name,
          price: this.data.price
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
          status: this.data.status
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

type IGridItem = Omit<InstanceType<typeof GridItem>, never>

type GridState = {
  data: IGridItem[],
  current?: IGridItem
}

const UButton = resolveComponent('UButton')
const uploadImagesUI = {
  file: 'max-h-20'
}

const initUploadState: UploadState = {
  images: [],
  designFile: null
}

const { createPresignedUploadTask } = useFile()
const currency = ref('USD')
const { $userApi } = useNuxtApp()
const toast = new useAppToast()

const gridState = reactive<GridState>({
  data: [],
  current: undefined
})

const initGridItemCurrent = (data: GridItemData) => {
  gridState.current = new GridItem(data)
  return gridState.current
}

const resetGridItemCurrent = () => {
  initGridItemCurrent(gridState.data[0]!.data)
  gridState.data[0]!.isEdit = true
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
    id: 'createdAt',
    accessorKey: 'data.createdAt',
    header: "Created At"
  },
  {
    id: "name",
    accessorKey: "data.name",
    header: "Name"
  },
  {
    id: 'price',
    accessorKey: 'data.price',
    header: "Price"
  },
  {
    id: 'images',
    header: 'Images'
  },
  {
    id: 'file',
    header: "File"
  },
  {
    id: 'status',
    accessorKey: 'data.status',
    header: "Status"
  },
  {
    id: 'action'
  }
] satisfies TableColumn<IGridItem>[]

function watchActiveRowInput(row?: TableRow<IGridItem>) {
  return row?.original.data?.publicId === gridState.current?.data.publicId
}

function changeSelectImages(files: File[] | null | undefined) {
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

function changeSelectDesignFile(file: File | null | undefined, gridItem: GridItemData) {
  initGridItemCurrent(gridItem)

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

      GridItem.successCallback()
      gridState.current.upload = undefined
    }
  }
}

function clickById(id: string) {
  document.getElementById(id)?.click()
}

</script>

<template>
  <div class="space-y-3">
    <UTable :loading="pending" :data="gridState.data" :columns="columns"
      :ui="{ tr: 'data-[expanded=true]:bg-elevated/50' }">
      <template #createdAt-cell="{ row }">
        <NuxtTime v-if="!row.original.isNewItem" :datetime="row.original.data.createdAt!" />
      </template>
      <template #action-cell="{ row }">
        <div class="space-x-3">
          <UButton v-if="!row.original.isNewItem" icon="ic:outline-edit" gfd
            @click="() => { !gridState.current?.data.publicId ? initGridItemCurrent(row.original.data) : initGridItemCurrent(gridState.data[0]!.data); row.original.isEdit = true }"
            color="neutral" />
          <UButton v-if="watchActiveRowInput(row) && row.original.isEdit" :loading="gridState.current?.isProcessing"
            color="info" icon="ic:baseline-save" @click="row.original.save()" />
          <UButton v-if="!row.original.isNewItem && watchActiveRowInput(row) && row.original.isEdit"
            :loading="gridState.current?.isProcessing" color="error" icon="ic:baseline-delete-forever"
            @click="row.original.save()" />
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
        <UInput v-if="watchActiveRowInput(row) && row.original.isEdit" v-model="row.original.data.name" class="w-72" />
        <p v-else>{{ row.original.data.name }}</p>
      </template>
      <template #images-cell="{ row }">
        <UPopover v-if="row.index && row.original.data?.publicId">
          <div class="flex gap-2 items-center">
            <UButton icon="ic:baseline-add-photo-alternate" color="neutral" variant="subtle"
              @click="initGridItemCurrent(row.original.data)" />
            <p v-if="!row.original.images?.length" class="text-[0.7rem] text-gray-500">No
              images available</p>
          </div>
          <template #content>
            <div class="p-2 space-y-4">
              <UCarousel v-slot="{ item }" loop wheel-gestures :items="row.original.images ?? []"
                :ui="{ item: 'basis-1/3' }" class="w-96">
                <div class="relative group  grid place-items-center">
                  <img :src="item.link" class="rounded-lg h-28 object-cover mb-8" />

                  <UButton label="Remove" icon="ic:baseline-delete-sweep" block size="sm" color="neutral"
                    variant="ghost"
                    class="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    @click="item.delete()" />
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
        <div class="flex items-center" @click="initGridItemCurrent(row.original.data)">
          <UButton v-if="!row.original.isNewItem && !row.original.designFile" icon="ic:outline-upload-file"
            color="neutral" variant="ghost" @click="clickById(`btnUDF${row.original.data.publicId}`)" />
          <UButton v-if="row.original.designFile" icon="ic:baseline-download-for-offline" color="info"
            variant="ghost" />
          <UButton v-if="row.original.designFile" icon="ic:baseline-delete-forever" color="error" variant="ghost"
            @click="row.original.designFile.delete()" />
          <UFileUpload :id="`btnUDF${row.original.data.publicId}`" variant="button"
            @update:model-value="(file) => changeSelectDesignFile(file, row.original.data)" :ui="uploadImagesUI"
            class="hidden" />
          <p v-if="!row.original.isNewItem && !row.original.designFile" class="text-[0.7rem] text-gray-500">No
            file available</p>
        </div>
      </template>
      <template #price-cell="{ row }">
        <UInputNumber v-if="watchActiveRowInput(row) && row.original.isEdit" v-model="row.original.data.price"
          :format-options="{
            style: 'currency',
            currency: currency,
            currencyDisplay: 'code',
            currencySign: 'accounting'
          }" />

        <p v-else>{{ row.original?.data.price }} {{ currency }}</p>
      </template>
    </UTable>

  </div>
</template>

<style scoped></style>
