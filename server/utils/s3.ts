import * as Minio from "minio";

export class S3 {
  static CLIENT: Minio.Client;
  static BUCKET_UPLOAD_DEFAULT: string
  constructor() {}
}
