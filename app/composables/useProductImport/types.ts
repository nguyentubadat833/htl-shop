import type { SelectMenuItem, TableColumn } from "@nuxt/ui";
import z from "zod";
import { ProductPlan } from "~~/prisma/generated/enums";

export const ROW_STATUSES = ["pending", "processing", "error", "success"] as const;
export const FILE_STATUSES = ["pending", "uploading", "error", "success"] as const;

export type RowStatus = (typeof ROW_STATUSES)[number];
export type FileStatus = (typeof FILE_STATUSES)[number];

export type CategorySelectItem = SelectMenuItem & {
  data: CategoryReference;
};

export const FileItemSchema = z.object({
  file: z.instanceof(File, { error: "File is required" }),
  type: z.enum(["IMAGE", "DESIGN"]),
  percent: z.number().default(0),
  status: z.enum(FILE_STATUSES).default("pending"),
});

const InfoItemSchema = z
  .string()
  .nullable()
  .transform((v) => v ?? "");

export const TableRowSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  index: z.string({ error: "Invalid index" }),
  name: z.string().min(1, { error: "Invalid name" }),
  plan: z.enum([ProductPlan.FREE, ProductPlan.PRO], { error: "Invalid plan" }),
  price: z.number({ error: "Invalid price" }).nullable().optional(),
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
    .default({ type: "pending", message: "" }),
  isDuplicate: z.boolean().default(false),
});

export type FileItem = z.infer<typeof FileItemSchema>;
export type TableRow = z.infer<typeof TableRowSchema>;

export type ScanItem = {
  type: "DATA_FILE" | "DESIGN_FILE" | "THUMBNAIL_FILE";
  data: File;
  index?: string;
};

export const excelRowSchemas = {
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

export const tableColumns: TableColumn<any>[] = [
  { id: "actions" },
  { accessorKey: "index", header: "Index" },
  { accessorKey: "isDuplicate", header: "Duplicated" },
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

export const statusColors: Record<RowStatus, string> = {
  pending: "neutral",
  processing: "secondary",
  error: "error",
  success: "success",
};

export const fileStatusColors: Record<FileStatus, string> = {
  pending: "neutral",
  uploading: "secondary",
  error: "error",
  success: "success",
};
