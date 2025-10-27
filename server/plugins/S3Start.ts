import * as Minio from "minio";
import { S3 } from "../utils/s3";

export default defineNitroPlugin(async (nitroApp) => {
  const s3Env = useRuntimeConfig().s3;

  S3.CLIENT = new Minio.Client({
    endPoint: s3Env.host,
    port: s3Env.port ? parseInt(s3Env.port) : undefined,
    useSSL: s3Env.useSSL,
    accessKey: s3Env.accessKey,
    secretKey: s3Env.secretKey,
  });

  S3.BUCKET_UPLOAD_DEFAULT = s3Env.bucketDefault

  if (!await S3.CLIENT.bucketExists(S3.BUCKET_UPLOAD_DEFAULT)){
    await S3.CLIENT.makeBucket(S3.BUCKET_UPLOAD_DEFAULT);
  }

  const buckets =  await S3.CLIENT.listBuckets();
  console.log("S3 Buckets:", buckets);
});
