import { ref } from "vue";

/**
 * Composable: useProductImport
 * --------------------------------------------------
 * npm i read-excel-file
 */

export interface ProductRow {
  no: number;
  name: string;
  plan: string;
  price: number | null;
  status: string;
  categories: string;
  externalLink: string;
  platform: string;
  render: string;
  color: string;
  design: string;
  materials: string;
  factor: string;
  size: string;
  description: string;
}

export interface ProductWithFiles extends ProductRow {
  images: File[];
  designFile: File | null;
}

const EXCEL_FILE_PREFIX = "data";
const IMAGE_PREFIX = "image";
const DESIGN_FILE_PREFIX = "file";

async function findFileByPrefix(dirHandle: FileSystemDirectoryHandle, prefix: string): Promise<FileSystemFileHandle | null> {
  for await (const [entryName, handle] of (dirHandle as any).entries() as AsyncIterable<[string, any]>) {
    if (handle.kind === "file" && entryName.toLowerCase().startsWith(prefix)) {
      return handle as FileSystemFileHandle;
    }
  }
  return null;
}

async function collectFolderFiles(dirHandle: FileSystemDirectoryHandle): Promise<{ images: File[]; designFile: File | null }> {
  const images: File[] = [];
  let designFile: File | null = null;

  for await (const [entryName, handle] of (dirHandle as any).entries() as AsyncIterable<[string, any]>) {
    if (handle.kind !== "file") continue;
    const lowerName = entryName.toLowerCase();
    const file: File = await handle.getFile();

    if (lowerName.startsWith(IMAGE_PREFIX)) images.push(file);
    else if (lowerName.startsWith(DESIGN_FILE_PREFIX)) designFile = file;
  }

  images.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  return { images, designFile };
}

export function useProductImport() {
  const isLoading = ref(false);
  const products = ref<ProductWithFiles[]>([]);
  const errorMessage = ref<string | null>(null);
  const toast = useToast();

  async function pickFolderAndBuild() {
    if (!import.meta.client) return;

    errorMessage.value = null;
    isLoading.value = true;
    products.value = [];

    try {
      const readExcelFileModule = await import("read-excel-file/browser");
      const readExcelFile = readExcelFileModule.default;

      const rootHandle: FileSystemDirectoryHandle = await (window as any).showDirectoryPicker();

      const excelHandle = await findFileByPrefix(rootHandle, EXCEL_FILE_PREFIX);
      if (!excelHandle) {
        toast.add({
          color: "error",
          title: "Excel error",
          description: `Không tìm thấy file excel bắt đầu bằng "${EXCEL_FILE_PREFIX}"`,
        });
        return;
      }

      const excelFile = await excelHandle.getFile();

      let parsedRows: ProductRow[] = [];

      try {
        const rawData = await readExcelFile(excelFile);
        // Kiểm tra xem rawData có bị bọc bởi [ { data: [...] } ] không
        const matrix: any[][] = Array.isArray(rawData[0]?.data) ? rawData[0].data : rawData;

        if (matrix.length > 1) {
          const headers: string[] = matrix[0]?.map((h: any) => String(h).trim()) ?? []

          // Chuyển mảng các mảng thành mảng các Objects { no: 1, name: 'Product 1', ... }
          parsedRows = matrix.slice(1).map((row) => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] ?? null;
            });
            return obj as ProductRow;
          });
        }
      } catch (e) {
        toast.add({
          color: "error",
          title: "Excel error",
          description: JSON.stringify(e),
        });
        return;
      }

      const results: ProductWithFiles[] = [];

      for (const row of parsedRows) {
        const folderName = String(row.no);
        let subDirHandle: FileSystemDirectoryHandle | null = null;

        try {
          subDirHandle = await rootHandle.getDirectoryHandle(folderName);
        } catch {
          console.warn(`[useProductImport] Không tìm thấy folder "${folderName}" cho "${row.name}"`);
        }

        let images: File[] = [];
        let designFile: File | null = null;

        if (subDirHandle) {
          const collected = await collectFolderFiles(subDirHandle);
          images = collected.images;
          designFile = collected.designFile;
        }

        results.push({ ...row, images, designFile });
      }

      products.value = results;
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        errorMessage.value = err?.message ?? "Có lỗi xảy ra khi đọc thư mục";
        console.error("[useProductImport]", err);
      }
    } finally {
      isLoading.value = false;
    }
  }

  return { isLoading, products, errorMessage, pickFolderAndBuild };
}