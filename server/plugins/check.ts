import { S3 } from "../core/service/s3";

export default defineNitroPlugin((nitroApp) => {
  const runtimeConfig = useRuntimeConfig()
  console.info("Checking for runtime config: ", runtimeConfig);

  // S3.CLIENT.listBuckets()
  // .then(lists => {
  //   console.log('List buckets: ', lists)
  // })
})
