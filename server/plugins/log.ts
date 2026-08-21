export default defineNitroPlugin(async (nitroApp) => {
  if (process.env.NODE_ENV === "test" || import.meta.prerender) {
    return;
  }

  const { Cron } = await import("croner");
  const { uploadTodayLogToS3 } = await import("../core/execute/logger");

  const job = new Cron("59 23 * * *", { timezone: "Asia/Ho_Chi_Minh" }, async () => {
    await uploadTodayLogToS3();
  });
  //   const job = new Cron("*/10 * * * * *", { timezone: "Asia/Ho_Chi_Minh" }, async () => {
  //     console.log("[Test Cron] Đang chạy upload log...");
  //     await uploadTodayLogToS3();
  //   });

  job.trigger();
});
