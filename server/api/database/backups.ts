import { S3 } from "~~/server/core/service/s3";

export default defineWrappedRequiredAdminHandler(async (event) => {
  const prefix = "backups/database/";
  const objectsStream = S3.CLIENT.listObjectsV2(S3.BUCKET_UPLOAD_DEFAULT, prefix, true);
  const files: BackupFileItem[] = [];

  for await (const obj of objectsStream) {
    if (obj.name && !obj.name.endsWith("/")) {
      files.push({
        name: obj.name.replace(prefix, ""),
        size: obj.size,
        lastModified: obj.lastModified,
      });
    }
  }

  return files.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
});
