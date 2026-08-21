import path from "node:path";
import fs from "node:fs";
import os from "node:os";

export default defineWrappedRequiredAdminHandler(async (event) => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const fileName = `app-${today}.log`;

  const tmpDir = os.tmpdir();
  const filePath = path.join(tmpDir, "logs", fileName);

  if (!fs.existsSync(filePath)) {
    return {
      success: true,
      date: today,
      totalLines: 0,
      lines: [],
    };
  }

  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    
    const lines = fileContent
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return {
      success: true,
      date: today,
      totalLines: lines.length,
      lines,
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Không thể đọc file log: ${error.message}`,
    });
  }
});