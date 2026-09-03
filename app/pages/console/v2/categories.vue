<template>
  <div class="h-full grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-5 items-start overflow-hidden">
    <!-- LEFT PANEL: Category Table -->
    <UCard :ui="{
      root: 'h-full flex flex-col border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm rounded-xl overflow-hidden',
      body: 'p-0 flex-1 flex flex-col min-h-0',
    }">
      <!-- Header / Search Toolbar -->
      <div
        class="p-4 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-900/50">
        <UInput v-model="globalFilter" icon="i-lucide-search" placeholder="Filter categories..."
          class="w-full max-w-xs" />
      </div>

      <!-- Main Data Table -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <UTable :loading="pending" :data="state.data" :columns="columns" v-model:row-selection="rowSelection"
          v-model:global-filter="globalFilter" sticky class="flex-1" @select="(row) => onSelect(row)">
          <!-- Status Column Custom Render -->
          <template #active-cell="{ row }">
            <UBadge :label="generateStatus(row.original.active).label"
              :color="generateStatus(row.original.active).color" variant="subtle" size="sm" />
          </template>

          <!-- Tags Column Custom Render -->
          <template #tags-cell="{ row }">
            <div class="flex flex-wrap gap-1 max-w-55">
              <UBadge v-for="(tag, idx) in (row.original.tags || []).slice(0, 3)" :key="idx" :label="tag"
                color="neutral" variant="outline" size="sm" />
              <UBadge v-if="(row.original.tags || []).length > 3" :label="`+${row.original.tags?.length ?? 0 - 3}`"
                color="neutral" variant="soft" size="xs" />
              <span v-if="!(row.original.tags && row.original.tags.length)"
                class="text-xs text-neutral-400 font-normal"> No tags </span>
            </div>
          </template>

          <!-- Products Count Column -->
          <template #products-cell="{ row }">
            <UBadge :label="`${row.original.products?.length || 0} items`" color="neutral" variant="soft" size="sm" />
          </template>
        </UTable>
      </div>
    </UCard>

    <!-- RIGHT PANEL: Edit / Create Form -->
    <UCard :ui="{
      root: 'h-full flex flex-col border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm rounded-xl overflow-hidden',
      header: 'p-4 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between',
      body: 'p-5 flex-1 overflow-y-auto space-y-5',
      footer: 'p-4 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-3',
    }">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon :name="state.current.publicId ? 'i-lucide-file-edit' : 'i-lucide-folder-plus'"
            class="size-5 text-primary-500" />
          <h3 class="font-semibold text-base">
            {{ state.current.publicId ? "Edit Category" : "Create Category" }}
          </h3>
        </div>
        <UButton icon="i-lucide-plus" label="New Category" color="primary" @click="add" size="sm" />
        <!-- <UBadge v-if="state.current.publicId" :label="state.current.publicId" color="neutral" variant="outline"
          size="sm" /> -->
      </template>

      <UTabs :items="formTabs" class="w-full">
        <template #general>
          <div class="space-y-5">
            <UFormField v-if="state.current.publicId" label="ID">
              <UInput disabled v-model="state.current.publicId" :ui="{ trailing: 'pr-0.5' }" class="w-full">
                <template v-if="state.current.publicId.length" #trailing>
                  <UTooltip text="Copy to clipboard" :content="{ side: 'right' }">
                    <UButton :color="copied ? 'success' : 'neutral'" variant="link" size="sm"
                      :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'" aria-label="Copy to clipboard"
                      @click="copy(state.current.publicId)" />
                  </UTooltip>
                </template>
              </UInput>
            </UFormField>
            <!-- Category Name -->
            <UFormField label="Name" required>
              <UInput v-model="state.current.name" placeholder="e.g. Architectural Models" class="w-full" />
            </UFormField>

            <!-- Status & Group in Grid -->
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Status">
                <USelect v-model="state.current.status" :items="statusValues" class="w-full" />
              </UFormField>

              <UFormField label="Group Type">
                <USelect v-model="state.current.type" :items="groupValues" class="w-full" />
              </UFormField>
            </div>

            <!-- Category Tags Input Section -->
            <UFormField label="Tags" description="Type tag name and press Enter or comma to add.">
              <div class="space-y-2 w-full">
                <UInput v-model="tagInput" placeholder="Add tag..." icon="i-lucide-tag" class="w-full"
                  @keydown.enter.prevent="addTag" @keydown.comma.prevent="addTag" />
                <div
                  class="flex flex-wrap gap-1.5 min-h-8 p-2 bg-neutral-50 dark:bg-neutral-950/50 rounded-lg border border-neutral-200/60 dark:border-neutral-800">
                  <!-- <UBadge v-for="(tag, index) in state.current.tags" :key="index" color="primary" variant="soft"
                    class="gap-1">
                    {{ tag }}
                    <UIcon name="i-lucide-x" class="size-3 cursor-pointer hover:text-red-500 transition-colors"
                      @click="removeTag(index)" />
                  </UBadge> -->
                  <UBadge v-for="(tag, index) in state.current.tags" :key="index" color="primary" variant="soft"
                    class="gap-1">
                    {{ tag }}
                    <UIcon name="i-lucide-x" class="size-3 cursor-pointer hover:text-red-500 transition-colors"
                      @click="removeTag(index)" />
                  </UBadge>
                  <span v-if="!state.current.tags.length" class="text-xs text-neutral-400 py-0.5"> No tags attached
                  </span>
                </div>
              </div>
            </UFormField>
          </div>
        </template>
        <template #products>
          <div class="space-y-5">
            <!-- Linked Products Table -->
            <!-- <UFormField label="Linked Products">
              <div class="w-full h-full border border-neutral-200/80 dark:border-neutral-800 rounded-lg overflow-hidden"> -->
            <UInput v-model="productFilter" icon="i-lucide-search" placeholder="Filter products..." class="w-full" />
            <UTable :data="state.current.products" :columns="productColumns" v-model:global-filter="productFilter"
              class="max-h-96 overflow-y-auto">
              <template #empty>
                <div class="p-4 text-center text-xs text-neutral-400">No products linked to this category</div>
              </template>
              <template #tags-cell="{ row }">
                {{ row.original.tags }}
              </template>
            </UTable>
            <!-- </div>
            </UFormField> -->
          </div>
        </template>
      </UTabs>

      <!-- Footer Actions -->
      <template #footer>
        <UButton v-if="state.current.publicId" icon="i-lucide-trash-2" label="Delete" color="error" variant="soft" size="sm"
          @click="del" />
        <div v-else />

        <div class="flex items-center gap-2">
          <!-- <UButton label="Reset" color="neutral" variant="ghost" @click="add" /> -->
          <UButton :loading="state.loading" icon="i-lucide-save" label="Save Changes" color="primary" size="sm" @click="save" />
        </div>
      </template>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import type { TableColumn, TableRow } from "@nuxt/ui";
import { CategoryType, type CategoryItemResponse, type CategoryProductItemResponse } from "#shared/types/category";
import { useClipboard } from '@vueuse/core'

type CategoryStatus = "ACTIVE" | "INACTIVE";

// Extended Category type with Tags array
type Category = {
  publicId: string | undefined;
  name: string;
  type: CategoryType;
  status: CategoryStatus;
  tags: string[];
  products: {
    publicId: string;
    name: string;
    tags: string
  }[];
};

interface ExtendedCategoryItemResponse extends CategoryItemResponse {
  tags?: string[];
}

interface State {
  loading: boolean;
  data: ExtendedCategoryItemResponse[];
  current: Category;
}

const statusValues: CategoryStatus[] = ["ACTIVE", "INACTIVE"];
const groupValues: CategoryType[] = [CategoryType.THREE_D, CategoryType.TWO_D];

const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "type",
    header: "Group",
  },
  {
    accessorKey: "tags",
    header: "Tags",
  },
  {
    accessorKey: "active",
    header: "Status",
  },
  {
    accessorKey: "products",
    header: "Products",
  },
] satisfies TableColumn<ExtendedCategoryItemResponse>[];

const productColumns = [
  // {
  //   accessorKey: "publicId",
  //   header: "ID",
  // },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "tags",
    header: "Tags",
  },
] satisfies TableColumn<CategoryProductItemResponse>[];

const categoryDefaultState: Category = {
  publicId: undefined,
  name: "",
  type: CategoryType.THREE_D,
  status: "INACTIVE",
  tags: [],
  products: [],
};

const globalFilter = ref("");
const productFilter = ref("");
const tagInput = ref("");

const state = reactive<State>({
  data: [],
  loading: false,
  current: structuredClone(categoryDefaultState),
});
const rowSelection = ref<Record<string, boolean>>({});

const appToast = new useAppToast();
const { $userApi } = useNuxtApp();
const { copy, copied } = useClipboard()

const { refresh, pending } = await useAsyncData(() =>
  $userApi("/api/category/list", {
    onResponse({ response }) {
      if (response.ok) {
        state.data = response._data;
      }
    },
  }),
);

const formTabs = [
  { label: "General", slot: "general", icon: "i-lucide-info" },
  { label: "Products", slot: "products", icon: "ic:sharp-layers" },
];

// Map API Data Row to Form State
function categoryRowToProduct(category: ExtendedCategoryItemResponse) {
  state.current.publicId = category.publicId;
  state.current.name = category.name;
  state.current.type = category.type as CategoryType;
  state.current.status = category.active ? "ACTIVE" : "INACTIVE";
  state.current.tags = [...(category.tags || [])];
  state.current.products = category.products;
}

function onSelect(row: TableRow<ExtendedCategoryItemResponse>) {
  categoryRowToProduct(row.original);
  rowSelection.value = {};
  rowSelection.value[row.index] = true;
}

function generateStatus(value: boolean): {
  label: CategoryStatus;
  color: "success" | "neutral";
} {
  return {
    label: value ? "ACTIVE" : "INACTIVE",
    color: value ? "success" : "neutral",
  };
}

// Tag Management Functions
function addTag() {
  const val = tagInput.value.trim().replace(/^,|,$/g, "");
  if (val && !state.current.tags.includes(val)) {
    state.current.tags.push(val);
  }
  tagInput.value = "";
}

function removeTag(index: number) {
  state.current.tags.splice(index, 1);
}

function add() {
  state.current = structuredClone(categoryDefaultState);
  tagInput.value = "";
  rowSelection.value = {};
}

async function save() {
  // Finalize tag input if user didn't hit Enter
  const process = async () => {
    if (tagInput.value.trim()) {
      addTag();
    }

    const payload = {
      name: state.current.name,
      type: state.current.type,
      active: state.current.status === "ACTIVE",
      tags: state.current.tags,
    };

    if (state.current.publicId) {
      await $userApi("/api/category/update", {
        method: "PUT",
        body: {
          publicId: state.current.publicId,
          data: payload,
        },
        onResponse({ response }) {
          if (response.ok) {
            refresh().then(() => {
              const category = state.data.find((c) => c.publicId === response._data.publicId);
              if (category) categoryRowToProduct(category);
            });
            appToast.toast.add({ title: "Updated successfully" });
          }
        },
      });
    } else {
      await $userApi("/api/category/add", {
        method: "POST",
        body: payload,
        onResponse({ response }) {
          if (response.ok) {
            refresh().then(() => {
              const category = state.data.find((c) => c.publicId === response._data.publicId);
              if (category) categoryRowToProduct(category);
            });
            appToast.toast.add({ title: "Created successfully" });
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

function del() {
  if (!state.current.publicId) return;

  $userApi("/api/category/delete", {
    method: "DELETE",
    query: {
      publicId: state.current.publicId,
    },
    onResponse({ response }) {
      if (response.ok) {
        refresh().then(() => {
          add();
        });
        appToast.toast.add({ title: "Deleted successfully" });
      }
    },
  });
}

useSeoMeta({
  title: "Categories Management",
});
</script>
