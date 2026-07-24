import { S3 } from "../core/service/s3";

export default defineNitroPlugin(async (nitroApp) => {
  const runtimeConfig = useRuntimeConfig()
  console.info("Checking for runtime config: ", runtimeConfig);

  if (!await S3.CLIENT.bucketExists(runtimeConfig.s3.bucketDefault)) {
    await S3.CLIENT.makeBucket(runtimeConfig.s3.bucketDefault)
  }
  
  S3.CLIENT.listBuckets()
    .then(lists => {
      console.log('List buckets: ', lists)
    })
})
