export default defineNitroPlugin(async (nitroApp) => {
  if (process.env.NODE_ENV === "test" || import.meta.prerender) {
    return;
  }

  const { runSqlBackup } = await import("../core/execute/backupsql");
  const { Cron } = await import("croner");

  // 0 2 * * *' -> Chạy vào lúc 02:00 sáng mỗi ngày
  const job = new Cron("0 2 * * *", { timezone: "Asia/Ho_Chi_Minh" }, () => {
    runSqlBackup();
  });

  job.trigger();
});
