import * as Minio from "minio";
import { S3 } from "../core/service/s3";

export interface S3EventRecord {
  eventVersion: string;
  eventSource: string;
  awsRegion: string;
  eventTime: string;
  eventName: string;
  userIdentity: {
    principalId: string;
  };
  requestParameters: {
    sourceIPAddress: string;
  };
  responseElements: Record<string, unknown>;
  s3: {
    s3SchemaVersion: string;
    configurationId: string;
    bucket: {
      name: string;
      ownerIdentity: {
        principalId: string;
      };
      arn: string;
    };
    object: {
      key: string;
      size?: number;
      sequencer: string;
    };
  };
}

export default defineNitroPlugin(async (nitroApp) => {
  
  const s3Env = useRuntimeConfig().s3;

  S3.CLIENT = new Minio.Client({
    endPoint: s3Env.host,
    port: s3Env.port ? parseInt(s3Env.port) : undefined,
    useSSL: s3Env.useSSL === "true",
    accessKey: s3Env.accessKey,
    secretKey: s3Env.secretKey,
  });

  S3.BUCKET_UPLOAD_DEFAULT = s3Env.bucketDefault;

  if (!(await S3.CLIENT.bucketExists(S3.BUCKET_UPLOAD_DEFAULT))) {
    await S3.CLIENT.makeBucket(S3.BUCKET_UPLOAD_DEFAULT);
  }

  const buckets = await S3.CLIENT.listBuckets();
  console.log("S3 Buckets:", buckets);

  const listener = S3.CLIENT.listenBucketNotification(S3.BUCKET_UPLOAD_DEFAULT, "", "", ["s3:ObjectCreated:*", "s3:ObjectRemoved:*"]);

  listener.on("notification", (record) => {
    const s3Record = record as S3EventRecord;

    if (s3Record.eventName.startsWith("s3:ObjectCreated:")) {
      console.log("S3::Client::Notification::ObjectCreated >> Uploaded: ", s3Record.s3.object.key);
      void prisma.objectStorage.update({
        where: {
          bucket_objectName: {
            bucket: S3.BUCKET_UPLOAD_DEFAULT,
            objectName: s3Record.s3.object.key,
          },
        },
        data: {
          uploadedAt: new Date(),
        },
      });
    } else if (s3Record.eventName.startsWith("s3:ObjectRemoved:")) {
      console.log("S3::Client::Notification::ObjectRemoved >> Removed: ", s3Record.s3.object.key);
    }
  });
});
