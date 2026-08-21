import path from "path";
import fs from "fs";
import os from "os";
import { S3 } from "../service/s3";

export async function uploadTodayLogToS3() {
  const today = new Date().toISOString().split("T")[0];
  const fileName = `app-${today}.log`;

  const tmpDir = os.tmpdir();
  const filePath = path.join(tmpDir, 'logs', fileName);

  if (!fs.existsSync(filePath)) return;

  try {

    await S3.CLIENT.fPutObject(S3.BUCKET_UPLOAD_DEFAULT, `logs/${fileName}`, filePath);
    console.log(`[S3 Upload] Log file uploaded successfully for ${today}`);
  } catch (err) {
    console.error("[S3 Upload] Failed to upload log file:", err);
  } finally {
    fs.unlinkSync(filePath);
  }
}
