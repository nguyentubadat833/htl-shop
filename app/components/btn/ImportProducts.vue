<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { ProductPlan, ProductStatus } from "~~/prisma/generated/enums";
import { parseSheetData, readSheet } from 'read-excel-file/browser'
import z from "zod";

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


const TableRowSchema = z.object({
  index: z.number({ error: "Invalid index" }),
  name: z.string().min(1, { error: "Invalid name" }),
  plan: z.enum([ProductPlan.FREE, ProductPlan.PRO], { error: "Invalid plan" }),
  price: z.number({ error: "Invalid price" }).nullable().optional(),
  status: z.enum([ProductStatus.ACTIVE, ProductStatus.INACTIVE], { error: "Invalid status" }).default('INACTIVE'),
  categories: z.string().nullable().optional(),
  externalLink: z.string().nullable().optional(),
  platform: z.string().nullable().optional(),
  render: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  design: z.string().nullable().optional(),
  materials: z.string().nullable().optional(),
  factor: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  thumbnails: z.array(
    z.object({
      file: z.instanceof(File, {
        error: 'Thumbnail file is required',
      }),
      percent: z.number().default(0),
      status: z.enum(['pending', 'uploading', 'success']).default('pending')
    })
  ).default([]),
  designFile: z.object({
    file: z.instanceof(File, {
      error: 'File design is required',
    }),
    percent: z.number().default(0),
    status: z.enum(['pending', 'uploading', 'success']).default('pending')
  }).partial().default({})
})

type TableRow = z.infer<typeof TableRowSchema>

type ScanItem = {
  type: 'DATA_FILE' | 'DESIGN_FILE' | 'THUMBNAIL_FILE'
  data: File
  index?: number
}

const excelRowSchemas = {
  index: { column: 'index', type: Number, required: true },
  name: { column: 'name', type: String, required: true },
  plan: { column: 'plan', type: String, required: true, oneOf: [ProductPlan.FREE, ProductPlan.PRO] },
  price: { column: 'price', type: Number },
  status: { column: 'status', type: String },
  categories: { column: 'categories', type: String },
  externalLink: { column: 'externalLink', type: String },
  platform: { column: 'platform', type: String },
  render: { column: 'render', type: String },
  color: { column: 'color', type: String },
  design: { column: 'design', type: String },
  materials: { column: 'materials', type: String },
  factor: { column: 'factor', type: String },
  size: { column: 'size', type: String },
  description: { column: 'description', type: String },
}

const tableColumns: TableColumn<any>[] = [
  { accessorKey: "index", header: "No" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "plan", header: "Plan" },
  { accessorKey: "price", header: "Price" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "categories", header: "Categories" },
  { accessorKey: "externalLink", header: "External link" },
  { accessorKey: "thumbnails", header: "Thumbnails" },
  { accessorKey: "designFile", header: "File design" },
  { accessorKey: "platform", header: "Platform" },
  { accessorKey: "render", header: "Render engine" },
  { accessorKey: "color", header: "Color palette" },
  { accessorKey: "design", header: "Design style" },
  { accessorKey: "factor", header: "Form factor" },
  { accessorKey: "size", header: "Size" },
  { accessorKey: "description", header: "Description" },
];

const toast = useToast()
const tableRowItems = ref<TableRow[]>([])

async function readDataFile(file: File) {

  const sheetData = await readSheet(file, 1)
  const { objects, errors } = parseSheetData(sheetData, excelRowSchemas)
  if (errors) {
    toast.add({
      color: "error",
      title: "Parse excel error",
      description: JSON.stringify(errors)
    })
    return
  } else {
    objects.forEach(object => {
      const parse = TableRowSchema.safeParse(object)
      if (parse.success) {
        tableRowItems.value.push(parse.data)
      } else {
        toast.add({
          color: 'error',
          title: "Row error",
          description: JSON.stringify(parse.error.issues[0]?.message)
        })
      }
    })
  }
}

async function scanDirectory(entry: FileSystemDirectoryHandle, results: ScanItem[] = []) {
  if (Array.isArray(entry)) {
    const fileSystem = entry[1] as FileSystemDirectoryHandle

    if (fileSystem.kind.includes('file') && fileSystem.name.includes('data')) {
      const file = await (fileSystem as unknown as FileSystemFileHandle).getFile()
      const item = {
        type: 'DATA_FILE',
        data: file,
      } satisfies ScanItem

      results.push(item)
      return results
    }


    if (fileSystem.kind.includes('directory')) {
      for await (const item of fileSystem.entries()) {
        const data = item[1]

        if (data.kind === 'file') {
          if (data.name.includes('thumbnail')) {
            const item = {
              type: 'THUMBNAIL_FILE',
              data: await data.getFile(),
              index: Number(entry[0] ?? entry[2]?.name)
            } satisfies ScanItem
            results.push(item)
          }

          if (data.name.includes('design')) {
            const item = {
              type: 'DESIGN_FILE',
              data: await data.getFile(),
              index: Number(entry[0] ?? entry[2]?.name)
            } satisfies ScanItem
            results.push(item)
          }
        }
      }

      return results
    }
  }

  return results
}

async function openFolder() {
  const directory = await (window as any).showDirectoryPicker({
    mode: 'read'
  })

  let scanItems: ScanItem[] = []

  for await (const entry of directory.entries()) {
    const results = await scanDirectory(entry)

    scanItems = [...scanItems, ...results]
  }

  const dataFile = scanItems.find(rs => rs.type === 'DATA_FILE')
  if (!dataFile) {
    toast.add({
      color: "error",
      title: "Data file is required"
    })

    return
  }

  await readDataFile(dataFile.data)

  const productFiles = scanItems.filter(item => item.type !== 'DATA_FILE')

  productFiles.forEach(item => {
    if (item.index) {

      const tableRow = tableRowItems.value.find(row => row.index === item.index)

      if (tableRow) {
        if (item.type === 'DESIGN_FILE') {
          tableRow.designFile = {
            file: item.data,
            percent: 0,
            status: 'pending'
          }

        } else {
          tableRow.thumbnails.push({
            file: item.data,
            percent: 0,
            status: "pending"
          })
        }
      }
    }
  })
}

function createImageUrl(file: File){
  return URL.createObjectURL(file)
}

function submit(){

}
</script>

<template>
  <UModal title="Import productsUPDA" :ui="{ content: 'min-w-[70vw]' }">
    <UButton icon="i-lucide-upload" color="info" />
    <template #body>
      <div class="min-h-[40vh] max-h-[60vh]">
        <!-- <UAlert v-if="errorMessage" color="error" variant="soft" :title="errorMessage" /> -->

        <UTable v-if="tableRowItems.length" :data="tableRowItems" :columns="tableColumns" :ui="{
          th: 'whitespace-nowrap',
          td: 'whitespace-nowrap'
        }">
          <template #thumbnails-cell="{ row }">
            <div class="flex gap-3 items-center">
              <div v-for="image in row.original.thumbnails" class="overflow-hidden h-10 w-10">
                <img v-if="image?.file" :src="createImageUrl(image.file)" />
              </div>
              <!-- <UIcon v-for="image in row.original.thumbnails" name="ic:baseline-image" size="25"/> -->
            </div>
          </template>
          <template #designFile-cell="{ row }">
            <div class="flex items-center gap-3">
              <UIcon v-if="row.original.designFile.file" name="ic:baseline-file-present" size="25" />
              <p>{{ row.original.designFile.file?.name }}</p>
            </div>
          </template>
        </UTable>
        <p v-else class="text-sm text-gray-500">Empty data.</p>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-between w-full">
        <UButton label="Choose folder" icon="i-lucide-folder-open" color="neutral" variant="outline" @click="openFolder" />
        <UButton label="Submit" icon="ic:baseline-publish"/>
      </div>
    </template>
  </UModal>
</template>
