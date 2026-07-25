import { S3 } from "../core/service/s3";

export default defineNitroPlugin(async (nitroApp) => {
  const runtimeConfig = useRuntimeConfig();
  console.info("===== RUNTIME CONFIG =====");
  // console.info("Checking for runtime config: ", runtimeConfig);
  console.info(`ℹ️  NODE PRODUCTION =`, runtimeConfig.nodeProduction);
  console.info(`ℹ️  GOOGLE CLIENT ID =`, runtimeConfig.google.clientId);
  console.info(`ℹ️  GOOGLE CLIENT SECRET =`, runtimeConfig.google.clientSecret);
  console.info(`ℹ️  S3 HOST =`, runtimeConfig.s3.host);
  console.info(`ℹ️  S3 PORT =`, runtimeConfig.s3.port);
  console.info(`ℹ️  S3 ACCESS KEY =`, runtimeConfig.s3.accessKey);
  console.info(`ℹ️  S3 SECRET KEY =`, runtimeConfig.s3.secretKey);
  console.info(`ℹ️  S3 USE SSL =`, runtimeConfig.s3.useSSL);
  console.info(`ℹ️  S3 BUCKET DEFAULT =`, runtimeConfig.s3.bucketDefault);
  console.info(`ℹ️  MAIL HOST =`, runtimeConfig.mail.host);
  console.info(`ℹ️  MAIL PORT =`, runtimeConfig.mail.port);
  console.info(`ℹ️  MAIL SECURE =`, runtimeConfig.mail.secure);
  console.info(`ℹ️  MAIL USER =`, runtimeConfig.mail.auth.user);
  console.info(`ℹ️  MAIL PASS =`, runtimeConfig.mail.auth.pass);
  console.info(`ℹ️  SEPAY ID =`, runtimeConfig.sepay.id);
  console.info(`ℹ️  SEPAY KEY =`, runtimeConfig.sepay.key);
  console.info(`ℹ️  SEPAY ENV =`, runtimeConfig.sepay.env);

  // if (!(await S3.CLIENT.bucketExists(runtimeConfig.s3.bucketDefault))) {
  //   await S3.CLIENT.makeBucket(runtimeConfig.s3.bucketDefault);
  // }

  console.info(`✅ ${runtimeConfig.s3.bucketDefault} bucket created`);
});
