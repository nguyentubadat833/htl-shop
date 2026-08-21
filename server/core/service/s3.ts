import * as Minio from "minio";

const s3Env = useRuntimeConfig().s3;

const client = new Minio.Client({
  endPoint: s3Env.host,
  port: s3Env.port ? parseInt(s3Env.port) : undefined,
  useSSL: Boolean(s3Env.useSSL) ?? undefined,
  accessKey: s3Env.accessKey,
  secretKey: s3Env.secretKey,
});

// let _client: Minio.Client | null = null;
// function getMinioClient() {
//   if (!_client) {
//     _client = new Minio.Client({
//       endPoint: process.env.MINIO_ENDPOINT!,
//       port: Number(process.env.MINIO_PORT),
//       useSSL: process.env.MINIO_USE_SSL === "true",
//       accessKey: process.env.MINIO_ACCESS_KEY,
//       secretKey: process.env.MINIO_SECRET_KEY,
//     });
//   }
//   return _client;
// }

export class S3 {
  static CLIENT = client
  // static CLIENT = getMinioClient();

  static BUCKET_UPLOAD_DEFAULT = s3Env.bucketDefault;
  constructor() {}
}
