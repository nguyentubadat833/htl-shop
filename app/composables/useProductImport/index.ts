import { parseSheetData, readSheet } from "read-excel-file/browser";
import z from "zod";
import { ProductInfoSchema, type UploadFileRequestSchema, type AddProductSchema } from "~~/shared/schemas/product";
import { TableRowSchema, excelRowSchemas, statusColors, fileStatusColors, type TableRow, type FileItem, type ScanItem, type CategorySelectItem } from "./types";

export function useProductImport(onSuccess?: () => void) {
  const { createPresignedUploadTask } = useFile();
  const { $userApi } = useNuxtApp();
  const toast = useToast();

  const tableRowItems = ref<TableRow[]>([]);

  // Fetch danh mục
  const { data: categories } = useLazyAsyncData(() => $userApi<CategoryReference[]>("/api/category/reference"), {
    transform: (value) =>
      value.map(
        (item) =>
          ({
            data: item,
            label: item.name,
          }) satisfies CategorySelectItem,
      ),
  });

  // Đọc file Excel
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
    }

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

  // Quét thư mục local
  async function scanDirectory(entry: FileSystemDirectoryHandle, results: ScanItem[] = []) {
    if (Array.isArray(entry)) {
      const fileSystem = entry[1] as FileSystemDirectoryHandle;

      if (fileSystem.kind.includes("file") && fileSystem.name.includes("data")) {
        const file = await (fileSystem as unknown as FileSystemFileHandle).getFile();
        results.push({ type: "DATA_FILE", data: file });
        return results;
      }

      if (fileSystem.kind.includes("directory")) {
        for await (const item of fileSystem.entries()) {
          const data = item[1];
          if (data.kind === "file") {
            if (data.name.includes("thumbnail")) {
              results.push({
                type: "THUMBNAIL_FILE",
                data: await data.getFile(),
                index: entry[0] ?? entry[2]?.name,
              });
            }
            if (data.name.includes("design")) {
              results.push({
                type: "DESIGN_FILE",
                data: await data.getFile(),
                index: entry[0] ?? entry[2]?.name,
              });
            }
          }
        }
        return results;
      }
    }
    return results;
  }

  // Mở thư mục chọn
  async function openFolder() {
    const directory = await (window as any).showDirectoryPicker({ mode: "read" });
    let scanItems: ScanItem[] = [];

    for await (const entry of directory.entries()) {
      const results = await scanDirectory(entry);
      scanItems = [...scanItems, ...results];
    }

    const dataFile = scanItems.find((rs) => rs.type === "DATA_FILE");
    if (!dataFile) {
      toast.add({ color: "error", title: "Data file is required" });
      return;
    }

    await readDataFile(dataFile.data);

    const productFiles = scanItems.filter((item) => item.type !== "DATA_FILE");
    productFiles.forEach((item) => {
      if (item.index) {
        const tableRow = tableRowItems.value.find((row) => row.index === item.index);
        if (tableRow) {
          tableRow.files.push({
            file: item.data,
            percent: 0,
            status: "pending",
            type: item.type === "DESIGN_FILE" ? "DESIGN" : "IMAGE",
          });
        }
      }
    });

    const checkResults = await $userApi<{ name: string; isDuplicate: boolean }[]>("/api/product/duplicate-check", {
      query: { names: tableRowItems.value.map((item) => item.name) },
    });

    const nameItems = tableRowItems.value.map((item) => item.name);
    tableRowItems.value.forEach((row) => {
      row.isDuplicate = nameItems.filter((name) => name === row.name).length > 1 || checkResults.some((rs) => rs.name === row.name && rs.isDuplicate);
    });
  }

  // Submit sản phẩm và tải file lên
  async function submit() {
    await Promise.all(
      tableRowItems.value.map((item) => {
        const statusType = item.status.type;
        if (statusType === "processing" || statusType === "success") {
          return;
        }

        return $userApi("/api/product/add", {
          method: "POST",
          body: {
            name: item.name,
            price: item.price ?? 0,
            category_publicIds: item.categories
              ?.split(",")
              .map((i) => i.trim())
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

    if (onSuccess) onSuccess();
  }

  // Các hàm hỗ trợ UI & Validation
  function createImageUrl(file: File) {
    return URL.createObjectURL(file);
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

  function getThumbnails(row: TableRow) {
    return row.files.filter((file) => file.type === "IMAGE");
  }

  function getDesignFiles(row: TableRow) {
    const file = row.files.find((file) => file.type === "DESIGN");
    return file ? [file] : [];
  }

  function clear() {
    tableRowItems.value = [];
  }

  function removeTableRow(index: number) {
    setTimeout(() => {
      tableRowItems.value.splice(index, 1);
    }, 500);
  }

  function categoryStringToArray(value: string) {
    if (typeof value === "string") {
      const arrayValues = value.split(",").filter(Boolean);
      return categories.value?.filter((ctg) => arrayValues.includes(ctg.data.publicId)) ?? [];
    }
    return [];
  }

  function selectCategories(values: CategorySelectItem[], index: number) {
    const row = tableRowItems.value[index];
    if (row) {
      row.categories = values.map((item) => item.data.publicId).join(",");
    }
  }

  return {
    tableRowItems,
    categories,
    openFolder,
    submit,
    clear,
    removeTableRow,
    createImageUrl,
    isMissingExternalLink,
    isMissingPrice,
    isMissingDesignFile,
    isMissingThumbnail,
    getStatusColor,
    getFileStatusColor,
    getThumbnails,
    getDesignFiles,
    categoryStringToArray,
    selectCategories,
  };
}
