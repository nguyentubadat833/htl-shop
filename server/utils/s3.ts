import * as Minio from "minio";

export const s3Client = new Minio.Client({
  endPoint: 'S3_HOST',
  // port: 'S3_PORT',
  // useSSL: 'S3_ON_SSL',
  accessKey: 'S3_ACCESS_KEY',
  secretKey: 'S3_SECRET_KEY',
});

export const BUCKET_UPLOAD_DEFAULT = 'default'

