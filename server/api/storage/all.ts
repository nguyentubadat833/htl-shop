import { BucketItem } from "minio";
import { S3 } from "~~/server/core/service/s3";

export default defineWrappedRequiredAdminHandler(async (event) => {
  const userAuthContext = new UserAuthContext(event)

  return await new Promise((res, rej) => {
    const data: BucketItem[] = []
    const stream = S3.CLIENT.listObjectsV2(S3.BUCKET_UPLOAD_DEFAULT)

    stream.on('data', function (obj) {
      data.push(obj)
    })
    stream.on('error', function (err) {
      console.log(err)
      rej(err)
    })
    stream.on('end', () => {
      res(data)
    })
  })
});
