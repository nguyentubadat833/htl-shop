import { Cron } from "croner";
import { runSqlBackup } from "../core/execute/backupsql";

export default defineNitroPlugin(async (nitroApp) => {
  if (process.env.NODE_ENV === "test" || import.meta.prerender) {
    return;
  }

  const runtimeConfig = useRuntimeConfig();
  const dbConfig = runtimeConfig.db;

  // 0 2 * * *' -> Chạy vào lúc 02:00 sáng mỗi ngày
  const job = new Cron("0 2 * * *", { timezone: "Asia/Ho_Chi_Minh" }, () => {
    runSqlBackup({
      dbHost: dbConfig.host,
      dbPort: Number(dbConfig.port),
      dbName: dbConfig.name,
      dbUser: dbConfig.user,
      dbPass: dbConfig.pass,
    });
  });

  job.trigger();
});
