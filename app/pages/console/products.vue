<script setup lang="ts">
import { AddImageSchema, AddProductSchema, GetImageSchema, UpdateProductSchema } from '#shared/schemas/product'
import type { TableColumn } from '@nuxt/ui';
import type z from 'zod';

type Product = ProductItemResponse | Partial<ProductItemResponse>

type UploadStack = {
  publicId: string
  selectedFiles: File[]
  elements: {
    file: File
    thumbnail: boolean
    percent: number
    status: 'pending' | 'progress' | 'success' | 'error'
  }[],
}

type CarouselState = {
  thumbnailLinks: string[]
  productImageLinks: string[]
}

const slideoverUI = {
  content: 'right-0 inset-y-0 w-full max-w-3xl'
}

const fileUploadUI = {
  files: 'max-h-96 overflow-y-auto'
}

const { createPresinedUploadTask } = useFile()
const currency = ref('USD')
const { $userApi } = useNuxtApp()
const toast = useToast()

const openImageSlideover = ref(false)
const selectedFiles = ref<File[]>([])
const uploadStacks = ref<UploadStack[]>([])
const uploadStackSelected = ref<UploadStack>()
const uploadStackProgress = computed<boolean>(() => uploadStackSelected.value ? uploadStackSelected.value.elements.some(el => el.status === 'progress') : false)

const products = ref<Product[]>([{}])
const productIndexSelected = ref<number>()
const productIndexProgress = ref<number>()

const carouselState = reactive<CarouselState>({
  thumbnailLinks: [],
  productImageLinks: []
})

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

function afterSlideoverLeave() {
  openImageSlideover.value = false
  carouselState.productImageLinks = []
  carouselState.thumbnailLinks = []
}

function changeSelectFiles(files: File[] | null | undefined) {
  if (files && uploadStackSelected.value) {
    uploadStackSelected.value.selectedFiles = files
    uploadStackSelected.value.elements = files.map(file => {
      return {
        file: file,
        thumbnail: false,
        percent: 0,
        status: 'pending',
      }
    })
  }
}

function toogleImageSlideover(product_publicId: string) {
  openImageSlideover.value = true
  if (openImageSlideover.value) {
    const product = products.value.find(p => p.publicId === product_publicId)
    if (!product) {
      return
    }

    const { thumbnails, productImages } = product.images!.reduce(
      (acc, el) => {
        if (el.thumbnail) acc.thumbnails.push(el.publicId)
        else acc.productImages.push(el.publicId)
        return acc
      },
      { thumbnails: [], productImages: [] } as {
        thumbnails: string[]
        productImages: string[]
      }
    )

    if (thumbnails.length > 0) {
      carouselState.thumbnailLinks = thumbnails.filter(Boolean).map(publicId => {
        const params = new URLSearchParams({
          publicId: publicId
        });
        return `/storage/thumbnail?${params.toString()}`
      })
    }

    if (productImages.length > 0) {
      carouselState.productImageLinks = productImages.filter(Boolean).map(publicId => {
        const params = new URLSearchParams({
          publicId: publicId
        });
        return `/api/product/get-image?${params.toString()}`
      })
    }

    const existUploadStack = uploadStacks.value.find(e => e.publicId === product_publicId)
    if (existUploadStack) {
      uploadStackSelected.value = existUploadStack
      selectedFiles.value = uploadStackSelected.value.selectedFiles
    } else {
      const stack = reactive({
        publicId: product_publicId,
        selectedFiles: [],
        elements: []
      })
      uploadStacks.value.push(stack)
      uploadStackSelected.value = stack
      selectedFiles.value = []
    }
  }
}

function selectedThumbnailCheckbox(value: boolean | "indeterminate", elementIndex: number) {
  if (typeof value === 'boolean') {
    uploadStackSelected.value!.elements[elementIndex]!.thumbnail = value
  }
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
          productIndexProgress.value = undefined
          productIndexSelected.value = undefined
          refresh()
          toast.add({
            title: "Success"
          })
        }
      }
    }).finally(() => {

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
          productIndexProgress.value = undefined
          productIndexSelected.value = undefined
          refresh()
          toast.add({
            title: "Success"
          })
        }
      }
    })
  }
}

async function uploadImages() {
  uploadStackSelected.value?.elements.forEach(el => {
    el.status === 'progress'
    $userApi('/api/product/add-image', {
      method: "POST",
      body: <z.infer<typeof AddImageSchema>>{
        product_publicId: uploadStackSelected.value?.publicId,
        image: {
          filename: el.file.name,
          thumbnail: el.thumbnail
        }
      },
      onResponse({ response }) {
        if (response.ok) {
          const data = response._data
          createPresinedUploadTask(el.file, data.uploadLink, (percent) => {
            el.percent = percent
            if (percent === 100) {
              el.status = 'success'
            }
          })
            .catch(e => {
              el.status = 'error'
            })
        }
      }
    }).catch(() => {
      el.status = 'error'
    })
  })
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
          <UButton icon="ic:baseline-more-horiz" color="neutral" variant="subtle"
            @click="toogleImageSlideover(row.original.publicId!)" />
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
    <USlideover v-model:open="openImageSlideover" :overlay="false" :ui="slideoverUI" @after:leave="afterSlideoverLeave">
      <template #content>
        <div class="p-4 flex flex-col gap-4 overflow-y-auto">
          <div class="space-y-6">
            <div>
              <UFileUpload v-model="selectedFiles" icon="i-lucide-image" label="Drop your images here" layout="list"
                accept="image/*" multiple :interactive="false" class="w-full" :ui="fileUploadUI"
                @update:model-value="(files) => changeSelectFiles(files)">
                <template #actions="{ open }">
                  <UButton label="Select images" icon="i-lucide-upload" color="neutral" variant="outline"
                    @click="open()" />
                </template>

                <template #files="{ files }">
                  <div v-for="({ file, status }, index) in uploadStackSelected?.elements"
                    class="flex justify-between gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div class="p-2 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Icon name="heroicons:document" />
                    </div>
                    <div class="w-full text-[0.7rem] flex flex-col gap-1">
                      <div class="flex justify-between gap-2">
                        <span>{{ file.name }}</span>
                        <Icon name="material-symbols:cancel-outline" size="15" class="hover:cursor-pointer" @click="
                          () => {
                            uploadStackSelected?.elements.splice(index, 1);
                            files?.splice(index, 1);
                          }
                        " />
                      </div>
                      <UProgress v-if="status === 'progress'"
                        :model-value="uploadStackSelected?.elements[index]?.percent" />
                      <UProgress v-else-if="status === 'error'" :model-value="100" color="error" />
                      <UProgress v-else-if="status === 'success'" :model-value="100" />
                      <UCheckbox label="Thumbnail"
                        @update:model-value="(value) => selectedThumbnailCheckbox(value, index)" />
                      <!-- <span v-else-if="status === 'pending'">{{ size }}</span> -->
                    </div>
                  </div>
                </template>
                <template #files-bottom="{ removeFile, files }">
                  <div class="flex w-full gap-3">
                    <UButton v-if="files?.length" label="Remove all files" color="neutral" @click="removeFile()" />
                    <UButton :loading="uploadStackProgress" icon="ic:sharp-cloud-upload" label="Upload" block
                      @click="uploadImages()" />
                  </div>
                </template>
              </UFileUpload>
            </div>
          </div>
          <div>
            <div class="flex justify-between items-center">
              <span class="font-medium">Thumbnails</span>
            </div>
            <USeparator />
            <UCarousel v-slot="{ item }" :items="carouselState.thumbnailLinks" :ui="{ item: 'basis-1/4' }" class="mt-5">
              <div class="h-28 flex items-center justify-center overflow-hidden">
                <img :src="item" class="w-full shadow" />
              </div>
            </UCarousel>
          </div>
          <div>
            <div class="flex justify-between items-center">
              <span class="font-medium">Images</span>
            </div>
            <USeparator />
            <div class="columns-3 space-y-4 mt-5">
              <div v-for="src in carouselState.productImageLinks"
                class="flex items-center rounded-lg overflow-hidden p-3">
                <img :src="src" class="rounded-lg hover:scale-105 shadow" />
              </div>
            </div>
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>

<style scoped></style>