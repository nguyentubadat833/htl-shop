<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { ProductPlan, ProductStatus } from "~~/prisma/generated/enums";
import { parseSheetData, readSheet } from "read-excel-file/browser";
import z from "zod";
import { ProductInfoSchema, UploadFileRequestSchema, type AddProductSchema } from "~~/shared/schemas/product";

const emits = defineEmits(['success'])

// interface Row {
//   index: number
//   name: string
//   plan: ProductPlan,
//   price: number | undefined
//   status: ProductStatus,
//   categories: string | undefined
//   externalLink: string | undefined
//   platform: string | undefined
//   render: string | undefined
//   color: string | undefined
//   design: string | undefined
//   materials: string | undefined
//   factor: string | undefined
//   size: string | undefined
//   description: string | undefined
// }
const ROW_STATUSES = ["pending", "processing", "error", "success"] as const;
const FILE_STATUSES = ["pending", "uploading", "error", "success"] as const;

type RowStatus = (typeof ROW_STATUSES)[number];
type FileStatus = (typeof FILE_STATUSES)[number];

const FileItemSchema = z.object({
  file: z.instanceof(File, {
    error: "File is required",
  }),
  type: z.enum(["IMAGE", "DESIGN"]),
  percent: z.number().default(0),
  status: z.enum(FILE_STATUSES).default("pending"),
});

const InfoItemSchema = z
  .string()
  .nullable()
  .transform((v) => v ?? "");
const TableRowSchema = z.object({
  index: z.string({ error: "Invalid index" }),
  name: z.string().min(1, { error: "Invalid name" }),
  plan: z.enum([ProductPlan.FREE, ProductPlan.PRO], { error: "Invalid plan" }),
  price: z.number({ error: "Invalid price" }).nullable().optional(),
  // status: z.enum([ProductStatus.ACTIVE, ProductStatus.INACTIVE], { error: "Invalid status" }).default('INACTIVE'),
  categories: z.string().nullable().optional(),
  externalLink: z.string().nullable().optional(),
  platform: InfoItemSchema,
  render: InfoItemSchema,
  size: InfoItemSchema,
  colors: InfoItemSchema,
  style: InfoItemSchema,
  materials: InfoItemSchema,
  formfactor: InfoItemSchema,
  description: InfoItemSchema,
  files: z.array(FileItemSchema).default([]),
  status: z
    .object({
      type: z.enum(ROW_STATUSES),
      message: z.string().optional(),
    })
    .default({
      type: "pending",
      message: "",
    }),
});

type FileItem = z.infer<typeof FileItemSchema>;
type TableRow = z.infer<typeof TableRowSchema>;

type ScanItem = {
  type: "DATA_FILE" | "DESIGN_FILE" | "THUMBNAIL_FILE";
  data: File;
  index?: string;
};

const excelRowSchemas = {
  index: { column: "index", type: String, required: true },
  name: { column: "name", type: String, required: true },
  plan: { column: "plan", type: String, required: true, oneOf: [ProductPlan.FREE, ProductPlan.PRO] },
  price: { column: "price", type: Number },
  categories: { column: "categories", type: String },
  externalLink: { column: "externalLink", type: String },
  platform: { column: "platform", type: String },
  render: { column: "render", type: String },
  size: { column: "size", type: String },
  colors: { column: "colors", type: String },
  style: { column: "style", type: String },
  materials: { column: "materials", type: String },
  formfactor: { column: "formfactor", type: String },
  description: { column: "description", type: String },
};

const tableColumns: TableColumn<any>[] = [
  { accessorKey: "index", header: "No" },
  { id: "status", header: "Status" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "plan", header: "Plan" },
  { accessorKey: "price", header: "Price" },
  { accessorKey: "categories", header: "Categories" },
  { accessorKey: "externalLink", header: "External link" },

  { id: "thumbnails", header: "Thumbnails" },
  { id: "designFile", header: "Design file" },

  { accessorKey: "platform", header: "Platform" },
  { accessorKey: "render", header: "Render engine" },
  { accessorKey: "size", header: "Size" },
  { accessorKey: "colors", header: "Colors palette" },
  { accessorKey: "style", header: "Design style" },
  { accessorKey: "formfactor", header: "Form factor" },
  { accessorKey: "description", header: "Description" },
];

const statusColors: Record<RowStatus, string> = {
  pending: "neutral",
  processing: "secondary",
  error: "error",
  success: "success",
};

const fileStatusColors: Record<FileStatus, string> = {
  pending: "neutral",
  uploading: "secondary",
  error: "error",
  success: "success",
};

const { createPresignedUploadTask } = useFile();
const { $userApi } = useNuxtApp();
const toast = useToast();
const tableRowItems = ref<TableRow[]>([]);

async function readDataFile(file: File) {
  const sheetData = await readSheet(file, 1);
  const { objects, errors } = parseSheetData(sheetData, excelRowSchemas);
  if (errors) {
    toast.add({
      color: "error",
      title: "Parse excel error",
      description: JSON.stringify(errors),
    });
    return;
  } else {
    objects.forEach((object) => {
      const parse = TableRowSchema.safeParse(object);
      if (parse.success) {
        tableRowItems.value.push(parse.data);
      } else {
        toast.add({
          color: "error",
          title: "Row error",
          description: JSON.stringify(parse.error.issues[0]?.message),
        });
      }
    });
  }
}

async function scanDirectory(entry: FileSystemDirectoryHandle, results: ScanItem[] = []) {
  if (Array.isArray(entry)) {
    const fileSystem = entry[1] as FileSystemDirectoryHandle;

    if (fileSystem.kind.includes("file") && fileSystem.name.includes("data")) {
      const file = await (fileSystem as unknown as FileSystemFileHandle).getFile();
      const item = {
        type: "DATA_FILE",
        data: file,
      } satisfies ScanItem;

      results.push(item);
      return results;
    }

    if (fileSystem.kind.includes("directory")) {
      for await (const item of fileSystem.entries()) {
        const data = item[1];

        if (data.kind === "file") {
          if (data.name.includes("thumbnail")) {
            const item = {
              type: "THUMBNAIL_FILE",
              data: await data.getFile(),
              index: entry[0] ?? entry[2]?.name,
            } satisfies ScanItem;
            results.push(item);
          }

          if (data.name.includes("design")) {
            const item = {
              type: "DESIGN_FILE",
              data: await data.getFile(),
              index: entry[0] ?? entry[2]?.name,
            } satisfies ScanItem;
            results.push(item);
          }
        }
      }

      return results;
    }
  }

  return results;
}

async function openFolder() {
  const directory = await (window as any).showDirectoryPicker({
    mode: "read",
  });

  let scanItems: ScanItem[] = [];

  for await (const entry of directory.entries()) {
    const results = await scanDirectory(entry);

    scanItems = [...scanItems, ...results];
  }

  const dataFile = scanItems.find((rs) => rs.type === "DATA_FILE");
  if (!dataFile) {
    toast.add({
      color: "error",
      title: "Data file is required",
    });

    return;
  }

  await readDataFile(dataFile.data);

  const productFiles = scanItems.filter((item) => item.type !== "DATA_FILE");

  productFiles.forEach((item) => {
    if (item.index) {
      const tableRow = tableRowItems.value.find((row) => row.index === item.index);

      if (tableRow) {
        if (item.type === "DESIGN_FILE") {
          tableRow.files.push({
            file: item.data,
            percent: 0,
            status: "pending",
            type: "DESIGN",
          });
        } else {
          tableRow.files.push({
            file: item.data,
            percent: 0,
            status: "pending",
            type: "IMAGE",
          });
        }
      }
    }
  });
}

function createImageUrl(file: File) {
  return URL.createObjectURL(file);
}

async function submit() {
  await Promise.all(
    tableRowItems.value.map((item) => {
      return $userApi("/api/product/add", {
        method: "POST",
        body: {
          name: item.name,
          price: item.price ?? 0,
          category_publicIds: item.categories
            ?.split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          tagIds: [],
          plan: item.plan,
          externalLink: item.externalLink ?? undefined,
          info: ProductInfoSchema.parse(item),
        } satisfies z.input<typeof AddProductSchema>,
        onRequest() {
          item.status.type = "processing";
        },
        onResponse: ({ response }) => {
          if (response.ok) {
            const productId = response._data.publicId;
            item.status.type = "success";

            Promise.all(
              item.files.map((fileUpload) =>
                $userApi("/api/product/file/upload", {
                  method: "POST",
                  body: <z.infer<typeof UploadFileRequestSchema>>{
                    publicId: productId,
                    file: {
                      filename: fileUpload.file.name,
                      size: fileUpload.file.size,
                      type: fileUpload.type,
                    },
                  },
                  onResponse({ response }) {
                    if (response.ok) {
                      const data = response._data;
                      item.status.type = "success";

                      createPresignedUploadTask(fileUpload.file, data.uploadLink, (percent) => {
                        fileUpload.percent = percent;
                        if (percent === 100) fileUpload.status = "success";
                      }).catch((e) => {
                        fileUpload.status = "error";
                        item.status.message = JSON.stringify(e);
                      });
                    } else {
                      item.status.type = "error";
                      item.status.message = `${response._data?.statusMessage} | ${response._data?.message}`;
                    }
                  },
                }),
              ),
            );
          } else {
            item.status.type = "error";
            item.status.message = `${response._data?.statusMessage} | ${response._data?.message}`;
          }
        },
      });
    }),
  );

  emits('success')
}

function isMissingExternalLink(row: TableRow) {
  return row.plan === "FREE" && !row.externalLink?.trim();
}

function isMissingPrice(row: TableRow) {
  return row.plan === "PRO" && !row.price;
}

function isMissingDesignFile(row: TableRow) {
  return row.plan === "PRO" && !row.files.some((file) => file.type === "DESIGN");
}

function isMissingThumbnail(row: TableRow) {
  return !row.files.some((file) => file.type === "IMAGE");
}

function getStatusColor(row: TableRow) {
  return statusColors[row.status.type] as any;
}

function getFileStatusColor(file: FileItem) {
  return fileStatusColors[file.status] as any;
}

function getThumbails(row: TableRow) {
  return row.files.filter((file) => file.type === "IMAGE");
}

function getDesignFiles(row: TableRow) {
  const file = row.files.find((file) => file.type === "DESIGN");
  return file ? [file] : [];
}

function clear(){
  tableRowItems.value = []
}
</script>

<template>
  <UModal title="Import products" fullscreen>
    <UButton icon="i-lucide-upload" color="info" />
    <template #body>
      <div class="min-h-[40vh] max-h-[60vh]">
        <!-- <UAlert v-if="errorMessage" color="error" variant="soft" :title="errorMessage" /> -->

        <UTable
          v-if="tableRowItems.length"
          :data="tableRowItems"
          :columns="tableColumns"
          :ui="{
            th: 'whitespace-nowrap',
            td: 'whitespace-nowrap',
          }"
        >
          <template #price-cell="{ row }">
            <div v-if="row.original.plan === 'PRO'">
              <UBadge v-if="isMissingPrice(row.original)" color="error" label="PRICE REQUIRED" />
              <div v-else>{{ priceToUSD(row.original.price) }}</div>
            </div>
          </template>

          <template #externalLink-cell="{ row }">
            <UBadge v-if="isMissingExternalLink(row.original)" color="error" label="LINK REQUIRED" />
            <div v-else>{{ row.original.externalLink }}</div>
          </template>

          <template #thumbnails-cell="{ row }">
            <UBadge v-if="isMissingThumbnail(row.original)" color="error" label="THUMBNAIL REQUIRED" />
            <div v-else class="flex flex-col gap-3 items-center">
              <div v-for="item in getThumbails(row.original)" class="w-full">
                <UButton :loading="item.status === 'uploading'" variant="outline" :color="getFileStatusColor(item)" block>
                  <div class="flex gap-2">
                    <img v-if="item?.file && item.type === 'IMAGE'" :src="createImageUrl(item.file)" class="w-5 h-5 overflow-hidden" />
                    Image
                  </div>
                </UButton>
              </div>
            </div>
          </template>

          <template #designFile-cell="{ row }">
            <UBadge v-if="isMissingDesignFile(row.original)" color="error" label="DESIGN FILE REQUIRED" />
            <div v-else>
              <div v-for="item in getDesignFiles(row.original)">
                <UButton
                  :loading="item.status === 'uploading'"
                  :label="item?.file?.name"
                  icon="ic:baseline-file-present"
                  :color="getFileStatusColor(item)"
                  variant="outline"
                  block
                />
              </div>
            </div>
          </template>

          <template #status-cell="{ row }">
            <UButton :loading="row.original.status.type === 'processing'" :label="row.original.status.type" :color="getStatusColor(row.original)" variant="outline" />
          </template>
        </UTable>
        <p v-else class="text-sm text-gray-500">Empty data.</p>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-between w-full">
        <div class="flex gap-2">
          <UButton :disabled="tableRowItems.some(item => item.status.type === 'processing')" label="Choose folder" icon="i-lucide-folder-open" color="neutral" variant="outline" @click="openFolder" />
          <UButton :disabled="tableRowItems.some(item => item.status.type === 'processing')" label="Clear" icon="ic:baseline-delete-sweep" color="neutral" variant="outline" @click="clear" />
        </div>
        <UButton label="Submit" icon="ic:baseline-publish" @click="submit" />
      </div>
    </template>
  </UModal>
</template>
