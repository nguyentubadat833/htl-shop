<template>
  <div class="h-full grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-5 items-start overflow-hidden">
    <!-- LEFT PANEL: Product Table -->
    <UCard :ui="{
      root: 'h-full flex flex-col border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm rounded-xl overflow-hidden',
      body: 'p-0 flex-1 flex flex-col min-h-0',
    }">
      <!-- Header / Search Toolbar -->
      <div
        class="p-4 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-900/50">
        <UModal v-model:open="filters.open" :ui="{ content: 'sm:max-w-xl min-h-[350px]', footer: 'justify-end' }"
          title="Filter by Categories">
          <UButton label="Filters" icon="ic:baseline-filter-alt-off" color="neutral" variant="ghost"
            class="justify-between" />

          <!-- Content bên trong Modal -->
          <template #body>
            <UCommandPalette v-model="filters.categories" multiple selected-icon="i-lucide-check"
              :groups="categorySearchGroup" placeholder="Search and select categories..." class="w-full border-none">
              <template #item-trailing="{ item }">
                {{ item.totalProducts }} items
              </template>
            </UCommandPalette>
          </template>
          <template #footer>
            <UButton label="Clear" icon="ic:baseline-filter-alt-off" variant="outline" color="neutral"
              @click="clearFilterCategories" />
            <UButton label="Accept filters" icon="ic:outline-filter-alt" @click="acceptFilterCategories" />
          </template>
        </UModal>
        <UInput v-model="globalFilter" icon="i-lucide-search" placeholder="Search products..."
          class="w-full max-w-xs" />
      </div>

      <!-- Products Data Table -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <UTable :loading="pending" :data="state.products" :columns="columns" v-model:row-selection="rowSelection"
          v-model:global-filter="globalFilter" sticky class="flex-1" @select="(row) => onSelect(row)">
          <!-- Plan Badge -->
          <template #plan-cell="{ row }">
            <UBadge :label="row.original.plan" :color="row.original.plan === 'PRO' ? 'primary' : 'neutral'"
              variant="subtle" size="sm" />
          </template>

          <!-- Status Badge -->
          <template #status-cell="{ row }">
            <UBadge :label="row.original.status" :color="row.original.status === 'ACTIVE' ? 'success' : 'neutral'"
              variant="subtle" size="sm" />
          </template>

          <!-- Price Display -->
          <template #price-cell="{ row }">
            <span class="font-medium">
              {{ row.original.plan === "FREE" ? "Free" : `$${row.original.price}` }}
            </span>
          </template>

          <!-- Created At Date -->
          <template #createdAt-cell="{ row }">
            <span v-if="row.original.createdAt" class="text-xs text-neutral-500">
              <NuxtTime :datetime="row.original.createdAt" format="PP" />
            </span>
            <span v-else class="text-xs text-neutral-400">-</span>
          </template>
        </UTable>
        <div class="px-4 py-3.5 border-t border-accented text-sm text-muted
         flex flex-wrap items-center gap-x-4 gap-y-2">
          <!-- Total -->
          <div class="flex items-center gap-1 shrink-0">
            <span class="font-bold">Total</span>
            <span>{{ state.products.length }} items</span>
          </div>

          <!-- Filters -->
          <div v-if="filters.categories.length" class="flex flex-wrap items-center gap-2 min-w-0">
            <UBadge v-for="category in filters.categories" :key="category.publicId" :label="category.name"
              color="neutral" variant="subtle" />

            <UBadge label="Clear filters" icon="ic:sharp-clear-all" color="error" variant="soft"
              class="cursor-pointer shrink-0" @click="clearFilterCategories" />
          </div>
        </div>
      </div>
    </UCard>

    <!-- RIGHT PANEL: Product Detail Form -->
    <UCard :ui="{
      root: 'h-full flex flex-col border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm rounded-xl overflow-hidden',
      header: 'p-4 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between',
      body: 'p-4 flex-1 overflow-y-auto space-y-4',
      footer: 'p-4 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-3',
    }">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon :name="productCurrent.publicId ? 'i-lucide-box' : 'i-lucide-package-plus'"
            class="size-5 text-primary-500" />
          <h3 class="font-semibold text-base">
            {{ productCurrent.publicId ? "Edit Product" : "Create Product" }}
          </h3>
        </div>
        <div class="flex gap-3 items-center">
          <ImportProducts @success="refreshProducts" />
          <UButton size="sm" icon="i-lucide-plus" label="New Product" color="primary" @click="productActions().add()" />
        </div>
        <!-- <UBadge v-if="productCurrent.publicId" :label="productCurrent.publicId" color="neutral" variant="outline"
          size="sm" /> -->
      </template>

      <!-- Form Navigation Tabs -->
      <UTabs :items="formTabs" class="w-full">
        <!-- TAB 1: General Info -->
        <template #general>
          <div class="space-y-4 pt-3">
            <UFormField v-if="productCurrent.publicId" label="ID">
              <UInput disabled v-model="productCurrent.publicId" :ui="{ trailing: 'pr-0.5' }" class="w-full">
                <template v-if="productCurrent.publicId.length" #trailing>
                  <UTooltip text="Copy to clipboard" :content="{ side: 'right' }">
                    <UButton :color="copied ? 'success' : 'neutral'" variant="link" size="sm"
                      :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'" aria-label="Copy to clipboard"
                      @click="copy(productCurrent.publicId)" />
                  </UTooltip>
                </template>
              </UInput>
            </UFormField>

            <UFormField label="Name" required>
              <UInput v-model="productCurrent.name" placeholder="e.g. Modern Villa 3D Model" class="w-full" />
            </UFormField>

            <div class="grid grid-cols-2 gap-3">
              <UFormField label="Plan">
                <USelect v-model="productCurrent.plan" :items="planOptions" class="w-full" />
              </UFormField>

              <UFormField v-if="productCurrent.publicId" label="Status">
                <USelect v-model="productCurrent.status" :items="['ACTIVE', 'INACTIVE']" class="w-full" />
              </UFormField>
            </div>

            <UFormField label="Price"
              :description="productCurrent.plan === 'FREE' ? 'Price is auto-set to 0 for Free items' : ''">
              <UInputNumber v-model="productCurrent.price" :disabled="productCurrent.plan === 'FREE'" :locale="'en-US'"
                :step="0.01" :format-options="{
                  style: 'currency',
                  currency: currency,
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }" class="w-full" />
            </UFormField>
            <UFormField label="Categories" description="Select categories and their associated tags for this product">
              <div class="space-y-3 w-full">
                <!-- Nút Trigger mở Modal -->
                <UModal :ui="{ content: 'sm:max-w-xl min-h-[350px]' }">
                  <UButton
                    :label="state.productCurrent.categories.length ? 'Manage Categories & Tags' : 'Choose Categories & Tags...'"
                    :color="state.productCurrent.categories.length ? 'neutral' : 'neutral'"
                    :variant="state.productCurrent.categories.length ? 'outline' : 'subtle'" icon="i-lucide-folder-tree"
                    trailing-icon="i-lucide-chevrons-up-down" block class="justify-between" />

                  <!-- Content bên trong Modal -->
                  <template #content>
                    <div class="p-2">
                      <UCommandPalette v-model="state.productCurrent.categories" multiple selected-icon="i-lucide-check"
                        :groups="categorySearchGroup" placeholder="Search and select categories..."
                        class="w-full border-none" />
                    </div>
                  </template>
                </UModal>

                <!-- Danh sách Categories & Tags ĐÃ CHỌN (Hiển thị bên dưới Nút trigger) -->
                <div v-if="state.productCurrent.categories.length" class="space-y-2.5">
                  <div v-for="(item, index) in state.productCurrent.categories" :key="item.publicId || index"
                    class="p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/50 space-y-2 relative group transition-all">
                    <!-- Category Header -->
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2 min-w-0">
                        <UIcon name="i-lucide-folder-open" class="size-4 text-primary-500 shrink-0"
                          :class="[{ 'bg-red-400': !item.active }]" />
                        <span class="font-medium text-xs text-neutral-800 dark:text-neutral-200 truncate">
                          {{ item.name }}
                        </span>
                        <UBadge v-if="item.type" :label="item.type" color="neutral" variant="subtle" size="xs" />
                      </div>

                      <!-- Quick Remove Category Button -->
                      <UButton icon="i-lucide-x" color="error" variant="ghost" size="xs" square
                        class="opacity-60 hover:opacity-100 transition-opacity" @click="removeCategory(index)" />
                    </div>

                    <!-- Sub-Tags list inside Category -->
                    <div v-if="existsCategoryById(item.publicId)" class="flex flex-wrap gap-1.5 pt-1">
                      <UBadge v-for="(tag, tagIdx) in getTagsFromCategoryReference(item.publicId)" :key="tagIdx"
                        :label="typeof tag === 'string' ? tag : tag.name"
                        :color="productCurrent.tagIds.includes(tag.id) ? 'primary' : 'neutral'"
                        :variant="productCurrent.tagIds.includes(tag.id) ? 'solid' : 'outline'" size="sm"
                        class="rounded-md hover:cursor-pointer" @click="toogleTag(tag.id)" />
                    </div>

                    <!-- <div v-else class="text-[11px] text-neutral-400 italic">
                                            No sub-tags attached
                                        </div> -->
                  </div>
                </div>
              </div>
            </UFormField>
          </div>
        </template>

        <!-- TAB 2: Resources & Files -->
        <template #resources>
          <UFormField v-if="productCurrent.plan === ProductPlan.FREE" label="External link"
            :required="productCurrent.plan === ProductPlan.FREE">
            <UTextarea v-model="productCurrent.externalLink" placeholder="Free plan is required" class="w-full" />
          </UFormField>
          <div v-if="productCurrent.publicId" class="space-y-5 pt-3">
            <!-- Design File Section -->
            <div v-if="productCurrent.plan === ProductPlan.PRO" class="space-y-2">
              <label
                class="text-sm font-medium text-neutral-700 dark:text-neutral-200 flex items-center justify-between">
                <span>Design File</span>
                <span v-if="productFileCurrent" class="text-xs text-primary-500 font-normal">File attached</span>
              </label>

              <div
                class="p-3 border border-neutral-200/80 dark:border-neutral-800 rounded-lg bg-neutral-50/50 dark:bg-neutral-950/50 flex items-center justify-between gap-3">
                <div class="flex items-center gap-2 truncate">
                  <UIcon name="i-lucide-file-archive" class="size-5 shrink-0 text-neutral-500" />
                  <span class="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                    {{ productFileCurrent ? "3D Model Design Asset" : "No design file uploaded" }}
                  </span>
                </div>

                <div class="flex items-center gap-1 shrink-0">
                  <UButton v-if="!productFileCurrent" :loading="isProductFileUploadProcessing" icon="i-lucide-upload"
                    label="Upload" color="neutral" variant="soft" size="xs"
                    @click="clickById(`btnUDF${productCurrent.publicId}`)" />
                  <UButton v-if="productFileCurrent" icon="i-lucide-download" color="neutral" variant="ghost" size="xs"
                    @click="fileActions().downloadFile(productFileCurrent.publicId)" />
                  <UButton v-if="productFileCurrent" icon="i-lucide-trash-2" color="error" variant="ghost" size="xs"
                    @click="fileActions().deleteFile(productFileCurrent.publicId)" />
                  <UFileUpload :id="`btnUDF${productCurrent.publicId}`" variant="button" class="hidden"
                    @update:model-value="(file) => changeSelectDesignFile(file)" />
                </div>
              </div>
            </div>

            <!-- Thumbnails Section -->
            <div class="space-y-3">
              <label class="text-sm font-medium text-neutral-700 dark:text-neutral-200"> Thumbnails & Gallery </label>

              <!-- Gallery Grid -->
              <div v-if="productThumbnailsCurrent.length" class="grid grid-cols-3 gap-2">
                <div v-for="img in productThumbnailsCurrent" :key="img.publicId"
                  class="relative group aspect-square rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800">
                  <img :src="img.link" class="size-full object-cover" />
                  <div
                    class="absolute inset-0 bg-neutral-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center">
                    <UButton icon="i-lucide-trash-2" color="error" size="xs" square
                      @click="fileActions().deleteFile(img.publicId)" />
                  </div>
                </div>
              </div>

              <!-- Upload Controller -->
              <div class="space-y-2 pt-2">
                <UFileUpload v-model="uploadProductThumbnailsSelected" variant="button" multiple class="w-full"
                  @update:model-value="changeSelectImages" />
                <UButton v-if="uploadProductThumbnails.length" :loading="isSomeThumbnailUploadProcessing"
                  icon="i-lucide-upload-cloud" label="Confirm Upload" color="primary" block size="sm"
                  @click="fileActions().uploadFiles('IMAGE')" />
              </div>
            </div>
          </div>
          <div v-else class="p-6 text-center text-xs text-neutral-400">Please create and save the product first to
            manage resources.</div>
        </template>

        <!-- TAB 3: Technical Metadata -->
        <template #technical>
          <div class="space-y-3 pt-3">
            <div v-for="field in techFields" :key="field.key" class="grid grid-cols-[110px_1fr] items-center gap-2">
              <label class="text-xs font-medium text-neutral-500 capitalize">
                {{ field.label }}
              </label>
              <div class="flex gap-1.5">
                <UInput v-model="productInfoCurrent[field.key]" placeholder="Custom value" class="flex-1" size="sm" />
                <USelect v-model="productInfoCurrent[field.key]" :items="technicalOptions[field.key] || []"
                  placeholder="Preset" class="w-32" size="sm" />
              </div>
            </div>

            <div class="grid grid-cols-[110px_1fr] items-center gap-2 pt-1">
              <label class="text-xs font-medium text-neutral-500">Size</label>
              <UInput v-model="productInfoCurrent.size" placeholder="e.g. 1500 x 2000 x 850 mm" class="w-full"
                size="sm" />
            </div>

            <div class="space-y-1.5 pt-2">
              <label class="text-xs font-medium text-neutral-500">Description</label>
              <UTextarea v-model="productInfoCurrent.description"
                placeholder="Write technical specifications or notes..." :rows="3" class="w-full" />
            </div>
          </div>
        </template>
      </UTabs>

      <!-- Footer Actions -->
      <template #footer>
        <UButton v-if="productCurrent.publicId" icon="i-lucide-trash-2" label="Delete" color="error" variant="soft"
          size="sm" @click="productActions().del()" />
        <div v-else />

        <div class="flex items-center gap-2">
          <!-- <UButton label="Reset" color="neutral" variant="ghost" @click="productActions().add()" /> -->
          <UButton :loading="state.loading" icon="i-lucide-save" label="Save Product" color="primary" size="sm"
            @click="productActions().save()" />
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { AddProductSchema, DeleteFileRequestSchema, DeleteProductSchema, UpdateProductSchema, UploadFileRequestSchema } from "#shared/schemas/product";
import { ProductPlan, type ProductStatus } from "~~/prisma/generated/browser";
import { useClipboard } from '@vueuse/core'
import type { TableColumn, TableRow } from "@nuxt/ui";
import type z from "zod";
import type { CategoryReference } from "~~/shared/types/category";
import ImportProducts from "~/components/btn/ImportProducts.vue";

type TechnicalOptions = {
  platform: string[];
  render: string[];
  colors: string[];
  style: string[];
  materials: string[];
  formfactor: string[];
};

type CategoryItemSelected = {
  label: string;
  name: string;
  publicId: string;
  type: string;
  active: boolean;
  totalProducts: number
};

type ProductInfo = {
  platform: string;
  render: string;
  size: string;
  colors: string;
  style: string;
  materials: string;
  formfactor: string;
  description: string;
};

type Product = {
  publicId: string | undefined;
  plan: ProductPlan;
  name: string;
  price: number;
  status: ProductStatus;
  createdAt: string | undefined;
  updatedAt: string | undefined;
  info: ProductInfo;
  resources: {
    thumbnails: {
      publicId: string;
      link: string;
    }[];
    productFile: {
      publicId: string;
    } | null;
  };
  categories: CategoryItemSelected[];
  tagIds: string[];
  externalLink?: string
};

type FileUpload = {
  file: File;
  percent: number;
  status: "pending" | "progress" | "success" | "error";
};

type UploadResource = {
  thumbnails: FileUpload[];
  productFile: FileUpload | undefined;
};

interface State {
  metadata: {
    currency: string;
    technicalOptions: TechnicalOptions;
  };
  products: Product[];
  productCurrent: Product;
  snapshortProductCurrent: Product;
  uploadResource: UploadResource;
  loading: boolean;
}

useSeoMeta({
  title: "Products Management",
});

const formTabs = [
  { label: "General", slot: "general", icon: "i-lucide-info" },
  { label: "Resources", slot: "resources", icon: "i-lucide-file-text" },
  { label: "Technical", slot: "technical", icon: "i-lucide-sliders" },
];

const techFields: { label: string; key: keyof Omit<ProductInfo, "size" | "description"> }[] = [
  { label: "Platform", key: "platform" },
  { label: "Render Engine", key: "render" },
  { label: "Color Palette", key: "colors" },
  { label: "Design Style", key: "style" },
  { label: "Materials", key: "materials" },
  { label: "Form Factor", key: "formfactor" },
];

const uploadResourceDefault: UploadResource = {
  thumbnails: [],
  productFile: undefined,
};

const technicalOptionsDefault: TechnicalOptions = {
  platform: [],
  render: [],
  colors: [],
  style: [],
  materials: [],
  formfactor: [],
};

const productCurrentDefault: Product = {
  publicId: undefined,
  plan: ProductPlan.PRO,
  name: "",
  price: 0,
  status: "INACTIVE",
  createdAt: undefined,
  updatedAt: undefined,
  info: {
    platform: "",
    render: "",
    size: "",
    colors: "",
    style: "",
    materials: "",
    formfactor: "",
    description: "",
  },
  resources: {
    thumbnails: [],
    productFile: null,
  },
  categories: [],
  tagIds: [],
};

const columns = [
  {
    accessorKey: "name",
    header: "Product Name",
  },
  {
    accessorKey: "plan",
    header: "Plan",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
  },
] satisfies TableColumn<ProductItemResponse>[];

const planOptions = [ProductPlan.FREE, ProductPlan.PRO];

const categorySearchListToSelected = (categoryPublicIds: string[]) => {
  if (Array.isArray(categorySearchGroup.value)) {
    const searchList = categorySearchGroup.value[0];
    if (searchList) {
      const categorySetPublicId = new Set(categoryPublicIds);
      return searchList.items?.filter((c) => categorySetPublicId.has(c.publicId)) ?? [];
    }
  }
  return [];
};

const productResponseToProduct = (input: ProductItemResponse): Product => {
  const designFile = input.files.find((file) => file.type === "DESIGN");

  return {
    publicId: input.publicId,
    plan: input.plan,
    name: input.name,
    price: input.price,
    status: input.status,
    createdAt: input.createdAt?.toString(),
    updatedAt: input.updatedAt?.toString(),
    info: input.info,
    externalLink: input.externalLink,
    resources: {
      thumbnails: input.files
        .filter((file) => file.type === "IMAGE")
        .map((file) => {
          const params = new URLSearchParams({ publicId: file.publicId });
          return {
            publicId: file.publicId,
            link: `/storage/image?${params.toString()}`,
          };
        }),
      productFile: designFile ? { publicId: designFile.publicId } : null,
    },
    categories: categorySearchListToSelected(input.categoryIds),
    tagIds: input.tagIds,
  };
};

const { createPresignedUploadTask } = useFile();
const { $userApi } = useNuxtApp();
const toast = new useAppToast();
const { copy, copied } = useClipboard()

const state = reactive<State>({
  metadata: {
    currency: "USD",
    technicalOptions: structuredClone(technicalOptionsDefault),
  },
  products: [],
  productCurrent: structuredClone(productCurrentDefault),
  snapshortProductCurrent: structuredClone(productCurrentDefault),
  uploadResource: structuredClone(uploadResourceDefault),
  loading: false,
});

const globalFilter = ref("");
const uploadProductThumbnailsSelected = ref<File[]>();
const currency = toRef(state.metadata, "currency");
const technicalOptions = toRef(state.metadata, "technicalOptions");
const rowSelection = ref<Record<string, boolean>>({});

const productCurrent = computed({
  get: () => state.productCurrent,
  set: (v) => {
    state.productCurrent = v;
  },
});

const productInfoCurrent = computed({
  get: () => productCurrent.value.info,
  set: (v) => {
    productCurrent.value.info = v;
  },
});

const productFileCurrent = computed({
  get: () => productCurrent.value.resources.productFile,
  set: (v) => {
    productCurrent.value.resources.productFile = v;
  },
});

const productThumbnailsCurrent = computed({
  get: () => productCurrent.value.resources.thumbnails,
  set: (v) => {
    productCurrent.value.resources.thumbnails = v;
  },
});

const uploadProductFile = toRef(state.uploadResource, "productFile");
const uploadProductThumbnails = toRef(state.uploadResource, "thumbnails");
const isSomeThumbnailUploadProcessing = computed(() => uploadProductThumbnails.value.some((ul) => ul.status === "progress"));
const isProductFileUploadProcessing = computed(() => uploadProductFile.value?.status === "progress");
const filters = reactive({
  open: false,
  categories: [] as CategoryItemSelected[],
  selectdCategoryIds: [] as string[]
})

await useAsyncData(() =>
  $userApi<Record<string, string[]>>("/api/option/all", {
    onResponse({ response }) {
      if (response.ok) {
        state.metadata.technicalOptions = response._data;
      }
    },
  }),
);

const { data: categoryReferences } = await useAsyncData(() => $userApi<CategoryReference[]>("/api/category/reference"));

const categorySearchGroup = computed(() => {
  return [
    {
      id: "categories",
      label: "Categories",
      items: categoryReferences.value?.map(
        (item) =>
          ({
            ...item,
            label: `${item.type} — ${item.name} ${!item.active ? "— INACTIVE" : ""}`,
          }) as CategoryItemSelected,
      ),
    },
  ];
});

const { refresh: refreshProducts, pending } = await useAsyncData(() =>
  $userApi<ProductItemResponse[]>("/api/product/list", {
    query: {
      categories: filters.selectdCategoryIds
    },
    onResponse({ response }) {
      if (response.ok) {
        const data = response._data as ProductItemResponse[];
        state.products = data.map((product) => productResponseToProduct(product));
      }
    },
  }),
  {
    watch: [() => filters.selectdCategoryIds],
    deep: true,
  }
);

function resetProductCurrent(publicId: string) {
  refreshProducts().then(() => {
    const product = state.products.find((prd) => prd.publicId === publicId);
    if (product) {
      state.productCurrent = product;
      state.snapshortProductCurrent = { ...product };
    }
  });
}

function actionOnProductPublicIdOrReturn() {
  if (!state.productCurrent.publicId) return;
}

function onSelect(row: TableRow<Product>) {
  state.productCurrent = row.original;

  state.snapshortProductCurrent = { ...row.original };
  rowSelection.value = {};
  rowSelection.value[row.index] = true;
}

function changeSelectImages(files: File[] | null | undefined) {
  actionOnProductPublicIdOrReturn();
  if (files) {
    uploadProductThumbnails.value = files.map((file) => ({
      file,
      percent: 0,
      status: "pending",
    }));
  }
}

function changeSelectDesignFile(file: File | null | undefined) {
  if (file) {
    uploadProductFile.value = {
      file,
      percent: 0,
      status: "pending",
    };
    fileActions().uploadFiles("DESIGN");
  }
}

function fileActions() {
  async function uploadFiles(type: "IMAGE" | "DESIGN") {
    actionOnProductPublicIdOrReturn();

    let fileUploads: FileUpload[] = [];
    if (type === "IMAGE") {
      fileUploads = uploadProductThumbnails.value;
    } else if (uploadProductFile.value) {
      fileUploads = [uploadProductFile.value];
    }

    if (fileUploads.length) {
      fileUploads.forEach((file) => {
        file.status = "progress";
      });

      await Promise.all(
        fileUploads.map((fileUpload) =>
          $userApi("/api/product/file/upload", {
            method: "POST",
            body: <z.infer<typeof UploadFileRequestSchema>>{
              publicId: productCurrent.value.publicId,
              file: {
                filename: fileUpload.file.name,
                size: fileUpload.file.size,
                type,
              },
            },
            onResponse({ response }) {
              if (response.ok) {
                const data = response._data;
                createPresignedUploadTask(fileUpload.file, data.uploadLink, (percent) => {
                  fileUpload.percent = percent;
                  if (percent === 100) fileUpload.status = "success";
                })
                  .then(() => {
                    uploadProductFile.value = undefined;
                    uploadProductThumbnails.value = [];
                    uploadProductThumbnailsSelected.value = undefined;

                    refreshProducts().then(() => {
                      resetProductCurrent(productCurrent.value.publicId!);
                      toast.toast.add({ title: "Uploaded successfully" });
                    });
                  })
                  .catch(() => {
                    fileUpload.status = "error";
                  });
              }
            },
          }).catch(() => {
            fileUpload.status = "error";
          }),
        ),
      );
    }
  }

  async function deleteFile(filePublicId: string) {
    actionOnProductPublicIdOrReturn();
    await $userApi("/api/product/file/delete", {
      method: "DELETE",
      body: <z.infer<typeof DeleteFileRequestSchema>>{ publicId: filePublicId },
      onResponse({ response }) {
        if (response.ok) {
          refreshProducts().finally(() => {
            resetProductCurrent(productCurrent.value.publicId!);
            toast.toast.add({ title: "Deleted successfully" });
          });
        }
      },
    });
  }

  function downloadFile(filePublicId?: string) {
    if (!filePublicId) return;
    $userApi(`/api/product/file/design/${filePublicId}`, {
      onResponse({ response }) {
        if (response.ok) {
          window.open(response._data, "_blank");
        }
      },
    });
  }

  return { uploadFiles, deleteFile, downloadFile };
}

function productActions() {
  function add() {
    state.productCurrent = structuredClone(productCurrentDefault);
    uploadProductThumbnails.value = [];
    uploadProductFile.value = undefined;
  }

  async function save() {
    actionOnProductPublicIdOrReturn();

    const process = async () => {
      const data = state.productCurrent;

      if (data.plan === "FREE") {
        data.price = 0;
      }

      if (!data.publicId) {
        await $userApi("/api/product/add", {
          method: "POST",
          body: {
            name: data.name,
            price: data.price,
            info: data.info,
            category_publicIds: data.categories.map((i) => i.publicId),
            tagIds: data.tagIds,
            plan: data.plan,
            externalLink: data.externalLink
          } satisfies z.input<typeof AddProductSchema>,
          onResponse: ({ response }) => {
            if (response.ok) {
              resetProductCurrent(response._data.publicId);
              toast.toast.add({ title: "Created successfully" });
            }
          },
        });
      } else {
        await $userApi("/api/product/update", {
          method: "PUT",
          body: {
            publicId: data.publicId,
            name: data.name,
            price: data.price,
            status: data.status,
            info: data.info,
            plan: data.plan,
            category_publicIds: data.categories.map((i) => i.publicId),
            tagIds: data.tagIds,
            externalLink: data.externalLink
          } satisfies z.input<typeof UpdateProductSchema>,
          onResponse: ({ response }) => {
            if (response.ok) {
              refreshProducts().then(() => {
                resetProductCurrent(response._data.publicId);
                toast.toast.add({ title: "Updated successfully" });
              });
            } else {
              data.status = state.snapshortProductCurrent.status;
            }
          },
        });
      }
    };

    try {
      state.loading = true;
      await process();
    } finally {
      state.loading = false;
    }
  }

  async function del() {
    actionOnProductPublicIdOrReturn();
    await $userApi("/api/product/delete", {
      method: "DELETE",
      body: <z.output<typeof DeleteProductSchema>>{ publicId: state.productCurrent.publicId },
      onResponse: ({ response }) => {
        if (response.ok) {
          refreshProducts().then(() => add());
          toast.toast.add({ title: "Deleted successfully" });
        }
      },
    });
  }

  return { add, save, del };
}

function clickById(id: string) {
  document.getElementById(id)?.click();
}

// Hàm xóa nhanh Category khỏi state ngay ở bên ngoài
function removeCategory(index: number) {
  state.productCurrent.categories.splice(index, 1);
}

function toogleTag(id: string) {
  if (state.productCurrent.tagIds.includes(id)) {
    state.productCurrent.tagIds = state.productCurrent.tagIds.filter((tagId) => id !== tagId);
  } else {
    state.productCurrent.tagIds.push(id);
  }
}

function getTagsFromCategoryReference(categoryId: string) {
  const category = categoryReferences.value?.find((ctg) => ctg.publicId === categoryId);
  return category?.tags ?? [];
}

function existsCategoryById(categoryId: string) {
  return categoryReferences.value?.some((ctg) => ctg.publicId === categoryId) ?? false;
}

function clearFilterCategories() {
  filters.categories = []
  acceptFilterCategories()
}

function acceptFilterCategories() {
  filters.selectdCategoryIds = filters.categories.map(ctg => ctg.publicId)
  filters.open = false
}
</script>
