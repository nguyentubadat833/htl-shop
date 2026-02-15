import * as Minio from "minio";

const s3Env = useRuntimeConfig().s3;

const client = new Minio.Client({
  endPoint: s3Env.host,
  port: s3Env.port ? parseInt(s3Env.port) : undefined,
  useSSL: Boolean(s3Env.useSSL) ?? undefined,
  accessKey: s3Env.accessKey,
  secretKey: s3Env.secretKey,
});

export class S3 {
  static CLIENT = client
  static BUCKET_UPLOAD_DEFAULT = s3Env.bucketDefault;
  constructor() {}
}
